// Reserve all applicable counters in one SQLite statement before calling a provider.
const encoder=new TextEncoder(),DAY=86400000,COOKIE='__Host-wolfgang_preview';
const hex=bytes=>Array.from(new Uint8Array(bytes),v=>v.toString(16).padStart(2,'0')).join('');
function limit(value,fallback,max){
 const n=value===undefined||value===''?fallback:Number(value);
 return Number.isSafeInteger(n)&&n>=0&&n<=max?n:null;
}
async function digest(env,value){
 const key=await crypto.subtle.importKey('raw',encoder.encode(env.CONTACT_GATEWAY_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return hex(await crypto.subtle.sign('HMAC',key,encoder.encode(value)));
}
// Domain-separated HMAC. Half identifies a scope, half encrypts the tab's local copy.
// Neither part is accepted as proof of identity by the account or chat endpoints.
export async function chatTabScope(request,env,identity){
 if(!identity.ownerId||!env.CONTACT_GATEWAY_SECRET)return null;
 const session=(request.headers.get('cookie')||'').match(/(?:^|;\s*)__Host-wolfgang_session=([a-f0-9]{64})(?:;|$)/)?.[1];
 return digest(env,JSON.stringify(['chat-tab-v1',identity.ownerId,session||'legacy']));
}
async function visitorId(request,env){
 const value=(request.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(COOKIE+'='))?.slice(COOKIE.length+1);
 if(!value||!(/^[a-f0-9-]{36}\.[a-f0-9]{64}$/).test(value))return null;
 const [id,signature]=value.split('.');
 return signature===await digest(env,'preview-cookie:'+id)?id:null;
}
export async function previewCookie(request,env){
 if(!env.CONTACT_GATEWAY_SECRET||await visitorId(request,env))return null;
 const id=crypto.randomUUID(),proof=await digest(env,'preview-cookie:'+id);
 return COOKIE+'='+id+'.'+proof+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=34560000';
}
const VOICE_TTL=5*60*1000;
async function voiceSubject(request,env,identity){
 if(typeof env.CONTACT_GATEWAY_SECRET!=='string'||env.CONTACT_GATEWAY_SECRET.length<32)return null;
 return identity.legacy&&identity.ownerId?'legacy:'+identity.ownerId:await visitorId(request,env);
}
const voiceMessage=(subject,expires,text)=>JSON.stringify(['homepage-voice-v1',subject,expires,text]);
export async function signVoiceReply(request,env,identity,text,now=Date.now()){
 const subject=await voiceSubject(request,env,identity);if(!subject)return null;
 const expires=now+VOICE_TTL;
 return expires+'.'+await digest(env,voiceMessage(subject,expires,text));
}
export async function verifyVoiceReply(request,env,identity,text,proof,now=Date.now()){
 if(typeof proof!=='string'||!/^\d{13}\.[a-f0-9]{64}$/.test(proof))return false;
 const [expiry,signature]=proof.split('.'),expires=Number(expiry);
 if(expires<=now||expires>now+VOICE_TTL)return false;
 const subject=await voiceSubject(request,env,identity);if(!subject)return false;
 const key=await crypto.subtle.importKey('raw',encoder.encode(env.CONTACT_GATEWAY_SECRET),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 return crypto.subtle.verify('HMAC',key,Uint8Array.from(signature.match(/../g),byte=>parseInt(byte,16)),encoder.encode(voiceMessage(subject,expires,text)));
}
export async function reservePublicUsage(request,env,now=Date.now(),owner=null,{guided=false}={}){
 const daily=limit(env.WOLFGANG_PUBLIC_DAILY_LIMIT,50,100000),ipLimit=limit(env.WOLFGANG_VISITOR_DAILY_LIMIT,3,10000);
 if(!env.DB||typeof env.CONTACT_GATEWAY_SECRET!=='string'||env.CONTACT_GATEWAY_SECRET.length<32||daily===null||ipLimit===null)return {allowed:false,unavailable:true};
 if(!daily||!ipLimit)return {allowed:false};
 try{
  const day=Math.floor(now/DAY),expiry=(day+2)*DAY,voice=new URL(request.url).pathname.endsWith('/voice');
  const id=owner?null:await visitorId(request,env);
  if(!owner&&!id)return {allowed:false,needsCookie:true};
  const ip=request.headers.get('cf-connecting-ip')||'unknown';
  const ipHash=await digest(env,'public-visitor:'+day+':'+ip);
  const turns=owner?6:8;
  const networkCap=owner?Math.max(6,ipLimit):ipLimit+5;
  const subject=owner?'account:'+day+':'+await digest(env,'account:'+owner):'browser:'+id;
  const subjectKey=(voice?'voice:':'attempt:')+subject;
  const ipKey=owner?'account-net:'+day+':'+ipHash:voice?'voice-net:'+day+':'+ipHash:'public-visitor:'+day+':'+ipHash;
  const globalKey='public-all:'+day;
  const counters=[[subjectKey,turns,owner?expiry:now+400*DAY],[ipKey,networkCap,expiry],[globalKey,daily,expiry]];
  if(guided)counters.push(['tour:'+subject,3,owner?expiry:now+400*DAY]);
  const rows=(await env.DB.prepare(`WITH wanted(k,cap,until) AS (VALUES${counters.map(()=>'(?,?,?)').join(',')})
   INSERT INTO guardian_rate_limits(bucket_key,owner_id,count,expires_at)
   SELECT k,'public-conversation',1,until FROM wanted WHERE NOT EXISTS
   (SELECT 1 FROM wanted w JOIN guardian_rate_limits r ON r.bucket_key=w.k WHERE r.count>=w.cap)
   ON CONFLICT(bucket_key) DO UPDATE SET count=count+1,expires_at=excluded.expires_at RETURNING bucket_key,count`)
   .bind(...counters.flat()).all()).results;
  if(!rows.length){
   const counts=await env.DB.prepare('SELECT bucket_key,count FROM guardian_rate_limits WHERE bucket_key IN (?,?)').bind(subjectKey,ipKey).all();
   const exhausted=counts.results.some(r=>r.count>=(r.bucket_key===subjectKey?turns:networkCap));
   return !owner&&exhausted?{allowed:false,signup:true}:{allowed:false};
  }
  return {allowed:true};
 }catch{return {allowed:false,unavailable:true};}
}

// Only delivered anonymous small talk uses a preview allowance. A browser
// cookie never grants access to a case, regardless of its history or age.
export async function previewState(request,env,identity,now=Date.now()){
 if(identity.ownerId||!env.DB||typeof env.CONTACT_GATEWAY_SECRET!=='string'||env.CONTACT_GATEWAY_SECRET.length<32)return null;
 const id=await visitorId(request,env);
 if(!id)return null;
 const key='preview-reply:'+id+':social';
 const row=await env.DB.prepare('SELECT count FROM guardian_rate_limits WHERE bucket_key=?').bind(key).first();
 return {key,signedIn:false,social:row?.count||0,expiry:now+400*DAY};
}
export async function deliverPreview(db,state,kind){
 if(!state||!['social','ongoing'].includes(kind))return {allowed:false};
 const cap=2;
 const row=await db.prepare("INSERT INTO guardian_rate_limits(bucket_key,owner_id,count,expires_at) VALUES (?,'public-conversation',1,?) ON CONFLICT(bucket_key) DO UPDATE SET count=count+1 WHERE count<? RETURNING count").bind(state.key,state.expiry,cap).first();
 return row?{allowed:true,remaining:cap-row.count}:{allowed:false};
}

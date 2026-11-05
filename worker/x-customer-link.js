import {handleContactRequest} from './contact-ingress.js';
import {encryptConnectionValue,decryptConnectionValue,xCodeSendingAvailable} from './connections.js';
import {getXConnection,xConnectionSettings} from './x-connection.js';
import {getXWebhookStatus} from './x-webhook-setup.js';
import {requestProviderBytes} from './provider-http.js';

// A customer's one-time user-context grant is separate from Wolfgang's service
// grant. Its token is used only in memory to send this owner's fixed link code.
const START='/api/connections/x/send-code',CALLBACK='/api/messaging/x/callback';
const PROVIDER='x-code',MARKER='x-code-send',SCOPES='dm.read dm.write users.read tweet.read';
const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true});
const headers={'Cache-Control':'no-store','Referrer-Policy':'no-referrer','X-Content-Type-Options':'nosniff'};
const json=(value,status=200)=>Response.json(value,{status,headers});
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))),b=>b.toString(16).padStart(2,'0')).join('');
const base64=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const random=()=>base64(crypto.getRandomValues(new Uint8Array(32)));
const numeric=value=>typeof value==='string'&&/^\d{1,30}$/.test(value);
const validCode=value=>typeof value==='string'&&/^WG-[A-F0-9]{32}$/.test(value);
const token=value=>typeof value==='string'&&value.length>0&&value.length<=32000&&!/[\s\0]/.test(value);
const fail=status=>Object.assign(new Error('X account linking could not complete.'),{status:status||503});
const back=(origin,result)=>new Response(null,{status:303,headers:{...headers,Location:origin+'/connections?x_code='+result+'#contact'}});
export const isXCustomerCallback=request=>{const u=new URL(request.url);return u.pathname===CALLBACK&&(u.searchParams.get('state')||'').startsWith('cx.');};
async function providerJson(url,init,fetcher){return JSON.parse(decoder.decode(await requestProviderBytes(url,init,{fetcher,timeoutMs:12000,maxBytes:32000,contentType:'application/json'})));}
async function confirmCustomerLink(env,ownerId,senderId,pending,eventId,origin,now){
 const event={channel:'x',eventId,senderId,senderVerified:true,linkCode:pending.code};
 const raw=JSON.stringify(event),timestamp=String(Math.floor(now/1000));
 const key=await crypto.subtle.importKey('raw',encoder.encode(env.CONTACT_GATEWAY_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signed=new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(timestamp+'.'+raw)));
 const signature=Array.from(signed,b=>b.toString(16).padStart(2,'0')).join('');
 // X's authenticated /users/me subject proves control of this personal account.
 // Reuse the one-time code/Stop path; no second provider delivery is required.
 const response=await handleContactRequest(new Request(origin+'/api/contact-events',{method:'POST',headers:{'Content-Type':'application/json','X-Wolfgang-Timestamp':timestamp,'X-Wolfgang-Signature':'sha256='+signature},body:raw}),env,{}, {now,xLinkGuard:{ownerId,accountId:pending.accountId,generation:pending.generation}});
 if(!response.ok||(await response.json()).status!=='linked')throw fail();
 await env.DB.prepare("UPDATE guardian_message_jobs SET owner_id=?,attempts=CASE WHEN state='waiting_link' THEN 0 ELSE attempts END,last_error=CASE WHEN state='waiting_link' THEN NULL ELSE last_error END,provider_message_id=CASE WHEN state='waiting_link' THEN NULL ELSE provider_message_id END,delivery_generation=delivery_generation+CASE WHEN state='waiting_link' THEN 1 ELSE 0 END,state='queued',after_send_state='completed',reply_text=NULL,next_attempt_at=0 WHERE channel='x' AND sender_id=? AND state IN ('queued','waiting_link') AND expires_at>? AND (owner_id IS NULL OR owner_id=?) AND EXISTS (SELECT 1 FROM guardian_channel_identities WHERE channel='x' AND sender_id=? AND owner_id=?)").bind(ownerId,senderId,now,ownerId,senderId,ownerId).run();
}
async function ownCode(env,ownerId,code,now){return env.DB.prepare("SELECT expires_at,created_at FROM guardian_contact_links WHERE owner_id=? AND channel='x' AND code_hash=? AND expires_at>?").bind(ownerId,await hash(code),now).first();}

export async function handleXCustomerLinkRequest(request,env={},identity={},options={}){
 const u=new URL(request.url),callback=isXCustomerCallback(request),now=options.now??Date.now(),fetcher=options.fetcher||fetch;
 if(u.pathname!==START&&!callback)return null;
 if(!identity.ownerId)return callback?back(u.origin,'expired'):json({message:'Sign in before sending your linking code.'},401);
 const ownerId=identity.ownerId;
 let marker,sendAccepted=false,stage='prepare';
 try{
  const settings=xConnectionSettings(env);
  if(!settings.configured||new URL(settings.redirectUri).origin!==u.origin||!await xCodeSendingAvailable(env,ownerId,now)||!(await getXWebhookStatus(env,{now})).webhookReady)throw fail();
  const service=await getXConnection(env,{now});
  const snapshot=await env.DB.prepare("SELECT account_id,generation FROM guardian_x_service_account WHERE id='wolfgang' AND status='connected'").first();
  if(!numeric(service.accountId)||snapshot?.account_id!==service.accountId)throw fail();
  if(!callback){
   if(request.method!=='POST')return json({message:'Method not allowed.'},405);
   if(request.headers.get('origin')!==u.origin||u.search)return json({message:'Send the code from your Guardian connections page.'},403);
   if(!request.headers.get('content-type')?.startsWith('application/json'))return json({message:'JSON is required.'},415);
   if(Number(request.headers.get('content-length')||0)>256)throw fail(400);
   const reader=request.body?.getReader();if(!reader)throw fail(400);
   const chunks=[];let size=0;try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>256){void reader.cancel().catch(()=>{});throw fail(400);}chunks.push(part.value);}}finally{reader.releaseLock();}
   const bytes=new Uint8Array(size);let offset=0;for(const part of chunks){bytes.set(part,offset);offset+=part.byteLength;}
   let body;try{body=JSON.parse(decoder.decode(bytes));}catch{throw fail(400);}if(!body||Array.isArray(body)||Object.keys(body).length!==1||!validCode(body.code))throw fail(400);
   const existing=await env.DB.prepare("SELECT 1 AS linked FROM guardian_channel_identities WHERE channel='x' AND owner_id=? LIMIT 1").bind(ownerId).first();
   if(existing)return json({linked:true});
   const code=await ownCode(env,ownerId,body.code,now);if(!code)return json({message:'This linking code has expired. Get a new code and try again.'},409);
   const minute=Math.floor(now/60000);
   const budget=await env.DB.prepare('INSERT INTO guardian_rate_limits(bucket_key,owner_id,count,expires_at) VALUES (?,?,1,?) ON CONFLICT(bucket_key) DO UPDATE SET count=count+1 WHERE count<6 RETURNING count').bind('x-code:'+ownerId+':'+minute,ownerId,(minute+2)*60000).first();
   if(!budget)return json({message:'Please wait a minute before trying again.'},429);
   const state='cx.'+random(),verifier=random(),challenge=base64(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(verifier))));
   const encrypted=await encryptConnectionValue({verifier,code:body.code,accountId:service.accountId,generation:snapshot.generation},env,ownerId,PROVIDER);
   await env.DB.batch([
    env.DB.prepare('DELETE FROM guardian_oauth_states WHERE owner_id=? AND provider=?').bind(ownerId,PROVIDER),
    env.DB.prepare('INSERT INTO guardian_oauth_states(state_hash,owner_id,provider,expires_at,pkce_verifier,created_at) VALUES (?,?,?,?,?,?)').bind(await hash(state),ownerId,PROVIDER,Math.min(code.expires_at,now+600000),encrypted,now)
   ]);
   const target=new URL('https://x.com/i/oauth2/authorize');
   for(const [key,value] of Object.entries({response_type:'code',client_id:env.X_CLIENT_ID,redirect_uri:settings.redirectUri,scope:SCOPES,state,code_challenge:challenge,code_challenge_method:'S256'}))target.searchParams.set(key,value);
   return json({authorizeUrl:target.href});
  }
  if(request.method!=='GET'||u.searchParams.get('guardian_return')!=='1'||['state','code','error','guardian_return'].some(k=>u.searchParams.getAll(k).length>1))return back(u.origin,'expired');
  const state=u.searchParams.get('state')||'';if(!/^cx\.[A-Za-z0-9_-]{43}$/.test(state)||u.searchParams.has('code')&&u.searchParams.has('error'))return back(u.origin,'expired');
  const saved=await env.DB.prepare('DELETE FROM guardian_oauth_states WHERE state_hash=? AND owner_id=? AND provider=? AND expires_at>? RETURNING pkce_verifier').bind(await hash(state),ownerId,PROVIDER,now).first();
  if(!saved)return back(u.origin,'expired');
  if(u.searchParams.has('error'))return back(u.origin,'denied');
  const code=u.searchParams.get('code');if(typeof code!=='string'||!code||code.length>4096||/[\x00-\x20\x7f]/.test(code))return back(u.origin,'expired');
  const pending=await decryptConnectionValue(saved.pkce_verifier,env,ownerId,PROVIDER);
  const activeCode=await ownCode(env,ownerId,pending.code,now);pending.createdAt=activeCode?.created_at;
  if(!validCode(pending.code)||!/^[A-Za-z0-9_-]{43}$/.test(pending.verifier)||pending.accountId!==service.accountId||pending.generation!==snapshot.generation)throw fail();
  const assertCurrent=async(senderId=null)=>{
   const clock=options.now??Date.now();
   const current=await env.DB.prepare("SELECT account_id,generation FROM guardian_x_service_account WHERE id='wolfgang' AND status='connected' AND encrypted_token IS NOT NULL").first();
   const alreadyLinked=senderId?await env.DB.prepare("SELECT owner_id FROM guardian_channel_identities WHERE channel='x' AND sender_id=?").bind(senderId).first():null;
   if(current?.account_id!==pending.accountId||current?.generation!==pending.generation||!(alreadyLinked?.owner_id===ownerId||await ownCode(env,ownerId,pending.code,clock))||!await xCodeSendingAvailable(env,ownerId,clock))throw fail();
   if(senderId&&await env.DB.prepare("SELECT 1 AS stopped FROM guardian_x_sender_optouts WHERE sender_id=? AND stopped_at>=? UNION ALL SELECT 1 FROM guardian_channel_preferences WHERE owner_id=? AND channel='x' AND stopped_at>=? LIMIT 1").bind(senderId,pending.createdAt||0,ownerId,pending.createdAt||0).first())throw fail();
  };
  await assertCurrent();
  stage='token';
  const granted=await providerJson('https://api.x.com/2/oauth2/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Authorization:'Basic '+btoa(env.X_CLIENT_ID+':'+env.X_CLIENT_SECRET)},body:new URLSearchParams({grant_type:'authorization_code',code,redirect_uri:settings.redirectUri,code_verifier:pending.verifier})},fetcher);
  const scopes=typeof granted.scope==='string'?[...new Set(granted.scope.trim().split(/\s+/))]:SCOPES.split(' ');
  if(!token(granted.access_token)||String(granted.token_type).toLowerCase()!=='bearer'||scopes.length!==4||!SCOPES.split(' ').every(s=>scopes.includes(s)))throw fail();
  await assertCurrent();
  stage='profile';
  const profile=await providerJson('https://api.x.com/2/users/me',{headers:{Authorization:'Bearer '+granted.access_token}},fetcher);
  if(!numeric(profile.data?.id))throw fail();
  if(profile.data.id===pending.accountId)return back(u.origin,'wrong_account');
  const linked=await env.DB.prepare("SELECT owner_id FROM guardian_channel_identities WHERE channel='x' AND sender_id=?").bind(profile.data.id).first();
  if(linked)return back(u.origin,linked.owner_id===ownerId?'linked':'already_linked');
  await assertCurrent();
  marker=await hash('x-code-send\0'+await hash(pending.code));
  const claimed=await env.DB.prepare('INSERT INTO guardian_oauth_states(state_hash,owner_id,provider,expires_at,pkce_verifier,created_at) SELECT ?,?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM guardian_oauth_states WHERE state_hash=?) ON CONFLICT(state_hash) DO NOTHING').bind(marker,ownerId,MARKER,now+600000,'sending',now,marker).run();
  if(!claimed.meta?.changes){marker=null;return back(u.origin,'uncertain');}
  await assertCurrent();
  // At most one attempt per code. A lost response is uncertain and cannot be
  // retried by replaying a callback or starting another grant for the same code.
  stage='send';
  let status;const bytes=await requestProviderBytes('https://api.x.com/2/dm_conversations/with/'+pending.accountId+'/messages',{method:'POST',headers:{Authorization:'Bearer '+granted.access_token,'Content-Type':'application/json'},body:JSON.stringify({text:pending.code})},{fetcher:async(url,init)=>{const response=await fetcher(url,init);status=response.status;return response;},timeoutMs:12000,maxBytes:32000,contentType:'application/json'});
  const receipt=JSON.parse(decoder.decode(bytes));if(status!==201||!numeric(receipt.data?.dm_event_id)||typeof receipt.data?.dm_conversation_id!=='string'||receipt.data.dm_conversation_id.length>100)throw fail();
  sendAccepted=true;
  await env.DB.prepare('UPDATE guardian_oauth_states SET pkce_verifier=? WHERE state_hash=? AND owner_id=? AND provider=?').bind('sent',marker,ownerId,MARKER).run();
  stage='confirm';await assertCurrent(profile.data.id);
  await confirmCustomerLink(env,ownerId,profile.data.id,pending,'dm_'+receipt.data.dm_event_id,u.origin,options.now??Date.now());
  return back(u.origin,'linked');
 }catch(error){
  (options.logger||console).warn('guardian.x.customer_link_failed',{stage,deliveryAttempted:Boolean(marker),...(Number.isInteger(error.providerStatus)&&error.providerStatus>=200&&error.providerStatus<=599?{providerStatus:error.providerStatus}:{})});
  if(marker&&sendAccepted)return back(u.origin,'sent_pending');
  if(marker){try{await env.DB.prepare('UPDATE guardian_oauth_states SET pkce_verifier=? WHERE state_hash=? AND owner_id=? AND provider=?').bind('uncertain',marker,ownerId,MARKER).run();}catch{}return back(u.origin,'uncertain');}
  return callback?back(u.origin,'failed'):json({message:error.status===400?'This linking-code request is invalid.':'The linking message could not be prepared. Refresh your connections and try again.'},error.status===400?400:503);
 }
}

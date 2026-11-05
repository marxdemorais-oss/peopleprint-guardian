import {authorisedOperator} from './operator-auth.js';
import {requestProviderBytes} from './provider-http.js';
import {messageChannelEnabled} from './messaging-config.js';
import {publicAnalysisSettings} from './model-provider.js';

const SCOPES='dm.read dm.write users.read tweet.read offline.access';
const CALLBACK='/api/messaging/x/callback';
const CONNECTION='/api/internal/admin/x/connection',CONNECT='/api/internal/admin/x/connect';
const TOKEN_URL='https://api.x.com/2/oauth2/token',ME_URL='https://api.x.com/2/users/me';
const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true});
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const reply=(body,status=200)=>Response.json(body,{status,headers});
const fail=(code,status=503)=>Object.assign(new Error('The X account connection could not complete.'),{code,status});
const base64=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const unbase64=value=>Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const random=()=>base64(crypto.getRandomValues(new Uint8Array(32)));
const sha=async value=>base64(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))));
const time=options=>options.now??Date.now();

function keyBytes(env){try{const bytes=unbase64(env.CONNECTION_ENCRYPTION_KEY||'');return bytes.length===32?bytes:null;}catch{return null;}}
function origin(value){try{const u=new URL(value);return u.protocol==='https:'&&!u.username&&!u.password&&u.href===u.origin+'/'?u.origin:null;}catch{return null;}}
export function xConnectionSettings(env={}){
 const expectedHandle=String(env.WOLFGANG_X_HANDLE||'').replace(/^@/,'');
 const operatorOrigin=origin(env.X_OPERATOR_ORIGIN),redirectUri=String(env.X_REDIRECT_URI||''),operatorReturnUrl=String(env.X_OPERATOR_RETURN_URL||'');
 let validUrls=false;
 try{const c=new URL(redirectUri),r=new URL(operatorReturnUrl);validUrls=c.protocol==='https:'&&!c.username&&!c.password&&!c.search&&!c.hash&&c.pathname===CALLBACK&&r.origin===operatorOrigin&&!r.username&&!r.password&&!r.hash;}catch{}
 const credential=value=>typeof value==='string'&&/^[A-Za-z0-9_.-]{1,512}$/.test(value);
 const configured=Boolean(env.X_CONNECT_ENABLED==='true'&&env.DB&&keyBytes(env)&&credential(env.X_CLIENT_ID)&&credential(env.X_CLIENT_SECRET)&&operatorOrigin&&validUrls&&/^[A-Za-z0-9_]{1,15}$/.test(expectedHandle));
 return {configured,expectedHandle,redirectUri,operatorOrigin,operatorReturnUrl,scopes:SCOPES};
}
async function crypt(value,env,purpose,decrypt=false){
 const bytes=keyBytes(env);if(!bytes)throw fail('X_NOT_CONFIGURED');
 const key=await crypto.subtle.importKey('raw',bytes,{name:'AES-GCM'},false,[decrypt?'decrypt':'encrypt']);
 const additionalData=encoder.encode('wolfgang-owned-x-service\n'+env.X_CLIENT_ID+'\n'+purpose);
 if(decrypt){const [v,iv,cipher,...extra]=value.split('.');if(v!=='v1'||!iv||!cipher||extra.length)throw fail('X_RECONNECT_REQUIRED');return JSON.parse(decoder.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:unbase64(iv),additionalData},key,unbase64(cipher))));}
 const iv=crypto.getRandomValues(new Uint8Array(12)),cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData},key,encoder.encode(JSON.stringify(value)));
 return 'v1.'+base64(iv)+'.'+base64(new Uint8Array(cipher));
}
async function fetchJson(url,init,fetcher){
 let providerStatus;
 try{
  const bytes=await requestProviderBytes(url,init,{fetcher:async (target,options)=>{const response=await fetcher(target,options);providerStatus=response.status;return response;},timeoutMs:10000,maxBytes:64000,contentType:'application/json'});
  return JSON.parse(decoder.decode(bytes));
 }catch{throw Object.assign(fail('X_PROVIDER_UNAVAILABLE'),{providerStatus});}
}
const validToken=value=>typeof value==='string'&&value.length>0&&value.length<=32000&&!/[\s\0]/.test(value);
function approvedScope(value,fallback){
 const actual=value===undefined?fallback:value;
 if(typeof actual!=='string'||actual.length>512)throw fail('X_GRANT_REJECTED');
 const scopes=[...new Set(actual.trim().split(/\s+/))],expected=SCOPES.split(' ');
 if(scopes.length!==expected.length||expected.some(s=>!scopes.includes(s)))throw fail('X_GRANT_REJECTED');
 return SCOPES;
}
function tokenValue(data,now,previous){
 if(!validToken(data?.access_token)||typeof data.token_type!=='string'||data.token_type.toLowerCase()!=='bearer'||!Number.isFinite(data.expires_in)||data.expires_in<60||data.expires_in>86400)throw fail('X_GRANT_REJECTED');
 const refresh=data.refresh_token===undefined?previous?.refresh_token:data.refresh_token;
 if(!validToken(refresh))throw fail('X_GRANT_REJECTED');
 return {access_token:data.access_token,refresh_token:refresh,scope:approvedScope(data.scope,previous?.scope),expires_at:now+data.expires_in*1000};
}
function tokenRequest(env,body){return {method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Authorization:'Basic '+btoa(env.X_CLIENT_ID+':'+env.X_CLIENT_SECRET)},body:new URLSearchParams(body)};}
function callbackReturn(settings,status){const target=new URL(settings.operatorReturnUrl);target.searchParams.set('x_connection',status);return new Response(null,{status:303,headers:{...headers,Location:target.href}});}
async function currentGeneration(db,generation){return Boolean(await db.prepare("SELECT id FROM guardian_x_service_account WHERE id='wolfgang' AND generation=?").bind(generation).first());}

export async function getXConnection(env={},options={}){
 const settings=xConnectionSettings(env),now=time(options),base={configured:settings.configured,connected:false,status:settings.configured?'disconnected':'not_configured',accountId:null,handle:null,expectedHandle:settings.expectedHandle,connectedAt:null,updatedAt:null,accessExpiresAt:null,pendingAuthorization:false,unresolvedEncryptedEvents:0,unresolvedEncryptedEventsCapped:false};
 if(!env.DB)return base;
 const row=await env.DB.prepare("SELECT account_id,username,status,encrypted_token,connected_at,updated_at,access_expires_at FROM guardian_x_service_account WHERE id='wolfgang'").first();
 const pending=await env.DB.prepare('SELECT state_hash FROM guardian_x_oauth_states WHERE expires_at>? LIMIT 1').bind(now).first();
 const notices=await env.DB.prepare('SELECT COUNT(*) AS n FROM (SELECT event_id FROM guardian_x_event_notices WHERE created_at>? LIMIT 1000)').bind(now-30*86400000).first();
 return {...base,...(row?{status:settings.configured?row.status:'not_configured',accountId:row.account_id,handle:row.username,connectedAt:row.connected_at,updatedAt:row.updated_at,accessExpiresAt:row.access_expires_at,connected:Boolean(settings.configured&&row.status==='connected'&&row.encrypted_token&&row.username?.toLowerCase()===settings.expectedHandle.toLowerCase())}:{}),pendingAuthorization:Boolean(pending),unresolvedEncryptedEvents:Number(notices?.n||0),unresolvedEncryptedEventsCapped:Number(notices?.n||0)>=1000};
}

export async function getXAccessToken(env={},options={}){
 const settings=xConnectionSettings(env),now=time(options),fetcher=options.fetcher||fetch;
 if(!settings.configured)throw fail('X_NOT_CONFIGURED');
 const db=env.DB,row=await db.prepare("SELECT * FROM guardian_x_service_account WHERE id='wolfgang'").first();
 if(row?.status!=='connected'||!row.encrypted_token||row.username?.toLowerCase()!==settings.expectedHandle.toLowerCase())throw fail('X_NOT_CONNECTED');
 let token;
 try{token=await crypt(row.encrypted_token,env,'account:'+row.account_id,true);if(!validToken(token.access_token)||!validToken(token.refresh_token)||!Number.isFinite(token.expires_at))throw Error();approvedScope(token.scope);}
 catch{await db.prepare("UPDATE guardian_x_service_account SET status='reconnect_required',updated_at=? WHERE id='wolfgang' AND generation=? AND encrypted_token=?").bind(now,row.generation,row.encrypted_token).run();throw fail('X_RECONNECT_REQUIRED');}
 if(token.expires_at>now+60000){if(!await db.prepare("SELECT id FROM guardian_x_service_account WHERE id='wolfgang' AND generation=? AND encrypted_token=? AND status='connected'").bind(row.generation,row.encrypted_token).first())throw fail('X_CONNECTION_CHANGED');return token.access_token;}
 const lease=crypto.randomUUID(),claimed=await db.prepare("UPDATE guardian_x_service_account SET refresh_lease_token=?,refresh_lease_expires=? WHERE id='wolfgang' AND generation=? AND encrypted_token=? AND status='connected' AND (refresh_lease_token IS NULL OR refresh_lease_expires<=?) RETURNING generation").bind(lease,now+20000,row.generation,row.encrypted_token,now).first();
 if(!claimed)throw fail('X_TOKEN_REFRESHING');
 try{
  const data=await fetchJson(TOKEN_URL,tokenRequest(env,{grant_type:'refresh_token',refresh_token:token.refresh_token}),fetcher);
  const fresh=tokenValue(data,time(options),token),encrypted=await crypt(fresh,env,'account:'+row.account_id);
  const result=await db.prepare("UPDATE guardian_x_service_account SET encrypted_token=?,scope=?,access_expires_at=?,updated_at=? WHERE id='wolfgang' AND status='connected' AND generation=? AND encrypted_token=? AND refresh_lease_token=?").bind(encrypted,fresh.scope,fresh.expires_at,time(options),row.generation,row.encrypted_token,lease).run();
  if(!result.meta?.changes)throw fail('X_CONNECTION_CHANGED');return fresh.access_token;
 }catch(error){
  if(error.code==='X_GRANT_REJECTED'||[400,401,403].includes(error.providerStatus)){await db.prepare("UPDATE guardian_x_service_account SET status='reconnect_required',updated_at=? WHERE id='wolfgang' AND generation=? AND encrypted_token=? AND refresh_lease_token=?").bind(time(options),row.generation,row.encrypted_token,lease).run();throw fail('X_RECONNECT_REQUIRED');}
  throw error.code?error:fail('X_PROVIDER_UNAVAILABLE');
 }finally{await db.prepare("UPDATE guardian_x_service_account SET refresh_lease_token=NULL,refresh_lease_expires=0 WHERE id='wolfgang' AND refresh_lease_token=?").bind(lease).run();}
}

export async function handleXConnectionRequest(request,env={},options={}){
 const u=new URL(request.url),path=u.pathname,callback=path===CALLBACK;
 if(!callback&&![CONNECTION,CONNECT].includes(path))return null;
 if(!callback&&!await authorisedOperator(request,env))return reply({code:'NOT_AUTHORISED'},403);
 const settings=xConnectionSettings(env),now=time(options),fetcher=options.fetcher||fetch;
 try{
  if(path===CONNECTION&&request.method==='GET')return reply({...await getXConnection(env,options),messagingEnabled:messageChannelEnabled(env,'x'),analysisReady:publicAnalysisSettings(env).analysisReady,webhookManagementConfigured:Boolean(env.X_APP_BEARER_TOKEN),encryptedXChatSupported:false,transport:'legacy_dm'});
  if(path===CONNECTION&&request.method==='DELETE'){
   if(!env.DB)return reply({code:'X_NOT_CONFIGURED'},503);
   await env.DB.batch([
    env.DB.prepare('DELETE FROM guardian_x_oauth_states'),
    env.DB.prepare("UPDATE guardian_x_service_account SET status='disconnected',encrypted_token=NULL,scope=NULL,access_expires_at=NULL,generation=generation+1,refresh_lease_token=NULL,refresh_lease_expires=0,updated_at=? WHERE id='wolfgang'").bind(now),
    env.DB.prepare("UPDATE guardian_message_jobs SET state='cancelled',payload_json='{}',reply_text=NULL,updated_at=? WHERE channel='x' AND state IN ('queued','waiting_link','processing','reply_pending','sending')").bind(now)
   ]);
   return reply({disconnected:true,savedInformationRetained:true});
  }
  if((path===CONNECT&&request.method!=='POST')||(callback&&request.method!=='GET')||(path===CONNECTION&&!['GET','DELETE'].includes(request.method)))return reply({code:'METHOD_NOT_ALLOWED'},405);
  if(!settings.configured)return reply({code:'X_NOT_CONFIGURED'},503);
  if(path===CONNECT){
   const state=random(),stateHash=await sha(state),verifier=random();
   const encrypted=await crypt({verifier},env,'state:'+stateHash);
   await env.DB.batch([
    env.DB.prepare("INSERT INTO guardian_x_service_account(id,updated_at) VALUES ('wolfgang',?) ON CONFLICT(id) DO NOTHING").bind(now),
    env.DB.prepare("UPDATE guardian_x_service_account SET generation=generation+1,refresh_lease_token=NULL,refresh_lease_expires=0,updated_at=? WHERE id='wolfgang'").bind(now),
    env.DB.prepare('DELETE FROM guardian_x_oauth_states'),
    env.DB.prepare("INSERT INTO guardian_x_oauth_states(state_hash,operator_id,generation,encrypted_verifier,created_at,expires_at) SELECT ?,?,generation,?,?,? FROM guardian_x_service_account WHERE id='wolfgang'").bind(stateHash,request.headers.get('x-guardian-operator'),encrypted,now,now+600000)
   ]);
   const target=new URL('https://x.com/i/oauth2/authorize');
   for(const [key,value] of Object.entries({response_type:'code',client_id:env.X_CLIENT_ID,redirect_uri:settings.redirectUri,scope:SCOPES,state,code_challenge:await sha(verifier),code_challenge_method:'S256'}))target.searchParams.set(key,value);
   return reply({authorizeUrl:target.href,expiresAt:now+600000,expectedHandle:settings.expectedHandle});
  }
  if(u.origin!==new URL(settings.redirectUri).origin)return reply({code:'INVALID_CALLBACK'},400);
  const state=u.searchParams.get('state')||'';
  if(!/^[A-Za-z0-9_-]{43}$/.test(state)||['state','code','error'].some(key=>u.searchParams.getAll(key).length>1))return callbackReturn(settings,'expired');
  const stateHash=await sha(state),saved=await env.DB.prepare('DELETE FROM guardian_x_oauth_states WHERE state_hash=? AND expires_at>? RETURNING *').bind(stateHash,now).first();
  if(!saved)return callbackReturn(settings,'expired');
  if(!await currentGeneration(env.DB,saved.generation))return callbackReturn(settings,'cancelled');
  if(u.searchParams.has('error'))return callbackReturn(settings,'cancelled');
  const code=u.searchParams.get('code')||'';
  if(!code||code.length>2048||/[\s\0]/.test(code))return callbackReturn(settings,'failed');
  try{
   const {verifier}=await crypt(saved.encrypted_verifier,env,'state:'+stateHash,true);
   if(!/^[A-Za-z0-9_-]{43}$/.test(verifier))throw fail('X_GRANT_REJECTED');
   const data=await fetchJson(TOKEN_URL,tokenRequest(env,{grant_type:'authorization_code',code,redirect_uri:settings.redirectUri,code_verifier:verifier}),fetcher);
   const token=tokenValue(data,time(options));
   if(!await currentGeneration(env.DB,saved.generation))return callbackReturn(settings,'cancelled');
   const profile=await fetchJson(ME_URL,{headers:{Authorization:'Bearer '+token.access_token}},fetcher),user=profile?.data;
   if(typeof user?.id!=='string'||!/^\d{1,30}$/.test(user.id)||typeof user.username!=='string'||user.username.toLowerCase()!==settings.expectedHandle.toLowerCase())return callbackReturn(settings,'wrong_account');
   const encrypted=await crypt(token,env,'account:'+user.id);
   const result=await env.DB.prepare("UPDATE guardian_x_service_account SET account_id=?,username=?,status='connected',encrypted_token=?,scope=?,access_expires_at=?,connected_at=?,updated_at=?,refresh_lease_token=NULL,refresh_lease_expires=0 WHERE id='wolfgang' AND generation=? AND (account_id IS NULL OR account_id=?)").bind(user.id,user.username,encrypted,token.scope,token.expires_at,time(options),time(options),saved.generation,user.id).run();
   if(!result.meta?.changes){const current=await env.DB.prepare("SELECT generation,account_id FROM guardian_x_service_account WHERE id='wolfgang'").first();return callbackReturn(settings,current?.generation===saved.generation?'wrong_account':'cancelled');}
   return callbackReturn(settings,'connected');
  }catch{return callbackReturn(settings,'failed');}
 }catch(error){return reply({code:error.code||'X_CONNECTION_UNAVAILABLE'},error.status||503);}
}

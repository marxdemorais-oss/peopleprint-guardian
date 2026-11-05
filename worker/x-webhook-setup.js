import {authorisedOperator} from './operator-auth.js';
import {getXAccessToken,getXConnection} from './x-connection.js';
import {validPublicOrigin} from './messaging-config.js';
import {requestProviderBytes} from './provider-http.js';

const SETUP='/api/internal/admin/x/webhook',WEBHOOK_PATH='/api/messaging/x/webhook';
const API='https://api.x.com/2',TAG='wolfgang-direct-inbound';
const encoder=new TextEncoder(),decoder=new TextDecoder('utf-8',{fatal:true});
const numeric=value=>typeof value==='string'&&/^\d{1,19}$/.test(value);
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const time=options=>options.now??Date.now();
const fail=(code,status=503)=>Object.assign(new Error('The X receiving connection could not be completed.'),{code,status,xWebhookSetupFailure:true});
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});

// This temporary deployment credential can provision only the fixed, pinned X
// receiving route. It is deliberately not a general administration credential.
async function authorisedDeploymentSetup(request,env,now){
 if(request.method!=='POST'||new URL(request.url).pathname!==SETUP||request.headers.get('x-guardian-operator')!=='deployment-x-setup')return false;
 const expected=env.X_SETUP_TOKEN,supplied=request.headers.get('authorization')||'';
 if(typeof expected!=='string'||!/^[\x21-\x7e]{32,256}$/.test(expected)||supplied.length>263||!supplied.startsWith('Bearer '))return false;
 const timestamp=value=>typeof value==='string'&&/^\d{10,16}$/.test(value)&&Number.isSafeInteger(Number(value))?Number(value):NaN;
 const issued=timestamp(env.X_SETUP_ISSUED_AT),expires=timestamp(env.X_SETUP_EXPIRES_AT);
 if(!Number.isFinite(now)||!Number.isFinite(issued)||!Number.isFinite(expires)||issued>now||expires<=now||expires<=issued||expires-issued>3600000)return false;
 const hash=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
 const [left,right]=await Promise.all([hash(expected),hash(supplied.slice(7))]);
 let difference=0;for(let index=0;index<left.length;index++)difference|=left[index]^right[index];
 return difference===0;
}
function createdSubscription(value){
 const data=value.data;
 if(!object(data))throw fail('X_WEBHOOK_RESPONSE_INVALID',502);
 // X's exact endpoint schema uses data.subscription; its quickstart also
 // documents a direct data object. Accept either complete form, never a mix.
 if(Object.hasOwn(data,'subscription')){
  if(Object.keys(data).some(key=>key!=='subscription'))throw fail('X_WEBHOOK_RESPONSE_INVALID',502);
  return data.subscription;
 }
 return data;
}

function settings(env){
 const base=validPublicOrigin(env.MESSAGING_PUBLIC_ORIGIN);
 let callbackUrl=null;
 try{
  const u=new URL(base),host=u.hostname.toLowerCase();
  const publicName=!u.port&&host.includes('.')&&!/^[\d.]+$/.test(host)&&/^[a-z0-9.-]+$/.test(host)&&host.split('.').every(label=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(label))&&!/(^|\.)(localhost|local|internal)$/.test(host);
  if(publicName&&new URL(env.X_REDIRECT_URI).origin===u.origin)callbackUrl=base+WEBHOOK_PATH;
 }catch{}
 const bearer=env.X_APP_BEARER_TOKEN;
 const validBearer=typeof bearer==='string'&&bearer.length>0&&bearer.length<=32000&&/^[\x21-\x7e]+$/.test(bearer);
 return {configured:Boolean(callbackUrl&&validBearer&&env.X_RECEIVING_ENABLED==='true'),callbackUrl};
}
async function configurationHash(env,callbackUrl){
 const bytes=await crypto.subtle.digest('SHA-256',encoder.encode([env.X_CLIENT_ID,env.X_CLIENT_SECRET,env.X_APP_BEARER_TOKEN,callbackUrl].join('\n')));
 return Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');
}
function hasErrors(value){return value.errors!==undefined&&(!Array.isArray(value.errors)||value.errors.length>0);}
function continuation(value,depth=0){
 if(!object(value)||depth>4)return false;
 for(const [key,item] of Object.entries(value)){
  const present=item!==undefined&&item!==null&&item!==false&&item!=='';
  if(present&&/next|cursor|has_more|hasMore|incomplete|truncated|pagination_token|continuation/i.test(key))return true;
  if(present&&key==='pagination'&&(!object(item)||Object.keys(item).length>0))return true;
  if(object(item)&&continuation(item,depth+1))return true;
 }
 return false;
}
function listed(value){
 // Empty collections may omit data. Only an explicit zero count can prove
 // completeness; a missing/ambiguous list must never trigger creation.
 const rows=object(value)&&!Object.hasOwn(value,'data')&&value.meta?.result_count===0?[]:value?.data;
 if(!object(value)||!Array.isArray(rows)||hasErrors(value)||rows.length>=1000||continuation(value))throw fail('X_WEBHOOK_LIST_INCOMPLETE');
 for(const key of ['result_count','total_count','total']){
  const count=value.meta?.[key];if(count!==undefined&&(!Number.isInteger(count)||count!==rows.length))throw fail('X_WEBHOOK_LIST_INCOMPLETE');
 }
 return rows;
}
function listedWebhooks(value){
 const rows=listed(value);
 if(rows.some(row=>!object(row)||!numeric(row.id)||typeof row.url!=='string'||typeof row.valid!=='boolean'))throw fail('X_WEBHOOK_RESPONSE_INVALID',502);
 return rows;
}
function isExactFilter(filter,accountId){
 return object(filter)&&filter.user_id===accountId&&Object.keys(filter).every(key=>key==='user_id'||key==='qualifiers'&&object(filter.qualifiers)&&Object.keys(filter.qualifiers).length===0);
}
function validSubscription(row,accountId,webhookId,now){
 if(!object(row)||!numeric(row.subscription_id)||row.event_type!=='dm.received'||!isExactFilter(row.filter,accountId)||row.webhook_id!==webhookId||row.tag!==TAG)return false;
 return row.expires_at===undefined||row.expires_at===null||typeof row.expires_at==='string'&&Number.isFinite(Date.parse(row.expires_at))&&Date.parse(row.expires_at)>now;
}

export async function getXWebhookStatus(env={},options={}){
 const base={webhookReady:false,webhookId:null,subscriptionId:null,receivingEnabled:env.X_RECEIVING_ENABLED==='true',pendingMessages:0,pendingMessagesCapped:false};
 if(!env.DB)return base;
 const now=time(options),pending=await env.DB.prepare("SELECT COUNT(*) AS n FROM (SELECT id FROM guardian_message_jobs WHERE channel='x' AND state IN ('queued','waiting_link','processing','reply_pending','sending') AND expires_at>? LIMIT 1001)").bind(now).first();
 base.pendingMessages=Math.min(Number(pending?.n||0),1000);base.pendingMessagesCapped=Number(pending?.n||0)>1000;
 const configured=settings(env),connection=await getXConnection(env,{now});
 if(!configured.configured||!connection.connected||!numeric(connection.accountId))return base;
 const row=await env.DB.prepare("SELECT t.* FROM guardian_x_transport t JOIN guardian_x_service_account a ON a.id=t.id AND a.account_id=t.account_id AND a.generation=t.connection_generation WHERE t.id='wolfgang' AND a.status='connected' AND a.encrypted_token IS NOT NULL").first();
 if(!row||!numeric(row.webhook_id)||!numeric(row.subscription_id)||row.webhook_url!==configured.callbackUrl||!Number.isFinite(row.verified_at)||row.configuration_hash!==await configurationHash(env,configured.callbackUrl)||row.subscription_expires_at!==null&&row.subscription_expires_at<=now)return base;
 return {...base,webhookReady:true,webhookId:row.webhook_id,subscriptionId:row.subscription_id};
}

export async function handleXWebhookSetupRequest(request,env={},options={}){
 if(new URL(request.url).pathname!==SETUP)return null;
 const operator=await authorisedOperator(request,env),deployment=!operator&&await authorisedDeploymentSetup(request,env,time(options));
 if(!operator&&!deployment)return json({code:'NOT_AUTHORISED'},403);
 if(request.method!=='POST')return json({code:'METHOD_NOT_ALLOWED'},405);
 const configured=settings(env);
 if(!env.DB||!configured.configured)return json({code:'X_WEBHOOK_NOT_CONFIGURED'},503);
 const now=time(options),deadline=AbortSignal.any([request.signal,AbortSignal.timeout(55000)]),fetcher=options.fetcher||fetch;
 let lease,stage='account';
 try{
  const connection=await getXConnection(env,{now});
  if(!connection.connected||!numeric(connection.accountId))throw fail('X_NOT_CONNECTED');
  const snapshot=await env.DB.prepare("SELECT account_id,generation FROM guardian_x_service_account WHERE id='wolfgang' AND status='connected' AND encrypted_token IS NOT NULL").first();
  if(snapshot?.account_id!==connection.accountId)throw fail('X_CONNECTION_CHANGED',409);
  const fingerprint=await configurationHash(env,configured.callbackUrl);
  await env.DB.prepare("INSERT INTO guardian_x_transport(id,updated_at) VALUES ('wolfgang',?) ON CONFLICT(id) DO NOTHING").bind(now).run();
  const candidate=crypto.randomUUID(),claimed=await env.DB.prepare("UPDATE guardian_x_transport SET lease_token=?,lease_expires_at=?,verified_at=NULL,updated_at=? WHERE id='wolfgang' AND (lease_token IS NULL OR lease_expires_at<=?) RETURNING lease_token").bind(candidate,now+70000,now,now).first();
  if(claimed?.lease_token!==candidate)throw fail('X_WEBHOOK_SETUP_BUSY',409);
  lease=candidate;
  const assertCurrent=async()=>{
   deadline.throwIfAborted();
   if(deployment&&!await authorisedDeploymentSetup(request,env,time(options)))throw fail('X_SETUP_AUTH_EXPIRED',403);
   const active=await env.DB.prepare("SELECT a.id FROM guardian_x_service_account a JOIN guardian_x_transport t ON a.id=t.id WHERE a.id='wolfgang' AND a.account_id=? AND a.generation=? AND a.status='connected' AND a.encrypted_token IS NOT NULL AND t.lease_token=?").bind(snapshot.account_id,snapshot.generation,lease).first();
   const current=settings(env);
   if(!active||!current.configured||current.callbackUrl!==configured.callbackUrl||await configurationHash(env,current.callbackUrl)!==fingerprint)throw fail('X_CONNECTION_CHANGED',409);
  };
  const api=async(path,bearer,{method='GET',body}={})=>{
   await assertCurrent();
   try{
    const bytes=await requestProviderBytes(API+path,{method,headers:{Authorization:'Bearer '+bearer,...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})},{fetcher,signal:deadline,timeoutMs:12000,maxBytes:256000,contentType:'application/json'});
    await assertCurrent();
    const value=JSON.parse(decoder.decode(bytes));if(!object(value)||hasErrors(value))throw fail('X_WEBHOOK_RESPONSE_INVALID',502);return value;
   }catch(error){
    if(error.xWebhookSetupFailure)throw error;
    const diagnostics={401:['X_PROVIDER_AUTH_FAILED',502],403:['X_PROVIDER_PERMISSION_DENIED',502],402:['X_PROVIDER_CREDITS_REQUIRED',502],429:['X_PROVIDER_RATE_LIMIT',429]};
    const diagnostic=diagnostics[error.providerStatus];
    if(diagnostic)throw fail(...diagnostic);
    throw fail('X_WEBHOOK_PROVIDER_UNAVAILABLE');
   }
  };
  await assertCurrent();
  stage='account_token';
  const userToken=await getXAccessToken(env,{now,fetcher:async(target,init)=>fetcher(target,{...init,signal:AbortSignal.any([init.signal,deadline])})});
  await assertCurrent();
  stage='webhook_list';
  const webhooks=listedWebhooks(await api('/webhooks',env.X_APP_BEARER_TOKEN));
  const matches=webhooks.filter(row=>row.url===configured.callbackUrl);
  if(matches.length>1)throw fail('X_WEBHOOK_AMBIGUOUS',409);
  let webhook=matches[0];
  if(!webhook){
   stage='webhook_create';
   const created=await api('/webhooks',env.X_APP_BEARER_TOKEN,{method:'POST',body:{url:configured.callbackUrl}});webhook=created.data;
   if(!object(webhook)||!numeric(webhook.id)||webhook.url!==configured.callbackUrl||webhook.valid!==true)throw fail('X_WEBHOOK_RESPONSE_INVALID',502);
  }else if(!webhook.valid){
   stage='webhook_validate';
   await api('/webhooks/'+webhook.id,env.X_APP_BEARER_TOKEN,{method:'PUT'});
   const verified=listedWebhooks(await api('/webhooks',env.X_APP_BEARER_TOKEN)).filter(row=>row.url===configured.callbackUrl);
   if(verified.length!==1||verified[0].id!==webhook.id||verified[0].valid!==true)throw fail('X_WEBHOOK_NOT_VALID');webhook=verified[0];
  }
  // Listing supports app-only auth; user-context listing requires like.read,
  // which Wolfgang does not need. Creation below still uses his dm.read grant.
  stage='subscription_list';
  const subscriptions=listed(await api('/activity/subscriptions?user_id='+snapshot.account_id+'&max_results=1000',env.X_APP_BEARER_TOKEN));
  if(subscriptions.some(row=>!object(row)||!numeric(row.subscription_id)||typeof row.event_type!=='string'||!object(row.filter)||row.filter.user_id!==snapshot.account_id))throw fail('X_WEBHOOK_RESPONSE_INVALID',502);
  const relevant=subscriptions.filter(row=>row.event_type==='dm.received'&&row.filter.user_id===snapshot.account_id),exact=relevant.filter(row=>validSubscription(row,snapshot.account_id,webhook.id,time(options)));
  if(exact.length>1||relevant.length!==exact.length)throw fail('X_SUBSCRIPTION_CONFLICT',409);
  let subscription=exact[0];
  if(!subscription){
   stage='subscription_create';
   const created=await api('/activity/subscriptions',userToken,{method:'POST',body:{event_type:'dm.received',filter:{user_id:snapshot.account_id},webhook_id:webhook.id,tag:TAG}});subscription=createdSubscription(created);
   if(!validSubscription(subscription,snapshot.account_id,webhook.id,time(options)))throw fail('X_WEBHOOK_RESPONSE_INVALID',502);
  }
  await assertCurrent();
  stage='save';
  const expires=subscription.expires_at===undefined||subscription.expires_at===null?null:Date.parse(subscription.expires_at);
  const saved=await env.DB.prepare("UPDATE guardian_x_transport SET account_id=?,connection_generation=?,configuration_hash=?,webhook_url=?,webhook_id=?,subscription_id=?,subscription_expires_at=?,verified_at=?,updated_at=? WHERE id='wolfgang' AND lease_token=? AND EXISTS (SELECT 1 FROM guardian_x_service_account a WHERE a.id='wolfgang' AND a.account_id=? AND a.generation=? AND a.status='connected' AND a.encrypted_token IS NOT NULL)").bind(snapshot.account_id,snapshot.generation,fingerprint,configured.callbackUrl,webhook.id,subscription.subscription_id,expires,time(options),time(options),lease,snapshot.account_id,snapshot.generation).run();
  if(!saved.meta?.changes)throw fail('X_CONNECTION_CHANGED',409);
  return json({webhookReady:true,webhookId:webhook.id,subscriptionId:subscription.subscription_id,transport:'legacy_dm',encryptedXChatSupported:false});
 }catch(error){
  const known=new Set(['X_NOT_CONFIGURED','X_NOT_CONNECTED','X_RECONNECT_REQUIRED','X_TOKEN_REFRESHING','X_PROVIDER_UNAVAILABLE','X_GRANT_REJECTED','X_CONNECTION_CHANGED','X_SETUP_AUTH_EXPIRED','X_WEBHOOK_SETUP_BUSY','X_PROVIDER_AUTH_FAILED','X_PROVIDER_PERMISSION_DENIED','X_PROVIDER_CREDITS_REQUIRED','X_PROVIDER_RATE_LIMIT','X_WEBHOOK_RESPONSE_INVALID','X_WEBHOOK_PROVIDER_UNAVAILABLE','X_WEBHOOK_LIST_INCOMPLETE','X_WEBHOOK_AMBIGUOUS','X_WEBHOOK_NOT_VALID','X_SUBSCRIPTION_CONFLICT']);
  const code=known.has(error?.code)?error.code:'X_WEBHOOK_SETUP_UNAVAILABLE';
  // Fixed codes and local stages only. Never log tokens, URLs, provider bodies
  // or exception messages when diagnosing a production setup failure.
  (options.logger||console).warn('guardian.x.webhook_setup_failed',{code,stage});
  return json({code},error.status||503);
 }
 finally{if(lease)await env.DB.prepare("UPDATE guardian_x_transport SET lease_token=NULL,lease_expires_at=0 WHERE id='wolfgang' AND lease_token=?").bind(lease).run();}
}

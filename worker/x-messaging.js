import {guestOwner,guestSenderMayReceive} from './guest-access.js';
import {requestProviderBytes} from './provider-http.js';
import {getXAccessToken,getXConnection} from './x-connection.js';

const encoder=new TextEncoder();
const fail=(code,status=400)=>Object.assign(new Error(code),{code,status});
const numeric=value=>typeof value==='string'&&/^\d{1,30}$/.test(value);
const eventId=value=>typeof value==='string'&&/^[A-Za-z0-9_.:-]{1,160}$/.test(value);
const fresh=(value,now)=>Number.isFinite(value)&&value>=now-86400000&&value<=now+300000;
async function hmac(secret,value){
 const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 return btoa(String.fromCharCode(...new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(value)))));
}
export async function xCrcResponse(request,env){
 const token=new URL(request.url).searchParams.get('crc_token');
 // CRC and deliveries use the same HMAC key. Restrict this public challenge
 // endpoint to nonce characters so it cannot sign an attacker-chosen JSON
 // webhook body and become a provider-signature oracle.
 if(typeof env.X_CLIENT_SECRET!=='string'||!env.X_CLIENT_SECRET||typeof token!=='string'||!/^[A-Za-z0-9_.~+\/=-]{1,512}$/.test(token))return Response.json({code:'X_CRC_REJECTED'},{status:403,headers:{'Cache-Control':'no-store'}});
 return Response.json({response_token:'sha256='+await hmac(env.X_CLIENT_SECRET,token)},{headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
export async function verifyXWebhook(request,raw,env){
 // Never fall back to another credential family when OAuth 2.0 verification fails.
 const signature=request.headers.get('x-twitter-webhooks-signature-oauth2')||'';
 if(!env.X_CLIENT_SECRET||!/^sha256=[A-Za-z0-9+/]{43}=$/.test(signature))return false;
 const key=await crypto.subtle.importKey('raw',encoder.encode(env.X_CLIENT_SECRET),{name:'HMAC',hash:'SHA-256'},false,['verify']);
 try{return await crypto.subtle.verify('HMAC',key,Uint8Array.from(atob(signature.slice(7)),c=>c.charCodeAt(0)),encoder.encode(raw));}catch{return false;}
}
export function normaliseX(body,accountId,now=Date.now()){
 if(!numeric(accountId))throw fail('X_NOT_CONNECTED',503);
 const data=body?.data;
 if(!data||typeof data!=='object'||Array.isArray(data)||data.filter?.user_id!==accountId||!eventId(data.event_uuid)||!fresh(Date.parse(data.created_at),now))return {events:[],notices:[]};
 if(data.event_type==='chat.received')return {events:[],notices:[{eventId:data.event_uuid,eventType:'chat.received',reason:'encrypted_xchat_not_supported',createdAt:now}]};
 if(data.event_type!=='dm.received')return {events:[],notices:[]};
 const messages=data.payload?.direct_message_events;
 if(!Array.isArray(messages))return {events:[],notices:[]};
 if(messages.length>40)throw fail('TOO_MANY_MESSAGES',413);
 const events=[];
 for(const message of messages){
  const create=message?.message_create,sender=create?.sender_id,receivedAt=Number(message?.created_timestamp);
  if(message?.type!=='message_create'||!numeric(message.id)||!numeric(sender)||sender===accountId||create.target?.recipient_id!==accountId||!fresh(receivedAt,now))continue;
  const input=create.message_data;
  if(!input||typeof input!=='object'||Array.isArray(input))continue;
  const original=typeof input.text==='string'?input.text.replace(/\0/g,'').trim():'';
  events.push({channel:'x',eventId:'dm_'+message.id,senderId:sender,senderVerified:true,text:original.slice(0,16000),truncated:original.length>16000,unsupported:Boolean(input.attachment||input.entities?.media?.length),receivedAt,xAccountId:accountId});
 }
 return {events,notices:[]};
}
export async function recordXNotices(env,notices,now=Date.now()){
 if(!notices.length)return;
 await env.DB.prepare('DELETE FROM guardian_x_event_notices WHERE event_id IN (SELECT event_id FROM guardian_x_event_notices WHERE created_at<? ORDER BY created_at LIMIT 100)').bind(now-30*86400000).run();
 for(const item of notices)await env.DB.prepare('INSERT INTO guardian_x_event_notices(event_id,event_type,reason,created_at) SELECT ?,?,?,? WHERE (SELECT COUNT(*) FROM (SELECT event_id FROM guardian_x_event_notices LIMIT 1000))<1000 ON CONFLICT(event_id) DO NOTHING').bind(item.eventId,item.eventType,item.reason,now).run();
}
export async function sendXReply(event,text,env,{fetcher=fetch,now=Date.now(),expectedOwnerId,jobId,beforeSend}={}){
 if(event.senderVerified!==true||!numeric(event.senderId)||!numeric(event.xAccountId))throw fail('INVALID_RECIPIENT');
 const connection=await getXConnection(env);
 if(!connection.connected||connection.accountId!==event.xAccountId||event.senderId===connection.accountId)throw fail('X_CONNECTION_CHANGED',409);
 const token=await getXAccessToken(env,{fetcher,now});
 // Never allow a caller/model to choose a conversation or host. Recheck all
 // cancellation boundaries after the only pre-send provider await (renewal).
 const current=await getXConnection(env);
 if(!current.connected||current.accountId!==event.xAccountId)throw fail('X_CONNECTION_CHANGED',409);
 const stopped=await env.DB.prepare('SELECT 1 AS stopped FROM guardian_x_sender_optouts WHERE sender_id=?').bind(event.senderId).first();
 const linked=expectedOwnerId?await env.DB.prepare("SELECT owner_id FROM guardian_channel_identities WHERE channel='x' AND sender_id=?").bind(event.senderId).first():null;
 const active=jobId?await env.DB.prepare("SELECT id FROM guardian_message_jobs WHERE id=? AND channel='x' AND sender_id=? AND state='sending'").bind(jobId,event.senderId).first():true;
 if(stopped||expectedOwnerId&&(guestOwner(expectedOwnerId)?!await guestSenderMayReceive(env,event,expectedOwnerId):linked?.owner_id!==expectedOwnerId)||!active)throw fail('X_CONNECTION_CHANGED',409);
 if(beforeSend)await beforeSend();
 let bytes,providerStatus;
 try{bytes=await requestProviderBytes('https://api.x.com/2/dm_conversations/with/'+event.senderId+'/messages',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({text})},{fetcher:async(url,init)=>{const result=await fetcher(url,init);providerStatus=result.status;return result;},timeoutMs:12000,maxBytes:32000,contentType:'application/json'});}
 catch{throw fail(providerStatus===429?'PROVIDER_RATE_LIMIT':'DELIVERY_UNCERTAIN',providerStatus===429?429:502);}
 if(providerStatus!==201)throw fail('DELIVERY_UNCERTAIN',502);
 let result;try{result=JSON.parse(new TextDecoder().decode(bytes));}catch{throw fail('DELIVERY_UNCERTAIN',502);}
 const id=result.data?.dm_event_id;
 if(!numeric(id)||typeof result.data?.dm_conversation_id!=='string'||result.data.dm_conversation_id.length>100)throw fail('DELIVERY_UNCERTAIN',502);
 return id;
}

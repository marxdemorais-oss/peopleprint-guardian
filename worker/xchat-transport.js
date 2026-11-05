import {guestOwner,guestSenderMayReceive} from './guest-access.js';
// Owned XChat cryptography runs in a private, authenticated sidecar. This module
// handles only bounded evidence and API transport; no PIN/root keys reach Workers.
import {requestProviderBytes} from './provider-http.js';
import {getXAccessToken,getXConnection} from './x-connection.js';
const fail=(code,status=400)=>Object.assign(new Error(code),{code,status});
const numeric=v=>typeof v==='string'&&/^[1-9]\d{0,24}$/.test(v);
const identifier=v=>typeof v==='string'&&/^[A-Za-z0-9_.:-]{1,160}$/.test(v);
const fresh=(value,now)=>Number.isFinite(value)&&value>=now-86400000&&value<=now+300000;
const encoded=v=>typeof v==='string'&&v.length>0&&v.length<=131072&&/^[A-Za-z0-9+/]*={0,2}$/.test(v)&&v.length%4===0;
const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value))),v=>v.toString(16).padStart(2,'0')).join('');
export function xchatSettings(env={}){
 let origin=null;try{const u=new URL(env.XCHAT_CONNECTOR_ORIGIN);if(u.protocol==='https:'&&!u.username&&!u.password&&!u.search&&!u.hash&&u.pathname==='/')origin=u.origin;}catch{}
 const configured=Boolean(origin&&typeof env.XCHAT_SERVICE_TOKEN==='string'&&env.XCHAT_SERVICE_TOKEN.length>=32&&env.XCHAT_SERVICE_TOKEN.length<=512&&!/\s/.test(env.XCHAT_SERVICE_TOKEN));
 return {configured,enabled:configured&&env.XCHAT_ENABLED==='true',origin};
}
function conversation(value,accountId,senderId){
 if(typeof value!=='string'||value.length>60)throw fail('XCHAT_CONVERSATION_REJECTED');
 const ids=value.split(/[:-]/);if(ids.length!==2||!ids.every(numeric)||ids[0]===ids[1]||!ids.includes(accountId)||senderId&&!ids.includes(senderId))throw fail('XCHAT_CONVERSATION_REJECTED');
 return ids.sort((a,b)=>BigInt(a)<BigInt(b)?-1:1).join(':');
}
async function jsonRequest(url,init,fetcher,maxBytes=300000){
 const bytes=await requestProviderBytes(url,init,{fetcher,maxBytes,timeoutMs:20000,contentType:'application/json'});
 let body;try{body=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw fail('XCHAT_INVALID_RESPONSE',502);}
 if(!body||typeof body!=='object'||Array.isArray(body))throw fail('XCHAT_INVALID_RESPONSE',502);return body;
}
async function sidecar(env,action,body,token,fetcher){
 const settings=xchatSettings(env);if(!settings.enabled)throw fail('XCHAT_NOT_CONFIGURED',503);
 try{return await jsonRequest(settings.origin+'/v1/'+action,{method:'POST',headers:{Authorization:'Bearer '+env.XCHAT_SERVICE_TOKEN,'X-Wolfgang-X-Access-Token':token,'Content-Type':'application/json'},body:JSON.stringify(body)},fetcher);}catch{throw fail('XCHAT_CONNECTOR_UNAVAILABLE',503);}
}
async function connected(env,accountId){const current=await getXConnection(env);if(!current.connected||current.accountId!==accountId)throw fail('X_CONNECTION_CHANGED',409);return current;}
function bootstrap(events){if(!Array.isArray(events)||!events.length||events.length>64||!events.every(encoded)||events.reduce((n,v)=>n+v.length,0)>60000)throw fail('XCHAT_EVENT_BATCH_REJECTED');return events;}
export async function normaliseXChat(body,accountId,env,{fetcher=fetch,now=Date.now(),webhookVerified=false}={}){
 if(!webhookVerified)throw fail('INVALID_SIGNATURE',401);
 const data=body?.data,p=data?.payload;
 if(!numeric(accountId)||data?.filter?.user_id!==accountId||data?.event_type!=='chat.received'||!identifier(data?.event_uuid)||!fresh(Date.parse(data?.created_at),now))return {events:[],notices:[]};
 const notice=reason=>({events:[],notices:[{eventId:data.event_uuid,eventType:'chat.received',reason,createdAt:now}]});
 if(!xchatSettings(env).enabled)return notice('encrypted_xchat_not_supported');
 if(!p||!numeric(p.sender_id)||p.sender_id===accountId||!encoded(p.encoded_event))return notice('encrypted_xchat_invalid_envelope');
 let conv;try{conv=conversation(p.conversation_id,accountId,p.sender_id);}catch{return notice('encrypted_xchat_invalid_envelope');}
 if(await env.DB.prepare('SELECT event_uuid FROM guardian_xchat_received WHERE event_uuid=?').bind(data.event_uuid).first())return {events:[],notices:[]};
 await connected(env,accountId);const token=await getXAccessToken(env,{fetcher,now});await connected(env,accountId);
 let keys=p.conversation_key_change_event?[p.conversation_key_change_event]:[];
 if(!keys.length){
  // One fixed bounded lookup obtains signed key changes for this exact pinned
  // conversation. No pagination, arbitrary URLs, or unrelated history intake.
  const lookup=new URL('https://api.x.com/2/chat/conversations/'+conv.replace(':','-')+'/events');
  lookup.searchParams.set('max_results','1');
  lookup.searchParams.set('chat_message_event.fields','id,encoded_event,created_at,conversation_id,sender_id');
  let history;try{history=await jsonRequest(lookup.href,{headers:{Authorization:'Bearer '+token}},fetcher,90000);}catch{throw fail('XCHAT_KEY_CONTEXT_UNAVAILABLE',503);}
  await connected(env,accountId);
  if(!Array.isArray(history.meta?.conversation_key_events)||!history.meta.conversation_key_events.length||history.meta.conversation_key_events.length>63)throw fail('XCHAT_KEY_CONTEXT_UNAVAILABLE',409);
  keys=history.meta.conversation_key_events;
 }
 const events=bootstrap([...keys,p.encoded_event]);
 const result=await sidecar(env,'decrypt',{conversation_id:conv,events},token,fetcher);await connected(env,accountId);
 if(result.conversation_id!==conv||!Array.isArray(result.messages)||result.messages.length>64)throw fail('XCHAT_INVALID_RESPONSE',502);
 const target=result.messages.filter(m=>m.original_b64===p.encoded_event);
 if(target.length!==1)throw fail('XCHAT_UNVERIFIED_MESSAGE',422);
 const message=target[0].event;
 if(message?.verified!==true||!['Message','message'].includes(message.type)||!identifier(message.id)||message.sender_id!==p.sender_id||conversation(message.conversation_id,accountId,message.sender_id)!==conv)throw fail('XCHAT_UNVERIFIED_MESSAGE',422);
 // The SDK legitimately returns null for server-added timestamps. Freshness
 // then comes from the already authenticated X delivery metadata, not from a
 // claim that the sender's message signature covers the timestamp.
 let receivedAt=Date.parse(data.created_at);
 for(const value of [p.created_at_msec,message.created_at_msec]){
  if(value===null||value===undefined)continue;
  const originalTime=typeof value==='number'?value:typeof value==='string'&&/^\d{1,16}$/.test(value)?Number(value):NaN;
  if(!Number.isSafeInteger(originalTime)||!fresh(originalTime,now))throw fail('XCHAT_STALE_MESSAGE',422);
  // Keep the original provider timestamp for delayed STOP/reconnect ordering;
  // a later webhook delivery must not turn an older STOP into a new command.
  receivedAt=Math.min(receivedAt,originalTime);
 }
 const content=message.content||{},original=typeof content.text==='string'?content.text.replace(/\0/g,'').trim():'';
 const event={channel:'x',eventId:'chat_'+message.id,senderId:message.sender_id,senderVerified:true,text:original.slice(0,16000),truncated:original.length>16000,unsupported:content.content_type!=='Text'||Boolean(content.attachments?.length||message.attachments?.length||message.media_hashes?.length),receivedAt,xAccountId:accountId,xTransport:'xchat',xConversationId:conv,xChatEvents:events,xReplyToEvent:p.encoded_event};
 // Record delivery dedupe only once queueEvent has durably stored this signed
 // message. The caller invokes markXChatReceived after successful admission.
 return {events:[event],notices:[],xchatDelivery:{eventUuid:data.event_uuid,messageId:message.id}};
}
export async function markXChatReceived(env,delivery,now=Date.now()){
 if(!delivery)return;if(!identifier(delivery.eventUuid)||!identifier(delivery.messageId))throw fail('XCHAT_INVALID_DELIVERY');
 await env.DB.batch([env.DB.prepare('DELETE FROM guardian_xchat_received WHERE event_uuid IN (SELECT event_uuid FROM guardian_xchat_received WHERE created_at<? LIMIT 100)').bind(now-30*86400000),env.DB.prepare('INSERT INTO guardian_xchat_received(event_uuid,message_id,created_at) VALUES (?,?,?) ON CONFLICT(event_uuid) DO NOTHING').bind(delivery.eventUuid,delivery.messageId,now)]);
}
export async function sendXChatReply(event,text,env,{fetcher=fetch,now=Date.now(),expectedOwnerId,jobId,beforeSend,idempotencyKey}={}){
 if(!xchatSettings(env).enabled)throw fail('XCHAT_NOT_CONFIGURED',503);
 if(event?.channel!=='x'||event.xTransport!=='xchat'||event.senderVerified!==true||!numeric(event.senderId)||!numeric(event.xAccountId)||event.senderId===event.xAccountId||typeof text!=='string'||!text.trim()||text.length>20000||!identifier(idempotencyKey||jobId))throw fail('INVALID_RECIPIENT');
 const conv=conversation(event.xConversationId,event.xAccountId,event.senderId),events=bootstrap(event.xChatEvents);
 if(!encoded(event.xReplyToEvent)||!events.includes(event.xReplyToEvent))throw fail('XCHAT_REPLY_TARGET_REJECTED');
 const boundary=async()=>{
  await connected(env,event.xAccountId);
  const stop=await env.DB.prepare('SELECT 1 AS stopped FROM guardian_x_sender_optouts WHERE sender_id=?').bind(event.senderId).first();
  const linked=expectedOwnerId?await env.DB.prepare("SELECT owner_id FROM guardian_channel_identities WHERE channel='x' AND sender_id=?").bind(event.senderId).first():null;
  const job=jobId?await env.DB.prepare("SELECT id FROM guardian_message_jobs WHERE id=? AND channel='x' AND sender_id=? AND state='sending' AND owner_id IS ?").bind(jobId,event.senderId,expectedOwnerId??null).first():true;
  if(stop||expectedOwnerId&&(guestOwner(expectedOwnerId)?!await guestSenderMayReceive(env,event,expectedOwnerId):linked?.owner_id!==expectedOwnerId)||!job)throw fail('X_CONNECTION_CHANGED',409);
  if(beforeSend)await beforeSend();
 };
 await boundary();const token=await getXAccessToken(env,{fetcher,now});await boundary();
 const key=await digest([event.xAccountId,event.senderId,idempotencyKey||jobId].join('\n'));
 const prior=await env.DB.prepare('SELECT * FROM guardian_xchat_deliveries WHERE delivery_key=?').bind(key).first();
 if(prior){if(prior.state==='sent')return prior.message_id;throw fail('DELIVERY_UNCERTAIN',502);}
 const generated=await sidecar(env,'encrypt',{conversation_id:conv,events,text,reply_to_event:event.xReplyToEvent},token,fetcher);await boundary();
 const payload=generated.payload;
 if(generated.conversation_id!==conv||!identifier(payload?.message_id)||!encoded(payload?.encoded_message_create_event)||!encoded(payload?.encoded_message_event_signature)||JSON.stringify(payload).length>300000)throw fail('XCHAT_INVALID_RESPONSE',502);
 const inserted=await env.DB.prepare("INSERT INTO guardian_xchat_deliveries(delivery_key,job_id,account_id,sender_id,owner_id,message_id,state,payload_json,created_at,updated_at) VALUES (?,?,?,?,?,?,'prepared',?,?,?) ON CONFLICT(delivery_key) DO NOTHING").bind(key,jobId||null,event.xAccountId,event.senderId,expectedOwnerId??null,payload.message_id,JSON.stringify({message_id:payload.message_id,encoded_message_create_event:payload.encoded_message_create_event,encoded_message_event_signature:payload.encoded_message_event_signature,...(typeof payload.xdk_version==='string'&&/^[A-Za-z0-9_.-]{1,64}$/.test(payload.xdk_version)?{xdk_version:payload.xdk_version}:{})}),now,now).run();
 if(!inserted.meta?.changes)throw fail('DELIVERY_UNCERTAIN',502);
 try{await boundary();}catch(error){await env.DB.prepare("UPDATE guardian_xchat_deliveries SET state='cancelled',payload_json='{}',updated_at=? WHERE delivery_key=? AND state='prepared'").bind(now,key).run();throw error;}
 const claimed=await env.DB.prepare("UPDATE guardian_xchat_deliveries SET state='sending',updated_at=? WHERE delivery_key=? AND state='prepared'").bind(now,key).run();if(!claimed.meta?.changes)throw fail('DELIVERY_UNCERTAIN',502);
 let providerStatus;
 try{
  // No await between the final caller/Stop boundary and the actual provider send.
  await boundary();
  const result=await jsonRequest('https://api.x.com/2/chat/conversations/'+conv.replace(':','-')+'/messages',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({message_id:payload.message_id,encoded_message_create_event:payload.encoded_message_create_event,encoded_message_event_signature:payload.encoded_message_event_signature,...(typeof payload.xdk_version==='string'&&/^[A-Za-z0-9_.-]{1,64}$/.test(payload.xdk_version)?{xdk_version:payload.xdk_version}:{})})},async(url,init)=>{const response=await fetcher(url,init);providerStatus=response.status;return response;},32000);
  const receipt=result.data?.encoded_message_event;
  if(providerStatus!==201||!encoded(receipt)||Array.isArray(result.errors)&&result.errors.length)throw fail('DELIVERY_UNCERTAIN',502);
  const verified=await sidecar(env,'decrypt',{conversation_id:conv,events:[...events,receipt]},token,fetcher);
  const matching=Array.isArray(verified.messages)?verified.messages.filter(v=>v.original_b64===receipt):[];
  const signed=matching[0]?.event;
  if(verified.conversation_id!==conv||matching.length!==1||signed?.verified!==true||signed.id!==payload.message_id||signed.sender_id!==event.xAccountId||conversation(signed.conversation_id,event.xAccountId,event.senderId)!==conv)throw fail('DELIVERY_UNCERTAIN',502);
  await env.DB.prepare("UPDATE guardian_xchat_deliveries SET state='sent',payload_json='{}',updated_at=? WHERE delivery_key=? AND state='sending'").bind(now,key).run();
  return payload.message_id;
 }catch(error){await env.DB.prepare("UPDATE guardian_xchat_deliveries SET state='uncertain',updated_at=? WHERE delivery_key=? AND state='sending'").bind(now,key).run();throw fail('DELIVERY_UNCERTAIN',502);}
}

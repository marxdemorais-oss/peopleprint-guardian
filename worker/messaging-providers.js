import {guestOwner,guestSenderMayReceive} from './guest-access.js';
import {Webhook} from 'standardwebhooks';
import {nativeMessagingReady,validPublicOrigin} from './messaging-config.js';
import {emailReadableContent} from './email-content.js';
import {sendXChatReply} from './xchat-transport.js';
import {sendXReply} from './x-messaging.js';
import {requestProviderBytes} from './provider-http.js';
const encoder=new TextEncoder();
const bytesHex=value=>Uint8Array.from(value.match(/../g)||[],s=>parseInt(s,16));
export const messagingError=(code,status=400)=>Object.assign(new Error(code),{code,status});
export async function messageRaw(request,limit=300000){
 if(Number(request.headers.get('content-length')||0)>limit)throw messagingError('MESSAGE_TOO_LARGE',413);
 const reader=request.body?.getReader();if(!reader)throw messagingError('BODY_REQUIRED');
 const parts=[];let size=0;while(true){const r=await reader.read();if(r.done)break;size+=r.value.length;if(size>limit){await reader.cancel();throw messagingError('MESSAGE_TOO_LARGE',413);}parts.push(r.value);}
 const bytes=new Uint8Array(size);let offset=0;for(const p of parts){bytes.set(p,offset);offset+=p.length;}return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
}
async function hmacVerify(secret,signature,input,algorithm='SHA-256'){
 const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:algorithm},false,['verify']);
 return crypto.subtle.verify('HMAC',key,signature,encoder.encode(input));
}
export async function verifyMetaWebhook(request,raw,env){const sig=request.headers.get('x-hub-signature-256')||'';return /^sha256=[a-f0-9]{64}$/.test(sig)&&await hmacVerify(env.META_APP_SECRET,bytesHex(sig.slice(7)),raw);}
export async function verifyTwilioWebhook(request,raw,env){
 if(!request.headers.get('content-type')?.startsWith('application/x-www-form-urlencoded'))return false;
 const params=new URLSearchParams(raw);if([...params.keys()].some((k,i,a)=>a.indexOf(k)!==i))return false;
 const u=new URL(request.url),origin=validPublicOrigin(env.MESSAGING_PUBLIC_ORIGIN);if(!origin||u.search)return false;
 const signature=request.headers.get('x-twilio-signature')||'';if(!/^[A-Za-z0-9+/]{27}=$/.test(signature))return false;
 const canonical=origin+u.pathname+[...params.keys()].sort().map(k=>k+params.get(k)).join('');
 return hmacVerify(env.TWILIO_AUTH_TOKEN,Uint8Array.from(atob(signature),c=>c.charCodeAt(0)),canonical,'SHA-1');
}
export function verifyResendWebhook(request,raw,env){
 try{
  const verifier=new Webhook(env.RESEND_WEBHOOK_SECRET);
  return verifier.verify(raw,{
   'webhook-id':request.headers.get('svix-id'),
   'webhook-timestamp':request.headers.get('svix-timestamp'),
   'webhook-signature':request.headers.get('svix-signature')
  });
 }catch{throw messagingError('INVALID_SIGNATURE',401);}
}
const textValue=value=>typeof value==='string'?value.replace(/\0/g,'').trim():'';
const mailbox=value=>{if(typeof value!=='string'||/[\r\n\0]/.test(value))return null;const address=value.includes('<')?value.match(/^[^<>]*<([^<>]+)>$/)?.[1]:value;return typeof address==='string'&&/^[A-Z0-9.!#$%&'*+/=?^_`{|}~\-]+@[A-Z0-9](?:[A-Z0-9.\-]*[A-Z0-9])?\.[A-Z]{2,63}$/i.test(address)&&address.length<=254?address.toLowerCase():null;};
const uuid=value=>typeof value==='string'&&/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(value);
const addresses=value=>Array.isArray(value)?value:[];
const messageId=value=>typeof value==='string'&&/^<[^<>\s\x00-\x1f\x7f]{1,246}>$/.test(value)?value:null;
const cleanId=value=>typeof value==='string'&&/^[A-Za-z0-9_.:@+/=\-]{1,160}$/.test(value)?value:null;
const receiptId=value=>typeof value==='string'&&/^[A-Za-z0-9_.:@+/=\-]{1,256}$/.test(value)?value:null;
export function normaliseMeta(channel,body,env,now=Date.now()){
 const events=[];const expected=channel==='whatsapp'?'whatsapp_business_account':channel==='messenger'?'page':'instagram';if(body.object!==expected)return events;
 for(const entry of (body.entry||[]).slice(0,20)){
  const account=channel==='whatsapp'?env.WHATSAPP_BUSINESS_ACCOUNT_ID:channel==='messenger'?env.MESSENGER_PAGE_ID:env.INSTAGRAM_ACCOUNT_ID;if(String(entry.id)!==account)continue;
  if(channel==='whatsapp')for(const change of (entry.changes||[]).slice(0,20)){
   const value=change.value;if(change.field!=='messages'||String(value?.metadata?.phone_number_id)!==env.WHATSAPP_PHONE_NUMBER_ID)continue;
   for(const m of (value.messages||[]).slice(0,20)){
    if(!/^\d{7,15}$/.test(m.from||'')||!cleanId(m.id))continue;
    const timestamp=Number(m.timestamp)*1000;if(!Number.isFinite(timestamp)||timestamp>now+300000||timestamp<now-86400000)continue;
    const text=textValue(m.text?.body||m.button?.text||m.interactive?.button_reply?.id),media=Boolean(m.image||m.document||m.audio||m.video||m.sticker);
    events.push({channel,eventId:m.id,senderId:m.from,senderVerified:true,text,unsupported:media,receivedAt:timestamp,replyTo:cleanId(m.context?.id)});
   }
  }else for(const m of (entry.messaging||[]).slice(0,20)){
   if(String(m.recipient?.id)!==account||!/^\d{3,40}$/.test(m.sender?.id||'')||(m.message?.is_echo||m.message?.is_deleted))continue;
   const eventId=cleanId(m.message?.mid||m.postback?.mid);if(!eventId)continue;
   const timestamp=Number(m.timestamp);if(!Number.isFinite(timestamp)||timestamp>now+300000||timestamp<now-86400000)continue;
   const text=textValue(m.message?.text||m.postback?.payload),media=Boolean(m.message?.attachments?.length);
   events.push({channel,eventId,senderId:m.sender.id,senderVerified:true,text,unsupported:media,receivedAt:timestamp,replyTo:cleanId(m.message?.reply_to?.mid)});
  }
 }
 if(events.length>40)throw messagingError('TOO_MANY_MESSAGES',413);return events;
}
export function normaliseTwilio(raw,env,now=Date.now()){
 const p=new URLSearchParams(raw);if(p.get('AccountSid')!==env.TWILIO_ACCOUNT_SID||p.get('To')!==env.WOLFGANG_SMS_NUMBER||!/^\+[1-9]\d{7,14}$/.test(p.get('From')||'')||!/^SM[a-f0-9]{32}$/i.test(p.get('MessageSid')||''))return [];
 return [{channel:'sms',eventId:p.get('MessageSid'),senderId:p.get('From'),senderVerified:true,text:textValue(p.get('Body')),unsupported:Number(p.get('NumMedia')||0)>0,receivedAt:now}];
}
export async function confirmTwilioEvent(event,env,fetcher=fetch,now=Date.now()){
 const record=await providerJson('https://api.twilio.com/2010-04-01/Accounts/'+env.TWILIO_ACCOUNT_SID+'/Messages/'+encodeURIComponent(event.eventId)+'.json',{headers:{Authorization:'Basic '+btoa(env.TWILIO_ACCOUNT_SID+':'+env.TWILIO_AUTH_TOKEN)}},fetcher);
 const created=Date.parse(record.date_created);return record.sid===event.eventId&&record.account_sid===env.TWILIO_ACCOUNT_SID&&record.from===event.senderId&&record.to===env.WOLFGANG_SMS_NUMBER&&Number.isFinite(created)&&created<=now+300000&&created>now-86400000;
}
export async function providerJson(url,init,fetcher=fetch,{maxBytes=262144}={}){
 const sending=String(init?.method||'GET').toUpperCase()==='POST';
 let bytes;try{bytes=await requestProviderBytes(url,init,{fetcher,timeoutMs:12000,maxBytes});}
 catch(error){
  if(error.code==='PROVIDER_REDIRECT')throw messagingError('PROVIDER_REDIRECT',502);
  if(error.code==='PROVIDER_REJECTED'){if(sending&&error.providerStatus>=500)throw messagingError('DELIVERY_UNCERTAIN',502);throw Object.assign(messagingError(error.providerStatus===429?'PROVIDER_RATE_LIMIT':'PROVIDER_REJECTED',error.providerStatus===429?429:502),{providerStatus:error.providerStatus});}
  // A body interrupted after sending may hide an accepted delivery. Preserve
  // the uncertain outcome so the worker cannot blindly send the reply twice.
  if(error.code==='PROVIDER_TOO_LARGE')throw messagingError(sending?'DELIVERY_UNCERTAIN':'MESSAGE_TOO_LARGE',sending?502:413);
  if(error.code==='PROVIDER_INVALID_RESPONSE')throw messagingError(sending?'DELIVERY_UNCERTAIN':'PROVIDER_INVALID_RESPONSE',502);
  throw messagingError('DELIVERY_UNCERTAIN',502);
 }
 try{const value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));if(!value||typeof value!=='object'||Array.isArray(value))throw Error();return value;}catch{throw messagingError(sending?'DELIVERY_UNCERTAIN':'PROVIDER_INVALID_RESPONSE',502);}
}
export async function normaliseResend(event,env,{fetcher=fetch,now=Date.now()}={}){
 const inboxEvent=event.type==='inbox.email.received';
 if(event.type!=='email.received'&&!inboxEvent)return [];
 const data=event.data;if(!uuid(data?.email_id))return [];
 const allowed=[mailbox(env.WOLFGANG_EMAIL_RECEIVING_ADDRESS),mailbox(env.WOLFGANG_EMAIL)].filter(Boolean);
 const headers={Authorization:'Bearer '+env.RESEND_API_KEY};let inboxEmail;
 if(inboxEvent){
  if(data.inbox_id!==env.RESEND_INBOX_ID||!uuid(data.inbox_id)||!uuid(data.thread_id)||data.email&&data.email.direction!=='inbound')return [];
  // The optional webhook email snapshot can be absent. Resolve the signed IDs
  // through the inbox-scoped API to prove membership and inbound direction.
  inboxEmail=await providerJson('https://api.resend.com/inboxes/'+data.inbox_id+'/threads/'+data.thread_id+'/emails/'+data.email_id,{headers},fetcher,{maxBytes:8*1024*1024});
  if(inboxEmail.id!==data.email_id||inboxEmail.direction!=='inbound'||!addresses(inboxEmail.to).some(a=>allowed.includes(mailbox(a))))return [];
 }else if(![...addresses(data.to),...addresses(data.received_for)].some(a=>allowed.includes(mailbox(a))))return [];
 // The receiving record is the authentication boundary, including for an
 // inbox message. A missing record/result must never fall back to mail headers.
 const email=await providerJson('https://api.resend.com/emails/receiving/'+data.email_id+'?html_format=cid',{headers},fetcher,{maxBytes:8*1024*1024});
 if(email.id!==data.email_id)return [];
 const destination=mailbox(env.WOLFGANG_EMAIL_RECEIVING_ADDRESS);if(!destination||![...addresses(email.to),...addresses(email.received_for)].some(a=>inboxEvent?allowed.includes(mailbox(a)):mailbox(a)===destination))return [];
 // These are receiving-server results, NOT a sender-supplied header. Fail closed
 // for older records without this provider field or any failed DMARC result.
 if(email.authentication?.dmarc!=='pass')return [];
 const senderId=mailbox(email.from);if(!senderId||senderId===mailbox(env.WOLFGANG_EMAIL)||senderId===mailbox(env.WOLFGANG_EMAIL_FROM))return [];
 if(inboxEmail&&(mailbox(inboxEmail.from)!==senderId||messageId(inboxEmail.message_id)!==messageId(email.message_id)))return [];
 const hs=Object.fromEntries(Object.entries(email.headers||{}).map(([k,v])=>[k.toLowerCase(),v]));if(hs['auto-submitted']&&hs['auto-submitted']!=='no'||/bulk|junk|list/i.test(hs.precedence||''))return [];
 const content=emailReadableContent(email);
 return [{channel:'email',eventId:data.email_id,senderId,senderVerified:true,text:content.text,unsupported:Boolean(email.attachments?.length)||content.unreadImages||!content.text,truncated:content.truncated,htmlOnly:content.htmlOnly,receivedAt:now,emailSubject:content.subject,emailMessageId:messageId(email.message_id),replyTo:messageId(hs['in-reply-to'])}];
}
export async function sendProviderReply(event,text,env,{fetcher=fetch,idempotencyKey,expectedOwnerId,jobId,now,beforeSend}={}){
 if(!nativeMessagingReady(env,event.channel))throw messagingError('CHANNEL_NOT_CONFIGURED',503);
 if(event.senderVerified!==true||!(event.channel==='email'?mailbox(event.senderId)===event.senderId:event.channel==='sms'?/^\+[1-9]\d{7,14}$/.test(event.senderId||''):event.channel==='whatsapp'?/^\d{7,15}$/.test(event.senderId||''):/^\d{3,40}$/.test(event.senderId||'')))throw messagingError('INVALID_RECIPIENT',400);
 const limit=event.channel==='sms'?1400:event.channel==='instagram'||event.channel==='messenger'?1900:3900;
 // Routine replies contain the answer, without an automatic staff-email footer.
 // Keep the channel's explicit opt-out instruction independent of support copy.
 const optOut=event.channel==='x'?'\n\nReply STOP to stop. Reconnect from your Guardian account whenever you choose.':'';
 const bodyText=String(text).slice(0,limit-optOut.length)+optOut;
 if(event.channel==='x')return event.xTransport==='xchat'?sendXChatReply(event,bodyText,env,{fetcher,expectedOwnerId,jobId,now,beforeSend,idempotencyKey}):sendXReply(event,bodyText,env,{fetcher,expectedOwnerId,jobId,now,beforeSend});
 if(guestOwner(expectedOwnerId)&&!await guestSenderMayReceive(env,event,expectedOwnerId))throw messagingError('CONTACT_CHANGED',409);
 if(event.channel!=='x'&&beforeSend)await beforeSend();
 if(event.channel==='email'){
  if(typeof idempotencyKey!=='string'||!idempotencyKey||idempotencyKey.length>256)throw messagingError('IDEMPOTENCY_KEY_REQUIRED',400);
  const headers=messageId(event.emailMessageId)?{'In-Reply-To':event.emailMessageId,References:event.emailMessageId}:{};
  const result=await providerJson('https://api.resend.com/emails',{method:'POST',headers:{Authorization:'Bearer '+env.RESEND_API_KEY,'Content-Type':'application/json','Idempotency-Key':idempotencyKey},body:JSON.stringify({from:env.WOLFGANG_EMAIL_FROM,to:[event.senderId],subject:('Re: '+(event.emailSubject||'Your message to Wolfgang')).slice(0,200),text:bodyText,reply_to:env.WOLFGANG_EMAIL,headers:{...headers,'Auto-Submitted':'auto-replied'}})},fetcher);if(!receiptId(result.id))throw messagingError('DELIVERY_UNCERTAIN',502);
  // The sending UUID is not the RFC Message-ID used by In-Reply-To. Failure of
  // this read must never retry an already accepted send.
  try{const sent=await providerJson('https://api.resend.com/emails/'+encodeURIComponent(result.id),{headers:{Authorization:'Bearer '+env.RESEND_API_KEY}},fetcher);if(messageId(sent.message_id))return sent.message_id;}catch{}
  return result.id;
 }
 if(event.channel==='sms'){
  const result=await providerJson('https://api.twilio.com/2010-04-01/Accounts/'+env.TWILIO_ACCOUNT_SID+'/Messages.json',{method:'POST',headers:{Authorization:'Basic '+btoa(env.TWILIO_ACCOUNT_SID+':'+env.TWILIO_AUTH_TOKEN),'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({From:env.WOLFGANG_SMS_NUMBER,To:event.senderId,Body:bodyText})},fetcher);if(!receiptId(result.sid))throw messagingError('DELIVERY_UNCERTAIN',502);return result.sid;
 }
 const whatsapp=event.channel==='whatsapp',instagram=event.channel==='instagram';
 const account=whatsapp?env.WHATSAPP_PHONE_NUMBER_ID:instagram?env.INSTAGRAM_ACCOUNT_ID:env.MESSENGER_PAGE_ID;
 const token=whatsapp?env.WHATSAPP_ACCESS_TOKEN:instagram?env.INSTAGRAM_ACCESS_TOKEN:env.MESSENGER_PAGE_ACCESS_TOKEN;
 const body=whatsapp?{messaging_product:'whatsapp',to:event.senderId,type:'text',text:{body:bodyText},context:{message_id:event.eventId}}:{recipient:{id:event.senderId},message:{text:bodyText},...(!instagram?{messaging_type:'RESPONSE'}:{})};
 const result=await providerJson((instagram?'https://graph.instagram.com/':'https://graph.facebook.com/')+env.META_GRAPH_VERSION+'/'+account+'/messages',{method:'POST',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify(body)},fetcher);const id=whatsapp?result.messages?.[0]?.id:result.message_id;if(!receiptId(id))throw messagingError('DELIVERY_UNCERTAIN',502);return id;
}

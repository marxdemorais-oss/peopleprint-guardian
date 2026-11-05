import {guestIdentity,guestOwner,guestSenderMayReceive,guestInvitation} from './guest-access.js';
import {handleContactRequest} from './contact-ingress.js';
import {resolvePeopleAccess} from './people-auth.js';
import {MESSAGE_CHANNELS,contactOnboardingPaused,messageChannelEnabled,nativeMessagingReady,validPublicOrigin} from './messaging-config.js';
import {messageRaw,verifyMetaWebhook,verifyTwilioWebhook,verifyResendWebhook,normaliseMeta,normaliseTwilio,confirmTwilioEvent,normaliseResend,sendProviderReply,messagingError} from './messaging-providers.js';
import {xCrcResponse,verifyXWebhook,normaliseX,recordXNotices} from './x-messaging.js';
import {xchatSettings,normaliseXChat,markXChatReceived} from './xchat-transport.js';
import {getXConnection} from './x-connection.js';
const encoder=new TextEncoder(),hex=value=>Array.from(new Uint8Array(value),b=>b.toString(16).padStart(2,'0')).join('');
const hash=async value=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const routes={'/api/messaging/meta/whatsapp':'whatsapp','/api/messaging/meta/messenger':'messenger','/api/messaging/meta/instagram':'instagram','/api/messaging/twilio/sms':'sms','/api/messaging/resend/email':'email','/api/messaging/x/webhook':'x'};
const signup=env=>(validPublicOrigin(env.MESSAGING_PUBLIC_ORIGIN)||'https://guardian.peopleorganised.com')+'/signup?return_to='+encodeURIComponent('/connections?take=1');
async function signedIngress(event,env,options){
 const origin=validPublicOrigin(env.MESSAGING_PUBLIC_ORIGIN)||'https://guardian.peopleorganised.com',raw=JSON.stringify(event),timestamp=String(Math.floor((options.now??Date.now())/1000));
 const key=await crypto.subtle.importKey('raw',encoder.encode(env.CONTACT_GATEWAY_SECRET),{name:'HMAC',hash:'SHA-256'},false,['sign']);const signature=hex(await crypto.subtle.sign('HMAC',key,encoder.encode(timestamp+'.'+raw)));
 const response=await handleContactRequest(new Request(origin+'/api/contact-events',{method:'POST',headers:{'Content-Type':'application/json','x-wolfgang-timestamp':timestamp,'x-wolfgang-signature':'sha256='+signature},body:raw}),env,{},options.ingressOptions||{});
 return {ok:response.ok,status:response.status,body:await response.json()};
}
async function senderQuota(db,event,now){const key='native:'+await hash(event.channel+'\0'+event.senderId)+':'+Math.floor(now/60000);const row=await db.prepare('INSERT INTO guardian_rate_limits(bucket_key,owner_id,count,expires_at) VALUES (?,?,1,?) ON CONFLICT(bucket_key) DO UPDATE SET count=count+1 RETURNING count').bind(key,'native',now+120000).first();return Number(row.count)<=20;}
// Do not process messages retained before replies were activated. Unlinked
// WhatsApp senders can receive linking instructions, never a personal judgement.
function skipBeforeChannelReply(env,channel,receivedAt,owner,text){
 const start=channel==='whatsapp'?env.GUARDIAN_WHATSAPP_REPLY_FROM:
  channel==='x'?env.GUARDIAN_X_REPLY_FROM:
  channel==='email'?env.GUARDIAN_EMAIL_REGISTERED_ONLY_FROM:null;
 if(!start)return false;
 const since=Date.parse(start);
 return !Number.isFinite(since)||receivedAt<since||(channel==='email'&&!owner&&!/^WG-[A-F0-9]{32}$/.test(text||''));
}
async function queueEvent(event,env,now){
 if(!event.text&&!event.unsupported)return;
 const prior=await env.DB.prepare('SELECT id FROM guardian_message_jobs WHERE channel=? AND event_id=?').bind(event.channel,event.eventId).first();if(prior)return;
 if(event.channel==='email'&&/^\s*(STOP|UNSUBSCRIBE)\s*$/i.test(event.text||'')){
  const stoppedAt=Math.min(now,event.receivedAt);
  await env.DB.batch([
   env.DB.prepare("INSERT INTO guardian_email_sender_optouts(sender_id,stopped_at) SELECT ?,? WHERE EXISTS (SELECT 1 FROM guardian_channel_identities WHERE channel='email' AND sender_id=? AND verified_at<=?) ON CONFLICT(sender_id) DO UPDATE SET stopped_at=MAX(stopped_at,excluded.stopped_at)").bind(event.senderId,stoppedAt,event.senderId,stoppedAt),
   env.DB.prepare("UPDATE guardian_message_jobs SET state='cancelled',payload_json='{}',reply_text=NULL WHERE channel='email' AND sender_id=? AND state NOT IN ('completed','expired','cancelled')").bind(event.senderId),
   env.DB.prepare("INSERT INTO guardian_channel_preferences(owner_id,channel,stopped_at) SELECT owner_id,'email',? FROM guardian_channel_identities WHERE channel='email' AND sender_id=? AND verified_at<=? ON CONFLICT(owner_id,channel) DO UPDATE SET stopped_at=MAX(stopped_at,excluded.stopped_at)").bind(stoppedAt,event.senderId,stoppedAt),
   env.DB.prepare("DELETE FROM guardian_channel_identities WHERE channel='email' AND sender_id=? AND verified_at<=?").bind(event.senderId,stoppedAt),
   env.DB.prepare("INSERT INTO guardian_message_jobs(id,channel,event_id,sender_id,payload_json,state,received_at,created_at,updated_at,expires_at) VALUES (?,'email',?,?,'{}','completed',?,?,?,?) ON CONFLICT(channel,event_id) DO NOTHING").bind('msg_'+await hash('email\0'+event.eventId),event.eventId,event.senderId,event.receivedAt,now,now,now+86400000)
  ]);return;
 }
 if(event.channel==='email'){
  const optout=await env.DB.prepare("SELECT stopped_at FROM guardian_email_sender_optouts s WHERE sender_id=? AND NOT EXISTS (SELECT 1 FROM guardian_channel_identities i WHERE i.channel='email' AND i.sender_id=s.sender_id AND i.verified_at>s.stopped_at)").bind(event.senderId).first();
  if(optout){
   if(!/^WG-[A-F0-9]{32}$/.test(event.text||''))return;
   const freshCode=await env.DB.prepare("SELECT 1 FROM guardian_contact_links WHERE channel='email' AND code_hash=? AND created_at>? AND expires_at>?").bind(await hash(event.text),optout.stopped_at,now).first();
   if(!freshCode)return;
  }
 }
 if(event.channel==='x'){
  if(/^\s*(STOP|UNSUBSCRIBE)\s*$/i.test(event.text||'')){
   // Original timestamps and dedupe keep a delayed STOP from undoing a later
   // explicit connection. This control event retains no message text.
   const stoppedAt=Math.min(now,event.receivedAt);
   await env.DB.batch([
    env.DB.prepare("INSERT INTO guardian_message_jobs(id,channel,event_id,sender_id,payload_json,state,received_at,created_at,updated_at,expires_at) VALUES (?,'x',?,?,'{}','completed',?,?,?,?) ON CONFLICT(channel,event_id) DO NOTHING").bind('msg_'+await hash('x\0'+event.eventId),event.eventId,event.senderId,event.receivedAt,now,now,now+86400000),
    env.DB.prepare("INSERT INTO guardian_x_sender_optouts(sender_id,stopped_at) SELECT ?,? WHERE NOT EXISTS (SELECT 1 FROM guardian_channel_identities WHERE channel='x' AND sender_id=? AND verified_at>?) ON CONFLICT(sender_id) DO UPDATE SET stopped_at=MAX(stopped_at,excluded.stopped_at)").bind(event.senderId,stoppedAt,event.senderId,stoppedAt),
    env.DB.prepare("UPDATE guardian_message_jobs SET state='cancelled',payload_json='{}',reply_text=NULL WHERE channel='x' AND sender_id=? AND state NOT IN ('completed','expired','cancelled') AND NOT EXISTS (SELECT 1 FROM guardian_channel_identities WHERE channel='x' AND sender_id=? AND verified_at>?)").bind(event.senderId,event.senderId,stoppedAt),
    env.DB.prepare("INSERT INTO guardian_channel_preferences(owner_id,channel,stopped_at) SELECT owner_id,'x',? FROM guardian_channel_identities WHERE channel='x' AND sender_id=? AND verified_at<=? ON CONFLICT(owner_id,channel) DO UPDATE SET stopped_at=MAX(stopped_at,excluded.stopped_at)").bind(stoppedAt,event.senderId,stoppedAt),
    env.DB.prepare("DELETE FROM guardian_contact_links WHERE channel='x' AND created_at<=? AND owner_id IN (SELECT owner_id FROM guardian_channel_identities WHERE channel='x' AND sender_id=? AND verified_at<=?)").bind(stoppedAt,event.senderId,stoppedAt),
    env.DB.prepare("DELETE FROM guardian_channel_identities WHERE channel='x' AND sender_id=? AND verified_at<=?").bind(event.senderId,stoppedAt)
   ]);return;
  }
  if(!/^WG-[A-F0-9]{32}$/.test(event.text||'')&&await env.DB.prepare('SELECT 1 AS stopped FROM guardian_x_sender_optouts WHERE sender_id=?').bind(event.senderId).first())return;
 }
 if(!await senderQuota(env.DB,event,now))throw messagingError('SENDER_RATE_LIMIT',429);
 if(['x','email','whatsapp','messenger'].includes(event.channel)){
  const pending=await env.DB.prepare("SELECT COUNT(*) AS n FROM (SELECT id FROM guardian_message_jobs WHERE channel=? AND state IN ('queued','waiting_link','processing','reply_pending','sending') AND expires_at>? LIMIT 1000)").bind(event.channel,now).first();
  if(Number(pending?.n)>=1000)throw messagingError('CONTACT_QUEUE_FULL',429);
 }
 const waiting=await env.DB.prepare("SELECT COUNT(*) n FROM guardian_message_jobs WHERE channel=? AND sender_id=? AND state IN ('queued','waiting_link','processing','reply_pending','sending') AND expires_at>?").bind(event.channel,event.senderId,now).first();if(waiting.n>=10)throw messagingError('CONTACT_QUEUE_FULL',429);
 const owner=await env.DB.prepare('SELECT owner_id FROM guardian_channel_identities WHERE channel=? AND sender_id=?').bind(event.channel,event.senderId).first();
 if(!owner&&contactOnboardingPaused(event.channel))return;
 if(skipBeforeChannelReply(env,event.channel,event.receivedAt,owner,event.text))return;
 const values=['msg_'+await hash(event.channel+'\0'+event.eventId),event.channel,event.eventId,event.senderId,owner?.owner_id||null,JSON.stringify(event),event.receivedAt,now,now,(['x','whatsapp'].includes(event.channel)?Math.min(now,event.receivedAt):now)+86400000];
 if(['x','email','whatsapp','messenger'].includes(event.channel)){
  // Both hard admission bounds are evaluated in the same SQLite statement as
  // insertion; concurrent requests cannot all pass a separate count precheck.
  const inserted=await env.DB.prepare("INSERT INTO guardian_message_jobs(id,channel,event_id,sender_id,owner_id,payload_json,received_at,created_at,updated_at,expires_at) SELECT ?,?,?,?,?,?,?,?,?,? WHERE (SELECT COUNT(*) FROM (SELECT id FROM guardian_message_jobs WHERE channel=? AND state IN ('queued','waiting_link','processing','reply_pending','sending') AND expires_at>? LIMIT 1000))<1000 AND (SELECT COUNT(*) FROM (SELECT id FROM guardian_message_jobs WHERE channel=? AND sender_id=? AND state IN ('queued','waiting_link','processing','reply_pending','sending') AND expires_at>? LIMIT 10))<10 ON CONFLICT(channel,event_id) DO NOTHING").bind(...values,event.channel,now,event.channel,event.senderId,now).run();
  if(!inserted.meta?.changes&&!await env.DB.prepare("SELECT id FROM guardian_message_jobs WHERE channel=? AND event_id=?").bind(event.channel,event.eventId).first())throw messagingError('CONTACT_QUEUE_FULL',429);
 }else await env.DB.prepare('INSERT INTO guardian_message_jobs(id,channel,event_id,sender_id,owner_id,payload_json,received_at,created_at,updated_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?) ON CONFLICT(channel,event_id) DO NOTHING').bind(...values).run();
}
async function processIntakeLink(event,env,options){
 if(!/^WG-[A-F0-9]{32}$/.test(event.text||''))return;
 const now=options.now??Date.now();
 const job=await env.DB.prepare("UPDATE guardian_message_jobs SET state='processing',attempts=attempts+1,updated_at=? WHERE channel=? AND event_id=? AND state='queued' AND expires_at>? AND attempts<3 RETURNING id").bind(now,event.channel,event.eventId,now).first();if(!job)return false;
 try{
  // Exact one-time codes use the existing authenticated linking path only.
  // Message assessments, stored reply text and provider sends are never used.
  const result=await signedIngress({channel:event.channel,eventId:event.eventId,senderId:event.senderId,senderVerified:true,linkCode:event.text},env,{...options,ingressOptions:{...options.ingressOptions,now}});
  if(!result.ok||result.body.status!=='linked'){
   await env.DB.prepare("UPDATE guardian_message_jobs SET state=?,last_error=?,payload_json=CASE WHEN ?='failed' THEN '{}' ELSE payload_json END,updated_at=? WHERE id=? AND state='processing'").bind(result.status>=500?'queued':'failed',result.status>=500?'CONTACT_TEMPORARILY_UNAVAILABLE':'LINK_NOT_ACCEPTED',result.status>=500?'queued':'failed',now,job.id).run();return result.status>=500;
  }
  const linked=await env.DB.prepare('SELECT owner_id FROM guardian_channel_identities WHERE channel=? AND sender_id=?').bind(event.channel,event.senderId).first();
  if(!linked){await env.DB.prepare("UPDATE guardian_message_jobs SET state='cancelled',payload_json='{}',updated_at=? WHERE id=? AND state='processing'").bind(now,job.id).run();return;}
  await env.DB.batch([
   env.DB.prepare("UPDATE guardian_message_jobs SET owner_id=?,state='completed',payload_json='{}',last_error=NULL,updated_at=? WHERE id=? AND state='processing'").bind(linked.owner_id,now,job.id),
   env.DB.prepare("UPDATE guardian_message_jobs SET owner_id=?,updated_at=? WHERE channel=? AND sender_id=? AND state='queued' AND expires_at>? AND (owner_id IS NULL OR owner_id=?)").bind(linked.owner_id,now,event.channel,event.senderId,now,linked.owner_id)
  ]);
 }catch{
  await env.DB.prepare("UPDATE guardian_message_jobs SET state=CASE WHEN attempts>=3 THEN 'failed' ELSE 'queued' END,last_error='CONTACT_TEMPORARILY_UNAVAILABLE',updated_at=? WHERE id=? AND state='processing'").bind(now,job.id).run();return true;
 }
}
export async function cleanupMessaging(env,now=Date.now()){
 if(!env.DB)return;
 await env.DB.batch([env.DB.prepare("UPDATE guardian_message_jobs SET state='expired',payload_json='{}',reply_text=NULL WHERE id IN (SELECT id FROM guardian_message_jobs WHERE expires_at<=? AND (payload_json<>'{}' OR reply_text IS NOT NULL) LIMIT 100)").bind(now),env.DB.prepare('DELETE FROM guardian_message_jobs WHERE id IN (SELECT id FROM guardian_message_jobs WHERE created_at<? LIMIT 100)').bind(now-30*86400000),env.DB.prepare('DELETE FROM guardian_message_locks WHERE expires_at<=?').bind(now),env.DB.prepare('DELETE FROM guardian_transport_tests WHERE job_id IN (SELECT job_id FROM guardian_transport_tests WHERE created_at<? LIMIT 100)').bind(now-30*86400000),env.DB.prepare("UPDATE guardian_xchat_deliveries SET payload_json='{}' WHERE delivery_key IN (SELECT delivery_key FROM guardian_xchat_deliveries WHERE created_at<? AND payload_json<>'{}' LIMIT 100)").bind(now-86400000),env.DB.prepare('DELETE FROM guardian_xchat_deliveries WHERE delivery_key IN (SELECT delivery_key FROM guardian_xchat_deliveries WHERE created_at<? LIMIT 100)').bind(now-30*86400000),env.DB.prepare('DELETE FROM guardian_xchat_received WHERE event_uuid IN (SELECT event_uuid FROM guardian_xchat_received WHERE created_at<? LIMIT 100)').bind(now-30*86400000)]);
}
async function processJob(job,env,options){
 const db=env.DB,now=options.now??Date.now(),event=JSON.parse(job.payload_json);
 if(!messageChannelEnabled(env,job.channel))return;
 if(skipBeforeChannelReply(env,job.channel,job.received_at,job.owner_id,event.text)){
  await db.prepare("UPDATE guardian_message_jobs SET state='cancelled',reply_text=NULL,payload_json='{}' WHERE id=? AND state IN ('queued','reply_pending')").bind(job.id).run();
  return;
 }
 if(!job.owner_id&&contactOnboardingPaused(job.channel)){
  await db.prepare("UPDATE guardian_message_jobs SET state='cancelled',reply_text=NULL,payload_json='{}' WHERE id=? AND owner_id IS NULL AND state IN ('queued','reply_pending')").bind(job.id).run();
  return;
 }
 if(job.channel==='x'&&!/^WG-[A-F0-9]{32}$/.test(event.text||'')&&await db.prepare('SELECT 1 AS stopped FROM guardian_x_sender_optouts WHERE sender_id=?').bind(job.sender_id).first())return;
 const key=await hash(job.channel+'\0'+job.sender_id),lease=crypto.randomUUID();
 const lock=await db.prepare('INSERT INTO guardian_message_locks(sender_key,lease_token,expires_at) VALUES (?,?,?) ON CONFLICT(sender_key) DO UPDATE SET lease_token=excluded.lease_token,expires_at=excluded.expires_at WHERE guardian_message_locks.expires_at<=? RETURNING lease_token').bind(key,lease,now+120000,now).first();if(lock?.lease_token!==lease)return;
 try{
  const claimed=await db.prepare("UPDATE guardian_message_jobs SET state='processing',attempts=attempts+1,updated_at=? WHERE id=? AND state IN ('queued','reply_pending') RETURNING *").bind(now,job.id).first();if(!claimed)return;job=claimed;
  let reply=job.reply_text,afterSend=job.after_send_state;
  if(!reply){
   let text=event.text||'',isCode=/^WG-[A-F0-9]{32}$/.test(text),body;
   const linked=await db.prepare('SELECT owner_id FROM guardian_channel_identities WHERE channel=? AND sender_id=?').bind(job.channel,job.sender_id).first();
   const guest=linked||isCode?null:await guestIdentity(env,job.channel,job.sender_id);
   const effectiveOwner=linked?.owner_id||guest?.ownerId||'';
   if(guest){job.owner_id=guest.ownerId;await db.prepare("UPDATE guardian_message_jobs SET owner_id=? WHERE id=? AND state='processing'").bind(guest.ownerId,job.id).run();}
   if(!linked&&!guest&&!isCode){
    const previous=await db.prepare("SELECT id FROM guardian_message_jobs WHERE channel=? AND sender_id=? AND id<>? AND state='waiting_link' AND created_at>? LIMIT 1").bind(job.channel,job.sender_id,job.id,now-3600000).first();
    if(previous){await db.prepare("UPDATE guardian_message_jobs SET state='waiting_link',after_send_state='waiting_link',updated_at=? WHERE id=? AND state='processing'").bind(now,job.id).run();return;}
    reply='I’m Wolfgang, your personal Guardian. I’ll keep this message for 24 hours while you connect. Sign in with your email, then link this channel: '+signup(env)+'\n\nOnce connected, I’ll pick it up here. For urgent concerns, pause before sending money, codes or access.';afterSend='waiting_link';
   }else if(event.unsupported&&!text){
    reply='Your message has no readable text for me to check here. I cannot read its files or images yet. Paste the relevant text or share a readable text export at '+(validPublicOrigin(env.MESSAGING_PUBLIC_ORIGIN)||'https://guardian.peopleorganised.com')+'/workspace. No assessment has been made.';
   }else{
    // Only an actual reply to a message sent to this sender may select a case.
    // Neither quoted text nor a caller-supplied owner/check ID can select it.
    let replyToEventId;
    if(event.replyTo&&!isCode){const parent=await db.prepare('SELECT j.event_id FROM guardian_message_jobs j JOIN guardian_ingress_events i ON i.channel=j.channel AND i.event_id=j.event_id WHERE j.channel=? AND j.sender_id=? AND j.provider_message_id=? AND i.owner_id=? AND i.check_id IS NOT NULL LIMIT 1').bind(job.channel,job.sender_id,event.replyTo,effectiveOwner).first();replyToEventId=parent?.event_id;}
    if(['sms','x'].includes(job.channel)&&!isCode){
     if(/^NEW\s+/i.test(text))text=text.replace(/^NEW\s+/i,'');
     else{const parent=await db.prepare("SELECT i.event_id FROM guardian_message_jobs j JOIN guardian_ingress_events i ON i.channel=j.channel AND i.event_id=j.event_id JOIN guardian_checks c ON c.id=i.check_id AND c.owner_id=i.owner_id WHERE j.channel=? AND j.sender_id=? AND i.owner_id=? AND j.id<>? AND j.state='completed' AND j.updated_at>? AND json_array_length(c.result_json,'$.questions')>0 ORDER BY j.created_at DESC LIMIT 1").bind(job.channel,job.sender_id,effectiveOwner,job.id,now-1800000).first();replyToEventId=parent?.event_id;}
    }
    const result=await signedIngress({channel:job.channel,eventId:job.event_id,senderId:job.sender_id,senderVerified:true,...(isCode?{linkCode:text}:{text,...(replyToEventId?{replyToEventId}:{})})},env,options);body=result.body;
    if(!result.ok){
     if(result.status>=500||['CHECK_IN_PROGRESS','CHECK_CHANGED'].includes(body.code))throw messagingError(body.code||'CONTACT_TEMPORARILY_UNAVAILABLE',503);
     reply=body.code==='GUEST_REGISTRATION_REQUIRED'?'For further new checks, please register a free Guardian account. '+guestInvitation+' '+signup(env):result.status===402?'Your free-check allowance needs your attention. Continue here: '+(validPublicOrigin(env.MESSAGING_PUBLIC_ORIGIN)||'https://guardian.peopleorganised.com')+(body.code==='PROFILE_REQUIRED'?'/welcome?unlock=1':'/plans'):body.message||'I couldn’t process this message. Please open your Guardian account.';
    }else reply=body.reply?.text||'Your message is available in your Guardian workspace.';
    if(event.unsupported&&text&&!isCode)reply='Only the readable message text is included. Files and images have not been read.\n\n'+reply;
    if(event.truncated&&!isCode)reply='This older message was stored incompletely. Please forward it again so Wolfgang can read the complete email.\n\n'+reply;
    if(['sms','x'].includes(job.channel)&&body.checkId)reply+='\n\nReply to an open question with more context. Start a different request with NEW followed by the message.';
    if(body.status==='linked'){
     const owner=await db.prepare('SELECT owner_id FROM guardian_channel_identities WHERE channel=? AND sender_id=?').bind(job.channel,job.sender_id).first();
     await db.prepare("UPDATE guardian_message_jobs SET state='queued',after_send_state='completed',reply_text=NULL,provider_message_id=NULL,delivery_generation=delivery_generation+1,attempts=0,next_attempt_at=0,owner_id=?,updated_at=? WHERE channel=? AND sender_id=? AND state='waiting_link' AND expires_at>?").bind(owner?.owner_id||null,now,job.channel,job.sender_id,now).run();
     await db.prepare('UPDATE guardian_message_jobs SET owner_id=? WHERE id=?').bind(owner?.owner_id||null,job.id).run();
     reply='You’re connected to Wolfgang. I’ll now pick up any messages you sent before linking. You can send a new request here whenever you need me.';
    }
   }
   const saved=await db.prepare("UPDATE guardian_message_jobs SET reply_text=?,after_send_state=?,state='reply_pending',updated_at=? WHERE id=? AND state='processing'").bind(reply,afterSend,now,job.id).run();if(!saved.meta?.changes)return;
  }
  // Revocation/disconnect takes effect before private material can be sent.
  if(job.channel==='x'&&await db.prepare('SELECT 1 AS stopped FROM guardian_x_sender_optouts WHERE sender_id=?').bind(job.sender_id).first()){
   await db.prepare("UPDATE guardian_message_jobs SET state='cancelled',reply_text=NULL,payload_json='{}' WHERE id=?").bind(job.id).run();return;
  }
  if(job.owner_id){const current=await db.prepare('SELECT owner_id FROM guardian_channel_identities WHERE channel=? AND sender_id=?').bind(job.channel,job.sender_id).first();const active=!job.owner_id.startsWith('people:')||await resolvePeopleAccess(job.owner_id,env,{fetcher:options.ingressOptions?.identityFetcher});if((guestOwner(job.owner_id)?!await guestSenderMayReceive(env,event,job.owner_id):current?.owner_id!==job.owner_id)||!active){await db.prepare("UPDATE guardian_message_jobs SET state='cancelled',reply_text=NULL,payload_json='{}' WHERE id=?").bind(job.id).run();return;}}
  if(job.channel!=='email'&&job.channel!=='sms'&&now-event.receivedAt>=86400000){await db.prepare("UPDATE guardian_message_jobs SET state='expired',reply_text=NULL,payload_json='{}' WHERE id=?").bind(job.id).run();return;}
  // Claim before network I/O. Unknown delivery outcomes are quarantined rather
  // than automatically sending a duplicate through APIs without idempotency.
  const sending=await db.prepare("UPDATE guardian_message_jobs SET state='sending',updated_at=? WHERE id=? AND state IN ('processing','reply_pending')").bind(now,job.id).run();if(!sending.meta?.changes)return;
  try{const providerId=await sendProviderReply(event,reply,env,{fetcher:options.fetcher,idempotencyKey:job.id+':'+job.delivery_generation,expectedOwnerId:job.owner_id,jobId:job.id,now});await db.prepare("UPDATE guardian_message_jobs SET state=?,provider_message_id=?,reply_text=NULL,payload_json=CASE WHEN ?='completed' THEN '{}' ELSE payload_json END,last_error=NULL,updated_at=? WHERE id=? AND state='sending'").bind(afterSend,providerId,afterSend,now,job.id).run();}
  catch(error){const retry=error.code==='PROVIDER_RATE_LIMIT'||job.channel==='x'&&['X_TOKEN_REFRESHING','X_PROVIDER_UNAVAILABLE'].includes(error.code)||job.channel==='email'&&(error.code==='DELIVERY_UNCERTAIN'||error.providerStatus>=500);await db.prepare("UPDATE guardian_message_jobs SET state=?,last_error=?,updated_at=?,next_attempt_at=? WHERE id=? AND state='sending'").bind(retry?(job.attempts>=3?'failed':'reply_pending'):'uncertain',error.code||'DELIVERY_UNCERTAIN',now,now+30000,job.id).run();}
 }catch(error){await db.prepare("UPDATE guardian_message_jobs SET state=?,last_error=?,updated_at=?,next_attempt_at=? WHERE id=? AND state='processing'").bind(job.attempts>=3?'failed':'queued',error.code||'MESSAGE_PROCESSING_FAILED',now,now+10000*job.attempts,job.id).run();}
 finally{await db.prepare('DELETE FROM guardian_message_locks WHERE sender_key=? AND lease_token=?').bind(key,lease).run();}
}
export async function drainMessagingJobs(env,options={}){
 if(!env.DB)return;const now=options.now??Date.now();await cleanupMessaging(env,now);
 await env.DB.prepare('DELETE FROM guardian_x_event_notices WHERE event_id IN (SELECT event_id FROM guardian_x_event_notices WHERE created_at<? ORDER BY created_at LIMIT 100)').bind(now-30*86400000).run();
 // Resume computations through idempotent ingress. Resend also guarantees an
 // idempotency key for sends; other uncertain transports must not be replayed.
 await env.DB.batch([env.DB.prepare("UPDATE guardian_message_jobs SET state='queued',next_attempt_at=? WHERE state='processing' AND updated_at<? AND attempts<3 AND expires_at>?").bind(now,now-120000,now),env.DB.prepare("UPDATE guardian_message_jobs SET state=CASE WHEN channel='email' AND attempts<3 AND expires_at>? THEN 'reply_pending' ELSE 'uncertain' END,last_error='DELIVERY_INTERRUPTED',next_attempt_at=? WHERE state='sending' AND updated_at<?").bind(now,now,now-120000)]);
 // More than one pass lets the link confirmation unlock earlier waiting jobs.
 const channels=MESSAGE_CHANNELS.filter(channel=>messageChannelEnabled(env,channel));
 if(!channels.length)return;
 const placeholders=channels.map(()=>'?').join(',');
 for(let pass=0;pass<2;pass++){
  const jobs=await env.DB.prepare(`SELECT * FROM guardian_message_jobs WHERE channel IN (${placeholders}) AND state IN ('queued','reply_pending') AND expires_at>? AND next_attempt_at<=? AND attempts<3 ORDER BY created_at,rowid LIMIT 8`).bind(...channels,now,now).all();
  for(const job of jobs.results||[])await processJob(job,env,options);
 }
}
export async function handleMessagingWebhook(request,env={},ctx,options={}){
 const u=new URL(request.url),channel=routes[u.pathname];if(!channel)return null;
 if(channel==='x'&&request.method==='GET')return xCrcResponse(request,env);
 if(request.method==='GET'&&u.pathname.includes('/meta/')){
  const token=u.searchParams.get('hub.verify_token')||'',expected=env.META_VERIFY_TOKEN||'';
  const a=await hash(token),b=await hash(expected);if(u.searchParams.get('hub.mode')!=='subscribe'||a!==b||!expected||!/^\d{1,100}$/.test(u.searchParams.get('hub.challenge')||''))return json({code:'VERIFY_FAILED'},403);
  return new Response(u.searchParams.get('hub.challenge'),{headers:{'Content-Type':'text/plain','Cache-Control':'no-store'}});
 }
 const automaticReplies=messageChannelEnabled(env,channel);
 const intakeOnly=['x','email','whatsapp','messenger'].includes(channel)&&env[channel.toUpperCase()+'_RECEIVING_ENABLED']==='true'&&nativeMessagingReady(env,channel);
 if(!automaticReplies&&!intakeOnly)return json({code:'CHANNEL_NOT_CONNECTED'},503);
 if(request.method!=='POST')return json({code:'METHOD_NOT_ALLOWED'},405);
 try{
  const raw=await messageRaw(request),now=options.now??Date.now();let events=[],xchatDelivery=null;
  if(channel==='x'){
   if(!request.headers.get('content-type')?.includes('application/json'))throw messagingError('JSON_REQUIRED',415);
   if(!await verifyXWebhook(request,raw,env))throw messagingError('INVALID_SIGNATURE',401);
   const connection=await getXConnection(env);if(!connection.connected)throw messagingError('X_NOT_CONNECTED',503);
   await cleanupMessaging(env,now);
   const body=JSON.parse(raw),result=body?.data?.event_type==='chat.received'&&xchatSettings(env).enabled?await normaliseXChat(body,connection.accountId,env,{fetcher:options.fetcher,now,webhookVerified:true}):normaliseX(body,connection.accountId,now);events=result.events;xchatDelivery=result.xchatDelivery;await recordXNotices(env,result.notices,now);
  }
  else if(channel==='sms'){if(!await verifyTwilioWebhook(request,raw,env))throw messagingError('INVALID_SIGNATURE',401);for(const event of normaliseTwilio(raw,env,now))if(await confirmTwilioEvent(event,env,options.fetcher,now))events.push(event);}
  else if(channel==='email'){const event=verifyResendWebhook(request,raw,env);events=await normaliseResend(event,env,{fetcher:options.fetcher,now});await cleanupMessaging(env,now);}
  else{if(!request.headers.get('content-type')?.includes('application/json'))throw messagingError('JSON_REQUIRED',415);if(!await verifyMetaWebhook(request,raw,env))throw messagingError('INVALID_SIGNATURE',401);events=normaliseMeta(channel,JSON.parse(raw),env,now);if(['whatsapp','messenger'].includes(channel))await cleanupMessaging(env,now);}
  for(const event of events)await queueEvent(event,env,now);
  // Supervised intake-only testing never starts inference or an automatic reply.
  if(!automaticReplies){let pending=false;for(const event of events)pending=await processIntakeLink(event,env,options)||pending;if(!pending)await markXChatReceived(env,xchatDelivery,now);return pending?json({code:'MESSAGE_QUEUED'},503):json({received:true,automaticReplies:false});}
  await markXChatReceived(env,xchatDelivery,now);
  const work=drainMessagingJobs(env,options);if(ctx?.waitUntil){ctx.waitUntil(work);let timer;try{await Promise.race([work,new Promise(resolve=>{timer=setTimeout(resolve,9000);})]);}finally{clearTimeout(timer);}}else await work;
  // Ask the provider to retry while work remains. Acknowledging only after
  // durable work, or asking for retry, also works without a platform cron.
  for(const event of events){const pending=await env.DB.prepare("SELECT state FROM guardian_message_jobs WHERE channel=? AND event_id=? AND state IN ('queued','processing','reply_pending') AND attempts<3 AND expires_at>?").bind(event.channel,event.eventId,now).first();if(pending)return json({code:'MESSAGE_QUEUED'},503);}
  return channel==='sms'?new Response('<Response/>',{headers:{'Content-Type':'text/xml','Cache-Control':'no-store'}}):json({received:true});
 }catch(error){return json({code:error.status?error.code:'MESSAGE_UNAVAILABLE'},error.status||503);}
}

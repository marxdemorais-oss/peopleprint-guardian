// Explicit operator-only transport checks. They never call inference, accept
// arbitrary message text/recipients, or consume/change the original queued job.
import {authorisedOperator} from './operator-auth.js';
import {messageChannelEnabled,nativeMessagingReady} from './messaging-config.js';
import {messageRaw,sendProviderReply} from './messaging-providers.js';
import {resolvePeopleAccess} from './people-auth.js';
const PATH='/api/internal/admin/transport-test';
export const TRANSPORT_TEST_TEXT='This is a Wolfgang connection test. No AI assessment has been made. Your original message remains queued.';
const json=(body,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
const validId=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(value);
const ownerId=value=>typeof value==='string'&&/^([A-Za-z0-9_-]+|people:[A-Za-z0-9_-]+)$/.test(value)&&value.length<=200;
const fail=(code,status=409)=>Object.assign(new Error(code),{code,status});
async function eligibleJob(env,id,now){
 const job=await env.DB.prepare("SELECT * FROM guardian_message_jobs WHERE id=? AND owner_id=? AND channel IN ('email','x') AND state='queued' AND expires_at>? AND received_at>? AND received_at<=?").bind(id,env.GUARDIAN_TRANSPORT_TEST_OWNER_ID,now,now-86400000,now+300000).first();
 if(!job||messageChannelEnabled(env,job.channel)||!nativeMessagingReady(env,job.channel))return null;
 const linked=await env.DB.prepare('SELECT owner_id FROM guardian_channel_identities WHERE channel=? AND sender_id=?').bind(job.channel,job.sender_id).first();
 if(linked?.owner_id!==job.owner_id)return null;
 if(job.channel==='x'&&await env.DB.prepare('SELECT 1 AS stopped FROM guardian_x_sender_optouts WHERE sender_id=?').bind(job.sender_id).first())return null;
 if(job.channel==='email'&&await env.DB.prepare("SELECT 1 AS stopped FROM guardian_email_sender_optouts s WHERE sender_id=? AND NOT EXISTS (SELECT 1 FROM guardian_channel_identities i WHERE i.channel='email' AND i.sender_id=s.sender_id AND i.verified_at>s.stopped_at)").bind(job.sender_id).first())return null;
 return job;
}
function eventFor(job){
 let event;try{event=JSON.parse(job.payload_json);}catch{return null;}
 if(event?.channel!==job.channel||event.senderId!==job.sender_id||event.eventId!==job.event_id||event.senderVerified!==true)return null;
 // Construct a new transport envelope; forwarded text, reply-to headers and
 // customer-provided destinations never influence this fixed test response.
 return {channel:job.channel,eventId:job.event_id,senderId:job.sender_id,senderVerified:true,receivedAt:job.received_at,...(job.channel==='x'?{xAccountId:event.xAccountId,...(event.xTransport==='xchat'?{xTransport:'xchat',xConversationId:event.xConversationId,xChatEvents:event.xChatEvents,xReplyToEvent:event.xReplyToEvent}:{})}:{emailSubject:'Wolfgang connection test',emailMessageId:event.emailMessageId})};
}
export async function handleTransportTestRequest(request,env={},options={}){
 const url=new URL(request.url);if(url.pathname!==PATH)return null;
 if(!await authorisedOperator(request,env))return json({code:'NOT_AUTHORISED'},403);
 if(!['GET','POST'].includes(request.method))return json({code:'METHOD_NOT_ALLOWED'},405);
 if(!env.DB||env.GUARDIAN_TRANSPORT_TEST_ENABLED!=='true'||!ownerId(env.GUARDIAN_TRANSPORT_TEST_OWNER_ID))return json({code:'TRANSPORT_TEST_NOT_CONFIGURED'},503);
 const now=options.now??Date.now();let jobId;
 try{
  if(request.method==='GET'){
   if(url.searchParams.getAll('jobId').length!==1||[...url.searchParams.keys()].some(key=>key!=='jobId'))throw fail('INVALID_TRANSPORT_TEST',400);
   jobId=url.searchParams.get('jobId');
  }else{
   if(!request.headers.get('content-type')?.includes('application/json')||url.search)throw fail('INVALID_TRANSPORT_TEST',400);
   let body;try{body=JSON.parse(await messageRaw(request,1024));}catch{throw fail('INVALID_TRANSPORT_TEST',400);}
   if(!body||Array.isArray(body)||Object.keys(body).some(key=>!['jobId','confirmation'].includes(key))||body.confirmation!=='SEND_FIXED_TRANSPORT_TEST')throw fail('INVALID_TRANSPORT_TEST',400);
   jobId=body.jobId;
  }
  if(!validId(jobId))throw fail('INVALID_TRANSPORT_TEST',400);
  let prior=await env.DB.prepare('SELECT state,updated_at FROM guardian_transport_tests WHERE job_id=? AND owner_id=?').bind(jobId,env.GUARDIAN_TRANSPORT_TEST_OWNER_ID).first();
  if(prior?.state==='sending'&&prior.updated_at<now-60000){await env.DB.prepare("UPDATE guardian_transport_tests SET state='uncertain',last_error='DELIVERY_INTERRUPTED',updated_at=? WHERE job_id=? AND state='sending' AND updated_at<?").bind(now,jobId,now-60000).run();prior={...prior,state:'uncertain'};}
  if(request.method==='POST'&&prior)return json({jobId,state:prior.state,reused:true});
  const job=await eligibleJob(env,jobId,now),event=job?eventFor(job):null;
  if(request.method==='GET')return json({jobId,eligible:Boolean(job&&event&&!prior),state:prior?.state||null});
  if(!job||!event)throw fail('TRANSPORT_TEST_NOT_ALLOWED');
  if(job.owner_id.startsWith('people:')&&!await resolvePeopleAccess(job.owner_id,env,{fetcher:options.identityFetcher}))throw fail('TRANSPORT_TEST_NOT_ALLOWED');
  // The primary key and hourly quota are checked in one SQLite statement.
  const claimed=await env.DB.prepare("INSERT INTO guardian_transport_tests(job_id,owner_id,operator_id,state,created_at,updated_at) SELECT ?,?,?,'sending',?,? WHERE (SELECT COUNT(*) FROM (SELECT job_id FROM guardian_transport_tests WHERE owner_id=? AND created_at>? LIMIT 3))<3 ON CONFLICT(job_id) DO NOTHING RETURNING job_id").bind(jobId,job.owner_id,request.headers.get('x-guardian-operator'),now,now,job.owner_id,now-3600000).first();
  if(!claimed){const duplicate=await env.DB.prepare('SELECT state FROM guardian_transport_tests WHERE job_id=? AND owner_id=?').bind(jobId,job.owner_id).first();if(duplicate)return json({jobId,state:duplicate.state,reused:true});throw fail('TRANSPORT_TEST_LIMIT',429);}
  const beforeSend=async()=>{
   if(job.owner_id.startsWith('people:')&&!await resolvePeopleAccess(job.owner_id,env,{fetcher:options.identityFetcher}))throw fail('TRANSPORT_TEST_NOT_ALLOWED');
   const active=await env.DB.prepare("SELECT job_id FROM guardian_transport_tests WHERE job_id=? AND owner_id=? AND state='sending'").bind(jobId,job.owner_id).first();
   if(!active||!await eligibleJob(env,jobId,options.now??Date.now()))throw fail('TRANSPORT_TEST_NOT_ALLOWED');
  };
  try{
   const providerId=await sendProviderReply(event,TRANSPORT_TEST_TEXT,env,{fetcher:options.fetcher,idempotencyKey:'transport-test:'+jobId,expectedOwnerId:job.owner_id,now,beforeSend});
   await env.DB.prepare("UPDATE guardian_transport_tests SET state='sent',provider_message_id=?,updated_at=? WHERE job_id=? AND state='sending'").bind(providerId,now,jobId).run();
   return json({jobId,state:'sent',reused:false});
  }catch(error){
   const cancelled=['TRANSPORT_TEST_NOT_ALLOWED','X_CONNECTION_CHANGED','INVALID_RECIPIENT','CHANNEL_NOT_CONFIGURED'].includes(error.code),state=cancelled?'cancelled':'uncertain';
   // Even a definite throttle needs a new inbound test, never an implicit retry.
   await env.DB.prepare("UPDATE guardian_transport_tests SET state=?,last_error=?,updated_at=? WHERE job_id=? AND state='sending'").bind(state,cancelled?'TEST_CANCELLED':'DELIVERY_UNCERTAIN',now,jobId).run();
   return json({jobId,state,reused:false});
  }
 }catch(error){return json({code:error.status?error.code:'TRANSPORT_TEST_UNAVAILABLE'},error.status||503);}
}

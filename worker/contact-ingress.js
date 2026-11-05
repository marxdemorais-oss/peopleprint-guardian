import {officialResearchUrl} from '../web/assets/public-research-sources.js';
import {guestIdentity,guestInvitation,isGuestIdentity} from './guest-access.js';
import {handleProductRequest} from './product-service.js';
import {resolvePeopleAccess} from './people-auth.js';
import {contactOnboardingPaused} from './messaging-config.js';

// Internal, provider-independent ingress. A trusted gateway MUST first verify
// the actual platform webhook and sender before signing this envelope.
const CONTACT_CHANNELS=new Set(['email','whatsapp','sms','messenger','instagram','x']);
const MULTI_CONTACT_CHANNELS=new Set(['email','whatsapp']);
const MAX_CONTACT_IDENTITIES=3;
const CONTACT_HEADERS={'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff'};
const contactJson=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:CONTACT_HEADERS});
const contactError=(message,status=400,code='INVALID_CONTACT_EVENT')=>Object.assign(new Error(message),{status,code});
const encoder=new TextEncoder();
const hex=bytes=>Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');
const digest=async value=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
const contactConfigured=env=>typeof env.CONTACT_GATEWAY_SECRET==='string'&&env.CONTACT_GATEWAY_SECRET.length>=32;
const enabledChannel=(env,channel)=>CONTACT_CHANNELS.has(channel)&&String(env.CONTACT_CHANNELS||'').split(',').map(s=>s.trim()).includes(channel);

async function contactBody(request,limit=2*1024*1024){
  if(!request.headers.get('content-type')?.includes('application/json'))throw contactError('JSON is required.',415);
  if(Number(request.headers.get('content-length')||0)>limit)throw contactError('This event is too large.',413);
  const reader=request.body?.getReader();if(!reader)throw contactError('A body is required.');
  let size=0;const chunks=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw contactError('This event is too large.',413);}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return new TextDecoder('utf-8',{fatal:true}).decode(bytes);
}
function contactParse(text){let body;try{body=JSON.parse(text);}catch{throw contactError('Invalid event.');}if(!body||typeof body!=='object'||Array.isArray(body))throw contactError('Invalid event.');return body;}
async function verifyContactSignature(request,raw,secret,now){
  const timestamp=request.headers.get('x-wolfgang-timestamp')||'',signature=request.headers.get('x-wolfgang-signature')||'';
  if(!/^\d{10}$/.test(timestamp)||Math.abs(now/1000-Number(timestamp))>300||!/^sha256=[a-f0-9]{64}$/.test(signature))return false;
  const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  const bytes=Uint8Array.from(signature.slice(7).match(/../g),pair=>parseInt(pair,16));
  return crypto.subtle.verify('HMAC',key,bytes,encoder.encode(timestamp+'.'+raw));
}
async function contactQuota(db,key,ownerId,limit,now){
  const bucket=Math.floor(now/60000),row=await db.prepare('INSERT INTO guardian_rate_limits (bucket_key,owner_id,count,expires_at) VALUES (?,?,1,?) ON CONFLICT(bucket_key) DO UPDATE SET count=count+1 RETURNING count').bind('contact:'+key+':'+bucket,ownerId,(bucket+2)*60000).first();
  if(Number(row?.count)>limit)throw contactError('Please try again shortly.',429,'CONTACT_LIMIT');
}
function contactInternalRequest(origin,path,body){return new Request(origin+path,{method:body===undefined?'GET':'POST',headers:{origin,'content-type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});}
function contactReply(event,check,guest=false){
  const assessment=check?.result;
  const invite=guest?'\n\n'+guestInvitation+' https://guardian.peopleorganised.com/signup?return_to=%2Fconnections':'';
  const reputation=assessment?.linkReputation;
  const checks=Array.isArray(reputation?.checks)?reputation.checks.slice(0,2):[];
  // Messaging has no expandable evidence panel. Include each trusted provider's
  // finding here too, without making a neutral result cancel the other warning.
  const findings=checks.filter(check=>['Google Web Risk','VirusTotal'].includes(check?.provider)).map(check=>check.provider+': '+check.note+(check.advisory&&!check.note?.includes(check.advisory)?' '+check.advisory:''));
  if(!checks.length&&reputation?.provider==='Google Web Risk'&&reputation.status==='flagged'&&!assessment.explanation.includes(reputation.advisory))findings.push('Google Web Risk reported a potential threat at the time of this check. '+reputation.advisory);
  const research=assessment?.publicResearch;
  const source=research?.status==='published'&&officialResearchUrl(research.publisher,research.url);
  if(source)findings.push('Published guidance: “'+research.quote+'” '+source);
  return {accepted:true,status:check?.status||'received',checkId:check?.id||null,reply:{channel:event.channel,senderId:event.senderId,text:(assessment?[assessment.headline,assessment.explanation,assessment.nextStep,...findings,...(assessment.questions||[])].filter(Boolean).join('\n\n'):'Your message is saved with Wolfgang. Analysis is not available yet, so no assessment has been made.')+invite}};
}

export async function handleContactRequest(request,env={},identity={},options={}){
  const url=new URL(request.url),path=url.pathname;
  if(!['/api/contact-events','/api/contact-link'].includes(path))return null;
  const manageExisting=path==='/api/contact-link'&&['GET','DELETE'].includes(request.method);
  if(!env.DB||(!manageExisting&&!contactConfigured(env)))return contactJson({code:'CONTACT_NOT_CONNECTED',message:'Wolfgang’s shared contact is not available yet.'},503);
  const db=env.DB,now=options.now??Date.now();
  try{
    if(path==='/api/contact-link'){
      if(!identity.ownerId)return contactJson({code:'SIGN_IN_REQUIRED',message:'Sign in to manage your contacts.'},401);
      if(request.method==='GET'){
        const rows=await db.prepare('SELECT channel,sender_id,verified_at FROM guardian_channel_identities WHERE owner_id=? ORDER BY verified_at,sender_id').bind(identity.ownerId).all();
        return contactJson({identities:rows.results.map(row=>({channel:row.channel,senderId:row.sender_id,verifiedAt:row.verified_at})),maxPerChannel:MAX_CONTACT_IDENTITIES});
      }
      if(request.headers.get('origin')!==url.origin)throw contactError('This request could not be accepted.',403);
      if(!['POST','DELETE'].includes(request.method))return contactJson({code:'METHOD_NOT_ALLOWED'},405);
      const body=contactParse(await contactBody(request,2000));
      if(!CONTACT_CHANNELS.has(body.channel))throw contactError('Choose a supported channel.');
      if(request.method==='DELETE'){
        if(body.senderId!==undefined){
          if(!MULTI_CONTACT_CHANNELS.has(body.channel)||typeof body.senderId!=='string'||!body.senderId||body.senderId.length>320)throw contactError('Choose a linked address or number.');
          const owned=await db.prepare('SELECT 1 AS linked FROM guardian_channel_identities WHERE owner_id=? AND channel=? AND sender_id=?').bind(identity.ownerId,body.channel,body.senderId).first();
          if(!owned)throw contactError('This address or number is not linked to your account.',404,'CONTACT_NOT_FOUND');
          await db.batch([
            // This cutoff invalidates in-flight link codes without disconnecting
            // the other identities. Existing linked senders remain usable.
            db.prepare('INSERT INTO guardian_channel_preferences(owner_id,channel,stopped_at) VALUES (?,?,?) ON CONFLICT(owner_id,channel) DO UPDATE SET stopped_at=MAX(stopped_at,excluded.stopped_at)').bind(identity.ownerId,body.channel,now),
            ...(body.channel==='email'?[db.prepare("INSERT INTO guardian_email_sender_optouts(sender_id,stopped_at) SELECT sender_id,? FROM guardian_channel_identities WHERE owner_id=? AND channel='email' AND sender_id=? ON CONFLICT(sender_id) DO UPDATE SET stopped_at=MAX(stopped_at,excluded.stopped_at)").bind(now,identity.ownerId,body.senderId)]:[]),
            db.prepare("UPDATE guardian_message_jobs SET state='cancelled',payload_json='{}',reply_text=NULL WHERE channel=? AND sender_id=? AND state NOT IN ('completed','expired','cancelled') AND (owner_id=? OR (owner_id IS NULL AND EXISTS (SELECT 1 FROM guardian_channel_identities i WHERE i.owner_id=? AND i.channel=guardian_message_jobs.channel AND i.sender_id=guardian_message_jobs.sender_id)))").bind(body.channel,body.senderId,identity.ownerId,identity.ownerId),
            db.prepare('DELETE FROM guardian_channel_identities WHERE owner_id=? AND channel=? AND sender_id=?').bind(identity.ownerId,body.channel,body.senderId),
            db.prepare('DELETE FROM guardian_contact_links WHERE owner_id=? AND channel=?').bind(identity.ownerId,body.channel)
          ]);
          return contactJson({disconnected:true,savedInformationRetained:true});
        }
        await db.batch([
          ...(body.channel==='x'?[db.prepare("INSERT INTO guardian_x_sender_optouts(sender_id,stopped_at) SELECT sender_id,? FROM guardian_channel_identities WHERE channel='x' AND owner_id=? ON CONFLICT(sender_id) DO UPDATE SET stopped_at=MAX(stopped_at,excluded.stopped_at)").bind(now,identity.ownerId)]:[]),
          db.prepare('INSERT INTO guardian_channel_preferences(owner_id,channel,stopped_at) VALUES (?,?,?) ON CONFLICT(owner_id,channel) DO UPDATE SET stopped_at=MAX(stopped_at,excluded.stopped_at)').bind(identity.ownerId,body.channel,now),
          db.prepare("UPDATE guardian_message_jobs SET state='cancelled',payload_json='{}',reply_text=NULL WHERE channel=? AND state NOT IN ('completed','expired','cancelled') AND (owner_id=? OR (owner_id IS NULL AND EXISTS (SELECT 1 FROM guardian_channel_identities i WHERE i.owner_id=? AND i.channel=guardian_message_jobs.channel AND i.sender_id=guardian_message_jobs.sender_id)))").bind(body.channel,identity.ownerId,identity.ownerId),
          db.prepare('DELETE FROM guardian_channel_identities WHERE owner_id=? AND channel=?').bind(identity.ownerId,body.channel),
          db.prepare('DELETE FROM guardian_contact_links WHERE owner_id=? AND channel=?').bind(identity.ownerId,body.channel)
        ]);
        return contactJson({disconnected:true,savedInformationRetained:true});
      }
      if(contactOnboardingPaused(body.channel))throw contactError('New connections are paused for this channel.',403,'ONBOARDING_PAUSED');
      if(!enabledChannel(env,body.channel))return contactJson({code:'CHANNEL_NOT_CONNECTED',message:'This contact route is not available yet.'},503);
      if(MULTI_CONTACT_CHANNELS.has(body.channel)){
        const count=await db.prepare('SELECT COUNT(*) AS n FROM guardian_channel_identities WHERE owner_id=? AND channel=?').bind(identity.ownerId,body.channel).first();
        if(count.n>=MAX_CONTACT_IDENTITIES)throw contactError('You can link up to three email addresses and three WhatsApp numbers. Remove one before adding another.',409,'CONTACT_IDENTITY_LIMIT');
      }
      await contactQuota(db,'link:'+identity.ownerId,identity.ownerId,6,now);
      const profileResponse=await handleProductRequest(contactInternalRequest(url.origin,'/api/profile'),env,identity);
      if(!profileResponse.ok)return profileResponse;
      const random=crypto.getRandomValues(new Uint8Array(16)),code='WG-'+hex(random).toUpperCase(),hash=await digest(code),expires=now+10*60*1000;
      await db.batch([
        db.prepare('DELETE FROM guardian_contact_links WHERE expires_at<=? OR (owner_id=? AND channel=?)').bind(now,identity.ownerId,body.channel),
        db.prepare('INSERT INTO guardian_contact_links (id,owner_id,channel,code_hash,created_at,expires_at) VALUES (?,?,?,?,?,?)').bind(crypto.randomUUID(),identity.ownerId,body.channel,hash,now,expires)
      ]);
      return contactJson({channel:body.channel,code,expiresAt:new Date(expires).toISOString(),instruction:'Send this code to Wolfgang from the account you want to link.'},201);
    }
    if(request.method!=='POST')return contactJson({code:'METHOD_NOT_ALLOWED'},405);
    const raw=await contactBody(request);
    if(!await verifyContactSignature(request,raw,env.CONTACT_GATEWAY_SECRET,now))return contactJson({code:'INVALID_SIGNATURE',message:'Event authentication failed.'},401);
    const event=contactParse(raw);
    if(!enabledChannel(env,event.channel))throw contactError('This channel is not enabled.',503,'CHANNEL_NOT_CONNECTED');
    if(typeof event.eventId!=='string'||!event.eventId||event.eventId.length>160||typeof event.senderId!=='string'||!event.senderId||event.senderId.length>320||event.senderVerified!==true)throw contactError('A verified transport identity and event identifier are required.');
    // Ignore user IDs, reply-to addresses and quoted senders in payload content.
    const senderKey=await digest(event.channel+'\0'+event.senderId);
    await contactQuota(db,'sender:'+senderKey,'ingress:'+senderKey,20,now);
    if(event.linkCode!==undefined){
      if(contactOnboardingPaused(event.channel))throw contactError('New connections are paused for this channel.',403,'ONBOARDING_PAUSED');
      const prior=await db.prepare('SELECT owner_id,status FROM guardian_ingress_events WHERE channel=? AND event_id=?').bind(event.channel,event.eventId).first();
      if(prior){const current=await db.prepare('SELECT owner_id FROM guardian_channel_identities WHERE channel=? AND sender_id=?').bind(event.channel,event.senderId).first();if(prior.status!=='linked'||current?.owner_id!==prior.owner_id)throw contactError('This event cannot be accepted.',409,'EVENT_CONFLICT');return contactJson({accepted:true,status:'linked',duplicate:true,reply:{channel:event.channel,senderId:event.senderId,text:'You’re connected to Wolfgang.'}});}
      if(typeof event.linkCode!=='string'||!/^WG-[A-F0-9]{32}$/.test(event.linkCode))throw contactError('This link code is invalid or expired.',400,'LINK_INVALID');
      const hash=await digest(event.linkCode);
      // Atomic delete-return makes a code single use even for concurrent events.
      const link=await db.prepare('DELETE FROM guardian_contact_links WHERE code_hash=? AND channel=? AND expires_at>? RETURNING owner_id,created_at').bind(hash,event.channel,now).first();
      if(!link)throw contactError('This link code is invalid or expired.',400,'LINK_INVALID');
      const profile=await db.prepare('SELECT owner_id FROM guardian_profiles WHERE owner_id=?').bind(link.owner_id).first();
      if(!profile)throw contactError('This link code is invalid or expired.',400,'LINK_INVALID');
      if(event.channel==='x'){
        // A link already in flight cannot undo a later STOP. A fresh code
        // issued after STOP is the explicit authority for reconnection.
        const guard=options.xLinkGuard;
        if(guard&&(guard.ownerId!==link.owner_id||typeof guard.accountId!=='string'||!Number.isSafeInteger(guard.generation)))throw contactError('This connection changed.',409,'CONNECTION_CHANGED');
        const serviceGuard=guard?" AND EXISTS (SELECT 1 FROM guardian_x_service_account WHERE id='wolfgang' AND status='connected' AND encrypted_token IS NOT NULL AND account_id=? AND generation=?) AND NOT EXISTS (SELECT 1 FROM guardian_contact_links WHERE owner_id=? AND channel='x' AND created_at>=?)":'';
        await db.batch([
          db.prepare("INSERT INTO guardian_channel_identities(channel,sender_id,owner_id,verified_at) SELECT 'x',?,?,? WHERE NOT EXISTS (SELECT 1 FROM guardian_x_sender_optouts WHERE sender_id=? AND stopped_at>=?) AND NOT EXISTS (SELECT 1 FROM guardian_channel_preferences WHERE owner_id=? AND channel='x' AND stopped_at>=?)"+serviceGuard+" ON CONFLICT(channel,sender_id) DO NOTHING").bind(event.senderId,link.owner_id,now,event.senderId,link.created_at,link.owner_id,link.created_at,...(guard?[guard.accountId,guard.generation,link.owner_id,link.created_at]:[])),
          db.prepare("DELETE FROM guardian_x_sender_optouts WHERE sender_id=? AND stopped_at<? AND EXISTS (SELECT 1 FROM guardian_channel_identities WHERE channel='x' AND sender_id=? AND owner_id=?)").bind(event.senderId,link.created_at,event.senderId,link.owner_id)
        ]);
      }else {
        // Keeping the cutoff also prevents a later visit from silently re-linking a sign-in email.
        const emailGuard = event.channel==='email' ? ' AND NOT EXISTS (SELECT 1 FROM guardian_email_sender_optouts WHERE sender_id=? AND stopped_at>=?)' : '';
        const limitGuard = MULTI_CONTACT_CHANNELS.has(event.channel) ? ' AND (SELECT COUNT(*) FROM guardian_channel_identities WHERE owner_id=? AND channel=?)<?' : '';
        await db.prepare('INSERT INTO guardian_channel_identities (channel,sender_id,owner_id,verified_at) SELECT ?,?,?,? WHERE NOT EXISTS (SELECT 1 FROM guardian_channel_preferences WHERE owner_id=? AND channel=? AND stopped_at>=?)'+emailGuard+limitGuard+' ON CONFLICT(channel,sender_id) DO NOTHING')
          .bind(event.channel,event.senderId,link.owner_id,now,link.owner_id,event.channel,link.created_at,...(event.channel==='email'?[event.senderId,link.created_at]:[]),...(MULTI_CONTACT_CHANNELS.has(event.channel)?[link.owner_id,event.channel,MAX_CONTACT_IDENTITIES]:[])).run();
      }
      const actual=await db.prepare('SELECT owner_id FROM guardian_channel_identities WHERE channel=? AND sender_id=?').bind(event.channel,event.senderId).first();
      if(!actual)throw contactError('This connection changed. Get a new linking code to reconnect.',409,'CONNECTION_CHANGED');
      if(actual?.owner_id!==link.owner_id)throw contactError('This contact cannot be linked. Disconnect it from its existing Guardian account first.',409,'CONTACT_ALREADY_LINKED');
      await db.prepare('INSERT INTO guardian_ingress_events (channel,event_id,owner_id,check_id,status,created_at) VALUES (?,?,?,NULL,?,?) ON CONFLICT(channel,event_id) DO NOTHING').bind(event.channel,event.eventId,link.owner_id,'linked',now).run();
      return contactJson({accepted:true,status:'linked',reply:{channel:event.channel,senderId:event.senderId,text:'You’re connected to Wolfgang. Send the message or request you’d like to check.'}});
    }
    if(typeof event.text!=='string'||!event.text.trim())throw contactError('Provide readable message text.');
    const linked=await db.prepare('SELECT owner_id FROM guardian_channel_identities WHERE channel=? AND sender_id=?').bind(event.channel,event.senderId).first();
    if(!linked&&contactOnboardingPaused(event.channel))return contactJson({accepted:false,status:'onboarding_paused'});
    const guest=linked?null:await guestIdentity(env,event.channel,event.senderId);
    if(!linked&&!guest)return contactJson({accepted:false,status:'needs_link',reply:{channel:event.channel,senderId:event.senderId,text:'Please link this contact in your Guardian account before sending private material.'}});
    const ownerId=linked?.owner_id||guest.ownerId;
    const contactIdentity=guest|| (ownerId.startsWith('people:')?await resolvePeopleAccess(ownerId,env,{fetcher:options.identityFetcher}):{ownerId});
    if(!contactIdentity)throw contactError('This account is not available. Sign in to check its status.',403,'ACCOUNT_UNAVAILABLE');
    const existing=await db.prepare('SELECT owner_id,check_id,status FROM guardian_ingress_events WHERE channel=? AND event_id=?').bind(event.channel,event.eventId).first();
    if(existing&&(existing.owner_id!==ownerId||existing.status==='linked'))throw contactError('This event cannot be accepted.',409,'EVENT_CONFLICT');
    if(existing?.check_id&&event.replyToEventId===undefined){
      const expected='check_'+await digest(ownerId+'\0'+event.channel+'\0'+event.eventId);
      if(existing.check_id!==expected)throw contactError('This event cannot be accepted.',409,'EVENT_CONFLICT');
      const response=await handleProductRequest(contactInternalRequest(url.origin,'/api/checks/'+existing.check_id),env,contactIdentity);
      if(!response.ok)return contactJson({accepted:true,status:'expired',duplicate:true});
      const {check}=await response.json();
      if(check.status==='complete'&&check.result)return contactJson({...contactReply(event,check,isGuestIdentity(contactIdentity)),duplicate:true});
      // A durable ingress claim is not proof that analysis finished. Resume a
      // draft/error after a worker interruption through the same trial claim.
      const assessed=await handleProductRequest(contactInternalRequest(url.origin,'/api/checks/'+existing.check_id+'/assess',{}),env,contactIdentity,options),result=await assessed.json();
      await db.prepare('UPDATE guardian_ingress_events SET status=? WHERE channel=? AND event_id=? AND owner_id=?').bind(result.check?.status||'error',event.channel,event.eventId,ownerId).run();
      if(!assessed.ok&&result.code!=='ANALYSIS_NOT_CONNECTED')return contactJson({code:result.code,message:result.message},assessed.status);
      return contactJson({...contactReply(event,result.check||check,isGuestIdentity(contactIdentity)),duplicate:true});
    }
    if(event.replyToEventId!==undefined){
      if(typeof event.replyToEventId!=='string'||event.replyToEventId.length>160)throw contactError('The reply could not be matched to its original message.',400,'INVALID_REPLY');
      const parent=await db.prepare('SELECT check_id FROM guardian_ingress_events WHERE channel=? AND event_id=? AND owner_id=? AND check_id IS NOT NULL').bind(event.channel,event.replyToEventId,ownerId).first();
      if(!parent)throw contactError('The original check is not available. Open your workspace to continue.',404,'CHECK_NOT_FOUND');
      if(existing&&existing.check_id!==parent.check_id)throw contactError('This event cannot be accepted.',409,'EVENT_CONFLICT');
      await db.prepare("INSERT INTO guardian_ingress_events (channel,event_id,owner_id,check_id,status,created_at) VALUES (?,?,?,?,'processing',?) ON CONFLICT(channel,event_id) DO NOTHING").bind(event.channel,event.eventId,ownerId,parent.check_id,now).run();
      // The server-only reply ID makes append + assessment recoverable even if
      // the worker stops after the append or before recording its result.
      const replyId='reply_'+await digest(ownerId+'\0'+event.channel+'\0'+event.eventId);
      const response=await handleProductRequest(contactInternalRequest(url.origin,'/api/checks/'+parent.check_id+'/replies',{message:event.text}),env,contactIdentity,{...options,replyId}),result=await response.json();
      await db.prepare('UPDATE guardian_ingress_events SET status=? WHERE channel=? AND event_id=? AND owner_id=?').bind(result.check?.status||'error',event.channel,event.eventId,ownerId).run();
      if(!response.ok&&result.code!=='ANALYSIS_NOT_CONNECTED')return contactJson({code:result.code,message:result.message},response.status);
      return contactJson(contactReply(event,result.check,isGuestIdentity(contactIdentity)));
    }
    const checkId='check_'+await digest(ownerId+'\0'+event.channel+'\0'+event.eventId);
    await db.prepare('INSERT INTO guardian_ingress_events (channel,event_id,owner_id,check_id,status,created_at) VALUES (?,?,?,NULL,?,?) ON CONFLICT(channel,event_id) DO NOTHING').bind(event.channel,event.eventId,ownerId,'received',now).run();
    const response=await handleProductRequest(contactInternalRequest(url.origin,'/api/checks',{message:event.text,channel:event.channel==='email'?'email':['instagram','messenger','x'].includes(event.channel)?'social':'message',evidence:event.evidence||[]}),env,contactIdentity,{...options,checkId,sourceProvider:event.channel});
    const created=await response.json();if(!response.ok)return contactJson({code:created.code||'CONTACT_CHECK_UNAVAILABLE',message:created.message||'This message could not be saved.'},response.status);
    const claim=await db.prepare("UPDATE guardian_ingress_events SET check_id=?,status='processing' WHERE channel=? AND event_id=? AND owner_id=? AND status='received'").bind(created.check.id,event.channel,event.eventId,ownerId).run();
    if(!claim.meta?.changes)return contactJson({code:'CHECK_IN_PROGRESS',message:'Wolfgang is already checking this case. Please wait for the result.'},503);
    const assessed=await handleProductRequest(contactInternalRequest(url.origin,'/api/checks/'+created.check.id+'/assess',{}),env,contactIdentity,options);
    const result=await assessed.json();
    await db.prepare('UPDATE guardian_ingress_events SET status=? WHERE channel=? AND event_id=? AND owner_id=?').bind(result.check?.status||'error',event.channel,event.eventId,ownerId).run();
    if(!assessed.ok&&result.code!=='ANALYSIS_NOT_CONNECTED')return contactJson({code:result.code,message:result.message},assessed.status);
    return contactJson(contactReply(event,result.check||created.check,isGuestIdentity(contactIdentity)));
  }catch(error){return contactJson({code:error.code||'CONTACT_UNAVAILABLE',message:error.status?error.message:'This contact request could not be completed.'},error.status||503);}
}

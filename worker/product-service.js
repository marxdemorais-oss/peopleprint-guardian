import {createInspection,readInspection} from './check-inspector.js';
import {contactsFromConversation} from './sender-comparison.js';
import {ukDirectorySource} from '../web/assets/uk-directory.js';
import {verificationSource} from '../web/assets/organisation-directory.js';
import {organisationReferenceLink} from '../web/assets/organisation-reference.js';
import {publishers,officialResearchUrl} from '../web/assets/public-research-sources.js';
import {isKnownContact,isCompanyLookup} from '../web/assets/known-contact.js';
import {researchPublicClaim,selectPublicClaim} from './public-claim-research.js';
import {verifyIdentityEvidence} from './identity-verification.js';
import {caseScope} from './case-scope.js';
import {currentGuide,sharedWolfgangGuidance} from './wolfgang-guide.js';
import {customerStyle,styleDescription,styleRequest} from './wolfgang-style.js';
import {readLiveWarnings,verifyMailOrigin,attachVerifiedMailReceipts} from './live-warnings.js';
import {isGuestIdentity,guestEnabled} from './guest-access.js';
import {CONTRACT_VERSION,validateInvestigation,validateAssessment} from '../web/assets/guardian-contract.js';
import {readOfficialGuidance} from './official-guidance.js';
import {guidanceSources} from '../web/assets/official-guidance.js';
import {turnObservations,groundAssessment,selectedImageExcerpts} from './message-first-look.js';
import {checkLinkReputation,reputationEvidence} from './url-reputation.js';
import {WOLFGANG_INSTRUCTIONS} from './guardian-service.js';
import {createAnalysisProvider,publicAnalysisSettings} from './model-provider.js';
import {disconnectAllOwnedConnections} from './connections.js';
import {getTrialState,reserveTrialCheck,trialCommitStatement,releaseTrialCheck,checkWasCharged,hasUnlimitedGuardianAccess,canonicalPaidMonthly} from './trial-service.js';
import {syncContextRecords,backfillContextRecords,retrieveContext,contextCommitGuard,contextLinkStatements,CONTEXT_INSTRUCTIONS} from './context-memory.js';

const PRODUCT_HEADERS={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const productJson=(value,status=200)=>new Response(JSON.stringify(value),{status,headers:PRODUCT_HEADERS});
const productError=(message,status=400,code='INVALID_REQUEST')=>Object.assign(new Error(message),{status,code});
const PRODUCT_DAY=24*60*60*1000;
const productId=prefix=>prefix+crypto.randomUUID();
const productNow=()=>new Date().toISOString();
const productPath=path=>['/api/profile','/api/entitlements','/api/checks','/api/live-warnings','/api/live-warnings/activation','/api/product-config','/api/privacy','/api/context/preview'].includes(path)||/^\/api\/checks\/[^/]+(?:\/(?:assess|replies|inspection|events))?$/.test(path);

async function productReadJson(request,limit=2*1024*1024){
  if(!request.headers.get('content-type')?.includes('application/json'))throw productError('Please send JSON.',415);
  if(Number(request.headers.get('content-length')||0)>limit)throw productError('This request is too large.',413);
  const reader=request.body?.getReader();if(!reader)throw productError('A request body is required.');
  const chunks=[];let total=0;
  while(true){const {done,value}=await reader.read();if(done)break;total+=value.byteLength;if(total>limit){await reader.cancel();throw productError('This request is too large.',413);}chunks.push(value);}
  const bytes=new Uint8Array(total);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  let value;try{value=JSON.parse(new TextDecoder().decode(bytes));}catch{throw productError('This request could not be read.');}
  if(!value||typeof value!=='object'||Array.isArray(value))throw productError('Provide an object.');
  return value;
}

function productProfile(row){return {communicationStyle:styleDescription(JSON.parse(row.conversation_style||'{}')),id:row.id,displayName:row.display_name,email:row.email,connectionsIntroduced:Boolean(row.connections_intro_at),onboardingComplete:Boolean(row.onboarding_complete),profileComplete:Boolean(row.profile_completed_at),memoryEnabled:Boolean(row.memory_enabled)};}
// Resolve links on the server at read time, so older checks keep their citations
// without sending the reference directory itself to the customer.
export function attachCaseReferences(result){
  if(!result)return result;
  const rows=result.identityVerification?.rows;
  for(const row of Array.isArray(rows)?rows.slice(0,45):[]){
    if(!row||typeof row!=='object')continue;
    row.caseSource=verificationSource(row.sourceId)||organisationReferenceLink(row)||ukDirectorySource(row.sourceId);
  }
  const research=result.publicResearch;
  if(research&&typeof research==='object'){
    research.caseSource=Object.hasOwn(publishers,research.publisher)
      ?{name:publishers[research.publisher].name,url:officialResearchUrl(research.publisher,research.url)}
      :null;
  }
  return result;
}
function productCheck(row){
  const selected=JSON.parse(row.evidence_json),replies=JSON.parse(row.replies_json);
  // Reads, drafts, quota errors and privacy exports return only stored results.
  // Computing a new first look here would bypass assessment admission.
  return {id:row.id,message:row.message,channel:row.channel,evidence:selected,contextEvidence:JSON.parse(row.context_evidence_json||'[]'),preferences:JSON.parse(row.preferences_json),status:row.status,result:row.result_json?attachCaseReferences(JSON.parse(row.result_json)):null,replies,remember:Boolean(row.remember),createdAt:row.created_at,updatedAt:row.updated_at,expiresAt:row.expires_at||null};
}
export async function productGetProfile(db,identity){
  const {ownerId,email,name}=identity;
  if(isGuestIdentity(identity))return {id:null,owner_id:ownerId,email:'',display_name:'',onboarding_complete:0,memory_enabled:0,profile_completed_at:null};
  const displayName=String(name||'').trim().slice(0,60),now=productNow();
  await db.prepare("INSERT INTO guardian_profiles (owner_id,id,email,display_name,onboarding_complete,memory_enabled,created_at,updated_at) VALUES (?,?,?,?,0,1,?,?) ON CONFLICT(owner_id) DO UPDATE SET email=CASE WHEN excluded.email<>'' THEN excluded.email ELSE guardian_profiles.email END").bind(ownerId,productId('gp_'),String(email||''),displayName,now,now).run();
  return db.prepare('SELECT * FROM guardian_profiles WHERE owner_id=?').bind(ownerId).first();
}
async function productGetCheck(db,ownerId,id){
  const row=await db.prepare('SELECT * FROM guardian_checks WHERE owner_id=? AND id=? AND (length(expires_at)=0 OR expires_at>?)').bind(ownerId,id,productNow()).first();
  if(!row)throw productError('This check was not found or has expired.',404,'CHECK_NOT_FOUND');
  return row;
}

// Reads exclude expired records immediately. Bounded cleanup runs during normal
// use and can also be invoked by a scheduled Worker to remove dormant records.
export async function cleanupExpiredChecks(env,now=Date.now()){
  if(!env.DB)return;
  const iso=new Date(now).toISOString();
  await env.DB.batch([
    env.DB.prepare('DELETE FROM guardian_trial_usage WHERE consumed_at IS NULL AND check_id IN (SELECT id FROM guardian_checks WHERE length(expires_at)>0 AND expires_at<=? LIMIT 500)').bind(iso),
    env.DB.prepare('DELETE FROM guardian_checks WHERE id IN (SELECT id FROM guardian_checks WHERE length(expires_at)>0 AND expires_at<=? LIMIT 500)').bind(iso),
    env.DB.prepare('DELETE FROM guardian_rate_limits WHERE expires_at<=?').bind(now),
    env.DB.prepare('DELETE FROM guardian_oauth_states WHERE expires_at<=?').bind(now),
    env.DB.prepare('DELETE FROM guardian_contact_links WHERE expires_at<=?').bind(now),
    env.DB.prepare('DELETE FROM guardian_ingress_events WHERE rowid IN (SELECT rowid FROM guardian_ingress_events WHERE created_at<? OR (check_id IS NOT NULL AND created_at<? AND NOT EXISTS (SELECT 1 FROM guardian_checks WHERE guardian_checks.id=guardian_ingress_events.check_id AND guardian_checks.owner_id=guardian_ingress_events.owner_id)) LIMIT 500)').bind(now-30*PRODUCT_DAY,now-PRODUCT_DAY)
    ,env.DB.prepare('DELETE FROM guardian_context_records WHERE id IN (SELECT id FROM guardian_context_records WHERE length(expires_at)>0 AND expires_at<=? LIMIT 500)').bind(iso)
    ,env.DB.prepare('DELETE FROM guardian_context_links WHERE rowid IN (SELECT rowid FROM guardian_context_links WHERE length(expires_at)>0 AND expires_at<=? LIMIT 500)').bind(iso)
    ,env.DB.prepare('DELETE FROM guardian_analysis_usage WHERE id IN (SELECT id FROM guardian_analysis_usage WHERE created_at<? LIMIT 500)').bind(new Date(now-365*PRODUCT_DAY).toISOString())
  ]);
}

async function productTakeQuota(db,ownerId,{unlimited=false,jury=false}={}){
  if(jury)return;
  const now=Date.now(),minute=Math.floor(now/60000),day=Math.floor(now/PRODUCT_DAY);
  // Atomic counters apply across Worker isolates. Counters contain no content.
  const counts=await db.batch([
    db.prepare('INSERT INTO guardian_rate_limits (bucket_key,owner_id,count,expires_at) VALUES (?,?,1,?) ON CONFLICT(bucket_key) DO UPDATE SET count=count+1 RETURNING count').bind(ownerId+':minute:'+minute,ownerId,(minute+2)*60000),
    db.prepare('INSERT INTO guardian_rate_limits (bucket_key,owner_id,count,expires_at) VALUES (?,?,1,?) ON CONFLICT(bucket_key) DO UPDATE SET count=count+1 RETURNING count').bind(ownerId+':day:'+day,ownerId,(day+2)*PRODUCT_DAY)
  ]);
  if(Number(counts[0].results?.[0]?.count)>6||(!unlimited&&Number(counts[1].results?.[0]?.count)>40))throw productError('Please pause before another check. Your material is saved.',429,'CHECK_LIMIT');
}

async function takeGuestModelBudget(db){
  const day=Math.floor(Date.now()/86400000);
  const budget=await db.prepare("INSERT INTO guardian_rate_limits(bucket_key,owner_id,count,expires_at) VALUES (?,'guest-budget',1,?) ON CONFLICT(bucket_key) DO UPDATE SET count=count+1 WHERE count<100 RETURNING count").bind('guest-model:'+day,(day+2)*86400000).first();
  if(!budget)throw productError('Guest checks are busy today. Please try again tomorrow.',429,'GUEST_DAILY_LIMIT');
}

async function logProviderUsage(db,row,usage,outcome){
  const measuredAt=productNow();
  try{await db.prepare('INSERT INTO guardian_analysis_usage(id,owner_id,check_id,provider,model,input_tokens,output_tokens,outcome,created_at) SELECT ?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM guardian_checks WHERE owner_id=? AND id=? AND (length(expires_at)=0 OR expires_at>?))').bind(productId('usage_'),row.owner_id,row.id,usage.provider,usage.model,usage.inputTokens,usage.outputTokens,outcome,measuredAt,row.owner_id,row.id,measuredAt).run();}catch{}
}

async function requireSameCase(row,proposed,env,access,request,options){
  const inspect=createInspection(env,row.owner_id,row.id);
  await inspect('scope_started',{summary:'Checking how this follow-up relates to the original conversation.',proposed});
  let usage;
  const scope=await caseScope(row,proposed,env,{
    fetcher:options.fetcher,signal:request.signal,
    admit:async()=>{
      await productTakeQuota(env.DB,row.owner_id,access);
      if(access.guest)await takeGuestModelBudget(env.DB);
    },
    onUsage:value=>{usage=value;},
    onEvent:(kind,detail)=>inspect(kind,{...detail,purpose:'follow_up_scope'})
  });
  await inspect('scope_decided',{summary:scope==='same'?'The follow-up belongs to this conversation.':scope==='unavailable'?'The relationship could not be checked.':scope==='unclear'?'More context is needed to connect this follow-up.':'The follow-up describes another incident.',scope,usage:usage||null});
  if(usage)await logProviderUsage(env.DB,row,usage,scope==='unavailable'?'scope_error':'scope_decided');
  if(scope==='same')return;
  if(scope==='unavailable')throw productError('Wolfgang couldn’t check how this relates to your case. Your previous result is still available. Please retry.',503,'CASE_SCOPE_UNAVAILABLE');
  if(scope==='unclear')throw productError('How does this relate to the original request? Add that detail, or start a new check for another incident.',409,'CASE_SCOPE_UNCLEAR');
  throw productError('This looks like a separate incident. Start a new check for it. Your original case is still here.',409,'NEW_CHECK_REQUIRED');
}

function productPrivacyExport(db,ownerId,profile){
  const at=productNow(),encoder=new TextEncoder();
  // Keyset pagination holds at most twenty rows in memory. The same bounded
  // stream covers message metadata as well as potentially large saved records.
  const phases=[
    {name:'checks',sql:'SELECT rowid AS export_rowid,* FROM guardian_checks WHERE owner_id=? AND rowid>? AND (length(expires_at)=0 OR expires_at>?) AND created_at<=? ORDER BY rowid LIMIT 20',extra:[at,at],map:productCheck},
    {name:'connections',sql:'SELECT rowid AS export_rowid,provider,status,display_label,connected_at,updated_at FROM guardian_connections WHERE owner_id=? AND rowid>? ORDER BY rowid LIMIT 20'},
    {name:'monitoredSources',sql:'SELECT rowid AS export_rowid,provider,started_at,last_success FROM guardian_watches WHERE owner_id=? AND rowid>? ORDER BY rowid LIMIT 20'},
    {name:'attentionItems',sql:'SELECT rowid AS export_rowid,provider,subject,sender,excerpt,reason,action,earlier_check,earlier_title,earlier_detail,received_at,detected_at,expires_at FROM guardian_watch_items WHERE owner_id=? AND rowid>? AND dismissed=0 AND expires_at>? ORDER BY rowid LIMIT 20',extra:[Date.parse(at)]},
    {name:'contactIdentities',sql:'SELECT rowid AS export_rowid,channel,sender_id,verified_at FROM guardian_channel_identities WHERE owner_id=? AND rowid>? ORDER BY rowid LIMIT 20'},
    {name:'pendingContactLinks',sql:'SELECT rowid AS export_rowid,id,channel,created_at,expires_at FROM guardian_contact_links WHERE owner_id=? AND rowid>? ORDER BY rowid LIMIT 20'},
    {name:'receivedMessages',sql:'SELECT rowid AS export_rowid,channel,event_id,check_id,status,created_at FROM guardian_ingress_events WHERE owner_id=? AND rowid>? ORDER BY rowid LIMIT 20'},
    {name:'inspectionEvents',sql:'SELECT rowid AS export_rowid,check_id,attempt_id,sequence,recorded_at,kind,detail_json,previous_mac,mac FROM guardian_inspector_events WHERE owner_id=? AND rowid>? ORDER BY rowid LIMIT 20'},
    {name:'contextConnections',sql:'SELECT rowid AS export_rowid,check_id,context_record_id,relation,reason,status,created_at FROM guardian_context_links WHERE owner_id=? AND rowid>? ORDER BY rowid LIMIT 20'},
    {name:'trialUsage',sql:'SELECT rowid AS export_rowid,check_id,consumed_at FROM guardian_trial_usage WHERE owner_id=? AND rowid>? ORDER BY rowid LIMIT 20'},
    {name:'analysisUsage',sql:'SELECT rowid AS export_rowid,check_id,provider,model,input_tokens,output_tokens,outcome,created_at FROM guardian_analysis_usage WHERE owner_id=? AND rowid>? ORDER BY rowid LIMIT 20'}
  ];
  let phaseIndex=0,cursor=0,first=true,started=false,cancelled=false;
  const stream=new ReadableStream({
    async pull(controller){
      try{
        if(cancelled)return;
        if(!started){started=true;const prefix=JSON.stringify({exportedAt:at,scope:'Guardian service data only',profile:productProfile(profile)});controller.enqueue(encoder.encode(prefix.slice(0,-1)+',"checks":['));return;}
        const phase=phases[phaseIndex],rows=(await db.prepare(phase.sql).bind(ownerId,cursor,...(phase.extra||[])).all()).results;
        if(cancelled)return;
        if(rows.length){
          cursor=rows.at(-1).export_rowid;
          const text=(first?'':',')+rows.map(row=>{const {export_rowid,...metadata}=row;return JSON.stringify(phase.map?phase.map(row):metadata);}).join(',');
          first=false;controller.enqueue(encoder.encode(text));return;
        }
        phaseIndex++;cursor=0;first=true;
        if(phaseIndex===phases.length){controller.enqueue(encoder.encode(']}'));controller.close();}
        else controller.enqueue(encoder.encode('],"'+phases[phaseIndex].name+'":['));
      }catch{if(!cancelled)controller.error(new Error('Your data export could not be completed. Please try again.'));}
    },
    cancel(){cancelled=true;}
  });
  return new Response(stream,{headers:PRODUCT_HEADERS});
}

async function productAssess(request,env,ownerId,row,{fetcher}={},access={unlimited:false}){
  const inspect=createInspection(env,ownerId,row.id);
  let providerUsage=null;
  const provider=createAnalysisProvider(env,{fetcher,onUsage:value=>{providerUsage=value;},onEvent:inspect});
  const trial=()=>getTrialState(env.DB,ownerId,Date.now(),access);
  if(!provider){
    await inspect('error',{summary:'No assessment model is connected. The conversation is saved without an AI assessment.',code:'ANALYSIS_NOT_CONNECTED'});
    await env.DB.prepare("UPDATE guardian_checks SET status='awaiting_connection',result_json=NULL,updated_at=? WHERE owner_id=? AND id=? AND revision=?").bind(productNow(),ownerId,row.id,row.revision).run();
    return productJson({code:'ANALYSIS_NOT_CONNECTED',message:'Your check is saved. No AI assessment has been made.',check:productCheck(await productGetCheck(env.DB,ownerId,row.id)),trial:await trial()},503);
  }
  const storedEvidence=JSON.parse(row.evidence_json);
  const gmailReceipts=new Map(storedEvidence.filter(item=>item.gmailReceipt).map(item=>[item.id,item.gmailReceipt]));
  const input=validateInvestigation({schema:CONTRACT_VERSION,message:row.message,channel:row.channel,evidence:storedEvidence,preferences:JSON.parse(row.preferences_json)});
  const replies=JSON.parse(row.replies_json);
  const followUps=replies.filter(reply=>reply.role==='user').map(reply=>({content:reply.content,createdAt:reply.createdAt,...(reply.knownContacts?.length?{knownContacts:reply.knownContacts}:{})}));
  const turn=followUps.at(-1)?.content||input.message;
  const incidentEvidence=input.evidence.filter(record=>!isKnownContact(record)&&!isCompanyLookup(record));
  const sourceText=followUps.length?turn:[turn,...incidentEvidence.map(item=>item.text)].join('\n');
  const plan=access.verified?selectPublicClaim(sourceText,followUps.length?input.message:''):null;
  let reservation=null,attemptStarted=false,outcome='error';
  try{
    await productTakeQuota(env.DB,ownerId,access);
    reservation=await reserveTrialCheck(env.DB,ownerId,row.id,Date.now(),{...access,research:Boolean(plan)});
    await inspect('access_checked',{summary:'Account ownership and check allowance accepted.',selectedRecordIds:input.evidence.map(e=>e.id),channel:input.channel});
    if(!access.guest)await backfillContextRecords(env.DB,ownerId);
    const context=access.guest?[]:await retrieveContext(env.DB,ownerId,row);
    await inspect('context_retrieved',{summary:context.length+' relevant earlier records selected from this account.',sources:context.map(e=>({id:e.id,source:e.source,sourceCheckId:e.sourceCheckId,reason:e.retrievalReason,confirmed:false}))});
    if(access.guest)await takeGuestModelBudget(env.DB);
    const evidence=[...input.evidence,...context];
    const guidance=sharedWolfgangGuidance(await currentGuide(env.DB),access.guest?{}:await customerStyle(env.DB,ownerId));
    attemptStarted=true;
    const imageRecords=followUps.length?[]:selectedImageExcerpts(input.evidence);
    const observations=turnObservations(turn,imageRecords);
    // On follow-up, retain the original public reference alongside the check.
    // No message, case ID, URL or financial evidence is sent to the reference site.
    const originalSource = replies.find(reply => reply.role === 'assistant' && reply.officialGuidance)?.officialGuidance;
    const topic = observations.find(signal => signal.topic)?.topic;
    const contactInput=reputationEvidence(turn,followUps.length?[]:incidentEvidence);
    await inspect('references_started',{summary:'Checking available identity references and link reputation. Private tracking links are not opened.'});
    const [reference,reputation,verification]=await Promise.all([
      originalSource||(!access.guest&&!replies.length&&topic?readOfficialGuidance(topic,{fetcher}):null),
      !access.guest?checkLinkReputation(contactInput,env,{fetcher,signal:request.signal}):null,
      !access.guest?verifyIdentityEvidence(followUps.length?turn+'\nEarlier in this case:\n'+input.message:input.message,input.evidence,{fetcher,signal:request.signal,gmailReceipts,conversationContacts:contactsFromConversation(followUps,JSON.parse(row.result_json||'null')?.questions||[])}):null
    ]);
    await inspect('references_returned',{summary:'Reference checks returned their findings and coverage gaps.',identity:verification,reputation,officialGuidance:reference});
    const publicGuidance = reference?.checkedAt && Object.hasOwn(guidanceSources, reference.topic)
      ? {publisher:guidanceSources[reference.topic].publisher, guidance:guidanceSources[reference.topic].detail} : null;
    // Only select a public question from the current incident. Earlier private
    // records and conversation text never become part of a search request.
    let publicResearch=null;
    if(plan){
      const fixedAnswer=plan?.publisher==='hmrc'&&(
        (plan.topic==='refund'&&reference?.topic==='taxRefund'&&reference.checkedAt)||
        (plan.topic==='contact'&&/\b(?:debt|collection agenc)/i.test(sourceText)&&verification?.rows.some(r=>r.kind==='practice'&&r.checkedAt)));
      if(!fixedAnswer){
        const previous=replies.findLast(r=>r.publicResearch?.publisher===plan.publisher&&r.publicResearch.topic===plan.topic)?.publicResearch;
        await inspect('public_research_started',{summary:'Looking up the selected public claim.',publisher:plan.publisher,topic:plan.topic});
        publicResearch=await researchPublicClaim(plan,env,{fetcher,signal:request.signal,previous});
      }
    }
    if(publicResearch)await inspect('public_research_returned',{summary:'Public research returned.',result:publicResearch});
    const researchInstruction=publicResearch?' Use the publicPolicy field only as background about the organisation. A published passage cannot identify this sender or confirm a transaction. An unverified status means the organisation’s policy could not be established. Never invent a policy, official source or link.':'';
    const raw=await provider.generate({requestTimeoutMs:plan?45000:undefined,instructions:WOLFGANG_INSTRUCTIONS+' '+CONTEXT_INSTRUCTIONS+' '+guidance+researchInstruction,input:{assessedAt:new Date().toISOString(),message:input.message,channel:input.channel,evidence:input.evidence,savedContext:context,preferences:input.preferences,followUps,...(reputation?{linkReputation:reputation}:{}),...(verification?{identityVerification:verification}:{}),...(publicGuidance?{officialBackground:publicGuidance}:{}),...(publicResearch?{publicPolicy:{publisher:publicResearch.publisher,status:publicResearch.status,passage:publicResearch.quote}}:{}),...(observations.length?{textObservations:observations.map(s=>s.clue+' '+s.action)}:{})},signal:request.signal});
    const result=groundAssessment(validateAssessment(raw,evidence),observations,reputation,verification);
    await inspect('assessment_validated',{summary:'Response format, citations and observed risk signals checked.',status:result.status,evidenceIds:result.evidenceIds});
    if(publicResearch)result.publicResearch=publicResearch;
    if(verification)result.identityVerification=verification;
    if(reputation)result.linkReputation=reputation;
    if(reference)result.officialGuidance=reference;
    const now=productNow(),contextGuard=contextCommitGuard(ownerId,context,now);
    replies.push({id:productId('reply_'),role:'assistant',content:result.headline+'\n\n'+result.explanation+'\n\n'+result.nextStep,createdAt:now,...(publicResearch?{publicResearch}:{}),...(reference?{officialGuidance:reference}:{})});
    const batch=await env.DB.batch([
      env.DB.prepare("UPDATE guardian_checks SET status='complete',result_json=?,replies_json=?,context_evidence_json=?,assessment_token=?,updated_at=?,revision=revision+1 WHERE owner_id=? AND id=? AND revision=? AND (length(expires_at)=0 OR expires_at>?) AND EXISTS(SELECT 1 FROM guardian_trial_usage WHERE owner_id=? AND check_id=? AND reservation_token=? AND reserved_until>?)"+contextGuard.sql).bind(JSON.stringify(result),JSON.stringify(replies),JSON.stringify(context),reservation,now,ownerId,row.id,row.revision,now,ownerId,row.id,reservation,Date.parse(now),...contextGuard.values),
      trialCommitStatement(env.DB,ownerId,row.id,reservation,{consume:!access.unlimited&&(access.guest||result.status!=='unresolved'),now,revision:row.revision+1})
    ]);
    if(!batch[0].meta?.changes)throw productError(context.length?'This check or its saved context changed while Wolfgang was working. The new assessment was not saved. Please reopen the check and try again.':'This check changed while Wolfgang was working. Please check the latest version again.',409,'CHECK_CHANGED');
    outcome='complete';
    await inspect('saved',{summary:'Assessment and conversation saved to this account.',result,usage:providerUsage,cost:null});
    // Associations are explanatory metadata. A failure recording them must not
    // turn an already-delivered and charged assessment into a reported failure.
    try{await env.DB.batch(contextLinkStatements(env.DB,ownerId,row.id,context,result,now,row.expires_at));}catch{}
    return productJson({check:productCheck(await productGetCheck(env.DB,ownerId,row.id)),trial:await trial()});
  }catch(error){
    await inspect('error',{summary:error.status?error.message:'The assessment could not complete. No successful result is being claimed.',code:error.code||'ANALYSIS_UNAVAILABLE',usage:providerUsage});
    await releaseTrialCheck(env.DB,ownerId,row.id,reservation);
    if(error.status)return productJson({code:error.code||'CHECK_UNAVAILABLE',message:error.message,check:productCheck(await productGetCheck(env.DB,ownerId,row.id)),trial:await trial()},error.status);
    await env.DB.prepare("UPDATE guardian_checks SET status='error',result_json=NULL,updated_at=? WHERE owner_id=? AND id=? AND revision=?").bind(productNow(),ownerId,row.id,row.revision).run();
    return productJson({code:'ANALYSIS_UNAVAILABLE',message:'Your check is saved. Wolfgang could not complete the AI assessment. Try again when you are ready.',check:productCheck(await productGetCheck(env.DB,ownerId,row.id)),trial:await trial()},502);
  }finally{
    await releaseTrialCheck(env.DB,ownerId,row.id,reservation);
    if(attemptStarted){
      const usage=providerUsage||{provider:env.GUARDIAN_PROVIDER||'configured',model:env.GUARDIAN_MODEL||env.WOLFGANG_MODEL||'configured',inputTokens:null,outputTokens:null};
      // Deleting a check or all Guardian content while a provider is in flight
      // must not recreate owner-linked usage metadata after that deletion.
      await logProviderUsage(env.DB,row,usage,outcome);
    }
  }
}

export async function handleProductRequest(request,env={},identity={},options={}){
  const url=new URL(request.url),path=url.pathname;if(!productPath(path))return null;
  if(request.method==='GET'&&path==='/api/product-config')return productJson({storageReady:Boolean(env.DB),...publicAnalysisSettings(env)});
  if(typeof identity.ownerId!=='string'||!identity.ownerId)return productJson({code:'SIGN_IN_REQUIRED',message:'Sign in to continue with Wolfgang.'},401);
  if(!env.DB)return productJson({code:'STORAGE_NOT_CONNECTED',message:'Your workspace is not available yet. Please try again shortly.'},503);
  if(!['GET','HEAD'].includes(request.method)&&request.headers.get('origin')!==url.origin)return productJson({code:'ORIGIN_REJECTED',message:'This request could not be accepted.'},403);
  const db=env.DB,ownerId=identity.ownerId,access={verified:Boolean(identity.peopleOrganisedId&&ownerId==='people:'+identity.peopleOrganisedId),unlimited:hasUnlimitedGuardianAccess(identity,env),jury:env.GUARDIAN_JURY_MODE==='true'&&Boolean(identity.peopleOrganisedId&&ownerId==='people:'+identity.peopleOrganisedId),paidMonthly:canonicalPaidMonthly(identity),guest:isGuestIdentity(identity)&&guestEnabled(env)};
  try{
    if(path==='/api/context/preview'&&request.method==='POST'){
      const body=await productReadJson(request);if(typeof body.message!=='string')throw productError('Describe the message first.');
      await backfillContextRecords(db,ownerId);
      const context=await retrieveContext(db,ownerId,{owner_id:ownerId,id:'draft-preview',message:body.message,evidence_json:'[]',replies_json:'[]'});
      return productJson({records:context,scope:'Your own saved records; possible connections, not confirmed facts.'});
    }
    if(path==='/api/live-warnings'&&request.method==='GET')return productJson(await readLiveWarnings(db,identity,url.searchParams,env));
    if(path==='/api/live-warnings/activation'&&request.method==='POST'){
      if(isGuestIdentity(identity))throw productError('Sign in to request live checks.',401);
      if(!access.unlimited)await db.prepare('INSERT INTO guardian_live_requests(owner_id,requested_at) VALUES (?,?) ON CONFLICT(owner_id) DO NOTHING').bind(ownerId,productNow()).run();
      return productJson({requested:!access.unlimited,access:access.unlimited?'full':'trial'});
    }
    await cleanupExpiredChecks(env);
    if(path==='/api/entitlements'&&request.method==='GET'){
      await productGetProfile(db,identity);
      return productJson({trial:await getTrialState(db,ownerId,Date.now(),access)});
    }
    if(path==='/api/profile'){
      if(request.method==='GET')return productJson({profile:productProfile(await productGetProfile(db,identity)),trial:await getTrialState(db,ownerId,Date.now(),access)});
      if(request.method==='PATCH'){
        const body=await productReadJson(request,2000),row=await productGetProfile(db,identity);
        if(body.resetCommunicationStyle===true){await customerStyle(db,ownerId,{reset:true});return productJson({profile:productProfile(await productGetProfile(db,identity))});}
        const name=body.displayName===undefined?row.display_name:body.displayName;
        if(typeof name!=='string'||name.trim().length>60||(body.completeProfile&&!name.trim()))throw productError('Use a name between 1 and 60 characters to complete your profile.');
        for(const key of ['memoryEnabled','onboardingComplete','completeProfile','connectionsIntroduced'])if(body[key]!==undefined&&typeof body[key]!=='boolean')throw productError('A profile option has an invalid value.');
        if(body.memoryEnabled===false)throw productError('Guardian now remembers account checks. Reload this page before continuing.',409,'ACCOUNT_CONTEXT_POLICY');
        await db.prepare('UPDATE guardian_profiles SET display_name=?,onboarding_complete=?,profile_completed_at=COALESCE(profile_completed_at,?),connections_intro_at=COALESCE(connections_intro_at,?),updated_at=? WHERE owner_id=?').bind(name.trim(),body.onboardingComplete===undefined?row.onboarding_complete:Number(body.onboardingComplete),body.completeProfile?productNow():null,body.connectionsIntroduced?productNow():null,productNow(),ownerId).run();
        return productJson({profile:productProfile(await productGetProfile(db,identity)),trial:await getTrialState(db,ownerId,Date.now(),access)});
      }
    }
    if(path==='/api/checks'){
      if(request.method==='GET'){
        // History is deliberately small. Full evidence and conversation are
        // fetched only when the customer opens a particular check.
        const rows=await db.prepare("SELECT id,substr(message,1,160) AS message,json_extract(evidence_json,'$[0].source') AS source,channel,status,created_at,updated_at FROM guardian_checks WHERE owner_id=? AND (length(expires_at)=0 OR expires_at>?) ORDER BY updated_at DESC LIMIT 100").bind(ownerId,productNow()).all();
        return productJson({checks:rows.results.map(row=>({id:row.id,title:row.message.trim()||row.source||'Saved check',message:row.message,channel:row.channel,status:row.status,createdAt:row.created_at,updatedAt:row.updated_at}))});
      }
      if(request.method==='POST'){
        const body=await productReadJson(request);
        const profile=await productGetProfile(db,identity);
        // The session determines ownership. A draft may only veto a save if
        // its originating customer differs from the one authenticated now.
        if(body.expectedProfileId!==undefined && (typeof body.expectedProfileId!=='string'||body.expectedProfileId!==profile.id)){
          throw productError('The signed-in account has changed. Sign back into your original Guardian account to save this draft.',409,'DRAFT_PROFILE_CHANGED');
        }
        // The optional id is a trusted server integration argument, never a body
        // field. Signed ingress adapters use it to make event retries idempotent.
        if(options.checkId!==undefined&&!/^check_[a-f0-9]{64}$/.test(options.checkId))throw productError('The integration supplied an invalid check identifier.');
        if(options.checkId){const existing=await db.prepare('SELECT * FROM guardian_checks WHERE owner_id=? AND id=? AND (length(expires_at)=0 OR expires_at>?)').bind(ownerId,options.checkId,productNow()).first();if(existing)return productJson({check:productCheck(existing)});}
        let input;try{input=validateInvestigation({schema:CONTRACT_VERSION,message:body.message,channel:body.channel||'other',evidence:body.evidence||[],preferences:body.preferences});}catch(error){throw productError(error.message);}
        if(body.remember!==undefined&&typeof body.remember!=='boolean')throw productError('The save option must be true or false.');
        if(!access.guest&&body.remember===false)throw productError('This older form requested a temporary check. Reload to use Guardian account checks.',409,'ACCOUNT_CONTEXT_POLICY');
        // An account's older evidence must never have to be deleted to save a new check.
        // The trial draft-write limit covers one day. Entitled accounts keep their full history.
        if(!access.unlimited){
          const since=new Date(Date.now()-PRODUCT_DAY).toISOString();
          const count=await db.prepare('SELECT COUNT(*) AS count FROM guardian_checks WHERE owner_id=? AND created_at>?').bind(ownerId,since).first();
          if(count.count>=500)throw productError('You have reached today’s limit for new checks. Try again tomorrow.',429,'CHECK_CREATION_LIMIT');
        }
        const now=productNow(),id=options.checkId||productId('check_'),remember=!isGuestIdentity(identity),expires=remember?'':new Date(Date.now()+PRODUCT_DAY).toISOString();
        const sourceProvider=options.sourceProvider||await verifyMailOrigin(env,ownerId,body.originProof,input.evidence);
        await attachVerifiedMailReceipts(env,ownerId,input.evidence,body.mailProofs);
        await db.prepare('INSERT OR IGNORE INTO guardian_checks (id,owner_id,message,channel,evidence_json,preferences_json,status,result_json,replies_json,remember,revision,created_at,updated_at,expires_at,incoming_provider) VALUES (?,?,?,?,?,?,?,NULL,?,?,0,?,?,?,?)').bind(id,ownerId,input.message,input.channel,JSON.stringify(input.evidence),JSON.stringify(input.preferences),'draft','[]',Number(remember),now,now,expires,sourceProvider).run();
        const created=await productGetCheck(db,ownerId,id);await syncContextRecords(db,ownerId,created);
        return productJson({check:productCheck(created),trial:await getTrialState(db,ownerId,Date.now(),access)},201);
      }
    }
    const match=path.match(/^\/api\/checks\/([^/]+)(?:\/(assess|replies|inspection|events))?$/);
    if(match){
      const row=await productGetCheck(db,ownerId,match[1]);
      if(['inspection','events'].includes(match[2])&&request.method==='GET'){
        const inspection=await readInspection(env,ownerId,row.id);
        if(match[2]==='events')return new Response('retry: 1200\nevent: snapshot\ndata: '+JSON.stringify(inspection)+'\n\n',{headers:{'Content-Type':'text/event-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
        return productJson(inspection);
      }
      if(!match[2]&&request.method==='GET')return productJson({check:productCheck(row)});
      if(!match[2]&&request.method==='DELETE'){
        await db.batch([db.prepare('DELETE FROM guardian_context_links WHERE owner_id=? AND (check_id=? OR context_record_id IN (SELECT id FROM guardian_context_records WHERE owner_id=? AND source_check_id=?))').bind(ownerId,row.id,ownerId,row.id),db.prepare('DELETE FROM guardian_context_records WHERE owner_id=? AND source_check_id=?').bind(ownerId,row.id),db.prepare('DELETE FROM guardian_trial_usage WHERE owner_id=? AND check_id=? AND consumed_at IS NULL').bind(ownerId,row.id),db.prepare('DELETE FROM guardian_checks WHERE owner_id=? AND id=?').bind(ownerId,row.id)]);return productJson({deleted:true});
      }
      if(!match[2]&&request.method==='PATCH'){
        const body=await productReadJson(request),current=productCheck(row);let input;
        const charged=await checkWasCharged(db,ownerId,row.id);
        if(charged&&((body.message!==undefined&&body.message!==current.message)||(body.channel!==undefined&&body.channel!==current.channel)))throw productError('This completed case keeps its original message. Start a new check for a different request, or add evidence and follow up here.',409,'NEW_CHECK_REQUIRED');
        try{input=validateInvestigation({schema:CONTRACT_VERSION,message:body.message??current.message,channel:body.channel??current.channel,evidence:body.evidence??current.evidence,preferences:body.preferences??current.preferences});}catch(error){throw productError(error.message);}
        if(body.remember!==undefined&&typeof body.remember!=='boolean')throw productError('The save option must be true or false.');
        if(body.remember!==undefined&&body.remember!==current.remember)throw productError('This check keeps its original retention terms. You can delete it at any time.',409,'ACCOUNT_CONTEXT_POLICY');
        const remember=current.remember,now=productNow();
        await attachVerifiedMailReceipts(env,ownerId,input.evidence,body.mailProofs,JSON.parse(row.evidence_json));
        const changed=input.message!==row.message||input.channel!==row.channel||JSON.stringify(input.evidence)!==row.evidence_json||JSON.stringify(input.preferences)!==row.preferences_json;
        if(charged && body.evidence!==undefined){
          const prior=JSON.parse(row.evidence_json);
          if(!row.message.trim() && JSON.stringify(prior.find(e=>e.text.trim()))!==JSON.stringify(input.evidence.find(e=>e.text.trim())))throw productError('This file is the original request. Start a new check for a different file.',409,'NEW_CHECK_REQUIRED');
          const additions=input.evidence.filter(e=>!prior.some(old=>JSON.stringify(e)===JSON.stringify(old)));
          if(additions.length)await requireSameCase(row,additions,env,access,request,options);
        }
        const stillOriginal=input.message===row.message&&input.channel===row.channel&&JSON.stringify(input.evidence)===row.evidence_json;
        const sourceProvider=stillOriginal?row.incoming_provider:null;
        const expires=row.expires_at;
        const updated=await db.prepare('UPDATE guardian_checks SET message=?,channel=?,evidence_json=?,preferences_json=?,remember=?,incoming_provider=?,status=?,result_json=?,replies_json=?,updated_at=?,expires_at=?,revision=revision+1 WHERE owner_id=? AND id=? AND revision=?').bind(input.message,input.channel,JSON.stringify(input.evidence),JSON.stringify(input.preferences),Number(remember),sourceProvider,changed?'draft':row.status,changed?null:row.result_json,changed&&!charged?'[]':row.replies_json,now,expires,ownerId,row.id,row.revision).run();
        if(!updated.meta?.changes)throw productError('This check changed. Please reopen it and try again.',409,'CHECK_CHANGED');
        const latest=await productGetCheck(db,ownerId,row.id);await syncContextRecords(db,ownerId,latest);
        return productJson({check:productCheck(latest),trial:await getTrialState(db,ownerId,Date.now(),access)});
      }
      if(match[2]==='assess'&&request.method==='POST')return await productAssess(request,env,ownerId,row,options,access);
      if(match[2]==='replies'&&request.method==='POST'){
        const body=await productReadJson(request);
        if(typeof body.message!=='string'||!body.message.trim())throw productError('Write a readable follow-up.');
        const replies=JSON.parse(row.replies_json);
        // Provider ingress supplies this server-only identifier so an interrupted
        // assessment can resume without appending the same delivered message twice.
        if(options.replyId!==undefined){
          if(!/^reply_[a-f0-9]{64}$/.test(options.replyId))throw productError('The integration supplied an invalid reply identifier.');
          const prior=replies.find(reply=>reply.id===options.replyId);
          if(prior){
            if(prior.role!=='user'||prior.content!==body.message.trim())throw productError('This reply identifier has already been used.',409,'REPLY_CONFLICT');
            if(row.status==='complete'&&row.result_json)return productJson({check:productCheck(row)});
            return await productAssess(request,env,ownerId,row,options,access);
          }
        }
        if(replies.filter(reply=>reply.role==='user').length>=12)throw productError('This check has reached twelve follow-ups. Start a new check with the relevant details.',409,'REPLY_LIMIT');
        if(await checkWasCharged(db,ownerId,row.id))await requireSameCase(row,body.message.trim(),env,access,request,options);
        if(!access.guest&&!options.replyId){
          const change=styleRequest(body.message);
          if(change){await customerStyle(db,ownerId,change);}
        }
        const knownContacts=contactsFromConversation([{content:body.message.trim()}],JSON.parse(row.result_json||'null')?.questions||[]);
        replies.push({id:options.replyId||productId('reply_'),role:'user',content:body.message.trim(),createdAt:productNow(),...(knownContacts.length?{knownContacts}:{})});
        const updated=await db.prepare("UPDATE guardian_checks SET replies_json=?,result_json=NULL,status='draft',updated_at=?,revision=revision+1 WHERE owner_id=? AND id=? AND revision=?").bind(JSON.stringify(replies),productNow(),ownerId,row.id,row.revision).run();
        if(!updated.meta?.changes)throw productError('This check changed. Please reopen it before replying.',409,'CHECK_CHANGED');
        const latest=await productGetCheck(db,ownerId,row.id);
        await syncContextRecords(db,ownerId,latest);
        return await productAssess(request,env,ownerId,latest,options,access);
      }
    }
    if(path==='/api/privacy'){
      if(request.method==='GET'){
        return productPrivacyExport(db,ownerId,await productGetProfile(db,identity));
      }
      if(request.method==='DELETE'){
        const body=await productReadJson(request,1000);
        if(body.confirm!=='delete-guardian-data')throw productError('Confirm deletion of your Guardian data.');
        // Confirmation and owner validation precede every external revocation.
        // The connector deletes local credentials even if an upstream is down.
        await disconnectAllOwnedConnections(env,ownerId,{fetcher:options.fetcher});
        await db.batch([
          db.prepare('DELETE FROM guardian_connection_tokens WHERE owner_id=?').bind(ownerId),db.prepare('DELETE FROM guardian_oauth_states WHERE owner_id=?').bind(ownerId),
          // A failed remote mailbox Stop leaves no readable local credential,
          // but its opaque cleanup reference must survive so Stop can be retried.
          db.prepare("DELETE FROM guardian_connections WHERE owner_id=? AND NOT (provider='mailbox' AND status='stopping')").bind(ownerId),
          db.prepare("DELETE FROM guardian_message_jobs WHERE owner_id=? OR EXISTS (SELECT 1 FROM guardian_channel_identities i WHERE i.owner_id=? AND i.channel=guardian_message_jobs.channel AND i.sender_id=guardian_message_jobs.sender_id)").bind(ownerId,ownerId),
          db.prepare('DELETE FROM guardian_channel_preferences WHERE owner_id=?').bind(ownerId),db.prepare('DELETE FROM guardian_channel_identities WHERE owner_id=?').bind(ownerId),db.prepare('DELETE FROM guardian_contact_links WHERE owner_id=?').bind(ownerId),db.prepare('DELETE FROM guardian_ingress_events WHERE owner_id=?').bind(ownerId),
          db.prepare('DELETE FROM guardian_context_links WHERE owner_id=?').bind(ownerId),db.prepare('DELETE FROM guardian_context_records WHERE owner_id=?').bind(ownerId),db.prepare('DELETE FROM guardian_analysis_usage WHERE owner_id=?').bind(ownerId),
          db.prepare('DELETE FROM guardian_trial_usage WHERE owner_id=? AND consumed_at IS NULL').bind(ownerId),
          db.prepare('DELETE FROM guardian_checks WHERE owner_id=?').bind(ownerId),db.prepare('DELETE FROM guardian_rate_limits WHERE owner_id=?').bind(ownerId),db.prepare('DELETE FROM guardian_live_requests WHERE owner_id=?').bind(ownerId),db.prepare('DELETE FROM guardian_profiles WHERE owner_id=?').bind(ownerId)
        ]);
        const remoteCredentialCleanupPending=Boolean(await db.prepare("SELECT 1 AS pending FROM guardian_connections WHERE owner_id=? AND provider='mailbox' AND status='stopping'").bind(ownerId).first());
        return productJson({deleted:true,scope:'Guardian service data only',remoteCredentialCleanupPending,message:remoteCredentialCleanupPending?'Your saved Guardian information has been deleted. Mailbox access has stopped here, but the mailbox service has not confirmed credential removal. A minimal connection reference is kept so removal can be retried.':'Your saved Guardian information has been deleted.',retained:'A minimal free-check usage ledger remains linked to your People Organised account to prevent resetting the trial. No messages, evidence or assessment content is retained in that ledger.'+(remoteCredentialCleanupPending?' A minimal non-readable mailbox connection reference is also retained while remote credential removal is unconfirmed.':'')});
      }
    }
    return productJson({code:'METHOD_NOT_ALLOWED',message:'This action is not available.'},405);
  }catch(error){
    return productJson({code:error.code||'WORKSPACE_UNAVAILABLE',message:error.status?error.message:'Your workspace could not complete this request. Please try again.'},error.status||503);
  }
}

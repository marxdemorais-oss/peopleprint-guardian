import {handleJuryAccess} from './jury-access.js';
import {refreshPublicKnowledge,recheckExampleReference} from './public-claim-research.js';
import {embeddedModel} from './embedded-model.js';
import {mergeCandidate,previousLogin,retiredLogin} from './merge-logins.js';
import {handleWatchTick} from './watch-trigger.js';
import {handleWatch,drainWatches} from './watch-service.js';
import {attachMailOrigins} from './live-warnings.js';
import {handlePeopleAuthRequest,resolvePeopleIdentity,PeopleAuthUnavailable} from './people-auth.js';
import {scheduledDirectoryReview} from './admin-uk-directory.js';
import {handleAdminRequest} from './admin-service.js';
import {handleTransportTestRequest} from './transport-test.js';
import {handleXConnectionRequest} from './x-connection.js';
import {handleXCustomerLinkRequest,isXCustomerCallback} from './x-customer-link.js';
import {handleXWebhookSetupRequest,getXWebhookStatus} from './x-webhook-setup.js';
import {handleContactRequest} from './contact-ingress.js';
import {handleMessagingWebhook,drainMessagingJobs} from './messaging-service.js';
import {chatTabScope,deliverPreview,previewState,previewCookie,reservePublicUsage,signVoiceReply,verifyVoiceReply} from './public-usage.js';
import {customerStyle,styleRequest} from './wolfgang-style.js';
import {productGetProfile,handleProductRequest,cleanupExpiredChecks} from './product-service.js';
import {handleConnectionRequest,disconnectAllOwnedConnections,registerVerifiedEmailSender} from './connections.js';
import {handleMailboxConnectionRequest} from './mailbox-connection.js';
import {handleConnectionReturn} from './connection-return.js';
import {analyse,cases} from './legacy-analysis.js';
import {validateInvestigation} from '../web/assets/guardian-contract.js';
import {chatSettings,briefSocialReply,greetingFallback,homepageTurn,validateChat,converse,allowConversation,voiceConfigured,synthesiseVoice} from './wolfgang-conversation.js';
// HTML and asset maps are embedded by scripts/embed-ui.mjs.
const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
const json=(value,status=200)=>new Response(JSON.stringify(value),{status,headers});
async function readJson(request,limit){
  if(Number(request.headers.get('content-length')||0)>limit)throw Object.assign(new Error('Request too large'),{status:413});
  const reader=request.body?.getReader();if(!reader)throw Object.assign(new Error('Invalid JSON'),{status:400});
  const chunks=[];let length=0;while(true){const {value,done}=await reader.read();if(done)break;length+=value.byteLength;if(length>limit){await reader.cancel();throw Object.assign(new Error('Request too large'),{status:413});}chunks.push(value);}
  const bytes=new Uint8Array(length);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}try{return JSON.parse(new TextDecoder().decode(bytes));}catch{throw Object.assign(new Error('Invalid JSON'),{status:400});}
}
export default {async fetch(request,env={},ctx){
  const url=new URL(request.url),path=url.pathname;
  const readPage=request.method==='GET'||request.method==='HEAD';
  if(readPage&&Object.hasOwn(publicAssets,path)){
    const asset=publicAssets[path];
    if(asset.chunks||asset.mediaPath)return embeddedModel(request,asset,env.ASSETS);
    let body=null;
    if(request.method==='GET'){
      if(asset.text!==undefined)body=asset.text;
      else{
        const bytes=Uint8Array.from(atob(asset.gzip||asset.data),c=>c.charCodeAt(0));
        body=asset.gzip?new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip')):bytes;
      }
    }
    return new Response(body,{headers:{'Content-Type':asset.type,'Cache-Control':'public, max-age=0, must-revalidate','X-Content-Type-Options':'nosniff',...(path==='/assets/evidence-worker.js'?{'Content-Security-Policy':"default-src 'none'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self'"}:{})}});
  }
  if(path==='/api/internal/uk-directory/maintenance')return scheduledDirectoryReview(request,env);
  if(path==='/uk-directory'||path.startsWith('/api/public/uk-directory/'))return new Response(null,{status:404,headers:{'Cache-Control':'no-store'}});
  const watchTick=await handleWatchTick(request,env,drainWatches);if(watchTick)return watchTick;
  const connectionReturn=handleConnectionReturn(request);if(connectionReturn)return connectionReturn;
  const xSetupResponse=await handleXWebhookSetupRequest(request,env);if(xSetupResponse)return xSetupResponse;
  const xConnectionResponse=isXCustomerCallback(request)?null:await handleXConnectionRequest(request,env);
  if(xConnectionResponse){
    if(path==='/api/internal/admin/x/connection'&&request.method==='GET'&&xConnectionResponse.ok){
      try{return Response.json({...await xConnectionResponse.json(),...await getXWebhookStatus(env)},{headers:xConnectionResponse.headers});}
      catch{return json({code:'X_CONNECTION_UNAVAILABLE'},503);}
    }
    return xConnectionResponse;
  }
  const transportTestResponse=await handleTransportTestRequest(request,env);if(transportTestResponse)return transportTestResponse;
  const adminResponse=await handleAdminRequest(request,env);if(adminResponse)return adminResponse;
  // Native webhooks authenticate the provider. Visitor cookies never authorise
  // a provider event and an expired visitor session cannot block delivery.
  const messagingResponse=await handleMessagingWebhook(request,env,ctx);if(messagingResponse)return messagingResponse;
  const juryAccess=await handleJuryAccess(request,env);if(juryAccess)return juryAccess;
  const authResponse=await handlePeopleAuthRequest(request,env);if(authResponse)return authResponse;
  let identity={};
  try{
    if(path.startsWith('/api/')||['/workspace','/welcome','/connections','/account','/plans','/inspector'].includes(path)){
      identity=await resolvePeopleIdentity(request,env)||{};
      // Existing signed-in Guardian customers retain their old records. A new
      // email-code session never falls back or merges records by email address.
      if(!identity.ownerId&&!request.headers.get('cookie')?.includes('__Host-wolfgang_session=')&&!request.headers.get('cookie')?.split(';').some(value=>value.trim()==='__Host-wolfgang_signed_out=1')&&previousLogin(request)&&!await retiredLogin(env.DB,request.headers.get('oai-authenticated-user-id'))){
        identity={ownerId:request.headers.get('oai-authenticated-user-id'),email:request.headers.get('oai-authenticated-user-email'),name:request.headers.get('oai-authenticated-user-full-name')||'',legacy:true};
        if(identity.name&&request.headers.get('oai-authenticated-user-full-name-encoding')==='percent-encoded-utf-8'){try{identity.name=decodeURIComponent(identity.name);}catch{identity.name='';}}
      }
    }
  }catch(error){if(error instanceof PeopleAuthUnavailable)return json({error:error.message,code:'IDENTITY_UNAVAILABLE'},503);throw error;}
  if(path==='/api/account/previous-login'&&request.method==='GET')return json({candidate:await mergeCandidate(request,env.DB,identity)});
  const verifiedEmail=Boolean(identity.peopleOrganisedId&&identity.ownerId==='people:'+identity.peopleOrganisedId);
  // A hosting login can still read, export, delete or explicitly link earlier
  // records. Only the email-code identity may submit a new web assessment.
  if(identity.legacy&&!['GET','HEAD','DELETE'].includes(request.method)&&/^\/api\/checks(?:\/[^/]+(?:\/(?:replies|assess))?)?$/.test(path)){
    if(request.headers.get('origin')!==url.origin)return json({code:'ORIGIN_REJECTED',message:'This request could not be accepted.'},403);
    return json({code:'SIGN_IN_REQUIRED',message:'Verify your email before starting or updating a personal check.',link:{path:'/signup',label:'Verify my email'}},401);
  }
  const customerXResponse=await handleXCustomerLinkRequest(request,env,identity);if(customerXResponse)return customerXResponse;
  const contactResponse=await handleContactRequest(request,env,identity);if(contactResponse)return contactResponse;
  const mailboxConnectionResponse=await handleMailboxConnectionRequest(request,env,identity);if(mailboxConnectionResponse)return attachMailOrigins(mailboxConnectionResponse,request,env,identity.ownerId);
  const contactPhoto = path === '/api/wolfgang/contact-card' ? publicAssets['/assets/wolfgang-contact.jpg']?.data : undefined;
  const connectionResponse=await handleConnectionRequest(request,env,identity,{contactPhoto});if(connectionResponse){if(path==='/api/connections'&&request.method==='GET'&&identity.peopleOrganisedId){const work=drainMessagingJobs(env);if(ctx?.waitUntil)ctx.waitUntil(work);else await work;}return attachMailOrigins(connectionResponse,request,env,identity.ownerId);}
  const watch=await handleWatch(request,env,identity);if(watch)return watch;
  const productResponse=await handleProductRequest(request,env,identity);if(productResponse)return productResponse;
  if(request.method==='GET'&&path==='/api/session'){
    try{await registerVerifiedEmailSender(env,identity);}catch{console.warn('Guardian email registration will retry');}
    return json({authenticated:Boolean(identity.ownerId),legacy:identity.legacy===true});
  }
  if(request.method==='GET'&&path==='/api/wolfgang/config'){
    const response=json({introductionReady:true,emailVerificationRequired:identity.legacy===true,voiceProofRequired:!verifiedEmail,conversationReady:chatSettings(env).configured,voiceReady:voiceConfigured(env),...(identity.ownerId?{chatScope:await chatTabScope(request,env,identity)}:{})});
    const cookie=!identity.ownerId&&await previewCookie(request,env);if(cookie)response.headers.append('Set-Cookie',cookie);
    return response;
  }
  if(request.method==='POST'&&['/api/wolfgang/chat','/api/wolfgang/voice'].includes(path)){
    if(request.headers.get('origin')!==url.origin)return json({message:'Request rejected.'},403);
    if(!request.headers.get('content-type')?.includes('application/json'))return json({message:'JSON required.'},415);
    if(path.endsWith('/voice')&&!voiceConfigured(env))return json({code:'VOICE_NOT_CONNECTED',message:'Use the voice available on your device.'},503);
    const tab=request.headers.get('x-guardian-chat-scope');
    if(path.endsWith('/chat')&&tab&&tab!==(await chatTabScope(request,env,identity))?.slice(0,32))return json({code:'CHAT_SESSION_CHANGED',message:'Your sign-in changed. Please open the conversation again.'},409);
    const jury=verifiedEmail&&env.GUARDIAN_JURY_MODE==='true';
    if(!jury&&!allowConversation(request))return json({code:'RATE_LIMIT',message:'Please wait a minute before sending another message.'},429);
    let body;try{body=await readJson(request,28000);if(path.endsWith('/chat'))validateChat(body);else if(typeof body?.text!=='string'||!body.text.trim()||body.text.length>1600)return json({message:'Invalid speech text.'},400);}catch(e){return json({message:e.message},e.status||400);}
    try{
      const isChat=path.endsWith('/chat'),signedIn=Boolean(identity.ownerId);
      const turn=isChat?homepageTurn(body,{signedIn}):null;
      const styleChange=isChat&&signedIn&&typeof body.message==='string'?styleRequest(body.message):null;
      // Only server-recognised public subjects (or a fixed style command) may
      // reach the general chat model. A model response, caller-supplied preset
      // or browser cookie cannot authorise a personal assessment.
      if(isChat&&!turn.kind&&!styleChange){
        return verifiedEmail?json({code:'CHECK_REQUIRED',message:'Use a saved check for this message. You can review it and add context before asking for an assessment.',link:{path:'/workspace',label:'Use this in a saved check'}},409)
          :json({code:'SIGN_IN_REQUIRED',message:'Verify your email to check a real message. You can explore the fictional examples without signing in.',link:{path:'/signup',label:'Verify my email'}},401);
      }
      // Anonymous and legacy callers may only speak the exact server-produced
      // public reply. Caller-supplied text must never reach remote synthesis.
      const guided=Boolean(turn?.product?.tourSource);
      const respond=async (result,tourReason)=>{
        if(guided){
          if(tourReason)result={...result,tourReason};
          console.info('guardian.tour',JSON.stringify({source:result.tourSource||'unavailable',reason:tourReason||null}));
        }
        if(!verifiedEmail&&voiceConfigured(env)){
          const voiceProof=await signVoiceReply(request,env,identity,result.reply);
          if(voiceProof)return json({...result,voiceProof});
        }
        return json(result);
      };
      if(!isChat&&!verifiedEmail&&!(await verifyVoiceReply(request,env,identity,body.text,body.voiceProof)))return json({code:'VOICE_REPLY_REQUIRED',message:'Use your device voice for this text.'},403);
      if(turn?.tourLookup){
        const source=await recheckExampleReference();
        if(source?.status==='published')return respond({reply:'Take Five’s published advice: “'+source.quote+'”',intent:'explaining',tourSource:'official',publicResearch:source});
        return respond(turn.product,'source_unconfirmed');
      }
      if(turn?.local)return respond(turn.product);
      if(isChat&&!chatSettings(env).configured)return turn.product?respond(turn.product,'configuration'):json({code:'CONVERSATION_NOT_CONNECTED',message:'Conversation is not available yet. You can explore the examples in the demo.'},503);
      const gate=()=>json({code:'PREVIEW_COMPLETE',message:briefSocialReply(body),link:{path:'/demo',label:'Explore the fictional demo'}},429);
      const preview=isChat&&!signedIn?await previewState(request,env,identity):null;
      if(preview?.social>=2&&!guided)return turn.product?respond(turn.product):gate();
      const usage=jury?{allowed:true}:await reservePublicUsage(request,env,Date.now(),identity.ownerId,{guided});
      if(!usage.allowed&&turn?.product){
        const reason=usage.needsCookie?'cookie':usage.unavailable?'meter_unavailable':'limit';
        return respond(turn.product,reason);
      }
      if(usage.signup&&isChat)return gate();
      if(usage.needsCookie)return json({code:'PREVIEW_COOKIE',message:'Refresh this page and allow its first-party cookie to start your preview.'},403);
      if(!usage.allowed||isChat&&!signedIn&&!preview)return json({code:usage.unavailable?'CONVERSATION_UNAVAILABLE':'RATE_LIMIT',message:usage.unavailable?'Conversation is temporarily unavailable. Please try again.':'The homepage has reached its request limit. Please try later or open your workspace.'},usage.unavailable?503:429);
      if(!isChat)return new Response(await synthesiseVoice(body.text,env,undefined,{signal:request.signal}),{headers:{'Content-Type':'audio/mpeg','Cache-Control':'no-store'}});
      let style={};
      if(signedIn){
        if(styleChange)await productGetProfile(env.DB,identity);
        style=await customerStyle(env.DB,identity.ownerId,styleChange);
      }
      let result;
      try{
        result=await converse(body,env,{style,styleChange,signal:request.signal,publicOnly:true,signedIn,preview});
      }catch(error){
        if(request.signal.aborted)throw error;
        if(guided)console.warn('guardian.tour.provider',JSON.stringify({httpStatus:Number.isInteger(error.providerStatus)?error.providerStatus:null,timeout:error.name==='TimeoutError'}));
        result=turn.product||greetingFallback(body);
        if(!result)throw error;
      }
      delete result.previewKind;
      if(preview&&turn.kind!=='product'&&!(await deliverPreview(env.DB,preview,turn.kind)).allowed)return gate();
      return respond(result,guided&&result.tourSource==='prepared'?'model_reply':undefined);
    }catch(error){
      const status=Number.isInteger(error?.providerStatus)?error.providerStatus:null;
      const kind=['PROVIDER_REJECTED','PROVIDER_REDIRECT','PROVIDER_INVALID_RESPONSE','PROVIDER_TOO_LARGE'].includes(error?.code)?error.code:
        error?.name==='TimeoutError'?'timeout':error?.message==='Incomplete conversation response'?'incomplete':
        error?.message==='Invalid conversation response'?'invalid_reply':'request_failed';
      console.warn('guardian.conversation.failure',JSON.stringify({kind,status}));
      return json({code:'REPLY_INTERRUPTED',reason:kind==='timeout'?'timeout':'interrupted',message:'Your question is still in the box. Please send it again.'},502);
    }
  }
  if(readPage&&['/workspace','/welcome','/connections','/account','/plans','/inspector'].includes(path)&&!identity.ownerId)return Response.redirect(url.origin+'/login?return_to='+encodeURIComponent(path+url.search),302);
  if(readPage&&Object.hasOwn(pages,path))return new Response(request.method==='HEAD'?null:pages[path],{headers:{...(typeof guardianBuildId==='string'?{'X-Guardian-Build':guardianBuildId}:{}),'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self' blob:; media-src 'self' blob:; base-uri 'none'; object-src 'none'; frame-ancestors 'self'"}});
  if(request.method==='GET'&&path==='/api/config')return json({configured:Boolean(env.MODEL_API_KEY),model:'muse-spark-1.3',investigationsReady:false,documentExtractionReady:false,connections:[]});
  if(request.method==='GET'&&path==='/api/cases')return json(cases);
  if(request.method==='POST'&&['/api/analyse','/api/investigations/assess'].includes(path)){
    if(request.headers.get('origin')!==url.origin)return json({error:'Origin rejected',code:'ORIGIN_REJECTED'},403);
    if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'JSON required'},415);
    if(path==='/api/analyse'&&!env.MODEL_API_KEY)return json({error:'Live analysis is not connected yet.'},503);
    if(!identity.ownerId)return json({error:'Sign in to request a check.',code:'SIGN_IN_REQUIRED'},401);
    let body;try{body=await readJson(request,path==='/api/analyse'?2000:260000);}catch(e){return json({error:e.message},e.status||400);}
    if(path==='/api/investigations/assess'){
      try{validateInvestigation(body);}catch(e){return json({code:'INVALID_INVESTIGATION',message:e.message},400);}
      // Unavailable until provider, per-user evidence storage, source checks and limits are wired.
      // Never substitute a canned verdict for a personal investigation.
      return json({code:'ANALYSIS_NOT_CONNECTED',message:'Your material is ready, but live analysis is not connected yet. No assessment has been made.'},503);
    }
    if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Invalid request'},400);
    const c=cases.find(c=>c.id===body.id);if(!c)return json({error:'Unknown scenario'},400);if(body.consent!==true)return json({error:'Consent is required'},400);
    // The legacy prototype accepts only a server-owned fictional case. Each
    // provider round still shares the durable chat budget; no trial is spent.
    const admittedFetch=async(...args)=>{
      const usage=verifiedEmail&&env.GUARDIAN_JURY_MODE==='true'?{allowed:true}:await reservePublicUsage(request,env,Date.now(),identity.ownerId);
      if(!usage.allowed)throw Object.assign(new Error('The live example is unavailable. You can still explore the prepared demo.'),{admissionStatus:usage.unavailable?503:429});
      return fetch(...args);
    };
    try{return json(await analyse({...c,record:{...c.record,confirmation:body.confirmed===true?'simulated_confirmed':'not_requested'}},env.MODEL_API_KEY,admittedFetch));}
    catch(e){if(e.admissionStatus)return json({error:e.message,code:e.admissionStatus===429?'RATE_LIMIT':'CONVERSATION_UNAVAILABLE'},e.admissionStatus);return json({error:e.message.startsWith('Meta request')?e.message:'Analysis could not finish. No verdict recorded. Please try again.'},502);}
  }
  return new Response('Not found',{status:404,headers:{'Content-Type':'text/plain; charset=utf-8'}});
},async scheduled(event,env,ctx){ctx.waitUntil(Promise.all([cleanupExpiredChecks(env),drainMessagingJobs(env),drainWatches(env),refreshPublicKnowledge(env)]));}};

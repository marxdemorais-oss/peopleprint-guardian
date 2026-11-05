import {registerVerifiedEmailSender} from './connections.js';
import {mergeVerifiedLogins,MergeConflict,previousLogin} from './merge-logins.js';
// Canonical People Organised identity is verified by its private account service.
// No ChatGPT identity or email-address matching fallback is permitted here.
const SESSION_COOKIE='__Host-wolfgang_session';
// A valid canonical session wins. Without it, this non-secret preference
// prevents the hosting identity from restoring a session the visitor did not choose.
const HOSTING_FALLBACK_BLOCK_COOKIE='__Host-wolfgang_signed_out';
const FLOW_COOKIE='__Host-wolfgang_flow';
const encoder=new TextEncoder();
const json=(value,status=200,headers={})=>Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const random=()=>Array.from(crypto.getRandomValues(new Uint8Array(32)),n=>n.toString(16).padStart(2,'0')).join('');
const hash=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value))),n=>n.toString(16).padStart(2,'0')).join('');
const cookie=(name,value,maxAge)=>`${name}=${value}; Path=/${maxAge===undefined?'':'; Max-Age='+maxAge}; HttpOnly; Secure; SameSite=Strict`;
const readCookie=(request,name)=>(request.headers.get('cookie')||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(name+'='))?.slice(name.length+1)||'';
const validToken=value=>typeof value==='string'&&/^[a-f0-9]{64}$/.test(value);
const validEmail=value=>typeof value==='string'&&value.length<=254&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
function settings(env){try{const origin=new URL(env.PEOPLE_ORGANISED_AUTH_ORIGIN||'https://admin.peopleorganised.com');if(origin.protocol!=='https:'||origin.username||origin.password||origin.pathname!=='/'||origin.search||origin.hash)throw new Error();const secret=env.GUARDIAN_IDENTITY_SECRET?.trim();return secret?.length>=32?{origin:origin.origin,secret}:null;}catch{return null;}}
export class PeopleAuthUnavailable extends Error {constructor(){super('People Organised sign-in is temporarily unavailable. Please try again.');this.name='PeopleAuthUnavailable';this.status=503;}}
function verifiedGuardianAccess(access){
 const value=access?.monthlyCases,paid=access?.paidMonitoring===true&&Number.isInteger(value)&&value>=6&&value<=1000;
 return {unlimited:access?.unlimited===true,paidMonitoring:paid,...(paid?{monthlyCases:value}:{})};
}
function identity(row){if(!row||typeof row.id!=='string'||!row.id||row.id.length>100||!validEmail(row.email))return null;return {ownerId:'people:'+row.id,peopleOrganisedId:row.id,email:row.email,name:typeof row.name==='string'?row.name:'',peopleprintId:typeof row.peopleprintId==='string'?row.peopleprintId:null,guardianAccess:verifiedGuardianAccess(row.guardianAccess)};}
async function boundedJson(response,limit=8192){const reader=response.body?.getReader();if(!reader)throw new Error();const chunks=[];let n=0;for(;;){const {value,done}=await reader.read();if(done)break;n+=value.length;if(n>limit){await reader.cancel();throw new Error();}chunks.push(value);}const data=new Uint8Array(n);let p=0;for(const c of chunks){data.set(c,p);p+=c.length;}return JSON.parse(new TextDecoder().decode(data));}
function bridgeTimeout(ms){
  if(typeof AbortSignal.timeout==='function')return {signal:AbortSignal.timeout(ms),dispose(){}};
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),ms);
  return {signal:controller.signal,dispose(){clearTimeout(timer);}};
}
function bridgeDiagnostic(error,{stage,action,status,contentType,secret,body}){
  // JSON.parse errors can quote response content. Never log their message.
  let message=stage==='fetch'&&typeof error?.message==='string'?error.message:'Upstream response unavailable or invalid.';
  for(const value of [secret,...Object.values(body).filter(value=>typeof value==='string'&&value.length)])message=message.split(value).join('[redacted]');
  message=message.replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,'[email]').replace(/[a-f0-9]{32,}/gi,'[token]').slice(0,240);
  const name=String(error?.name||'Error').replace(/[^A-Za-z0-9_-]/g,'').slice(0,60);
  console.warn('Guardian identity bridge failed',JSON.stringify({stage,action,status,contentType,errorName:name,errorMessage:message}));
}
async function call(env,action,body,fetcher=fetch){
  const config=settings(env);if(!config)throw new PeopleAuthUnavailable();
  let stage='fetch',status=null,contentType=null,timeout;
  try{
    timeout=bridgeTimeout(10000);
    const response=await fetcher(config.origin+'/api/guardian/auth/'+action,{method:'POST',redirect:'manual',signal:timeout.signal,headers:{'Content-Type':'application/json','x-guardian-identity-key':config.secret},body:JSON.stringify(body)});
    status=response.status;contentType=response.headers.get('content-type')?.match(/^[a-z0-9.+-]+\/[a-z0-9.+-]+/i)?.[0]||null;
    if(response.status>=300&&response.status<400){stage='redirect';throw new PeopleAuthUnavailable();}
    stage='parse';const result=await boundedJson(response);stage='response';
    if(!result||typeof result!=='object'||Array.isArray(result))throw new PeopleAuthUnavailable();
    if(response.status>=500)throw new PeopleAuthUnavailable();
    return {status:response.status,data:result};
  }catch(error){bridgeDiagnostic(error,{stage,action,status,contentType,secret:config.secret,body});throw new PeopleAuthUnavailable();}
  finally{timeout?.dispose();}
}
export async function resolvePeopleIdentity(request,env,options={}){const token=readCookie(request,SESSION_COOKIE);if(!validToken(token))return null;const result=await call(env,'session',{token},options.fetcher);if(result.status===401||result.status===403)return null;if(result.status!==200)throw new PeopleAuthUnavailable();const user=identity(result.data.identity);if(!user)throw new PeopleAuthUnavailable();return user;}

// Only a server-verified contact binding may provide this canonical owner ID.
// The private service rechecks suspension and current entitlements on every event.
export async function resolvePeopleAccess(ownerId,env,options={}){
  if(typeof ownerId!=='string'||!ownerId.startsWith('people:')||ownerId.length<=7)return null;
  const id=ownerId.slice(7),result=await call(env,'access',{id},options.fetcher);
  if(options.strictBridge&&[401,403].includes(result.status))throw new PeopleAuthUnavailable();
  if([401,403,404].includes(result.status))return null;
  if(result.status!==200||result.data.id!==id)throw new PeopleAuthUnavailable();
  return {ownerId,peopleOrganisedId:id,guardianAccess:verifiedGuardianAccess(result.data.guardianAccess)};
}

export async function handlePeopleAuthRequest(request,env,options={}){
  const url=new URL(request.url),path=url.pathname;
  if(!['/api/auth/config','/api/auth/session','/api/auth/request-code','/api/auth/verify','/api/auth/logout','/api/auth/profile'].includes(path))return null;
  try{
    if(path==='/api/auth/config'&&request.method==='GET'){
      if(!settings(env))return json({emailCodeReady:false});
      const result=await call(env,'status',{},options.fetcher);
      return json({emailCodeReady:result.status===200&&result.data.emailCodeReady===true});
    }
    if(path==='/api/auth/session'&&request.method==='GET')return json({identity:await resolvePeopleIdentity(request,env,options)});
    if(request.method!=='POST')return json({error:'Method not allowed.'},405);
    if(request.headers.get('origin')!==url.origin||!['same-origin','none',null].includes(request.headers.get('sec-fetch-site')))return json({error:'Request origin rejected.'},403);
    if(!request.headers.get('content-type')?.includes('application/json'))return json({error:'JSON required.'},415);
    let body;try{body=await boundedJson(request);}catch{return json({error:'Invalid request.'},400);}
    if(!body||typeof body!=='object'||Array.isArray(body))return json({error:'Invalid request.'},400);
    const ip=request.headers.get('cf-connecting-ip')||'unknown';
    if(path==='/api/auth/request-code'){
      const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
      if(!validEmail(email))return json({error:'Enter a valid email address.'},400);
      const source=body.linkPrevious===true?previousLogin(request):null;
      if(body.linkPrevious===true&&email!==source?.email)return json({error:'Use your earlier Guardian browser and email.'},409);
      const flow=random();const result=await call(env,'request-code',{email,flowHash:await hash(source?JSON.stringify(['merge',source.owner,flow]):flow),ip},options.fetcher);
      if(result.status!==200)return json({error:result.data.error||'Unable to request a code.'},result.status);
      if(typeof result.data.challengeId!=='string'||!/^[a-f0-9-]{36}$/.test(result.data.challengeId))throw new PeopleAuthUnavailable();
      return json({ok:true,email,expiresIn:600},200,{'Set-Cookie':cookie(FLOW_COOKIE,flow+'.'+result.data.challengeId+(body.linkPrevious===true?'.merge':''),600)});
    }
    if(path==='/api/auth/verify'){
      const [flow,challengeId,purpose]=readCookie(request,FLOW_COOKIE).split('.');
      if((purpose==='merge')!==(body.linkPrevious===true))return json({error:'Request a fresh code for this action.'},400);
      if(!validToken(flow)||!challengeId)return json({error:'Request a new code in this browser.'},400);
      const email=typeof body.email==='string'?body.email.trim().toLowerCase():'';
      if(!/^\d{6}$/.test(body.code||''))return json({error:'Enter the six-digit code.'},400);
      if(body.remember!==undefined&&typeof body.remember!=='boolean')return json({error:'Choose whether to keep this browser signed in.'},400);
      const source=body.linkPrevious===true?previousLogin(request):null;
      if(body.linkPrevious===true&&email!==source?.email)return json({error:'Verify these accounts from your earlier Guardian browser.'},409);
      const remember=body.remember===true;
      const result=await call(env,'verify',{email,code:body.code,challengeId,flowHash:await hash(source?JSON.stringify(['merge',source.owner,flow]):flow),ip,remember},options.fetcher);
      if(result.status!==200)return json({error:result.data.error||'The code could not be verified.'},result.status);
      const user=identity(result.data.identity);
      if(!user||!validToken(result.data.token))throw new PeopleAuthUnavailable();
      if(body.linkPrevious===true){
        if(email.toLowerCase()!==user.email.toLowerCase())return json({error:'This code verified a different account.'},403);
        await mergeVerifiedLogins(request,env.DB,user);
      }
      // A transient mail-index failure must not consume a valid login code.
      // The authenticated session and Connections both retry this operation.
      try{await registerVerifiedEmailSender(env,user);}catch{console.warn('Guardian email registration will retry');}
      const response=json({ok:true,redirectTo:'/workspace',identity:user});
      response.headers.append('Set-Cookie',cookie(SESSION_COOKIE,result.data.token,remember?7*24*60*60:undefined));
      response.headers.append('Set-Cookie',cookie(HOSTING_FALLBACK_BLOCK_COOKIE,'1',365*24*60*60));
      response.headers.append('Set-Cookie',cookie(FLOW_COOKIE,'',0));return response;
    }
    const token=readCookie(request,SESSION_COOKIE);
    if(path==='/api/auth/logout'){
      let status=200;
      try{if(validToken(token)){const result=await call(env,'logout',{token},options.fetcher);if(result.status!==200)status=503;}}catch{status=503;}
      const response=json(status===200?{ok:true}:{error:'You are signed out on this browser. Remote session revocation could not be confirmed.',signedOutLocally:true},status);
      response.headers.append('Set-Cookie',cookie(HOSTING_FALLBACK_BLOCK_COOKIE,'1',365*24*60*60));
      response.headers.append('Set-Cookie',cookie(SESSION_COOKIE,'',0));response.headers.append('Set-Cookie',cookie(FLOW_COOKIE,'',0));return response;
    }
    if(path==='/api/auth/profile'){
      if(!validToken(token))return json({error:'Sign in first.'},401);
      const result=await call(env,'profile',{token,name:body.name},options.fetcher);
      if(result.status!==200)return json({error:result.data.error||'Profile update failed.'},result.status);
      const user=identity(result.data.identity);
      if(!user)throw new PeopleAuthUnavailable();
      return json({identity:user});
    }
    return json({error:'Not found.'},404);
  }catch(error){if(error instanceof MergeConflict)return json({error:error.message},409);if(error instanceof PeopleAuthUnavailable)return json({error:error.message,emailCodeReady:false},503);throw error;}
}

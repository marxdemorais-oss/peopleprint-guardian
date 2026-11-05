import test from 'node:test';
import assert from 'node:assert/strict';
import {handlePeopleAuthRequest,resolvePeopleIdentity,PeopleAuthUnavailable} from '../worker/people-auth.js';
const env={GUARDIAN_IDENTITY_SECRET:'s'.repeat(64),PEOPLE_ORGANISED_AUTH_ORIGIN:'https://admin.peopleorganised.com'};
const token='a'.repeat(64),nonce='b'.repeat(64),challenge='abcdef12-abcd-1234-1234-123456789012';
const request=(path,body={},cookie='')=>new Request('https://guardian.peopleorganised.com'+path,{method:'POST',headers:{Origin:'https://guardian.peopleorganised.com','Content-Type':'application/json',Cookie:cookie},body:JSON.stringify(body)});
test('email-code config stays unavailable with no configured private bridge',async()=>{
 const result=await handlePeopleAuthRequest(new Request('https://guardian.peopleorganised.com/api/auth/config'),{});
 assert.deepEqual(await result.json(),{emailCodeReady:false});
});
test('requesting code keeps browser-bound nonce HttpOnly and secrets server-side',async()=>{
 let outgoing;
 const response=await handlePeopleAuthRequest(request('/api/auth/request-code',{email:'Customer@example.test'}),env,{fetcher:async(url,init)=>{outgoing={url,init};return Response.json({ok:true,challengeId:challenge});}});
 assert.equal(response.status,200);assert.match(response.headers.get('set-cookie'),/__Host-wolfgang_flow=.*HttpOnly; Secure; SameSite=Strict/);
 const body=await response.json();assert.equal(body.email,'customer@example.test');assert.equal(body.challengeId,undefined);assert.equal(body.flowHash,undefined);
 assert.equal(outgoing.init.redirect,'manual');assert.equal(outgoing.init.headers['x-guardian-identity-key'],env.GUARDIAN_IDENTITY_SECRET);assert.equal(JSON.parse(outgoing.init.body).flowHash.length,64);
});
test('verification returns canonical identity without exposing session token',async()=>{
 const result=await handlePeopleAuthRequest(request('/api/auth/verify',{email:'customer@example.test',code:'123456'},`__Host-wolfgang_flow=${nonce}.${challenge}`),env,{fetcher:async()=>Response.json({token,identity:{id:'account-1',email:'customer@example.test',name:'Alex'},expiresAt:new Date(Date.now()+60000).toISOString()})});
 const body=await result.json();assert.equal(body.identity.ownerId,'people:account-1');assert.equal(body.token,undefined);assert.equal(result.headers.getSetCookie().length,3);
});
test('cross-origin code submission is refused before any upstream call',async()=>{
 const req=request('/api/auth/request-code',{email:'c@example.test'});req.headers.set('origin','https://other.example');
 const response=await handlePeopleAuthRequest(req,env,{fetcher:()=>{throw new Error('must not be called');}});assert.equal(response.status,403);
});
test('canonical-session outage fails closed and does not use hosting identity',async()=>{
 const req=request('/api/profile',{},`__Host-wolfgang_session=${token}`);req.headers.set('oai-authenticated-user-id','old-id');
 await assert.rejects(resolvePeopleIdentity(req,env,{fetcher:async()=>{throw new Error('offline');}}),PeopleAuthUnavailable);
});
test('invalid endpoint configuration cannot exfiltrate a bridge secret via redirect or credentials',async()=>{
 const req=request('/api/auth/request-code',{email:'c@example.test'});
 const response=await handlePeopleAuthRequest(req,{...env,PEOPLE_ORGANISED_AUTH_ORIGIN:'http://user:pass@other.example/path'},{fetcher:()=>{throw new Error('must not be called');}});assert.equal(response.status,503);
});

test('only strict unlimited entitlement from the canonical session service is retained',async()=>{
 const req=request('/api/profile',{guardianAccess:{unlimited:true}},`__Host-wolfgang_session=${token}`);
 for(const value of [true,false,'true',undefined]){
  const user=await resolvePeopleIdentity(req,env,{fetcher:async()=>Response.json({identity:{id:'account-1',email:'customer@example.test',guardianAccess:{unlimited:value}}})});
  assert.equal(user.guardianAccess.unlimited,value===true);assert.equal(user.ownerId,'people:account-1');
 }
});

test('verified contact access resolves the same canonical subject and fails closed on mismatch',async()=>{
 const {resolvePeopleAccess}=await import('../worker/people-auth.js');let sent;
 const user=await resolvePeopleAccess('people:account-1',env,{fetcher:async(url,init)=>{sent={url,body:JSON.parse(init.body)};return Response.json({id:'account-1',guardianAccess:{unlimited:true}});}});
 assert.equal(sent.url,'https://admin.peopleorganised.com/api/guardian/auth/access');assert.deepEqual(sent.body,{id:'account-1'});assert.equal(user.guardianAccess.unlimited,true);
 assert.equal(await resolvePeopleAccess('people:account-1',env,{fetcher:async()=>Response.json({}, {status:404})}),null);
 await assert.rejects(resolvePeopleAccess('people:account-1',env,{fetcher:async()=>Response.json({id:'account-2',guardianAccess:{unlimited:true}})}),PeopleAuthUnavailable);
});

test('identity timeout has an AbortController fallback when runtime timeout helper is absent',async()=>{
 const descriptor=Object.getOwnPropertyDescriptor(AbortSignal,'timeout');let received;
 try{
  Object.defineProperty(AbortSignal,'timeout',{configurable:true,value:undefined});
  const response=await handlePeopleAuthRequest(new Request('https://guardian.peopleorganised.com/api/auth/config'),env,{fetcher:async(url,init)=>{received=init.signal;return Response.json({emailCodeReady:true});}});
  assert.deepEqual(await response.json(),{emailCodeReady:true});assert.equal(received.aborted,false);assert.ok(received instanceof AbortSignal);
 }finally{Object.defineProperty(AbortSignal,'timeout',descriptor);}
});

test('bridge diagnostics identify fetch versus parse failures without logging secrets or identity material',async()=>{
 const original=console.warn,logs=[];console.warn=(...parts)=>logs.push(parts.join(' '));
 try{
  const requestCode=request('/api/auth/request-code',{email:'private-customer@example.test'});
  const fetchFailure=await handlePeopleAuthRequest(requestCode,env,{fetcher:async()=>{throw new TypeError('Fetch failed1042 '+env.GUARDIAN_IDENTITY_SECRET+' private-customer@example.test');}});
  assert.equal(fetchFailure.status,503);assert.match(logs[0],/"stage":"fetch"/);assert.match(logs[0],/1042/);assert.ok(!logs[0].includes(env.GUARDIAN_IDENTITY_SECRET));assert.ok(!logs[0].includes('private-customer'));
  const parseFailure=await handlePeopleAuthRequest(new Request('https://guardian.peopleorganised.com/api/auth/config'),env,{fetcher:async()=>new Response('private-response-identity@example.test secret response',{status:502,headers:{'content-type':'text/html'}})});
  assert.equal(parseFailure.status,503);assert.match(logs[1],/"stage":"parse"/);assert.match(logs[1],/"status":502/);assert.match(logs[1],/"contentType":"text\/html"/);assert.ok(!logs[1].includes('private-response'));assert.ok(!logs[1].includes('secret response'));
 }finally{console.warn=original;}
});

test('edge-compatible manual redirects refuse upstream relocation without forwarding identity credentials',async()=>{
 let calls=0;
 const response=await handlePeopleAuthRequest(new Request('https://guardian.peopleorganised.com/api/auth/config'),env,{fetcher:async(url,init)=>{
  calls++;assert.equal(url,'https://admin.peopleorganised.com/api/guardian/auth/status');assert.equal(init.redirect,'manual');
  return Response.json({emailCodeReady:true},{status:307,headers:{location:'https://untrusted.example/collect'}});
 }});
 assert.equal(response.status,503);assert.equal((await response.json()).emailCodeReady,false);assert.equal(calls,1);
});

test('malformed JSON bridge payloads fail closed across sign-in and account access',async t=>{
 t.mock.method(console,'warn',()=>{});
 const {resolvePeopleAccess}=await import('../worker/people-auth.js');
 for(const payload of [null,[],true,'unexpected']){
  const fetcher=async()=>Response.json(payload);
  for(const incoming of [
   new Request('https://guardian.peopleorganised.com/api/auth/config'),
   request('/api/auth/request-code',{email:'customer@example.test'}),
   request('/api/auth/verify',{email:'customer@example.test',code:'123456'},`__Host-wolfgang_flow=${nonce}.${challenge}`),
   request('/api/auth/profile',{name:'Alex'},`__Host-wolfgang_session=${token}`)
  ]){
   const result=await handlePeopleAuthRequest(incoming,env,{fetcher});
   assert.equal(result.status,503);assert.equal(result.headers.get('set-cookie'),null);
  }
  await assert.rejects(resolvePeopleIdentity(request('/api/profile',{},`__Host-wolfgang_session=${token}`),env,{fetcher}),PeopleAuthUnavailable);
  await assert.rejects(resolvePeopleAccess('people:account-1',env,{fetcher}),PeopleAuthUnavailable);
 }
});

test('a profile write requires a valid canonical identity before reporting success',async()=>{
 for(const account of [undefined,{id:'account-1',email:''},{id:'account-1',email:'not an email'}]){
  const result=await handlePeopleAuthRequest(request('/api/auth/profile',{name:'Alex'},`__Host-wolfgang_session=${token}`),env,{fetcher:async()=>Response.json({identity:account})});
  assert.equal(result.status,503);assert.equal((await result.json()).identity,undefined);
 }
 const result=await handlePeopleAuthRequest(request('/api/auth/profile',{name:'A'},`__Host-wolfgang_session=${token}`),env,{fetcher:async()=>Response.json({identity:{id:'account-1',email:'customer@example.test',name:'A'}})});
 assert.equal(result.status,200);assert.equal((await result.json()).identity.name,'A');
});

test('canonical sessions and successful verification require a usable email identity',async()=>{
 for(const email of ['', 'invalid', 'customer @example.test']){
  const fetcher=async()=>Response.json({token,identity:{id:'account-1',email}});
  await assert.rejects(resolvePeopleIdentity(request('/api/profile',{},`__Host-wolfgang_session=${token}`),env,{fetcher}),PeopleAuthUnavailable);
  const verified=await handlePeopleAuthRequest(request('/api/auth/verify',{email:'customer@example.test',code:'123456'},`__Host-wolfgang_flow=${nonce}.${challenge}`),env,{fetcher});
  assert.equal(verified.status,503);assert.equal(verified.headers.get('set-cookie'),null);
 }
});

test('seven-day persistence is opt-in and malformed preferences never reach the identity service',async()=>{
 for(const remember of [undefined,false,true]){let sent;const body={email:'customer@example.test',code:'123456',...(remember===undefined?{}:{remember})};const result=await handlePeopleAuthRequest(request('/api/auth/verify',body,`__Host-wolfgang_flow=${nonce}.${challenge}`),env,{fetcher:async(url,init)=>{sent=JSON.parse(init.body);return Response.json({token,identity:{id:'account-1',email:'customer@example.test'}})}});assert.equal(result.status,200);assert.equal(sent.remember,remember===true);const cookie=result.headers.getSetCookie().find(v=>v.startsWith('__Host-wolfgang_session='));if(remember===true)assert.match(cookie,/Max-Age=604800/);else assert(!cookie.includes('Max-Age=')&&!cookie.includes('Expires='));assert.match(cookie,/HttpOnly; Secure; SameSite=Strict/);}
 for(const remember of ['true',1,null,{},[]]){const r=await handlePeopleAuthRequest(request('/api/auth/verify',{email:'customer@example.test',code:'123456',remember},`__Host-wolfgang_flow=${nonce}.${challenge}`),env,{fetcher:async()=>{throw Error('must not call')}});assert.equal(r.status,400);}
});
test('logout always clears local credentials and blocks hosting fallback even if remote revocation is unavailable',async()=>{
 const r=await handlePeopleAuthRequest(request('/api/auth/logout',{},`__Host-wolfgang_session=${token}`),env,{fetcher:async()=>new Response('{}',{status:500})});assert.equal(r.status,503);assert.equal((await r.json()).signedOutLocally,true);const cookies=r.headers.getSetCookie();assert(cookies.some(v=>v.startsWith('__Host-wolfgang_session=;')&&v.includes('Max-Age=0')));assert(cookies.some(v=>v.startsWith('__Host-wolfgang_signed_out=1;')&&v.includes('HttpOnly')));
 const {default:worker}=await import('../worker/server.js');const previousAssets=globalThis.publicAssets;globalThis.publicAssets={};try{const response=await worker.fetch(new Request('https://guardian.peopleorganised.com/api/session',{headers:{Cookie:'__Host-wolfgang_signed_out=1','oai-authenticated-user-id':'legacy-user','oai-authenticated-user-email':'legacy@example.test'}}),{});assert.equal((await response.json()).authenticated,false);}finally{globalThis.publicAssets=previousAssets;}
});

test('choosing canonical sign-in keeps hosting fallback blocked after the browser-only session cookie disappears',async()=>{
 const verified=await handlePeopleAuthRequest(request('/api/auth/verify',{email:'customer@example.test',code:'123456',remember:false},`__Host-wolfgang_flow=${nonce}.${challenge}`),env,{fetcher:async()=>Response.json({token,identity:{id:'account-1',email:'customer@example.test'}})});
 const marker=verified.headers.getSetCookie().find(cookie=>cookie.startsWith('__Host-wolfgang_signed_out='));assert(marker?.startsWith('__Host-wolfgang_signed_out=1;'));assert.match(marker,/Max-Age=31536000; HttpOnly; Secure; SameSite=Strict/);
 const {default:worker}=await import('../worker/server.js'),previousAssets=globalThis.publicAssets;globalThis.publicAssets={};
 try{const r=await worker.fetch(new Request('https://guardian.peopleorganised.com/api/session',{headers:{Cookie:marker.split(';')[0],'oai-authenticated-user-id':'legacy-user','oai-authenticated-user-email':'legacy@example.test'}}),{});assert.equal((await r.json()).authenticated,false);}finally{globalThis.publicAssets=previousAssets;}
});

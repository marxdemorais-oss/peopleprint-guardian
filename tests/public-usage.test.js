import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {reservePublicUsage,previewCookie,previewState,deliverPreview,verifyVoiceReply} from '../worker/public-usage.js';
function fixture(){
  const sql=new DatabaseSync(':memory:');sql.exec('CREATE TABLE guardian_rate_limits(bucket_key TEXT PRIMARY KEY,owner_id TEXT,count INTEGER,expires_at INTEGER)');
  function statement(query, values=[]) {
    return {
      bind(...args) { return statement(query,args); },
      async first() { return sql.prepare(query).get(...values) || null; },
      async all() { return {results:sql.prepare(query).all(...values)}; }
    };
  }
  return {sql,DB:{prepare:statement}};
}
const request=(ip,cookie='')=>new Request('https://guardian.test/api/wolfgang/chat',{headers:{'cf-connecting-ip':ip,cookie}});
const secret='test-only-public-usage-secret-long-enough';
const fresh=async(ip,env)=>request(ip,(await previewCookie(request(ip),env)).split(';')[0]);
test('durable ceiling is shared across visitors and concurrent callers',async()=>{
  const {sql,DB}=fixture(),env={DB,CONTACT_GATEWAY_SECRET:secret,WOLFGANG_PUBLIC_DAILY_LIMIT:'3',WOLFGANG_VISITOR_DAILY_LIMIT:'5'};
  const attempts=await Promise.all(Array.from({length:12},async(_,i)=>reservePublicUsage(await fresh('192.0.2.'+i,env),env,10000)));
  assert.equal(attempts.filter(r=>r.allowed).length,3);
  assert.equal(sql.prepare("SELECT count FROM guardian_rate_limits WHERE bucket_key='public-all:0'").get().count,3);
  assert.equal((await reservePublicUsage(await fresh('192.0.2.99',env),env,86410000)).allowed,true);sql.close();
});
test('visitor ceiling persists across requests and stores no raw address',async()=>{
  const {sql,DB}=fixture(),env={DB,CONTACT_GATEWAY_SECRET:secret,WOLFGANG_PUBLIC_DAILY_LIMIT:'10',WOLFGANG_VISITOR_DAILY_LIMIT:'2'},r=await fresh('2001:db8::7',env);
  assert.deepEqual(await reservePublicUsage(r,env,10000),{allowed:true});
  assert.deepEqual(await reservePublicUsage(r,env,10000),{allowed:true});
  for(let i=0;i<5;i++)assert.equal((await reservePublicUsage(r,env,10000)).allowed,true);
  assert.equal((await reservePublicUsage(r,env,10000)).allowed,false);
  assert.equal(sql.prepare("SELECT count FROM guardian_rate_limits WHERE bucket_key='public-all:0'").get().count,7);
  assert(!JSON.stringify(sql.prepare('SELECT * FROM guardian_rate_limits').all()).includes('2001:db8::7'));
  sql.close();
});
test('missing storage, invalid settings and database failures refuse paid calls',async()=>{
  assert.deepEqual(await reservePublicUsage(request('x'),{}),{allowed:false,unavailable:true});
  const {sql,DB}=fixture();
  assert.deepEqual(await reservePublicUsage(request('x'),{DB,CONTACT_GATEWAY_SECRET:secret,WOLFGANG_PUBLIC_DAILY_LIMIT:'invalid'}),{allowed:false,unavailable:true});
  assert.deepEqual(await reservePublicUsage(request('x'),{DB,CONTACT_GATEWAY_SECRET:secret,WOLFGANG_PUBLIC_DAILY_LIMIT:'0'}),{allowed:false});
  sql.close();
  assert.deepEqual(await reservePublicUsage(await fresh('x',{CONTACT_GATEWAY_SECRET:secret}),{DB,CONTACT_GATEWAY_SECRET:secret}),{allowed:false,unavailable:true});
});
test('only two social replies across tabs and days; no guest cookie ever grants a case',async()=>{
 const {sql,DB}=fixture(),env={DB,CONTACT_GATEWAY_SECRET:secret};
 const r=await fresh('a',env),cookie=r.headers.get('cookie');
 assert.equal(await previewCookie(request('b',cookie),env),null);
 assert.equal((await reservePublicUsage(request('c',cookie+'x'),env)).needsCookie,true);
 const state=await previewState(r,env,{},10000);
 assert.equal((await deliverPreview(DB,state,'case')).allowed,false);
 const turns=await Promise.all(Array.from({length:5},()=>deliverPreview(DB,state,'social')));
 assert.deepEqual(turns.filter(v=>v.allowed).map(v=>v.remaining).sort(),[0,1]);
 assert.equal((await previewState(request('b',cookie),env,{},3*86400000)).social,2);
 assert.equal((await deliverPreview(DB,await previewState(await fresh('b',env),env,{}),'case')).allowed,false);
 sql.close();
});

const base='https://guardian.test';
const provider={GUARDIAN_PROVIDER:'meta',GUARDIAN_MODEL:'muse-spark-1.3',GUARDIAN_API_KEY:'fixture',GUARDIAN_COMPLEX_MODEL:'muse-wonder-1.0'};
const mockAnswer=(model,reply='Hello!',previewKind='case')=>Response.json({model,status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({reply,intent:'attending',previewKind})}]}]});
async function ask(body,env,ip,cookie=''){
 const {default:worker}=await import('../worker/server.js');
 const response=await worker.fetch(new Request(base+'/api/wolfgang/chat',{method:'POST',headers:{origin:base,'Content-Type':'application/json','cf-connecting-ip':ip,cookie},body:JSON.stringify(typeof body==='string'?{message:body}:body)}),env);
 return {status:response.status,...await response.json()};
}
test('a case cannot reach inference, guidance or first-look fallback, with a missing, fresh or reset cookie and during an outage',async()=>{
 const {sql,DB}=fixture(),env={DB,CONTACT_GATEWAY_SECRET:secret,...provider};
 const original=globalThis.fetch;let requests=0;
 globalThis.fetch=async()=>{requests++;return new Response(null,{status:503});};
 try{
  const sensitive='The caller knows my employer and asked me to read out my verification code.';
  const previous=[{role:'user',content:sensitive},{role:'assistant',content:'Private previous turn.'}];
  const queries=[sensitive,{message:'Please be brief. '+sensitive},{message:'Keep it brief',styleChange:{reset:true}},{message:'What should I do now?',history:previous},{preset:'checks',message:sensitive},{message:'Tell me a joke. '+sensitive},{message:'How does Guardian work? '+sensitive},{message:'My invoice says pay now.',previewKind:'product',signedIn:true}];
  for(const [i,query] of queries.entries()){
   const replacement=await fresh('b',env),cookie=i%2?replacement.headers.get('cookie'):'';
   const result=await ask(query,i===0?{}:env,'203.0.113.'+(50+i),cookie);
   assert.equal(result.status,401);assert.equal(result.code,'SIGN_IN_REQUIRED');assert.equal(result.link.path,'/signup');
   assert.equal(result.reply,undefined);assert.equal(result.officialGuidance,undefined);assert.equal(result.caseRemaining,undefined);
  }
  assert.equal(requests,0);assert.equal(sql.prepare('SELECT count(*) n FROM guardian_rate_limits').get().n,0);
 }finally{globalThis.fetch=original;sql.close();}
});

test('two generic social turns use authored prompts and a misleading provider label cannot alter their cost; product and demo remain open',async()=>{
 const {DB,sql}=fixture();sql.exec('CREATE TABLE guardian_voice_editions(id INTEGER,body TEXT,kind TEXT)');
 const env={DB,CONTACT_GATEWAY_SECRET:secret,...provider},ip='203.0.113.61',visitor=await fresh(ip,env),cookie=visitor.headers.get('cookie');
 const original=globalThis.fetch,calls=[];
 globalThis.fetch=async(_,init)=>{const p=JSON.parse(init.body);calls.push(p);return mockAnswer(p.model);};
 try{
  const history=[{role:'user',content:'PRIVATE-A: my invoice was changed'},{role:'assistant',content:'PRIVATE-B'}];
  for(const message of ['Hi','I am fine thank you.']){
   const r=await ask({message,history},env,ip,cookie);assert.equal(r.status,200);assert.equal(r.caseRemaining,undefined);
   assert.doesNotMatch(JSON.stringify(calls.at(-1)),/PRIVATE-[AB]/);assert.equal(calls.at(-1).model,'muse-spark-1.3-contributor');
  }
  assert.equal((await ask('Tell me a joke',env,ip,cookie)).code,'PREVIEW_COMPLETE');
  assert.equal((await ask('I just want to keep chatting',env,ip,cookie)).code,'PREVIEW_COMPLETE');
  const demo=await ask('Show me a demo',env,ip,cookie);assert.equal(demo.status,200);assert.equal(demo.link.path,'/demo');
  const comparison=await ask('What will you do different to standard fraud checkers',env,ip,cookie);assert.match(comparison.reply,/actually agreed/);
  const real=await ask('I got a suspicious invoice.',env,ip,cookie);assert.equal(real.code,'SIGN_IN_REQUIRED');
  assert.equal((await previewState(visitor,env,{})).social,2);assert.equal(calls.length,2);
 }finally{globalThis.fetch=original;sql.close();}
});

test('an unavailable provider has a bounded greeting fallback and authored product answers',async()=>{
 const {DB,sql}=fixture();sql.exec('CREATE TABLE guardian_voice_editions(id INTEGER,body TEXT,kind TEXT)');
 const env={DB,CONTACT_GATEWAY_SECRET:secret,...provider},ip='203.0.113.62',visitor=await fresh(ip,env),cookie=visitor.headers.get('cookie');
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async()=>{calls++;return new Response(null,{status:503});};
 try{
  const a=await ask('Hi',env,ip,cookie),b=await ask({message:'Hi',history:[{role:'user',content:'Hi'},{role:'assistant',content:a.reply}]},env,ip,cookie);
  assert.equal(a.status,200);assert.equal(b.status,200);assert.notEqual(a.reply,b.reply);assert.equal((await ask('Hi',env,ip,cookie)).status,429);
  assert.equal(calls,2);assert.equal((await previewState(visitor,env,{})).social,2);
  const demo=await ask('Show me a demo',{},ip);assert.equal(demo.link.path,'/demo');assert.equal(calls,2);
 }finally{globalThis.fetch=original;sql.close();}
});

test('signed-in customers can keep talking about general topics; only explicit saved checks can assess a case, even with unlimited access',async()=>{
 const {DB,sql}=fixture();sql.exec('CREATE TABLE guardian_voice_editions(id INTEGER,body TEXT,kind TEXT); CREATE TABLE guardian_profiles(owner_id TEXT PRIMARY KEY,conversation_style TEXT)');
 const env={DB,CONTACT_GATEWAY_SECRET:secret,...provider,PEOPLE_ORGANISED_AUTH_ORIGIN:'https://admin.peopleorganised.com',GUARDIAN_IDENTITY_SECRET:'s'.repeat(64)};
 const original=globalThis.fetch,models=[];let unlimited=false;
 globalThis.fetch=async(url,init)=>{
  if(new URL(url).pathname==='/api/guardian/auth/session')return Response.json({identity:{id:'member',email:'member@example.test',guardianAccess:{unlimited}}});
  const payload=JSON.parse(init.body);models.push(payload);
  return mockAnswer(payload.model,'Hello there!','social');
 };
 const cookie='__Host-wolfgang_session='+'a'.repeat(64),ip='203.0.113.64';
 try{
  for(const access of [false,true]){
   unlimited=access;
   const personal=await ask('Hi Wolfgang! A familiar caller asked me to share a PIN.',env,ip,cookie);
   assert.equal(personal.status,409);assert.equal(personal.code,'CHECK_REQUIRED');assert.equal(personal.link.path,'/workspace');assert.equal(personal.reply,undefined);
  }
  assert.equal(models.length,0);
  for(const message of ['Hi','How are you today?','Tell me a joke'])assert.equal((await ask(message,env,ip,cookie)).status,200);
  assert.deepEqual(models.map(x=>x.model),Array(3).fill('muse-spark-1.3-contributor'));
  assert.equal(sql.prepare("SELECT count FROM guardian_rate_limits WHERE bucket_key LIKE 'public-all:%'").get().count,3);
  assert.equal(sql.prepare("SELECT count(*) n FROM guardian_rate_limits WHERE bucket_key LIKE 'preview-reply:%'").get().n,0);
 }finally{globalThis.fetch=original;sql.close();}
});

test('even the legacy signed-in fictional simulation reserves the service budget for each model round',async()=>{
 const {default:worker}=await import('../worker/server.js');
 const {DB,sql}=fixture();sql.exec('CREATE TABLE guardian_merged_logins(legacy_owner TEXT PRIMARY KEY)');
 const env={DB,CONTACT_GATEWAY_SECRET:secret,MODEL_API_KEY:'fixture',WOLFGANG_PUBLIC_DAILY_LIMIT:'1'};
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async(_,init)=>{
  calls++;assert.doesNotMatch(init.body,/private-marker/);
  return Response.json({status:'completed',output:[{type:'function_call',name:'lookup_contact',call_id:'c1',arguments:'{}'}]});
 };
 try{
  const response=await worker.fetch(new Request(base+'/api/analyse',{method:'POST',headers:{origin:base,'Content-Type':'application/json','oai-authenticated-user-id':'legacy-user','oai-authenticated-user-email':'test@example.test'},body:JSON.stringify({id:'invoice',consent:true,message:'private-marker'})}),env);
  assert.equal(response.status,429);assert.equal((await response.json()).code,'RATE_LIMIT');assert.equal(calls,1);
 }finally{globalThis.fetch=original;sql.close();}
});

test('guest speech accepts only an unexpired exact reply issued to the same browser and calls no remote service for arbitrary text',async()=>{
 const {default:worker}=await import('../worker/server.js');
 const {sql,DB}=fixture(),env={DB,CONTACT_GATEWAY_SECRET:secret,WOLFGANG_TTS_URL:'https://voice.example/api',WOLFGANG_TTS_ALLOWED_API_ORIGINS:'https://voice.example',WOLFGANG_TTS_API_KEY:'fixture',WOLFGANG_TTS_MODEL:'voice-model',WOLFGANG_TTS_VOICE:'voice'};
 const ip='203.0.113.90',visitor=await fresh(ip,env),cookie=visitor.headers.get('cookie'),other=(await fresh(ip,env)).headers.get('cookie');
 const original=globalThis.fetch,speech=[];
 globalThis.fetch=async(_,init)=>{speech.push(JSON.parse(init.body).input);return new Response(Uint8Array.from([0,1,2]),{headers:{'content-type':'audio/mpeg'}});};
 const read=(text,voiceProof,withCookie=cookie)=>worker.fetch(new Request(base+'/api/wolfgang/voice',{method:'POST',headers:{origin:base,'Content-Type':'application/json','cf-connecting-ip':ip,cookie:withCookie},body:JSON.stringify({text,voiceProof})}),env);
 try{
  const {reply,voiceProof}=await ask('Show me the demo',env,ip,cookie);assert.match(voiceProof,/^\d{13}\.[a-f0-9]{64}$/);
  assert.equal(await verifyVoiceReply(visitor,env,{},reply,voiceProof,Number(voiceProof.split('.')[0])),false);
  for(const [text,proof,token] of [['private caller text',undefined,cookie],['private caller text',voiceProof,cookie],[reply,voiceProof,other],[reply,voiceProof,'']]){
   assert.equal((await read(text,proof,token)).status,403);
  }
  assert.deepEqual(speech,[]);assert.equal((await read(reply,voiceProof)).status,200);assert.deepEqual(speech,[reply]);
 }finally{globalThis.fetch=original;sql.close();}
});

test('a legacy hosting identity needs email verification before any personal website check mutation',async()=>{
 const {default:worker}=await import('../worker/server.js'),legacy={'oai-authenticated-user-id':'prior-owner','oai-authenticated-user-email':'earlier@example.test'};
 const {sql,DB}=fixture();sql.exec('CREATE TABLE guardian_merged_logins(legacy_owner TEXT PRIMARY KEY)');
 const env={DB,CONTACT_GATEWAY_SECRET:secret,...provider};
 const saved=globalThis.fetch;let calls=0;
 globalThis.fetch=()=>{calls++;throw Error('Must not reach model or identity bridge');};
 try{
  for(const [method,path] of [['POST','/api/checks'],['PATCH','/api/checks/old'],['POST','/api/checks/old/assess'],['POST','/api/checks/old/replies'],['POST','/api/wolfgang/chat']]){
   const response=await worker.fetch(new Request(base+path,{method,headers:{origin:base,'cf-connecting-ip':'203.0.113.91','Content-Type':'application/json',...legacy},body:JSON.stringify({peopleOrganisedId:'forged',message:'My invoice demands a transfer.'})}),env);
   assert.equal(response.status,401);assert.equal((await response.json()).code,'SIGN_IN_REQUIRED');
  }
  assert.equal(calls,0);
 }finally{globalThis.fetch=saved;sql.close();}
});

test('guided first check shares the public budget and limits live fictional replies to three per browser',async()=>{
 const {DB,sql}=fixture();sql.exec('CREATE TABLE guardian_voice_editions(id INTEGER,body TEXT,kind TEXT)');
 const env={DB,CONTACT_GATEWAY_SECRET:secret,...provider},ip='203.0.113.140',r=await fresh(ip,env),cookie=r.headers.get('cookie');
 const original=globalThis.fetch,calls=[];
 globalThis.fetch=async(_,init)=>{const p=JSON.parse(init.body);calls.push(p);return Response.json({model:p.model,status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({reading:0})}]}]});};
 try{
  for(const preset of ['tour-invoice-overview','tour-invoice-familiar','tour-agreement-overview']){
    const reply=await ask({preset},env,ip,cookie);assert.equal(reply.tourSource,'live');assert.equal(reply.status,200);
  }
  assert.equal(calls[0].model,'muse-spark-1.3-contributor');assert.doesNotMatch(JSON.stringify(calls[0]),/1096/);
  assert.match(JSON.stringify(calls[2]),/1096/);
  const limited=await ask({preset:'tour-agreement-action'},env,ip,cookie);assert.equal(limited.tourSource,'prepared');
  const privateAttempt=await ask({preset:'tour-agreement-action',message:'My private invoice says send an access code to 123456'},env,ip,cookie);
  assert.equal(privateAttempt.code,'SIGN_IN_REQUIRED');assert.equal(calls.length,3);
  assert.equal((await previewState(r,env,{})).social,0);
 }finally{globalThis.fetch=original;sql.close();}
});
test('a tour reply with future information or an instruction to go ahead uses its stage-specific walkthrough',async()=>{
 const {DB,sql}=fixture();sql.exec('CREATE TABLE guardian_voice_editions(id INTEGER,body TEXT,kind TEXT)');
 const env={DB,CONTACT_GATEWAY_SECRET:secret,...provider},ip='203.0.113.142',r=await fresh(ip,env),cookie=r.headers.get('cookie');
 const original=globalThis.fetch;
 globalThis.fetch=async(_,init)=>mockAnswer(JSON.parse(init.body).model,'Go ahead and use the earlier account 1096.');
 try{
  const result=await ask({preset:'tour-invoice-overview'},env,ip,cookie);
  assert.equal(result.status,200);assert.equal(result.tourSource,'prepared');assert.doesNotMatch(result.reply,/1096|go ahead/i);
 }finally{globalThis.fetch=original;sql.close();}
});

test('the optional tour source verifies its known page without model spend and keeps real messages out',async()=>{
 const {DB,sql}=fixture(),env={DB,CONTACT_GATEWAY_SECRET:secret,...provider},ip='203.0.113.151';
 const cookie=(await fresh(ip,env)).headers.get('cookie');
 const url='https://www.takefive-stopfraud.org.uk/protect-yourself/invoice-and-mandate/';
 const quote="Always confirm the service provider's bank details directly with the company before you make a payment.";
 const orig=globalThis.fetch,queries=[];
 globalThis.fetch=async(endpoint,init)=>{
   if(endpoint===url)return new Response('<main><p>'+quote+'</p></main>',{headers:{'content-type':'text/html'}});
   const p=JSON.parse(init.body);queries.push(p.input);
   return Response.json({model:p.model,status:'completed',output:[
     {type:'web_search_call',status:'completed',results:[{url}]},
     {type:'message',content:[{type:'output_text',text:quote,annotations:[{type:'url_citation',url}]}]}]});
 };
 try{
   const bad=await ask({preset:'tour-agreement-source',message:'My invoice references SECRET123, please research it for me'},env,ip,cookie);
   assert.equal(bad.code,'SIGN_IN_REQUIRED');assert.equal(queries.length,0);
   const result=await ask({preset:'tour-agreement-source'},env,ip,cookie);
   assert.equal(result.tourSource,'official');assert.equal(result.publicResearch.url,url);assert.equal(result.publicResearch.quote,quote);
   assert.equal(queries.length,0);assert.equal(result.publicResearch.method,'direct_official_page');
 }finally{globalThis.fetch=orig;sql.close();}
});
test('completed small talk does not disable the fictional tour, and a spent tour allowance is identified without another model call',async()=>{
 const {DB,sql}=fixture();sql.exec('CREATE TABLE guardian_voice_editions(id INTEGER,body TEXT,kind TEXT)');
 const env={DB,CONTACT_GATEWAY_SECRET:secret,...provider},ip='203.0.113.155',visitor=await fresh(ip,env),cookie=visitor.headers.get('cookie');
 const before=await previewState(visitor,env,{});
 await deliverPreview(DB,before,'social');await deliverPreview(DB,before,'social');
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async(_,init)=>{calls++;return Response.json({model:JSON.parse(init.body).model,status:'completed',output:[{type:'message',content:[{type:'output_text',text:'{"reading":1}'}]}]});};
 try{
   for(let i=0;i<3;i++)assert.equal((await ask({preset:'tour-invoice-familiar'},env,ip,cookie)).tourSource,'live');
   const blocked=await ask({preset:'tour-agreement-action'},env,ip,cookie);assert.equal(blocked.tourSource,'prepared');assert.equal(blocked.tourReason,'limit');assert.equal(calls,3);
   assert.equal((await ask({message:'I was sent a real invoice. Please check it.'},env,ip,cookie)).status,401);
 }finally{globalThis.fetch=original;sql.close();}
});

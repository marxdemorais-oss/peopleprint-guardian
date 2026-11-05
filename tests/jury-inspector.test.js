import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {handleJuryAccess,juryCookieValid,juryReturn} from '../worker/jury-access.js';
import {handleProductRequest} from '../worker/product-service.js';
function database(){const sqlite=new DatabaseSync(':memory:');const journal=JSON.parse(readFileSync(new URL('../drizzle/meta/_journal.json',import.meta.url)));for(const {tag} of journal.entries)sqlite.exec(readFileSync(new URL('../drizzle/'+tag+'.sql',import.meta.url),'utf8'));const statement=(sql,values=[])=>({bind(...v){return statement(sql,v);},async first(){return sqlite.prepare(sql).get(...values)||null;},async all(){return {results:sqlite.prepare(sql).all(...values)};},async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...values).changes)}};},sql,values});return {sqlite,prepare:statement,async batch(list){sqlite.exec('BEGIN');try{const out=list.map(s=>/RETURNING/i.test(s.sql)?{results:sqlite.prepare(s.sql).all(...s.values)}:{meta:{changes:Number(sqlite.prepare(s.sql).run(...s.values).changes)}});sqlite.exec('COMMIT');return out;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};}
const origin='https://guardian.test';
test('jury entry requires the code, binds its signed cookie and cannot redirect outside Guardian',async()=>{
 const DB=database(),env={DB,GUARDIAN_JURY_MODE:'true',GUARDIAN_JURY_CODE:'synthetic-jury-entry-test'},now=Date.now();
 try{
  const gate=await handleJuryAccess(new Request(origin+'/workspace'),env,now);assert.equal(gate.status,303);assert.match(gate.headers.get('location'),/^\/jury/);
  const post=(code,source=origin)=>new Request(origin+'/api/jury/access',{method:'POST',headers:{origin:source,'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({code,return_to:'//evil.test'})});
  assert.equal((await handleJuryAccess(post('wrong'),env,now)).status,403);
  assert.equal((await handleJuryAccess(post(env.GUARDIAN_JURY_CODE,'https://evil.test'),env,now)).status,403);
  const accepted=await handleJuryAccess(post(env.GUARDIAN_JURY_CODE),env,now);assert.equal(accepted.status,303);assert.equal(accepted.headers.get('location'),'/workspace');assert.match(accepted.headers.get('set-cookie'),/Secure; HttpOnly; SameSite=Lax/);
  const request=new Request(origin+'/workspace',{headers:{cookie:accepted.headers.get('set-cookie').split(';')[0]}});
  assert(await juryCookieValid(request,env,now));assert.equal(await handleJuryAccess(request,env,now),null);
  assert.equal(await juryCookieValid(request,{...env,GUARDIAN_JURY_CODE:'replacement'},now),false);
  assert.equal(await juryCookieValid(request,env,now+8*86400000),false);
  assert.equal(await handleJuryAccess(new Request(origin+'/privacy'),env,now),null);
  for(const value of ['https://evil.test','//evil.test','/\\evil.test','/api/profile'])assert.equal(juryReturn(value),'/workspace');
  for(let i=0;i<20;i++)await handleJuryAccess(post('wrong'),env,now);
  assert.equal((await handleJuryAccess(post(env.GUARDIAN_JURY_CODE),env,now)).status,429);
 }finally{DB.sqlite.close();}
});
const alice={ownerId:'people:judge-a',peopleOrganisedId:'judge-a'},bob={ownerId:'people:judge-b',peopleOrganisedId:'judge-b'};
const verdict={status:'unresolved',headline:'The terms need comparison.',explanation:'The earlier agreement would help.',nextStep:'Add the agreement if you have it.',questions:['Can you add the earlier agreement?'],evidenceIds:[],reaction:'asking'};
async function call(env,path,method='GET',body,identity=alice,options={}){return handleProductRequest(new Request(origin+path,{method,headers:{origin,'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})}),env,identity,options);}
test('inspector streams actual progress, verifies signatures, isolates owners and deletes with the conversation',async()=>{
 const DB=database(),env={DB,GUARDIAN_JURY_MODE:'true',GUARDIAN_INSPECTOR_ENABLED:'true',GUARDIAN_IDENTITY_SECRET:'test-inspector-'.repeat(4),GUARDIAN_PROVIDER:'baseten',GUARDIAN_API_KEY:'test-fixture',GUARDIAN_MODEL:'test-model'};
 try{
  const draft=await (await call(env,'/api/checks','POST',{message:'Compare the Northline booking invoice.',channel:'email',evidence:[]})).json();const id=draft.check.id;
  let entered,release;const ready=new Promise(r=>entered=r),held=new Promise(r=>release=r);
  const pending=call(env,'/api/checks/'+id+'/assess','POST',{},alice,{fetcher:async()=>{entered();await held;return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(verdict)}}]});}});
  await ready;
  const stream=await call(env,'/api/checks/'+id+'/events');assert.match(stream.headers.get('content-type'),/text\/event-stream/);const data=JSON.parse((await stream.text()).split('data: ')[1].trim());assert.equal(data.integrity,'verified');assert.equal(data.events.at(-1).kind,'model_requested');assert.ok(!data.events.some(e=>e.kind==='saved'));
  assert.equal((await call(env,'/api/checks/'+id+'/inspection','GET',undefined,bob)).status,404);
  release();assert.equal((await pending).status,200);
  const saved=await (await call(env,'/api/checks/'+id+'/inspection')).json();assert.equal(saved.integrity,'verified');assert.equal(saved.events.at(-1).kind,'saved');assert.equal(saved.events.find(e=>e.kind==='model_requested').detail.input.message,draft.check.message);assert.ok(saved.events.some(e=>e.kind==='model_returned'));
  await call(env,'/api/checks/'+id+'/assess','POST',{},alice,{fetcher:async()=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(verdict)}}]})});
  const repeated=await(await call(env,'/api/checks/'+id+'/inspection')).json();assert.equal(repeated.integrity,'verified');assert.equal(repeated.events.filter(event=>event.kind==='saved').length,2);
  const exported=await(await call(env,'/api/privacy')).json();assert.equal(exported.inspectionEvents.length,repeated.events.length);
  DB.sqlite.prepare("UPDATE guardian_inspector_events SET detail_json='{}' WHERE check_id=? AND sequence=1").run(id);
  assert.equal((await(await call(env,'/api/checks/'+id+'/inspection')).json()).integrity,'failed');
  assert.equal((await call(env,'/api/checks/'+id,'DELETE')).status,200);assert.equal(DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_inspector_events').get().n,0);
 }finally{DB.sqlite.close();}
});
test('context preview reads only the current account and explains inferred relationships',async()=>{
 const DB=database(),env={DB,GUARDIAN_JURY_MODE:'true'};
 try{
  for(const [who,amount] of [[alice,'100'],[bob,'900']])assert.equal((await call(env,'/api/checks','POST',{message:'Northline garden booking agreement £'+amount,channel:'email',evidence:[]},who)).status,201);
  const r=await call(env,'/api/context/preview','POST',{message:'Northline garden booking payment'});assert.equal(r.status,200);const data=await r.json();assert.equal(data.records.length,1);assert.match(data.records[0].text,/£100/);assert.equal(data.records[0].confirmed,false);assert.match(data.records[0].retrievalReason,/possible connection/);
 }finally{DB.sqlite.close();}
});

test('canonical jury accounts bypass chat quotas while retaining private routing',async()=>{
 const DB=database(),env={DB,GUARDIAN_JURY_MODE:'true',PEOPLE_ORGANISED_AUTH_ORIGIN:'https://admin.peopleorganised.com',GUARDIAN_IDENTITY_SECRET:'s'.repeat(64),CONTACT_GATEWAY_SECRET:'test-contact-'.repeat(4),GUARDIAN_PROVIDER:'meta',GUARDIAN_API_KEY:'fixture',GUARDIAN_MODEL:'muse-spark-1.3',WOLFGANG_PUBLIC_DAILY_LIMIT:'0'},oldFetch=globalThis.fetch;
 globalThis.fetch=async(url,init)=>{if(new URL(url).pathname==='/api/guardian/auth/session')return Response.json({identity:{id:'judge-a',email:'judge-a@example.test'}});const payload=JSON.parse(init.body);return Response.json({model:payload.model,status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify({reply:'Hello!',intent:'attending'})}]}]});};
 try{const {default:worker}=await import('../worker/server.js');
  const chat=message=>worker.fetch(new Request(origin+'/api/wolfgang/chat',{method:'POST',headers:{origin,'Content-Type':'application/json',cookie:'__Host-wolfgang_session='+'a'.repeat(64),'cf-connecting-ip':'203.0.113.219'},body:JSON.stringify({message})}),env);
  for(let i=0;i<10;i++){const response=await chat('Hi');assert.equal(response.status,200,await response.text());}
  const personal=await chat('Please check this invoice for my garden booking.');assert.equal(personal.status,409);assert.equal((await personal.json()).code,'CHECK_REQUIRED');
  assert.equal(DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_rate_limits').get().n,0);
 }finally{globalThis.fetch=oldFetch;DB.sqlite.close();}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {demoCases,preparedAssessment} from '../web/assets/demo-data.js';
import {CONTRACT_VERSION,validateInvestigation,validateAssessment} from '../web/assets/guardian-contract.js';
import worker,{analyse,runCheck,validateResult} from '../worker/index.js';
const origin='https://guardian.test';
const req=(body,headers={})=>new Request(origin+'/api/analyse',{method:'POST',headers:{origin,'Content-Type':'application/json','oai-authenticated-user-id':'test-user','oai-authenticated-user-email':'test@example.test',...headers},body:JSON.stringify(body)});
const modelResult={status:'caution',headline:'Check the request',explanation:'The evidence needs review.',evidence:['ev-alex-01'],nextStep:'Use the saved channel.'};
const response=(output,usage={input_tokens:100,output_tokens:50})=>new Response(JSON.stringify({status:'completed',output,usage}),{headers:{'Content-Type':'application/json'}});
const final=()=>response([{type:'message',content:[{type:'output_text',text:JSON.stringify(modelResult)}]}]);
const calls=names=>response(names.map((name,i)=>({type:'function_call',name,call_id:'call_'+i,arguments:'{}'})));
const getCase=async()=> (await (await worker.fetch(new Request(origin+'/api/cases'),{})).json())[0];
test('public modules are served and no key is exposed in configuration',async()=>{
 const page=await (await worker.fetch(new Request(origin),{})).text();assert(page.includes('/assets/landing.js'));
 for(const file of ['landing.js','wolfgang.js','guardian.css','demo.js','demo-data.js','guardian-client.js','workspace.js']){const response=await worker.fetch(new Request(origin+'/assets/'+file),{});assert.equal(response.status,200);assert(response.headers.get('content-type').includes(file.endsWith('.css')?'text/css':'javascript'));}
 const config=await (await worker.fetch(new Request(origin+'/api/config'),{MODEL_API_KEY:'never-expose-this'})).text();assert(!config.includes('never-expose-this'));assert.equal(JSON.parse(config).configured,true);assert.equal(JSON.parse(config).investigationsReady,false);
});
test('the customer site serves neither the old directory nor its catalogues as static files',async()=>{
 const privateAssets=['uk-directory.js','uk-original-publishers.js','uk-directory-page.js','uk-directory.css','uk-council-sources.js','uk-everyday-sources.js','uk-supplier-sources.js','uk-health-sources.js','organisation-directory.js','public-research-sources.js'];
 for(const path of ['/uk-directory',...privateAssets.map(name=>'/assets/'+name)]){
   for(const method of ['GET','HEAD']){
     const res=await worker.fetch(new Request(origin+path,{method}),{});
     assert.equal(res.status,404,path+' '+method);
   }
 }
 for(const name of ['verification-details.js','guided-check.js','guided-invoice-source.js']){
   const res=await worker.fetch(new Request(origin+'/assets/'+name),{});
   assert.equal(res.status,200);
   const body=await res.text();
   for(const asset of privateAssets)assert.ok(!body.includes(asset),name+' imports '+asset);
 }
});
test('no key means analysis is unavailable, never a fabricated result',async()=>assert.equal((await worker.fetch(req({id:'invoice',consent:true}),{})).status,503));
test('cross-origin analysis rejected',async()=>assert.equal((await worker.fetch(req({id:'invoice',consent:true},{origin:'https://attacker.test'}),{MODEL_API_KEY:'test-only'})).status,403));
test('consent enforced on backend',async()=>assert.equal((await worker.fetch(req({id:'invoice'}),{MODEL_API_KEY:'test-only'})).status,400));
test('unknown scenario rejected',async()=>assert.equal((await worker.fetch(req({id:'nonexistent',consent:true}),{MODEL_API_KEY:'test-only'})).status,400));
test('malformed JSON rejected cleanly',async()=>{const request=new Request(origin+'/api/analyse',{method:'POST',headers:{origin,'Content-Type':'application/json','oai-authenticated-user-id':'test-user','oai-authenticated-user-email':'test@example.test'},body:'{bad'});assert.equal((await worker.fetch(request,{MODEL_API_KEY:'test-only'})).status,400);});
test('tool allowlist blocks arbitrary operations',async()=>assert.throws(()=>runCheck('send_payment',{}),/Unsupported tool/));
test('invalid model verdict rejected',()=>assert.throws(()=>validateResult({...modelResult,status:'verified'}),/Invalid model/));
test('real orchestration sends tool outputs back, uses only Meta and calculates usage',async()=>{
 const c=await getCase();let n=0;const result=await analyse(c,'test-only',async(url,options)=>{assert.equal(url,'https://api.meta.ai/v1/responses');const body=JSON.parse(options.body);assert.equal(body.model,'muse-spark-1.3');assert.equal(body.store,false);assert.equal(body.max_output_tokens,2000);if(n++===0)return calls(['lookup_contact','get_conversation_history']);assert(body.input.some(x=>x.type==='function_call_output'&&x.output.includes('ev-alex-01')));return final();});
 assert.equal(n,2);assert.equal(result.result.status,'caution');assert.equal(result.usage.input,200);assert.equal(result.usage.output,100);assert.equal(result.usage.estimatedCost,0.000675);assert(result.trace.some(x=>x.title==='get_conversation_history'));
});
test('model cannot bypass minimum evidence checks',async()=>{const result=await analyse(await getCase(),'test-only',async()=>final());assert.equal(result.result.status,'unresolved');assert(result.trace.some(x=>x.kind==='policy'));});
test('unbounded model tool loop terminates after three requests',async()=>{let n=0;await assert.rejects(analyse(await getCase(),'test-only',async()=>{n++;return calls(['lookup_contact']);}),/Tool limit/);assert.equal(n,3);});
test('arbitrary tool arguments rejected before execution',async()=>{await assert.rejects(analyse(await getCase(),'test-only',async()=>response([{type:'function_call',name:'lookup_contact',call_id:'c',arguments:'{"other_user":"secret"}'}])),/Invalid tool arguments/);});
test('provider error and incomplete generation yield no result',async()=>{
 await assert.rejects(analyse(await getCase(),'test-only',async()=>new Response('{}',{status:429})),/429/);
 await assert.rejects(analyse(await getCase(),'test-only',async()=>new Response(JSON.stringify({status:'incomplete',output:[]}))),/incomplete/);
});
test('account routes require identity and preserve the email-login return path',async()=>{
 for(const path of ['/workspace','/welcome','/connections','/account']){
  const anonymous=await worker.fetch(new Request(origin+path),{});
  assert.equal(anonymous.status,302);
  assert.equal(anonymous.headers.get('location'),origin+'/login?return_to='+encodeURIComponent(path));
  const signedIn=await worker.fetch(new Request(origin+path,{headers:{'oai-authenticated-user-id':'test-owner','oai-authenticated-user-email':'owner@example.test'}}),{});
  assert.equal(signedIn.status,200);
 }
 const session=await worker.fetch(new Request(origin+'/api/session'),{});
 assert.deepEqual(await session.json(),{authenticated:false,legacy:false});
});
test('landing, access pages and demo are distinct public routes',async()=>{
 const markers={'/':'Looks convincing.','/login':'id="auth-email"','/signup':'id="auth-email"','/demo':'id="case-list"'};
 for(const [path,marker] of Object.entries(markers)){const response=await worker.fetch(new Request(origin+path),{});assert.equal(response.status,200);assert((await response.text()).includes(marker));assert(response.headers.get('content-security-policy').includes("script-src 'self'"));}
});
test('deletion instructions are public and point to the existing signed-in controls',async()=>{
 const response=await worker.fetch(new Request(origin+'/data-deletion'),{}),html=await response.text();
 assert.equal(response.status,200);assert.match(html,/Delete my Guardian information/);assert.match(html,/\/account#privacy/);assert.match(html,/minimal record of used free checks/);assert.match(html,/does not delete your People Organised account/);
});

test('public visitors can read the landing page and synthetic cases but cannot start live analysis',async()=>{
 assert.equal((await worker.fetch(new Request(origin),{})).status,200);
 assert.equal((await worker.fetch(new Request(origin+'/api/cases'),{})).status,200);
 const request=new Request(origin+'/api/analyse',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({id:'invoice',consent:true})});
 assert.equal((await worker.fetch(request,{MODEL_API_KEY:'test-only'})).status,401);
});

test('six prepared cases are grounded in their own records and require no network analysis',async()=>{
 assert.equal(demoCases.length,6);assert.equal(new Set(demoCases.map(c=>c.id)).size,6);
 for(const c of demoCases){const ids=new Set(c.facts.map(f=>f.id));for(const includeContext of [true,false]){const result=preparedAssessment(c.id,includeContext);assert(result.nextStep);assert(result.evidence.every(id=>ids.has(id)));}assert.equal(preparedAssessment(c.id,false).evidence.length,0);}
 assert.equal(preparedAssessment('change').status,'consistent');assert.equal(preparedAssessment('deposit',false).status,'unresolved');assert.equal(preparedAssessment('deposit',true).status,'caution');
 assert.throws(()=>preparedAssessment('unknown'),/Unknown/);
 const script=await readFile(new URL('../web/assets/demo.js',import.meta.url),'utf8');assert.doesNotMatch(script,/fetch\(|requestAssessment|\/api\//);
});

test('customer pages omit provider setup and the public demo needs no consent dialog',async()=>{
 for(const path of ['/','/login','/signup','/demo']){
  const html=await (await worker.fetch(new Request(origin+path),{})).text();
  const visible=html.replace(/<script>[\s\S]*?<\/script>|<style>[\s\S]*?<\/style>/g,'').replace(/<[^>]+>/g,' ');
  assert.doesNotMatch(visible,/\bMeta\b|API key|Live Inspector|planning budget|consent/i);
  if(path==='/demo'){assert(!html.includes('<dialog'));assert(!html.includes('/api/'));}
 }
});

const input={schema:CONTRACT_VERSION,message:'Please use the changed bank details.',channel:'email',evidence:[{id:'ev-note-1',source:'Earlier invoice',text:'Account ending 1096',confirmed:true}],preferences:{detail:'expanded',tone:'warm'}};
test('personal input strips client ownership and cannot self-verify evidence',()=>{
 const value=validateInvestigation({...input,userId:'another-user',scope:'all_accounts'});assert.equal(value.userId,undefined);assert.equal(value.scope,'selected_records');assert.equal(value.evidence[0].confirmed,false);assert.equal(value.preferences.detail,'expanded');
 assert.throws(()=>validateInvestigation({...input,evidence:[input.evidence[0],input.evidence[0]]}),/invalid format/);
});
test('future AI results must cite available evidence and use bounded states',()=>{
 const r={status:'caution',headline:'Check the change',explanation:'A mismatch needs review.',nextStep:'Call your saved contact.',evidenceIds:['ev-note-1'],questions:[],reaction:'caution'};
 assert.equal(validateAssessment(r,input.evidence).reaction,'caution');assert.throws(()=>validateAssessment({...r,evidenceIds:['another-user-record']},input.evidence),/unavailable/);assert.throws(()=>validateAssessment({...r,status:'safe'},input.evidence),/Incomplete/);
});
test('personal endpoint is authenticated and never returns a mock result for real material',async()=>{
 const make=(body,auth=true)=>new Request(origin+'/api/investigations/assess',{method:'POST',headers:{origin,'content-type':'application/json',...(auth?{'oai-authenticated-user-id':'u','oai-authenticated-user-email':'u@example.test'}:{})},body:JSON.stringify(body)});
 assert.equal((await worker.fetch(make(input,false),{})).status,401);
 const long=await worker.fetch(make({...input,message:'x'.repeat(16001)}),{});
 assert.equal(long.status,503);assert.equal((await long.json()).code,'ANALYSIS_NOT_CONNECTED');
 const r=await worker.fetch(make(input),{MODEL_API_KEY:'not-called'});assert.equal(r.status,503);const data=await r.json();assert.equal(data.code,'ANALYSIS_NOT_CONNECTED');assert.equal(data.result,undefined);
 assert.equal((await worker.fetch(make({...input,message:'x'.repeat(300000)}),{})).status,413);
});


test('shared AI service passes only selected context and binds persistence to server identity',async()=>{
 const {assessInvestigation}=await import('../worker/guardian-service.js');let saved;let seen;
 const result=await assessInvestigation({...input,ownerId:'client-supplied'}, {ownerId:'server-owner',provider:{generate:async request=>{seen=request;return {status:'unresolved',headline:'More context needed',explanation:'The change needs independent confirmation.',nextStep:'Find the original record.',evidenceIds:['ev-note-1'],questions:['Was the change independently confirmed?'],reaction:'asking'};}},contextStore:{saveInvestigation:async value=>{saved=value;}}});
 assert.equal(result.result.status,'unresolved');assert.equal(saved.ownerId,'server-owner');assert.equal(seen.input.evidence.length,1);assert.equal(seen.input.ownerId,undefined);assert(seen.instructions.includes('untrusted evidence'));
 await assert.rejects(assessInvestigation(input,{ownerId:'',provider:{generate(){throw new Error('must not run');}}}),/Authenticated owner/);
});

test('character stages never show the original illustration during model loading',async()=>{
 for(const route of ['/','/demo','/login','/signup','/workspace']){
  const page=await (await worker.fetch(new Request(origin+route,{headers:{'oai-authenticated-user-id':'test-user','oai-authenticated-user-email':'test@example.test'}}),{})).text();
  assert(!page.includes('class="wolfgang-image"'),route+' must not flash the original illustration');
  assert(page.includes('class="wolfgang-loading"'),route+' must reserve a loading state');
 }
});

test('HEAD matches the landing page, protects the workspace, and stored text assets serve their original bytes',async()=>{
 for(const path of ['/','/workspace','/uk-directory']){
   const get=await worker.fetch(new Request(origin+path),{});
   const head=await worker.fetch(new Request(origin+path,{method:'HEAD'}),{});
   if(path==='/'){assert.match(get.headers.get('X-Guardian-Build'),/^[a-f0-9]{20}$/);assert.equal(head.headers.get('X-Guardian-Build'),get.headers.get('X-Guardian-Build'));}
   assert.equal(head.status,get.status);assert.equal(head.headers.get('location'),get.headers.get('location'));assert.equal(head.body,null);
 }
 for(const name of ['pdfjs-worker.js','workspace.js','guardian.css','landing.js','evidence-worker.js']){
   const response=await worker.fetch(new Request(origin+'/assets/'+name),{});
   assert.equal(response.status,200);
   assert.deepEqual(Buffer.from(await response.arrayBuffer()),await readFile(new URL('../web/assets/'+name,import.meta.url)));
 }
});

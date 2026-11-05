import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {handleReputationReadiness} from '../worker/reputation-readiness.js';

const now=Date.UTC(2026,10,4,13,30);
const token='t'.repeat(64),googleKey='provider-test-key';
const env={GUARDIAN_REPUTATION_PROBE:JSON.stringify({token,expiresAt:new Date(now+10*60000).toISOString()}),GUARDIAN_LINK_REPUTATION:'google-web-risk',GUARDIAN_GOOGLE_WEB_RISK_API_KEY:googleKey};
const request=(extra={})=>new Request('https://guardian.example/api/internal/reputation-readiness',{
 method:'POST',headers:{Authorization:'Bearer '+token},...extra
});
const noNetwork=()=>assert.fail('Unauthorized or invalid probes must not call a provider');

test('normal production Worker never exposes the temporary probe, even with a matching configured token',async()=>{
 const {default:worker}=await import('../worker/index.js');
 const original=globalThis.fetch;
 globalThis.fetch=noNetwork;
 try{
  const current={...env,GUARDIAN_REPUTATION_PROBE:JSON.stringify({token,expiresAt:new Date(Date.now()+10*60000).toISOString()})};
  const response=await worker.fetch(request(),current);
  assert.equal(response.status,404);
 }finally{globalThis.fetch=original;}
});

test('unrelated routes pass through without a provider request',async()=>{
 for(const config of [env,{}])assert.equal(await handleReputationReadiness(new Request('https://guardian.example/api/product-config'),config,{now,fetcher:noNetwork}),null);
});

test('missing, malformed, expired and overly long-lived probe configuration fails closed',async()=>{
 for(const config of [undefined,'{','null','[]','{}',JSON.stringify({token,expiresAt:'not a date'}),JSON.stringify({token,expiresAt:new Date(now+60000).toISOString().replace('.000Z','Z')}),JSON.stringify({token,expiresAt:new Date(now).toISOString()}),JSON.stringify({token,expiresAt:new Date(now+30*60000+1).toISOString()}),JSON.stringify({token:'short',expiresAt:new Date(now+60000).toISOString()})]){
  const response=await handleReputationReadiness(request(),{...env,GUARDIAN_REPUTATION_PROBE:config},{now,fetcher:noNetwork});
  assert.equal(response.status,404);
  assert.deepEqual(await response.json(),{error:'Not found'});
 }
 const coerced=JSON.stringify({token:[token],expiresAt:new Date(now+60000).toISOString()});
 assert.equal((await handleReputationReadiness(request(),{...env,GUARDIAN_REPUTATION_PROBE:coerced},{now,fetcher:noNetwork})).status,404);
});

test('missing or incorrect credentials cannot make requests or reveal configuration',async()=>{
 for(const authorization of ['',token,'Bearer wrong','Bearer '+'x'.repeat(64)]){
  const response=await handleReputationReadiness(request({headers:{Authorization:authorization}}),env,{now,fetcher:noNetwork});
  assert.equal(response.status,404);
  assert.equal(response.headers.get('Cache-Control'),'no-store');
  assert.doesNotMatch(await response.text(),/provider|token|key|configured/);
 }
});

test('wrong methods, request bodies and query parameters cause no upstream call',async()=>{
 for(const method of ['GET','DELETE','PUT']){
  const response=await handleReputationReadiness(request({method}),env,{now,fetcher:noNetwork});
  assert.equal(response.status,405);assert.equal(response.headers.get('Allow'),'POST');
 }
 const body=await handleReputationReadiness(request({body:JSON.stringify({url:'https://private.example/secret',message:'private text'})}),env,{now,fetcher:noNetwork});
 assert.equal(body.status,400);
 const query=new Request('https://guardian.example/api/internal/reputation-readiness?url=https://private.example/secret',{method:'POST',headers:{Authorization:'Bearer '+token}});
 assert.equal((await handleReputationReadiness(query,env,{now,fetcher:noNetwork})).status,400);
});

test('a Cloudflare-style empty body stream is accepted after confirmed EOF',async()=>{
 let calls=0;
 const body=new ReadableStream({start(controller){controller.close();}});
 const response=await handleReputationReadiness(request({body,duplex:'half'}),env,{now,fetcher:()=>{calls++;return Response.json({});}});
 assert.equal(response.status,200);assert.equal((await response.json()).status,'no_flags');assert.equal(calls,1);
});

test('a nonempty body stream is cancelled without a provider call, even with a zero Content-Length',async()=>{
 let cancelled=false;
 const body=new ReadableStream({start(controller){controller.enqueue(new TextEncoder().encode('private content'));},cancel(){cancelled=true;}});
 const response=await handleReputationReadiness(request({body,duplex:'half',headers:{Authorization:'Bearer '+token,'Content-Length':'0'}}),env,{now,fetcher:noNetwork});
 assert.equal(response.status,400);assert.equal(cancelled,true);
});

test('a stalled authenticated body is bounded and cancelled without a provider call',async()=>{
 let cancelled=false;
 const body=new ReadableStream({cancel(){cancelled=true;}});
 const response=await handleReputationReadiness(request({body,duplex:'half'}),env,{now,fetcher:noNetwork});
 assert.equal(response.status,400);assert.equal(cancelled,true);
});

test('authorized probe uses the real Google adapter with one fixed neutral URL and no customer data',async()=>{
 let calls=0,tick=10;
 const response=await handleReputationReadiness(request({headers:{Authorization:'Bearer '+token,Cookie:'private-session=secret','X-Customer':'private customer'}}),env,{now,clock:()=>tick++,fetcher:(address,init)=>{
  calls++;
  const url=new URL(address);
  assert.equal(url.origin,'https://webrisk.googleapis.com');
  assert.equal(url.pathname,'/v1/uris:search');
  assert.equal(url.searchParams.get('uri'),'https://example.com/');
  assert.deepEqual(url.searchParams.getAll('threatTypes'),['MALWARE','SOCIAL_ENGINEERING','UNWANTED_SOFTWARE']);
  assert.equal(init.method,'GET');assert.equal(init.redirect,'manual');
  assert.equal(init.headers['x-goog-api-key'],googleKey);
  assert.equal(init.headers.Cookie,undefined);assert.equal(init.headers.Authorization,undefined);
  assert.equal(init.body,undefined);
  assert.doesNotMatch(JSON.stringify(init),/private-session|private customer|tttttttt/);
  return Response.json({});
 }});
 assert.equal(calls,1);assert.equal(response.status,200);
 assert.deepEqual(await response.json(),{provider:'Google Web Risk',status:'no_flags',checkedAt:new Date(now).toISOString(),elapsedMs:1});
});

test('positive and failed provider responses retain the adapter verdict and never expose raw data',async()=>{
 const flagged=await handleReputationReadiness(request(),env,{now,fetcher:()=>Response.json({threat:{threatTypes:['MALWARE'],expireTime:new Date(now+60000).toISOString()}})});
 assert.equal(flagged.status,200);assert.equal((await flagged.json()).status,'flagged');
 for(const upstream of [()=>Response.json({error:{message:'raw private provider details'}},{status:403}),()=>new Response('<html>provider error</html>',{status:502}),()=>Response.json({threat:{threatTypes:['UNKNOWN'],expireTime:new Date(now+60000).toISOString()}})]){
  const response=await handleReputationReadiness(request(),env,{now,fetcher:upstream});
  assert.equal(response.status,503);
  const body=await response.text();assert.match(body,/unavailable/);assert.doesNotMatch(body,/raw private|html|UNKNOWN|provider-test-key|tttttttt/);
 }
});

test('disabled or missing Google configuration never falls back to VirusTotal',async()=>{
 for(const config of [{...env,GUARDIAN_LINK_REPUTATION:'virustotal-commercial',GUARDIAN_VIRUSTOTAL_COMMERCIAL_KEY:'vt-key'},{...env,GUARDIAN_GOOGLE_WEB_RISK_API_KEY:undefined}]){
  const response=await handleReputationReadiness(request(),config,{now,fetcher:noNetwork});
  assert.equal(response.status,503);assert.equal((await response.json()).status,'not_configured');
 }
});

function communityFixture(){
 const sql=new DatabaseSync(':memory:');
 sql.exec('CREATE TABLE guardian_rate_limits(bucket_key TEXT PRIMARY KEY,owner_id TEXT NOT NULL,count INTEGER NOT NULL,expires_at INTEGER NOT NULL)');
 const prepare=(query,values=[])=>({query,values,bind(...args){return prepare(query,args);}});
 const DB={prepare,async batch(statements){sql.exec('BEGIN IMMEDIATE');try{const results=statements.map(statement=>({success:true,results:sql.prepare(statement.query).all(...statement.values)}));sql.exec('COMMIT');return results;}catch(error){sql.exec('ROLLBACK');throw error;}}};
 return {sql,settings:{...env,DB,GUARDIAN_LINK_REPUTATION:'virustotal-community',GUARDIAN_VIRUSTOTAL_COMMUNITY_KEY:'a'.repeat(64)}};
}
const report=()=>({data:{type:'url',id:createHash('sha256').update('https://example.com/').digest('hex'),attributes:{url:'https://example.com/',last_analysis_date:now/1000-60,last_analysis_stats:{malicious:0,suspicious:0,harmless:40,undetected:2},html_meta:{private:'RAW_PROVIDER_DETAIL_MUST_NOT_APPEAR'}}}});
const timestamp=new Date(now).toISOString();

test('dual-provider probe reports both real adapters using only sanitised readiness fields',async()=>{
 const {sql,settings}=communityFixture();let tick=20;const calls=[];
 try{
  const response=await handleReputationReadiness(request({headers:{Authorization:'Bearer '+token,Cookie:'PRIVATE_CUSTOMER_COOKIE'}}),settings,{now,clock:()=>tick++,fetcher:(address,init)=>{
   const url=new URL(address);calls.push(url.hostname);
   assert.equal(init.method,'GET');assert.equal(init.redirect,'manual');assert.equal(init.body,undefined);
   assert.equal(init.headers.Cookie,undefined);assert.equal(init.headers.Authorization,undefined);
   if(url.hostname==='webrisk.googleapis.com'){
    assert.equal(url.searchParams.get('uri'),'https://example.com/');assert.equal(init.headers['x-goog-api-key'],googleKey);return Response.json({});
   }
   assert.equal(url.hostname,'www.virustotal.com');assert.equal(init.headers['x-apikey'],'a'.repeat(64));return Response.json(report());
  }});
  assert.equal(response.status,200);assert.deepEqual(calls,['webrisk.googleapis.com','www.virustotal.com']);
  const body=await response.json();assert.deepEqual(body,{provider:'Google Web Risk + VirusTotal',status:'no_flags',checkedAt:timestamp,elapsedMs:1,checks:[{provider:'Google Web Risk',status:'no_flags',checkedAt:timestamp},{provider:'VirusTotal',status:'no_flags',checkedAt:timestamp}]});
  assert.doesNotMatch(JSON.stringify(body),/example\.com|RAW_PROVIDER|PRIVATE_CUSTOMER|provider-test-key|aaaaaaa|tttttttt|note|html_meta|last_analysis/);
  assert.equal(sql.prepare("SELECT count FROM guardian_rate_limits WHERE bucket_key LIKE 'virustotal-community:day:%'").get().count,1);
 }finally{sql.close();}
});

test('dual-provider probe keeps unavailable members explicit without leaking upstream failures',async()=>{
 for(const scenario of [{googleFails:true,vtFails:false,status:'no_flags',http:200},{googleFails:false,vtFails:true,status:'no_flags',http:200},{googleFails:true,vtFails:true,status:'unavailable',http:503}]){
  const {sql,settings}=communityFixture();try{
   const response=await handleReputationReadiness(request(),settings,{now,fetcher:address=>{
    const google=new URL(address).hostname==='webrisk.googleapis.com';
    if(google?scenario.googleFails:scenario.vtFails)return Response.json({error:{message:'RAW_PRIVATE_PROVIDER_FAILURE'}},{status:403});
    return Response.json(google?{}:report());
   }});
   assert.equal(response.status,scenario.http);const body=await response.json();assert.equal(body.provider,'Google Web Risk + VirusTotal');assert.equal(body.status,scenario.status);
   assert.deepEqual(body.checks,[{provider:'Google Web Risk',status:scenario.googleFails?'unavailable':'no_flags',checkedAt:timestamp},{provider:'VirusTotal',status:scenario.vtFails?'unavailable':'no_flags',checkedAt:timestamp}]);
   for(const check of body.checks)assert.deepEqual(Object.keys(check).sort(),['checkedAt','provider','status']);
   assert.doesNotMatch(JSON.stringify(body),/RAW_PRIVATE|example\.com|note|key|credential/);
  }finally{sql.close();}
 }
});

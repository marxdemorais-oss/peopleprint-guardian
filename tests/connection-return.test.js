import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {DatabaseSync} from 'node:sqlite';
import {handleConnectionReturn} from '../worker/connection-return.js';
import worker from '../worker/server.js';

const origin='https://guardian.test',state='a'.repeat(43);
function client(href){
 const navigation=[],history=[],status={textContent:''};
 runInNewContext(readFileSync(new URL('../web/assets/connection-return.js',import.meta.url),'utf8'),{URL,URLSearchParams,location:{href,replace:value=>navigation.push(value)},history:{replaceState:(...args)=>history.push(args)},document:{querySelector:()=>status}});
 return {navigation,history,status};
}
function database(){
 const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('../drizzle/0000_guardian_product.sql',import.meta.url),'utf8'));
 const wrap=(query,args=[])=>({bind(...values){return wrap(query,values);},async first(){return sql.prepare(query).get(...args)||null;},async all(){return {results:sql.prepare(query).all(...args)};},async run(){return {meta:{changes:sql.prepare(query).run(...args).changes}};}});
 return {sql,prepare:query=>wrap(query),async batch(statements){sql.exec('BEGIN');try{const result=[];for(const statement of statements)result.push(await statement.run());sql.exec('COMMIT');return result;}catch(error){sql.exec('ROLLBACK');throw error;}}};
}
test('initial provider return loads a public document without exchanging or reflecting credentials',async()=>{
 const previousAssets=globalThis.publicAssets;globalThis.publicAssets={};
 try{
  const url=origin+'/api/connections/gmail/callback?state='+state+'&code=private_code&return_to=https://attacker.test';
  const response=await worker.fetch(new Request(url,{headers:{'sec-fetch-site':'cross-site'}}),{});
  assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('referrer-policy'),'no-referrer');
  assert.match(response.headers.get('content-security-policy'),/default-src 'none'/);assert.match(response.headers.get('content-security-policy'),/frame-ancestors 'none'/);
  const html=await response.text();assert(!html.includes('private_code'));assert(!html.includes(state));assert(!html.includes('attacker.test'));assert.match(html,/\/assets\/connection-return.js/);
  assert.equal(handleConnectionReturn(new Request(origin+'/api/connections/gmail/callback?guardian_return=1')),null);
  assert.equal(handleConnectionReturn(new Request(origin+'/api/connections/peopleprint/callback')),null);
  assert.equal(handleConnectionReturn(new Request(url,{method:'POST'})),null);
 }finally{globalThis.publicAssets=previousAssets;}
});
test('client resumes only the fixed local callback and drops unrelated parameters',()=>{
 for(const provider of ['gmail','outlook']){
  const code='code+with/%_characters',p=new URLSearchParams({state,code,return_to:'https://attacker.test',scope:'untrusted'});
  const result=client(origin+'/api/connections/'+provider+'/callback?'+p);assert.equal(result.navigation.length,1);
  const next=new URL(result.navigation[0],origin);assert.equal(next.origin,origin);assert.equal(next.pathname,'/api/connections/'+provider+'/callback');assert.equal(next.searchParams.get('state'),state);assert.equal(next.searchParams.get('code'),code);assert.equal(next.searchParams.get('guardian_return'),'1');assert.deepEqual([...next.searchParams.keys()].sort(),['code','guardian_return','state']);
 }
 const denied=client(origin+'/api/connections/gmail/callback?state='+state+'&error=private_provider_detail');assert.equal(new URL(denied.navigation[0],origin).searchParams.get('error'),'access_denied');
});
test('ambiguous or invalid returns stop locally and remove code-bearing history',()=>{
 for(const query of ['state='+state+'&state='+state+'&code=one','state='+state+'&code=one&code=two','state='+state+'&code=one&error=denied','state=bad&code=one','state='+state+'&code=','state='+state+'&code=one%0Atwo','state='+state+'&code='+('a'.repeat(4097)),'state='+state+'&code=one&guardian_return=1']){
  const result=client(origin+'/api/connections/gmail/callback?'+query);assert.deepEqual(result.navigation,[]);assert.match(result.status.textContent,/start again/);assert.equal(result.history[0][2],'/api/connections/gmail/callback');
 }
});
test('real server routing resumes with the unchanged Strict session and retains owner-bound single use',async()=>{
 const previousFetch=globalThis.fetch,previousAssets=globalThis.publicAssets,previousPages=globalThis.pages;globalThis.publicAssets={};globalThis.pages={};
 const DB=database(),env={DB,GUARDIAN_IDENTITY_SECRET:'test-identity-'.repeat(3),CONNECTION_ENCRYPTION_KEY:Buffer.alloc(32,7).toString('base64'),GMAIL_CLIENT_ID:'test-client',GMAIL_CLIENT_SECRET:'test-client-secret',GMAIL_REDIRECT_URI:origin+'/api/connections/gmail/callback',GMAIL_CONNECT_ENABLED:'true'};
 let exchanges=0;const token='a'.repeat(64),otherToken='b'.repeat(64),session=which=>({'cookie':'__Host-wolfgang_session='+which,'sec-fetch-site':'same-origin'});
 globalThis.fetch=async(url,init)=>{
  if(url==='https://admin.peopleorganised.com/api/guardian/auth/session'){const body=JSON.parse(init.body);return Response.json({identity:{id:body.token===otherToken?'other-account':'account-a',email:'customer@example.test',name:'Customer'}});}
  if(url==='https://oauth2.googleapis.com/token'){exchanges++;assert.equal(init.body.get('redirect_uri'),env.GMAIL_REDIRECT_URI);return Response.json({access_token:'synthetic-access',refresh_token:'synthetic-refresh'});}
  assert.equal(url,'https://gmail.googleapis.com/gmail/v1/users/me/profile');return Response.json({emailAddress:'mailbox@example.test'});
 };
 try{
  const start=await worker.fetch(new Request(origin+'/api/connections/gmail/start',{headers:session(token)}),env),authorise=new URL(start.headers.get('location'));
  const path='/api/connections/gmail/callback?state='+authorise.searchParams.get('state')+'&code=synthetic-code';
  assert.equal((await worker.fetch(new Request(origin+path,{headers:{'sec-fetch-site':'cross-site'}}),env)).status,200);assert.equal(exchanges,0);
  const resumed=client(origin+path).navigation[0];
  const wrong=await worker.fetch(new Request(origin+resumed,{headers:session(otherToken)}),env);assert.match(wrong.headers.get('location'),/connection=expired/);assert.equal(exchanges,0);
  const duplicate=await worker.fetch(new Request(origin+resumed+'&code=ambiguous',{headers:session(token)}),env);assert.match(duplicate.headers.get('location'),/connection=expired/);assert.equal(exchanges,0);
  const done=await worker.fetch(new Request(origin+resumed,{headers:session(token)}),env);assert.match(done.headers.get('location'),/connection=connected/);assert.equal(exchanges,1);
  assert.equal(DB.sql.prepare('SELECT owner_id FROM guardian_connections').get().owner_id,'people:account-a');
  const replay=await worker.fetch(new Request(origin+resumed,{headers:session(token)}),env);assert.match(replay.headers.get('location'),/connection=expired/);assert.equal(exchanges,1);
  const signedOut=await worker.fetch(new Request(origin+resumed),env);assert.equal(signedOut.status,303);assert.equal(signedOut.headers.get('location'),origin+'/connections?connection=expired&provider=gmail');assert(!signedOut.headers.get('location').includes('synthetic-code'));
 }finally{globalThis.fetch=previousFetch;globalThis.publicAssets=previousAssets;globalThis.pages=previousPages;DB.sql.close();}
});

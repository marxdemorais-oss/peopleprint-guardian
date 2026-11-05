import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {createHmac} from 'node:crypto';
import {runInNewContext} from 'node:vm';
import {handleXConnectionRequest} from '../worker/x-connection.js';
import {handleXWebhookSetupRequest} from '../worker/x-webhook-setup.js';
import {handleContactRequest} from '../worker/contact-ingress.js';
import {handleMessagingWebhook} from '../worker/messaging-service.js';
import {handleXCustomerLinkRequest} from '../worker/x-customer-link.js';
import worker from '../worker/server.js';

const origin='https://guardian.test',bot='2115441408920244224',customer='1000000000000000023';
const identity={ownerId:'people:customer-one',peopleOrganisedId:'customer-one',email:'customer@example.test'};
const scopes='dm.read dm.write users.read tweet.read';
const logger={warn(){}};
function database(){
 const sql=new DatabaseSync(':memory:');for(const m of JSON.parse(readFileSync(new URL('../drizzle/meta/_journal.json',import.meta.url))).entries)sql.exec(readFileSync(new URL('../drizzle/'+m.tag+'.sql',import.meta.url),'utf8'));
 const wrap=(query,args=[])=>({query,args,bind(...values){return wrap(query,values);},async first(){return sql.prepare(query).get(...args)||null;},async all(){return {results:sql.prepare(query).all(...args)};},async run(){return {meta:{changes:Number(sql.prepare(query).run(...args).changes)}};}});
 return {sql,prepare:wrap,async batch(rows){sql.exec('BEGIN');try{const result=rows.map(r=>/RETURNING/i.test(r.query)?{results:sql.prepare(r.query).all(...r.args)}:{meta:{changes:Number(sql.prepare(r.query).run(...r.args).changes)}});sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}}};
}
const request=(path,body,headers={})=>new Request(origin+path,{method:body===undefined?'GET':'POST',headers:{origin,'Content-Type':'application/json',...headers},...(body===undefined?{}:{body:JSON.stringify(body)})});
async function ready(){
 const e={DB:database(),CONNECTION_ENCRYPTION_KEY:Buffer.alloc(32,17).toString('base64'),CONTACT_GATEWAY_SECRET:'fixture-gateway-'.repeat(3),CONTACT_CHANNELS:'x',GUARDIAN_ADMIN_TOKEN:'fixture-admin-'.repeat(3),X_CONNECT_ENABLED:'true',X_CLIENT_ID:'fixture-client',X_CLIENT_SECRET:'fixture-secret',X_REDIRECT_URI:origin+'/api/messaging/x/callback',X_OPERATOR_ORIGIN:'https://admin.test/',X_OPERATOR_RETURN_URL:'https://admin.test/operator/guardian',X_APP_BEARER_TOKEN:'fixture-app',WOLFGANG_X_HANDLE:'WolfgangOnCall',WOLFGANG_X_URL:'https://x.com/WolfgangOnCall',MESSAGING_PUBLIC_ORIGIN:origin+'/',X_RECEIVING_ENABLED:'true',WOLFGANG_X_ENABLED:'false',X_AUTOMATED_REPLIES_APPROVED:'false',GUARDIAN_TRANSPORT_TEST_ENABLED:'true',GUARDIAN_TRANSPORT_TEST_OWNER_ID:identity.ownerId};
 const internal=path=>new Request(origin+path,{method:'POST',headers:{Authorization:'Bearer '+e.GUARDIAN_ADMIN_TOKEN,'X-Guardian-Operator':'operator-one'}});
 const auth=new URL((await(await handleXConnectionRequest(internal('/api/internal/admin/x/connect'),e)).json()).authorizeUrl);
 await handleXConnectionRequest(request('/api/messaging/x/callback?state='+auth.searchParams.get('state')+'&code=fixture-bot-code'),e,{fetcher:async url=>url.endsWith('/token')?Response.json({access_token:'bot-token',refresh_token:'bot-refresh',token_type:'bearer',expires_in:7200,scope:scopes+' offline.access'}):Response.json({data:{id:bot,username:'WolfgangOnCall'}})});
 const webhookId='2116961605531410432';
 const setup=await handleXWebhookSetupRequest(internal('/api/internal/admin/x/webhook'),e,{logger,fetcher:async(url,init)=>{
  if(init.method==='GET')return Response.json({data:[]});
  if(url.endsWith('/webhooks'))return Response.json({data:{id:webhookId,url:origin+'/api/messaging/x/webhook',valid:true}},{status:201});
  return Response.json({data:{subscription:{subscription_id:'2116961622371840001',event_type:'dm.received',filter:{user_id:bot},webhook_id:webhookId,tag:'wolfgang-direct-inbound'}}},{status:201});
 }});assert.equal(setup.status,200);
 const code=await issue(e);return {e,code};
}
async function issue(e){const response=await handleContactRequest(request('/api/contact-link',{channel:'x'}),e,identity);assert.equal(response.status,201);return (await response.json()).code;}
async function start(e,code,who=identity){return handleXCustomerLinkRequest(request('/api/connections/x/send-code',{code}),e,who,{logger});}
const callback=target=>request('/api/messaging/x/callback?'+new URLSearchParams({state:target.searchParams.get('state'),code:'customer-code',guardian_return:'1'}));
const result=response=>new URL(response.headers.get('location')).searchParams.get('x_code');
function provider({id=customer,scope=scopes,intercept}={}){
 const calls=[];const fetcher=async(url,init)=>{
  calls.push({url,init});assert.equal(init.redirect,'manual');assert.equal(new URL(url).origin,'https://api.x.com');
  if(intercept){const value=await intercept(url,init);if(value!==undefined)return value;}
  if(url.endsWith('/token'))return Response.json({access_token:'fixture-customer',refresh_token:'must-not-persist',token_type:'bearer',scope});
  assert.equal(init.headers.Authorization,'Bearer fixture-customer');
  if(url.endsWith('/users/me'))return Response.json({data:{id}});
  assert.equal(url,'https://api.x.com/2/dm_conversations/with/'+bot+'/messages');
  return Response.json({data:{dm_event_id:'2116961622371840002',dm_conversation_id:customer+'-'+bot}},{status:201});
 };return {calls,fetcher};
}
function incoming(e,text,id='2116961622371840033'){
 const now=Date.now(),body={data:{event_uuid:'test.'+id,event_type:'dm.received',created_at:new Date(now).toISOString(),filter:{user_id:bot},payload:{direct_message_events:[{id,type:'message_create',created_timestamp:String(now),message_create:{sender_id:customer,target:{recipient_id:bot},message_data:{text}}}]}}};
 const raw=JSON.stringify(body);return new Request(origin+'/api/messaging/x/webhook',{method:'POST',headers:{'Content-Type':'application/json','x-twitter-webhooks-signature-oauth2':'sha256='+createHmac('sha256',e.X_CLIENT_SECRET).update(raw).digest('base64')},body:raw});
}

test('automatic linking authorises the personal account, sends only its own code, and confirms ownership without waiting for a webhook',async()=>{
 const {e,code}=await ready(),before=e.DB.sql.prepare('SELECT * FROM guardian_x_service_account').get();
 await handleMessagingWebhook(incoming(e,'Original pending check','2116961622371840032'),e);
 const started=await start(e,code);assert.equal(started.status,200);const target=new URL((await started.json()).authorizeUrl);
 assert.equal(target.origin,'https://x.com');assert.equal(target.searchParams.get('scope'),scopes);assert(!target.href.includes('offline.access'));assert(!target.href.includes(code));assert(!target.href.includes(e.X_CLIENT_SECRET));
 const p=provider(),done=await handleXCustomerLinkRequest(callback(target),e,identity,{fetcher:p.fetcher,logger});assert.equal(result(done),'linked');
 assert.equal(p.calls.length,3);assert.deepEqual(JSON.parse(p.calls[2].init.body),{text:code});
 assert.deepEqual(e.DB.sql.prepare('SELECT * FROM guardian_x_service_account').get(),before);
 const stored=JSON.stringify(e.DB.sql.prepare('SELECT * FROM guardian_oauth_states').all());assert(!stored.includes('fixture-customer'));assert(!stored.includes('must-not-persist'));assert(!stored.includes(code));
 assert.equal(e.DB.sql.prepare("SELECT COUNT(*) n FROM guardian_channel_identities WHERE channel='x'").get().n,1);
 assert.equal(e.DB.sql.prepare("SELECT owner_id FROM guardian_message_jobs WHERE event_id='dm_2116961622371840032'").get().owner_id,identity.ownerId);
 assert.equal((await handleMessagingWebhook(incoming(e,code,'2116961622371840002'),e)).status,200);
 assert.equal(e.DB.sql.prepare("SELECT state FROM guardian_message_jobs WHERE event_id='dm_2116961622371840002'").get().state,'completed');
 assert.deepEqual(await(await start(e,code)).json(),{linked:true});
 assert.equal(e.DB.sql.prepare("SELECT owner_id FROM guardian_channel_identities WHERE channel='x' AND sender_id=?").get(customer).owner_id,identity.ownerId);
 assert.equal(e.DB.sql.prepare("SELECT owner_id FROM guardian_message_jobs WHERE event_id='dm_2116961622371840032'").get().owner_id,identity.ownerId);
 assert.equal(e.DB.sql.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,0);
 assert.equal(result(await handleXCustomerLinkRequest(callback(target),e,identity,{fetcher:()=>{throw Error('Replay');},logger})),'expired');
});

test('start is authenticated, same-origin, bounded, owner-scoped and cannot accept a recipient or arbitrary message',async()=>{
 const {e,code}=await ready();
 assert.equal((await start(e,code,{})).status,401);
 assert.equal((await handleXCustomerLinkRequest(request('/api/connections/x/send-code',{code},{origin:'https://other.test'}),e,identity,{logger})).status,403);
 for(const body of [{code,recipient:'123'},{code,text:'arbitrary'},[],{code:'invalid'},{code:'a'.repeat(300)}])assert.equal((await handleXCustomerLinkRequest(request('/api/connections/x/send-code',body),e,identity,{logger})).status,400);
 assert.equal((await start(e,code,{ownerId:'people:other'})).status,503);
 assert.equal((await start({...e,GUARDIAN_TRANSPORT_TEST_ENABLED:'false'},code)).status,503);
 for(let i=0;i<6;i++)assert.equal((await start(e,code)).status,200);assert.equal((await start(e,code)).status,429);
});

test('wrong owner, duplicate fields, denial and expiry never exchange a customer code',async()=>{
 const {e,code}=await ready(),target=new URL((await(await start(e,code)).json()).authorizeUrl),never=()=>{throw Error('No provider calls');};
 assert.equal(result(await handleXCustomerLinkRequest(callback(target),e,{ownerId:'people:other'},{fetcher:never,logger})),'failed');
 assert.equal(result(await handleXCustomerLinkRequest(new Request(callback(target).url+'&code=ambiguous'),e,identity,{fetcher:never,logger})),'expired');
 const denied=new URL(callback(target).url);denied.searchParams.delete('code');denied.searchParams.set('error','access_denied');
 assert.equal(result(await handleXCustomerLinkRequest(new Request(denied),e,identity,{fetcher:never,logger})),'denied');
 const again=new URL((await(await start(e,code)).json()).authorizeUrl);
 assert.equal(result(await handleXCustomerLinkRequest(callback(again),e,identity,{now:Date.now()+600001,fetcher:never,logger})),'expired');
});

test('Wolfgang himself, an existing different-owner link and a broader grant cannot send a customer linking DM',async()=>{
 for(const scenario of ['bot','other-owner','scope']){
  const {e,code}=await ready(),target=new URL((await(await start(e,code)).json()).authorizeUrl);
  if(scenario==='other-owner')e.DB.sql.prepare("INSERT INTO guardian_channel_identities(channel,sender_id,owner_id,verified_at) VALUES ('x',?,?,?)").run(customer,'people:someone-else',Date.now());
  const p=provider({id:scenario==='bot'?bot:customer,scope:scenario==='scope'?scopes+' tweet.write':scopes});
  const response=await handleXCustomerLinkRequest(callback(target),e,identity,{fetcher:p.fetcher,logger});
  assert.equal(result(response),scenario==='bot'?'wrong_account':scenario==='other-owner'?'already_linked':'failed');assert(!p.calls.some(c=>c.url.includes('/dm_conversations/')));
 }
});

test('callback replay and lost provider receipts cannot duplicate a send, including a new grant for the same WG code',async()=>{
 const {e,code}=await ready(),target=new URL((await(await start(e,code)).json()).authorizeUrl),p=provider({intercept:url=>{if(url.includes('/dm_conversations/'))throw Error('Synthetic lost send receipt');}});
 assert.equal(result(await handleXCustomerLinkRequest(callback(target),e,identity,{fetcher:p.fetcher,logger})),'uncertain');
 assert.equal(result(await handleXCustomerLinkRequest(callback(target),e,identity,{fetcher:p.fetcher,logger})),'expired');
 const another=new URL((await(await start(e,code)).json()).authorizeUrl);
 assert.equal(result(await handleXCustomerLinkRequest(callback(another),e,identity,{fetcher:p.fetcher,logger})),'uncertain');
 assert.equal(p.calls.filter(c=>c.url.includes('/dm_conversations/')).length,1);
});

test('Stop or a newly issued WG code during authorisation prevents the old linking send',async()=>{
 for(const change of ['stop','new-code']){
  const {e,code}=await ready(),target=new URL((await(await start(e,code)).json()).authorizeUrl);
  const p=provider({intercept:async url=>{if(url.endsWith('/token')){if(change==='stop')await handleContactRequest(new Request(origin+'/api/contact-link',{method:'DELETE',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({channel:'x'})}),e,identity);else await issue(e);}}});
  assert.equal(result(await handleXCustomerLinkRequest(callback(target),e,identity,{fetcher:p.fetcher,logger})),'failed');assert.equal(p.calls.length,1);
 }
});

test('provider redirects, malformed grants and malformed send receipts fail without retaining customer credentials',async()=>{
 for(const stage of ['redirect','invalid-json','bad-receipt']){
  const {e,code}=await ready(),target=new URL((await(await start(e,code)).json()).authorizeUrl);
  const p=provider({intercept:(url)=>stage==='redirect'&&url.endsWith('/token')?new Response(null,{status:307,headers:{Location:'https://attacker.test'}}):stage==='invalid-json'&&url.endsWith('/token')?new Response('{broken',{headers:{'Content-Type':'application/json'}}):stage==='bad-receipt'&&url.includes('/dm_conversations/')?Response.json({data:{dm_event_id:'invalid'}},{status:201}):undefined});
  const response=await handleXCustomerLinkRequest(callback(target),e,identity,{fetcher:p.fetcher,logger});assert.equal(result(response),stage==='bad-receipt'?'uncertain':'failed');
  assert(p.calls.every(c=>c.url.startsWith('https://api.x.com/')));assert(!JSON.stringify(e.DB.sql.prepare('SELECT * FROM guardian_oauth_states').all()).includes('fixture-customer'));
 }
});

test('the shared callback preserves Strict-session customer identity and leaves the service callback untouched',async()=>{
 const {e,code}=await ready(),previousFetch=globalThis.fetch,previousAssets=globalThis.publicAssets,previousPages=globalThis.pages;
 globalThis.publicAssets={};globalThis.pages={};e.GUARDIAN_IDENTITY_SECRET='fixture-identity-'.repeat(3);
 const p=provider(),cookie={'cookie':'__Host-wolfgang_session='+'a'.repeat(64),'sec-fetch-site':'same-origin'};
 globalThis.fetch=async(url,init)=>url==='https://admin.peopleorganised.com/api/guardian/auth/session'?Response.json({identity:{id:'customer-one',email:identity.email}}):p.fetcher(url,init);
 try{
  const startResponse=await worker.fetch(request('/api/connections/x/send-code',{code},cookie),e),target=new URL((await startResponse.json()).authorizeUrl),external=new URL(callback(target).url);external.searchParams.delete('guardian_return');
  const page=await worker.fetch(new Request(external,{headers:{'sec-fetch-site':'cross-site'}}),e);assert.equal(page.status,200);assert(!((await page.text()).includes('customer-code')));assert.equal(p.calls.length,0);
  const navigation=[];runInNewContext(readFileSync(new URL('../web/assets/connection-return.js',import.meta.url),'utf8'),{URL,URLSearchParams,location:{href:external.href,replace:path=>navigation.push(path)},history:{replaceState(){}},document:{querySelector:()=>({textContent:''})}});
  assert.equal(navigation.length,1);assert.equal(new URL(navigation[0],origin).pathname,'/api/messaging/x/callback');
  const response=await worker.fetch(new Request(origin+navigation[0],{headers:cookie}),e);assert.equal(result(response),'linked');assert.equal(p.calls.length,3);
  const botReturn=await worker.fetch(request('/api/messaging/x/callback?state='+'a'.repeat(43)+'&code=unknown'),e);assert.equal(new URL(botReturn.headers.get('location')).origin,'https://admin.test');
 }finally{globalThis.fetch=previousFetch;globalThis.publicAssets=previousAssets;globalThis.pages=previousPages;}
});

test('a fast signed webhook during the send reconciles to one binding instead of reporting a false failure',async()=>{
 const {e,code}=await ready(),target=new URL((await(await start(e,code)).json()).authorizeUrl);let webhook=false;const p=provider({intercept:async url=>{if(url.includes('/dm_conversations/')){webhook=true;assert.equal((await handleMessagingWebhook(incoming(e,code,'2116961622371840002'),e)).status,200);}}});
 assert.equal(result(await handleXCustomerLinkRequest(callback(target),e,identity,{fetcher:p.fetcher,logger})),'linked');assert(webhook);assert.equal(e.DB.sql.prepare("SELECT COUNT(*) n FROM guardian_channel_identities WHERE channel='x'").get().n,1);assert.equal(p.calls.filter(c=>c.url.includes('/dm_conversations/')).length,1);
});
test('Stop while X accepts the send prevents binding and reports a sent-but-unconfirmed result without resending',async()=>{
 const {e,code}=await ready(),target=new URL((await(await start(e,code)).json()).authorizeUrl);const p=provider({intercept:async url=>{if(url.includes('/dm_conversations/'))await handleContactRequest(new Request(origin+'/api/contact-link',{method:'DELETE',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({channel:'x'})}),e,identity);}});
 assert.equal(result(await handleXCustomerLinkRequest(callback(target),e,identity,{fetcher:p.fetcher,logger})),'sent_pending');assert.equal(e.DB.sql.prepare('SELECT COUNT(*) n FROM guardian_channel_identities').get().n,0);assert.equal(e.DB.sql.prepare("SELECT pkce_verifier FROM guardian_oauth_states WHERE provider='x-code-send'").get().pkce_verifier,'sent');assert.equal(p.calls.filter(c=>c.url.includes('/dm_conversations/')).length,1);
});
test('the direct binding write checks the live service generation after intermediate database reads',async()=>{
 const {e,code}=await ready(),target=new URL((await(await start(e,code)).json()).authorizeUrl),prepare=e.DB.prepare;let changed=false;
 e.DB.prepare=(sql)=>{const statement=prepare(sql);if(sql!=='SELECT owner_id FROM guardian_profiles WHERE owner_id=?')return statement;return {...statement,bind(...args){const bound=statement.bind(...args);return {...bound,async first(){const value=await bound.first();if(!changed){changed=true;e.DB.sql.prepare("UPDATE guardian_x_service_account SET generation=generation+1 WHERE id='wolfgang'").run();}return value;}};}};};
 const p=provider();assert.equal(result(await handleXCustomerLinkRequest(callback(target),e,identity,{fetcher:p.fetcher,logger})),'sent_pending');assert(changed);assert.equal(e.DB.sql.prepare('SELECT COUNT(*) n FROM guardian_channel_identities').get().n,0);
});

test('a replacement code issued during confirmation cannot be bypassed by an older OAuth send',async()=>{
 const {e,code}=await ready(),target=new URL((await(await start(e,code)).json()).authorizeUrl),prepare=e.DB.prepare;let replaced=false;
 e.DB.prepare=(sql)=>{const statement=prepare(sql);if(sql!=='SELECT owner_id FROM guardian_profiles WHERE owner_id=?')return statement;return {...statement,bind(...args){const bound=statement.bind(...args);return {...bound,async first(){const value=await bound.first();if(!replaced){replaced=true;e.DB.sql.prepare("INSERT INTO guardian_contact_links(id,owner_id,channel,code_hash,created_at,expires_at) VALUES ('replacement',?,'x','fixture',?,?)").run(identity.ownerId,Date.now(),Date.now()+600000);}return value;}};}};};
 const p=provider();assert.equal(result(await handleXCustomerLinkRequest(callback(target),e,identity,{fetcher:p.fetcher,logger})),'sent_pending');assert(replaced);assert.equal(e.DB.sql.prepare('SELECT COUNT(*) n FROM guardian_channel_identities').get().n,0);
});

test('OAuth confirmation makes a waiting-link job drainable again without reusing the old delivery attempt',async()=>{
 const {e,code}=await ready();await handleMessagingWebhook(incoming(e,'Original pending request','2116961622371840032'),e);e.DB.sql.prepare("UPDATE guardian_message_jobs SET state='waiting_link',attempts=3,last_error='PROVIDER_RATE_LIMIT',provider_message_id='previous-receipt',delivery_generation=2 WHERE event_id='dm_2116961622371840032'").run();const target=new URL((await(await start(e,code)).json()).authorizeUrl),p=provider();assert.equal(result(await handleXCustomerLinkRequest(callback(target),e,identity,{fetcher:p.fetcher,logger})),'linked');const job=e.DB.sql.prepare("SELECT * FROM guardian_message_jobs WHERE event_id='dm_2116961622371840032'").get();assert.equal(job.state,'queued');assert.equal(job.attempts,0);assert.equal(job.provider_message_id,null);assert.equal(job.last_error,null);assert.equal(job.delivery_generation,3);assert.equal(job.owner_id,identity.ownerId);
});

test('a normal non-test customer can complete X linking when public linking is enabled',async()=>{
 const {e,code}=await ready();e.GUARDIAN_TRANSPORT_TEST_ENABLED='false';e.GUARDIAN_TRANSPORT_TEST_OWNER_ID='people:someone-else';e.X_PUBLIC_LINKING_ENABLED='true';const begun=await start(e,code);assert.equal(begun.status,200);const target=new URL((await begun.json()).authorizeUrl),p=provider();assert.equal(result(await handleXCustomerLinkRequest(callback(target),e,identity,{fetcher:p.fetcher,logger})),'linked');assert.equal(e.DB.sql.prepare("SELECT owner_id FROM guardian_channel_identities WHERE channel='x'").get().owner_id,identity.ownerId);assert.equal(e.WOLFGANG_X_ENABLED,'false');assert.equal(e.X_AUTOMATED_REPLIES_APPROVED,'false');
});

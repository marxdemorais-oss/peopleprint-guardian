import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {handleXConnectionRequest} from '../worker/x-connection.js';
import {getXWebhookStatus,handleXWebhookSetupRequest} from '../worker/x-webhook-setup.js';
import {handleConnectionRequest} from '../worker/connections.js';
import {handleContactRequest} from '../worker/contact-ingress.js';

const origin='https://guardian.example.test',privateOrigin='https://admin.example.test';
const account='1234567890123456',webhookId='2234567890123456',subscriptionId='3234567890123456';
const callback=origin+'/api/messaging/x/webhook',tag='wolfgang-direct-inbound';
const scopes='dm.read dm.write users.read tweet.read offline.access';
function database(){
 const sqlite=new DatabaseSync(':memory:');
 const journal=JSON.parse(readFileSync(new URL('../drizzle/meta/_journal.json',import.meta.url),'utf8'));
 for(const entry of journal.entries)sqlite.exec(readFileSync(new URL('../drizzle/'+entry.tag+'.sql',import.meta.url),'utf8'));
 const prepare=(sql,args=[])=>({sql,args,bind(...values){return prepare(sql,values);},async first(){return sqlite.prepare(sql).get(...args)||null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...args).changes)}};}});
 return {sqlite,prepare,async batch(statements){sqlite.exec('BEGIN');try{const results=statements.map(s=>/RETURNING/i.test(s.sql)?{results:sqlite.prepare(s.sql).all(...s.args)}:{meta:{changes:Number(sqlite.prepare(s.sql).run(...s.args).changes)}});sqlite.exec('COMMIT');return results;}catch(error){sqlite.exec('ROLLBACK');throw error;}}};
}
function environment(){return {DB:database(),GUARDIAN_ADMIN_TOKEN:'fixture-admin-'.repeat(3),CONNECTION_ENCRYPTION_KEY:Buffer.alloc(32,29).toString('base64'),X_CONNECT_ENABLED:'true',X_CLIENT_ID:'synthetic-client-id',X_CLIENT_SECRET:'fixture-secret',X_REDIRECT_URI:origin+'/api/messaging/x/callback',WOLFGANG_X_HANDLE:'WolfgangOnCall',X_OPERATOR_ORIGIN:privateOrigin,X_OPERATOR_RETURN_URL:privateOrigin+'/guardian',X_APP_BEARER_TOKEN:'fixture-app-bearer',MESSAGING_PUBLIC_ORIGIN:origin+'/',X_RECEIVING_ENABLED:'true',WOLFGANG_X_ENABLED:'false',X_AUTOMATED_REPLIES_APPROVED:'false'};}
function internal(e,path='/api/internal/admin/x/webhook',method='POST'){return new Request(origin+path,{method,headers:{Authorization:'Bearer '+e.GUARDIAN_ADMIN_TOKEN,'x-guardian-operator':'synthetic-operator'}});}
async function authorise(e,now=Date.now(),id=account){
 const start=await handleXConnectionRequest(internal(e,'/api/internal/admin/x/connect'),e,{now});assert.equal(start.status,200);
 const target=new URL((await start.json()).authorizeUrl),u=new URL(e.X_REDIRECT_URI);u.searchParams.set('state',target.searchParams.get('state'));u.searchParams.set('code','synthetic-code');
 const response=await handleXConnectionRequest(new Request(u),e,{now,fetcher:async(url,init)=>{assert.equal(init.redirect,'manual');if(url==='https://api.x.com/2/oauth2/token')return Response.json({token_type:'bearer',access_token:'fixture-user-token',refresh_token:'fixture-refresh',expires_in:7200,scope:scopes});assert.equal(url,'https://api.x.com/2/users/me');return Response.json({data:{id,username:'WolfgangOnCall'}});}});
 assert.equal(new URL(response.headers.get('location')).searchParams.get('x_connection'),'connected');
}
const webhook=(extra={})=>({id:webhookId,url:callback,valid:true,...extra});
const subscription=(extra={})=>({subscription_id:subscriptionId,event_type:'dm.received',filter:{user_id:account},webhook_id:webhookId,tag,...extra});
function provider(e,{webhooks=[],subscriptions=[],intercept}={}){
 const state={webhooks,subscriptions,calls:[]};
 state.fetcher=async(url,init)=>{
  const u=new URL(url),method=init.method||'GET';state.calls.push({url,method,init});assert.equal(u.origin,'https://api.x.com');assert.equal(init.redirect,'manual');
  const app=u.pathname.startsWith('/2/webhooks')||(u.pathname==='/2/activity/subscriptions'&&method==='GET');assert.equal(init.headers.Authorization,'Bearer '+(app?e.X_APP_BEARER_TOKEN:'fixture-user-token'));
  if(intercept){const value=await intercept({url,u,method,init,state});if(value!==undefined)return value;}
  if(u.pathname==='/2/webhooks'&&method==='GET')return Response.json({data:state.webhooks,meta:{result_count:state.webhooks.length}});
  if(u.pathname==='/2/webhooks'&&method==='POST'){assert.deepEqual(JSON.parse(init.body),{url:callback});const row=webhook();state.webhooks.push(row);return Response.json({data:row},{status:201});}
  if(u.pathname==='/2/webhooks/'+webhookId&&method==='PUT'){state.webhooks.find(row=>row.id===webhookId).valid=true;return Response.json({data:{valid:true}});}
  if(u.pathname==='/2/activity/subscriptions'&&method==='GET'){assert.equal(u.searchParams.get('user_id'),account);assert.equal(u.searchParams.get('max_results'),'1000');return Response.json({data:state.subscriptions});}
  if(u.pathname==='/2/activity/subscriptions'&&method==='POST'){assert.deepEqual(JSON.parse(init.body),{event_type:'dm.received',filter:{user_id:account},webhook_id:webhookId,tag});const row=subscription();state.subscriptions.push(row);return Response.json({data:{subscription:row}},{status:201});}
  throw Error('Unexpected provider endpoint '+url);
 };return state;
}
async function setup(e,p,now=Date.now()){return handleXWebhookSetupRequest(internal(e),e,{fetcher:p.fetcher,now,logger:{warn(){}}});}
const writes=p=>p.calls.filter(call=>call.method!=='GET');

test('the X directory address can be saved while pre-AI linking is restricted to the supervised owner',async()=>{
 const identity={ownerId:'people:transport-owner',peopleOrganisedId:'transport-owner',email:'owner@example.test'};
 const e={...environment(),CONTACT_GATEWAY_SECRET:'fixture-gateway-'.repeat(3),CONTACT_CHANNELS:'x',WOLFGANG_X_URL:origin,GUARDIAN_TRANSPORT_TEST_ENABLED:'true',GUARDIAN_TRANSPORT_TEST_OWNER_ID:identity.ownerId};
 e.WOLFGANG_X_URL='https://x.com/WolfgangOnCall';
 await authorise(e);const p=provider(e);assert.equal((await setup(e,p)).status,200);
 const read=async(config=e,owner=identity)=>(await(await handleConnectionRequest(new Request(origin+'/api/connections'),config,owner)).json()).contacts.find(c=>c.channel==='x');
 const contact=await read();assert.equal(contact.available,false);assert.equal(contact.linkAvailable,true);assert.equal(contact.url,e.WOLFGANG_X_URL);
 const code=await handleContactRequest(new Request(origin+'/api/contact-link',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({channel:'x'})}),e,identity);
 assert.equal(code.status,201);assert.match((await code.json()).code,/^WG-[A-F0-9]{32}$/);
 const card=await handleConnectionRequest(new Request(origin+'/api/wolfgang/contact-card'),e,identity);assert.equal(card.status,200);assert.match(await card.text(),/URL:https:\/\/x\.com\/WolfgangOnCall/);
 const other=await read(e,{ownerId:'people:someone-else'});assert.equal(other.linkAvailable,undefined);assert.equal(other.url,null);
 for(const patch of [{GUARDIAN_TRANSPORT_TEST_ENABLED:'false'},{CONTACT_CHANNELS:'email'},{X_RECEIVING_ENABLED:'false'},{X_APP_BEARER_TOKEN:'rotated-bearer'},{WOLFGANG_X_URL:'https://x.com/another_account'},{WOLFGANG_X_URL:'https://user:'+'pass@x.com/WolfgangOnCall'},{WOLFGANG_X_URL:'https://x.com/WolfgangOnCall?redirect=outside'},{WOLFGANG_X_URL:'javascript:alert(1)'}]){
  const unavailable=await read({...e,...patch});assert.equal(unavailable.linkAvailable,undefined,JSON.stringify(patch));assert.equal(unavailable.available,false);assert.equal(unavailable.url,null);
 }
 await handleXConnectionRequest(internal(e,'/api/internal/admin/x/connection','DELETE'),e);
 assert.equal((await read()).linkAvailable,undefined);
 assert.equal(e.WOLFGANG_X_ENABLED,'false');assert.equal(e.X_AUTOMATED_REPLIES_APPROVED,'false');
});

test('X webhook setup is protected, fixed-origin and opt-in, without any provider request on invalid configuration',async()=>{
 const e=environment();assert.equal(await handleXWebhookSetupRequest(new Request(origin+'/other'),e),null);
 assert.equal((await handleXWebhookSetupRequest(new Request(origin+'/api/internal/admin/x/webhook',{method:'POST'}),e)).status,403);
 assert.equal((await handleXWebhookSetupRequest(internal(e,undefined,'GET'),e)).status,405);
 await authorise(e);const p=provider(e);
 for(const patch of [{X_APP_BEARER_TOKEN:''},{X_APP_BEARER_TOKEN:'bad\nheader'},{X_RECEIVING_ENABLED:'false'},{X_CONNECT_ENABLED:'false'},{MESSAGING_PUBLIC_ORIGIN:'http://guardian.example.test'},{MESSAGING_PUBLIC_ORIGIN:'https://127.0.0.1'},{MESSAGING_PUBLIC_ORIGIN:'https://localhost'},{MESSAGING_PUBLIC_ORIGIN:'https://secret.internal'},{MESSAGING_PUBLIC_ORIGIN:origin+':8443'},{MESSAGING_PUBLIC_ORIGIN:'https://other.example.test'},{MESSAGING_PUBLIC_ORIGIN:origin+'/wrong'}]){
  const response=await setup({...e,...patch},p);assert.equal(response.status,503,JSON.stringify(patch));
 }
 assert.equal(p.calls.length,0);
});

test('bounded setup lists with app-only credentials and creates subscriptions with user credentials; repetition reuses both resources',async()=>{
 const e=environment(),now=Date.now();await authorise(e,now);const p=provider(e);
 const first=await setup(e,p,now);assert.equal(first.status,200);assert.deepEqual(await first.json(),{webhookReady:true,webhookId,subscriptionId,transport:'legacy_dm',encryptedXChatSupported:false});
 assert.equal((await setup(e,p,now+1)).status,200);assert.equal(writes(p).length,2);assert.equal(p.webhooks.length,1);assert.equal(p.subscriptions.length,1);
 const status=await getXWebhookStatus(e,{now});assert.equal(status.webhookReady,true);assert.equal(status.receivingEnabled,true);
 const saved=e.DB.sqlite.prepare('SELECT * FROM guardian_x_transport').get(),raw=JSON.stringify(saved);
 for(const secret of [e.X_APP_BEARER_TOKEN,e.X_CLIENT_SECRET,'fixture-user-token','fixture-refresh'])assert(!raw.includes(secret));
 assert.equal(saved.lease_token,null);assert.equal(saved.lease_expires_at,0);assert.equal(e.WOLFGANG_X_ENABLED,'false');assert.equal(e.X_AUTOMATED_REPLIES_APPROVED,'false');
});

test('exact existing resources and unrelated own-account subscriptions are preserved without writes',async()=>{
 const e=environment();await authorise(e);const unrelated={...subscription({subscription_id:'3234567890123499',event_type:'post.create',tag:'unrelated'}),webhook_id:'2234567890123499'};
 const p=provider(e,{webhooks:[webhook(),webhook({id:'2234567890123499',url:'https://other.example.test/handler'})],subscriptions:[subscription(),unrelated]});
 assert.equal((await setup(e,p)).status,200);assert.equal(writes(p).length,0);assert.equal(p.subscriptions[1],unrelated);
});

test('an invalid existing webhook is revalidated and listed again before subscribing',async()=>{
 const e=environment();await authorise(e);const p=provider(e,{webhooks:[webhook({valid:false})]});assert.equal((await setup(e,p)).status,200);
 assert.deepEqual(p.calls.map(c=>[new URL(c.url).pathname,c.method]),[['/2/webhooks','GET'],['/2/webhooks/'+webhookId,'PUT'],['/2/webhooks','GET'],['/2/activity/subscriptions','GET'],['/2/activity/subscriptions','POST']]);
});

test('partial, paginated and malformed provider lists fail before creating uncertain resources',async()=>{
 const markers=[{meta:{next_token:'next'}},{pagination:{has_more:true}},{links:{next:'https://api.x.com/next'}},{meta:{result_count:2}},{meta:{pagination:{page:2}}},{errors:{message:'invalid'}}];
 for(const endpoint of ['/2/webhooks','/2/activity/subscriptions'])for(const marker of markers){
  const e=environment();await authorise(e);const p=provider(e,{webhooks:[webhook()],intercept:({u,method})=>u.pathname===endpoint&&method==='GET'?Response.json({data:endpoint==='/2/webhooks'?[webhook()]:[],...marker}):undefined});
  const response=await setup(e,p);assert.equal(response.ok,false,endpoint+JSON.stringify(marker));assert.equal(writes(p).length,0);assert.equal((await getXWebhookStatus(e)).webhookReady,false);
 }
});

test('a saturated 1000-row subscription list cannot trigger blind resource creation',async()=>{
 const e=environment();await authorise(e);const subscriptions=Array.from({length:1000},(_,i)=>subscription({subscription_id:String(100000+i),event_type:'post.create'})),p=provider(e,{webhooks:[webhook()],subscriptions});
 assert.equal((await setup(e,p)).status,503);assert.equal(writes(p).length,0);
});

test('an explicitly empty provider list may omit data without blocking first-time registration',async()=>{
 const e=environment();await authorise(e);
 const p=provider(e,{intercept:({u,method,state})=>method==='GET'&&((u.pathname==='/2/webhooks'&&!state.webhooks.length)||(u.pathname==='/2/activity/subscriptions'&&!state.subscriptions.length))?Response.json({meta:{result_count:0}}):undefined});
 assert.equal((await setup(e,p)).status,200);assert.equal(p.webhooks.length,1);assert.equal(p.subscriptions.length,1);
 assert.equal((await setup(e,p)).status,200);assert.equal(writes(p).length,2);
});

test('absent data without an unambiguous zero count cannot create provider resources',async()=>{
 for(const value of [{},{meta:{}},{meta:{result_count:1}},{meta:{result_count:0,total:1}},{meta:{result_count:0,next_token:'next'}},{data:null,meta:{result_count:0}},{meta:{result_count:0},errors:[{detail:'private'}]}]){
  const e=environment();await authorise(e);const p=provider(e,{intercept:()=>Response.json(value)});
  assert.equal((await setup(e,p)).ok,false);assert.equal(writes(p).length,0);assert.equal((await getXWebhookStatus(e)).webhookReady,false);
 }
});

test('setup failure logs identify the local stage without copying provider bodies or credentials',async()=>{
 const e=environment();await authorise(e);const events=[];
 const p=provider(e,{webhooks:[webhook()],intercept:({u})=>u.pathname==='/2/activity/subscriptions'?Response.json({errors:[{detail:e.X_APP_BEARER_TOKEN+' '+e.X_CLIENT_SECRET}]},{status:403}):undefined});
 const response=await handleXWebhookSetupRequest(internal(e),e,{fetcher:p.fetcher,logger:{warn:(...args)=>events.push(args)}});
 assert.equal(response.status,502);assert.deepEqual(events,[['guardian.x.webhook_setup_failed',{code:'X_PROVIDER_PERMISSION_DENIED',stage:'subscription_list'}]]);
 for(const secret of [e.X_APP_BEARER_TOKEN,e.X_CLIENT_SECRET,'fixture-user-token'])assert(!JSON.stringify(events).includes(secret));
});

test('conflicting own DM subscriptions are never removed, duplicated or silently repurposed',async()=>{
 for(const patch of [{tag:'other-owner'},{webhook_id:'2234567890123499'},{filter:{user_id:account,qualifiers:{test:true}}},{expires_at:'2000-01-01T00:00:00Z'}]){
  const e=environment();await authorise(e);const p=provider(e,{webhooks:[webhook()],subscriptions:[subscription(patch)]});const response=await setup(e,p);
  assert.equal(response.status,409);assert.equal((await response.json()).code,'X_SUBSCRIPTION_CONFLICT');assert.equal(writes(p).length,0);assert.equal(p.subscriptions.length,1);
 }
});

test('a durable lease prevents simultaneous setup from making duplicate provider writes',async()=>{
 const e=environment();await authorise(e);let release,entered;const gate=new Promise(resolve=>{release=resolve;}),started=new Promise(resolve=>{entered=resolve;});let gated=false;
 const p=provider(e,{intercept:async({u,method})=>{if(!gated&&u.pathname==='/2/webhooks'&&method==='GET'){gated=true;entered();await gate;}}});
 const first=setup(e,p);await started;const second=await setup(e,p);assert.equal(second.status,409);assert.equal((await second.json()).code,'X_WEBHOOK_SETUP_BUSY');release();assert.equal((await first).status,200);assert.equal(writes(p).length,2);
});

test('lost creation responses reconcile by listing on the next attempt instead of retrying a POST',async()=>{
 for(const endpoint of ['/2/webhooks','/2/activity/subscriptions']){
  const e=environment();await authorise(e);let lost=false;const p=provider(e,{intercept:({u,method,state})=>{
   if(!lost&&u.pathname===endpoint&&method==='POST'){lost=true;if(endpoint==='/2/webhooks')state.webhooks.push(webhook());else state.subscriptions.push(subscription());throw Error('Synthetic lost response');}
  }});
  assert.equal((await setup(e,p)).status,503);assert.equal((await setup(e,p)).status,200);assert.equal(p.calls.filter(c=>new URL(c.url).pathname===endpoint&&c.method==='POST').length,1);assert.equal(p.webhooks.length,1);assert.equal(p.subscriptions.length,1);
 }
});

test('disconnect at a provider await invalidates the generation and cannot save ready metadata',async()=>{
 for(const [endpoint,method] of [['/2/webhooks','GET'],['/2/webhooks','POST'],['/2/activity/subscriptions','POST']]){
  const e=environment();await authorise(e);let disconnected=false;const p=provider(e,{intercept:async({u,method:actual})=>{if(!disconnected&&u.pathname===endpoint&&actual===method){disconnected=true;assert.equal((await handleXConnectionRequest(internal(e,'/api/internal/admin/x/connection','DELETE'),e)).status,200);if(method==='GET')return Response.json({data:[]});return Response.json({data:endpoint==='/2/webhooks'?webhook():{subscription:subscription()}},{status:201});}}});
  const response=await setup(e,p);assert.equal(response.status,409);assert.equal((await response.json()).code,'X_CONNECTION_CHANGED');const row=e.DB.sqlite.prepare('SELECT * FROM guardian_x_transport').get();assert.equal(row.verified_at,null);assert.equal(row.lease_token,null);assert.equal((await getXWebhookStatus(e)).webhookReady,false);
 }
});

test('configuration changes, fresh connection generations and failed revalidation invalidate readiness',async()=>{
 const e=environment();await authorise(e);const p=provider(e);assert.equal((await setup(e,p)).status,200);assert.equal((await getXWebhookStatus(e)).webhookReady,true);
 assert.equal((await getXWebhookStatus({...e,X_APP_BEARER_TOKEN:'new-bearer'})).webhookReady,false);assert.equal((await getXWebhookStatus({...e,X_CLIENT_SECRET:'new-secret'})).webhookReady,false);
 const broken=provider(e,{intercept:()=>Response.json({errors:[{detail:'synthetic provider failure'}]})});assert.equal((await setup(e,broken)).status,502);assert.equal((await getXWebhookStatus(e)).webhookReady,false);
 assert.equal((await setup(e,p)).status,200);await handleXConnectionRequest(internal(e,'/api/internal/admin/x/connection','DELETE'),e);await authorise(e);assert.equal((await getXWebhookStatus(e)).webhookReady,false);
});

test('provider redirect, malformed responses and foreign-account filters fail closed without leaking secrets',async()=>{
 const scenarios=[
  {path:'/2/webhooks',value:()=>new Response(null,{status:307,headers:{Location:'https://attacker.example.test/credentials'}})},
  {path:'/2/webhooks',value:()=>Response.json({data:[],errors:[{detail:'fixture-user-token'}]})},
  {path:'/2/webhooks',value:()=>new Response('{invalid',{headers:{'Content-Type':'application/json'}})},
  {path:'/2/activity/subscriptions',value:()=>Response.json({data:[subscription({filter:{user_id:'9999999999999999'}})]})},
  {path:'/2/activity/subscriptions',method:'POST',value:()=>Response.json({data:{subscription:subscription({subscription_id:'not-numeric'})}},{status:201})}
 ];
 for(const scenario of scenarios){const e=environment();await authorise(e);const p=provider(e,{webhooks:[webhook()],intercept:({u,method})=>u.pathname===scenario.path&&method===(scenario.method||'GET')?scenario.value():undefined});const response=await setup(e,p);assert.equal(response.ok,false);const body=await response.text();assert(!body.includes('fixture-user-token'));assert(!body.includes(e.X_APP_BEARER_TOKEN));assert(p.calls.every(c=>new URL(c.url).origin==='https://api.x.com'));assert.equal((await getXWebhookStatus(e)).webhookReady,false);}
});

test('status counts pending X jobs with a hard cap and rejects expired transport metadata',async()=>{
 const e=environment(),now=Date.now();await authorise(e,now);const p=provider(e,{webhooks:[webhook()],subscriptions:[subscription({expires_at:new Date(now+10000).toISOString()})]});assert.equal((await setup(e,p,now)).status,200);
 const insert=e.DB.sqlite.prepare('INSERT INTO guardian_message_jobs(id,channel,event_id,sender_id,payload_json,state,received_at,created_at,updated_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?)');
 for(let i=0;i<1002;i++)insert.run('pending-'+i,'x','dm_'+i,'customer','{}','queued',now,now,now,now+86400000);
 insert.run('email-only','email','email-event','customer','{}','queued',now,now,now,now+86400000);
 const status=await getXWebhookStatus(e,{now});assert.equal(status.pendingMessages,1000);assert.equal(status.pendingMessagesCapped,true);assert.equal(status.webhookReady,true);
 assert.equal((await getXWebhookStatus(e,{now:now+10001})).webhookReady,false);assert.equal((await getXWebhookStatus({...e,X_RECEIVING_ENABLED:'false'},{now})).webhookReady,false);
 assert.deepEqual(await getXWebhookStatus(),{webhookReady:false,webhookId:null,subscriptionId:null,receivingEnabled:false,pendingMessages:0,pendingMessagesCapped:false});
});

test('ambiguous webhook URLs cannot create a subscription even after CRC revalidation',async()=>{
 for(const revalidation of [false,true]){
  const e=environment();await authorise(e);const rows=[webhook({valid:!revalidation})];if(!revalidation)rows.push(webhook({id:'2234567890123499'}));
  const p=provider(e,{webhooks:rows,intercept:({method,state})=>{if(revalidation&&method==='PUT'){state.webhooks[0].valid=true;state.webhooks.push(webhook({id:'2234567890123499'}));return Response.json({data:{valid:true}});}}});
  const response=await setup(e,p);assert.equal(response.ok,false);assert.equal(p.calls.some(c=>new URL(c.url).pathname==='/2/activity/subscriptions'),false);assert.equal((await getXWebhookStatus(e)).webhookReady,false);
 }
});

test('request cancellation and configuration mutation stop setup at provider await boundaries',async()=>{
 for(const mode of ['abort','credential-change']){
  const e=environment();await authorise(e);const controller=new AbortController(),base=internal(e),request=new Request(base,{signal:controller.signal});
  const p=provider(e,{intercept:()=>{if(mode==='abort')controller.abort();else e.X_APP_BEARER_TOKEN='changed-bearer';return Response.json({data:[]});}});
  const response=await handleXWebhookSetupRequest(request,e,{fetcher:p.fetcher});assert.equal(response.ok,false);assert.equal(p.calls.length,1);assert.equal(writes(p).length,0);const row=e.DB.sqlite.prepare('SELECT * FROM guardian_x_transport').get();assert.equal(row.lease_token,null);assert.equal(row.verified_at,null);
 }
});

test('provider transport exception codes cannot become exposed operator errors',async()=>{
 const e=environment();await authorise(e);const p=provider(e,{intercept:()=>{throw Object.assign(Error('private body'),{code:'fixture-user-token',status:401});}});
 const response=await setup(e,p);assert.equal(response.status,503);assert.deepEqual(await response.json(),{code:'X_WEBHOOK_PROVIDER_UNAVAILABLE'});
});

function deploymentEnvironment(e,now){
 return {...e,X_SETUP_TOKEN:'fixture-setup-'.repeat(4),X_SETUP_ISSUED_AT:String(now-1000),X_SETUP_EXPIRES_AT:String(now+60000)};
}
function deploymentRequest(e,{path='/api/internal/admin/x/webhook',method='POST',actor='deployment-x-setup',token=e.X_SETUP_TOKEN}={}){
 return new Request(origin+path,{method,headers:{Authorization:'Bearer '+token,'x-guardian-operator':actor}});
}
test('temporary deployment authentication is setup-only, expiring and independently removable',async()=>{
 const now=Date.now(),e=deploymentEnvironment(environment(),now);await authorise(e,now);const p=provider(e);
 assert.equal((await handleXWebhookSetupRequest(deploymentRequest(e),e,{now,fetcher:p.fetcher})).status,200);
 assert.equal((await handleXConnectionRequest(deploymentRequest(e,{path:'/api/internal/admin/x/connection',method:'GET'}),e,{now})).status,403);
 assert.equal((await handleXConnectionRequest(deploymentRequest(e,{path:'/api/internal/admin/x/connect'}),e,{now})).status,403);
 const invalid=[
  {patch:{X_SETUP_TOKEN:undefined}},
  {patch:{X_SETUP_TOKEN:'short'}},
  {patch:{X_SETUP_ISSUED_AT:undefined}},
  {patch:{X_SETUP_EXPIRES_AT:undefined}},
  {patch:{X_SETUP_EXPIRES_AT:'not-a-time'}},
  {patch:{X_SETUP_EXPIRES_AT:String(now)}},
  {patch:{X_SETUP_EXPIRES_AT:String(now-10000)}},
  {patch:{X_SETUP_ISSUED_AT:String(now+1)}},
  {patch:{X_SETUP_EXPIRES_AT:String(now+3600000)}},
  {patch:{X_SETUP_ISSUED_AT:'9007199254740993'}},
  {request:{actor:'synthetic-operator'}},
  {request:{token:'wrong-token-'.repeat(4)}},
  {request:{method:'GET'}}
 ];
 for(const scenario of invalid){const invalidEnvironment={...e,...scenario.patch},before=p.calls.length;const response=await handleXWebhookSetupRequest(deploymentRequest(e,scenario.request),invalidEnvironment,{now,fetcher:p.fetcher});assert.equal(response.status,403,JSON.stringify(scenario));assert.equal(p.calls.length,before);}
 assert.equal(await handleXWebhookSetupRequest(deploymentRequest(e,{path:'/api/internal/admin/other'}),e,{now,fetcher:p.fetcher}),null);
 // Removing the deployment key never disables the original staff credential.
 const removed={...e,X_SETUP_TOKEN:undefined,X_SETUP_ISSUED_AT:undefined,X_SETUP_EXPIRES_AT:undefined};
 assert.equal((await setup(removed,p,now)).status,200);
});

test('deployment expiry or removal at provider awaits stops setup before another provider operation',async()=>{
 for(const mode of ['expired','removed']){
  const now=Date.now(),e=deploymentEnvironment(environment(),now);await authorise(e,now);
  const p=provider(e,{intercept:()=>{if(mode==='expired')e.X_SETUP_EXPIRES_AT=String(now);else delete e.X_SETUP_TOKEN;return Response.json({data:[]});}});
  const response=await handleXWebhookSetupRequest(deploymentRequest(e),e,{now,fetcher:p.fetcher});
  assert.equal(response.status,403);assert.deepEqual(await response.json(),{code:'X_SETUP_AUTH_EXPIRED'});assert.equal(p.calls.length,1);assert.equal(writes(p).length,0);
  assert.equal(e.DB.sqlite.prepare('SELECT lease_token FROM guardian_x_transport').get().lease_token,null);
 }
});

test('both documented subscription creation shapes validate exactly and mixed forms fail closed',async()=>{
 for(const shape of ['direct','nested','mixed','nested-extra','null']){
  const e=environment();await authorise(e);
  const p=provider(e,{webhooks:[webhook()],intercept:({u,method})=>{
   if(u.pathname!=='/2/activity/subscriptions'||method!=='POST')return;
   const row=subscription(),forms={direct:row,nested:{subscription:row},mixed:{...row,subscription:{...row,subscription_id:'9999999999999999'}},'nested-extra':{subscription:row,another:row},null:null};
   return Response.json({data:forms[shape]});
  }});
  const response=await setup(e,p);assert.equal(response.status,['direct','nested'].includes(shape)?200:502,shape);
  if(!response.ok)assert.deepEqual(await response.json(),{code:'X_WEBHOOK_RESPONSE_INVALID'});
  assert.equal(p.calls.filter(call=>new URL(call.url).pathname==='/2/activity/subscriptions'&&call.method==='POST').length,1);
 }
});

test('provider HTTP authentication, permission, credits and rate-limit diagnostics are fixed and redact upstream content',async()=>{
 const cases=[[401,'X_PROVIDER_AUTH_FAILED',502],[403,'X_PROVIDER_PERMISSION_DENIED',502],[402,'X_PROVIDER_CREDITS_REQUIRED',502],[429,'X_PROVIDER_RATE_LIMIT',429],[500,'X_WEBHOOK_PROVIDER_UNAVAILABLE',503]];
 for(const [providerStatus,code,status] of cases){
  const e=environment();await authorise(e);const p=provider(e,{intercept:()=>Response.json({errors:[{detail:'fixture-user-token '+e.X_APP_BEARER_TOKEN}]},{status:providerStatus})});
  const response=await setup(e,p);assert.equal(response.status,status);assert.deepEqual(await response.json(),{code});assert.equal(p.calls.length,1);assert.equal(writes(p).length,0);
 }
});

test('public X linking admits other authenticated accounts without enabling replies or operator test access',async()=>{
 const e={...environment(),CONTACT_GATEWAY_SECRET:'fixture-gateway-'.repeat(3),CONTACT_CHANNELS:'x',WOLFGANG_X_URL:'https://x.com/WolfgangOnCall',X_PUBLIC_LINKING_ENABLED:'true',GUARDIAN_TRANSPORT_TEST_ENABLED:'false'};await authorise(e);assert.equal((await setup(e,provider(e))).status,200);
 const read=async(config,owner)=>(await(await handleConnectionRequest(new Request(origin+'/api/connections'),config,owner)).json()).contacts.find(c=>c.channel==='x');
 for(const id of ['people:customer-one','people:customer-two','legacy-customer']){const owner={ownerId:id},contact=await read(e,owner);assert.equal(contact.linkAvailable,true);assert.equal(contact.available,false);assert.equal(contact.url,e.WOLFGANG_X_URL);}
 for(const patch of [{X_PUBLIC_LINKING_ENABLED:'false'},{X_RECEIVING_ENABLED:'false'},{CONTACT_CHANNELS:'email'},{WOLFGANG_X_URL:'https://x.com/another_account'}])assert.equal((await read({...e,...patch},{ownerId:'people:customer-two'})).linkAvailable,undefined);
 const anonymous=await handleConnectionRequest(new Request(origin+'/api/connections'),e,{});assert.equal(anonymous.status,401);assert.equal(e.WOLFGANG_X_ENABLED,'false');assert.equal(e.X_AUTOMATED_REPLIES_APPROVED,'false');
});

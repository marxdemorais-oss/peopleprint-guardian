import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {handleXConnectionRequest,getXAccessToken,getXConnection,xConnectionSettings} from '../worker/x-connection.js';

const origin='https://guardian.example.test',operatorOrigin='https://admin.example.test',now=1793482800000;
const scopes='dm.read dm.write users.read tweet.read offline.access';
function database(){
 const sql=new DatabaseSync(':memory:');for(const file of ['0002_guardian_messaging','0003_guardian_x_connection'])sql.exec(readFileSync(new URL('../drizzle/'+file+'.sql',import.meta.url),'utf8'));
 const prepare=(text,args=[])=>({bind(...values){return prepare(text,values);},async first(){return sql.prepare(text).get(...args)||null;},async all(){return {results:sql.prepare(text).all(...args)};},async run(){return {meta:{changes:Number(sql.prepare(text).run(...args).changes)}};}});
 return {sql,prepare,async batch(items){sql.exec('BEGIN');try{const result=[];for(const item of items)result.push(await item.run());sql.exec('COMMIT');return result;}catch(error){sql.exec('ROLLBACK');throw error;}}};
}
function env(){return {DB:database(),GUARDIAN_ADMIN_TOKEN:'admin-test-token'.repeat(3),CONNECTION_ENCRYPTION_KEY:Buffer.alloc(32,19).toString('base64'),X_CONNECT_ENABLED:'true',X_CLIENT_ID:'synthetic-client-id',X_CLIENT_SECRET:'test-client-secret',X_REDIRECT_URI:origin+'/api/messaging/x/callback',WOLFGANG_X_HANDLE:'WolfgangOnCall',X_OPERATOR_ORIGIN:operatorOrigin,X_OPERATOR_RETURN_URL:operatorOrigin+'/guardian?tab=channels'};}
function internal(e,path='/api/internal/admin/x/connection',method='GET',extra={}){return new Request(origin+path,{method,headers:{Authorization:'Bearer '+e.GUARDIAN_ADMIN_TOKEN,'x-guardian-operator':'operator-one',...extra}});}
async function start(e,options={}){const response=await handleXConnectionRequest(internal(e,'/api/internal/admin/x/connect','POST'),e,{now,...options});assert.equal(response.status,200);return new URL((await response.json()).authorizeUrl);}
function callback(target,params={code:'synthetic-code'}){const u=new URL(origin+'/api/messaging/x/callback');u.searchParams.set('state',target.searchParams.get('state'));for(const [k,v] of Object.entries(params))u.searchParams.set(k,v);return new Request(u);}
const token=(extra={})=>({token_type:'bearer',access_token:'test-access-token',refresh_token:'test-refresh-token',expires_in:7200,scope:scopes,...extra});
function provider({grant=token(),id='1234567890123456',username='WolfgangOnCall',calls=[]}={}){return async (url,init)=>{calls.push({url,init});assert.equal(init.redirect,'manual');if(url==='https://api.x.com/2/oauth2/token')return Response.json(grant);assert.equal(url,'https://api.x.com/2/users/me');assert.equal(init.headers.Authorization,'Bearer '+grant.access_token);return Response.json({data:{id,username}});};}
async function connect(e,{grant=token(),id,username}={}){const target=await start(e),response=await handleXConnectionRequest(callback(target),e,{now,fetcher:provider({grant,id,username})});assert.equal(new URL(response.headers.get('location')).searchParams.get('x_connection'),'connected');return target;}
const status=response=>new URL(response.headers.get('location')).searchParams.get('x_connection');

test('own-account X setup is operator-only and configuration fails closed',async()=>{
 const e=env(),anonymous=new Request(origin+'/api/internal/admin/x/connection');
 assert.equal((await handleXConnectionRequest(anonymous,e)).status,403);
 assert.equal((await handleXConnectionRequest(internal(e,undefined,'GET',{'x-guardian-operator':'bad operator'}),e)).status,403);
 assert.equal((await handleXConnectionRequest(internal(e,undefined,'GET',{Authorization:'Bearer wrong'}),e)).status,403);
 assert.equal((await handleXConnectionRequest(internal(e,'/api/internal/admin/x/connect','GET'),e)).status,405);
 assert.equal(await handleXConnectionRequest(new Request(origin+'/other'),e),null);
 for(const patch of [{X_CONNECT_ENABLED:'false'},{X_OPERATOR_RETURN_URL:'https://attacker.test/collect'},{X_REDIRECT_URI:'http://guardian.example.test/api/messaging/x/callback'},{X_REDIRECT_URI:origin+'/different'},{CONNECTION_ENCRYPTION_KEY:'short'},{WOLFGANG_X_HANDLE:'wrong handle'},{X_CLIENT_SECRET:'secret\nheader'}]){
  const changed={...e,...patch};assert.equal(xConnectionSettings(changed).configured,false);
  assert.equal((await handleXConnectionRequest(internal(e,'/api/internal/admin/x/connect','POST'),changed,{now})).status,503);
 }
 assert.equal((await getXConnection(e,{now})).status,'disconnected');
});

test('start uses S256 and single-use hashed state with encrypted verifier and exact own-account scopes',async()=>{
 const e=env(),target=await start(e);
 assert.equal(target.origin,'https://x.com');assert.equal(target.pathname,'/i/oauth2/authorize');
 assert.equal(target.searchParams.get('redirect_uri'),e.X_REDIRECT_URI);assert.equal(target.searchParams.get('code_challenge_method'),'S256');
 assert.equal(target.searchParams.get('scope'),scopes);assert.match(target.searchParams.get('state'),/^[A-Za-z0-9_-]{43}$/);
 const row=e.DB.sql.prepare('SELECT * FROM guardian_x_oauth_states').get();
 assert.notEqual(row.state_hash,target.searchParams.get('state'));assert(!row.encrypted_verifier.includes(target.searchParams.get('code_challenge')));
 assert(!JSON.stringify(row).includes(e.X_CLIENT_SECRET));assert.match(row.encrypted_verifier,/^v1\./);
 assert.equal((await getXConnection(e,{now})).pendingAuthorization,true);
});

test('successful public callback stores only encrypted tokens, returns to private UI and cannot replay',async()=>{
 const e=env(),target=await start(e),calls=[];
 const fetcher=provider({calls}),response=await handleXConnectionRequest(callback(target),e,{now,fetcher});
 const destination=new URL(response.headers.get('location'));
 assert.equal(destination.origin,operatorOrigin);assert.equal(destination.pathname,'/guardian');assert.equal(destination.searchParams.get('tab'),'channels');assert.equal(status(response),'connected');
 assert.equal(calls.length,2);const exchanged=calls[0].init;
 assert.equal(exchanged.body.get('grant_type'),'authorization_code');assert.equal(exchanged.body.get('code_verifier').length,43);assert.equal(exchanged.body.get('redirect_uri'),e.X_REDIRECT_URI);
 assert.equal(Buffer.from(exchanged.headers.Authorization.slice(6),'base64').toString(),e.X_CLIENT_ID+':'+e.X_CLIENT_SECRET);
 const stored=e.DB.sql.prepare('SELECT encrypted_token FROM guardian_x_service_account').get().encrypted_token;
 assert(!stored.includes(token().access_token));assert(!stored.includes(token().refresh_token));
 const safe=await getXConnection(e,{now});assert.equal(safe.connected,true);assert.equal(safe.accountId,'1234567890123456');assert.equal(safe.handle,'WolfgangOnCall');assert.equal(safe.pendingAuthorization,false);
 const displayed=JSON.stringify(safe);for(const sensitive of [e.X_CLIENT_SECRET,token().access_token,token().refresh_token,stored])assert(!displayed.includes(sensitive));
 assert.equal(await getXAccessToken(e,{now,fetcher:()=>{throw Error('Must not refresh');}}),token().access_token);
 const replay=await handleXConnectionRequest(callback(target),e,{now,fetcher});assert.equal(status(replay),'expired');assert.equal(calls.length,2);
 assert.equal(response.headers.get('referrer-policy'),'no-referrer');assert.match(response.headers.get('cache-control'),/no-store/);
});

test('expired, denied, forged and ambiguous callbacks cannot exchange credentials',async()=>{
 const e=env(),fetcher=()=>{throw Error('Must not call X');};
 let target=await start(e),response=await handleXConnectionRequest(callback(target),e,{now:now+600001,fetcher});assert.equal(status(response),'expired');
 target=await start(e);response=await handleXConnectionRequest(callback(target,{error:'access_denied'}),e,{now,fetcher});assert.equal(status(response),'cancelled');
 const forged=new Request(origin+'/api/messaging/x/callback?state='+'a'.repeat(43)+'&code=unused');response=await handleXConnectionRequest(forged,e,{now,fetcher});assert.equal(status(response),'expired');
 target=await start(e);const duplicate=new URL(callback(target).url);duplicate.searchParams.append('state','b'.repeat(43));response=await handleXConnectionRequest(new Request(duplicate),e,{now,fetcher});assert.equal(status(response),'expired');
 const wrongOrigin=callback(target).url.replace(origin,'https://alias.example.test');assert.equal((await handleXConnectionRequest(new Request(wrongOrigin),e,{now,fetcher})).status,400);
 assert.equal(e.DB.sql.prepare('SELECT encrypted_token FROM guardian_x_service_account').get().encrypted_token,null);
});

test('wrong account, missing renewal and broader scopes never establish a service connection',async()=>{
 for(const details of [{username:'SomeoneElse'},{grant:token({refresh_token:undefined})},{grant:token({scope:scopes+' tweet.write'})},{grant:token({scope:'dm.read users.read offline.access'})},{grant:token({token_type:'unknown'})}]){
  const e=env(),target=await start(e),calls=[];
  const response=await handleXConnectionRequest(callback(target),e,{now,fetcher:provider({...details,calls})});
  assert.equal(status(response),details.username?'wrong_account':'failed');
  assert.equal((await getXConnection(e,{now})).connected,false);assert.equal(e.DB.sql.prepare('SELECT encrypted_token FROM guardian_x_service_account').get().encrypted_token,null);
  if(!details.username)assert.equal(calls.length,1);
 }
});

test('the immutable own-account ID remains pinned across disconnect and reconnect',async()=>{
 const e=env();await connect(e);await handleXConnectionRequest(internal(e,undefined,'DELETE'),e,{now});
 const target=await start(e),response=await handleXConnectionRequest(callback(target),e,{now,fetcher:provider({id:'9999999999999999'})});
 assert.equal(status(response),'wrong_account');const s=await getXConnection(e,{now});assert.equal(s.accountId,'1234567890123456');assert.equal(s.connected,false);assert.equal(s.status,'disconnected');
});

test('operator disconnect cancels only pending X work and keeps other channels and completed jobs',async()=>{
 const e=env();await connect(e);
 const insert=e.DB.sql.prepare('INSERT INTO guardian_message_jobs(id,channel,event_id,sender_id,payload_json,state,reply_text,received_at,created_at,updated_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
 for(const [id,channel,state] of [['x-queued','x','queued'],['x-sending','x','sending'],['x-complete','x','completed'],['other','email','queued']])insert.run(id,channel,id,'customer','{"text":"private"}',state,'private pending reply',now,now,now,now+86400000);
 const result=await handleXConnectionRequest(internal(e,undefined,'DELETE'),e,{now});assert.equal(result.status,200);
 for(const id of ['x-queued','x-sending']){const row=e.DB.sql.prepare('SELECT * FROM guardian_message_jobs WHERE id=?').get(id);assert.equal(row.state,'cancelled');assert.equal(row.payload_json,'{}');assert.equal(row.reply_text,null);}
 assert.equal(e.DB.sql.prepare('SELECT state FROM guardian_message_jobs WHERE id=?').get('x-complete').state,'completed');
 assert.equal(e.DB.sql.prepare('SELECT state FROM guardian_message_jobs WHERE id=?').get('other').state,'queued');
});

test('disconnect during either OAuth network step prevents callback resurrection',async()=>{
 for(const stopAt of ['token','profile']){
  const e=env(),target=await start(e);let calls=0;
  const fetcher=async (url,init)=>{calls++;if((stopAt==='token'&&url.endsWith('/token'))||(stopAt==='profile'&&url.endsWith('/me')))assert.equal((await handleXConnectionRequest(internal(e,undefined,'DELETE'),e,{now})).status,200);return provider()(url,init);};
  const response=await handleXConnectionRequest(callback(target),e,{now,fetcher});assert.equal(status(response),'cancelled');
  assert.equal(calls,stopAt==='token'?1:2);assert.equal((await getXConnection(e,{now})).connected,false);
  assert.equal(e.DB.sql.prepare('SELECT encrypted_token FROM guardian_x_service_account').get().encrypted_token,null);
 }
});

test('a newer operator flow cancels an in-flight callback and duplicate callbacks cannot exchange twice',async()=>{
 const e=env(),target=await start(e);let newer,calls=0;
 const response=await handleXConnectionRequest(callback(target),e,{now,fetcher:async (url,init)=>{
  calls++;
  if(url.endsWith('/token')){const duplicate=await handleXConnectionRequest(callback(target),e,{now,fetcher:()=>{throw Error('Duplicate');}});assert.equal(status(duplicate),'expired');return provider()(url,init);}
  newer=await start(e);return provider()(url,init);
 }});
 assert.equal(status(response),'cancelled');assert.equal(calls,2);assert.notEqual(newer.searchParams.get('state'),target.searchParams.get('state'));
 assert.equal(e.DB.sql.prepare('SELECT COUNT(*) AS n FROM guardian_x_oauth_states').get().n,1);assert.equal((await getXConnection(e,{now})).connected,false);
});

test('refresh rotates tokens once and subsequent reads use the renewed credential',async()=>{
 const e=env();await connect(e,{grant:token({expires_in:60})});let calls=0;
 const renewed=token({access_token:'renewed-access',refresh_token:'rotated-refresh',scope:undefined});
 const access=await getXAccessToken(e,{now:now+60001,fetcher:async (url,init)=>{calls++;assert.equal(url,'https://api.x.com/2/oauth2/token');assert.equal(init.body.get('grant_type'),'refresh_token');assert.equal(init.body.get('refresh_token'),token().refresh_token);return Response.json(renewed);}});
 assert.equal(access,'renewed-access');assert.equal(calls,1);const row=e.DB.sql.prepare('SELECT * FROM guardian_x_service_account').get();assert.equal(row.refresh_lease_token,null);assert(!row.encrypted_token.includes('rotated-refresh'));
 assert.equal(await getXAccessToken(e,{now:now+61000,fetcher:()=>{throw Error('Not due');}}),'renewed-access');
});

test('a durable refresh lease prevents simultaneous refresh-token rotation',async()=>{
 const e=env();await connect(e,{grant:token({expires_in:60})});let release,started;
 const ready=new Promise(resolve=>{started=resolve;}),pending=new Promise(resolve=>{release=resolve;});let calls=0;
 const first=getXAccessToken(e,{now:now+60001,fetcher:async()=>{calls++;started();return pending;}});await ready;
 await assert.rejects(getXAccessToken(e,{now:now+60001,fetcher:()=>{throw Error('Duplicate provider request');}}),error=>error.code==='X_TOKEN_REFRESHING');
 release(Response.json(token({access_token:'only-fresh-access',refresh_token:'only-fresh-refresh'})));assert.equal(await first,'only-fresh-access');assert.equal(calls,1);
});

test('disconnect during refresh discards returned credentials and cannot restore access',async()=>{
 const e=env();await connect(e,{grant:token({expires_in:60})});
 await assert.rejects(getXAccessToken(e,{now:now+60001,fetcher:async()=>{await handleXConnectionRequest(internal(e,undefined,'DELETE'),e,{now:now+60001});return Response.json(token({access_token:'must-not-persist'}));}}),error=>error.code==='X_CONNECTION_CHANGED');
 const row=e.DB.sql.prepare('SELECT * FROM guardian_x_service_account').get();assert.equal(row.status,'disconnected');assert.equal(row.encrypted_token,null);assert.equal(row.refresh_lease_token,null);
});

test('refresh provider failures are redacted, release the lease and distinguish retry from reauthorisation',async()=>{
 for(const response of [new Response('private provider message',{status:500}),new Response('private provider message',{status:400}),Response.json(token({scope:scopes+' tweet.write'}))]){
  const e=env();await connect(e,{grant:token({expires_in:60})});
  await assert.rejects(getXAccessToken(e,{now:now+60001,fetcher:async()=>response}),error=>{assert(!error.message.includes('private'));return ['X_PROVIDER_UNAVAILABLE','X_RECONNECT_REQUIRED'].includes(error.code);});
  const row=e.DB.sql.prepare('SELECT * FROM guardian_x_service_account').get();assert.equal(row.refresh_lease_token,null);assert.equal(row.status,response.status===500?'connected':'reconnect_required');
 }
});

test('provider redirects, invalid content and oversized bodies never leak credentials to another host',async()=>{
 for(const response of [new Response(null,{status:307,headers:{Location:'https://attacker.example/collect'}}),new Response('not json',{headers:{'Content-Type':'text/plain'}}),new Response('x'.repeat(64001),{headers:{'Content-Type':'application/json'}})]){
  const e=env(),target=await start(e);let calls=0;
  const result=await handleXConnectionRequest(callback(target),e,{now,fetcher:async (url,init)=>{calls++;assert.equal(url,'https://api.x.com/2/oauth2/token');assert.equal(init.redirect,'manual');return response;}});
  assert.equal(status(result),'failed');assert.equal(calls,1);assert.equal((await getXConnection(e,{now})).connected,false);
 }
});

test('service token encryption is bound to the configured app and account',async()=>{
 const e=env();await connect(e);e.X_CLIENT_ID='another-app-id';
 await assert.rejects(getXAccessToken(e,{now}),error=>error.code==='X_RECONNECT_REQUIRED');
 assert.equal((await getXConnection(e,{now})).status,'reconnect_required');
});

test('operator status counts bounded retained encrypted-event notices without storing message content',async()=>{
 const e=env();e.DB.sql.prepare('INSERT INTO guardian_x_event_notices VALUES (?,?,?,?)').run('new','chat.received','encrypted_chat_not_supported',now);
 e.DB.sql.prepare('INSERT INTO guardian_x_event_notices VALUES (?,?,?,?)').run('expired','chat.received','encrypted_chat_not_supported',now-31*86400000);
 const response=await handleXConnectionRequest(internal(e),e,{now}),safe=await response.json();assert.equal(safe.unresolvedEncryptedEvents,1);
 assert(!JSON.stringify(safe).includes('encrypted_token'));assert.equal(safe.unresolvedEncryptedEventsCapped,false);
});

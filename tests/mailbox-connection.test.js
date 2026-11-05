import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {createHmac,createHash,timingSafeEqual} from 'node:crypto';
function verifySignature(key,path,headers,body,now){const timestamp=headers['x-mailbox-timestamp'],nonce=headers['x-mailbox-nonce'];assert.match(timestamp,/^\d{13}$/);assert(Math.abs(Number(timestamp)-now)<30000);assert.match(nonce,/^[A-Za-z0-9_-]{43}$/);const expected=createHmac('sha256',key).update(['POST',path,timestamp,nonce,createHash('sha256').update(body).digest('hex')].join('\n')).digest('base64url');assert(timingSafeEqual(Buffer.from(expected),Buffer.from(headers['x-mailbox-signature'])));}
const keyBytes=value=>Buffer.from(value,'base64url');
import {handleMailboxConnectionRequest,mailboxConnectionSummary,signedMailboxRequest,stopOwnedMailbox} from '../worker/mailbox-connection.js';
import {handleConnectionRequest,disconnectAllOwnedConnections} from '../worker/connections.js';
const origin='https://guardian.test',owner={ownerId:'people:canonical-owner-a'},other={ownerId:'people:canonical-owner-b'},now=Date.now();
function database(){const db=new DatabaseSync(':memory:');db.exec(readFileSync(new URL('../drizzle/0000_guardian_product.sql',import.meta.url),'utf8'));const prepare=(sql,args=[])=>({bind(...values){return prepare(sql,values);},async first(){return db.prepare(sql).get(...args)||null;},async all(){return {results:db.prepare(sql).all(...args)};},async run(){return {meta:{changes:Number(db.prepare(sql).run(...args).changes)}};}});return {prepare,db,async batch(qs){db.exec('BEGIN');try{const result=[];for(const q of qs)result.push(await q.run());db.exec('COMMIT');return result;}catch(e){db.exec('ROLLBACK');throw e;}}};}
function env(){return {DB:database(),MAILBOX_CONNECT_ENABLED:'true',MAILBOX_CONNECTOR_ORIGIN:'https://mailbox-service.example.test',MAILBOX_SIGNING_KEY:Buffer.alloc(32,19).toString('base64url'),MAILBOX_REVIEWED_PROVIDERS:JSON.stringify([{id:'owned-imap',label:'Owned IMAP',protocol:'imap'}])};}
function req(path,method='GET',body){return new Request(origin+'/api/connections/mailbox'+path,{method,headers:{origin,'Content-Type':'application/json','sec-fetch-site':'same-origin'},...(body?{body:JSON.stringify(body)}:{})});}
const connectBody={providerId:'owned-imap',username:'owner@example.test',password:'fixture-app-password',consent:true};
function upstream(e,{intercept}={}){const state={calls:[],records:new Map()};state.fetcher=async(url,init)=>{const path=new URL(url).pathname;assert.equal(new URL(url).origin,e.MAILBOX_CONNECTOR_ORIGIN);assert.equal(init.method,'POST');assert.equal(init.redirect,'manual');verifySignature(keyBytes(e.MAILBOX_SIGNING_KEY),path,init.headers,Buffer.from(init.body),now);const body=JSON.parse(init.body);assert.match(body.ownerId,/^[a-f0-9]{64}$/);assert.match(body.connectionId,/^[A-Za-z0-9_-]{43}$/);assert.equal(body.generation,1);state.calls.push({path,body});const intercepted=await intercept?.(path,body,state);if(intercepted)return intercepted;if(path==='/v1/connections'){state.records.set(body.ownerId,body.connectionId);return Response.json({state:'connected',generation:1,providerId:'owned-imap',protocol:'imap',mailbox:'INBOX'});}if(path==='/v1/connections/stop'){if(state.records.get(body.ownerId)===body.connectionId)state.records.delete(body.ownerId);return Response.json({state:'stopped',generation:1});}if(path==='/v1/search'||path==='/v1/read')return Response.json({connectionId:body.connectionId,generation:1,providerId:'owned-imap',records:[{reference:{uid:'12',uidValidity:'100',mailbox:'INBOX'},source:'IMAP selected email',text:'Subject: Known supplier\n\nOur earlier agreement.',notices:[],provenance:'connected-mailbox-unverified-sender',senderAuthenticated:false}],searchScope:'Most recent 500 INBOX messages'});throw Error('Unexpected endpoint');};return state;}
async function connect(e,p,who=owner){const r=await handleMailboxConnectionRequest(req('/connect','POST',connectBody),e,who,{fetcher:p.fetcher,now});assert.equal(r.status,200,await r.clone().text());return r;}

test('mailbox connections stay absent when unconfigured and require authenticated same-origin owner',async()=>{const e=env();assert.equal(await mailboxConnectionSummary({...e,MAILBOX_CONNECT_ENABLED:'false'},owner.ownerId),null);assert.equal((await handleMailboxConnectionRequest(req('/providers'),e,{})).status,401);assert.equal((await handleMailboxConnectionRequest(new Request(origin+'/api/connections/mailbox/connect',{method:'POST',headers:{origin:'https://attacker.test','Content-Type':'application/json'},body:JSON.stringify(connectBody)}),e,owner)).status,403);const p=upstream(e);for(const patch of [{MAILBOX_CONNECTOR_ORIGIN:'http://mailbox-service.example.test'},{MAILBOX_CONNECTOR_ORIGIN:'https://127.0.0.1'},{MAILBOX_CONNECTOR_ORIGIN:'https://mailbox-service.example.test/path'},{MAILBOX_REVIEWED_PROVIDERS:'[]'},{MAILBOX_SIGNING_KEY:'bad'}])assert.equal((await handleMailboxConnectionRequest(req('/providers'),{...e,...patch},owner,{fetcher:p.fetcher})).status,503);assert.equal(p.calls.length,0);});

test('connect forwards credentials only to fixed signed backend, stores no credential and lists read-only selection',async()=>{const e=env(),p=upstream(e);await connect(e,p);const row=e.DB.db.prepare('SELECT * FROM guardian_connections').get();assert.equal(row.owner_id,owner.ownerId);assert.equal(row.status,'connected');assert(!JSON.stringify(row).includes('fixture-app-password'));assert(!JSON.stringify(row).includes('owner@example.test'));const listing=await(await handleConnectionRequest(new Request(origin+'/api/connections'),e,owner)).json(),mail=listing.connections.find(r=>r.provider==='mailbox');assert.equal(mail.available,true);assert.equal(mail.searchReady,true);assert.equal(mail.syncReady,false);assert(!JSON.stringify(listing).includes(e.MAILBOX_SIGNING_KEY));assert(!JSON.stringify(listing).includes(e.MAILBOX_CONNECTOR_ORIGIN));const providers=await(await handleMailboxConnectionRequest(req('/providers'),e,owner)).json();assert.deepEqual(providers.providers,[{id:'owned-imap',label:'Owned IMAP',protocol:'imap'}]);});

test('selected mailbox records are canonical-owner scoped with unverified-sender labels',async()=>{const e=env(),p=upstream(e);await connect(e,p);const denied=await handleMailboxConnectionRequest(req('/search?q=supplier'),e,other,{fetcher:p.fetcher,now});assert.equal(denied.status,409);assert.equal(p.calls.length,1);const r=await handleMailboxConnectionRequest(req('/search?q=supplier'),e,owner,{fetcher:p.fetcher,now});assert.equal(r.status,200);const result=await r.json();assert.equal(result.records.length,1);assert.match(result.records[0].id,/^ev-mail-[a-f0-9]{24}$/);assert.equal(result.records[0].senderAuthenticated,false);assert.match(result.records[0].text,/Sender headers are unverified/);assert.equal(result.searchScope,'Most recent 500 INBOX messages');});

test('mailbox consent, server metadata and bounded credential fields are required before remote access',async()=>{for(const patch of [{consent:false},{providerId:'arbitrary-host'},{host:'127.0.0.1'},{password:'bad\r\ncommand'},{password:'x'.repeat(1025)}]){const e=env(),p=upstream(e);const r=await handleMailboxConnectionRequest(req('/connect','POST',{...connectBody,...patch}),e,owner,{fetcher:p.fetcher,now});assert.equal(r.status,400);assert.equal(p.calls.length,0);}});

test('Stop invalidates current read and connection attempts after awaited provider responses',async()=>{for(const stopAt of ['/v1/connections','/v1/search']){const e=env();let stopped=false;const p=upstream(e,{intercept:async path=>{if(!stopped&&path===stopAt){stopped=true;await stopOwnedMailbox(e,owner.ownerId,{fetcher:p.fetcher,now});}}});if(stopAt==='/v1/connections'){const r=await handleMailboxConnectionRequest(req('/connect','POST',connectBody),e,owner,{fetcher:p.fetcher,now});assert.equal(r.status,409);}else{await connect(e,p);const r=await handleMailboxConnectionRequest(req('/search?q=supplier'),e,owner,{fetcher:p.fetcher,now});assert.equal(r.status,409);}assert.equal(e.DB.db.prepare('SELECT count(*) n FROM guardian_connections').get().n,0);assert(p.calls.some(c=>c.path==='/v1/connections/stop'));}});

test('Stop-all connections invokes mailbox credential removal and retains saved records',async()=>{const e=env(),p=upstream(e);await connect(e,p);await disconnectAllOwnedConnections(e,owner.ownerId,{fetcher:p.fetcher});assert.equal(e.DB.db.prepare('SELECT count(*) n FROM guardian_connections').get().n,0);assert.equal(p.calls.at(-1).path,'/v1/connections/stop');});

test('redirects and oversized/malformed responses never expose provider credential or private body',async()=>{const e=env();for(const fetcher of [async()=>new Response(null,{status:307,headers:{location:'https://attacker.test'}}),async()=>Response.json({records:[],private:'fixture-app-password'.repeat(10000)}),async()=>new Response('not-json',{headers:{'Content-Type':'application/json'}})]){await assert.rejects(signedMailboxRequest(e,'/v1/search',{},{fetcher,now}),error=>!error.message.includes('fixture-app-password'));}});

test('connect attempts have a durable per-owner rate limit',async()=>{const e=env(),p=upstream(e);for(let i=0;i<3;i++)await connect(e,p);const r=await handleMailboxConnectionRequest(req('/connect','POST',connectBody),e,owner,{fetcher:p.fetcher,now});assert.equal(r.status,429);assert.equal(p.calls.filter(c=>c.path==='/v1/connections').length,3);});

test('Stop still reaches connector after new connections are disabled, and failed cleanup retains retry reference',async()=>{
 const e=env(),p=upstream(e);await connect(e,p);
 const failed=await stopOwnedMailbox({...e,MAILBOX_CONNECT_ENABLED:'false'},owner.ownerId,{fetcher:async()=>{throw Error('offline');},now});assert.equal(failed.revoked,false);
 const row=e.DB.db.prepare('SELECT * FROM guardian_connections').get();assert.equal(row.status,'stopping');assert.match(row.external_id,/^[A-Za-z0-9_-]{43}$/);
 const denied=await handleMailboxConnectionRequest(req('/search?q=supplier'),e,owner,{fetcher:p.fetcher,now});assert.equal(denied.status,409);
 assert.equal((await stopOwnedMailbox({...e,MAILBOX_CONNECT_ENABLED:'false'},owner.ownerId,{fetcher:p.fetcher,now})).revoked,true);
 assert.equal(e.DB.db.prepare('SELECT count(*) n FROM guardian_connections').get().n,0);
});

test('unconfirmed mailbox cleanup cannot be overwritten by a new connection attempt',async()=>{
 const e=env(),p=upstream(e);await connect(e,p);await stopOwnedMailbox(e,owner.ownerId,{fetcher:async()=>{throw Error('offline');},now});
 const before=e.DB.db.prepare("SELECT external_id,status FROM guardian_connections WHERE owner_id=? AND provider='mailbox'").get(owner.ownerId);
 const summary=await mailboxConnectionSummary(e,owner.ownerId);assert.equal(summary.cleanupPending,true);assert.equal(summary.available,false);assert.equal(summary.searchReady,false);
 const blocked=await handleMailboxConnectionRequest(req('/connect','POST',connectBody),e,owner,{fetcher:()=>{throw Error('Pending cleanup must not create a new remote connection');},now});assert.equal(blocked.status,409);assert.match((await blocked.json()).message,/Retry removal before connecting again/);
 assert.deepEqual(e.DB.db.prepare("SELECT external_id,status FROM guardian_connections WHERE owner_id=? AND provider='mailbox'").get(owner.ownerId),before);
 assert.equal((await stopOwnedMailbox(e,owner.ownerId,{fetcher:p.fetcher,now})).revoked,true);
 const again=await connect(e,p);assert.equal(again.status,200);assert.notEqual(e.DB.db.prepare("SELECT external_id FROM guardian_connections WHERE owner_id=? AND provider='mailbox'").get(owner.ownerId).external_id,before.external_id);
 const live=e.DB.db.prepare("SELECT external_id FROM guardian_connections WHERE owner_id=? AND provider='mailbox'").get(owner.ownerId).external_id,prepare=e.DB.prepare;
 // Stop can begin after the state read but before the replacement marker write.
 e.DB.prepare=sql=>{const query=prepare(sql);if(!sql.startsWith("UPDATE guardian_connections SET status='connecting'"))return query;return {bind(...values){const bound=query.bind(...values);return {...bound,async run(){e.DB.db.prepare("UPDATE guardian_connections SET status='stopping',display_label=NULL,connected_at=NULL WHERE owner_id=? AND provider='mailbox'").run(owner.ownerId);return bound.run();}};}};};
 const raced=await handleMailboxConnectionRequest(req('/connect','POST',connectBody),e,owner,{fetcher:()=>{throw Error('Concurrent cleanup must not be overwritten');},now});assert.equal(raced.status,409);assert.equal(e.DB.db.prepare("SELECT external_id FROM guardian_connections WHERE owner_id=? AND provider='mailbox'").get(owner.ownerId).external_id,live);
});

test('a lost connect response keeps its cleanup reference until remote removal is confirmed',async()=>{
 const e=env();let failCleanup=true;
 const p=upstream(e,{intercept:async(path,body,state)=>{
  if(failCleanup&&path==='/v1/connections'){state.records.set(body.ownerId,body.connectionId);throw Error('Synthetic lost response after remote activation');}
  if(failCleanup&&path==='/v1/connections/stop')throw Error('Synthetic cleanup outage');
 }});
 const failed=await handleMailboxConnectionRequest(req('/connect','POST',connectBody),e,owner,{fetcher:p.fetcher,now});
 assert.equal(failed.status,502);assert.match((await failed.json()).message,/has not confirmed credential removal/);
 const row=e.DB.db.prepare('SELECT * FROM guardian_connections').get();
 assert.equal(row.status,'stopping');assert.equal(p.records.get(createHash('sha256').update(owner.ownerId).digest('hex')),row.external_id);
 assert.equal((await mailboxConnectionSummary(e,owner.ownerId)).cleanupPending,true);
 assert.equal((await handleMailboxConnectionRequest(req('/search?q=supplier'),e,owner,{fetcher:p.fetcher,now})).status,409);
 const blocked=await handleMailboxConnectionRequest(req('/connect','POST',connectBody),e,owner,{fetcher:p.fetcher,now});assert.equal(blocked.status,409);
 assert.equal(p.calls.filter(c=>c.path==='/v1/connections').length,1);
 failCleanup=false;assert.equal((await stopOwnedMailbox(e,owner.ownerId,{fetcher:p.fetcher,now})).revoked,true);
 assert.equal(p.records.size,0);assert.equal(e.DB.db.prepare('SELECT count(*) n FROM guardian_connections').get().n,0);
 await connect(e,p);assert.notEqual(e.DB.db.prepare('SELECT external_id FROM guardian_connections').get().external_id,row.external_id);
});

test('failed Stop during an in-flight connect remains pending and never affects another owner',async()=>{
 const e=env();let race=false,stopped=false;
 const p=upstream(e,{intercept:async(path,body,state)=>{
  if(race&&path==='/v1/connections/stop')throw Error('Synthetic cleanup outage');
  if(race&&!stopped&&path==='/v1/connections'){
   stopped=true;state.records.set(body.ownerId,body.connectionId);
   assert.equal((await stopOwnedMailbox(e,owner.ownerId,{fetcher:p.fetcher,now})).revoked,false);
  }
 }});
 await connect(e,p,other);const otherBefore=e.DB.db.prepare('SELECT * FROM guardian_connections WHERE owner_id=?').get(other.ownerId);
 race=true;
 const failed=await handleMailboxConnectionRequest(req('/connect','POST',connectBody),e,owner,{fetcher:p.fetcher,now});
 assert.equal(failed.status,409);assert.match((await failed.json()).message,/has not confirmed credential removal/);
 const pending=e.DB.db.prepare('SELECT * FROM guardian_connections WHERE owner_id=?').get(owner.ownerId);
 assert.equal(pending.status,'stopping');assert.equal(p.records.get(createHash('sha256').update(owner.ownerId).digest('hex')),pending.external_id);
 assert.deepEqual(e.DB.db.prepare('SELECT * FROM guardian_connections WHERE owner_id=?').get(other.ownerId),otherBefore);
 race=false;assert.equal((await stopOwnedMailbox(e,owner.ownerId,{fetcher:p.fetcher,now})).revoked,true);
 assert.equal(e.DB.db.prepare('SELECT count(*) n FROM guardian_connections WHERE owner_id=?').get(owner.ownerId).n,0);
 assert.deepEqual(e.DB.db.prepare('SELECT * FROM guardian_connections WHERE owner_id=?').get(other.ownerId),otherBefore);
});

test('replacement waits for confirmed cleanup and preserves the previous reference on failure',async()=>{
 const e=env();let failCleanup=false;
 const p=upstream(e,{intercept:async path=>{if(failCleanup&&path==='/v1/connections/stop')throw Error('Synthetic cleanup outage');}});
 await connect(e,p);await connect(e,p,other);
 const before=e.DB.db.prepare('SELECT * FROM guardian_connections WHERE owner_id=?').get(owner.ownerId);
 const otherBefore=e.DB.db.prepare('SELECT * FROM guardian_connections WHERE owner_id=?').get(other.ownerId);
 failCleanup=true;
 const failed=await handleMailboxConnectionRequest(req('/connect','POST',connectBody),e,owner,{fetcher:p.fetcher,now});
 assert.equal(failed.status,409);assert.match((await failed.json()).message,/Retry removal before connecting again/);
 const pending=e.DB.db.prepare('SELECT * FROM guardian_connections WHERE owner_id=?').get(owner.ownerId);
 assert.equal(pending.external_id,before.external_id);assert.equal(pending.status,'stopping');
 assert.equal(p.calls.filter(c=>c.path==='/v1/connections').length,2);
 assert.deepEqual(e.DB.db.prepare('SELECT * FROM guardian_connections WHERE owner_id=?').get(other.ownerId),otherBefore);
 failCleanup=false;assert.equal((await stopOwnedMailbox(e,owner.ownerId,{fetcher:p.fetcher,now})).revoked,true);
 await connect(e,p);assert.notEqual(e.DB.db.prepare('SELECT external_id FROM guardian_connections WHERE owner_id=?').get(owner.ownerId).external_id,before.external_id);
});

test('concurrent new attempts cannot overwrite the winning connection reference',async()=>{
 const e=env(),p=upstream(e);
 const results=await Promise.all([1,2].map(()=>handleMailboxConnectionRequest(req('/connect','POST',connectBody),e,owner,{fetcher:p.fetcher,now})));
 assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
 assert.equal(p.calls.filter(c=>c.path==='/v1/connections').length,1);
 const row=e.DB.db.prepare('SELECT * FROM guardian_connections').get();assert.equal(row.status,'connected');
 assert.equal(p.records.get(createHash('sha256').update(owner.ownerId).digest('hex')),row.external_id);
});

test('Stop during replacement cleanup prevents the new connection from starting',async()=>{
 const e=env();let replace=false,stopped=false;
 const p=upstream(e,{intercept:async path=>{
  if(replace&&!stopped&&path==='/v1/connections/stop'){
   stopped=true;
   assert.equal((await stopOwnedMailbox(e,owner.ownerId,{fetcher:p.fetcher,now})).revoked,true);
  }
 }});
 await connect(e,p);replace=true;
 const blocked=await handleMailboxConnectionRequest(req('/connect','POST',connectBody),e,owner,{fetcher:p.fetcher,now});
 assert.equal(blocked.status,409);
 assert.equal(p.calls.filter(c=>c.path==='/v1/connections').length,1);
 assert.equal(e.DB.db.prepare('SELECT count(*) n FROM guardian_connections').get().n,0);
 assert.equal(p.records.size,0);
});

test('email-first discovery is authenticated, rate limited and rejects credentials before any lookup',async()=>{
 const e=env();e.MAILBOX_REVIEWED_PROVIDERS=JSON.stringify([{id:'owned-imap',label:'Our provider',protocol:'imap',domains:['example.test']}]);
 assert.equal((await handleMailboxConnectionRequest(req('/discover','POST',{email:'Owner@example.test'}),e,{})).status,401);
 let calls=0;const options={now,fetcher:()=>{calls++;throw Error('Direct matching must not contact another service');}};
 const invalid=await handleMailboxConnectionRequest(req('/discover','POST',{email:'Owner@example.test',password:'do-not-forward'}),e,owner,options);assert.equal(invalid.status,400);
 for(let i=0;i<20;i++){
  const r=await handleMailboxConnectionRequest(req('/discover','POST',{email:'Owner@example.test'}),e,owner,options);assert.equal(r.status,200);const value=await r.json();assert.equal(value.kind,'mailbox');assert.equal(value.providerId,'owned-imap');assert(!JSON.stringify(value).includes(e.MAILBOX_SIGNING_KEY));
 }
 assert.equal((await handleMailboxConnectionRequest(req('/discover','POST',{email:'Owner@example.test'}),e,owner,options)).status,429);assert.equal(calls,0);
});

test('nominated-owner mailbox testing does not activate connections for other customers',async()=>{
 const e={...env(),MAILBOX_CONNECT_ENABLED:'false',MAILBOX_TEST_OWNER_ID:owner.ownerId},p=upstream(e);
 assert.equal((await mailboxConnectionSummary(e,owner.ownerId)).available,true);assert.equal(await mailboxConnectionSummary(e,other.ownerId),null);
 assert.equal((await handleMailboxConnectionRequest(req('/connect','POST',connectBody),e,other,{fetcher:p.fetcher,now})).status,503);
 await connect(e,p);assert.equal(p.calls.filter(c=>c.path==='/v1/connections').length,1);
 assert.equal((await handleMailboxConnectionRequest(req('/search?q=supplier'),e,owner,{fetcher:p.fetcher,now})).status,200);
});

test('discovery cannot request a new credential while previous removal is unconfirmed',async()=>{
 const e=env(),p=upstream(e);e.MAILBOX_REVIEWED_PROVIDERS=JSON.stringify([{id:'owned-imap',label:'Our provider',protocol:'imap',domains:['example.test']}]);
 await connect(e,p);await stopOwnedMailbox(e,owner.ownerId,{fetcher:async()=>{throw Error('offline');},now});
 const r=await handleMailboxConnectionRequest(req('/discover','POST',{email:'Owner@example.test'}),e,owner,{now,fetcher:p.fetcher});assert.equal(r.status,200);const result=await r.json();assert.equal(result.kind,'unavailable');assert.match(result.message,/Finish removing/);
});

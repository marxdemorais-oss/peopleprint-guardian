import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {handleContactRequest} from '../worker/contact-ingress.js';
import {handleProductRequest} from '../worker/product-service.js';
const origin='https://guardian.test',secret='contact-test-secret-that-is-at-least-32-characters';
const alice={ownerId:'alice',email:'alice@example.test',name:'Alice'},bob={ownerId:'bob',email:'bob@example.test',name:'Bob'};
function database(){const sqlite=new DatabaseSync(':memory:');const journal=JSON.parse(readFileSync(new URL('../drizzle/meta/_journal.json',import.meta.url)));
 for(const {tag} of journal.entries)sqlite.exec(readFileSync(new URL('../drizzle/'+tag+'.sql',import.meta.url),'utf8'));
 const stmt=(sql,values=[])=>({bind(...args){return stmt(sql,args);},async first(){return sqlite.prepare(sql).get(...values)||null;},async all(){return {results:sqlite.prepare(sql).all(...values)};},async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...values).changes)}};},sql,values});return {sqlite,prepare:stmt,async batch(rows){sqlite.exec('BEGIN');try{const results=rows.map(r=>/RETURNING/.test(r.sql)?{results:sqlite.prepare(r.sql).all(...r.values)}:{meta:{changes:Number(sqlite.prepare(r.sql).run(...r.values).changes)}});sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};}
const env=db=>({DB:db,CONTACT_GATEWAY_SECRET:secret,CONTACT_CHANNELS:'email,whatsapp,sms,messenger,instagram,x'});
async function call(db,path,body,identity=alice,method='POST',headers={},extraEnv={},options={}){const response=await handleContactRequest(new Request(origin+path,{method,headers:{origin,'content-type':'application/json',...headers},...(body===undefined?{}:{body:JSON.stringify(body)})}),{...env(db),...extraEnv},identity,options);return {status:response.status,body:await response.json()};}
async function event(db,body,{time=Math.floor(Date.now()/1000),key=secret,signature,extraEnv={},options={}}={}){const raw=JSON.stringify(body),signingKey=await crypto.subtle.importKey('raw',new TextEncoder().encode(key),{name:'HMAC',hash:'SHA-256'},false,['sign']);const signed=await crypto.subtle.sign('HMAC',signingKey,new TextEncoder().encode(time+'.'+raw));const hash=Array.from(new Uint8Array(signed),n=>n.toString(16).padStart(2,'0')).join('');return call(db,'/api/contact-events',body,{},'POST',{'x-wolfgang-timestamp':String(time),'x-wolfgang-signature':signature||'sha256='+hash},extraEnv,options);}
const incoming=(extra={})=>({eventId:'incoming-1',channel:'whatsapp',senderId:'platform-user-1',senderVerified:true,text:'A message asks me to pay somebody else. Forwarded from scammer@example.test.',...extra});
async function link(db,identity=alice,senderId='platform-user-1',channel='whatsapp',eventId='link-1'){const issued=await call(db,'/api/contact-link',{channel},identity);assert.equal(issued.status,201);const data={eventId,channel,senderId,senderVerified:true,linkCode:issued.body.code};const result=await event(db,data);assert.equal(result.status,200);assert.equal(result.body.status,'linked');return {issued,data};}

test('three separately verified senders on each channel route to the same private account',async()=>{
 const db=database();
 for(const channel of ['email','whatsapp']){
  const senders=channel==='email'?['alice@example.test','alice@other-provider.test','alice@company.test']:['447000000001','447000000002','447000000003'];
  for(const [index,senderId] of senders.entries()){
   const issued=await call(db,'/api/contact-link',{channel});
   assert.equal(issued.status,201);
   assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM guardian_channel_identities WHERE channel=?').get(channel).n,index);
   const verified=await event(db,{eventId:channel+'-link-'+index,channel,senderId,senderVerified:true,linkCode:issued.body.code});
   assert.equal(verified.body.status,'linked');
   const reply=await event(db,incoming({eventId:channel+'-message-'+index,channel,senderId}));
   assert.equal(reply.body.reply.senderId,senderId);
   assert.equal(db.sqlite.prepare('SELECT owner_id FROM guardian_checks WHERE id=?').get(reply.body.checkId).owner_id,alice.ownerId);
  }
  assert.equal((await call(db,'/api/contact-link',{channel})).body.code,'CONTACT_IDENTITY_LIMIT');
 }
 const listed=(await call(db,'/api/contact-link',undefined,alice,'GET')).body;
 assert.equal(listed.identities.length,6);assert(listed.identities.every(i=>i.senderId&&i.verifiedAt));
 assert.equal((await call(db,'/api/contact-link',undefined,bob,'GET')).body.identities.length,0);
 db.sqlite.close();
});

test('removing one contact cancels only its work and preserves other senders on that channel',async()=>{
 for(const channel of ['email','whatsapp']){
  const db=database(),removed=channel==='email'?'remove@example.test':'447000000001',kept=channel==='email'?'keep@example.test':'447000000002',now=Date.now();
  await link(db,alice,removed,channel,'remove-link');await link(db,alice,kept,channel,'keep-link');
  await link(db,bob,'other-owner',channel,'other-link');
  for(const sender of [removed,kept])db.sqlite.prepare("INSERT INTO guardian_message_jobs(id,channel,event_id,sender_id,owner_id,payload_json,state,received_at,created_at,updated_at,expires_at) VALUES (?,?,?,?,?,'{}','queued',?,?,?,?)").run(sender,channel,sender,sender,alice.ownerId,now,now,now,now+60000);
  const result=await call(db,'/api/contact-link',{channel,senderId:removed},alice,'DELETE');assert.equal(result.status,200);
  assert.equal(db.sqlite.prepare('SELECT state FROM guardian_message_jobs WHERE id=?').get(removed).state,'cancelled');
  assert.equal(db.sqlite.prepare('SELECT state FROM guardian_message_jobs WHERE id=?').get(kept).state,'queued');
  assert.deepEqual((await call(db,'/api/contact-link',undefined,alice,'GET')).body.identities.map(i=>i.senderId),[kept]);
  assert.equal((await event(db,incoming({channel,senderId:kept,eventId:'kept-message'}))).body.accepted,true);
  assert.equal((await event(db,incoming({channel,senderId:removed,eventId:'removed-message'}))).body.status,'needs_link');
  assert.equal((await call(db,'/api/contact-link',{channel,senderId:'other-owner'},alice,'DELETE')).status,404);
  assert.equal((await call(db,'/api/contact-link',{channel,senderId:''},alice,'DELETE')).status,400);
  if(channel==='email')assert(db.sqlite.prepare('SELECT sender_id FROM guardian_email_sender_optouts WHERE sender_id=?').get(removed));
  db.sqlite.close();
 }
});

test('contact limit is checked atomically when an issued code is redeemed',async()=>{
 const db=database();await link(db);
 const issued=await call(db,'/api/contact-link',{channel:'whatsapp'});
 for(const sender of ['second','third'])db.sqlite.prepare("INSERT INTO guardian_channel_identities(channel,sender_id,owner_id,verified_at) VALUES ('whatsapp',?,?,?)").run(sender,alice.ownerId,Date.now());
 const result=await event(db,incoming({eventId:'late-link',senderId:'fourth',linkCode:issued.body.code}));
 assert.equal(result.status,409);assert.equal(db.sqlite.prepare('SELECT COUNT(*) AS n FROM guardian_channel_identities').get().n,3);
 db.sqlite.close();
});

test('removing one sender wins over an in-flight linking code without dropping other contacts',async()=>{
 const db=database(),channel='whatsapp',now=Date.now();await link(db,alice,'removed');await link(db,alice,'kept',channel,'keep-link');
 const issued=await call(db,'/api/contact-link',{channel},alice,'POST',{},{},{now});
 const racing={...db,prepare(sql){const statement=db.prepare(sql);if(!sql.startsWith('DELETE FROM guardian_contact_links WHERE code_hash='))return statement;return {bind(...values){return {async first(){const consumed=await statement.bind(...values).first();assert.equal((await call(db,'/api/contact-link',{channel,senderId:'removed'},alice,'DELETE',{},{},{now:now+1})).status,200);return consumed;}}}};}};
 const result=await event(racing,incoming({senderId:'removed',eventId:'stale-reconnect',linkCode:issued.body.code}),{options:{now:now+2}});
 assert.equal(result.status,409);assert.deepEqual((await call(db,'/api/contact-link',undefined,alice,'GET')).body.identities.map(i=>i.senderId),['kept']);db.sqlite.close();
});

test('messaging replies retain separate Google and VirusTotal evidence when their findings differ',async()=>{
 const address='https://example.com/login',id=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(address))).toString('hex');
 for(const googleFlag of [true,false]){
  const db=database();
  try{
   await link(db);
   const extraEnv={GUARDIAN_PROVIDER:'baseten',GUARDIAN_API_KEY:'model-fixture',GUARDIAN_MODEL:'test-model',GUARDIAN_LINK_REPUTATION:'virustotal-community',GUARDIAN_GOOGLE_WEB_RISK_API_KEY:'google-fixture',GUARDIAN_VIRUSTOTAL_COMMUNITY_KEY:'a'.repeat(64)};
   const result=await event(db,incoming({text:'Please inspect '+address}),{extraEnv,options:{fetcher:(url,init)=>{
    if(init.method==='GET'){
     if(new URL(url).hostname==='webrisk.googleapis.com')return Response.json(googleFlag?{threat:{threatTypes:['MALWARE'],expireTime:new Date(Date.now()+60000).toISOString()}}:{});
     assert.equal(url,'https://www.virustotal.com/api/v3/urls/'+id);
     return Response.json({data:{type:'url',id,attributes:{url:address,last_analysis_date:Math.floor(Date.now()/1000)-60,last_analysis_stats:{malicious:googleFlag?0:2,suspicious:0,harmless:40,undetected:2}}}});
    }
    return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({status:'consistent',headline:'The report had no warning.',explanation:'It appeared ordinary.',nextStep:'Review what you received.',questions:[],evidenceIds:[],reaction:'reassuring'})}}]});
   }}});
   assert.equal(result.status,200);assert.equal(result.body.status,'complete');
   const reply=result.body.reply.text;
   assert.match(reply,/Google Web Risk:/);assert.match(reply,/VirusTotal:/);
   assert.match(reply,/Google may miss dangerous sites/);assert.match(reply,googleFlag?/Google reported a match for malware/:/2 malicious/);
   assert.equal(db.sqlite.prepare('SELECT result_json FROM guardian_checks').get().result_json.includes('"status":"caution"'),true);
  }finally{db.sqlite.close();}
 }
});

test('unconfigured contacts cannot issue codes or process events',async()=>{const db=database();assert.equal((await call(db,'/api/contact-link',{channel:'email'},alice,'POST',{}, {CONTACT_GATEWAY_SECRET:''})).status,503);assert.equal(db.sqlite.prepare('SELECT count(*) n FROM guardian_contact_links').get().n,0);});
test('signature, freshness and verified transport are required',async()=>{const db=database();assert.equal((await event(db,incoming(),{key:'wrong'})).status,401);assert.equal((await event(db,incoming(),{time:Math.floor(Date.now()/1000)-301})).status,401);assert.equal((await event(db,incoming({senderVerified:false}))).status,400);assert.equal(db.sqlite.prepare('SELECT count(*) n FROM guardian_checks').get().n,0);});
test('unknown senders get a neutral linking response with no owner information',async()=>{const result=await event(database(),incoming({ownerId:'alice'}));assert.equal(result.status,200);assert.equal(result.body.status,'needs_link');assert.equal(result.body.accepted,false);assert(!JSON.stringify(result.body).includes('alice'));});
test('link codes require sign-in, correct origin, enabled channel and are one-time',async()=>{const db=database();assert.equal((await call(db,'/api/contact-link',{channel:'whatsapp'},{})).status,401);assert.equal((await call(db,'/api/contact-link',{channel:'whatsapp'},alice,'POST',{origin:'https://attacker.test'})).status,403);const {data}=await link(db);assert.equal((await event(db,data)).body.duplicate,true);assert.equal((await event(db,{...data,eventId:'new-attempt'})).status,400);});
test('verified sender maps to its own profile, not a quoted address or supplied owner',async()=>{const db=database();await link(db);const result=await event(db,incoming({ownerId:'bob',replyTo:'attacker@example.test'}));assert.equal(result.body.status,'awaiting_connection');assert.equal(result.body.reply.senderId,'platform-user-1');assert.equal(result.body.reply.channel,'whatsapp');const check=db.sqlite.prepare('SELECT owner_id,message FROM guardian_checks').get();assert.equal(check.owner_id,'alice');assert.match(check.message,/scammer/);assert(!JSON.stringify(result.body).includes('ownerId'));const profile=db.sqlite.prepare('SELECT email FROM guardian_profiles WHERE owner_id=?').get('alice');assert.equal(profile.email,'alice@example.test');});
test('duplicate webhook creates one check and does not reassess',async()=>{const db=database();await link(db);const first=await event(db,incoming()),second=await event(db,incoming());assert.equal(first.body.checkId,second.body.checkId);assert.equal(second.body.duplicate,true);assert.equal(db.sqlite.prepare('SELECT count(*) n FROM guardian_checks').get().n,1);});
test('a second profile cannot capture an already linked sender',async()=>{const db=database();await link(db);const code=await call(db,'/api/contact-link',{channel:'whatsapp'},bob);const result=await event(db,incoming({eventId:'bob-link',linkCode:code.body.code}));assert.equal(result.status,409);assert.equal(db.sqlite.prepare('SELECT owner_id FROM guardian_channel_identities').get().owner_id,'alice');});
test('disconnect stops routing while saved checks stay',async()=>{const db=database();await link(db);await event(db,incoming());const disconnected=await call(db,'/api/contact-link',{channel:'whatsapp'},alice,'DELETE');assert.equal(disconnected.body.savedInformationRetained,true);const next=await event(db,incoming({eventId:'incoming-2'}));assert.equal(next.body.status,'needs_link');assert.equal(db.sqlite.prepare('SELECT count(*) n FROM guardian_checks').get().n,1);});
test('disconnect works offline and only removes the signed-in owner’s selected channel', async () => {
 const db=database(), path='/api/contact-link', unavailable={CONTACT_GATEWAY_SECRET:'',CONTACT_CHANNELS:''};
 await link(db,alice,'shared-number','whatsapp','whatsapp-a');
 db.sqlite.prepare('INSERT INTO guardian_channel_identities(channel,sender_id,owner_id,verified_at) VALUES (?,?,?,?)').run('sms','shared-number',alice.ownerId,Date.now()-1000);
 await link(db,bob,'other-number','whatsapp','whatsapp-b');
 const manage=(method,identity=alice,headers={})=>call(db,path,method==='DELETE'?{channel:'whatsapp'}:undefined,identity,method,headers,unavailable);
 assert.equal((await manage('GET')).body.identities.length,2);
 assert.equal((await manage('GET',{})).status,401);
 assert.equal((await manage('DELETE',alice,{origin:'https://elsewhere.test'})).status,403);
 assert.equal((await manage('DELETE')).status,200);
 assert.deepEqual((await manage('GET')).body.identities.map(i=>i.channel),['sms']);
 assert.deepEqual((await manage('GET',bob)).body.identities.map(i=>i.senderId),['other-number']);
});

test('paused channels reject new codes and existing unredeemed codes, while verified owners can still disconnect', async () => {
 const db=database(), path='/api/contact-link', now=Date.now();
 await link(db,alice);
 for(const channel of ['sms','instagram']){
  assert.equal((await call(db,path,{channel})).body.code,'ONBOARDING_PAUSED');
  const code='WG-'+'A'.repeat(32);
  const hash=Buffer.from(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(code))).toString('hex');
  db.sqlite.prepare('INSERT INTO guardian_contact_links(id,owner_id,channel,code_hash,created_at,expires_at) VALUES (?,?,?,?,?,?)').run(crypto.randomUUID(),alice.ownerId,channel,hash,now-1000,now+60000);
  assert.equal((await event(db,incoming({channel,linkCode:code}))).body.code,'ONBOARDING_PAUSED');
  assert.deepEqual((await event(db,incoming({channel}))).body,{accepted:false,status:'onboarding_paused'});
  const sender='platform-user-1';
  db.sqlite.prepare('INSERT INTO guardian_channel_identities(channel,sender_id,owner_id,verified_at) VALUES (?,?,?,?)').run(channel,sender,alice.ownerId,now-1000);
  assert.equal((await event(db,incoming({channel}))).body.status,'awaiting_connection');
  assert.equal((await call(db,path,{channel},alice,'DELETE')).body.disconnected,true);
 }
});

test('disconnect wins over an in-flight verification even when a fresh code is requested', async () => {
 const db=database(), path='/api/contact-link', channel='whatsapp', now=Date.now();
 const issue=(time)=>call(db,path,{channel},alice,'POST',{},{},{now:time});
 const issued=await issue(now);
 let replacement;
 const racing={...db,prepare(sql){
  const statement=db.prepare(sql);
  if(!sql.startsWith('DELETE FROM guardian_contact_links WHERE code_hash='))return statement;
  return {bind(...values){return {async first(){
   const consumed=await statement.bind(...values).first();
   assert.equal((await call(db,path,{channel},alice,'DELETE',{},{},{now:now+1})).status,200);
   replacement=await issue(now+2);
   return consumed;
  }}}};
 }};
 const verify=(source,code,id)=>event(source,incoming({eventId:id,linkCode:code}),{options:{now:now+3}});
 const stale=await verify(racing,issued.body.code,'stale-link');
 assert.equal(stale.status,409);
 assert.equal((await call(db,path,undefined,alice,'GET')).body.identities.length,0);
 assert.equal((await verify(db,replacement.body.code,'fresh-link')).body.status,'linked');
});
test('privacy export excludes code hashes and deletion includes contact identity metadata',async()=>{const db=database();await link(db);await event(db,incoming());const request=(method,body)=>new Request(origin+'/api/privacy',{method,headers:{origin,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});const exported=await (await handleProductRequest(request('GET'),env(db),alice)).json();assert(!JSON.stringify(exported).includes('code_hash'));assert.equal((await handleProductRequest(request('DELETE',{confirm:'delete-guardian-data'}),env(db),alice)).status,200);assert.equal(db.sqlite.prepare('SELECT count(*) n FROM guardian_channel_identities').get().n,0);assert.equal(db.sqlite.prepare('SELECT count(*) n FROM guardian_ingress_events').get().n,0);});

test('canonical contact uses current private entitlement, ignores event grants, and rechecks suspension',async()=>{
 const db=database(),identity={ownerId:'people:canonical-one',peopleOrganisedId:'canonical-one',email:'owner@example.test',guardianAccess:{unlimited:true}};
 await link(db,identity);
 const extraEnv={GUARDIAN_IDENTITY_SECRET:'i'.repeat(64),PEOPLE_ORGANISED_AUTH_ORIGIN:'https://admin.peopleorganised.com',GUARDIAN_PROVIDER:'baseten',GUARDIAN_API_KEY:'test-only',GUARDIAN_MODEL:'test-model'};
 const caution={status:'caution',headline:'Verify the changed request.',explanation:'The new payment details are not supported by earlier evidence.',nextStep:'Confirm the change through your previously saved contact.',questions:[],evidenceIds:[],reaction:'caution'};
 const day=Math.floor(Date.now()/86400000);db.sqlite.prepare('INSERT INTO guardian_rate_limits(bucket_key,owner_id,count,expires_at) VALUES (?,?,40,?)').run(identity.ownerId+':day:'+day,identity.ownerId,(day+2)*86400000);
 let current=true,active=true,accessCalls=0;
 const options={identityFetcher:async(url,init)=>{accessCalls++;assert.equal(JSON.parse(init.body).id,'canonical-one');return Response.json(active?{id:'canonical-one',guardianAccess:{unlimited:current}}:{error:'unavailable'},{status:active?200:404});},fetcher:async()=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(caution)}}]})};
 for(let i=0;i<2;i++)assert.equal((await event(db,incoming({eventId:'canonical-'+i,guardianAccess:{unlimited:false}}),{extraEnv,options})).body.status,'complete');
 assert.equal(db.sqlite.prepare('SELECT COUNT(*) n FROM guardian_trial_usage WHERE consumed_at IS NOT NULL').get().n,0);
 assert.equal(db.sqlite.prepare('SELECT count FROM guardian_rate_limits WHERE bucket_key=?').get(identity.ownerId+':day:'+day).count,42);
 current=false;db.sqlite.prepare('UPDATE guardian_rate_limits SET count=0 WHERE bucket_key=?').run(identity.ownerId+':day:'+day);
 assert.equal((await event(db,incoming({eventId:'canonical-free',guardianAccess:{unlimited:true}}),{extraEnv,options})).body.status,'complete');
 assert.equal(db.sqlite.prepare('SELECT COUNT(*) n FROM guardian_trial_usage WHERE consumed_at IS NOT NULL').get().n,1);
 active=false;
 const result=await event(db,incoming({eventId:'canonical-suspended',guardianAccess:{unlimited:true}}),{extraEnv,options});
 assert.equal(result.status,403);assert.equal(result.body.code,'ACCOUNT_UNAVAILABLE');assert.equal(accessCalls,4);assert.equal(db.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,3);
 db.sqlite.close();
});

test('a transient first assessment failure resumes the same saved check and charges once',async()=>{
 const db=database();await link(db);
 const extraEnv={GUARDIAN_PROVIDER:'baseten',GUARDIAN_API_KEY:'test-key',GUARDIAN_MODEL:'test-model'};
 const assessment={status:'caution',headline:'Verify the requested payment.',explanation:'The message does not prove the new details.',nextStep:'Call the supplier on a previously saved number.',questions:[],evidenceIds:[],reaction:'caution'};
 let attempts=0;const options={fetcher:async()=>{attempts++;if(attempts===1)return new Response('',{status:500});return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(assessment)}}]});}};
 const first=await event(db,incoming(),{extraEnv,options});assert.equal(first.status,502);
 const second=await event(db,incoming(),{extraEnv,options});assert.equal(second.status,200);assert.equal(second.body.status,'complete');assert.equal(second.body.duplicate,true);
 assert.equal(db.sqlite.prepare('SELECT count(*) n FROM guardian_checks').get().n,1);
 assert.equal(db.sqlite.prepare('SELECT count(*) n FROM guardian_trial_usage WHERE consumed_at IS NOT NULL').get().n,1);
 assert.equal((await event(db,incoming(),{extraEnv,options})).body.checkId,second.body.checkId);assert.equal(attempts,2);
});

test('an interrupted follow-up resumes analysis without losing or appending the delivered message twice',async()=>{
 const db=database();await link(db);
 const extraEnv={GUARDIAN_PROVIDER:'baseten',GUARDIAN_API_KEY:'test-key',GUARDIAN_MODEL:'test-model'};
 const assessment={status:'caution',headline:'Verify the requested payment.',explanation:'The message does not prove the new details.',nextStep:'Call the supplier on a previously saved number.',questions:['Did the account change?'],evidenceIds:[],reaction:'caution'};
 let attempts=0;const options={fetcher:async(_,init)=>{if(JSON.parse(init.body).messages[0].content.includes('Classify whether'))return Response.json({choices:[{finish_reason:'stop',message:{content:'{"scope":"same"}'}}]});attempts++;if(attempts===2)return new Response('',{status:500});return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(assessment)}}]});}};
 const first=await event(db,incoming(),{extraEnv,options});assert.equal(first.body.status,'complete');
 const follow=incoming({eventId:'followup-retry',replyToEventId:'incoming-1',text:'The bank account changed.'});
 assert.equal((await event(db,follow,{extraEnv,options})).status,502);
 assert.equal((await event(db,follow,{extraEnv,options})).body.status,'complete');
 assert.equal((await event(db,follow,{extraEnv,options})).body.status,'complete');
 const replies=JSON.parse(db.sqlite.prepare('SELECT replies_json FROM guardian_checks').get().replies_json);
 assert.equal(replies.filter(reply=>reply.role==='user').length,1);assert.equal(replies.find(reply=>reply.role==='user').content,follow.text);
 assert.equal(attempts,3);assert.equal(db.sqlite.prepare('SELECT count(*) n FROM guardian_checks').get().n,1);
 assert.equal(db.sqlite.prepare('SELECT count(*) n FROM guardian_trial_usage WHERE consumed_at IS NOT NULL').get().n,1);
 const changed=await event(db,{...follow,text:'Different message under the same delivered event.'},{extraEnv,options});assert.equal(changed.status,409);assert.equal(changed.body.code,'REPLY_CONFLICT');
});

test('linked email ingress preserves long messages and follow-ups in jury mode',async()=>{
 const db=database(),identity={ownerId:'people:judge-long-mail',peopleOrganisedId:'judge-long-mail',email:'judge@example.test'};
 try{
  await link(db,identity,'judge@example.test','email');
  const text='Please check this email.\n'+'Offer detail. '.repeat(1600)+'\nFinal offer term.',follow='Further detail. '.repeat(1500)+'Final clarification.';
  const extraEnv={GUARDIAN_JURY_MODE:'true',GUARDIAN_IDENTITY_SECRET:'i'.repeat(64),PEOPLE_ORGANISED_AUTH_ORIGIN:'https://admin.peopleorganised.com',GUARDIAN_PROVIDER:'baseten',GUARDIAN_API_KEY:'test-only',GUARDIAN_MODEL:'test-model'};
  const inputs=[],options={identityFetcher:async()=>Response.json({id:identity.peopleOrganisedId,guardianAccess:{unlimited:false}}),fetcher:async(_,init)=>{
   const body=JSON.parse(init.body);inputs.push(JSON.parse(body.messages[1].content));
   return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({status:'unresolved',headline:'This resembles ordinary marketing.',explanation:'The original sender is unconfirmed.',nextStep:'Check current offers in the app.',questions:[],evidenceIds:[],reaction:'explaining'})}}]});
  }};
  const first=await event(db,incoming({channel:'email',senderId:'judge@example.test',text}),{extraEnv,options});
  assert.equal(first.body.status,'complete');assert.equal(inputs[0].message,text);
  const second=await event(db,incoming({channel:'email',senderId:'judge@example.test',eventId:'long-follow',replyToEventId:'incoming-1',text:follow}),{extraEnv,options});
  assert.equal(second.body.status,'complete');assert.equal(second.body.checkId,first.body.checkId);
  assert.ok(inputs[1].followUps.some(m=>m.content===follow));
  assert.equal(db.sqlite.prepare('SELECT COUNT(*) n FROM guardian_trial_usage WHERE consumed_at IS NOT NULL').get().n,0);
 }finally{db.sqlite.close();}
});

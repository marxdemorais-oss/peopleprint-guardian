import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {handleConnectionRequest,encryptConnectionValue,decryptConnectionValue,wolfgangContacts,connectionSettings,disconnectOwnedConnection,disconnectAllOwnedConnections,getConnectionAccessToken,searchConnectedMail} from '../worker/connections.js';

const origin='https://guardian.test',owner={ownerId:'owner-a',email:'a@example.test'},key=Buffer.alloc(32,7).toString('base64');
function database(){const sql=new DatabaseSync(':memory:');sql.exec(readFileSync(new URL('../drizzle/0000_guardian_product.sql',import.meta.url),'utf8'));const wrap=(statement,args=[])=>({bind(...values){return wrap(statement,values);},async first(){return sql.prepare(statement).get(...args)||null;},async all(){return {results:sql.prepare(statement).all(...args)};},async run(){const r=sql.prepare(statement).run(...args);return {meta:{changes:r.changes}};}});return {prepare:statement=>wrap(statement),async batch(statements){sql.exec('BEGIN');try{const result=[];for(const s of statements)result.push(await s.run());sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}},sql};}
function env(DB=database()){return {DB,CONNECTION_ENCRYPTION_KEY:key,GMAIL_CLIENT_ID:'example-client',GMAIL_CLIENT_SECRET:'example-secret',GMAIL_REDIRECT_URI:origin+'/api/connections/gmail/callback',GMAIL_CONNECT_ENABLED:'true',OUTLOOK_CLIENT_ID:'example-ms-client',OUTLOOK_CLIENT_SECRET:'example-ms-secret',OUTLOOK_REDIRECT_URI:origin+'/api/connections/outlook/callback',OUTLOOK_CONNECT_ENABLED:'true'};}
function request(path,options={}){return new Request(origin+path,options);}
async function start(e,identity=owner,provider='gmail'){const response=await handleConnectionRequest(request('/api/connections/'+provider+'/start'),e,identity);assert.equal(response.status,302);return new URL(response.headers.get('location'));}

test('connection secrets are authenticated encryption bound to owner and provider',async()=>{const e=env(),cipher=await encryptConnectionValue({refresh_token:'private-token'},e,owner.ownerId,'gmail');assert(!cipher.includes('private-token'));assert.deepEqual(await decryptConnectionValue(cipher,e,owner.ownerId,'gmail'),{refresh_token:'private-token'});await assert.rejects(decryptConnectionValue(cipher,e,'other-owner','gmail'));await assert.rejects(decryptConnectionValue(cipher,e,owner.ownerId,'outlook'));});
test('unconfigured or unapproved OAuth remains unavailable and exposes no secrets',async()=>{const e=env();e.GMAIL_CONNECT_ENABLED='false';e.OUTLOOK_CLIENT_SECRET='';const response=await handleConnectionRequest(request('/api/connections'),e,owner);const data=await response.json();assert(data.connections.every(c=>!c.available));assert(!JSON.stringify(data).includes('example-secret'));assert.equal((await handleConnectionRequest(request('/api/connections/gmail/start'),e,owner)).status,503);assert.equal((await handleConnectionRequest(request('/api/connections/peopleprint/start'),e,owner)).status,503);assert.equal(connectionSettings({...e,GMAIL_CONNECT_ENABLED:'true',GMAIL_REDIRECT_URI:'https://attacker.test/api/connections/gmail/callback'},'gmail',origin).configured,false);});
test('connection endpoints require hosting identity and do not consume state for another owner',async()=>{const e=env();assert.equal((await handleConnectionRequest(request('/api/connections'),e,{})).status,401);const target=await start(e);assert.equal(target.searchParams.get('code_challenge_method'),'S256');assert.equal(target.searchParams.get('scope'),'https://www.googleapis.com/auth/gmail.readonly');assert(target.searchParams.get('code_challenge').length>40);const callback='/api/connections/gmail/callback?state='+target.searchParams.get('state')+'&code=code';const forbidden=await handleConnectionRequest(request(callback),e,{ownerId:'owner-b'});assert(forbidden.headers.get('location').includes('connection=expired'));assert.equal(e.DB.sql.prepare('SELECT COUNT(*) AS count FROM guardian_oauth_states').get().count,1);});
test('successful OAuth stores encrypted tokens and callback is single-use',async()=>{const e=env(),target=await start(e);let calls=0;const fetcher=async(url,options)=>{calls++;if(url==='https://oauth2.googleapis.com/token'){const body=options.body;assert.equal(body.get('grant_type'),'authorization_code');assert.equal(body.get('code_verifier').length,43);assert.equal(body.get('redirect_uri'),origin+'/api/connections/gmail/callback');return Response.json({access_token:'private-access',refresh_token:'private-refresh',expires_in:3600,scope:'https://www.googleapis.com/auth/gmail.readonly'});}assert.equal(url,'https://gmail.googleapis.com/gmail/v1/users/me/profile');assert.equal(options.headers.Authorization,'Bearer private-access');return Response.json({emailAddress:'linked@example.test'});};const path='/api/connections/gmail/callback?state='+target.searchParams.get('state')+'&code=valid-code';const response=await handleConnectionRequest(request(path),e,owner,{fetcher});assert(response.headers.get('location').includes('connection=connected'));assert.equal(calls,2);const token=e.DB.sql.prepare('SELECT encrypted_token FROM guardian_connection_tokens').get();assert(!token.encrypted_token.includes('private'));assert.equal(e.DB.sql.prepare('SELECT display_label FROM guardian_connections').get().display_label,'linked@example.test');const replay=await handleConnectionRequest(request(path),e,owner,{fetcher});assert(replay.headers.get('location').includes('connection=expired'));assert.equal(calls,2);const listed=await(await handleConnectionRequest(request('/api/connections'),e,owner)).json();assert.equal(listed.connections[0].status,'connected');assert.equal(listed.connections[0].syncReady,false);assert(!JSON.stringify(listed).includes('private-refresh'));});
test('expired and denied grants never call providers or create a connection',async()=>{const e=env(),target=await start(e);const state=target.searchParams.get('state');const fetcher=()=>{throw new Error('must not call');};let result=await handleConnectionRequest(request('/api/connections/gmail/callback?state='+state+'&error=access_denied'),e,owner,{fetcher});assert(result.headers.get('location').includes('connection=cancelled'));assert.equal(e.DB.sql.prepare('SELECT COUNT(*) AS count FROM guardian_connections').get().count,0);const t=await start(e);result=await handleConnectionRequest(request('/api/connections/gmail/callback?state='+t.searchParams.get('state')+'&code=code'),e,owner,{fetcher,now:Date.now()+700000});assert(result.headers.get('location').includes('connection=expired'));});
test('Outlook uses delegated read-only mailbox permissions and PKCE',async()=>{const e=env(),target=await start(e,owner,'outlook');assert.equal(target.host,'login.microsoftonline.com');assert(target.searchParams.get('scope').includes('Mail.Read'));assert(!target.searchParams.get('scope').includes('Write'));assert(target.searchParams.get('scope').includes('offline_access'));assert.equal(target.searchParams.get('code_challenge_method'),'S256');});
test('disconnect is same-origin, owner-scoped, preserves saved checks and cannot be blocked by revocation failure',async()=>{const e=env(),now=new Date().toISOString();for(const id of ['owner-a','owner-b']){e.DB.sql.prepare('INSERT INTO guardian_connections VALUES (?,?,?,?,?,?,?)').run(id,'gmail','connected',id,id,now,now);e.DB.sql.prepare('INSERT INTO guardian_connection_tokens VALUES (?,?,?,?)').run(id,'gmail',await encryptConnectionValue({refresh_token:'secret'},e,id,'gmail'),now);}e.DB.sql.prepare('INSERT INTO guardian_checks (id,owner_id,message,channel,evidence_json,preferences_json,status,created_at,updated_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run('check-a','owner-a','Important saved record','email','[]','{}','draft',now,now,now);assert.equal((await handleConnectionRequest(request('/api/connections/gmail',{method:'DELETE',headers:{origin:'https://attacker.test'}}),e,owner)).status,403);const r=await handleConnectionRequest(request('/api/connections/gmail',{method:'DELETE',headers:{origin}}),e,owner,{fetcher:async()=>{throw new Error('provider offline');}});assert.equal(r.status,200);assert.equal((await r.json()).savedInformationRetained,true);assert.equal(e.DB.sql.prepare('SELECT COUNT(*) AS n FROM guardian_connection_tokens WHERE owner_id=?').get('owner-a').n,0);assert.equal(e.DB.sql.prepare('SELECT COUNT(*) AS n FROM guardian_connection_tokens WHERE owner_id=?').get('owner-b').n,1);assert.equal(e.DB.sql.prepare('SELECT message FROM guardian_checks').get().message,'Important saved record');await disconnectAllOwnedConnections(e,'owner-b',{fetcher:async()=>new Response('',{status:200})});assert.equal(e.DB.sql.prepare('SELECT COUNT(*) AS n FROM guardian_connection_tokens').get().n,0);});
test('shared contacts need explicit activation and validated addresses',async()=>{const contacts=wolfgangContacts({DB:{},CONTACT_EXTERNAL_GATEWAY_ENABLED:'true',CONTACT_GATEWAY_SECRET:'x'.repeat(32),CONTACT_CHANNELS:'email,whatsapp,x',WOLFGANG_EMAIL:'hello@example.test',WOLFGANG_EMAIL_ENABLED:'true',WOLFGANG_WHATSAPP_NUMBER:'+441234567890',WOLFGANG_WHATSAPP_ENABLED:'true',WOLFGANG_X_URL:'https://attacker.test/x',WOLFGANG_X_ENABLED:'true'});assert.equal(contacts[0].available,true);assert.equal(contacts[1].url,'https://wa.me/441234567890');assert.equal(contacts.find(c=>c.channel==='x').available,false);assert(wolfgangContacts({WOLFGANG_EMAIL:'hello@example.test'}).every(c=>!c.available));assert(wolfgangContacts({WOLFGANG_EMAIL:'hello@example.test\nBCC:evil',WOLFGANG_EMAIL_ENABLED:'true'}).every(c=>!c.available));const response=await handleConnectionRequest(request('/api/wolfgang/contact-card'),env(),owner);assert.equal(response.status,200);assert.match(await response.text(),/URL:https:\/\/guardian\.peopleorganised\.com\//);});
test('server-only token refresh stays owner-scoped and saves rotated credentials encrypted',async()=>{const e=env(),now=Date.now(),iso=new Date(now).toISOString();e.DB.sql.prepare('INSERT INTO guardian_connections VALUES (?,?,?,?,?,?,?)').run('owner-a','outlook','connected','external','linked@example.test',iso,iso);e.DB.sql.prepare('INSERT INTO guardian_connection_tokens VALUES (?,?,?,?)').run('owner-a','outlook',await encryptConnectionValue({access_token:'old-access',refresh_token:'old-refresh',expires_at:now-1000},e,'owner-a','outlook'),iso);await assert.rejects(getConnectionAccessToken(e,'owner-b','outlook'),/Reconnect/);const access=await getConnectionAccessToken(e,'owner-a','outlook',{now,fetcher:async(url,options)=>{assert.equal(url,'https://login.microsoftonline.com/common/oauth2/v2.0/token');assert.equal(options.body.get('refresh_token'),'old-refresh');return Response.json({access_token:'new-access',refresh_token:'new-refresh',expires_in:3600});}});assert.equal(access,'new-access');const raw=e.DB.sql.prepare('SELECT encrypted_token FROM guardian_connection_tokens').get().encrypted_token;assert(!raw.includes('new-refresh'));assert.equal((await decryptConnectionValue(raw,e,'owner-a','outlook')).refresh_token,'new-refresh');assert.equal(await getConnectionAccessToken(e,'owner-a','outlook',{now,fetcher:()=>{throw new Error('No refresh needed');}}),'new-access');});
async function searchable(provider){const e=env(),now=Date.now(),iso=new Date(now).toISOString();e.DB.sql.prepare('INSERT INTO guardian_connections VALUES (?,?,?,?,?,?,?)').run('owner-a',provider,'connected','external','linked@example.test',iso,iso);e.DB.sql.prepare('INSERT INTO guardian_connection_tokens VALUES (?,?,?,?)').run('owner-a',provider,await encryptConnectionValue({access_token:'mail-access',refresh_token:'refresh',expires_at:now+3600000},e,'owner-a',provider),iso);return e;}
test('paused Outlook is absent even for connected customers and cannot read or refresh mail',async()=>{
 const e=await searchable('outlook');e.OUTLOOK_HIDDEN='true';
 let calls=0;const fetcher=async()=>{calls++;throw Error('Paused provider must not be called');};
 const list=await(await handleConnectionRequest(request('/api/connections'),e,owner)).json();
 assert(!list.connections.some(c=>c.provider==='outlook'));
 assert(list.connections.some(c=>c.provider==='gmail'&&c.available));
 for(const path of ['/api/connections/outlook/start','/api/connections/outlook/search?q=invoice'])assert.equal((await handleConnectionRequest(request(path),e,owner,{fetcher})).status,503);
 const callback=await handleConnectionRequest(request('/api/connections/outlook/callback?state=unused&code=unused'),e,owner,{fetcher});
 assert.match(callback.headers.get('location'),/connection=unavailable/);
 for(const now of [Date.now(),Date.now()+7200000])await assert.rejects(getConnectionAccessToken(e,owner.ownerId,'outlook',{now,fetcher}),/Reconnect/);
 assert.equal(calls,0);
 assert.equal(e.DB.sql.prepare('SELECT COUNT(*) AS n FROM guardian_connections').get().n,1);
});
test('Gmail start is available to each authenticated customer without a tester allowlist',async()=>{
 const e=env();e.OUTLOOK_HIDDEN='true';
 for(const identity of [owner,{ownerId:'people:new-customer',peopleOrganisedId:'new-customer'}, {ownerId:'another-registered-customer'}]){
  const target=await start(e,identity,'gmail');assert.equal(target.host,'accounts.google.com');
 }
 assert.equal((await handleConnectionRequest(request('/api/connections/gmail/start'),e,{})).status,401);
});
test('Gmail lookup is owner-bound, five-message limited and reads plain MIME without following links',async()=>{const e=await searchable('gmail'),calls=[],body='Invoice reference α. Call our previously saved number.';const fetcher=async(url,options)=>{calls.push(url);const u=new URL(url);assert.equal(u.hostname,'gmail.googleapis.com');assert.equal(options.headers.Authorization,'Bearer mail-access');if(u.pathname.endsWith('/messages')){assert.equal(u.searchParams.get('maxResults'),'5');assert.equal(u.searchParams.get('q'),'supplier');return Response.json({messages:Array.from({length:8},(_,i)=>({id:'message'+i})),nextPageToken:'must-not-use'});}return Response.json({internalDate:'1700000000000',payload:{mimeType:'multipart/alternative',headers:[{name:'Subject',value:'Earlier agreement'},{name:'From',value:'Supplier <supplier@example.test>'}],parts:[{mimeType:'text/html',body:{data:Buffer.from('<script>steal()</script><img src="https://attacker.test">').toString('base64url')}},{mimeType:'multipart/mixed',parts:[{mimeType:'text/plain',body:{data:Buffer.from(body).toString('base64url')}}]}]}});};await assert.rejects(searchConnectedMail(e,'owner-b','gmail','supplier',{fetcher}),/Reconnect/);assert.equal(calls.length,0);const result=await searchConnectedMail(e,'owner-a','gmail','supplier',{fetcher});assert.equal(result.records.length,5);assert.equal(calls.length,6);assert(result.records[0].text.includes(body));assert(!result.records[0].text.includes('steal'));assert.equal(result.records[0].provenance,'connected_account');assert.match(result.records[0].id,/^ev-mail-[a-f0-9]{24}$/);assert.equal(result.records[0].excerpt,false);const repeat=await searchConnectedMail(e,'owner-a','gmail','supplier',{fetcher});assert.equal(result.records[0].id,repeat.records[0].id);const config=await(await handleConnectionRequest(request('/api/connections'),e,owner)).json();assert.equal(config.connections[0].searchReady,true);assert.equal(config.connections[0].syncReady,false);});
test('Outlook lookup returns labelled previews and constrains query, fields and result count',async()=>{const e=await searchable('outlook');const result=await searchConnectedMail(e,'owner-a','outlook','invoice "ref"',{fetcher:async(url)=>{const u=new URL(url);assert.equal(u.hostname,'graph.microsoft.com');assert.equal(u.pathname,'/v1.0/me/messages');assert.equal(u.searchParams.get('$top'),'5');assert.equal(u.searchParams.get('$select'),'id,subject,from,replyTo,receivedDateTime,bodyPreview');return Response.json({value:Array.from({length:7},(_,i)=>({id:'outlook-'+i,subject:'Invoice',from:{emailAddress:{address:'accounts@example.test'}},receivedDateTime:'2026-10-01T12:00:00Z',bodyPreview:'Preview '+i})), '@odata.nextLink':'https://attacker.test'});}});assert.equal(result.records.length,5);assert(result.records.every(r=>r.excerpt&&r.text.startsWith('Message preview only')));await assert.rejects(searchConnectedMail(e,'owner-a','outlook','x'.repeat(201)),/200 characters/);await assert.rejects(searchConnectedMail(e,'owner-a','outlook',''),/200 characters/);});
test('mail lookup falls back to snippets for HTML-only mail and rejects oversized provider bodies',async()=>{const e=await searchable('gmail');const fetcher=async(url)=>url.includes('?q=')?Response.json({messages:[{id:'one'}]}):Response.json({snippet:'Short text preview',payload:{mimeType:'text/html',body:{data:Buffer.from('<b>HTML not parsed</b>').toString('base64url')}}});const result=await searchConnectedMail(e,'owner-a','gmail','supplier',{fetcher});assert.equal(result.records[0].excerpt,true);assert(result.records[0].text.includes('Short text preview'));await assert.rejects(searchConnectedMail(e,'owner-a','gmail','supplier',{fetcher:async()=>new Response('x'.repeat(300000))}),/too large/);const denied=await handleConnectionRequest(request('/api/connections/gmail/search?q=supplier',{headers:{'sec-fetch-site':'cross-site'}}),e,owner,{fetcher});assert.equal(denied.status,403);});

test('OAuth token exchange refuses redirects without forwarding its code or client secret',async()=>{
 const e=env(),target=await start(e);let calls=0;
 const path='/api/connections/gmail/callback?state='+target.searchParams.get('state')+'&code=valid-code';
 const response=await handleConnectionRequest(request(path),e,owner,{fetcher:async(url,init)=>{calls++;assert.equal(url,'https://oauth2.googleapis.com/token');assert.equal(init.redirect,'manual');return new Response(null,{status:307,headers:{location:'https://untrusted.example/collect'}});}});
 assert(response.headers.get('location').includes('connection=failed'));assert.equal(calls,1);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM guardian_connection_tokens').get().n,0);
});

test('OAuth accepts only the exact approved scopes and never identifies an account for a broader grant',async()=>{
 for(const [provider,scope] of [['gmail','https://www.googleapis.com/auth/gmail.readonly.extra'],['gmail','https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/gmail.modify'],['gmail','https://www.googleapis.com/auth/GMAIL.READONLY'],['outlook','User.Read Mail.ReadWrite offline_access'],['outlook','User.Read Mail.Read.Shared offline_access'],['outlook','User.Read Mail.Read Files.Read']]){
  const e=env(),target=await start(e,owner,provider);let calls=0;
  const response=await handleConnectionRequest(request('/api/connections/'+provider+'/callback?state='+target.searchParams.get('state')+'&code=code'),e,owner,{fetcher:async()=>{calls++;return Response.json({access_token:'access',refresh_token:'refresh',scope});}});
  assert(response.headers.get('location').includes('connection=failed'),scope);assert.equal(calls,1);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM guardian_connections').get().n,0);
 }
 for(const scope of [undefined,'https://graph.microsoft.com/User.Read https://graph.microsoft.com/Mail.Read offline_access','User.Read Mail.Read']){
  const e=env(),target=await start(e,owner,'outlook');let calls=0;
  const response=await handleConnectionRequest(request('/api/connections/outlook/callback?state='+target.searchParams.get('state')+'&code=code'),e,owner,{fetcher:async()=>++calls===1?Response.json({access_token:'access',refresh_token:'refresh',scope}):Response.json({id:'external',mail:'linked@example.test'})});
  assert(response.headers.get('location').includes('connection=connected'));
 }
});

test('Stop cancels OAuth during token exchange or profile lookup and cannot be undone by the old callback',async()=>{
 for(const stopAt of ['token','profile']){
  const e=env(),target=await start(e),path='/api/connections/gmail/callback?state='+target.searchParams.get('state')+'&code=code';let profileCalls=0;
  const response=await handleConnectionRequest(request(path),e,owner,{fetcher:async url=>{
   if(url==='https://oauth2.googleapis.com/token'){if(stopAt==='token')await disconnectOwnedConnection(e,owner.ownerId,'gmail');return Response.json({access_token:'access',refresh_token:'refresh'});}
   profileCalls++;if(stopAt==='profile')await disconnectOwnedConnection(e,owner.ownerId,'gmail');return Response.json({emailAddress:'linked@example.test'});
  }});
  assert(response.headers.get('location').includes('connection=cancelled'));assert.equal(profileCalls,stopAt==='token'?0:1);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM guardian_connections').get().n,0);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM guardian_connection_tokens').get().n,0);
 }
});

test('a newer OAuth attempt supersedes an in-flight callback and duplicate callbacks cannot exchange twice',async()=>{
 const e=env(),target=await start(e),path='/api/connections/gmail/callback?state='+target.searchParams.get('state')+'&code=code';let next;
 const response=await handleConnectionRequest(request(path),e,owner,{fetcher:async url=>{
  if(url==='https://oauth2.googleapis.com/token'){
   const duplicate=await handleConnectionRequest(request(path),e,owner,{fetcher:()=>{throw new Error('Duplicate token exchange');}});assert(duplicate.headers.get('location').includes('connection=expired'));
   return Response.json({access_token:'access',refresh_token:'refresh'});
  }
  next=await start(e);return Response.json({emailAddress:'linked@example.test'});
 }});
 assert(response.headers.get('location').includes('connection=cancelled'));assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM guardian_connection_tokens').get().n,0);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM guardian_oauth_states').get().n,1);assert.notEqual(next.searchParams.get('state'),target.searchParams.get('state'));
});

test('Stop removes local access before revocation and all-account Stop also cancels pending-only authorisations',async()=>{
 const e=await searchable('gmail');await start(e,owner,'outlook');let revoked=false;
 await disconnectAllOwnedConnections(e,owner.ownerId,{fetcher:async url=>{assert.equal(url,'https://oauth2.googleapis.com/revoke');assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM guardian_connection_tokens').get().n,0);revoked=true;return new Response(null,{status:200});}});
 assert(revoked);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM guardian_oauth_states').get().n,0);
});

test('a refresh racing with Stop never returns or persists a fresh token',async()=>{
 const e=await searchable('outlook'),now=Date.now()+7200000;
 await assert.rejects(getConnectionAccessToken(e,owner.ownerId,'outlook',{now,fetcher:async()=>{await disconnectOwnedConnection(e,owner.ownerId,'outlook');return Response.json({access_token:'must-not-escape',refresh_token:'rotated'});}}),/reconnect/i);
 assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM guardian_connection_tokens').get().n,0);assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM guardian_connections').get().n,0);
});

test('an old failing refresh cannot invalidate a newer connection and broader refresh scopes are rejected',async()=>{
 const e=await searchable('outlook'),now=Date.now()+7200000;
 await assert.rejects(getConnectionAccessToken(e,owner.ownerId,'outlook',{now,fetcher:async()=>{
  const replacement=await encryptConnectionValue({access_token:'replacement-access',refresh_token:'replacement-refresh',expires_at:now+3600000},e,owner.ownerId,'outlook');
  e.DB.sql.prepare('UPDATE guardian_connection_tokens SET encrypted_token=?').run(replacement);throw new Error('Old grant expired');
 }}),/reconnect/i);
 assert.equal(e.DB.sql.prepare('SELECT status FROM guardian_connections').get().status,'connected');assert.equal(await getConnectionAccessToken(e,owner.ownerId,'outlook',{now}),'replacement-access');
 await assert.rejects(getConnectionAccessToken(e,owner.ownerId,'outlook',{now:now+7200000,fetcher:async()=>Response.json({access_token:'broad-access',scope:'User.Read Mail.ReadWrite'})}),/reconnect/i);
 assert.equal(e.DB.sql.prepare('SELECT status FROM guardian_connections').get().status,'reconnect_required');assert.equal((await decryptConnectionValue(e.DB.sql.prepare('SELECT encrypted_token FROM guardian_connection_tokens').get().encrypted_token,e,owner.ownerId,'outlook')).access_token,'replacement-access');
});

test('truncated plain text and unparsed attachments are honestly labelled as excerpts',async()=>{
 const e=await searchable('gmail');
 for(const payload of [{mimeType:'text/plain',body:{data:Buffer.from('x'.repeat(22000)).toString('base64url')}},{mimeType:'multipart/mixed',parts:[{mimeType:'text/plain',body:{data:Buffer.from('Short body').toString('base64url')}},{mimeType:'application/pdf',filename:'agreement.pdf',body:{attachmentId:'never-fetch'}}]}]){
  const result=await searchConnectedMail(e,owner.ownerId,'gmail','supplier',{fetcher:async url=>url.includes('?q=')?Response.json({messages:[{id:'one'}]}):Response.json({payload})});
  assert.equal(result.records[0].excerpt,true);assert(result.records[0].text.startsWith('Message preview only'));assert(result.records[0].text.length<=20000);
 }
});

test('Stop during mailbox lookup prevents subsequent message reads and returning old results',async()=>{
 for(const provider of ['gmail','outlook']){
  const e=await searchable(provider);let calls=0;
  await assert.rejects(searchConnectedMail(e,owner.ownerId,provider,'supplier',{fetcher:async()=>{
   calls++;await disconnectOwnedConnection(e,owner.ownerId,provider,{fetcher:async()=>new Response(null,{status:200})});
   return Response.json(provider==='gmail'?{messages:[{id:'must-not-fetch'}]}:{value:[{id:'must-not-return',bodyPreview:'Private content'}]});
  }}),/Reconnect|connection changed/);
  assert.equal(calls,1);
 }
});

test('mail lookup and OAuth abandon stalled bodies, cancel the stream and save no partial connection',async()=>{
 const original=AbortSignal.timeout,keepAlive=setTimeout(()=>{},200);AbortSignal.timeout=ms=>original(ms===15000?5:ms);
 try{
  const e=await searchable('outlook');let cancelled=0;
  const stalled=()=>new Response(new ReadableStream({pull(){return new Promise(()=>{});},cancel(){cancelled++;}}));
  await assert.rejects(searchConnectedMail(e,owner.ownerId,'outlook','supplier',{fetcher:async()=>stalled()}),/could not complete/);assert.equal(cancelled,1);
  const fresh=env(),target=await start(fresh);
  const response=await handleConnectionRequest(request('/api/connections/gmail/callback?state='+target.searchParams.get('state')+'&code=valid'),fresh,owner,{fetcher:async()=>stalled()});
  assert.match(response.headers.get('location'),/connection=failed/);assert.equal(cancelled,2);assert.equal(fresh.DB.sql.prepare('SELECT count(*) n FROM guardian_connections').get().n,0);assert.equal(fresh.DB.sql.prepare('SELECT count(*) n FROM guardian_oauth_states').get().n,0);
 }finally{AbortSignal.timeout=original;clearTimeout(keepAlive);}
});

test('cached access is rechecked after decryption so a concurrent Stop cannot return it',async()=>{
 const e=await searchable('outlook'),prepare=e.DB.prepare;let stopped=false;
 e.DB.prepare=statement=>{
  const original=prepare(statement);if(!statement.startsWith('SELECT t.encrypted_token,c.status'))return original;
  return {bind(...values){const bound=original.bind(...values);return {...bound,async first(){const record=await bound.first();if(!stopped){stopped=true;await disconnectOwnedConnection(e,owner.ownerId,'outlook');}return record;}};}};
 };
 await assert.rejects(getConnectionAccessToken(e,owner.ownerId,'outlook'),/connection changed/);assert(stopped);
});

test('empty credentials or empty provider identity cannot be reported as a successful connection',async()=>{
 for(const [tokens,profile] of [[{access_token:'',refresh_token:'refresh'},{emailAddress:'linked@example.test'}],[{access_token:'access',refresh_token:' '},{emailAddress:'linked@example.test'}],[{access_token:'access',refresh_token:'refresh'},{emailAddress:''}]]){
  const e=env(),target=await start(e);const response=await handleConnectionRequest(request('/api/connections/gmail/callback?state='+target.searchParams.get('state')+'&code=code'),e,owner,{fetcher:async url=>Response.json(url==='https://oauth2.googleapis.com/token'?tokens:profile)});
  assert(response.headers.get('location').includes('connection=failed'));assert.equal(e.DB.sql.prepare('SELECT count(*) n FROM guardian_connections').get().n,0);
 }
});

test('canonical sign-in requeues a waiting email with a fresh delivery budget',async()=>{
 const e=env(),now=Date.now();for(const name of ['0001_guardian_trial_context.sql','0002_guardian_messaging.sql','0006_guardian_transport_tests.sql','0009_guardian_user_allowance.sql','0010_account_context_and_live_warnings.sql'])e.DB.sql.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
 Object.assign(e,{CONTACT_EXTERNAL_GATEWAY_ENABLED:'true',CONTACT_GATEWAY_SECRET:'x'.repeat(32),CONTACT_CHANNELS:'email',WOLFGANG_EMAIL:'wolfgang@example.test',WOLFGANG_EMAIL_ENABLED:'true'});
 e.DB.sql.prepare("INSERT INTO guardian_message_jobs (id,channel,event_id,sender_id,payload_json,state,after_send_state,reply_text,provider_message_id,delivery_generation,attempts,next_attempt_at,received_at,created_at,updated_at,expires_at) VALUES ('pending','email','event','customer@example.test','{}','waiting_link','waiting_link','Old link reply','old-delivery',2,5,?,?,?,?,?)").run(now+3600000,now,now,now,now+86400000);
 const response=await handleConnectionRequest(request('/api/connections'),e,{ownerId:'people:verified-customer',peopleOrganisedId:'verified-customer',email:'customer@example.test'},{now});assert.equal(response.status,200);
 const job=e.DB.sql.prepare('SELECT * FROM guardian_message_jobs').get();assert.equal(job.state,'queued');assert.equal(job.owner_id,'people:verified-customer');assert.equal(job.attempts,0);assert.equal(job.next_attempt_at,0);assert.equal(job.delivery_generation,3);assert.equal(job.reply_text,null);assert.equal(job.provider_message_id,null);
});

test('saving Wolfgang keeps known addresses even with all message processing disabled', async () => {
  const settings = {
    WOLFGANG_EMAIL: 'wolfgang+contact@example.test',
    WOLFGANG_WHATSAPP_NUMBER: '+441234567891',
    MESSENGER_PAGE_ID: '12345678901',
    WOLFGANG_X_HANDLE: 'WolfgangExample', WOLFGANG_X_URL: 'https://x.com/WolfgangExample'
  };
  const download = request('/api/wolfgang/contact-card');
  assert.equal((await handleConnectionRequest(download, settings, {})).status, 401);
  const response = await handleConnectionRequest(download, settings, owner);
  assert.equal(response.status, 200);
  assert.match(response.headers.get('Content-Disposition'), /attachment; filename="Wolfgang\.vcf"/);
  const card = await response.text();
  assert.match(card, /BEGIN:VCARD\r\nVERSION:3\.0\r\nFN:Wolfgang\r\n/);
  for (const text of ['EMAIL;TYPE=INTERNET:wolfgang+contact@example.test', 'TEL;TYPE=CELL:+441234567891', 'URL:https://wa.me/441234567891', 'URL:https://m.me/12345678901', 'URL:https://x.com/WolfgangExample', 'URL:https://guardian.peopleorganised.com/']) assert.ok(card.includes(text), text);
  assert.ok(!card.includes(owner.email) && !card.includes('Instagram') && !card.includes('SMS'));
  const contacts = wolfgangContacts(settings);
  assert.ok(contacts.every(contact => !contact.available && !contact.url && !contact.value));
  assert.equal(contacts.find(c => c.channel === 'email').directoryUrl, 'mailto:wolfgang%2Bcontact@example.test');
  assert.equal(contacts.find(c => c.channel === 'instagram').contactState, 'unavailable');
  assert.equal(contacts.find(c => c.channel === 'whatsapp').contactState, 'directory');
});

test('paused X is hidden from customer contacts and the downloadable address card', async () => {
  const settings={WOLFGANG_EMAIL:'wolfgang@example.test',WOLFGANG_X_HIDDEN:'true',WOLFGANG_X_URL:'https://x.com/WolfgangExample',WOLFGANG_X_HANDLE:'WolfgangExample'};
  const x=wolfgangContacts(settings).find(c=>c.channel==='x');
  assert.equal(x.hidden,true);assert.equal(x.available,false);assert.equal(x.directoryUrl,null);assert.equal(x.directoryLabel,null);
  const card=await(await handleConnectionRequest(request('/api/wolfgang/contact-card'),settings,owner)).text();
  assert.ok(!card.includes('x.com/')&&!card.includes('WolfgangExample'));
  assert.ok(card.includes('wolfgang@example.test'));
});

test('the photo vCard retains every public destination, including separate routes for shared phone and Page identities', async () => {
  const number = '+441234567891';
  const settings = { WOLFGANG_EMAIL: 'wolfgang@example.test', WOLFGANG_WHATSAPP_NUMBER: number, WOLFGANG_SMS_NUMBER: number, MESSENGER_PAGE_ID: '12345678901', WOLFGANG_INSTAGRAM_URL: 'https://www.instagram.com/guardian_example/', WOLFGANG_X_URL: 'https://x.com/guardianDemo' };
  const photo = readFileSync(new URL('../web/assets/wolfgang-contact.jpg',import.meta.url));
  const card = await (await handleConnectionRequest(request('/api/wolfgang/contact-card'), settings, owner, {contactPhoto:photo.toString('base64')})).text();
  assert.ok(card.split('\r\n').every(line => Buffer.byteLength(line) <= 75));
  assert.ok(Buffer.byteLength(card) < 32 * 1024);
  const embeddedPhoto = card.replaceAll('\r\n ', '').match(/^PHOTO;ENCODING=b;TYPE=JPEG:([^\r\n]+)/m)?.[1];
  assert.ok(embeddedPhoto && Buffer.from(embeddedPhoto, 'base64').equals(photo));
  assert.ok(card.includes('EMAIL;TYPE=INTERNET:' + settings.WOLFGANG_EMAIL));
  const phoneEntries = [...card.matchAll(/^(item\d+)\.TEL;TYPE=CELL:([^\r\n]+)\r\n\1\.X-ABLabel:([^\r\n]+)/gm)];
  assert.deepEqual(phoneEntries.map(([, , phone, label]) => [phone, label]), [[number, 'WhatsApp'], [number, 'SMS']]);
  assert.notEqual(phoneEntries[0][1], phoneEntries[1][1]);
  for (const [label, target] of [['SMS', 'sms:' + number], ['WhatsApp', 'https://wa.me/' + number.slice(1)], ['Instagram', settings.WOLFGANG_INSTAGRAM_URL], ['X',settings.WOLFGANG_X_URL], ['Facebook Page', 'https://www.facebook.com/' + settings.MESSENGER_PAGE_ID], ['Messenger', 'https://m.me/' + settings.MESSENGER_PAGE_ID]]) {
    const matching = card.split('\r\n').find(line => line.endsWith('.URL:' + target));
    assert.ok(matching && card.includes(matching.split('.')[0] + '.X-ABLabel:' + label + '\r\n'), label);
  }
  assert.ok(wolfgangContacts(settings).every(c => !c.available && !c.linkAvailable));
});

test('unusable or credential-bearing destinations stay out of both the directory and vCard', async () => {
  const config = {
    WOLFGANG_EMAIL: 'bad@example.test\nX-NEW:injected',
    WOLFGANG_WHATSAPP_NUMBER: '+12345\ninvalid',
    WOLFGANG_SMS_NUMBER: '+123',
    WOLFGANG_X_URL: 'https://x.com/someone_else', WOLFGANG_X_HANDLE: 'WolfgangExample',
    WOLFGANG_INSTAGRAM_URL: 'https://www.instagram.com/guardian?token=private',
    WOLFGANG_MESSENGER_URL: 'https://m.me:4242/guardian'
  };
  assert.ok(wolfgangContacts(config).every(contact => contact.directoryUrl === null && contact.contactState === 'unavailable'));
  const card = await (await handleConnectionRequest(request('/api/wolfgang/contact-card'), config, owner)).text();
  assert.ok(card.endsWith('END:VCARD\r\n'));
  assert.ok(!/TEL|EMAIL|someone_else|private|injected|m\.me/.test(card));
});
test('a selected multipart Gmail record keeps the original Reply-To and HTML button behind plain text',async()=>{
 const e=await searchable('gmail');const encoded=text=>Buffer.from(text).toString('base64url');
 const {records}=await searchConnectedMail(e,'owner-a','gmail','debt',{fetcher:async(url)=>url.includes('?q=')?Response.json({messages:[{id:'message1'}]}):Response.json({payload:{mimeType:'multipart/alternative',headers:[{name:'From',value:'Service <help@example.com>'},{name:'Reply-To',value:'someone@external.example'}],parts:[{mimeType:'text/plain',body:{data:encoded('Read the message.')}},{mimeType:'text/html',body:{data:encoded('<p>Alternate wording.</p><a href="https://unrelated.example/pay">https://example.com</a>')}}]}})});
 assert.match(records[0].text,/Reply-To: someone@external.example/);assert.match(records[0].text,/\[Link: https:\/\/unrelated.example\/pay\] https:\/\/example.com/);assert.doesNotMatch(records[0].text,/Alternate wording/);
});

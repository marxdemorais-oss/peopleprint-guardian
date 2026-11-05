import {handlePeopleAuthRequest} from '../worker/people-auth.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {handleMessagingWebhook,drainMessagingJobs,cleanupMessaging} from '../worker/messaging-service.js';
import {normaliseMeta,normaliseResend,verifyTwilioWebhook,confirmTwilioEvent,sendProviderReply} from '../worker/messaging-providers.js';
import {nativeMessagingReady} from '../worker/messaging-config.js';
import {handleContactRequest} from '../worker/contact-ingress.js';
import {handleProductRequest} from '../worker/product-service.js';
import {handleConnectionRequest,wolfgangContacts} from '../worker/connections.js';
import {converse} from '../worker/wolfgang-conversation.js';
const origin='https://guardian.test',alice={ownerId:'alice',email:'alice@example.test',name:'Alice'},now=Date.now();
function database(){const sqlite=new DatabaseSync(':memory:');const journal=JSON.parse(readFileSync(new URL('../drizzle/meta/_journal.json',import.meta.url)));for(const m of journal.entries)sqlite.exec(readFileSync(new URL('../drizzle/'+m.tag+'.sql',import.meta.url),'utf8'));const wrap=(sql,args=[])=>({bind(...v){return wrap(sql,v);},async first(){return sqlite.prepare(sql).get(...args)||null;},async all(){return {results:sqlite.prepare(sql).all(...args)};},async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...args).changes)}};},sql,args});return {sqlite,prepare:wrap,async batch(stmts){sqlite.exec('BEGIN');try{const results=stmts.map(s=>/RETURNING/.test(s.sql)?{results:sqlite.prepare(s.sql).all(...s.args)}:{meta:{changes:Number(sqlite.prepare(s.sql).run(...s.args).changes)}});sqlite.exec('COMMIT');return results;}catch(e){sqlite.exec('ROLLBACK');throw e;}}};}
function env(){return {DB:database(),CONTACT_GATEWAY_SECRET:'c'.repeat(40),CONTACT_CHANNELS:'whatsapp,messenger,instagram,sms,email',MESSAGING_PUBLIC_ORIGIN:origin+'/',MESSAGING_SUPPORT_EMAIL:'support@example.test',META_APP_SECRET:'meta-secret',META_VERIFY_TOKEN:'verify-token',META_GRAPH_VERSION:'v25.0',WHATSAPP_ACCESS_TOKEN:'wa-token',WHATSAPP_PHONE_NUMBER_ID:'123456789',WHATSAPP_BUSINESS_ACCOUNT_ID:'111111111',WOLFGANG_WHATSAPP_NUMBER:'+441234567890',WOLFGANG_WHATSAPP_ENABLED:'true',MESSENGER_PAGE_ACCESS_TOKEN:'page-token',MESSENGER_PAGE_ID:'222222222',WOLFGANG_MESSENGER_URL:'https://m.me/wolfgang',WOLFGANG_MESSENGER_ENABLED:'true',INSTAGRAM_ACCESS_TOKEN:'ig-token',INSTAGRAM_ACCOUNT_ID:'333333333',WOLFGANG_INSTAGRAM_URL:'https://instagram.com/wolfgang',WOLFGANG_INSTAGRAM_ENABLED:'true',TWILIO_ACCOUNT_SID:'AC'+'a'.repeat(32),TWILIO_AUTH_TOKEN:'twilio-token',WOLFGANG_SMS_NUMBER:'+441234567891',WOLFGANG_SMS_ENABLED:'true',RESEND_API_KEY:'resend-token',RESEND_WEBHOOK_SECRET:'whsec_'+Buffer.alloc(32,7).toString('base64'),WOLFGANG_EMAIL:'wolfgang@example.test',WOLFGANG_EMAIL_FROM:'Wolfgang <wolfgang@example.test>',WOLFGANG_EMAIL_RECEIVING_ADDRESS:'inbox@example.test',WOLFGANG_EMAIL_ENABLED:'true'};}
const nativePath=channel=>channel==='sms'?'/api/messaging/twilio/sms':channel==='email'?'/api/messaging/resend/email':'/api/messaging/meta/'+channel;
function wa(text='Please check this supplier request.',id='wamid.first==',sender='447000000001'){return {object:'whatsapp_business_account',entry:[{id:'111111111',changes:[{field:'messages',value:{metadata:{phone_number_id:'123456789'},messages:[{id,from:sender,timestamp:String(Math.floor(now/1000)),text:{body:text}}]}}]}]};}
function messenger(text='Please check this message.',id='m.first',timestamp=now){return {object:'page',entry:[{id:'222222222',messaging:[{sender:{id:'999999999'},recipient:{id:'222222222'},timestamp,message:{mid:id,text}}]}]};}
function metaRequest(e,body,channel='whatsapp',signature){const raw=JSON.stringify(body);return new Request(origin+nativePath(channel),{method:'POST',headers:{'Content-Type':'application/json','x-hub-signature-256':signature||'sha256='+createHmac('sha256',e.META_APP_SECRET).update(raw).digest('hex')},body:raw});}
function transport(sent){return async(url,init)=>{sent.push({url,body:JSON.parse(init.body),headers:init.headers});if(url.includes('resend'))return Response.json({id:'email-reply'});return Response.json(url.includes('123456789')?{messages:[{id:'outgoing-'+sent.length}]}:{message_id:'outgoing-'+sent.length});};}
async function profile(e){await handleProductRequest(new Request(origin+'/api/profile'),e,alice);}
async function bind(e,channel='whatsapp',sender='447000000001'){await profile(e);e.DB.sqlite.prepare('INSERT INTO guardian_channel_identities(channel,sender_id,owner_id,verified_at) VALUES (?,?,?,?)').run(channel,sender,alice.ownerId,now);}
test('contact availability cannot be enabled by a number or URL alone',()=>{const e=env();assert(nativeMessagingReady(e,'whatsapp'));e.WHATSAPP_ACCESS_TOKEN='';assert(!nativeMessagingReady(e,'whatsapp'));assert(!wolfgangContacts(e).find(c=>c.channel==='whatsapp').available);assert(!nativeMessagingReady(e,'x'));});

test('incoming-only destinations distinguish registered WhatsApp from Messenger testing without enabling linking or replies', () => {
 const e = env();
 Object.assign(e, { CONTACT_CHANNELS: '', WOLFGANG_WHATSAPP_ENABLED: 'false', WOLFGANG_MESSENGER_ENABLED: 'false', WHATSAPP_RECEIVING_ENABLED: 'true', MESSENGER_RECEIVING_ENABLED: 'true' });
 delete e.WOLFGANG_MESSENGER_URL;
 const rows = wolfgangContacts(e);
 const whatsapp = rows.find(row => row.channel === 'whatsapp');
 const messenger = rows.find(row => row.channel === 'messenger');
 assert.equal(whatsapp.contactState, 'receiving');
 assert.equal(messenger.contactState, 'testing');
 assert.equal(messenger.directoryUrl, 'https://m.me/' + e.MESSENGER_PAGE_ID);
 for (const row of [whatsapp, messenger]) { assert.ok(!row.linkAvailable && !row.available); assert.equal(row.url, null); }
 delete e.META_APP_SECRET;
 assert.equal(wolfgangContacts(e).find(row => row.channel === 'messenger').contactState, 'directory');
});
test('Meta handshake validates the token; invalid signatures never save events',async()=>{const e=env();const response=await handleMessagingWebhook(new Request(origin+nativePath('whatsapp')+'?hub.mode=subscribe&hub.verify_token=verify-token&hub.challenge=12345'),e);assert.equal(await response.text(),'12345');assert.equal((await handleMessagingWebhook(new Request(origin+nativePath('whatsapp')+'?hub.mode=subscribe&hub.verify_token=wrong&hub.challenge=12345'),e)).status,403);assert.equal((await handleMessagingWebhook(metaRequest(e,wa(),'whatsapp','sha256='+'0'.repeat(64)),e)).status,401);assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_message_jobs').get().n,0);});
test('signed WhatsApp message saves once, replies to the verified sender and ignores quoted addresses',async()=>{const e=env(),sent=[];await bind(e);const body=wa('Forwarded from scammer@evil.test: send a payment.');for(let i=0;i<2;i++)assert.equal((await handleMessagingWebhook(metaRequest(e,body),e,null,{fetcher:transport(sent)})).status,200);assert.equal(sent.length,1);assert.equal(sent[0].body.to,'447000000001');assert(!sent[0].url.includes('evil'));assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,1);assert.equal(e.DB.sqlite.prepare('SELECT owner_id FROM guardian_checks').get().owner_id,'alice');});

test('routine outbound messages never append the configured staff email',async()=>{
 for(const [channel,senderId] of [['whatsapp','447000000001'],['email','alice@example.test'],['messenger','999999999'],['instagram','999999999'],['sms','+447000000001']]){
  const e=env(),sent=[],text='That claim needs checking.';
  await sendProviderReply({channel,senderId,senderVerified:true,eventId:'test-event'},text,e,{idempotencyKey:'test-send',fetcher:async(url,init)=>{
   if(init.method!=='POST')return Response.json({});
   const body=channel==='sms'?new URLSearchParams(init.body).get('Body'):JSON.parse(init.body);
   sent.push(channel==='sms'?body:channel==='email'?body.text:channel==='whatsapp'?body.text.body:body.message.text);
   return Response.json(channel==='email'?{id:'mail-receipt'}:channel==='sms'?{sid:'sms-receipt'}:channel==='whatsapp'?{messages:[{id:'wa-receipt'}]}:{message_id:'meta-receipt'});
  }});
  assert.deepEqual(sent,[text],channel);
  e.DB.sqlite.close();
 }
});

test('WhatsApp assessment and general chat receive the same current published manual and personal style',async()=>{
 const e={...env(),GUARDIAN_PROVIDER:'baseten',GUARDIAN_MODEL:'fixture-model',GUARDIAN_API_KEY:'test-only',WOLFGANG_PROVIDER:'baseten',WOLFGANG_MODEL:'fixture-model',WOLFGANG_API_KEY:'test-only',WOLFGANG_API_FORMAT:'chat-completions',WOLFGANG_API_URL:'https://inference.baseten.co/v1/chat/completions'};
 await bind(e);
 e.DB.sqlite.prepare("UPDATE guardian_profiles SET conversation_style=? WHERE owner_id=?").run(JSON.stringify({length:'brief',humour:'plain'}),alice.ownerId);
 const first='Follow the conversation\nEDITORIAL_FIRST: Notice the telling detail and answer the actual question.';
 const second='Follow the conversation\nEDITORIAL_SECOND: Give the implication first and keep the answer short.';
 const publish=body=>e.DB.sqlite.prepare("INSERT INTO guardian_voice_editions(kind,body,base,actor,created) VALUES ('published',?,0,'test-admin',?)").run(body,new Date().toISOString());
 const prompts=[],sent=[];
 for(const [i,body] of [first,second].entries()){
  publish(body);
  const result=await handleMessagingWebhook(metaRequest(e,wa('I got a call from Michael Jackso can that be legit?','wamid.shared-'+i)),e,null,{fetcher:transport(sent),ingressOptions:{fetcher:async(_url,init)=>{
   const prompt=JSON.parse(init.body).messages[0].content;prompts.push(prompt);
   return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({status:'unresolved',headline:'If you mean the singer Michael Jackson, no.',explanation:'He died in 2009.',nextStep:'Do not give this caller personal details.',questions:['What did the caller want?'],evidenceIds:[],reaction:'caution'})}}]});
  }}});
  assert.equal(result.status,200);
  assert.ok(prompts[i].includes(body));assert.match(prompts[i],/Keep replies brief/);assert.match(prompts[i],/Leave out jokes/);
  assert.doesNotMatch(sent[i].body.text.body,/Need a person|support@example/);
 }
 assert.ok(!prompts[1].includes(first));
 let chatPrompt;
 await converse({message:'Hi'},e,{style:{length:'brief',humour:'plain'},publicOnly:true,signedIn:true,fetcher:async(_url,init)=>{
  chatPrompt=JSON.parse(init.body).messages[0].content;
  return Response.json({choices:[{finish_reason:'stop',message:{content:'{"reply":"Hello!","intent":"attending"}'}}]});
 }});
 assert.ok(chatPrompt.includes(second));assert.match(chatPrompt,/Keep replies brief/);assert.match(chatPrompt,/Leave out jokes/);
 e.DB.sqlite.close();
});
test('a first message survives signup and is picked up after the one-time linking code',async()=>{const e=env(),sent=[];await handleMessagingWebhook(metaRequest(e,wa('Keep this original message.')),e,null,{fetcher:transport(sent)});assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs').get().state,'waiting_link');assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,0);assert.match(sent[0].body.text.body,/24 hours/);await profile(e);const issued=await handleContactRequest(new Request(origin+'/api/contact-link',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({channel:'whatsapp'})}),e,alice);const {code}=await issued.json();await handleMessagingWebhook(metaRequest(e,wa(code,'wamid.link==')),e,null,{fetcher:transport(sent)});assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,1);assert.equal(e.DB.sqlite.prepare('SELECT message FROM guardian_checks').get().message,'Keep this original message.');assert.equal(sent.length,3);assert.equal(e.DB.sqlite.prepare("SELECT COUNT(*) n FROM guardian_message_jobs WHERE state='completed'").get().n,2);});
test('Messenger and Instagram enforce the configured business account and ignore echoes',()=>{const e=env();for(const channel of ['messenger','instagram']){const id=channel==='messenger'?e.MESSENGER_PAGE_ID:e.INSTAGRAM_ACCOUNT_ID;const m={sender:{id:'999999999'},recipient:{id},timestamp:now,message:{mid:'m.123',text:'Hello'}};const body={object:channel==='messenger'?'page':'instagram',entry:[{id,messaging:[m]}]};assert.equal(normaliseMeta(channel,body,e,now).length,1);m.message.is_echo=true;assert.equal(normaliseMeta(channel,body,e,now).length,0);delete m.message.is_echo;m.recipient.id='123000000';assert.equal(normaliseMeta(channel,body,e,now).length,0);}});
test('paused Instagram onboarding neither holds new messages nor sends an earlier queued invitation',async()=>{
 const e=env(), sent=[], id=e.INSTAGRAM_ACCOUNT_ID;
 const body={object:'instagram',entry:[{id,messaging:[{sender:{id:'999999999'},recipient:{id},timestamp:now,message:{mid:'m.ig',text:'Hi'}}]}]};
 e.DB.sqlite.prepare("INSERT INTO guardian_message_jobs(id,channel,event_id,sender_id,payload_json,state,reply_text,received_at,created_at,updated_at,expires_at) VALUES (?,'instagram',?,?,?, 'reply_pending',?,?,?,?,?)")
  .run('older','old-event','999999999','{}','Please sign up',now-1000,now-1000,now-1000,now+60000);
 const result=await handleMessagingWebhook(metaRequest(e,body,'instagram'),e,null,{fetcher:transport(sent)});
 assert.equal(result.status,200);assert.deepEqual(sent,[]);
 const jobs=e.DB.sqlite.prepare('SELECT state,payload_json,reply_text FROM guardian_message_jobs').all();
 assert.equal(jobs.length,1);assert.equal(jobs[0].state,'cancelled');assert.equal(jobs[0].reply_text,null);
 for(const channel of ['sms','instagram'])assert.equal(wolfgangContacts(e).find(contact=>contact.channel===channel).onboardingPaused,true);
});
test('Twilio signature binds every field to the exact configured callback URL',async()=>{const e=env(),path=nativePath('sms'),p=new URLSearchParams({AccountSid:e.TWILIO_ACCOUNT_SID,To:e.WOLFGANG_SMS_NUMBER,From:'+447000000001',MessageSid:'SM'+'b'.repeat(32),Body:'Check this'});const raw=p.toString(),canonical=origin+path+[...p.keys()].sort().map(k=>k+p.get(k)).join(''),signature=createHmac('sha1',e.TWILIO_AUTH_TOKEN).update(canonical).digest('base64');const req=new Request(origin+path,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','x-twilio-signature':signature},body:raw});assert(await verifyTwilioWebhook(req,raw,e));assert(!await verifyTwilioWebhook(req,raw.replace('Check','Fake'),e));assert(!await verifyTwilioWebhook(req,raw+'&Body=forged',e));});
test('Resend uses receiving-server authentication rather than forged Authentication-Results headers',async()=>{const e=env(),base={id:'11111111-1111-1111-1111-111111111111',to:['inbox@example.test'],from:'Alice <alice@example.test>',text:'Forwarded suspicious email',subject:'Check',headers:{'authentication-results':'dmarc=pass'}};for(const auth of [null,{dmarc:'fail'},{dmarc:'unknown'}])assert.equal((await normaliseResend({type:'email.received',data:{email_id:'11111111-1111-1111-1111-111111111111',to:['inbox@example.test']}},e,{fetcher:async()=>Response.json({...base,authentication:auth})})).length,0);const result=await normaliseResend({type:'email.received',data:{email_id:'11111111-1111-1111-1111-111111111111',to:['inbox@example.test']}},e,{fetcher:async(url)=>{assert.equal(new URL(url).host,'api.resend.com');return Response.json({...base,authentication:{dmarc:'pass'}});}});assert.equal(result[0].senderId,'alice@example.test');});
test('Resend SDK verifies the exact payload before retrieving or replying',async()=>{const e=env(),event={type:'email.received',data:{email_id:'11111111-1111-1111-1111-111111111111',to:['inbox@example.test']}},raw=JSON.stringify(event),timestamp=String(Math.floor(Date.now()/1000)),id='msg_resend_test',signature=createHmac('sha256',Buffer.alloc(32,7)).update(id+'.'+timestamp+'.'+raw).digest('base64');let calls=0;const fetcher=async()=>{calls++;return Response.json({to:['inbox@example.test'],from:'alice@example.test',text:'Please check this',authentication:{dmarc:'fail'}});};const request=value=>new Request(origin+nativePath('email'),{method:'POST',headers:{'Content-Type':'application/json','svix-id':id,'svix-timestamp':timestamp,'svix-signature':'v1,'+value},body:raw});assert.equal((await handleMessagingWebhook(request(signature),e,null,{fetcher})).status,200);assert.equal(calls,1);assert.equal((await handleMessagingWebhook(request('invalid'),e,null,{fetcher})).status,401);assert.equal(calls,1);});
test('an uncertain outbound delivery is quarantined and is never blindly sent twice',async()=>{const e=env();await bind(e);let calls=0;const request=()=>metaRequest(e,wa());const fetcher=async()=>{calls++;throw new Error('network interrupted');};await handleMessagingWebhook(request(),e,null,{fetcher});await handleMessagingWebhook(request(),e,null,{fetcher});assert.equal(calls,1);assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs').get().state,'uncertain');assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,1);});
test('pending contact payloads become inaccessible after 24 hours',async()=>{const e=env(),sent=[];await handleMessagingWebhook(metaRequest(e,wa('Private pending message')),e,null,{fetcher:transport(sent)});await cleanupMessaging(e,Date.now()+86400001);const row=e.DB.sqlite.prepare('SELECT state,payload_json,reply_text FROM guardian_message_jobs').get();assert.equal(row.state,'expired');assert.equal(row.payload_json,'{}');assert.equal(row.reply_text,null);});

test('canonical email sign-in respects a disconnect even after a new unverified code is issued',async()=>{
 const e=env(),owner={ownerId:'people:canonical-one',peopleOrganisedId:'canonical-one',email:'owner@example.test'};
 const refresh=()=>handleConnectionRequest(new Request(origin+'/api/connections'),e,owner);
 const manage=method=>handleContactRequest(new Request(origin+'/api/contact-link',{method,headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({channel:'email'})}),e,owner);
 const binding=()=>e.DB.sqlite.prepare("SELECT owner_id FROM guardian_channel_identities WHERE channel='email'").get();
 await refresh();assert.equal(binding().owner_id,owner.ownerId);
 assert.equal((await manage('DELETE')).status,200);
 await refresh();assert.equal(binding(),undefined);
 assert.equal((await manage('POST')).status,201);
 await refresh();assert.equal(binding(),undefined);
});
test('replying to Wolfgang follows the same case and does not charge a second trial credit',async()=>{const e={...env(),GUARDIAN_PROVIDER:'baseten',GUARDIAN_API_KEY:'test-key',GUARDIAN_MODEL:'test-model'},sent=[];await bind(e);const result={status:'caution',headline:'Verify the changed request.',explanation:'The message does not establish the new bank details.',nextStep:'Use your previously saved supplier number.',questions:['Were you expecting this request?'],evidenceIds:[],reaction:'caution'};let analyses=0;const options={fetcher:transport(sent),ingressOptions:{fetcher:async(_,init)=>{if(JSON.parse(init.body).messages[0].content.startsWith('Classify whether'))return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({scope:'same'})}}]});analyses++;return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(result)}}]});}}};await handleMessagingWebhook(metaRequest(e,wa()),e,null,options);const response=wa('I was expecting the supplier, but not new bank details.','wamid.followup==');response.entry[0].changes[0].value.messages[0].context={id:'outgoing-1'};await handleMessagingWebhook(metaRequest(e,response),e,null,options);assert.equal(analyses,2);assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,1);assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_trial_usage WHERE consumed_at IS NOT NULL').get().n,1);assert.match(e.DB.sqlite.prepare('SELECT replies_json FROM guardian_checks').get().replies_json,/not new bank details/);});
test('concurrent duplicate deliveries cannot create two checks or two replies',async()=>{const e=env(),sent=[];await bind(e);await Promise.all([handleMessagingWebhook(metaRequest(e,wa()),e,null,{fetcher:transport(sent)}),handleMessagingWebhook(metaRequest(e,wa()),e,null,{fetcher:transport(sent)})]);await drainMessagingJobs(e,{fetcher:transport(sent)});assert.equal(sent.length,1);assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,1);});
test('a definite provider throttle retries the saved reply without repeating the check',async()=>{const e=env(),sent=[];await bind(e);const response=await handleMessagingWebhook(metaRequest(e,wa()),e,null,{fetcher:async()=>new Response('',{status:429}),now});assert.equal(response.status,503);assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs').get().state,'reply_pending');await drainMessagingJobs(e,{fetcher:transport(sent),now:now+30001});assert.equal(sent.length,1);assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs').get().state,'completed');assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,1);});
test('an unrelated Resend recipient is ignored without retrieving its private email',async()=>{const e=env();let calls=0;const result=await normaliseResend({type:'email.received',data:{email_id:'11111111-1111-1111-1111-111111111111',to:['unrelated@example.test']}},e,{fetcher:async()=>{calls++;throw new Error('must not fetch');}});assert.equal(result.length,0);assert.equal(calls,0);});
test('Resend Inbox events resolve optional snapshots through the inbox API and require receiving-server authentication',async()=>{
 const e={...env(),RESEND_INBOX_ID:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'},data={inbox_id:'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',thread_id:'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',email_id:'11111111-1111-1111-1111-111111111111'};
 const record={id:data.email_id,direction:'inbound',to:['inbox@example.test'],from:'alice@example.test',text:'Check this message.',message_id:'<original@example.test>'};let calls=[];
 const fetcher=async url=>{calls.push(url);return Response.json(url.includes('/inboxes/')?record:{...record,authentication:{dmarc:'pass'}});};
 const event={type:'inbox.email.received',data};assert.equal((await normaliseResend(event,e,{fetcher}))[0].eventId,data.email_id);
 assert.equal(calls[0],'https://api.resend.com/inboxes/'+data.inbox_id+'/threads/'+data.thread_id+'/emails/'+data.email_id);
 assert.equal(calls[1],'https://api.resend.com/emails/receiving/'+data.email_id+'?html_format=cid');
 assert.equal((await normaliseResend({...event,data:{...data,inbox_id:'cccccccc-cccc-cccc-cccc-cccccccccccc'}},e,{fetcher})).length,0);assert.equal(calls.length,2);
 for(const auth of [undefined,{dmarc:'fail'}])assert.equal((await normaliseResend(event,e,{fetcher:async url=>Response.json(url.includes('/inboxes/')?record:{...record,authentication:auth})})).length,0);
 assert.equal((await normaliseResend(event,e,{fetcher:async url=>Response.json(url.includes('/inboxes/')?{...record,direction:'outbound'}:{...record,authentication:{dmarc:'pass'}})})).length,0);
 assert.equal((await normaliseResend(event,e,{fetcher:async url=>Response.json(url.includes('/inboxes/')?record:{...record,from:'someone-else@example.test',authentication:{dmarc:'pass'}})})).length,0);
});
test('SMS replay protection checks the message creation time with Twilio itself',async()=>{const e=env(),event={eventId:'SM'+'b'.repeat(32),senderId:'+447000000001'};const record={sid:event.eventId,account_sid:e.TWILIO_ACCOUNT_SID,from:event.senderId,to:e.WOLFGANG_SMS_NUMBER,date_created:new Date(now).toISOString()};assert(await confirmTwilioEvent(event,e,async()=>Response.json(record),now));assert(!await confirmTwilioEvent(event,e,async()=>Response.json({...record,date_created:new Date(now-86400001).toISOString()}),now));assert(!await confirmTwilioEvent(event,e,async()=>Response.json({...record,from:'+447000000999'}),now));});
test('a WhatsApp-only contact card includes a telephone field as well as the chat link',async()=>{const e=env();e.CONTACT_CHANNELS='whatsapp';const response=await handleConnectionRequest(new Request(origin+'/api/wolfgang/contact-card'),e,alice),text=await response.text();assert.equal(response.status,200);assert.match(text,/TEL;TYPE=CELL:\+441234567890/);assert.match(text,/URL:https:\/\/wa.me\/441234567890/);});
test('email replies use the RFC Message-ID to continue the same case',async()=>{
 const e={...env(),GUARDIAN_PROVIDER:'baseten',GUARDIAN_API_KEY:'test-key',GUARDIAN_MODEL:'test-model'};await bind(e,'email','alice@example.test');let sends=0;
 const first='11111111-1111-1111-1111-111111111111',second='22222222-2222-2222-2222-222222222222';
 const fetcher=async(url,init)=>{if(url.includes('/receiving/')){const follow=new URL(url).pathname.endsWith(second);return Response.json({id:follow?second:first,to:['inbox@example.test'],from:'Alice <alice@example.test>',text:follow?'That account number differs from my earlier invoice.':'Check this invoice.',subject:'Invoice',message_id:follow?'<customer-two@example.test>':'<customer-one@example.test>',headers:follow?{'in-reply-to':'<wolfgang-one@example.test>'}:{},authentication:{dmarc:'pass'}});}if(init.method==='POST'){sends++;const body=JSON.parse(init.body);assert.deepEqual(body.to,['alice@example.test']);return Response.json({id:'sent-'+sends});}return Response.json({message_id:sends===1?'<wolfgang-one@example.test>':'<wolfgang-two@example.test>'});};
 const options={fetcher,ingressOptions:{fetcher:async(_,init)=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(JSON.parse(init.body).messages[0].content.startsWith('Classify whether')?{scope:'same'}:{status:'caution',headline:'Check the payment details.',explanation:'The message alone does not establish them.',nextStep:'Call your supplier on the number already saved.',questions:['Did the account change?'],evidenceIds:[],reaction:'caution'})}}]})}};
 for(const [i,emailId] of [first,second].entries()){const payload=JSON.stringify({type:'email.received',data:{email_id:emailId,to:['inbox@example.test']}}),id='msg-email-'+i,time=String(Math.floor(Date.now()/1000)),signature=createHmac('sha256',Buffer.alloc(32,7)).update(id+'.'+time+'.'+payload).digest('base64');const response=await handleMessagingWebhook(new Request(origin+nativePath('email'),{method:'POST',headers:{'Content-Type':'application/json','svix-id':id,'svix-timestamp':time,'svix-signature':'v1,'+signature},body:payload}),e,null,options);assert.equal(response.status,200);}
 assert.equal(sends,2);assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,1);assert.match(e.DB.sqlite.prepare('SELECT replies_json FROM guardian_checks').get().replies_json,/differs from my earlier invoice/);
});

test('email delivery retries an uncertain Resend send with the same idempotency key and fixed sender recipient',async()=>{
 const e=env();await bind(e,'email','alice@example.test');
 const emailId='11111111-1111-1111-1111-111111111111',payload=JSON.stringify({type:'email.received',data:{email_id:emailId,to:['inbox@example.test']}});
 const time=String(Math.floor(Date.now()/1000)),webhookId='msg-email-retry',signature=createHmac('sha256',Buffer.alloc(32,7)).update(webhookId+'.'+time+'.'+payload).digest('base64');
 const request=()=>new Request(origin+nativePath('email'),{method:'POST',headers:{'Content-Type':'application/json','svix-id':webhookId,'svix-timestamp':time,'svix-signature':'v1,'+signature},body:payload});
 const sent=[];const fetcher=async(url,init)=>{
  if(url.includes('/receiving/'))return Response.json({id:emailId,to:['inbox@example.test'],from:'Alice <alice@example.test>',text:'Check this invoice.',subject:'Invoice',message_id:'<customer@example.test>',reply_to:['attacker@example.test'],headers:{'reply-to':'attacker@example.test'},authentication:{dmarc:'pass'}});
  if(init.method==='POST'){const body=JSON.parse(init.body);sent.push({body,key:init.headers['Idempotency-Key']});if(sent.length===1)throw new Error('response was interrupted after provider acceptance');return Response.json({id:'accepted-email'});}
  return Response.json({message_id:'<reply@example.test>'});
 };
 assert.equal((await handleMessagingWebhook(request(),e,null,{fetcher,now})).status,503);
 assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs').get().state,'reply_pending');
 await drainMessagingJobs(e,{fetcher,now:now+30001});assert.equal(sent.length,2);
 assert.equal(sent[0].key,sent[1].key);assert.deepEqual(sent[0].body,sent[1].body);assert.deepEqual(sent[1].body.to,['alice@example.test']);
 assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs').get().state,'completed');assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,1);
});

test('an interrupted saved email send resumes with its original idempotency generation',async()=>{
 const e=env();await bind(e,'email','alice@example.test');
 const event={channel:'email',eventId:'11111111-1111-1111-1111-111111111111',senderId:'alice@example.test',senderVerified:true,text:'Private invoice.',receivedAt:now,emailSubject:'Invoice',emailMessageId:'<customer@example.test>'};
 e.DB.sqlite.prepare("INSERT INTO guardian_message_jobs(id,channel,event_id,sender_id,owner_id,payload_json,state,reply_text,attempts,delivery_generation,received_at,created_at,updated_at,expires_at) VALUES (?,?,?,?,?,?,'sending',?,1,2,?,?,?,?)").run('interrupted-email','email',event.eventId,event.senderId,alice.ownerId,JSON.stringify(event),'Your saved reply.',now,now-130000,now-130000,now+86400000);
 let sends=0;await drainMessagingJobs(e,{now,fetcher:async(url,init)=>{if(init.method==='POST'){sends++;assert.equal(init.headers['Idempotency-Key'],'interrupted-email:2');assert.equal(JSON.parse(init.body).text.startsWith('Your saved reply.'),true);return Response.json({id:'resumed'});}return Response.json({message_id:'<resumed@example.test>'});}});
 assert.equal(sends,1);assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs').get().state,'completed');
});

test('HTML email is readable while files stay explicitly unassessed and header threading cannot redirect a recipient',async()=>{
 const e=env(),emailId='11111111-1111-1111-1111-111111111111';
 const events=await normaliseResend({type:'email.received',data:{email_id:emailId,to:['inbox@example.test']}},e,{fetcher:async()=>Response.json({id:emailId,to:['inbox@example.test'],from:'Alice <alice@example.test>',subject:'Payment\r\nInvoice',text:null,html:'<p>Please check the <a href="https://bad.example.test">bank request</a>.</p>',message_id:'<customer@example.test>\r\nBcc: attacker@example.test',attachments:[{id:'file-one',filename:'invoice.pdf'}],authentication:{dmarc:'pass'}})});
 assert.equal(events.length,1);assert.equal(events[0].unsupported,true);assert.equal(events[0].emailMessageId,null);assert.match(events[0].text,/https:\/\/bad.example.test/);assert.doesNotMatch(events[0].text,/<p>/);
 let calls=0;await assert.rejects(sendProviderReply({...events[0],senderId:'attacker@example.test,other@example.test'},'Private reply',e,{fetcher:async()=>{calls++;throw Error('must not send');},idempotencyKey:'test-key'}),{code:'INVALID_RECIPIENT'});assert.equal(calls,0);
 const rejected=await normaliseResend({type:'email.received',data:{email_id:emailId,to:['inbox@example.test']}},e,{fetcher:async()=>Response.json({id:'22222222-2222-2222-2222-222222222222',to:['inbox@example.test'],from:'alice@example.test',text:'Unrelated receiving record',authentication:{dmarc:'pass'}})});assert.equal(rejected.length,0);
});

test('reply metadata from another sender cannot select its private conversation',async()=>{
 const e={...env(),GUARDIAN_PROVIDER:'baseten',GUARDIAN_API_KEY:'test-key',GUARDIAN_MODEL:'test-model'},sent=[];
 await bind(e);e.DB.sqlite.prepare('INSERT INTO guardian_channel_identities(channel,sender_id,owner_id,verified_at) VALUES (?,?,?,?)').run('whatsapp','447000000002',alice.ownerId,now);
 const options={fetcher:transport(sent),ingressOptions:{fetcher:async()=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({status:'caution',headline:'Verify the changed request.',explanation:'The new details are unverified.',nextStep:'Call the previously known supplier.',questions:['Did the details change?'],evidenceIds:[],reaction:'caution'})}}]})}};
 await handleMessagingWebhook(metaRequest(e,wa('Private first sender case.')),e,null,options);
 const forged=wa('Different sender message.','wamid.cross-sender==','447000000002');forged.entry[0].changes[0].value.messages[0].context={id:'outgoing-1'};
 await handleMessagingWebhook(metaRequest(e,forged),e,null,options);
 assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,2);
 for(const row of e.DB.sqlite.prepare('SELECT replies_json FROM guardian_checks').all())assert.equal(JSON.parse(row.replies_json).filter(reply=>reply.role==='user').length,0);
 assert.equal(sent[1].body.to,'447000000002');
});

function emailRequest(emailId){
 const raw=JSON.stringify({type:'email.received',data:{email_id:emailId,to:['inbox@example.test']}}),id='msg-'+emailId,time=String(Math.floor(Date.now()/1000));
 const signature=createHmac('sha256',Buffer.alloc(32,7)).update(id+'.'+time+'.'+raw).digest('base64');
 return new Request(origin+nativePath('email'),{method:'POST',headers:{'Content-Type':'application/json','svix-id':id,'svix-timestamp':time,'svix-signature':'v1,'+signature},body:raw});
}
test('a signed first email resumes after canonical email linking without asking for it again',async()=>{
 const e={...env(),GUARDIAN_PROVIDER:'fireworks',GUARDIAN_API_KEY:'fixture-key',GUARDIAN_MODEL:'fixture-model',GUARDIAN_IDENTITY_SECRET:'i'.repeat(40)},sent=[];
 const emailId='33333333-3333-3333-3333-333333333333',identity={ownerId:'people:email-canonical',peopleOrganisedId:'email-canonical',email:'alice@example.test'};
 let modelCalls=0;
 const fetcher=async(url,init)=>{
  if(url.includes('/receiving/'))return Response.json({id:emailId,to:['inbox@example.test'],from:'Alice <alice@example.test>',text:'Please keep this first original request.',message_id:'<first@example.test>',authentication:{dmarc:'pass'}});
  if(init?.method==='POST'){sent.push(JSON.parse(init.body));return Response.json({id:'reply-'+sent.length});}
  return Response.json({message_id:'<reply-'+sent.length+'@example.test>'});
 };
 const options={fetcher,ingressOptions:{identityFetcher:async()=>Response.json({id:'email-canonical',guardianAccess:{unlimited:false}}),fetcher:async()=>{modelCalls++;return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({status:'unresolved',headline:'I need the earlier agreement.',explanation:'This message alone does not establish the request.',nextStep:'Forward the relevant earlier agreement.',evidenceIds:[],questions:['Were you expecting this request?'],reaction:'asking'})}}]});}}};
 assert.equal((await handleMessagingWebhook(emailRequest(emailId),e,null,options)).status,200);
 assert.equal(modelCalls,0);assert.equal(sent.length,1);assert.match(sent[0].text,/24 hours/);
 assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs').get().state,'waiting_link');
 await handleConnectionRequest(new Request(origin+'/api/connections'),e,identity);
 await drainMessagingJobs(e,options);
 assert.equal(modelCalls,1);assert.equal(sent.length,2);assert.deepEqual(sent[1].to,['alice@example.test']);assert.match(sent[1].text,/earlier agreement/);
 assert.deepEqual({...e.DB.sqlite.prepare('SELECT owner_id,message FROM guardian_checks').get()},{owner_id:identity.ownerId,message:'Please keep this first original request.'});
 await handleMessagingWebhook(emailRequest(emailId),e,null,options);
 assert.equal(modelCalls,1);assert.equal(sent.length,2);
});
test('Stop while an email assessment is running prevents the private reply and preserves the check',async()=>{
 const e={...env(),GUARDIAN_PROVIDER:'fireworks',GUARDIAN_API_KEY:'fixture-key',GUARDIAN_MODEL:'fixture-model'};await bind(e,'email','alice@example.test');
 const emailId='44444444-4444-4444-4444-444444444444';let sends=0;
 const fetcher=async(url,init)=>{if(url.includes('/receiving/'))return Response.json({id:emailId,to:['inbox@example.test'],from:'alice@example.test',text:'Please check this payment.',authentication:{dmarc:'pass'}});if(init?.method==='POST')sends++;return Response.json({id:'must-not-send'});};
 const assessment=async()=>{
  const stopped=await handleContactRequest(new Request(origin+'/api/contact-link',{method:'DELETE',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({channel:'email'})}),e,alice);assert.equal(stopped.status,200);
  return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({status:'unresolved',headline:'More context is needed.',explanation:'The details are not independently confirmed.',nextStep:'Check the original agreement.',evidenceIds:[],questions:[],reaction:'asking'})}}]});
 };
 await handleMessagingWebhook(emailRequest(emailId),e,null,{fetcher,ingressOptions:{fetcher:assessment}});
 assert.equal(sends,0);assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,1);assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs').get().state,'cancelled');
});
test('malformed or absent delivery receipts never trigger a duplicate non-idempotent reply',async()=>{
 for(const response of [()=>new Response('not-json'),()=>Response.json({}),()=>Response.json({messages:[{id:{private:'not a receipt'}}]}),()=>new Response('backend unavailable',{status:503})]){
  const e=env();await bind(e);let sends=0;
  const first=await handleMessagingWebhook(metaRequest(e,wa()),e,null,{fetcher:async()=>{sends++;return response();},now});
  assert.equal(first.status,200);assert.equal(sends,1);assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs').get().state,'uncertain');
  await drainMessagingJobs(e,{fetcher:async()=>{sends++;return Response.json({messages:[{id:'must-not-send'}]});},now:now+180000});
  assert.equal(sends,1);assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,1);
 }
});

test('WhatsApp receiving authenticates and deduplicates while inference and automatic sends remain off',async()=>{
 const e={...env(),CONTACT_CHANNELS:'email,x',WOLFGANG_WHATSAPP_ENABLED:'false',WHATSAPP_RECEIVING_ENABLED:'true'};
 await bind(e);
 const options={now,fetcher:async()=>{assert.fail('Receiving must not send');},ingressOptions:{fetcher:async()=>{assert.fail('Receiving must not call inference');}}};
 const body=wa('Keep this message without assessing it.');
 assert.equal((await handleMessagingWebhook(metaRequest(e,body,'whatsapp','sha256'+'0'.repeat(64)),e,null,options)).status,401);
 assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_message_jobs').get().n,0);
 for(let i=0;i<2;i++){
  const response=await handleMessagingWebhook(metaRequest(e,body),e,null,options);
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{received:true,automaticReplies:false});
 }
 await drainMessagingJobs(e,options);
 assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_message_jobs').get().n,1);
 assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs').get().state,'queued');
 assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,0);
 for(const mutate of [b=>{b.entry[0].id='999999999';},b=>{b.entry[0].changes[0].value.metadata.phone_number_id='999999999';},b=>{b.entry[0].changes[0].field='smb_message_echoes';},b=>{b.entry[0].changes[0].field='history';}]){
  const ignored=wa('Not an incoming message for this connection.','wamid.ignored==');mutate(ignored);
  assert.equal((await handleMessagingWebhook(metaRequest(e,ignored),e,null,options)).status,200);
  assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_message_jobs').get().n,1);
 }
 e.WHATSAPP_RECEIVING_ENABLED='false';assert.equal((await handleMessagingWebhook(metaRequest(e,body),e,null,options)).status,503);
 e.WHATSAPP_RECEIVING_ENABLED='true';e.WHATSAPP_ACCESS_TOKEN='';assert.equal((await handleMessagingWebhook(metaRequest(e,body),e,null,options)).status,503);
});
test('WhatsApp intake clears expired content when the next signed message arrives',async()=>{
 const e={...env(),WOLFGANG_WHATSAPP_ENABLED:'false',WHATSAPP_RECEIVING_ENABLED:'true'};
 const options={now,fetcher:async()=>{assert.fail('No automatic send');}};
 await handleMessagingWebhook(metaRequest(e,wa('Private expired content.')),e,null,options);
 const later=now+86400001,fresh=wa('Fresh content.','wamid.fresh==');fresh.entry[0].changes[0].value.messages[0].timestamp=String(Math.floor(later/1000));
 assert.equal((await handleMessagingWebhook(metaRequest(e,fresh),e,null,{...options,now:later})).status,200);
 assert.deepEqual({...e.DB.sqlite.prepare('SELECT state,payload_json FROM guardian_message_jobs WHERE event_id=?').get('wamid.first==')},{state:'expired',payload_json:'{}'});
 assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs WHERE event_id=?').get('wamid.fresh==').state,'queued');
});
test('concurrent WhatsApp intake cannot exceed the per-sender admission bound',async()=>{
 const e={...env(),WOLFGANG_WHATSAPP_ENABLED:'false',WHATSAPP_RECEIVING_ENABLED:'true'};
 const seed=e.DB.sqlite.prepare("INSERT INTO guardian_message_jobs(id,channel,event_id,sender_id,payload_json,received_at,created_at,updated_at,expires_at) VALUES (?,'whatsapp',?,'447000000001','{}',?,?,?,?)");
 for(let i=0;i<9;i++)seed.run('wa-seed-'+i,'wa-seed-'+i,now,now,now,now+86400000);
 const responses=await Promise.all(['wamid.concurrent-one==','wamid.concurrent-two=='].map(id=>handleMessagingWebhook(metaRequest(e,wa('Pending message.',id)),e,null,{now})));
 assert.deepEqual(responses.map(r=>r.status).sort(),[200,429]);assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_message_jobs').get().n,10);
});

test('Messenger receiving authenticates and deduplicates without inference or automatic sends',async()=>{
 const e={...env(),CONTACT_CHANNELS:'email,x',WOLFGANG_MESSENGER_ENABLED:'false',MESSENGER_RECEIVING_ENABLED:'true'};
 await bind(e,'messenger','999999999');
 const options={now,fetcher:async()=>{assert.fail('Receiving must not send');},ingressOptions:{fetcher:async()=>{assert.fail('Receiving must not call inference');}}},body=messenger();
 assert.equal((await handleMessagingWebhook(metaRequest(e,body,'messenger','sha256='+'0'.repeat(64)),e,null,options)).status,401);
 assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_message_jobs').get().n,0);
 for(let i=0;i<2;i++){
  const response=await handleMessagingWebhook(metaRequest(e,body,'messenger'),e,null,options);
  assert.equal(response.status,200);assert.deepEqual(await response.json(),{received:true,automaticReplies:false});
 }
 await drainMessagingJobs(e,options);
 assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_message_jobs').get().n,1);
 assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs').get().state,'queued');
 assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,0);
 for(const mutate of [b=>{b.entry[0].id='111111111';},b=>{b.entry[0].messaging[0].recipient.id='111111111';},b=>{b.entry[0].messaging[0].message.is_echo=true;},b=>{b.entry[0].messaging[0].message.is_deleted=true;}]){
  const ignored=messenger('Do not queue this.','m.ignored');mutate(ignored);
  assert.equal((await handleMessagingWebhook(metaRequest(e,ignored,'messenger'),e,null,options)).status,200);
  assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_message_jobs').get().n,1);
 }
 e.MESSENGER_RECEIVING_ENABLED='false';assert.equal((await handleMessagingWebhook(metaRequest(e,body,'messenger'),e,null,options)).status,503);
 e.MESSENGER_RECEIVING_ENABLED='true';e.MESSENGER_PAGE_ACCESS_TOKEN='';assert.equal((await handleMessagingWebhook(metaRequest(e,body,'messenger'),e,null,options)).status,503);
});
test('Messenger intake clears expired content on the next signed message',async()=>{
 const e={...env(),WOLFGANG_MESSENGER_ENABLED:'false',MESSENGER_RECEIVING_ENABLED:'true'},options={now,fetcher:async()=>{assert.fail('No automatic send');}};
 await handleMessagingWebhook(metaRequest(e,messenger('Private expired content.'),'messenger'),e,null,options);
 const later=now+86400001;
 assert.equal((await handleMessagingWebhook(metaRequest(e,messenger('Fresh content.','m.fresh',later),'messenger'),e,null,{...options,now:later})).status,200);
 assert.deepEqual({...e.DB.sqlite.prepare('SELECT state,payload_json FROM guardian_message_jobs WHERE event_id=?').get('m.first')},{state:'expired',payload_json:'{}'});
 assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs WHERE event_id=?').get('m.fresh').state,'queued');
});
test('concurrent Messenger intake cannot exceed the per-sender admission bound',async()=>{
 const e={...env(),WOLFGANG_MESSENGER_ENABLED:'false',MESSENGER_RECEIVING_ENABLED:'true'};
 const seed=e.DB.sqlite.prepare("INSERT INTO guardian_message_jobs(id,channel,event_id,sender_id,payload_json,received_at,created_at,updated_at,expires_at) VALUES (?,'messenger',?,'999999999','{}',?,?,?,?)");
 for(let i=0;i<9;i++)seed.run('messenger-seed-'+i,'messenger-seed-'+i,now,now,now,now+86400000);
 const responses=await Promise.all(['m.concurrent-one','m.concurrent-two'].map(id=>handleMessagingWebhook(metaRequest(e,messenger('Pending message.',id),'messenger'),e,null,{now})));
 assert.deepEqual(responses.map(r=>r.status).sort(),[200,429]);assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_message_jobs').get().n,10);
});

test('email intake-only mode authenticates, deduplicates, expires and never invokes inference or sends',async()=>{
 const e={...env(),WOLFGANG_EMAIL_ENABLED:'false',EMAIL_RECEIVING_ENABLED:'true'};await bind(e,'email','alice@example.test');let retrievals=0;
 const id='55555555-5555-5555-5555-555555555555',fetcher=async(url,init)=>{assert(url.includes('/receiving/'));assert.notEqual(init?.method,'POST');retrievals++;return Response.json({id,to:['inbox@example.test'],from:'alice@example.test',text:'Private pending message',authentication:{dmarc:'pass'}});};
 const options={now,fetcher,ingressOptions:{fetcher:()=>{throw Error('No inference');}}};
 for(let i=0;i<2;i++){const response=await handleMessagingWebhook(emailRequest(id),e,null,options);assert.equal(response.status,200);assert.equal((await response.json()).automaticReplies,false);}
 assert.equal(retrievals,2);assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_message_jobs').get().n,1);assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs').get().state,'queued');assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_checks').get().n,0);
 await cleanupMessaging(e,now+86400001);assert.equal(e.DB.sqlite.prepare('SELECT payload_json FROM guardian_message_jobs').get().payload_json,'{}');
 e.EMAIL_RECEIVING_ENABLED='false';assert.equal((await handleMessagingWebhook(emailRequest(id),e,null,options)).status,503);
});
test('intake-only email STOP cancels linked pending content immediately and requires a newer verified link',async()=>{
 const e={...env(),WOLFGANG_EMAIL_ENABLED:'false',EMAIL_RECEIVING_ENABLED:'true'};await bind(e,'email','alice@example.test');
 const ids=['66666666-6666-6666-6666-666666666666','77777777-7777-7777-7777-777777777777','88888888-8888-8888-8888-888888888888'];let text='Private first email';
 const fetcher=async url=>Response.json({id:new URL(url).pathname.split('/').at(-1),to:['inbox@example.test'],from:'alice@example.test',text,authentication:{dmarc:'pass'}});
 await handleMessagingWebhook(emailRequest(ids[0]),e,null,{now,fetcher});text='STOP';await handleMessagingWebhook(emailRequest(ids[1]),e,null,{now:now+1,fetcher});
 const old=e.DB.sqlite.prepare('SELECT state,payload_json FROM guardian_message_jobs WHERE event_id=?').get(ids[0]);assert.deepEqual({...old},{state:'cancelled',payload_json:'{}'});assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_channel_identities').get().n,0);
 text='Do not retain this';await handleMessagingWebhook(emailRequest(ids[2]),e,null,{now:now+2,fetcher});assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_message_jobs').get().n,2);
 const issue=new Request(origin+'/api/contact-link',{method:'POST',headers:{origin,'Content-Type':'application/json'},body:JSON.stringify({channel:'email'})});
 const issued=await handleContactRequest(issue,e,alice,{now:now+3});
 assert.equal(issued.status,201);
 text=(await issued.json()).code;
 await handleMessagingWebhook(emailRequest('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'),e,null,{now:now+4,fetcher});
 assert.equal(e.DB.sqlite.prepare("SELECT owner_id FROM guardian_channel_identities WHERE channel='email'").get().owner_id,alice.ownerId);
 text='New message after reconnecting';await handleMessagingWebhook(emailRequest(ids[2]),e,null,{now:now+5,fetcher});
 assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_message_jobs').get().n,4);
});
test('concurrent email intake cannot exceed the per-sender admission bound',async()=>{
 const e={...env(),WOLFGANG_EMAIL_ENABLED:'false',EMAIL_RECEIVING_ENABLED:'true'};const seed=e.DB.sqlite.prepare("INSERT INTO guardian_message_jobs(id,channel,event_id,sender_id,payload_json,received_at,created_at,updated_at,expires_at) VALUES (?,'email',?,'alice@example.test','{}',?,?,?,?)");for(let i=0;i<9;i++)seed.run('seed-'+i,'seed-'+i,now,now,now,now+86400000);
 const ids=['99999999-9999-9999-9999-999999999999','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'];
 const fetcher=async url=>Response.json({id:new URL(url).pathname.split('/').at(-1),to:['inbox@example.test'],from:'alice@example.test',text:'Pending message',authentication:{dmarc:'pass'}});
 const rs=await Promise.all(ids.map(id=>handleMessagingWebhook(emailRequest(id),e,null,{now,fetcher})));assert.deepEqual(rs.map(r=>r.status).sort(),[200,429]);assert.equal(e.DB.sqlite.prepare('SELECT COUNT(*) n FROM guardian_message_jobs').get().n,10);
});

test('registered email forwards reply only to the verified outer sender without a Connections visit',async()=>{
 const now=Date.now(),e={...env(),GUARDIAN_EMAIL_REGISTERED_ONLY_FROM:new Date(now-1000).toISOString(),GUARDIAN_PROVIDER:'fireworks',GUARDIAN_API_KEY:'fixture-key',GUARDIAN_MODEL:'fixture-model',GUARDIAN_IDENTITY_SECRET:'i'.repeat(40)};
 const sent=[];let modelCalls=0,sender='unregistered@example.test';
 const login=new Request(origin+'/api/auth/verify',{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:'__Host-wolfgang_flow='+'a'.repeat(64)+'.abcdef12-abcd-1234-1234-123456789012'},body:JSON.stringify({email:'alice@example.test',code:'123456'})});
 const response=await handlePeopleAuthRequest(login,e,{fetcher:async()=>Response.json({token:'b'.repeat(64),identity:{id:'email-canonical',email:'alice@example.test'}})});
 assert.equal(response.status,200);
 assert.equal(e.DB.sqlite.prepare("SELECT owner_id FROM guardian_channel_identities WHERE sender_id='alice@example.test'").get()?.owner_id,'people:email-canonical');
 const fetcher=async(url,init)=>{
  if(url.includes('/receiving/'))return Response.json({id:url.split('/receiving/')[1].split('?')[0],to:['inbox@example.test'],from:sender,text:'Forwarded from fraud@example.test: please review the attached note.',subject:'Fwd: Invoice',headers:{'reply-to':'fraud@example.test'},message_id:'<customer-forward@example.test>',authentication:{dmarc:'pass'}});
  if(init?.method==='POST'){sent.push(JSON.parse(init.body));return Response.json({id:'reply-accepted'});}
  return Response.json({message_id:'<reply@example.test>'});
 };
 const options={fetcher,ingressOptions:{identityFetcher:async()=>Response.json({id:'email-canonical',guardianAccess:{unlimited:false}}),fetcher:async()=>{modelCalls++;return Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify({status:'unresolved',headline:'I need the earlier agreement.',explanation:'This message alone does not establish the request.',nextStep:'Forward the relevant earlier agreement.',evidenceIds:[],questions:['Were you expecting this request?'],reaction:'asking'})}}]});}}};
 const first='11111111-1111-1111-1111-111111111111',second='22222222-2222-2222-2222-222222222222';
 assert.equal((await handleMessagingWebhook(emailRequest(first),e,null,options)).status,200);
 assert.equal(modelCalls,0);assert.equal(sent.length,0);
 // Pending intake from disabled channels must not occupy every worker queue slot.
 for(let n=0;n<9;n++)e.DB.sqlite.prepare("INSERT INTO guardian_message_jobs(id,channel,event_id,sender_id,payload_json,created_at,updated_at,received_at,expires_at) VALUES(?,'x',?,'123','{}',?,?,?,?)").run('intake'+n,'event'+n,now-200,now-200,now-200,now+3600000);
 sender='alice@example.test';
 assert.equal((await handleMessagingWebhook(emailRequest(second),e,null,options)).status,200);
 assert.ok(modelCalls>0);assert.equal(sent.length,1);assert.match(sent[0].text,/earlier agreement/);
 assert.deepEqual(sent[0].to,['alice@example.test']);
 assert.equal(sent[0].headers['In-Reply-To'],'<customer-forward@example.test>');
 assert.equal(sent[0].cc,undefined);assert.equal(sent[0].bcc,undefined);
 const callsAfterReply=modelCalls;
 await handleMessagingWebhook(emailRequest(second),e,null,options);
 assert.equal(modelCalls,callsAfterReply);assert.equal(sent.length,1);
});

test('activating registered email replies leaves intake-only mail unsent',async()=>{
 const now=Date.now(),e=env(),id='11111111-1111-1111-1111-111111111111';let sends=0;
 const fetcher=async(url,init)=>{
  if(url.includes('/receiving/'))return Response.json({id,to:['inbox@example.test'],from:'alice@example.test',text:'Message before activation',authentication:{dmarc:'pass'}});
  sends++;throw Error('Old mail must not be transmitted');
 };
 e.WOLFGANG_EMAIL_ENABLED='false';e.EMAIL_RECEIVING_ENABLED='true';
 assert.equal((await handleMessagingWebhook(emailRequest(id),e,null,{now,fetcher})).status,200);
 assert.equal(e.DB.sqlite.prepare('SELECT state FROM guardian_message_jobs WHERE event_id=?').get(id)?.state,'queued');
 e.WOLFGANG_EMAIL_ENABLED='true';e.GUARDIAN_EMAIL_REGISTERED_ONLY_FROM=new Date(now+1).toISOString();
 await drainMessagingJobs(e,{now:now+10,fetcher});
 assert.equal(sends,0);assert.equal(e.DB.sqlite.prepare("SELECT state FROM guardian_message_jobs WHERE event_id=?").get(id)?.state,'cancelled');
});

test('WhatsApp activation skips old intake and replies on the channel to fresh events only',async()=>{
 const e=env(),sent=[],options={now,fetcher:transport(sent)};
 e.WOLFGANG_WHATSAPP_ENABLED='false';e.WHATSAPP_RECEIVING_ENABLED='true';
 const old=wa('Before launch','wamid.before');
 old.entry[0].changes[0].value.messages[0].timestamp=String(Math.floor(now/1000)-60);
 assert.equal((await handleMessagingWebhook(metaRequest(e,old),e,null,options)).status,200);
 e.WOLFGANG_WHATSAPP_ENABLED='true';
 e.GUARDIAN_WHATSAPP_REPLY_FROM=new Date(now-5000).toISOString();
 await drainMessagingJobs(e,options);
 assert.equal(sent.length,0);
 assert.equal(e.DB.sqlite.prepare("SELECT state FROM guardian_message_jobs WHERE event_id='wamid.before'").get()?.state,'cancelled');
 await handleMessagingWebhook(metaRequest(e,wa('Hello','wamid.after')),e,null,options);
 assert.equal(sent.length,1);assert.match(sent[0].body.text.body,/link this channel/);
 assert.equal(sent[0].body.to,'447000000001');
 assert.equal(e.DB.sqlite.prepare('SELECT count(*) AS n FROM guardian_checks').get().n,0);
});

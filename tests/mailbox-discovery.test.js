import test from 'node:test';
import assert from 'node:assert/strict';
import {discoverMailbox,mailboxAddress,reviewedMailboxProviders} from '../worker/mailbox-discovery.js';

const origin='https://guardian.test';
const profiles=[{id:'owned-mail',protocol:'imap',label:'Our email provider',domains:['example.test'],mxDomains:['mailhost.example']}];
const env=()=>({DB:{},CONNECTION_ENCRYPTION_KEY:Buffer.alloc(32,1).toString('base64url'),GMAIL_CLIENT_ID:'fixture-client',GMAIL_CLIENT_SECRET:'fixture-secret',GMAIL_CONNECT_ENABLED:'true',GMAIL_REDIRECT_URI:origin+'/api/connections/gmail/callback',OUTLOOK_CLIENT_ID:'fixture-client',OUTLOOK_CLIENT_SECRET:'fixture-secret',OUTLOOK_CONNECT_ENABLED:'true',OUTLOOK_REDIRECT_URI:origin+'/api/connections/outlook/callback',MAILBOX_REVIEWED_PROVIDERS:JSON.stringify(profiles)});
const dns=hosts=>Response.json({Status:0,Answer:hosts.map(host=>({type:15,data:'10 '+host+'.'}))});

test('email parsing keeps the local part and rejects injected or non-domain addresses',()=>{
 assert.deepEqual(mailboxAddress('Owner@EXAMPLE.TEST'),{address:'Owner@example.test',domain:'example.test'});
 for(const value of ['owner@localhost','owner@bad..test','owner@-bad.test','x@y@z.test','x@ok.test\r\nBcc:other@test.test',' owner@example.test','owner@example.test/path'])assert.equal(mailboxAddress(value),null);
});

test('known Google and Microsoft addresses use their existing authorisation routes without DNS or a password',async()=>{
 const e=env();for(const [email,provider] of [['owner@gmail.com','gmail'],['owner@hotmail.co.uk','outlook']]){
  const result=await discoverMailbox(email,e,{origin,fetcher:()=>{throw Error('A known provider needs no lookup');}});
  assert.equal(result.kind,'oauth');assert.equal(result.provider,provider);assert.equal(result.startPath,'/api/connections/'+provider+'/start');
  assert(!JSON.stringify(result).includes('fixture-secret'));
 }
 const disabled=await discoverMailbox('owner@gmail.com',{...e,GMAIL_CONNECT_ENABLED:'false'},{origin});assert.equal(disabled.kind,'unavailable');
 const wrongOrigin=await discoverMailbox('owner@gmail.com',{...e,GMAIL_REDIRECT_URI:'https://attacker.test/api/connections/gmail/callback'},{origin});assert.equal(wrongOrigin.kind,'unavailable');
});

test('a reviewed direct domain selects its fixed profile and normalises only the address domain',async()=>{
 const result=await discoverMailbox('Owner@EXAMPLE.TEST',env(),{origin,mailboxAvailable:true,fetcher:()=>{throw Error('No lookup needed');}});
 assert.deepEqual(result,{kind:'mailbox',providerId:'owned-mail',label:'Our email provider',username:'Owner@example.test'});
 const disabled=await discoverMailbox('Owner@example.test',env(),{origin,mailboxAvailable:false});assert.equal(disabled.kind,'unavailable');assert(!JSON.stringify(disabled).includes('username'));
});

test('custom-domain MX lookup sends only a domain to the fixed resolver and can identify Google or a reviewed provider',async()=>{
 for(const [host,expected] of [['aspmx.l.google.com','oauth'],['mx1.mailhost.example','mailbox']]){
  const result=await discoverMailbox('private-name@custom.test',env(),{origin,mailboxAvailable:true,fetcher:async(url,init)=>{
   const target=new URL(url);assert.equal(target.origin,'https://dns.google');assert.equal(target.pathname,'/resolve');assert.equal(target.searchParams.get('name'),'custom.test');assert.equal(target.searchParams.get('type'),'MX');assert(!url.includes('private-name'));assert.equal(init.redirect,'manual');assert(!init.headers.Authorization);assert.equal(init.body,undefined);return dns([host]);
  }});assert.equal(result.kind,expected);
 }
});

test('suffix confusion, mixed providers, invalid DNS and resolver redirects cannot choose an arbitrary credential destination',async()=>{
 for(const response of [()=>dns(['mx.mailhost.example.attacker.test']),()=>dns(['aspmx.l.google.com','mx.mailhost.example']),()=>Response.json({Status:3}),()=>new Response('not json',{headers:{'Content-Type':'application/json'}}),()=>new Response(null,{status:302,headers:{location:'https://attacker.test'}})]){
  const result=await discoverMailbox('person@unknown.test',env(),{origin,mailboxAvailable:true,fetcher:async()=>response()});
  assert.equal(result.kind,'choose');assert.deepEqual(result.providers,[{id:'owned-mail',label:'Our email provider'}]);assert(!JSON.stringify(result).includes('attacker'));
 }
});

test('unreviewed host metadata cannot become a profile and malformed discovery domains invalidate the catalog',async()=>{
 assert.equal(reviewedMailboxProviders(JSON.stringify([{...profiles[0],domains:['.example.test']}])).length,0);
 assert.equal(reviewedMailboxProviders(JSON.stringify([{...profiles[0],mxDomains:['EXAMPLE.TEST']}])).length,0);
 const parsed=reviewedMailboxProviders(JSON.stringify([{...profiles[0],host:'127.0.0.1',port:22}]));assert(!('host' in parsed[0]));assert(!('port' in parsed[0]));
});

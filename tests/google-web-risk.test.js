import test from 'node:test';
import assert from 'node:assert/strict';
import {checkLinkReputation} from '../worker/url-reputation.js';
const env={GUARDIAN_LINK_REPUTATION:'google-web-risk',GUARDIAN_GOOGLE_WEB_RISK_API_KEY:'synthetic-only-key'},now=Date.UTC(2026,10,4);
const flagged={threat:{threatTypes:['SOCIAL_ENGINEERING'],expireTime:new Date(now+3600000).toISOString()}};
test('Google Lookup receives only one eligible exact public URI, never the message or credentials in URL',async()=>{
 let calls=0;const result=await checkLinkReputation('My name is PRIVATE. See https://example.com/login and https://other.com/verify',env,{now,fetcher:(url,init)=>{
  calls++;const u=new URL(url);assert.equal(u.origin,'https://webrisk.googleapis.com');assert.equal(u.pathname,'/v1/uris:search');assert.equal(u.searchParams.get('uri'),'https://example.com/login');assert.deepEqual(u.searchParams.getAll('threatTypes'),['MALWARE','SOCIAL_ENGINEERING','UNWANTED_SOFTWARE']);assert.equal(u.searchParams.has('key'),false);assert.equal(init.headers['x-goog-api-key'],env.GUARDIAN_GOOGLE_WEB_RISK_API_KEY);assert.equal(init.redirect,'manual');assert.equal(init.body,undefined);assert.doesNotMatch(url,/PRIVATE|other.com|synthetic/);return Response.json(flagged);
 }});
 assert.equal(calls,1);assert.equal(result.status,'flagged');assert.match(result.note,/Google.*social engineering/);assert.match(result.advisory,/flag safe sites in error/);assert.equal(Date.parse(result.expiresAt),now+1800000);
});
test('Google no match remains unverified and no credential means no request',async()=>{
 const clean=await checkLinkReputation('https://example.com/',env,{now,fetcher:()=>Response.json({})});assert.equal(clean.status,'no_flags');assert.match(clean.note,/does not mean.*safe/);
 assert.equal(await checkLinkReputation('https://example.com/',{GUARDIAN_LINK_REPUTATION:'google-web-risk'},{fetcher:()=>assert.fail()}),null);
});
test('private, tokenised and local links are not sent to Google or replaced with the root',async()=>{
 for(const link of ['https://example.com/login?code=PRIVATE','https://example.com/#SECRET','https://example.com/reset/SECRET','https://secret.tenant.example.com/','http://127.0.0.1/','https://example.com/login(account)','https://user:pass@example.com/']){
  const result=await checkLinkReputation(link,env,{fetcher:()=>assert.fail('private URL must stay local')});assert.equal(result.status,'skipped',link);
 }
});
test('malformed, expired, oversized, throttled and redirected replies never clear a link',async()=>{
 for(const response of [Response.json(null),Response.json([]),Response.json({error:'oops'}),Response.json({threat:{...flagged.threat,expireTime:new Date(now-1).toISOString()}}),Response.json({threat:{...flagged.threat,threatTypes:['SAFE']}}),new Response('x'.repeat(33000),{headers:{'content-type':'application/json'}}),new Response('',{status:429}),new Response(null,{status:302,headers:{Location:'https://untrusted.example'}})]){
  const result=await checkLinkReputation('https://example.com/login',env,{now,fetcher:()=>response});assert.equal(result.status,'unavailable');
 }
});

test('private earlier records and masked but ineligible destinations never substitute a safe-looking URL',async()=>{
 const {reputationEvidence}=await import('../worker/url-reputation.js');
 const hidden='[Link: https://example.com/login?token=secret] https://normal.com/ [End link]';
 const records=[{source:'Earlier financial statement',text:'Private context https://private-bank.com/'},{source:'Gmail · Old agreement',text:'https://supplier.com/billing'}];
 assert.equal(await checkLinkReputation(reputationEvidence('Check this claim',records),env,{fetcher:()=>assert.fail()}),null);
 const candidate=reputationEvidence('Check my attachment',[...records,{source:'alleged.eml · Case',text:'Imported email; original message.\n'+hidden}]);
 assert.equal(candidate,'https://example.com/login?token=secret');assert.equal((await checkLinkReputation(candidate,env,{fetcher:()=>assert.fail()})).status,'skipped');
 for(const raw of ['https://example.com/login[hidden]','https://example.com/login(private)','https://example.com/login?secret'])assert.equal((await checkLinkReputation(reputationEvidence(raw),env,{fetcher:()=>assert.fail()})).status,'skipped');
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {checkLinkReputation} from '../worker/url-reputation.js';
const env={GUARDIAN_LINK_REPUTATION:'virustotal-commercial',GUARDIAN_VIRUSTOTAL_COMMERCIAL_KEY:'unit-test-credential'};
const address='https://example.com/login',now=Date.UTC(2026,10,4),id=createHash('sha256').update(address).digest('hex');
const report=(overrides={})=>({data:{type:'url',id,attributes:{url:address,last_analysis_date:now/1000-120,last_analysis_stats:{malicious:2,suspicious:1,harmless:35,undetected:5},...overrides}}});
const read=async(response,extra={})=>checkLinkReputation('See '+address,env,{fetcher:()=>response,now,...extra});
test('read-only SHA256 lookup uses a fixed destination, key in header and bounded result; never re-scans',async()=>{
 let calls=0;
 const res=await checkLinkReputation('See '+address+' (private account reference ABC123).',env,{now,fetcher:(path,init)=>{
   calls++;assert.equal(path,'https://www.virustotal.com/api/v3/urls/'+id);assert.equal(init.method,'GET');assert.equal(init.redirect,'manual');assert.equal(init.headers['x-apikey'],env.GUARDIAN_VIRUSTOTAL_COMMERCIAL_KEY);assert.equal(init.body,undefined);
   return Response.json(report({html_meta:{customer:'INJECTED'},last_final_url:'https://other.example.com/'}));
 }});assert.equal(calls,1);assert.equal(res.status,'flagged');assert.match(res.note,/2 malicious and 1 suspicious/);assert.doesNotMatch(JSON.stringify(res),/ABC123|INJECTED|other\.example|unit-test-credential|\/login/);
});
test('private, unusual and nonpublic addresses never leave the worker, including signed links and local IPs',async()=>{
 const fetcher=()=>assert.fail('no lookup allowed');
 for(const url of ['https://example.com/login?signature=a','https://example.com/#private','https://user:secret@example.com/login','https://example.com/reset/PRIVATE_TOKEN','http://localhost/','http://127.0.0.1/login','http://192.168.1.1','https://example.internal/','https://a-private-tenant.example.com/','https://example.com/../../login','https://example.com%2flogin','https://example.com:99/login','https://www.private-tenant.example.com/login','https://example.com/login(secret)/','https://example.com/login[secret]'])assert.equal((await checkLinkReputation(url,env,{fetcher})).status,'skipped',url);
 for(const config of [{},{GUARDIAN_VIRUSTOTAL_COMMERCIAL_KEY:'secret'},{GUARDIAN_LINK_REPUTATION:'virustotal-commercial'},{...env,GUARDIAN_LINK_REPUTATION:'free'}])assert.equal(await checkLinkReputation(address,config,{fetcher}),null);
 assert.equal(await checkLinkReputation('This has no link',env,{fetcher}),null);
});
test('no results, stale, failures and malformed or wrong responses cannot authenticate a link',async()=>{
 assert.equal((await read(new Response('',{status:404}))).status,'unknown');
 const clean=await read(Response.json(report({last_analysis_stats:{malicious:0,suspicious:0,harmless:40,undetected:1}})));assert.equal(clean.status,'no_flags');assert.match(clean.note,/does not establish/);
 assert.equal((await read(Response.json(report({last_analysis_date:now/1000-8*86400})))).status,'stale');
 for(const response of [new Response(null,{status:302,headers:{Location:'https://evil.example'}}),new Response('oops',{status:429}),Response.json({data:{...report().data,id:'wrong'}}),Response.json(report({url:'https://elsewhere.com/login'})),Response.json(report({last_analysis_stats:{malicious:1}})),Response.json(report({last_analysis_date:'unexpected'})),Response.json(report({last_analysis_stats:{malicious:0,suspicious:0,harmless:0,undetected:0}}))])assert.equal((await read(response)).status,'unavailable');
});
test('stalled lookup aborts without starting a second request',async()=>{
 let reads=0;const controller=new AbortController();const reading=checkLinkReputation(address,env,{now,signal:controller.signal,fetcher:()=>{reads++;controller.abort();return new Promise(()=>{});}});
 assert.equal((await reading).status,'unavailable');assert.equal(reads,1);
});

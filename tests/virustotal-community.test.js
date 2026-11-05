import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {checkLinkReputation} from '../worker/url-reputation.js';

const now=Date.UTC(2026,10,4,12),address='https://example.com/login';
const id=createHash('sha256').update(address).digest('hex');
const key='a'.repeat(64);
const settings={GUARDIAN_LINK_REPUTATION:'virustotal-community',GUARDIAN_VIRUSTOTAL_COMMUNITY_KEY:key,GUARDIAN_GOOGLE_WEB_RISK_API_KEY:'google-test-key'};
const child=(result,provider)=>result.checks.find(check=>check.provider===provider);
function fixture(){
 const sql=new DatabaseSync(':memory:');
 sql.exec('CREATE TABLE guardian_rate_limits(bucket_key TEXT PRIMARY KEY,owner_id TEXT NOT NULL,count INTEGER NOT NULL,expires_at INTEGER NOT NULL)');
 const prepare=(query,values=[])=>({query,values,bind(...args){return prepare(query,args);}});
 const DB={prepare,async batch(statements){sql.exec('BEGIN IMMEDIATE');try{const result=statements.map(s=>({success:true,results:sql.prepare(s.query).all(...s.values)}));sql.exec('COMMIT');return result;}catch(e){sql.exec('ROLLBACK');throw e;}}};
 return {sql,env:{...settings,DB}};
}
const report=(stats={malicious:1,suspicious:0,harmless:40,undetected:2},time=now/1000-60)=>({data:{type:'url',id,attributes:{url:address,last_analysis_date:time,last_analysis_stats:stats,html_meta:{private:'MUST_NOT_APPEAR'}}}});

test('Google is checked on every eligible turn while Community GET reports obey their durable shared quota',async()=>{
 const {sql,env}=fixture();let vt=0,google=0;
 const fetcher=(url,init)=>{
  assert.equal(init.method,'GET');assert.equal(init.body,undefined);assert.equal(init.redirect,'manual');
  if(url.startsWith('https://www.virustotal.com/')){vt++;assert.equal(url,'https://www.virustotal.com/api/v3/urls/'+id);assert.equal(init.headers['x-apikey'],key);assert.equal(init.headers['x-goog-api-key'],undefined);return Response.json(report());}
  google++;assert.equal(new URL(url).searchParams.get('uri'),address);assert.equal(init.headers['x-goog-api-key'],'google-test-key');assert.equal(init.headers['x-apikey'],undefined);return Response.json({});
 };
 try{
  for(let n=0;n<4;n++){const result=await checkLinkReputation('Private case reference. '+address,env,{now,fetcher});assert.equal(result.provider,'Google Web Risk + VirusTotal');assert.equal(result.status,'flagged');assert.equal(child(result,'Google Web Risk').status,'no_flags');assert.equal(child(result,'VirusTotal').status,'flagged');assert.doesNotMatch(JSON.stringify(result),/Private case|MUST_NOT_APPEAR|google-test-key/);}
  const limited=await checkLinkReputation(address,env,{now,fetcher});assert.equal(limited.status,'no_flags');assert.equal(child(limited,'Google Web Risk').status,'no_flags');assert.equal(child(limited,'VirusTotal').status,'unavailable');assert.match(limited.note,/did not have a lookup available/);
  assert.equal(vt,4);assert.equal(google,5);
  assert.equal(sql.prepare("SELECT count FROM guardian_rate_limits WHERE bucket_key LIKE 'virustotal-community:day:%'").get().count,4);
 }finally{sql.close();}
});

test('missing durable storage or Community credential cannot cause an unmetered VirusTotal lookup',async()=>{
 for(const env of [settings,{...settings,GUARDIAN_VIRUSTOTAL_COMMUNITY_KEY:undefined},{...settings,GUARDIAN_VIRUSTOTAL_COMMUNITY_KEY:'invalid'}]){
  let calls=0;const result=await checkLinkReputation(address,env,{now,fetcher:(url)=>{calls++;assert.equal(new URL(url).hostname,'webrisk.googleapis.com');return Response.json({});}});
  assert.equal(calls,1);assert.equal(child(result,'Google Web Risk').status,'no_flags');assert.equal(child(result,'VirusTotal').status,'unavailable');
 }
});

test('excluded private links consume no Community allowance and go to neither provider',async()=>{
 const {sql,env}=fixture();try{
  for(const value of ['https://example.com/login?token=PRIVATE','https://example.com/#PRIVATE','http://127.0.0.1/','https://example.com/reset/PRIVATE']){
   const result=await checkLinkReputation(value,env,{now,fetcher:()=>assert.fail('Private URLs must remain local')});assert.equal(result.status,'skipped');
  }
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM guardian_rate_limits').get().n,0);
 }finally{sql.close();}
});

test('missing, stale and failed Community reports retain the Google warning and their own distinct finding',async()=>{
 for(const upstream of [()=>new Response('',{status:404}),()=>Response.json(report(undefined,now/1000-8*86400)),()=>new Response('',{status:429}),()=>Response.json({data:{type:'url',id:'wrong'}})]){
  const {sql,env}=fixture();try{
   let vt=0,google=0;
   const result=await checkLinkReputation(address,env,{now,fetcher:url=>{if(url.startsWith('https://www.virustotal.com/')){vt++;return upstream();}google++;return Response.json({threat:{threatTypes:['MALWARE'],expireTime:new Date(now+60000).toISOString()}});}});
   assert.equal(vt,1);assert.equal(google,1);assert.equal(result.status,'flagged');assert.equal(child(result,'Google Web Risk').status,'flagged');assert.notEqual(child(result,'VirusTotal').status,'flagged');
  }finally{sql.close();}
 }
});

test('a current clean Community report is retained separately from the Google baseline',async()=>{
 const {sql,env}=fixture();try{
  let calls=0;const result=await checkLinkReputation(address,env,{now,fetcher:url=>{calls++;return Response.json(url.startsWith('https://www.virustotal.com/')?report({malicious:0,suspicious:0,harmless:40,undetected:2}):{});}});
  assert.equal(calls,2);assert.equal(child(result,'VirusTotal').provider,'VirusTotal');assert.equal(result.status,'no_flags');assert.match(child(result,'VirusTotal').note,/does not establish.*safe/);assert.deepEqual(result.checks.map(check=>check.provider),['Google Web Risk','VirusTotal']);
 }finally{sql.close();}
});

test('an admission delayed more than five seconds never dispatches a Community lookup',async()=>{
 const {sql,env}=fixture();try{
  let tick=0,calls=0;const result=await checkLinkReputation(address,env,{now,clock:()=>tick++?5001:0,fetcher:url=>{calls++;assert.equal(new URL(url).hostname,'webrisk.googleapis.com');return Response.json({});}});
  assert.equal(calls,1);assert.equal(child(result,'Google Web Risk').status,'no_flags');assert.equal(child(result,'VirusTotal').status,'unavailable');
 }finally{sql.close();}
});

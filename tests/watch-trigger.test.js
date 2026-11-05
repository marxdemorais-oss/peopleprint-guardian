import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {handleWatchTick,signWatchTick,watchTriggerPath} from '../worker/watch-trigger.js';
const origin='https://guardian.test',target=origin+watchTriggerPath,now=1234500000,minute=Math.floor(now/60000);
const key='a1'.repeat(32);
function fixture(){
 const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE guardian_watch_trigger_ticks(slot integer primary key check(slot=1),last_minute integer not null)');
 let runs=0;
 const env={GUARDIAN_WATCH_ORIGIN:origin,GUARDIAN_WATCH_TRIGGER_KEY:key,GUARDIAN_WATCH_TRIGGER_ENABLED:'true',GUARDIAN_WATCH_ENABLED:'true',DB:{prepare:sql=>({bind:value=>({run:async()=>({meta:{changes:db.prepare(sql).run(value).changes}})})})}};
 const send=async({href=target,signedUrl=target,stamp=minute,method='POST',headers={},body=null,at=now}={})=>{
  const req=new Request(href,{method,body,headers:{'x-guardian-watch-minute':String(stamp),'x-guardian-watch-signature':await signWatchTick(key,signedUrl,stamp),...headers}});
  return handleWatchTick(req,env,async()=>{runs++;},{now:at});
 };
 return {env,send,runs:()=>runs};
}
test('signed scheduler tick accepts only the fixed operation, active switches and a current signature; replays cannot run work twice',async()=>{
 const f=fixture();assert.equal((await f.send()).status,204);assert.equal((await f.send()).status,204);assert.equal(f.runs(),1);
 assert.equal((await f.send({stamp:minute-1})).status,204);assert.equal(f.runs(),1);
 assert.equal((await f.send({stamp:minute+1,at:now+60000})).status,204);assert.equal(f.runs(),2);
 for(const [overrides,status] of [[{method:'GET'},405],[{body:'{}'},400],[{href:target+'?owner=other'},400],[{headers:{cookie:'test'}},400],[{headers:{origin}},400],[{stamp:minute-2},403],[{stamp:minute+1},403],[{signedUrl:'https://elsewhere.test'+watchTriggerPath},403],[{headers:{'x-guardian-watch-signature':'0'.repeat(64)}},403],[{href:'https://elsewhere.test'+watchTriggerPath},400]]){
  assert.equal((await f.send(overrides)).status,status);assert.equal(f.runs(),2);
 }
 for(const name of ['GUARDIAN_WATCH_ENABLED','GUARDIAN_WATCH_TRIGGER_ENABLED']){f.env[name]='false';assert.equal((await f.send()).status,404);f.env[name]='true';}assert.equal(f.runs(),2);
});

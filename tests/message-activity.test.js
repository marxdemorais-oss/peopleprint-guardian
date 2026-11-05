import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {readMessageActivity} from '../worker/message-activity.js';
import {handleAdminRequest} from '../worker/admin-service.js';
const now=Date.now(),token='fixture-activity-'.repeat(3);
function database(){
 const sqlite=new DatabaseSync(':memory:');for(const name of readdirSync(new URL('../drizzle',import.meta.url)).filter(n=>n.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
 const queries=[];const prepare=(sql,args=[])=>({bind(...next){return prepare(sql,next);},async all(){queries.push({sql,args});return {results:sqlite.prepare(sql).all(...args)};}});
 return {sqlite,prepare,queries};
}
function job(db,id,{channel='x',state='queued',created=now,expires=now+86400000,owner=null,error=null}={}){
 db.sqlite.prepare('INSERT INTO guardian_message_jobs(id,channel,event_id,sender_id,owner_id,payload_json,state,reply_text,last_error,received_at,created_at,updated_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?)').run(id,channel,'event-'+id,'PRIVATE-SENDER',owner,'{"text":"PRIVATE-MESSAGE","secret":"PRIVATE-TOKEN"}',state,'PRIVATE-REPLY',error,created,created,created,expires);
}
test('message overview needs operator authentication and never returns private content or routing identifiers',async()=>{
 const db=database();job(db,'msg1',{error:'PRIVATE-PROVIDER-BODY'});
 const request=(secret=token,actor='operator')=>new Request('https://guardian.example.test/api/internal/admin/messages',{headers:{Authorization:'Bearer '+secret,'X-Guardian-Operator':actor}});
 assert.equal((await handleAdminRequest(request('wrong'),{DB:db,GUARDIAN_ADMIN_TOKEN:token})).status,403);
 assert.equal((await handleAdminRequest(request(token,''),{DB:db,GUARDIAN_ADMIN_TOKEN:token})).status,403);
 const response=await handleAdminRequest(request(),{DB:db,GUARDIAN_ADMIN_TOKEN:token});assert.equal(response.status,200);assert.match(response.headers.get('cache-control'),/no-store/);
 const data=await response.json(),raw=JSON.stringify(data);assert.equal(data.messages[0].error,'MESSAGE_ACTION_FAILED');for(const text of ['PRIVATE-MESSAGE','PRIVATE-REPLY','PRIVATE-TOKEN','PRIVATE-SENDER','PRIVATE-PROVIDER-BODY',token,'event-msg1'])assert(!raw.includes(text));db.sqlite.close();
});
test('message pagination uses a stable snapshot and does not duplicate equal-time records or include later arrivals',async()=>{
 const db=database();for(let i=0;i<45;i++)job(db,'msg'+String(i).padStart(3,'0'));
 const first=await readMessageActivity(db,new URLSearchParams(),{now});assert.equal(first.messages.length,40);assert(first.next);
 job(db,'later',{created:now+1});
 const second=await readMessageActivity(db,new URLSearchParams({cursor:first.next}),{now:now+2});assert.equal(second.messages.length,5);assert.equal(second.next,null);
 assert.equal(new Set([...first.messages,...second.messages].map(x=>x.id)).size,45);assert(!second.messages.some(x=>x.id==='later'));db.sqlite.close();
});
test('channel and state filters stay bound to their cursor and expired or old records are excluded',async()=>{
 const db=database();for(let i=0;i<42;i++)job(db,'x'+i,{state:'uncertain'});job(db,'email',{channel:'email',state:'uncertain'});job(db,'finished',{state:'completed'});job(db,'expired',{expires:now});job(db,'too-old',{created:now-86400001});
 const first=await readMessageActivity(db,new URLSearchParams({channel:'x',state:'uncertain'}),{now});assert.equal(first.messages.length,40);assert(first.messages.every(x=>x.channel==='x'&&x.state==='uncertain'));
 await assert.rejects(readMessageActivity(db,new URLSearchParams({cursor:first.next,channel:'email',state:'uncertain'}),{now}),e=>e.status===400);
 const next=await readMessageActivity(db,new URLSearchParams({cursor:first.next,channel:'x',state:'uncertain'}),{now});assert.equal(next.messages.length,2);
 const page=await readMessageActivity(db,new URLSearchParams({state:'completed'}),{now});assert.deepEqual(page.messages.map(x=>x.id),['finished']);
 for(const query of ['channel=x&channel=email','state=anything','cursor='+encodeURIComponent(btoa('{"asOf":0}')),'cursor='+encodeURIComponent('a'.repeat(1001))])await assert.rejects(readMessageActivity(db,new URLSearchParams(query),{now}),e=>e.status===400);
 db.sqlite.close();
});
test('indexed pagination covers all filter combinations without sorting or scanning message bodies',async()=>{
 const db=database();job(db,'x1');for(const params of [{},{channel:'x'},{state:'queued'},{channel:'x',state:'queued'}]){
  await readMessageActivity(db,new URLSearchParams(params),{now});const {sql,args}=db.queries.at(-1),plan=db.sqlite.prepare('EXPLAIN QUERY PLAN '+sql).all(...args).map(x=>x.detail).join('\n');
  assert.match(plan,/USING INDEX guardian_message_activity_/);assert(!plan.includes('USE TEMP B-TREE'),plan);assert(!sql.includes('payload_json'));assert(!sql.includes('reply_text'));
 }db.sqlite.close();
});

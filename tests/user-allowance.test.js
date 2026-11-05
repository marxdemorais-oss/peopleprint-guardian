import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleAdminRequest} from '../worker/admin-service.js';
import {getTrialState,reserveTrialCheck,releaseTrialCheck,trialCommitStatement} from '../worker/trial-service.js';
const token='fixture-operator-'.repeat(3),stamp=new Date().toISOString();
function database(){const sqlite=new DatabaseSync(':memory:');for(const f of readdirSync(new URL('../drizzle',import.meta.url)).filter(f=>f.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL('../drizzle/'+f,import.meta.url),'utf8'));const prepare=(sql,v=[])=>({bind(...n){return prepare(sql,n)},async first(){return sqlite.prepare(sql).get(...v)||null},async all(){return {results:sqlite.prepare(sql).all(...v)}},async run(){return {meta:{changes:Number(sqlite.prepare(sql).run(...v).changes)}}}});return {sqlite,prepare};}
function person(db,id,complete=false){db.sqlite.prepare('INSERT INTO guardian_profiles(owner_id,id,email,display_name,created_at,updated_at,profile_completed_at) VALUES (?,?,?,?,?,?,?)').run('people:'+id,'gp_'+id,id+'@example.test',id,stamp,stamp,complete?stamp:null);}
async function call(db,{id='gp_alice',method='GET',body,auth=token,query}={}){const r=await handleAdminRequest(new Request('https://guardian.test/api/internal/admin/user-allowance?'+(query??new URLSearchParams({id})),{method,headers:{Authorization:'Bearer '+auth,'X-Guardian-Operator':'staff-one','Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})}),{DB:db,GUARDIAN_ADMIN_TOKEN:token});return {status:r.status,body:await r.json(),headers:r.headers};}
const set=(db,allowance,revision,id='gp_alice')=>call(db,{id,method:'PUT',body:{allowance,revision}});
function consumed(db,owner,check='used-case',at=stamp){db.sqlite.prepare('INSERT INTO guardian_trial_usage(owner_id,check_id,consumed_at,reserved_until) VALUES (?,?,?,0)').run('people:'+owner,check,at);}
test('per-user allowances are scoped, default to one starter or five monthly, and strict input never changes another profile',async()=>{const db=database();person(db,'alice');person(db,'bob',true);assert.equal((await call(db)).body.allowance,1);assert.equal((await call(db,{id:'gp_bob'})).body.allowance,5);assert.equal((await call(db,{auth:'invalid'})).status,403);assert.equal((await call(db,{id:'missing'})).status,404);for(const body of [{allowance:-1,revision:0},{allowance:1001,revision:0},{allowance:'10',revision:0},{allowance:2.5,revision:0},{allowance:2,revision:-1},{allowance:2,revision:0,owner:'bob'},{revision:0}])assert.equal((await call(db,{method:'PUT',body})).status,400);for(const query of ['id=gp_alice&id=gp_bob','id=gp_alice&owner=people:bob'])assert.equal((await call(db,{query})).status,400);assert.equal(db.sqlite.prepare('SELECT allowance_revision FROM guardian_profiles WHERE id=?').get('gp_bob').allowance_revision,0);db.sqlite.close();});
test('changing the total keeps usage, accepts zero and refuses stale saves without resetting counts',async()=>{const db=database();person(db,'alice');person(db,'bob');consumed(db,'alice');let saved=await set(db,5,0);assert.equal(saved.status,200);assert.equal(saved.body.allowance,5);assert.equal(saved.body.used,1);assert.equal(saved.body.remaining,4);assert.equal(saved.body.revision,1);assert.equal((await set(db,10,0)).status,409);saved=await set(db,0,1);assert.equal(saved.body.used,1);assert.equal(saved.body.remaining,0);assert.equal((await call(db,{id:'gp_bob'})).body.allowance,1);assert.equal(db.sqlite.prepare('SELECT allowance_updated_by FROM guardian_profiles WHERE id=?').get('gp_alice').allowance_updated_by,'staff-one');assert.match(saved.headers.get('cache-control'),/no-store/);saved=await set(db,null,2);assert.equal(saved.body.allowance,1);assert.equal(saved.body.override,null);assert.equal(saved.body.used,1);db.sqlite.close();});
test('the live override controls atomic reservations, same-case follow-ups and unlimited entitlements',async()=>{const db=database();person(db,'alice');await set(db,2,0);consumed(db,'alice');const first=await reserveTrialCheck(db,'people:alice','final',Date.now());await assert.rejects(reserveTrialCheck(db,'people:alice','other',Date.now()),/in progress/);await releaseTrialCheck(db,'people:alice','final',first);await set(db,0,1);await assert.rejects(reserveTrialCheck(db,'people:alice','new',Date.now()),e=>e.code==='TRIAL_EXHAUSTED');const follow=await reserveTrialCheck(db,'people:alice','used-case',Date.now());await releaseTrialCheck(db,'people:alice','used-case',follow);const unlimited=await reserveTrialCheck(db,'people:alice','unlimited',Date.now(),{unlimited:true});assert(unlimited);const state=await getTrialState(db,'people:alice',Date.now(),{unlimited:true});assert.equal(state.allowance,null);assert.equal(state.remaining,null);await releaseTrialCheck(db,'people:alice','unlimited',unlimited);db.sqlite.close();});
test('profile completion leaves explicit allowance intact and restoration resumes the current default',async()=>{const db=database();person(db,'alice');await set(db,7,0);db.sqlite.prepare('UPDATE guardian_profiles SET profile_completed_at=? WHERE id=?').run(stamp,'gp_alice');assert.equal((await getTrialState(db,'people:alice')).allowance,7);await set(db,null,1);assert.equal((await getTrialState(db,'people:alice')).allowance,5);const overview=await handleAdminRequest(new Request('https://guardian.test/api/internal/admin/customers',{headers:{Authorization:'Bearer '+token,'X-Guardian-Operator':'staff-one'}}),{DB:db,GUARDIAN_ADMIN_TOKEN:token});const data=await overview.json();assert.equal(data.customers[0].allowance,5);assert.equal(data.customers[0].remaining,5);db.sqlite.close();});

test('a starter never renews; profile completion counts only the current UTC month, including a leap day', async()=>{
 const db=database();person(db,'alice');person(db,'bob');
 const last=Date.parse('2028-02-29T23:59:59.999Z'),next=last+1,owner='people:alice';
 consumed(db,'alice','starter',new Date(last).toISOString());consumed(db,'bob','other-owner',new Date(next).toISOString());
 assert.equal((await getTrialState(db,owner,next)).remaining,0);
 await assert.rejects(reserveTrialCheck(db,owner,'second',next),e=>e.code==='PROFILE_REQUIRED');
 db.sqlite.prepare('UPDATE guardian_profiles SET profile_completed_at=? WHERE owner_id=?').run(new Date(last).toISOString(),owner);
 assert.equal((await getTrialState(db,owner,last)).remaining,4);
 const march=await getTrialState(db,owner,next);assert.equal(march.remaining,5);assert.equal(march.resetsAt,'2028-04-01T00:00:00.000Z');
 await set(db,2,0);const override=await getTrialState(db,owner,next);assert.equal(override.used,1);assert.equal(override.period,'lifetime');assert.equal(override.resetsAt,null);
 await set(db,null,1);assert.equal((await getTrialState(db,owner,next)).remaining,5);
 db.sqlite.close();
});

test('a live last-slot reservation spans New Year, charges only the completion month, and follow-ups never move the charge',async()=>{
 const db=database();person(db,'alice',true);const owner='people:alice',last=Date.parse('2026-12-31T23:59:58.000Z'),next=Date.parse('2027-01-01T00:00:00.000Z');
 for(let n=0;n<4;n++)consumed(db,'alice','dec-'+n,new Date(last).toISOString());
 const both=await Promise.allSettled(['A','B'].map(id=>reserveTrialCheck(db,owner,id,last)));
 assert.equal(both.filter(x=>x.status==='fulfilled').length,1);assert.equal(both.find(x=>x.status==='rejected').reason.code,'CHECK_IN_PROGRESS');
 const index=both.findIndex(x=>x.status==='fulfilled'),id=['A','B'][index],token=both[index].value;
 const fresh=await getTrialState(db,owner,next);assert.equal(fresh.used,0);assert.equal(fresh.reserved,1);
 for(let n=0;n<4;n++)await reserveTrialCheck(db,owner,'jan-'+n,next);
 await assert.rejects(reserveTrialCheck(db,owner,'one-too-many',next),e=>e.code==='CHECK_IN_PROGRESS');
 const finish=new Date(next+1).toISOString();
 db.sqlite.prepare("INSERT INTO guardian_checks(id,owner_id,message,channel,evidence_json,preferences_json,status,replies_json,revision,created_at,updated_at,expires_at,assessment_token) VALUES(?,?,'unchanged','other','[]','{}','complete','[]',1,?,?,'',?)").run(id,owner,finish,finish,token);
 await trialCommitStatement(db,owner,id,token,{consume:true,now:finish,revision:1}).run();
 assert.equal((await getTrialState(db,owner,next+2)).used,1);assert.equal((await getTrialState(db,owner,last)).used,4);
 const feb=Date.parse('2027-02-01T00:00:00.000Z'),again=await reserveTrialCheck(db,owner,id,feb);
 db.sqlite.prepare('UPDATE guardian_checks SET assessment_token=?,revision=2 WHERE id=?').run(again,id);
 await trialCommitStatement(db,owner,id,again,{consume:true,now:new Date(feb+1).toISOString(),revision:2}).run();
 assert.equal((await getTrialState(db,owner,feb+1)).used,0);
 assert.equal(db.sqlite.prepare('SELECT consumed_at FROM guardian_trial_usage WHERE owner_id=? AND check_id=?').get(owner,id).consumed_at,finish);
 db.sqlite.close();
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handlePeopleAuthRequest} from '../worker/people-auth.js';
import {mergeCandidate,mergeVerifiedLogins,MergeConflict,retiredLogin} from '../worker/merge-logins.js';

const old='legacy-id',email='member@example.test',user={ownerId:'people:canonical',peopleOrganisedId:'canonical',email};
const origin='https://guardian.example.test';
const req=(path='/',body,cookie='')=>new Request(origin+path,{method:body?'POST':'GET',headers:{origin,'content-type':'application/json',cookie,'oai-authenticated-user-id':old,'oai-authenticated-user-email':email},...(body?{body:JSON.stringify(body)}:{})});
function fixture(){
 const sql=new DatabaseSync(':memory:');
 const dir=new URL('../drizzle/',import.meta.url);
 for(const name of readdirSync(dir).filter(n=>n.endsWith('.sql')).sort())sql.exec(readFileSync(new URL(name,dir),'utf8'));
 const prepare=(query,params=[])=>({bind(...args){return prepare(query,args);},async first(){return sql.prepare(query).get(...params);},run(){return {meta:{changes:sql.prepare(query).run(...params).changes}};}});
 const db={prepare,async batch(statements){sql.exec('BEGIN');try{const result=statements.map(s=>s.run());sql.exec('COMMIT');return result;}catch(error){sql.exec('ROLLBACK');throw error;}}};
 const profile=sql.prepare("INSERT INTO guardian_profiles(owner_id,id,email,display_name,created_at,updated_at,free_check_allowance) VALUES(?,?,?,'member','then','now',?)");
 profile.run(old,'p1',email,100);profile.run(user.ownerId,'p2',email,null);
 return {sql,db,env:{DB:db,GUARDIAN_IDENTITY_SECRET:'a'.repeat(64)}};
}

test('two independent proofs merge completed checks, receipts and allowance without touching canonical credentials',async()=>{
 const {db,sql,env}=fixture();
 sql.prepare("INSERT INTO guardian_checks(id,owner_id,message,channel,evidence_json,preferences_json,status,created_at,updated_at,expires_at,assessment_token) VALUES ('check1',?,'example','web','[]','{}','complete','then','now','later','receipt')").run(old);
 sql.prepare("INSERT INTO guardian_trial_usage(owner_id,check_id,consumed_at) VALUES (?,'check1','then')").run(old);
 sql.prepare("INSERT INTO guardian_connection_tokens(owner_id,provider,encrypted_token,updated_at) VALUES (?,'gmail','canonical ciphertext','then')").run(user.ownerId);
 const rate=sql.prepare('INSERT INTO guardian_rate_limits(bucket_key,owner_id,count,expires_at) VALUES (?,?,?,?)');
 rate.run(old+':day:123',old,12,Date.now()+60000);rate.run(user.ownerId+':day:123',user.ownerId,6,Date.now()+60000);
 assert.deepEqual(await mergeCandidate(req(),db,user),{email});
 const challengeId='abcdef12-abcd-1234-1234-123456789012';
 const requestCode=await handlePeopleAuthRequest(req('/api/auth/request-code',{email,linkPrevious:true}),env,{fetcher:async()=>Response.json({challengeId})});
 assert.equal(requestCode.status,200);
 const cookie=requestCode.headers.get('set-cookie').split(';')[0];
 assert.ok(cookie.endsWith('.merge'));
 const verify=await handlePeopleAuthRequest(req('/api/auth/verify',{email,linkPrevious:true,code:'123456'},cookie),env,{fetcher:async()=>Response.json({identity:{id:'canonical',email},token:'b'.repeat(64)})});
 assert.equal(verify.status,200);
 assert.equal(sql.prepare('SELECT count(*) AS n FROM guardian_profiles').get().n,1);
 assert.deepEqual({...sql.prepare('SELECT id,free_check_allowance FROM guardian_profiles').get()},{id:'p2',free_check_allowance:100});
 for(const table of ['guardian_checks','guardian_trial_usage','guardian_connection_tokens'])assert.equal(sql.prepare('SELECT owner_id FROM '+table).get().owner_id,user.ownerId);
 assert.equal(sql.prepare('SELECT encrypted_token FROM guardian_connection_tokens').get().encrypted_token,'canonical ciphertext');
 assert.equal(sql.prepare('SELECT count FROM guardian_rate_limits WHERE bucket_key=?').get(user.ownerId+':day:123').count,18);
 assert.ok(await retiredLogin(db,old));
 assert.throws(()=>sql.prepare("INSERT INTO guardian_profiles(owner_id,id,email,display_name,created_at,updated_at) VALUES(?,'p3',?,'Test','then','now')").run(old,email),/moved/);
 await mergeVerifiedLogins(req(),db,user);
 assert.equal(await mergeCandidate(req(),db,user),null);
 sql.close();
});

test('prior login access and a new, purpose-specific code are both required',async()=>{
 const {db,sql,env}=fixture();
 for(const [header,value] of [['oai-authenticated-user-id','another-old-id'],['oai-authenticated-user-email','another@example.test'],['oai-authenticated-user-id','people:canonical']]){
  const request=req();request.headers.set(header,value);
  assert.equal(await mergeCandidate(request,db,user),null);
  await assert.rejects(()=>mergeVerifiedLogins(request,db,user),MergeConflict);
 }
 const verify=req('/api/auth/verify',{email,linkPrevious:true,code:'123456'},'__Host-wolfgang_flow='+'a'.repeat(64)+'.abcdef12-abcd-1234-1234-123456789012');
 const response=await handlePeopleAuthRequest(verify,env,{fetcher:()=>{throw new Error('must not request');}});
 assert.equal(response.status,400);
 const rejected=await handlePeopleAuthRequest(req('/api/auth/verify',{email,linkPrevious:true,code:'999999'},verify.headers.get('cookie')+'.merge'),env,{fetcher:async()=>Response.json({error:'Invalid code'},{status:403})});
 assert.equal(rejected.status,403);
 assert.equal(sql.prepare('SELECT count(*) AS n FROM guardian_profiles').get().n,2);
 assert.equal(await retiredLogin(db,old),undefined);
 sql.close();
});

test('source credentials and active reservations block all changes; explicit destination allowance is retained',async()=>{
 const {db,sql}=fixture();
 sql.prepare("INSERT INTO guardian_connection_tokens(owner_id,provider,encrypted_token,updated_at) VALUES (?,'outlook','old ciphertext','then')").run(old);
 await assert.rejects(()=>mergeVerifiedLogins(req(),db,user),MergeConflict);
 assert.equal(sql.prepare('SELECT count(*) AS n FROM guardian_profiles').get().n,2);
 sql.exec('DELETE FROM guardian_connection_tokens');
 sql.prepare('INSERT INTO guardian_trial_usage(owner_id,check_id,reserved_until) VALUES(?,?,?)').run(old,'pending',Date.now()+100000);
 await assert.rejects(()=>mergeVerifiedLogins(req(),db,user),MergeConflict);
 sql.exec('DELETE FROM guardian_trial_usage');
 sql.prepare('UPDATE guardian_profiles SET free_check_allowance=0 WHERE owner_id=?').run(user.ownerId);
 await mergeVerifiedLogins(req(),db,user);
 assert.equal(sql.prepare('SELECT free_check_allowance FROM guardian_profiles').get().free_check_allowance,0);
 sql.close();
});

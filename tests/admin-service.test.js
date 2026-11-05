import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {handleAdminRequest} from '../worker/admin-service.js';
import {currentGuide,ORIGINAL_GUIDE,writingStyle} from '../worker/wolfgang-guide.js';
const token='test-admin-service-secret-'.repeat(3),now=new Date().toISOString(),future='2099-01-01T00:00:00.000Z';
function database(){
 const sqlite=new DatabaseSync(':memory:');for(const name of readdirSync(new URL('../drizzle',import.meta.url)).filter(name=>name.endsWith('.sql')).sort())sqlite.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
 const statement=(sql,values=[])=>({bind(...next){return statement(sql,next);},async first(){return sqlite.prepare(sql).get(...values)||null;},async all(){return{results:sqlite.prepare(sql).all(...values)};},async run(){return{meta:{changes:Number(sqlite.prepare(sql).run(...values).changes)}};}});
 return {sqlite,prepare:statement};
}
function person(db,id,created=now){db.sqlite.prepare('INSERT INTO guardian_profiles(owner_id,id,email,display_name,onboarding_complete,memory_enabled,created_at,updated_at) VALUES(?,?,?,?,1,1,?,?)').run('people:'+id,'gp_'+id,id+'@example.test','Person '+id,created,created);}
function check(db,id,owner,expires=future){db.sqlite.prepare("INSERT INTO guardian_checks(id,owner_id,message,channel,evidence_json,preferences_json,status,replies_json,remember,revision,created_at,updated_at,expires_at) VALUES(?,?,'PRIVATE MESSAGE','email','[]','{}','complete','[]',1,0,?,?,?)").run(id,'people:'+owner,now,now,expires);}
async function call(db,path,options={}){const response=await handleAdminRequest(new Request('https://guardian.example.test'+path,{method:options.method||'GET',headers:{Authorization:'Bearer '+(options.token??token),'X-Guardian-Operator':options.actor??'operator-1'}}),{DB:db,GUARDIAN_ADMIN_TOKEN:token,...options.env});return{status:response.status,headers:response.headers,data:await response.json()};}

test('admin read bridge fails closed without secret or validated operator channel',async()=>{const db=database();person(db,'a');assert.equal((await call(db,'/api/internal/admin/customers',{token:'wrong'})).status,403);assert.equal((await call(db,'/api/internal/admin/customers',{actor:''})).status,403);assert.equal((await call(db,'/api/internal/admin/customers',{env:{GUARDIAN_ADMIN_TOKEN:''}})).status,403);assert.equal((await call(db,'/api/internal/admin/customers',{method:'POST'})).status,405);db.sqlite.close();});
test('canonical account cursors paginate without duplication and overview contains no message contents or secrets',async()=>{const db=database();for(let index=0;index<43;index++)person(db,'user-'+String(index).padStart(2,'0'));check(db,'case1','user-42');const first=await call(db,'/api/internal/admin/customers');assert.equal(first.status,200);assert.equal(first.data.customers.length,40);assert.ok(first.data.next);const second=await call(db,'/api/internal/admin/customers?cursor='+encodeURIComponent(first.data.next));assert.equal(second.status,200);assert.equal(second.data.customers.length,3);assert.equal(second.data.next,null);assert.equal(new Set([...first.data.customers,...second.data.customers].map(item=>item.id)).size,43);assert.equal(first.data.customers[0].peopleOrganisedId,'user-42');assert.ok(!JSON.stringify(first.data).includes('PRIVATE MESSAGE'));assert.ok(!JSON.stringify(first.data).includes(token));assert.equal(first.data.cost.measured,false);assert.equal(first.data.cost.value,null);assert.match(first.headers.get('cache-control'),/no-store/);db.sqlite.close();});
test('customer detail scopes checks, connections, context sources and usage to canonical owner',async()=>{const db=database();person(db,'alice');person(db,'bob');check(db,'case-alice','alice');check(db,'case-bob','bob');check(db,'expired','alice','2000-01-01T00:00:00.000Z');
 for(const owner of ['alice','bob']){db.sqlite.prepare('INSERT INTO guardian_connections(owner_id,provider,status,updated_at) VALUES(?,?,?,?)').run('people:'+owner,owner==='alice'?'gmail':'outlook','connected',now);db.sqlite.prepare('INSERT INTO guardian_context_records(id,owner_id,source_check_id,source_evidence_id,source,text,search_text,provenance,created_at,expires_at) VALUES(?,?,?,?,?,?,?,?,?,?)').run('record-'+owner,'people:'+owner,'case-'+owner,'ev-1',owner+' source',owner+' private evidence','context','user_supplied_record',now,future);db.sqlite.prepare('INSERT INTO guardian_context_links(owner_id,check_id,context_record_id,relation,reason,status,created_at,expires_at) VALUES(?,?,?,?,?,?,?,?)').run('people:'+owner,'case-'+owner,'record-'+owner,'cited_in_assessment','Evidence cited','inferred',now,future);db.sqlite.prepare('INSERT INTO guardian_analysis_usage(id,owner_id,check_id,provider,model,input_tokens,output_tokens,outcome,created_at) VALUES(?,?,?,?,?,?,?,?,?)').run('usage-'+owner,'people:'+owner,'case-'+owner,'meta','test-model',owner==='alice'?10:9999,5,'complete',now);}
 // Even a corrupted cross-owner association cannot expose the other person's source.
 db.sqlite.prepare('INSERT INTO guardian_context_links(owner_id,check_id,context_record_id,relation,reason,status,created_at,expires_at) VALUES(?,?,?,?,?,?,?,?)').run('people:alice','case-alice','record-bob','cited_in_assessment','Corrupt foreign reference','inferred',now,future);
 const result=await call(db,'/api/internal/admin/customer?id=gp_alice');assert.equal(result.status,200);assert.equal(result.data.customer.peopleOrganisedId,'alice');assert.equal(result.data.connections.length,1);assert.equal(result.data.connections[0].provider,'gmail');assert.equal(result.data.checks.length,1);assert.equal(result.data.relationships.length,1);assert.equal(result.data.relationships[0].confirmed,false);assert.equal(result.data.usage.inputTokens,10);assert.equal(result.data.usage.successful,1);assert.ok(!JSON.stringify(result.data).includes('bob'));assert.ok(!JSON.stringify(result.data).includes('PRIVATE MESSAGE'));db.sqlite.close();});
test('email lookup is exact, pagination parameters bounded, expired counts excluded',async()=>{const db=database();person(db,'alice');person(db,'malice');check(db,'expired','alice','2000-01-01T00:00:00.000Z');const result=await call(db,'/api/internal/admin/customers?email=ALICE%40example.test');assert.equal(result.data.customers.length,1);assert.equal(result.data.customers[0].checks,0);assert.equal((await call(db,'/api/internal/admin/customers?email=alice')).status,400);assert.equal((await call(db,'/api/internal/admin/customers?cursor='+encodeURIComponent(btoa(JSON.stringify({ownerId:"' OR 1=1",createdAt:now}))))).status,400);assert.equal((await call(db,'/api/internal/admin/customer?id=gp_missing')).status,404);db.sqlite.close();});

test('guide drafts remain private until published; conflicting publication and stale restores are rejected',async()=>{
 const db=database(),path='/api/internal/admin/wolfgang-guide';
 const send=async(value,credential=token)=>handleAdminRequest(new Request('https://example.test'+path,{method:'PUT',headers:{Authorization:'Bearer '+credential,'X-Guardian-Operator':'staff-1','Content-Type':'application/json'},body:JSON.stringify(value)}),{DB:db,GUARDIAN_ADMIN_TOKEN:token});
 const initial=(await call(db,path)).data,original=initial.live;
 assert.match(original.body,/Avoid em dashes/);
 const body='Brief, clear answers about what Wolfgang can do.';
 const base=original.id;assert.match(original.body,/dry British wit/);
 const first={action:'draft',base,body};
 assert.equal((await send(first,'wrong')).status,403);
 const draft=(await (await send(first)).json()).id;
 assert.deepEqual((await call(db,path)).data.live,original);
 assert.equal((await send({action:'publish',base,draft,confirm:false})).status,400);
 const publish={action:'publish',base,draft,confirm:true};
 const id=(await (await send(publish)).json()).id;
 assert.equal((await call(db,path)).data.live.body,body);
 assert.equal((await send(publish)).status,409);
 const old=(await call(db,path+'?id='+base)).data.selected;
 const restoring=(await (await send({action:'draft',body:old.body,base:id})).json()).id;
 assert.equal((await send({action:'publish',base:id,draft:restoring,confirm:true})).status,200);
 const state=(await call(db,path)).data;assert.equal(state.live.body,original.body);assert.equal(state.history.length,initial.history.length+4);
 db.sqlite.close();
});

test('the sales edition preserves custom paragraphs and historical versions within the editor size limit',async()=>{
 const db=database(),sql=db.sqlite;
 const migration=readFileSync(new URL('../drizzle/0016_wolfgang_sales_voice.sql',import.meta.url),'utf8');
 const latest=()=>sql.prepare("SELECT id,base,body FROM guardian_voice_editions WHERE kind='published' ORDER BY id DESC LIMIT 1").get();
 const release=latest();
 const previous=sql.prepare('SELECT body FROM guardian_voice_editions WHERE id=?').get(release.base).body;
 assert.match(release.body,/give a direct yes/);
 assert.match(release.body,/fresh point or a different example/);
 const restored=(await call(db,'/api/internal/admin/wolfgang-guide?id=0')).data.selected;
 assert.equal(restored.body,ORIGINAL_GUIDE);
 const offline=await currentGuide();
 for(const guide of [release,offline]){
  assert.match(guide.body,/A thank-you can simply end the exchange/);
  assert.match(guide.body,/If they change subject, follow them/);
  assert.match(guide.body,/Ask one focused question only when the answer would make a difference/);
  assert.match(guide.body,/If a new detail changes your advice, say how/);
  assert.match(guide.body,/recovery step first/);
  assert.doesNotMatch(guide.body,/Want a hand checking/);
  assert.doesNotMatch(writingStyle(guide),/sell|invitation|better|advantage/i);
 }
 assert.match(offline.body,/On a follow-up, add a fresh fact/);
 assert.doesNotMatch(offline.body,/Give one concrete example, such as an invoice/);

 const publishStaffCopy=body=>sql.prepare("INSERT INTO guardian_voice_editions(kind,body,base,actor,created) VALUES('published',?,?,'staff',?)").run(body,latest().id,now);
 const customComparison='Our editorial team chooses the comparison example.';
 publishStaffCopy(previous.replace(/(What makes Wolfgang different\n)[^\n]+/, '$1'+customComparison));
 const before=latest();
 sql.exec(migration);
 const revised=latest();
 assert.equal(revised.base,before.id);
 assert.ok(revised.body.includes(customComparison));
 assert.match(revised.body,/one useful detail/);
 assert.equal(sql.prepare('SELECT body FROM guardian_voice_editions WHERE id=?').get(before.id).body,before.body);
 sql.exec(migration);
 assert.equal(latest().id,revised.id);

 const staffRisk=previous.replace(/Advise leaving it unanswered\./,'Recommend our established public-figure verification procedure.');
 publishStaffCopy(staffRisk);
 sql.exec(migration);
 assert.match(latest().body,/established public-figure verification procedure/);

 publishStaffCopy(previous+'x'.repeat(4500-Buffer.byteLength(previous)));
 const full=latest();
 sql.exec(migration);
 assert.equal(latest().id,full.id);
 sql.close();
});

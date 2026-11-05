import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {syncContextRecords,retrieveContext,contextLinkStatements,readContextRelationships} from '../worker/context-memory.js';

function database(){
 const sql=new DatabaseSync(':memory:');
 for(const name of ['0000_guardian_product.sql','0001_guardian_trial_context.sql'])sql.exec(readFileSync(new URL('../drizzle/'+name,import.meta.url),'utf8'));
 const wrap=(statement,args=[])=>({bind(...values){return wrap(statement,values);},async first(){return sql.prepare(statement).get(...args)||null;},async all(){return {results:sql.prepare(statement).all(...args)};},async run(){return {meta:{changes:Number(sql.prepare(statement).run(...args).changes)}};}});
 return {sql,prepare:statement=>wrap(statement),async batch(statements){sql.exec('BEGIN');try{const results=[];for(const statement of statements)results.push(await statement.run());sql.exec('COMMIT');return results;}catch(error){sql.exec('ROLLBACK');throw error;}}};
}
const now=new Date().toISOString(),future=new Date(Date.now()+86400000).toISOString(),past=new Date(Date.now()-86400000).toISOString();
function profile(db,owner,enabled=true){db.sql.prepare('INSERT INTO guardian_profiles (owner_id,id,email,display_name,memory_enabled,created_at,updated_at) VALUES (?,?,?,?,?,?,?)').run(owner,'profile-'+owner,owner+'@example.test',owner,Number(enabled),now,now);}
function check(db,owner,id,{message='RedFrog reception catering request',remember=true,evidence=[],expires=future}={}){
 db.sql.prepare('INSERT INTO guardian_checks (owner_id,id,message,channel,evidence_json,preferences_json,remember,created_at,updated_at,expires_at) VALUES (?,?,?,?,?,?,?,?,?,?)').run(owner,id,message,'email',JSON.stringify(evidence),'{}',Number(remember),now,now,expires);
 return db.sql.prepare('SELECT * FROM guardian_checks WHERE id=?').get(id);
}

test('context retrieval includes only relevant remembered records of the authenticated owner with traceable unconfirmed provenance',async()=>{
 const db=database();profile(db,'alice');profile(db,'bob');
 const earlier=check(db,'alice','source',{evidence:[{id:'ev-agreement',source:'RedFrog reception agreement',text:'The venue includes catering in the agreed booking.'}]}),other=check(db,'bob','other',{message:'RedFrog reception Bob private booking'}),current=check(db,'alice','current');
 await syncContextRecords(db,'alice',earlier);await syncContextRecords(db,'bob',other);
 const found=await retrieveContext(db,'alice',current);
 assert(found.length>0);assert(found.every(record=>record.sourceCheckId==='source'&&record.confirmed===false&&record.excerpt));assert(found.some(record=>record.sourceEvidenceId==='ev-agreement'&&record.provenance==='user_supplied_record'));assert(!JSON.stringify(found).includes('Bob private'));assert(found.every(record=>record.retrievalReason.includes('possible connection, not confirmation')));
 await assert.rejects(syncContextRecords(db,'alice',other),/authenticated owner/);assert.deepEqual(await retrieveContext(db,'alice',other),[]);
 await db.batch(contextLinkStatements(db,'alice','current',found,{evidenceIds:[found[0].id],explanation:'The saved source may explain this request.'},now,future));
 const links=await readContextRelationships(db,'alice');assert(links.every(link=>link.status==='inferred'&&link.confirmed===false&&!('excerpt' in link)));assert.deepEqual(await readContextRelationships(db,'bob'),[]);
 assert((await readContextRelationships(db,'alice',{includeExcerpts:true})).some(link=>typeof link.excerpt==='string'));db.sql.close();
});

test('context matching uses complete terms rather than substrings and excludes current, temporary and expired sources',async()=>{
 const db=database();profile(db,'alice');
 const current=check(db,'alice','current',{message:'Cater reception'});
 for(const [id,options] of [['substring',{message:'Catering receptionist'}],['temporary',{message:'Cater reception',remember:false}],['expired',{message:'Cater reception',expires:past}]])await syncContextRecords(db,'alice',check(db,'alice',id,options));
 await syncContextRecords(db,'alice',current);assert.deepEqual(await retrieveContext(db,'alice',current),[]);
 const relevant=check(db,'alice','relevant',{message:'Cater the reception'});await syncContextRecords(db,'alice',relevant);
 assert.deepEqual((await retrieveContext(db,'alice',current)).map(record=>record.sourceCheckId),['relevant']);db.sql.close();
});

test('memory write rechecks consent and source revision inside its transaction',async()=>{
 for(const mutation of ["UPDATE guardian_profiles SET memory_enabled=0 WHERE owner_id='alice'","UPDATE guardian_checks SET remember=0 WHERE id='source'","UPDATE guardian_checks SET revision=revision+1,message='Changed private source' WHERE id='source'","DELETE FROM guardian_checks WHERE id='source'"]){
  const db=database();profile(db,'alice');const source=check(db,'alice','source');const originalBatch=db.batch.bind(db);
  db.batch=async statements=>{db.sql.exec(mutation);return originalBatch(statements);};
  await syncContextRecords(db,'alice',source,{memoryEnabled:true});assert.equal(db.sql.prepare('SELECT count(*) n FROM guardian_context_records').get().n,0,mutation);db.sql.close();
 }
});

test('retention and consent are rechecked at retrieval even before stale indexes are cleaned',async()=>{
 for(const mutation of ["UPDATE guardian_profiles SET memory_enabled=0 WHERE owner_id='alice'","UPDATE guardian_checks SET remember=0 WHERE id='source'","UPDATE guardian_checks SET expires_at='2000-01-01T00:00:00Z' WHERE id='source'","DELETE FROM guardian_checks WHERE id='source'"]){
  const db=database();profile(db,'alice');const source=check(db,'alice','source'),current=check(db,'alice','current');await syncContextRecords(db,'alice',source);
  const found=await retrieveContext(db,'alice',current);assert(found.length);await db.batch(contextLinkStatements(db,'alice','current',found,{evidenceIds:[],explanation:''},now,future));
  db.sql.exec(mutation);assert.deepEqual(await retrieveContext(db,'alice',current),[],mutation);assert.deepEqual(await readContextRelationships(db,'alice'),[],mutation);db.sql.close();
 }
});

test('context relationships cannot cite another owner record, survive opt-out or outlive their own expiry',async()=>{
 const db=database();profile(db,'alice');profile(db,'bob');const source=check(db,'bob','private-source'),current=check(db,'alice','current');await syncContextRecords(db,'bob',source);
 const record=db.sql.prepare('SELECT * FROM guardian_context_records').get();
 await db.batch(contextLinkStatements(db,'alice',current.id,[{id:record.id,expiresAt:future,retrievalReason:'Forged link'}],{evidenceIds:[record.id],explanation:'Forged attribution'},now,future));
 assert.equal(db.sql.prepare('SELECT count(*) n FROM guardian_context_links').get().n,0);
 const ownSource=check(db,'alice','own-source');await syncContextRecords(db,'alice',ownSource);const own=await retrieveContext(db,'alice',current);await db.batch(contextLinkStatements(db,'alice',current.id,own,{evidenceIds:[],explanation:''},now,past));
 assert.deepEqual(await readContextRelationships(db,'alice'),[]);
 db.sql.exec("UPDATE guardian_profiles SET memory_enabled=0 WHERE owner_id='alice'");await db.batch(contextLinkStatements(db,'alice',current.id,own,{evidenceIds:[],explanation:''},now,future));assert.equal(db.sql.prepare("SELECT count(*) n FROM guardian_context_links WHERE owner_id='alice'").get().n,0);db.sql.close();
});

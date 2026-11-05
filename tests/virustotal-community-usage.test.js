import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {reserveVirusTotalCommunityUsage} from '../worker/virustotal-community-usage.js';

const DAY=86400000,WINDOW=68000,start=Date.UTC(2026,10,4);
function fixture({failAt}={}){
 const sql=new DatabaseSync(':memory:');
 sql.exec('CREATE TABLE guardian_rate_limits(bucket_key TEXT PRIMARY KEY,owner_id TEXT NOT NULL,count INTEGER NOT NULL,expires_at INTEGER NOT NULL)');
 const prepare=(query,values=[])=>({query,values,bind(...args){return prepare(query,args);}});
 const DB={prepare,async batch(statements){
  sql.exec('BEGIN IMMEDIATE');
  try{
   const rows=statements.map((s,index)=>{
    if(index===failAt)throw new Error('simulated transactional failure');
    return {success:true,results:sql.prepare(s.query).all(...s.values)};
   });
   sql.exec('COMMIT');return rows;
  }catch(error){sql.exec('ROLLBACK');throw error;}
 }};
 return {sql,DB};
}
const attempt=(DB,now,id)=>reserveVirusTotalCommunityUsage({DB},{now,id});
const dailyKey=now=>'virustotal-community:day:'+Math.floor(now/DAY);
const dailyCount=(sql,now)=>sql.prepare('SELECT count FROM guardian_rate_limits WHERE bucket_key=?').get(dailyKey(now))?.count||0;

test('four concurrent Community reservations pass and further isolates share the rolling ceiling',async()=>{
 const {sql,DB}=fixture();
 try{
  const rows=await Promise.all(Array.from({length:20},(_,n)=>attempt({...DB},start,'burst-'+n)));
  assert.equal(rows.filter(r=>r.allowed).length,4);assert.equal(dailyCount(sql,start),4);
  assert(rows.filter(r=>!r.allowed).every(r=>r.reason==='limit'));
  assert.deepEqual(await attempt(DB,start+59999,'later'),{allowed:false,reason:'limit'});
  assert.deepEqual(await attempt(DB,start+WINDOW-1,'almost'),{allowed:false,reason:'limit'});
  assert.deepEqual(await attempt(DB,start+WINDOW,'next'),{allowed:true,reservedAt:start+WINDOW});
  assert.equal(dailyCount(sql,start),5);
 }finally{sql.close();}
});

test('500 daily calls are admitted globally; denied calls do not change counters',async()=>{
 const {sql,DB}=fixture();
 try{
  for(let n=0;n<500;n++)assert.equal((await attempt(DB,start+Math.floor(n/4)*WINDOW,'day-'+n)).allowed,true);
  assert.equal(dailyCount(sql,start),500);
  const total=sql.prepare('SELECT COUNT(*) n FROM guardian_rate_limits').get().n;
  assert.deepEqual(await attempt(DB,start+200*WINDOW,'exhausted'),{allowed:false,reason:'limit'});
  assert.equal(dailyCount(sql,start),500);assert.equal(sql.prepare('SELECT COUNT(*) n FROM guardian_rate_limits').get().n,total);
 }finally{sql.close();}
});

test('UTC rollover resets the day allowance while preserving reservations across midnight',async()=>{
 const {sql,DB}=fixture(),late=start+DAY-10000;
 try{
  // A previously used day leaves its last four calls just before midnight.
  sql.prepare('INSERT INTO guardian_rate_limits VALUES (?, ?, ?, ?)').run(dailyKey(start),'service:virustotal-community',496,start+DAY+WINDOW);
  for(let n=0;n<4;n++)assert.equal((await attempt(DB,late,'midnight-'+n)).allowed,true);
  assert.equal(dailyCount(sql,start),500);
  assert.deepEqual(await attempt(DB,start+DAY,'too-soon'),{allowed:false,reason:'limit'});
  assert.equal(dailyCount(sql,start+DAY),0);
  assert.equal((await attempt(DB,late+WINDOW,'new-day')).allowed,true);
  assert.equal(dailyCount(sql,start+DAY),1);
  assert.equal(dailyCount(sql,start),500);
 }finally{sql.close();}
});

test('the final eight seconds of a UTC day cannot reserve a request that could spill into the next allowance',async()=>{
 const {sql,DB}=fixture();
 try{
  for(const when of [start+DAY-8000,start+DAY-1])assert.deepEqual(await attempt(DB,when,'boundary-'+when),{allowed:false,reason:'limit'});
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM guardian_rate_limits').get().n,0);
  assert.equal((await attempt(DB,start+DAY,'new-boundary-day')).allowed,true);
  assert.equal(dailyCount(sql,start+DAY),1);
 }finally{sql.close();}
});

test('normal expired-row cleanup cannot erase the active daily allowance',async()=>{
 const {sql,DB}=fixture();
 try{
  assert.equal((await attempt(DB,start,'cleanup')).allowed,true);
  sql.prepare('DELETE FROM guardian_rate_limits WHERE expires_at<?').run(start+WINDOW+1);
  assert.equal(dailyCount(sql,start),1);
  assert.equal((await attempt(DB,start+WINDOW+1,'after-cleanup')).allowed,true);
  assert.equal(dailyCount(sql,start),2);
  const rows=sql.prepare('SELECT * FROM guardian_rate_limits').all();
  assert(rows.every(r=>r.owner_id==='service:virustotal-community'));
  assert(!JSON.stringify(rows).includes('https://'));
 }finally{sql.close();}
});

test('repeated reservation IDs never charge the daily allowance twice, even after leases expire',async()=>{
 const {sql,DB}=fixture();
 try{
  assert.equal((await attempt(DB,start,'same-id')).allowed,true);
  assert.deepEqual(await attempt(DB,start,'same-id'),{allowed:false,reason:'limit'});
  assert.deepEqual(await attempt(DB,start+WINDOW,'same-id'),{allowed:false,reason:'limit'});
  assert.equal(dailyCount(sql,start),1);
 }finally{sql.close();}
});

test('a transactional database failure leaves neither a lease nor a partial daily charge',async()=>{
 const {sql,DB}=fixture({failAt:1});
 try{
  assert.deepEqual(await attempt(DB,start,'rollback'),{allowed:false,reason:'unavailable'});
  assert.equal(sql.prepare('SELECT COUNT(*) n FROM guardian_rate_limits').get().n,0);
 }finally{sql.close();}
});

test('missing, closed, malformed or corrupt storage fails closed',async()=>{
 assert.deepEqual(await reserveVirusTotalCommunityUsage({},{now:start,id:'missing'}),{allowed:false,reason:'unavailable'});
 for(const output of [null,[],[{},{}],[{results:[],success:false},{results:[]}],[{results:[{bucket_key:'wrong',count:1}]},{results:[{bucket_key:dailyKey(start),count:1}]}]]){
  assert.deepEqual(await attempt({prepare:()=>({bind(){return this;}}),batch:async()=>output},start,'malformed'),{allowed:false,reason:'unavailable'});
 }
 const {sql,DB}=fixture();
 sql.close();assert.deepEqual(await attempt(DB,start,'closed'),{allowed:false,reason:'unavailable'});
 const bad=fixture();
 try{
  bad.sql.prepare('INSERT INTO guardian_rate_limits VALUES (?, ?, ?, ?)').run(dailyKey(start),'service:virustotal-community',-1,start+DAY+WINDOW);
  assert.equal((await attempt(bad.DB,start,'corrupt')).allowed,false);
  assert.equal(dailyCount(bad.sql,start),-1);
 }finally{bad.sql.close();}
});

test('a last daily slot is reserved once across concurrent callers',async()=>{
 const {sql,DB}=fixture();
 try{
  sql.prepare('INSERT INTO guardian_rate_limits VALUES (?, ?, ?, ?)').run(dailyKey(start),'service:virustotal-community',499,start+DAY+WINDOW);
  const rows=await Promise.all(Array.from({length:15},(_,n)=>attempt({...DB},start,'last-'+n)));
  assert.equal(rows.filter(r=>r.allowed).length,1);assert.equal(dailyCount(sql,start),500);
 }finally{sql.close();}
});

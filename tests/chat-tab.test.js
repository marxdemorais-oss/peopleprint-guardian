import test from 'node:test';
import assert from 'node:assert/strict';
import {openTabChat,clearTabChat,prepareHandoff,takeHandoff} from '../web/assets/chat-tab.js';
import {chatTabScope} from '../worker/public-usage.js';

test('only the same signed-in session restores the encrypted recent conversation',async()=>{
 const rows=new Map(),env={CONTACT_GATEWAY_SECRET:'a'.repeat(40)},user={ownerId:'people:test-user'};
 const request=token=>new Request('https://guardian.test',{headers:{cookie:'__Host-wolfgang_session='+token.repeat(64)}});
 const a=await chatTabScope(request('a'),env,user);
 assert.equal(await chatTabScope(request('a'),env,{}),null);
 assert.notEqual(a,await chatTabScope(request('b'),env,user));
 assert.notEqual(a,await chatTabScope(request('a'),env,{ownerId:'people:other-user'}));
 globalThis.sessionStorage={getItem:k=>rows.get(k),setItem:(k,v)=>rows.set(k,v),removeItem:k=>rows.delete(k)};
 try{
  const t=await openTabChat(a),turns=[{role:'user',content:'My private invoice'}];
  await t.save(turns);assert.equal(rows.size,1);assert.doesNotMatch([...rows.values()][0],/private invoice/);
  assert.deepEqual((await openTabChat(a)).history,turns);
  const key=[...rows.keys()][0],saved=rows.get(key);
  const extended=JSON.parse(saved);extended.expires+=1000000;rows.set(key,JSON.stringify(extended));
  assert.deepEqual((await openTabChat(a)).history,[]);
  rows.set(key,saved);assert.deepEqual((await openTabChat('c'.repeat(64))).history,[]);assert.equal(rows.size,0);
  await t.save(turns);assert.equal(await openTabChat(null),null);assert.equal(rows.size,0);
  await t.save(turns);clearTabChat();assert.equal(rows.size,0);
 }finally{delete globalThis.sessionStorage;}
});

test('guest handoff needs the key and the same tab, is valid for ten minutes, and is single-use',async()=>{
 const rows=new Map(),clock=Date.now;let now=clock();
 globalThis.sessionStorage={getItem:key=>rows.get(key),setItem:(key,v)=>rows.set(key,v),removeItem:key=>rows.delete(key)};
 Date.now=()=>now;
 try{
  const history=[{role:'user',content:'hello'}],draft='My private submitted evidence';
  const key=await prepareHandoff(history,draft);assert.match(key,/^#continue=[a-f0-9]{64}$/);
  assert.doesNotMatch([...rows.values()].join(''),/private submitted evidence|hello/);
  assert.equal(await takeHandoff('#continue='+'f'.repeat(64)),null);
  assert.equal((await takeHandoff(key)).draft,draft);assert.equal(await takeHandoff(key),null);
  const stale=await prepareHandoff(history,draft);now+=600001;assert.equal(await takeHandoff(stale),null);
  const logout=await prepareHandoff(history,draft);clearTabChat();assert.equal(await takeHandoff(logout),null);
 }finally{Date.now=clock;delete globalThis.sessionStorage;}
});

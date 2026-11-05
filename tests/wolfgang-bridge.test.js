import test from 'node:test';
import assert from 'node:assert/strict';
import {createWolfgangBridge} from '../web/assets/wolfgang-bridge.js';
import {requestAssessment} from '../web/assets/guardian-client.js';
import {CONTRACT_VERSION} from '../web/assets/guardian-contract.js';

const make=()=>{const events=[];return {events,bridge:createWolfgangBridge({emit:e=>events.push(e)})};};
const result={status:'consistent',headline:'The records fit',explanation:'The earlier notice supports this change.',nextStep:'Check any new request separately.',evidenceIds:['ev-note-1'],questions:[],reaction:'reassuring'};
const input={schema:CONTRACT_VERSION,message:'Has the collection entrance changed?',channel:'message',evidence:[{id:'ev-note-1',source:'Earlier venue notice',text:'Collections use the west entrance.'}],preferences:{}};
const success=()=>new Response(JSON.stringify({result}),{headers:{'Content-Type':'application/json'}});
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};

test('only the newest active request controls Wolfgang, including out-of-order failures',()=>{
  const {events,bridge}=make();assert(bridge.begin('first'));assert(bridge.begin('second'));
  assert.equal(bridge.complete('first',result),false);assert.equal(bridge.fail('first'),false);assert.equal(bridge.cancel('first'),false);
  assert(bridge.complete('second',result));assert.equal(bridge.complete('second',result),false);
  assert.deepEqual(events.map(e=>e.intent),['thinking','thinking','explaining']);
});
test('cancelled or edited investigations cannot later animate a result',()=>{
  const {events,bridge}=make();bridge.begin('cancel-me');bridge.cancel('cancel-me');assert.equal(bridge.complete('cancel-me',result),false);
  bridge.begin('edit-me');bridge.user('evidence-changed');assert.equal(bridge.complete('edit-me',result),false);
  assert.deepEqual(events.map(e=>e.intent),['thinking','attending','thinking','attending']);
});
test('verdict gates expressions and ignores executable or unsupported model cues',()=>{
  const {events,bridge}=make();bridge.begin('caution');bridge.complete('caution',{...result,status:'caution',reaction:'reassuring',url:'https://untrusted.example',code:'execute()'});
  assert.equal(events.at(-1).intent,'caution');assert.equal(events.at(-1).url,undefined);assert.equal(events.at(-1).code,undefined);
  bridge.begin('consistent');bridge.complete('consistent',result);assert.equal(events.at(-1).intent,'explaining');
  bridge.begin('missing');bridge.complete('missing',{...result,status:'unresolved',questions:['Can you find the earlier notice?']});assert.equal(events.at(-1).intent,'asking');
});
test('request replay, malformed IDs and unknown user events are ignored; emitted cues are bounded and unique',()=>{
  const {events,bridge}=make();assert.equal(bridge.begin('x'.repeat(97)),false);assert.equal(bridge.begin({id:'x'}),false);assert.equal(bridge.user('__proto__'),false);assert.equal(bridge.user('run-code'),false);
  for(let i=0;i<500;i++){assert(bridge.begin('req-'+i));bridge.fail('req-'+i);}
  assert.equal(bridge.begin('req-499'),false);assert.equal(new Set(events.map(e=>e.eventId)).size,events.length);
  for(const e of events){assert(e.intensity>=0&&e.intensity<=1);assert(e.durationMs>=1000&&e.durationMs<=12000);assert(['viewer','evidence'].includes(e.target));assert(e.eventId.length<100);}
});
test('manual-route reassurance is distinct from a fraud verdict and does not interrupt processing',()=>{
  const {events,bridge}=make();bridge.user('manual-route');assert.equal(events.at(-1).intent,'reassuring');bridge.begin('active');assert.equal(bridge.user('manual-route'),false);assert(bridge.isCurrent('active'));
});
test('client emits thinking only for actual requests and validates the response before reacting',async()=>{
  const {events,bridge}=make();let calls=0;
  await assert.rejects(requestAssessment({...input,message:'' ,evidence:[]},{bridge,fetcher:()=>{calls++;}}));assert.equal(calls,0);assert.equal(events.length,0);
  await requestAssessment(input,{bridge,fetcher:async(url,options)=>{calls++;assert.equal(url,'/api/investigations/assess');assert.equal(options.credentials,'same-origin');assert.equal(events.at(-1).intent,'thinking');return success();}});
  assert.deepEqual(events.map(e=>e.intent),['thinking','explaining']);
  await assert.rejects(requestAssessment(input,{bridge,fetcher:async()=>new Response(JSON.stringify({result:{...result,evidenceIds:['another-owner-record']}}))}),/unavailable source/);
  assert.equal(events.at(-1).intent,'attending');
});
test('client discards a late response after a newer check and preserves the newer reaction',async()=>{
  const {events,bridge}=make(),first=deferred();
  const old=requestAssessment(input,{bridge,fetcher:()=>first.promise});
  await requestAssessment(input,{bridge,fetcher:async()=>success()});
  first.resolve(success());await assert.rejects(old,{name:'AbortError'});
  assert.deepEqual(events.map(e=>e.intent),['thinking','thinking','explaining']);
});
test('abort stops the thinking reaction immediately and a late transport result is discarded',async()=>{
  const {events,bridge}=make(),transport=deferred(),controller=new AbortController();
  const pending=requestAssessment(input,{bridge,signal:controller.signal,fetcher:()=>transport.promise});controller.abort();
  assert.equal(events.at(-1).intent,'attending');transport.resolve(success());await assert.rejects(pending,{name:'AbortError'});
  assert.deepEqual(events.map(e=>e.intent),['thinking','attending']);
  const before=events.length;await assert.rejects(requestAssessment(input,{bridge,signal:controller.signal,fetcher:()=>{throw new Error('must not run');}}),{name:'AbortError'});assert.equal(events.length,before);
});
test('provider failure returns to attention, never reassurance; renderer errors cannot break assessment',async()=>{
  const {events,bridge}=make();await assert.rejects(requestAssessment(input,{bridge,fetcher:async()=>new Response(JSON.stringify({message:'Unavailable',code:'ANALYSIS_NOT_CONNECTED'}),{status:503})}),/Unavailable/);assert.equal(events.at(-1).intent,'attending');
  const brokenRenderer=createWolfgangBridge({emit(){throw new Error('Renderer absent');}});
  assert.equal((await requestAssessment(input,{bridge:brokenRenderer,fetcher:async()=>success()})).status,'consistent');
});

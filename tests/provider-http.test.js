import test from 'node:test';
import assert from 'node:assert/strict';
import {requestProviderBytes} from '../worker/provider-http.js';
import {providerJson} from '../worker/messaging-providers.js';

test('transport deadline closes a late response from an uncooperative fetcher',async()=>{
 let resolve,cancelled=false;const waiting=new Promise(done=>{resolve=done;}),keepAlive=setTimeout(()=>{},100);
 try{
  await assert.rejects(requestProviderBytes('https://provider.test',{}, {fetcher:()=>waiting,timeoutMs:5}),{name:'TimeoutError'});
  resolve(new Response(new ReadableStream({cancel(){cancelled=true;}})));await new Promise(done=>setImmediate(done));assert(cancelled);
 }finally{clearTimeout(keepAlive);}
});
test('transport preserves safe status classification and cancels rejected or oversized bodies',async()=>{
 for(const [status,headers,expected] of [[429,{},'PROVIDER_REJECTED'],[307,{location:'https://attacker.test'},'PROVIDER_REDIRECT'],[200,{'content-length':'300000'},'PROVIDER_TOO_LARGE']]){
  let cancelled=false,calls=0;
  await assert.rejects(requestProviderBytes('https://provider.test',{}, {maxBytes:100,fetcher:async(url,init)=>{calls++;assert.equal(init.redirect,'manual');return new Response(new ReadableStream({cancel(){cancelled=true;}}),{status,headers});}}),error=>error.code===expected&&error.providerStatus===status);
  assert(cancelled);assert.equal(calls,1);
 }
});
test('a stalled messaging response is uncertain and its body is cancelled at the total deadline',async()=>{
 const original=AbortSignal.timeout,keepAlive=setTimeout(()=>{},100);let cancelled=false;
 AbortSignal.timeout=ms=>original(ms===12000?5:ms);
 try{
  await assert.rejects(providerJson('https://provider.test',{method:'POST'},async()=>new Response(new ReadableStream({pull(){return new Promise(()=>{});},cancel(){cancelled=true;}}))),error=>error.code==='DELIVERY_UNCERTAIN');assert(cancelled);
 }finally{AbortSignal.timeout=original;clearTimeout(keepAlive);}
});
test('messaging throttles keep their classification without exposing provider text',async()=>{
 await assert.rejects(providerJson('https://provider.test',{},async()=>new Response('private provider error',{status:429})),error=>error.code==='PROVIDER_RATE_LIMIT'&&error.providerStatus===429&&!error.message.includes('private'));
});

test('ambiguous send responses are uncertain while rejected requests and read errors stay distinct',async()=>{
 for(const response of [new Response('not-json'),Response.json(null),new Response('private response',{status:503}),new Response(''),new Response('x'.repeat(262145))])await assert.rejects(providerJson('https://provider.test',{method:'POST'},async()=>response),error=>error.code==='DELIVERY_UNCERTAIN');
 await assert.rejects(providerJson('https://provider.test',{method:'POST'},async()=>new Response('private',{status:401})),error=>error.code==='PROVIDER_REJECTED'&&error.providerStatus===401);
 await assert.rejects(providerJson('https://provider.test',{},async()=>new Response('not-json')),error=>error.code==='PROVIDER_INVALID_RESPONSE');
});

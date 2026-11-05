import test from 'node:test';
import assert from 'node:assert/strict';

test('speech starts on interaction, chooses one British voice and honours mute across further taps',async()=>{
 const spoken=[],events=[];let cancelled=0;
 globalThis.speechSynthesis={getVoices:()=>[{name:'Daniel',lang:'en-GB'}],speak:u=>spoken.push(u),cancel:()=>cancelled++};
 globalThis.SpeechSynthesisUtterance=class{constructor(text){this.text=text;}};
 globalThis.CustomEvent=class{constructor(type,init){this.type=type;this.detail=init.detail;}};
 globalThis.dispatchEvent=e=>events.push(e.detail);
 const voice=await import('../web/assets/wolfgang-voice.js');
 await voice.speak('Silent by default');assert.equal(spoken.length,0);
 voice.activateVoice();await voice.speak('Hello');assert.equal(spoken[0].voice.name,'Daniel');assert.equal(spoken[0].lang,'en-GB');
 await voice.speak('A new reply');assert.equal(spoken.length,2);assert(cancelled>=2);
 const count=events.length;spoken[0].onend();assert.equal(events.length,count,'stale speech cannot update the current voice state');
 voice.setVoiceEnabled(false);voice.activateVoice();await voice.speak('Must stay silent');assert.equal(spoken.length,2);assert.equal(voice.isVoiceEnabled(),false);
});

test('thinking uses locally generated audio only during a visible, unmuted wait',async t=>{
 const sources=[],listeners={},settings=new Map();
 const doc={hidden:false,addEventListener:(type,handler)=>{listeners[type]=handler;}};
 let contexts=0,samples;
 class TestContext{
  constructor(){contexts++;this.state='suspended';}
  resume(){this.state='running';return Promise.resolve();}
  createBuffer(_channels,length){samples=new Float32Array(length);return {getChannelData:()=>samples};}
  createBufferSource(){
   const source={connect(){},disconnect(){},start(){this.started=true;},stop(){this.stopped=true;}};
   sources.push(source);return source;
  }
 }
 for(const [key,value] of Object.entries({AudioContext:TestContext,document:doc,sessionStorage:{getItem:k=>settings.get(k),setItem:(k,v)=>settings.set(k,v)},fetch:()=>assert.fail('Local sound must not make a request')})){
  const original=Object.getOwnPropertyDescriptor(globalThis,key);
  Object.defineProperty(globalThis,key,{value,configurable:true});
  t.after(()=>{if(original)Object.defineProperty(globalThis,key,original);else delete globalThis[key];});
 }
 const voice=await import('../web/assets/wolfgang-voice.js?thinking');
 voice.setThinkingSound(true);assert.equal(contexts,0);
 voice.activateVoice(true);voice.setThinkingSound(true);
 assert.equal(contexts,1);assert.equal(sources.length,1);assert.ok(sources[0].loop&&sources[0].started);
 assert.ok(samples.some(value=>value>.02));assert.ok(samples.every(value=>Math.abs(value)<.08));
 voice.setThinkingSound(true);assert.equal(sources.length,1);
 doc.hidden=true;listeners.visibilitychange();assert.ok(sources[0].stopped);
 doc.hidden=false;listeners.visibilitychange();assert.equal(sources.length,2);
 voice.setVoiceEnabled(false);assert.ok(sources[1].stopped);
 voice.setThinkingSound(false);voice.activateVoice(true);voice.setThinkingSound(true);
 assert.equal(sources.length,2);
 const fresh=await import('../web/assets/wolfgang-voice.js?muted-on-next-page');
 const button={dataset:{},setAttribute(){}};
 fresh.bindVoiceToggle(button);assert.equal(button.dataset.muted,'true');
 fresh.activateVoice(true);fresh.setThinkingSound(true);
 assert.equal(contexts,1,'navigation preserves a muted preference');
 button.onclick();assert.equal(sources.length,3);assert.equal(button.dataset.muted,'false');
 fresh.setThinkingSound(false);assert.ok(sources[2].stopped);
 fresh.setThinkingSound(true);await fresh.speak('The answer');
 assert.ok(sources[3].stopped,'thinking stops when a reply starts');
});

test('public device speech remains available without transmitting unproved text',async t=>{
 const spoken=[],sent=[];
 const overrides={fetch:async(_,init)=>{sent.push(JSON.parse(init.body));return new Response(null,{status:503});},
  speechSynthesis:{getVoices:()=>[],cancel(){},speak:u=>spoken.push(u.text)},
  SpeechSynthesisUtterance:class{constructor(text){this.text=text;}}};
 for(const [name,value] of Object.entries(overrides)){
  const old=Object.getOwnPropertyDescriptor(globalThis,name);Object.defineProperty(globalThis,name,{value,configurable:true});
  t.after(()=>{if(old)Object.defineProperty(globalThis,name,old);else delete globalThis[name];});
 }
 const voice=await import('../web/assets/wolfgang-voice.js?proof');
 voice.configureVoice(true,true);voice.activateVoice();
 await voice.speak('Device-only text');assert.deepEqual(sent,[]);assert.deepEqual(spoken,['Device-only text']);
 await voice.speak('An approved reply','test-proof');assert.deepEqual(sent,[{text:'An approved reply',voiceProof:'test-proof'}]);assert.deepEqual(spoken,['Device-only text','An approved reply']);
});

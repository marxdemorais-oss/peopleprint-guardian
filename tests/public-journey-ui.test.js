import {allowanceRenewal} from '../web/assets/allowance-renewal.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createWolfgangBridge} from '../web/assets/wolfgang-bridge.js';

function node(tag='div'){
 const value={tagName:tag.toUpperCase(),children:[],value:'',textContent:'',hidden:false,disabled:false,dataset:{},setAttribute(){},focus(){},scrollIntoView(){},addEventListener(type,fn){this['on'+type]=fn;},append(...children){this.children.push(...children);this.lastElementChild=this.children.at(-1);},replaceChildren(...children){this.children=[...children];}};
 return value;
}
function mountConversation(respond, tabHelpers={},options={}){
 const nodes=new Map(),get=key=>{if(!nodes.has(key)){const n=node();n.querySelector=get;nodes.set(key,n);}return nodes.get(key);};
 const source=readFileSync(new URL('../web/assets/wolfgang-conversation.js',import.meta.url),'utf8').replace(/^import[^;]+;/gm,'').replace('export function mountConversation','function mountConversation')+'\nmountConversation(options);';
 const calls=[],spoken=[],thinkingSound=[],events=new Map();
 runInNewContext(source,{options,encodeURIComponent,openTabChat:async()=>null,clearTabChat(){},setTimeout,clearTimeout,...tabHelpers,document:{querySelector:get,querySelectorAll:()=>[],createElement:node,createTextNode:text=>Object.assign(node('#text'),{textContent:text}),addEventListener(){}},window:{addEventListener:(name,fn)=>events.set(name,fn),dispatchEvent(){}},CustomEvent:class{},AbortController,fetch:async(path,options)=>{calls.push({path,options});return respond(path,options);},wolfgangBridge:createWolfgangBridge({emit(){},emitMotion(){}}),activateVoice(){},bindVoiceToggle(){},setThinkingSound(active){thinkingSound.push(active);},configureVoice(){},speak(reply){spoken.push(reply);},stopVoice(){}});
 return {get,calls,events,spoken,thinkingSound};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
const descendants=n=>[n,...n.children.flatMap(descendants)];

test('public chat keeps its composer visible and preserves unsent text when conversation is unavailable',async()=>{
 for(const respond of [()=>Response.json({conversationReady:false,voiceReady:false}),()=>{throw Error('offline');}]){
  const page=mountConversation(respond);assert.equal(page.get('form').hidden,false);assert.equal(page.get('textarea').disabled,false);await settle();
  assert.equal(page.get('form').hidden,false);assert.equal(page.get('[type=submit]').disabled,false);assert.equal(page.get('[data-chat-status]').textContent,'');
  page.get('textarea').value='A private message';await page.get('form').onsubmit({preventDefault(){}});assert.equal(page.calls.length,1);assert.equal(page.calls[0].path,'/api/wolfgang/config');assert.equal(page.get('textarea').value,'A private message');
  assert.deepEqual(descendants(page.get('[data-chat-status]')).filter(n=>n.tagName==='A').map(n=>n.href),['/demo','/workspace']);
 }
});

test('configured public conversation enables its composer and preserves the explicit-send boundary',async()=>{
 const page=mountConversation(path=>path==='/api/wolfgang/config'?Response.json({conversationReady:true,voiceReady:false}):Response.json({reply:'A prepared fixture response',intent:'asking'}));await settle();
 assert.equal(page.get('form').hidden,false);assert.equal(page.get('textarea').disabled,false);assert.equal(page.calls.length,1);
 page.get('textarea').value='Synthetic test message';await page.get('form').onsubmit({preventDefault(){}});assert.equal(page.calls.length,2);assert.equal(page.calls[1].path,'/api/wolfgang/chat');assert.equal(JSON.parse(page.calls[1].options.body).message,'Synthetic test message');
});

test('a public submission protects its draft while waiting for configuration and restores it if unavailable',async()=>{
 let finish;const page=mountConversation(()=>new Promise(resolve=>{finish=resolve;}));
 page.get('textarea').value='Keep this submitted message';const sending=page.get('form').onsubmit({preventDefault(){}});
 assert.equal(page.get('textarea').disabled,true);assert.equal(page.get('[type=submit]').disabled,true);
 finish(Response.json({conversationReady:false,voiceReady:false}));await sending;
 assert.equal(page.get('textarea').disabled,false);assert.equal(page.get('[type=submit]').disabled,false);assert.equal(page.get('textarea').value,'Keep this submitted message');assert.equal(page.calls.length,1);
});


test('leaving public chat cancels pending work and restores an editable draft for browser Back',async()=>{
 let finish;const page=mountConversation(path=>path==='/api/wolfgang/config'?Response.json({conversationReady:true,voiceReady:false}):new Promise(resolve=>{finish=resolve;}));await settle();
 page.get('textarea').value='Keep this when I return';const pending=page.get('form').onsubmit({preventDefault(){}});await settle();assert.equal(page.get('textarea').disabled,true);
 page.events.get('pagehide')();assert.equal(page.get('textarea').disabled,false);assert.equal(page.get('[type=submit]').disabled,false);assert.equal(page.get('textarea').value,'Keep this when I return');
 finish(Response.json({reply:'A stale answer',intent:'explaining'}));await pending;assert.equal(page.get('textarea').value,'Keep this when I return');assert.equal(page.get('[data-chat-log]').children.length,1);
});

test('portrait shows on focus, thinks during the outstanding reply and stops on success, gate or failure',async()=>{
 for(const response of [Response.json({reply:'Hi!',intent:'attending'}),Response.json({code:'PREVIEW_COMPLETE',message:'Preview complete'},{status:429}),Response.json({message:'Please retry'},{status:502})]){
  let finish;
  const page=mountConversation(path=>path.endsWith('/config')?Response.json({conversationReady:true}):new Promise(resolve=>{finish=resolve;}));
  await settle();
  const portrait=page.get('[data-chat-portrait]'),input=page.get('textarea');
  input.onfocus();assert.equal(portrait.hidden,false);
  input.value='Hi';const sent=page.get('form').onsubmit({preventDefault(){}});
  assert.equal(portrait.dataset.thinking,'true');assert.deepEqual(page.thinkingSound,[true]);finish(response);await sent;
  assert.equal(portrait.dataset.thinking,'false');assert.deepEqual(page.thinkingSound,[true,false]);
  assert.equal(page.get('[data-chat-log]').children.length,2);
 }
});

test('repeated interrupted answers vary the recovery wording and keep the question ready',async()=>{
 const page=mountConversation(path=>path.endsWith('/config')?Response.json({conversationReady:true}):Response.json({code:'REPLY_INTERRUPTED',reason:'interrupted'},{status:502}));
 await settle();const box=page.get('textarea'),form=page.get('form'),log=page.get('[data-chat-log]');box.value='Can you check this request?';
 await form.onsubmit({preventDefault(){}});const first=log.lastElementChild.children[1].textContent;
 await form.onsubmit({preventDefault(){}});assert.notEqual(log.lastElementChild.children[1].textContent,first);assert.equal(box.value,'Can you check this request?');
});

test('a failed config lookup or chat POST still greets locally, without a second POST or voice request',async()=>{
 for(const configFails of [true,false]){
  const page=mountConversation(path=>{
   if(path.endsWith('/config')&&!configFails)return Response.json({conversationReady:true,voiceReady:true});
   throw new TypeError('Failed to fetch');
  });
  const log=page.get('[data-chat-log]'),input=page.get('textarea'),portrait=page.get('[data-chat-portrait]');
  const replies=[];
  for(const greeting of ['hi','hi','Good morning, Wolfgang!']){
   input.value=greeting;await page.get('form').onsubmit({preventDefault(){}});
   const reply=log.lastElementChild.children[1].textContent;replies.push(reply);
   assert.match(reply,/^(Hello|Hi|Hey there|Good morning)! /);
   assert.equal(input.value,'');assert.equal(input.disabled,false);assert.equal(portrait.dataset.thinking,'false');
  }
  assert.notEqual(replies[0],replies[1]);assert.match(replies[2],/^Good morning!/);
  assert.equal(page.calls.filter(call=>call.options?.method==='POST').length,configFails?0:3);
  assert.equal(page.spoken.length,0);
 }
});

test('a greeting with a case stays editable after a transport error, and is only resent on explicit submit',async()=>{
 const draft='Hi Wolfgang, mum received a message asking for her PIN.';
 let online=false;
 const page=mountConversation(path=>{
  if(path.endsWith('/config'))return Response.json({conversationReady:true});
  if(online)return Response.json({reply:'Someone asking for a PIN is a warning sign.',intent:'caution'});
  throw new TypeError('Failed to fetch');
 });
 const input=page.get('textarea'),form=page.get('form'),log=page.get('[data-chat-log]');
 input.value=draft;await form.onsubmit({preventDefault(){}});
 const reply=log.lastElementChild.children[1].textContent;
 assert.match(reply,/Your message is still in the box/);assert.doesNotMatch(reply,/fetch/i);
 assert.equal(page.get('[data-chat-portrait]').dataset.thinking,'false');assert.equal(input.value,draft);assert.equal(input.disabled,false);
 await settle();assert.equal(page.calls.length,2);
 online=true;await form.onsubmit({preventDefault(){}});
 assert.equal(page.calls.length,3);assert.deepEqual(JSON.parse(page.calls[2].options.body),{message:draft,history:[]});
 assert.equal(input.value,'');assert.match(log.lastElementChild.children[1].textContent,/warning sign/);
});

test('stalled config and chat requests abort at their deadlines, stop thinking and never automatically resend',async()=>{
 for(const [stage,draft] of [['config','hi'],['chat','hi'],['chat','A message asked for my PIN']]){
  const timers=new Map();let saved=[];
  const page=mountConversation((path,{signal})=>{
   if(path.endsWith('/config')&&stage==='chat')return Response.json({conversationReady:true,chatScope:'signed-in'});
   return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}));
  },{
   setTimeout(callback,delay){timers.set(callback,delay);return callback;},clearTimeout(callback){timers.delete(callback);},
   openTabChat:async()=>({tag:'current',history:[...saved],save:async turns=>{saved=[...turns];}})
  });
  await settle();
  const input=page.get('textarea'),portrait=page.get('[data-chat-portrait]'),log=page.get('[data-chat-log]');
  input.value=draft;const sending=page.get('form').onsubmit({preventDefault(){}});
  assert.equal(portrait.dataset.thinking,'true');assert.deepEqual([...timers.values()],[stage==='config'?6000:32000]);
  [...timers.keys()][0]();await sending;assert.equal(timers.size,0);
  assert.equal(portrait.dataset.thinking,'false');assert.equal(input.disabled,false);
  assert.equal(page.calls.filter(call=>call.options?.method==='POST').length,stage==='config'?0:1);
  if(draft==='hi'){
   const greeting=log.lastElementChild.children[1].textContent;assert.match(greeting,/^(Hello|Hi|Hey there)! /);
   if(stage==='chat'){
    assert.equal(saved[1].content,greeting);page.events.get('pagehide')();page.events.get('pageshow')({persisted:true});await settle();
    assert.equal(log.lastElementChild.children[1].textContent,greeting);assert.equal(timers.size,0);
   }
  }else{assert.equal(input.value,draft);assert.equal(saved.length,0);}
 }
});

test('navigation cancels configuration and its timer without displaying a stale local reply',async()=>{
 const timers=new Set();let signal;
 const page=mountConversation((path,options)=>{signal=options.signal;return new Promise((resolve,reject)=>signal.addEventListener('abort',()=>reject(signal.reason),{once:true}));},{
  setTimeout(fn){timers.add(fn);return fn;},clearTimeout(fn){timers.delete(fn);}
 });
 page.get('textarea').value='hi';const sending=page.get('form').onsubmit({preventDefault(){}});
 page.events.get('pagehide')();await sending;
 assert.equal(signal.aborted,true);assert.equal(timers.size,0);assert.equal(page.get('[data-chat-log]').children.length,0);assert.equal(page.calls.length,1);
});

test('unavailable configuration is checked again on the next explicit submit, and an enforced limit still takes precedence',async()=>{
 let available=false;
 const page=mountConversation(path=>{
  if(path.endsWith('/config')){
   if(!available)throw new TypeError('Failed to fetch');
   return Response.json({conversationReady:true});
  }
  return Response.json({code:'PREVIEW_COMPLETE',message:'Preview complete'},{status:429});
 });
 const input=page.get('textarea'),form=page.get('form');input.value='A case to check';
 await form.onsubmit({preventDefault(){}});assert.equal(input.value,'A case to check');assert.equal(page.calls.length,1);
 available=true;input.value='hi';await form.onsubmit({preventDefault(){}});
 assert.equal(page.get('[data-chat-log]').lastElementChild.children[1].textContent,'Preview complete');
 assert.deepEqual(page.calls.map(call=>call.path),['/api/wolfgang/config','/api/wolfgang/config','/api/wolfgang/chat']);
});

function mountPlans(respond){
 const balance=node(),redirects=[];
 const source=readFileSync(new URL('../web/assets/plans.js',import.meta.url),'utf8').replace(/^import[^;]+;/gm,'');
 runInNewContext(source,{document:{querySelector:()=>balance,createElement:node,createTextNode:text=>Object.assign(node('#text'),{textContent:text})},initShell(){},allowanceRenewal:()=>()=>{},api:async()=>respond(),location:{replace:target=>redirects.push(target)}});
 return {balance,redirects};
}

test('plans reflect the actual allowance and offer only an available profile bonus',async()=>{
 for(const canUnlockProfile of [false,true]){const page=mountPlans(()=>({trial:{remaining:2,allowance:8,canUnlockProfile}}));await settle();assert.equal(page.balance.textContent,'2 free checks remaining from your current allowance of 8.');assert.equal(descendants(page.balance).some(n=>n.href==='/welcome?unlock=1'),canUnlockProfile);}
 const page=mountPlans(()=>({trial:{unlimited:true}}));await settle();assert.deepEqual(page.redirects,[]);assert.match(page.balance.textContent,/Unlimited Guardian checks/);
});

test('monthly plan balance distinguishes renewal, paid capacity, and temporarily reserved checks', async()=>{
 const {balance}=mountPlans(()=>({trial:{remaining:3,reserved:1,allowance:8,source:'paid',period:'calendar_month',resetsAt:'2027-01-01T00:00:00.000Z'}}));
 await settle();assert.match(balance.textContent,/2 plan checks available; 1 in progress/);assert.match(balance.textContent,/renews to 8 on 1 January at 00:00 UTC/);
});

test('plans recover an expired session without losing the intended destination',async()=>{
 const page=mountPlans(()=>{throw Object.assign(Error('Expired'),{status:401});});await settle();const link=descendants(page.balance).find(n=>n.tagName==='A');assert.equal(link.href,'/login?return_to=%2Fplans');
});

test('returning to ordinary chat restores only the verified transcript and submits its scope',async()=>{
 const history=[{role:'user',content:'Can we continue?'},{role:'assistant',content:'Of course.'}];
 const tag='b'.repeat(32);let saved;
 const page=mountConversation(path=>Response.json(path.endsWith('/config')?{conversationReady:true,chatScope:'current-login'}:{reply:'Yes.',intent:'attending'}),{
  openTabChat:async scope=>{assert.equal(scope,'current-login');return {tag,history:[...history],save:async items=>{saved=[...items];}};}
 });
 await settle();assert.deepEqual(page.get('[data-chat-log]').children.map(row=>row.children[1].textContent),history.map(turn=>turn.content));
 page.get('textarea').value='Thank you.';await page.get('form').onsubmit({preventDefault(){}});
 assert.equal(page.calls[1].options.headers['x-guardian-chat-scope'],tag);
 assert.deepEqual(JSON.parse(page.calls[1].options.body).history,history);
 assert.equal(saved.length,4);
 page.events.get('pagehide')();assert.equal(page.get('[data-chat-log]').children.length,0);
});

test('the public case reply renders its official source, retains it locally, and sends only text back to chat',async()=>{
 const reference={topic:'safeAccount',checkedAt:'2026-11-03T12:00:00.000Z'};
 let rendered,saved;
 const page=mountConversation(path=>path.includes('/config')?Response.json({conversationReady:true,chatScope:'session'}):Response.json({reply:'Keep your money where it is.',intent:'caution',officialGuidance:reference}),{
   openTabChat:async()=>({tag:'subject',history:[],save:async items=>{saved=items;}}),
   renderOfficialGuidance:(row,ref,options)=>{assert.equal(row.tagName,'DIV');assert.ok(options.compact);rendered=ref;}
 });
 await settle();
 page.get('textarea').value='Transfer my savings to a safe account?';await page.get('form').onsubmit({preventDefault(){}});
 assert.equal(rendered.topic,reference.topic);assert.equal(saved.at(-1).officialGuidance.topic,reference.topic);
 page.get('textarea').value='What next?';await page.get('form').onsubmit({preventDefault(){}});
 assert.equal(JSON.parse(page.calls.at(-1).options.body).history.at(-1).officialGuidance,undefined);
});

test('an open tab rereads the server at the UTC reset, even for a month longer than one browser timeout',()=>{
 let now=Date.parse('2027-01-01T00:00:00.000Z'),callback,delay,reads=0;
 const clock={Date:{now:()=>now},setTimeout(fn,ms){callback=fn;delay=ms;return 1;},clearTimeout(){callback=null;}};
 const schedule=allowanceRenewal(()=>reads++,clock),end='2027-02-01T00:00:00.000Z';
 schedule(end);assert.equal(delay,2147483647);
 now+=delay;callback();assert.equal(reads,0);assert.equal(delay,Date.parse(end)-now);
 now+=delay;callback();assert.equal(reads,1);
 schedule('2027-03-01T00:00:00.000Z');schedule(null);assert.equal(callback,null);
});


test('an introduction-only config still gates a real message and transfers its text only after the verification link is chosen',async()=>{
 const redirects=[],drafts=[];const message='A private test invoice';
 const page=mountConversation(path=>path.endsWith('/config')?Response.json({conversationReady:false,introductionReady:true}):Response.json({code:'SIGN_IN_REQUIRED',message:'Verify your email.'},{status:401}),{
  prepareHandoff:async(turns,draft)=>{drafts.push(draft);return '#continue='+'a'.repeat(64);},location:{assign:url=>redirects.push(url)}
 });
 await settle();page.get('textarea').value=message;await page.get('form').onsubmit({preventDefault(){}});
 const link=descendants(page.get('[data-chat-log]')).find(n=>n.tagName==='A');
 assert.match(link.textContent,/bring this draft/);assert.deepEqual(drafts,[]);assert.equal(redirects.length,0);
 await link.onclick({preventDefault(){}});assert.deepEqual(drafts,[message]);assert.doesNotMatch(redirects[0],/invoice/);
 assert.equal(new URL(redirects[0],'https://guardian.test').searchParams.get('return_to'),'/workspace?start=check');
 assert.equal(page.calls.filter(call=>call.path==='/api/checks').length,0);
});

test('signed-in chat offers a local draft handoff with no personal assessment POST',async()=>{
 const drafts=[];const page=mountConversation(()=>Response.json({code:'CHECK_REQUIRED',message:'Use a saved check.'},{status:409}),{},{config:{introductionReady:true},onCheck:draft=>{drafts.push(draft);return true;}});
 await settle();page.get('textarea').value='A new case';await page.get('form').onsubmit({preventDefault(){}});
 const action=descendants(page.get('[data-chat-log]')).find(n=>n.tagName==='BUTTON');
 assert.deepEqual(drafts,[]);action.onclick();assert.deepEqual(drafts,['A new case']);assert.equal(action.disabled,true);
 assert.deepEqual(page.calls.map(call=>call.path),['/api/wolfgang/chat']);
});

import {renderOfficialGuidance} from './official-guidance.js';
import {openTabChat,clearTabChat,prepareHandoff} from './chat-tab.js';
import {wolfgangBridge} from './wolfgang-bridge.js';
import {activateVoice,bindVoiceToggle,setThinkingSound,configureVoice,speak,stopVoice} from './wolfgang-voice.js';
function timedRequest(milliseconds){
 const controller=new AbortController();
 const timer=setTimeout(()=>controller.abort(),milliseconds);
 return {signal:controller.signal,finish(){clearTimeout(timer);},abort(){clearTimeout(timer);controller.abort();}};
}
export function mountConversation({config:initialConfig,initialHistory=[],onCheck,portrait:sharedPortrait}={}){
 const panel=document.querySelector('[data-wolfgang-chat]');if(!panel)return;
 const form=panel.querySelector('form'),input=form.querySelector('textarea'),send=form.querySelector('[type=submit]');
 const log=panel.querySelector('[data-chat-log]'),status=panel.querySelector('[data-chat-status]'),mute=panel.querySelector('[data-voice-toggle]'),mic=panel.querySelector('[data-microphone]');
 let failures=0,greetings=Math.floor(Math.random()*3),tabChat=null,configVersion=0,recheckConfig=false,configRequest=null;
 let history=[],controller=null,generation=0,ready=null,recognition=null,listening=false,activeRequest=null,submittedMessage='';
 form.hidden=false;input.disabled=false;send.disabled=false;
 const heading=panel.querySelector('[data-chat-heading]');
 const portrait=sharedPortrait||panel.querySelector('[data-chat-portrait]');
 function showPortrait(){portrait.hidden=false;}
 function thinking(active){portrait.dataset.thinking=String(active);setThinkingSound(active);}
 input.addEventListener('focus',showPortrait);
 function availability(available){
  ready=available;mic.hidden=!available||!recognition;
  if(heading)heading.textContent=onCheck?'Chat with Wolfgang':'Meet Wolfgang';
  status.textContent='';
 }
 function unavailableNotice(){
  status.replaceChildren(document.createTextNode('Conversation is unavailable right now. Your message has not been sent. '));
  const examples=document.createElement('a');examples.href='/demo';examples.className='text-link';examples.textContent='Explore the prepared examples';
  const workspace=document.createElement('a');workspace.href='/workspace';workspace.className='text-link';workspace.textContent='prepare your own check';
  status.append(examples,document.createTextNode(', or '),workspace,document.createTextNode('.'));
 }
 let gatedDraft='';
 function handoffLink(row,message='',label='Continue after sign-in',needsAuth=true){
  const link=document.createElement('a');
  const target='/workspace?start='+(message?'check':'chat');
  link.href=needsAuth?'/signup?return_to='+encodeURIComponent(target):target;link.className='text-link';link.textContent=label;
  link.onclick=async event=>{
   event.preventDefault();if(link.dataset.pending)return;link.dataset.pending='true';
   try{
    const fragment=await prepareHandoff(history,message);
    location.assign(link.href+fragment);
   }catch{status.textContent='Your browser could not carry this conversation through sign-in. Copy any text you want to keep, then use Log in.';}
   finally{delete link.dataset.pending;}
  };
  row.append(link);
 }
 // A normal same-tab login after talking should also keep the current conversation.
 if(!onCheck)document.addEventListener('click',async event=>{
  const login=event.target.closest?.('[data-login],[data-member-href],.wolf-chat-message a[href="/signup"]');
  const draft=submittedMessage||gatedDraft;
  if(!login||login.dataset.noHandoff||(!history.length&&!draft)||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;
  event.preventDefault();
  const path=login.hasAttribute('data-login')?'/login':'/signup';
  const member=login.pathname==='/workspace';
  const opensCheck=member?login.search==='?start=check':path==='/signup';
  const target='/workspace?start='+(draft||opensCheck?'check':'chat');
  const destination=member?target:path+'?return_to='+encodeURIComponent(target);
  try{location.assign(destination+await prepareHandoff(history,draft));}
  catch{status.textContent='Copy any text you want to keep before continuing.';login.dataset.noHandoff='true';login.href=destination;}
 });
 const react=intent=>window.dispatchEvent(new CustomEvent('guardian:reaction',{detail:{intent,durationMs:5000}}));
 function focus(){react('attending');input.focus({preventScroll:true});panel.scrollIntoView({behavior:'smooth',block:'center'});}
 document.querySelectorAll('[data-talk-wolfgang]').forEach(button=>button.addEventListener('click',focus));
 function add(role,text,reference){const row=document.createElement('div');row.className='wolf-chat-message '+role;const label=document.createElement('strong');label.textContent=role==='user'?'You':'Wolfgang';const p=document.createElement('p');p.textContent=text;row.append(label,p);if(reference)renderOfficialGuidance(row,reference,{compact:true});log.append(row);log.scrollTop=log.scrollHeight;}
 async function greetLocally(message,alreadyShown,id){
  const greeting=/^(hi|hello|hey|hiya|good (?:morning|afternoon|evening))(?: there)?(?:[\s,]+wolfgang)?[.!?,\s👋]*$/iu.exec(message);
  if(!greeting)return false;
  const opener=greeting[1].toLowerCase().startsWith('good ')?greeting[1].slice(0,1).toUpperCase()+greeting[1].slice(1).toLowerCase():['Hello','Hey there','Hi'][greetings%3];
  const invitation=['What’s on your mind?','What caught your eye?','Anything you’d like me to look at?'][greetings++%3];
  const reply=opener+'! '+invitation;
  history.push({role:'user',content:message},{role:'assistant',content:reply});history=history.slice(-10);
  if(tabChat)await tabChat.save(history);
  if(id===generation){
   if(!alreadyShown)add('user',message);
   add('assistant',reply);input.value='';status.textContent='';
  }
  return true;
 }
 if(mute)bindVoiceToggle(mute);
 window.addEventListener('wolfgang:voice',event=>{if(event.detail.state==='unavailable'&&!status.textContent){status.textContent='I couldn’t read this reply aloud.';}});
 const Recognition=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition;
 if(Recognition){
  recognition=new Recognition();recognition.lang='en-GB';recognition.continuous=false;recognition.interimResults=true;
  let before='';
  mic.onclick=()=>{if(input.disabled)return;if(listening){recognition.stop();return;}activateVoice();stopVoice();before=input.value.trim();try{recognition.start();}catch{status.textContent='The microphone could not start. You can type here instead.';}};
  recognition.onstart=()=>{listening=true;mic.setAttribute('aria-pressed','true');mic.setAttribute('aria-label','Stop listening');status.textContent='Listening…';react('attending');};
  recognition.onresult=event=>{if(input.disabled)return;let transcript='';for(const result of event.results)transcript+=result[0].transcript+' ';input.value=[before,transcript.trim()].filter(Boolean).join(' ').slice(0,4000);};
  recognition.onend=()=>{listening=false;mic.setAttribute('aria-pressed','false');mic.setAttribute('aria-label','Speak your message');if(status.textContent==='Listening…')status.textContent='Ready to send.';input.focus({preventScroll:true});};
  recognition.onerror=e=>{status.textContent=e.error==='not-allowed'?'Microphone access was not granted. You can type here instead.':'I didn’t catch that. Please try again or type here.';};
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&listening)recognition.abort();});
 }
 async function configure(){
  const version=++configVersion;
  configRequest?.abort();const request=timedRequest(6000);configRequest=request;
  try{
   let config=initialConfig;initialConfig=null;
   if(!config){const r=await fetch('/api/wolfgang/config',{signal:request.signal});if(!r.ok)throw Error();config=await r.json();}if(version!==configVersion)return;
   const saved=await openTabChat(config.chatScope);
   if(version!==configVersion)return;
   tabChat=saved;if(saved||initialHistory.length){log.replaceChildren();history=[...(saved?.history||[]),...initialHistory].slice(-10);for(const turn of history)add(turn.role,turn.content,turn.officialGuidance);if(initialHistory.length&&saved)await saved.save(history);initialHistory=[];if(version!==configVersion)return;}
   configureVoice(config.voiceReady,config.voiceProofRequired);availability(config.conversationReady===true||config.introductionReady===true);
  }catch{if(version===configVersion)availability(false);}
  finally{request.finish();if(configRequest===request)configRequest=null;}
 }
 let configPromise=configure();
 window.addEventListener('pageshow',event=>{if(event.persisted){recheckConfig=false;ready=null;configPromise=configure();}});
 form.onsubmit=event=>{event.preventDefault();return submitMessage(input.value.trim());};
 async function submitMessage(message){
  if(!message||send.disabled)return;
  if(listening)recognition.stop();activateVoice(true);stopVoice();const id=++generation;
  showPortrait();thinking(true);submittedMessage=message;send.disabled=true;input.disabled=true;
  if(recheckConfig){recheckConfig=false;ready=null;configPromise=configure();}
  if(ready===null){status.textContent='Connecting…';await configPromise;}
  if(id!==generation)return;
  if(!ready){
   recheckConfig=true;
   const greeted=await greetLocally(message,false,id);if(id!==generation)return;
   if(!greeted)unavailableNotice();
   thinking(false);send.disabled=false;input.disabled=false;submittedMessage='';react('attending');return;
  }
  controller?.abort();const request=timedRequest(32000);controller=request;activeRequest='public-'+Date.now().toString(36)+'-'+id;wolfgangBridge.begin(activeRequest);add('user',message);input.value='';status.textContent='Thinking…';
  try{
   const recent=history.slice(-10).map(({role,content})=>({role,content}));
   let length=recent.reduce((total,turn)=>total+turn.content.length,message.length);
   while(length>20000&&recent.length)length-=recent.shift().content.length;
   const response=await fetch('/api/wolfgang/chat',{method:'POST',headers:{'Content-Type':'application/json',...(tabChat?{'x-guardian-chat-scope':tabChat.tag}:{})},body:JSON.stringify({message,history:recent}),signal:request.signal});
   const result=await response.json().catch(()=>null);if(id!==generation)return;if(result?.code==='CHAT_SESSION_CHANGED'){
    clearTabChat();log.replaceChildren();history=[];tabChat=null;input.value='';status.textContent=result.message;wolfgangBridge.cancel(activeRequest);activeRequest=null;
    ready=null;configPromise=configure();return;
   }if(result?.code==='SIGN_IN_REQUIRED'||result?.code==='CHECK_REQUIRED'){
    const needsAuth=result.code==='SIGN_IN_REQUIRED';
    add('assistant',result.message);const row=log.lastElementChild;
    if(needsAuth){gatedDraft=message;handoffLink(row,message,'Verify email and bring this draft');}
    else if(onCheck){const action=document.createElement('button');action.type='button';action.className='text-link';action.textContent='Use this in a saved check';action.onclick=()=>{if(onCheck(message))action.disabled=true;};row.append(action);}
    else {handoffLink(row,message,'Use this in a saved check',false);}
    status.textContent='';wolfgangBridge.cancel(activeRequest);activeRequest=null;return;
   }if(result?.code==='PREVIEW_COMPLETE'){
    history.push({role:'user',content:message},{role:'assistant',content:result.message});history=history.slice(-10);if(tabChat)await tabChat.save(history);if(id!==generation)return;
    add('assistant',result.message);
    if(result.link&&['/plans','/signup','/workspace','/demo'].includes(result.link.path)){
     const link=document.createElement('a');link.href=result.link.path;link.className='text-link';link.textContent=result.link.label;log.lastElementChild.append(link);

    }
    status.textContent='';wolfgangBridge.cancel(activeRequest);activeRequest=null;return;
   }
   if(response.status>=400&&response.status<500){
    let notice='I couldn’t accept that message. Your draft is here to edit or send again.';
    if(response.status===429)notice='Please give me a moment before sending again. Your message is still here.';
    if(result?.code==='PREVIEW_COOKIE')notice='Allow the first-party cookie for this site and refresh the page to start your preview.';
    add('assistant',notice);status.textContent='';input.value=message;wolfgangBridge.fail(activeRequest);activeRequest=null;return;
   }
   if(!response.ok||typeof result?.reply!=='string'||!result.reply.trim())throw Error();
   gatedDraft='';history.push({role:'user',content:message},{role:'assistant',content:result.reply,...(result.officialGuidance?{officialGuidance:result.officialGuidance}:{})});history=history.slice(-10);if(tabChat)await tabChat.save(history);if(id!==generation)return;add('assistant',result.reply,result.officialGuidance);status.textContent='';wolfgangBridge.conversationComplete(activeRequest,result);activeRequest=null;speak(result.reply,result.voiceProof);
   if(result.link&&['/demo','/workspace','/signup','/#how','/#difference'].includes(result.link.path)){const link=document.createElement('a');link.className='text-link';link.href=result.link.path;link.textContent=result.link.label;log.lastElementChild.append(link);}
  }catch{
   if(id!==generation)return;
   const greeted=await greetLocally(message,true,id);if(id!==generation)return;
   if(!greeted){
    const notices=['I couldn’t get a reply through. Your message is still in the box. Try sending it again in a moment.','I don’t have an answer for you yet. You can send your draft again when you’re ready.'];
    add('assistant',notices[failures++%notices.length]);input.value=message;status.textContent='';
   }
   wolfgangBridge.fail(activeRequest);activeRequest=null;
  }
  finally{request.finish();if(id===generation){thinking(false);log.scrollTop=log.scrollHeight;send.disabled=false;input.disabled=false;controller=null;submittedMessage='';}}
 };
 window.addEventListener('pagehide',()=>{thinking(false);generation++;configVersion++;configRequest?.abort();configRequest=null;controller?.abort();if(activeRequest)wolfgangBridge.cancel(activeRequest);activeRequest=null;controller=null;if(input.disabled&&!input.value)input.value=submittedMessage;input.disabled=false;send.disabled=false;submittedMessage='';status.textContent='';if(tabChat){tabChat=null;input.value='';log.replaceChildren();history=[];}});
 input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){e.preventDefault();form.requestSubmit();}});
}

import {validPublicCompanyName} from '../web/assets/organisation-reference.js';
import {knownContact,knownContactSource,companyLookupSource,isCompanyLookup} from '../web/assets/known-contact.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {assessmentPresentation} from '../web/assets/assessment-presentation.js';
import {workspaceSignInURL} from '../web/assets/workspace-navigation.js';
import {readImportFile} from '../web/assets/import-file.js';
import {createFilePicker} from '../web/assets/workspace-file-picker.js';
import {createWorkspaceEmailPicker,selectedEmailRecord} from '../web/assets/workspace-email.js';

function node(tag='div'){
 const selected=new Map(),attributes=new Map();
 const out={tagName:tag.toUpperCase(),value:'',textContent:'',hidden:false,disabled:false,checked:false,dataset:{},children:[],style:{},
  classList:{toggle(){}},setAttribute:(name,value)=>attributes.set(name,value),removeAttribute:name=>attributes.delete(name),getAttribute:name=>attributes.get(name),focus(){},scrollIntoView(){},showModal(){out.open=true;},close(){out.open=false;out.onclose?.();},click(){if(!out.disabled)out.onclick?.();},
  append(...values){out.children.push(...values);},replaceChildren(...values){out.children=[...values];},addEventListener(name,handler){out['on'+name]=handler;},
  querySelector(selector){if(selector==='input'){const input=out.children.flatMap(item=>[item,...(item.children||[])]).find(item=>item.tagName==='INPUT');if(input)return input;}if(!selected.has(selector))selected.set(selector,node(selector));return selected.get(selector);},
  querySelectorAll(selector){const descend=item=>[item,...(item.children||[]).flatMap(descend)];return out.children.flatMap(descend).filter(item=>selector==='button'&&item.tagName==='BUTTON');}
 };return out;
}
const check=(message='Please review this request.',extra={})=>({id:'check_saved',message,channel:'other',evidence:[],contextEvidence:[],replies:[],status:'draft',result:null,remember:false,createdAt:'2026-11-01T12:00:00.000Z',updatedAt:'2026-11-01T12:00:00.000Z',...extra});
const trial={remaining:1,reserved:0,canUnlockProfile:true,upgradeRequired:false};
function mount({respond,chatRespond,startPath='/workspace',analysisReady=false,balance=trial,SpeechRecognition,initialChecks=[],profileId=()=>'gp_synthetic',takeHandoff=async()=>null,fileReader=readImportFile}={}){
 const elements=new Map(),calls=[],listeners=new Map(),thinkingSound=[],chatCalls=[];
 const query=selector=>{if(!elements.has(selector))elements.set(selector,node());return elements.get(selector);};
 const location={href:'https://guardian.test'+startPath,origin:'https://guardian.test',assign(){}};
 const document={querySelector:query,querySelectorAll:()=>[],createElement:node,createTextNode:value=>({textContent:value}),getElementById:id=>query('#'+id)};
 const fetch=async(path,options={})=>{
  const call={path,method:options.method||'GET',body:options.body===undefined?undefined:JSON.parse(options.body)};
  if(path==='/api/wolfgang/chat'){chatCalls.push(call);return chatRespond?chatRespond(call):Response.json({code:'CHECK_REQUIRED',message:'Use the private assessment.'},{status:409});}
  calls.push(call);
  if(call.method==='GET'){
   const data=path==='/api/session'?{authenticated:true}:path==='/api/profile'?{profile:{id:profileId(),displayName:'Alex',memoryEnabled:false}}:path==='/api/checks'?{checks:initialChecks}:path==='/api/product-config'?{storageReady:true,analysisReady}:path==='/api/wolfgang/config'?{voiceReady:false}:path==='/api/entitlements'?{trial:balance}:null;
   if(data)return Response.json(data);
  }
  if(respond)return respond(call);
  throw Error('Unexpected request: '+call.method+' '+path);
 };
 const source=readFileSync(new URL('../web/assets/workspace.js',import.meta.url),'utf8').replace(/^import[^;]*;/gm,'');
 runInNewContext(source,{companyLookupSource,isCompanyLookup,validPublicCompanyName,knownContact,knownContactSource,document,fetch,location,addEventListener:(name,handler)=>listeners.set(name,handler),window:{SpeechRecognition,history:{replaceState(_state,_title,path){location.href=new URL(path,location.href).href;}}},URL,URLSearchParams,TextDecoder,TextEncoder,createWorkspaceEmailPicker,selectedEmailRecord,console,
  takeHandoff,crypto,setTimeout,clearTimeout,watchInspection:()=>()=>{},allowanceRenewal:()=>()=>{},initShell(){},bindVoiceToggle(){},setThinkingSound(active){thinkingSound.push(active);},stopVoice(){},activateVoice(){},configureVoice(){},speak(){},wolfgangBridge:{user(){},begin(){},complete(){},fail(){},cancel(){}},assessmentPresentation,workspaceSignInURL,readImportFile:fileReader,createFilePicker,File});
 return {query,calls,chatCalls,listeners,location,thinkingSound};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));
const submit=page=>page.query('#check-form').onsubmit({preventDefault(){}});

test('an unavailable assessment service saves a draft without requesting assessment and offers note saving',async()=>{
 const page=mount({respond:call=>{
  assert.equal(call.path,'/api/checks');assert.equal(call.method,'POST');return Response.json({check:check(call.body.message),trial});
 }});
 await settle();assert.equal(page.query('#submit-check').querySelector('span').textContent,'Send');assert.doesNotMatch(readFileSync(new URL('../web/workspace.html',import.meta.url),'utf8'),/id="assessment-availability"/);
 assert.equal(page.query('#send-followup').querySelector('span').textContent,'Save note');assert.equal(page.query('#send-followup').getAttribute('aria-label'),'Save note');
 page.query('#message').value='A request I want to keep.';await submit(page);
 assert.equal(page.calls.filter(c=>c.method==='POST').length,1);assert.equal(page.calls.some(c=>c.path.endsWith('/assess')),false);
 assert.equal(page.query('#retry-assessment').hidden,true);assert.equal(page.query('#assessment').hidden,true);assert.match(page.query('#check-status').textContent,/Saved for later/);assert.match(page.query('#check-status').textContent,/No assessment has been made/);
});

test('a pending save blocks new input and imports, then a failed save retains the original draft',async()=>{
 let reject;const pending=new Promise((_resolve,r)=>reject=r);const page=mount({respond:()=>pending});await settle();
 page.query('#message').value='Do not lose this unfinished message.';const saving=submit(page);await settle();
 for(const selector of ['#message','#files','#attach-file','#submit-check','#new-check'])assert.equal(page.query(selector).disabled,true,selector);
 let read=false;await page.query('#files').onchange({target:{files:[{name:'late.txt',size:20,arrayBuffer(){read=true;return Promise.resolve(new ArrayBuffer(0));}}]}});assert.equal(read,false);assert.equal(page.calls.filter(c=>c.method==='POST').length,1);
 reject(Error('Disconnected'));await saving;
 assert.equal(page.query('#message').value,'Do not lose this unfinished message.');assert.equal(page.query('#message').disabled,false);assert.equal(page.query('#files').disabled,false);assert.equal(page.query('#submit-check').querySelector('span').textContent,'Send');assert.match(page.query('#composer-feedback').textContent,/connection dropped/i);
});

test('an active import prevents saving until the selected record has finished loading',async()=>{
 let finish;const bytes=new Promise(resolve=>finish=resolve);const page=mount({respond:call=>Response.json({check:check(call.body.message,{evidence:call.body.evidence}),trial})});await settle();
 page.query('#message').value='Compare this with the agreement.';
 const importing=page.query('#files').onchange({target:{value:'agreement.txt',files:[{name:'agreement.txt',size:31,arrayBuffer:()=>bytes}]}});await settle();
 assert.equal(page.query('#message').disabled,true);assert.equal(page.query('#submit-check').disabled,true);await submit(page);assert.equal(page.calls.some(c=>c.method==='POST'),false);
 finish(new TextEncoder().encode('The venue pays the agreed fee.').buffer);await importing;
 assert.equal(page.query('#message').disabled,false);assert.equal(page.query('#file-review').open,true);await submit(page);assert.equal(page.calls.some(c=>c.method==='POST'),false);
 page.query('#file-review-add').click();assert.equal(page.query('#attachment-list').children.length,1);
 await submit(page);const saved=page.calls.find(c=>c.method==='POST');assert.equal(saved.body.evidence.length,1);assert.equal(saved.body.evidence[0].text,'The venue pays the agreed fee.');assert.equal(saved.body.message,'Compare this with the agreement.');assert.equal(page.calls.some(c=>c.path.endsWith('/assess')),false);
});

test('a credit reserved by an ongoing check is distinguished from a credit available to start',async()=>{
 const page=mount({balance:{...trial,remaining:1,reserved:1}});await settle();assert.match(page.query('#trial-balance').textContent,/0 free checks available/);assert.match(page.query('#trial-balance').textContent,/1 in progress/);assert.match(page.query('#trial-explanation').textContent,/temporarily reserves a credit/);assert.equal(page.query('#trial-next').hidden,true);
});


test('saving aborts dictation and stale recognition results cannot overwrite a later draft',async()=>{
 let recognition,aborts=0,finish;
 class Recognition{constructor(){recognition=this;}start(){}stop(){}abort(){aborts++;}}
 const pending=new Promise(resolve=>finish=resolve),page=mount({SpeechRecognition:Recognition,respond:()=>pending});await settle();
 page.query('#message').value='Original request';page.query('#dictate').onclick();const oldRecognition=recognition;
 oldRecognition.onresult({results:[[{transcript:'before saving'}]]});const original=page.query('#message').value;
 const saving=submit(page);await settle();assert.equal(aborts,1);assert.equal(page.query('#dictate').disabled,true);
 oldRecognition.onresult({results:[[{transcript:'late transcript'}]]});assert.equal(page.query('#message').value,original);
 finish(Response.json({check:check(original),trial}));await saving;
 page.query('#message').value='A different draft';oldRecognition.onresult({results:[[{transcript:'stale after saving'}]]});
 assert.equal(page.query('#message').value,'A different draft');
});


const selectCheck=(page,title)=>{const button=page.query('#check-history').children.find(item=>item.tagName==='BUTTON'&&item.children[0]?.textContent===title);assert.ok(button,'Saved check is present: '+title);return button.onclick();};

test('a customer can find an older check, open it, and return to the filtered history',async()=>{
 const titles=['Rental agreement','Travel booking','Council letter','Invoice','Electricity bill','Follow-up email'];
 const records=titles.map((title,index)=>check(title,{id:'case_'+index}));
 const page=mount({initialChecks:records,respond:call=>Response.json({check:records.find(item=>call.path.endsWith('/'+item.id))})});
 await settle();
 const toggle=page.query('#toggle-history'),search=page.query('#history-search');
 toggle.onclick();
 assert.equal(toggle.getAttribute('aria-expanded'),'true');
 search.value='RENTAL';search.oninput();
 assert.equal(page.query('#check-history').children.length,1);
 await selectCheck(page,'Rental agreement');
 assert.equal(page.query('#check-detail-title').textContent,'Rental agreement');
 assert.equal(toggle.getAttribute('aria-expanded'),'false');
 page.query('#back-to-compose').onclick();
 assert.equal(page.query('#new-check-view').hidden,false);
 assert.equal(toggle.getAttribute('aria-expanded'),'true');
 assert.equal(search.value,'RENTAL');
 assert.equal(page.calls.some(call=>call.method!=='GET'),false);
});

test('unsent notes stay with their own checks when switching cases or starting a new check',async()=>{
 const one=check('First request',{id:'case_one'}),two=check('Second request',{id:'case_two'}),records=new Map([[one.id,one],[two.id,two]]);
 const page=mount({initialChecks:[one,two],respond:call=>Response.json({check:records.get(call.path.split('/').at(-1))})});await settle();
 await selectCheck(page,'First request');page.query('#followup-message').value='Private note for first request';
 await selectCheck(page,'Second request');assert.equal(page.query('#followup-message').value,'');page.query('#followup-message').value='Private note for second request';
 await selectCheck(page,'First request');assert.equal(page.query('#followup-message').value,'Private note for first request');
 page.query('#new-check').onclick();assert.equal(page.query('#followup-message').value,'');
 await selectCheck(page,'Second request');assert.equal(page.query('#followup-message').value,'Private note for second request');
 assert.equal(page.calls.some(call=>call.method!=='GET'),false,'Changing the selected case must not submit any unsent note');
});

test('late check responses cannot replace a newer selection or reopen a check after New check',async()=>{
 const one=check('First request',{id:'case_one'}),two=check('Second request',{id:'case_two'}),waiting=[];
 const page=mount({initialChecks:[one,two],respond:call=>new Promise(resolve=>waiting.push({path:call.path,resolve}))});await settle();
 const first=selectCheck(page,'First request'),second=selectCheck(page,'Second request');
 waiting[1].resolve(Response.json({check:two}));await second;assert.equal(page.query('#check-detail-title').textContent,'Second request');
 waiting[0].resolve(Response.json({check:one}));await first;assert.equal(page.query('#check-detail-title').textContent,'Second request');assert.equal(new URL(page.location.href).searchParams.get('check'),'case_two');
 const reopening=selectCheck(page,'First request');assert.equal(page.query('#workspace-main').getAttribute('aria-busy'),'true');
 page.query('#new-check').onclick();waiting[2].resolve(Response.json({check:one}));await reopening;
 assert.equal(page.query('#new-check-view').hidden,false);assert.equal(page.query('#check-detail-view').hidden,true);assert.equal(new URL(page.location.href).searchParams.has('check'),false);assert.notEqual(page.query('#workspace-main').getAttribute('aria-busy'),'true');
});

test('leaving with a case-specific unsent note warns even after returning to New check',async()=>{
 const saved=check('First request',{id:'case_one'}),page=mount({initialChecks:[saved],respond:()=>Response.json({check:saved})});await settle();
 let warnings=0;const clean={preventDefault(){warnings++;}};page.listeners.get('beforeunload')(clean);assert.equal(warnings,0);
 await selectCheck(page,'First request');page.query('#followup-message').value='A note that has not been saved';page.query('#new-check').onclick();
 assert.equal(page.query('#followup-message').value,'');const event={preventDefault(){warnings++;}};page.listeners.get('beforeunload')(event);assert.equal(warnings,1);assert.equal(event.returnValue,'');
});

test('both workspace save paths leave retention to the current server preference',async()=>{
 for(const viaProfile of [false,true]){
  const page=mount({respond:call=>Response.json({check:check(call.body.message),trial})});await settle();
  page.query('#remember-check').checked=true;page.query('#message').value='Respect my latest Account setting';
  if(viaProfile){await page.query('#trial-next').onclick({preventDefault(){},currentTarget:{href:'https://guardian.test/welcome?unlock=1'}});}else await submit(page);
  const saved=page.calls.find(call=>call.method==='POST'&&call.path==='/api/checks');assert.ok(saved);assert.equal(Object.hasOwn(saved.body,'remember'),false);
 }
});

const earlierEmail={
 id:'ev-mail-0123456789abcdef01234567',
 source:'Outlook · Our agreed terms',
 text:'Message preview only; some content is omitted.\nThe agreed deposit is due on arrival.',
 excerpt:true,
 originProof:{provider:'outlook',signature:'not part of a supporting attachment'}
};
const connectedMailboxes=[
 {provider:'gmail',label:'Gmail',searchReady:true,status:'connected'},
 {provider:'outlook',label:'Outlook',displayLabel:'Project mailbox',searchReady:true,status:'connected'},
 {provider:'mailbox',label:'Other mailbox',searchReady:false,status:'connecting'}
];
const findButton = (node,label) => {
 if(node.tagName==='BUTTON'&&node.textContent===label)return node;
 for(const child of node.children||[]){const found=findButton(child,label);if(found)return found;}
};
async function selectMailbox(page) {
 page.query('#email-picker').hidden=true;
 await page.query('#attach-email').onclick();
 page.query('#email-provider').value='outlook';
 page.query('#email-provider').onchange();
 page.query('#email-query').value='deposit';
 return page.query('#email-search-form').onsubmit({preventDefault(){}});
}

test('attach a selected mailbox excerpt beside a typed message and a file, with one case creation',async()=>{
 const page=mount({respond:call=>{
  if(call.path==='/api/connections')return Response.json({connections:connectedMailboxes});
  if(call.path==='/api/connections/outlook/search?q=deposit')return Response.json({records:[earlierEmail],partial:true,limited:true});
  if(call.path==='/api/checks'&&call.method==='POST')return Response.json({check:check(call.body.message,{evidence:call.body.evidence}),trial});
  throw Error('Unexpected call');
 }});
 await settle();
 page.query('#message').value='Someone asked me to send a different deposit.';
 const bytes=new TextEncoder().encode('My booking reference').buffer;
 await page.query('#files').onchange({target:{value:'reference.txt',files:[{name:'reference.txt',size:20,arrayBuffer:async()=>bytes}]}});
 page.query('#file-review-add').click();
 await selectMailbox(page);
 assert.deepEqual(page.query('#email-provider').children.map(item=>item.value),['gmail','outlook']);
 assert.match(page.query('#email-search-status').textContent,/five matches/);
 assert.match(page.query('#email-search-status').textContent,/part of the search/);
 assert.equal(page.query('#attachment-list').children.length,1);
 assert.equal(page.calls.filter(call=>call.method==='POST').length,0);
 findButton(page.query('#email-search-results'),'Attach to this check').onclick();
 assert.equal(page.query('#email-picker').hidden,true);
 assert.equal(page.query('#attachment-list').children.length,2);
 assert.equal(page.query('#message').value,'Someone asked me to send a different deposit.');
 await submit(page);
 const writes=page.calls.filter(call=>call.method==='POST');
 assert.equal(writes.length,1);
 assert.equal(writes[0].path,'/api/checks');
 assert.equal(writes[0].body.message,'Someone asked me to send a different deposit.');
 assert.equal(writes[0].body.expectedProfileId,'gp_synthetic');
 assert.equal(writes[0].body.channel,'other');
 assert.deepEqual(writes[0].body.evidence.map(item=>item.source),['reference.txt',earlierEmail.source]);
 assert.deepEqual(writes[0].body.evidence[1],{id:earlierEmail.id,source:earlierEmail.source,text:earlierEmail.text});
 assert.equal(Object.hasOwn(writes[0].body,'originProof'),false);
});

test('discard results that arrive after selecting a different mailbox or closing a search',async()=>{
 let finish;
 const page=mount({respond:call=>call.path==='/api/connections'?Response.json({connections:connectedMailboxes}):new Promise(resolve=>{finish=resolve;})});
 await settle();
 for(const close of [false,true]){
  const pending=selectMailbox(page);await settle();
  if(close)page.query('#email-picker-close').onclick();
  else {page.query('#email-provider').value='gmail';page.query('#email-provider').onchange();}
  finish(Response.json({records:[earlierEmail]}));await pending;
  assert.equal(page.query('#email-search-results').children.length,0);
  assert.equal(page.query('#attachment-list').children.length,0);
 }
});

test('account changes stop regular and trial-navigation draft writes carrying an earlier email',async()=>{
 for(const viaTrial of [false,true]){
  let owner='owner-A';
  const page=mount({profileId:()=>owner,respond:call=>call.path==='/api/connections'?Response.json({connections:connectedMailboxes}):Response.json({records:[earlierEmail]})});
  await settle();
  page.query('#message').value='Keep the draft.';
  await selectMailbox(page);
  findButton(page.query('#email-search-results'),'Attach to this check').onclick();
  owner='owner-B';
  if(viaTrial)await page.query('#trial-next').onclick({preventDefault(){},currentTarget:{href:'https://guardian.test/welcome?unlock=1'}});
  else await submit(page);
  assert.equal(page.calls.some(call=>call.method==='POST'),false);
  assert.equal(page.query('#message').value,'Keep the draft.');
  assert.equal(page.query('#attachment-list').children.length,0);
  assert.match(page.query('#composer-feedback').textContent,/signed-in account has changed/);
 }
});

test('mailbox attachments reject duplicates, an overlong excerpt and a thirteenth record',()=>{
 assert.throws(()=>selectedEmailRecord(earlierEmail,[earlierEmail]),/already attached/);
 assert.throws(()=>selectedEmailRecord({...earlierEmail,text:'a'.repeat(20001)},[]),/could not be attached/);
 assert.throws(()=>selectedEmailRecord(earlierEmail,Array.from({length:12},(_,i)=>({id:'ev-file-'+i}))),/twelve records/);
});

test('unavailable mailboxes and search failures keep the original draft editable',async()=>{
 for(const offline of [false,true]){
  const page=mount({respond:()=>offline?Promise.reject(Error('Disconnected')):Response.json({connections:[{provider:'mailbox',status:'connecting',searchReady:false}]})});
  await settle();
  page.query('#message').value='My original draft';
  page.query('#email-picker').hidden=true;
  await page.query('#attach-email').onclick();
  assert.equal(page.query('#email-search-form').hidden,true);
  assert.match(page.query('#email-search-status').textContent,offline?/connection dropped/i:/Connect a mailbox in a new tab/);
  page.query('#email-picker-close').onclick();
  assert.equal(page.query('#message').value,'My original draft');
  assert.equal(page.query('#message').disabled,false);
  assert.equal(page.calls.some(call=>call.method==='POST'),false);
 }
});

test('the export picker can select a later chat message, cancel a second import and save only the requested text',async()=>{
 const page=mount({respond:call=>Response.json({check:check(call.body.message,{evidence:call.body.evidence}),trial})});await settle();
 const messages=Array.from({length:41},(_value,i)=>`[03/11/2026, 12:00] Alex: Detail ${i+1}`).join('\n');
 const bytes=new TextEncoder().encode(messages);
 const selectFile=()=>page.query('#files').onchange({target:{value:'chat.txt',files:[{name:'chat.txt',size:bytes.length,arrayBuffer:async()=>bytes.buffer}]}});
 await selectFile();assert.equal(page.query('#file-review-add').disabled,true);
 assert.match(page.query('#file-review-page').textContent,/15 of 41/);
 page.query('#file-review-next').click();assert.match(page.query('#file-review-page').textContent,/16–30/);
 const input=page.query('#file-review-search');input.value='Detail 38';input.oninput();
 const box=page.query('#file-review-list').children[0].querySelector('input');box.checked=true;box.onchange();
 input.value='';input.oninput();page.query('#file-review-add').click();
 assert.equal(page.query('#attachment-list').children.length,1);
 await selectFile();page.query('#file-review-close').click();assert.equal(page.query('#attachment-list').children.length,1);
 assert.equal(page.calls.some(c=>c.method==='POST'),false);
 await submit(page);const evidence=page.calls.find(c=>c.method==='POST').body.evidence;
 assert.equal(evidence.length,1);assert.match(evidence[0].text,/Detail 38$/);
});

test('the Connections upload link opens a dedicated file chooser with formats and a working button',async()=>{
 const page=mount({startPath:'/workspace?start=upload'});await settle();
 assert.equal(page.query('#upload-start').hidden,false);
 assert.equal(page.query('#compose-intro').hidden,true);
 let opened=0;page.query('#files').onclick=()=>{opened++;};
 page.query('#choose-export').click();assert.equal(opened,1);
 const html=readFileSync(new URL('../web/workspace.html',import.meta.url),'utf8');
 assert.match(html,/id="choose-export"[^>]*aria-describedby="export-formats">Choose a file<\/button>/);
 assert.match(html,/id="export-formats">WhatsApp TXT or ZIP/);
 page.query('#new-check').click();assert.equal(page.query('#upload-start').hidden,true);
});

test('workspace rings run during an assessment and stop after an interrupted reply',async()=>{
 let release;
 const page=mount({analysisReady:true,respond:call=>{
  if(call.path==='/api/checks')return Response.json({check:check(call.body.message),trial});
  if(call.path.endsWith('/assess'))return new Promise(resolve=>{release=resolve;});
  throw Error('Unexpected request');
 }});
 await settle();page.query('#message').value='Check this invoice.';
 const pending=submit(page);await settle();
 assert.deepEqual(page.thinkingSound,[true]);
 assert.equal(page.query('.wk-companion-visual').dataset.thinking,'true');
 release(Response.json({message:'Unavailable'},{status:503}));await pending;
 assert.deepEqual(page.thinkingSound,[true,false]);
 assert.equal(page.query('.wk-companion-visual').dataset.thinking,'false');
});

test('financial documents open from onboarding and a workspace draft',async()=>{
 for(const file of ['welcome','workspace']){
  const html=readFileSync(new URL('../web/'+file+'.html',import.meta.url),'utf8');
  assert.match(html,/["']\/workspace\?start=finance["']/);
 }
 const page=mount();await settle();
 page.query('#message').value='Please compare this invoice.';
 page.query('#open-finance').onclick({preventDefault(){}});
 assert.match(page.location.href,/start=finance$/);
 assert.equal(page.query('#finance-start').hidden,false);
 assert.equal(page.query('#compose-intro').hidden,true);
 assert.equal(page.query('#message').value,'Please compare this invoice.');
 page.query('#choose-finance').click();assert.match(page.query('#files').accept,/\.pdf,\.csv,\.txt.*\.png/);
 page.query('#new-check').click();assert.equal(page.query('#finance-start').hidden,true);
});

test('financial CSV rows require an explicit selection and only selected row text is saved',async()=>{
 const page=mount({startPath:'/workspace?start=finance',respond:call=>Response.json({check:check(call.body.message,{evidence:call.body.evidence}),trial})});
 await settle();page.query('#choose-finance').click();
 const bytes=new TextEncoder().encode('Date,Description,Amount\n2026-01-01,Personal purchase,15.00\n2026-01-02,Invoice ABC,24.00\n');
 await page.query('#files').onchange({target:{value:'bank.csv',files:[{name:'bank.csv',size:bytes.length,arrayBuffer:async()=>bytes.buffer}]}});
 assert.equal(page.query('#file-review-list').children.length,2);
 assert.equal(page.query('#file-review-add').disabled,true);
 const box=page.query('#file-review-list').children[1].querySelector('input');box.checked=true;box.onchange();
 page.query('#file-review-add').click();assert.equal(page.calls.some(c=>c.method==='POST'),false);
 page.query('#message').value='Does this invoice match?';await submit(page);
 const evidence=page.calls.find(c=>c.method==='POST').body.evidence;
 assert.equal(evidence.length,1);assert.match(evidence[0].text,/Description: Invoice ABC/);
 assert.doesNotMatch(JSON.stringify(evidence),/Personal purchase/);
});


test('one composer handles a question and then a personal request without mode buttons',async()=>{
 let general=true;
 const page=mount({chatRespond:()=>general?Response.json({reply:'Hello. What can I help with?'}):Response.json({code:'CHECK_REQUIRED'},{status:409}),respond:call=>Response.json({check:check(call.body.message),trial})});await settle();
 assert.equal(page.query('#workspace-check').hidden,false);
 const html=readFileSync(new URL('../web/workspace.html',import.meta.url),'utf8');assert.doesNotMatch(html,/id="mode-(?:chat|check)"/);
 page.query('#message').value='Hello Wolfgang';await submit(page);
 assert.equal(page.query('#conversation-opening').children.length,2);assert.equal(page.calls.some(c=>c.path==='/api/checks'&&c.method==='POST'),false);
 general=false;page.query('#message').value='Someone sent a new payment request.';await submit(page);
 assert.equal(page.calls.filter(c=>c.path==='/api/checks'&&c.method==='POST').length,1);assert.equal(page.chatCalls.length,2);
});

test('the verified introduction handoff restores an editable draft without creating a check',async()=>{
 const draft='Private submitted message.',fragment='#continue='+'a'.repeat(64);
 const page=mount({startPath:'/workspace?start=check'+fragment,takeHandoff:async key=>{assert.equal(key,fragment);return {history:[],draft};}});await settle();
 assert.equal(page.query('#message').value,draft);assert.equal(page.query('#workspace-check').hidden,false);
 assert.equal(new URL(page.location.href).hash,'');assert.ok(page.calls.every(call=>call.method==='GET'));
});


test('pasting a screenshot requires review and sends only the selected text on submit',async()=>{
 const selected='https://invoice.example.test/pay/987',image=new File(['fixture'],'Clipboard',{type:'image/png'});
 const page=mount({fileReader:async file=>{assert.match(file.name,/Pasted image 1\.png$/);return {records:[{source:'Photo · QR code',text:selected},{source:'Photo · Recognised text',text:'Unselected private line'}],notices:[]};},respond:call=>Response.json({check:check(call.body.message,{evidence:call.body.evidence}),trial})});
 await settle();const input=page.query('#message');let prevented=false;
 input.onpaste({clipboardData:{items:[{kind:'string',type:'text/plain'}]},preventDefault(){prevented=true;}});assert.equal(prevented,false);
 await page.query('#message').onpaste({clipboardData:{items:[{kind:'file',type:'image/png',getAsFile:()=>image}]},preventDefault(){prevented=true;}});
 assert.equal(prevented,true);assert.equal(page.query('#workspace-check').hidden,false);assert.equal(page.query('#file-review').open,true);assert.equal(page.query('#file-review-add').disabled,true);
 const box=page.query('#file-review-list').children[0].querySelector('input');box.checked=true;box.onchange();page.query('#file-review-add').click();
 assert.equal(page.calls.filter(c=>c.method==='POST').length,0);await submit(page);
 const posts=page.calls.filter(c=>c.method==='POST');assert.equal(posts.length,1);assert.deepEqual(posts[0].body.evidence.map(r=>r.text),[selected]);assert.doesNotMatch(JSON.stringify(posts[0].body),/Unselected private line|base64|fixture/);
});

test('a separate incident stays editable and moves to a new draft only when requested',async()=>{
 const saved=check('First supplier request'),message='A separate recruiter requests vouchers.';
 const page=mount({initialChecks:[saved],respond:call=>call.method==='GET'?Response.json({check:saved}):Response.json({code:'NEW_CHECK_REQUIRED',message:'Start a new check for this incident.'},{status:409})});
 await settle();await selectCheck(page,'First supplier request');page.query('#followup-message').value=message;
 await page.query('#followup-form').onsubmit({preventDefault(){}});
 assert.equal(page.query('#followup-message').value,message);
 const start=page.query('#check-status').children.find(el=>el.textContent==='Start a new check');assert.ok(start);
 start.onclick();assert.equal(page.query('#message').value,message);assert.equal(page.query('#check-detail-view').hidden,true);
 assert.equal(page.calls.filter(c=>c.method==='POST'&&c.path==='/api/checks').length,0);
});

test('a document can be reviewed and attached in an existing conversation before the follow-up is assessed',async()=>{
 let saved=check('Compare this supplier invoice.');
 const page=mount({initialChecks:[saved],fileReader:async()=>({records:[{source:'Statement · selected entry',text:'Paid the supplier £100.'}],notices:[]}),respond:call=>{
  if(call.method==='GET')return Response.json({check:saved});
  if(call.method==='PATCH'){saved={...saved,evidence:call.body.evidence};return Response.json({check:saved,trial});}
  assert.equal(call.path,'/api/checks/check_saved/replies');assert.match(call.body.message,/compare these additional records/);return Response.json({check:saved,trial});
 }});await settle();await selectCheck(page,'Compare this supplier invoice.');
 page.query('#followup-statement').click();
 await page.query('#files').onchange({target:{value:'statement.csv',files:[{name:'statement.csv',size:20}]}});
 assert.equal(page.query('#file-review').open,true);const box=page.query('#file-review-list').children[0].querySelector('input');box.checked=true;box.onchange();page.query('#file-review-add').click();
 assert.equal(page.query('#followup-attachments').children.length,1);
 await page.query('#followup-form').onsubmit({preventDefault(){}});
 const writes=page.calls.filter(c=>['PATCH','POST'].includes(c.method));assert.deepEqual(writes.map(c=>c.method),['PATCH','POST']);assert.equal(writes[0].body.evidence[0].text,'Paid the supplier £100.');assert.equal(page.query('#followup-attachments').children.length,0);
});

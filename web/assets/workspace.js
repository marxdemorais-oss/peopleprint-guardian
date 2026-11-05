import {knownContactSource,isCompanyLookup} from './known-contact.js';
import {renderVerificationDetails} from './verification-details.js';
import {allowanceRenewal} from './allowance-renewal.js';
import {watchInspection} from './check-inspector.js';
import {takeHandoff,prepareHandoff} from './chat-tab.js';
import {wolfgangBridge} from './wolfgang-bridge.js';
import {activateVoice,bindVoiceToggle,setThinkingSound,speak,configureVoice,stopVoice} from './wolfgang-voice.js';
import {initShell} from './journey.js';
import {readImportFile} from './import-file.js';
import {createFilePicker} from './workspace-file-picker.js';
import {assessmentPresentation} from './assessment-presentation.js';
import {workspaceSignInURL} from './workspace-navigation.js';
import {createWorkspaceEmailPicker,selectedEmailRecord} from './workspace-email.js';

const $=selector=>document.querySelector(selector);
const state={profile:null,trial:null,checks:[],active:null,evidence:[],sequence:0,openSequence:0,noteDrafts:new Map(),busy:false,importing:false,analysisReady:false,storageReady:false};
const pendingFollowups=new Map();
const pendingRecords=()=>state.active?(pendingFollowups.get(state.active.id)||[]):state.evidence;
function setPending(records){if(state.active)pendingFollowups.set(state.active.id,records);else state.evidence=records;}
const evidenceId=prefix=>prefix+(crypto.randomUUID?.()||Array.from(crypto.getRandomValues(new Uint8Array(16)),n=>n.toString(16).padStart(2,'0')).join(''));
let stopInspection=()=>{},contextTimer=null,contextGeneration=0;
const generalHistory=[];
const statuses={draft:'Saved · not assessed',awaiting_connection:'Saved · not assessed',complete:'Checked',error:'Assessment incomplete'};
const text=(node,value)=>{node.textContent=value??'';};
function showNotice(node,message,error=false){node.hidden=!message;node.classList.toggle('error',error);text(node,message);}
function companion(message){text($('#companion-line'),message);}
function safeDate(value){const date=new Date(value);return Number.isNaN(date.valueOf())?'':date.toLocaleDateString('en-GB',{day:'numeric',month:'short'});}
function checkTitle(check){const title=check.title||check.message||check.evidence?.[0]?.source||'A closer look';return title.replace(/\s+/g,' ').trim().slice(0,95);}
const mailboxProofs=new Map();
const filePicker=createFilePicker({document,attach(records){
  if(state.busy||state.importing)throw Error('Wait for the current action to finish.');
  if((state.active?.evidence.length||0)+pendingRecords().length+records.length>12)throw Error('You can attach up to twelve records to one check.');
  const additions=records.map(record=>({...record,id:evidenceId('ev-file-')}));
  prepareDraft(state.active?.message||$('#message').value,[...(state.active?.evidence||[]),...pendingRecords(),...additions]);
  setPending([...pendingRecords(),...additions]);
  attachmentList();
  showNotice($(state.active?'#followup-upload-status':'#composer-feedback'),additions.length===1?'One record added to your draft.':additions.length+' records added to your draft.');
  wolfgangBridge.user('evidence-changed');
}});
const emailPicker=createWorkspaceEmailPicker({document,request,verifyOwner:verifyDraftOwner,chooseFile,attach(record){
  if(state.busy||state.importing)throw Error('Finish the current action before attaching an email.');
  const email=selectedEmailRecord(record,[...(state.active?.evidence||[]),...pendingRecords()]);
  prepareDraft(state.active?.message||$('#message').value,[...(state.active?.evidence||[]),...pendingRecords(),email]);
  setPending([...pendingRecords(),email]);
  if(record.originProof)mailboxProofs.set(email.id,record.originProof);
  attachmentList();
  showNotice($(state.active?'#followup-upload-status':'#composer-feedback'),'Email added for comparison.');
  wolfgangBridge.user('evidence-changed');
}});
function setBusy(value,label){
  state.busy=value;
  const blocked=value||state.importing;
  if(blocked){
    state.stopDictation?.();
    emailPicker.close();
  }
  $('#attach-email').disabled=blocked||!state.profile?.id||!state.storageReady;
  const controls=['#submit-check','#send-followup','#retry-assessment','#confirm-delete','#new-check','#attach-file','#choose-export','#choose-finance','#files','#message','#followup-message','#dictate','#attach-statement','#followup-file','#followup-statement','#followup-email'];
  for(const selector of controls)$(selector).disabled=blocked;
  const idleLabel=state.emailVerificationRequired?'Verify email to continue':'Send';
  const workingLabel=label||(state.analysisReady?'Checking…':'Saving…');
  $('#submit-check').querySelector('span').textContent=blocked?workingLabel:idleLabel;
  $('#attachment-list').querySelectorAll?.('button').forEach(button=>{button.disabled=blocked;});
}
function availability(){
 text($('#composer-hint'), state.analysisReady
   ? 'Your message and the records you choose stay together in Your checks.'
   : 'Saving keeps this in Your checks. You can add notes while assessments are unavailable.');
 $('#followup-form label').textContent=state.analysisReady?'Anything else Wolfgang should know?':'Add a note to this check';
 $('#followup-message').placeholder=state.analysisReady?'Add context or ask a follow-up…':'Add another detail to this check…';
 $('#send-followup').querySelector('span').textContent=state.analysisReady?'Send':'Save note';
 $('#send-followup').setAttribute('aria-label',state.analysisReady?'Send follow-up':'Save note');
 setBusy(false);
}

const watchRenewal=allowanceRenewal(refreshTrial);
function trialSummary(trial){
  if(trial)watchRenewal(trial.resetsAt);
  if(trial?.unlimited===true){state.trial=trial;$('#trial-summary').hidden=false;text($('#trial-balance'),'Unlimited Guardian checks');text($('#trial-explanation'),'You can return to any saved check and add a follow-up.');$('#trial-next').hidden=true;return;}
  if(!trial||!Number.isFinite(trial.remaining))return;
  state.trial=trial;const remaining=Math.max(0,trial.remaining),reserved=Math.max(0,Math.min(remaining,Number(trial.reserved)||0)),available=Math.max(0,remaining-reserved),link=$('#trial-next');$('#trial-summary').hidden=false;
  const kind=trial.source==='paid'?'plan':'free';
  text($('#trial-balance'),reserved?(available+' '+kind+' '+(available===1?'check':'checks')+' available · '+reserved+' in progress'):(remaining+' '+kind+' '+(remaining===1?'check':'checks')+' remaining'));
  const needsProfile=trial.canUnlockProfile&&!reserved,monthly=trial.period==='calendar_month',needsPlan=remaining===0&&trial.upgradeRequired;
  const reset=monthly&&trial.resetsAt?' Your allowance renews on '+new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(trial.resetsAt))+' at 00:00 UTC.':'';
  text($('#trial-explanation'),reserved?'An in-progress check temporarily reserves a credit. Follow-ups stay part of the same check.':monthly?(trial.source==='paid'?'Your plan includes '+trial.allowance+' checks per calendar month.':'Five free checks per calendar month.')+' Follow-ups on a completed check use no extra check.'+reset:needsProfile?'Complete your profile for five free checks per calendar month. A starter used this month counts towards the five.':needsPlan?'Your free checks are used. You can still read your results and follow up on a completed check.':'Follow-up questions and extra context stay part of the same check.');
  link.hidden=!(needsProfile||needsPlan);link.href=needsProfile?'/welcome?unlock=1':'/plans';
  link.textContent=needsProfile?'Complete my profile ↗':'View my allowance ↗';
}
async function refreshTrial(){
  try{const data=await request('/api/entitlements');trialSummary(data.trial);}catch{/* A temporary balance failure never blocks access to saved checks. */}
}
function updateTrialFrom(data){if(data?.trial)trialSummary(data.trial);}
function trialFailure(error){
  updateTrialFrom(error.data);
  if(error.status===402||error.data?.code==='PROFILE_REQUIRED'||error.data?.code==='TRIAL_EXHAUSTED'){
    refreshTrial();$('#trial-summary').scrollIntoView({behavior:'smooth',block:'nearest'});
    return true;
  }
  return false;
}
async function request(path,{method='GET',body,signal}={}){
  let response;
  try{response=await fetch(path,{method,signal,cache:'no-store',credentials:'same-origin',headers:body===undefined?{}:{'Content-Type':'application/json'},...(body===undefined?{}:{body:JSON.stringify(body)})});}catch{throw new Error('The connection dropped. Your text is still here. Please try again.');}
  let data;try{data=await response.json();}catch{throw new Error('Wolfgang could not load that response. Your text is still here.');}
  if(data.code==='JURY_ACCESS_REQUIRED'){location.assign(data.link||'/jury');throw Error(data.message);}
  if(!response.ok){const error=new Error(data.message||data.error||'That could not be completed. Please try again.');error.status=response.status;error.data=data;throw error;}return data;
}
const isMailboxEvidence=item=>item.id.startsWith('ev-mail-');
function discardMailboxEvidence(){
  state.ownerChanged=true;mailboxProofs.clear();
  state.evidence=state.evidence.filter(item=>!isMailboxEvidence(item));
  for(const [id,records] of pendingFollowups)pendingFollowups.set(id,records.filter(item=>!isMailboxEvidence(item)));
  attachmentList();
}
async function verifyDraftOwner(signal){
  const {profile}=await request('/api/profile',{signal});
  if(signal?.aborted)throw Error('Search cancelled.');
  if(!state.profile?.id||profile?.id!==state.profile.id){
    discardMailboxEvidence();
    throw Error('The signed-in account has changed. Sign back into your original Guardian account to continue this draft.');
  }
  state.ownerChanged=false;
}
function prepareDraft(message,evidence){
  // The server verifies origin only for a single, exact selected email.
  // Mixed attachments are supporting records, not a single originating mailbox.
  const originProof=evidence.length===1?mailboxProofs.get(evidence[0].id):null;
  const body={message,channel:originProof?'email':'other',evidence,expectedProfileId:state.profile?.id||undefined,...(originProof?{originProof}:{})};
  const proofs=evidence.filter(item=>mailboxProofs.get(item.id)?.auth).map(item=>[item.id,mailboxProofs.get(item.id)]);
  if(proofs.length)body.mailProofs=Object.fromEntries(proofs);
  if(new TextEncoder().encode(JSON.stringify(body)).byteLength>2*1024*1024){
    throw Error('This check is too large. Remove a record or use a shorter excerpt.');
  }
  return body;
}
async function saveDraft(message){
  if(state.ownerChanged||state.evidence.some(isMailboxEvidence))await verifyDraftOwner();
  try{
    return await request('/api/checks',{method:'POST',body:prepareDraft(message,state.evidence)});
  }catch(error){
    if(error.data?.code==='DRAFT_PROFILE_CHANGED')discardMailboxEvidence();
    throw error;
  }
}
function offerVerification(node,message=''){
  const withAttachments=state.evidence.length>0;
  showNotice(node,'Verify your email to start a personal check.'+(withAttachments?' This verification can carry the typed draft. Add your selected records again after signing in.':''));
  const link=document.createElement('a');
  link.className='text-link';link.textContent=message?'Verify email and bring this draft':'Verify email';
  link.href='/signup?return_to='+encodeURIComponent('/workspace?start=check');
  link.onclick=async event=>{
    if(!message&&!withAttachments)return;
    event.preventDefault();
    try{
      const fragment=await prepareHandoff([],message);
      state.leavingForVerification=true;
      location.assign(link.href+fragment);
    }catch{showNotice(node,'This browser could not carry your draft. Copy the message, then open email verification.');const skip=document.createElement('a');skip.className='text-link';skip.href=link.href;skip.textContent='Open email verification';node.append(skip);}
  };
  node.append(document.createTextNode(' '),link);
}
function setHistoryOpen(open){
  $('#history-panel').dataset.expanded=String(open);
  $('#toggle-history').setAttribute('aria-expanded',String(open));
}
function history(){
  const root=$('#check-history');
  root.replaceChildren();
  const count=state.checks.length;
  text($('#check-count'),count||'');
  text($('#mobile-check-count'),count||'');
  const search=$('#history-search');
  $('#history-search-wrap').hidden=count<6;
  if(count<6)search.value='';
  const query=search.value.trim().toLocaleLowerCase();
  const checks=query?state.checks.filter(check=>checkTitle(check).toLocaleLowerCase().includes(query)):state.checks;
  if(!checks.length){
    const empty=document.createElement('p');
    empty.className='wk-history-empty';
    empty.textContent=query?'No matching titles. Try another word.':'Your saved messages and follow-ups will appear here.';
    root.append(empty);
    return;
  }
  for(const check of checks){
    const button=document.createElement('button');
    button.type='button';
    button.className='wk-history-item';
    button.dataset.checkId=check.id;
    button.setAttribute('aria-current',String(state.active?.id===check.id));
    const title=document.createElement('strong');
    const meta=document.createElement('span');
    text(title,checkTitle(check));
    text(meta,`${safeDate(check.updatedAt||check.createdAt)} · ${statuses[check.status]||'Saved'}`);
    button.append(title,meta);
    button.onclick=()=>openCheck(check.id);
    root.append(button);
  }
}
function updateHistory(check){const index=state.checks.findIndex(item=>item.id===check.id);if(index>=0)state.checks.splice(index,1);state.checks.unshift(check);history();}
function rememberNote(){const id=state.active?.id;if(!id)return;const value=$('#followup-message').value;if(value.trim())state.noteDrafts.set(id,value);else state.noteDrafts.delete(id);}
function useChatDraft(draft){
  if(state.busy||state.importing||filePicker.active)return false;
  showStart();$('#message').value=draft;return true;
}
function showStart(mode){
  $('#workspace-check').hidden=false;$('#new-check').hidden=false;
  $('#upload-start').hidden=mode!=='upload';
  $('#finance-start').hidden=mode!=='finance';
  $('#open-finance').hidden=mode==='finance';
  $('#message').placeholder=mode==='finance'?'For example, “Does the amount on this invoice match what I paid?”':'Ask Wolfgang, paste a message or explain what happened…';
  $('#input-note').hidden=mode==='finance';
  $('#compose-intro').hidden=Boolean(mode);$('#check-purpose').hidden=Boolean(mode);
  $('#new-check-view').setAttribute('aria-labelledby',mode?mode+'-heading':'workspace-heading');
}
function routeToNew({focusComposer=true}={}){
  if(state.busy||state.importing)return;
  emailPicker.close();
  showStart();
  rememberNote();
  state.openSequence++;
  $('#workspace-main').removeAttribute('aria-busy');
  state.active=null;stopInspection();$('#conversation-opening').replaceChildren();generalHistory.length=0;attachmentList();
  $('#followup-message').value='';
  $('#new-check-view').hidden=false;
  $('#check-detail-view').hidden=true;
  $('#delete-confirm').hidden=true;
  showNotice($('#workspace-error'),'');
  setHistoryOpen(false);
  history();
  historyURL();
  companion('You don’t have to work it out on your own.');
  wolfgangBridge.user('case-selected');
  if(focusComposer)$('#message').focus();
}
function historyURL(id){const url=new URL(location.href);url.searchParams.delete('start');if(id)url.searchParams.set('check',id);else url.searchParams.delete('check');window.history.replaceState(null,'',url.pathname+url.search);}
function checkSources(check){return [...new Map([...(check.evidence||[]),...(check.contextEvidence||[])].map(item=>[item.id,item])).values()];}
function evidenceDetails(check){
  const root=$('#check-evidence');root.replaceChildren();
  for(const item of check.evidence||[]){
    const details=document.createElement('details');details.id='source-'+item.id;
    const summary=document.createElement('summary'),body=document.createElement('p');
    text(summary,(item.sourceCheckId?'Earlier context: ':'')+item.source);text(body,item.text);details.append(summary,body);
    if(item.sourceCheckId){
      const origin=document.createElement('p'),link=document.createElement('a');origin.className='wk-source-origin';
      origin.append(document.createTextNode('An excerpt from a record you shared. Not independently verified. '));
      link.href='/workspace?check='+encodeURIComponent(item.sourceCheckId);link.textContent='Open the earlier check';origin.append(link);details.append(origin);
    }
    root.append(details);
  }
}
function renderCheck(check,{notice,loading=false}={}){
  const changedCheck=state.active?.id!==check.id;if(changedCheck){rememberNote();$('#followup-message').value=state.noteDrafts.get(check.id)||'';}state.active=check;$('#new-check').hidden=false;$('#new-check-view').hidden=true;$('#check-detail-view').hidden=false;$('#delete-confirm').hidden=true;historyURL(check.id);text($('#check-detail-title'),checkTitle(check));text($('#check-date'),safeDate(check.createdAt));text($('#check-original'),check.message);evidenceDetails(check);history();
  if(changedCheck){setHistoryOpen(false);emailPicker.close();}
  attachmentList();renderUsedContext(check);stopInspection();stopInspection=watchInspection(check.id,$('#inspection-events'),$('#inspection-status'),{live:loading});$('#inspection-link').href='/inspector?check='+encodeURIComponent(check.id);
  const result=check.result;$('#assessment').hidden=!result;$('#missing-context').hidden=!result?.questions?.length;
  if(result){const judgement=assessmentPresentation(result.status);$('#assessment').dataset.verdict=judgement.tone;text($('#assessment-label'),judgement.symbol+' '+judgement.label+' · '+judgement.action);text($('#assessment-title'),result.headline);text($('#assessment-explanation'),result.explanation);text($('#assessment-next'),result.nextStep);const sourceRoot=$('#assessment-sources');sourceRoot.replaceChildren();for(const id of result.evidenceIds||[]){const evidence=checkSources(check).find(item=>item.id===id);if(!evidence)continue;const button=document.createElement('button');button.type='button';text(button,evidence.source);button.onclick=()=>{const target=document.getElementById('source-'+id);if(target){target.open=true;target.scrollIntoView({behavior:'smooth',block:'center'});}wolfgangBridge.user('evidence-selected');};sourceRoot.append(button);}renderVerificationDetails(sourceRoot,result);const questions=$('#assessment-questions');questions.replaceChildren();for(const value of result.questions||[]){const p=document.createElement('p');text(p,value);questions.append(p);}companion(result.status==='caution'?'Let’s pause and look at what doesn’t add up.':'A little clarity. A practical next step.');}
  else companion(loading?'Let’s give this a proper look.':'Your story is here. We’ll take it one detail at a time.');
  const thread=$('#reply-thread');thread.replaceChildren();for(const [index,reply] of (check.replies||[]).entries()){if(result&&reply.role==='assistant'&&index===check.replies.length-1)continue;const item=document.createElement('div');item.className='wk-thread-item '+(reply.role==='assistant'?'assistant':'user');const label=document.createElement('span'),content=document.createElement('p');text(label,reply.role==='assistant'?'Wolfgang':'You');text(content,reply.content);item.append(label,content);thread.append(item);}
  $('#check-status').dataset.verdict=result?assessmentPresentation(result.status).tone:'unassessed';
  const message=notice||(loading?(state.analysisReady?'Wolfgang is looking at your message and the records you shared.':'Saving your message and selected records…'):check.status==='awaiting_connection'?'Your message is saved and has not been assessed.':!result?(state.analysisReady?'Not assessed. Your message is saved. You can add context below or ask Wolfgang to check it.':'Saved for later. No assessment has been made. You can add a note below.'):'');showNotice($('#check-status'),message);$('#retry-assessment').hidden=Boolean(loading||result||!state.analysisReady);$('#followup-form').hidden=loading;showNotice($('#workspace-error'),'');
  if(changedCheck){
    const title=$('#check-detail-title');
    title.setAttribute('tabindex','-1');
    title.focus({preventScroll:true});
    title.scrollIntoView({block:'nearest'});
  }
}
async function openCheck(id){
  if(state.busy||state.importing)return;const opening=++state.openSequence;showNotice($('#workspace-error'),'');$('#workspace-main').setAttribute('aria-busy','true');
  try{const data=await request('/api/checks/'+encodeURIComponent(id));if(opening!==state.openSequence)return;renderCheck(data.check);wolfgangBridge.user('case-selected');}catch(error){if(opening!==state.openSequence)return;if(error.status===401){location.href=workspaceSignInURL(location.href);return;}showNotice($('#workspace-error'),error.message,true);}finally{if(opening===state.openSequence)$('#workspace-main').removeAttribute('aria-busy');}
}
function thinking(active){
  document.querySelector('.wk-companion-visual').dataset.thinking=String(active);
  if(active)stopVoice();
  setThinkingSound(active);
}
async function assess(check){
  if(!state.analysisReady){renderCheck(check,{notice:'Saved for later. No assessment has been made.'});return;}
  const requestId='check-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));wolfgangBridge.begin(requestId);thinking(true);renderCheck(check,{loading:true});
  try{const data=await request('/api/checks/'+encodeURIComponent(check.id)+'/assess',{method:'POST',body:{}});updateTrialFrom(data);updateHistory(data.check);renderCheck(data.check);if(data.check.result)wolfgangBridge.complete(requestId,data.check.result);}
  catch(error){wolfgangBridge.fail(requestId);trialFailure(error);const saved=error.data?.check||check;updateHistory(saved);renderCheck(saved,{notice:error.status===503?'Your message is saved and has not been assessed.':error.message});}finally{thinking(false);wolfgangBridge.cancel(requestId);await refreshTrial();}
}
function attachmentList(){const root=$(state.active?'#followup-attachments':'#attachment-list');root.replaceChildren();for(const item of pendingRecords()){const row=document.createElement('div');row.className='wk-attachment';const info=document.createElement('span'),small=document.createElement('small'),remove=document.createElement('button');info.textContent=item.source;small.textContent=(item.source===knownContactSource||isCompanyLookup(item))?item.text:item.text.length.toLocaleString()+' characters · selected for comparison';info.append(small);remove.type='button';remove.setAttribute('aria-label','Remove '+item.source);remove.textContent='×';remove.onclick=()=>{setPending(pendingRecords().filter(e=>e.id!==item.id));mailboxProofs.delete(item.id);attachmentList();wolfgangBridge.user('evidence-changed');};row.append(info,remove);root.append(row);}}
function contextRows(root,records){root.replaceChildren();for(const record of records){const details=document.createElement('details'),summary=document.createElement('summary'),note=document.createElement('p'),excerpt=document.createElement('p'),link=document.createElement('a');details.id='source-'+record.id;summary.textContent=record.source;note.textContent=record.retrievalReason||'A record you shared; not independently confirmed.';excerpt.textContent=record.text;link.href='/workspace?check='+encodeURIComponent(record.sourceCheckId);link.textContent='Open source conversation';details.append(summary,note,excerpt,link);root.append(details);}}
function renderUsedContext(check){const records=check.contextEvidence||[];contextRows($('#used-context-records'),records);if(!records.length)$('#used-context-records').textContent='No matching earlier records were used. You can add relevant context below.';}
async function previewContext(){const generation=++contextGeneration,message=$('#message').value.trim();if(!message){$('#context-preview-status').textContent='Describe what happened. Relevant records you shared earlier will appear here.';$('#context-preview-records').replaceChildren();return;}try{const data=await request('/api/context/preview',{method:'POST',body:{message}});if(generation!==contextGeneration||message!==$('#message').value.trim())return;contextRows($('#context-preview-records'),data.records);$('#context-preview-status').textContent=data.records.length?data.records.length+' possible connections in your saved records. Wolfgang will compare these when you send.':'No relevant earlier record found. You can add an agreement, message or statement if it would help.';}catch{if(generation===contextGeneration)$('#context-preview-status').textContent='Earlier context could not be loaded. You can still attach the records you want to use.';}}
function generalTurn(role,content){const row=document.createElement('div');row.className='wk-thread-item '+role;const label=document.createElement('strong'),body=document.createElement('p');label.textContent=role==='user'?'You':'Wolfgang';body.textContent=content;row.append(label,body);$('#conversation-opening').append(row);}
async function tryGeneral(message){if(state.evidence.length||message.length>4000)return false;try{const data=await request('/api/wolfgang/chat',{method:'POST',body:{message,history:generalHistory.slice(-10).reduceRight((kept,turn)=>{if(turn.content.length<=4000&&kept.reduce((sum,item)=>sum+item.content.length,0)+turn.content.length<=16000)kept.unshift(turn);return kept;},[])}});if(typeof data.reply!=='string')throw Error('Wolfgang did not return a readable reply.');generalTurn('user',message);generalTurn('assistant',data.reply);generalHistory.push({role:'user',content:message},{role:'assistant',content:data.reply});$('#message').value='';wolfgangBridge.user('message-input');return true;}catch(error){if(error.data?.code==='CHECK_REQUIRED')return false;throw error;}}
let importMode='',importTrigger;
function chooseFile(button,mode=''){
  if(state.busy||state.importing||filePicker.active)return;
  importMode=mode;
  importTrigger=button;
  const files=$('#files');
  files.accept=mode==='finance'?'.pdf,.csv,.txt,.docx,.png,.jpg,.jpeg,.webp':'.txt,.zip,.xml,.eml,.mbox,.csv,.pdf,.docx,.png,.jpg,.jpeg,.webp';
  files.click();
}
$('#attach-file').onclick=()=>chooseFile($('#attach-file'),$('#finance-start').hidden?'':'finance');
$('#choose-export').onclick=()=>chooseFile($('#choose-export'));
$('#choose-finance').onclick=()=>chooseFile($('#choose-finance'),'finance');
$('#attach-statement').onclick=()=>chooseFile($('#attach-statement'),'finance');
$('#followup-file').onclick=()=>chooseFile($('#followup-file'));
$('#followup-statement').onclick=()=>chooseFile($('#followup-statement'),'finance');
$('#followup-email').onclick=()=>emailPicker.open();
$('#open-finance').onclick=event=>{
  event.preventDefault();
  if(state.busy||state.importing||filePicker.active)return;
  showStart('finance');
  window.history.replaceState(null,'','/workspace?start=finance');
  $('#choose-finance').focus();
};
async function reviewFiles(files,mode,trigger){
  if(state.busy||state.importing||filePicker.active)return;
  const remaining=12-(state.active?.evidence.length||0)-pendingRecords().length;
  if(!remaining){showNotice($('#composer-feedback'),'This check already has twelve records. Remove one to add another.');return;}
  const candidates=[],notices=[];
  state.importing=true;setBusy(false,'Reading your files…');
  showNotice($(state.active?'#followup-upload-status':'#composer-feedback'),'Reading on this device. Photos and scanned pages may take a moment.');
  try{
    for(const file of files.slice(0,12)){
      if(candidates.length>=1000){notices.push('The preview holds 1,000 records. Open the remaining files separately.');break;}
      try{
        if(mode==='finance'&&!/\.(pdf|csv|txt|docx|png|jpe?g|webp)$/i.test(file.name))throw Error('Choose a financial document or a PNG, JPEG or WebP image.');
        const imported=await readImportFile(file,1000-candidates.length,mode);
        candidates.push(...imported.records);
        const shown=imported.notices.slice(0,5);
        notices.push(...shown.map(note=>file.name+' · '+note));
        if(shown.length<imported.notices.length)notices.push(file.name+' has '+(imported.notices.length-shown.length)+' more import notices.');
      }catch(error){notices.push(file.name+' could not be added. '+error.message);}
    }
    if(files.length>12)notices.push('The preview opens twelve files at a time. Open the remaining files separately.');
  }finally{state.importing=false;setBusy(false);}
  if(candidates.length){showNotice($(state.active?'#followup-upload-status':'#composer-feedback'),'');filePicker.open(candidates,notices,remaining,trigger||$('#attach-file'),{preselectSingle:mode!=='finance'});}
  else showNotice($(state.active?'#followup-upload-status':'#composer-feedback'),notices.join('\n'),Boolean(notices.length));
}
$('#files').onchange=event=>{
  const files=Array.from(event.target.files);event.target.value='';
  return reviewFiles(files,importMode,importTrigger);
};
function pasteImage(event){
  if(state.busy||state.importing||filePicker.active)return;
  const items=Array.from(event.clipboardData?.items||[]).filter(item=>item.kind==='file'&&item.type.startsWith('image/'));
  if(!items.length)return; // ordinary pasted text follows normal textarea behavior
  event.preventDefault();
  const files=items.map((item,index)=>{
    const file=item.getAsFile();if(!file)return null;
    const ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}[item.type];
    return ext&&!/\.(png|jpe?g|webp)$/i.test(file.name)?new File([file],'Pasted image '+(index+1)+'.'+ext,{type:item.type}):file;
  }).filter(Boolean);
  return reviewFiles(files,$('#finance-start').hidden?'':'finance',$('#message'));
}
$('#message').addEventListener('paste',event=>pasteImage(event));
$('#followup-message').addEventListener('paste',event=>pasteImage(event));
$('#message').addEventListener('input',()=>{wolfgangBridge.user('message-input');clearTimeout(contextTimer);contextGeneration++;contextTimer=setTimeout(previewContext,600);});
$('#trial-next').onclick=async event=>{
  event.preventDefault();if(state.busy||state.importing)return;
  const destination=new URL(event.currentTarget.href,location.origin);
  const message=$('#message').value.trim();let check=state.active;
  if(!check&&(message||state.evidence.length)){
    setBusy(true,'Saving…');
    try{const data=await saveDraft(message);check=data.check;updateHistory(check);}
    catch(error){showNotice($('#composer-feedback'),'Your draft could not be saved. '+error.message,true);setBusy(false);return;}
  }
  destination.searchParams.set('return_to',check?'/workspace?check='+encodeURIComponent(check.id):'/workspace');
  location.assign(destination.pathname+destination.search);
};
$('#check-form').onsubmit=async event=>{
  event.preventDefault();if(state.busy||state.importing||filePicker.active)return;const message=$('#message').value.trim();if(!message&&!state.evidence.length){showNotice($('#composer-feedback'),'Paste a message, describe what happened, or add a readable record.');$('#message').focus();return;}
  if(state.emailVerificationRequired){offerVerification($('#composer-feedback'),message);return;}
  if(!state.storageReady||!state.profile){showNotice($('#composer-feedback'),'Your workspace is not connected to storage yet. Your text stays in this tab; nothing has been saved or assessed.',true);return;}
  setBusy(true,'Saving…');showNotice($('#composer-feedback'),'');activateVoice(state.analysisReady);
  try{if(await tryGeneral(message))return;const data=await saveDraft(message);updateTrialFrom(data);updateHistory(data.check);$('#message').value='';state.evidence=[];mailboxProofs.clear();attachmentList();if(state.analysisReady){setBusy(true,'Checking…');await assess(data.check);}else renderCheck(data.check,{notice:'Saved for later. No assessment has been made.'});}catch(error){if(error.data?.code==='SIGN_IN_REQUIRED')offerVerification($('#composer-feedback'),message);else{trialFailure(error);showNotice($('#composer-feedback'),error.message,true);}}finally{setBusy(false);}
};
$('#retry-assessment').onclick=async()=>{if(state.busy||!state.active)return;if(state.emailVerificationRequired){offerVerification($('#check-status'));return;}activateVoice(state.analysisReady);setBusy(true);try{await assess(state.active);}finally{setBusy(false);}};
$('#followup-form').onsubmit=async event=>{
  event.preventDefault();
  if(state.busy||!state.active)return;
  const input=$('#followup-message');
  const additions=[...pendingRecords()];
  const message=input.value.trim()||(additions.length?'Please compare these additional records with this request.':'');
  if(!message){input.focus();return;}
  if(state.emailVerificationRequired){offerVerification($('#check-status'),message);return;}
  const requestId='reply-'+(globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+'-'+Math.random().toString(36).slice(2));
  setBusy(true);
  $('#send-followup').querySelector('span').textContent=state.analysisReady?'Sending…':'Saving…';
  if(state.analysisReady){activateVoice(true);wolfgangBridge.begin(requestId);thinking(true);}
  showNotice($('#check-status'),state.analysisReady?'Sending your follow-up…':'Saving your note…');
  try{
    if(additions.length){const updated=await request('/api/checks/'+encodeURIComponent(state.active.id),{method:'PATCH',body:{evidence:[...state.active.evidence,...additions],mailProofs:Object.fromEntries(mailboxProofs)}});state.active=updated.check;pendingFollowups.delete(state.active.id);attachmentList();}
    stopInspection();stopInspection=watchInspection(state.active.id,$('#inspection-events'),$('#inspection-status'),{live:true});
    const data=await request('/api/checks/'+encodeURIComponent(state.active.id)+'/replies',{method:'POST',body:{message}});
    updateTrialFrom(data);
    input.value='';
    state.noteDrafts.delete(data.check.id);
    updateHistory(data.check);
    renderCheck(data.check,{notice:data.check.result?'':'Your note is saved with this check.'});
    if(state.analysisReady&&data.check.result)wolfgangBridge.complete(requestId,data.check.result);
  }catch(error){
    if(state.analysisReady)wolfgangBridge.fail(requestId);
    trialFailure(error);
    if(error.data?.check){
      input.value='';
      state.noteDrafts.delete(error.data.check.id);
      updateHistory(error.data.check);
      renderCheck(error.data.check,{notice:error.status===503?'Your note is saved with this check. No new assessment has been made.':error.message});
    }else{
      const notice=$('#check-status');
      showNotice(notice,error.message,true);
      if(['NEW_CHECK_REQUIRED','CASE_SCOPE_UNCLEAR'].includes(error.data?.code)){
        const start=document.createElement('button');
        start.type='button';start.className='wk-tool';start.textContent='Start a new check';
        start.onclick=()=>{
          if(state.busy||state.importing)return;
          if($('#message').value.trim()||state.evidence.length){showNotice(notice,'There is already an open draft. Finish it first. Your follow-up is still here.',true);return;}
          const draft=input.value.trim();
          state.noteDrafts.delete(state.active.id);input.value='';
          routeToNew();$('#message').value=draft;$('#message').focus();
        };
        notice.append(start);
      }
    }
  }finally{
    thinking(false);wolfgangBridge.cancel(requestId);
    availability();
    await refreshTrial();
  }
};
$('#read-result').onclick=()=>{if(!state.active?.result)return;activateVoice();speak(state.active.result.headline+'. '+state.active.result.explanation+' Your next step: '+state.active.result.nextStep);};
$('#new-check').onclick=routeToNew;
$('#toggle-history').onclick=()=>setHistoryOpen($('#toggle-history').getAttribute('aria-expanded')!=='true');
$('#history-search').addEventListener('input',history);
$('#back-to-compose').onclick=()=>{
  if(state.busy||state.importing)return;
  const previous=state.active?.id;
  routeToNew({focusComposer:false});
  setHistoryOpen(true);
  const links=Array.from($('#check-history').querySelectorAll('button'));
  const recent=links.find(link=>link.dataset.checkId===previous)||links[0];
  recent?.focus();
};
$('#delete-check').onclick=()=>{$('#delete-confirm').hidden=false;$('#confirm-delete').focus();};$('#cancel-delete').onclick=()=>{$('#delete-confirm').hidden=true;$('#delete-check').focus();};
$('#confirm-delete').onclick=async()=>{if(state.busy||!state.active)return;const id=state.active.id;setBusy(true);try{await request('/api/checks/'+encodeURIComponent(id),{method:'DELETE'});state.checks=state.checks.filter(item=>item.id!==id);state.noteDrafts.delete(id);$('#followup-message').value='';setBusy(false);routeToNew();showNotice($('#composer-feedback'),'That check and its saved messages have been deleted.');}catch(error){showNotice($('#workspace-error'),error.message,true);}finally{setBusy(false);}};

globalThis.addEventListener?.('pageshow',event=>{if(event.persisted)location.reload();});
globalThis.addEventListener?.('pagehide',()=>{stopInspection();thinking(false);emailPicker.close();});
globalThis.addEventListener?.('beforeunload',event=>{rememberNote();if(state.leavingForVerification&&!state.noteDrafts.size)return;if(state.busy||state.importing||$('#message').value.trim()||state.evidence.length||[...pendingFollowups.values()].some(records=>records.length)||state.noteDrafts.size){event.preventDefault();event.returnValue='';}});

function setupDictation(){
  const Recognition=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Recognition)return;const button=$('#dictate');button.hidden=false;let recognition=null,original='';
  state.stopDictation=()=>{if(recognition){const stopped=recognition;recognition=null;stopped.abort();button.setAttribute('aria-pressed','false');button.setAttribute('aria-label','Dictate your message');}};
  button.onclick=()=>{if(state.busy||state.importing)return;if(recognition){recognition.stop();return;}original=$('#message').value;recognition=new Recognition();const activeRecognition=recognition;recognition.lang='en-GB';recognition.interimResults=true;recognition.continuous=false;button.setAttribute('aria-pressed','true');button.setAttribute('aria-label','Stop dictation');showNotice($('#composer-feedback'),'Listening. Your browser may ask for microphone access.');recognition.onresult=event=>{if(recognition!==activeRecognition||state.busy||state.importing)return;const transcript=Array.from(event.results).map(r=>r[0].transcript).join(' ');$('#message').value=(original+(original?'\n':'')+transcript);wolfgangBridge.user('message-input');};recognition.onerror=event=>{if(recognition!==activeRecognition||state.busy||state.importing)return;showNotice($('#composer-feedback'),event.error==='not-allowed'?'Microphone access was not allowed. You can type your message instead.':'Dictation stopped. You can keep typing or try the microphone again.');};recognition.onend=()=>{if(recognition!==activeRecognition)return;recognition=null;button.setAttribute('aria-pressed','false');button.setAttribute('aria-label','Dictate your message');if($('#composer-feedback').textContent.startsWith('Listening.'))showNotice($('#composer-feedback'),'');};try{recognition.start();}catch{recognition=null;button.setAttribute('aria-pressed','false');showNotice($('#composer-feedback'),'Dictation is unavailable in this browser. You can type instead.');}};
}
async function start(){
  initShell({page:'workspace'});bindVoiceToggle($('#workspace-sound'));setupDictation();
  const results=await Promise.allSettled([request('/api/profile'),request('/api/checks'),request('/api/product-config'),request('/api/wolfgang/config'),request('/api/entitlements')]);
  const [profile,checks,config,voice,entitlements]=results;
  if(profile.status==='fulfilled'){
    state.profile=profile.value.profile;
    updateTrialFrom(profile.value);
    const name=state.profile.displayName?.trim().split(/\s+/)[0];
    if(name)text($('#workspace-greeting'),'Hello, '+name);
  }
  else if(profile.reason.status===401){location.href=workspaceSignInURL(location.href);return;}else showNotice($('#workspace-error'),'Your account could not be loaded. Please refresh before saving a check.',true);
  if(checks.status==='fulfilled'){state.checks=checks.value.checks||[];history();}else{text($('#check-history'),'Your checks could not load. Refresh to try again.');}
  if(config.status==='fulfilled'){state.analysisReady=config.value.analysisReady;state.storageReady=config.value.storageReady;}else showNotice($('#workspace-error'),'Your workspace connection could not be checked. Please refresh before sending.',true);
  availability();
  if(voice.status==='fulfilled'){state.emailVerificationRequired=voice.value.emailVerificationRequired===true;configureVoice(voice.value.voiceReady,voice.value.voiceProofRequired);setBusy(false);}
  if(entitlements.status==='fulfilled')trialSummary(entitlements.value.trial);
  const params=new URL(location.href).searchParams,checkId=params.get('check'),startMode=params.get('start');
  let handoff=null;
  const fragment=new URL(location.href).hash;
  if(state.profile?.id && /^#continue=[a-f0-9]{64}$/.test(fragment)){
    try{
      const session=await request('/api/session');
      if(!session.authenticated||session.legacy===true){location.replace('/signup?return_to='+encodeURIComponent('/workspace?start='+(startMode==='chat'?'chat':'check'))+fragment);return;}
    }catch{showNotice($('#workspace-error'),'Your sign-in could not be verified. Refresh this page to reopen the temporary draft.',true);return;}
    handoff=await takeHandoff(fragment);window.history.replaceState(null,'',location.pathname+location.search);
  }
  if(checkId)await openCheck(checkId);
  else if(startMode==='upload'||startMode==='finance'){
    showStart(startMode);
    $(startMode==='finance'?'#choose-finance':'#choose-export').focus();
  }else if(startMode==='email'){
    showStart();await emailPicker.open(params.get('provider'));
  }else if(startMode==='paste'||startMode==='check'){showStart();$('#message').focus({preventScroll:true});}
  else showStart();
  if(handoff?.draft){useChatDraft(handoff.draft);}
  else if(fragment.startsWith('#continue=')&&!handoff){showNotice($('#workspace-error'),'Your temporary handoff expired or could not be opened. You can paste the message here again.');}

}
start();

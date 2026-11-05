import {initShell,api} from './journey.js';
import {watchInspection} from './check-inspector.js';
import {renderVerificationDetails} from './verification-details.js';
initShell({page:'workspace'});
const $=s=>document.querySelector(s);let stop=()=>{},generation=0;
async function select(id){stop();const current=++generation;$('#inspector-events').replaceChildren();$('#inspector-sources').hidden=true;if(!id)return;
 history.replaceState(null,'','/inspector?check='+encodeURIComponent(id));$('#inspector-back').href='/workspace?check='+encodeURIComponent(id);
 let completed='';
 async function sources(){try{const {check}=await api('/api/checks/'+encodeURIComponent(id));if(current!==generation)return;const root=$('#inspector-evidence');root.replaceChildren();for(const record of [...check.evidence,...check.contextEvidence]){const details=document.createElement('details'),summary=document.createElement('summary'),body=document.createElement('p');summary.textContent=(record.sourceCheckId?'Earlier context: ':'Selected evidence: ')+record.source;body.textContent=record.text;details.append(summary,body);root.append(details);}$('#inspector-findings').replaceChildren();if(check.result)renderVerificationDetails($('#inspector-findings'),check.result);$('#inspector-sources').hidden=false;}catch{$('#inspector-status').textContent='This conversation could not be opened.';}}
 stop=watchInspection(id,$('#inspector-events'),$('#inspector-status'),{live:true,expanded:true,onChange:data=>{const last=data.events?.at(-1);if(last?.kind==='saved'&&completed!==last.attemptId){completed=last.attemptId;void sources();}}});
 await sources();
}
$('#inspector-check').onchange=e=>select(e.target.value);window.addEventListener('pagehide',()=>stop());
try{const {checks}=await api('/api/checks');for(const check of checks){const option=document.createElement('option');option.value=check.id;option.textContent=check.title||check.message||'Saved conversation';$('#inspector-check').append(option);}const id=new URL(location.href).searchParams.get('check');if(id){$('#inspector-check').value=id;await select(id);}else $('#inspector-status').textContent=checks.length?'Choose a conversation to see its recorded actions.':'Start a conversation with Wolfgang, then return here to follow the check.';}catch{$('#inspector-status').textContent='Your conversations could not be loaded. Sign in and try again.';}

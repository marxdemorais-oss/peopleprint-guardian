import {exampleInvoiceReference} from './guided-invoice-source.js';
import {tourTopics,tourInvoice,tourAgreement,tourQuestion,tourAngle} from './guided-invoice.js';
import {activateVoice,bindVoiceToggle,setThinkingSound,stopVoice} from './wolfgang-voice.js';

const $=s=>document.querySelector(s);
const advance=$('#tour-advance'),form=$('#tour-form'),question=$('#tour-question');
const thread=$('#tour-thread'),status=$('#tour-status'),portrait=$('.tour-portrait');
let stage='invoice',started=false,active=null;
const readings=new Map();
$('#tour-invoice').textContent=tourInvoice;
$('#tour-agreement').textContent=tourAgreement;
bindVoiceToggle($('#tour-audio'));
const config=fetch('/api/wolfgang/config',{credentials:'same-origin',signal:AbortSignal.timeout(5000)})
  .then(r=>r.ok?r.json():null).catch(()=>null);
function add(who,text){
  const p=document.createElement('p'),label=document.createElement('b');
  p.className='tour-turn';label.textContent=who;p.append(label,document.createTextNode(text));thread.append(p);
  while(thread.children.length>14)thread.firstElementChild.remove();
  thread.scrollTop=thread.scrollHeight;
}
function busy(on){
  portrait.dataset.thinking=String(on);setThinkingSound(on);
  thread.setAttribute('aria-busy',String(on));advance.disabled=on;$('#tour-source').disabled=on;form.querySelector('button').disabled=on;
}
async function ask(intent,angle=null){
  if(active)return;
  const preset='tour-'+stage+'-'+intent,item=tourTopics.get(preset);
  const request=new AbortController();active=request;
  const timeout=setTimeout(()=>request.abort(),intent==='source'?32000:28000);
  activateVoice(true);busy(true);status.textContent='Wolfgang is thinking…';
  const lastReading=readings.get(preset);
  let reading=lastReading===0?1:0,reply=item.readings?.[reading]||item.answer,live=false,source=null,reason=null;
  try{
    if(intent==='source'||(await config)?.conversationReady!==false){
      const res=await fetch('/api/wolfgang/chat',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({preset,...(angle?{angle}:{}),...(lastReading===undefined?{}:{lastReading})}),signal:request.signal});
      if(res.ok){
        const result=await res.json();reason=result.tourReason;
        if(result.tourSource==='official'&&intent==='source'&&result.publicResearch?.publisher==='takeFive'&&result.publicResearch?.status==='published'){
          if(result.publicResearch.url===exampleInvoiceReference.url){source={url:exampleInvoiceReference.url,at:result.publicResearch.checkedAt};reply=result.reply;}
        }else if(['live','prepared'].includes(result.tourSource)&&typeof result.reply==='string'&&result.reply.trim()){
          reply=result.reply;live=result.tourSource==='live';reading=result.reading??reading;
        }
      }
    }
  }catch{/* The authored walkthrough is always available. */}
  finally{
    clearTimeout(timeout);
    if(active===request){
      active=null;busy(false);if(item.readings)readings.set(preset,reading);add('Wolfgang',reply);
      if(source){
        const link=document.createElement('a');link.href=source.url;link.target='_blank';link.rel='noopener noreferrer';link.className='text-link';link.textContent='Read the published guidance';thread.lastElementChild.append(document.createElement('br'),link);
        status.textContent='Official passage checked '+new Date(source.at).toLocaleDateString('en-GB');
      }else if(intent==='source'){
        const date=new Date(exampleInvoiceReference.reviewedAt).toLocaleDateString('en-GB',{dateStyle:'long',timeZone:'UTC'});
        const label=reason==='limit'?'The live preview allowance has been used.':'No fresh passage was confirmed on this turn.';
        thread.lastElementChild.lastChild.textContent='The guidance reviewed for this example says: “'+exampleInvoiceReference.quote+'”';
        status.textContent=label+' Previously checked '+date+'.';
        const link=document.createElement('a');link.href=exampleInvoiceReference.url;link.target='_blank';link.rel='noopener noreferrer';link.className='text-link';link.textContent='Open Take Five’s original guidance';thread.lastElementChild.append(document.createElement('br'),link);
      }else{
        const note={limit:'Live preview allowance used',cookie:'First-party cookie unavailable',meter_unavailable:'Live service unavailable',model_reply:'Live reply unavailable',configuration:'Live service unavailable'}[reason];
        status.textContent=live?'AI-guided explanation · fictional example':'Prepared walkthrough'+(note?' · '+note:' · fictional example');
      }
      form.hidden=false;
    }
  }
}
advance.addEventListener('click',()=>{
  if(active)return;
  if(!started){
    started=true;advance.textContent='Open the earlier agreement';
    const preset='tour-invoice-overview';add('Wolfgang',tourTopics.get(preset).answer);readings.set(preset,0);form.hidden=false;
    status.textContent='First reading · fictional example';return;
  }else{
    stage='agreement';$('#tour-record').hidden=false;advance.hidden=true;$('#tour-record-heading').focus();
    add('Jamie','I’ve added the earlier payment agreement.');
  }
  void ask('overview');
});
$('#tour-source').addEventListener('click',()=>{if(stage==='agreement'&&!active)void ask('source');});
form.addEventListener('submit',event=>{
  event.preventDefault();
  const text=question.value.trim();
  if(!text||active)return;
  const intent=tourQuestion(text);
  if(!intent){
    status.textContent='I can walk you through the invoice, the sender or the next step. For your own situation, open a personal check below.';
    return;
  }
  add('You',text);question.value='';void ask(intent,tourAngle(text));
});
window.addEventListener('pagehide',()=>{
  if(active){active.abort();active=null;status.textContent='The reply was interrupted. You can ask about the example again.';form.hidden=false;}
  busy(false);stopVoice();
});

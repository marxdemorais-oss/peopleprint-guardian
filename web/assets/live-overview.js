import {api} from './journey.js';
const id=name=>document.getElementById(name),panel=id('live-overview'),list=id('live-warnings');
const labels={gmail:'Gmail',outlook:'Outlook',mailbox:'Mailbox'};
const date=stamp=>new Date(stamp).toLocaleString(undefined,{dateStyle:'medium',timeStyle:'short'});
const node=(tag,value)=>{const el=document.createElement(tag);if(value!=null)el.textContent=value;return el;};
let timer,version=0,active=false;
function itemView(item){
 const li=node('li'),title=node('strong',item.subject||'Inbox message'),when=node('small',(labels[item.provider]||'Mailbox')+' · Received '+date(item.receivedAt));
 li.append(title,when,node('p',item.reason));
 const detail=node('details');detail.append(node('summary',item.earlierCheck?'Compare the details':'Review the message clue'));
 detail.append(node('strong','New inbox preview'),node('p',item.excerpt),node('small',item.sender?'Displayed sender: '+item.sender:'Sender not supplied.'));
 if(item.earlierCheck){
  const link=node('a',item.earlierTitle||'Open the earlier saved email');
  link.href='/workspace?check='+encodeURIComponent(item.earlierCheck);
  detail.append(node('strong','Earlier saved email'),link,node('p',item.earlierDetail));
 }
 detail.append(node('p',item.action));li.append(detail);
 const remove=node('button','Dismiss');remove.type='button';remove.onclick=async()=>{
  remove.disabled=true;try{await api('/api/watch/items/'+encodeURIComponent(item.id),{method:'DELETE'});await load();}
  catch{remove.disabled=false;id('live-status').textContent='This item could not be dismissed. Try again.';}
 };li.append(remove);return li;
}
async function load(){
 clearTimeout(timer);const current=++version;
 try{
  const state=await api('/api/watch');if(current!==version)return;
  active=state.eligible===true;panel.hidden=!active;list.replaceChildren();if(!active)return;
  const selected=state.sources.filter(s=>s.id),available=selected.filter(s=>s.supported);
  id('live-description').textContent=state.items.length?'New inbox previews with a specific detail to check.':
   !selected.length?'No sources are being monitored. Choose a mailbox in Connections to get started.':
   !available.length?'Monitoring is paused. Open Connections to see source availability.':
   !available.some(s=>s.checkedThrough)?'Waiting for the first completed inbox check.':'No items are waiting for review.';
  for(const item of state.items)list.append(itemView(item));list.hidden=!state.items.length;
  id('live-status').textContent=selected.map(s=>{
   const name=labels[s.provider]||'Mailbox';const status=!s.supported?'Paused. ':s.failed?'Latest check could not finish. ':s.catchingUp?'Checking more previews. ':'';
   return name+': '+status+(s.checkedThrough?'Checked through '+date(s.checkedThrough)+'.':'No completed check yet.');
  }).join(' ');
 }catch(error){
  if(current!==version)return;list.replaceChildren();list.hidden=true;
  if(error.status===401||error.status===403){active=false;panel.hidden=true;}
  else if(active){panel.hidden=false;id('live-description').textContent='';id('live-status').textContent='The latest inbox status could not be loaded. Try again.';}
 }finally{if(current===version&&active&&!document.hidden)timer=setTimeout(load,60_000);}
}
id('live-refresh').onclick=load;
document.addEventListener('visibilitychange',()=>{if(document.hidden){clearTimeout(timer);version++;}else load();});
window.addEventListener('pagehide',()=>{clearTimeout(timer);version++;panel.hidden=true;list.replaceChildren();});
window.addEventListener('pageshow',e=>{if(e.persisted)load();});load();

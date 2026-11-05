// Historical warnings from customer-initiated checks. This view never reads a mailbox.
import {api} from './journey.js';
const byId=id=>document.getElementById(id),panel=byId('assessed-warnings');
let cursor=null,next=null,request=0;
async function page(before=null){
 const key=++request;
 try{
  const data=await api('/api/live-warnings'+(before?'?before='+encodeURIComponent(before):''));
  if(request!==key)return;
  panel.hidden=data.access!=='full';if(panel.hidden)return;
  cursor=before;next=data.nextCursor||null;byId('assessed-older').hidden=!next;byId('assessed-latest').hidden=!before;
  const list=byId('assessed-list');list.replaceChildren();
  for(const item of data.items){const li=document.createElement('li'),a=document.createElement('a');
   a.href='/workspace?check='+encodeURIComponent(item.id);a.textContent=item.headline||'Open saved check';
   li.append(a,document.createTextNode(' · '+new Date(item.checkedAt).toLocaleString()));list.append(li);}
  byId('assessed-status').textContent=data.items.length?'':'No assessed messages have been flagged.';
 }catch{if(request===key&&!panel.hidden)byId('assessed-status').textContent='Saved warnings could not be loaded. Try again.';}
}
byId('assessed-refresh').onclick=()=>page(cursor);byId('assessed-older').onclick=()=>next&&page(next);byId('assessed-latest').onclick=()=>page();
window.addEventListener('pagehide',()=>{request++;panel.hidden=true;byId('assessed-list').replaceChildren();});
window.addEventListener('pageshow',event=>{if(event.persisted)page();});page();

import {api} from './journey.js';

const panel=document.getElementById('previous-login');
const description=document.getElementById('merge-description');
const send=document.getElementById('send-merge-code');
const form=document.getElementById('merge-form');
const code=document.getElementById('merge-code');
let email='',busy=false;
panel.addEventListener('toggle',async()=>{
 if(!panel.open||email||busy)return;
 try{
  const {candidate}=await api('/api/account/previous-login');
  if(!candidate){description.textContent='This browser has no matching earlier Guardian sign-in to link.';return;}
  email=candidate.email;
  description.textContent='Your earlier login is recognised. Verify '+email+' to bring your records together.';
  send.hidden=false;
 }catch(error){description.textContent=error.message;}
});
send.onclick=async()=>{
 if(busy)return;
 busy=true;send.disabled=true;
 try{
  await api('/api/auth/request-code',{method:'POST',body:{email,linkPrevious:true}});
  description.textContent='Enter the code emailed to '+email+'. It expires in 10 minutes.';
  send.textContent='Send another code';form.hidden=false;code.focus();
 }catch(error){description.textContent=error.message;}
 finally{busy=false;send.disabled=false;}
};
form.onsubmit=async event=>{
 event.preventDefault();if(busy)return;
 const button=form.querySelector('button');
 busy=true;send.disabled=true;button.disabled=true;
 try{
  await api('/api/auth/verify',{method:'POST',body:{email,code:code.value.trim(),linkPrevious:true}});
  description.textContent='Your accounts are linked. Your checks are together in your People Organised workspace.';
  send.hidden=true;form.hidden=true;
 }catch(error){description.textContent=error.message;code.value='';}
 finally{busy=false;send.disabled=false;button.disabled=false;}
};

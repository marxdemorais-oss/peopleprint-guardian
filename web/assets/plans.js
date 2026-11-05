import {allowanceRenewal} from './allowance-renewal.js';
import {initShell,api} from './journey.js';initShell({page:'account'});
const balance=document.querySelector('#plan-allowance');
const watchRenewal=allowanceRenewal(refreshBalance);
function refreshBalance(){return api('/api/entitlements').then(({trial})=>{
 watchRenewal(trial?.resetsAt);
 if(trial?.unlimited===true){balance.textContent='Unlimited Guardian checks. Your account has no free-check allowance limit.';return;}
 if(!trial||!Number.isInteger(trial.remaining)||!Number.isInteger(trial.allowance))throw new Error('Your allowance could not be checked.');
 const remaining=Math.max(0,trial.remaining),reserved=Math.min(remaining,Math.max(0,Number(trial.reserved)||0)),available=remaining-reserved,kind=trial.source==='paid'?'plan':'free';
 balance.textContent=reserved?available+' '+kind+' '+(available===1?'check':'checks')+' available; '+reserved+' in progress.':(remaining+' '+kind+' '+(remaining===1?'check':'checks')+' remaining')+' from your current allowance of '+trial.allowance+'.';
 if(trial.period==='calendar_month'&&trial.resetsAt){const date=new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(trial.resetsAt));balance.textContent+=' Your allowance renews to '+trial.allowance+' on '+date+' at 00:00 UTC.';}
 if(trial.canUnlockProfile){const link=document.createElement('a');link.className='j-text-button';link.href='/welcome?unlock=1';link.textContent='Complete your profile for five free checks each calendar month →';balance.append(document.createTextNode(' '),link);}
}).catch(error=>{balance.textContent=error.status===401?'Sign in again to see your allowance.':'Your allowance could not be checked. Return to your workspace to try again.';if(error.status===401){const link=document.createElement('a');link.className='j-text-button';link.href='/login?return_to=%2Fplans';link.textContent='Sign in again →';balance.append(document.createTextNode(' '),link);}});}
refreshBalance();

const requestButton=document.getElementById?.('live-request');
if(requestButton){
 const status=document.getElementById('live-request-status');
 function show(data){
  requestButton.hidden=data.eligible===true||data.requested===true;
  status.textContent=data.eligible===true?'Your plan includes inbox monitoring. Choose a source in Connections.':data.requested?'Your request is saved. No source has been enrolled.':'';
 }
 api('/api/watch').then(show).catch(()=>{status.textContent='Live-check availability could not be loaded. Refresh to try again.';});
 requestButton.onclick=async()=>{requestButton.disabled=true;try{show(await api('/api/watch/request',{method:'POST',body:{}}));}catch(error){status.textContent=error.message;}finally{requestButton.disabled=false;}};
}

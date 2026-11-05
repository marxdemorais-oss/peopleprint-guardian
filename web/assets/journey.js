import {initHeader} from './global-header.js';
export async function api(path, options = {}) {
  const {body, headers, ...rest} = options;
  let response;
  try { response = await fetch(path, {credentials:'same-origin', ...rest, headers:{...(body !== undefined ? {'Content-Type':'application/json'} : {}), ...headers}, ...(body !== undefined ? {body:JSON.stringify(body)} : {})}); }
  catch { throw Object.assign(new Error('You seem to be offline. Your text is still here. Please try again when you’re connected.'), {status:0}); }
  let data; try { data=await response.json(); } catch { data={}; }
  if(data.code==='JURY_ACCESS_REQUIRED'){location.assign('/jury?return_to='+encodeURIComponent(location.pathname+location.search));}
  if (!response.ok) throw Object.assign(new Error(data.message || data.error || (response.status===401?'Please sign in again to continue.':'That did not finish. Please try again.')), {status:response.status, data});
  return data;
}
export const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let noticeTimer;
export function notify(text){let box=document.querySelector('#journey-notice');if(!box){box=document.createElement('div');box.id='journey-notice';box.className='j-toast';box.setAttribute('role','status');document.body.append(box);}box.textContent=text;box.hidden=false;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>{box.hidden=true;},6500);}
export function initShell({page='workspace'}={}){
  initHeader({page});
  import('./wolfgang.js').then(({mountWolfgang})=>mountWolfgang()).catch(()=>{document.querySelectorAll('[data-wolfgang] .wolfgang-loading').forEach(label=>{label.textContent='Wolfgang could not load on this device.';});});
  // A portrait is used only when this device cannot render the model, never as a loading poster.
  document.querySelectorAll('[data-wolfgang]').forEach(stage=>{const fallback=()=>{if(stage.querySelector('.wolfgang-loading')?.textContent.includes('could not load')){stage.classList.add('j-wolfgang-unavailable');if(!stage.querySelector('.j-wolfgang-fallback')){const img=document.createElement('img');img.src='/assets/wolfgang-portrait.webp';img.alt='Wolfgang, your personal Guardian';img.className='j-wolfgang-fallback';stage.prepend(img);}observer.disconnect();}};const observer=new MutationObserver(fallback);observer.observe(stage,{childList:true,subtree:true,characterData:true});fallback();});
  document.querySelectorAll('[data-nav]').forEach(link=>{if(link.dataset.nav===page)link.setAttribute('aria-current','page');});
}

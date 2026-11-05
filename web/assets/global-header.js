import {clearTabChat} from './chat-tab.js';
// One product navigation and one set of session controls on every screen.
const privateDestinations=new Set(['workspace','connections','account','welcome','plans']);
let currentPage,session='unknown',sessionRequest,logoutPending=false,bound=false,sessionGeneration=0;
const pageFromPath=()=>location.pathname.split('/')[1]||'home';
export function signInDestination(href){
  let target='/workspace',fragment='';
  try{const url=new URL(href);if(/^#continue=[a-f0-9]{64}$/.test(url.hash)){fragment=url.hash;url.hash='';}if(!['/login','/signup'].includes(url.pathname)&&/^\/(?:workspace|welcome|connections|account|plans|demo|privacy|data-deletion|wolfgang-3d)?$/.test(url.pathname))target=url.pathname==='/'?'/workspace':url.pathname+url.search+url.hash;else{const requested=url.searchParams.get('return_to');if(requested&&/^\/(?:workspace|welcome|connections|account|plans|demo|privacy|data-deletion|wolfgang-3d)?(?:[?#]|$)/.test(requested)&&!/[\\\r\n]/.test(requested))target=requested;}}catch{}
  return '/login?return_to='+encodeURIComponent(target)+(/^\/workspace\?start=(chat|check)$/.test(target)?fragment:'');
}
export function headerMarkup({authenticated=false, pending=false, page='home', loginURL='/login'}={}) {
  const current = name => page === name ? ' aria-current="page"' : '';
  const safeURL = String(loginURL).replace(/[&<>"']/g, character => ({'&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'}[character]));
  const controls = authenticated
    ? `<a href="/account" data-nav="account"${current('account')}>Account</a><a href="/api/auth/logout" data-signout>Log out</a>`
    : pending ? '<span class="g-session-pending" aria-hidden="true"></span>' : `<a href="${safeURL}" data-login>Log in</a>`;
  const navigation = authenticated || pending && privateDestinations.has(page)
    ? `<a href="/workspace" data-nav="workspace"${current('workspace')}>Wolfgang</a><a href="/connections" data-nav="connections"${current('connections')}>Connections</a>`
    : `<a href="/#talk">Meet Wolfgang</a><a href="/demo"${current('demo')}>Examples</a>`;
  return `<a class="g-brand" href="/" aria-label="Peopleprint Guardian home"><img src="/guardian-logo.svg" alt="Peopleprint Guardian" width="188" height="40"></a>` +
    `<nav class="g-nav" aria-label="Guardian navigation">${navigation}</nav>` +
    `<div class="g-session-controls">${controls}</div>`;
}
function renderHeader() {
  const header = document.querySelector('[data-app-header]');
  if (!header) return;
  header.className = 'g-header';
  const pending = session === 'unknown';
  header.innerHTML = headerMarkup({authenticated:session === 'authenticated', pending, page:currentPage, loginURL:signInDestination(location.href)});
  if (pending) header.setAttribute('aria-busy', 'true');
  else header.removeAttribute('aria-busy');
}
function notice(message){let box=document.querySelector('#journey-notice');if(!box){box=document.createElement('div');box.id='journey-notice';box.className='g-header-notice';box.setAttribute('role','status');document.body.append(box);}box.textContent=message;box.hidden=false;}
async function signOut(event){const link=event.target.closest('a[data-signout]');if(!link)return;event.preventDefault();if(logoutPending)return;logoutPending=true;sessionGeneration++;link.setAttribute('aria-disabled','true');try{const response=await fetch('/api/auth/logout',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:'{}'});let data;try{data=await response.json();}catch{data={};}if(response.ok){clearTabChat();session='anonymous';renderHeader();location.assign('/');}else if(data.signedOutLocally===true){clearTabChat();session='anonymous';renderHeader();location.assign('/login?logged_out=1');}else throw Error(data.message||data.error||'Log out could not be completed. Please try again.');}catch(error){notice(error.message==='Failed to fetch'?'You seem to be offline. Please reconnect and try logging out again.':error.message||'Log out could not be completed. Please try again.');}finally{logoutPending=false;link.removeAttribute('aria-disabled');}}
export function initHeader({page=pageFromPath()}={}){
  currentPage=page;
  renderHeader();
  if(!bound){document.addEventListener('click',signOut);bound=true;}
  if(!sessionRequest){
    const generation=sessionGeneration;
    sessionRequest=fetch('/api/session',{credentials:'same-origin'}).then(async response=>{
      if(!response.ok)throw Error('Session unavailable');
      const data=await response.json();
      if(generation!==sessionGeneration)return;
      session=data.authenticated===true?'authenticated':'anonymous';
      if(session==='authenticated' && data.legacy!==true && location.pathname==='/'){
        for(const link of document.querySelectorAll('[data-member-href]')){
          link.href=link.dataset.memberHref;
          if(link.dataset.memberLabel)link.textContent=link.dataset.memberLabel;
        }
      }
      renderHeader();
    }).catch(()=>{
      if(generation!==sessionGeneration)return;
      session='unavailable';
      renderHeader();
    });
  }
  return sessionRequest;
}
initHeader();

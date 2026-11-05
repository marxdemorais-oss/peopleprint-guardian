// Only a fixed same-origin callback receives the allowlisted OAuth fields.
// No return URL, credential storage, account data or external asset is used.
(()=>{
 const current=new URL(location.href),params=current.searchParams,provider=current.pathname.match(/^\/api\/connections\/(gmail|outlook)\/callback$/)?.[1]||(current.pathname==='/api/messaging/x/callback'&&(params.get('state')||'').startsWith('cx.')?'x':null);
 const state=params.get('state')||'',code=params.get('code'),error=params.get('error');
 const valid=provider&&current.search.length<=8192&&!params.has('guardian_return')&&['state','code','error'].every(name=>params.getAll(name).length<=1)&&(provider==='x'?/^cx\.[A-Za-z0-9_-]{43}$/:/^[A-Za-z0-9_-]{43}$/).test(state)&&((typeof code==='string'&&code.length>0&&code.length<=4096&&!/[\x00-\x20\x7f]/.test(code)&&error===null)||(typeof error==='string'&&error.length>0&&error.length<=200&&code===null));
 if(!valid){document.querySelector('#return-status').textContent='This connection request could not be completed. Return to your connections and start again.';history.replaceState(null,'',current.pathname);return;}
 const target=new URLSearchParams({state,guardian_return:'1'});if(code!==null)target.set('code',code);else target.set('error','access_denied');
 location.replace((provider==='x'?'/api/messaging/x/callback':'/api/connections/'+provider+'/callback')+'?'+target);
})();

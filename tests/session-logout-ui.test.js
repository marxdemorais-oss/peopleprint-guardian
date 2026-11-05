import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const settle=()=>new Promise(resolve=>setImmediate(resolve));
function shell({authenticated=true,legacy=false,sessionFailure=false,path='/workspace?check=owned#detail',logout=()=>Response.json({ok:true})}={}){
 const events=new Map(),calls=[],destinations=[],attributes=new Map();
 const header={innerHTML:'',setAttribute:(key,value)=>attributes.set(key,value),removeAttribute:key=>attributes.delete(key)};
 const url=new URL(path,'https://guardian.test');
 const memberLink={href:'/signup',dataset:{memberHref:'/workspace?start=check',memberLabel:'open a check in your workspace'}};
 const document={querySelectorAll:()=>[memberLink],querySelector:selector=>selector==='[data-app-header]'?header:null,addEventListener:(type,fn)=>{events.set(type,[...(events.get(type)||[]),fn]);},createElement:()=>({setAttribute(){}}),body:{append(){}}};
 const source=readFileSync(new URL('../web/assets/global-header.js',import.meta.url),'utf8').replace(/^import[^;]+;/gm,'').replaceAll('export ','');
 const fetch=async(path,init)=>{calls.push({path,init});if(path==='/api/session'){if(sessionFailure)throw Error('offline');return Response.json({authenticated,legacy});}return logout(path,init);};
 const context={clearTabChat(){},document,fetch,URL,location:{href:url.href,pathname:url.pathname,hash:url.hash,assign:x=>destinations.push(x),replace:x=>destinations.push(x)}};
 runInNewContext(source+';globalThis.again=()=>initHeader({page:"workspace"});globalThis.signInDestination=signInDestination;',context);
 const link={setAttribute(){},removeAttribute(){}};
 return {header,memberLink,calls,destinations,attributes,again:context.again,signInDestination:context.signInDestination,click:()=>Promise.all(events.get('click').map(fn=>fn({target:{closest:()=>link},preventDefault(){}}))),events};
}
test('every header switches from login to top-right Account and Log out using the actual session',async()=>{
 const page=shell();assert.equal(page.attributes.get('aria-busy'),'true');assert(!page.header.innerHTML.includes('data-login'));assert(!page.header.innerHTML.includes('data-signout'));await settle();
 assert.match(page.header.innerHTML,/<div class="g-session-controls">[^]*>Account<\/a>[^]*data-signout>Log out/);
 assert(!page.header.innerHTML.includes('Your checks'));assert.match(page.header.innerHTML,/>Connections<\/a>/);
 page.again();await settle();assert.equal(page.events.get('click').length,1);assert.equal(page.calls.filter(c=>c.path==='/api/session').length,1);
 await page.click();const request=page.calls.find(c=>c.path==='/api/auth/logout');assert.equal(request.init.method,'POST');assert.equal(request.init.credentials,'same-origin');assert.deepEqual(page.destinations,['/']);
});
test('signed-out or unavailable sessions offer login without pretending to have verified an account',async()=>{
 for(const options of [{authenticated:false},{sessionFailure:true}]){const page=shell(options);await settle();assert.match(page.header.innerHTML,/>Log in<\/a>/);assert(!page.header.innerHTML.includes('data-signout'));assert.equal(page.attributes.has('aria-busy'),false);}
});
test('double-clicking logout revokes once and local-only success removes the signed-in view',async()=>{
 let finish;const page=shell({logout:()=>new Promise(resolve=>{finish=resolve;})});await settle();const first=page.click();await page.click();assert.equal(page.calls.filter(c=>c.path==='/api/auth/logout').length,1);finish(Response.json({signedOutLocally:true},{status:503}));await first;assert.deepEqual(page.destinations,['/login?logged_out=1']);assert(!page.header.innerHTML.includes('data-signout'));
});
test('header login keeps the current task and rejects external return destinations',()=>{
 const page=shell();assert.equal(page.signInDestination('https://guardian.test/workspace?check=owned#detail'),'/login?return_to=%2Fworkspace%3Fcheck%3Downed%23detail');assert.equal(page.signInDestination('https://guardian.test/privacy'),'/login?return_to=%2Fprivacy');assert.equal(page.signInDestination('https://guardian.test/login?return_to=https%3A%2F%2Fother.test'),'/login?return_to=%2Fworkspace');assert.equal(page.signInDestination('https://guardian.test/login?return_to=%2F%2Fother.test'),'/login?return_to=%2Fworkspace');
});

test('signed-in navigation has one Wolfgang workspace and one Connections entry',async()=>{
 const page=shell();await settle();
 assert.doesNotMatch(page.header.innerHTML,/href="\/#talk"/);
 assert.match(page.header.innerHTML,/<a href="\/workspace" data-nav="workspace"[^>]*>Wolfgang<\/a>/);
 assert.match(page.header.innerHTML,/<a href="\/connections" data-nav="connections"/);
 const guest=shell({authenticated:false});await settle();assert.match(guest.header.innerHTML,/href="\/demo"[^>]*>Examples/);
 assert.doesNotMatch(guest.header.innerHTML,/data-nav="connections"/);
});

test('the homepage and its sections stay open after session detection',async()=>{
 for(const path of ['/','/#talk','/#difference']){
  for(const authenticated of [false,true]){
   const page=shell({path,authenticated});
   await settle();
   assert.deepEqual(page.destinations,[]);
   assert.match(page.header.innerHTML,/class="g-brand" href="\/"/);
   assert.equal(page.memberLink.href,authenticated?'/workspace?start=check':'/signup');
   if(authenticated)assert.match(page.header.innerHTML,/href="\/workspace" data-nav="workspace"/);
  }
 }
 const legacy=shell({path:'/',legacy:true});await settle();
 assert.deepEqual(legacy.destinations,[]);
 assert.equal(legacy.memberLink.href,'/signup');
 const workspace=shell();await settle();assert.match(workspace.header.innerHTML,/class="g-brand" href="\/"/);
});

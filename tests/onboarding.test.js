import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {createMailboxConnectForm} from '../web/assets/mailbox-setup.js';

function element(tag='div'){
 return {tagName:tag.toUpperCase(),value:'',checked:false,hidden:false,disabled:false,textContent:'',href:'',dataset:{},style:{},children:[],classList:{toggle(){}},setAttribute(){},focus(){},append(...nodes){this.children.push(...nodes);},replaceChildren(...nodes){this.children=[...nodes];},after(){},addEventListener(type,callback){this['on'+type]=callback;}};
}
function mount(file,href,respond=()=>({})){
 const nodes=new Map(),calls=[],destinations=[],redirects=[];
 const query=selector=>{if(!nodes.has(selector))nodes.set(selector,element());return nodes.get(selector);};
 const parsed=new URL(href);
 const location={href,pathname:parsed.pathname,search:parsed.search,hash:parsed.hash,assign:target=>destinations.push(target),replace:target=>redirects.push(target)};
 const api=async(path,options={})=>{calls.push({path,...options});return respond(path,options);};
 const document={querySelector:query,querySelectorAll:()=>[],createElement:element};
 const source=readFileSync(new URL('../web/assets/'+file,import.meta.url),'utf8').replace(/^import[^;]*;/gm,'');
 runInNewContext(source,{document,location,api,createMailboxConnectForm,initShell(){},URL,URLSearchParams,history:{replaceState(){}},Date,console});
 return {query,calls,destinations,redirects};
}
const settle=()=>new Promise(resolve=>setImmediate(resolve));

test('email and WhatsApp cards show exact contacts and allow a second verified contact without mistaking the first for success',async()=>{
 const contacts=[{channel:'email',label:'Email',available:true,url:'mailto:wolfgang@example.test',directoryLabel:'wolfgang@example.test'},{channel:'whatsapp',label:'WhatsApp',available:true,url:'https://wa.me/447000000009',directoryLabel:'+447000000009'}];
 let identities=[{channel:'email',senderId:'primary@example.test',verifiedAt:1},{channel:'whatsapp',senderId:'447000000001',verifiedAt:1}];
 const page=mount('connections.js','https://guardian.test/connections',(path,options)=>path==='/api/connections'?{connections:[],contacts}:options.method==='POST'?{code:'WG-'+'A'.repeat(32)}:{identities});
 await settle();const all=n=>[n,...n.children.flatMap(all)],nodes=()=>all(page.query('#contact-channels'));
 assert(nodes().some(n=>n.textContent==='primary@example.test'));assert(nodes().some(n=>n.textContent==='+447000000001'));
 await nodes().find(n=>n.textContent==='Add another email address').onclick();
 assert(nodes().some(n=>/Check the From address/.test(n.textContent)));
 assert(nodes().some(n=>/compose a new email to wolfgang@example.test/.test(n.textContent)));
 assert(!nodes().some(n=>n.href.startsWith('mailto:')||/Send code to Wolfgang/.test(n.textContent)));
 await nodes().find(n=>n.textContent==='Add another WhatsApp number').onclick();
 assert(nodes().some(n=>n.href.startsWith('https://wa.me/447000000009?text=WG-')));
 await nodes().find(n=>n.textContent==='Check connection').onclick();
 assert.match(page.query('#connection-feedback').textContent,/No new contact/);
 identities=[...identities,{channel:'email',senderId:'second@any-provider.test',verifiedAt:2}];
 await nodes().find(n=>n.textContent==='Check connection').onclick();
 assert(nodes().some(n=>n.textContent==='second@any-provider.test'));
 assert.match(page.query('#connection-feedback').textContent,/verified and linked/);
});

test('contact removal sends only the selected identity and adding stops at three',async()=>{
 let identities=['one@example.test','two@example.test','three@example.test'].map(senderId=>({channel:'email',senderId,verifiedAt:1}));
 const page=mount('connections.js','https://guardian.test/connections',(path,options)=>{
  if(path==='/api/connections')return {connections:[],contacts:[{channel:'email',label:'Email',available:true,url:'mailto:wolfgang@example.test'}]};
  if(options.method==='DELETE'){assert.equal(options.body.senderId,'one@example.test');assert.equal(options.body.channel,'email');identities=identities.filter(i=>i.senderId!==options.body.senderId);return {};}
  return {identities};
 });
 await settle();const all=n=>[n,...n.children.flatMap(all)],nodes=()=>all(page.query('#contact-channels'));
 assert(!nodes().some(n=>n.textContent==='Add another email address'));
 await nodes().find(n=>n.textContent==='Remove').onclick();
 assert(nodes().some(n=>n.textContent==='two@example.test'));assert(nodes().some(n=>n.textContent==='three@example.test'));
 assert(nodes().some(n=>n.textContent==='Add another email address'));
 assert.equal(page.calls.filter(c=>c.method==='DELETE').length,1);
});

test('a failed sender lookup does not claim the customer has no linked contacts',async()=>{
 const page=mount('connections.js','https://guardian.test/connections',path=>{if(path==='/api/connections')return {connections:[],contacts:[{channel:'email',available:true,url:'mailto:wolfgang@example.test'}]};throw Error('Unavailable');});
 await settle();const all=n=>[n,...n.children.flatMap(all)],nodes=all(page.query('#contact-channels'));
 assert(nodes.some(n=>/linked contacts could not be loaded/.test(n.textContent)));
 assert(!nodes.some(n=>/No email addresses linked|Add an email address/.test(n.textContent)));
});

test('a supervised receiving-only X contact offers the normal one-time link without enabling replies',async()=>{
 const code='WG-'+'A'.repeat(32);
 const page=mount('connections.js','https://guardian.test/connections',(path,options)=>{
  if(path==='/api/connections')return {connections:[],contacts:[{channel:'x',label:'X',available:false,linkAvailable:true,url:'https://x.com/WolfgangOnCall'}]};
  if(path==='/api/contact-link'&&!options.method)return {identities:[]};
  if(path==='/api/contact-link'&&options.method==='POST'){assert.equal(options.body.channel,'x');return {code,instruction:'Send this code to Wolfgang from the account you want to link.'};}
  throw Error('Unexpected request');
 });
 await settle();const descendants=node=>[node,...node.children.flatMap(descendants)];
 const all=()=>descendants(page.query('#contact-channels'));
 const link=all().find(node=>node.tagName==='BUTTON'&&node.textContent==='Link this account');assert.ok(link);
 assert.match(all().map(node=>node.textContent).join(' '),/Automatic replies are off/);
 await link.onclick();assert.equal(all().find(node=>node.tagName==='INPUT').value,code);
 assert.equal(page.calls.filter(call=>call.method==='POST').length,1);
 assert.equal(page.calls.some(call=>call.path.includes('/api/checks')),false);
 const html=readFileSync(new URL('../web/connections.html',import.meta.url),'utf8');
 assert.match(html,/<a[^>]+href="\/api\/wolfgang\/contact-card"[^>]+download="Wolfgang\.vcf"/);
});

test('the directory distinguishes receiving and testing addresses from channels without contact details', async () => {
 const contacts = [
  {channel:'whatsapp',directoryUrl:'https://wa.me/123456789',directoryLabel:'+123456789',contactState:'receiving',available:false},
  {channel:'messenger',directoryUrl:'https://m.me/12345',directoryLabel:'Wolfgang',facebookPageUrl:'https://www.facebook.com/12345',contactState:'testing',available:false},
  {channel:'email',directoryUrl:'mailto:wolfgang@example.test',directoryLabel:'wolfgang@example.test',contactState:'receiving',available:false},
  {channel:'sms',directoryUrl:'sms:+447000000001',available:true,onboardingPaused:true},
  {channel:'instagram',directoryUrl:'https://www.instagram.com/wolfgang',available:true,onboardingPaused:true}
 ];
 const page = mount('connections.js', 'https://guardian.test/connections', path => path === '/api/connections' ? {contacts,connections:[]} : {identities:[]});
 await settle();
 const rows = page.query('#contact-channels').children;
 const all = node => [node, ...node.children.flatMap(all)];
 assert.equal(rows.length, 3);
 const whatsApp = all(rows.find(row => row.dataset.channel === 'whatsapp'));
 assert(whatsApp.some(node => node.href === 'https://wa.me/123456789'));
 assert(whatsApp.some(node => node.textContent.includes('Automatic replies are off')));
 assert(!whatsApp.some(node => node.textContent === 'Link this account'));
 const messenger = all(rows.find(row => row.dataset.channel === 'messenger'));
 assert(messenger.some(node => node.textContent === 'Testing'));
 assert.deepEqual(messenger.filter(node => node.tagName === 'A').map(node => node.href), ['https://m.me/12345']);
 const email = all(rows.find(row => row.dataset.channel === 'email'));
 assert(email.some(node => node.textContent === 'Copy email address'));
 assert(!email.some(node => node.tagName === 'A' && node.href.startsWith('mailto:')));
 for (const name of ['sms','instagram']) {
  assert(!rows.some(row => row.dataset.channel === name));
 }
});

test('existing SMS and Instagram links can still be managed while new onboarding is paused', async () => {
 const contacts=['sms','instagram'].map(channel=>({channel,available:false,onboardingPaused:true}));
 const page=mount('connections.js','https://guardian.test/connections',path=>path==='/api/connections'?{contacts,connections:[]}:{identities:contacts});
 await settle();
 const all=node=>[node,...node.children.flatMap(all)];
 for(const row of page.query('#contact-channels').children){
  assert(all(row).some(node=>node.textContent==='Disconnect'));
  assert(!all(row).some(node=>node.textContent==='Link this account'));
 }
 assert.equal(page.query('#contact-channels').children.length,2);
});

test('connections handles mailbox setup without duplicating workspace intake', async () => {
 const html=readFileSync(new URL('../web/connections.html',import.meta.url),'utf8');
 assert(!html.includes('What would you like to check?'));assert(!html.includes('/workspace?start=upload'));assert(html.includes('id="connection-grid"'));
 const page=mount('connections.js','https://guardian.test/connections#add-connection',path=>path==='/api/connections'?{connections:[],contacts:[]}:{identities:[]});
 const setup=page.query('#add-connection');setup.hidden=true;
 await settle();assert.equal(setup.hidden,false);
 page.query('#close-email-options').onclick();assert.equal(setup.hidden,true);
 page.query('#add-account-action').onclick();assert.equal(setup.hidden,false);
});

test('Send code to Wolfgang starts the authenticated X send flow instead of opening a profile',async()=>{
 const code='WG-'+'B'.repeat(32),target=new URL('https://x.com/i/oauth2/authorize');
 for(const [key,value] of Object.entries({response_type:'code',client_id:'fixture-client',redirect_uri:'https://guardian.test/api/messaging/x/callback',scope:'dm.read dm.write users.read tweet.read',state:'cx.'+'s'.repeat(43),code_challenge:'c'.repeat(43),code_challenge_method:'S256'}))target.searchParams.set(key,value);
 let release;const handoff=new Promise(resolve=>release=resolve);
 const page=mount('connections.js','https://guardian.test/connections',(path,options)=>{
  if(path==='/api/connections')return {connections:[],contacts:[{channel:'x',label:'X',available:false,linkAvailable:true,url:'https://x.com/WolfgangOnCall'}]};
  if(path==='/api/contact-link'&&!options.method)return {identities:[]};
  if(path==='/api/contact-link')return {code};
  if(path==='/api/connections/x/send-code'){assert.equal(options.method,'POST');assert.equal(options.body.code,code);return handoff;}
  throw Error('Unexpected request');
 });
 await settle();const descendants=node=>[node,...node.children.flatMap(descendants)];
 const all=()=>descendants(page.query('#contact-channels'));
 await all().find(node=>node.tagName==='BUTTON'&&node.textContent==='Link this account').onclick();
 const send=all().find(node=>node.tagName==='BUTTON'&&node.textContent==='Send code to Wolfgang');assert.ok(send);
 const first=send.onclick(),second=send.onclick();assert.equal(page.destinations.length,0);release({authorizeUrl:target.href});await Promise.all([first,second]);
 assert.deepEqual(page.destinations,[target.href]);assert.equal(page.calls.filter(c=>c.path==='/api/connections/x/send-code').length,1);
 assert(!all().some(node=>node.tagName==='A'&&node.href==='https://x.com/WolfgangOnCall'&&node.textContent.includes('Send code')));
});

test('the send-code button rejects an untrusted or credential-bearing X authorisation handoff',async()=>{
 for(const url of ['https://attacker.test/collect','https://x.com/i/oauth2/authorize?redirect_uri=https://attacker.test/callback']){
  const page=mount('connections.js','https://guardian.test/connections',(path,options)=>path==='/api/connections'?{connections:[],contacts:[{channel:'x',label:'X',available:false,linkAvailable:true,url:'https://x.com/WolfgangOnCall'}]}:path==='/api/contact-link'?options.method?{code:'WG-'+'C'.repeat(32)}:{identities:[]}:{authorizeUrl:url});
  await settle();const descendants=node=>[node,...node.children.flatMap(descendants)];const all=()=>descendants(page.query('#contact-channels'));
  await all().find(node=>node.tagName==='BUTTON'&&node.textContent==='Link this account').onclick();
  await all().find(node=>node.tagName==='BUTTON'&&node.textContent==='Send code to Wolfgang').onclick();
  assert.equal(page.destinations.length,0);assert.match(all().map(node=>node.textContent).join(' '),/invalid authorisation destination/);
 }
});
const accessResponse=path=>path==='/api/session'?{authenticated:false}:path==='/api/auth/config'?{emailCodeReady:true}:{ok:true};
async function signIn(page){
 await settle();page.query('#auth-email').value='Customer@example.test';
 await page.query('#email-form').onsubmit({preventDefault(){}});await settle();
 page.query('#auth-code').value='123456';
 await page.query('#code-form').onsubmit({preventDefault(){}});
}

test('first sign-in goes directly to the requested check',async()=>{
 const page=mount('access.js','https://guardian.test/signup?return_to=%2Fworkspace%3Fcheck%3Dcheck_saved',path=>path==='/api/profile'?{profile:{connectionsIntroduced:false}}:accessResponse(path));
 await signIn(page);
 const destination=new URL(page.destinations[0],'https://guardian.test');assert.equal(destination.pathname,'/workspace');assert.equal(destination.searchParams.get('check'),'check_saved');
 assert.deepEqual(page.calls.filter(call=>call.path==='/api/auth/request-code').map(call=>call.body.email),['customer@example.test']);
});

test('email handoff keeps its recovery key out of the return query and authentication requests',async()=>{
 const key='#continue='+'b'.repeat(64),path='/workspace?start=check';
 const page=mount('access.js','https://guardian.test/signup?return_to='+encodeURIComponent(path)+key,accessResponse);
 await signIn(page);assert.deepEqual(page.destinations,[path+key]);
 assert.equal(new URL(page.query('#existing-account a').href,'https://guardian.test').searchParams.get('return_to'),path);
 assert.ok(page.calls.every(call=>!JSON.stringify(call).includes('b'.repeat(64))));
});

test('switching signup and login retains the saved check destination through verification',async()=>{
 const destination='/workspace?check=check_saved';
 for(const route of ['signup','login']){
  const page=mount('access.js','https://guardian.test/'+route+'?return_to='+encodeURIComponent(destination),accessResponse);
  await signIn(page);
  assert.deepEqual(page.destinations,[destination]);
  for(const selector of ['#existing-account a']){
   const link=new URL(page.query(selector).href,'https://guardian.test');
   assert.equal(link.pathname,route==='signup'?'/login':'/signup');
   assert.equal(link.searchParams.get('return_to'),destination);
  }
 }
});

test('email sign-in only returns to permitted local Guardian routes',async()=>{
 for(const destination of ['https://attacker.test','//attacker.test','/workspace-other','/workspace\\@attacker.test','/workspace\nother','/account/../../outside']){
  const page=mount('access.js','https://guardian.test/login?return_to='+encodeURIComponent(destination),accessResponse);
  await signIn(page);assert.deepEqual(page.destinations,['/workspace']);
  assert.equal(page.query('#existing-account a').href,'/signup');
 }
 for(const destination of ['/plans','/connections#contact','/workspace?check=check_saved','/demo?case=deposit','/privacy','/data-deletion','/']){
  const page=mount('access.js','https://guardian.test/login?return_to='+encodeURIComponent(destination),accessResponse);
  await signIn(page);assert.deepEqual(page.destinations,[destination]);
 }
});

test('a failed canonical name update cannot grant the local profile bonus',async()=>{
 const page=mount('welcome.js','https://guardian.test/welcome?unlock=1',(path,options)=>{
  if(path==='/api/profile'&&!options.method)return {profile:{displayName:'',memoryEnabled:false}};
  if(path==='/api/auth/profile')throw new Error('Canonical account unavailable.');
  throw new Error('The local bonus must not be written.');
 });
 await settle();page.query('#welcome-name').value='A';
 await page.query('#welcome-form').onsubmit({preventDefault(){}});
 assert.equal(page.calls.some(call=>call.method==='PATCH'),false);
 assert.deepEqual(page.destinations,[]);assert.equal(page.query('#welcome-status').textContent,'Canonical account unavailable.');
 assert.equal(page.query('#welcome-next').disabled,false);
});

test('profile completion preserves its submitted name and saved case while canonical save is pending',async()=>{
 let release;const canonical=new Promise(resolve=>release=resolve),destination='/workspace?check=check_saved';
 const page=mount('welcome.js','https://guardian.test/welcome?unlock=1&return_to='+encodeURIComponent(destination),(path,options)=>{
  if(path==='/api/profile'&&!options.method)return {profile:{displayName:'',memoryEnabled:false}};
  return path==='/api/auth/profile'?canonical:{};
 });
 await settle();page.query('#welcome-name').value='A';
 const pending=page.query('#welcome-form').onsubmit({preventDefault(){}});
 await page.query('#welcome-form').onsubmit({preventDefault(){}});
 page.query('#welcome-name').value='Changed during save';
 release({identity:{name:'A'}});await pending;
 assert.equal(page.calls.filter(call=>call.path==='/api/auth/profile').length,1);
 const local=page.calls.find(call=>call.method==='PATCH');
 assert.equal(local.body.displayName,'A');assert.equal(local.body.memoryEnabled,undefined);assert.equal(local.body.completeProfile,true);
 assert.deepEqual(page.destinations,[destination]);
});

test('account name edits use the submitted value and do not implicitly grant a profile bonus',async()=>{
 let release;const canonical=new Promise(resolve=>release=resolve);
 const page=mount('account.js','https://guardian.test/account',(path,options)=>{
  if(path==='/api/profile'&&!options.method)return {profile:{displayName:'A',email:'customer@example.test'}};
  return path==='/api/auth/profile'?canonical:{};
 });
 await settle();page.query('#account-name').value='Submitted name';
 const pending=page.query('#account-form').onsubmit({preventDefault(){}});
 page.query('#account-name').value='Changed during save';release({identity:{name:'Submitted name'}});await pending;
 const local=page.calls.find(call=>call.method==='PATCH');
 assert.equal(local.body.displayName,'Submitted name');assert.equal(local.body.completeProfile,undefined);
 assert.equal(page.query('#account-feedback').textContent,'Saved. That’s what I’ll call you.');
});

test('connected and reconnect-required accounts each offer Disconnect under Manage access without deleting saved information',async()=>{
 for(const status of ['connected','reconnect_required']){
  let stopped=false;
  const page=mount('connections.js','https://guardian.test/connections',(path,options)=>{
   if(path==='/api/connections/gmail'&&options.method==='DELETE'){stopped=true;return {message:'Stopped. Saved information retained.'};}
   if(path==='/api/connections')return {connections:[{provider:'gmail',status:stopped?'disconnected':status,available:true,label:'Gmail',description:'Selected email records',searchReady:false}],contacts:[]};
   throw new Error('Unexpected request.');
  });
  await settle();const descendants=node=>[node,...node.children.flatMap(descendants)];
  const manage=descendants(page.query('#connection-grid')).find(node=>node.tagName==='DETAILS' && node.children[0]?.textContent==='Manage access');
  const stop=manage?.children.find(node=>node.tagName==='BUTTON'&&node.textContent==='Disconnect');
  assert.ok(stop,status+' must offer Disconnect under Manage access');await stop.onclick();
  assert.equal(stopped,true);assert.equal(page.calls.filter(call=>call.method==='DELETE').length,1);
  assert.equal(page.calls.some(call=>call.path==='/api/privacy'),false);
  assert.equal(page.query('#connection-feedback').textContent,'Stopped. Saved information retained.');
 }
});

test('sign-in defaults to a browser session and sends seven-day persistence only after the checkbox is chosen',async()=>{
 for(const remember of [false,true]){const page=mount('access.js','https://guardian.test/login',accessResponse);await settle();assert.equal(page.query('#remember-signin').checked,false);page.query('#remember-signin').checked=remember;await signIn(page);assert.equal(page.calls.find(c=>c.path==='/api/auth/verify').body.remember,remember);}
});
test('an authenticated access page preserves the requested destination and delegates session controls to the shared header',async()=>{
 const page=mount('access.js','https://guardian.test/login?return_to=%2Fconnections%23contact',path=>path==='/api/session'?{authenticated:true}:accessResponse(path));await settle();assert.equal(page.query('#email-form').hidden,true);assert.equal(page.query('#signed-in-actions').hidden,false);assert.equal(page.query('#continue-signed-in').href,'/connections#contact');const html=readFileSync(new URL('../web/access.html',import.meta.url),'utf8');assert(!/signed-in-actions[^]*?data-signout[^]*?<\/div>/.test(html));assert.match(html,/<header data-app-header/);
});

test('a stale X send button refreshes an existing binding instead of reopening authorisation',async()=>{
 let linked=false;const page=mount('connections.js','https://guardian.test/connections',(path,options)=>{if(path==='/api/connections')return {connections:[],contacts:[{channel:'x',label:'X',available:false,linkAvailable:true,url:'https://x.com/WolfgangOnCall'}]};if(path==='/api/contact-link'&&!options.method)return {identities:linked?[{channel:'x'}]:[]};if(path==='/api/contact-link')return {code:'WG-'+'A'.repeat(32)};if(path==='/api/connections/x/send-code'){linked=true;return {linked:true};}throw Error('Unexpected route')});await settle();const all=n=>[n,...n.children.flatMap(all)];await all(page.query('#contact-channels')).find(n=>n.textContent==='Link this account').onclick();await all(page.query('#contact-channels')).find(n=>n.textContent==='Send code to Wolfgang').onclick();assert.deepEqual(page.destinations,[]);assert(all(page.query('#contact-channels')).some(n=>n.textContent==='Account linked'));
});

test('each linked identity is managed once and mailboxes have their own setup options',async()=>{
 const page=mount('connections.js','https://guardian.test/connections',path=>path==='/api/connections'?{connections:[{provider:'gmail',label:'Gmail',status:'connected',displayLabel:'customer@example.test',searchReady:true,available:true},{provider:'outlook',label:'Outlook',description:'Microsoft email',status:'not_connected',available:false},{provider:'peopleprint',label:'Peopleprint',status:'not_connected',available:false}],contacts:[{channel:'x',label:'X',linkAvailable:true,available:false,url:'https://x.com/WolfgangOnCall'}]}:{identities:[{channel:'x'}]});
 await settle();const all=n=>[n,...n.children.flatMap(all)];const main=all(page.query('#connection-grid')).map(n=>n.textContent).join(' '),choices=all(page.query('#connection-options')).map(n=>n.textContent).join(' ');
 assert.match(main,/Gmail/);assert.doesNotMatch(main,/X|Account linked|Outlook|Peopleprint/);const messaging=all(page.query('#contact-channels')).map(n=>n.textContent);assert.equal(messaging.filter(text=>text==='Account linked').length,1);assert.match(choices,/Outlook/);assert.doesNotMatch(choices,/Peopleprint/);
 assert.equal(page.calls.some(c=>c.method==='POST'||c.path.includes('/search')),false);
});

test('an unavailable messaging transport preserves its linked account and working unlink action',async()=>{
 for(const contacts of [[],[{channel:'x',label:'X',available:false,linkAvailable:false}]]){
  let unlinked=false;
  const page=mount('connections.js','https://guardian.test/connections',(path,options)=>{
   if(path==='/api/connections')return {connections:[],contacts};
   if(path==='/api/contact-link'&&!options.method)return {identities:unlinked?[]:[{channel:'x'}]};
   if(path==='/api/contact-link'&&options.method==='DELETE'){assert.equal(options.body.channel,'x');unlinked=true;return {};}
   throw new Error('Unexpected request: '+path);
  });
  await settle();const all=node=>[node,...node.children.flatMap(all)];
  assert.doesNotMatch(all(page.query('#connection-grid')).map(node=>node.textContent).join(' '),/Account linked/);
  const channelNodes=all(page.query('#contact-channels'));
  assert.match(channelNodes.map(node=>node.textContent).join(' '),/Messaging is temporarily unavailable/);
  const unlink=channelNodes.find(node=>node.tagName==='BUTTON'&&node.textContent==='Disconnect');assert.ok(unlink);
  assert.equal(page.calls.filter(call=>call.path==='/api/contact-link'&&!call.method).length,1);
  await unlink.onclick();
  assert.equal(unlinked,true);assert.equal(page.calls.filter(call=>call.method==='DELETE').length,1);
  assert.equal(page.calls.some(call=>call.method==='POST'||call.path.includes('send-code')),false);
  assert.deepEqual(page.destinations,[]);
 }
});

test('a pending mailbox connection can be cancelled without starting a second connection',async()=>{
 let stopped=false;
 const page=mount('connections.js','https://guardian.test/connections',(path,options)=>{
  if(path==='/api/connections')return {connections:stopped?[]:[{provider:'mailbox',label:'Other email',status:'connecting',available:true,searchReady:false}],contacts:[]};
  if(path==='/api/contact-link')return {identities:[]};
  if(path==='/api/connections/mailbox'&&options.method==='DELETE'){stopped=true;return {message:'Stopped.'};}
  throw new Error('Unexpected request: '+path);
 });
 await settle();const all=node=>[node,...node.children.flatMap(all)];
 const nodes=all(page.query('#connection-grid'));
 assert.ok(nodes.some(node=>node.textContent==='Connecting'));
 assert.equal(nodes.some(node=>node.tagName==='A'&&node.href.includes('/start')),false);
 assert.equal(nodes.some(node=>node.tagName==='BUTTON'&&/^(Connect|Reconnect)/.test(node.textContent)),false);
 const stop=nodes.find(node=>node.tagName==='BUTTON'&&node.textContent==='Cancel connection');assert.ok(stop);await stop.onclick();
 assert.equal(stopped,true);assert.equal(page.calls.filter(call=>call.method==='DELETE').length,1);
 assert.equal(page.calls.some(call=>call.method==='POST'||call.path.endsWith('/providers')),false);
});

test('a connected mailbox opens that provider in the workspace without starting a search or creating a case',async()=>{
 const page=mount('connections.js','https://guardian.test/connections',path=>path==='/api/connections'?{connections:[{provider:'gmail',label:'Gmail',status:'connected',searchReady:true,available:true}],contacts:[]}:{});await settle();
 const all=n=>[n,...n.children.flatMap(all)];assert(all(page.query('#connection-grid')).some(n=>n.href==='/workspace?start=email&provider=gmail'));
 assert.equal(page.calls.some(c=>c.method==='POST'||c.path.includes('/search')||c.path.includes('/api/checks')),false);
});

test('expired account access offers sign-in with the same local destination',async()=>{
 const page=mount('connections.js','https://guardian.test/connections?task=email#accounts',()=>{throw Object.assign(Error('Sign in again.'),{status:401});});await settle();const all=n=>[n,...n.children.flatMap(all)];const login=all(page.query('#connection-grid')).find(n=>n.textContent==='Sign in again');assert.ok(login);assert.equal(new URL(login.href,'https://guardian.test').searchParams.get('return_to'),'/connections?task=email#accounts');
});

test('an overridden allowance never promises a profile bonus that cannot be granted',async()=>{
 const page=mount('welcome.js','https://guardian.test/welcome?unlock=1',()=>({profile:{displayName:'Alex',memoryEnabled:false},trial:{profileComplete:false,canUnlockProfile:false,allowanceOverridden:true}}));await settle();assert.equal(page.query('#welcome-next').textContent,'Save and continue →');assert.match(page.query('#welcome-intro>p').textContent,/allowance will stay the same/);assert.doesNotMatch(page.query('#welcome-speech').textContent,/three/);
});

test('account and welcome screens have no memory switch',()=>{
 for(const file of ['account','welcome']){
  const html=readFileSync(new URL('../web/'+file+'.html',import.meta.url),'utf8');
  assert.doesNotMatch(html,/id="(?:account-memory|welcome-memory|memory-form)"/);
 }
});

test('local deletion leaves remote cleanup warning visible instead of navigating away',async()=>{
 const message='Your saved Guardian information has been deleted. Remote mailbox credential removal is unconfirmed.';
 const page=mount('account.js','https://guardian.test/account#privacy',(path,options)=>path==='/api/profile'?{profile:{displayName:'Alex',memoryEnabled:false}}:path==='/api/privacy'&&options.method==='DELETE'?{deleted:true,remoteCredentialCleanupPending:true,message}:{});await settle();assert.equal(page.query('#privacy').open,true);page.query('#delete-data').disabled=false;await page.query('#delete-data').onclick();assert.equal(page.query('#account-settings').hidden,true);assert.equal(page.query('#privacy').hidden,true);assert.equal(page.query('#deletion-result').hidden,false);assert.equal(page.query('#deletion-message').textContent,message);assert.equal(page.query('#deletion-provider-note').hidden,false);assert.equal(page.calls.some(c=>c.path==='/api/auth/logout'),false);assert.deepEqual(page.destinations,[]);
});

test('a stopping mailbox presents retry removal and cannot reconnect',async()=>{
 const page=mount('connections.js','https://guardian.test/connections',(path,options)=>path==='/api/connections'?{connections:[{provider:'mailbox',label:'Other email',status:'reconnect_required',available:false,cleanupPending:true}],contacts:[]}:path==='/api/contact-link'?{identities:[]}:{});await settle();const all=n=>[n,...n.children.flatMap(all)];const nodes=all(page.query('#connection-grid'));assert(nodes.some(n=>n.textContent==='Cleanup pending'));const retry=nodes.find(n=>n.textContent==='Retry removal');assert.ok(retry);assert(!nodes.some(n=>n.textContent==='Reconnect ↗'));await retry.onclick();assert.equal(page.calls.filter(c=>c.path==='/api/connections/mailbox'&&c.method==='DELETE').length,1);assert.equal(page.calls.some(c=>c.path==='/api/connections/mailbox/providers'||c.method==='POST'),false);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {createMailboxConnectForm} from '../web/assets/mailbox-setup.js';

function node(tag='div',className='',textContent=''){
 return {tagName:tag.toUpperCase(),className,textContent,children:[],value:'',checked:false,disabled:false,setAttribute(){},append(...items){this.children.push(...items);},replaceChildren(...items){this.children=items;},addEventListener(name,fn){this['on'+name]=fn;},querySelectorAll(selector){return all(this).filter(item=>selector==='input[type="password"]'&&item.tagName==='INPUT'&&item.type==='password');}};
}
const all=root=>[root,...root.children.flatMap(all)];
const event={preventDefault(){}};
function mount(respond){
 const calls=[],notices=[];let reloads=0;globalThis.document={createTextNode:text=>node('text','',text)};
 const root=createMailboxConnectForm({element:node,api:async(path,options)=>{calls.push({path,...options});return respond(path,options);},notice:text=>notices.push(text),reload:async()=>{reloads++;}});
 const email=all(root).find(n=>n.id==='mailbox-email'),form=all(root).find(n=>n.tagName==='FORM');
 return {root,email,form,calls,notices,get reloads(){return reloads;}};
}

test('email setup initially asks only for an address and offers provider authorisation without collecting a password',async()=>{
 const page=mount(()=>({kind:'oauth',provider:'gmail',label:'Google',startPath:'/api/connections/gmail/start',replacesExisting:true}));
 assert.equal(all(page.root).filter(n=>n.tagName==='INPUT').length,1);page.email.value='owner@company.test';await page.form.onsubmit(event);
 assert.deepEqual(page.calls[0].body,{email:'owner@company.test'});assert.equal(all(page.root).some(n=>n.type==='password'),false);
 assert.equal(all(page.root).find(n=>n.tagName==='A').href,'/api/connections/gmail/start');assert(all(page.root).some(n=>n.textContent.includes('replace')));
});

test('an unavailable provider never prompts for or submits a credential',async()=>{
 const page=mount(()=>({kind:'unavailable',message:'This service is being prepared.'}));page.email.value='owner@company.test';await page.form.onsubmit(event);
 assert.equal(all(page.root).some(n=>n.type==='password'),false);assert.equal(page.calls.length,1);assert(all(page.root).some(n=>n.textContent==='This service is being prepared.'));
});

test('stale provider detection cannot install a password form after the address changes',async()=>{
 let resolve;const pending=new Promise(r=>resolve=r),page=mount(()=>pending);page.email.value='first@example.test';const request=page.form.onsubmit(event);page.email.value='second@example.test';page.email.oninput();resolve({kind:'mailbox',providerId:'old-profile',label:'Old provider',username:'first@example.test'});await request;
 assert.equal(all(page.root).some(n=>n.type==='password'),false);assert.equal(all(page.root).some(n=>n.tagName==='BUTTON'&&n.textContent==='Continue'&&n.disabled),false);
});

test('only a reviewed profile requests a credential, clears it before sending and blocks duplicate submits',async()=>{
 let resolve;const connecting=new Promise(r=>resolve=r),page=mount(path=>path.endsWith('/discover')?{kind:'mailbox',providerId:'our-provider',label:'Our provider',username:'Owner@example.test'}:connecting);
 page.email.value='Owner@EXAMPLE.TEST';await page.form.onsubmit(event);
 const password=all(page.root).find(n=>n.type==='password'),consent=all(page.root).find(n=>n.type==='checkbox'),login=all(page.root).find(n=>n.className==='mailbox-password-form');password.value='fixture-app-password';consent.checked=true;
 const first=login.onsubmit(event);assert.equal(password.value,'');assert.equal(page.email.disabled,true);await login.onsubmit(event);
 assert.equal(page.calls.filter(c=>c.path.endsWith('/connect')).length,1);assert.deepEqual(page.calls.at(-1).body,{providerId:'our-provider',username:'Owner@example.test',password:'fixture-app-password',consent:true});
 resolve({connected:true});await first;assert.equal(page.reloads,1);assert.equal(password.value,'');assert.equal(page.email.disabled,false);
});

test('changing the email address removes an unsent password and an unsafe OAuth destination is refused',async()=>{
 const page=mount(()=>({kind:'mailbox',providerId:'our-provider',label:'Our provider'}));page.email.value='owner@example.test';await page.form.onsubmit(event);const password=all(page.root).find(n=>n.type==='password');password.value='never-send';page.email.value='other@example.test';page.email.oninput();assert.equal(password.value,'');assert.equal(all(page.root).some(n=>n.type==='password'),false);
 const unsafe=mount(()=>({kind:'oauth',provider:'gmail',label:'Google',startPath:'https://attacker.test'}));unsafe.email.value='owner@gmail.com';await unsafe.form.onsubmit(event);assert.equal(all(unsafe.root).some(n=>n.tagName==='A'),false);assert(all(unsafe.root).some(n=>n.textContent.includes('could not be verified')));
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync} from 'node:fs';
import {handleWatch,drainWatches} from '../worker/watch-service.js';
import {resolvePeopleIdentity,resolvePeopleAccess} from '../worker/people-auth.js';
import {findWarning} from '../worker/watch-evidence.js';
import {encryptConnectionValue} from '../worker/connections.js';
const origin='https://guardian.test',now=Date.now()-600_000;
const user={ownerId:'people:A',peopleOrganisedId:'A',guardianAccess:{unlimited:false,paidMonitoring:true,monthlyCases:20}};
function setup(){
 const sql=new DatabaseSync(':memory:');
 for(const {tag} of JSON.parse(readFileSync(new URL('../drizzle/meta/_journal.json',import.meta.url))).entries)sql.exec(readFileSync(new URL('../drizzle/'+tag+'.sql',import.meta.url),'utf8'));
 const q=(query,values=[])=>({bind(...args){return q(query,args);},async all(){return {results:sql.prepare(query).all(...values)};},async first(){return sql.prepare(query).get(...values)||null;},async run(){return {meta:{changes:Number(sql.prepare(query).run(...values).changes)}};},query,values});
 const env={DB:{prepare:q,async batch(stmts){sql.exec('BEGIN');try{const rows=[];for(const s of stmts)rows.push(await s.run());sql.exec('COMMIT');return rows;}catch(e){sql.exec('ROLLBACK');throw e;}}},GUARDIAN_IDENTITY_SECRET:'a'.repeat(40),CONNECTION_ENCRYPTION_KEY:Buffer.alloc(32,7).toString('base64'),GUARDIAN_WATCH_ENABLED:'true',GUARDIAN_WATCH_GMAIL:'true',GUARDIAN_WATCH_OUTLOOK:'true',GUARDIAN_WATCH_ORIGIN:origin};
 for(const p of ['gmail','outlook']){
  Object.assign(env,{[p.toUpperCase()+'_CONNECT_ENABLED']:'true',[p.toUpperCase()+'_CLIENT_ID']:'client',[p.toUpperCase()+'_CLIENT_SECRET']:'secret',[p.toUpperCase()+'_REDIRECT_URI']:origin+'/api/connections/'+p+'/callback'});
  sql.prepare('INSERT INTO guardian_connections VALUES (?,?,?,?,?,?,?)').run(user.ownerId,p,'connected','mail'+p,'work@example.test',new Date(now).toISOString(),new Date(now).toISOString());
 }
 const route=(path='',method='GET',who=user,headers={})=>handleWatch(new Request(origin+'/api/watch'+path,{method,headers:{origin,'x-guardian-watch-consent':'new-inbox-previews-v1',...headers}}),env,who,{now});
 const state=async()=>await(await route()).json();
 const enable=async(provider='gmail')=>{const source=(await state()).sources.find(s=>s.provider===provider);assert.equal((await route('/sources/'+provider+'?source='+source.key,'POST')).status,201);return (await state()).sources.find(s=>s.provider===provider);};
 const poll=(options={})=>drainWatches(env,{now:now+5*60_000,access:async()=>user,...options});
 const seedToken=async provider=>sql.prepare('INSERT INTO guardian_connection_tokens VALUES (?,?,?,?)').run(user.ownerId,provider,await encryptConnectionValue({access_token:'access123',refresh_token:'refresh123',expires_at:Date.now()+3600_000},env,user.ownerId,provider),new Date(now).toISOString());
 return {env,sql,route,state,enable,poll,seedToken};
}
const mail={id:'message001',date:now+60000,subject:'Invoice for review',sender:'Accounts <ar@supplier.test>',preview:'Please pay invoice 1012 to bank account number 98765432.'};
const evidence={id:'ev-mail-1',source:'Gmail · Our agreement',text:'Subject: Our agreement\nFrom: Accounts <ar@supplier.test>\nDate: '+new Date(now-5*86400000).toISOString()+'\n\nAgreed payment details: bank account number 11112222.'};
function seedAgreement(s,owner=user.ownerId){
 s.sql.prepare("INSERT INTO guardian_checks(id,owner_id,message,channel,evidence_json,preferences_json,status,remember,created_at,updated_at,expires_at,incoming_provider) VALUES(?,?,?,?,?,'{}','draft',1,?,?,'','gmail')").run('check_'+owner.replace(/\W/g,''),owner,'Invoice','email',JSON.stringify([evidence]),new Date(now-90000).toISOString(),new Date(now-90000).toISOString());
}
test('only current canonical paid access and fresh per-mailbox consent enroll a source',async()=>{
 const s=setup(),source=(await s.state()).sources[0],path='/sources/'+source.provider+'?source='+source.key;
 for(const identity of [{}, {...user,guardianAccess:{unlimited:true}}, {...user,guardianAccess:{paidMonitoring:true,monthlyCases:'20'}},{...user,peopleOrganisedId:'different'}])
  assert([401,403].includes((await s.route(path,'POST',identity)).status));
 assert.equal((await s.route(path,'POST',user,{origin:'https://elsewhere.test'})).status,403);
 assert.equal((await s.route(path,'POST',user,{'x-guardian-watch-consent':''})).status,400);
 s.env.GUARDIAN_WATCH_ENABLED='false';assert.equal((await s.route(path,'POST')).status,503);
 s.env.GUARDIAN_WATCH_ENABLED='true';s.sql.prepare("UPDATE guardian_connections SET connected_at='replaced' WHERE provider=?").run(source.provider);
 assert.equal((await s.route(path,'POST')).status,409);
 const enabled=await s.enable();assert(enabled.id);assert.equal((await s.state()).sources.filter(x=>x.id).length,1);
 await s.poll({access:async()=>({...user,guardianAccess:{unlimited:true}}),reader:()=>{assert.fail('A downgraded owner must never be polled');}});
 assert.equal(s.sql.prepare('SELECT count(*) n FROM guardian_watches').get().n,0);
});
test('private identity and access bridge preserve paid membership only with a valid paid quota',async()=>{
 const {env}=setup(),request=new Request(origin,{headers:{cookie:'__Host-wolfgang_session='+'a'.repeat(64)}});
 for(const [access,expected] of [[{unlimited:true},false],[{paidMonitoring:true,monthlyCases:5},false],[{paidMonitoring:'true',monthlyCases:12},false],[{paidMonitoring:true,monthlyCases:12},true]]){
  const row={id:'A',email:'person@example.test',guardianAccess:access};
  const a=await resolvePeopleIdentity(request,env,{fetcher:async()=>Response.json({identity:row})});
  const b=await resolvePeopleAccess('people:A',env,{fetcher:async()=>Response.json(row)});
  for(const u of [a,b]){assert.equal(u.guardianAccess.paidMonitoring,expected);assert.equal(u.guardianAccess.monthlyCases,expected?12:undefined);}
 }
});
test('Gmail preview compares only same-sender approved prior material; alert is masked, private, dismissible and deletion-safe',async()=>{
 const s=setup();seedAgreement(s);await s.seedToken('gmail');await s.enable();
 let calls=0;
 const fetcher=async(raw,options)=>{calls++;const url=new URL(raw);assert.equal(url.hostname,'gmail.googleapis.com');assert.equal(options.redirect,'manual');assert.equal(options.headers.Authorization,'Bearer access123');
  if(url.pathname.endsWith('messages')){assert.equal(url.searchParams.get('labelIds'),'INBOX');assert(url.searchParams.get('q').includes(' before:'));return Response.json({messages:[{id:mail.id}]});}
  assert(!url.searchParams.get('fields').includes('body'));return Response.json({id:mail.id,internalDate:String(mail.date),labelIds:['INBOX'],snippet:mail.preview,payload:{headers:[{name:'Subject',value:mail.subject},{name:'From',value:mail.sender}]}});
 };
 await s.poll({fetcher});assert.equal(calls,4);const state=await s.state(),item=state.items[0];assert(item.earlierCheck);assert.match(item.earlierDetail,/2222/);assert.match(item.excerpt,/5432/);
 assert(!JSON.stringify(state).includes('98765432'));assert.equal(state.sources[0].checkedThrough,now+4*60_000);
 const other={...user,ownerId:'people:B',peopleOrganisedId:'B'};assert.equal((await(await s.route('','GET',other)).json()).items.length,0);
 await s.route('/items/'+item.id,'DELETE',other);assert.equal((await s.state()).items.length,1);
 await s.route('/items/'+item.id,'DELETE');assert.equal((await s.state()).items.length,0);assert.equal(s.sql.prepare('SELECT excerpt FROM guardian_watch_items').get().excerpt,'');
 assert.equal(findWarning({...mail,sender:'else@other.test'},[{id:'check_a',evidence:[evidence]}]),null);
 assert.equal(findWarning({...mail,preview:mail.preview.replace('98765432','11112222')},[{id:'check_a',evidence:[evidence]}]),null);
});
test('Gmail query granularity cannot disclose a pre-consent subject, sender or snippet',async()=>{
 const s=setup();await s.seedToken('gmail');await s.enable();let calls=0;
 await s.poll({fetcher:async raw=>{++calls;const u=new URL(raw);
  if(u.pathname.endsWith('messages'))return Response.json({messages:[{id:'tooEarly'}]});
  assert.equal(u.searchParams.get('fields'),'id,internalDate,labelIds');
  return Response.json({id:'tooEarly',labelIds:['INBOX'],internalDate:String(now-150)});
 }});assert.equal(calls,2);assert.equal((await s.state()).items.length,0);
});
test('provider errors, bad pagination, cancelled consent and payment loss in flight never confirm a scan or retain findings',async()=>{
 for(const cause of ['stop','replace','expiry','bad-next','outage']){
  const s=setup();await s.seedToken('outlook');const src=await s.enable('outlook');let calls=0,requested=false;
  const fetcher=async(raw)=>{const u=new URL(raw);requested=true;assert.equal(u.pathname,'/v1.0/me/mailFolders/inbox/messages');assert(u.searchParams.get('$filter').includes(new Date(now).toISOString()));
   if(cause==='stop')await s.route('/sources/outlook?watch='+src.id,'DELETE');
   if(cause==='replace')s.sql.exec("UPDATE guardian_connections SET external_id='new' WHERE provider='outlook'");
   if(cause==='outage')throw Error('offline');
   return Response.json({value:[{id:'outmsg',subject:'Message',receivedDateTime:new Date(mail.date).toISOString(),bodyPreview:'Send me your verification code.'}],...(cause==='bad-next'?{'@odata.nextLink':'https://elsewhere.test/other'}:{})});
  };
  await s.poll({access:async()=>requested&&cause==='expiry'?null:user,fetcher});
  const result=await s.state();assert.equal(result.items.length,0,cause);assert(result.sources.every(x=>!x.checkedThrough),cause);
  assert.equal(result.sources.some(x=>x.failed),['bad-next','outage'].includes(cause));
 }
});
test('completed Outlook pages advance coverage once; a pending page and harmless messages do not create warnings',async()=>{
 const s=setup();await s.seedToken('outlook');await s.enable('outlook');let p=0;
 const fetcher=async raw=>{const url=new URL(raw);if(++p===1){url.searchParams.set('$skip','4');return Response.json({value:[{id:'boring',subject:'Hello',bodyPreview:'Meeting tomorrow.',receivedDateTime:new Date(mail.date).toISOString()}],'@odata.nextLink':url.href});}
  assert.equal(url.searchParams.get('$skip'),'4');return Response.json({value:[{id:'code',bodyPreview:'Please send me the verification code.',receivedDateTime:new Date(mail.date).toISOString()}]});};
 await s.poll({fetcher});let state=await s.state();assert.equal(state.sources.find(x=>x.provider==='outlook').checkedThrough,null);assert.equal(state.items.length,0);
 await s.poll({now:now+8*60_000,fetcher});state=await s.state();assert.equal(state.sources.find(x=>x.provider==='outlook').checkedThrough,now+4*60_000);assert.equal(state.items.length,1);
 await s.poll({now:now+8*86400_000,access:async()=>null,reader:()=>{throw Error('no mail expected');}});assert.equal(s.sql.prepare('SELECT count(*) n FROM guardian_watch_items').get().n,0);
});
test('changes to the saved reference, disconnect, and account deletion remove the corresponding evidence',async()=>{
 for(const cause of ['delete','edit','disconnect']){const s=setup();await s.enable();seedAgreement(s);
  await s.poll({reader:async()=>({rows:[mail],next:null})});assert.equal((await s.state()).items.length,1,cause);
  if(cause==='delete')s.sql.exec("DELETE FROM guardian_checks");if(cause==='edit')s.sql.exec("UPDATE guardian_checks SET evidence_json='[]'");if(cause==='disconnect')s.sql.exec('DELETE FROM guardian_connections');
  assert.equal((await s.state()).items.length,0,cause);
 }
});

import {requestProviderBytes} from './provider-http.js';
import {discoverMailbox,reviewedMailboxProviders} from './mailbox-discovery.js';
const enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true});
const base='/api/connections/mailbox';
const headers={'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const json=(value,status=200)=>Response.json(value,{status,headers});
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
const b64=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const digest=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(value)));
const remoteId=()=>b64(crypto.getRandomValues(new Uint8Array(32)));
const validId=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{16,128}$/.test(value);
const text=(value,max)=>typeof value==='string'&&value.length>0&&value.length<=max&&!/[\0\r\n]/.test(value);
const ownerReference=async owner=>Array.from(await digest(owner),byte=>byte.toString(16).padStart(2,'0')).join('');
function serviceSettings(env,owner){
 let origin=null,key=null,providers=[];
 try{const u=new URL(env.MAILBOX_CONNECTOR_ORIGIN);const h=u.hostname;if(u.protocol==='https:'&&u.origin===env.MAILBOX_CONNECTOR_ORIGIN&&!u.port&&!u.username&&!u.password&&h.includes('.')&&!/^[\d.]+$/.test(h)&&!/(^|\.)(localhost|internal|local)$/.test(h))origin=u.origin;}catch{}
 try{if(/^[A-Za-z0-9_-]{43}$/.test(env.MAILBOX_SIGNING_KEY||'')){key=Uint8Array.from(atob(env.MAILBOX_SIGNING_KEY.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));if(key.length!==32||b64(key)!==env.MAILBOX_SIGNING_KEY)key=null;}}catch{}
 providers=reviewedMailboxProviders(env.MAILBOX_REVIEWED_PROVIDERS);
 const enabled=env.MAILBOX_CONNECT_ENABLED==='true'||Boolean(owner&&env.MAILBOX_TEST_OWNER_ID===owner);
 return {origin,key,providers,configured:Boolean(env.DB&&enabled&&origin&&key&&providers.length)};
}
export function mailboxSettingsPresent(env){return serviceSettings({...env,MAILBOX_CONNECT_ENABLED:'true'}).configured;}
async function current(env,owner){return env.DB?.prepare("SELECT external_id,status,display_label,connected_at FROM guardian_connections WHERE owner_id=? AND provider='mailbox'").bind(owner).first();}
export async function mailboxConnectionSummary(env,owner){
 const settings=serviceSettings(env,owner),row=await current(env,owner);
 if(!settings.configured&&!row)return null;
 return {provider:'mailbox',label:'Other email',description:'Enter your email address. We will find the connection settings for supported providers.',status:row?.status==='connected'?'connected':row?.status==='connecting'?'connecting':row?.status==='stopping'?'reconnect_required':'not_connected',cleanupPending:row?.status==='stopping',displayLabel:row?.display_label||null,connectedAt:row?.connected_at||null,available:settings.configured&&row?.status!=='stopping',readOnly:true,syncReady:false,searchReady:settings.configured&&row?.status==='connected'};
}
export async function signedMailboxRequest(env,path,input,{fetcher=fetch,now=Date.now(),signal,ownerId}={}){
 const settings=serviceSettings(path==='/v1/connections/stop'?{...env,MAILBOX_CONNECT_ENABLED:'true'}:env,ownerId);if(!settings.configured)throw fail('Other-mail connections are not available yet.',503);
 if(!['/v1/connections','/v1/connections/stop','/v1/connections/status','/v1/search','/v1/read'].includes(path))throw fail('Invalid mailbox operation.');
 const body=JSON.stringify(input);if(enc.encode(body).length>8192)throw fail('That connection request is too large.',413);
 const timestamp=String(now),nonce=remoteId(),hash=Array.from(await digest(body),byte=>byte.toString(16).padStart(2,'0')).join('');
 const key=await crypto.subtle.importKey('raw',settings.key,{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const signature=b64(new Uint8Array(await crypto.subtle.sign('HMAC',key,enc.encode(['POST',path,timestamp,nonce,hash].join('\n')))));
 let bytes;
 try{bytes=await requestProviderBytes(settings.origin+path,{method:'POST',headers:{'Content-Type':'application/json','x-mailbox-timestamp':timestamp,'x-mailbox-nonce':nonce,'x-mailbox-signature':signature},body},{fetcher,signal,timeoutMs:18000,maxBytes:131072,contentType:'application/json'});}
 catch(error){if(error.providerStatus===429)throw fail('Please wait a minute before trying this mailbox again.',429);if(error.providerStatus===409)throw fail('This connection changed. Reconnect the mailbox to continue.',409);throw fail('The mailbox service could not complete the request. Please try again.',502);}
 let value;try{value=JSON.parse(dec.decode(bytes));}catch{throw fail('The mailbox service returned an invalid result.',502);}
 if(!value||typeof value!=='object'||Array.isArray(value))throw fail('The mailbox service returned an invalid result.',502);return value;
}
const remoteReference=async(owner,id)=>({ownerId:await ownerReference(owner),connectionId:id,generation:1});
async function stopRemote(env,owner,id,options){if(!validId(id))return false;try{const value=await signedMailboxRequest(env,'/v1/connections/stop',await remoteReference(owner,id),options);return value.state==='stopped'&&value.generation===1;}catch{return false;}}
async function stopMailboxReference(env,owner,id,options){
 await env.DB.prepare("UPDATE guardian_connections SET status='stopping',display_label=NULL,connected_at=NULL WHERE owner_id=? AND provider='mailbox' AND external_id=?").bind(owner,id).run();
 const revoked=await stopRemote(env,owner,id,options);
 if(revoked)await env.DB.prepare("DELETE FROM guardian_connections WHERE owner_id=? AND provider='mailbox' AND external_id=? AND status='stopping'").bind(owner,id).run();
 return {revoked};
}
export async function stopOwnedMailbox(env,owner,options={}){
 if(!env.DB)return {revoked:false};
 const row=await current(env,owner);
 // This local boundary stops reads immediately, even if the socket host is down.
 if(!row)return {revoked:true};
 return stopMailboxReference(env,owner,row.external_id,options);
}
async function readJson(request){
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw fail('JSON required.',415);
 if(Number(request.headers.get('content-length')||0)>8192)throw fail('That connection request is too large.',413);
 const reader=request.body?.getReader();if(!reader)throw fail('Enter the connection details.');let size=0;const chunks=[];
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>8192)throw fail('That connection request is too large.',413);chunks.push(value);}}catch(error){void reader.cancel().catch(()=>{});throw error;}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length;}
 try{const body=JSON.parse(dec.decode(bytes));if(!body||typeof body!=='object'||Array.isArray(body))throw Error();return body;}catch{throw fail('Enter valid connection details.');}
}
const safeReference=(reference,protocol)=>{
 if(!reference||typeof reference!=='object'||Array.isArray(reference))return false;
 if(protocol==='imap')return Object.keys(reference).every(k=>['uid','uidValidity','mailbox'].includes(k))&&reference.mailbox==='INBOX'&&typeof reference.uid==='string'&&/^[1-9]\d{0,9}$/.test(reference.uid)&&Number(reference.uid)<=4294967295&&typeof reference.uidValidity==='string'&&/^\d{1,20}$/.test(reference.uidValidity);
 return Object.keys(reference).length===1&&text(reference.uidl,70)&&/^[\x21-\x7e]+$/.test(reference.uidl);
};
async function recordsForOwner(value,owner,id,settings){
 const provider=settings.providers.find(p=>p.id===value.providerId);
 if(value.connectionId!==id||value.generation!==1||!provider||!Array.isArray(value.records)||value.records.length>5)throw fail('The mailbox service returned an invalid result.',502);
 const records=[];
 for(const row of value.records){
  if(!safeReference(row.reference,provider.protocol)||!text(row.source,160)||typeof row.text!=='string'||!row.text.trim()||row.text.length>20000||row.text.includes('\0')||row.senderAuthenticated!==false||row.provenance!=='connected-mailbox-unverified-sender')throw fail('The mailbox service returned an invalid record.',502);
  const fingerprint=Array.from((await digest(owner+'\n'+id+'\n'+JSON.stringify(row.reference))).slice(0,12),byte=>byte.toString(16).padStart(2,'0')).join('');
  const prefix='Selected mailbox content. Sender headers are unverified.\n';
  const notices=Array.isArray(row.notices)?row.notices.filter(n=>text(n,250)).slice(0,10):[];
  records.push({id:'ev-mail-'+fingerprint,source:row.source,text:prefix+row.text.slice(0,20000-prefix.length),provider:'mailbox',provenance:'connected_account',senderAuthenticated:false,excerpt:row.text.length>20000-prefix.length||notices.length>0,date:null,notices});
 }
 return {records,limited:true,partial:Boolean(value.moreResults)||(Array.isArray(value.notices)&&value.notices.length>0),searchScope:text(value.searchScope,250)?value.searchScope:null};
}
async function activeReference(env,owner){const row=await current(env,owner);if(row?.status!=='connected'||!validId(row.external_id))throw fail('Connect this mailbox to continue.',409);return row.external_id;}
async function assertCurrent(env,owner,id){if(await activeReference(env,owner)!==id)throw fail('This connection changed. Please try again from Connections.',409);}
async function limitConnect(env,owner,now){
 const window=Math.floor(now/3600000),bucket='mailbox-connect:'+await ownerReference(owner)+':'+window;
 const row=await env.DB.prepare('INSERT INTO guardian_rate_limits(bucket_key,owner_id,count,expires_at) VALUES (?,?,1,?) ON CONFLICT(bucket_key) DO UPDATE SET count=count+1 WHERE count<3 RETURNING count').bind(bucket,owner,(window+1)*3600000).first();
 if(!row)throw fail('Please wait before starting another mailbox connection.',429);
}
export async function handleMailboxConnectionRequest(request,env,identity,{fetcher=fetch,now=Date.now()}={}){
 const u=new URL(request.url);if(u.pathname!==base&&!u.pathname.startsWith(base+'/'))return null;
 const owner=identity?.ownerId;if(!owner)return json({code:'SIGN_IN_REQUIRED',message:'Sign in to manage your connections.'},401);
 if((request.headers.get('origin')&&request.headers.get('origin')!==u.origin)||(request.headers.get('sec-fetch-site')&&!['same-origin','none'].includes(request.headers.get('sec-fetch-site')))||request.method!=='GET'&&request.headers.get('origin')!==u.origin)return json({message:'Manage this connection from Guardian.'},403);
 const options={fetcher,now,signal:request.signal,ownerId:owner};
 try{
  if(request.method==='DELETE'&&u.pathname===base){const result=await stopOwnedMailbox(env,owner,options);return json({disconnected:true,savedInformationRetained:true,remoteStopped:result.revoked,message:result.revoked?'Disconnected. Your saved information stays with Wolfgang.':'Access stopped here. The mailbox service has not confirmed credential removal; contact support before reconnecting.'});}
  const settings=serviceSettings(env,owner);
  if(request.method==='POST'&&u.pathname===base+'/discover'){
   const body=await readJson(request);if(Object.keys(body).length!==1||typeof body.email!=='string')throw fail('Enter your email address.');
   const window=Math.floor(now/3600000),bucket='mailbox-discovery:'+await ownerReference(owner)+':'+window;
   const count=await env.DB?.prepare('INSERT INTO guardian_rate_limits(bucket_key,owner_id,count,expires_at) VALUES (?,?,1,?) ON CONFLICT(bucket_key) DO UPDATE SET count=count+1 WHERE count<20 RETURNING count').bind(bucket,owner,(window+1)*3600000).first();
   if(!count)throw fail('Please wait before checking another email address.',429);
   const result=await discoverMailbox(body.email,env,{origin:u.origin,mailboxAvailable:settings.configured,fetcher,signal:request.signal});
   if(result.kind==='oauth'){
    const previous=await env.DB.prepare('SELECT display_label,status FROM guardian_connections WHERE owner_id=? AND provider=?').bind(owner,result.provider).first();
    if(previous)result.replacesExisting=true;
   }else if(result.kind==='mailbox'||result.kind==='choose'){
    const previous=await current(env,owner);
    if(previous?.status==='stopping'||previous?.status==='connecting')return json({kind:'unavailable',message:previous.status==='stopping'?'Finish removing the previous connection before connecting another email account.':'An email account is already connecting. Stop that attempt before starting another.'});
    if(previous)result.replacesExisting=true;
   }
   return json(result);
  }
  if(!settings.configured)throw fail('Other-mail connections are not available yet. You can share selected email files instead.',503);
  if(request.method==='GET'&&u.pathname===base+'/providers')return json({providers:settings.providers.map(({id,protocol,label})=>({id,protocol,label}))});
  if(request.method==='POST'&&u.pathname===base+'/connect'){
   let body=await readJson(request);const provider=settings.providers.find(p=>p.id===body.providerId);
   if(!provider||body.consent!==true||!text(body.username,320)||typeof body.password!=='string'||!body.password||body.password.length>1024||/[\0\r\n]/.test(body.password)||Object.keys(body).some(k=>!['providerId','username','password','consent'].includes(k)))throw fail('Choose a supported provider, enter its account credential and confirm read-only access.');
   const old=await current(env,owner);
   if(old?.status==='stopping')throw fail('The mailbox service has not confirmed credential removal. Retry removal before connecting again.',409);
   if(old?.status==='connecting')throw fail('This mailbox is already connecting. Stop the current attempt before connecting again.',409);
   await limitConnect(env,owner,now);
   const id=remoteId(),time=new Date(now).toISOString();
   // Keep the old reference while replacing it. Stop can invalidate this marker
   // before a new reference is installed, including during remote cleanup.
   const start=old
    ?env.DB.prepare("UPDATE guardian_connections SET status='connecting',display_label=NULL,connected_at=NULL,updated_at=? WHERE owner_id=? AND provider='mailbox' AND external_id=? AND status=?").bind(time,owner,old.external_id,old.status)
    :env.DB.prepare("INSERT INTO guardian_connections(owner_id,provider,status,external_id,display_label,connected_at,updated_at) VALUES (?,'mailbox','connecting',?,NULL,NULL,?) ON CONFLICT(owner_id,provider) DO NOTHING").bind(owner,id,time);
   const started=await start.run();
   if(!started.meta?.changes)throw fail('This connection changed. Please try again from Connections.',409);
   if(old){
    const removed=await stopRemote(env,owner,old.external_id,options);
    if(!removed){
     await env.DB.prepare("UPDATE guardian_connections SET status='stopping' WHERE owner_id=? AND provider='mailbox' AND external_id=? AND status='connecting'").bind(owner,old.external_id).run();
     throw fail('The mailbox service has not confirmed credential removal. Retry removal before connecting again.',409);
    }
    const replaced=await env.DB.prepare("UPDATE guardian_connections SET external_id=? WHERE owner_id=? AND provider='mailbox' AND external_id=? AND status='connecting'").bind(id,owner,old.external_id).run();
    if(!replaced.meta?.changes)throw fail('This connection was stopped or replaced.',409);
   }
   try{
    const marker=await current(env,owner);if(marker?.external_id!==id||marker.status!=='connecting')throw fail('This connection was stopped or replaced.',409);
    const remote=await signedMailboxRequest(env,'/v1/connections',{...await remoteReference(owner,id),providerId:provider.id,username:body.username,password:body.password,consent:true},options);body=null;
    if(remote.state!=='connected'||remote.generation!==1||remote.providerId!==provider.id||remote.protocol!==provider.protocol)throw fail('The mailbox could not be verified.',502);
    const saved=await env.DB.prepare("UPDATE guardian_connections SET status='connected',display_label=?,connected_at=?,updated_at=? WHERE owner_id=? AND provider='mailbox' AND external_id=? AND status='connecting'").bind(provider.label,time,time,owner,id).run();
    if(!saved.meta?.changes)throw fail('This connection was stopped or replaced.',409);
    return json({connected:true,readOnly:true,syncReady:false,searchReady:true});
   }catch(error){
    body=null;
    const removed=await stopMailboxReference(env,owner,id,{fetcher,now});
    if(!removed.revoked&&(await current(env,owner))?.external_id===id)throw fail('The connection could not be completed. Access stopped here, but the mailbox service has not confirmed credential removal. Retry removal before connecting again.',error.status||503);
    throw error;
   }
  }
  if((request.method==='GET'&&u.pathname===base+'/search')||(request.method==='POST'&&u.pathname===base+'/read')){
   const id=await activeReference(env,owner);let path,input;
   if(request.method==='GET'){if(u.searchParams.getAll('q').length!==1||[...u.searchParams.keys()].some(k=>k!=='q'))throw fail('Enter a search between 2 and 200 characters.');const query=u.searchParams.get('q');if(!query||query.trim().length<2||query.length>200||!/^[\x20-\x7e]+$/.test(query))throw fail('Use a search between 2 and 200 plain English characters.');path='/v1/search';input={query:query.trim()};}
   else{const body=await readJson(request);if(Object.keys(body).length!==1||!settings.providers.some(p=>safeReference(body.reference,p.protocol)))throw fail('Choose a valid message reference.');path='/v1/read';input={reference:body.reference};}
   const result=await signedMailboxRequest(env,path,{...await remoteReference(owner,id),...input},options);await assertCurrent(env,owner,id);return json(await recordsForOwner(result,owner,id,settings));
  }
  return json({message:'Method or connection route not found.'},405);
 }catch(error){return json({code:'MAILBOX_CONNECTION_ERROR',message:error.status?error.message:'The mailbox connection could not be completed.'},error.status||503);}
}

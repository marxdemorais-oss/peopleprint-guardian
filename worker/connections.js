import {htmlText,htmlLinkEvidence} from '../web/assets/import-records.js';
import {contactOnboardingPaused,nativeMessagingReady} from './messaging-config.js';
import {wolfgangDirectory, wolfgangContactCard} from './wolfgang-directory.js';
import {getXConnection} from './x-connection.js';
import {getXWebhookStatus} from './x-webhook-setup.js';
import {verifyGoogleReceipt} from './gmail-receipt.js';
import {requestProviderBytes} from './provider-http.js';
import {mailboxConnectionSummary,stopOwnedMailbox} from './mailbox-connection.js';
// Account credentials never reach the browser or the language model.
// Each OAuth flow belongs to the authenticated Guardian owner, not an email match.
const connectionHeaders={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const connectionJson=(body,status=200)=>new Response(JSON.stringify(body),{status,headers:connectionHeaders});
const connectionFailure=(message,status=400)=>Object.assign(new Error(message),{status});
const connectionProviders={
 gmail:{label:'Gmail',description:'Find the earlier email that puts a new request in context.',prefix:'GMAIL',authorize:'https://accounts.google.com/o/oauth2/v2/auth',token:'https://oauth2.googleapis.com/token',scope:'https://www.googleapis.com/auth/gmail.readonly'},
 outlook:{label:'Outlook',description:'Bring your Outlook or Microsoft 365 conversations into the picture.',prefix:'OUTLOOK',authorize:'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',token:'https://login.microsoftonline.com/common/oauth2/v2.0/token',scope:'offline_access https://graph.microsoft.com/User.Read https://graph.microsoft.com/Mail.Read'},
 peopleprint:{label:'Peopleprint',description:'Use the context you already keep with People Organised.',prefix:'PEOPLEPRINT'}
};
const connectionEncoder=new TextEncoder();
const connectionBytes=value=>Uint8Array.from(atob(value.replace(/-/g,'+').replace(/_/g,'/')),c=>c.charCodeAt(0));
const connectionBase64=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
const connectionRandom=()=>connectionBase64(crypto.getRandomValues(new Uint8Array(32)));
const connectionHash=async value=>connectionBase64(new Uint8Array(await crypto.subtle.digest('SHA-256',connectionEncoder.encode(value))));
function approvedConnectionScope(provider,value,fallback){
 // A missing scope means the scopes originally requested, not a broader grant.
 // Compare individual scope names: Mail.ReadWrite is not Mail.Read.
 const scope=value===undefined?fallback:value;
 if(typeof scope!=='string'||!scope.trim()||scope.length>4096)throw connectionFailure('The account did not grant the approved read-only access.',502);
 const scopes=[...new Set(scope.trim().split(/\s+/))];
 if(provider==='gmail'){
  if(scopes.length!==1||scopes[0]!==connectionProviders.gmail.scope)throw connectionFailure('The account did not grant the approved read-only access.',502);
 }else{
  const names=scopes.map(item=>item.replace(/^https:\/\/graph\.microsoft\.com\//,''));
  if(names.some(item=>!['offline_access','User.Read','Mail.Read'].includes(item))||!names.includes('User.Read')||!names.includes('Mail.Read'))throw connectionFailure('The account did not grant the approved read-only access.',502);
 }
 return scope;
}
const validConnectionToken=value=>typeof value==='string'&&value.length>0&&value.length<=32000&&!/[\s\0]/.test(value);
export const connectionVisible=(env,provider)=>env[provider.toUpperCase()+'_HIDDEN']!=='true';
function connectionKeyBytes(env){try{const value=connectionBytes(env.CONNECTION_ENCRYPTION_KEY||'');return value.length===32?value:null;}catch{return null;}}
async function connectionCryptoKey(env){const bytes=connectionKeyBytes(env);if(!bytes)throw connectionFailure('Account connections are not available yet.',503);return crypto.subtle.importKey('raw',bytes,{name:'AES-GCM'},false,['encrypt','decrypt']);}
export async function encryptConnectionValue(value,env,ownerId,provider){const iv=crypto.getRandomValues(new Uint8Array(12));const encrypted=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:connectionEncoder.encode(ownerId+'\n'+provider)},await connectionCryptoKey(env),connectionEncoder.encode(JSON.stringify(value)));return 'v1.'+connectionBase64(iv)+'.'+connectionBase64(new Uint8Array(encrypted));}
export async function decryptConnectionValue(value,env,ownerId,provider){const [version,iv,cipher]=value.split('.');if(version!=='v1'||!iv||!cipher)throw new Error('Invalid encrypted credential');const plain=await crypto.subtle.decrypt({name:'AES-GCM',iv:connectionBytes(iv),additionalData:connectionEncoder.encode(ownerId+'\n'+provider)},await connectionCryptoKey(env),connectionBytes(cipher));return JSON.parse(new TextDecoder().decode(plain));}
export function connectionSettings(env,provider,origin){const p=connectionProviders[provider];if(!p||provider==='peopleprint')return {configured:false};const callback=env[p.prefix+'_REDIRECT_URI'];let valid=false;try{const u=new URL(callback);valid=u.protocol==='https:'&&u.origin===origin&&u.pathname==='/api/connections/'+provider+'/callback'&&!u.search&&!u.hash&&!u.username&&!u.password;}catch{}
 return {...p,clientId:env[p.prefix+'_CLIENT_ID'],clientSecret:env[p.prefix+'_CLIENT_SECRET'],callback,configured:Boolean(connectionVisible(env,provider)&&env.DB&&connectionKeyBytes(env)&&env[p.prefix+'_CONNECT_ENABLED']==='true'&&env[p.prefix+'_CLIENT_ID']&&env[p.prefix+'_CLIENT_SECRET']&&valid)};
}
// Use the identity verified by People Organised, never an email supplied in a message.
export async function registerVerifiedEmailSender(env,identity,now=Date.now()){
 const owner=identity?.ownerId;
 const email=String(identity?.email||'').trim().toLowerCase();
 if(!env.DB||!identity?.peopleOrganisedId||owner!=='people:'+identity.peopleOrganisedId||
    !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email)||email.length>254||
    !wolfgangContacts(env).some(c=>c.channel==='email'&&c.available))return;
 await env.DB.batch([
  env.DB.prepare(`INSERT INTO guardian_channel_identities(channel,sender_id,owner_id,verified_at)
   SELECT 'email',?,?,? WHERE NOT EXISTS (SELECT 1 FROM guardian_channel_preferences WHERE owner_id=? AND channel='email')
   AND NOT EXISTS (SELECT 1 FROM guardian_email_sender_optouts WHERE sender_id=?)
   ON CONFLICT(channel,sender_id) DO NOTHING`).bind(email,owner,now,owner,email),
  env.DB.prepare(`UPDATE guardian_message_jobs SET state='queued',after_send_state='completed',reply_text=NULL,
   provider_message_id=NULL,delivery_generation=delivery_generation+1,attempts=0,next_attempt_at=0,owner_id=?,updated_at=?
   WHERE channel='email' AND sender_id=? AND state='waiting_link' AND expires_at>? AND (owner_id IS NULL OR owner_id=?)
   AND EXISTS (SELECT 1 FROM guardian_channel_identities WHERE channel='email' AND sender_id=? AND owner_id=?)`).bind(owner,now,email,now,owner,email,owner)
 ]);
}
export function wolfgangContacts(env) {
  const activated = new Set(String(env.CONTACT_CHANNELS || '').split(',').map(value => value.trim()));
  const gatewayReady = Boolean(env.DB && typeof env.CONTACT_GATEWAY_SECRET === 'string' && env.CONTACT_GATEWAY_SECRET.length >= 32);
  return wolfgangDirectory(env).map(contact => {
    const { channel, directoryUrl, directoryLabel } = contact;
    const nativeReady = nativeMessagingReady(env, channel);
    const transportReady = nativeReady || env.CONTACT_EXTERNAL_GATEWAY_ENABLED === 'true';
    const repliesEnabled = env['WOLFGANG_' + channel.toUpperCase() + '_ENABLED'] === 'true';
    const xApproved = channel !== 'x' || (env.X_RECEIVING_ENABLED === 'true' && env.X_AUTOMATED_REPLIES_APPROVED === 'true');
    const available = Boolean(directoryUrl && gatewayReady && activated.has(channel) && transportReady && repliesEnabled && xApproved &&
      (channel !== 'messenger' || env.WOLFGANG_MESSENGER_URL));
    let contactState = directoryUrl ? 'directory' : 'unavailable';
    if (directoryUrl && nativeReady && ['email', 'whatsapp', 'messenger'].includes(channel) && env[channel.toUpperCase() + '_RECEIVING_ENABLED'] === 'true') {
      contactState = channel === 'messenger' ? 'testing' : 'receiving';
    }
    if (available) contactState = 'available';
    const transportValue = ['whatsapp', 'email', 'sms'].includes(channel) ? directoryLabel : directoryUrl;
    return { ...contact, contactState, onboardingPaused: contactOnboardingPaused(channel), available, value: available ? transportValue : null, url: available ? directoryUrl : null };
  });
}
async function liveWolfgangContacts(env) {
  const contacts = wolfgangContacts(env);
  if (contacts.some(contact => contact.channel === 'x' && contact.available) && !(await getXConnection(env)).connected) {
    return contacts.map(contact => contact.channel === 'x' ? { ...contact, available: false, contactState: 'directory', value: null, url: null } : contact);
  }
  return contacts;
}
async function privateWolfgangContacts(env,ownerId,now){
 const contacts=await liveWolfgangContacts(env);
 // Account linking is separate from AI/reply activation. Existing authorised
 // Guardian identities can link publicly; fixed transport tests stay owner-only.
 const authenticatedOwner=typeof ownerId==='string'&&/^(?:people:)?[A-Za-z0-9_-]{1,160}$/.test(ownerId);
 const publicLinking=env.X_PUBLIC_LINKING_ENABLED==='true'&&authenticatedOwner;
 const supervised=env.GUARDIAN_TRANSPORT_TEST_ENABLED==='true'&&ownerId===env.GUARDIAN_TRANSPORT_TEST_OWNER_ID&&ownerId?.startsWith('people:');
 if((!publicLinking&&!supervised)||contacts.some(c=>c.channel==='x'&&c.available)||env.X_RECEIVING_ENABLED!=='true'||!nativeMessagingReady(env,'x')||!String(env.CONTACT_CHANNELS||'').split(',').map(c=>c.trim()).includes('x'))return contacts;
 let target;try{target=new URL(env.WOLFGANG_X_URL);if(target.protocol!=='https:'||!['x.com','twitter.com'].includes(target.hostname)||target.port||target.username||target.password||target.search||target.hash||target.pathname.replace(/\/$/,'').toLowerCase()!==('/'+env.WOLFGANG_X_HANDLE).toLowerCase())return contacts;}catch{return contacts;}
 if(!(await getXWebhookStatus(env,{now})).webhookReady)return contacts;
 return contacts.map(c=>c.channel==='x'?{...c,contactState:'receiving',linkAvailable:true,value:target.href,url:target.href}:c);
}
export async function xCodeSendingAvailable(env,ownerId,now=Date.now()){
 return Boolean((await privateWolfgangContacts(env,ownerId,now)).find(c=>c.channel==='x'&&(c.available||c.linkAvailable)));
}
async function connectionFetchJson(url,options,fetcher,timeoutMs=15000){
 let bytes;try{bytes=await requestProviderBytes(url,options,{fetcher,timeoutMs,maxBytes:262144});}
 catch(error){if(error.code==='PROVIDER_TOO_LARGE')throw connectionFailure('That message is too large to read here. Share a selected export instead.',413);throw connectionFailure('The account provider could not complete the request. Please try again.',502);}
 try{return JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw connectionFailure('Unexpected provider response.',502);}
}
async function connectionProfile(provider,accessToken,fetcher){const url=provider==='gmail'?'https://gmail.googleapis.com/gmail/v1/users/me/profile':'https://graph.microsoft.com/v1.0/me?$select=id,mail,userPrincipalName';const value=await connectionFetchJson(url,{headers:{Authorization:'Bearer '+accessToken}},fetcher);const id=provider==='gmail'?value.emailAddress:value.id,label=provider==='gmail'?value.emailAddress:(value.mail||value.userPrincipalName);if(typeof id!=='string'||!id.trim()||id.length>256||/[\r\n\0]/.test(id)||typeof label!=='string'||!label.trim()||label.length>256||/[\r\n\0]/.test(label))throw connectionFailure('The account could not be identified.',502);return {id,label};}
function connectionReturn(origin,result,provider){return new Response(null,{status:303,headers:{Location:origin+'/connections?connection='+result+'&provider='+provider,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});}
export async function disconnectOwnedConnection(env,ownerId,provider,{fetcher=fetch}={}){if(provider==='mailbox')return stopOwnedMailbox(env,ownerId,{fetcher});if(!env.DB)return {revoked:false};const record=await env.DB.prepare('SELECT encrypted_token FROM guardian_connection_tokens WHERE owner_id = ? AND provider = ?').bind(ownerId,provider).first();
 // Stop local access before contacting an upstream service. Removing the OAuth
 // marker also cancels a callback whose token exchange is already in flight.
 await env.DB.batch([env.DB.prepare('DELETE FROM guardian_connection_tokens WHERE owner_id = ? AND provider = ?').bind(ownerId,provider),env.DB.prepare('DELETE FROM guardian_connections WHERE owner_id = ? AND provider = ?').bind(ownerId,provider),env.DB.prepare('DELETE FROM guardian_oauth_states WHERE owner_id = ? AND provider = ?').bind(ownerId,provider)]);
 let revoked=false;if(record&&provider==='gmail'){try{const token=await decryptConnectionValue(record.encrypted_token,env,ownerId,provider);const response=await fetcher('https://oauth2.googleapis.com/revoke',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({token:token.refresh_token||token.access_token}),signal:AbortSignal.timeout(8000),redirect:'manual'});if(response.status>=300&&response.status<400)throw connectionFailure('The account provider redirected the request.',502);revoked=response.ok;}catch{/* Local access has already stopped even when provider revocation fails. */}}return {revoked};
}
export async function disconnectAllOwnedConnections(env,ownerId,options){if(!env.DB)return;const rows=await env.DB.prepare('SELECT provider FROM guardian_connections WHERE owner_id = ? UNION SELECT provider FROM guardian_connection_tokens WHERE owner_id = ? UNION SELECT provider FROM guardian_oauth_states WHERE owner_id = ?').bind(ownerId,ownerId,ownerId).all();for(const row of rows.results||[])await disconnectOwnedConnection(env,ownerId,row.provider,options);}
// Reserved for the scoped mail-retrieval adapter. It is deliberately not an HTTP
// endpoint: neither a customer nor a model can request the raw credential.
export async function getConnectionAccessToken(env,ownerId,provider,{fetcher=fetch,now=Date.now()}={}){
 const p=connectionProviders[provider];if(!ownerId||!p?.token||!connectionVisible(env,provider)||!env.DB||env[p.prefix+'_CONNECT_ENABLED']!=='true')throw connectionFailure('Reconnect this account to continue.',409);
 const row=await env.DB.prepare('SELECT t.encrypted_token,c.status FROM guardian_connection_tokens t JOIN guardian_connections c ON c.owner_id=t.owner_id AND c.provider=t.provider WHERE t.owner_id = ? AND t.provider = ?').bind(ownerId,provider).first();if(!row||row.status!=='connected')throw connectionFailure('Reconnect this account to continue.',409);
 const tokens=await decryptConnectionValue(row.encrypted_token,env,ownerId,provider);approvedConnectionScope(provider,tokens.scope,p.scope);if(!validConnectionToken(tokens.access_token)||!validConnectionToken(tokens.refresh_token))throw connectionFailure('Reconnect this account to continue.',409);if(tokens.expires_at>now+60000){
  if(!await env.DB.prepare("SELECT 1 AS active FROM guardian_connection_tokens t JOIN guardian_connections c ON c.owner_id=t.owner_id AND c.provider=t.provider WHERE t.owner_id=? AND t.provider=? AND t.encrypted_token=? AND c.status='connected'").bind(ownerId,provider,row.encrypted_token).first())throw connectionFailure('This connection changed. Please try again from your connections.',409);return tokens.access_token;
 }
 const clientId=env[p.prefix+'_CLIENT_ID'],clientSecret=env[p.prefix+'_CLIENT_SECRET'];if(!clientId||!clientSecret)throw connectionFailure('This account connection is not available yet.',503);
 try{const fresh=await connectionFetchJson(p.token,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,client_secret:clientSecret,grant_type:'refresh_token',refresh_token:tokens.refresh_token,...(provider==='outlook'?{scope:p.scope}:{})})},fetcher);if(!validConnectionToken(fresh.access_token)||(fresh.refresh_token!==undefined&&!validConnectionToken(fresh.refresh_token)))throw new Error('Invalid refreshed credential');
  const value={access_token:fresh.access_token,refresh_token:fresh.refresh_token??tokens.refresh_token,scope:approvedConnectionScope(provider,fresh.scope,tokens.scope||p.scope),expires_at:now+Math.min(86400,Math.max(60,Number(fresh.expires_in)||3600))*1000};const encrypted=await encryptConnectionValue(value,env,ownerId,provider);const updated=await env.DB.prepare("UPDATE guardian_connection_tokens SET encrypted_token = ?,updated_at = ? WHERE owner_id = ? AND provider = ? AND encrypted_token = ? AND EXISTS (SELECT 1 FROM guardian_connections c WHERE c.owner_id=guardian_connection_tokens.owner_id AND c.provider=guardian_connection_tokens.provider AND c.status='connected')").bind(encrypted,new Date(now).toISOString(),ownerId,provider,row.encrypted_token).run();
  if(!updated.meta?.changes)throw connectionFailure('This connection changed. Please try again from your connections.',409);return value.access_token;
 }catch{await env.DB.prepare('UPDATE guardian_connections SET status = ?,updated_at = ? WHERE owner_id = ? AND provider = ? AND EXISTS (SELECT 1 FROM guardian_connection_tokens t WHERE t.owner_id=guardian_connections.owner_id AND t.provider=guardian_connections.provider AND t.encrypted_token=?)').bind('reconnect_required',new Date(now).toISOString(),ownerId,provider,row.encrypted_token).run();throw connectionFailure('Please reconnect this account so Wolfgang can read it again.',409);}
}
export async function cleanupExpiredOAuthStates(env,now=Date.now()){if(env.DB)await env.DB.prepare('DELETE FROM guardian_oauth_states WHERE expires_at < ?').bind(now).run();}
function connectionPlainMime(payload){
 let visited=0,text='',links='',omitted=false;
 function visit(part,depth){
  if(!part)return;
  if(depth>8||++visited>50||text.length+links.length>=20000){omitted=true;return;}
  if(part.filename||part.body?.attachmentId){omitted=true;return;}
  if(['text/plain','text/html'].includes(part.mimeType)&&typeof part.body?.data==='string'){
   try{const decoded=new TextDecoder().decode(connectionBytes(part.body.data)).replace(/\0/g,'');
    const extra=part.mimeType==='text/plain'?decoded:htmlLinkEvidence(htmlText(decoded));
    const left=20000-text.length-links.length;if(extra.length>left)omitted=true;
    if(extra){if(part.mimeType==='text/plain')text+=extra.slice(0,left)+'\n';else links+=extra.slice(0,left)+'\n';}
   }catch{omitted=true;}
  }
  const children=Array.isArray(part.parts)?part.parts:[];if(children.length>50)omitted=true;
  for(const child of children.slice(0,50))visit(child,depth+1);
 }
 visit(payload,0);
 return {text:text.trim(),links:links.trim(),excerpt:omitted};
}
async function connectionRecord(ownerId,provider,providerId,subject,sender,date,body,excerpt,replyTo=''){const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',connectionEncoder.encode(ownerId+'\n'+provider+'\n'+providerId)));const id='ev-mail-'+Array.from(digest.slice(0,12),b=>b.toString(16).padStart(2,'0')).join('');const title=String(subject||'Untitled email').slice(0,130);const safeDate=typeof date==='string'&&!Number.isNaN(Date.parse(date))?new Date(date).toISOString():null;const content='Subject: '+title+'\nFrom: '+String(sender||'Not provided').replace(/[\r\n]/g,' ').slice(0,256)+'\n'+(replyTo?'Reply-To: '+String(replyTo).replace(/[\r\n]/g,' ').slice(0,256)+'\n':'')+(safeDate?'Date: '+safeDate+'\n':'')+'\n'+String(body||'No readable text was returned.');excerpt=Boolean(excerpt)||content.length>20000;const prefix=excerpt?'Message preview only; some content is omitted.\n':'';return {id,source:(connectionProviders[provider].label+' · '+title).slice(0,160),text:prefix+content.slice(0,20000-prefix.length),date:safeDate,provider,provenance:'connected_account',excerpt};}
export async function searchConnectedMail(env,ownerId,provider,query,{fetcher=fetch,now=Date.now()}={}){
 if(!['gmail','outlook'].includes(provider)||typeof query!=='string'||query.trim().length<2||query.length>200||/[\r\n\0]/.test(query))throw connectionFailure('Enter a name, subject or reference between 2 and 200 characters.');
 const token=await getConnectionAccessToken(env,ownerId,provider,{fetcher,now}),headers={Authorization:'Bearer '+token};
 const stillConnected=async()=>{if(await getConnectionAccessToken(env,ownerId,provider,{fetcher,now})!==token)throw connectionFailure('This connection changed. Please try again from your connections.',409);};
 if(provider==='outlook'){const url=new URL('https://graph.microsoft.com/v1.0/me/messages');url.searchParams.set('$search','"'+query.trim().replace(/["\\]/g,' ')+'"');url.searchParams.set('$top','5');url.searchParams.set('$select','id,subject,from,replyTo,receivedDateTime,bodyPreview');const data=await connectionFetchJson(url.href,{headers},fetcher);const rows=Array.isArray(data.value)?data.value.slice(0,5):[];const records=await Promise.all(rows.filter(m=>typeof m.id==='string'&&m.id.length<=1024).map(m=>connectionRecord(ownerId,provider,m.id,m.subject,(m.from?.emailAddress?.name?m.from.emailAddress.name+' <'+(m.from.emailAddress.address||'')+'>':m.from?.emailAddress?.address),m.receivedDateTime,m.bodyPreview,true,Array.isArray(m.replyTo)?m.replyTo.slice(0,3).map(v=>v?.emailAddress?.address).filter(Boolean).join(', '):'')));await stillConnected();return {records,limited:true};}
 const url=new URL('https://gmail.googleapis.com/gmail/v1/users/me/messages');url.searchParams.set('q',query.trim());url.searchParams.set('maxResults','5');url.searchParams.set('includeSpamTrash','false');const data=await connectionFetchJson(url.href,{headers},fetcher);await stillConnected();const ids=(Array.isArray(data.messages)?data.messages:[]).slice(0,5).map(m=>m.id).filter(id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,256}$/.test(id));const results=await Promise.allSettled(ids.map(async id=>{const message=await connectionFetchJson('https://gmail.googleapis.com/gmail/v1/users/me/messages/'+encodeURIComponent(id)+'?format=full',{headers},fetcher);const hs=Array.isArray(message.payload?.headers)?message.payload.headers:[],header=name=>hs.find(h=>String(h.name).toLowerCase()===name)?.value;const plain=connectionPlainMime(message.payload),date=Number(message.internalDate);const record=await connectionRecord(ownerId,provider,id,header('subject'),header('from'),Number.isFinite(date)&&date>0?new Date(date).toISOString():header('date'),(plain.text||message.snippet||'')+(plain.links?'\n\nLinks in the HTML version (unverified):\n'+plain.links:''),!plain.text||plain.excerpt,header('reply-to'));
  // Only request the raw bytes of a small message with a potentially supported
  // receipt. A missing copy or signature must never break ordinary mail search.
  if(message.id===id&&Number.isSafeInteger(message.sizeEstimate)&&message.sizeEstimate>0&&message.sizeEstimate<=180000&&
     hs.some(h=>h.name?.toLowerCase()==='arc-authentication-results'&&/^i=1;\s*mx\.google\.com;/i.test(h.value))){
   try{
    const raw=await connectionFetchJson('https://gmail.googleapis.com/gmail/v1/users/me/messages/'+encodeURIComponent(id)+'?format=raw',{headers},fetcher,3500);
    if(raw.id===id&&typeof raw.raw==='string'&&raw.raw.length<=240000){
     const auth=await verifyGoogleReceipt(atob(raw.raw.replace(/-/g,'+').replace(/_/g,'/')),header('from'),fetcher);
     if(auth)record.mailAuthentication=auth;
    }
   }catch{/* Mail remains available when authentication evidence is unavailable. */}
  }
  return record;}));const records=results.filter(r=>r.status==='fulfilled').map(r=>r.value);await stillConnected();if(ids.length&&!records.length)throw connectionFailure('Those messages could not be read. Try a more specific search or share a selected export.',502);return {records,limited:true,partial:records.length<ids.length};
}
export async function handleConnectionRequest(request,env,identity,{fetcher=fetch,now=Date.now(),contactPhoto}={}){
 const u=new URL(request.url),path=u.pathname;if(path!=='/api/connections'&&path!=='/api/wolfgang/contact-card'&&!path.startsWith('/api/connections/'))return null;
 const ownerId=identity?.ownerId;if(!ownerId){
  const callback=path.match(/^\/api\/connections\/(gmail|outlook)\/callback$/);
  if(request.method==='GET'&&callback&&u.searchParams.get('guardian_return')==='1')return connectionReturn(u.origin,'expired',callback[1]);
  return connectionJson({code:'SIGN_IN_REQUIRED',message:'Sign in to manage your connections.'},401);
 }
 try{
  if(request.method==='GET'&&path==='/api/connections'){
   await registerVerifiedEmailSender(env,identity,now);
   const rows=env.DB?(await env.DB.prepare('SELECT provider,status,display_label,connected_at FROM guardian_connections WHERE owner_id = ?').bind(ownerId).all()).results||[]:[];
   return connectionJson({connections:[...Object.entries(connectionProviders).filter(([provider])=>connectionVisible(env,provider)).map(([provider,p])=>{const row=rows.find(r=>r.provider===provider),available=connectionSettings(env,provider,u.origin).configured;return {provider,label:p.label,description:provider==='peopleprint'&&identity.peopleOrganisedId?'You already use your People Organised account here. Sharing its wider Peopleprint context is being prepared.':p.description,status:row?.status||'not_connected',displayLabel:row?.display_label||null,connectedAt:row?.connected_at||null,available,readOnly:true,syncReady:false,searchReady:available&&row?.status==='connected'&&['gmail','outlook'].includes(provider)};}),...await (async()=>{const mailbox=await mailboxConnectionSummary(env,ownerId);return mailbox?[mailbox]:[];})()],contacts:await privateWolfgangContacts(env,ownerId,now)});
  }
  if(request.method==='GET'&&path==='/api/wolfgang/contact-card'){
   return new Response(wolfgangContactCard(env, contactPhoto), {headers: {
     'Content-Type': 'text/vcard; charset=utf-8',
     'Content-Disposition': 'attachment; filename="Wolfgang.vcf"',
     'Cache-Control': 'private, no-store',
     'X-Content-Type-Options': 'nosniff'
   }});
  }
  const match=path.match(/^\/api\/connections\/(gmail|outlook|peopleprint)(?:\/(start|callback|search))?$/);if(!match)return connectionJson({message:'Connection route not found.'},404);const [,provider,action]=match;
  if(request.method==='DELETE'&&!action){
   if(request.headers.get('origin')!==u.origin)return connectionJson({message:'Request rejected.'},403);if(!env.DB)throw connectionFailure('Account connections are not available yet.',503);
   const result=await disconnectOwnedConnection(env,ownerId,provider,{fetcher});return connectionJson({disconnected:true,savedInformationRetained:true,message:provider==='outlook'?'Disconnected. Your saved information stays with Wolfgang. You can also remove Guardian’s permission in your Microsoft account.':result.revoked?'Disconnected. Your saved information stays with Wolfgang.':'Disconnected. Your saved information stays with Wolfgang. You can also remove Guardian’s permission in your account settings.'});
  }
  if(request.method!=='GET'||!action)return connectionJson({message:'Method not allowed.'},405);
  const settings=connectionSettings(env,provider,u.origin);if(!settings.configured){if(action==='callback')return connectionReturn(u.origin,'unavailable',provider);return connectionJson({code:'CONNECTION_NOT_CONFIGURED',message:provider==='peopleprint'?'People Organised account linking is being prepared. Your accounts have not been merged.':'This account connection is not available yet. You can paste a message or upload an export instead.'},503);}
  if(action==='search'){if(request.headers.get('sec-fetch-site')&&!['same-origin','none'].includes(request.headers.get('sec-fetch-site')))return connectionJson({message:'Search from your Guardian workspace.'},403);return connectionJson(await searchConnectedMail(env,ownerId,provider,u.searchParams.get('q')||'',{fetcher,now}));}
  if(action==='start'){
   if(request.headers.get('sec-fetch-site')&&!['same-origin','none'].includes(request.headers.get('sec-fetch-site')))return connectionJson({message:'Start the connection from Guardian.'},403);
   const state=connectionRandom(),verifier=connectionRandom(),stateHash=await connectionHash(state),encrypted=await encryptConnectionValue(verifier,env,ownerId,provider);
   await env.DB.batch([env.DB.prepare('DELETE FROM guardian_oauth_states WHERE owner_id = ? AND (provider = ? OR expires_at < ?)').bind(ownerId,provider,now),env.DB.prepare('INSERT INTO guardian_oauth_states (state_hash,owner_id,provider,expires_at,pkce_verifier,created_at) VALUES (?,?,?,?,?,?)').bind(stateHash,ownerId,provider,now+600000,encrypted,now)]);
   const target=new URL(settings.authorize);Object.entries({client_id:settings.clientId,redirect_uri:settings.callback,response_type:'code',scope:settings.scope,state,code_challenge:await connectionHash(verifier),code_challenge_method:'S256',...(provider==='gmail'?{access_type:'offline',prompt:'consent'}:{response_mode:'query',prompt:'select_account'})}).forEach(([key,value])=>target.searchParams.set(key,value));return new Response(null,{status:302,headers:{Location:target.href,'Cache-Control':'no-store','Referrer-Policy':'no-referrer'}});
  }
  const state=u.searchParams.get('state')||'';if(['state','code','error','guardian_return'].some(name=>u.searchParams.getAll(name).length>1)||u.searchParams.has('guardian_return')&&u.searchParams.get('guardian_return')!=='1'||u.searchParams.has('code')&&u.searchParams.has('error')||!/^[A-Za-z0-9_-]{43}$/.test(state))return connectionReturn(u.origin,'expired',provider);
  // Claim state atomically, but retain a cancellation marker until commit.
  // A Stop or a newer Connect deletes it, so an old callback cannot reconnect.
  const stateHash=await connectionHash(state),saved=await env.DB.prepare('SELECT pkce_verifier FROM guardian_oauth_states WHERE state_hash = ? AND owner_id = ? AND provider = ? AND expires_at >= ?').bind(stateHash,ownerId,provider,now).first();if(!saved||saved.pkce_verifier.startsWith('claimed.'))return connectionReturn(u.origin,'expired',provider);
  const claim='claimed.'+connectionRandom(),claimed=await env.DB.prepare('UPDATE guardian_oauth_states SET pkce_verifier=? WHERE state_hash=? AND owner_id=? AND provider=? AND pkce_verifier=? AND expires_at>=?').bind(claim,stateHash,ownerId,provider,saved.pkce_verifier,now).run();if(!claimed.meta?.changes)return connectionReturn(u.origin,'expired',provider);
  const clearClaim=()=>env.DB.prepare('DELETE FROM guardian_oauth_states WHERE state_hash=? AND owner_id=? AND provider=? AND pkce_verifier=?').bind(stateHash,ownerId,provider,claim).run();
  if(u.searchParams.has('error')){await clearClaim();return connectionReturn(u.origin,'cancelled',provider);}
  const code=u.searchParams.get('code')||'';if(!code||code.length>4096||/[\x00-\x20\x7f]/.test(code)){await clearClaim();return connectionReturn(u.origin,'failed',provider);}
  try{
   const verifier=await decryptConnectionValue(saved.pkce_verifier,env,ownerId,provider);const tokens=await connectionFetchJson(settings.token,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:settings.clientId,client_secret:settings.clientSecret,redirect_uri:settings.callback,code,code_verifier:verifier,grant_type:'authorization_code',...(provider==='outlook'?{scope:settings.scope}:{})})},fetcher);
   if(!validConnectionToken(tokens.access_token)||!validConnectionToken(tokens.refresh_token))throw connectionFailure('An ongoing read-only connection was not granted.',502);
   const granted=approvedConnectionScope(provider,tokens.scope,settings.scope);
   if(!await env.DB.prepare('SELECT state_hash FROM guardian_oauth_states WHERE state_hash=? AND owner_id=? AND provider=? AND pkce_verifier=?').bind(stateHash,ownerId,provider,claim).first())return connectionReturn(u.origin,'cancelled',provider);
   const profile=await connectionProfile(provider,tokens.access_token,fetcher),time=new Date(now).toISOString();const encrypted=await encryptConnectionValue({access_token:tokens.access_token,refresh_token:tokens.refresh_token,scope:granted,expires_at:now+Math.min(86400,Math.max(60,Number(tokens.expires_in)||3600))*1000},env,ownerId,provider);
   const current='EXISTS (SELECT 1 FROM guardian_oauth_states WHERE state_hash=? AND owner_id=? AND provider=? AND pkce_verifier=?)',claimArgs=[stateHash,ownerId,provider,claim];
   const committed=await env.DB.batch([env.DB.prepare(`INSERT INTO guardian_connections (owner_id,provider,status,external_id,display_label,connected_at,updated_at) SELECT ?,?,?,?,?,?,? WHERE ${current} ON CONFLICT(owner_id,provider) DO UPDATE SET status=excluded.status,external_id=excluded.external_id,display_label=excluded.display_label,connected_at=excluded.connected_at,updated_at=excluded.updated_at`).bind(ownerId,provider,'connected',profile.id,profile.label,time,time,...claimArgs),env.DB.prepare(`INSERT INTO guardian_connection_tokens (owner_id,provider,encrypted_token,updated_at) SELECT ?,?,?,? WHERE ${current} ON CONFLICT(owner_id,provider) DO UPDATE SET encrypted_token=excluded.encrypted_token,updated_at=excluded.updated_at`).bind(ownerId,provider,encrypted,time,...claimArgs),env.DB.prepare('DELETE FROM guardian_oauth_states WHERE state_hash=? AND owner_id=? AND provider=? AND pkce_verifier=?').bind(...claimArgs)]);return connectionReturn(u.origin,committed[0].meta?.changes?'connected':'cancelled',provider);
  }catch{await clearClaim();return connectionReturn(u.origin,'failed',provider);}
 }catch(error){return connectionJson({code:'CONNECTION_ERROR',message:error.status?error.message:'Your connections could not be loaded. Please try again.'},error.status||503);}
}

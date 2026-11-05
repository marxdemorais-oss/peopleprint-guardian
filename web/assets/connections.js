import {initShell,api} from './journey.js';
import {createMailboxConnectForm} from './mailbox-setup.js';
initShell({page:'connections'});
const introduction=new URL(location.href).searchParams;
if(introduction.get('welcome')==='1'){
 const panel=document.querySelector('#first-connections'),link=document.querySelector('#connections-continue');
 panel.hidden=false;
 document.querySelector('#connections-eyebrow').textContent = 'Meet Wolfgang · Your personal Guardian';
 const emphasis = document.createElement('em');
 emphasis.textContent = 'the message.';
 document.querySelector('#contact-title').replaceChildren(document.createTextNode('Bring me '), emphasis);
 document.querySelector('#connections-lead').textContent = 'Start with a message, a link or a request you’re unsure about. In your workspace you can add an earlier email or a note to keep the details together.';
 document.querySelector('#save-wolfgang').classList.add('secondary');
 const next = introduction.get('next');
 if (next && /^\/(?:workspace|welcome|connections|account|plans|demo|privacy|data-deletion|wolfgang-3d)?(?:[?#]|$)/.test(next) && !/[\\\r\n]/.test(next)) {
   link.href = next === '/workspace' ? '/workspace?start=paste' : next;
   const destination = new URL(next, location.href);
   link.textContent = destination.pathname === '/workspace'
     ? (destination.searchParams.has('check') ? 'Continue to my check →' : 'Bring a message →')
     : 'Continue →';
 }
 api('/api/profile',{method:'PATCH',body:{connectionsIntroduced:true}}).catch(()=>{});
}

const optionsGrid = document.querySelector('#connection-options');
const setup = document.querySelector('#add-connection');
const grid=document.querySelector('#connection-grid'),feedback=document.querySelector('#connection-feedback'),channels=document.querySelector('#contact-channels');
function notice(message){feedback.textContent=message;feedback.hidden=false;}
function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
async function stopAccess(connection, button) {
 if (button.disabled) return;
 const actionLabel = button.textContent;
 button.disabled = true;
 button.textContent = connection.cleanupPending ? 'Retrying…' : 'Disconnecting…';
 try {
  const result = await api('/api/connections/' + connection.provider, {method: 'DELETE'});
  notice(result.message || 'Disconnected. Your saved checks are still available.');
  await load();
 } catch (error) {
  notice(error.message || 'This account could not be disconnected. Please try again.');
  button.disabled = false;
  button.textContent = actionLabel;
 }
}
function mailboxConnectForm(){return createMailboxConnectForm({api,element,notice,reload:load});}

function validXCodeAuthorizeUrl(value){
 try{
  if(typeof value!=='string'||value.length>4096)return false;
  const u=new URL(value),origin=new URL(location.href).origin,allowed=new Set(['response_type','client_id','redirect_uri','scope','state','code_challenge','code_challenge_method']),names=[...u.searchParams.keys()];
  return u.protocol==='https:'&&u.hostname==='x.com'&&!u.port&&!u.username&&!u.password&&!u.hash&&u.pathname==='/i/oauth2/authorize'&&names.every((name,index)=>allowed.has(name)&&names.indexOf(name)===index)&&u.searchParams.get('redirect_uri')===origin+'/api/messaging/x/callback'&&u.searchParams.get('response_type')==='code'&&u.searchParams.get('code_challenge_method')==='S256'&&/^cx\.[A-Za-z0-9_-]{43}$/.test(u.searchParams.get('state')||'')&&/^[A-Za-z0-9_-]{43}$/.test(u.searchParams.get('code_challenge')||'')&&u.searchParams.get('scope')==='dm.read dm.write users.read tweet.read'&&Boolean(u.searchParams.get('client_id'));
 }catch{return false;}
}

function contactLink(contact,identities,ready){
 const box = element('div', 'contact-link-controls');
 const linked = identities.filter(identity => identity.channel === contact.channel);
 const multiple = ['email','whatsapp'].includes(contact.channel);
 if (multiple) {
  box.append(element('h4','contact-linked-title',contact.channel==='email'?'Your linked email addresses':'Your linked WhatsApp numbers'));
  if (!ready) { box.append(element('p','contact-linked-empty','Your linked contacts could not be loaded. Refresh to try again.')); return box; }
  if (!linked.length) box.append(element('p','contact-linked-empty',contact.channel==='email'?'No email addresses linked yet.':'No WhatsApp numbers linked yet.'));
  const list=element('ul','contact-identities');
  for(const identity of linked){
   const label=contact.channel==='whatsapp'&&/^\d+$/.test(identity.senderId)?'+'+identity.senderId:identity.senderId;
   const row=element('li','contact-identity'),details=element('div','contact-identity-details');
   details.append(element('strong','contact-identity-address',label),element('small','contact-live','Verified'));
   const remove=element('button','contact-remove','Remove');remove.type='button';remove.setAttribute('aria-label','Remove '+label);
   remove.onclick=async()=>{
    if(remove.disabled)return;remove.disabled=true;remove.textContent='Removing…';
    try{await api('/api/contact-link',{method:'DELETE',body:{channel:contact.channel,senderId:identity.senderId}});notice(label+' removed. Your other linked contacts and saved checks are still available.');await load();}
    catch(error){notice(error.message||'This contact could not be removed. Please try again.');remove.disabled=false;remove.textContent='Remove';}
   };
   row.append(details,remove);list.append(row);
  }
  box.append(list,element('p','contact-link-help',contact.channel==='email'?'Write or forward from any verified address here. Any email provider works; connecting a Gmail mailbox is separate.':'Message Wolfgang from any verified number here. Each number uses this Guardian account.'));
  if(linked.length>=3){box.append(element('small','','Three contacts linked. Remove one to add another.'));return box;}
 } else if (linked.length) {
  const manage = element('details', 'connection-manage');
  const disconnect = element('button', 'connection-stop', 'Disconnect');
  disconnect.type = 'button';
  manage.append(element('summary', '', 'Manage access'));
  if (linked.length > 1) manage.append(element('p', '', `This disconnects all ${linked.length} accounts you have linked on this channel.`));
  disconnect.onclick = async () => {
   if (disconnect.disabled) return;
   disconnect.disabled = true;
   disconnect.textContent = 'Disconnecting…';
   try {
    await api('/api/contact-link', {method: 'DELETE', body: {channel: contact.channel}});
    notice('Disconnected. Your saved checks are still available.');
    await load();
   } catch (error) {
    notice(error.message || 'This account could not be disconnected. Please try again.');
    disconnect.disabled = false;
    disconnect.textContent = 'Disconnect';
   }
  };
  manage.append(disconnect);
  box.append(element('small', 'contact-live', linked.length === 1 ? 'Account linked' : `${linked.length} accounts linked`), manage);
  return box;
 }
 if (!ready) { box.append(element('small', '', 'Account linking is not available yet.')); return box; }
 const button=element('button',multiple?'contact-add':'text-link',multiple?(contact.channel==='email'?(linked.length?'Add another email address':'Add an email address'):(linked.length?'Add another WhatsApp number':'Add a WhatsApp number')):'Link this account');button.type='button';
 const status=element('div','contact-link-status');status.setAttribute('role','status');
 button.onclick=async()=>{button.disabled=true;try{
  const result=await api('/api/contact-link',{method:'POST',body:{channel:contact.channel}});
  const instruction=contact.channel==='email'?'Open the mailbox you want to add and compose a new email to '+(contact.directoryLabel||contact.value||'Wolfgang’s address shown above')+'. Paste this code into the subject or message and send it. Check the From address before sending. Any email provider works.':contact.channel==='whatsapp'?'Send this code to Wolfgang from the WhatsApp number you want to add. If you use more than one WhatsApp account, switch to the right account before sending.':contact.channel==='x'?'Let X authorise one linking message from your personal account. The code will then be sent automatically.':result.instruction;
  status.replaceChildren(element('p','',instruction));
  const code=element('input','contact-link-code');code.type='text';code.readOnly=true;code.value=result.code;code.setAttribute('aria-label','Your account linking code');code.onclick=()=>code.select();status.append(code,element('small','','Valid for 10 minutes.'));
  const copy=element('button','text-link','Copy code');copy.type='button';copy.onclick=async()=>{try{await navigator.clipboard.writeText(result.code);copy.textContent='Copied';}catch{code.focus();code.select();copy.textContent='Select and copy the code';}};
  if(contact.channel==='x'){
   status.append(element('small','','X requires message permissions for this send. Your X access token is not kept.'));
   const send=element('button','button secondary','Send code to Wolfgang');send.type='button';
   send.onclick=async()=>{if(send.disabled)return;send.disabled=true;try{const auth=await api('/api/connections/x/send-code',{method:'POST',body:{code:result.code}});if(auth.linked===true){notice('Your X account is already linked to Wolfgang.');await load();return;}if(!validXCodeAuthorizeUrl(auth.authorizeUrl))throw Error('X returned an invalid authorisation destination.');location.assign(auth.authorizeUrl);}catch(error){status.append(element('p','',error.message));send.disabled=false;}};
   status.append(send);
  }else if(contact.channel!=='email'){
   const open=element('a','button secondary','Send code to Wolfgang ↗'),target=new URL(contact.url);if(contact.channel==='whatsapp')target.searchParams.set('text',result.code);else if(contact.channel==='sms')target.searchParams.set('body',result.code);open.href=target.href;open.target='_blank';open.rel='noopener noreferrer';status.append(open);
  }
  const done=element('button','text-link','Check connection');done.type='button';done.onclick=async()=>{try{const fresh=await api('/api/contact-link');if(fresh.identities.some(i=>i.channel===contact.channel&&(!multiple||!linked.some(previous=>previous.senderId===i.senderId)))){notice('Your new contact is verified and linked to Wolfgang.');await load();}else notice('No new contact has been confirmed yet. Send the code from the email address or WhatsApp number you want to add, then check again.');}catch(error){notice(error.message);}};
  status.append(copy,done);button.textContent='Get a new code';
 }catch(error){status.replaceChildren(element('p','',error.message));}finally{button.disabled=false;}};box.append(button,status);return box;
}

function renderAccount(connection, target = grid) {
  const {provider, status, available, searchReady, cleanupPending} = connection;
  const connected = status === 'connected';
  const pending = status === 'connecting';
  const reconnect = status === 'reconnect_required';
  const card = element('article', 'connection-card');
  const top = element('div', 'connection-card-top');
  const mark = element('span', 'connection-monogram', {gmail:'G', outlook:'O', mailbox:'@'}[provider]);
  mark.dataset.provider = provider;
  mark.setAttribute('aria-hidden', 'true');
  const badge = cleanupPending ? 'Cleanup pending' : connected ? 'Connected' : pending ? 'Connecting' : reconnect ? 'Reconnect needed' : available ? 'Ready to connect' : 'Unavailable';
  top.append(mark, element('span', 'connection-badge' + (connected ? ' is-connected' : ''), badge));
  card.append(top, element('h3', '', connection.label));
  if (connection.displayLabel) card.append(element('p', 'connection-subtitle', connection.displayLabel));

  let description = connection.description;
  if (cleanupPending) description = 'Guardian has stopped accessing this mailbox. Retry removal or revoke the app password with your provider.';
  else if (connected) description = searchReady ? 'Find an email, preview it and choose whether to add it to a check.' : 'Your mailbox is connected. Search is currently unavailable.';
  else if (pending) description = 'Your mailbox connection is in progress.';
  else if (reconnect) description = 'Reconnect your mailbox to search for earlier emails.';
  else if (!available) description = 'Direct connection is currently unavailable. You can import a saved email instead.';
  card.append(element('p', '', description));
  if (connected && searchReady) {
    const open = element('a','source-action','Choose an email in your workspace →');
    open.href='/workspace?start=email&provider='+encodeURIComponent(provider);card.append(open);
  }
  if(connected)renderWatch(card,connection);

  if (available && !connected && !pending && !cleanupPending) {
    const action = element(provider === 'mailbox' ? 'button' : 'a', 'button secondary connection-action', reconnect ? 'Reconnect ↗' : 'Connect ↗');
    if (provider === 'mailbox') {
      action.type = 'button';
      action.setAttribute('aria-expanded', 'false');
      action.onclick = () => {
        let form = card.querySelector('.mailbox-connect-form');
        if (form) form.hidden = !form.hidden;
        else { form = mailboxConnectForm(); card.append(form); }
        action.setAttribute('aria-expanded', String(!form.hidden));
      };
    } else {
      action.href = '/api/connections/' + provider + '/start';
      action.target = '_top';
    }
    card.append(action);
  }
  if (connected || reconnect || pending || cleanupPending) {
    const manage = element('details', 'connection-manage');
    const disconnect = element('button', 'connection-stop', cleanupPending ? 'Retry removal' : pending ? 'Cancel connection' : 'Disconnect');
    disconnect.type = 'button';
    disconnect.onclick = () => stopAccess(connection, disconnect);
    manage.append(element('summary', '', 'Manage access'), disconnect);
    card.append(manage);
  }
  target.append(card);
}
const channelLabels = {
  email: ['Email', '@', 'Copy email address'],
  whatsapp: ['WhatsApp', 'W', 'Open WhatsApp'],
  messenger: ['Facebook Messenger', 'M', 'Open Messenger'],
  x: ['X', '𝕏', 'Open X profile'],
  instagram: ['Instagram', '◎', 'Open Instagram'],
  sms: ['SMS', '···', 'Write a text']
};

function contactPresentation(contact, linked) {
  const state = contact.contactState || (contact.available ? 'available' : contact.linkAvailable ? 'receiving' : 'unavailable');
  const descriptions = {
    available: ['Ready to use', 'Send Wolfgang a message here.'],
    receiving: ['Incoming messages', 'Wolfgang can receive messages here. Automatic replies are off.'],
    testing: ['Testing', 'Message delivery is being tested with authorised accounts.'],
    directory: ['Contact details', 'You can save this address. Guardian messaging is not active here yet.'],
    unavailable: ['Unavailable', linked ? 'Messaging is temporarily unavailable. You can manage your connection below.' : 'Contact details are not available yet.']
  };
  return descriptions[state] || descriptions.unavailable;
}

function renderContacts(contacts, identities, identityReady) {
  channels.replaceChildren();
  for (const [channel, [label, symbol, action]] of Object.entries(channelLabels)) {
    const contact = contacts.find(item => item.channel === channel);
    const linked = identities.some(identity => identity.channel === channel);
    if (!contact || contact.hidden || (contact.onboardingPaused && !linked)) continue;
    const [status, explanation] = contactPresentation(contact, linked);
    const destination = contact.directoryUrl || ((contact.available || contact.linkAvailable) && contact.url);
    const card = element('article', 'contact-channel');
    card.dataset.channel = channel;
    card.id = 'channel-' + channel;
    if (!destination && !linked) card.dataset.unavailable = 'true';
    const heading = element('div', 'contact-channel-heading');
    const icon = element('span', 'contact-channel-symbol', symbol);
    icon.setAttribute('aria-hidden', 'true');
    heading.append(icon, element('h3', '', label), element('span', 'channel-state', status));
    card.append(heading);
    const address = contact.directoryLabel || (channel === 'email' && contact.value);
    if (address) card.append(element('p', 'contact-address', address));
    const canReceiveEmail = channel === 'email' && (contact.contactState === 'receiving' || contact.available);
    const description = canReceiveEmail ? 'Forward the email you want Wolfgang to check to this address.' + (contact.available ? ' Send from your verified Guardian address or a sender address you have linked. Wolfgang replies to you by email.' : ' Automatic replies are off.') : explanation;
    card.append(element('p', 'contact-description', description));
    if (channel === 'email' && address) {
      const copy = element('button', 'contact-open text-link', action);
      copy.type = 'button';
      copy.onclick = async () => {
        try { await navigator.clipboard.writeText(address); notice('Wolfgang’s email address was copied.'); }
        catch { notice('Copy the address shown on Wolfgang’s email card.'); }
      };
      card.append(copy);
    } else if (destination && channel !== 'email') {
      const link = element('a', 'contact-open', action + ' ↗');
      link.href = destination;
      if (destination.startsWith('https://')) {
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
      }
      card.append(link);
    }
    if (linked || contact.available || contact.linkAvailable) card.append(contactLink(contact, identities, identityReady));
    channels.append(card);
  }
  channels.setAttribute('aria-busy', 'false');
}

function showEmailOptions() {
  setup.hidden = false;
  document.querySelector('#add-account-action').setAttribute('aria-expanded', 'true');
  setup.scrollIntoView?.({block:'start'});
  setup.focus?.({preventScroll:true});
}
function showAccounts() {
  const link=grid.querySelector?.('.source-action');
  if(link)link.focus?.();else if(!grid.querySelector?.('.connection-card'))showEmailOptions();
}
function renderWatch(card,connection){
 const state=connection.watch;
 const box=element('div','connection-watch');box.append(element('strong','','Inbox monitoring'));
 if(!state){box.append(element('p','',connection.watchUnknown?'Monitoring status could not be loaded. Reload to try again.':'Monitoring is available with a paid plan on supported mailboxes.'));card.append(box);return;}
 const active=Boolean(state.id),ready=state.supported;
 const message=active?(ready?'On for this mailbox.':'Paused: monitoring is currently unavailable.'):(ready?'Off. With your permission, Wolfgang checks new inbox previews for warning signs and compares payment details with saved emails.':'Monitoring is unavailable for this mailbox.');
 box.append(element('p','',message));
 if(active&&state.checkedThrough)box.append(element('small','','Checked through '+new Date(state.checkedThrough).toLocaleString()+'.'));
 if(active||ready){
  const button=element('button','text-link',active?'Stop monitoring':'Monitor new inbox previews');button.type='button';
  if(!active)box.append(element('small','','Flagged excerpts appear in your workspace for up to seven days. You can stop and clear them here.'));
  button.onclick=async()=>{button.disabled=true;try{
   const route='/api/watch/sources/'+connection.provider;
   if(active)await api(route+'?watch='+encodeURIComponent(state.id),{method:'DELETE'});
   else await api(route+'?source='+encodeURIComponent(state.key),{method:'POST',headers:{'x-guardian-watch-consent':'new-inbox-previews-v1'}});
   await load();notice(active?'Monitoring stopped. Alerts for this mailbox have been cleared.':'Monitoring enabled for new inbox previews.');
  }catch(error){notice(error.message);button.disabled=false;}};box.append(button);
 }
 card.append(box);
}

function renderAccountLists(connections) {
  grid.replaceChildren();
  optionsGrid.replaceChildren();
  const mailboxes = connections.filter(account => ['gmail', 'outlook', 'mailbox'].includes(account.provider));
  const linked = mailboxes.filter(account => account.cleanupPending || ['connected', 'reconnect_required', 'connecting'].includes(account.status));
  const addMailbox = document.querySelector('#add-account-action');
  addMailbox.textContent = linked.length ? 'Connect another mailbox +' : 'Connect a mailbox +';
  addMailbox.className = linked.length ? 'text-link' : 'source-action';
  addMailbox.hidden = mailboxes.length > 0 && linked.length === mailboxes.length;
  document.querySelector('#saved-information').hidden = !linked.length;
  for (const account of linked) renderAccount(account);
  if (!linked.length) {
    const empty = element('div', 'connection-empty');
    empty.append(element('h3', '', 'No mailboxes connected yet'), element('p', '', 'Connect a mailbox when you want to find an earlier email.'));
    grid.append(empty);
  }

  for (const account of mailboxes.filter(account => !linked.includes(account))) renderAccount(account, optionsGrid);
  if (!mailboxes.some(account => account.provider === 'mailbox')) {
    const other = element('article', 'connection-card connection-provider-pending');
    other.append(element('h3', '', 'Other email provider'), element('p', '', 'You can bring an email from another provider by uploading a saved copy.'));
    optionsGrid.append(other);
  }
  if (mailboxes.length && linked.length === mailboxes.length) {
    const manage = element('a', 'source-action', 'Manage your connected mailboxes ↓');
    manage.href = '#accounts';
    optionsGrid.append(manage);
  }
  grid.setAttribute('aria-busy', 'false');
}

function showLoadError(error) {
  const container = element('div', 'connection-loading');
  container.append(element('p', '', error.message || 'Your accounts could not be loaded.'));
  const signedOut = error.status === 401;
  const retry = element(signedOut ? 'a' : 'button', 'button secondary', signedOut ? 'Sign in again' : 'Try again');
  if (signedOut) {
    const current = new URL(location.href);
    retry.href = '/login?return_to=' + encodeURIComponent(current.pathname + current.search + current.hash);
  } else {
    retry.type = 'button';
    retry.onclick = load;
  }
  container.append(retry);
  grid.replaceChildren(container);
  optionsGrid.replaceChildren(element('p', 'connection-state-notice', 'Mailbox options could not be loaded. See the message under Your connected mailboxes.'));
  grid.setAttribute('aria-busy', 'false');
  channels.setAttribute('aria-busy', 'false');
  channels.replaceChildren(element('p', 'connection-state-notice', 'Messaging availability could not be checked. See the message under Your connected mailboxes.'));
}

async function load() {
  try {
    const data = await api('/api/connections');
    let identities = [], identityReady = false;
    try {
      const links = await api('/api/contact-link');
      identities = links.identities || [];
      identityReady = true;
    } catch { /* Keep other connections usable when this separate lookup fails. */ }
    const contacts = [...(data.contacts || [])];
    for (const identity of identities) {
      if (!contacts.some(contact => contact.channel === identity.channel)) contacts.push({channel:identity.channel});
    }
    const identityNotice = document.querySelector('#identity-notice');
    identityNotice.hidden = identityReady;
    identityNotice.textContent = identityReady ? '' : 'Messaging account status could not be checked. Refresh before changing a messaging link.';
    let watch;try{watch=await api('/api/watch');}catch{}
    renderAccountLists((data.connections||[]).map(item=>({...item,watch:watch?.sources?.find(source=>source.provider===item.provider),watchUnknown:!watch})));
    renderContacts(contacts, identities, identityReady);
  } catch (error) {
    showLoadError(error);
  }
}
document.querySelector('#add-account-action').onclick = showEmailOptions;
document.querySelector('#close-email-options').onclick = () => {
  setup.hidden = true;
  const trigger = document.querySelector('#add-account-action');
  trigger.setAttribute('aria-expanded', 'false');
  (trigger.hidden ? document.querySelector('#accounts-title') : trigger).focus();
};
const query=new URLSearchParams(location.search);const result=query.get('connection'),provider=query.get('provider');const labels={gmail:'Gmail',outlook:'Outlook',peopleprint:'Peopleprint'},label=labels[provider]||'Your account';const outcomes={connected:label+' is linked. You can disconnect it here at any time.',cancelled:'Nothing was connected. You can try again whenever you are ready.',expired:'That connection request expired. Please start again from the account below.',failed:'The account could not be connected. No new connection was saved. Please try again.',unavailable:'That connection is not available yet. You can share a message or an export instead.'};if(outcomes[result]){notice(outcomes[result]);history.replaceState(null,'','/connections');}const xCode=query.get('x_code');
const xOutcomes={linked:'Your X account is linked to Wolfgang.',already_linked:'That X account is linked to a different Guardian account. Unlink it there before connecting it here.',sent:'Your linking code was sent to Wolfgang. Checking the connection…',sent_pending:'X accepted the code, but Guardian could not finish confirming the link. Check connection below. Do not repeat authorisation.',denied:'X authorisation was cancelled. No linking message was sent.',expired:'That linking request expired. Get a new code and try again.',wrong_account:'Choose your personal X account. Wolfgang’s own account cannot be linked as a customer.',failed:'The linking message could not be sent. Get a new code and try again.',uncertain:'X did not confirm the delivery. Check the conversation before starting a new linking request.'};
if(xOutcomes[xCode]){notice(xOutcomes[xCode]);history.replaceState(null,'','/connections#channel-x');}
async function confirmXLink(){
 try{for(let attempt=0;attempt<5;attempt++){const fresh=await api('/api/contact-link');if(fresh.identities.some(i=>i.channel==='x')){notice('Your X account is linked to Wolfgang.');await load();return;}if(attempt<4)await new Promise(resolve=>setTimeout(resolve,1000));}notice('The code was sent. Refresh this page in a moment to confirm the connection.');}catch(error){notice(error.message);}
}
load().then(()=>{if(query.get('task')==='email')showAccounts();if(location.hash==='#add-connection')showEmailOptions();if(query.get('take')==='1')document.querySelector('#contact').scrollIntoView({behavior:'smooth'});if(xOutcomes[xCode])document.querySelector('#channel-x')?.scrollIntoView?.({block:'center'});if(xCode==='sent'||xCode==='linked')void confirmXLink();});

// Provider detection never asks for a password. A credential is requested only
// after the backend identifies an available, reviewed connection profile.
export function createMailboxConnectForm({api,element,notice,reload}){
 const container=element('div','connection-search mailbox-connect-form');
 const form=element('form','mailbox-discovery-form'),label=element('label','','Email address'),email=element('input'),next=element('button','button secondary','Continue'),status=element('p'),steps=element('div','mailbox-setup-steps');
 email.id='mailbox-email';email.type='email';email.required=true;email.maxLength=320;email.autocomplete='email';label.htmlFor=email.id;next.type='submit';status.setAttribute('role','status');
 form.append(label,email,next);container.append(element('p','','Enter your email address. We will look for your provider’s connection settings.'),form,status,steps);
 let revision=0;
 function reset(){revision++;for(const input of steps.querySelectorAll('input[type="password"]'))input.value='';steps.replaceChildren();status.textContent='';next.disabled=false;}
 email.addEventListener('input',reset);
 function passwordStep(profile,address,expectedRevision,replacesExisting){
  if(expectedRevision!==revision)return;
  steps.replaceChildren();
  const login=element('form','mailbox-password-form'),passwordLabel=element('label','','Password or app password'),password=element('input'),consentLabel=element('label','mailbox-consent'),consent=element('input'),connect=element('button','button secondary','Connect email'),advanced=element('details'),usernameLabel=element('label','','Account username, if different'),username=element('input');
  steps.append(element('p','','Connect '+address+' with '+profile.label+'.'));
  if(replacesExisting)steps.append(element('p','','Connecting this account will replace your existing connection for this email service.'));
  password.id='mailbox-password';password.type='password';password.required=true;password.maxLength=1024;password.autocomplete='off';passwordLabel.htmlFor=password.id;
  consent.type='checkbox';consent.required=true;consentLabel.append(consent,document.createTextNode('I allow read-only access to this email account to find messages I choose.'));
  username.id='mailbox-username';username.value=address;username.maxLength=320;username.autocomplete='username';usernameLabel.htmlFor=username.id;advanced.append(element('summary','','Account sign-in details'),usernameLabel,username);
  connect.type='submit';login.append(element('p','','Your provider may require a separate app password. Your server settings are handled for you.'),passwordLabel,password,advanced,consentLabel,connect);steps.append(login);
  login.onsubmit=async event=>{
   event.preventDefault();if(expectedRevision!==revision||connect.disabled)return;
   connect.disabled=true;email.disabled=true;next.disabled=true;status.textContent='Checking your email connection…';
   const credential=password.value;password.value='';
   try{
    await api('/api/connections/mailbox/connect',{method:'POST',body:{providerId:profile.id,username:username.value.trim()||address,password:credential,consent:consent.checked}});
    notice('Email connected. Choose which messages to bring into a check.');await reload();
   }catch(error){if(expectedRevision===revision)status.textContent=error.message||'The email account could not be connected.';}
   finally{password.value='';connect.disabled=false;email.disabled=false;next.disabled=false;}
  };
 }
 form.onsubmit=async event=>{
  event.preventDefault();reset();const expectedRevision=revision,address=email.value.trim();next.disabled=true;status.textContent='Finding your email provider…';
  try{
   const result=await api('/api/connections/mailbox/discover',{method:'POST',body:{email:address}});
   if(expectedRevision!==revision)return;
   status.textContent='';
   if(result.kind==='oauth'){
    const paths={gmail:'/api/connections/gmail/start',outlook:'/api/connections/outlook/start'};
    if(paths[result.provider]!==result.startPath)throw Error('The email sign-in destination could not be verified.');
    steps.append(element('p','','This account uses '+result.label+'. Sign in with your provider to approve access.'));
    if(result.replacesExisting)steps.append(element('p','','This will replace the '+result.label+' email account currently linked to Guardian.'));
    const link=element('a','button secondary','Continue with '+result.label+' ↗');link.href=result.startPath;link.target='_top';steps.append(link);
   }else if(result.kind==='mailbox'){
    passwordStep({id:result.providerId,label:result.label},result.username||address,expectedRevision,result.replacesExisting);
   }else if(result.kind==='choose'&&result.providers?.length){
    steps.append(element('p','',result.message));const chooseLabel=element('label','','Email provider'),choose=element('select'),blank=element('option','','Choose your provider');choose.id='mailbox-provider';chooseLabel.htmlFor=choose.id;blank.value='';choose.append(blank);
    for(const profile of result.providers){const option=element('option','',profile.label);option.value=profile.id;choose.append(option);}
    choose.onchange=()=>{const profile=result.providers.find(p=>p.id===choose.value);if(profile)passwordStep(profile,address,expectedRevision,result.replacesExisting);};steps.append(chooseLabel,choose);
   }else status.textContent=result.message||'This email provider is not ready to connect yet.';
  }catch(error){if(expectedRevision===revision)status.textContent=error.message||'The email provider could not be identified.';}
  finally{if(expectedRevision===revision)next.disabled=false;}
 };
 return container;
}

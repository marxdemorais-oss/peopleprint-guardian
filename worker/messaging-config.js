// Only operational, provider-backed routes may appear in the customer's contact.
// Encrypted XChat is a distinct transport; this adapter supports legacy DMs.
const phone=value=>/^\+[1-9]\d{7,14}$/.test(value||'');
const id=value=>/^\d{3,40}$/.test(value||'');
const version=value=>/^v\d{1,3}\.0$/.test(value||'');
export const MESSAGE_CHANNELS=['email','whatsapp','sms','messenger','instagram','x'];
export const contactOnboardingPaused=channel=>channel==='sms'||channel==='instagram';
export function nativeMessagingReady(env={},channel){
 if(!env.DB||!env.CONTACT_GATEWAY_SECRET||env.CONTACT_GATEWAY_SECRET.length<32)return false;
 if(channel==='x')return Boolean(env.X_CONNECT_ENABLED==='true'&&env.X_CLIENT_ID&&env.X_CLIENT_SECRET&&/^[A-Za-z0-9_]{1,15}$/.test(env.WOLFGANG_X_HANDLE||'')&&validPublicOrigin(env.MESSAGING_PUBLIC_ORIGIN));
 if(channel==='email')return Boolean(env.RESEND_API_KEY&&env.RESEND_WEBHOOK_SECRET&&env.WOLFGANG_EMAIL&&env.WOLFGANG_EMAIL_FROM&&env.WOLFGANG_EMAIL_RECEIVING_ADDRESS);
 if(channel==='sms')return Boolean(/^AC[a-f0-9]{32}$/i.test(env.TWILIO_ACCOUNT_SID||'')&&env.TWILIO_AUTH_TOKEN&&phone(env.WOLFGANG_SMS_NUMBER)&&validPublicOrigin(env.MESSAGING_PUBLIC_ORIGIN));
 const base=Boolean(env.META_APP_SECRET&&env.META_VERIFY_TOKEN&&version(env.META_GRAPH_VERSION));
 if(channel==='whatsapp')return Boolean(base&&env.WHATSAPP_ACCESS_TOKEN&&id(env.WHATSAPP_PHONE_NUMBER_ID)&&id(env.WHATSAPP_BUSINESS_ACCOUNT_ID)&&phone(env.WOLFGANG_WHATSAPP_NUMBER)&&/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(env.MESSAGING_SUPPORT_EMAIL||''));
 if(channel==='messenger')return Boolean(base&&env.MESSENGER_PAGE_ACCESS_TOKEN&&id(env.MESSENGER_PAGE_ID));
 if(channel==='instagram')return Boolean(base&&env.INSTAGRAM_ACCESS_TOKEN&&id(env.INSTAGRAM_ACCOUNT_ID));
 return false;
}
export function validPublicOrigin(value){try{const u=new URL(value);return u.protocol==='https:'&&u.href===u.origin+'/'&&!u.username&&!u.password?u.origin:null;}catch{return null;}}
export function messageChannelEnabled(env,channel){return MESSAGE_CHANNELS.includes(channel)&&String(env.CONTACT_CHANNELS||'').split(',').map(s=>s.trim()).includes(channel)&&env['WOLFGANG_'+channel.toUpperCase()+'_ENABLED']==='true'&&(channel!=='x'||env.X_RECEIVING_ENABLED==='true'&&env.X_AUTOMATED_REPLIES_APPROVED==='true')&&nativeMessagingReady(env,channel);}

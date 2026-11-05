// Constructed only after a signed provider envelope has verified the sender.
const identities=new WeakSet();
export const guestOwner=value=>typeof value==='string'&&/^guest:[a-f0-9]{64}$/.test(value);
export const guestEnabled=env=>env.GUARDIAN_GUEST_CHECKS_ENABLED==='true'&&typeof env.GUARDIAN_GUEST_IDENTITY_KEY==='string'&&env.GUARDIAN_GUEST_IDENTITY_KEY.length>=32;
export async function guestIdentity(env,channel,sender){
 if(!guestEnabled(env)||channel!=='x'||typeof sender!=='string'||!sender||sender.length>254)return null;
 const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(env.GUARDIAN_GUEST_IDENTITY_KEY),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const bytes=new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(channel+'\0'+sender)));
 const identity={ownerId:'guest:'+Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('')};identities.add(identity);return identity;
}
export const isGuestIdentity=identity=>identities.has(identity);
export async function guestSenderMayReceive(env,event,ownerId){
 const identity=await guestIdentity(env,event.channel,event.senderId);if(identity?.ownerId!==ownerId)return false;
 if(await env.DB.prepare('SELECT 1 AS linked FROM guardian_channel_identities WHERE channel=? AND sender_id=?').bind(event.channel,event.senderId).first())return false;
 if(event.channel==='x'&&await env.DB.prepare('SELECT 1 AS stopped FROM guardian_x_sender_optouts WHERE sender_id=?').bind(event.senderId).first())return false;
 if(event.channel==='email'&&await env.DB.prepare('SELECT 1 AS stopped FROM guardian_email_sender_optouts WHERE sender_id=?').bind(event.senderId).first())return false;
 return true;
}
export const guestInvitation='Create a free Guardian account so Wolfgang remembers your checks and relevant records, and continue across linked channels.';

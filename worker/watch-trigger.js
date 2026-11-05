// Optional external scheduler: fixed operation, empty body, separate short-lived
// signature and one durable claim per minute. No operator or customer credentials.
export const watchTriggerPath='/api/internal/watch/tick';
const encoder=new TextEncoder(),minuteMs=60_000;
export function validWatchKey(key){return typeof key==='string'&&/^[a-fA-F0-9]{64}$/.test(key);}
async function importKey(secret){
 const raw=Uint8Array.from(secret.match(/../g),x=>parseInt(x,16));
 return crypto.subtle.importKey('raw',raw,{name:'HMAC',hash:'SHA-256'},false,['sign','verify']);
}
const payload=(url,minute)=>encoder.encode(['guardian-watch-tick:v1','POST',url,String(minute)].join('\n'));
export async function signWatchTick(secret,url,minute){
 if(!validWatchKey(secret))throw Error('Watch trigger key is missing or invalid.');
 const signature=await crypto.subtle.sign('HMAC',await importKey(secret),payload(url,minute));
 return Array.from(new Uint8Array(signature),n=>n.toString(16).padStart(2,'0')).join('');
}
const reply=status=>new Response(null,{status,headers:{'Cache-Control':'no-store'}});
export async function handleWatchTick(request,env,drain,{now=Date.now()}={}){
 const url=new URL(request.url);if(url.pathname!==watchTriggerPath)return null;
 if(env.GUARDIAN_WATCH_TRIGGER_ENABLED!=='true'||env.GUARDIAN_WATCH_ENABLED!=='true')return reply(404);
 if(request.method!=='POST')return reply(405);
 if(!env.DB||!validWatchKey(env.GUARDIAN_WATCH_TRIGGER_KEY))return reply(503);
 if(url.protocol!=='https:'||url.origin!==env.GUARDIAN_WATCH_ORIGIN||url.search||url.hash||url.username||url.password||request.body!==null||request.headers.has('origin')||request.headers.has('cookie'))return reply(400);
 const stamp=request.headers.get('x-guardian-watch-minute')||'',sig=request.headers.get('x-guardian-watch-signature')||'';
 if(!/^\d{1,12}$/.test(stamp)||String(Number(stamp))!==stamp||!(/^[a-f0-9]{64}$/).test(sig))return reply(403);
 const minute=Number(stamp),current=Math.floor(now/minuteMs);
 if(minute>current||minute<current-1)return reply(403);
 const signature=Uint8Array.from(sig.match(/../g),h=>parseInt(h,16));
 if(!await crypto.subtle.verify('HMAC',await importKey(env.GUARDIAN_WATCH_TRIGGER_KEY),signature,payload(url.href,minute)))return reply(403);
 // Monotonic claim blocks duplicate invocations including retries at a minute boundary.
 try{
  const claim=await env.DB.prepare('INSERT INTO guardian_watch_trigger_ticks(slot,last_minute) VALUES(1,?) ON CONFLICT(slot) DO UPDATE SET last_minute=excluded.last_minute WHERE guardian_watch_trigger_ticks.last_minute<excluded.last_minute').bind(minute).run();
  if(claim.meta?.changes)await drain(env);
  return reply(204);
 }catch{return reply(503);}
}

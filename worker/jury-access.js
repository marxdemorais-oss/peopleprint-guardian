const cookieName='__Host-guardian_jury';
const encoder=new TextEncoder();
const hex=bytes=>Array.from(new Uint8Array(bytes),n=>n.toString(16).padStart(2,'0')).join('');
const digest=async value=>hex(await crypto.subtle.digest('SHA-256',encoder.encode(value)));
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function juryReturn(value){try{if(!value?.startsWith('/')||value.startsWith('//'))return '/workspace';const u=new URL(value,'https://guardian.test');return u.origin==='https://guardian.test'&&!u.pathname.startsWith('/jury')&&!u.pathname.startsWith('/api/')?u.pathname+u.search:'/workspace';}catch{return '/workspace';}}
async function signature(secret,value){const key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);return hex(await crypto.subtle.sign('HMAC',key,encoder.encode('guardian-jury.v1:'+value)));}
export async function juryCookieValid(request,env,now=Date.now()){
 const value=request.headers.get('cookie')?.split(';').map(s=>s.trim()).find(s=>s.startsWith(cookieName+'='))?.slice(cookieName.length+1);
 if(!/^\d{13}\.[a-f0-9]{64}$/.test(value||''))return false;
 const [expires,mac]=value.split('.');if(Number(expires)<=now||Number(expires)>now+7*86400000)return false;
 return await digest(mac)===await digest(await signature(env.GUARDIAN_JURY_CODE,expires));
}
function page(target,message='',status=200){return new Response(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Jury access | Guardian</title><link rel="stylesheet" href="/assets/journey.css"><style>body{background:#f6f9f7;color:#173f4e;font:18px system-ui;margin:0}.entry{max-width:520px;margin:10vh auto;padding:34px;background:white;border:1px solid #d9e6df;border-radius:24px}h1{font-size:36px}p{line-height:1.6}label,input,button{display:block}input{box-sizing:border-box;width:100%;font:inherit;padding:15px;margin:12px 0 24px;border:1px solid #b5ccc1;border-radius:10px}button{font:inherit;background:#266a5d;color:white;border:0;border-radius:30px;padding:14px 25px}@media(max-width:600px){.entry{margin:7vh 16px;padding:24px}}</style></head><body><main class="entry"><p>Peopleprint Guardian · Jury access</p><h1>Come in. Wolfgang is waiting.</h1><p>Enter your jury access code. Then sign in to your own private account for unlimited checks.</p><form method="post" action="/api/jury/access"><input type="hidden" name="return_to" value="${escape(target)}"><label for="code">Access code</label><input id="code" name="code" type="password" autocomplete="current-password" maxlength="128" required autofocus><button type="submit">Enter Guardian</button><p role="alert">${escape(message)}</p></form><p>Your account and records stay separate from other judges.</p><a href="/privacy">Privacy</a></main></body></html>`,{status,headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self'; style-src 'self' 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'"}});}
export async function handleJuryAccess(request,env,now=Date.now()){
 const url=new URL(request.url),path=url.pathname;
 if(env.GUARDIAN_JURY_MODE!=='true'||!env.GUARDIAN_JURY_CODE)return null;
 if(path==='/jury'&&['GET','HEAD'].includes(request.method))return page(juryReturn(url.searchParams.get('return_to')));
 if(path==='/api/jury/access'&&request.method==='POST'){
  if(request.headers.get('origin')!==url.origin)return page('/workspace','Please open this form on Guardian.',403);
  const reader=request.body?.getReader();let raw='',length=0;
  if(!reader)return page('/workspace','Enter the access code.',400);
  while(true){const {value,done}=await reader.read();if(done)break;length+=value.length;if(length>2048){await reader.cancel();return page('/workspace','The code is too long.',413);}raw+=new TextDecoder().decode(value);}
  const body=new URLSearchParams(raw),target=juryReturn(body.get('return_to'));
  if(!env.DB)return page(target,'Access verification is temporarily unavailable.',503);
  const bucket=Math.floor(now/900000),ip=request.headers.get('cf-connecting-ip')||'unknown';
  const key='jury:'+await digest(env.GUARDIAN_JURY_CODE+':'+ip)+':'+bucket;
  const row=await env.DB.prepare("INSERT INTO guardian_rate_limits(bucket_key,owner_id,count,expires_at) VALUES (?,'jury-entry',1,?) ON CONFLICT(bucket_key) DO UPDATE SET count=count+1 RETURNING count").bind(key,(bucket+2)*900000).first();
  if(Number(row?.count)>20)return page(target,'Too many attempts. Please try again in 15 minutes.',429);
  if(await digest(body.get('code')||'')!==await digest(env.GUARDIAN_JURY_CODE))return page(target,'That access code did not match. Please try again.',403);
  const expires=String(now+7*86400000),value=expires+'.'+await signature(env.GUARDIAN_JURY_CODE,expires);
  return new Response(null,{status:303,headers:{Location:target,'Cache-Control':'no-store','Set-Cookie':cookieName+'='+value+'; Path=/; Secure; HttpOnly; SameSite=Lax; Max-Age=604800'}});
 }
 if(['/privacy','/data-deletion','/api/auth/logout','/api/contact-events'].includes(path)||path.startsWith('/api/internal/'))return null;
 if(await juryCookieValid(request,env,now))return null;
 const target='/jury?return_to='+encodeURIComponent(juryReturn(url.pathname+url.search));
 if(path.startsWith('/api/'))return Response.json({code:'JURY_ACCESS_REQUIRED',message:'Enter the jury access code to continue.',link:target},{status:403,headers:{'Cache-Control':'no-store'}});
 return new Response(null,{status:303,headers:{Location:target,'Cache-Control':'no-store'}});
}

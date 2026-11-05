import {checkLinkReputation} from './url-reputation.js';

// Temporary operational probe only. It never accepts a customer URL, reads an
// account, sends email, or exposes a provider credential. Removing the expiring
// secret disables the endpoint, including for callers who knew its old token.
const headers={
 'Content-Type':'application/json; charset=utf-8',
 'Cache-Control':'no-store',
 'X-Content-Type-Options':'nosniff',
 'Referrer-Policy':'no-referrer'
};
const json=(body,status=200,extra={})=>new Response(JSON.stringify(body),{status,headers:{...headers,...extra}});
const missing=()=>json({error:'Not found'},404);
const tokenPattern=/^[A-Za-z0-9_-]{43,256}$/;
const encoder=new TextEncoder();

function probeConfiguration(value,now){
 if(typeof value!=='string'||value.length>2048)return null;
 try{
  const config=JSON.parse(value);
  if(!config||Array.isArray(config)||typeof config!=='object'||typeof config.token!=='string'||!tokenPattern.test(config.token))return null;
  if(typeof config.expiresAt!=='string')return null;
  const expires=Date.parse(config.expiresAt);
  if(!Number.isFinite(expires)||new Date(expires).toISOString()!==config.expiresAt||expires<=now||expires>now+30*60000)return null;
  return config;
 }catch{return null;}
}

async function equalToken(actual,expected){
 const [left,right]=await Promise.all([actual,expected].map(value=>crypto.subtle.digest('SHA-256',encoder.encode(value))));
 const a=new Uint8Array(left),b=new Uint8Array(right);
 let difference=0;
 for(let i=0;i<32;i++)difference|=a[i]^b[i];
 return difference===0;
}

async function confirmedEmptyBody(request){
 if(request.body===null)return true;
 if(request.bodyUsed)return false;
 let reader,timer;
 try{
  reader=request.body.getReader();
  // Cloudflare may expose a stream even for a POST with no payload. Confirm
  // immediate EOF rather than relying on body !== null or Content-Length.
  const first=await Promise.race([
   reader.read(),
   new Promise(resolve=>{timer=setTimeout(()=>resolve(null),1000);})
  ]);
  return first?.done===true;
 }catch{return false;}
 finally{
  clearTimeout(timer);
  if(reader){void reader.cancel().catch(()=>{});reader.releaseLock();}
 }
}

export async function handleReputationReadiness(request,env,{fetcher=fetch,now=Date.now(),clock=()=>performance.now()}={}){
 if(new URL(request.url).pathname!=='/api/internal/reputation-readiness')return null;
 const config=probeConfiguration(env?.GUARDIAN_REPUTATION_PROBE,now);
 if(!config)return missing();
 const match=/^Bearer ([A-Za-z0-9_-]{43,256})$/.exec(request.headers.get('Authorization')||'');
 if(!match||!await equalToken(match[1],config.token))return missing();
 if(request.method!=='POST')return json({error:'Method not allowed'},405,{Allow:'POST'});
 // Accept only an absent body or confirmed EOF. Do not decode, retain or
 // forward any submitted content, query, cookie or customer identifier.
 if(new URL(request.url).search||!await confirmedEmptyBody(request))return json({error:'This probe accepts no input'},400);
 const mode=env.GUARDIAN_LINK_REPUTATION;
 if(!['google-web-risk','virustotal-community'].includes(mode))return json({provider:'Google Web Risk',status:'not_configured'},503);
 const start=clock();
 const result=await checkLinkReputation('https://example.com/',env,{fetcher,signal:request.signal,now});
 const providers=['Google Web Risk','VirusTotal'],combined='Google Web Risk + VirusTotal';
 const statuses=['flagged','no_flags','unavailable','unknown','stale','skipped'];
 const recognised=[...providers,combined].includes(result?.provider);
 const provider=recognised?result.provider:(mode==='virustotal-community'?combined:'Google Web Risk');
 const status=recognised&&statuses.includes(result.status)?result.status:'not_configured';
 const checkedAt=value=>typeof value==='string'&&Number.isFinite(Date.parse(value))&&new Date(value).toISOString()===value?value:new Date(now).toISOString();
 // The fixed-URL diagnostic reports each provider's readiness independently.
 // Notes, URLs, report metadata and credentials never leave the adapter here.
 const checks=result?.provider===combined&&Array.isArray(result.checks)
  ?result.checks.filter(check=>providers.includes(check?.provider)).slice(0,2).map(check=>({provider:check.provider,status:statuses.includes(check.status)?check.status:'not_configured',checkedAt:checkedAt(check.checkedAt)}))
  :null;
 const ok=status==='no_flags'||status==='flagged';
 return json({provider,status,checkedAt:checkedAt(result?.checkedAt),elapsedMs:Math.max(0,Math.round(clock()-start)),...(checks?{checks}:{})},ok?200:503);
}

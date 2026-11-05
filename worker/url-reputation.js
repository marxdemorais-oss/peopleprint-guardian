import {requestProviderBytes} from './provider-http.js';
import {reserveVirusTotalCommunityUsage} from './virustotal-community-usage.js';

// Read existing URL reports only. Community and commercially licensed modes
// have separate explicit selections and secrets; Community also has durable quotas.
// Canonical subset: URLs that do not need VT's own canonicalization. No base64
// URL identifiers, submissions, rescans, customer URL fetches or redirects.
const provider='VirusTotal';
const publicSuffix=/(?:\.com|\.net|\.org|\.uk|\.io|\.app|\.dev|\.info|\.biz|\.online|\.site|\.xyz|\.de|\.fr|\.au|\.ca|\.us|\.ie|\.eu)$/;
const publicPath=/^\/(?:|(?:login|log-in|signin|sign-in|verify|verification|security|support|billing|payment|account|refund|claim|index)(?:\.html?)?\/?)$/;
const ageLimit=7*86400*1000;
const action='Do not open the link. Use the organisation’s app or an address you already know.';
const skipped='No eligible public link was checked. Private links and links with unusual paths are skipped.';
function selectAddress(text){
 let linkSeen=false;
 // Treat parentheses, quotes, or JSON delimiters *inside* an address
 // conservatively; never turn a private path into a different eligible URL.
 const sample=String(text||'');
 for(const token of sample.split(/\s+/u)){
   let raw=token;
   const md=/^\[[^\]]{0,300}\]\((https?:\/\/[^()]+)\)[.!]?$/.exec(raw);
   if(md)raw=md[1];
   else if(/^\(https?:\/\/[^()]+\)[.!]?$/i.test(raw))raw=raw.slice(1,raw.lastIndexOf(')'));
   else if(/^<https?:\/\/[^<>]+>[.!]?$/i.test(raw))raw=raw.slice(1,raw.lastIndexOf('>'));
   if(!/^https?:\/\//i.test(raw))continue;
   linkSeen=true;
   raw=raw.replace(/[.,;!]+$/,'');
   // Do not strip a sensitive path/query and then pretend the full URL was checked.
   if(raw.length>256||/[#?@%\\]/.test(raw)||!/^https?:\/\/[a-z0-9.-]+(?:\/[a-z0-9./-]*)?$/i.test(raw))continue;
   try{
     const url=new URL(raw),host=url.hostname.toLowerCase();
     const labels=host.split('.');
     if(!publicSuffix.test(host)||!publicPath.test(url.pathname)||url.pathname.includes('..')||/\/\.{1,2}(?:\/|$)/.test(raw)||/\/\//.test(url.pathname))continue;
     // Unique tenant hosts, IP addresses, local domains and identifier-like labels
     // are out of scope. A digest is pseudonymous: VT may recognise a known URL.
     if(labels.length>4||labels.some(s=>!s||s.length>32||!/^([a-z0-9]+(?:-[a-z0-9]+)*)$/.test(s)||/\d{4}/.test(s)||s.startsWith('xn--')))continue;
     const domainLabels=labels[0]==='www'?labels.slice(1):labels;
     if(domainLabels.length>2&&!(domainLabels.length===3&&/^(?:co|com|org|gov|net|ac)\.(?:uk|au)$/.test(domainLabels.slice(-2).join('.'))))continue;
     return {address:url.href,linkSeen};
   }catch{}
 }
 return {address:null,linkSeen};
}
const hex=buffer=>Array.from(new Uint8Array(buffer),n=>n.toString(16).padStart(2,'0')).join('');
async function communityAdmission(env,{now,signal}){
 // A stalled quota store must not hold the Google result open indefinitely.
 // A timed-out reservation may finish later, but can never dispatch a lookup.
 if(signal?.aborted)return {allowed:false};
 return new Promise(resolve=>{
  let finished=false;
  const finish=value=>{if(finished)return;finished=true;clearTimeout(timer);signal?.removeEventListener('abort',cancel);resolve(value);};
  const cancel=()=>finish({allowed:false});
  const timer=setTimeout(cancel,5000);
  signal?.addEventListener('abort',cancel,{once:true});
  if(signal?.aborted){cancel();return;}
  Promise.resolve().then(()=>finished?{allowed:false}:reserveVirusTotalCommunityUsage(env,{now})).then(finish,()=>finish({allowed:false}));
 });
}
async function checkVirusTotal(text,env,{fetcher=fetch,signal,now=Date.now(),clock=()=>performance.now()}={}){
 const community=env?.GUARDIAN_LINK_REPUTATION==='virustotal-community';
 const key=community?env?.GUARDIAN_VIRUSTOTAL_COMMUNITY_KEY:env?.GUARDIAN_VIRUSTOTAL_COMMERCIAL_KEY;
 if((!community&&env?.GUARDIAN_LINK_REPUTATION!=='virustotal-commercial')||typeof key!=='string'||!key||key.length>512||/\s/.test(key)||(community&&!/^[a-f0-9]{64}$/i.test(key)))return null;
 const {address,linkSeen}=selectAddress(text);
 if(!address)return linkSeen?{status:'skipped',provider,note:skipped}:null;
 const base={provider,checkedAt:new Date(now).toISOString()};
 try{
   if(community&&signal?.aborted)throw new Error('Cancelled');
   const started=community?clock():0;
   const id=hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(address)));
   if(community){
     const admission=await communityAdmission(env,{now,signal});
     const elapsed=clock()-started;
     if(!admission.allowed||!Number.isFinite(elapsed)||elapsed<0||elapsed>5000)return {...base,status:'unavailable',note:'VirusTotal Community did not have a lookup available for this check. The link remains unverified.'};
   }
   const bytes=await requestProviderBytes('https://www.virustotal.com/api/v3/urls/'+id,{method:'GET',headers:{Accept:'application/json','x-apikey':key}},{fetcher,signal,timeoutMs:1800,maxBytes:512*1024,contentType:'application/json'});
   const report=JSON.parse(new TextDecoder().decode(bytes)).data,attrs=report?.attributes;
   // The provider's full response can contain arbitrary URLs, metadata, or HTML.
   // Only authenticated report identity, timestamp and numeric counts are used.
   if(report?.type!=='url'||report.id!==id||attrs?.url!==address)throw new Error('Unexpected report');
   const timestamp=attrs.last_analysis_date*1000,stats=attrs.last_analysis_stats;
   if(!Number.isSafeInteger(attrs.last_analysis_date)||timestamp>now||!stats||!['harmless','malicious','suspicious','undetected'].every(k=>Number.isSafeInteger(stats[k])&&stats[k]>=0&&stats[k]<10000))throw new Error('Incomplete report');
   if(now-timestamp>ageLimit)return {...base,status:'stale',note:'The existing VirusTotal report was more than a week old. It was not used to judge this link.'};
   const reportedAt=new Date(timestamp).toISOString(),date=reportedAt.slice(0,10),destination=new URL(address).hostname.replaceAll('.','[.]');
   const location='one submitted link at '+destination;
   if(stats.malicious||stats.suspicious)return {...base,reportedAt,status:'flagged',note:'The VirusTotal report dated '+date+' for '+location+' shows '+stats.malicious+' malicious and '+stats.suspicious+' suspicious engine verdicts. These are warnings, not proof of who sent the message.',action};
   if(!(stats.harmless||stats.undetected))throw new Error('No engine results');
   return {...base,reportedAt,status:'no_flags',note:'The VirusTotal report dated '+date+' for '+location+' contains no malicious or suspicious verdict. That does not establish that the link or sender is safe.'};
 }catch(error){
   if(error?.providerStatus===404)return {...base,status:'unknown',note:'VirusTotal returned no existing report for the link fingerprint. It was not submitted for scanning; its reputation is unknown.'};
   return {...base,status:'unavailable',note:'Link reputation could not be checked. Treat the link as unverified.'};
 }
}

const googleProvider='Google Web Risk';
export const GOOGLE_WEB_RISK_ADVISORY='Google may miss dangerous sites or flag safe sites in error. A result does not authenticate the sender.';
async function checkGoogleWebRisk(text,env,{fetcher=fetch,signal,now=Date.now()}={}){
 const key=env.GUARDIAN_GOOGLE_WEB_RISK_API_KEY;
 if(typeof key!=='string'||!key||key.length>512||/\s/.test(key))return null;
 const {address,linkSeen}=selectAddress(text);
 if(!address)return linkSeen?{status:'skipped',provider:googleProvider,note:skipped}:null;
 const base={provider:googleProvider,checkedAt:new Date(now).toISOString(),advisory:GOOGLE_WEB_RISK_ADVISORY};
 try{
  // Lookup only. The exact eligible public address goes to Google. No message,
  // account identifier, private URL, submission, Evaluate API or target fetch.
  const url=new URL('https://webrisk.googleapis.com/v1/uris:search');
  url.searchParams.set('uri',address);
  const types=['MALWARE','SOCIAL_ENGINEERING','UNWANTED_SOFTWARE'];
  for(const type of types)url.searchParams.append('threatTypes',type);
  const bytes=await requestProviderBytes(url.href,{method:'GET',headers:{Accept:'application/json','x-goog-api-key':key}},{fetcher,signal,timeoutMs:1800,maxBytes:32768,contentType:'application/json'});
  const data=JSON.parse(new TextDecoder().decode(bytes));
  if(!data||Array.isArray(data)||typeof data!=='object')throw new Error('Invalid lookup');
  const destination=new URL(address).hostname.replaceAll('.','[.]');
  const scope='One eligible link ('+new URL(address).protocol.replace(':','')+' on '+destination+new URL(address).pathname+') was checked against Google Web Risk lists. ';
  if(!Object.keys(data).length)return {...base,status:'no_flags',expiresAt:new Date(now+1800000).toISOString(),note:scope+'No match was returned at that time. This does not mean the link is safe.'};
  const threat=data.threat,expiry=Date.parse(threat?.expireTime);
  if(!threat||!Array.isArray(threat.threatTypes)||!threat.threatTypes.length||threat.threatTypes.some(t=>!types.includes(t))||!Number.isFinite(expiry)||expiry<=now)throw new Error('Invalid threat');
  return {...base,status:'flagged',expiresAt:new Date(Math.min(expiry,now+1800000)).toISOString(),note:scope+'Google reported a match for '+threat.threatTypes.map(t=>({MALWARE:'malware',SOCIAL_ENGINEERING:'social engineering',UNWANTED_SOFTWARE:'unwanted software'})[t]).join(', ')+'. '+GOOGLE_WEB_RISK_ADVISORY,action};
 }catch{return {...base,status:'unavailable',note:'Google Web Risk could not be checked. The link remains unverified.'};}
}

export async function checkLinkReputation(text,env,options={}){
 const mode=env?.GUARDIAN_LINK_REPUTATION;
 if(mode==='google-web-risk')return checkGoogleWebRisk(text,env,options);
 if(mode!=='virustotal-community')return checkVirusTotal(text,env,options);
 const combinedProvider='Google Web Risk + VirusTotal';
 const {address,linkSeen}=selectAddress(text);
 if(!address)return linkSeen?{provider:combinedProvider,status:'skipped',note:skipped}:null;
 const now=options.now??Date.now(),checkedAt=new Date(now).toISOString(),settings={...options,now};
 const unavailable=name=>({provider:name,checkedAt,status:'unavailable',note:name+' could not be checked. The link remains unverified.',...(name===googleProvider?{advisory:GOOGLE_WEB_RISK_ADVISORY}:{})});
 // Google is the baseline. VirusTotal supplies independent additional evidence,
 // within its durable allowance. Run both without serial HTTP deadlines, and
 // retain each provider's result instead of making one a replacement verdict.
 const settled=await Promise.allSettled([
  checkGoogleWebRisk(address,env,settings),
  checkVirusTotal(address,env,settings)
 ]);
 const checks=settled.map((item,index)=>item.status==='fulfilled'&&item.value?item.value:unavailable(index?provider:googleProvider));
 const warning=checks.find(check=>check.status==='flagged');
 const status=warning?'flagged':checks.some(check=>check.status==='no_flags')?'no_flags':checks.some(check=>check.status==='unavailable')?'unavailable':checks.some(check=>check.status==='unknown')?'unknown':'stale';
 // These notes are built from validated fields by the adapters, never raw
 // provider metadata. Put warning evidence first and never average it away.
 const notes=[...checks.filter(check=>check.status==='flagged'),...checks.filter(check=>check.status!=='flagged')].map(check=>check.provider+': '+check.note);
 return {provider:combinedProvider,status,checkedAt,note:notes.join(' ')+' Neither result establishes that the link, sender or request is safe.',...(warning?{action:warning.action}:{}),checks};
}

// Reputation is intentionally narrower than the local evidence comparisons.
// Search results, earlier mailbox records, financial records and saved memory
// cannot trigger disclosure of a URL. Never shorten a private or unusual URL.
export function reputationEvidence(turn,evidence=[]){
 const texts=[String(turn||'')];
 for(const item of evidence.slice(0,12)){
  if(/ · (?:QR code|Recognised text)$/i.test(item.source)||(/\.(?:eml|mbox) · /i.test(item.source)&&item.text.startsWith('Imported email;')))texts.push(item.text);
 }
 // Prefer the actual button target(s). If those are ineligible don't ask about
 // the harmless-looking printed label as a proxy for an unchecked destination.
 if(texts.some(text=>text.includes('[Link: '))){
  const targets=texts.flatMap(text=>[...text.matchAll(/\[Link: (https?:\/\/[^\s\[\]<>]+)\](?=\s|$)/gi)].map(m=>m[1]));
  return targets.join('\n');
 }
 return texts.join('\n');
}

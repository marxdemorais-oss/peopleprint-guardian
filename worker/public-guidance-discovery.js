// Reads a few known publishers in rotation. Only the fixed homepage and one
// explicitly labelled fraud-advice page on the same host can be requested.
// A reviewed direct guide skips the homepage.
import {publishers,officialResearchUrl} from '../web/assets/public-research-sources.js';
import {requestProviderBytes} from './provider-http.js';
import {htmlText} from '../web/assets/import-records.js';

const batchSize=3;
const userAgent='PeopleprintGuardian/1.0 (+https://guardian.peopleorganised.com/privacy)';
const safetyLabel=/\b(?:fraud|scams?|phishing)\b/i;
const protectedPaths=/(?:^|[/_-])(?:report|news|press|register|login|account|portal|form|example|incident|story|stories|newsroom|investigation|testimonials?|blogs?|consultation|appeal|forum|discussion|community|comments|uploads|profile)(?:[/_-]|$)/i;
const removeInert=html=>html.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|style|template|noscript|svg|iframe)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
const clean=s=>htmlText(s).replace(/\s+/g,' ').trim();
const decoded=bytes=>new TextDecoder().decode(bytes);

function allowedByRobots(text,path){
  const groups=[];let group=null;
  for(const line of text.split(/\r?\n/)){
    const [field,...rest]=line.split('#',1)[0].split(':');
    if(!rest.length)continue;
    const key=field.trim().toLowerCase(),value=rest.join(':').trim();
    if(key==='user-agent'){
      if(!group||group.started){group={agents:[],rules:[],started:false};groups.push(group);}
      group.agents.push(value.toLowerCase());
    }else if(group){
      group.started=true;
      if(key==='allow'||key==='disallow'||key==='crawl-delay')group.rules.push({key,value});
    }
  }
  // Honour both applicable groups conservatively. Any explicit crawl delay
  // means this bounded task skips the host instead of trying to schedule around it.
  for(const g of groups.filter(g=>g.agents.some(a=>a==='*'||a==='peopleprintguardian'))){
    for(const {key,value} of g.rules){
      if(!value)continue;
      if(key==='crawl-delay'&&Number(value)>0)return false;
      if(key!=='disallow')continue;
      // We accept a conservative subset of the protocol. No allow exemption
      // can widen a disallow. Unfamiliar or oversized patterns fail closed.
      if(!value.startsWith('/')||value.length>260||value.split('*').length>3)return false;
      const end=value.endsWith('$');
      const expression=(end?value.slice(0,-1):value).split('*').map(s=>s.replace(/[\\^$.*+?()[\]{}|]/g,'\\$&')).join('.*');
      if(new RegExp('^'+expression+(end?'$':'')).test(path))return false;
    }
  }
  return true;
}

async function pageAt(url,{fetcher,signal},type,maxBytes){
  return decoded(await requestProviderBytes(url,{method:'GET',headers:{Accept:type,'User-Agent':userAgent}},{fetcher,signal,timeoutMs:5000,maxBytes,contentType:type==='text/html'?type:undefined}));
}

export async function discoverGuidancePage(publisher,options){
  const subject=Object.hasOwn(publishers,publisher)&&publishers[publisher];
  if(!subject?.directory)return null;
  const direct=subject.guideUrl&&officialResearchUrl(publisher,subject.guideUrl);
  const base=direct?new URL(direct).origin:'https://'+subject.hosts[0];
  try{
    let robots;
    try{robots=await pageAt(base+'/robots.txt',options,'text/plain',64000);}
    catch(error){if(error.providerStatus!==404&&error.providerStatus!==410)return null;robots='';}
    if(robots.includes('<'))return null;
    let url=direct;
    if(direct){
      const path=new URL(direct).pathname;
      if(protectedPaths.test(path)||!allowedByRobots(robots,path))return null;
    }else{
      if(!allowedByRobots(robots,'/'))return null;
      const home=removeInert(await pageAt(base+'/',options,'text/html',640000));
      for(const anchor of home.matchAll(/<a\b([^>]{1,1200})>([\s\S]{1,650}?)<\/a>/gi)){
        if(!safetyLabel.test(clean(anchor[2])))continue;
        const href=anchor[1].match(/(?:^|\s)href\s*=\s*(["'])([^"'<>\s]{1,500})\1/i)?.[2];
        if(!href||/[?#]/.test(href))continue;
        let candidate;try{candidate=new URL(href,base+'/');}catch{continue;}
        if(candidate.origin!==base||!safetyLabel.test(candidate.pathname.replace(/[-_/]+/g,' '))||
          protectedPaths.test(candidate.pathname)||!allowedByRobots(robots,candidate.pathname))continue;
        url=officialResearchUrl(publisher,candidate.href);if(url)break;
      }
    }
    if(!url)return null;
    const html=removeInert(await pageAt(url,options,'text/html',640000));
    if(!safetyLabel.test(clean(html.match(/<h1\b[^>]*>([\s\S]{1,700}?)<\/h1>/i)?.[1]||'')))return null;
    // Abstain on examples, reported speech, user contributions, hidden or scripted
    // content in the article. Actual passages still pass the normal proof filters.
    const main=html.match(/<(main|article)\b[^>]*>([\s\S]*?)<\/\1>/i)?.[2];
    if(!main||/<(?:blockquote|form|iframe)|(?:\s(?:hidden(?:\s|=|>)|aria-hidden=["']true)|display\s*:\s*none|visibility\s*:\s*hidden)/i.test(main)||
      /\b(?:example (?:text|message|email)|examples? of (?:a |an )?(?:text|message|email)|scam(?:mer)?s? (?:might |may |will )?(?:say|write)|comments section)\b/i.test(clean(main)))return null;
    return {url,html};
  }catch{return null;}
}

export function protectiveSentence(sentence){
  // Only an unquoted, explicit first-person refusal, never a mixed instruction.
  return /^(?:we (?:will never|would never|never|do not|don't|won't)|we'll never) (?:ask|request|call|text|email|send|contact|charge|demand|take)\b/i.test(sentence)
    && !/["“”]|[;:]|\b(?:but|unless|except|however|instead|until|sometimes)\b|\band (?:you|then|click|call|pay|send|reply|contact|ask)\b/i.test(sentence);
}

function discoveryOrder(){
  const direct=[],sectors=new Map();
  for(const id of Object.keys(publishers).sort()){
    const entry=publishers[id];
    if(!entry.directory)continue;
    if(entry.guideUrl){direct.push(id);continue;}
    if(!sectors.has(entry.sector))sectors.set(entry.sector,[]);
    sectors.get(entry.sector).push(id);
  }
  // Alternate sources with a known guide and sectors relying on homepage
  // discovery. Every eligible organisation appears once in a full rotation.
  const regular=[];
  const groups=[...sectors.values()];
  const longest=Math.max(0,...groups.map(group=>group.length));
  for(let i=0;i<longest;i++)for(const group of groups)if(group[i])regular.push(group[i]);
  const ids=[];
  for(let i=0;i<Math.max(direct.length,regular.length);i++){
    if(direct[i])ids.push(direct[i]);
    if(regular[i])ids.push(regular[i]);
  }
  return ids;
}
const ids=discoveryOrder();

export async function nextDiscoveryPublishers(db,now){
  if(!ids.length)return [];
  const row=await db.prepare(`INSERT INTO guardian_rate_limits(bucket_key,owner_id,count,expires_at)
    VALUES('public-library:discovery-offset','public-library',0,?)
    ON CONFLICT(bucket_key) DO UPDATE SET count=(count+?)%?,expires_at=excluded.expires_at RETURNING count`)
    .bind(now+30*86400000,batchSize,ids.length).first();
  return Array.from({length:Math.min(batchSize,ids.length)},(_,i)=>ids[(row.count+i)%ids.length]);
}

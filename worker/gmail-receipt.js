// Conservative verifier for a first-hop Google ARC set (RFC 8617 and RFC 6376).
// Other chains, signing algorithms and canonicalisations simply remain unverified.
import {requestProviderBytes} from './provider-http.js';

const domainPattern='(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\\.)+[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?';
const domainTest=new RegExp('^'+domainPattern+'$','i');
const keyCache=new Map();
const binaryBytes=s=>Uint8Array.from(s,c=>c.charCodeAt(0));
const sigBytes=s=>binaryBytes(atob(s.replace(/[ \t\r\n]/g,'')));
const compact=s=>s.replace(/\r\n[ \t]+/g,' ').replace(/[ \t]+/g,' ').replace(/^[ \t]+|[ \t]+$/g,'');
const canonical=h=>h.name+':'+compact(h.value);

function tags(value){
 const out=new Map();
 for(const part of value.split(';')){
  if(!part.trim())continue;
  const m=part.match(/^\s*([a-z][a-z\d]*)\s*=([\s\S]*)$/i);
  if(!m||out.has(m[1].toLowerCase()))return new Map();
  out.set(m[1].toLowerCase(),compact(m[2]));
 }
 return out;
}
function signatureLine(header){
 return canonical({name:header.name,value:header.value.replace(/((?:^|;)\s*b\s*=)[^;]*/i,'$1')});
}
function parseRaw(raw){
 if(typeof raw!=='string'||!raw||raw.length>180000||/\r(?!\n)|(?<!\r)\n/.test(raw))return null;
 const split=raw.indexOf('\r\n\r\n');
 if(split<1||split>60000)return null;
 const fields=[];
 for(const line of raw.slice(0,split).split('\r\n')){
  if(/^[ \t]/.test(line)&&fields.length){fields.at(-1).value+='\r\n'+line;continue;}
  const m=line.match(/^([!-9;-~]+):(.*)$/);
  if(!m||fields.length>=320)return null;
  fields.push({name:m[1].toLowerCase(),value:m[2]});
 }
 return {fields,body:raw.slice(split+4)};
}
async function googleKey(selector,fetcher){
 // Only Google's public ARC key is disclosed to DNS. No sender hostname goes out.
 if(!/^arc-20\d{6}$/.test(selector))return null;
 const cached=fetcher===fetch&&keyCache.get(selector);
 if(cached&&cached.until>Date.now())return cached.key;
 const name=selector+'._domainkey.google.com';
 const bytes=await requestProviderBytes('https://dns.google/resolve?type=TXT&name='+name,{method:'GET',headers:{Accept:'application/dns-json'}},{fetcher,timeoutMs:2800,maxBytes:16000});
 const response=JSON.parse(new TextDecoder().decode(bytes));
 if(response.Status!==0||response.TC)return null;
 const answers=(response.Answer||[]).filter(a=>a.type===16&&a.name?.replace(/\.$/,'').toLowerCase()===name);
 if(answers.length!==1)return null;
 const answer=answers[0],parts=String(answer.data).trim().replace(/^"|"$/g,'').replace(/"\s*"/g,'');
 const keyTags=tags(parts);
 if(keyTags.get('k')&&keyTags.get('k')!=='rsa')return null;
 const publicKey=keyTags.get('p');
 if(!publicKey)return null;
 const key=await crypto.subtle.importKey('spki',sigBytes(publicKey),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['verify']);
 if(key.algorithm.modulusLength<1024)return null;
 if(fetcher===fetch){
  if(keyCache.size>=8)keyCache.delete(keyCache.keys().next().value);
  keyCache.set(selector,{key,until:Date.now()+1000*Math.min(Number(answer.TTL)||0,3600)});
 }
 return key;
}
const checkSignature=(key,b,text)=>crypto.subtle.verify('RSASSA-PKCS1-v1_5',key,sigBytes(b),binaryBytes(text));
export async function verifyGoogleReceipt(raw,expectedFrom,fetcher=fetch){
 try{
  const message=parseRaw(raw);if(!message)return null;
  const {fields,body}=message;
  const one=name=>{const list=fields.filter(h=>h.name===name);return list.length===1?list[0]:null;};
  const aar=one('arc-authentication-results'),ams=one('arc-message-signature'),seal=one('arc-seal'),from=one('from');
  if(!aar||!ams||!seal||!from||compact(from.value)!==compact(expectedFrom))return null;
  const addr=compact(from.value).match(/^(?:[^<>]*<([^<>\s@]+@[^<>\s@]+)>|([^<>\s@]+@[^<>\s@]+))$/);
  const senderDomain=(addr?.[1]||addr?.[2]||'').split('@')[1]?.toLowerCase();
  if(!senderDomain||!domainTest.test(senderDomain))return null;
  const result=compact(aar.value).split(';').map(s=>s.trim());
  if(result.shift()!=='i=1'||result.shift()!=='mx.google.com')return null;
  const verdicts=result.filter(s=>/^dmarc\s*=/i.test(s));
  if(verdicts.length!==1)return null;
  const verdict=verdicts[0].match(/^dmarc=(pass|fail)(?: \([^()]*\))? header\.from=([a-z\d.-]+)$/i);
  if(!verdict||verdict[2].toLowerCase()!==senderDomain)return null;
  const st=tags(seal.value),mt=tags(ams.value);
  if([st,mt].some(t=>t.get('i')!=='1'||t.get('a')!=='rsa-sha256'||t.get('d')!=='google.com'||!t.get('b')))return null;
  if(st.get('cv')!=='none'||mt.get('c')!=='relaxed/relaxed'||mt.has('l')||!mt.get('bh')||st.get('s')!==mt.get('s'))return null;
  const names=mt.get('h')?.toLowerCase().split(':').map(s=>s.trim());
  if(!names?.includes('from')||names.length>100||names.some(n=>!n||n.startsWith('arc-')))return null;
  const normalBody=body.split('\r\n').map(line=>line.replace(/[ \t]+$/g,'').replace(/[ \t]+/g,' ')).join('\r\n').replace(/(?:\r\n)+$/,'');
  const digest=new Uint8Array(await crypto.subtle.digest('SHA-256',binaryBytes(normalBody?normalBody+'\r\n':'')));
  if(btoa(String.fromCharCode(...digest))!==mt.get('bh').replace(/\s+/g,''))return null;
  const key=await googleKey(st.get('s'),fetcher);if(!key)return null;
  // The seal binds Google's authentication result to the message signature.
  if(!await checkSignature(key,st.get('b'),[canonical(aar),canonical(ams),signatureLine(seal)].join('\r\n')))return null;
  const pool=[...fields],headers=[];
  for(const name of names){
   const i=pool.findLastIndex(field=>field.name===name);
   if(i>=0)headers.push(canonical(pool.splice(i,1)[0]));
  }
  headers.push(signatureLine(ams));
  if(!await checkSignature(key,mt.get('b'),headers.join('\r\n')))return null;
  return {domain:senderDomain,status:verdict[1].toLowerCase()};
 }catch{return null;}
}

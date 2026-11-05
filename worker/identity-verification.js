import {matchUkOrganisations} from '../web/assets/uk-directory.js';
import {lookupOrganisationReference,automaticCompanyName} from './organisation-reference.js';
import {compareKnownContacts,isActionLink} from './sender-comparison.js';
import {isKnownContact,knownContact,isCompanyLookup} from '../web/assets/known-contact.js';
import {organisationDirectory,HMRC_AGENCIES_SOURCE} from '../web/assets/organisation-directory.js';
import {htmlText} from '../web/assets/import-records.js';
import {requestProviderBytes} from './provider-http.js';

const cache=new Map();
const short=(s,n=300)=>String(s||'').slice(0,n);
const compact=s=>String(s).replace(/\s+/g,' ').trim().toLowerCase();
const escape=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
const sameDomain=(host,domain)=>host===domain||host.endsWith('.'+domain);
const defang=s=>String(s).replaceAll('.','[.]').replaceAll('@','[@]');
function webAddress(raw){
 try{const u=new URL(/^www\./i.test(raw)?'https://'+raw:raw);return /^(https?:)$/.test(u.protocol)?u:null;}catch{return null;}
}
export function normalisePhone(value){
 let raw=String(value).trim().replace(/^tel:/i,'').replace(/\(0\)/g,'');
 if(!/^[+\d ().-]+$/.test(raw))return null;
 raw=raw.replace(/[ ().-]/g,'');if(raw.startsWith('00'))raw='+'+raw.slice(2);
 if(/^0[1-9]\d{9}$/.test(raw))raw='+44'+raw.slice(1);
 return /^\+[1-9]\d{7,14}$/.test(raw)?raw:null;
}
export function extractContactEvidence(text){
 const sample=String(text||''),links=[],mailboxes=[],phones=[];
 const add=(list,entry)=>{if(list.length<24&&!list.some(x=>x.value===entry.value&&x.kind===entry.kind))list.push(entry);};
 // Markers preserve destinations from inert email projection. They are evidence,
 // not proof of origin. No extracted address is ever fetched by this module.
 for(const m of sample.matchAll(/\[Link: ([^\]\n]{1,4096})\]([\s\S]{0,2000}?)\[End link\]/g)){
  const target=m[1].trim(),label=m[2].trim();
  if(/^mailto:/i.test(target))add(mailboxes,{kind:'Email button',value:target.slice(7).split('?')[0],display:label});
  else if(/^tel:/i.test(target))add(phones,{kind:'Call button',value:target.slice(4),label});
  else add(links,{kind:'Link destination',value:target,label});
 }
 for(const m of sample.matchAll(/(?:https?:\/\/|www\.)[^\s<>"'\[\]]+/gi)){
  const value=m[0].replace(/[.,;!?]+$/,'').replace(/[)]+$/,'');
  if(!links.some(x=>x.value===value))add(links,{kind:'Visible address',value,label:''});
 }
 for(const m of sample.matchAll(/^(From|Von|De|Da|Sender|Absender|Reply-To|Reply to|Antwort an|Répondre à|Rispondi a):\s*([^\n]*)/gim)){
  const angle=[...m[2].matchAll(/<([^<>]+)>/g)],kind=/reply|antwort|répondre|rispondi/i.test(m[1])?'Reply-To':'From';
  const addressPattern=/[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,63}/gi;
  if(angle.length){for(const a of angle)for(const email of a[1].matchAll(addressPattern))add(mailboxes,{kind,value:email[0],display:m[2].slice(0,m[2].indexOf('<')).trim()});}
  else for(const email of m[2].matchAll(addressPattern))add(mailboxes,{kind,value:email[0]});
 }
 for(const m of sample.matchAll(/[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,63}/gi))if(!mailboxes.some(x=>x.value===m[0]))add(mailboxes,{kind:'Mentioned email',value:m[0]});
 for(const m of sample.matchAll(/(?:^|[^\w+])((?:\+|00)[1-9][\d ().-]{7,22}\d|0[1-9][\d ().-]{8,17}\d)(?!\w)/g)){
  const value=m[1].trim();if(normalisePhone(value)&&!phones.some(x=>normalisePhone(x.value)===normalisePhone(value)))add(phones,{kind:'Displayed phone',value});
 }
 return {links,mailboxes,phones};
}
const mailboxKey=value=>{const at=value.lastIndexOf('@');return value.slice(0,at)+'@'+value.slice(at+1).toLowerCase();};
function recognised(text){
 return Object.entries(organisationDirectory).filter(([,org])=>org.aliases.some(alias=>(alias.length>4||/\b(?:hmrc|tax|debt|collection|revenue|credit)\b/i.test(text))&&new RegExp('(?:^|[^a-z0-9])'+escape(alias)+'(?=$|[^a-z0-9])','i').test(text))||org.domains.some(domain=>new RegExp('(?:^|[\\s/@.])'+escape(domain)+'(?=$|[\\s/:>])','i').test(text))).map(([id])=>id);
}
async function readReference(id,{fetcher,now,signal}){
 const org=organisationDirectory[id],url=id==='hmrc-agencies'?HMRC_AGENCIES_SOURCE.url:org?.url;
 if(!url)return null;
 const existing=fetcher===fetch&&cache.get(id);if(existing?.until>now)return existing.value;
 if(fetcher===fetch)cache.set(id,{until:now+600000,value:null});
 try{
  const bytes=await requestProviderBytes(url,{method:'GET',headers:{Accept:'text/html'}},{fetcher,signal,timeoutMs:2200,maxBytes:512*1024,contentType:'text/html'});
  const original=htmlText(new TextDecoder().decode(bytes)),page=compact(original);
  if(!page.includes(id==='hmrc-agencies'?'hmrc and debt collection agencies':org.marker))return null;
  let value;
  if(id==='hmrc-agencies'){
   // Exclude removed names in the GOV.UK change history and unrelated sections.
   const list=page.match(/check the list of debt collection agencies who may contact you:([\s\S]{1,4000}?)all debt collection agencies we work with/);
   if(!list)return null;
   value={channels:/only contact you by:\s*letter\s+text message\s+phone/.test(page),noVisits:page.includes('never visit you at your home or place of work'),listed:Object.entries(organisationDirectory).filter(([,o])=>o.listMarker&&list[1].includes(o.listMarker.toLowerCase())).map(([key])=>key),checkedAt:new Date(now).toISOString()};
  }else{
   const numbers=[...original.matchAll(/(?:^|[^\w+])((?:\+|00)[1-9][\d ().-]{7,22}\d|0[1-9][\d ().-]{8,17}\d)(?!\w)/g)].map(m=>normalisePhone(m[1]));
   const mailboxes=new Set([...original.matchAll(/[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,63}/gi)].map(m=>mailboxKey(m[0])));
   // Only reviewed contacts are eligible. A page can also list an ombudsman,
   // charity or payment agent; their contacts must not become this firm's.
   value={phones:org.phones.filter(p=>numbers.includes(normalisePhone(p.value))),mailboxes:org.mailboxes.filter(m=>mailboxes.has(mailboxKey(m.value))),checkedAt:new Date(now).toISOString()};
  }
  if(fetcher===fetch)cache.set(id,{until:now+6*3600000,value});
  return value;
 }catch{return null;}
}
export async function verifyIdentityEvidence(message,evidence=[],{fetcher=fetch,now=Date.now(),signal,gmailReceipts,conversationContacts=[]}={}){
 const records=[{id:null,text:String(message||'')},...evidence.slice(0,12).filter(e=>!isKnownContact(e)&&!isCompanyLookup(e)).map(e=>({id:e.id,text:e.text}))];
 const all=records.map(record=>({...record,ids:recognised(record.text),contact:extractContactEvidence(record.text)}));
 const ids=[...new Set(all.flatMap(r=>r.ids))].slice(0,3);
 const hasHMRC=ids.includes('hmrc');
 const attachments=records.filter(r=>r.id!==null);
 const selectedOriginal=attachments.length===1 && (!message.trim()||/^(?:please )?(?:check|verify|assess|review) (?:this|the attached|this attached|the selected) (?:email|message)[.?! ]*$/i.test(message.trim()));
 const supporting=new Set(evidence.filter(e=>/^(?:Earlier |Financial record|Bank statement)/i.test(e.source)||(!selectedOriginal&&/^(?:Gmail|Outlook)/i.test(e.source))).map(e=>e.id));

 // A name from one record must never be paired with a number from a different record.
 const registerText=attachments.length===1 && !automaticCompanyName(message) && !/companies house|company (?:registration )?(?:number|no\.)/i.test(message)
   && !supporting.has(attachments[0].id)
   && (automaticCompanyName(attachments[0].text)||/companies house|company (?:registration )?(?:number|no\.)/i.test(attachments[0].text))?attachments[0]:records[0];
 const requests=evidence.filter(isCompanyLookup);
 const publicCompanyName=requests.length===1?requests[0].text:automaticCompanyName(registerText.text)||undefined;
 const [registerRow,results]=await Promise.all([lookupOrganisationReference(registerText.text,{fetcher,now,signal,publicCompanyName}), Promise.all([...ids.map(id=>readReference(id,{fetcher,now,signal})),hasHMRC?readReference('hmrc-agencies',{fetcher,now,signal}):null])]);
 const references=Object.fromEntries(ids.map((id,i)=>[id,results[i]])),list=results.at(-1);
 const current=all.filter(r=>!supporting.has(r.id));
 const compared=compareKnownContacts(current,evidence,conversationContacts);
 const rows=compared.rows.slice(0,12),conflicts=compared.conflicts.slice(0,4);
 if(registerRow)rows.unshift({...registerRow,evidenceId:registerText.id});
 const add=row=>{if(rows.length<45&&!rows.some(r=>r.label===row.label&&r.detail===row.detail&&r.evidenceId===row.evidenceId))rows.push(row);};
 for(const id of ids){
  const org=organisationDirectory[id],ref=references[id];
  add({kind:'organisation',label:org.name,status:ref?'reference':'unverified',detail:ref?'Independent official reference checked. This does not authenticate the sender.':'A current official contact reference could not be checked.',sourceId:org.url?id:null,checkedAt:ref?.checkedAt||null});
  if(org.background)add({kind:'background',label:org.name,status:'reference',detail:org.background+' This is reviewed public background, not authentication of this email. It was reviewed on '+org.reviewedOn+'.',sourceId:id,directoryCheckedOn:org.reviewedOn});
  if(hasHMRC&&org.listMarker)add({kind:'relationship',label:org.name+' and HMRC',status:list?.listed.includes(id)?'match':'unverified',detail:list?.listed.includes(id)?'HMRC currently lists this collection agency. The particular contact and claimed debt are still unverified.':list?'This agency was not found in the checked HMRC list. That does not itself prove fraud.':'This agency appeared in the HMRC list reviewed on 4 November 2026. Its current listing could not be rechecked.',sourceId:'hmrc-agencies',checkedAt:list?.checkedAt||null});
 }
 if(hasHMRC&&!ids.some(id=>organisationDirectory[id].listMarker)&&all.some(r=>/\b(?:debt|collection agenc(?:y|ies)|collector)\b/i.test(r.text)))add({kind:'relationship',label:'Claimed HMRC collection agency',status:'unverified',detail:'No named agency could be matched to a reviewed entry. The claimed authority to collect this debt remains unverified.',sourceId:'hmrc-agencies',checkedAt:list?.checkedAt||null});
 if(hasHMRC&&ids.some(id=>organisationDirectory[id].listMarker)&&list?.channels)add({kind:'practice',label:'How HMRC’s agencies make contact',status:'reference',detail:'HMRC lists letters, text messages and phone calls as its collection agencies’ contact methods.'+(list.noVisits?' It says these agencies do not visit homes or workplaces.':''),sourceId:'hmrc-agencies',checkedAt:list.checkedAt});
 for(const record of all){
  // An attachment or old agreement can name a completely different business.
  // Bind the directory observation to the same incident record as the link.
  const organisations=supporting.has(record.id)?[]:matchUkOrganisations(record.text);
  for(const org of organisations.slice(0,3)){
   add({kind:'directory',label:org.name+' · UK directory',status:'reference',detail:'The UK directory lists '+defang(org.hosts[0])+' for '+org.name+'. '+(org.sharedHost?'Several authorities use this website. The host alone cannot identify which authority is involved.':'This identifies a published website. It does not identify the person who contacted you.'),sourceId:org.id,directoryCheckedOn:org.checkedDate,evidenceId:record.id});
  }
  const localIds=record.ids.filter(id=>ids.includes(id));
  const applicable=localIds.length?localIds:record.id&&!supporting.has(record.id)?all[0].ids.filter(id=>ids.includes(id)):[];
  const owned=host=>applicable.filter(id=>organisationDirectory[id].domains.some(d=>sameDomain(host,d)));
  const domainRow=(kind,value,label)=>{
   const url=webAddress(value);if(!url){add({kind:'website',label:kind,status:'unverified',detail:'The supplied destination is not a readable HTTP or HTTPS address.',evidenceId:record.id});return;}
   const matching=owned(url.hostname),confirmed=matching.find(id=>references[id]);
   const shown=webAddress(label)||(/^[a-z\d-]+(?:\.[a-z\d-]+)+(?::\d+)?(?:\/[^\s]*)?$/i.test(String(label||'').trim())?webAddress('https://'+label.trim()):null);
   const hiddenDiff=shown&&shown.hostname!==url.hostname;
   const sharedReviewedDomain=shown&&applicable.some(id=>id!=='hmrc'&&references[id]&&organisationDirectory[id].domains.some(d=>sameDomain(shown.hostname,d)&&sameDomain(url.hostname,d)));
   const hostVariant=hiddenDiff&&(shown.hostname.replace(/^www\./,'')===url.hostname.replace(/^www\./,'')||sharedReviewedDomain);
   const govHost=applicable.includes('hmrc')&&['www.gov.uk','gov.uk'].includes(url.hostname);
   const detail=defang(url.hostname)+(govHost?' is a GOV.UK host. This alone does not identify an HMRC page or authenticate its sender.':confirmed?' matches a reviewed domain for '+organisationDirectory[confirmed].name+'. This confirms the domain only, not the sender or this page.':matching.length?' matches a stored domain, but its reference could not be rechecked.':applicable.length?' does not match the reviewed domains for the named organisation. Other authorised domains may exist.':' has no independent organisation reference in the current catalogue.');
   // An exact hostname is meaningful even if the link uses an unusual port or
   // user information: the observation explicitly concerns that hostname only.
   if(organisations.length>1&&!applicable.length){
    add({kind:'website',label:kind,status:'unverified',detail:defang(url.hostname)+' appears in a record naming more than one organisation. I could not establish which organisation this destination should be compared with.',evidenceId:record.id});
   }else if(organisations.length===1&&!applicable.length){
    const org=organisations[0],listed=org.hosts.includes(url.hostname);
    const finding=listed&&org.sharedHost?' matches a website shared by multiple authorities. This host cannot identify which authority published this page or sent the message.':listed?' matches a website hostname recorded for '+org.name+'. This confirms the hostname only. The page, sender and request remain unverified.':' is outside the website hostnames recorded for '+org.name+'. The organisation may use a third party or another hostname. This destination remains unverified.';
    add({kind:'website',label:kind,status:listed?(org.sharedHost?'shared_host':'match'):'unverified',detail:defang(url.hostname)+finding,evidenceId:record.id,sourceId:org.id,directoryCheckedOn:org.checkedDate});
    if(!listed&&!org.sharedHost&&kind==='Link destination'&&isActionLink(label)&&!hiddenDiff){
     const clue='The button leads to '+defang(url.hostname)+'. The UK directory lists '+defang(org.hosts[0])+' for '+org.name+'. A third-party payment or login service is possible, but this destination has not been confirmed.';
     conflicts.push({kind:'directory_destination',clue,recordId:record.id});
    }
   }else add({kind:'website',label:kind,status:govHost?'government_host':confirmed?'match':applicable.length&&!matching.length?'different':'unverified',detail,evidenceId:record.id,sourceId:confirmed||null,checkedAt:references[confirmed]?.checkedAt||null});
   const agency=applicable.filter(id=>organisationDirectory[id].listMarker&&references[id]);
   if(kind==='Link destination' && isActionLink(label) && agency.length===1 && !matching.length && !hiddenDiff){
    const clue='The button leads to '+defang(url.hostname)+', outside the reviewed domains for '+organisationDirectory[agency[0]].name+'. The agency may use another service, but this destination is unconfirmed.';
    add({kind:'destination',status:'different',label:'Where the button leads',detail:clue,sourceId:agency[0],checkedAt:references[agency[0]].checkedAt,evidenceId:record.id});
    conflicts.push({kind:'agency_destination',clue,recordId:record.id});
   }
   if(hostVariant)add({kind:'website',label:'Visible link and destination',status:'reference',detail:'The displayed and actual hostnames differ within the same domain. This alone does not establish fraud or confirm the page is safe.',evidenceId:record.id});
   else if(hiddenDiff){const clue='The visible link names '+defang(shown.hostname)+' but its actual destination is '+defang(url.hostname)+'.';add({kind:'masking',label:'Visible link and destination',status:'different',detail:clue+' Redirect and tracking services can also cause this difference; verify it independently.',evidenceId:record.id});conflicts.push({kind:'masked_link',clue,recordId:record.id});}
   if(url.username||url.password){const clue='The address contains text before @. The destination is '+defang(url.hostname)+', not the name before @.';add({kind:'masking',label:'Address disguises its destination',status:'different',detail:clue,evidenceId:record.id});conflicts.push({kind:'masked_link',clue,recordId:record.id});}
  };
  for(const link of record.contact.links)domainRow(link.kind,link.value,link.label);
  for(const mailbox of record.contact.mailboxes){
   const host=mailbox.value.toLowerCase().split('@')[1],matching=owned(host||''),confirmed=matching.find(id=>references[id]);
   const displayEmail=mailbox.display?.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,63}/i)?.[0];
   if(displayEmail&&displayEmail.toLowerCase()!==mailbox.value.toLowerCase()){
    const clue='The displayed email names '+defang(displayEmail)+' but the actual '+mailbox.kind+' address is '+defang(mailbox.value)+'.';
    add({kind:'masking',label:'Displayed and actual mailbox',status:'different',detail:clue,evidenceId:record.id});conflicts.push({kind:'masked_mailbox',clue,recordId:record.id});
   }
   const exact=applicable.find(id=>references[id]?.mailboxes.some(m=>mailboxKey(m.value)===mailboxKey(mailbox.value)));
   const purpose=exact&&references[exact].mailboxes.find(m=>mailboxKey(m.value)===mailboxKey(mailbox.value)).purpose;
   add({kind:'email',label:mailbox.kind,status:exact?'match':confirmed?'domain_only':applicable.length&&!matching.length?'different':'unverified',detail:defang(mailbox.value)+(exact?' is published by '+organisationDirectory[exact].name+' for '+purpose+'.':confirmed?' uses a reviewed domain for '+organisationDirectory[confirmed].name+'; the exact mailbox is not confirmed.':matching.length?' uses a stored domain whose reference could not be rechecked.':applicable.length?' does not match the reviewed domains. This could be a third-party sender; ownership is unconfirmed.':' has not been independently confirmed.')+' A matching address does not prove who sent the message.',evidenceId:record.id,sourceId:exact||confirmed||null,checkedAt:references[exact||confirmed]?.checkedAt||null});
  }
  const froms=record.contact.mailboxes.filter(m=>m.kind==='From'),replies=record.contact.mailboxes.filter(m=>m.kind==='Reply-To');
  const from=froms.length===1&&froms[0],reply=replies.length===1&&replies[0];
  if(from&&reply&&from.value.toLowerCase().split('@')[1]!==reply.value.toLowerCase().split('@')[1]){
   const clue='The Reply-To address uses a different domain from From.';
   add({kind:'email',label:'Reply destination',status:'different',detail:clue+' This can be legitimate, but the reply would go somewhere else.',evidenceId:record.id});conflicts.push({kind:'reply_domain',clue,recordId:record.id});
  }
  for(const phone of record.contact.phones){
   const number=normalisePhone(phone.value),exact=number&&applicable.find(id=>references[id]?.phones.some(p=>normalisePhone(p.value)===number));
   const contact=exact&&references[exact].phones.find(p=>normalisePhone(p.value)===number);
   add({kind:'phone',label:phone.kind,status:exact?'match':'unverified',detail:short(phone.value,40)+(exact?' matches '+organisationDirectory[exact].name+'’s published '+contact.purpose+' number. Caller ID can still be spoofed.':' is not confirmed by the reviewed contact references. Not finding it does not prove fraud.'),evidenceId:record.id,sourceId:exact||null,checkedAt:references[exact]?.checkedAt||null});
   const printed=normalisePhone(phone.label);
   if(printed&&number&&printed!==number){const clue='The Call button dials a different number from its visible label.';add({kind:'masking',label:'Call button destination',status:'different',detail:clue,evidenceId:record.id});conflicts.push({kind:'masked_phone',clue,recordId:record.id});}
  }
  const receipt=gmailReceipts?.get(record.id);
  if(receipt){
   const domain=defang(receipt.domain);
   if(receipt.status==='fail'&&selectedOriginal&&!supporting.has(record.id))conflicts.unshift({kind:'failed_domain_authentication',recordId:record.id,clue:'Gmail could not authenticate '+domain+' on this copy. Forwarding or a mail configuration issue can also cause this result.'});
   add({kind:'authentication',label:'Gmail delivery check for this email',status:receipt.status==='pass'?'domain_only':'different',detail:receipt.status==='pass'
    ?'Gmail recorded a DMARC pass for '+domain+'. Guardian verified Google’s signed copy of this email. That result concerns the domain at the time Google processed it. It cannot identify the person, confirm this delivery or validate the reply address or payment request.'
    :'Gmail recorded a DMARC failure for '+domain+'. Guardian verified Google’s signed receipt. The domain was not authenticated when Google processed this copy. Forwarding or delivery configuration may also cause a failure.',evidenceId:record.id});
  }else if(record.contact.mailboxes.length)add({kind:'authentication',label:'Email authentication',status:'unverified',detail:'No trusted receiving-mail-system authentication result is available. Pasted SPF, DKIM or DMARC headers are unverified evidence.',evidenceId:record.id});
  if(/ · Recognised text$/i.test(evidence.find(e=>e.id===record.id)?.source||''))add({kind:'coverage',label:'Screenshot limits',status:'unverified',detail:'Only visible text was read. A hidden button destination and original email headers cannot be recovered from a screenshot.',evidenceId:record.id});
 }
 for(const item of conflicts)if(item.recordId&&supporting.has(item.recordId))item.supportingRecord=true;
 // Use only independently obtained or explicitly customer-supplied contact details.
 const knownNumbers=[...new Set([...evidence.filter(isKnownContact).map(e=>knownContact(e.text)),...conversationContacts].filter(c=>c?.kind==='phone').map(c=>c.value))];
 const agencies=ids.filter(id=>organisationDirectory[id].listMarker && current.some(r=>r.ids.includes(id)));
 const agency=agencies.length===1?agencies[0]:null;
 const line=agency&&references[agency]?.phones.find(p=>!/(?:complaints)/i.test(p.purpose));
 const canCallback=current.some(r=>r.contact.phones.length||/\b(?:calling|called|caller|call|debt|pay|payment|invoice|bank details)\b/i.test(r.text));
 let callback;
 if(canCallback && knownNumbers.length===1)callback={source:'customer',detail:'Call '+knownNumbers[0]+' using the number you supplied separately. Ask whether they made this specific request before acting.'};
 else if(canCallback && line)callback={source:agency,detail:'Call '+organisationDirectory[agency].name+' on '+line.value+' ('+line.purpose+'), listed on its official page. Ask whether they made this specific request before acting.'};
 if(callback)rows.unshift({kind:'callback',label:'Confirm this particular request',status:'reference',detail:callback.detail,...(callback.source==='customer'?{}:{sourceId:agency,checkedAt:references[agency].checkedAt})});
 return {version:1,checkedAt:new Date(now).toISOString(),...(callback?{callback}:{}),scope:'Contact details supplied separately by you are personal comparison points. Directory entries identify published websites. A review date is separate from a live check. Detailed contact references cover selected organisations, not every business. UK company register entries establish registration only. Unpublished mailboxes and numbers remain unverified. Matching details do not authenticate a sender or a request.',rows,conflicts:conflicts.slice(0,8)};
}

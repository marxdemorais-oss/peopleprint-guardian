import {organisationReferenceLink,validPublicCompanyName} from '../web/assets/organisation-reference.js';
import {htmlText} from '../web/assets/import-records.js';
import {requestProviderBytes} from './provider-http.js';

const labelledNumber=/\b(?:companies house(?:\s+(?:registration|company))?|(?:UK\s+)?company(?:\s+registration)?|registered\s+(?:company|in\s+(?:england(?:\s+and\s+wales)?|wales|scotland|northern ireland)))\s+(?:number|no\.?)\s*[:#]?\s*((?:[a-z]{2}\d{6}|\d{8}))(?=$|[\s,.;)])/gi;
const ukContext=/\b(?:companies house|UK\s+company|united kingdom|registered in (?:england|wales|scotland|northern ireland))\b/i;
const finance=/\b(?:FCA|financial conduct authority|UK[- ]regulated (?:bank|broker|firm|lender))\b/i;
const legalNameLabel=/^(?:registered (?:company )?name|legal (?:company )?name|company name)[ \t]*:[ \t]*([^\r\n;]{2,150})[ \t]*$/im;
const nameKey=name=>name.normalize('NFKC').toLowerCase().trim().replace(/\s+/g,' ').replace(/\b(?:ltd|limited)\.?$/,'limited');
const cache=new Map();

// Select only a public legal name, never send the surrounding conversation.
export function automaticCompanyName(message){
  const text=String(message||'');
  if(!/\b(?:legit(?:imate)?|genuine|scam|fraud|trust|real company|registered|registration|companies house|invoice|payment|pay|deposit|contract|supplier|verify|check)\b/i.test(text))return null;
  if(/\bregistered in (?:ireland|india|australia|new zealand|canada|singapore|hong kong)\b/i.test(text))return null;
  const names=[];
  const add=value=>{const name=value.trim().replace(/^(?:(?:Is|Are|Please|Check|Verify|The|From)\s+)+/i,'');if(validPublicCompanyName(name)&&!names.some(n=>nameKey(n)===nameKey(name)))names.push(name);};
  for(const m of text.matchAll(/^(?:registered (?:company )?name|legal (?:company )?name|company name)[ \t]*:[ \t]*([^\r\n;]{2,120})[ \t]*$/gim))add(m[1]);
  for(const m of text.matchAll(/\b(?:[\p{Lu}\p{N}][\p{L}\p{N}'’()-]*[ &]+(?:(?:and|of|the)[ &]+)?){1,10}?(?:Ltd|LTD|ltd|Limited|LIMITED|limited|PLC|plc|LLP|llp)\b/gu))add(m[0]);
  return names.length===1?names[0]:null;
}

function profileValue(html,num){
  const doc=html.replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|template|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
  if(!new RegExp('<p\\b[^>]*\\bid=["\']company-number["\'][^>]*>\\s*Company number\\s*<strong>\\s*'+num+'\\s*</strong>\\s*</p>','i').test(doc))return null;
  const title=doc.match(/<title\b[^>]*\bdata-id=["']company_profile["'][^>]*>([^<>]{1,400}) overview - Find and update company information - GOV.UK<\/title>/i);
  const heading=doc.match(/<div\b[^>]*\bclass=["'][^"']*\bcompany-name-row\b[^"']*["'][^>]*>\s*<h1\b[^>]*>([^<>]{1,400})<\/h1>/i);
  if(!title||!heading)return null;
  const name=htmlText(heading[1]).replace(/\s+/g,' ').trim();
  if(!name||name.length>160||htmlText(title[1]).trim()!==name||/[\u0000-\u001f]/.test(name))return null;
  const raw=doc.match(/<dd\b[^>]*\bid=["']company-status["'][^>]*>\s*([A-Za-z -]{1,70})\s*<\/dd>/i)?.[1].trim();
  return {name,status:raw||null};
}

async function readEntry(num,{fetcher,now,signal}){
  if(fetcher===fetch&&cache.get(num)?.until>now)return cache.get(num).entry;
  let entry=null;
  try{
    const url=organisationReferenceLink({sourceId:'uk-company-register',companyNumber:num}).url;
    const body=await requestProviderBytes(url,{method:'GET',headers:{Accept:'text/html'}},{fetcher,signal,timeoutMs:8000,maxBytes:384*1024,contentType:'text/html'});
    const value=profileValue(new TextDecoder().decode(body),num);
    if(value)entry={...value,checkedAt:new Date(now).toISOString()};
  }catch{/* Unavailable registers and unrecognised pages cannot establish a match. */}
  if(fetcher===fetch&&!signal?.aborted){
    if(cache.size>=256)cache.delete(cache.keys().next().value);
    cache.set(num,{entry,until:now+(entry?3600000:120000)});
  }
  return entry;
}

// An advanced-search page reports its total. Parse every result on a complete
// first page or abstain, including when the exact name belongs to two entries.
async function findNumberByName(name,{fetcher,signal}){
  const url=new URL('https://find-and-update.company-information.service.gov.uk/advanced-search/get-results');
  url.searchParams.set('companyNameIncludes',name);
  try{
    const bytes=await requestProviderBytes(url.href,{method:'GET',headers:{Accept:'text/html'}},{fetcher,signal,timeoutMs:8000,maxBytes:512*1024,contentType:'text/html'});
    const html=new TextDecoder().decode(bytes).replace(/<!--[\s\S]*?-->/g,'').replace(/<(script|template|style|noscript)\b[^>]*>[\s\S]*?<\/\1>/gi,'');
    if(!/<title[^>]*>\s*Advanced company search results - Find and update company information - GOV.UK\s*<\/title>/i.test(html))return null;
    const totals=[...html.matchAll(/<p class="govuk-heading-m">\s*([0-9,]+) results?\s*<\/p>/gi)].map(m=>Number(m[1].replaceAll(',','')));
    const total=totals[0];if(!total||total>20||totals.some(count=>count!==total)||/rel=["']next["']|aria-label=["']Next page["']/i.test(html))return null;
    const table=html.match(/<table\b[^>]*class=["'][^"']*\bgovuk-table\b[^"']*["'][^>]*>([\s\S]*?)<\/table>/i)?.[1];
    if(!table)return null;
    const records=[...table.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)];if(records.length!==total)return null;
    const matches=[];
    for(const [,row] of records){
      const link=row.match(/<h2\b[^>]*>\s*<a\b[^>]*?\bhref=(?:"\/company\/([A-Z0-9]{8})"|'\/company\/([A-Z0-9]{8})'|\/company\/([A-Z0-9]{8})(?=[\s>]))[^>]*>([^<>]{1,400})(?:<span\b[^>]*>\(link opens a new window\)<\/span>)?\s*<\/a>/i);
      if(!link)return null;
      const number=(link[1]||link[2]||link[3]).toUpperCase();
      if(!organisationReferenceLink({sourceId:'uk-company-register',companyNumber:number}))return null;
      if(nameKey(htmlText(link[4]))===nameKey(name))matches.push(number);
    }
    return matches.length===1?matches[0]:null;
  }catch{return null;}
}

export async function lookupOrganisationReference(message,{fetcher=fetch,signal,now=Date.now(),publicCompanyName}={}){
  const text=String(message||'').slice(0,20000);
  const numbers=[...new Set([...text.matchAll(labelledNumber)].map(match=>match[1].toUpperCase()))];
  // Explicit UK register context matters. Other countries re-use number formats.
  const entered=validPublicCompanyName(publicCompanyName)?publicCompanyName.trim():null;
  const ukNumber=numbers.length===1&&ukContext.test(text)?numbers[0]:null;
  const searched=Boolean(entered&&!numbers.length);
  const companyNumber=ukNumber||(searched?await findNumberByName(entered,{fetcher,signal}):null);
  if(companyNumber){
    const entry=await readEntry(companyNumber,{fetcher,signal,now});
    const row={kind:'registration',label:'UK company registration',sourceId:'uk-company-register',companyNumber,status:'unverified'};
    if(!entry)return {...row,detail:'I could not confirm UK company number '+companyNumber+' from Companies House. You can check the register directly.'};
    const claimedName=text.match(legalNameLabel)?.[1]?.trim();
    if(searched&&nameKey(entry.name)!==nameKey(entered))return {kind:'registration',label:'UK company name search',sourceId:'uk-company-register',status:'unverified',detail:'The search result and its company profile did not agree. Check the legal name and company number in the register.'};
    const claimedNames=[entered,claimedName].filter(Boolean);
    const differs=claimedNames.some(n=>nameKey(n)!==nameKey(entry.name));
    const match=Boolean(claimedNames.length&&!differs);
    const finding=differs?' The stated legal name differs from the name on this entry. A trading name may be different.':match?' The stated legal name matches.':'';
    return {...row,status:differs?'different':match?'match':'reference',checkedAt:entry.checkedAt,detail:'Companies House lists '+entry.name+' for '+companyNumber+(entry.status?' ('+entry.status+')':'')+'.'+finding+' Anyone can copy an entry. It does not identify who contacted you or where a payment goes.'};
  }
  if(entered)return {kind:'registration',label:'UK company name search',sourceId:'uk-company-register',status:'unverified',detail:'I could not establish a single matching Companies House entry. Check the legal name and company number independently before relying on this request.'};
  if(finance.test(text))return {kind:'reference_route',label:'Check a UK financial firm',sourceId:'uk-financial-register',status:'unverified',detail:'Look up the firm and its permissions in the FCA register. Use the contact details there to ask whether it sent this specific request. A copied firm name or reference cannot identify the caller.'};
  if(ukContext.test(text)||/\b(?:Ltd|Limited|PLC|LLP)\b[\s.,:;)]/i.test(text+' ')){
    return {kind:'reference_route',label:'Independent company register',sourceId:'uk-company-register',status:'unverified',detail:'If this is a UK registered company, use Companies House to check its legal name and number. The register cannot confirm this sender. Use a contact you already trust to check the specific request.'};
  }
  return null;
}

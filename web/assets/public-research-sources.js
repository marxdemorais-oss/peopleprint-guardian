import {ukOrganisations} from './uk-directory.js';
import {originalPublishers} from './uk-original-publishers.js';
export {originalPublishers};

// For new sources only, allow public editorial sections on exact, listed hosts.
const editorial=/(?:^|\/)(?:scams?|fraud(?:-and-scams)?|fraud-prevention|help(?:-and-support)?|help-centre|support|security(?:-centre)?|contact(?:-us)?|council-tax|parking|benefits|payments?|billing|bills|refunds?|customer-service|advice|paying-your-bill)(?:[-/]|$)/i;
const interactive=/(?:^|[/-])(?:forums?|community|discussion|comments?|uploads?|profile|login|sign-in|my-account|redirect|user-content)(?:[-/]|$)/i;
// Some catalogue entries cite the publisher's own fraud guide as the
// directory evidence. Admit only its exact canonical editorial URL.
function reviewedFraudPage(entry,hosts){
  let url;try{url=new URL(entry.sourceUrl);}catch{return null;}
  if(url.protocol!=='https:'||url.username||url.password||url.port||url.search||url.hash||
     !hosts.includes(url.hostname)||interactive.test(url.pathname)||url.pathname.includes('//')||
     !/^\/[a-zA-Z0-9/_-]+(?:\.(?:html?|page))?\/?$/.test(url.pathname)||
     !/(?:^|[/-])(?:fraud|scams?|phishing)(?:[./-]|$)/i.test(url.pathname))return null;
  return url.href;
}
const hostOwners=new Map();
for(const entry of ukOrganisations)for(const host of entry.hosts){
  const owners=hostOwners.get(host)||new Set();owners.add(entry.id);hostOwners.set(host,owners);
}
export const publishers={...originalPublishers};
export const directoryPublisher=new Map();
for(const entry of ukOrganisations){
  const original=Object.entries(originalPublishers).find(([,p])=>p.name.toLowerCase()===entry.name.toLowerCase()||p.hosts.some(host=>host!=='www.gov.uk'&&entry.hosts.includes(host)));
  if(original){directoryPublisher.set(entry.id,original[0]);continue;}
  if(entry.sharedHost)continue;
  const hosts=entry.hosts.filter(host=>hostOwners.get(host).size===1&&!['www.gov.uk','gov.uk','gov.wales','www.gov.scot','www.nidirect.gov.uk'].includes(host));
  if(!hosts.length)continue;
  publishers[entry.id]={name:entry.name,hosts,path:editorial,directory:true,guideUrl:reviewedFraudPage(entry,hosts),sector:entry.sector};
  directoryPublisher.set(entry.id,entry.id);
}

export {exampleInvoiceReference} from './guided-invoice-source.js';

export function officialResearchUrl(publisher,value){
  if(!Object.hasOwn(publishers,publisher)||typeof value!=='string'||value.length>700)return null;
  let url;
  try{url=new URL(value);}catch{return null;}
  const policy=publishers[publisher];
  if(policy.guideUrl && url.href===policy.guideUrl)return policy.guideUrl;
  if(url.protocol!=='https:'||url.username||url.password||url.port||
     [...url.searchParams.keys()].some(key=>!/^utm_(?:source|medium|campaign|term|content)$/.test(key))||
     !policy.hosts.includes(url.hostname)||(policy.directory&&interactive.test(url.pathname))||!policy.path.test(url.pathname)||
     !/^\/[a-zA-Z0-9/_-]+$/.test(url.pathname)||url.pathname.includes('//'))return null;
  url.search='';url.hash='';
  return url.href;
}

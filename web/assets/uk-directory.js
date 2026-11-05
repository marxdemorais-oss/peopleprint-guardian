import {healthSources} from './uk-health-sources.js';
import {councilSources} from './uk-council-sources.js';
import {supplierSources} from './uk-supplier-sources.js';
import {everydaySources} from './uk-everyday-sources.js';

export const ukOrganisations=[...councilSources,...supplierSources,...everydaySources,...healthSources];
const entries=new Map(ukOrganisations.map(entry=>[entry.id,entry]));
const variants=new Map(), tokenise=text=>text.normalize('NFKC').replace(/[’']/g,'').replace(/&/g,' and ').match(/[\p{L}\p{N}]+/gu)||[];
const ambiguous=new Set(['next','three','sky','shell','o2','ee','bt','tsb','wise','nationwide','first','boots','water','now','box','sse','edf','bt group','talk','coop','co op','union','metro','monzo','virgin','ovo']);
const brandContext=/\b(?:bank(?:ing)?|broadband|bill(?:ing)?|mobile|provider|network|telecom|supplier|energy|gas|tariff|account|customer|order|delivery|store|retail|pharmacy|credit|debit|insurance|council|mortgage)\b/i;
for(const entry of ukOrganisations){
  for(const alias of new Set([entry.name,...entry.aliases])){
    const words=tokenise(alias).map(word=>word.toLowerCase());
    if(!words.length)continue;
    const first=words[0],list=variants.get(first)||[];
    list.push({entry,words,ambiguous:ambiguous.has(words.join(' '))||words.length===1&&first.length<=3});
    variants.set(first,list);
  }
}
for(const list of variants.values())list.sort((a,b)=>b.words.length-a.words.length);
export function matchUkOrganisations(text){
  if(typeof text!=='string')return [];
  const literal=tokenise(text.slice(0,20000)),words=literal.map(word=>word.toLowerCase()),found=new Map();
  for(let i=0;i<words.length;i++){
    let longest=0;
    for(const v of variants.get(words[i])||[]){
      if(v.words.length<longest)break;
      if(!v.words.every((w,j)=>w===words[i+j]))continue;
      if(['next','three','sky','boots','shell','now','first','wise'].includes(words[i])&&v.words.length===1){
        const phrase=words.slice(Math.max(0,i-2),i+4).join(' ');
        const brandUse=new RegExp('(?:\\b(?:from|with|at|impersonating|representing) '+words[i]+'\\b|\\b'+words[i]+' (?:sent|texted|emailed|called|says|asked|customer service|broadband|mobile)\\b)');
        if(!brandUse.test(phrase))continue;
      }
      if(v.ambiguous && !brandContext.test(words.slice(Math.max(0,i-8),i+9).join(' ')))continue;
      longest=v.words.length;found.set(v.entry.id,v.entry);
    }
    if(longest)i+=longest-1;
  }
  return [...found.values()];
}
export function ukDirectorySource(id){
  const entry=entries.get(id);
  if(!entry)return null;
  let homepage;
  try{
    const url=new URL(entry.homepageUrl||'https://'+entry.hosts[0]+'/');
    if(url.protocol==='https:'&&!url.username&&!url.password&&!url.port&&entry.hosts.includes(url.hostname))homepage=url.href;
  }catch{}
  return {name:'Source for '+entry.name,url:entry.sourceUrl,websiteUrl:homepage};
}

import {requestProviderBytes} from './provider-http.js';

const domainName=value=>typeof value==='string'&&value.length<=253&&value.includes('.')&&value.split('.').every(part=>/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(part));
const within=(host,suffix)=>host===suffix||host.endsWith('.'+suffix);
const oauthProfiles=[
 {id:'gmail',label:'Google',domains:['gmail.com','googlemail.com'],mxDomains:['google.com','googlemail.com']},
 {id:'outlook',label:'Microsoft',domains:['outlook.com','hotmail.com','live.com','msn.com','hotmail.co.uk','live.co.uk'],mxDomains:['mail.protection.outlook.com','olc.protection.outlook.com']}
];

export function mailboxAddress(value){
 if(typeof value!=='string'||value.length>320||value!==value.trim())return null;
 const parts=value.split('@');
 if(parts.length!==2||!parts[0]||parts[0].length>64||/[\s<>\x00-\x1f\x7f]/.test(parts[0]))return null;
 const domain=parts[1].toLowerCase();
 return domainName(domain)?{address:parts[0]+'@'+domain,domain}:null;
}

// A discovered DNS name can select an operator-reviewed profile. It can never
// supply a socket destination or receive a mailbox password.
export function reviewedMailboxProviders(serialized){
 try{
  const rows=JSON.parse(serialized);
  if(!Array.isArray(rows)||!rows.length||rows.length>50||new Set(rows.map(r=>r?.id)).size!==rows.length)return [];
  const result=[];
  for(const row of rows){
   if(!row||!/^[a-z][a-z0-9_-]{1,50}$/.test(row.id)||!['imap','pop3'].includes(row.protocol)||typeof row.label!=='string'||!row.label||row.label.length>100||/[\0\r\n]/.test(row.label))return [];
   const profile={id:row.id,protocol:row.protocol,label:row.label,domains:[],mxDomains:[]};
   for(const key of ['domains','mxDomains']){
    if(row[key]===undefined)continue;
    if(!Array.isArray(row[key])||row[key].length>100||!row[key].every(domain=>domainName(domain)&&domain===domain.toLowerCase()))return [];
    profile[key]=[...new Set(row[key])];
   }
   result.push(profile);
  }
  return result;
 }catch{return [];}
}

function oauthReady(env,provider,origin){
 const prefix=provider.toUpperCase();
 try{
  const callback=new URL(env[prefix+'_REDIRECT_URI']);
  return Boolean(env[prefix+'_HIDDEN']!=='true'&&env.DB&&/^[A-Za-z0-9_-]{43}$/.test(env.CONNECTION_ENCRYPTION_KEY||'')&&env[prefix+'_CONNECT_ENABLED']==='true'&&env[prefix+'_CLIENT_ID']&&env[prefix+'_CLIENT_SECRET']&&callback.origin===origin&&callback.protocol==='https:'&&callback.pathname==='/api/connections/'+provider+'/callback'&&!callback.search&&!callback.hash&&!callback.username&&!callback.password);
 }catch{return false;}
}

export async function discoverMailbox(email,env,{origin,mailboxAvailable=false,fetcher=fetch,signal}={}){
 const address=mailboxAddress(email);
 if(!address)throw Object.assign(new Error('Enter a valid email address.'),{status:400});
 const reviewed=reviewedMailboxProviders(env.MAILBOX_REVIEWED_PROVIDERS);
 const profiles=[...oauthProfiles.map(p=>({...p,kind:'oauth'})),...reviewed.map(p=>({...p,kind:'mailbox'}))];
 let matches=profiles.filter(p=>p.domains.includes(address.domain));
 if(!matches.length){
  // Only the domain, never the address, credential or session, leaves Guardian.
  const target=new URL('https://dns.google/resolve');target.searchParams.set('name',address.domain);target.searchParams.set('type','MX');
  try{
   const bytes=await requestProviderBytes(target.href,{headers:{Accept:'application/json'}},{fetcher,signal,timeoutMs:4500,maxBytes:16384,contentType:'application/json'});
   const answer=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
   if(answer.Status===0&&Array.isArray(answer.Answer)&&answer.Answer.length<=50){
    const hosts=answer.Answer.filter(r=>r?.type===15&&typeof r.data==='string'&&/^\d{1,5}\s+\S+$/.test(r.data)).map(r=>r.data.trim().split(/\s+/)[1].replace(/\.$/,'').toLowerCase()).filter(domainName);
    matches=profiles.filter(p=>hosts.some(host=>p.mxDomains.some(suffix=>within(host,suffix))));
   }
  }catch(error){if(signal?.aborted)throw error;/* An unavailable lookup must not guess a destination. */}
 }
 const choices=reviewed.map(({id,label})=>({id,label}));
 if(matches.length!==1)return {kind:'choose',providers:mailboxAvailable?choices:[],message:mailboxAvailable?'Choose your email provider below.':'This email service is not ready to connect yet. You can still upload or paste a selected email.'};
 const profile=matches[0];
 if(profile.kind==='oauth')return oauthReady(env,profile.id,origin)
  ?{kind:'oauth',provider:profile.id,label:profile.label,startPath:'/api/connections/'+profile.id+'/start'}
  :{kind:'unavailable',message:'This email service is not ready to connect yet. You can still upload or paste a selected email.'};
 return mailboxAvailable?{kind:'mailbox',providerId:profile.id,label:profile.label,username:address.address}
  :{kind:'unavailable',message:'This email service is not ready to connect yet. You can still upload or paste a selected email.'};
}

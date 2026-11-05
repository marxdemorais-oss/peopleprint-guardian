// Read only the inbox, only provider previews, and only a fixed interval after consent.
// The browser never supplies a URL, access token, sender, or pagination cursor.
import {getConnectionAccessToken} from './connections.js';
import {requestProviderBytes} from './provider-http.js';
const google='https://gmail.googleapis.com/gmail/v1/users/me/messages';
const microsoft='https://graph.microsoft.com/v1.0/me/mailFolders/inbox/messages';
const cap=4;
function invalid(){throw Error('Invalid provider response');}
function value(x,max){return typeof x==='string'?x.slice(0,max):'';}
function entry(id,date,subject,sender,preview){
 if(typeof id!=='string'||!id||id.length>1024||!Number.isSafeInteger(date)||date<=0)invalid();
 return {id,date,subject:value(subject,180),sender:value(sender,256),preview:value(preview,1200)};
}
export async function readWatchPage(env,watch,{from,to,page,guard,fetcher=fetch}){
 const {provider,owner_id:owner}=watch;
 if(!['gmail','outlook'].includes(provider)||!Number.isSafeInteger(from)||!Number.isSafeInteger(to)||to<=from)invalid();
 await guard();
 const token=await getConnectionAccessToken(env,owner,provider,{fetcher});
 const headers={Authorization:'Bearer '+token};
 async function get(url){
  await guard();const bytes=await requestProviderBytes(url,{headers},{fetcher,timeoutMs:8000,maxBytes:65000});
  return JSON.parse(new TextDecoder().decode(bytes));
 }
 if(provider==='gmail'){
  const url=new URL(google);url.searchParams.set('labelIds','INBOX');url.searchParams.set('q','after:'+Math.floor((from-1000)/1000)+' before:'+Math.ceil(to/1000));
  url.searchParams.set('maxResults','2');url.searchParams.set('fields','messages/id,nextPageToken');
  if(page){if(!/^[\w.-]{1,2048}$/.test(page))invalid();url.searchParams.set('pageToken',page);}
  const result=await get(url.href),ids=result.messages??[];
  if(!Array.isArray(ids)||ids.length>2||result.nextPageToken!=null&&!/^[\w.-]{1,2048}$/.test(result.nextPageToken))invalid();
  const rows=[];
  for(const item of ids){
   if(!/^[a-zA-Z0-9_-]{1,256}$/.test(item?.id||''))invalid();
   const detail=new URL(google+'/'+item.id);
   // Gmail time searches have second granularity. Read no content or addresses until
   // the provider timestamp proves this message is within the consent window.
   detail.searchParams.set('fields','id,internalDate,labelIds');
   const meta=await get(detail.href),stamp=Number(meta.internalDate);
   if(meta.id!==item.id||!Number.isSafeInteger(stamp)||stamp<=0||!Array.isArray(meta.labelIds))invalid();
   if(!meta.labelIds.includes('INBOX')||stamp<from||stamp>=to)continue;
   detail.searchParams.set('format','metadata');detail.searchParams.append('metadataHeaders','Subject');detail.searchParams.append('metadataHeaders','From');
   detail.searchParams.set('fields','id,payload/headers');
   const h=await get(detail.href);if(h.id!==item.id)invalid();
   const header=name=>h.payload?.headers?.find(v=>String(v.name).toLowerCase()===name)?.value;
   detail.search='';detail.searchParams.set('fields','id,internalDate,labelIds,snippet');
   const m=await get(detail.href);if(m.id!==item.id||Number(m.internalDate)!==stamp||!Array.isArray(m.labelIds))invalid();
   if(m.labelIds.includes('INBOX'))rows.push(entry(m.id,stamp,header('subject'),header('from'),m.snippet));
  }
  return {rows:rows.filter(r=>r.date>=from&&r.date<to),next:result.nextPageToken||null};
 }
 const url=new URL(microsoft);
 url.searchParams.set('$filter','receivedDateTime ge '+new Date(from).toISOString()+' and receivedDateTime lt '+new Date(to).toISOString());
 url.searchParams.set('$orderby','receivedDateTime asc');url.searchParams.set('$top',String(cap));
 url.searchParams.set('$select','id,subject,from,receivedDateTime,bodyPreview');
 function verifiedNext(raw){
  if(typeof raw!=='string'||raw.length>4096)invalid();const next=new URL(raw);
  if(next.origin!==url.origin||next.username||next.password||next.hash||next.pathname.toLowerCase()!==url.pathname.toLowerCase())invalid();
  for(const [k,v] of url.searchParams)if(next.searchParams.getAll(k).length!==1||next.searchParams.get(k)!==v)invalid();
  const extras=[...next.searchParams.keys()].filter(k=>!url.searchParams.has(k));
  if(extras.length!==1||!['$skip','$skiptoken'].includes(extras[0])||!next.searchParams.get(extras[0]))invalid();
  return raw;
 }
 const result=await get(page?verifiedNext(page):url.href);
 if(!Array.isArray(result.value)||result.value.length>cap)invalid();
 const rows=result.value.map(m=>entry(m.id,Date.parse(m.receivedDateTime),m.subject,m.from?.emailAddress?.address,m.bodyPreview));
 return {rows:rows.filter(r=>r.date>=from&&r.date<to),next:result['@odata.nextLink']?verifiedNext(result['@odata.nextLink']):null};
}

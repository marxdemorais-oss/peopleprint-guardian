import {connectionSettings,connectionVisible} from './connections.js';
import {resolvePeopleAccess} from './people-auth.js';
import {readWatchPage} from './watch-mail.js';
import {earlierAgreements,findWarning,watchText} from './watch-evidence.js';

const minutes=60_000,day=1440*minutes;
const providers=['gmail','outlook'];
const paid=user=>Boolean(user?.peopleOrganisedId&&user.ownerId==='people:'+user.peopleOrganisedId&&user.guardianAccess?.paidMonitoring===true&&Number.isInteger(user.guardianAccess.monthlyCases)&&user.guardianAccess.monthlyCases>=6&&user.guardianAccess.monthlyCases<=1000);
const ok=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
function enabled(env,provider){return providers.includes(provider)&&env.GUARDIAN_WATCH_ENABLED==='true'&&env['GUARDIAN_WATCH_'+provider.toUpperCase()]==='true'&&Boolean(env.GUARDIAN_IDENTITY_SECRET?.trim()?.length>=32)&&connectionSettings(env,provider,env.GUARDIAN_WATCH_ORIGIN).configured;}
const ownerWatch='w.owner_id=c.owner_id AND w.provider=c.provider AND w.external_id=c.external_id AND w.connection_at=c.connected_at AND c.status=\'connected\'';
async function sourceKey(owner,row){
 const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify([owner,row.provider,row.external_id,row.connected_at])));
 return Array.from(new Uint8Array(bytes),b=>b.toString(16).padStart(2,'0')).join('');
}
async function readState(env,user,now){
 const db=env.DB,owner=user.ownerId;
 if(!paid(user)){
  // An authenticated downgrade/suspension invalidates prior opt-in. Rejoining starts fresh.
  if(user.peopleOrganisedId&&owner==='people:'+user.peopleOrganisedId)await db.prepare('DELETE FROM guardian_watches WHERE owner_id=?').bind(owner).run();
  const requested=Boolean(await db.prepare('SELECT 1 AS requested FROM guardian_live_requests WHERE owner_id=?').bind(owner).first());
  return {eligible:false,requested,sources:[],items:[]};
 }
 const {results:rows}=await db.prepare(`SELECT c.provider,c.external_id,c.connected_at,c.display_label,w.id,w.last_success,w.failed,w.page FROM guardian_connections c LEFT JOIN guardian_watches w ON ${ownerWatch}
 WHERE c.owner_id=? AND c.provider IN ('gmail','outlook','mailbox') AND c.status='connected'`).bind(owner).all();
 const sources=await Promise.all(rows.filter(row=>connectionVisible(env,row.provider)).map(async row=>({provider:row.provider,label:row.display_label,
  supported:enabled(env,row.provider),id:row.id||null,key:await sourceKey(owner,row),
  checkedThrough:row.last_success||null,failed:Boolean(row.failed),catchingUp:Boolean(row.page)})));
 const {results:items}=await db.prepare(`SELECT i.id,i.provider,i.received_at AS receivedAt,i.detected_at AS detectedAt,i.subject,i.sender,i.excerpt,i.reason,i.action,i.earlier_check AS earlierCheck,i.earlier_title AS earlierTitle,i.earlier_detail AS earlierDetail
 FROM guardian_watch_items i JOIN guardian_watches w ON w.id=i.watch_id JOIN guardian_connections c ON ${ownerWatch}
 WHERE i.owner_id=? AND i.dismissed=0 AND i.expires_at>? ORDER BY i.detected_at DESC,i.id LIMIT 12`).bind(owner,now).all();
 return {eligible:true,sources,items};
}
export async function handleWatch(request,env,user,{now=Date.now()}={}){
 const url=new URL(request.url);
 if(url.pathname==='/api/watch/request'&&request.method==='POST'){
  if(!user?.ownerId)return ok({message:'Sign in to request access.'},401);
  if(request.headers.get('origin')!==url.origin||!['same-origin','none',null].includes(request.headers.get('sec-fetch-site')))return ok({message:'Open this action in Guardian.'},403);
  if(paid(user))return ok({eligible:true});
  if(!user.peopleOrganisedId||user.ownerId!=='people:'+user.peopleOrganisedId)return ok({message:'Sign in with your People Organised account to request access.'},403);
  try{await env.DB.prepare('INSERT INTO guardian_live_requests(owner_id,requested_at) VALUES (?,?) ON CONFLICT(owner_id) DO NOTHING').bind(user.ownerId,new Date(now).toISOString()).run();return ok({eligible:false,requested:true});}
  catch{return ok({message:'Your request could not be saved. Try again.'},503);}
 }
 const match=url.pathname.match(/^\/api\/watch(?:\/(sources|items)\/([a-z\d-]{1,64}))?$/);
 if(!match)return null;
 if(!user?.ownerId)return ok({message:'Sign in to manage monitoring.'},401);
 if(!env.DB)return ok({message:'Monitoring is unavailable.'},503);
 const db=env.DB,owner=user.ownerId,[,kind,key]=match;
 try{
  if(!kind&&request.method==='GET')return ok(await readState(env,user,now));
  if(!['POST','DELETE'].includes(request.method)||!kind)return ok({message:'Method not allowed.'},405);
  if(request.headers.get('origin')!==url.origin||!['same-origin','none',null].includes(request.headers.get('sec-fetch-site')))return ok({message:'Open this action in Guardian.'},403);
  if(kind==='items'&&request.method==='DELETE'){
   await db.prepare("UPDATE guardian_watch_items SET dismissed=1,subject='',sender='',excerpt='',reason='',action='',earlier_check=NULL,earlier_evidence=NULL,earlier_title=NULL,earlier_detail=NULL WHERE owner_id=? AND id=?").bind(owner,key).run();
   return ok({removed:true});
  }
  if(kind!=='sources'||!providers.includes(key))return ok({message:'This source cannot be monitored.'},400);
  if(request.method==='DELETE'){
   const id=url.searchParams.get('watch');if(!id||id.length>64)return ok({message:'Reload this mailbox to stop monitoring.'},409);
   await db.prepare('DELETE FROM guardian_watches WHERE id=? AND owner_id=? AND provider=?').bind(id,owner,key).run();
   return ok({stopped:true});
  }
  if(!paid(user))return ok({message:'This account does not have paid monitoring access.'},403);
  if(!enabled(env,key))return ok({message:'Monitoring is unavailable for this source.'},503);
  // Require a deliberate, generation-specific POST, with no request-supplied owner or entitlement.
  if(request.headers.get('x-guardian-watch-consent')!=='new-inbox-previews-v1')return ok({message:'Choose to monitor this mailbox first.'},400);
  const row=await db.prepare("SELECT provider,external_id,connected_at FROM guardian_connections WHERE owner_id=? AND provider=? AND status='connected'").bind(owner,key).first();
  if(!row?.external_id||!row.connected_at||await sourceKey(owner,row)!==url.searchParams.get('source'))return ok({message:'The mailbox changed. Reload before enabling monitoring.'},409);
  const inserted=await db.prepare(`INSERT INTO guardian_watches(id,owner_id,provider,external_id,connection_at,started_at,covered_to,next_due)
   SELECT ?,owner_id,provider,external_id,connected_at,?,?,? FROM guardian_connections WHERE owner_id=? AND provider=? AND status='connected' AND external_id=? AND connected_at=?
   ON CONFLICT(owner_id,provider) DO NOTHING`).bind(crypto.randomUUID(),now,now,now,owner,key,row.external_id,row.connected_at).run();
  if(!inserted.meta?.changes)return ok({message:'Monitoring changed. Reload this mailbox to see its status.'},409);
  return ok({enabled:true},201);
 }catch{return ok({message:'Monitoring could not be loaded. Try again.'},503);}
}

export async function drainWatches(env,{now=Date.now(),access=resolvePeopleAccess,reader=readWatchPage,fetcher=fetch}={}){
 const db=env.DB;if(!db)return;
 await db.prepare('DELETE FROM guardian_watch_items WHERE expires_at<=?').bind(now).run();
 const sources=providers.filter(p=>enabled(env,p));if(!sources.length)return;
 // Reserve one source/page per invocation, oldest due first. Never silently skip a busy inbox.
 const watch=await db.prepare(`SELECT w.* FROM guardian_watches w JOIN guardian_connections c ON ${ownerWatch}
 WHERE w.provider IN (${sources.map(()=>'?').join(',')}) AND w.next_due<=? AND w.lease_until<=? ORDER BY w.next_due,w.id LIMIT 1`).bind(...sources,now,now).first();
 if(!watch)return;
 const lease=crypto.randomUUID(),claimed=await db.prepare('UPDATE guardian_watches SET lease=?,lease_until=? WHERE id=? AND lease_until<=? AND next_due<=?').bind(lease,now+3*minutes,watch.id,now,now).run();
 if(!claimed.meta?.changes)return;
 async function guard(){
  if(!enabled(env,watch.provider)||!await db.prepare(`SELECT 1 AS active FROM guardian_watches w JOIN guardian_connections c ON ${ownerWatch} WHERE w.id=? AND w.lease=?`).bind(watch.id,lease).first())throw Error('Monitoring stopped.');
 }
 async function checkPaid(){
  const current=await access(watch.owner_id,env,{strictBridge:true});
  if(current?.ownerId===watch.owner_id&&paid(current))return;
  await db.prepare('DELETE FROM guardian_watches WHERE id=? AND lease=?').bind(watch.id,lease).run();throw Error('No paid access.');
 }
 try{
  await guard();await checkPaid();
  const from=watch.covered_to,to=watch.window_end||Math.min(now-60_000,from+day);
  if(to<=from){await db.prepare('UPDATE guardian_watches SET lease=NULL,lease_until=0,next_due=? WHERE id=? AND lease=?').bind(now+minutes,watch.id,lease).run();return;}
  const {rows,next}=await reader(env,watch,{from,to,page:watch.page,guard:async()=>{await checkPaid();await guard();},fetcher});
  await guard();await checkPaid();
  const history=rows.length?await earlierAgreements(db,watch.owner_id,now):[],writes=[];
  for(const row of rows){
   if(row.date<from||row.date>=to)continue;
   const warning=findWarning(row,history);if(!warning)continue;
   const prior=warning.prior;
   const expiry=Math.min(now+7*day,prior?.expires?Date.parse(prior.expires):Infinity);
   writes.push(db.prepare(`INSERT OR IGNORE INTO guardian_watch_items(id,watch_id,owner_id,provider,message_id,received_at,detected_at,expires_at,subject,sender,excerpt,reason,action,earlier_check,earlier_evidence,earlier_title,earlier_detail)
    SELECT ?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,? WHERE EXISTS (SELECT 1 FROM guardian_watches w JOIN guardian_connections c ON ${ownerWatch} WHERE w.id=? AND w.lease=?)
    AND (? IS NULL OR EXISTS (SELECT 1 FROM guardian_checks WHERE owner_id=? AND id=? AND revision=? AND (expires_at='' OR expires_at>?)))`).bind(
    crypto.randomUUID(),watch.id,watch.owner_id,watch.provider,row.id,row.date,now,expiry,watchText(row.subject),watchText(row.sender),warning.excerpt,warning.reason,warning.action,prior?.id||null,prior?.evidenceId||null,prior?.title||null,prior?.detail||null,watch.id,lease,prior?.id||null,watch.owner_id,prior?.id||null,prior?.revision??-1,new Date(now).toISOString()));
  }
  writes.push(db.prepare('UPDATE guardian_watches SET covered_to=?,last_success=?,window_end=?,page=?,lease=NULL,lease_until=0,failed=0,next_due=? WHERE id=? AND lease=?').bind(next?from:to,next?watch.last_success:to,next?to:null,next||null,now+(next||to<now-60_000?minutes:10*minutes),watch.id,lease));
  await db.batch(writes);
 }catch{
  await db.prepare('UPDATE guardian_watches SET failed=1,next_due=?,lease=NULL,lease_until=0 WHERE id=? AND lease=?').bind(now+5*minutes,watch.id,lease).run();
 }
}

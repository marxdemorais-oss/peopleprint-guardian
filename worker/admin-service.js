import {staffDirectory} from './admin-uk-directory.js';
// Narrow server-to-server read interface. The private operator UI and its
// authentication remain in the separate People Organised repository.
import {manageGuide} from './wolfgang-guide.js';
import {userAllowance,updateUserAllowance} from './user-allowance.js';
import {readGuestSettings,updateGuestSettings} from './guest-settings.js';
import {publicAnalysisSettings} from './model-provider.js';
import {accountUsedSql,calendarMonth,getTrialState,MONTHLY_CHECKS} from './trial-service.js';
import {readContextRelationships} from './context-memory.js';
import {readMessageActivity} from './message-activity.js';
import {serviceReadiness} from './service-readiness.js';

const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'};
const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
const validId=value=>typeof value==='string'&&/^[a-zA-Z0-9_-]{1,160}$/.test(value);

async function authorised(request,env){
  const expected=env.GUARDIAN_ADMIN_TOKEN;
  if(typeof expected!=='string'||expected.length<32)return false;
  const supplied=request.headers.get('authorization')||'';
  if(supplied.length>1024||!supplied.startsWith('Bearer '))return false;
  const hash=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)));
  const [left,right]=await Promise.all([hash(expected),hash(supplied.slice(7))]);
  let difference=0;for(let index=0;index<left.length;index++)difference|=left[index]^right[index];
  return difference===0&&validId(request.headers.get('x-guardian-operator'));
}

function cursor(value){
  if(!value)return null;
  if(value.length>1000)throw fail('Invalid page cursor.');
  try{const decoded=JSON.parse(atob(value));if(typeof decoded.ownerId!=='string'||!/^([a-zA-Z0-9_-]+|people:[a-zA-Z0-9_-]+)$/.test(decoded.ownerId)||decoded.ownerId.length>200||typeof decoded.createdAt!=='string'||!/^\d{4}-\d{2}-\d{2}T/.test(decoded.createdAt)||!Number.isFinite(Date.parse(decoded.createdAt)))throw Error();return decoded;}catch{throw fail('Invalid page cursor.');}
}
function profile(row){
  return {id:row.id,peopleOrganisedId:row.owner_id.startsWith('people:')?row.owner_id.slice(7):null,email:row.email,displayName:row.display_name,onboardingComplete:Boolean(row.onboarding_complete),profileComplete:Boolean(row.profile_completed_at),memoryEnabled:Boolean(row.memory_enabled),createdAt:row.created_at,updatedAt:row.updated_at};
}
function summary(row,month){
 const used=Number(row.used||0),overridden=row.free_check_allowance!=null,monthly=!overridden&&Boolean(row.profile_completed_at);
 const allowance=row.free_check_allowance??(monthly?MONTHLY_CHECKS:1);
 return {...profile(row),liveChecksRequestedAt:row.live_checks_requested_at||null,checks:Number(row.checks||0),completed:Number(row.completed||0),failed:Number(row.failed||0),waiting:Number(row.waiting||0),lastCheckAt:row.last_check_at||null,connectedAccounts:Number(row.connected_accounts||0),verifiedChannels:Number(row.verified_channels||0),used,allowance,remaining:Math.max(0,allowance-used),allowanceOverridden:overridden,period:monthly?'calendar_month':'lifetime',resetsAt:monthly?month.end:null};
}
const summaryColumns=`p.*,
 (SELECT requested_at FROM guardian_live_requests l WHERE l.owner_id=p.owner_id) AS live_checks_requested_at,
 (SELECT COUNT(*) FROM guardian_checks c WHERE c.owner_id=p.owner_id AND (length(c.expires_at)=0 OR c.expires_at>?)) AS checks,
 (SELECT COUNT(*) FROM guardian_checks c WHERE c.owner_id=p.owner_id AND (length(c.expires_at)=0 OR c.expires_at>?) AND c.status='complete') AS completed,
 (SELECT COUNT(*) FROM guardian_checks c WHERE c.owner_id=p.owner_id AND (length(c.expires_at)=0 OR c.expires_at>?) AND c.status='error') AS failed,
 (SELECT COUNT(*) FROM guardian_checks c WHERE c.owner_id=p.owner_id AND (length(c.expires_at)=0 OR c.expires_at>?) AND c.status='awaiting_connection') AS waiting,
 (SELECT MAX(c.updated_at) FROM guardian_checks c WHERE c.owner_id=p.owner_id AND (length(c.expires_at)=0 OR c.expires_at>?)) AS last_check_at,
 (SELECT COUNT(*) FROM guardian_connections c WHERE c.owner_id=p.owner_id AND c.status='connected') AS connected_accounts,
 (SELECT COUNT(*) FROM guardian_channel_identities c WHERE c.owner_id=p.owner_id) AS verified_channels,
 ${accountUsedSql} AS used`;

export async function handleAdminRequest(request,env){
  const url=new URL(request.url);
  if(!url.pathname.startsWith('/api/internal/admin/'))return null;
  if(!await authorised(request,env))return reply({error:'Not authorised.'},403);
  if(url.pathname==='/api/internal/admin/wolfgang-guide'){
    try{return reply(await manageGuide(request,env.DB,request.headers.get('x-guardian-operator')));}
    catch(error){return reply({error:error.status?error.message:'Instructions unavailable.'},error.status||503);}
  }
  if(url.pathname==='/api/internal/admin/user-allowance'){
    if(!env.DB)return reply({error:'Guardian storage is unavailable.'},503);
    const id=url.searchParams.get('id');
    if(!validId(id)||url.searchParams.getAll('id').length!==1||[...url.searchParams.keys()].some(key=>key!=='id'))return reply({error:'Choose one customer.'},400);
    try{if(request.method==='GET')return reply(await userAllowance(env.DB,id));
      if(request.method==='PUT')return reply(await updateUserAllowance(request,env.DB,id,request.headers.get('x-guardian-operator')));
      return reply({error:'Method not allowed.'},405);
    }catch(error){return reply({error:error.status?error.message:'Customer allowance unavailable.'},error.status||503);}
  }
  if(url.pathname==='/api/internal/admin/guest-settings'){
    if(!env.DB)return reply({error:'Guardian storage is unavailable.'},503);
    try{if(request.method==='GET')return reply(await readGuestSettings(env.DB));
      if(request.method==='PUT'){const result=await updateGuestSettings(request,env.DB,request.headers.get('x-guardian-operator'));return reply(await result.json(),result.status);}
      return reply({error:'Method not allowed.'},405);
    }catch{return reply({error:'Guest allowance is unavailable.'},503);}
  }
  if(request.method!=='GET')return reply({error:'Read-only endpoint.'},405);
  if(url.pathname==='/api/internal/admin/readiness')return reply(serviceReadiness(env,url.origin));
  if(!env.DB)return reply({error:'Guardian storage is unavailable.'},503);
  try{
    if(url.pathname==='/api/internal/admin/uk-directory')return reply(await staffDirectory(env.DB,url.searchParams));
    const db=env.DB,now=new Date().toISOString(),month=calendarMonth(now);
    if(url.pathname==='/api/internal/admin/messages')return reply(await readMessageActivity(db,url.searchParams));
    if(url.pathname==='/api/internal/admin/customers'){
      const email=(url.searchParams.get('email')||'').trim().toLowerCase();
      if(email&&(email.length>254||!/^\S+@\S+\.\S+$/.test(email)))throw fail('Enter a complete email address.');
      const page=cursor(url.searchParams.get('cursor'));
      let where='',args=[now,now,now,now,now,month.start,month.end];
      if(email){where='WHERE p.email=?';args.push(email);}
      else if(page){where='WHERE (p.created_at<? OR (p.created_at=? AND p.owner_id<?))';args.push(page.createdAt,page.createdAt,page.ownerId);}
      // At most 41 indexed customers, each with at most the product's 500 active
      // checks. There is deliberately no full-customer COUNT on an interactive read.
      const rows=(await db.prepare(`SELECT ${summaryColumns} FROM guardian_profiles p ${where} ORDER BY p.created_at DESC,p.owner_id DESC LIMIT 41`).bind(...args).all()).results;
      const selected=rows.slice(0,40),last=selected.at(-1);
      return reply({customers:selected.map(row=>summary(row,month)),next:rows.length>40?btoa(JSON.stringify({createdAt:last.created_at,ownerId:last.owner_id})):null,asOf:now,analysis:publicAnalysisSettings(env),cost:{measured:false,value:null,currency:null},scope:'Current page; check counts exclude expired records.'});
    }
    if(url.pathname==='/api/internal/admin/customer'){
      const id=url.searchParams.get('id');if(!validId(id))throw fail('Choose a customer.');
      const row=await db.prepare(`SELECT ${summaryColumns} FROM guardian_profiles p WHERE p.id=?`).bind(now,now,now,now,now,month.start,month.end,id).first();
      if(!row)return reply({error:'Customer not found.'},404);
      const ownerId=row.owner_id;
      const [connections,channels,checks,trial,relationships,usageRow]=await Promise.all([
        db.prepare('SELECT provider,status,display_label AS displayLabel,connected_at AS connectedAt,updated_at AS updatedAt FROM guardian_connections WHERE owner_id=? ORDER BY provider LIMIT 20').bind(ownerId).all(),
        db.prepare('SELECT channel,verified_at AS verifiedAt FROM guardian_channel_identities WHERE owner_id=? ORDER BY channel LIMIT 20').bind(ownerId).all(),
        db.prepare('SELECT id,channel,status,remember,created_at AS createdAt,updated_at AS updatedAt,CASE WHEN length(expires_at)=0 THEN NULL ELSE expires_at END AS expiresAt FROM guardian_checks WHERE owner_id=? AND (length(expires_at)=0 OR expires_at>?) ORDER BY updated_at DESC LIMIT 20').bind(ownerId,now).all(),
        getTrialState(db,ownerId,Date.parse(now)),readContextRelationships(db,ownerId,{limit:40,includeExcerpts:true}),
        db.prepare("SELECT COUNT(*) AS attempts,COALESCE(SUM(CASE WHEN outcome IN ('complete','scope_decided') THEN 1 ELSE 0 END),0) AS successful,COALESCE(SUM(CASE WHEN outcome NOT IN ('complete','scope_decided') THEN 1 ELSE 0 END),0) AS failed,COALESCE(SUM(input_tokens),0) AS inputTokens,COALESCE(SUM(output_tokens),0) AS outputTokens,COALESCE(SUM(CASE WHEN input_tokens IS NULL OR output_tokens IS NULL THEN 1 ELSE 0 END),0) AS unmeasured FROM (SELECT outcome,input_tokens,output_tokens FROM guardian_analysis_usage WHERE owner_id=? ORDER BY created_at DESC LIMIT 1000)").bind(ownerId).first()
      ]);
      return reply({customer:summary(row,month),connections:connections.results,channels:channels.results,checks:checks.results,trial,relationships:relationships.map(item=>({...item,excerpt:item.excerpt?.slice(0,1600)})),usage:usageRow,cost:{measured:false,value:null,currency:null},limits:{checks:20,relationships:40,usage:1000},asOf:now});
    }
    return reply({error:'Unknown endpoint.'},404);
  }catch(error){return reply({error:error.status?error.message:'Guardian records could not be read.'},error.status||503);}
}

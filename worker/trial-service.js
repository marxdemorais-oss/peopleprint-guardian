import {GUEST_LIMIT_SQL} from './guest-settings.js';
// The allowance is a durable per-person ledger, independent of check deletion.
// A temporary reservation prevents two Worker isolates spending the final check.
const trialError=(message,status,code)=>Object.assign(new Error(message),{message,status,code});
// Entitlements are supplied by the private canonical identity service, never a request body.
export function hasUnlimitedGuardianAccess(identity,env={}){
  return typeof identity?.peopleOrganisedId==='string'&&identity.ownerId==='people:'+identity.peopleOrganisedId&&(identity.guardianAccess?.unlimited===true||env.GUARDIAN_JURY_MODE==='true');
}
export const MONTHLY_CHECKS=5;
const validPaidMonthly=value=>Number.isInteger(value)&&value>MONTHLY_CHECKS&&value<=1000;
export function canonicalPaidMonthly(identity){
  const access=identity?.guardianAccess;
  return typeof identity?.peopleOrganisedId==='string'&&identity.ownerId==='people:'+identity.peopleOrganisedId&&access?.paidMonitoring===true&&validPaidMonthly(access.monthlyCases)?access.monthlyCases:null;
}
export function calendarMonth(now){
  const at=new Date(now),year=at.getUTCFullYear(),month=at.getUTCMonth();
  return {start:new Date(Date.UTC(year,month,1)).toISOString(),end:new Date(Date.UTC(year,month+1,1)).toISOString()};
}

// Completed default profiles and canonical paid quotas renew. The starter and explicit
// operator totals are lifetime grants. Always retain the original consumption
// timestamp so a follow-up in a later month cannot move the charge.
const monthlyPolicy='p.free_check_allowance IS NULL AND p.profile_completed_at IS NOT NULL';
const lifetimeUsed='(SELECT COUNT(*) FROM guardian_trial_usage t WHERE t.owner_id=p.owner_id AND t.consumed_at IS NOT NULL)';
const usedUnder=monthly=>`CASE WHEN ${monthly} THEN
  (SELECT COUNT(*) FROM guardian_trial_usage t WHERE t.owner_id=p.owner_id AND t.consumed_at>=? AND t.consumed_at<?)
  ELSE ${lifetimeUsed} END`;
export const accountUsedSql=usedUnder(monthlyPolicy);
function balanceQuery(ownerId,now,{unlimited=false,guest=false,paidMonthly=null}){
  const {start,end}=calendarMonth(now);
  const useAccountPolicy=!guest&&!unlimited;
  const sql=`WITH subject AS (SELECT ? AS owner_id), p AS (
    SELECT subject.owner_id,profile_completed_at,free_check_allowance,? AS paid_monthly FROM subject
    LEFT JOIN guardian_profiles stored ON stored.owner_id=subject.owner_id
  ), balance AS (SELECT p.*,
    ${guest?GUEST_LIMIT_SQL:`COALESCE(p.free_check_allowance,p.paid_monthly,CASE WHEN p.profile_completed_at IS NULL THEN 1 ELSE ${MONTHLY_CHECKS} END)`} AS allowance,
    ${useAccountPolicy?usedUnder('p.free_check_allowance IS NULL AND (p.paid_monthly IS NOT NULL OR p.profile_completed_at IS NOT NULL)'):lifetimeUsed} AS used,
    (SELECT COUNT(*) FROM guardian_trial_usage t WHERE t.owner_id=p.owner_id AND t.consumed_at IS NULL AND t.reserved_until>?) AS reserved
    FROM p)`;
  return {sql,args:[ownerId,useAccountPolicy&&validPaidMonthly(paidMonthly)?paidMonthly:null,...(useAccountPolicy?[start,end]:[]),now],end};
}
export async function getTrialState(db,ownerId,now=Date.now(),{unlimited=false,guest=false,paidMonthly=null}={}){
  const {sql,args,end}=balanceQuery(ownerId,now,{unlimited,guest,paidMonthly});
  const row=await db.prepare(sql+' SELECT * FROM balance').bind(...args).first();
  const profileComplete=Boolean(row.profile_completed_at),overridden=!guest&&Number.isInteger(row.free_check_allowance);
  const allowance=Number(row.allowance),used=Number(row.used),reserved=Number(row.reserved);
  const paid=!guest&&!overridden&&validPaidMonthly(row.paid_monthly),monthly=!guest&&!overridden&&(profileComplete||paid);
  const source=unlimited?'unlimited':guest?'guest':overridden?'operator':paid?'paid':profileComplete?'profile':'starter';
  return {unlimited,source,period:unlimited?'unlimited':monthly?'calendar_month':'lifetime',resetsAt:monthly&&!unlimited?end:null,
    allowance:unlimited?null:allowance,used,reserved,remaining:unlimited?null:Math.max(0,allowance-used),
    profileComplete,allowanceOverridden:overridden,canUnlockProfile:source==='starter',
    upgradeRequired:!unlimited&&!guest&&overridden&&used>=allowance};
}
export async function reserveTrialCheck(db,ownerId,checkId,now=Date.now(),{unlimited=false,guest=false,paidMonthly=null,research=false}={}){
  const token=crypto.randomUUID(),{sql,args}=balanceQuery(ownerId,now,{unlimited,guest,paidMonthly});
  // Count every live, uncharged reservation, including one spanning midnight
  // UTC. A completed result is charged to the month in which it is persisted.
  // Reading the policy and claiming the last slot are one SQLite statement.
  const reserved=await db.prepare(sql+` INSERT INTO guardian_trial_usage(owner_id,check_id,consumed_at,reservation_token,reserved_until)
    SELECT owner_id,?,NULL,?,? FROM balance WHERE ?=1 OR used+reserved<allowance OR
      EXISTS(SELECT 1 FROM guardian_trial_usage t WHERE t.owner_id=balance.owner_id AND t.check_id=? AND t.consumed_at IS NOT NULL)
    ON CONFLICT(owner_id,check_id) DO UPDATE SET reservation_token=excluded.reservation_token,reserved_until=excluded.reserved_until
    WHERE guardian_trial_usage.reserved_until<=?`).bind(...args,checkId,token,now+(research?120000:60000),Number(unlimited===true),checkId,now).run();
  if(reserved.meta?.changes)return token;
  const active=await db.prepare('SELECT reserved_until FROM guardian_trial_usage WHERE owner_id=? AND check_id=?').bind(ownerId,checkId).first();
  if(active?.reserved_until>now)throw trialError('Wolfgang is already checking this case. Please wait for the result.',409,'CHECK_IN_PROGRESS');
  const state=await getTrialState(db,ownerId,now,{guest,unlimited,paidMonthly});
  if(state.reserved&&state.remaining>0)throw trialError('Your remaining checks are in progress. Try again when they finish.',409,'CHECK_IN_PROGRESS');
  if(guest)throw trialError('Please register a free Guardian account for further new checks.',402,'GUEST_REGISTRATION_REQUIRED');
  if(state.allowanceOverridden)throw trialError('You have used your current allowance. You can still follow up on a completed check.',402,'TRIAL_EXHAUSTED');
  if(state.period==='calendar_month')throw trialError('You have used all '+state.allowance+' checks for this month. Your allowance renews on '+state.resetsAt.slice(0,10)+' at 00:00 UTC. Follow-ups on completed checks are still available.',402,'TRIAL_EXHAUSTED');
  throw trialError('You have used your starter check. Complete your profile for five free checks per calendar month. A starter used this month counts towards the five.',402,'PROFILE_REQUIRED');
}
export function trialCommitStatement(db,ownerId,checkId,token,{consume,now,revision}){
  // Paired with the CAS check write in a transaction. The revised check must
  // exist and contain the successful result before any credit is consumed.
  return db.prepare(`UPDATE guardian_trial_usage SET consumed_at=CASE WHEN ? THEN COALESCE(consumed_at,?) ELSE consumed_at END,reservation_token=NULL,reserved_until=0
    WHERE owner_id=? AND check_id=? AND reservation_token=? AND reserved_until>?
    AND EXISTS(SELECT 1 FROM guardian_checks WHERE owner_id=? AND id=? AND revision=? AND assessment_token=? AND status='complete')`)
    .bind(Number(consume),now,ownerId,checkId,token,Date.parse(now),ownerId,checkId,revision,token);
}
export async function releaseTrialCheck(db,ownerId,checkId,token){
  if(token)await db.prepare('UPDATE guardian_trial_usage SET reservation_token=NULL,reserved_until=0 WHERE owner_id=? AND check_id=? AND reservation_token=?').bind(ownerId,checkId,token).run();
}
export async function checkWasCharged(db,ownerId,checkId){
  return Boolean(await db.prepare('SELECT consumed_at FROM guardian_trial_usage WHERE owner_id=? AND check_id=? AND consumed_at IS NOT NULL').bind(ownerId,checkId).first());
}

// The hosting identity and the identity returned by fresh People email-code
// verification are independent proofs. Neither owner is taken from the form.
const emailKey=value=>String(value||'').trim().toLowerCase();
export function previousLogin(request){
 const owner=request.headers.get('oai-authenticated-user-id'),email=emailKey(request.headers.get('oai-authenticated-user-email'));
 return owner&&owner.length<=200&&!owner.includes(':')&&email?{owner,email}:null;
}
export async function retiredLogin(db,owner){
 return db&&await db.prepare('SELECT 1 AS retired FROM guardian_merged_logins WHERE legacy_owner=?').bind(owner).first();
}
export async function mergeCandidate(request,db,identity){
 const old=previousLogin(request);
 if(!identity?.ownerId||!old||old.email!==emailKey(identity.email)||!db)return null;
 const row=await db.prepare('SELECT id FROM guardian_profiles WHERE owner_id=? AND lower(trim(email))=?').bind(old.owner,old.email).first();
 return row?{email:old.email}:null;
}
export class MergeConflict extends Error {}
const destinationOwnedTables=['checks','context_records','context_links','analysis_usage','trial_usage','ingress_events','message_jobs','transport_tests','xchat_deliveries'];
export async function mergeVerifiedLogins(request,db,user){
 const old=previousLogin(request);
 if(!db||!user?.peopleOrganisedId||user.ownerId!=='people:'+user.peopleOrganisedId||!old||old.email!==emailKey(user.email))throw new MergeConflict('Open Guardian in the browser where you used the earlier account and verify the same email address.');
 const already=await db.prepare('SELECT people_owner FROM guardian_merged_logins WHERE legacy_owner=?').bind(old.owner).first();
 if(already?.people_owner===user.ownerId)return;
 const stamp=new Date().toISOString(),now=Date.now();
 // Insert the audit/tombstone row only if both verified subjects still match.
 // D1 runs the eligibility check and every transfer in a single transaction.
 const gate="EXISTS(SELECT 1 FROM guardian_merged_logins WHERE legacy_owner=? AND people_owner=? AND merged_at=?)";
 const guarded=(sql,...args)=>db.prepare(sql+' AND '+gate).bind(...args,old.owner,user.ownerId,stamp);
 const source='SELECT * FROM guardian_profiles WHERE owner_id=?';
 // Existing personal rate-limit windows carry their counters into the surviving account.
 const ownerHash=async owner=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(owner))),n=>n.toString(16).padStart(2,'0')).join('');
 const [oldHash,newHash]=await Promise.all([ownerHash(old.owner),ownerHash(user.ownerId)]);
 const budgetPrefixes=[[old.owner+':',user.ownerId+':'],['x-code:'+old.owner+':','x-code:'+user.ownerId+':'],['contact:link:'+old.owner+':','contact:link:'+user.ownerId+':'],['mailbox-connect:'+oldHash+':','mailbox-connect:'+newHash+':'],['mailbox-discovery:'+oldHash+':','mailbox-discovery:'+newHash+':']];
 const writes=[db.prepare(`INSERT INTO guardian_merged_logins(legacy_owner,people_owner,merged_at)
  SELECT owner_id,?,? FROM guardian_profiles WHERE owner_id=? AND lower(trim(email))=?
  AND NOT EXISTS (SELECT 1 FROM guardian_connection_tokens WHERE owner_id=?)
  AND NOT EXISTS (SELECT 1 FROM guardian_connections WHERE owner_id=? AND status NOT IN ('stopped','disconnected'))
  AND NOT EXISTS (SELECT 1 FROM guardian_channel_identities WHERE owner_id=?)
  AND NOT EXISTS (SELECT 1 FROM guardian_oauth_states WHERE owner_id=? AND expires_at>?)
  AND NOT EXISTS (SELECT 1 FROM guardian_contact_links WHERE owner_id=? AND expires_at>?)
  AND NOT EXISTS (SELECT 1 FROM guardian_message_jobs WHERE owner_id=? AND state IN ('queued','processing','waiting_link','reply_pending','sending'))
  AND NOT EXISTS (SELECT 1 FROM guardian_trial_usage WHERE owner_id=? AND reserved_until>?)
  ON CONFLICT(legacy_owner) DO NOTHING`).bind(user.ownerId,stamp,old.owner,old.email,old.owner,old.owner,old.owner,old.owner,now,old.owner,now,old.owner,old.owner,now),
 // A new canonical profile inherits the old profile. On a collision retain
 // canonical preferences and name, carry a completed profile and a single
 // explicit allowance. A canonical admin override always takes precedence.
 db.prepare(`INSERT INTO guardian_profiles(owner_id,id,email,display_name,onboarding_complete,memory_enabled,created_at,updated_at,profile_completed_at,connections_intro_at,conversation_style,free_check_allowance,allowance_updated_at,allowance_updated_by,allowance_revision)
 SELECT ?,?,email,display_name,onboarding_complete,memory_enabled,created_at,?,profile_completed_at,connections_intro_at,conversation_style,free_check_allowance,allowance_updated_at,allowance_updated_by,allowance_revision FROM (${source}) WHERE ${gate}
 ON CONFLICT(owner_id) DO UPDATE SET
 display_name=coalesce(nullif(guardian_profiles.display_name,''),excluded.display_name),
 profile_completed_at=coalesce(guardian_profiles.profile_completed_at,excluded.profile_completed_at),
 onboarding_complete=max(guardian_profiles.onboarding_complete,excluded.onboarding_complete),
 free_check_allowance=coalesce(guardian_profiles.free_check_allowance,excluded.free_check_allowance),
 allowance_updated_at=CASE WHEN guardian_profiles.free_check_allowance IS NULL AND excluded.free_check_allowance IS NOT NULL THEN excluded.allowance_updated_at ELSE guardian_profiles.allowance_updated_at END,
 allowance_updated_by=CASE WHEN guardian_profiles.free_check_allowance IS NULL AND excluded.free_check_allowance IS NOT NULL THEN excluded.allowance_updated_by ELSE guardian_profiles.allowance_updated_by END,
 allowance_revision=guardian_profiles.allowance_revision+1,updated_at=excluded.updated_at`).bind(user.ownerId,'gp_'+crypto.randomUUID(),stamp,old.owner,old.owner,user.ownerId,stamp),
 ...budgetPrefixes.map(([from,to])=>db.prepare(`INSERT INTO guardian_rate_limits(bucket_key,owner_id,count,expires_at)
 SELECT ?||substr(bucket_key,length(?)+1),?,count,expires_at FROM guardian_rate_limits
 WHERE owner_id=? AND instr(bucket_key,?)=1 AND expires_at>? AND ${gate}
 ON CONFLICT(bucket_key) DO UPDATE SET count=guardian_rate_limits.count+excluded.count, expires_at=max(guardian_rate_limits.expires_at,excluded.expires_at)`).bind(to,from,user.ownerId,old.owner,from,now,old.owner,user.ownerId,stamp)),
 ...destinationOwnedTables.map(table=>guarded('UPDATE guardian_'+table+' SET owner_id=? WHERE owner_id=?',user.ownerId,old.owner)),
 db.prepare(`INSERT INTO guardian_channel_preferences(owner_id,channel,stopped_at) SELECT ?,channel,stopped_at FROM guardian_channel_preferences WHERE owner_id=? AND ${gate}
 ON CONFLICT(owner_id,channel) DO UPDATE SET stopped_at=max(guardian_channel_preferences.stopped_at,excluded.stopped_at)`).bind(user.ownerId,old.owner,old.owner,user.ownerId,stamp),
 db.prepare(`INSERT INTO guardian_live_requests(owner_id,requested_at) SELECT ?,requested_at FROM guardian_live_requests WHERE owner_id=? AND ${gate} ON CONFLICT(owner_id) DO NOTHING`).bind(user.ownerId,old.owner,old.owner,user.ownerId,stamp),
 ...['rate_limits','channel_preferences','live_requests','connections','contact_links','oauth_states','profiles'].map(table=>guarded('DELETE FROM guardian_'+table+' WHERE owner_id=?',old.owner))];
 const results=await db.batch(writes);
 if(!results[0]?.meta?.changes){
  if((await db.prepare('SELECT people_owner FROM guardian_merged_logins WHERE legacy_owner=?').bind(old.owner).first())?.people_owner===user.ownerId)return;
  throw new MergeConflict('The accounts could not be linked. In your earlier Guardian account, finish any current check or connection and disconnect any linked accounts or contact channels before trying again.');
 }
}

// Shared Community API quota. No URL, API key or customer identity is stored.
// D1 batch() runs these two statements in one transaction across Worker isolates.
const DAY=86400000,WINDOW=68000,DAY_END_GUARD=8000;
const OWNER='service:virustotal-community';
const PREFIX='virustotal-community:request:';
const AFTER_PREFIX='virustotal-community:request;';
const unavailable=()=>({allowed:false,reason:'unavailable'});

export async function reserveVirusTotalCommunityUsage(env,{now=Date.now(),id=crypto.randomUUID()}={}){
 if(!env?.DB?.prepare||!env.DB.batch||!Number.isSafeInteger(now)||now<0||now>8640000000000000-DAY||typeof id!=='string'||!/^[-A-Za-z0-9_]{1,128}$/.test(id))return unavailable();
 try{
  const day=Math.floor(now/DAY),daily='virustotal-community:day:'+day;
  // Leave room for the caller's maximum 5-second preflight, the adapter's
  // 1.8-second HTTP deadline and padding before the UTC allowance changes.
  if(now>=(day+1)*DAY-DAY_END_GUARD)return {allowed:false,reason:'limit'};
  const dailyExpiry=(day+1)*DAY+WINDOW,reservation=PREFIX+id,leaseExpiry=now+WINDOW;
  const insert=env.DB.prepare(`INSERT INTO guardian_rate_limits(bucket_key,owner_id,count,expires_at)
   SELECT ?,?,1,? WHERE
    NOT EXISTS(SELECT 1 FROM guardian_rate_limits WHERE bucket_key=?)
    AND (SELECT COUNT(*) FROM guardian_rate_limits WHERE bucket_key>=? AND bucket_key<? AND expires_at>?)<4
    AND COALESCE((SELECT CASE WHEN owner_id=? AND typeof(count)='integer' AND count>=0 AND count<500 AND expires_at=? THEN 1 ELSE 0 END
      FROM guardian_rate_limits WHERE bucket_key=?),1)=1
   RETURNING bucket_key,count`).bind(reservation,OWNER,leaseExpiry,reservation,PREFIX,AFTER_PREFIX,now,OWNER,dailyExpiry,daily);
  // changes() belongs to the preceding insertion in this same D1 transaction.
  // A denied or repeated reservation therefore cannot increment the daily row.
  const charge=env.DB.prepare(`INSERT INTO guardian_rate_limits(bucket_key,owner_id,count,expires_at)
   SELECT ?,?,1,? WHERE changes()=1 AND EXISTS
    (SELECT 1 FROM guardian_rate_limits WHERE bucket_key=? AND owner_id=? AND expires_at=?)
   ON CONFLICT(bucket_key) DO UPDATE SET count=guardian_rate_limits.count+1
    WHERE guardian_rate_limits.owner_id=excluded.owner_id AND typeof(guardian_rate_limits.count)='integer'
     AND guardian_rate_limits.count>=0 AND guardian_rate_limits.count<500 AND guardian_rate_limits.expires_at=excluded.expires_at
   RETURNING bucket_key,count`).bind(daily,OWNER,dailyExpiry,reservation,OWNER,leaseExpiry);
  const result=await env.DB.batch([insert,charge]);
  if(!Array.isArray(result)||result.length!==2||result.some(r=>r?.success===false||!Array.isArray(r?.results)))return unavailable();
  const [leaseRows,dayRows]=result.map(r=>r.results);
  if(!leaseRows.length&&!dayRows.length)return {allowed:false,reason:'limit'};
  if(leaseRows.length!==1||dayRows.length!==1||leaseRows[0].bucket_key!==reservation||leaseRows[0].count!==1||dayRows[0].bucket_key!==daily||!Number.isSafeInteger(dayRows[0].count)||dayRows[0].count<1||dayRows[0].count>500)return unavailable();
  // Callers must refuse dispatch more than 5 seconds after this timestamp.
  // The 68-second window covers preflight, HTTP transport and padding around
  // the upstream rolling 60-second limit.
  return {allowed:true,reservedAt:now};
 }catch{return unavailable();}
}

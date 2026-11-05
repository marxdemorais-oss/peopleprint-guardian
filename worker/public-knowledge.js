import {officialResearchUrl} from '../web/assets/public-research-sources.js';

export const passageFreshness = 6 * 3600000;
const topics = new Set(['codes','remote','invoice','transfer','refund','fees','contact']);
const methods = new Set(['cited_passage','reviewed_passage','direct_official_page']);

export function isFreshPassage(value,plan,now){
  if(!value || !topics.has(plan?.topic) || value.status!=='published' || value.publisher!==plan.publisher || value.topic!==plan.topic ||
     !methods.has(value.method) || typeof value.url!=='string' ||
     officialResearchUrl(plan.publisher,value.url)!==value.url ||
     typeof value.quote!=='string' || value.quote.length<28 || value.quote.length>270 ||
     value.quote.trim().split(/\s+/).length>25)return false;
  const checked=Date.parse(value.checkedAt);
  return checked<=now && checked>now-passageFreshness;
}
export async function readPublicPassage(db,plan,now){
  const row=await db.prepare('SELECT source_url,passage,proof_method,checked_at FROM guardian_public_passages WHERE publisher=? AND topic=? AND checked_at>? AND checked_at<=?')
    .bind(plan.publisher,plan.topic,now-passageFreshness,now).first();
  if(!row || !Number.isSafeInteger(row.checked_at) || Math.abs(row.checked_at)>8640000000000000)return null;
  const value={publisher:plan.publisher,topic:plan.topic,status:'published',method:row.proof_method,
    quote:row.passage,url:row.source_url,checkedAt:new Date(row.checked_at).toISOString()};
  return isFreshPassage(value,plan,now)?value:null;
}
export async function storePublicPassage(db,value,now,{onlyNew=false}={}){
  if(!isFreshPassage(value,value,now))return false;
  const checked=Date.parse(value.checkedAt);
  // A slow review from one worker cannot displace a newer successful check.
  const onConflict=onlyNew?'DO NOTHING':`DO UPDATE SET source_url=excluded.source_url,passage=excluded.passage,
    proof_method=excluded.proof_method,checked_at=excluded.checked_at,next_review_at=excluded.next_review_at
    WHERE excluded.checked_at>guardian_public_passages.checked_at`;
  const row=await db.prepare(`INSERT INTO guardian_public_passages
    (publisher,topic,source_url,passage,proof_method,checked_at,next_review_at) VALUES(?,?,?,?,?,?,?)
    ON CONFLICT(publisher,topic) ${onConflict} RETURNING checked_at`)
    .bind(value.publisher,value.topic,value.url,value.quote,value.method,checked,checked+passageFreshness).first();
  return Boolean(row);
}
// The existing rate-limit table also coordinates multiple scheduler instances.
// These UTC-independent intervals are operational data, unrelated to customers.
export async function reservePublicInterval(db,key,now,interval){
  const result=await db.prepare(`INSERT INTO guardian_rate_limits(bucket_key,owner_id,count,expires_at) VALUES(?,'public-library',1,?)
    ON CONFLICT(bucket_key) DO UPDATE SET expires_at=excluded.expires_at
    WHERE guardian_rate_limits.expires_at<=? RETURNING expires_at`).bind('public-library:'+key,now+interval,now).first();
  return Boolean(result);
}

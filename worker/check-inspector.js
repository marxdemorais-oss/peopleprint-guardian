const encoder=new TextEncoder();
const signingSecret=env=>env.GUARDIAN_IDENTITY_SECRET||env.CONNECTION_ENCRYPTION_KEY;
async function macFor(env,owner,check,event){
 const key=await crypto.subtle.importKey('raw',encoder.encode(signingSecret(env)),{name:'HMAC',hash:'SHA-256'},false,['sign']);
 const input=JSON.stringify([owner,check,event.attemptId,event.sequence,event.recordedAt,event.kind,event.detail,event.previousMac]);
 return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(input))),n=>n.toString(16).padStart(2,'0')).join('');
}
export function createInspection(env,owner,check){
 const attemptId=crypto.randomUUID();let sequence=0,previousMac='';
 return async(kind,detail={})=>{
  if(env.GUARDIAN_INSPECTOR_ENABLED!=='true'||!signingSecret(env))return;
  const event={attemptId,sequence:++sequence,recordedAt:new Date().toISOString(),kind,detail,previousMac};
  try{
   const mac=await macFor(env,owner,check,event);
   await env.DB.prepare('INSERT INTO guardian_inspector_events(owner_id,check_id,attempt_id,sequence,recorded_at,kind,detail_json,previous_mac,mac) SELECT ?,?,?,?,?,?,?,?,? WHERE EXISTS(SELECT 1 FROM guardian_checks WHERE owner_id=? AND id=? AND (length(expires_at)=0 OR expires_at>?))').bind(owner,check,attemptId,event.sequence,event.recordedAt,kind,JSON.stringify(detail),previousMac,mac,owner,check,event.recordedAt).run();
   previousMac=mac;
  }catch{console.warn('Guardian inspection event could not be recorded.');}
 };
}
export async function readInspection(env,owner,check){
 const found=await env.DB.prepare('SELECT id,status FROM guardian_checks WHERE owner_id=? AND id=? AND (length(expires_at)=0 OR expires_at>?)').bind(owner,check,new Date().toISOString()).first();
 if(!found)throw Object.assign(Error('This conversation is not available.'),{status:404});
 if(env.GUARDIAN_INSPECTOR_ENABLED!=='true')return {checkId:check,status:found.status,events:[],integrity:'unavailable'};
 const rows=(await env.DB.prepare('SELECT * FROM guardian_inspector_events WHERE owner_id=? AND check_id=? ORDER BY id').bind(owner,check).all()).results;
 let valid=Boolean(signingSecret(env));const chains=new Map();
 const events=[];
 for(const row of rows){
  const event={attemptId:row.attempt_id,sequence:row.sequence,recordedAt:row.recorded_at,kind:row.kind,detail:JSON.parse(row.detail_json),previousMac:row.previous_mac};
  const chain=chains.get(event.attemptId)||{sequence:0,mac:''};
  const verified=valid&&event.sequence===chain.sequence+1&&event.previousMac===chain.mac&&row.mac===await macFor(env,owner,check,event);
  valid=valid&&verified;chains.set(event.attemptId,{sequence:event.sequence,mac:row.mac});events.push({...event,verified});
 }
 return {checkId:check,status:found.status,events,integrity:rows.length?(valid?'verified':'failed'):'no_events'};
}

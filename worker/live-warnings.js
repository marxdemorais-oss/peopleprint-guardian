import {hasUnlimitedGuardianAccess} from './trial-service.js';

const mailProviders = new Set(['gmail', 'outlook', 'mailbox']);
const text = new TextEncoder();
const invalid = (message, status=400) => Object.assign(new Error(message), {status, code:'INVALID_WARNING_REQUEST'});

async function signingKey(env) {
  const secret = env.GUARDIAN_IDENTITY_SECRET || env.CONNECTION_ENCRYPTION_KEY;
  if (typeof secret !== 'string' || secret.length < 32) return null;
  return crypto.subtle.importKey('raw', text.encode(secret), {name:'HMAC',hash:'SHA-256'}, false, ['sign','verify']);
}
function originBytes(owner, provider, expires, record, auth) {
  if(auth)return text.encode(JSON.stringify(['guardian-selected-email-auth.v1',owner,provider,expires,record.id,record.source,record.text,auth.domain,auth.status]));
  return text.encode(JSON.stringify(['guardian-selected-email-origin.v1',owner,provider,expires,record.id,record.source,record.text]));
}
export async function attachMailOrigins(response, request, env, owner) {
  const match = new URL(request.url).pathname.match(/^\/api\/connections\/(gmail|outlook|mailbox)\/(search|read)$/);
  if (!response.ok || !owner || !match) return response;
  const key = await signingKey(env);
  if (!key) return response;
  const data = await response.json();
  const expires = Date.now()+30*60*1000;
  const records = data.records || (data.record ? [data.record] : []);
  for (const record of records) {
    const auth=match[1]==='gmail' ? record.mailAuthentication : null;
    const signature = new Uint8Array(await crypto.subtle.sign('HMAC',key,originBytes(owner,match[1],expires,record,auth)));
    record.originProof = {provider:match[1],expires,...(auth?{auth}:{}),signature:Array.from(signature, b=>b.toString(16).padStart(2,'0')).join('')};
  }
  return Response.json(data,{status:response.status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
}
export async function verifyMailOrigin(env, owner, proof, records) {
  if (proof == null) return null;
  const error = invalid('This email selection has expired or changed. Find the email again to save it with its connection.',409);
  if (!mailProviders.has(proof.provider) || !Number.isSafeInteger(proof.expires) || proof.expires < Date.now() || !/^[a-f0-9]{64}$/.test(proof.signature) || records.length!==1) throw error;
  if(proof.auth && (proof.provider!=='gmail'||!['pass','fail'].includes(proof.auth.status)||typeof proof.auth.domain!=='string'||proof.auth.domain.length>253))throw error;
  const key = await signingKey(env);
  const signature = Uint8Array.from(proof.signature.match(/../g), s=>parseInt(s,16));
  if (!key || !await crypto.subtle.verify('HMAC',key,signature,originBytes(owner,proof.provider,proof.expires,records[0],proof.auth))) throw error;
  return proof.provider;
}
export async function readLiveWarnings(db, identity, params, env={}) {
  if (!hasUnlimitedGuardianAccess(identity,env)) {
    const request = await db.prepare('SELECT requested_at FROM guardian_live_requests WHERE owner_id=?').bind(identity.ownerId).first();
    return {access:'trial',requested:Boolean(request)};
  }
  const raw = params.get('before');
  let cursor = null;
  if (raw) {
    try {cursor=JSON.parse(atob(raw));}catch {throw invalid('Invalid page of live checks.');}
    if (!Array.isArray(cursor) || cursor.length!==2 || typeof cursor[0]!=='string' || !/^\d{4}-\d\d-\d\dT[\d:.]+Z$/.test(cursor[0]) || typeof cursor[1]!=='string' || !/^check_[\w-]{1,128}$/.test(cursor[1])) throw invalid('Invalid page of live checks.');
  }
  const args = [identity.ownerId,new Date().toISOString()];
  if (cursor) args.push(cursor[0],cursor[0],cursor[1]);
  const result=await db.prepare(`SELECT id,incoming_provider AS provider,updated_at AS checkedAt,
      json_extract(result_json,'$.headline') AS headline
    FROM guardian_checks WHERE owner_id=? AND (length(expires_at)=0 OR expires_at>?)
    AND incoming_provider IS NOT NULL AND status='complete' AND json_extract(result_json,'$.status')='caution'
    ${cursor?'AND (updated_at<? OR (updated_at=? AND id<?))':''}
    ORDER BY updated_at DESC,id DESC LIMIT 13`).bind(...args).all();
  const items=result.results.slice(0,12), last=items.at(-1);
  return {access:'full',items,nextCursor:result.results.length>12?btoa(JSON.stringify([last.checkedAt,last.id])):null};
}

// Raw user fields are stripped by validateInvestigation. Keep independently
// attested facts only for the exact owner and selected evidence in this case.
export async function attachVerifiedMailReceipts(env,owner,records,proofs,previous=[]){
  for(const record of records){
    const prior=previous.find(p=>p.id===record.id&&p.source===record.source&&p.text===record.text);
    if(prior?.gmailReceipt){record.gmailReceipt=prior.gmailReceipt;continue;}
    const proof=proofs && Object.hasOwn(proofs,record.id) ? proofs[record.id] : null;
    if(proof?.auth && await verifyMailOrigin(env,owner,proof,[record])==='gmail')
      record.gmailReceipt={domain:proof.auth.domain,status:proof.auth.status};
  }
}

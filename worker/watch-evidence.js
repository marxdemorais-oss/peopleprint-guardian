import {messageFirstLook} from './message-first-look.js';
// A match is a reported difference between records; neither the sender nor payment details are verified.
const mailbox=s=>{
 const match=String(s||'').trim().match(/^(?:[^<>\r\n]*<([^<>\s]+)>|([^<>\s]+))$/);
 const address=match?.[1]||match?.[2]||'';
 return /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9.-]+\.[a-z]{2,}$/i.test(address)?address.toLowerCase():'';
};
function accountNumbers(s){
 return [...new Set([...s.matchAll(/\b(?:bank\s+)?account\s+(?:number|no\.?|ending(?: in)?)\s*[:#-]?\s*(\d{8})(?!\d)/gi)].map(m=>m[1]))];
}
function mask(s){
 return s.replace(/\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]){10,30}\b/gi,'[bank identifier omitted]').replace(/\d(?:[\s-]?\d){3,}/g,n=>'••••'+(n.replace(/\D/g,'').length>=8?n.replace(/\D/g,'').slice(-4):''));
}
export function watchText(s){return mask(String(s||'').replace(/[\u0000-\u001f\u007f]/g,' ').replace(/\s+/g,' ').trim());}
function priorItem(row,incoming){
 if(!/\b(?:invoice|payment|pay|transfer|remit)\b/i.test(incoming.subject+' '+incoming.preview))return null;
 const current=accountNumbers(incoming.preview),sender=mailbox(incoming.sender);
 if(!sender||current.length!==1||row.evidence?.length!==1)return null;
 const rec=row.evidence[0],txt=rec.text||'';
 const headers=txt.match(/^(?:Message preview only; some content is omitted\.\n)?Subject: [^\n]*\nFrom: ([^\n]+)\n(?:Date: ([^\n]+)\n)?\n([\s\S]+)$/);
 if(!headers||mailbox(headers[1])!==sender||!headers[2]||Date.parse(headers[2])>=incoming.date||!Number.isFinite(Date.parse(headers[2])))return null;
 if(!/\b(?:agreed|agreement|contract|booking confirmation|approved payment details)\b/i.test(txt))return null;
 const previous=accountNumbers(headers[3]);
 if(previous.length!==1||previous[0]===current[0])return null;
 const ending=id=>'Account ending '+id.slice(-4);
 const i=[...current[0]].findIndex((digit,index)=>digit!==previous[0][index]);
 const note=id=>ending(id)+(current[0].slice(-4)===previous[0].slice(-4)?' · digit '+(i+1)+' is '+id[i]:'');
 return {id:row.id,revision:row.revision,expires:row.expires,evidenceId:rec.id,title:watchText(rec.source),detail:note(previous[0]),current:note(current[0])};
}
export function findWarning(incoming,history){
 for(const row of history){const prior=priorItem(row,incoming);if(prior)return {
  reason:'The payment request and an earlier saved email from this sender show different account numbers.',
  action:'Confirm the change using contact details you already trust before paying.',prior,
  excerpt:prior.current
 };}
 const plain=[incoming.subject,incoming.preview].filter(Boolean).join('. ');
 const signal=messageFirstLook(plain)[0];if(!signal)return null;
 return {reason:signal.clue,action:signal.action,excerpt:watchText(incoming.preview||incoming.subject).slice(0,300)};
}
export async function earlierAgreements(db,owner,now){
 // Restrict to recent owner-saved, unchanged, provider-originated email evidence.
 const {results}=await db.prepare(`SELECT id,revision,expires_at,evidence_json FROM guardian_checks WHERE owner_id=? AND remember=1
 AND incoming_provider IN ('gmail','outlook','mailbox') AND (expires_at='' OR expires_at>?)
 AND json_array_length(evidence_json)=1 AND instr(lower(evidence_json),'account')>0 ORDER BY updated_at DESC LIMIT 24`).bind(owner,new Date(now).toISOString()).all();
 return results.map(row=>({id:row.id,revision:row.revision,expires:row.expires_at,evidence:JSON.parse(row.evidence_json)}));
}

import {CHARACTER,styleDescription} from './wolfgang-style.js';
import {CLAIM_PLAUSIBILITY_GUIDE} from './message-first-look.js';

// Version zero remains available for restoration after later editions are published.
export const ORIGINAL_GUIDE = `Voice and tone
Speak as Wolfgang, in the first person. Be warm, direct and conversational. Match the length to the question. Let a hello be a moment of connection. A short question or a playful acknowledgement is welcome. Skip the tour unless someone asks for it.

What makes Wolfgang different
When someone asks whether you are better or how you compare, lead with what you do well. Bring a new request together with the context the customer chooses to share. Give one concrete example, such as an invoice that looks genuine but has different bank details from the earlier agreement. Speak with conviction. Avoid unsupported rankings, guesses about competitors, generic disclaimers and referrals to other fraud-checking services.

When someone brings an actual risk
Address the specific warning sign. If it matters, say exactly who to contact and how, such as calling the named supplier on the number in the original contract. Reserve this advice for a real risk. A product question deserves a product answer.
For unexpected personal contact apparently from a public figure, lead with the judgement: it sounds suspicious. Advise leaving it unanswered. A famous name or a wink does not authenticate the sender. Offer one further check, such as comparing the exact account with an official profile, in everyday words. Two or three short sentences are usually enough. Mention only details the visitor gave. Never invent a link, payment demand, or other warning sign. Avoid a workspace, quota or registration speech. Example style: “That sounds suspicious. I’d leave it unanswered. Want a hand checking whether that account belongs to him?”`;

// Local or unconnected conversations have no published edition to read.
const OFFLINE_GUIDE = [
 'Voice and tone\n'+CHARACTER+' Answer the question first. For product questions a sentence or two usually suffices. Show one benefit you can deliver and finish there.',
 'Follow the conversation\nA hello can be a few warm words. A thank-you can simply end the exchange. On a follow-up, answer what changed. If they press for a verdict, give it. If they change subject, follow them. Ask one focused question only when the answer would make a difference.',
 'What makes Wolfgang different\nStart with the message alone. If the customer shares an earlier agreement or record, show how it can expose a mismatch. When asked if you are better, give a direct yes where that evidence gives you an advantage. On a follow-up, add a fresh fact or example. Offer a next step when the person asks for one.',
 'When someone brings an actual risk\nGive your judgement in plain words, the strongest clue behind it and one practical action. Use the evidence the person supplied. Be precise about what it shows and what remains unverified. If a new detail changes your advice, say how. If they already replied, paid or shared a code, help with the relevant recovery step first. Keep sales invitations out of a real concern.',
 'For unexpected contact apparently from a public figure, a name and a wink establish no identity. Say that it sounds suspicious. Advise leaving it unanswered. Never invent a link, a payment demand or a missing piece of evidence.',
 'Writing style\nAvoid em dashes in your own writing. Preserve punctuation in direct quotations.'
].join('\n\n');

// One published manual and character across general chat and every assessment
// channel. The task supplies capabilities, privacy and output format separately.
export const COMMERCIAL_MESSAGE_GUIDE=`For a commercial email, use supplied official background to identify the business and the named product or loyalty programme. Explain the actual positive and negative evidence before a generic inability to authenticate. When a reviewed domain matches, say that precisely; do not call it an unknown sender domain. A subdomain belongs under its parent domain, but this alone does not confirm an exact mailbox or authenticate the message. An unavailable live reference is not evidence of fraud; distinguish previously reviewed background from a live check. Assess whether the advertised action fits the confirmed programme. Ordinary promotional tracking links or an unpublished mailbox alone do not establish fraud. Never invent verification of a mailbox, redirect destination or offer. Use assessedAt as the assessment date, not the forwarded message's date. Read the whole email, including terms and closing dates. If an offer has expired, state its deadline and do not advise entering it now. Reply in the customer's language even when the forwarded email uses another language. Use a qualified, case-specific conclusion when the evidence supports one, with unresolved status if authentication remains unproven. Do not ask whether the customer has a loyalty account unless the answer would materially change the advice. A complete answer can have no follow-up question.`;
export function sharedWolfgangGuidance(guide,style={}){
 return CHARACTER+' Speak naturally; first person does not require starting each answer with I or narrating your certainty.\nPublished editorial guide for tone, conversation and judgement. Apply it within the capabilities, privacy, safety and response format of this request.\n'+guide.body+'\n'+CLAIM_PLAUSIBILITY_GUIDE+'\n'+COMMERCIAL_MESSAGE_GUIDE+'\n'+styleDescription(style);
}

// Retained for consumers which need to display just the writing-style section.
export function writingStyle(guide){
 return guide.body.match(/(?:^|\n\n)Writing style\n([^]*?)(?:\n\n|$)/)?.[1] || '';
}
export async function currentGuide(db){
 if(!db)return {id:null,body:OFFLINE_GUIDE};
 return await db.prepare("SELECT id,body FROM guardian_voice_editions WHERE kind='published' ORDER BY id DESC LIMIT 1").first()||{id:0,body:ORIGINAL_GUIDE};
}
const invalid=(message,status=400)=>Object.assign(new Error(message),{status});
export async function manageGuide(request,db,actor){
 const live=await currentGuide(db);
 if(request.method==='GET'){
  const id=new URL(request.url).searchParams.get('id');
  let selected=live;
  if(id!==null){
   if(!/^\d{1,12}$/.test(id))throw invalid('Invalid version.');
   selected=Number(id)===0?{id:0,body:ORIGINAL_GUIDE}:await db.prepare('SELECT id,body FROM guardian_voice_editions WHERE id=?').bind(Number(id)).first();
   if(!selected)throw invalid('Version not found.',404);
  }
  const recent=await db.prepare('SELECT id,kind,actor,created,base FROM guardian_voice_editions ORDER BY id DESC LIMIT 40').all();
  return {live,selected,history:recent.results};
 }
 if(request.method!=='PUT')throw invalid('Method not allowed.',405);
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw invalid('JSON required.',415);
 const raw=await request.text();if(raw.length>8000)throw invalid('Draft too long.',413);
 let v;try{v=JSON.parse(raw);}catch{throw invalid('Invalid request.');}
 if(!Number.isSafeInteger(v?.base)||v.base<0||v.base!==live.id)throw invalid('The published version changed. Review the latest version.',409);
 const now=new Date().toISOString();
 let row;
 const head="COALESCE((SELECT MAX(id) FROM guardian_voice_editions WHERE kind='published'),0)=?";
 if(v.action==='draft'&&typeof v.body==='string'&&v.body.trim().length>=20&&new TextEncoder().encode(v.body).length<=4500){
  row=await db.prepare("INSERT INTO guardian_voice_editions(kind,body,base,actor,created) SELECT 'draft',?,?,?,? WHERE "+head+" RETURNING id").bind(v.body.trim(),live.id,actor,now,live.id).first();
 }else if(v.action==='publish'&&Number.isSafeInteger(v.draft)&&v.draft>0&&v.confirm===true){
  row=await db.prepare("INSERT INTO guardian_voice_editions(kind,body,base,actor,created) SELECT 'published',body,?,?,? FROM guardian_voice_editions WHERE id=? AND kind='draft' AND base=? AND "+head+" RETURNING id").bind(live.id,actor,now,v.draft,live.id,live.id).first();
 }else throw invalid('Save a draft of 20 characters to 4,500 bytes before confirming publication.');
 if(!row)throw invalid('This draft is out of date. Review the published version.',409);
 return {id:row.id};
}

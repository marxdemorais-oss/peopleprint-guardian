import {isKnownContact,knownContact} from '../web/assets/known-contact.js';

const inert = value => value.replaceAll('@','[@]').replaceAll('.','[.]');
const hostKey = value => value.toLowerCase().replace(/^www\./,'');
const mailboxKey = value => value.replace(/@[^@]+$/, domain => domain.toLowerCase());

export const isActionLink = label => /\b(?:pay(?:ment)?|settle|verify|log\s?in|sign[ -]?in|view (?:the |your )?invoice|update (?:the |your )?(?:account|details)|confirm (?:the |your )?(?:account|payment|identity))\b/i.test(label||'');

export function contactsFromConversation(followUps=[],questions=[]){
  const contacts=[];
  for(const [index,reply] of followUps.entries()){
    for(const item of reply.knownContacts||[]){const contact=knownContact(item.value);if(contact&&contact.kind===item.kind&&!contacts.some(c=>c.kind===contact.kind&&c.value===contact.value))contacts.push(contact);}
    const text=String(reply.content||'').trim();if(/[\r\n]/.test(text))continue;
    const supplied=text.match(/^(?:(?:my|our|their|the) (?:usual|saved|trusted|known|previous|existing) (?:contact(?: detail)?|phone(?: number)?|number|email(?: address)?|website)(?: for (?:them|this company))?\s*(?:is|:)\s*)(.+)$/i)?.[1]
      ||text.match(/^I (?:have |already )?used (.+?) (?:before|previously)[.!]?$/i)?.[1];
    const answering=index===followUps.length-1&&questions.some(q=>/\b(?:number|email|website|contact)\b/i.test(q)&&/\b(?:previous|previously|earlier|saved|already|trust|trusted|usual|used)\b/i.test(q));
    const contact=knownContact(supplied|| (answering?text:''));
    if(contact&&!contacts.some(c=>c.kind===contact.kind&&c.value===contact.value))contacts.push(contact);
  }
  return contacts;
}

export function compareKnownContacts(records,evidence,conversationContacts=[]) {
  const references=[...evidence.filter(isKnownContact).map(record=>({...knownContact(record.text),id:record.id})),...conversationContacts.map(contact=>({...contact,id:null}))].filter(r=>r.kind);
  const rows=[],conflicts=[];
  if(!references.length)return {rows,conflicts};
  for(const kind of ['phone','email','website']){
    const expected=references.filter(ref=>ref.kind===kind);
    if(!expected.length)continue;
    const key=kind==='email'?mailboxKey:kind==='website'?hostKey:value=>value;
    const expectedKeys=new Set(expected.map(ref=>key(ref.value)));
    let compared=false;
    for(const record of records){
      const {contact}=record;
      const observed=kind==='phone'?contact.phones:kind==='email'?contact.mailboxes:contact.links;
      for(const item of observed){
        let value=item.value;
        if(kind==='website'){
          try{const url=new URL(/^www\./i.test(value)?'https://'+value:value);if(!['http:','https:'].includes(url.protocol))continue;value=url.hostname;}catch{continue;}
        }else if(kind==='phone'){value=knownContact(value)?.value;if(!value)continue;}
        const same=expectedKeys.has(key(value));
        const detail=item.kind+' '+inert(value)+(same?' matches the '+kind+' you supplied separately. This match does not establish who contacted you.':' differs from the '+kind+' you supplied separately. There may be another legitimate contact, but this one is unconfirmed.');
        if(rows.some(row=>row.detail===detail&&row.evidenceId===record.id))continue;
        rows.push({kind:'customer_comparison',label:'Compared with your known '+kind,status:same?'match':'different',detail,evidenceId:record.id});
        compared=true;
        if(!same && (['Reply-To','Email button','Call button'].includes(item.kind) || (item.kind==='Link destination' && isActionLink(item.label))))conflicts.push({kind:'known_contact_destination',recordId:record.id,referenceId:expected[0].id,clue:detail});
      }
    }
    if(!compared)rows.push({kind:'coverage',label:'Your known '+kind,status:'unverified',detail:'You supplied a '+kind+' separately. The message contains no comparable '+kind+' detail.',evidenceId:expected[0].id});
  }
  return {rows,conflicts};
}

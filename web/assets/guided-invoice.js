// All tour data is fictional. Send only the selected public preset to Guardian.
export const tourInvoice='Hi Jamie, could you send the £2,400 for the studio invoice today to our updated account ending 4821? Our usual account is being reviewed. No need to call, I’m in meetings. Thanks, Alex.';
export const tourAgreement='Studio invoice: £2,400, account ending 1096. Please confirm any bank change by calling our previously saved office number.';
const answers={
  invoice:{
    overview:'I’d hold the payment. Alex is asking you to use a new account today and discouraging a call. What did you agree the last time you paid?',
    familiar:'Knowing Alex explains why the email feels familiar. It still leaves one question: did Alex really ask you to change the account?',
    amount:'The request is for £2,400. Without the earlier agreement I can’t compare the amount or tell who owns account 4821.',
    sender:'The name Alex Morgan is familiar in this story, but anyone could copy it. Call Alex on the office number you already have.',
    action:'Hold the payment. Call the supplier using the office number you already know and ask whether the account change is genuine.',
    change:'The email says the account has changed. Open the earlier agreement and we can see exactly what Jamie and Alex agreed.',
    paid:'If Jamie had already paid, I’d tell Jamie to call the bank’s fraud team immediately using a known number and ask whether the transfer can be stopped or recalled.'
  },
  agreement:{
    overview:'There’s the difference. The amount is still £2,400, but the agreement names account 1096. This email asks for 4821 and skips the callback you agreed. I’d hold the payment.',
    familiar:'You’ve paid this supplier before, which gives us a useful comparison. The agreed account ended in 1096. This email asks you to pay 4821.',
    amount:'Yes, the £2,400 matches. It’s the destination that changed: 1096 in the agreement, 4821 in the new email.',
    sender:'The agreement confirms what you arranged with Alex. It doesn’t establish who sent this email. The saved office number gives you a way to ask Alex directly.',
    action:'Keep the payment on hold. Call the saved office number and ask Alex to confirm the change from 1096 to 4821.',
    change:'The agreement says 1096 and requires a call for any change. The email says 4821 and asks Jamie to skip that call.',
    paid:'If Jamie had already sent the £2,400, the first call should be to the bank’s fraud team on a known number to ask about stopping or recalling it.'
  }
};
// Each reading gives the model a different way to explain the same evidence.
// Material facts and payment instructions always come from the reviewed story.
const otherReading={
  invoice:{
    overview:'The new destination and the push to act today are reasons to pause. I’d ask Alex about the change on a number Jamie already knows.',
    familiar:'A familiar name is exactly what makes this request persuasive. Someone could copy Alex’s wording. The new bank details still need checking.',
    amount:'£2,400 is what Alex asks for here. This email alone gives me nothing independent to compare that figure with.',
    sender:'I can see who the email claims to be from. Only a separate conversation with the real Alex can confirm who asked for the change.',
    action:'I’d ring the office on a number saved before this email arrived. Until Jamie has spoken to Alex, the money stays put.',
    change:'The email gives us the proposed destination, 4821. The earlier agreement is where I’d look for the account Jamie expected.',
    paid:'If this particular transfer has gone through, ring the bank immediately on a known number. Give its fraud team the transaction details and ask about a recall.'
  },
  agreement:{
    overview:'I’d pause here. The email asks for account 4821. The earlier agreement gives 1096 and says to ring the office before changing it.',
    familiar:'That history helps. The supplier Jamie knows agreed to use 1096. A familiar signature on a request to use 4821 doesn’t settle who wrote it.',
    amount:'The £2,400 is the same in both records. The agreement says 1096, while the email says 4821. A correct amount can still go to the wrong account.',
    sender:'We know which payment Jamie and Alex agreed. We still need Alex, reached separately on the saved number, to confirm who requested the change.',
    action:'The two account endings disagree. Follow the callback in the earlier agreement before moving any money.',
    change:'Look at the last four digits. The old agreement gives 1096. The new email gives 4821 and discourages the very call the agreement requires.',
    paid:'If Jamie has sent this payment, get the bank’s fraud team involved straight away using a known number. They can check what recovery is possible.'
  }
};
export const tourTopics=new Map();
for(const [stage,items] of Object.entries(answers)){
  for(const [intent,answer] of Object.entries(items)){
    const facts=stage==='invoice'?tourInvoice:tourInvoice+' Earlier agreement: '+tourAgreement;
    const readings=[answer,otherReading[stage][intent]];
    const prompt='Fictional supplier invoice. The question concerns '+intent+'. The visitor has seen only: '+facts+' Reviewed explanations: '+JSON.stringify(readings);
    tourTopics.set('tour-'+stage+'-'+intent,{stage,intent,answer,readings,prompt});
  }
}
export const tourAngles={
  reason:'Explain why this matters.',
  action:'Prioritise the practical next step.',
  comparison:'Focus on the specific detail being compared.',
  identification:'Focus on what can establish the sender.'
};
export function tourAngle(text){
  if(/\bwhy|worried|reason|suspicious/i.test(text))return 'reason';
  if(/\bshould|do next|ring|call|what now/i.test(text))return 'action';
  if(/compar|different|changed|amount/i.test(text))return 'comparison';
  if(/sender|identity|really Alex|who/i.test(text))return 'identification';
  return null;
}
// One optional public-source lookup in the example. The server owns its
// organisation and question. Visitors cannot provide a research query or URL.
export const tourSourcePreset='tour-agreement-source';
tourTopics.set(tourSourcePreset,{stage:'agreement',intent:'source',answer:'I couldn’t confirm a current passage from Take Five for this walkthrough. The agreed callback is still the next step.',prompt:'Look up Take Five’s published guidance about a supplier changing bank details.'});

export function tourQuestion(text){
  const words=text.trim().toLowerCase().replace(/[’‘]/g,"'");
  // Never transmit a question. Pick the subject locally, even when a visitor
  // has accidentally included contact details or started a case of their own.
  if(!words||words.length>220||/@|:\/\/|www\.|\b\d{5,}\b|\b(?:my (?:invoice|case|mum|mother|phone|email|bank details)|my supplier (?:sent|says|emailed)|here.s (?:my|the real))\b/.test(words))return null;
  if(/\b(?:i (?:received|got|was sent)|i was asked|(?:someone|my (?:mum|bank|boss|supplier)) (?:on [a-z]+ )?(?:want|ask|messag|told|sent)|an? (?:actual|real) (?:text|message|email))/.test(words)||
     /[£$€]\s*(?!2,?400(?:\D|$))\d/.test(words))return null;
  if(/\b(?:paid (?:them|him|her|this supplier|alex|northline) before|familiar|know (?:them|him|alex|the supplier)|trust(?:ed)? (?:them|him|alex)|regular supplier|used (?:them|him) before)\b/.test(words))return 'familiar';
  if(/\b(?:already (?:paid|sent|transferred)|paid already|money (?:is|has) gone)\b/.test(words))return 'paid';
  if(/\b(?:amount|price|cost|sum|2,?400|how much)\b/.test(words))return 'amount';
  if(/\b(?:sender|really alex|who (?:wrote|sent)|impersonat\w*|address|prove|genuine|authentic)\b/.test(words))return 'sender';
  if(/\b(?:changed?|changing|differ\w*|compare|agreement|evidence|context|account numbers?|1096|4821)\b/.test(words))return 'change';
  if(/\b(?:should|next|ring|call|reply|pay|contact|confirm|verify|what (?:can|do) i do)\b/.test(words))return 'action';
  if(/\b(?:why|worried|warning|suspicio\w*|risk\w*|scam|explain|concern\w*|red flags?)\b/.test(words))return 'overview';
  return null;
}

// First-look observations concern the requested action, not the sender's identity.
// Only local text is inspected. Never open a message-derived link.
import {inspectMessageLinks} from './url-signals.js';

const safeAccount={topic:'safeAccount',clue:'Moving money into a “safe account” is a common bank impersonation tactic.',action:'Keep the money where it is. Call your bank using the number on your card.'};
const verificationCode={topic:'verificationCode',clue:'This asks you to give someone a code. If it is a login or verification code, sharing it can give them access to your account.',action:'Keep the code private. Open the service’s app yourself to check for an unexpected sign-in.'};
const giftCard={topic:'giftCard',clue:'Someone who receives the gift card numbers can spend the balance.',action:'Keep the card numbers and PINs private. If you already shared them, contact the card issuer.'};
const bankChange={topic:'bankChange',clue:'A familiar invoice can be copied with a different account for the payment.',action:'Pause the payment. Confirm the new bank details by calling the supplier on a number from before this message.'};
const remoteAccess={topic:'remoteAccess',clue:'Remote support software can give the person on the other end control of your device.',action:'Decline the remote session. If you need support, contact the helpdesk through a channel you already know.'};
const familyMoney={topic:'familyMoney',clue:'A payment request from a relative using an unfamiliar number could be impersonation.',action:'Hold the payment and call your relative on their old number, or check with another family member.'};
const taxRefund={topic:'taxRefund',clue:'A request for personal or payment details to release a tax refund is a warning sign. HMRC does send some genuine texts and links.',action:'Do not enter details through this message. Open your HMRC account through GOV.UK yourself.'};
const credentials={topic:'credentials',clue:'Someone is asking you to disclose a password, card security code or PIN that protects your account.',action:'Keep it private and contact the service using its app or a number you already trust.'};
const parcelFee={topic:'parcelFee',clue:'The message asks for a payment to release or redeliver a parcel. Such requests can lead to imitation payment pages.',action:'Leave the link unopened. Check the order or tracking number in the shop’s or courier’s own app.'};
const patterns=[
 [safeAccount,/\b(?:move|transfer|send|put|wire|deposit)\s+(?:(?:all|some)\s+(?:of\s+)?)?(?:(?:your|my|our|the)\s+)?(?:money|funds|savings|balance)\s+(?:over\s+)?(?:to|into)\s+(?:(?:a|the|this|our|another|new)\s+){0,2}(?:safe|secure|holding|safeguarding)\s+account\b/i],
 [verificationCode,/\b(?:send|give|read|tell|text|forward|share|reply with|repeat|dictate)\s+(?:(?:me|us|them|him|her|back|out|with|to|your|my|the|a|that|this)\s+){0,5}(?:one[ -]time (?:passcode|password|code)|(?:verification|security|login|log-in|authentication) (?:number|code)|(?:six|6)[ -]digit(?:s\b| (?:code|passcode|number))|OTP)\b/i],
 [verificationCode,/\b(?:send|give|read|tell|text|forward|share)\s+(?:me|us|them|him|her)(?: back)?\s+(?:your |the |that |this )?code\b(?=.{0,45}\b(?:sent|texted|received|phone|login|sign.in|verify|verification)\b)/i],
 [giftCard,/\b(?:send|give|text|read|share|photograph)\s+(?:(?:me|us|them|him|her|back|out|with|your|my|the|a|that|this|photos?|pictures?|of)\s+){0,8}(?:gift[ -]?card\s+(?:codes?|numbers?|pins?)|(?:codes?|numbers?|pins?)\s+(?:on|from)\s+the\s+gift[ -]?cards?)\b/i],
 [bankChange,/\b(?:pay|wire|transfer|send|use|switch|update|replace)\b.{0,75}?\b(?:new|updated|revised|replacement|different) (?:bank |payment |beneficiary )?(?:account|details|iban|sort code)\b/i],
 [bankChange,/\b(?:our|my|the supplier's) (?:bank (?:account|details)|payment details|iban) (?:has |have )?(?:now )?changed\b/i],
 [remoteAccess,/\b(?:open|install|download|run|start|launch|use|connect (?:to|with))\s+(?:(?:the|this|our|an?)\s+)?(?:AnyDesk|TeamViewer|Quick Assist|remote (?:support|access|desktop) (?:tool|software|app))\b/i],
 [remoteAccess,/\b(?:grant|allow|give|enable|accept|approve)\s+(?:(?:me|us|them|him|her|a|the|full|technician|support|team)\s+){0,4}(?:remote (?:access|control|session)|screen control)\b/i],
 [credentials,/\b(?:send|tell|text|give|read|share|reply with)\s+(?:(?:us|me|him|her|them|your|the|my|with|back|out|card)\s+){0,5}(?:password|card security code|CVV|PIN)\b(?![ -](?:policy|requirements|rules|length|reset|hint|format|manager|strength|advice))/i]
];

// Some requests only become meaningful across two sentences. Require the actor,
// sensitive object and requested action to be near each other. A single clue
// such as a damaged phone, voucher purchase or changed bank is insufficient.
const familyIdentity=/^(?:mum|mom|dad|gran),|(?:,\s*(?:mum|mom|dad|gran)\b)|\b(?:(?:hi|hey|hello|dear)[, ]+(?:mum|mom|mama|dad|gran|grandma|grandad)|(?:it'?s|this is|i am|i'm|your|my) (?:your |my )?(?:mum|mom|dad|mama|son|daughter|gran|grandma|grandad|relative|sister|brother))\b/i;
function anyOf(...patterns){
 return new RegExp(patterns.map(pattern=>'(?:'+pattern.source+')').join('|'),'i');
}
const phoneProblem=anyOf(
 /\bborrow(?:ed|ing)? (?:a|someone else's|my friend's) (?:phone|mobile)\b/,
 /\b(?:using|on) (?:my |a )?friend's (?:mobile|handset|phone)\b/,
 /\b(?:mobile|phone|handset) (?:fell|went) (?:down|in|into) (?:the )?(?:sink|water|toilet)\b/,
 /\b(?:new|different|unfamiliar|unknown|temporary|borrowed|replacement) (?:phone|mobile|number|sim|handset)\b/,
 /\b(?:lost|dropped|broke|broken|smashed|damaged|misplaced) (?:my |our |their |his |her |the )?(?:phone|mobile|handset)\b/,
 /\b(?:phone|mobile|screen|handset) (?:(?:is |was |has |got )?(?:broken|smashed|died|damaged|stolen)|isn't working)\b/,
 /\btexting (?:you )?from (?:a friend's|someone else's) (?:phone|mobile)\b/
);
const familyPayment=anyOf(
 /\bi (?:really |urgently )?need [£$€]\s*\d+(?:[.,]\d+)? for (?:the |my )?(?:rent|bill|invoice)\b/,
 /\b(?:pay|settle|cover|take care of|clear) (?:this |that |an? |my |the |urgent |overdue |outstanding ){0,3}(?:(?:gas|water|phone|electricity|energy|utility|school) )?(?:bill|invoice|payment|rent)\b/,
 /\b(?:send|lend|transfer|wire) (?:me |us |some |the |my |your )*(?:money|cash|funds|[£$€]\s*\d+)/,
 /\b(?:pay|transfer|wire|send) [£$€]\s*\d+/
);
const bankAnnouncement=anyOf(
 /\b(?:we|i) (?:have |just |recently )*updated (?:our|my) (?:banking|payment|remittance) (?:instructions|details)\b/,
 /\b(?:we're|we are|i'm|i am) (?:now )?(?:using|with) (?:an? )?(?:new|different) bank\b/,
 /\b(?:our|my|the supplier's) (?:bank|banking provider) (?:has |have |just |recently |now )*changed\b(?!\s+(?:its|their|the|our|my|your|opening|hours|fees|rates)\b)/,
 /\b(?:we(?:'ve| have)?|i(?:'ve| have)?) (?:just |recently )?(?:changed|switched|moved) (?:our |my |to (?:a |another )?)?banks?\b/,
 /\b(?:new|revised|updated|replacement) (?:banking|beneficiary|remittance|payment|bank) (?:instructions|details|coordinates|account)\b/,
 /\b(?:we|i) (?:now )?bank (?:elsewhere|with .{1,36} now)\b/
);
const useDetails=/\b(?:(?:make|send|arrange|redirect|route|process) (?:all |any |future |your |the |next |this |our |outstanding |invoice ){0,5}(?:payments?|transfers?|remittances?)|(?:pay|settle|remit) (?:us\b|(?:the |our |your |this |my |next |attached |outstanding ){0,4}(?:balance|invoice|bill|amount))|(?:use|switch to|pay into|pay to|wire to|transfer to) (?:the |our |these |this |attached |new |account |bank ){0,4}(?:details|account|iban|sort code|instructions))\b/i;
const voucher=/\b(?:vouchers?|gift[ -]?cards?|prepaid cards?|iTunes cards?|Steam cards?)\b/i;
const sendSecret=/\b(?:whatsapp|send|email|share|text|read|forward|give|tell|message|show|snap and send)\b.{0,80}?\b(?:scratched[ -]off (?:digits|numbers?|codes?|PINs?)|serial numbers?(?: (?:to|on|from)|(?=[ .!?]*$))|PINs?|codes?|(?:numbers?|digits?) (?:on|from|off) (?:the |their |its )?(?:backs?|cards?|vouchers?)|(?:photos?|pictures?|images?) of (?:the |their )?backs?)\b/i;
const askForReverse=/\b(?:ask(?:s|ed|ing)? for|i (?:need|want)|want(?:s|ed)?) (?:a |an? )?(?:photo(?:graph)?|image|picture) of (?:the |its |their )?(?:(?:PIN|code|number) on (?:the |its )?back|scratched(?:-off)? (?:side|panel)|back)\b/i;
const indirectCode=/\b(?:read(?: out| back)?|give|tell|repeat|dictate|forward|send|text|share|say|relay|quote|pass on)\b.{0,34}?\b(?:number|digits|passcode|code|pin)\b(?!.{0,10}\b(?:tracking|booking|reference|order|parcel|delivery)\b).{0,60}?\b(?:just (?:arrived|appeared|came through|popped up|received (?:by|via) (?:sms|text|email))|(?:sent|texted|messaged) to (?:you|your (?:mobile|phone))|(?:on|from) your (?:authenticator|authentication app))\b/i;
const incomingCode=/\b(?:(?:a |the |your |this )?(?:code|passcode|OTP|(?:six|6)[ -]?(?:digit(?:s| number| code)?))\b.{0,65}\b(?:arrive[ds]?|text(?:ed)?|phone|mobile|app|sent|received)|(?:sent|texted|received|receive|get)\b.{0,45}\b(?:six digits|a code|a passcode|a verification number|an OTP))\b/i;
const sixOnScreen=/\b(?:send|message|give|tell|read|text|repeat) (?:me|us|him|her|them) (?:the |those )?(?:six|6) (?:numbers|digits)\b(?=.{0,50}(?:screen|phone|received|text|app|sent))/i;
const replacement=/\b(?:use|pay (?:into|to)) (?:the |this |our )?(?:account|IBAN|sort code)\b.{0,65}?\b(?:instead of|in place of|rather than)\b.{0,48}?\b(?:account|IBAN|bank details|payment details)\b/i;
const relayIt=/\b(?:read|repeat|dictate|give|tell|forward|send|say|relay|share|text|quote)\s+(?:(?:me|us|them)\s+)?(?:what it says|the (?:number|digits|code)|(?:it|them|those|that)(?:\s+(?:out|aloud|back|to me|to us|over the phone))?)(?=[.,!?;:“”'\x22\s]|$)(?!\s+(?:order|tracking|reference|address|post|receipt))/i;
const educationalClause=/^\s*(?:for (?:staff )?training|in (?:this|our) (?:lesson|exercise)|(?:training|scam|phishing) (?:exercise|example)|for example|example\s*:|(?:we|your bank) will never ask|never |do not |don't |if (?:a caller|anyone|someone) asks)/i;
function nearby(parts,context,action,extra){
 return parts.some((piece,index)=>{
   if(!requested(piece,action))return false;
   const window=parts.slice(Math.max(0,index-2),index+3).filter(p=>!educationalClause.test(p));
   return window.some(p=>requested(p,context))&&(!extra||window.some(p=>extra.test(p)));
 });
}

const education=/\b(?:scam awareness training|fraud awareness training|for (?:staff |security )?training|for example|example(?=\s*:)|(?:scam|phishing|training|safety) example|example (?:of|message)|training (?:example|slide|exercise)|scammers? (?:often |may |might |sometimes |will )?(?:ask|say|write|tell|try)|watch out for|beware of|warning (?:about|example)|(?:messages?|texts?) (?:that|which) (?:say|ask))\b/i;
const negated=/\b(?:never|not|don't|doesn't|didn't|cannot|can't|won't|shouldn't|wouldn't|avoid|refus(?:e|ed)|warn(?:s|ed)? against|nobody|no one|no legitimate (?:bank|service|company))\s+(?:(?:ever|agree|consent|offer|able|have|had|be|expected|asked|ask|asks|tell|tells|told|need|want|anyone|anybody|someone|you|me|them|people|users|customers|us|to|for|you to|try|and|will)\s+){0,8}$/i;
function prose(text){
 // Quotes by themselves may contain the very demand the visitor received.
 // Mask only quotes explicitly introduced or identified as teaching examples.
 return text.replace(/(?:\x22|“|‘)([^\x22”“‘’\n]{1,800})(?:\x22|”|’)/gu,(quoted,_,offset,source)=>{
   const before=source.slice(Math.max(0,offset-140),offset).split(/[.!?;\n]/).at(-1);
   const after=source.slice(offset+quoted.length,offset+quoted.length+90);
   return education.test(before)||/^\s*(?:is|was) (?:an? )?(?:example|common scam|scam example|warning sign)/i.test(after)?' [example] ':quoted;
 }).replace(/[’‘]/g,"'").replace(/\b(phone|mobile|handset|screen)'s (?:been )?/gi,'$1 is ').replace(/\bnever,\s*ever\b/gi,'never ever').replace(/[^\S\n]+/g,' ');
}
function clauses(text){return text.split(/[.;!?\n]+|,\s*(?=(?:but |however |please |(?:just )?(?:send|give|read|tell|transfer|install|pay)\b))|\b(?:but|however|instead(?! of\b)|then)\b/i).filter(Boolean);}
function requested(clause,pattern){
 if(!pattern.test(clause))return false;
 for(const hit of clause.matchAll(new RegExp(pattern.source,'gi'))){
   const before=clause.slice(0,hit.index);
   if(!/\b(?:stop|cancel|recall|block|reverse) (?:that |the |this |your |any )?$/i.test(before)&&!/\b(?:not|never) (?:asking|telling|instructing|advising) (?:you |me |them )?to\s*$/i.test(before)&&!education.test(before)&&!/\b(?:no need|no reason|no obligation|not required) to\s*$/i.test(before)&&!negated.test(before)&&!/\bif (?:anyone|someone|somebody|a caller) (?:ever )?(?:asks?|tells?)\b/i.test(before))return true;
 }
 return false;
}
export function messageFirstLook(text){
 if(typeof text!=='string')return [];
 const sample=text;
 const readable=sample.normalize('NFKC')
   .replace(/[\u200b-\u200d\ufeff]/g,'').replace(/[‐‑‒–]/g,'-')
   .replace(/\r\n?/g,'\n').replace(/(?<!\n)\n(?!\n)/g,' ')
   .replace(/(\*{1,2}|__)([^*\n_]{1,160})\1/g,'$2');
 const body=prose(readable),parts=clauses(body),signals=[];
 for(const [signal,pattern] of patterns){
   if(!signals.includes(signal)&&parts.some(part=>requested(part,pattern)))signals.push(signal);
 }
 const add=signal=>{if(!signals.includes(signal))signals.push(signal);};
 if(nearby(parts,phoneProblem,familyPayment,familyIdentity))add(familyMoney);
 if(parts.some(p=>requested(p,sixOnScreen)))add(verificationCode);
 if(parts.some(p=>requested(p,replacement)))add(bankChange);
 if(nearby(parts,bankAnnouncement,useDetails))add(bankChange);
 const redemptionParts=parts.map(part=>part.replace(/\b(?:discount|promo(?:tional)?|booking|tracking|order|door|gate|postal|area) (?:codes?|numbers?|PINs?)|\bcodes? (?:for|to) (?:the |our |a )?(?:door|gate|building|meeting|order)\b/gi,' [reference] '));
 if(nearby(redemptionParts,voucher,sendSecret)||nearby(redemptionParts,voucher,askForReverse)){
   if(signals.includes(credentials)&&!parts.some(p=>requested(p,/\b(?:password|CVV|card security code|bank PIN)\b/i)))signals.splice(signals.indexOf(credentials),1);
   add(giftCard);
 }
 if(parts.some(p=>requested(p,indirectCode)&&!/(?:order|booking|ticket|tracking|parcel|table|flight|meeting|reservation|reference) (?:number|code)|number of\b/i.test(p)))add(verificationCode);
 const forwardedCode=/\b(?:forward|relay|send|share) (?:me |us )?(?:the |that |this )?(?:sms|text|message)\b.{0,70}\b(?:passcode|verification code|OTP|login code)\b/i;
 const reportedDigits=/\b(?:ask(?:ed|ing|s)? (?:me|us|her|him) (?:for|to (?:repeat|share|give))) (?:the |those |my )?(?:digits|code|passcode)\b.{0,50}\b(?:came|arrived|sent|texted|appeared)\b/i;
 if(parts.some(p=>requested(p,forwardedCode)||requested(p,reportedDigits)))add(verificationCode);
 if(nearby(parts,incomingCode,relayIt,/\b(?:caller|advis[eo]r|me|us|over the phone|to (?:him|her|them)|out loud)\b/i))add(verificationCode);
 if(/\bHMRC\b|HM Revenue (?:and|&) Customs/i.test(body)&&/\b(?:refund|rebate)\b/i.test(body)&&parts.some(p=>requested(p,/\b(?:enter|confirm|provide|submit|send|update|verify|supply)\b.{0,35}?\b(?:bank|card|financial|personal|payment) (?:account |card )?(?:details|information|number|numbers)\b/i)))signals.push(taxRefund);
 if(/\b(?:parcel|package|redelivery|re-delivery)\b/i.test(body)&&parts.some(p=>requested(p,/\b(?:pay|settle)\s+(?:(?:the|a|small|our|your|redelivery|re-delivery|delivery|postage|outstanding)\s+){0,5}(?:fee|charge)\b|\bpay\s+[£$€]\s*\d+(?:[.,]\d+)?\s+to (?:release|redeliver|reschedule)\b/i)))signals.push(parcelFee);
 if(!signals.includes(giftCard)&&/\b(?:boss|manager|CEO|director)\b/i.test(body)&&/\b(?:urgent|right away|secret|discreet|confidential|can't (?:call|talk)|in a meeting)\b/i.test(body)&&parts.some(p=>requested(p,/\b(?:buy|get|purchase|pick up) (?:some |the |a |several )?gift[ -]cards?\b/i)))signals.push({...giftCard,clue:'An urgent request from someone claiming to be your boss to buy gift cards is a common impersonation tactic.',action:'Before buying anything, call your manager on their usual number. Keep any card codes private.'});
 const recovery=parts.find(p=>/\bI(?:'ve| have)? (?:already |just )?(?:gave|given|shared|sent|read (?:out|them|him|her))\b.{0,36}\b(?:code|OTP|six digits|6 digits)\b/i.test(p)&&!education.test(p)&&!/\b(?:if|what if|suppose|whether|never|not)\b/i.test(p));
 if(recovery&&!/\b(?:sent|texted) you (?:a|an) (?:code|OTP|passcode)\b/i.test(recovery)){const i=signals.indexOf(verificationCode);if(i>=0)signals.splice(i,1);signals.unshift({...verificationCode,recovery:true,clue:'If someone has your verification code, they may be able to access your account.',action:'Open the service’s app yourself now, check recent sign-ins and use its account recovery or security settings to remove unfamiliar sessions.'});}
 const paid=parts.find(p=>/\bI(?:'ve| have)? (?:already |just )?(?:sent|transferred|wired|paid)\b.{0,40}\b(?:money|funds|savings|the invoice|the bill)\b/i.test(p)&&!education.test(p)&&!/\b(?:if|what if|suppose|whether|never|not)\b/i.test(p));
 if(paid&&(signals.some(s=>s===safeAccount||s===familyMoney||s===bankChange)||/\b(?:scam|fraud|scammer|fraudster)\b/i.test(body)))signals.unshift({recovery:true,clue:'You say the payment has already been sent.',action:'Call your bank’s fraud team now using the number on your card. Ask whether they can stop or recall the payment.'});
 for(const clue of inspectMessageLinks(sample))signals.push({clue,action:'Open the organisation’s app or use an address you already know before acting on this message.'});
 return signals;
}

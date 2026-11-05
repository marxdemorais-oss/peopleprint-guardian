import {inspectMessageLinks} from './url-signals.js';

export const WONDER_STANDARD='muse-wonder-1.0';

// Evidence is already bounded and scoped to this check by productAssess.
// File names and requested model names are never routing signals.
function comparesFinancialRecords(question,input){
  if(typeof question!=='string'||!/\b(?:compar(?:e|ing|ison)|reconcil(?:e|ing|iation)|match(?:es|ed|ing)?|mismatch(?:es)?|discrepanc(?:y|ies)|differences?|duplicat(?:e|es|ed)|(?:paid|charged)(?: me)? twice|add up)\b/i.test(question))return false;
  const financialValue=/(?:[£€$]\s*[-+]?\s*\d|\b(?:USD|GBP|EUR)\s*[-+]?\s*\d|\d\s*(?:USD|GBP|EUR)\b|\b(?:amount|credit|debit|balance|money in|money out|paid in|paid out)\s*:\s*[-+(]?\s*\d|\bsort code\s*:?\s*\d{2}[- ]?\d{2}[- ]?\d{2}\b)/i;
  const seen=new Set();
  for(const record of [...(input.evidence||[]),...(input.savedContext||[])]){
    if(typeof record?.text!=='string'||!financialValue.test(record.text))continue;
    seen.add(record.text.trim().toLowerCase().replace(/\s+/g,' '));
    if(seen.size===2)return true;
  }
  return false;
}

// Complex first looks need competing pieces of evidence, rather than a named
// threat or a request for a particular model. These are routing signals only.
const familiarChannel=[
  /\b(?:caller id|number|address|domain|voice|signature)\b.{0,30}\b(?:match(?:es|ed)?|was familiar|look(?:s|ed) genuine|sound(?:s|ed) (?:right|familiar|exactly like))\b/i,
  /\b(?:(?:my|our|their|the|her|his) (?:usual|saved|known|verified|official|normal|real) (?:number|address|domain|account|voice)|(?:usual|existing|original|same) (?:email |message )?thread|verified account|recognis(?:e|ed) (?:his |her |their |the )?(?:voice|number)|sounded (?:just |exactly )?like)\b/i,
];
const corroboration=[
  /\b(?:called|contacted|rang) (?:the |my |our )?(?:bank|office|school|clinic|helpdesk|company|supplier)\b.{0,70}\b(?:confirmed|verified|recognised)\b/i,
  /\b(?:knew|quoted|recited|had)\b.{0,32}\b(?:reference|appointment|ticket|employee|customer|booking|case number|last four|order number|address|account number)\b/i,
  /\b(?:dkim|spf|dmarc)\s*(?:[:=]\s*)?(?:pass(?:ed)?)\b/i,
];
const contrarySignals=[
  /\b(?:different|unfamiliar|changed|unrelated|wrong|misspelled|lookalike) (?:email |reply.to |web )?(?:address|domain|account|name|number|site|website|portal|link|organisation|company)\b/i,
  /\b(?:address|domain|number|sender|account|portal|link|name)\b.{0,30}\b(?:different|unfamiliar|changed|does(?:n.t| not) match|mismatch)\b/i,
  /\b(?:den(?:y|ies|ied)|never (?:sent|asked|called|wrote)|(?:did(?:n.t| not)|had(?:n.t| not)) (?:send|ask|call|write)|no (?:such )?(?:record|appointment|booking|case|request))\b/i,
  /\b(?:dkim|spf|dmarc)\s*(?:[:=]\s*)?(?:softfail|fail(?:ed)?)\b/i,
];
const dangerousRequests=[
  /\b(?:install|download|grant|enable|approve|give)\b.{0,45}\b(?:remote access|screen shar(?:e|ing)|remote desktop|anydesk|device management|login request)\b/i,
  /\b(?:send|upload|share|read|give)\b.{0,35}\b(?:passport|identity documents?|verification code|login code|security code|one.time (?:code|password))\b/i,
  /\b(?:keep (?:this|it) (?:a )?secret|do(?:n.t| not) tell anyone|do(?:n.t| not) call back)\b/i,
];

function hasCompetingSignals(question){
  const text=question.replace(/[’‘]/g,"'");
  const support=Number(familiarChannel.some(signal=>signal.test(text)))+corroboration.filter(signal=>signal.test(text)).length;
  if(!support)return false;
  if(contrarySignals.some(signal=>signal.test(text))||inspectMessageLinks(text).length)return true;
  return support>=2&&dangerousRequests.some(signal=>signal.test(text));
}

export function chooseCaseModel(settings,env,input){
  if(env.GUARDIAN_COMPLEX_MODEL!==WONDER_STANDARD||settings.provider!=='meta'
    ||settings.model!=='muse-spark-1.3'||new URL(settings.url).origin!=='https://api.meta.ai')return settings.model;
  // Each turn stands on its own. Prior context still goes to the private model
  // for assessment, but a difficult earlier turn cannot lock the route to Wonder.
  const question=input?.followUps?.at(-1)?.content??input?.message;
  if(typeof question!=='string')return settings.model;
  const verificationConflict=input?.identityVerification?.conflicts?.length>0;
  // New initial evidence may contradict an apparently matching identity. Later
  // turns re-evaluate the customer's current question; prior conflict is not sticky.
  const initialEvidence=!input?.followUps?.length&&(verificationConflict||(input?.evidence||[]).some(e=>typeof e.text==='string'&&hasCompetingSignals(e.text)));
  return comparesFinancialRecords(question,input)||hasCompetingSignals(question)||initialEvidence?WONDER_STANDARD:settings.model;
}

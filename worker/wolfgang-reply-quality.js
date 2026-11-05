// Only called on already recognised public turns. History stays in the worker.
const shortSocial=new Set(['greeting','meeting','wellbeing','socialReply','thanks','farewell','identity','abilities','joke','funfact']);
const welcoming=new Set(['greeting','meeting','socialReply']);
const acknowledgements={
 greeting:['Hi there!','Hello!'],
 meeting:['Nice to meet you.','Good to meet you.'],
 socialReply:['Glad to hear it.','Good to hear.'],
 thanks:['You’re welcome.','Any time.'],
 farewell:['Take care.','Goodbye for now.']
};
const inviteStart=/^(?:fancy\b|(?:do you )?want\b|would you like\b|(?:shall|should) (?:we|i)\b|(?:are you )?ready to\b|have you got\b|why not\b|let['’]s\b|try me\b)/i;
const inviteAction=/\b(?:try(?:ing)?|get(?:ting)? started|sign(?:ing)? up|register(?:ing)?|creat(?:e|ing) an? (?:free )?account|workspaces?|demo|bring(?:ing)?|past(?:e|ing)|send(?:ing)?|test(?:ing)?|shar(?:e|ing)|messages? (?:you|to)|(?:do|run|start) a check|take a look)\b/i;
const sentences=text=>text.trim().split(/(?<=[.!?])\s+/u);
const isInvitation=text=>inviteStart.test(text)&&inviteAction.test(text);

const filler=/^(?:a|an|the|i|i'll|i'm|you|you'll|your|me|my|we|to|and|or|as|at|in|it|with|is|are|can|could|then|that|this|which|what|just)$/;
function words(sentence){
 const text=sentence.toLowerCase().replace(/[’‘]/g,"'").replace(/\b(?:do not|don't|no need to|needn't)\b/g,'not')
  .replace(/\b(?:choose|select)\b/g,'pick').replace(/\b(?:mailbox|inbox)\b/g,'inbox')
  .replace(/\b(?:linking|link|connecting|connect)\b/g,'link').replace(/\b(?:message|messages)\b/g,'message');
 return new Set((text.match(/[\p{L}\d']+/gu)||[]).filter(word=>!filler.test(word)));
}
function echoes(candidate,earlier){
 if(candidate===earlier)return true;
 const a=words(candidate),b=words(earlier);
 if(a.size<3||b.size<3)return false;
 // A new allowance or a negative answer is material even if every other word matches.
 const qualifiers=set=>[...set].filter(word=>/^(?:\d+|one|two|three|not|never|only|optional|required)$/.test(word)).sort().join(' ');
 if(qualifiers(a)!==qualifiers(b))return false;
 let common=0;
 for(const word of a)if(b.has(word))common++;
 return common/(a.size+b.size-common)>=.8;
}

// Preserve a requested navigation action, while stripping automatic sales links.
// The fallback is the caller's verified answer to THIS topic (or a greeting).
export function refinePublicReply({topic,reply,history=[],fallback=null,message='',requestedLink=false}){
 if(!topic||topic==='comparison'||topic==='advantage'||topic==='ongoing')return reply;
 const product=typeof fallback?.reply==='string'&&fallback.intent==='explaining';
 if(!product&&!shortSocial.has(topic)&&!topic.startsWith('about ')&&!topic.startsWith('favourite '))return reply;
 const previous=history.filter(turn=>turn.role==='assistant').slice(-3).flatMap(turn=>sentences(turn.content));
 const asksForLink=requestedLink||/\b(?:show me where|take me to|give me (?:the|a) link|send me (?:the|a) link|where (?:do|can) i (?:sign up|register|try|start))\b/i.test(message);
 const allowedLink=asksForLink||topic==='account'&&['/signup','/workspace'].includes(reply.link?.path);
 const parts=sentences(reply.reply);
 const removeInvite=!asksForLink&&(!welcoming.has(topic)||previous.some(isInvitation));
 if(removeInvite)while(parts.length&&isInvitation(parts.at(-1)))parts.pop();
 const repeated=parts.length>0&&parts.every(part=>previous.some(old=>echoes(part,old)));
 if(fallback&&(!parts.length||repeated)){
  return {...reply,reply:fallback.reply,intent:fallback.intent,link:allowedLink?reply.link:null,suggestions:[]};
 }
 // A short acknowledgement still answers a greeting or thanks if the entire
 // proposed reply was the same sales invitation the visitor just declined.
 const social=(!parts.length||repeated)&&acknowledgements[topic]?.find(line=>!previous.includes(line));
 return {...reply,reply:social||parts.join(' ')||reply.reply,link:allowedLink?reply.link:null,suggestions:allowedLink?reply.suggestions:[]};
}

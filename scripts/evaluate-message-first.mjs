// Read-only deterministic calibration. --live makes at most the explicitly
// selected number of private inference calls, using only fictional fixtures.
import {messageCases} from '../evaluation/message-cases.js';
import {messageFirstLook} from '../worker/message-first-look.js';
import {evaluateCase} from '../evaluation/runner.js';
import {analysisSettings} from '../worker/model-provider.js';
const args=process.argv.slice(2),live=args[0]==='--live';
if(args.length&&!(live&&args.length===2&&/^\d+$/.test(args[1])&&+args[1]>=1&&+args[1]<=messageCases.length))throw Error('Use no arguments for local rules, or --live N for 1 to '+messageCases.length+' synthetic model calls.');
const ambiguous=new Set(['invoice-no-context','message-too-vague','unverified-phone']);
const groups={action:{count:0,matched:0},benign:{count:0,matched:0},ambiguous:{count:0,matched:0}};
for(const [id,message,topics] of messageCases){
 const group=groups[topics.length?'action':ambiguous.has(id)?'ambiguous':'benign'];group.count++;
 const got=messageFirstLook(message).map(s=>s.topic);
 if(JSON.stringify(got)===JSON.stringify(topics))group.matched++;
 else console.log(JSON.stringify({id,expected:topics,got}));
}
console.log(JSON.stringify({mode:'local-observations',groups,fixtures:messageCases.length,providerCalls:0,qualityMeasured:false}));
if(Object.values(groups).some(g=>g.matched!==g.count))process.exitCode=1;
if(live){
 const settings=analysisSettings(process.env);
 if(!settings.configured){console.error('Live comparison requires a configured private inference provider. No calls made.');process.exitCode=1;}
 else{
  const pool=messageCases.slice(0,+args[1]);console.log(JSON.stringify({mode:'private-inference',provider:settings.provider,model:settings.model,plannedCalls:pool.length}));
  for(const [id,message,topics] of pool){
   const item={id,message,channel:'message',evidence:[],expected:{statuses:topics.length?['caution']:['unresolved'],requiredEvidenceIds:[]},review:topics.length?'Check for the actual requested action and an independent next step.':'Do not authenticate or accuse the sender from this wording.'};
   // Fix service inputs across provider comparisons. Only the actual inference
   // endpoint is reachable; official guidance and URL intelligence are isolated.
   const result=await evaluateCase(item,{...process.env,GUARDIAN_LINK_REPUTATION:''},{fetcher:(url,init)=>init.method==='POST'&&url===settings.url?fetch(url,init):Promise.resolve(new Response(null,{status:503}))});
   console.log(JSON.stringify(result));if(!result.minimumChecksPassed)process.exitCode=1;
  }
 }
}

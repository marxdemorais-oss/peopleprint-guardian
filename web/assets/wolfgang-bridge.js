import {DIRECTOR_VERSION,validateDirectorCommand} from './wolfgang-director.js';
// The model chooses bounded direction, never executable animation code.
// This bridge knows request lifecycles; the motion controller knows movement.
const REQUEST_ID=/^[a-zA-Z0-9:_-]{1,96}$/;
const USER_CUES={
  'message-input':{intent:'attending',target:'viewer',intensity:.25,durationMs:1800},
  'case-selected':{intent:'attending',target:'viewer',intensity:.3,durationMs:2400},
  'evidence-changed':{intent:'attending',target:'evidence',intensity:.3,durationMs:2400},
  'evidence-selected':{intent:'explaining',target:'evidence',intensity:.45,durationMs:3200},
  'question':{intent:'asking',target:'viewer',intensity:.35,durationMs:3000},
  'manual-route':{intent:'reassuring',target:'viewer',intensity:.3,durationMs:3200}
};
const INVALIDATING_ACTIONS=new Set(['message-input','case-selected','evidence-changed']);
let instanceSequence=0;
function browserEmit(detail){
  if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('guardian:reaction',{detail}));
}
function browserMotion(detail){if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent('guardian:motion',{detail}));}

/**
 * connect begin/complete/fail/cancel to actual request lifecycles, not fake timers.
 * emit(detail) is injectable for a non-DOM renderer or tests. No network is used.
 * Request IDs must be fresh for every request. A bounded replay cache rejects
 * accidental reuse of the latest 256 IDs; it is not an authentication mechanism.
 */
export function createWolfgangBridge({emit=browserEmit,emitMotion=browserMotion}={}){
  const instanceId=typeof crypto!=='undefined'&&crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+'-'+(++instanceSequence);
  let active=null,eventSequence=0,motionSequence=0,directing=false;
  const recent=new Set();
  function cue(values){
    const detail={...values,eventId:'wg-'+instanceId+'-'+(++eventSequence)};
    // Character-rendering failures must not turn a successful assessment into an error.
    try{emit(Object.freeze(detail));}catch{}
    return true;
  }
  function isCurrent(id){return active!==null&&id===active;}
  const motionId=()=> 'wg-'+instanceId+'-motion-'+(++motionSequence);
  function stopDirection(){if(!directing)return;directing=false;try{emitMotion(Object.freeze({version:DIRECTOR_VERSION,id:motionId(),mode:'cancel'}));}catch{}}
  function direct(value,caution=false){if(!value)return false;const command=validateDirectorCommand({...value,id:motionId()},{caution});if(!command)return false;try{emitMotion(command);directing=command.mode!=='cancel';}catch{}return true;}
  return Object.freeze({
    begin(id){
      if(typeof id!=='string'||!REQUEST_ID.test(id)||recent.has(id))return false;
      recent.add(id);if(recent.size>256)recent.delete(recent.values().next().value);
      stopDirection();active=id;
      return cue({intent:'thinking',target:'evidence',intensity:.3,durationMs:12000});
    },
    complete(id,result){
      if(!isCurrent(id))return false;
      if(!result||!['caution','consistent','unresolved'].includes(result.status)||!Array.isArray(result.questions))return false;
      // The evidence verdict takes precedence over any model-supplied expression.
      // In particular, consistency is never portrayed as verified safety.
      let values;
      if(result.status==='caution')values={intent:'caution',target:'evidence',intensity:.5,durationMs:4200};
      else if(result.questions.length>0)values={intent:'asking',target:'viewer',intensity:.4,durationMs:3500};
      else values={intent:'explaining',target:'evidence',intensity:.4,durationMs:3600};
      active=null;const emitted=cue(values);direct(result.motion,result.status==='caution');return emitted;
    },
    conversationComplete(id,result){
      if(!isCurrent(id)||!result||typeof result.reply!=='string'||!['attending','asking','explaining','reassuring','caution'].includes(result.intent))return false;
      active=null;const emitted=cue({intent:result.intent,target:result.intent==='caution'?'evidence':'viewer',intensity:.4,durationMs:5000});direct(result.motion,result.intent==='caution');return emitted;
    },
    fail(id){
      if(!isCurrent(id))return false;
      active=null;stopDirection();return cue({intent:'attending',target:'viewer',intensity:.2,durationMs:2200});
    },
    cancel(id){
      if(!isCurrent(id))return false;
      active=null;stopDirection();return cue({intent:'attending',target:'viewer',intensity:.15,durationMs:1600});
    },
    user(action){
      if(typeof action!=='string'||!Object.hasOwn(USER_CUES,action))return false;
      if(INVALIDATING_ACTIONS.has(action)){active=null;stopDirection();}
      // Preserve the actual processing state when merely inspecting a record.
      if(active)return false;
      return cue(USER_CUES[action]);
    },
    isCurrent
  });
}

export const wolfgangBridge=createWolfgangBridge();

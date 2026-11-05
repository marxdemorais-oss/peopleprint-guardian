// Shared model/server/renderer boundary. These are desired motions, never code
// or unbounded joint angles. The rig remains responsible for physical limits.
export const DIRECTOR_VERSION='wolfgang.director.v1';
export const DIRECTOR_GESTURES=Object.freeze(['hello','open_palm','acknowledge','thinking','hand_on_hip','relaxed','attentive']);
export const DIRECTOR_HANDS=Object.freeze(['relaxed','open','soft_fist','point']);
const ID=/^[A-Za-z0-9:_-]{1,96}$/;
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const keys=(value,allowed)=>object(value)&&Object.keys(value).every(key=>allowed.includes(key));
const number=(value,min,max)=>typeof value==='number'&&Number.isFinite(value)&&value>=min&&value<=max;
export function validateDirectorCommand(value,{caution=false}={}){
 if(!keys(value,['version','id','mode','steps'])||value.version!==DIRECTOR_VERSION||typeof value.id!=='string'||!ID.test(value.id)||!['replace','queue','cancel'].includes(value.mode))return null;
 if(value.mode==='cancel')return value.steps===undefined?Object.freeze({version:DIRECTOR_VERSION,id:value.id,mode:'cancel'}):null;
 if(!Array.isArray(value.steps)||!value.steps.length||value.steps.length>8)return null;
 const steps=[];
 for(const source of value.steps){
  if(!keys(source,['gesture','tempo','intensity','holdMs','gaze','posture','hands','arms'])||!DIRECTOR_GESTURES.includes(source.gesture))return null;
  // A model's performance direction cannot soften a warning into a welcome.
  if(caution&&!['relaxed','attentive','acknowledge'].includes(source.gesture))return null;
  const tempo=source.tempo??1,intensity=source.intensity??.5,holdMs=source.holdMs??1000;
  if(!number(tempo,.85,1.35)||!number(intensity,0,1)||!number(holdMs,0,8000))return null;
  const step={gesture:source.gesture,tempo,intensity,holdMs};
  if(source.gaze!==undefined){if(!keys(source.gaze,['x','y'])||!number(source.gaze.x,-1,1)||!number(source.gaze.y,-1,1))return null;step.gaze=Object.freeze({x:source.gaze.x,y:source.gaze.y});}
  if(source.posture!==undefined){if(!keys(source.posture,['turn','shift']))return null;const turn=source.posture.turn??0,shift=source.posture.shift??0;if(!number(turn,-.08,.08)||!number(shift,-.017,.017))return null;step.posture=Object.freeze({turn,shift});}
  if(source.hands!==undefined){if(!keys(source.hands,['left','right'])||!Object.keys(source.hands).length)return null;const hands={};for(const side of ['left','right'])if(source.hands[side]!==undefined){if(!DIRECTOR_HANDS.includes(source.hands[side]))return null;hands[side]=source.hands[side];}step.hands=Object.freeze(hands);}
  if(source.arms!==undefined){
   if(caution||!['attentive','relaxed'].includes(source.gesture)||!keys(source.arms,['left','right'])||!Object.keys(source.arms).length)return null;
   const arms={};
   for(const [side,reach] of Object.entries(source.arms)){
    if(!keys(reach,['lift','forward','outward'])||!['lift','forward','outward'].every(axis=>number(reach[axis],0,1)))return null;
    arms[side]=Object.freeze({lift:reach.lift,forward:reach.forward,outward:reach.outward});
   }
   step.arms=Object.freeze(arms);
  }
  steps.push(Object.freeze(step));
 }
 return Object.freeze({version:DIRECTOR_VERSION,id:value.id,mode:value.mode,steps:Object.freeze(steps)});
}

// A provider may suggest motion; invalid optional direction is omitted while
// its independently validated text/assessment remains usable.
export const DIRECTOR_MODEL_INSTRUCTIONS=`You may optionally add motion using this JSON shape: {"version":"wolfgang.director.v1","id":"reply-motion","mode":"replace","steps":[{"gesture":"attentive","tempo":1,"intensity":0.4,"holdMs":1200,"gaze":{"x":0,"y":0},"posture":{"turn":0,"shift":0},"hands":{"right":"relaxed"}}]}. Use at most three subtle steps for one reply. Available gestures: hello, open_palm, acknowledge, thinking, hand_on_hip, relaxed, attentive. tempo must be 0.85–1.35, intensity 0–1, holdMs 0–8000, gaze x/y −1–1, posture turn −0.08–0.08 radians and shift −0.017–0.017 metres. For a custom movement on relaxed or attentive, arms.left and arms.right can each specify lift, forward and outward, all numbers from 0 to 1. Omit arms on warnings. Each optional hand may be relaxed, open, soft_fist or point. Do not add fields, animation code, joint rotations, URLs or instructions. Use only relaxed, attentive or acknowledge for caution. Motion expresses the manner of the answer; it never changes the evidence judgement or proves that a check occurred. Omit motion when no gesture would help.`;

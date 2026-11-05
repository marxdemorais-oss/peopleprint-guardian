import test from 'node:test';
import assert from 'node:assert/strict';
import {createMotionController,INTENTS} from '../web/assets/wolfgang-motion.js';
import {bindPoint,deformPoint,createRigMesh,projectRig} from '../web/assets/wolfgang-rig.js';

function seeded(seed){let state=seed>>>0;return ()=>{state+=0x6D2B79F5;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};}
const limits={head:.06,neck:.025,spine:.015,leftUpper:.04,leftLower:.09,leftHand:.07,rightUpper:.04,rightLower:.06,rightHand:.05,shift:.005,gazeX:1,gazeY:.7,breathe:1,blink:1};
function bounded(pose,label){for(const [key,limit] of Object.entries(limits)){assert(Number.isFinite(pose[key]),`${label}: ${key} must be finite`);assert(Math.abs(pose[key])<=limit+1e-10,`${label}: ${key}=${pose[key]} exceeds ${limit}`);}assert(pose.blink>=0,`${label}: eyelid state must not be negative`);}
function run(controller,seconds,step=.05){let pose;for(let t=0;t<seconds;t+=step)pose=controller.tick(step);return pose;}

test('two-hour active motion remains finite and within conservative joint limits',()=>{
  const motion=createMotionController({random:seeded(73521)});let event=0;
  for(let step=0;step<144000;step++){
    if(step%431===0)motion.react({intent:INTENTS[event%INTENTS.length],intensity:event%2,durationMs:15000,eventId:`long-${event++}`,target:'evidence'});
    if(step%797===0)motion.attend(Math.sin(step)*3,Math.cos(step)*3);
    bounded(motion.tick(.05),`step ${step}`);
  }
  assert(Math.abs(motion.snapshot().time-7200)<1e-6);
});

test('seeded motion is reproducible for debugging while independent seeds yield different trajectories',()=>{
  const a=createMotionController({random:seeded(12)}),b=createMotionController({random:seeded(12)}),c=createMotionController({random:seeded(9876)});
  let differing=0;
  for(let i=0;i<1200;i++){const pa=a.tick(.05),pb=b.tick(.05),pc=c.tick(.05);assert.deepEqual(pa,pb);if(JSON.stringify(pa)!==JSON.stringify(pc))differing++;}
  assert(differing>1190,'independent seeds should not replay the same trajectory');
});

test('pause freezes both active time and pose; resuming does not consume the hidden time',()=>{
  const a=createMotionController({random:seeded(29)}),reference=createMotionController({random:seeded(29)});run(a,8);run(reference,8);
  a.react({intent:'asking',eventId:'pause-event',durationMs:10000});reference.react({intent:'asking',eventId:'pause-event',durationMs:10000});
  a.setPaused(true);const before=a.snapshot();
  for(let i=0;i<100;i++)assert.deepEqual(a.tick(3600),before.pose);
  assert.deepEqual(a.snapshot(),before);
  a.setPaused(false);assert.deepEqual(a.tick(.016),reference.tick(.016));assert.equal(a.snapshot().intent,'asking');
});

test('untrusted or irregular time deltas cannot advance time backwards or poison a pose',()=>{
  const motion=createMotionController({random:seeded(31)});const before=motion.snapshot().time;
  for(const dt of [-5,NaN,Infinity,-Infinity,undefined,'10'])bounded(motion.tick(dt),'bad delta');
  assert.equal(motion.snapshot().time,before);
  motion.tick(86400);assert.equal(motion.snapshot().time,.05,'a wall-clock gap must be bounded rather than fast-forwarding the character');
});

test('gesture scheduler avoids adjacent repeats and keeps a bounded recent history',()=>{
  const motion=createMotionController({random:seeded(101)});let priorId=0,priorKind,gestures=0;
  for(let i=0;i<18000;i++){
    if(i%601===0)motion.react({intent:INTENTS[Math.floor(i/601)%INTENTS.length],eventId:`gesture-${i}`,durationMs:15000});
    motion.tick(.05);const state=motion.snapshot(),g=state.gesture;
    assert(state.recent.length<=6);
    if(g&&g.id!==priorId){assert.notEqual(g.kind,priorKind,`gesture ${g.id} immediately repeated ${g.kind}`);priorId=g.id;priorKind=g.kind;gestures++;assert(g.duration>=2.2&&g.duration<=4.8);}
  }
  assert(gestures>60,'simulation should exercise many independent gesture decisions');
});

test('unknown cues are ignored, repeated event IDs are idempotent, and malformed optional values stay bounded',()=>{
  const motion=createMotionController({random:seeded(41)}),before=motion.snapshot();
  for(const cue of [null,undefined,{},'thinking',{intent:'dance'},{intent:['attending']},{intent:'asking',eventId:42},{intent:'asking',eventId:'x'.repeat(121)}]){assert.equal(motion.react(cue),false);assert.deepEqual(motion.snapshot(),before);}
  assert.equal(motion.react({intent:'caution',eventId:'same-event',durationMs:1000}),true);run(motion,.5);const after=motion.snapshot();
  assert.equal(motion.react({intent:'explaining',eventId:'same-event'}),false);assert.deepEqual(motion.snapshot(),after);
  assert.equal(motion.react({intent:'asking',intensity:Infinity,durationMs:NaN,target:'script:arbitrary-selector'}),true);
  assert.equal(motion.snapshot().target,'viewer');for(let i=0;i<500;i++)bounded(motion.tick(.05),'malformed optional cue');
  assert.equal(motion.snapshot().intent,'attending','a malformed duration must not leave an indefinite reaction');
});

const poseCases=[
  {},{breathe:1},{breathe:-1},
  {head:.04,neck:.018,spine:.009,shift:.004,breathe:1},
  {head:-.04,neck:-.018,spine:-.009,shift:-.004,breathe:-1},
  {leftUpper:-.025,leftLower:.07,leftHand:-.055,head:-.02,breathe:1},
  {rightUpper:-.025,rightLower:-.045,rightHand:.035,breathe:-1},
  {head:.035,neck:-.012,spine:.007,shift:.004},
  {head:-.035,neck:.012,spine:-.007,shift:-.004}
];

test('rig keeps the soles anchored across representative upper-body poses',()=>{
  for(const [index,pose] of poseCases.entries())for(const [x,y] of [[.29,.96],[.35,.98],[.48,.93],[.58,.94],[.69,.94]]){
    const p=deformPoint(bindPoint(x,y),pose);
    assert(Math.hypot(p[0]-x,p[1]-y)<1e-9,`pose ${index}: sole ${x},${y} moved to ${p}`);
  }
});

test('representative articulated poses do not invert any textured triangle',()=>{
  const mesh=createRigMesh(32,48);
  const neutral=projectRig(mesh,{});for(let i=0;i<mesh.points.length;i++){assert(Math.abs(neutral[i][0]-mesh.points[i].x)<1e-12);assert(Math.abs(neutral[i][1]-mesh.points[i].y)<1e-12);}
  for(const [poseIndex,pose] of poseCases.entries()){
    const points=projectRig(mesh,pose);
    for(let i=0;i<mesh.indices.length;i+=3){const [a,b,c]=mesh.indices.slice(i,i+3).map(id=>points[id]);const area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);assert(Number.isFinite(area)&&area>1e-10,`pose ${poseIndex}, triangle ${i/3}: signed area ${area}; indices ${mesh.indices.slice(i,i+3)}`);}
  }
});

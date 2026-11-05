import {Quaternion,Vector3} from 'three';
import {createBodySupport} from './wolfgang-support.js';
import {createArmatureControl} from './wolfgang-armature.js';
import {createShoulderCaps} from './wolfgang-shoulder-caps.js';
import {createJointInteriors} from './wolfgang-joint-interiors.js';
import {createHeadGaze} from './wolfgang-gaze.js';
import {createEyelids} from './wolfgang-eyelids.js';
import {createHandContact} from './wolfgang-hand-contact.js';
import {createExpressionContact} from './wolfgang-expression-contact.js';
import greetingPose from './reconstruction/greeting-pose.json';
import {validateDirectorCommand,DIRECTOR_VERSION} from '../web/assets/wolfgang-director.js';
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
const ease=t=>{t=clamp(t);return t*t*t*(t*(t*6-15)+10);};
// A shared, finite stance adjustment eases into a small settling tail. Hands
// follow the same chest frame; no independent joint wobble or vertical bob.
const stanceSettle=t=>{const u=Math.max(0,t)*5;return 1-(1+u+u*u/2)*Math.exp(-u);};
const Y=new Vector3(0,1,0);
const validIntents=new Set(['attending','thinking','asking','explaining','reassuring','caution']);
const welcomes=['hello','open_palm','acknowledge'];
const greetings=['hello','open_palm','acknowledge','thinking','hand_on_hip'];
// Large arm poses belong to a real interaction, not an unattended showreel.
const idlePoses=['relaxed','attentive'];
export function createPerformance(root,{random=Math.random}={}){
 const bones=new Map();root.traverse(o=>{if(o.isBone)bones.set(o.name.replace(/^mixamorig:?/,''),{bone:o,q:o.quaternion.clone(),p:o.position.clone()});});
 const support=createBodySupport(root,bones),hip=bones.get('Hips'),head=bones.get('Head').bone;
 createJointInteriors(root);
 const articulation=createArmatureControl(root,bones,support.frame,support.orient);
 // Cache the soft, slightly staggered finger curl once in local joint space.
 const restingDigits=[];
 for(const side of ['Left','Right']){
  articulation.handExpression(side,'open',side==='Right'?.53:.47);
  for(const [key,b] of bones)if(key.startsWith(side+'Hand')&&key!==side+'Hand'){
   restingDigits.push([b.bone,b.bone.quaternion.clone()]);b.bone.quaternion.copy(b.q);
  }
 }
 const expressionContact=createExpressionContact(root,support);let expression=null,expressionWeight=0;
 const handContact=createHandContact(support,root);let contactState=[0,0];
 const shoulderCaps=createShoulderCaps(root),gaze=createHeadGaze(head,support.orient),eyelids=createEyelids(root);
 let blink=0,blinkStart=-1,blinkDuration=.23,nextBlink=3.1;
 // A separate stream keeps blink timing independent of gesture selection.
 let blinkSeed=(Math.random()*4294967295)>>>0;const blinkRandom=()=>{blinkSeed=(1664525*blinkSeed+1013904223)>>>0;return blinkSeed/4294967296;};

 const capture=()=>new Map([...bones].map(([n,b])=>[n,b.bone.quaternion.clone()]));
 const reset=()=>{for(const b of bones.values()){b.bone.quaternion.copy(b.q);b.bone.position.copy(b.p);}};
 const recent=[],recentIdle=[],eventIds=[],directorIds=[];
 let directorQueue=[],directorStatus='idle',directorId=null,gestureWeight=0;
 const chest=support.bone('Spine2');
 // Plan wrists and elbow poles relative to the chest, so an interrupted action
 // follows the body instead of rotating the hands through its armour.
 function channels(weights=contactState,canonical=true){
  const f=support.frame(chest),inv=f.q.clone().invert();
  return ['Left','Right'].map((side,i)=>{
   const hand=support.frame(support.bone(side+'Hand')),elbow=support.frame(support.bone(side+'ForeArm')),shoulder=support.frame(support.bone(side+'Arm')).p;
   if(canonical&&weights[i]>0){
    const c=contactCorrection(side,i,f,shoulder),weight=weights[i];
    hand.p.addScaledVector(c.translation,-weight);hand.q.premultiply(new Quaternion().slerp(c.rotation,weight).invert());
    const axis=support.frame(support.bone(side+'Hand')).p.sub(shoulder).normalize(),radial=elbow.p.clone().sub(shoulder);radial.addScaledVector(axis,-radial.dot(axis)).normalize();
    radial.applyQuaternion(new Quaternion().slerp(c.bend,weight).invert());elbow.p.copy(shoulder).addScaledVector(radial,.1);
   }
   return {w:hand.p.sub(f.p).applyQuaternion(inv),e:elbow.p.sub(f.p).applyQuaternion(inv),q:inv.clone().multiply(hand.q),contact:weights[i]};
  });
 }
 const referenceChest=support.frame(chest),referenceChestQ=referenceChest.q;
 const referenceInverse=referenceChestQ.clone().invert();
 const referenceContacts=['Left','Right'].map(side=>{const c=handContact.target(side),axis=c.w.clone().sub(support.frame(support.bone(side+'Arm')).p).normalize();c.pole.addScaledVector(axis,-c.pole.dot(axis)).normalize();return {w:c.w.sub(referenceChest.p).applyQuaternion(referenceInverse),q:referenceInverse.clone().multiply(c.q),pole:c.pole.applyQuaternion(referenceInverse)};});
 function contactCorrection(side,i,chestFrame,shoulder){
  const live=handContact.target(side),ref=referenceContacts[i],refW=ref.w.clone().applyQuaternion(chestFrame.q).add(chestFrame.p),refQ=chestFrame.q.clone().multiply(ref.q),refPole=ref.pole.clone().applyQuaternion(chestFrame.q),axis=live.w.clone().sub(shoulder).normalize();
  const livePole=live.pole.addScaledVector(axis,-live.pole.dot(axis)).normalize();
  return {translation:live.w.sub(refW),rotation:live.q.multiply(refQ.invert()),bend:new Quaternion().setFromUnitVectors(refPole,livePole)};
 }
 const armReach=['Left','Right'].map(side=>{const shoulder=support.frame(support.bone(side+'Arm')).p,elbow=support.frame(support.bone(side+'ForeArm')).p,wrist=support.frame(support.bone(side+'Hand')).p;return {shoulder:shoulder.clone().sub(referenceChest.p).applyQuaternion(referenceInverse),radius:shoulder.distanceTo(elbow)+elbow.distanceTo(wrist)-.002,upper:shoulder.distanceTo(elbow),lower:elbow.distanceTo(wrist)};});
 // Blend the coupled source channels without adding synthetic detours. Elbow
 // bend directions are transported with the wrist axis to preserve the hinge.
 function blendChannels(a,b,t){return a.map((v,i)=>{
  const u=t,w=v.w.clone().lerp(b[i].w,u),e=v.e.clone().lerp(b[i].e,u),reach=armReach[i];
  const delta=w.clone().sub(reach.shoulder);if(delta.length()>reach.radius)w.copy(reach.shoulder).addScaledVector(delta.normalize(),reach.radius);
  // Interpolating elbow positions can cancel the pole vector and flip the
  // hinge plane. Parallel-transport the two measured bend directions, then
  // rotate between them around the actual shoulder-to-wrist axis.
  const axis=w.clone().sub(reach.shoulder).normalize(),aAxis=v.w.clone().sub(reach.shoulder).normalize(),bAxis=b[i].w.clone().sub(reach.shoulder).normalize();
  const radial=(ch,ax)=>{const r=ch.e.clone().sub(reach.shoulder);return r.addScaledVector(ax,-r.dot(ax)).normalize();};
  const aRadial=radial(v,aAxis),bRadial=radial(b[i],bAxis),referenceB=bRadial.clone().applyQuaternion(new Quaternion().setFromUnitVectors(bAxis,aAxis));
  const referenceAngle=Math.atan2(aAxis.dot(aRadial.clone().cross(referenceB)),aRadial.dot(referenceB));
  const ra=aRadial.applyQuaternion(new Quaternion().setFromUnitVectors(aAxis,axis)),rb=bRadial.applyQuaternion(new Quaternion().setFromUnitVectors(bAxis,axis));
  let angle=Math.atan2(axis.dot(ra.clone().cross(rb)),ra.dot(rb));while(angle-referenceAngle>Math.PI)angle-=Math.PI*2;while(angle-referenceAngle< -Math.PI)angle+=Math.PI*2;
  e.copy(reach.shoulder).addScaledVector(ra.applyQuaternion(new Quaternion().setFromAxisAngle(axis,angle*u)),.1);
  return {w,e,q:v.q.clone().slerp(b[i].q,u),contact:v.contact+(b[i].contact-v.contact)*u};
 });}
 let fromChannels=channels();
let clock=0,initialised=false,serial=0,action=null,pendingReaction=null,from=capture(),upper=from,look=[0,0],lookNow=[0,0],cue='attending',cueUntil=0,cueIntensity=.4,cueTarget='viewer',ackAt=-10;
 let glance=[0,0],glanceFrom=[0,0],glanceTo=[0,0],glanceAt=0,nextGlance=5;
 let nextAction=2+random()*4,shift=0,shiftFrom=0,shiftTo=0,turn=0,turnFrom=0,turnTo=0,shiftAt=0,shiftDuration=2.8,footOffsets=[[0,0,0],[0,0,0]],step=null,nextStep=24+random()*10,lastStep=1;
 const choose=(pool,history)=>{const allowed=pool.filter(n=>!history.includes(n));return allowed[Math.floor(random()*allowed.length)%allowed.length];};
 function begin(name,kind='idle',options={}){
  if(greetings.includes(name)){recent.push(name);if(recent.length>greetings.length-1)recent.shift();}
  from=capture();for(const name of ['Spine1','Spine2'])from.set(name,bones.get(name).q.clone());fromChannels=channels();action={name,kind,start:clock,enter:kind==='greeting'?1.25:1.8,hold:kind==='idle'?10+random()*16:1.2+random()*.65,exit:1.6,tempo:1.02+random()*.18,variant:{wave:.060+random()*.025,waveTurns:.85+random()*.4,lift:random()*.006,reach:(random()-.5)*.008,nod:.8+random()*.4}};serial++;
  if(['hello','open_palm','acknowledge'].includes(name)){action.source=name==='acknowledge'?null:name==='hello'?'side_wave':'hand_offer';action.enter=.18;action.hold=name==='hello'?3.95:name==='open_palm'?4.9:1.0;action.exit=.35;}
  if(['thinking','hand_on_hip'].includes(name)){action.source='body_contact';action.enter=.18;action.hold=name==='thinking'?10.2:8.6;action.exit=.35;}
  if(kind==='director'){action.tempo=options.tempo;action.holdExtra=options.holdMs/1000;action.hold+=action.holdExtra;action.directorId=options.commandId;action.strength=options.intensity;action.hands=options.hands;action.arms=options.arms;action.variant.wave=.055+.03*options.intensity;action.variant.nod*=.35+.65*options.intensity;}
  action.enter*=action.tempo;action.hold*=action.tempo;action.exit*=action.tempo;
  shiftFrom=shift;shiftTo=(random()<.5?-1:1)*(.008+random()*.009);turnFrom=turn;turnTo=(random()-.5)*.12;shiftAt=clock;shiftDuration=2.8+random();if(kind==='director'){shiftTo*=.35+.65*options.intensity;turnTo*=.35+.65*options.intensity;}if(options.posture){shiftTo=options.posture.shift??shiftTo;turnTo=options.posture.turn??turnTo;}if(options.gaze)look=[options.gaze.x,options.gaze.y];return true;
 }
 function relaxArms(){
  // Rest the measured finger pads against the real thigh surface. The wrist
  // follows a calibrated support frame, rather than being spread away from it.
  for(const [bone,q] of restingDigits)bone.quaternion.copy(q);
  support.refresh();for(const side of ['Left','Right']){
   const c=handContact.target(side);support.arm(side,c.w,c.pole);articulation.apply(side,c.q);
  }
 }
 function targetUpper(name,t,settling=false){
  const apex=name==='hello'?1.48:name==='open_palm'?1.88:name==='thinking'?3.18:name==='hand_on_hip'?2.78:Infinity;
  if(action?.holdExtra&&t>apex)t=Math.max(apex,t-action.holdExtra);
  const released=u=>{const value=action?.release?action.release.weight*(1-ease((clock-action.release.start)/action.release.duration)):u;gestureWeight=value;return value;};
  reset();relaxArms();const contacts=[1,1];expression=null;expressionWeight=0;
  if(name==='hello'){
   const resting=capture(),age=Math.max(0,t-.18),u=released(age<1.3?ease(age/1.3):age<2.45?1:1-ease((age-2.45)/1.5)),side='Right',shoulder=support.frame(support.bone('RightArm')).p,front=new Vector3(.89601797,0,-.44401779),goal=new Vector3(.035+(action?.variant.reach||0),.82+(action?.variant.lift||0),.205),axis=goal.clone().sub(shoulder).normalize(),pole=new Vector3(.055,.70,.18).sub(shoulder).applyAxisAngle(axis,-50*Math.PI/180);
   support.arm(side,goal,pole);const elbow=support.frame(support.bone('RightForeArm')).p;
   const wavePhase=clamp((age-1.3)/1.15),wave=age>1.3&&age<2.45?Math.sin(wavePhase*Math.PI*2*(action?.variant.waveTurns||1))*Math.sin(wavePhase*Math.PI)**2*(action?.variant.wave||.075):0;
   const wrist=goal.clone().sub(elbow).applyAxisAngle(front,wave).add(elbow);
   support.arm(side,wrist,elbow.clone().sub(shoulder));
   const fingers=support.frame(support.bone('RightHand')).p.sub(support.frame(support.bone('RightForeArm')).p).normalize();
   articulation.apply(side,articulation.targetHandQ(side,fingers,front));
   for(const [n,q]of Object.entries(greetingPose)){const key=n.replace(/^mixamorig:?/,'');if(/^RightHand(Index|Middle|Ring|Pinky|Thumb)/.test(key))bones.get(key)?.bone.quaternion.fromArray(q).normalize();}
   // Linked rotations make the elbow bend during the lift. The hand follows
   // the forearm; it is never independently flipped while the shoulder waits.
   for(const [name,b]of bones)if(/^Right(Arm|ForeArm|Hand)/.test(name))b.bone.quaternion.slerpQuaternions(resting.get(name),b.bone.quaternion.clone(),u);
   contacts[1]=1-u;support.refresh();
  }
  if(name==='open_palm'){
   const resting=capture(),age=Math.max(0,t-.18),u=released(age<1.7?ease(age/1.7):age<3.0?1:1-ease((age-3.0)/1.7)),front=new Vector3(.89601797,0,-.44401779),right=new Vector3(.44401779,0,.89601797),goal=front.clone().multiplyScalar(.10+(action?.variant.reach||0)+(action?.kind==='director'?(action.strength-.5)*.025:0)).addScaledVector(right,.095).add(new Vector3(0,.64,0)),shoulder=support.frame(support.bone('RightArm')).p,pole=front.clone().multiplyScalar(.06).addScaledVector(right,.10).add(new Vector3(0,-.16,0));
   support.arm('Right',goal,pole);const finger=goal.clone().sub(support.frame(support.bone('RightForeArm')).p).normalize();
   articulation.apply('Right',articulation.targetHandQ('Right',finger,Y));
   for(const [n,q]of Object.entries(greetingPose)){const key=n.replace(/^mixamorig:?/,'');if(/^RightHand(Index|Middle|Ring|Pinky|Thumb)/.test(key))bones.get(key)?.bone.quaternion.slerp(new Quaternion(...q),.65);}
   for(const [key,b]of bones)if(/^Right(Arm|ForeArm|Hand)/.test(key))b.bone.quaternion.slerpQuaternions(resting.get(key),b.bone.quaternion.clone(),u);
   contacts[1]=1-u;support.refresh();
  }
  if(name==='thinking'||name==='hand_on_hip'){
   const pose=expressionContact.poses[name];
   if(pose){const age=Math.max(0,t-.18),lift=name==='thinking'?3:2.6,hold=name==='thinking'?4.2:3.4,u=released(age<lift?ease(age/lift):age<lift+hold?1:1-ease((age-lift-hold)/lift));
    for(const [key,q]of Object.entries(pose.joints)){const b=bones.get(key);if(b){const blend=name==='thinking'&&/^RightHand(Index|Middle|Ring|Pinky|Thumb)/.test(key)?ease((u-.15)/.85):u;b.bone.quaternion.slerp(new Quaternion(...q),blend);}}
    contacts[1]=1-u;expression=name;expressionWeight=u;support.refresh();
   }
  }

  if(action?.kind==='director'&&action.arms&&name===action.name&&!settling){
   // Normalised destinations occupy a reachable envelope on each arm's own
   // side of the torso. Joint orientation, reach and return remain on the rig.
   const u=released(ease(t/1.45)),rest=capture(),forward=new Vector3(.89601797,0,-.44401779),out=new Vector3(.44401779,0,.89601797);
   for(const [i,side] of ['Left','Right'].entries()){
    const direction=action.arms[side.toLowerCase()];if(!direction)continue;
    const sign=side==='Right'?1:-1,shoulder=support.frame(support.bone(side+'Arm')).p;
    const goal=shoulder.clone().addScaledVector(Y,-.192+.23*direction.lift)
     .addScaledVector(forward,.050+.13*direction.forward).addScaledVector(out,sign*(.032+.064*direction.outward));
    const pole=out.clone().multiplyScalar(sign*.7).addScaledVector(Y,-.68).addScaledVector(forward,-.32);
    support.arm(side,goal,pole);articulation.apply(side,articulation.neutralOrientation(side));
    for(const [joint,b] of bones)if(joint===side+'Arm'||joint===side+'ForeArm'||joint.startsWith(side+'Hand')){
     b.bone.quaternion.slerpQuaternions(rest.get(joint),b.bone.quaternion.clone(),u);
    }
    contacts[i]=1-u;
   }
   support.refresh();
  }
  return {q:capture(),arms:channels(contacts,false)};
 }
 function greet(){
  directorQueue=[];if(directorId)directorStatus='interrupted';
  ackAt=clock;const name=choose(welcomes,recent.slice(-2));
  if(action?.kind==='greeting'||action?.source){
   // Acknowledge immediately, then finish the coordinated arm phrase. Keep
   // only the most recent requested reaction instead of stacking fast resets.
   pendingReaction={name,kind:'greeting'};serial++;return {name,serial,queued:true};
  }
  begin(name,'greeting');return {name,serial};
 }
 function arrive(previous){
  const name=choose(welcomes,previous?[previous]:[]);
  ackAt=clock;begin(name,'greeting');shiftTo*=.5;turnTo*=.6;return {name,serial,arrival:true};
 }
 function tick(dt){
  dt=clamp(Number.isFinite(dt)?dt:0,0,.12);if(initialised&&dt===0)return snapshot();initialised=true;clock+=dt;
  if(!action&&!directorQueue.length&&clock>=nextAction){
   // Quiet stance changes remain continuous between deliberate reactions.
   const name=choose(idlePoses,recentIdle);recentIdle.push(name);if(recentIdle.length>1)recentIdle.shift();
   begin(name);
  }
  if(clock>=cueUntil){cue='attending';cueIntensity=.4;cueTarget='viewer';}
  const age=action?clock-action.start:0,phraseAge=action?age/action.tempo:age;
  let target=targetUpper(action?.name||'relaxed',phraseAge),amount=action?ease(age/action.enter):1;
  if(action&&!action.release&&age>action.enter+action.hold){const restTarget=targetUpper('relaxed',age,true);const leave=ease((age-action.enter-action.hold)/action.exit);for(const [n,q]of target.q)q.slerp(restTarget.q.get(n),leave);target.arms=blendChannels(target.arms,restTarget.arms,leave);}
  for(const [n,b]of bones)b.bone.quaternion.slerpQuaternions(from.get(n)||b.q,target.q.get(n)||b.q,amount);
  const armPlan=blendChannels(fromChannels,target.arms,amount);
  upper=capture();
  if(action&&(action.release?clock-action.release.start>=action.release.duration:age>=action.enter+action.hold+action.exit)){if(!directorQueue.length){if(directorStatus==='returning')directorStatus='cancelled';else if(action.kind==='director'&&directorStatus==='playing')directorStatus='complete';}action=null;from=upper;nextAction=clock+7+random()*11;}
  const settle=stanceSettle((clock-shiftAt)/shiftDuration);shift=shiftFrom+(shiftTo-shiftFrom)*settle;turn=turnFrom+(turnTo-turnFrom)*settle;
  if(!step&&clock>=nextStep&&action?.kind!=='greeting'&&expressionWeight<.01){const i=1-lastStep;step={i,start:clock,from:footOffsets[i][0],to:footOffsets[i][0]>.008?-.014:.018,duration:1.5};lastStep=i;}
  if(step){const t=clamp((clock-step.start)/step.duration),i=step.i;footOffsets[i][0]=step.from+(step.to-step.from)*ease(t);footOffsets[i][1]=Math.sin(Math.PI*t)**2*.013;if(t===1){footOffsets[i][1]=0;step=null;nextStep=clock+28+random()*16;}}
  // Shared pelvis + grounded leg chains: arms never animate on an unrelated root.
  hip.bone.position.copy(hip.p);hip.bone.position.z+=shift;
  bones.get('Spine1').bone.quaternion.multiply(new Quaternion().setFromAxisAngle(Y,turn*.4));
  bones.get('Spine2').bone.quaternion.multiply(new Quaternion().setFromAxisAngle(Y,turn*.6));
  support.feet(footOffsets);
  if(clock>=nextGlance){glanceFrom=[...glance];glanceTo=[(random()-.5)*.09,(random()-.5)*.035];glanceAt=clock;nextGlance=clock+4.5+random()*8.5;}
  glance=glanceFrom.map((v,i)=>v+(glanceTo[i]-v)*ease((clock-glanceAt)/2));
  const follow=1-Math.exp(-dt*2.5);lookNow=lookNow.map((v,i)=>v+(look[i]-v)*follow);
  const ack=clock-ackAt,nodDuration=action?.name==='acknowledge'?1.1:.7,nod=ack>=0&&ack<nodDuration?Math.sin(ack/nodDuration*Math.PI)*(action?.name==='acknowledge'?.11:.045):0;
  gaze.update({yaw:lookNow[0]*.07+glance[0]+(cueTarget==='evidence'?-.025*cueIntensity:0),pitch:-lookNow[1]*.03+glance[1]-(expression==='thinking'?.12*expressionWeight:0),nod:nod*(action?.variant.nod||1)+(expression==='thinking'?.02*expressionWeight:0)},dt);
  support.refresh();const chestNow=support.frame(chest);
  for(const [i,side]of ['Left','Right'].entries()){
   const plan=armPlan[i],w=plan.w.clone().applyQuaternion(chestNow.q).add(chestNow.p),e=plan.e.clone().applyQuaternion(chestNow.q).add(chestNow.p),shoulder=support.frame(support.bone(side+'Arm')).p;
   const handQ=chestNow.q.clone().multiply(plan.q),pole=e.sub(shoulder),weight=plan.contact;
   if(weight>0){
    const c=contactCorrection(side,i,chestNow,shoulder);
    w.addScaledVector(c.translation,weight);handQ.premultiply(new Quaternion().slerp(c.rotation,weight));pole.applyQuaternion(new Quaternion().slerp(c.bend,weight));
   }
   if(side==='Right'&&expression&&expressionWeight>0)expressionContact.follow(expression,chestNow,expressionWeight,w,handQ);
   handContact.slide(side,w,dt,weight);
   support.arm(side,w,pole,1,{dt,commit:true});articulation.apply(side,handQ,{dt,commit:true});
   const handPreset=action?.hands?.[side.toLowerCase()]||(action?.name==='open_palm'&&side==='Right'?'open':null);if(handPreset&&weight<.05&&expressionWeight<.01)articulation.handExpression?.(side,handPreset,ease((.05-weight)/.05),{blendFromCurrent:true});
   if(weight>0&&weight<.999999){
    for(let pass=0;pass<3;pass++){
     const correction=handContact.padCollisionCorrection(side);if(correction.lengthSq()<1e-10)break;
     w.add(correction);support.arm(side,w,pole,1,{dt:0,commit:true});articulation.apply(side,handQ,{dt:0,commit:true});
    }
   }
   if(weight>.999999){
    // Contact is a constraint on the actual hand surface. When its rotation
    // is still settling, update the wrist endpoint against that actual pose
    // without granting another angular-rate step or moving the support patch.
    for(let pass=0;pass<8;pass++){
     const correction=handContact.correction(side);if(correction.lengthSq()<1e-10)break;correction.multiplyScalar(.5);
     w.add(correction);support.arm(side,w,pole,1,{dt:0,commit:true});articulation.apply(side,handQ,{dt:0,commit:true});
    }
   }
   if(side==='Right'&&expression&&expressionWeight>.9){
    const contactBlend=ease((expressionWeight-.9)/.1);
    for(let pass=0;pass<6;pass++){const correction=expressionContact.correction(expression);if(correction.lengthSq()<1e-10)break;w.addScaledVector(correction,.65*contactBlend);support.arm(side,w,pole,1,{dt:0,commit:true});articulation.apply(side,handQ,{dt:0,commit:true});}
   }
   contactState[i]=weight;
  }
  if(blinkStart<0&&clock>=nextBlink){blinkStart=clock;blinkDuration=.20+blinkRandom()*.06;}
  if(blinkStart>=0){const t=(clock-blinkStart)/blinkDuration;blink=t<.34?ease(t/.34):t<.48?1:1-ease((t-.48)/.52);if(t>=1){blink=0;blinkStart=-1;nextBlink=clock+2.7+blinkRandom()*4;}}
  eyelids.update(blink);
  shoulderCaps.update();root.updateMatrixWorld(true);
  if(!action&&directorQueue.length)startDirectedStep();
  if(!action&&pendingReaction){const next=pendingReaction;pendingReaction=null;if(next.kind==='greeting'||next.until>clock){begin(next.name,next.kind);ackAt=clock;}}
  return snapshot();
 }
 function startDirectedStep(){
  const next=directorQueue.shift();if(!next)return;directorId=next.commandId;directorStatus='playing';begin(next.gesture,'director',next);
 }
 function releaseCurrent(){
  if(!action||action.release)return;
  // Return along the same reviewed arm path. No raw pose reset, teleport or
  // unrelated follow-up gesture is allowed to cut across a moving hand.
  action.release={start:clock,weight:gestureWeight,duration:1.8};
 }
 function cancelDirection(){
  const active=action?.kind==='director'||action?.kind==='conversation';const hadDirection=active||directorQueue.length>0||pendingReaction?.kind==='conversation';
  directorQueue=[];pendingReaction=null;cue='attending';cueUntil=clock;cueIntensity=.4;cueTarget='viewer';
  if(hadDirection){directorStatus=active?'returning':'cancelled';if(active)releaseCurrent();}
  return hadDirection;
 }
 function direct(input){
  const command=validateDirectorCommand(input,{caution:cue==='caution'});if(!command||directorIds.includes(command.id))return false;
  const steps=command.steps||[],budgetSteps=command.mode==='queue'?[...directorQueue,...steps]:steps,seconds=budgetSteps.reduce((sum,step)=>sum+(step.gesture==='thinking'?10.73:step.gesture==='hand_on_hip'?9.13:step.gesture==='open_palm'?5.43:step.gesture==='hello'?4.48:5.25)+(step.holdMs/1000),0)*1.35;
  const returning=command.mode==='queue'&&action?.kind==='director'?Math.max(0,action.enter+action.hold+action.exit-(clock-action.start)):action?1.8:0;
  if(seconds+returning>90||(command.mode==='queue'&&directorQueue.length+steps.length>8))return false;
  directorIds.push(command.id);if(directorIds.length>128)directorIds.shift();
  if(command.mode==='cancel'){cancelDirection();directorId=command.id;if(directorStatus!=='returning')directorStatus='cancelled';return true;}
  if(command.mode==='replace'){directorQueue=[];pendingReaction=null;releaseCurrent();}
  directorQueue.push(...steps.map(step=>({...step,commandId:command.id})));directorId=command.id;directorStatus=action?'queued':'playing';
  if(!action)startDirectedStep();return true;
 }
 function react(detail){
  if(!detail||!validIntents.has(detail.intent))return false;
  if(detail.eventId!==undefined){if(typeof detail.eventId!=='string'||!detail.eventId||detail.eventId.length>120||eventIds.includes(detail.eventId))return false;eventIds.push(detail.eventId);if(eventIds.length>128)eventIds.shift();}
  directorQueue=[];if(action?.kind==='director'){releaseCurrent();directorStatus='interrupted';}
  cue=detail.intent;cueIntensity=Number.isFinite(detail.intensity)?clamp(detail.intensity):.4;cueTarget=detail.target==='evidence'?'evidence':'viewer';
  cueUntil=clock+clamp(Number.isFinite(detail.durationMs)?detail.durationMs/1000:5,1,15);
  const name=cue==='thinking'?'thinking':cue==='reassuring'?'acknowledge':cue==='explaining'||cue==='asking'?'open_palm':'attentive';
  if(action?.source||action?.kind==='greeting')pendingReaction={name,kind:'conversation',until:cueUntil};
  else begin(name,'conversation');
  return true;
 }
 function snapshot(){return {time:clock,phase:action?.kind||'idle',action:action?.name||null,actionTime:action?clock-action.start:0,serial,intent:cue,director:{version:DIRECTOR_VERSION,status:directorStatus,id:directorId,queued:directorQueue.length,current:action?.kind==='director'?action.name:null},cue:{intensity:cueIntensity,target:cueTarget,until:cueUntil},phrase:action?{tempo:action.tempo,...action.variant}:null,bones:bones.size,seat:0,seatStage:null,blink,stance:{shift,turn,movingFoot:step?['Left','Right'][step.i]:null},contacts:support.snapshot(),handContacts:handContact.snapshot(),bodyContacts:expression?{[expression]:expressionContact.snapshot(expression,expressionWeight)}:{},contactWeights:[...contactState],articulation:articulation.snapshot(),pendingGreeting:pendingReaction?.kind==='greeting'?pendingReaction.name:null};}
 // Present a solved resting pose on the very first render. Arrival begins from
 // this same pose; it no longer briefly shows the GLB's unrelated authoring pose.
 reset();support.feet(footOffsets);relaxArms();contactState=[1,1];from=capture();upper=from;fromChannels=channels();shoulderCaps.update();root.updateMatrixWorld(true);
 return {tick,greet,arrive,react,direct,cancelDirection,suspend:cancelDirection,attend(x,y){look=[clamp(x,-1,1),clamp(y,-1,1)];},snapshot,play(name){if(!['relaxed','attentive',...greetings].includes(name))return false;const kind=greetings.includes(name)?'greeting':'idle';if(action?.source){pendingReaction={name,kind};if(kind==='greeting')ackAt=clock;return true;}return begin(name,kind);}};
}

import {Matrix4,Quaternion,Vector3} from 'three';

const ease=t=>t*t*t*(t*(t*6-15)+10);
const X=new Vector3(1,0,0),Y=new Vector3(0,1,0),Z=new Vector3(0,0,1);

// Whole-body actions: transfer weight, take a small step, then settle.
// Feet have changing targets, but a supporting foot cannot slide while the
// other one steps. Character-space targets also survive viewer rotation.
export function createStandingMotion(root,bones,{random=Math.random}={}){
 const inverse=new Matrix4(),matrix=new Matrix4(),scale=new Vector3();
 const position=new Vector3(),rotation=new Quaternion(),q=new Quaternion();
 const bone=name=>bones.get(name)?.bone;
 const hips=bone('Hips'),hipRest=hips.position.clone();
 root.updateWorldMatrix(true,true);inverse.copy(root.matrixWorld).invert();
 function frame(object){
  object.updateWorldMatrix(true,false);
  matrix.multiplyMatrices(inverse,object.matrixWorld).decompose(position,rotation,scale);
  return {p:position.clone(),q:rotation.clone()};
 }
 function orient(object,target){
  const parent=frame(object.parent).q;
  object.quaternion.copy(parent.invert().multiply(target));
  object.updateWorldMatrix(false,false);
 }
 function align(object,from,to){
  const current=frame(object).q;
  q.setFromUnitVectors(from.normalize(),to.normalize());
  orient(object,current.premultiply(q));
 }
 const legs=['Left','Right'].map(side=>{
  const upper=bone(side+'UpLeg'),lower=bone(side+'Leg'),foot=bone(side+'Foot');
  const s=frame(upper).p,k=frame(lower).p,a=frame(foot);
  const axis=a.p.clone().sub(s).normalize();
  const pole=k.clone().sub(s);pole.addScaledVector(axis,-pole.dot(axis)).normalize();
  return {upper,lower,foot,anchor:a.p,home:a.p.clone(),orientation:a.q,rock:0,pole,
   thigh:s.distanceTo(k),shin:k.distanceTo(a.p)};
 });
 function solve(leg){
  const {upper,lower,foot,anchor,pole,thigh,shin}=leg;
  const s=frame(upper).p,k=frame(lower).p;
  const axis=anchor.clone().sub(s),distance=axis.length();axis.normalize();
  const along=(thigh*thigh-shin*shin+distance*distance)/(2*distance);
  const bend=Math.sqrt(Math.max(0,thigh*thigh-along*along));
  const perpendicular=pole.clone().addScaledVector(axis,-pole.dot(axis)).normalize();
  const knee=s.clone().addScaledVector(axis,along).addScaledVector(perpendicular,bend);
  align(upper,k.sub(s),knee.clone().sub(s));
  const actualKnee=frame(lower).p,actualAnkle=frame(foot).p;
  align(lower,actualAnkle.sub(actualKnee),anchor.clone().sub(actualKnee));
  orient(foot,leg.orientation.clone().premultiply(q.setFromAxisAngle(Z,leg.rock)));
 }

 const hipCentre=frame(hips).p;
 let phase='holding',elapsed=0,duration=.45,changes=0,lastStep=-1,step=null;
 let from={shift:0,forward:0,roll:0,turn:0},target={...from},pose={...from};
 function transition(name,next,seconds){phase=name;from={...pose};target=next;duration=seconds;}
 function hold(){phase='holding';duration=2.2+random()*2.8;}
 function newAction(){
  // No prerecorded cycle or fixed order: each action has new endpoints and
  // timing. Recent support and step history prevent repetitive foot shuffles.
  if(changes>=2||(changes>0&&random()<.35)){
   const moving=lastStep<0?(pose.shift>=0?0:1):1-lastStep;
   const support=1-moving,leg=legs[moving],supportLeg=legs[support];
   const destination=leg.home.clone();
   let forward=(random()-.5)*.09;
   if(Math.abs(destination.x+forward-leg.anchor.x)<.024){
    forward=leg.anchor.x>leg.home.x?-.035-random()*.01:.035+random()*.01;
   }
   destination.x+=forward;destination.z+=(random()-.5)*.024;
   step={moving,support,start:leg.anchor.clone(),end:destination,lift:.018+random()*.01,bodyStart:pose.forward};
   const side=support===1?1:-1;
   const supportShift=Math.max(-.055,Math.min(.065,(supportLeg.anchor.z-hipCentre.z)*.8));
   transition('preparing-step',{shift:supportShift,forward:pose.forward,roll:side*.018,
    turn:side*(.025+random()*.035)},.9+random()*.35);
  }else{
   const side=Math.abs(pose.shift)<.005?(random()<.5?-1:1):-Math.sign(pose.shift);
   transition('shifting',{shift:side*(.026+random()*.011),forward:pose.forward,roll:side*(.012+random()*.009),
    turn:(random()-.5)*.14},1.2+random()*.5);
   changes++;
  }
 }
 function advance(dt,paused){
  // A hello may pause a settled pose, but never freezes a raised foot in air.
  if(!paused||phase==='stepping'||phase==='settling'){
   elapsed+=dt;
   if(elapsed>=duration){
    elapsed-=duration;
    if(phase==='holding')newAction();
    else if(phase==='preparing-step'){
     pose={...target};phase='stepping';duration=.85+random()*.3;
    }else if(phase==='stepping'){
     legs[step.moving].anchor.copy(step.end);legs[step.moving].rock=0;
     lastStep=step.moving;changes=0;
     transition('settling',{shift:pose.shift*.45,forward:legs.reduce((sum,leg)=>sum+leg.anchor.x-leg.home.x,0)*.3,
      roll:pose.roll*.4,turn:pose.turn*.6},.8+random()*.35);
    }else{pose={...target};hold();}
   }
   if(phase==='stepping'){
    const t=Math.min(elapsed/duration,1),leg=legs[step.moving];
    leg.anchor.lerpVectors(step.start,step.end,ease(t));
    leg.anchor.y+=Math.sin(Math.PI*t)**2*step.lift;
    leg.rock=Math.sin(Math.PI*t)**2*.045;
    pose.forward=step.bodyStart+(step.end.x-step.start.x)*.18*ease(t);
   }else if(phase!=='holding'){
    const t=ease(Math.min(elapsed/duration,1));
    for(const key of Object.keys(pose))pose[key]=from[key]+(target[key]-from[key])*t;
   }
  }
  return {...pose,phase};
 }
 function apply(){
  root.updateWorldMatrix(true,false);
  inverse.copy(root.matrixWorld).invert();
  hips.position.copy(hipRest);hips.position.z+=pose.shift;hips.position.x+=pose.forward;
  hips.quaternion.multiply(q.setFromAxisAngle(X,pose.roll));
  // Lower the pelvis only as far as leg reach requires. No periodic root bob.
  // A small margin keeps the supporting knee from snapping fully straight.
  let lowerBy=0;
  for(const leg of legs){
   const s=frame(leg.upper).p,delta=s.clone().sub(leg.anchor);
   const reach=leg.thigh+leg.shin-.001;
   const available=Math.sqrt(Math.max(0,reach*reach-delta.x*delta.x-delta.z*delta.z));
   lowerBy=Math.max(lowerBy,delta.y-available);
  }
  hips.position.y-=lowerBy;
  for(const leg of legs)solve(leg);
  bone('Spine').quaternion.multiply(q.setFromAxisAngle(X,-pose.roll*.7));
  bone('Spine1').quaternion.multiply(q.setFromAxisAngle(Y,pose.turn*.45));
  bone('Spine2').quaternion.multiply(q.setFromAxisAngle(Y,pose.turn*.55));
  // Keep his attention towards the visitor while the shoulders turn slightly.
  bone('Neck').quaternion.multiply(q.setFromAxisAngle(Y,-pose.turn*.35));
  return {...pose,phase,lowerBy};
 }
 return {advance,apply,snapshot:()=>({...pose,phase,elapsed,duration,
  movingFoot:phase==='stepping'?['Left','Right'][step.moving]:null,
  feet:legs.map(leg=>leg.anchor.toArray())})};
}

import {Matrix4,Quaternion,Vector3} from 'three';

const EPS=1e-9,TAU=Math.PI*2,UP=new Vector3(0,1,0);
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const wrap=a=>((a+Math.PI)%TAU+TAU)%TAU-Math.PI;
function twistParts(q,axis){
 const projection=q.x*axis.x+q.y*axis.y+q.z*axis.z;
 const twist=new Quaternion(axis.x*projection,axis.y*projection,axis.z*projection,q.w);
 if(twist.lengthSq()<EPS)twist.identity();else twist.normalize();
 const angle=wrap(2*Math.atan2(twist.x*axis.x+twist.y*axis.y+twist.z*axis.z,twist.w));
 return {angle,swing:q.clone().multiply(twist.invert()).normalize()};
}
function basis(forward,across){
 const y=forward.clone().normalize(),x=across.clone().addScaledVector(y,-across.dot(y));
 if(x.lengthSq()<EPS){x.copy(Math.abs(y.y)<.9?UP:new Vector3(1,0,0));x.addScaledVector(y,-x.dot(y));}
 x.normalize();return new Matrix4().makeBasis(x,y,x.clone().cross(y).normalize());
}

/** Anatomical hand calibration and bounded forearm/wrist articulation.
 * Call after shoulder/elbow IK. All vectors/quaternions use the same character
 * frame supplied by support.frame/orient. ForeArmTwist carries the distal shell
 * and hand, leaving elbow bearings on ForeArm. It is reset to bind before each
 * solve, so repeated calls cannot accumulate pronation.
 */
export function createArmatureControl(root,bones,frame,orient,{
 maxForearmTwist=95*Math.PI/180,maxWristTwist=10*Math.PI/180,maxWristSwing=25*Math.PI/180,
}={}){
 const bone=name=>bones.get(name)?.bone;
 const controls={};
 for(const side of ['Left','Right']){
  const hand=bone(side+'Hand'),forearm=bone(side+'ForeArm'),twist=bone(side+'ForeArmTwist');
  const inv=frame(hand).q.clone().invert(),w=frame(hand).p;
  const forward=frame(bone(side+'HandMiddle1')).p.sub(w).applyQuaternion(inv).normalize();
  const across=frame(bone(side+'HandIndex1')).p.sub(frame(bone(side+'HandPinky1')).p).applyQuaternion(inv).normalize();
  controls[side]={hand,forearm,twist,forward,across,localBasisInverse:basis(forward,across).invert(),wristBind:hand.quaternion.clone(),twistBind:twist?.quaternion.clone(),last:null,runtime:null};
  controls[side].digits=['Index','Middle','Ring','Pinky'].map((finger,index)=>({finger,index,joints:[1,2,3].map(j=>{const joint=bone(side+'Hand'+finger+j),child=bone(side+'Hand'+finger+(j+1));return {joint,child,bind:joint.quaternion.clone(),stage:j};})}));
 }
 function orientation(side,forward,thumbDirection){
  return new Quaternion().setFromRotationMatrix(basis(forward,thumbDirection).multiply(controls[side].localBasisInverse)).normalize();
 }
 function targetHandQ(side,fingersDirection,palmNormal){
  // Index→pinky ordering is mirrored across hands. A physical palm normal
  // therefore has opposite sign in the two knuckle-derived local bases.
  const geometricNormal=palmNormal.clone().multiplyScalar(side==='Left'?-1:1);
  return orientation(side,fingersDirection,fingersDirection.clone().cross(geometricNormal));
 }
 function neutralOrientation(side){
  const c=controls[side],right=frame(bone('RightArm')).p.sub(frame(bone('LeftArm')).p);right.y=0;right.normalize();
  const front=UP.clone().cross(right).normalize(),fingerDirection=frame(c.hand).p.sub(frame(c.forearm).p).normalize();
  // In a relaxed stance both thumbs point forward, and fingers extend the
  // forearm. This uses actual knuckle geometry and avoids mirrored-palm signs.
  return orientation(side,fingerDirection,front);
 }
 function handExpression(side,preset,amount=1,{blendFromCurrent=false}={}){
  const c=controls[side];
  if(!c||!['relaxed','open','soft_fist','point'].includes(preset)||!Number.isFinite(amount))return false;
  const weight=clamp(amount,0,1);if(weight===0)return true;
  const handFrame=frame(c.hand),forward=c.forward.clone().applyQuaternion(handFrame.q),across=c.across.clone().applyQuaternion(handFrame.q);
  const palm=across.clone().cross(forward).multiplyScalar(side==='Left'?-1:1).normalize();
  const baseline=new Map(c.digits.flatMap(digit=>digit.joints.map(item=>[item.joint,blendFromCurrent?item.joint.quaternion.clone():item.bind])));
  // Rebuild from the calibrated joint pose on every call. AI selects a finite
  // shape/weight; it cannot accumulate arbitrary joint angles between frames.
  for(const digit of c.digits)for(const item of digit.joints)item.joint.quaternion.copy(item.bind);
  root.updateMatrixWorld(true);
  for(const digit of c.digits){
   const open=preset==='open'||preset==='point'&&digit.finger==='Index',closed=preset==='soft_fist'||preset==='point'&&digit.finger!=='Index';
   if(!open&&!closed)continue;
   for(const {joint,child,stage}of digit.joints){
    const current=frame(child).p.sub(frame(joint).p).normalize();
    let delta;
    if(open){
     const desired=forward.clone().addScaledVector(across,(1.5-digit.index)*.035).normalize();
     delta=new Quaternion().setFromUnitVectors(current,desired);
     const angle=new Quaternion().angleTo(delta),limit=stage===1?.45:.60;
     delta.slerpQuaternions(new Quaternion(),delta,angle>limit?limit/angle:1);
    }else{
     const axis=current.clone().cross(palm).normalize(),angle=[0,.28,.43,.30][stage]*(.96+digit.index*.025);
     delta=new Quaternion().setFromAxisAngle(axis,angle);
    }
    orient(joint,frame(joint).q.premultiply(delta));
   }
  }
  for(const digit of c.digits)for(const {joint}of digit.joints)joint.quaternion.slerpQuaternions(baseline.get(joint),joint.quaternion.clone(),weight);
  // Keep the separately calibrated thumb opposition. Forcing the thumb into
  // the same four-finger curl is the common source of a crushed-looking palm.
  root.updateMatrixWorld(true);return true;
 }
 function apply(side,desired,{dt=0,commit=false}={}){
  const c=controls[side],pivot=c.twist||c.forearm;
  if(c.twist){c.twist.quaternion.copy(c.twistBind);root.updateMatrixWorld(true);}
  const wristBefore=frame(c.hand).p,elbow=frame(c.forearm).p,axis=wristBefore.clone().sub(elbow).normalize();
  const base=frame(pivot).q;let roll=0;
  const previous=commit?c.runtime:null;
  const chooseRoll=(requested)=>{
   if(!previous)return clamp(requested,-maxForearmTwist,maxForearmTwist);
   // At ±pi the unconstrained shortest-angle solution changes branch. Prefer
   // continuity near that tie; a rate bound below still governs the motion.
   const candidates=[clamp(requested,-maxForearmTwist,maxForearmTwist),-maxForearmTwist,maxForearmTwist];
   return candidates.reduce((best,v)=>{
    const cost=wrap(v-requested)**2+.025*(v-previous.roll)**2;
    const bestCost=wrap(best-requested)**2+.025*(best-previous.roll)**2;
    return cost<bestCost?v:best;
   },candidates[0]);
  };
  // The wrist's bind axis is slightly off the forearm axis. Two small solve
  // passes account for this calibration without moving either endpoint.
  for(let i=0;i<2;i++){
   const local=frame(c.hand.parent).q.invert().multiply(desired),delta=c.wristBind.clone().invert().multiply(local);
   const error=twistParts(delta,c.forward).angle;
   roll=chooseRoll(wrap(roll+error));
   orient(pivot,new Quaternion().setFromAxisAngle(axis,roll).multiply(base));
  }
  if(previous){
   const step=240*Math.PI/180*Math.max(0,Math.min(.12,dt));
   roll=previous.roll+clamp(roll-previous.roll,-step,step);
   orient(pivot,new Quaternion().setFromAxisAngle(axis,roll).multiply(base));
  }
  const wantedLocal=frame(c.hand.parent).q.invert().multiply(desired),delta=c.wristBind.clone().invert().multiply(wantedLocal),parts=twistParts(delta,c.forward);
  // Quaternion signs are equivalent; select the short swing before limiting.
  if(parts.swing.w<0){parts.swing.x*=-1;parts.swing.y*=-1;parts.swing.z*=-1;parts.swing.w*=-1;}
  const swingAngle=2*Math.acos(clamp(parts.swing.w,-1,1));
  const swing=new Quaternion().slerp(parts.swing,swingAngle>maxWristSwing?maxWristSwing/swingAngle:1);
  const wristTwist=clamp(parts.angle,-maxWristTwist,maxWristTwist);
  let wrist=swing.multiply(new Quaternion().setFromAxisAngle(c.forward,wristTwist)).normalize();
  if(previous){
   const distance=previous.wrist.angleTo(wrist),step=120*Math.PI/180*Math.max(0,Math.min(.12,dt));
   wrist=previous.wrist.clone().slerp(wrist,distance>step&&distance>EPS?step/distance:1);
   // Reproject the interpolation onto the wrist's admissible cone.
   const bounded=twistParts(wrist,c.forward);if(bounded.swing.w<0){bounded.swing.x*=-1;bounded.swing.y*=-1;bounded.swing.z*=-1;bounded.swing.w*=-1;}
   const angle=2*Math.acos(clamp(bounded.swing.w,-1,1));
   wrist=new Quaternion().slerp(bounded.swing,angle>maxWristSwing?maxWristSwing/angle:1).multiply(new Quaternion().setFromAxisAngle(c.forward,clamp(bounded.angle,-maxWristTwist,maxWristTwist)));
  }
  if(commit)c.runtime={roll,wrist:wrist.clone()};
  c.hand.quaternion.copy(c.wristBind).multiply(wrist).normalize();
  root.updateMatrixWorld(true);
  const actual=twistParts(wrist,c.forward);c.last={forearmTwist:roll,wristTwist:actual.angle,wristSwing:2*Math.acos(clamp(Math.abs(actual.swing.w),0,1)),wristPositionError:frame(c.hand).p.distanceTo(wristBefore),limited:swingAngle>maxWristSwing+1e-6||Math.abs(parts.angle)>maxWristTwist+1e-6};
  return c.last;
 }
 return {apply,orientation,targetHandQ,neutralOrientation,handExpression,snapshot:()=>Object.fromEntries(Object.entries(controls).map(([side,c])=>[side,c.last]))};
}

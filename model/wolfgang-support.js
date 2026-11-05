import {Matrix4,Quaternion,Vector3} from 'three';
const UP=new Vector3(0,1,0),FORWARD=new Vector3(1,0,0);
// One body-space support system controls both legs and both arms. Supporting
// shoes retain their actual sole height and orientation, independently of yaw.
export function createBodySupport(root,bones){
 const inverse=new Matrix4(),m=new Matrix4(),p=new Vector3(),q=new Quaternion(),s=new Vector3();
 const bone=name=>bones.get(name).bone;
 root.updateWorldMatrix(true,true);inverse.copy(root.matrixWorld).invert();
 const refresh=()=>{root.updateWorldMatrix(true,false);inverse.copy(root.matrixWorld).invert();};
 function frame(o){o.updateWorldMatrix(true,false);m.multiplyMatrices(inverse,o.matrixWorld).decompose(p,q,s);return {p:p.clone(),q:q.clone()};}
 function orient(o,rotation){o.quaternion.copy(frame(o.parent).q.invert().multiply(rotation));o.updateWorldMatrix(false,true);}
 function align(o,from,to){orient(o,frame(o).q.premultiply(new Quaternion().setFromUnitVectors(from.normalize(),to.normalize())));}
 function chain(a,b,c){const start=frame(a).p,knee=frame(b).p,end=frame(c);return {a,b,c,l1:start.distanceTo(knee),l2:knee.distanceTo(end.p),home:end.p,rotation:end.q};}
 const legs=['Left','Right'].map(side=>{
  const leg=chain(bone(side+'UpLeg'),bone(side+'Leg'),bone(side+'Foot'));let low=Infinity;
  root.traverse(o=>{if(!o.isSkinnedMesh)return;const si=o.geometry.attributes.skinIndex,sw=o.geometry.attributes.skinWeight;for(let i=0;i<si.count;i++){
   let weight=0;for(let j=0;j<4;j++){const n=o.skeleton.bones[si.array[i*4+j]]?.name||'';if(n.includes(side+'Foot')||n.includes(side+'Toe'))weight+=sw.array[i*4+j];}
   if(weight>.9){const v=o.getVertexPosition(i,new Vector3());o.localToWorld(v);v.applyMatrix4(inverse);low=Math.min(low,v.y);}
  }});
  leg.home.y-=low;leg.anchor=leg.home.clone();return leg;
 });
 const arms=['Left','Right'].map(side=>{
  const c=chain(bone(side+'Arm'),bone(side+'ForeArm'),bone(side+'Hand'));
  const a=frame(c.a),b=frame(c.b),end=frame(c.c);
  c.upperDir=b.p.clone().sub(a.p).normalize();c.lowerDir=end.p.clone().sub(b.p).normalize();
  c.normal=c.upperDir.clone().cross(c.lowerDir).normalize();c.upperQ=a.q;c.lowerQ=b.q;c.runtime=null;
  return c;
 });
 function directedFrame(direction,normal){return new Matrix4().makeBasis(direction,normal,direction.clone().cross(normal).normalize());}
 // Preserve the rest hinge plane while solving the elbow. Swinging each bone
 // independently leaves its roll unconstrained and can twist the forearm.
 function stableArm(c,target,pole,{dt=0,commit=false}={}){
  const a=frame(c.a).p,axis=target.clone().sub(a),distance=Math.max(Math.abs(c.l1-c.l2)+.002,Math.min(c.l1+c.l2-.002,axis.length()));axis.normalize();
  const along=(c.l1*c.l1-c.l2*c.l2+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,c.l1*c.l1-along*along));
  let radial=pole.clone().addScaledVector(axis,-pole.dot(axis));
  const previous=commit?c.runtime:null;
  const transported=previous?.radial.clone().applyQuaternion(new Quaternion().setFromUnitVectors(previous.axis,axis));
  // A pole on the reach axis has no bend direction. Do not normalise floating
  // point noise there: retain the last physical hinge plane, or the bind plane
  // during a stateless pose fit. The hand endpoint is not displaced.
  if(radial.lengthSq()<1e-10){
   radial=transported||axis.clone().cross(c.normal);
   if(radial.lengthSq()<1e-10)radial=axis.clone().cross(Math.abs(axis.y)<.9?UP:FORWARD);
  }
  radial.normalize();let orbitSpeed=0;
  if(previous){
   transported.addScaledVector(axis,-transported.dot(axis)).normalize();
   const angle=Math.atan2(axis.dot(transported.clone().cross(radial)),transported.dot(radial));
   const seconds=Math.max(0,Math.min(.12,dt)),maxSpeed=120*Math.PI/180,acceleration=540*Math.PI/180;
   const wanted=Math.sign(angle)*Math.min(maxSpeed,Math.sqrt(2*acceleration*Math.abs(angle)));
   orbitSpeed=previous.orbitSpeed+Math.max(-acceleration*seconds,Math.min(acceleration*seconds,wanted-previous.orbitSpeed));
   let amount=orbitSpeed*seconds;
   if(amount*angle>=0&&Math.abs(amount)>=Math.abs(angle)){amount=angle;orbitSpeed=0;}
   // Repeated contact corrections in this frame have dt=0. They may adjust
   // the support point but cannot buy another elbow-rotation step.
   radial=transported.applyAxisAngle(axis,amount);
  }
  if(commit)c.runtime={axis:axis.clone(),radial:radial.clone(),orbitSpeed};
  const elbow=a.clone().addScaledVector(axis,along).addScaledVector(radial,height),wrist=a.clone().addScaledVector(axis,distance);
  const upper=elbow.clone().sub(a).normalize(),lower=wrist.sub(elbow).normalize(),normal=upper.clone().cross(lower).normalize();
  const rotate=(dir,restQ,to)=>new Quaternion().setFromRotationMatrix(directedFrame(to,normal).multiply(directedFrame(dir,c.normal).invert())).multiply(restQ);
  orient(c.a,rotate(c.upperDir,c.upperQ,upper));orient(c.b,rotate(c.lowerDir,c.lowerQ,lower));
 }

 function solve(c,target,pole,rotation){
  const a=frame(c.a).p,b=frame(c.b).p,axis=target.clone().sub(a),distance=Math.max(.001,Math.min(c.l1+c.l2-.0001,Math.max(Math.abs(c.l1-c.l2)+.0001,axis.length())));axis.normalize();
  const along=(c.l1*c.l1-c.l2*c.l2+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,c.l1*c.l1-along*along));
  const radial=pole.clone().addScaledVector(axis,-pole.dot(axis)).normalize();
  const joint=a.clone().addScaledVector(axis,along).addScaledVector(radial,height);
  align(c.a,b.sub(a),joint.sub(a));const actual=frame(c.b).p;
  align(c.b,frame(c.c).p.sub(actual),target.clone().sub(actual));if(rotation)orient(c.c,rotation);
 }
 function feet(offsets,{seated=0}={}){
  refresh();const hips=bone('Hips');let down=0;
  legs.forEach((leg,i)=>{leg.anchor.copy(leg.home).add(new Vector3(...offsets[i]));const delta=frame(leg.a).p.sub(leg.anchor),reach=leg.l1+leg.l2-.001;down=Math.max(down,delta.y-Math.sqrt(Math.max(0,reach*reach-delta.x*delta.x-delta.z*delta.z)));});
  hips.position.y-=Math.max(0,down);
  legs.forEach(leg=>solve(leg,leg.anchor,new Vector3(1,seated*3,0),leg.rotation));
 }
 function arm(side,target,pole,weight=1,options){
  const c=arms[side==='Left'?0:1],before=[c.a.quaternion.clone(),c.b.quaternion.clone()];
  stableArm(c,target,pole,options);c.a.quaternion.slerpQuaternions(before[0],c.a.quaternion.clone(),weight);c.b.quaternion.slerpQuaternions(before[1],c.b.quaternion.clone(),weight);root.updateWorldMatrix(true,true);
 }
 function palm(side,up,normal,amount=1){
  const hand=bone(side+'Hand'),old=hand.quaternion.clone(),w=frame(hand).p;
  const index=frame(bone(side+'HandIndex1')).p,pinky=frame(bone(side+'HandPinky1')).p,middle=frame(bone(side+'HandMiddle1')).p;
  const right=index.sub(pinky).normalize(),vertical=middle.sub(w).addScaledVector(right,-middle.dot(right)).normalize(),out=right.clone().cross(vertical).normalize();
  const desiredUp=up.clone().normalize(),desiredNormal=normal.clone().normalize(),desiredRight=desiredUp.clone().cross(desiredNormal).normalize();desiredUp.copy(desiredNormal.clone().cross(desiredRight));
  const current=new Matrix4().makeBasis(right,vertical,out),desired=new Matrix4().makeBasis(desiredRight,desiredUp,desiredNormal);
  orient(hand,frame(hand).q.premultiply(new Quaternion().setFromRotationMatrix(desired.multiply(current.invert()))));hand.quaternion.slerpQuaternions(old,hand.quaternion.clone(),amount);
 }
 function curl(side,amount){
  const hand=bone(side+'Hand'),w=frame(hand).p,middle=frame(bone(side+'HandMiddle1')).p;
  const direction=middle.sub(w).normalize(),normal=new Vector3(1,0,0),axis=direction.clone().cross(normal).normalize();
  for(const finger of ['Index','Middle','Ring','Pinky'])for(const [j,angle]of [[1,.35],[2,.72],[3,.58]]){const b=bone(side+'Hand'+finger+j);orient(b,frame(b).q.premultiply(new Quaternion().setFromAxisAngle(axis,angle*amount)));}
 }
 return {frame,refresh,orient,feet,arm,palm,curl,legs,bone,UP,FORWARD,snapshot:()=>legs.map(l=>({anchor:l.anchor.toArray(),position:frame(l.c).p.toArray()}))};
}

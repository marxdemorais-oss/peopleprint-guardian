import {Matrix4,Quaternion,Vector3} from 'three';
import {ConvexHull} from 'three/addons/math/ConvexHull.js';
const UP=new Vector3(0,1,0),FORWARD=new Vector3(1,0,0),q=new Quaternion();
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};

// Reconstruct foot support after sampling/blending a human performance onto
// Wolfgang's mechanical proportions. Calculations use character coordinates,
// independent of viewer rotation, scale and camera movement.
export function createFootContact(root,bones){
 const hips=bones.get('Hips').bone,inverse=new Matrix4(),matrix=new Matrix4(),p=new Vector3(),r=new Quaternion(),s=new Vector3();
 root.updateWorldMatrix(true,true);inverse.copy(root.matrixWorld).invert();
 function frame(o){o.updateWorldMatrix(true,false);matrix.multiplyMatrices(inverse,o.matrixWorld).decompose(p,r,s);return {p:p.clone(),q:r.clone()};}
 function orient(o,rotation){o.quaternion.copy(frame(o.parent).q.invert().multiply(rotation));o.updateWorldMatrix(false,true);}
 function align(o,from,to){orient(o,frame(o).q.premultiply(q.setFromUnitVectors(from.normalize(),to.normalize())));}
 const legs=['Left','Right'].map(side=>{
  const upper=bones.get(side+'UpLeg').bone,lower=bones.get(side+'Leg').bone,foot=bones.get(side+'Foot').bone;
  const a=frame(upper).p,k=frame(lower).p,f=frame(foot),points=[];
  root.traverse(o=>{if(!o.isSkinnedMesh)return;const si=o.geometry.attributes.skinIndex,sw=o.geometry.attributes.skinWeight;for(let i=0;i<si.count;i++){
   let weight=0;for(let j=0;j<4;j++){const name=o.skeleton.bones[si.array[i*4+j]]?.name||'';if(name.includes(side+'Foot')||name.includes(side+'Toe'))weight+=sw.array[i*4+j];}
   if(weight<.9)continue;const v=o.getVertexPosition(i,new Vector3());o.localToWorld(v);v.applyMatrix4(inverse);points.push(v.sub(f.p).applyQuaternion(f.q.clone().invert()));
  }});
  const hull=new ConvexHull().setFromPoints(points),support=[...new Set(hull.faces.flatMap(face=>{const vertices=[];let edge=face.edge;do{vertices.push(edge.head().point);edge=edge.next;}while(edge!==face.edge);return vertices;}))];
  const relativeFloor=Math.min(...support.map(v=>v.clone().applyQuaternion(f.q).y));
  const axis=f.p.clone().sub(a).normalize(),pole=k.clone().sub(a);pole.addScaledVector(axis,-pole.dot(axis)).normalize();
  return {upper,lower,foot,homeQ:f.q,forward:FORWARD.clone().applyQuaternion(f.q.clone().invert()),support,relativeFloor,pole,thigh:a.distanceTo(k),shin:k.distanceTo(f.p),anchor:null,weight:0};
 });
 let enabled=false;
 function solve(leg,target,rotation){
  const start=frame(leg.upper).p,knee=frame(leg.lower).p,axis=target.clone().sub(start),distance=Math.max(.001,axis.length());axis.normalize();
  const d=Math.min(distance,leg.thigh+leg.shin-.0001),along=(leg.thigh**2-leg.shin**2+d*d)/(2*d),bend=Math.sqrt(Math.max(0,leg.thigh**2-along**2));
  const pole=leg.pole.clone().addScaledVector(axis,-leg.pole.dot(axis)).normalize(),desired=start.clone().addScaledVector(axis,along).addScaledVector(pole,bend);
  align(leg.upper,knee.sub(start),desired.clone().sub(start));const actual=frame(leg.lower).p;
  align(leg.lower,frame(leg.foot).p.sub(actual),target.clone().sub(actual));orient(leg.foot,rotation);
 }
 function apply(dt,{floor=false}={}){
  root.updateWorldMatrix(true,true);inverse.copy(root.matrixWorld).invert();
  if(floor){enabled=false;for(const leg of legs){leg.anchor=null;leg.weight=0;}return;}
  const raw=legs.map(leg=>{const f=frame(leg.foot);return {...f,bottom:Math.min(...leg.support.map(v=>v.clone().applyQuaternion(f.q).add(f.p).y))};});
  const lowest=Math.min(...raw.map(f=>f.bottom));
  // One supporting foot always reaches the common ground. Raised feet retain
  // their captured trajectory; they are not pinned down or dragged in place.
  hips.position.y-=lowest;
  const targets=legs.map((leg,i)=>{
   const f=raw[i],clearance=f.bottom-lowest,desired=1-smooth((clearance-.012)/.03);
   leg.weight=enabled?leg.weight+(desired-leg.weight)*(dt?1-Math.exp(-dt*22):0):desired;
   const forward=leg.forward.clone().applyQuaternion(f.q);forward.y=0;if(forward.lengthSq()<.001)forward.copy(FORWARD);forward.normalize();
   const flat=new Quaternion().setFromUnitVectors(FORWARD,forward).multiply(leg.homeQ),rotation=f.q.clone().slerp(flat,leg.weight);
   const target=f.p.clone();target.y-=lowest;
   if(desired>.8){if(!leg.anchor)leg.anchor=target.clone();target.x+=(leg.anchor.x-target.x)*leg.weight;target.z+=(leg.anchor.z-target.z)*leg.weight;}else leg.anchor=null;
   const soleY=Math.min(...leg.support.map(v=>v.clone().applyQuaternion(rotation).y));target.y+=( -soleY-target.y)*leg.weight;
   return {target,rotation};
  });
  root.updateWorldMatrix(true,true);
  // Preserve a little knee flexion rather than stretching a supporting leg.
  let lowerBy=0;legs.forEach((leg,i)=>{const a=frame(leg.upper).p,d=a.sub(targets[i].target),reach=leg.thigh+leg.shin-.001;const height=Math.sqrt(Math.max(0,reach*reach-d.x*d.x-d.z*d.z));lowerBy=Math.max(lowerBy,d.y-height);});
  hips.position.y-=Math.min(.08,lowerBy);root.updateWorldMatrix(true,true);
  legs.forEach((leg,i)=>solve(leg,targets[i].target,targets[i].rotation));enabled=true;
 }
 return {apply,snapshot:()=>legs.map(leg=>({weight:leg.weight,anchor:leg.anchor?.toArray()||null}))};
}

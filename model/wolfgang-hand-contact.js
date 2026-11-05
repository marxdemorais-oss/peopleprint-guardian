import {Box3,Matrix4,Quaternion,Vector3} from 'three';
import colliders from './reconstruction/thigh-contact-colliders.json';

// Surface frames measured on the individually articulated finger pads and thigh armour.
// The complete hand was fitted, so the contacting pad rests on the plate while
// the rest of the palm/fingers remain outside it. Positions are bone-local;
// stance changes therefore move the supporting surface and hand together.
const CONTACTS = {"Right":{"surface":[0.015992918871092433,0.13867605649462147,-0.035894195551379696],"pad":[-0.014885272296345712,0.09487460189682458,0.03646562783656404],"rotation":[0.02198968932794995,-0.2347309471748249,-0.05688857624015739,0.9701451067623419],"pole":[-0.7786635434380395,-0.07855843790084617,-0.6225043437245907],"normal":[0.380192614,0.171217997,-0.908921324],"gap":0.0008008294573633723,"padMesh":"Digit_RightHandRing3","padVertex":97},"Left":{"surface":[-0.0014858264299751624,0.12216091682106439,0.046105211049207846],"pad":[-0.006452971971868629,0.0911078840845373,-0.04409626099752769],"rotation":[0.0905741634333915,-0.0010136597498351819,-0.18697556562453557,0.9781796561008365],"pole":[-0.9380623545363251,0.01804494651567802,-0.3459962411746789],"normal":[-0.208035339,0.110447692,0.971865528],"gap":0.0007999143311685081,"padMesh":"Digit_LeftHandPinky3","padVertex":88}};

export function createHandContact(support,root){
 const entries=Object.fromEntries(Object.entries(CONTACTS).map(([side,data])=>{
  const body=support.bone(side+'UpLeg'),hand=support.bone(side+'Hand');
  const surface=new Vector3(...data.surface),pad=new Vector3(...data.pad),rotation=new Quaternion(...data.rotation),pole=new Vector3(...data.pole);
  const normal=new Vector3(...data.normal),upper=support.bone(side+'Arm');
  body.updateWorldMatrix(true,false);const inverseBody=new Matrix4().copy(body.matrixWorld).invert(),thighBounds=new Box3(),vertices=[],boneBounds=new Map(),handAncestors=new Map(),positions=new Map();
  const bodyPosition=joint=>{if(!positions.has(joint))positions.set(joint,joint.getWorldPosition(new Vector3()).applyMatrix4(inverseBody));return positions.get(joint);};
  let ancestor=hand,pathLength=0;while(ancestor){handAncestors.set(ancestor,pathLength);if(ancestor.parent)pathLength+=bodyPosition(ancestor).distanceTo(bodyPosition(ancestor.parent));ancestor=ancestor.parent;}
  const boundFor=bone=>{
   if(boneBounds.has(bone))return boneBounds.get(bone);
   const position=bodyPosition(bone);let distance=0,joint=bone;
   while(!handAncestors.has(joint)&&joint.parent){distance+=bodyPosition(joint).distanceTo(bodyPosition(joint.parent));joint=joint.parent;}
   distance+=handAncestors.get(joint)||0;
   const bound={position,distance};boneBounds.set(bone,bound);return bound;
  };
  let radius=0;
  root.traverse(mesh=>{if(!mesh.isSkinnedMesh)return;const a=mesh.geometry.attributes,indices=[];
   mesh.updateWorldMatrix(true,false);const toBody=new Matrix4().multiplyMatrices(inverseBody,mesh.matrixWorld);
   for(let i=0;i<a.position.count;i++){let weight=0,thighWeight=0;for(let j=0;j<4;j++){const name=mesh.skeleton.bones[a.skinIndex.array[i*4+j]]?.name||'',v=a.skinWeight.array[i*4+j];if(name.includes(side+'Hand'))weight+=v;if(name.endsWith(side+'UpLeg'))thighWeight+=v;}
    if(thighWeight>.9)thighBounds.expandByPoint(mesh.getVertexPosition(i,new Vector3()).applyMatrix4(toBody));
    if(weight>.5){
     indices.push(i);const point=mesh.localToWorld(mesh.getVertexPosition(i,new Vector3())).applyMatrix4(inverseBody);
     for(let j=0;j<4;j++)if(a.skinWeight.array[i*4+j]>0){
      // Include proximal wrist weights too. A blended vertex's bound must
      // cover every influencing bone, not only descendants named Hand.
      const joint=mesh.skeleton.bones[a.skinIndex.array[i*4+j]];if(!joint)continue;
      const bound=boundFor(joint);radius=Math.max(radius,point.distanceTo(bound.position)+bound.distance);
     }
    }
   }
   if(indices.length)vertices.push({mesh,indices});
  });
  return [side,{body,hand,upper,surface,pad,rotation,pole,normal,gap:data.gap,padMesh:data.padMesh,vertices,thighBounds,contactBounds:thighBounds.clone().expandByScalar(.0005),radius,planes:colliders.sides[side],slideOffset:new Vector3()}];
 }));
 function target(side){
  const c=entries[side],body=support.frame(c.body),q=body.q.clone().multiply(c.rotation),surface=c.surface.clone().applyQuaternion(body.q).add(body.p),normal=c.normal.clone().applyQuaternion(body.q).normalize();
  const w=surface.clone().addScaledVector(normal,c.gap).sub(c.pad.clone().applyQuaternion(q)),pole=c.pole.clone().applyQuaternion(body.q).normalize(),shoulder=support.frame(c.upper).p,axis=w.clone().sub(shoulder).normalize();
  // Keep the calibrated resting elbow direction. Moving the elbow around the
  // entire reach circle to chase a wrist-cone boundary becomes singular when
  // a small step aligns the desired lower arm with the reach axis. That made
  // a stationary resting hand turn its elbow abruptly. The wrist still uses
  // armature limits; correction() maintains the actual finger-pad contact for
  // the resulting bounded hand orientation rather than forcing that orbit.
  const radial=pole.addScaledVector(axis,-pole.dot(axis)).normalize();
  return {w,q,pole:radial,surface,normal};
 }
 function snapshot(){return Object.fromEntries(Object.entries(entries).map(([side,c])=>{
  const t=target(side),hand=support.frame(c.hand),pad=c.pad.clone().applyQuaternion(hand.q).add(hand.p),delta=pad.sub(t.surface);
  return [side,{gap:delta.dot(t.normal),error:delta.clone().addScaledVector(t.normal,-c.gap).length(),wristError:hand.p.distanceTo(t.w),orientationError:hand.q.angleTo(t.q),padMesh:c.padMesh}];
 }));}
 function correction(side){
  const c=entries[side],t=target(side),hand=support.frame(c.hand),actual=c.pad.clone().applyQuaternion(hand.q).add(hand.p);
  return t.surface.addScaledVector(t.normal,c.gap).sub(actual);
 }
 function slide(side,w,dt,weight){
  const c=entries[side];
  if(weight<=0||weight>.999999)c.slideOffset.set(0,0,0);
  else c.slideOffset.multiplyScalar(Math.exp(-6*Math.max(0,Math.min(.12,dt))));
  w.add(c.slideOffset.clone().applyQuaternion(support.frame(c.body).q));
 }
 function padCollisionCorrection(side){
  const c=entries[side],body=support.frame(c.body);
  // Slide the complete articulated hand off its supporting body surface.
  // Retain the previous contact displacement while it is supporting the hand.
  // Starting every frame from an unconstrained pose inside the thigh can jump
  // across the hull's medial axis and reverse its nearest outward direction.
  // slide() lets this displacement settle smoothly after the hand leaves.
  c.body.updateWorldMatrix(true,false);const inverseBody=new Matrix4().copy(c.body.matrixWorld).invert(),p=new Vector3();let depth=0,normal=null;
  // The whole articulated hand is bounded by finger-chain lengths, not by one
  // fingertip's proximity. A pad can leave its old patch while other fingers
  // are still touching the thigh and must retain the collision constraint.
  if(!c.thighBounds.isEmpty()&&c.thighBounds.distanceToPoint(c.hand.getWorldPosition(p).applyMatrix4(inverseBody))>c.radius+.001)return new Vector3();
  for(const {mesh,indices}of c.vertices){
   mesh.updateWorldMatrix(true,false);const toBody=new Matrix4().multiplyMatrices(inverseBody,mesh.matrixWorld);
   for(const index of indices){
    mesh.getVertexPosition(index,p).applyMatrix4(toBody);if(!c.contactBounds.isEmpty()&&!c.contactBounds.containsPoint(p))continue;let nearest=-Infinity,face=null;
    for(const plane of c.planes){
     const d=plane[0]*p.x+plane[1]*p.y+plane[2]*p.z-plane[3];
     if(d>nearest){nearest=d;face=plane;}if(nearest>=.0005)break;
    }
    if(nearest<.0005&&.0005-nearest>depth){depth=.0005-nearest;normal=face;}
   }
  }
  const translation=normal?new Vector3(normal[0],normal[1],normal[2]).multiplyScalar(depth):new Vector3();
  c.slideOffset.add(translation);
  return translation.applyQuaternion(body.q);
 }
 return {target,snapshot,correction,slide,padCollisionCorrection};
}

import {Matrix4,Quaternion,Vector3} from 'three';
import poses from './reconstruction/expressive-poses.json';

// Captured surface points on the repaired model, not an offset from the wrist.
// The support is evaluated after gaze and stance, so the head can settle onto
// the hand without the hand lagging behind or travelling through the face.
export function createExpressionContact(root,support){
 const inverse=new Matrix4();
 const definitions=Object.fromEntries(Object.entries(poses).map(([name,pose])=>{
  const c=pose.contact;return [name,{...c,mesh:root.getObjectByName(c.mesh),body:support.bone(c.body),point:new Vector3(...c.point),surface:new Vector3(...c.surface),wrist:new Vector3(...c.wrist),rotation:new Quaternion(...c.rotation),reference:{w:new Vector3(...pose.arm.w),q:new Quaternion(...pose.arm.q)}}];
 }));
 function target(name){const c=definitions[name];if(!c)return null;const body=support.frame(c.body);return {w:c.wrist.clone().applyQuaternion(body.q).add(body.p),q:body.q.clone().multiply(c.rotation),point:c.point.clone().applyQuaternion(body.q).add(body.p),surface:c.surface.clone().applyQuaternion(body.q).add(body.p)};}
 function actual(name){const c=definitions[name];root.updateMatrixWorld(true);inverse.copy(root.matrixWorld).invert();return c.mesh.localToWorld(c.mesh.getVertexPosition(c.index,new Vector3())).applyMatrix4(inverse);}
 function correction(name){return target(name).point.sub(actual(name));}
 function follow(name,chest,weight,w,q){
  const c=definitions[name],live=target(name),referenceW=c.reference.w.clone().applyQuaternion(chest.q).add(chest.p),referenceQ=chest.q.clone().multiply(c.reference.q);
  w.addScaledVector(live.w.sub(referenceW),weight);q.premultiply(new Quaternion().slerp(live.q.multiply(referenceQ.invert()),weight));
 }
 function snapshot(name,weight){const t=target(name),p=actual(name);return {active:weight>.999999,weight,error:p.distanceTo(t.point),gap:p.distanceTo(t.surface),mesh:definitions[name].mesh.name,index:definitions[name].index};}
 return {target,correction,follow,snapshot,poses};
}

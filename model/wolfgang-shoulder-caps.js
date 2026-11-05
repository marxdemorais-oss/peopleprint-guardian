import {Quaternion,Vector3} from 'three';

// Shoulder armour keeps the solved neutral fit and opens only partway with the
// arm. A cover is attached to the shoulder socket, not to the upper-arm shell:
// following the full humerus swing made it flap outward during chin/hip poses.
// Axial arm roll must never spin the rigid cap.
// Call after arm IK/pronation. No global axes or mirrored-angle assumptions.
export function createShoulderCaps(root,{follow=.35,maxOpening=18*Math.PI/180}={}){
 const controls=[];
 for(const side of ['Left','Right']){
  const find=part=>root.getObjectByName('mixamorig'+side+part)||root.getObjectByName('mixamorig:'+side+part);
  const arm=find('Arm'),forearm=find('ForeArm'),cap=find('ShoulderCap');
  if(!arm||!forearm||!cap)continue;
  const shaft=forearm.position.clone().normalize();
  const direction=shaft.clone().applyQuaternion(arm.quaternion).normalize();
  controls.push({side,arm,cap,shaft,direction,bindQ:cap.quaternion.clone(),neutralDirection:null,neutralQ:null});
 }
 const current=new Vector3(),swing=new Quaternion();
 return {
  update(){
   for(const c of controls){
    current.copy(c.shaft).applyQuaternion(c.arm.quaternion).normalize();
    if(!c.neutralDirection){
     c.neutralDirection=current.clone();
     c.neutralQ=new Quaternion().setFromUnitVectors(c.direction,current).multiply(c.bindQ).normalize();
    }
    swing.setFromUnitVectors(c.neutralDirection,current);
    const angle=new Quaternion().angleTo(swing),amount=angle>1e-8?Math.min(Math.max(0,follow),Math.max(0,maxOpening)/angle):0;
    swing.slerpQuaternions(new Quaternion(),swing,amount);
    c.cap.position.copy(c.arm.position);
    c.cap.quaternion.copy(swing).multiply(c.neutralQ).normalize();
   }
  },
  count:controls.length,
 };
}

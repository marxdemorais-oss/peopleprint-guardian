import {Matrix4,Quaternion,Vector3} from 'three';
import {WOLFGANG_HOME_YAW} from './wolfgang-framing.js';

// Calibrated from the real ocular surfaces. Bone-local Euler axes do not match
// the face: the source head was pitched down and its eye line was tilted.
const localFront=new Vector3(.89810060,.02286951,-.43919506);
const localUp=new Vector3(-.07482571,.99203262,-.10135280);
const localRight=new Vector3(.43337790,.12388806,.89265634);
const faceInverse=new Matrix4().makeBasis(localFront,localUp,localRight).invert();
const Y=new Vector3(0,1,0);
export function createHeadGaze(head,orient){
 let current=null;
 return {
  update({yaw=0,pitch=0,nod=0}={},dt=0){
   // The body is turned towards the page copy. The head meets the viewer.
   const heading=-WOLFGANG_HOME_YAW-Math.PI/2+yaw;
   const front=new Vector3(Math.cos(heading),0,-Math.sin(heading));
   const right=front.clone().cross(Y).normalize();
   front.applyAxisAngle(right,pitch-nod);
   const up=right.clone().cross(front).normalize();
   const target=new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(front,up,right).multiply(faceInverse));
   target.normalize();
   if(!current)current=target.clone();else current.slerp(target,1-Math.exp(-Math.max(0,dt)*12));
   orient(head,current);
  },
 };
}

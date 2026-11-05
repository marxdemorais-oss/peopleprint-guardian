import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {Texture,Quaternion,Vector3,Raycaster} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {createArmatureControl} from '../model/wolfgang-armature.js';
import {createBodySupport} from '../model/wolfgang-support.js';
import {createShoulderCaps} from '../model/wolfgang-shoulder-caps.js';
import {createJointInteriors} from '../model/wolfgang-joint-interiors.js';

async function model(){
 globalThis.self=globalThis;const bytes=fs.readFileSync(new URL('../web/assets/wolfgang.glb',import.meta.url)),loader=new GLTFLoader();
 loader.register(()=>({name:'SHAPE_TEST_TEXTURE',loadTexture:()=>Promise.resolve(new Texture())}));
 const root=(await loader.parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')).scene;
 const bones=new Map();root.traverse(b=>{if(b.isBone)bones.set(b.name.replace(/^mixamorig:?/,''),{bone:b,q:b.quaternion.clone(),p:b.position.clone()});});
 return {root,bones,get:n=>bones.get(n).bone};
}
test('rigid shoulder covers remain attached, bounded and independent of humerus roll',async()=>{
 const {root,get}=await model(),caps=createShoulderCaps(root);caps.update();assert.equal(caps.count,2);
 for(const side of ['Left','Right']){
  const arm=get(side+'Arm'),cap=get(side+'ShoulderCap'),neutral=cap.quaternion.clone(),bind=arm.quaternion.clone(),shaft=get(side+'ForeArm').position.clone().normalize();
  arm.quaternion.copy(bind).multiply(new Quaternion().setFromAxisAngle(shaft,1.4));caps.update();assert(cap.quaternion.angleTo(neutral)<1e-5,'forearm roll must not rotate its shoulder cover');
  arm.quaternion.copy(bind).premultiply(new Quaternion().setFromAxisAngle(new Vector3(1,0,0),1.9));caps.update();assert(cap.quaternion.angleTo(neutral)<=18*Math.PI/180+1e-6);assert(cap.position.distanceTo(arm.position)<1e-10);
 }
});
test('bounded hand shapes are repeatable, leave the wrist and thumb intact, and reject unknown control',async()=>{
 const {root,bones,get}=await model(),support=createBodySupport(root,bones),control=createArmatureControl(root,bones,support.frame,support.orient);
 for(const side of ['Left','Right']){
  const wrist=get(side+'Hand'),thumb=get(side+'HandThumb1'),wristBefore=wrist.quaternion.clone(),thumbBefore=thumb.quaternion.clone();
  for(const preset of ['relaxed','open','soft_fist','point']){
   assert.equal(control.handExpression(side,preset,.7),true);const first=new Map([...bones].filter(([name])=>name.startsWith(side+'Hand')).map(([name,b])=>[name,b.bone.quaternion.clone()]));
   for(let i=0;i<8;i++)assert.equal(control.handExpression(side,preset,.7),true);
   for(const [name,q]of first)assert(get(name).quaternion.clone().normalize().angleTo(q.clone().normalize())<1e-6,'shape calls cannot accumulate finger rotations');
   assert(wrist.quaternion.clone().normalize().angleTo(wristBefore.clone().normalize())<1e-6);assert(thumb.quaternion.clone().normalize().angleTo(thumbBefore.clone().normalize())<1e-6);
  }
  const before=get(side+'HandIndex1').quaternion.clone();assert.equal(control.handExpression(side,'execute-code',1),false);assert.equal(control.handExpression(side,'open',NaN),false);assert(get(side+'HandIndex1').quaternion.clone().normalize().angleTo(before.clone().normalize())<1e-6);
 }
});

test('closed shoulder sockets block sightlines around the former small bearing in every direction',async()=>{
 const {root,get}=await model(),interiors=createJointInteriors(root);assert.equal(interiors.count,0);
 for(const side of ['Left','Right']){
  const arm=get(side+'Arm'),core=root.getObjectByName('Socket_'+side+'_closed_back');assert(core.isSkinnedMesh);assert.equal(core.material.transparent,false);assert.equal(core.material.opacity,1);
  for(const rotation of [0,.9,1.8]){
   arm.rotateY(rotation);root.updateMatrixWorld(true);const centre=arm.getWorldPosition(new Vector3());
   for(let i=0;i<16;i++){
    const direction=new Vector3(Math.cos(i*Math.PI/8),.15,Math.sin(i*Math.PI/8)).normalize(),tangent=new Vector3().crossVectors(direction,new Vector3(0,1,0)).normalize();
    // Test the annulus beyond the old 35 mm bearing, not only its centre.
    const from=centre.clone().addScaledVector(direction,.12).addScaledVector(tangent,.038),ray=new Raycaster(from,direction.clone().negate());assert(ray.intersectObject(core,false).length>0);
   }
  }
 }
});

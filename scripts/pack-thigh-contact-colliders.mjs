// Rebuild the rigid thigh shells used by the returning-fingertip constraint.
// Run after intentionally changing the shipped GLB, then rerun motion audits.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {Texture,Vector3} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {ConvexHull} from 'three/addons/math/ConvexHull.js';

globalThis.self=globalThis;
const file=fs.readFileSync(new URL('../web/assets/wolfgang.glb',import.meta.url));
const loader=new GLTFLoader();loader.register(()=>({name:'COLLIDER_TEXTURE_STUB',loadTexture:()=>Promise.resolve(new Texture())}));
const root=(await loader.parseAsync(file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength),'')).scene;
root.updateMatrixWorld(true);
const data={modelSha256:crypto.createHash('sha256').update(file).digest('hex'),sides:{}};
for(const side of ['Left','Right']){
 const body=root.getObjectByName('mixamorig'+side+'UpLeg'),points=new Map();
 root.traverse(mesh=>{
  if(!mesh.isSkinnedMesh)return;
  const {skinIndex,skinWeight}=mesh.geometry.attributes;
  for(let i=0;i<skinIndex.count;i++){
   let weight=-1,bone;
   for(let j=0;j<4;j++)if(skinWeight.array[i*4+j]>weight){weight=skinWeight.array[i*4+j];bone=mesh.skeleton.bones[skinIndex.array[i*4+j]];}
   if(bone!==body)continue;
   if(weight!==1)throw new Error(`${side} thigh is no longer rigid; rebuild its contact representation`);
   const p=body.worldToLocal(mesh.localToWorld(mesh.getVertexPosition(i,new Vector3())));
   points.set(p.toArray().map(n=>n.toFixed(7)).join(','),p);
  }
 });
 const hull=new ConvexHull().setFromPoints([...points.values()]),planes=new Map();
 for(const face of hull.faces)if(face.normal.lengthSq()>.5){
  const p=[...face.normal.toArray(),face.constant].map(n=>+n.toFixed(9));planes.set(p.join(','),p);
 }
 if(planes.size<4)throw new Error(`Invalid ${side} thigh collider`);
 data.sides[side]=[...planes.values()];
}
fs.writeFileSync(new URL('../model/reconstruction/thigh-contact-colliders.json',import.meta.url),JSON.stringify(data));
console.log(`Packed thigh contact shells: ${Object.entries(data.sides).map(([side,planes])=>`${side} ${planes.length} planes`).join(', ')}`);

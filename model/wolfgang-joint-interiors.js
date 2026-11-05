import {Mesh,MeshStandardMaterial,SphereGeometry} from 'three';

// The source shoulder bearing is 35 mm in radius, while its open armour ring
// reaches roughly 42 mm. Its cap liner seals the cap itself, not that annular
// socket gap. These closed, inset navy cores block the remaining sightline.
// They follow the fixed shoulder socket so arm/cap movement cannot open a hole
// through the body. The approved white armour and source GLB are untouched.
export function createJointInteriors(root){
 const created=[];
 for(const side of ['Left','Right']){
  const find=part=>root.getObjectByName('mixamorig'+side+part)||root.getObjectByName('mixamorig:'+side+part);
  const fitted=root.getObjectByName('Socket_'+side+'_closed_back');if(fitted)continue;
  const arm=find('Arm');if(!arm)continue;
  const name='Runtime_'+side+'_closed_shoulder_socket';if(root.getObjectByName(name))continue;
  const geometry=new SphereGeometry(.0415,32,20),material=new MeshStandardMaterial({color:0x142531,metalness:.45,roughness:.42});
  const core=new Mesh(geometry,material);core.name=name;core.castShadow=true;core.frustumCulled=false;
  // Socket is in the same frame/pivot as the arm. A sphere is invariant under
  // humerus roll; a separate cap cannot stretch or deform its closed surface.
  arm.add(core);created.push(core);
 }
 return {count:created.length,meshes:created};
}

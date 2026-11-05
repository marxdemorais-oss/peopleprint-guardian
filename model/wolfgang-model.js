import * as T from 'three';
export function createWolfgangModel(){
 const root=new T.Group();root.name='Wolfgang';root.userData={version:'1',units:'metres',rig:'Rigid articulated shells; procedural animation in companion controller'};
 const materials={pearl:new T.MeshStandardMaterial({color:0xe3e9e7,metalness:.55,roughness:.25}),navy:new T.MeshStandardMaterial({color:0x142b3c,metalness:.6,roughness:.29}),joint:new T.MeshStandardMaterial({color:0x536772,metalness:.8,roughness:.25}),mint:new T.MeshStandardMaterial({color:0x86d6c4,emissive:0x367d70,emissiveIntensity:.5}),eyes:new T.MeshStandardMaterial({color:0xc8fff0,emissive:0x8cddc9,emissiveIntensity:.7}),black:new T.MeshStandardMaterial({color:0x081e2a})};
 const joints={},eyes=[],fingers=[];
 function group(p,n,x=0,y=0,z=0){const g=new T.Group();g.name=n;g.position.set(x,y,z);p.add(g);joints[n]=g;return g;}
 function mesh(p,n,g,m,pos=[0,0,0],scale=[1,1,1]){const o=new T.Mesh(g,materials[m]);o.name=n;o.position.set(...pos);o.scale.set(...scale);p.add(o);return o;}
 function ball(p,n,pos,scale,m='pearl'){return mesh(p,n,new T.SphereGeometry(1,24,18),m,pos,scale);}
 function shell(p,n,levels,m='pearl',segments=36){const a=[],ix=[];levels.forEach(([y,x,z,offset=0])=>{for(let i=0;i<=segments;i++){const q=i/segments*Math.PI*2;a.push(Math.sin(q)*x,y,Math.cos(q)*z+offset);}});for(let j=0;j<levels.length-1;j++)for(let i=0;i<segments;i++){const k=j*(segments+1)+i;ix.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);}if(levels[1][0]<levels[0][0])for(let i=0;i<ix.length;i+=3)[ix[i+1],ix[i+2]]=[ix[i+2],ix[i+1]];const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(a,3));g.setIndex(ix);g.computeVertexNormals();return mesh(p,n,g,m);}
 function line(p,n,pts,r,m){return mesh(p,n,new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(a=>new T.Vector3(...a))),24,r,8,false),m);}
 const pelvis=group(root,'pelvis',0,1.03,0);
 shell(pelvis,'hip_structure',[[-.15,.035,.05],[-.1,.13,.1],[0,.155,.105],[.08,.13,.085]],'navy');
 shell(pelvis,'pelvic_armour',[[-.13,.025,.055,.03],[-.07,.08,.08,.025],[.02,.125,.09,.025],[.065,.11,.075,.025]]);
 const spine=group(pelvis,'spine',0,.1,0);
 shell(spine,'abdomen',[[-.04,.105,.08],[.08,.11,.08],[.16,.13,.09]],'navy');
 const chest=group(spine,'chest',0,.17,0);
 shell(chest,'thorax',[[-.14,.09,.075,.02],[-.1,.12,.09,.02],[0,.16,.11,.015],[.10,.2,.115,.005],[.18,.21,.105],[.23,.165,.08],[.255,.065,.05]]);
 for(const side of [-1,1]){line(chest,'clavicle_'+side,[[side*.055,.237,.05],[side*.115,.218,.065],[side*.18,.18,.075]],.003,'mint');line(chest,'chest_seam_'+side,[[side*.02,.07,.12],[side*.09,.055,.112],[side*.15,.07,.085]],.0014,'joint');}
 for(const [x,m] of [[.084,'mint'],[.102,'navy']])mesh(chest,'brand_circle',new T.CircleGeometry(.014,24),m,[x,.14,.11]);
 const neck=group(chest,'neck',0,.25,0);shell(neck,'neck_structure',[[0,.048,.044],[.09,.047,.042]],'navy');
 for(let i=0;i<3;i++){const o=mesh(neck,'neck_ring',new T.TorusGeometry(.047,.003,8,32),'joint',[0,.02+i*.025,0]);o.rotation.x=Math.PI/2;}
 const head=group(neck,'head',0,.165,.005);
 ball(head,'cranial_shell',[0,.015,-.025],[.103,.142,.084]);
 const face=shell(head,'face',[[-.13,.025,.04],[-.115,.05,.063],[-.085,.073,.076],[-.045,.088,.08],[0,.094,.082],[.05,.094,.077],[.09,.086,.065],[.125,.059,.043],[.14,.001,.001]],'navy',56);
 const a=face.geometry.attributes.position;for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i);if(z>0)a.setZ(i,z+.022*Math.exp(-((x/.02)**2)-((y+.015)/.04)**2));}face.geometry.computeVertexNormals();
 ball(head,'nose',[0,-.023,.101],[.011,.014,.01],'navy');
 line(head,'mouth',[[-.025,-.065,.076],[0,-.069,.084],[.025,-.065,.076]],.002,'joint');
 for(const side of [-1,1]){
  const ear=mesh(head,'temple',new T.CylinderGeometry(.033,.033,.02,24),'joint',[side*.105,.005,-.01]);ear.rotation.z=Math.PI/2;
  const glow=mesh(head,'ear_inlay',new T.CylinderGeometry(.023,.023,.021,24),'mint',[side*.113,.005,-.01]);glow.rotation.z=Math.PI/2;
  line(head,'face_frame',[[side*.065,.12,.044],[side*.097,.06,.035],[side*.099,-.015,.03],[side*.078,-.08,.043],[side*.044,-.12,.05]],.0045,'joint');
  const eye=group(head,'eye_'+side,side*.041,.018,.084);eyes.push(eye);
  const sh=new T.Shape();sh.moveTo(-.025,0);sh.bezierCurveTo(-.011,.012,.012,.012,.025,0);sh.bezierCurveTo(.011,-.009,-.01,-.009,-.025,0);
  mesh(eye,'eye_aperture',new T.ShapeGeometry(sh,16),'eyes');mesh(eye,'iris',new T.CircleGeometry(.008,24),'mint',[0,0,.001]);mesh(eye,'pupil',new T.CircleGeometry(.004,20),'black',[0,0,.002]);
  line(head,'brow',[[side*.019,.042,.086],[side*.045,.046,.079],[side*.07,.036,.066]],.003,'joint');
  const prefix=side<0?'left':'right';
  const hip=group(pelvis,prefix+'Hip',side*.099,-.075,0);ball(hip,'hip',[0,0,0],[.065,.064,.065],'joint');
  shell(hip,'thigh',[[0,.06,.06],[-.055,.076,.07],[-.17,.071,.064],[-.3,.054,.05],[-.36,.046,.043]]);
  const knee=group(hip,prefix+'Knee',0,-.38,0);ball(knee,'knee',[0,0,0],[.047,.046,.046],'navy');ball(knee,'patella',[0,-.002,.036],[.04,.043,.018]);
  shell(knee,'shin',[[-.045,.044,.04],[-.13,.059,.055,-.005],[-.25,.042,.04],[-.39,.029,.034]]);
  const ankle=group(knee,prefix+'Ankle',0,-.405,0);ball(ankle,'ankle',[0,0,0],[.031,.03,.033],'joint');ball(ankle,'sole',[0,-.05,.052],[.049,.025,.107],'navy');ball(ankle,'foot',[0,-.028,.046],[.048,.035,.1]);
  const shoulder=group(chest,prefix+'Upper',side*.22,.17,0);ball(shoulder,'shoulder_joint',[0,0,0],[.055,.059,.057],'navy');ball(shoulder,'deltoid',[side*.012,-.012,-.001],[.061,.075,.061]);
  shell(shoulder,'upper_arm',[[-.045,.051,.047],[-.11,.047,.045],[-.22,.036,.035],[-.26,.032,.032]]);
  const elbow=group(shoulder,prefix+'Lower',0,-.275,0);ball(elbow,'elbow',[0,0,0],[.034,.035,.034],'joint');
  shell(elbow,'forearm',[[-.025,.034,.034],[-.08,.049,.043],[-.16,.041,.035],[-.245,.024,.026]]);
  const wrist=group(elbow,prefix+'Hand',0,-.265,0);ball(wrist,'wrist',[0,0,0],[.026,.025,.025],'navy');ball(wrist,'palm',[0,-.043,0],[.036,.043,.02]);
  for(let f=0;f<4;f++){const finger=group(wrist,prefix+'Finger'+f,(f-1.5)*.017,-.075,.002);fingers.push(finger);let p=finger;for(let s=0;s<3;s++){ball(p,'finger_joint',[0,0,0],[.008,.008,.008],'joint');ball(p,'finger_shell',[0,-.012,.002],[.008,.013,.008]);p=group(p,prefix+'Finger'+f+'Joint'+s,0,-.023,.003);p.rotation.x=.2;}}
  const thumb=group(wrist,prefix+'Thumb',-side*.035,-.025,.008);thumb.rotation.z=-side*.55;ball(thumb,'thumb',[0,-.024,0],[.012,.027,.012]);ball(thumb,'thumb_tip',[0,-.05,.008],[.01,.016,.011]);
  shoulder.rotation.z=side<0?-.2:.12;elbow.rotation.x=side<0?-1:-.08;elbow.rotation.z=side<0?.22:0;wrist.rotation.x=side<0?-.4:0;
 }
 const rest=new Map(Object.values(joints).map(o=>[o,o.rotation.clone()]));
 function applyPose(p={}){for(const [o,r] of rest)o.rotation.copy(r);const v=k=>Number.isFinite(p[k])?p[k]:0;
  spine.rotation.z=v('spine')*2;chest.scale.set(1+v('breathe')*.004,1+v('breathe')*.002,1+v('breathe')*.006);head.rotation.y=v('gazeX')*.32;head.rotation.x=v('gazeY')*.2;head.rotation.z=v('head')*2.5;neck.rotation.x=v('neck')*3;
  for(const side of ['left','right']){joints[side+'Upper'].rotation.z+=v(side+'Upper')*4;joints[side+'Lower'].rotation.x-=v(side+'Lower')*5;joints[side+'Hand'].rotation.z+=v(side+'Hand')*3;}
  pelvis.rotation.y=v('shift')*8;for(const e of eyes)e.scale.y=Math.max(.04,1-v('blink'));for(const f of fingers)f.rotation.x+=v('breathe')*.025;
 }
 function dispose(){root.traverse(o=>o.geometry?.dispose());Object.values(materials).forEach(m=>m.dispose());}
 return {root,joints,applyPose,dispose};
}

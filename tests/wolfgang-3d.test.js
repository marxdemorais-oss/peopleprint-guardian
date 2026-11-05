import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {Vector3,Box3,Texture,Group,Quaternion} from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {ConvexHull} from 'three/addons/math/ConvexHull.js';
import {createRigMotion} from '../web/assets/wolfgang-live.js';
async function load(){
 globalThis.self=globalThis;
 const file=fs.readFileSync(new URL('../web/assets/wolfgang.glb',import.meta.url));assert.equal(file.readUInt32LE(0),0x46546c67);assert.equal(file.readUInt32LE(8),file.length);
 // Node has no image decoder. Textures are visually checked in Blender; this
 // loader test covers the exact shipped mesh, skeleton and animation math.
 const loader=new GLTFLoader();loader.register(()=>({name:'QA_TEXTURE_STUB',loadTexture:()=>Promise.resolve(new Texture())}));
 return (await loader.parseAsync(file.buffer.slice(file.byteOffset,file.byteOffset+file.byteLength),'')).scene;
}
test('shipped Wolfgang has real volume, finite geometry, skin weights and humanoid bones',async()=>{
 const model=fs.readFileSync(new URL('../web/assets/wolfgang.glb',import.meta.url));
 const colliders=JSON.parse(fs.readFileSync(new URL('../model/reconstruction/thigh-contact-colliders.json',import.meta.url),'utf8'));
 assert.equal(colliders.modelSha256,createHash('sha256').update(model).digest('hex'),'changing the model requires rebuilding its contact surfaces');
 const root=await load(),size=new Box3().setFromObject(root).getSize(new Vector3());assert(size.z>.25);assert(size.y>.9&&size.y<1.1);
 let meshes=0,bones=0;root.traverse(o=>{if(o.isBone)bones++;if(!o.isMesh)return;meshes++;assert(o.isSkinnedMesh);for(const v of o.geometry.attributes.position.array)assert(Number.isFinite(v));for(const ix of o.geometry.index?.array||[])assert(ix<o.geometry.attributes.position.count);});assert(meshes>100);assert.equal(bones,69);
});
test('arrival, first tap and repeated taps visibly react without repeating recent gestures',async()=>{
 const root=await load();let seed=25;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};const motion=createRigMotion(root,{random,restAfter:Infinity});motion.tick(0);
 const arrival=motion.arrive();assert.equal(arrival.arrival,true);assert.equal(motion.snapshot().phase,'greeting');
 const names=[arrival.name],hand=root.getObjectByName('mixamorigRightHand'),head=root.getObjectByName('mixamorigHead');
 for(let tap=0;tap<12;tap++){
  const before=hand.getWorldPosition(new Vector3()),headBefore=head.getWorldQuaternion(new Quaternion()),reaction=motion.greet();assert(!names.slice(-2).includes(reaction.name));names.push(reaction.name);motion.tick(0);assert(before.distanceTo(hand.getWorldPosition(new Vector3()))<1e-6);
  for(let i=0;i<20;i++)motion.tick(1/60);
  assert(before.distanceTo(hand.getWorldPosition(new Vector3()))>.002||headBefore.angleTo(head.getWorldQuaternion(new Quaternion()))>.005,'a tap must be acknowledged within a third of a second');
  for(let i=0;i<1800&&(motion.snapshot().phase==='greeting'||motion.snapshot().pendingGreeting);i++)motion.tick(1/60);
  assert.notEqual(motion.snapshot().phase,'greeting','each greeting returns to standing');
 }
 assert(!names.includes('hand_on_hip')&&!names.includes('thinking'));
 for(const name of ['hello','open_palm','acknowledge'])assert(names.includes(name),`repeated taps should include ${name}`);
 assert.equal(motion.react({intent:'execute-code'}),false);
});
test('rapid taps keep one pending reaction without resetting a moving arm',async()=>{
 const root=await load(),motion=createRigMotion(root,{random:()=>.37}),hand=root.getObjectByName('mixamorigRightHand');
 motion.arrive();for(let i=0;i<80;i++)motion.tick(1/60);
 const active=motion.snapshot().action;let pending;
 for(let i=0;i<5;i++){
  const before=hand.getWorldPosition(new Vector3()),r=motion.greet();pending=r.name;
  assert.equal(r.queued,true);assert.equal(motion.snapshot().action,active);assert.equal(motion.snapshot().pendingGreeting,pending);
  motion.tick(0);assert(before.distanceTo(hand.getWorldPosition(new Vector3()))<1e-7);motion.tick(1/60);
 }
 let seen=false;for(let i=0;i<600;i++){const s=motion.tick(1/60);if(s.action===pending&&s.pendingGreeting===null)seen=true;}
 assert(seen,'the most recent requested reaction must run after the current phrase');assert.equal(motion.snapshot().pendingGreeting,null);
});

test('the right arm never flips its elbow plane during a hand offer or its return',async()=>{
 // Regression for the observed 56-degree single-frame upper-arm flip. Inspect
 // every update, since widely spaced review stills can miss the discontinuity.
 for(const hz of [20,60,120]){
  const root=await load(),motion=createRigMotion(root,{random:()=>.37});
  const joints=['RightArm','RightForeArm','RightForeArmTwist','RightHand'].map(name=>root.getObjectByName('mixamorig'+name));
  motion.play('open_palm');motion.tick(0);
  let before=joints.map(joint=>joint.getWorldQuaternion(new Quaternion()));
  for(let frame=1;frame<=hz*8;frame++){
   motion.tick(1/hz);
   const after=joints.map(joint=>joint.getWorldQuaternion(new Quaternion()));
   after.forEach((q,i)=>{
    const speed=before[i].angleTo(q)*180/Math.PI*hz;
    assert(speed<300,`${hz} Hz, ${frame/hz}s: ${joints[i].name} rotates at ${speed.toFixed(1)} degrees/second`);
   });
   before=after;
  }
 }
});

test('unattended motion stays quietly attentive instead of cycling thinking and hip poses',async()=>{
 const root=await load();let seed=12;const motion=createRigMotion(root,{random:()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;},restAfter:45});
 const actions=new Set(),shifts=[],footMotion=new Set();
 for(let i=0;i<200*60;i++){motion.tick(1/60);if(i%15===0){const s=motion.snapshot();actions.add(s.action);shifts.push(s.stance.shift);if(s.stance.movingFoot)footMotion.add(s.stance.movingFoot);assert.equal(s.seat,0);}}
 for(const name of ['relaxed','attentive'])assert(actions.has(name),`idle should include ${name}`);
 assert(!actions.has('thinking'));assert(!actions.has('hand_on_hip'));assert.equal(motion.snapshot().intent,'attending');
 assert(!actions.has('fold_arms'));assert(footMotion.size>0);assert(Math.max(...shifts)-Math.min(...shifts)>.015);
});

test('thinking and hip poses maintain actual hand contact while gaze and stance change',async()=>{
 for(const name of ['thinking','hand_on_hip'])for(const hz of [20,60]){
  const root=await load(),motion=createRigMotion(root,{random:()=>.37});
  assert.equal(motion.play(name),true);let held=0;
  for(let i=0;i<hz*12;i++){
   if(i===hz*4)motion.attend(.8,-.5);
   if(i===hz*5)motion.attend(-.8,.5);
   const state=motion.tick(1/hz),contact=state.bodyContacts?.[name];
   if(!contact?.active)continue;
   assert(contact.error<.0005,`${name} at ${state.time}s: hand loses the supporting surface by ${contact.error}`);
   assert(contact.gap>.0001&&contact.gap<.003,`${name}: surface gap ${contact.gap}`);
   held++;
  }
  assert(held>=hz*2,`${name} must sustain visible body contact for at least two seconds`);
 }
});

test('both complete hands stay outside the thigh armour through relaxed stance and greeting returns',async()=>{
 for(const random of [()=>.1,()=>.9]){
  const root=await load(),parts={Left:{hand:[],thigh:[]},Right:{hand:[],thigh:[]}};
  root.traverse(mesh=>{if(!mesh.isSkinnedMesh)return;const {skinIndex,skinWeight}=mesh.geometry.attributes;
   for(let i=0;i<skinIndex.count;i++){
    let largest=-1,joint;for(let j=0;j<4;j++)if(skinWeight.array[i*4+j]>largest){largest=skinWeight.array[i*4+j];joint=mesh.skeleton.bones[skinIndex.array[i*4+j]].name;}
    for(const side of ['Left','Right']){const item={mesh,i};if(joint.startsWith('mixamorig'+side+'Hand'))parts[side].hand.push(item);if(joint==='mixamorig'+side+'UpLeg')parts[side].thigh.push(item);}
   }
  });
  const point=({mesh,i})=>mesh.localToWorld(mesh.getVertexPosition(i,new Vector3()));
  const clear=label=>{root.updateMatrixWorld(true);for(const side of ['Left','Right']){
   const distinct=new Map(parts[side].thigh.map(item=>{const p=point(item);return [p.toArray().map(n=>Math.round(n*1e7)).join(','),p];}));
   const faces=new ConvexHull().setFromPoints([...distinct.values()]).faces.filter(face=>face.normal.lengthSq()>.5);assert(faces.length>=4);
   for(const item of parts[side].hand){const p=point(item);assert(faces.some(face=>face.distanceToPoint(p)>=-.0005),`${label}: ${side} hand enters thigh armour`);}
  }};
  const motion=createRigMotion(root,{random});motion.play('relaxed');for(let i=0;i<180;i++)motion.tick(1/60);clear('relaxed');
  for(const name of ['hello','open_palm','acknowledge']){assert.equal(motion.play(name),true,name);for(let i=0;i<360;i++){motion.tick(1/60);if(i%30===0)clear(`${name} ${i/60}s`);}}
 }
});

test('a right-hand greeting keeps the left hand on its thigh support',async()=>{
 const root=await load(),motion=createRigMotion(root,{random:()=>.5});
 motion.play('relaxed');for(let i=0;i<180;i++)motion.tick(1/60);
 const thigh=root.getObjectByName('mixamorigLeftUpLeg'),hand=root.getObjectByName('mixamorigLeftHand');
 const local=bone=>thigh.worldToLocal(bone.getWorldPosition(new Vector3()));
 const restingHand=local(hand);
 motion.play('hello');
 for(let i=0;i<300;i++){
  motion.tick(1/60);
  assert(local(hand).distanceTo(restingHand)<.0015,'the non-gesturing hand should follow its thigh support');
  assert(motion.snapshot().handContacts.Left.error<.0005,'the supporting pad must remain on the armour');
 }
});
test('supported hands follow the thigh surface through stance changes, steps and interrupted greetings',async()=>{
 const root=await load();let seed=123;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
 const motion=createRigMotion(root,{random});motion.play('relaxed');let checked=0,steps=0;
 for(let i=0;i<90*60;i++){
  if(i===4*60)motion.play('hello');if(i===12*60)motion.play('open_palm');if(i===20*60)motion.play('relaxed');
  const state=motion.tick(1/60);if(state.stance.movingFoot)steps++;
  for(const [k,side] of ['Left','Right'].entries())if(state.contactWeights[k]>.999999){
   const c=state.handContacts[side];assert(c.error<.0005,`${side} loses its body support at ${state.time}s: ${c.error}`);
   assert(c.gap>0&&c.gap<.0015,`${side} contact must rest outside the actual armour surface`);checked++;
  }
 }
 assert(checked>5000);assert(steps>20,'the contact must also be checked while a foot changes position');
});

test('zero time holds the pose and repeated motion remains finite under stage transforms',async()=>{
 const root=await load(),pivot=new Group();pivot.rotation.y=-1.2;pivot.scale.x=1.035;pivot.add(root);const motion=createRigMotion(root,{random:()=>.31});
 for(let i=0;i<1800;i++){if(i%181===0)motion.greet();motion.tick(1/60);}
 const before=motion.snapshot();motion.tick(0);assert.deepEqual(motion.snapshot(),before);root.traverse(o=>{if(o.isBone)assert([...o.position,...o.quaternion].every(Number.isFinite));});
});

test('shipped model contains no back branding',async()=>{
 const root=await load();root.traverse(o=>assert(!/^Back_(brand|people|powered)/.test(o.name)));
});

test('metal palms are rigid and forearm rotation is separated from elbow hardware',async()=>{
 const root=await load();
 for(const [name,joint] of [['tripo_part_18','RightHand'],['tripo_part_31','LeftHand'],['tripo_part_8','LeftForeArmTwist'],['tripo_part_58','RightForeArm']]){
  const mesh=root.getObjectByName(name);assert(mesh?.isSkinnedMesh,name);
  const index=mesh.geometry.attributes.skinIndex,weight=mesh.geometry.attributes.skinWeight;
  for(let i=0;i<index.count;i++){
   assert.equal(mesh.skeleton.bones[index.getX(i)].name,'mixamorig'+joint);
   assert.equal(weight.getX(i),1);
  }
 }
 for(const side of ['Left','Right'])assert.equal(root.getObjectByName('mixamorig'+side+'Hand').parent.name,'mixamorig'+side+'ForeArmTwist');
});

test('chest mark is printed into the armour, with stable colour and attachment',async()=>{
 const root=await load();assert.equal(root.getObjectByName('tripo_part_90'),undefined);
 assert.equal(root.getObjectByName('Chest_badge_mint'),undefined);
 for(const [name,hex]of [['Guardian mint badge',0x89d6c4],['Guardian navy badge',0x1a2f42]]){
  let mark;root.traverse(o=>{if(o.isMesh&&o.material.name===name)mark=o;});assert(mark?.isSkinnedMesh);
  assert.equal(mark.material.color.getHex(),hex);
  const index=mark.geometry.attributes.skinIndex,weight=mark.geometry.attributes.skinWeight;
  for(let i=0;i<index.count;i++){assert.equal(mark.skeleton.bones[index.getX(i)].name,'mixamorigSpine2');assert.equal(weight.getX(i),1);}
 }
});

test('unverified floor poses are unavailable and the checked palm gesture keeps the elbow below its shoulder',async()=>{
 const root=await load(),motion=createRigMotion(root,{random:()=>.5});
 assert.equal(motion.play('floor_rest'),false);assert.equal(motion.play('fold_arms'),false);
 motion.play('open_palm');for(let i=0;i<90;i++)motion.tick(1/60);
 const p=n=>root.getObjectByName('mixamorigRight'+n).getWorldPosition(new Vector3());
 assert(p('ForeArm').y<p('Arm').y-.055,'elbow must not fold up to shoulder height');
 assert(p('Hand').x>p('ForeArm').x+.075,'open palm reaches forward from the elbow');
});

test('the greeting is a bent-elbow side wave rather than an across-face or overhead salute',async()=>{
 const root=await load(),motion=createRigMotion(root,{random:()=>.37});motion.arrive();
 const p=n=>root.getObjectByName('mixamorig'+n).getWorldPosition(new Vector3());let checked=0;
 for(let i=0;i<300;i++){
  motion.tick(1/60);if(i<95||i>145)continue;
  const shoulder=p('RightArm'),elbow=p('RightForeArm'),wrist=p('RightHand'),head=p('Head'),right=shoulder.clone().sub(p('LeftArm')).normalize();
  const bend=Math.PI-shoulder.clone().sub(elbow).angleTo(wrist.clone().sub(elbow));
  assert(wrist.clone().sub(head).dot(right)>.13,'the wave must remain visibly beside the head');
  assert(wrist.y<head.y+.01,'the wrist must not rise above the head');
  assert(elbow.y<shoulder.y-.015,'a relaxed wave keeps the elbow below the shoulder');
  assert(bend>65*Math.PI/180&&bend<135*Math.PI/180,'the greeting needs a comfortably bent elbow');checked++;
 }
 assert(checked>40);
});

test('returning body contacts remain supported at mobile and desktop update cadences',async()=>{
 for(const hz of [20,30,60])for(const random of [()=>.1,()=>.9]){
  const root=await load(),motion=createRigMotion(root,{random});motion.arrive();let checked=0;
  for(let i=0;i<hz*12;i++){
   if(i===hz*2||i===hz*3||i===hz*7)motion.greet();
   const state=motion.tick(1/hz);
   for(const [index,side] of ['Left','Right'].entries())if(state.contactWeights[index]>.999999){
    const contact=state.handContacts[side];assert(contact.error<.0005,`${hz} Hz: ${side} support error ${contact.error}`);assert(contact.gap>0);checked++;
   }
  }
  assert(checked>hz*10);
 }
});

function lowestVertex(mesh){let low=Infinity;for(let i=0;i<mesh.geometry.attributes.position.count;i++){const p=mesh.getVertexPosition(i,new Vector3());mesh.localToWorld(p);low=Math.min(low,p.y);}return low;}
test('actual soles stay on the floor through greetings and interrupted reactions',async()=>{
 const root=await load(),motion=createRigMotion(root,{random:()=>.5,restAfter:Infinity});
 const soles=['Left','Right'].map(side=>root.getObjectByName('Internal_'+side+'_continuous_sole'));
 const toes=['Left','Right'].map(side=>root.getObjectByName('mixamorig'+side+'ToeBase')),toeRest=toes.map(b=>b.quaternion.clone().normalize());
 for(const name of ['hello','open_palm','acknowledge']){
  assert.equal(motion.play(name),true,name);
  for(let i=0;i<6*60;i++){
   motion.tick(1/60);if(i%30)continue;
   const lows=soles.map(lowestVertex);assert(Math.min(...lows)>-.001,'no support penetrates the floor');assert(Math.min(...lows)<.003,'at least one supporting shoe always meets the floor');assert(Math.max(...lows)<.017,'only a short deliberate step may lift a shoe');
   toes.forEach((b,j)=>assert(b.quaternion.clone().normalize().angleTo(toeRest[j])<1e-6));
  }
 }
});

test('shoulder bearings and shoe interiors are closed geometry, and robot sockets remain attached',async()=>{
 const root=await load();
 const interiors=[];root.traverse(o=>{if(o.isMesh&&/^Internal_/.test(o.name)&&!/axle/.test(o.name))interiors.push(o);});assert(interiors.length>=9);
 for(const mesh of interiors){
  const g=mesh.geometry,p=g.attributes.position,ids=new Map(),vertex=[];for(let i=0;i<p.count;i++){const key=[p.getX(i),p.getY(i),p.getZ(i)].map(n=>Math.round(n*1e6)).join(',');if(!ids.has(key))ids.set(key,ids.size);vertex.push(ids.get(key));}
  const edges=new Map(),indices=g.index?.array||Array.from({length:p.count},(_,i)=>i);
  for(let i=0;i<indices.length;i+=3){const face=[vertex[indices[i]],vertex[indices[i+1]],vertex[indices[i+2]]];if(new Set(face).size!==3)continue;for(let j=0;j<3;j++){const edge=[face[j],face[(j+1)%3]].sort((a,b)=>a-b).join(':');edges.set(edge,(edges.get(edge)||0)+1);}}
  assert([...edges.values()].every(n=>n===2),`${mesh.name} must have no open or non-manifold edges`);
 }
 const shoulders=['Left','Right'].map(side=>root.getObjectByName('mixamorig'+side+'Shoulder')),rest=shoulders.map(b=>b.quaternion.clone().normalize()),motion=createRigMotion(root,{restAfter:Infinity});motion.play('hello');for(let i=0;i<300;i++){motion.tick(1/60);shoulders.forEach((b,j)=>assert(b.quaternion.clone().normalize().angleTo(rest[j])<1e-6));}
});


test('repeated greetings vary their timing and path while model cues remain bounded and replay-safe',async()=>{
 const root=await load();let seed=71;const motion=createRigMotion(root,{random:()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;}}),phrases=[];
 for(let i=0;i<5;i++){motion.play('hello');const state=motion.snapshot();phrases.push(JSON.stringify(state.phrase));for(let frame=0;frame<600;frame++)motion.tick(1/60);}
 assert.equal(new Set(phrases).size,phrases.length,'a repeated gesture must not replay the same temporal/spatial parameters');
 assert.equal(motion.react({intent:'thinking',eventId:'cue-1',intensity:20,durationMs:999999,target:'evidence'}),true);
 let state=motion.snapshot();assert.equal(state.cue.intensity,1);assert.equal(state.cue.target,'evidence');assert(Math.abs(state.cue.until-state.time-15)<1e-9);
 assert.equal(motion.react({intent:'thinking',eventId:'cue-1'}),false);assert.equal(motion.react({intent:'execute-code',eventId:'cue-2'}),false);
 for(let i=0;i<16*60;i++)motion.tick(1/60);assert.equal(motion.snapshot().intent,'attending');
});


test('AI direction sequences real poses and cancels through a smooth return without replay',async()=>{
 const root=await load(),motion=createRigMotion(root,{random:()=>.37}),version='wolfgang.director.v1';
 assert.equal(motion.direct({version,id:'bad',mode:'replace',steps:[{gesture:'execute-code'}]}),false);
 assert.equal(motion.direct({version,id:'sequence',mode:'replace',steps:[{gesture:'hello',tempo:1,intensity:.5,holdMs:300,gaze:{x:.6,y:-.2},posture:{turn:.03,shift:.01},hands:{right:'open'}},{gesture:'open_palm'}]}),true);
 assert.equal(motion.snapshot().director.current,'hello');assert.equal(motion.snapshot().director.queued,1);
 for(let i=0;i<120;i++)motion.tick(1/60);
 const hand=root.getObjectByName('mixamorigRightHand'),before=hand.getWorldPosition(new Vector3());
 assert.equal(motion.direct({version,id:'cancel-sequence',mode:'cancel'}),true);motion.tick(0);assert(before.distanceTo(hand.getWorldPosition(new Vector3()))<1e-7);
 assert.equal(motion.snapshot().director.queued,0);
 let previous=hand.getWorldQuaternion(new Quaternion());for(let i=0;i<180;i++){motion.tick(1/60);const current=hand.getWorldQuaternion(new Quaternion());assert(previous.angleTo(current)*180/Math.PI*60<300,'cancellation must return without an abrupt wrist rotation');previous=current;}assert.equal(motion.snapshot().director.status,'cancelled');assert.notEqual(motion.snapshot().action,'open_palm');
 assert.equal(motion.direct({version,id:'sequence',mode:'replace',steps:[{gesture:'hello'}]}),false,'a completed/cancelled command cannot replay');
 root.traverse(o=>{if(o.isBone)assert([...o.quaternion,...o.position].every(Number.isFinite));});
});


test('suspending an inactive scene clears conversation cues and safely releases its pending pose',async()=>{
 const root=await load(),motion=createRigMotion(root,{random:()=>.37});
 motion.react({intent:'thinking',eventId:'actual-request'});for(let i=0;i<240;i++)motion.tick(1/60);
 assert.equal(motion.snapshot().action,'thinking');motion.react({intent:'asking',eventId:'old-followup'});
 assert.equal(motion.suspend(),true);assert.equal(motion.snapshot().intent,'attending');
 for(let i=0;i<30;i++)motion.tick(1/60);motion.suspend();
 for(let i=0;i<90;i++)motion.tick(1/60);assert.equal(motion.snapshot().director.status,'cancelled');assert.notEqual(motion.snapshot().action,'thinking');assert.notEqual(motion.snapshot().action,'open_palm');assert.equal(motion.snapshot().director.queued,0);
});

test('an AI can direct both arm destinations independently and return to rest',async()=>{
 const root=await load(),motion=createRigMotion(root,{random:()=>.36});motion.tick(0);
 const position=side=>root.getObjectByName('mixamorig'+side+'Hand').getWorldPosition(new Vector3());
 const start=['Left','Right'].map(position),arms={left:{lift:.68,forward:.7,outward:.32},right:{lift:.23,forward:.15,outward:.16}};
 assert(motion.direct({version:'wolfgang.director.v1',id:'both-arms',mode:'replace',steps:[{gesture:'attentive',holdMs:2600,arms,hands:{left:'open',right:'soft_fist'}}]}));
 for(let i=0;i<150;i++)motion.tick(1/60);
 const left=position('Left').distanceTo(start[0]),right=position('Right').distanceTo(start[1]);assert(left>.12);assert(right>.05&&right<left);
 motion.cancelDirection();for(let i=0;i<200;i++)motion.tick(1/60);
 assert(motion.snapshot().contactWeights.every(x=>x>.999));assert.equal(motion.snapshot().director.status,'cancelled');
});

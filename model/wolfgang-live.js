import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {createPerformance as createRigMotion} from './wolfgang-performance.js';
import {WOLFGANG_HOME_YAW,shadowViewport,requiredShadowLightHeight} from './wolfgang-framing.js';
export {createRigMotion};

export async function createWolfgangView(stage,{portrait=false}={}){
 const canvas=document.createElement('canvas');canvas.className='wolfgang-render';canvas.setAttribute('aria-hidden','true');
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.75));renderer.setClearColor(0xffffff,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.95;
 const scene=new THREE.Scene(),camera=new THREE.OrthographicCamera(-.4,.4,.6,-.6,.01,12);
 const pmrem=new THREE.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.05);scene.environment=environment.texture;scene.environmentIntensity=.65;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xffffff,0x6c8390,1.2));
 let keyLight;
 for(const [p,intensity] of [[[2,3,3],2],[[-2,2,2],.8],[[0,2,-3],1.5]]){const l=new THREE.DirectionalLight(0xffffff,intensity);l.position.set(...p);if(intensity===2){keyLight=l;l.castShadow=true;l.shadow.mapSize.set(512,512);l.shadow.camera.left=-1.2;l.shadow.camera.right=1.2;l.shadow.camera.top=1.6;l.shadow.camera.bottom=-1.1;l.shadow.camera.near=.1;l.shadow.camera.far=7;l.shadow.normalBias=.002;l.shadow.bias=-.00015;l.shadow.radius=3;}scene.add(l);}
 let gltf;try{gltf=await new GLTFLoader().loadAsync(WOLFGANG_GLB_URL);}catch(e){renderer.dispose();environment.dispose();throw e;}
 const pivot=new THREE.Group();pivot.rotation.y=WOLFGANG_HOME_YAW;pivot.scale.x=1.035;pivot.add(gltf.scene);scene.add(pivot);
 gltf.scene.traverse(o=>{if(o.isMesh){o.castShadow=true;o.frustumCulled=false;if(o.material){o.material.envMapIntensity=.65;}}});
 const groundGeometry=new THREE.PlaneGeometry(5,5),groundMaterial=new THREE.ShadowMaterial({opacity:.18}),ground=new THREE.Mesh(groundGeometry,groundMaterial);ground.rotation.x=-Math.PI/2;ground.position.y=-.001;ground.receiveShadow=true;scene.add(ground);
 const motion=createRigMotion(gltf.scene);let yaw=0,yawTarget=0,disposed=false;
 const framingBones=[],shadowBones=[];let head,hips;gltf.scene.traverse(o=>{if(!o.isBone)return;shadowBones.push(o);if(/HeadTop|Hand$|Foot$|Toe_End|ForeArm|UpLeg/.test(o.name))framingBones.push(o);if(o.name==='mixamorigHead')head=o;if(o.name==='mixamorigHips')hips=o;});
 const shadowPoints=shadowBones.map(()=>new THREE.Vector3());
 let frameHeight=0,frameX=0,frameY=.49,shadowLayout='';const point=new THREE.Vector3();
 function render(dt=0){
  if(disposed)return;motion.tick(dt);yaw+=(yawTarget-yaw)*(dt?1-Math.exp(-dt*8):0);pivot.rotation.y=WOLFGANG_HOME_YAW+yaw;scene.updateMatrixWorld(true);
  const w=Math.max(1,stage.clientWidth),h=Math.max(1,stage.clientHeight),aspect=w/h;
  let height,x,y;const depth=hips.getWorldPosition(point).z;
  if(portrait){head.getWorldPosition(point);height=.25;x=point.x;y=point.y+.015;}
  else{
   const floor=motion.snapshot().phase==='floor';
   // Keep a fixed standing floor and camera instead of following every lean.
   // Floor actions get a wider frame; only those actions need recentering.
   height=Math.max(floor?1.25:1.1,(floor?1.10:.94)/aspect);y=floor?.42:.50;x=0;
   if(floor){let minX=Infinity,maxX=-Infinity;for(const bone of framingBones){bone.getWorldPosition(point);minX=Math.min(minX,point.x);maxX=Math.max(maxX,point.x);}x=(minX+maxX)/2;}
  }
  const blend=dt?1-Math.exp(-dt*2.5):1;
  frameHeight=frameHeight?Math.max(height,frameHeight+(height-frameHeight)*blend):height;
  frameX+=(x-frameX)*blend;frameY+=(y-frameY)*blend;
  const viewport=shadowViewport({width:w,height:h,left:stage.getBoundingClientRect().left,viewportWidth:document.documentElement.clientWidth,frameHeight,portrait,contained:stage.id==='model'});
  const size=renderer.getSize(new THREE.Vector2());if(size.x!==viewport.width||size.y!==h)renderer.setSize(viewport.width,h,false);
  canvas.style.left=viewport.left+'px';canvas.style.right='auto';canvas.style.width=viewport.width+'px';
  camera.left=viewport.cameraLeft;camera.right=viewport.cameraRight;camera.top=frameHeight/2;camera.bottom=-frameHeight/2;
  if(!portrait){
   // Retain the longest fitting light angle across motion. A lifted hand must
   // not make the light wobble; reset the envelope only after a layout change.
   const layout=w+':'+h+':'+viewport.left;if(layout!==shadowLayout){keyLight.position.y=3;shadowLayout=layout;}
   shadowBones.forEach((bone,i)=>bone.getWorldPosition(shadowPoints[i]));
   keyLight.position.y=requiredShadowLightHeight(shadowPoints,frameX+camera.left,{minHeight:keyLight.position.y});
   keyLight.shadow.camera.far=Math.max(7,keyLight.position.length()+3);keyLight.shadow.camera.updateProjectionMatrix();
  }
  camera.position.set(frameX,frameY+(portrait?0:.22),depth+3);camera.lookAt(frameX,frameY,depth);camera.updateProjectionMatrix();renderer.render(scene,camera);
 }
 let start=null,dragged=false;
 const down=e=>{if(e.target.closest('[data-motion]'))return;start={x:e.clientX,y:e.clientY};dragged=false;};
 const move=e=>{if(!start)return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(!dragged&&Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy))dragged=true;if(dragged){yaw+=dx*.008;yawTarget=yaw;start={x:e.clientX,y:e.clientY};render();}};
 const up=()=>{start=null;};
 const click=e=>{if(dragged){e.preventDefault();e.stopImmediatePropagation();}else{yawTarget=0;const reaction=motion.greet();stage.dispatchEvent(new CustomEvent('wolfgang:greet',{detail:reaction,bubbles:true}));}start=null;};
 stage.addEventListener('pointerdown',down);stage.addEventListener('pointermove',move);stage.addEventListener('pointerup',up);stage.addEventListener('pointercancel',up);stage.addEventListener('click',click,true);
 stage.style.touchAction='pan-y';
 stage.append(canvas);render();stage.dataset.rendered='true';stage.dataset.model='rigged-3d';
 return {render,arrive:previous=>{yawTarget=0;return motion.arrive(previous);},greet:()=>{yawTarget=0;return motion.greet();},attend:(x,y)=>motion.attend(x,y),react:d=>motion.react(d),direct:command=>motion.direct(command),cancelDirection:()=>motion.cancelDirection(),suspend:()=>motion.suspend(),turn:v=>{yaw+=v;yawTarget=yaw;render();},reset:()=>{yawTarget=0;render();},snapshot:()=>motion.snapshot(),dispose(){disposed=true;stage.removeEventListener('pointerdown',down);stage.removeEventListener('pointermove',move);stage.removeEventListener('pointerup',up);stage.removeEventListener('pointercancel',up);stage.removeEventListener('click',click,true);canvas.remove();delete stage.dataset.rendered;delete stage.dataset.model;gltf.scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){for(const v of Object.values(m))if(v?.isTexture)v.dispose();m.dispose();}}});groundGeometry.dispose();groundMaterial.dispose();environment.dispose();renderer.dispose();}};
}

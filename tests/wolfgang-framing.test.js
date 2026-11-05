import test from 'node:test';
import assert from 'node:assert/strict';
import {WOLFGANG_HOME_YAW,shadowViewport,requiredShadowLightHeight} from '../model/wolfgang-framing.js';

test('home rotation points the body slightly towards the copy on the left',()=>{
 const anatomicalFront={x:.895,z:-.444};
 const screenX=anatomicalFront.x*Math.cos(WOLFGANG_HOME_YAW)+anatomicalFront.z*Math.sin(WOLFGANG_HOME_YAW);
 const towardViewer=-anatomicalFront.x*Math.sin(WOLFGANG_HOME_YAW)+anatomicalFront.z*Math.cos(WOLFGANG_HOME_YAW);
 assert(screenX<0&&screenX>-.2);assert(towardViewer>.97);
});

test('extended shadow surface preserves Wolfgang scale, position and viewport bounds',()=>{
 for(const input of [
  {width:570,height:520,left:710,viewportWidth:1320,frameHeight:1.1},
  {width:335,height:440,left:20,viewportWidth:375,frameHeight:.94*440/335},
  {width:350,height:470,left:20,viewportWidth:390,frameHeight:.94*470/350},
  {width:327,height:470,left:24,viewportWidth:375,frameHeight:.94*470/327,contained:true},
  {width:64,height:64,left:200,viewportWidth:1024,frameHeight:.25,portrait:true},
 ]){
  const view=shadowViewport(input),half=input.width/input.height*input.frameHeight/2;
  for(const x of [-.25,0,.25]){
   const previousPixel=input.left+(x+half)/(half*2)*input.width;
   const newPixel=input.left+view.left+(x-view.cameraLeft)/(view.cameraRight-view.cameraLeft)*view.width;
   assert(Math.abs(previousPixel-newPixel)<1e-9,'off-centre projection must not move or rescale the model');
  }
  assert(input.left+view.left>=0);assert(input.left+view.left+view.width<=input.viewportWidth);
  if(input.portrait||input.contained)assert.equal(view.left,0);
  else assert(view.left<0);
 }
});

test('compact shadow fitting includes the soft edge and never jitters the light downward',()=>{
 const points=[{x:0,y:1.04},{x:-.31,y:.88},{x:.15,y:.03}];
 for(const edge of [-1.05,-.52,-.47]){
  const y=requiredShadowLightHeight(points,edge);
  for(const p of points)assert(p.x-.085-(p.y+.085)*2/y>=edge-1e-9);
  assert.equal(requiredShadowLightHeight([{x:0,y:.2}],edge,{minHeight:y}),y);
 }
 assert.equal(requiredShadowLightHeight(points,-1.05),3);
});

// The public and private screens share the same failed-renderer recovery.
async function mountFailedView({fail=true,disposeEarly=false,reducedMotion=false}={}){
 const {readFileSync}=await import('node:fs'),{runInNewContext}=await import('node:vm');
 function element(tag='div'){
  const el={tagName:tag.toUpperCase(),children:[],dataset:{},className:'',hidden:false,isConnected:true,attributes:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(){},removeEventListener(){},dispatchEvent(){},append(...nodes){for(const node of nodes){node.parent=this;this.children.push(node);}},prepend(node){node.parent=this;this.children.unshift(node);},remove(){if(this.parent)this.parent.children=this.parent.children.filter(n=>n!==this);}};
  el.classList={add(...names){el.className=[...new Set([...el.className.split(' ').filter(Boolean),...names])].join(' ');},remove(...names){el.className=el.className.split(' ').filter(n=>!names.includes(n)).join(' ');},contains(name){return el.className.split(' ').includes(name);}};
  el.querySelector=selector=>el.children.find(n=>selector==='[data-motion]'?n.motion:selector.startsWith('.')&&n.classList.contains(selector.slice(1)))||null;
  return el;
 }
 const stage=element(),status=element('span'),motion=element('button');status.className='wolfgang-loading';status.textContent='Loading Wolfgang…';motion.motion=true;stage.append(status,motion);
 let resolve,reject,cancelled=0;const directed=[];const viewPromise=new Promise((ok,no)=>{resolve=ok;reject=no;}),view={arrive:()=>({arrival:true}),render(){},direct(command){directed.push(command);return true;},cancelDirection(){cancelled++;},snapshot:()=>({director:{status:'idle'}}),dispose(){}};
 const observer=class{observe(){}disconnect(){}addEventListener(){}removeEventListener(){}};
 const source=readFileSync(new URL('../web/assets/wolfgang.js',import.meta.url),'utf8').replace(/^import[^;]+;\n/gm,'').replace('export function mountWolfgang','function mountWolfgang')+'\nthis.controller=mountWolfgang();';
 const context={document:{querySelector:()=>null,querySelectorAll:()=>[stage],createElement:element,body:element(),addEventListener(){},removeEventListener(){}},window:{addEventListener(){},removeEventListener(){}},matchMedia:()=>({matches:reducedMotion,addEventListener(){},removeEventListener(){}}),MutationObserver:observer,IntersectionObserver:observer,ResizeObserver:observer,CustomEvent:class{},requestAnimationFrame:()=>1,cancelAnimationFrame(){},createWolfgangView:()=>viewPromise,speak(){throw Error('No speech expected');},activateVoice(){},clearTimeout,setTimeout};
 runInNewContext(source,context);
 const before=stage.querySelector('.wolfgang-static-portrait');if(disposeEarly)context.controller.dispose();
 if(fail)reject(Error('WebGL unavailable'));else resolve(view);await new Promise(done=>setImmediate(done));
 return {stage,status,motion,before,controller:context.controller,directed,cancelled:()=>cancelled};
}

test('a failed 3D view shows one portrait after failure and hides nonfunctional controls',async()=>{
 const page=await mountFailedView();assert.equal(page.before,null);const portrait=page.stage.querySelector('.wolfgang-static-portrait');assert.ok(portrait);assert.equal(portrait.src,'/assets/wolfgang-portrait.webp');assert.equal(portrait.alt,'Wolfgang, your personal Guardian');assert.equal(portrait.classList.contains('j-wolfgang-fallback'),true);assert.equal(page.stage.attributes['aria-busy'],'false');assert.equal(page.stage.querySelector('.wolfgang-touch').hidden,true);assert.equal(page.motion.hidden,true);assert.doesNotMatch(page.status.textContent,/could not load/);page.controller.sync();assert.equal(page.stage.children.filter(n=>n.classList.contains('wolfgang-static-portrait')).length,1);page.controller.dispose();
});

test('successful and disposed 3D views never receive a failure portrait',async()=>{
 const success=await mountFailedView({fail:false});assert.equal(success.stage.querySelector('.wolfgang-static-portrait'),null);assert.equal(success.stage.querySelector('.wolfgang-touch').disabled,false);success.controller.dispose();
 const removed=await mountFailedView({disposeEarly:true});assert.equal(removed.stage.querySelector('.wolfgang-static-portrait'),null);
});


test('scene director exposes motion state and honours reduced-motion without queued playback',async()=>{
 const command={version:'wolfgang.director.v1',id:'scene-test',mode:'replace',steps:[{gesture:'attentive'}]};
 const active=await mountFailedView({fail:false});assert.equal(active.controller.direct(command),true);assert.equal(active.directed.length,1);assert.equal(active.controller.snapshots()[0].state.director.status,'idle');active.controller.dispose();
 const reduced=await mountFailedView({fail:false,reducedMotion:true});assert.equal(reduced.controller.direct(command),false);assert.equal(reduced.directed.length,0);assert.ok(reduced.cancelled()>0);reduced.controller.dispose();
});

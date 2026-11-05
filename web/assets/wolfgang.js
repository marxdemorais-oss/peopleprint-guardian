import {createWolfgangView} from './wolfgang-live.js';
import {speak,activateVoice} from './wolfgang-voice.js';
let manager;
export function mountWolfgang(){
 if(manager){manager.sync();return manager;}
 const stages=new Map(),reduce=matchMedia('(prefers-reduced-motion: reduce)');
 function attach(stage){
  let view,raf=0,last=0,visible=true,userPaused=false,disposed=false,arrived=false;
  const button=stage.querySelector('[data-motion]')||(stage.id?document.querySelector('[data-motion-for="'+stage.id+'"]'):null);
  const hello=document.createElement('button');hello.type='button';hello.disabled=true;stage.setAttribute('aria-busy','true');hello.className='wolfgang-touch';hello.setAttribute('aria-label','Say hello to Wolfgang');stage.append(hello);
  const hint=document.createElement('span');hint.className='wolfgang-touch-hint';hint.textContent='Loading Wolfgang…';stage.append(hint);
  const reply=document.createElement('span');reply.className='wolfgang-touch-reply';reply.setAttribute('role','status');reply.setAttribute('aria-live','polite');stage.append(reply);
  function active(){return view&&visible&&!userPaused&&!document.hidden&&!reduce.matches&&!disposed;}
  function update(){if(button){button.textContent=reduce.matches?'Reduced motion':userPaused?'Resume movement':'Pause movement';button.setAttribute('aria-pressed',String(userPaused||reduce.matches));button.disabled=reduce.matches;}cancelAnimationFrame(raf);raf=0;last=0;if(!active()){if(view?.suspend)view.suspend();else view?.cancelDirection?.();}if(active()){if(!arrived){arrived=true;let previous;try{previous=sessionStorage.getItem('wolfgang-arrival');}catch{}const arrival=view.arrive(previous);try{sessionStorage.setItem('wolfgang-arrival',arrival.name);}catch{}stage.dispatchEvent(new CustomEvent('wolfgang:greet',{detail:arrival,bubbles:true}));}raf=requestAnimationFrame(frame);}}
  function frame(ms){if(!active())return;const dt=last?(ms-last)/1000:0;last=ms;view.render(dt);raf=requestAnimationFrame(frame);}
  let replyTimer,down=null,dragged=false;
  hello.onpointerdown=e=>{down=[e.clientX,e.clientY];dragged=false;};hello.onpointermove=e=>{if(down&&Math.hypot(e.clientX-down[0],e.clientY-down[1])>12)dragged=true;};hello.onpointercancel=()=>{dragged=true;};
  const greeting=e=>{const lines={hello:"Hello. Good to see you.",wave:"Hello again. You’ve got my attention.",welcome:"Hello. What shall we look at together?",open_palm:"I’m here. What would you like to check?",acknowledge:"I’m listening. Take your time.",thinking:"Let’s think this through.",hand_on_hip:"Take your time. I’m here with you."};reply.textContent=lines[e.detail?.name]||"Hello. I’m here.";reply.classList.add('visible');if(!e.detail?.arrival){activateVoice();speak(reply.textContent);}clearTimeout(replyTimer);replyTimer=setTimeout(()=>{reply.classList.remove('visible');reply.textContent='';},4000);};stage.addEventListener('wolfgang:greet',greeting);
  const pause=()=>{userPaused=!userPaused;update();},react=e=>{if(active())view?.react(e.detail);else view?.suspend?.();},direct=e=>{if(active())view?.direct?.(e.detail);else view?.suspend?.();},point=e=>{const r=stage.getBoundingClientRect();view?.attend((e.clientX-r.left)/r.width*2-1,(e.clientY-r.top)/r.height-.5);};
  button?.addEventListener('click',pause);stage.addEventListener('pointermove',point);window.addEventListener('guardian:reaction',react);window.addEventListener('guardian:motion',direct);document.addEventListener('visibilitychange',update);reduce.addEventListener('change',update);
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;update();},{rootMargin:'30px'});observer.observe(stage);const resize=new ResizeObserver(()=>view?.render());resize.observe(stage);
  createWolfgangView(stage,{portrait:stage.dataset.view==='portrait'}).then(v=>{if(disposed){v.dispose();return;}view=v;stage.classList.remove('wolfgang-static');stage.querySelector('.wolfgang-static-portrait')?.remove();hello.disabled=false;stage.setAttribute('aria-busy','false');stage.querySelector('.wolfgang-loading')?.remove();hint.textContent='Tap Wolfgang';update();}).catch(()=>{
   if(disposed)return;
   stage.setAttribute('aria-busy','false');stage.classList.add('wolfgang-static');
   const status=stage.querySelector('.wolfgang-loading');if(status)status.textContent='Showing Wolfgang’s portrait. 3D movement is unavailable on this device.';
   let portrait=stage.querySelector('.wolfgang-static-portrait')||stage.querySelector('.j-wolfgang-fallback');
   if(!portrait){portrait=document.createElement('img');portrait.src='/assets/wolfgang-portrait.webp';portrait.alt='Wolfgang, your personal Guardian';stage.prepend(portrait);}
   portrait.classList.add('wolfgang-static-portrait','j-wolfgang-fallback');
   hello.disabled=true;hello.hidden=true;hint.hidden=true;reply.hidden=true;if(button)button.hidden=true;
  });
  stages.set(stage,{direct(command){return active()&&view?.direct?.(command)===true;},snapshot(){return view?.snapshot?.()||null;},dispose(){disposed=true;clearTimeout(replyTimer);stage.removeEventListener('wolfgang:greet',greeting);hello.remove();hint.remove();reply.remove();cancelAnimationFrame(raf);observer.disconnect();resize.disconnect();button?.removeEventListener('click',pause);stage.removeEventListener('pointermove',point);window.removeEventListener('guardian:reaction',react);window.removeEventListener('guardian:motion',direct);document.removeEventListener('visibilitychange',update);reduce.removeEventListener('change',update);view?.dispose();}});
 }
 function sync(){for(const [stage,controller] of stages)if(!stage.isConnected){controller.dispose();stages.delete(stage);}document.querySelectorAll('[data-wolfgang]').forEach(stage=>{if(!stages.has(stage))attach(stage);});}
 const mutation=new MutationObserver(sync);mutation.observe(document.body,{childList:true,subtree:true});
 // Decorative network has its own lightweight clock and never requests AI.
 const network=document.querySelector('.hero-network');let netFrame=0,netLast=0,netTime=0;const ctx=network?.getContext('2d'),nodes=Array.from({length:22},()=>({x:Math.random(),y:Math.random(),p:Math.random()*6.28}));
 function networkFrame(ms){netFrame=requestAnimationFrame(networkFrame);if(ms-netLast<90)return;const dt=Math.min(.1,(ms-netLast)/1000);netLast=ms;if(!network||document.hidden)return;const r=network.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;const w=r.width,h=r.height,d=Math.min(devicePixelRatio||1,1.5);if(network.width!==Math.round(w*d)||network.height!==Math.round(h*d)){network.width=Math.round(w*d);network.height=Math.round(h*d);}if(!reduce.matches)netTime+=dt;ctx.setTransform(d,0,0,d,0,0);ctx.clearRect(0,0,w,h);const points=nodes.map(n=>[n.x*w+Math.sin(netTime*.14+n.p)*12,n.y*h+Math.cos(netTime*.11+n.p)*12]);points.forEach(([x,y],i)=>{ctx.fillStyle='#80bca34d';ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill();for(let j=i+1;j<points.length;j++){const [X,Y]=points[j],distance=Math.hypot(x-X,y-Y);if(distance<140){ctx.strokeStyle=`rgba(92,155,129,${(1-distance/140)*.13})`;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(X,Y);ctx.stroke();}}});}
 if(network)netFrame=requestAnimationFrame(networkFrame);manager={sync,direct(command){return [...stages.values()].map(controller=>controller.direct(command)).some(Boolean);},snapshots(){return [...stages].map(([stage,controller])=>({stage:stage.id||null,state:controller.snapshot()}));},dispose(){mutation.disconnect();for(const c of stages.values())c.dispose();stages.clear();cancelAnimationFrame(netFrame);manager=null;}};sync();return manager;
}

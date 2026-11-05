// Renderer-independent motion controller. Units: seconds, radians and normalised image space.
// No recorded clips, timers tied to wall-clock time, or AI calls per frame.
export const MOTION_VERSION='wolfgang.motion.v1';
export const INTENTS=['attending','thinking','asking','explaining','caution','reassuring'];
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const ease=t=>t*t*t*(t*(t*6-15)+10);
const zero=()=>({head:0,neck:0,spine:0,leftUpper:0,leftLower:0,leftHand:0,rightUpper:0,rightLower:0,rightHand:0,shift:0,gazeX:0,gazeY:0,breathe:0,blink:0});
function freshRandom(){if(globalThis.crypto?.getRandomValues){const a=new Uint32Array(1);globalThis.crypto.getRandomValues(a);return a[0]/4294967296;}return Math.random();}
export function createMotionController({random=freshRandom}={}){
  const rand=(a,b)=>a+clamp(Number(random())||0,0,.999999999)*(b-a);
  let time=0,paused=false,intent='attending',intentUntil=0,intensity=.45,target='viewer',pointerUntil=0;
  let pose=zero(),goal=zero(),gazeAt=rand(.2,1),postureAt=rand(1,3),gestureAt=rand(.3,.9),blinkAt=rand(1.4,4.5),blinkStart=-100,blinkDuration=.2;
  let breathPhase=rand(0,1),breathLength=rand(3.4,5.6),breathDepth=rand(.6,1),gesture=null;
  const recent=[],eventIds=[];let gestureSerial=0;
  function pickGesture(){const choices=intent==='thinking'?['incline','settle','focus']:intent==='caution'?['steady','incline','focus']:intent==='asking'?['tilt','offer','incline']:['offer','settle','tilt','nod','open','focus'];const allowed=choices.filter(k=>!recent.slice(-2).includes(k));const kind=(allowed.length?allowed:choices)[Math.floor(rand(0,(allowed.length?allowed:choices).length))];recent.push(kind);if(recent.length>6)recent.shift();gesture={kind,start:time,duration:rand(2.2,4.8),amount:rand(.55,1)*(intent==='caution'?.45:.55+intensity*.45),side:rand(0,1)>.5?1:-1,id:++gestureSerial};gestureAt=time+gesture.duration+rand(.8,2.5);}
  function react(event){
    if(!event||!INTENTS.includes(event.intent))return false;
    if(event.eventId){if(typeof event.eventId!=='string'||event.eventId.length>120||eventIds.includes(event.eventId))return false;eventIds.push(event.eventId);if(eventIds.length>128)eventIds.shift();}
    intent=event.intent;intensity=Number.isFinite(event.intensity)?clamp(event.intensity,0,1):.55;
    target=event.target==='evidence'?'evidence':'viewer';intentUntil=time+clamp(Number.isFinite(event.durationMs)?event.durationMs/1000:5,1,15);
    goal.gazeX=target==='evidence'?-.65:rand(-.12,.12);goal.gazeY=intent==='thinking'?.2:-.04;gazeAt=time+rand(1,2.3);
    gestureAt=Math.min(gestureAt,time+rand(.15,.55));return true;
  }
  function touch(x=0,y=0){
    if(paused||intent==='caution')return false;
    attend(x,y);const kind=recent.at(-1)==='greet'?'acknowledge':'greet';
    recent.push(kind);if(recent.length>6)recent.shift();
    gesture={kind,start:time,duration:rand(3.2,3.8),amount:1,side:x<0?-1:1,id:++gestureSerial};
    gestureAt=time+gesture.duration+rand(.6,1.2);return true;
  }
  function attend(x,y){if(!Number.isFinite(x)||!Number.isFinite(y))return;goal.gazeX=clamp(x,-1,1);goal.gazeY=clamp(y,-.7,.7);pointerUntil=time+1.4;gazeAt=pointerUntil+rand(1,3);}
  function tick(delta){
    if(paused)return {...pose};const dt=clamp(Number.isFinite(delta)?delta:0,0,.05);time+=dt;
    if(time>intentUntil){intent='attending';target='viewer';intensity=.45;}
    if(time>=gazeAt&&time>pointerUntil){const viewer=rand(0,1)<.7;goal.gazeX=viewer?rand(-.18,.18):rand(-.75,.6);goal.gazeY=viewer?rand(-.07,.07):rand(-.2,.35);if(target==='evidence')goal.gazeX=rand(-.75,-.4);gazeAt=time+rand(1.7,5.8);}
    if(time>=postureAt){goal.shift=rand(-.004,.004);goal.spine=rand(-.009,.009);goal.neck=rand(-.012,.012);postureAt=time+rand(4.4,9.7);}
    if(time>=gestureAt)pickGesture();
    if(time>=blinkAt){blinkStart=time;blinkDuration=rand(.15,.24);blinkAt=time+rand(2.1,7.3);}
    const bt=(time-blinkStart)/blinkDuration;const blink=bt>=0&&bt<=1?Math.pow(Math.sin(bt*Math.PI),1.3):0;
    breathPhase+=dt/breathLength;if(breathPhase>=1){breathPhase-=1;breathLength=rand(3.4,5.9);breathDepth=rand(.6,1);}
    const breathe=Math.sin(breathPhase*2*Math.PI)*breathDepth;
    const wanted={...goal,head:goal.gazeX*.025+goal.gazeY*.018,leftUpper:0,leftLower:0,leftHand:0,rightUpper:0,rightLower:0,rightHand:0};
    if(gesture){const u=(time-gesture.start)/gesture.duration;if(u>=1)gesture=null;else {const env=u<.35?ease(u/.35):u>.6?1-ease((u-.6)/.4):1,a=env*gesture.amount;switch(gesture.kind){case 'greet':wanted.leftUpper=-.035*a;wanted.leftLower=.085*a;wanted.leftHand=-.06*a;wanted.head=.045*a*gesture.side;wanted.neck=.006*a*gesture.side;break;case 'acknowledge':wanted.head=-.045*a;wanted.neck=-.006*a;wanted.leftUpper=-.03*a;wanted.leftLower=.08*a;wanted.leftHand=-.05*a;break;case 'offer':wanted.leftUpper=-.025*a;wanted.leftLower=.07*a;wanted.leftHand=-.055*a;wanted.head=-.02*a;break;case 'open':wanted.rightUpper=-.025*a;wanted.rightLower=-.045*a;wanted.rightHand=.035*a;break;case 'nod':wanted.neck=.018*a;wanted.head=-.022*a;break;case 'tilt':wanted.head=.035*a*gesture.side;wanted.neck=-.012*a*gesture.side;break;case 'incline':wanted.neck=.018*a;wanted.spine=.007*a;break;case 'settle':wanted.shift=.004*a*gesture.side;wanted.rightUpper=.015*a;break;case 'steady':wanted.head=0;wanted.spine=0;wanted.leftHand=-.018*a;break;case 'focus':wanted.head=-.022*a;wanted.gazeY=.18*a;break;}}}
    for(const key of Object.keys(pose)){if(key==='blink'||key==='breathe')continue;const rate=key.startsWith('gaze')?5.4:key==='shift'?1.5:3.5;pose[key]+=(wanted[key]-pose[key])*(1-Math.exp(-rate*dt));}
    pose.blink=blink;pose.breathe=breathe;return {...pose};
  }
  return {tick,react,attend,touch,setPaused(value){paused=Boolean(value);},snapshot(){return {version:MOTION_VERSION,time,intent,target,paused,gesture:gesture?{...gesture}:null,recent:[...recent],pose:{...pose}};}};
}

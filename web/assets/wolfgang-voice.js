let enabled=false,muted=false,serverVoice=false,proofRequired=false,audio=null,url=null,utterance=null,request=null,serial=0;
const muteKey='guardian.wolfgang.muted';
function readMutePreference(){
 try{return globalThis.sessionStorage?.getItem(muteKey)==='true';}catch{return muted;}
}
muted=readMutePreference();
const synth=globalThis.speechSynthesis;
let cueContext=null,cueBuffer=null,cueSource=null,thinking=false;
function unlockCue(){
 const AudioContext=globalThis.AudioContext||globalThis.webkitAudioContext;
 if(!AudioContext)return;
 try{
  cueContext??=new AudioContext();
  if(cueContext.state==='suspended')cueContext.resume().catch(()=>{});
 }catch{/* Text and rings remain usable when browser audio is unavailable. */}
}
function syncCue(){
 if(!thinking||!enabled||muted||globalThis.document?.hidden){
  if(cueSource){cueSource.stop();cueSource.disconnect();cueSource=null;}
  return;
 }
 if(!cueContext||cueSource)return;
 try{
  if(!cueBuffer){
   // Three quiet, overlapping swells with a little silence between revolutions.
   const rate=22050;
   cueBuffer=cueContext.createBuffer(1,rate*3,rate);
   const samples=cueBuffer.getChannelData(0);
   for(const [index,hz] of [294,370,440].entries()){
    const start=Math.round((.24+.28*index)*rate);
    const length=Math.round(.6*rate);
    for(let i=0;i<length;i++){
     const envelope=Math.sin(Math.PI*i/length)**2;
     samples[start+i]+=.034*envelope*Math.sin(2*Math.PI*hz*i/rate);
    }
   }
  }
  const source=cueContext.createBufferSource();
  source.buffer=cueBuffer;source.loop=true;source.connect(cueContext.destination);
  source.start();cueSource=source;
 }catch{/* Audio is optional. */}
}
export function setThinkingSound(active){thinking=active;syncCue();}
export function bindVoiceToggle(button){
 function paint(){
  button.setAttribute('aria-pressed',String(muted));
  button.dataset.muted=String(muted);
  button.title=muted?'Unmute Wolfgang':'Mute Wolfgang';
  button.setAttribute('aria-label',button.title);
 }
 button.onclick=()=>{setVoiceEnabled(muted);paint();};
 globalThis.addEventListener?.('pageshow',()=>{
  const preference=readMutePreference();
  if(preference!==muted)setVoiceEnabled(!preference);
  paint();
 });
 paint();
}
let voices=synth?.getVoices()||[];
synth?.addEventListener?.('voiceschanged',()=>{voices=synth.getVoices();});
const emit=state=>globalThis.dispatchEvent?.(new CustomEvent('wolfgang:voice',{detail:{enabled,muted,state}}));
export function stopVoice(){serial++;request?.abort();request=null;synth?.cancel();utterance=null;if(audio){audio.pause();audio=null;}if(url){URL.revokeObjectURL(url);url=null;}emit('idle');}
// Called synchronously from a deliberate tap, send or microphone action.
// Page arrival is visual; browsers require interaction before audible speech.
export function activateVoice(prepareCue=false){
 if(!muted){enabled=true;synth?.resume?.();if(prepareCue)unlockCue();emit('idle');}
 return enabled;
}
export function setVoiceEnabled(value){
 muted=!value;enabled=Boolean(value);
 try{globalThis.sessionStorage?.setItem(muteKey,String(muted));}catch{}
 if(muted)stopVoice();else if(thinking)unlockCue();
 syncCue();emit('idle');return enabled;
}
export const isVoiceEnabled=()=>enabled;
export const configureVoice=(remote,requiresProof=false)=>{serverVoice=Boolean(remote);proofRequired=Boolean(requiresProof);};
function browserSpeak(text,id){
 if(!synth||!globalThis.SpeechSynthesisUtterance){emit('unavailable');return;}
 voices=synth.getVoices();utterance=new SpeechSynthesisUtterance(text);
 utterance.voice=voices.find(v=>v.lang==='en-GB'&&/Daniel|Arthur|George/i.test(v.name))||voices.find(v=>v.lang==='en-GB')||voices.find(v=>v.lang?.startsWith('en'))||null;
 utterance.lang=utterance.voice?.lang||'en-GB';utterance.rate=.94;utterance.pitch=1;utterance.volume=1;
 utterance.onstart=()=>{if(serial===id)emit('speaking');};
 utterance.onend=()=>{if(serial===id){utterance=null;emit('idle');}};
 utterance.onerror=e=>{if(serial===id&&!['canceled','interrupted'].includes(e.error)){utterance=null;emit('unavailable');}};
 synth.resume?.();synth.speak(utterance);
}
export async function speak(text,voiceProof){
 if(!enabled||globalThis.document?.hidden||typeof text!=='string'||!text.trim())return;
 setThinkingSound(false);
 stopVoice();const id=serial;text=text.slice(0,1600);
 if(serverVoice&&(!proofRequired||voiceProof)){
  request=new AbortController();emit('loading');
  try{
   const response=await fetch('/api/wolfgang/voice',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text,...(voiceProof?{voiceProof}:{})}),signal:request.signal});
   if(!response.ok)throw new Error('Voice unavailable');const blob=await response.blob();if(serial!==id)return;
   url=URL.createObjectURL(blob);audio=new Audio(url);audio.onended=()=>{if(serial===id)stopVoice();};audio.onerror=()=>{if(serial===id){audio?.pause();audio=null;if(url){URL.revokeObjectURL(url);url=null;}browserSpeak(text,id);}};
   await audio.play();if(serial===id)emit('speaking');return;
  }catch(e){if(e.name==='AbortError'||serial!==id)return;}
 }
 browserSpeak(text,id);
}
globalThis.document?.addEventListener('visibilitychange',()=>{if(document.hidden)stopVoice();syncCue();});

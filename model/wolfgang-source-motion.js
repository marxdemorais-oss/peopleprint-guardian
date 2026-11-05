import {Quaternion,Vector3} from 'three';
import source from './reconstruction/source-motion-clips.json';

const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
function at(track,time){
 const size=track.type==='q'?4:3,Type=track.type==='q'?Quaternion:Vector3;
 let lo=0,hi=track.times.length-1;
 while(lo+1<hi){const mid=(lo+hi)>>1;if(track.times[mid]<=time)lo=mid;else hi=mid;}
 const a=new Type().fromArray(track.values,lo*size);
 if(lo===hi||time<=track.times[lo])return a;
 const b=new Type().fromArray(track.values,hi*size),t=clamp((time-track.times[lo])/(track.times[hi]-track.times[lo]),0,1);
 return track.type==='q'?a.slerp(b,t).normalize():a.lerp(b,t);
}

/** Samples the original Tripo performance without replacing Wolfgang's rig.
 * Arms are in the source chest frame, including the physical Hand orientation.
 * They must pass through current limb IK, twist limits and contact constraints;
 * copying old local Hand rotations would ignore the added ForeArmTwist parent.
 * Preserve the chest-relative wrist endpoint when fitting the current chain.
 * Rebuilding source directions from current shoulders/lengths moves folded
 * wrists behind the intended surface: the repaired pivots and fixed sockets
 * differ from the source rig's animated clavicles. Elbow data supplies the pole.
 * The deployed pack contains only the reviewed right-arm offer and its finger
 * tracks. It does not animate the body or move the repaired shoulder sockets.
 * Local finger rotations retain original timing. Repaired translations,
 * shoulder-cap bones, rigid bindings and the current hand proportions stay put.
 */
export function createSourceMotion(){
 const names=Object.freeze(Object.keys(source.clips));
 function duration(name){return source.clips[name]?.duration??0;}
 function sample(name,time){
  const clip=source.clips[name];if(!clip)return null;
  time=clamp(Number.isFinite(time)?time:0,0,clip.duration);
  const result={name,time,duration:clip.duration,arms:{},body:{},fingers:{},hipsDelta:null};
  for(const side of Object.keys(source.lengths)){
   const arm={lengths:{...source.lengths[side]}};
   for(const key of ['shoulder','elbow','wrist','handQ'])arm[key]=at(clip.tracks[`${side}.${key}`],time);
   result.arms[side]=arm;
  }
  for(const [key,track]of Object.entries(clip.tracks)){
   if(key==='hipsDelta')result.hipsDelta=at(track,time);
   else if(key.startsWith('body.'))result.body[key.slice(5)]=at(track,time);
   else if(key.startsWith('fingers.'))result.fingers[key.slice(8)]=at(track,time);
  }
  return result;
 }
 return {names,duration,sample};
}

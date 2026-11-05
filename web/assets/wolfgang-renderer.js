import {createRigMesh,projectRig,bindPoint,deformPoint,rigTransforms} from './wolfgang-rig.js';
import {displayPose} from './wolfgang-display.js';
// One sRGB Canvas2D path for the approved artwork on mobile and desktop.
// An opaque white surface plus multiply composition avoids a separately coloured
// transparent WebGL plane. The page background beneath this character is white.
export function createWolfgangRenderer(stage,img){
 const canvas=document.createElement('canvas');canvas.className='wolfgang-render';canvas.setAttribute('aria-hidden','true');stage.append(canvas);
 const ctx=canvas.getContext('2d',{alpha:false,colorSpace:'srgb'}),mesh=createRigMesh(24,36);
 const portrait=stage.dataset.view==='portrait',crop=portrait?[.405,.005,.24,.165]:[0,0,1,1];
 const iw=img.naturalWidth,ih=img.naturalHeight;
 // Prepare source coordinates once. Crop each draw to the triangle's source
 // rectangle instead of asking the compositor to redraw the complete photograph.
 const triangles=[];for(let k=0;k<mesh.indices.length;k+=3){const ids=mesh.indices.slice(k,k+3),s=ids.map(i=>[mesh.points[i].x*iw,mesh.points[i].y*ih]);const sx=s[1][0]-s[0][0],sy=s[1][1]-s[0][1],tx=s[2][0]-s[0][0],ty=s[2][1]-s[0][1];const x=Math.max(0,Math.min(...s.map(p=>p[0]))-2),y=Math.max(0,Math.min(...s.map(p=>p[1]))-2),width=Math.min(iw-x,Math.max(...s.map(p=>p[0]))-x+2),height=Math.min(ih-y,Math.max(...s.map(p=>p[1]))-y+2);triangles.push({ids,s,sx,sy,tx,ty,den:sx*ty-tx*sy,x,y,width,height});}
 const eyes=[[.486,.075],[.548,.082]].map(([x,y])=>bindPoint(x,y));let dead=false;
 function render(raw){if(dead||!ctx)return false;const pose=displayPose(raw),w=stage.clientWidth,h=stage.clientHeight;if(!w||!h)return false;
  const d=Math.min(devicePixelRatio||1,1.5),W=Math.round(w*d),H=Math.round(h*d);if(canvas.width!==W||canvas.height!==H){canvas.width=W;canvas.height=H;}
  const ratio=iw/ih*crop[2]/crop[3],rw=Math.min(w,h*ratio),rh=rw/ratio,ox=(w-rw)/2,oy=(h-rh)/2,project=([x,y])=>[ox+(x-crop[0])/crop[2]*rw,oy+(y-crop[1])/crop[3]*rh];
  const vertices=projectRig(mesh,pose).map(project);ctx.setTransform(d,0,0,d,0,0);ctx.fillStyle='#fff';ctx.fillRect(0,0,w,h);
  for(const {ids,s,sx,sy,tx,ty,den,x,y,width,height} of triangles){const p=ids.map(i=>vertices[i]);if(p.every(q=>q[0]<-2)||p.every(q=>q[0]>w+2)||p.every(q=>q[1]<-2)||p.every(q=>q[1]>h+2))continue;
   const ax=p[1][0]-p[0][0],ay=p[1][1]-p[0][1],bx=p[2][0]-p[0][0],by=p[2][1]-p[0][1],a=(ax*ty-bx*sy)/den,b=(ay*ty-by*sy)/den,c=(bx*sx-ax*tx)/den,e=(by*sx-ay*tx)/den;
   ctx.save();ctx.beginPath();const cx=(p[0][0]+p[1][0]+p[2][0])/3,cy=(p[0][1]+p[1][1]+p[2][1])/3;for(let j=0;j<3;j++){const dx=p[j][0]-cx,dy=p[j][1]-cy,len=Math.hypot(dx,dy)||1,X=p[j][0]+dx/len*.8,Y=p[j][1]+dy/len*.8;if(j===0)ctx.moveTo(X,Y);else ctx.lineTo(X,Y);}ctx.closePath();ctx.clip();ctx.transform(a,b,c,e,p[0][0]-a*s[0][0]-c*s[0][1],p[0][1]-b*s[0][0]-e*s[0][1]);ctx.drawImage(img,x,y,width,height,x,y,width,height);ctx.restore();
  }
  if(pose.blink>0){ctx.fillStyle=`rgba(14,31,41,${pose.blink*.93})`;const tr=rigTransforms(pose);for(const eye of eyes){const [x,y]=project(deformPoint(eye,pose,tr));ctx.beginPath();ctx.ellipse(x,y,rw/crop[2]*.016,rh/crop[3]*.005*pose.blink,.1,0,Math.PI*2);ctx.fill();}}
  stage.dataset.rendered='true';stage.dataset.renderer='srgb-canvas-rig';return true;
 }
 return {render,dispose(){dead=true;canvas.remove();delete stage.dataset.rendered;delete stage.dataset.renderer;}};
}

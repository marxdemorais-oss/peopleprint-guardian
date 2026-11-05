import {BufferGeometry,Float32BufferAttribute,Group,Mesh,MeshStandardMaterial,Vector3,Matrix3,DoubleSide} from 'three';

// The existing curved ocular shells remain untouched. Small opaque 3D lid
// surfaces cover them from the upper/lower rims, following the Head bone.
// Initialise once at the model bind pose, before the performance controller.
// No eye scaling, flat sprites, face masking, timers or pose changes.
export function createEyelids(root){
 const head=root.getObjectByName('mixamorigHead')||root.getObjectByName('mixamorig:Head');
 if(!head)return {update(){},dispose(){},count:0};
 root.updateMatrixWorld(true);
 const inverse=head.matrixWorld.clone().invert();
 // Anatomical up measured from the real eye surfaces, in Head coordinates.
 const faceUp=new Vector3(-.0748257102,.9920326223,-.1013527962);
 const holder=new Group();holder.name='Wolfgang eyelids';head.add(holder);
 const material=new MeshStandardMaterial({name:'Wolfgang navy eyelid',color:0x14242d,metalness:.25,roughness:.43,side:DoubleSide});
 const controls=[];
 for(const [side,ids] of [['Right',[54]],['Left',[53]]]){
  const sources=ids.map(n=>root.getObjectByName('Wolfgang_Detail_'+n)).filter(Boolean);
  if(sources.length!==1)continue;
  const all=[];
  for(const source of sources){
   const g=source.geometry,p=g.getAttribute('position'),n=g.getAttribute('normal'),index=g.index;
   const points=[],normals=[],normalMatrix=new Matrix3().getNormalMatrix(source.matrixWorld);
   for(let i=0;i<p.count;i++){
    const v=source.getVertexPosition(i,new Vector3()).applyMatrix4(source.matrixWorld).applyMatrix4(inverse);
    const normal=new Vector3().fromBufferAttribute(n,i).applyMatrix3(normalMatrix).transformDirection(inverse).normalize();
    points.push(v);normals.push(normal);
   }
   for(let j=0;j<(index?index.count:p.count);j+=3){
    const tri=[];
    for(let k=0;k<3;k++){const i=index?index.getX(j+k):j+k;tri.push({p:points[i].clone(),n:normals[i].clone()});}
    all.push(tri);
   }
  }
  const centre=new Vector3();let total=0;
  for(const tri of all)for(const v of tri){centre.add(v.p);total++;}centre.divideScalar(total);
  const front=new Vector3(...(side==='Right'?[.99877343,-.02280829,-.04394782]:[.77003183,.08716148,-.63202362]));
  const up=faceUp.clone().addScaledVector(front,-faceUp.dot(front)).normalize(),across=up.clone().cross(front).normalize();
  const project=v=>{const d=v.p.clone().sub(centre);return {x:d.dot(across),y:d.dot(up),z:d.dot(front),f:v.n.dot(front)};};
  const points=all.flat().map(project),basis=(x,y)=>[1,x/.01,y/.01,(x/.01)**2,x*y/.0001,(y/.01)**2];
  const A=Array.from({length:6},()=>Array(7).fill(0));
  for(const p of points.filter(p=>p.f>.25)){const v=basis(p.x,p.y);for(let i=0;i<6;i++){for(let j=0;j<6;j++)A[i][j]+=v[i]*v[j];A[i][6]+=v[i]*p.z;}}
  for(let i=0;i<6;i++){let best=i;for(let j=i+1;j<6;j++)if(Math.abs(A[j][i])>Math.abs(A[best][i]))best=j;[A[i],A[best]]=[A[best],A[i]];const d=A[i][i]||1e-9;for(let k=i;k<7;k++)A[i][k]/=d;for(let j=0;j<6;j++)if(j!==i){const t=A[j][i];for(let k=i;k<7;k++)A[j][k]-=t*A[i][k];}}
  const q=A.map(r=>r[6]);const depth=(x,y)=>basis(x,y).reduce((s,v,i)=>s+v*q[i],0);
  const pupil=root.getObjectByName('Wolfgang_Detail_'+(side==='Right'?66:64));
  let offset=.00015;
  if(pupil){const a=pupil.geometry.attributes.position;for(let i=0;i<a.count;i++){const p=pupil.getVertexPosition(i,new Vector3()).applyMatrix4(pupil.matrixWorld).applyMatrix4(inverse).sub(centre);offset=Math.max(offset,p.dot(front)-depth(p.dot(across),p.dot(up))+.00015);}}
  const sorted=points.slice().sort((a,b)=>a.x-b.x||a.y-b.y),cross=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x),lower=[],upperHull=[];
  for(const p of sorted){while(lower.length>1&&cross(lower.at(-2),lower.at(-1),p)<=0)lower.pop();lower.push(p);}
  for(const p of [...sorted].reverse()){while(upperHull.length>1&&cross(upperHull.at(-2),upperHull.at(-1),p)<=0)upperHull.pop();upperHull.push(p);}
  const hull=lower.slice(0,-1).concat(upperHull.slice(0,-1));
  const point=(x,y)=>{const z=depth(x,y)+offset,p=centre.clone().addScaledVector(across,x).addScaledVector(up,y).addScaledVector(front,z),dx=(q[1]+2*q[3]*x/.01+q[4]*y/.01)/.01,dy=(q[2]+q[4]*x/.01+2*q[5]*y/.01)/.01,n=front.clone().addScaledVector(across,-dx).addScaledVector(up,-dy).normalize();return {p,n,h:p.dot(faceUp)};};
  const surface=[],rings=8,N=hull.length,ring=[];
  for(let r=1;r<=rings;r++)ring.push(hull.map(p=>point(p.x*r/rings*1.2,p.y*r/rings*1.2)));
  const mid=point(0,0);
  for(let i=0;i<N;i++){surface.push([mid,ring[0][i],ring[0][(i+1)%N]]);for(let r=1;r<rings;r++){const j=(i+1)%N;surface.push([ring[r-1][i],ring[r][i],ring[r][j]],[ring[r-1][i],ring[r][j],ring[r-1][j]]);}}
  // The narrow mint rim sits just in front of the sclera at a few corners.
  // A conforming rim skin closes those edges without pushing the main lid out.
  const rim=root.getObjectByName('Wolfgang_Detail_'+(side==='Right'?52:59));
  if(rim){const g=rim.geometry,p=g.attributes.position,n=g.attributes.normal,idx=g.index,nm=new Matrix3().getNormalMatrix(rim.matrixWorld),verts=[];
   for(let i=0;i<p.count;i++){const normal=new Vector3().fromBufferAttribute(n,i).applyMatrix3(nm).transformDirection(inverse).normalize(),v=rim.getVertexPosition(i,new Vector3()).applyMatrix4(rim.matrixWorld).applyMatrix4(inverse).addScaledVector(normal,.00015);verts.push({p:v,n:normal,h:v.dot(faceUp)});}
   for(let j=0;j<(idx?idx.count:p.count);j+=3)surface.push([0,1,2].map(k=>verts[idx?idx.getX(j+k):j+k]));
  }
  let lo=Infinity,hi=-Infinity;
  for(const tri of surface)for(const v of tri){lo=Math.min(lo,v.h);hi=Math.max(hi,v.h);}
  for(const upper of [true,false]){
   const geometry=new BufferGeometry();
   geometry.setAttribute('position',new Float32BufferAttribute(new Float32Array(surface.length*6*3),3));
   geometry.setAttribute('normal',new Float32BufferAttribute(new Float32Array(surface.length*6*3),3));
   geometry.setDrawRange(0,0);
   const mesh=new Mesh(geometry,material);mesh.name=side+(upper?' upper':' lower')+' eyelid';mesh.frustumCulled=false;mesh.visible=false;holder.add(mesh);
   controls.push({mesh,all:surface,lo,hi,upper});
  }
 }
 let previous=-1;
 function update(amount=0){
  const a=Math.max(0,Math.min(1,Number.isFinite(amount)?amount:0));
  if(a===previous)return;previous=a;
  for(const c of controls){
   c.mesh.visible=a>.001;if(!c.mesh.visible)continue;
   // Upper lid provides most of the closure; lower lid meets it gently.
   const h=c.upper?c.hi-(c.hi-c.lo)*.86*a:c.lo+(c.hi-c.lo)*.14*a;
   const pos=c.mesh.geometry.getAttribute('position'),norm=c.mesh.geometry.getAttribute('normal');let count=0;
   for(const tri of c.all){
    const clipped=[];
    for(let i=0;i<3;i++){
     const v=tri[i],w=tri[(i+1)%3],inside=c.upper?v.h>=h:v.h<=h,next=c.upper?w.h>=h:w.h<=h;
     if(inside)clipped.push(v);
     if(inside!==next){const t=(h-v.h)/(w.h-v.h);clipped.push({p:v.p.clone().lerp(w.p,t),n:v.n.clone().lerp(w.n,t).normalize()});}
    }
    for(let i=1;i<clipped.length-1;i++)for(const v of [clipped[0],clipped[i],clipped[i+1]]){pos.setXYZ(count,v.p.x,v.p.y,v.p.z);norm.setXYZ(count,v.n.x,v.n.y,v.n.z);count++;}
   }
   pos.needsUpdate=true;norm.needsUpdate=true;c.mesh.geometry.setDrawRange(0,count);
  }
 }
 update(0);
 return {update,count:controls.length/2,group:holder,dispose(){for(const c of controls)c.mesh.geometry.dispose();material.dispose();holder.removeFromParent();}};
}

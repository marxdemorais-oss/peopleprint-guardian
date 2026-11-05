// Conservative image-space skeletal rig for the approved full-body artwork.
// The renderer interface deliberately accepts poses rather than owning behaviour.
const bones=[
 {name:'spine',parent:-1,p:[.50,.43],end:[.50,.20]},
 {name:'neck',parent:0,p:[.50,.17],end:[.51,.135]},
 {name:'head',parent:1,p:[.51,.135],end:[.52,.045]},
 {name:'leftUpper',parent:0,p:[.365,.19],end:[.26,.32]},
 {name:'leftLower',parent:3,p:[.26,.32],end:[.30,.375]},
 {name:'leftHand',parent:4,p:[.30,.375],end:[.355,.377]},
 {name:'rightUpper',parent:0,p:[.635,.205],end:[.66,.36]},
 {name:'rightLower',parent:6,p:[.66,.36],end:[.70,.51]},
 {name:'rightHand',parent:7,p:[.70,.51],end:[.68,.575]},
 {name:'legs',parent:-1,p:[.50,.48],end:[.46,.94]}
];
const distance=(x,y,b)=>{const dx=b.end[0]-b.p[0],dy=(b.end[1]-b.p[1])*1.5,t=Math.max(0,Math.min(1,((x-b.p[0])*dx+(y-b.p[1])*1.5*dy)/(dx*dx+dy*dy)));return Math.hypot(x-b.p[0]-dx*t,(y-b.p[1])*1.5-dy*t);};
export function rigTransforms(pose){const transforms=[];for(const b of bones){const parent=b.parent<0?{a:1,b:0,c:0,d:1,x:0,y:0}:transforms[b.parent],angle=pose[b.name]||0,co=Math.cos(angle),si=Math.sin(angle),[x,y]=b.p;const local={a:co,b:si/1.5,c:-si*1.5,d:co,x:x-co*x+si*1.5*y,y:y-si/1.5*x-co*y};transforms.push({a:parent.a*local.a+parent.c*local.b,b:parent.b*local.a+parent.d*local.b,c:parent.a*local.c+parent.c*local.d,d:parent.b*local.c+parent.d*local.d,x:parent.a*local.x+parent.c*local.y+parent.x,y:parent.b*local.x+parent.d*local.y+parent.y});}return transforms;}
export function bindPoint(x,y){const weights=bones.map((b,i)=>{let w=Math.exp(-Math.pow(distance(x,y,b)/.08,2));if(i===2)w*=1+7/(1+Math.exp((y-.13)*60));if(i===9)w*=1+4/(1+Math.exp(-((y-.48)*60)));if(i>2&&i<9)w*=1-.95*Math.exp(-Math.pow((x-.5)/.085,4));return {i,w};});const total=weights.reduce((s,k)=>s+k.w,0);return {x,y,weights:total===0?[{i:9,w:1}]:weights.map(k=>({i:k.i,w:k.w/total}))};}
export function deformPoint(point,pose,transforms=rigTransforms(pose)){let x=0,y=0;for(const {i,w} of point.weights){const t=transforms[i];x+=(t.a*point.x+t.c*point.y+t.x)*w;y+=(t.b*point.x+t.d*point.y+t.y)*w;}const upper=Math.max(0,Math.min(1,(.9-point.y)/.45));x+=(pose.shift||0)*upper;const chest=Math.exp(-Math.pow((point.y-.28)*9,2));x+=(point.x-.5)*chest*(pose.breathe||0)*.005;y-=chest*(pose.breathe||0)*.0009;return [x,y];}
export function createRigMesh(cols=32,rows=48){const points=[];for(let y=0;y<=rows;y++)for(let x=0;x<=cols;x++)points.push(bindPoint(x/cols,y/rows));const indices=[];for(let y=0;y<rows;y++)for(let x=0;x<cols;x++){const a=y*(cols+1)+x;indices.push(a,a+1,a+cols+1,a+1,a+cols+2,a+cols+1);}return {points,indices,cols,rows};}
export function projectRig(mesh,pose){const transforms=rigTransforms(pose);return mesh.points.map(p=>deformPoint(p,pose,transforms));}

var Hc=0,F0=1,Gc=2;var Nr=1,$o=2,Vs=3,Qn=0,en=1,yn=2,ei=0,Hs=1,O0=2,B0=3,z0=4,Wc=5;var ts=100,Xc=101,qc=102,Yc=103,Zc=104,Kc=200,Jc=201,$c=202,jc=203,k0=204,V0=205,Qc=206,eh=207,th=208,nh=209,ih=210,sh=211,rh=212,oh=213,ah=214,Ao=0,Eo=1,Ro=2,Ts=3,Co=4,Io=5,Po=6,Lo=7,jo=0,lh=1,ch=2,kn=0,H0=1,G0=2,W0=3,Dr=4,X0=5,q0=6,Y0=7,w0="attached",hh="detached",Z0=300,Ni=301,ns=302,Qo=303,ea=304,Ur=306,Ci=1e3,Cn=1001,As=1002,Ft=1003,ta=1004;var is=1005;var Ot=1006,Gs=1007;var Vn=1008;var vn=1009,K0=1010,J0=1011,Ws=1012,na=1013,Hn=1014,wn=1015,Gn=1016,ia=1017,sa=1018,Xs=1020,$0=35902,j0=35899,Q0=1021,el=1022,Tn=1023,Yn=1026,Di=1027,ra=1028,oa=1029,Ui=1030,aa=1031;var la=1033,Fr=33776,Or=33777,Br=33778,zr=33779,ca=35840,ha=35841,ua=35842,da=35843,fa=36196,pa=37492,ma=37496,ga=37488,_a=37489,kr=37490,xa=37491,ya=37808,va=37809,Ma=37810,Sa=37811,ba=37812,wa=37813,Ta=37814,Aa=37815,Ea=37816,Ra=37817,Ca=37818,Ia=37819,Pa=37820,La=37821,Na=36492,Da=36494,Ua=36495,Fa=36283,Oa=36284,Vr=36285,Ba=36286;var Wi=2300,Xi=2301,bo=2302,T0=2303,A0=2400,E0=2401,R0=2402,uh=2500;var tl=0,Hr=1,qs=2,dh=3200;var Gr=0,fh=1,_i="",Dt="srgb",dn="srgb-linear",hr="linear",gt="srgb";var wo=7680;var ph=519,mh=512,gh=513,_h=514,za=515,xh=516,yh=517,ka=518,vh=519,nl=35044;var il="300 es",On=2e3,Es=2001;function Ru(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Cu(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Rs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Mh(){let i=Rs("canvas");return i.style.display="block",i}var rc={},Cs=null;function ur(...i){let e="THREE."+i.shift();Cs?Cs("log",e,...i):console.log(e,...i)}function Sh(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Be(...i){i=Sh(i);let e="THREE."+i.shift();if(Cs)Cs("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Ge(...i){i=Sh(i);let e="THREE."+i.shift();if(Cs)Cs("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Gi(...i){let e=i.join(" ");e in rc||(rc[e]=!0,Be(...i))}function bh(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var wh={[Ao]:Eo,[Ro]:Po,[Co]:Lo,[Ts]:Io,[Eo]:Ao,[Po]:Ro,[Lo]:Co,[Io]:Ts},Zn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},sn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],oc=1234567,lr=Math.PI/180,qi=180/Math.PI;function Bn(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(sn[i&255]+sn[i>>8&255]+sn[i>>16&255]+sn[i>>24&255]+"-"+sn[e&255]+sn[e>>8&255]+"-"+sn[e>>16&15|64]+sn[e>>24&255]+"-"+sn[t&63|128]+sn[t>>8&255]+"-"+sn[t>>16&255]+sn[t>>24&255]+sn[n&255]+sn[n>>8&255]+sn[n>>16&255]+sn[n>>24&255]).toLowerCase()}function it(i,e,t){return Math.max(e,Math.min(t,i))}function sl(i,e){return(i%e+e)%e}function Iu(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function Pu(i,e,t){return i!==e?(t-i)/(e-i):0}function cr(i,e,t){return(1-t)*i+t*e}function Lu(i,e,t,n){return cr(i,e,1-Math.exp(-t*n))}function Nu(i,e=1){return e-Math.abs(sl(i,e*2)-e)}function Du(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Uu(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Fu(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Ou(i,e){return i+Math.random()*(e-i)}function Bu(i){return i*(.5-Math.random())}function zu(i){i!==void 0&&(oc=i);let e=oc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function ku(i){return i*lr}function Vu(i){return i*qi}function Hu(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function Gu(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Wu(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Xu(i,e,t,n,s){let r=Math.cos,o=Math.sin,a=r(t/2),c=o(t/2),l=r((e+n)/2),h=o((e+n)/2),u=r((e-n)/2),d=o((e-n)/2),f=r((n-e)/2),g=o((n-e)/2);switch(s){case"XYX":i.set(a*h,c*u,c*d,a*l);break;case"YZY":i.set(c*d,a*h,c*u,a*l);break;case"ZXZ":i.set(c*u,c*d,a*h,a*l);break;case"XZX":i.set(a*h,c*g,c*f,a*l);break;case"YXY":i.set(c*f,a*h,c*g,a*l);break;case"ZYZ":i.set(c*g,c*f,a*h,a*l);break;default:Be("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Fn(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function yt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var rl={DEG2RAD:lr,RAD2DEG:qi,generateUUID:Bn,clamp:it,euclideanModulo:sl,mapLinear:Iu,inverseLerp:Pu,lerp:cr,damp:Lu,pingpong:Nu,smoothstep:Du,smootherstep:Uu,randInt:Fu,randFloat:Ou,randFloatSpread:Bu,seededRandom:zu,degToRad:ku,radToDeg:Vu,isPowerOfTwo:Hu,ceilPowerOfTwo:Gu,floorPowerOfTwo:Wu,setQuaternionFromProperEuler:Xu,normalize:yt,denormalize:Fn},Ze=class i{static{i.prototype.isVector2=!0}constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=it(this.x,e.x,t.x),this.y=it(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=it(this.x,e,t),this.y=it(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(it(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(it(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ue=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let c=n[s+0],l=n[s+1],h=n[s+2],u=n[s+3],d=r[o+0],f=r[o+1],g=r[o+2],v=r[o+3];if(u!==v||c!==d||l!==f||h!==g){let m=c*d+l*f+h*g+u*v;m<0&&(d=-d,f=-f,g=-g,v=-v,m=-m);let p=1-a;if(m<.9995){let b=Math.acos(m),R=Math.sin(b);p=Math.sin(p*b)/R,a=Math.sin(a*b)/R,c=c*p+d*a,l=l*p+f*a,h=h*p+g*a,u=u*p+v*a}else{c=c*p+d*a,l=l*p+f*a,h=h*p+g*a,u=u*p+v*a;let b=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=b,l*=b,h*=b,u*=b}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],c=n[s+1],l=n[s+2],h=n[s+3],u=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+h*u+c*f-l*d,e[t+1]=c*g+h*d+l*u-a*f,e[t+2]=l*g+h*f+a*d-c*u,e[t+3]=h*g-a*u-c*d-l*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(n/2),h=a(s/2),u=a(r/2),d=c(n/2),f=c(s/2),g=c(r/2);switch(o){case"XYZ":this._x=d*h*u+l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u+d*f*g;break;case"YZX":this._x=d*h*u+l*f*g,this._y=l*f*u+d*h*g,this._z=l*h*g-d*f*u,this._w=l*h*u-d*f*g;break;case"XZY":this._x=d*h*u-l*f*g,this._y=l*f*u-d*h*g,this._z=l*h*g+d*f*u,this._w=l*h*u+d*f*g;break;default:Be("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],c=t[9],l=t[2],h=t[6],u=t[10],d=n+a+u;if(d>0){let f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-c)*f,this._y=(r-l)*f,this._z=(o-s)*f}else if(n>a&&n>u){let f=2*Math.sqrt(1+n-a-u);this._w=(h-c)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+l)/f}else if(a>u){let f=2*Math.sqrt(1+a-n-u);this._w=(r-l)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(c+h)/f}else{let f=2*Math.sqrt(1+u-n-a);this._w=(o-s)/f,this._x=(r+l)/f,this._y=(c+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(it(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,c=t._y,l=t._z,h=t._w;return this._x=n*h+o*a+s*l-r*c,this._y=s*h+o*c+r*a-n*l,this._z=r*h+o*l+n*c-s*a,this._w=o*h-n*a-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let c=1-t;if(a<.9995){let l=Math.acos(a),h=Math.sin(l);c=Math.sin(c*l)/h,t=Math.sin(t*l)/h,this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+o*t,this._onChangeCallback()}else this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},P=class i{static{i.prototype.isVector3=!0}constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(ac.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(ac.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*s-a*n),h=2*(a*t-r*s),u=2*(r*n-o*t);return this.x=t+c*l+o*u-a*h,this.y=n+c*h+a*l-r*u,this.z=s+c*u+r*h-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=it(this.x,e.x,t.x),this.y=it(this.y,e.y,t.y),this.z=it(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=it(this.x,e,t),this.y=it(this.y,e,t),this.z=it(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(it(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=s*c-r*a,this.y=r*o-n*c,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return e0.copy(this).projectOnVector(e),this.sub(e0)}reflect(e){return this.sub(e0.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(it(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},e0=new P,ac=new Ue,We=class i{static{i.prototype.isMatrix3=!0}constructor(e,t,n,s,r,o,a,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,c,l)}set(e,t,n,s,r,o,a,c,l){let h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=c,h[6]=n,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],h=n[4],u=n[7],d=n[2],f=n[5],g=n[8],v=s[0],m=s[3],p=s[6],b=s[1],R=s[4],S=s[7],T=s[2],y=s[5],A=s[8];return r[0]=o*v+a*b+c*T,r[3]=o*m+a*R+c*y,r[6]=o*p+a*S+c*A,r[1]=l*v+h*b+u*T,r[4]=l*m+h*R+u*y,r[7]=l*p+h*S+u*A,r[2]=d*v+f*b+g*T,r[5]=d*m+f*R+g*y,r[8]=d*p+f*S+g*A,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8];return t*o*h-t*a*l-n*r*h+n*a*c+s*r*l-s*o*c}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8],u=h*o-a*l,d=a*c-h*r,f=l*r-o*c,g=t*u+n*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let v=1/g;return e[0]=u*v,e[1]=(s*l-h*n)*v,e[2]=(a*n-s*o)*v,e[3]=d*v,e[4]=(h*t-s*c)*v,e[5]=(s*r-a*t)*v,e[6]=f*v,e[7]=(n*c-l*t)*v,e[8]=(o*t-n*r)*v,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+e,-s*l,s*c,-s*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return Gi("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(t0.makeScale(e,t)),this}rotate(e){return Gi("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(t0.makeRotation(-e)),this}translate(e,t){return Gi("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(t0.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},t0=new We,lc=new We().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),cc=new We().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function qu(){let i={enabled:!0,workingColorSpace:dn,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===gt&&(s.r=hi(s.r),s.g=hi(s.g),s.b=hi(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===gt&&(s.r=ws(s.r),s.g=ws(s.g),s.b=ws(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===_i?hr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Gi("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Gi("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[dn]:{primaries:e,whitePoint:n,transfer:hr,toXYZ:lc,fromXYZ:cc,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Dt},outputColorSpaceConfig:{drawingBufferColorSpace:Dt}},[Dt]:{primaries:e,whitePoint:n,transfer:gt,toXYZ:lc,fromXYZ:cc,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Dt}}}),i}var je=qu();function hi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function ws(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var hs,No=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{hs===void 0&&(hs=Rs("canvas")),hs.width=e.width,hs.height=e.height;let s=hs.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=hs}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=Rs("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=hi(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(hi(t[n]/255)*255):t[n]=hi(t[n]);return{data:t,width:e.width,height:e.height}}else return Be("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Yu=0,Is=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Yu++}),this.uuid=Bn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(n0(s[o].image)):r.push(n0(s[o]))}else r=n0(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function n0(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?No.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Be("Texture: Unable to serialize Texture."),{})}var Zu=0,i0=new P,Qt=class i extends Zn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Cn,s=Cn,r=Ot,o=Vn,a=Tn,c=vn,l=i.DEFAULT_ANISOTROPY,h=_i){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Zu++}),this.uuid=Bn(),this.name="",this.source=new Is(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new Ze(0,0),this.repeat=new Ze(1,1),this.center=new Ze(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new We,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(i0).x}get height(){return this.source.getSize(i0).y}get depth(){return this.source.getSize(i0).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Be(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Be(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Z0)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Ci:e.x=e.x-Math.floor(e.x);break;case Cn:e.x=e.x<0?0:1;break;case As:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Ci:e.y=e.y-Math.floor(e.y);break;case Cn:e.y=e.y<0?0:1;break;case As:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Qt.DEFAULT_IMAGE=null;Qt.DEFAULT_MAPPING=Z0;Qt.DEFAULT_ANISOTROPY=1;var vt=class i{static{i.prototype.isVector4=!0}constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,c=e.elements,l=c[0],h=c[4],u=c[8],d=c[1],f=c[5],g=c[9],v=c[2],m=c[6],p=c[10];if(Math.abs(h-d)<.01&&Math.abs(u-v)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+v)<.1&&Math.abs(g+m)<.1&&Math.abs(l+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let R=(l+1)/2,S=(f+1)/2,T=(p+1)/2,y=(h+d)/4,A=(u+v)/4,_=(g+m)/4;return R>S&&R>T?R<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(R),s=y/n,r=A/n):S>T?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=y/s,r=_/s):T<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(T),n=A/r,s=_/r),this.set(n,s,r,t),this}let b=Math.sqrt((m-g)*(m-g)+(u-v)*(u-v)+(d-h)*(d-h));return Math.abs(b)<.001&&(b=1),this.x=(m-g)/b,this.y=(u-v)/b,this.z=(d-h)/b,this.w=Math.acos((l+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=it(this.x,e.x,t.x),this.y=it(this.y,e.y,t.y),this.z=it(this.z,e.z,t.z),this.w=it(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=it(this.x,e,t),this.y=it(this.y,e,t),this.z=it(this.z,e,t),this.w=it(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(it(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Do=class extends Zn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Ot,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new vt(0,0,e,t),this.scissorTest=!1,this.viewport=new vt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new Qt(s),o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:Ot,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new Is(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},pn=class extends Do{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},dr=class extends Qt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ft,this.minFilter=Ft,this.wrapR=Cn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Uo=class extends Qt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Ft,this.minFilter=Ft,this.wrapR=Cn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var De=class i{static{i.prototype.isMatrix4=!0}constructor(e,t,n,s,r,o,a,c,l,h,u,d,f,g,v,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,c,l,h,u,d,f,g,v,m)}set(e,t,n,s,r,o,a,c,l,h,u,d,f,g,v,m){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=c,p[2]=l,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=g,p[11]=v,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/us.setFromMatrixColumn(e,0).length(),r=1/us.setFromMatrixColumn(e,1).length(),o=1/us.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let d=o*h,f=o*u,g=a*h,v=a*u;t[0]=c*h,t[4]=-c*u,t[8]=l,t[1]=f+g*l,t[5]=d-v*l,t[9]=-a*c,t[2]=v-d*l,t[6]=g+f*l,t[10]=o*c}else if(e.order==="YXZ"){let d=c*h,f=c*u,g=l*h,v=l*u;t[0]=d+v*a,t[4]=g*a-f,t[8]=o*l,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=f*a-g,t[6]=v+d*a,t[10]=o*c}else if(e.order==="ZXY"){let d=c*h,f=c*u,g=l*h,v=l*u;t[0]=d-v*a,t[4]=-o*u,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*h,t[9]=v-d*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){let d=o*h,f=o*u,g=a*h,v=a*u;t[0]=c*h,t[4]=g*l-f,t[8]=d*l+v,t[1]=c*u,t[5]=v*l+d,t[9]=f*l-g,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){let d=o*c,f=o*l,g=a*c,v=a*l;t[0]=c*h,t[4]=v-d*u,t[8]=g*u+f,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-l*h,t[6]=f*u+g,t[10]=d-v*u}else if(e.order==="XZY"){let d=o*c,f=o*l,g=a*c,v=a*l;t[0]=c*h,t[4]=-u,t[8]=l*h,t[1]=d*u+v,t[5]=o*h,t[9]=f*u-g,t[2]=g*u-f,t[6]=a*h,t[10]=v*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Ku,e,Ju)}lookAt(e,t,n){let s=this.elements;return Mn.subVectors(e,t),Mn.lengthSq()===0&&(Mn.z=1),Mn.normalize(),Si.crossVectors(n,Mn),Si.lengthSq()===0&&(Math.abs(n.z)===1?Mn.x+=1e-4:Mn.z+=1e-4,Mn.normalize(),Si.crossVectors(n,Mn)),Si.normalize(),$r.crossVectors(Mn,Si),s[0]=Si.x,s[4]=$r.x,s[8]=Mn.x,s[1]=Si.y,s[5]=$r.y,s[9]=Mn.y,s[2]=Si.z,s[6]=$r.z,s[10]=Mn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],h=n[1],u=n[5],d=n[9],f=n[13],g=n[2],v=n[6],m=n[10],p=n[14],b=n[3],R=n[7],S=n[11],T=n[15],y=s[0],A=s[4],_=s[8],w=s[12],C=s[1],D=s[5],L=s[9],N=s[13],I=s[2],k=s[6],G=s[10],V=s[14],Q=s[3],W=s[7],O=s[11],Z=s[15];return r[0]=o*y+a*C+c*I+l*Q,r[4]=o*A+a*D+c*k+l*W,r[8]=o*_+a*L+c*G+l*O,r[12]=o*w+a*N+c*V+l*Z,r[1]=h*y+u*C+d*I+f*Q,r[5]=h*A+u*D+d*k+f*W,r[9]=h*_+u*L+d*G+f*O,r[13]=h*w+u*N+d*V+f*Z,r[2]=g*y+v*C+m*I+p*Q,r[6]=g*A+v*D+m*k+p*W,r[10]=g*_+v*L+m*G+p*O,r[14]=g*w+v*N+m*V+p*Z,r[3]=b*y+R*C+S*I+T*Q,r[7]=b*A+R*D+S*k+T*W,r[11]=b*_+R*L+S*G+T*O,r[15]=b*w+R*N+S*V+T*Z,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],c=e[9],l=e[13],h=e[2],u=e[6],d=e[10],f=e[14],g=e[3],v=e[7],m=e[11],p=e[15],b=c*f-l*d,R=a*f-l*u,S=a*d-c*u,T=o*f-l*h,y=o*d-c*h,A=o*u-a*h;return t*(v*b-m*R+p*S)-n*(g*b-m*T+p*y)+s*(g*R-v*T+p*A)-r*(g*S-v*y+m*A)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],o=e[5],a=e[9],c=e[2],l=e[6],h=e[10];return t*(o*h-a*l)-n*(r*h-a*c)+s*(r*l-o*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8],u=e[9],d=e[10],f=e[11],g=e[12],v=e[13],m=e[14],p=e[15],b=t*a-n*o,R=t*c-s*o,S=t*l-r*o,T=n*c-s*a,y=n*l-r*a,A=s*l-r*c,_=h*v-u*g,w=h*m-d*g,C=h*p-f*g,D=u*m-d*v,L=u*p-f*v,N=d*p-f*m,I=b*N-R*L+S*D+T*C-y*w+A*_;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let k=1/I;return e[0]=(a*N-c*L+l*D)*k,e[1]=(s*L-n*N-r*D)*k,e[2]=(v*A-m*y+p*T)*k,e[3]=(d*y-u*A-f*T)*k,e[4]=(c*C-o*N-l*w)*k,e[5]=(t*N-s*C+r*w)*k,e[6]=(m*S-g*A-p*R)*k,e[7]=(h*A-d*S+f*R)*k,e[8]=(o*L-a*C+l*_)*k,e[9]=(n*C-t*L-r*_)*k,e[10]=(g*y-v*S+p*b)*k,e[11]=(u*S-h*y-f*b)*k,e[12]=(a*w-o*D-c*_)*k,e[13]=(t*D-n*w+s*_)*k,e[14]=(v*R-g*T-m*b)*k,e[15]=(h*T-u*R+d*b)*k,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,c=e.z,l=r*o,h=r*a;return this.set(l*o+n,l*a-s*c,l*c+s*a,0,l*a+s*c,h*a+n,h*c-s*o,0,l*c-s*a,h*c+s*o,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,l=r+r,h=o+o,u=a+a,d=r*l,f=r*h,g=r*u,v=o*h,m=o*u,p=a*u,b=c*l,R=c*h,S=c*u,T=n.x,y=n.y,A=n.z;return s[0]=(1-(v+p))*T,s[1]=(f+S)*T,s[2]=(g-R)*T,s[3]=0,s[4]=(f-S)*y,s[5]=(1-(d+p))*y,s[6]=(m+b)*y,s[7]=0,s[8]=(g+R)*A,s[9]=(m-b)*A,s[10]=(1-(d+v))*A,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let o=us.set(s[0],s[1],s[2]).length(),a=us.set(s[4],s[5],s[6]).length(),c=us.set(s[8],s[9],s[10]).length();r<0&&(o=-o),Ln.copy(this);let l=1/o,h=1/a,u=1/c;return Ln.elements[0]*=l,Ln.elements[1]*=l,Ln.elements[2]*=l,Ln.elements[4]*=h,Ln.elements[5]*=h,Ln.elements[6]*=h,Ln.elements[8]*=u,Ln.elements[9]*=u,Ln.elements[10]*=u,t.setFromRotationMatrix(Ln),n.x=o,n.y=a,n.z=c,this}makePerspective(e,t,n,s,r,o,a=On,c=!1){let l=this.elements,h=2*r/(t-e),u=2*r/(n-s),d=(t+e)/(t-e),f=(n+s)/(n-s),g,v;if(c)g=r/(o-r),v=o*r/(o-r);else if(a===On)g=-(o+r)/(o-r),v=-2*o*r/(o-r);else if(a===Es)g=-o/(o-r),v=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=u,l[9]=f,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=v,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=On,c=!1){let l=this.elements,h=2/(t-e),u=2/(n-s),d=-(t+e)/(t-e),f=-(n+s)/(n-s),g,v;if(c)g=1/(o-r),v=o/(o-r);else if(a===On)g=-2/(o-r),v=-(o+r)/(o-r);else if(a===Es)g=-1/(o-r),v=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=0,l[12]=d,l[1]=0,l[5]=u,l[9]=0,l[13]=f,l[2]=0,l[6]=0,l[10]=g,l[14]=v,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},us=new P,Ln=new De,Ku=new P(0,0,0),Ju=new P(1,1,1),Si=new P,$r=new P,Mn=new P,hc=new De,uc=new Ue,Kn=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],h=s[9],u=s[2],d=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(it(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,l),this._z=0);break;case"YXZ":this._x=Math.asin(-it(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(it(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-it(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(it(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-it(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:Be("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return hc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(hc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return uc.setFromEuler(this),this.setFromQuaternion(uc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Kn.DEFAULT_ORDER="XYZ";var fr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},$u=0,dc=new P,ds=new Ue,si=new De,jr=new P,er=new P,ju=new P,Qu=new Ue,fc=new P(1,0,0),pc=new P(0,1,0),mc=new P(0,0,1),gc={type:"added"},ed={type:"removed"},fs={type:"childadded",child:null},s0={type:"childremoved",child:null},Et=class i extends Zn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:$u++}),this.uuid=Bn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new P,t=new Kn,n=new Ue,s=new P(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new De},normalMatrix:{value:new We}}),this.matrix=new De,this.matrixWorld=new De,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new fr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return ds.setFromAxisAngle(e,t),this.quaternion.multiply(ds),this}rotateOnWorldAxis(e,t){return ds.setFromAxisAngle(e,t),this.quaternion.premultiply(ds),this}rotateX(e){return this.rotateOnAxis(fc,e)}rotateY(e){return this.rotateOnAxis(pc,e)}rotateZ(e){return this.rotateOnAxis(mc,e)}translateOnAxis(e,t){return dc.copy(e).applyQuaternion(this.quaternion),this.position.add(dc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(fc,e)}translateY(e){return this.translateOnAxis(pc,e)}translateZ(e){return this.translateOnAxis(mc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(si.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?jr.copy(e):jr.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),er.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?si.lookAt(er,jr,this.up):si.lookAt(jr,er,this.up),this.quaternion.setFromRotationMatrix(si),s&&(si.extractRotation(s.matrixWorld),ds.setFromRotationMatrix(si),this.quaternion.premultiply(ds.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Ge("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(gc),fs.child=e,this.dispatchEvent(fs),fs.child=null):Ge("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(ed),s0.child=e,this.dispatchEvent(s0),s0.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),si.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),si.multiply(e.parent.matrixWorld)),e.applyMatrix4(si),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(gc),fs.child=e,this.dispatchEvent(fs),fs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(er,e,ju),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(er,Qu,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){let u=c[l];r(e.shapes,u)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(e.materials,this.material[c]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let c=this.animations[a];s.animations.push(r(e.animations,c))}}if(t){let a=o(e.geometries),c=o(e.materials),l=o(e.textures),h=o(e.images),u=o(e.shapes),d=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let c=[];for(let l in a){let h=a[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};Et.DEFAULT_UP=new P(0,1,0);Et.DEFAULT_MATRIX_AUTO_UPDATE=!0;Et.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var un=class extends Et{constructor(){super(),this.isGroup=!0,this.type="Group"}},td={type:"move"},Ps=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new un,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new un,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new un,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(let v of e.hand.values()){let m=t.getJointPose(v,n),p=this._getHandJoint(l,v);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;l.inputState.pinching&&d>f+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&d<=f-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(td)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new un;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Th={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},bi={h:0,s:0,l:0},Qr={h:0,s:0,l:0};function r0(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var ke=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Dt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,je.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=je.workingColorSpace){return this.r=e,this.g=t,this.b=n,je.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=je.workingColorSpace){if(e=sl(e,1),t=it(t,0,1),n=it(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=r0(o,r,e+1/3),this.g=r0(o,r,e),this.b=r0(o,r,e-1/3)}return je.colorSpaceToWorking(this,s),this}setStyle(e,t=Dt){function n(r){r!==void 0&&parseFloat(r)<1&&Be("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Be("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);Be("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Dt){let n=Th[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Be("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=hi(e.r),this.g=hi(e.g),this.b=hi(e.b),this}copyLinearToSRGB(e){return this.r=ws(e.r),this.g=ws(e.g),this.b=ws(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Dt){return je.workingToColorSpace(rn.copy(this),e),Math.round(it(rn.r*255,0,255))*65536+Math.round(it(rn.g*255,0,255))*256+Math.round(it(rn.b*255,0,255))}getHexString(e=Dt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=je.workingColorSpace){je.workingToColorSpace(rn.copy(this),t);let n=rn.r,s=rn.g,r=rn.b,o=Math.max(n,s,r),a=Math.min(n,s,r),c,l,h=(a+o)/2;if(a===o)c=0,l=0;else{let u=o-a;switch(l=h<=.5?u/(o+a):u/(2-o-a),o){case n:c=(s-r)/u+(s<r?6:0);break;case s:c=(r-n)/u+2;break;case r:c=(n-s)/u+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=je.workingColorSpace){return je.workingToColorSpace(rn.copy(this),t),e.r=rn.r,e.g=rn.g,e.b=rn.b,e}getStyle(e=Dt){je.workingToColorSpace(rn.copy(this),e);let t=rn.r,n=rn.g,s=rn.b;return e!==Dt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(bi),this.setHSL(bi.h+e,bi.s+t,bi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(bi),e.getHSL(Qr);let n=cr(bi.h,Qr.h,t),s=cr(bi.s,Qr.s,t),r=cr(bi.l,Qr.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},rn=new ke;ke.NAMES=Th;var Yi=class extends Et{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Kn,this.environmentIntensity=1,this.environmentRotation=new Kn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},Nn=new P,ri=new P,o0=new P,oi=new P,ps=new P,ms=new P,_c=new P,a0=new P,l0=new P,c0=new P,h0=new vt,u0=new vt,d0=new vt,Ri=class i{constructor(e=new P,t=new P,n=new P){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Nn.subVectors(e,t),s.cross(Nn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Nn.subVectors(s,t),ri.subVectors(n,t),o0.subVectors(e,t);let o=Nn.dot(Nn),a=Nn.dot(ri),c=Nn.dot(o0),l=ri.dot(ri),h=ri.dot(o0),u=o*l-a*a;if(u===0)return r.set(0,0,0),null;let d=1/u,f=(l*c-a*h)*d,g=(o*h-a*c)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,oi)===null?!1:oi.x>=0&&oi.y>=0&&oi.x+oi.y<=1}static getInterpolation(e,t,n,s,r,o,a,c){return this.getBarycoord(e,t,n,s,oi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,oi.x),c.addScaledVector(o,oi.y),c.addScaledVector(a,oi.z),c)}static getInterpolatedAttribute(e,t,n,s,r,o){return h0.setScalar(0),u0.setScalar(0),d0.setScalar(0),h0.fromBufferAttribute(e,t),u0.fromBufferAttribute(e,n),d0.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(h0,r.x),o.addScaledVector(u0,r.y),o.addScaledVector(d0,r.z),o}static isFrontFacing(e,t,n,s){return Nn.subVectors(n,t),ri.subVectors(e,t),Nn.cross(ri).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Nn.subVectors(this.c,this.b),ri.subVectors(this.a,this.b),Nn.cross(ri).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;ps.subVectors(s,n),ms.subVectors(r,n),a0.subVectors(e,n);let c=ps.dot(a0),l=ms.dot(a0);if(c<=0&&l<=0)return t.copy(n);l0.subVectors(e,s);let h=ps.dot(l0),u=ms.dot(l0);if(h>=0&&u<=h)return t.copy(s);let d=c*u-h*l;if(d<=0&&c>=0&&h<=0)return o=c/(c-h),t.copy(n).addScaledVector(ps,o);c0.subVectors(e,r);let f=ps.dot(c0),g=ms.dot(c0);if(g>=0&&f<=g)return t.copy(r);let v=f*l-c*g;if(v<=0&&l>=0&&g<=0)return a=l/(l-g),t.copy(n).addScaledVector(ms,a);let m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return _c.subVectors(r,s),a=(u-h)/(u-h+(f-g)),t.copy(s).addScaledVector(_c,a);let p=1/(m+v+d);return o=v*p,a=d*p,t.copy(n).addScaledVector(ps,o).addScaledVector(ms,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},fn=class{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Dn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Dn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Dn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Dn):Dn.fromBufferAttribute(r,o),Dn.applyMatrix4(e.matrixWorld),this.expandByPoint(Dn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),eo.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),eo.copy(n.boundingBox)),eo.applyMatrix4(e.matrixWorld),this.union(eo)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Dn),Dn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(tr),to.subVectors(this.max,tr),gs.subVectors(e.a,tr),_s.subVectors(e.b,tr),xs.subVectors(e.c,tr),wi.subVectors(_s,gs),Ti.subVectors(xs,_s),zi.subVectors(gs,xs);let t=[0,-wi.z,wi.y,0,-Ti.z,Ti.y,0,-zi.z,zi.y,wi.z,0,-wi.x,Ti.z,0,-Ti.x,zi.z,0,-zi.x,-wi.y,wi.x,0,-Ti.y,Ti.x,0,-zi.y,zi.x,0];return!f0(t,gs,_s,xs,to)||(t=[1,0,0,0,1,0,0,0,1],!f0(t,gs,_s,xs,to))?!1:(no.crossVectors(wi,Ti),t=[no.x,no.y,no.z],f0(t,gs,_s,xs,to))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Dn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Dn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(ai[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),ai[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),ai[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),ai[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),ai[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),ai[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),ai[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),ai[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(ai),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},ai=[new P,new P,new P,new P,new P,new P,new P,new P],Dn=new P,eo=new fn,gs=new P,_s=new P,xs=new P,wi=new P,Ti=new P,zi=new P,tr=new P,to=new P,no=new P,ki=new P;function f0(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){ki.fromArray(i,r);let a=s.x*Math.abs(ki.x)+s.y*Math.abs(ki.y)+s.z*Math.abs(ki.z),c=e.dot(ki),l=t.dot(ki),h=n.dot(ki);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}var kt=new P,io=new Ze,nd=0,Xt=class extends Zn{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:nd++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=nl,this.updateRanges=[],this.gpuType=wn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)io.fromBufferAttribute(this,t),io.applyMatrix3(e),this.setXY(t,io.x,io.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)kt.fromBufferAttribute(this,t),kt.applyMatrix3(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)kt.fromBufferAttribute(this,t),kt.applyMatrix4(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)kt.fromBufferAttribute(this,t),kt.applyNormalMatrix(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)kt.fromBufferAttribute(this,t),kt.transformDirection(e),this.setXYZ(t,kt.x,kt.y,kt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Fn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=yt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Fn(t,this.array)),t}setX(e,t){return this.normalized&&(t=yt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Fn(t,this.array)),t}setY(e,t){return this.normalized&&(t=yt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Fn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=yt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Fn(t,this.array)),t}setW(e,t){return this.normalized&&(t=yt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=yt(t,this.array),n=yt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=yt(t,this.array),n=yt(n,this.array),s=yt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=yt(t,this.array),n=yt(n,this.array),s=yt(s,this.array),r=yt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var pr=class extends Xt{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var mr=class extends Xt{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Ut=class extends Xt{constructor(e,t,n){super(new Float32Array(e),t,n)}},id=new fn,nr=new P,p0=new P,mn=class{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):id.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;nr.subVectors(e,this.center);let t=nr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(nr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(p0.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(nr.copy(e.center).add(p0)),this.expandByPoint(nr.copy(e.center).sub(p0))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},sd=0,Rn=new De,m0=new Et,ys=new P,Sn=new fn,ir=new fn,$t=new P,qt=class i extends Zn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:sd++}),this.uuid=Bn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Ru(e)?mr:pr)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new We().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Rn.makeRotationFromQuaternion(e),this.applyMatrix4(Rn),this}rotateX(e){return Rn.makeRotationX(e),this.applyMatrix4(Rn),this}rotateY(e){return Rn.makeRotationY(e),this.applyMatrix4(Rn),this}rotateZ(e){return Rn.makeRotationZ(e),this.applyMatrix4(Rn),this}translate(e,t,n){return Rn.makeTranslation(e,t,n),this.applyMatrix4(Rn),this}scale(e,t,n){return Rn.makeScale(e,t,n),this.applyMatrix4(Rn),this}lookAt(e){return m0.lookAt(e),m0.updateMatrix(),this.applyMatrix4(m0.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ys).negate(),this.translate(ys.x,ys.y,ys.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Ut(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Be("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new fn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ge("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Sn.setFromBufferAttribute(r),this.morphTargetsRelative?($t.addVectors(this.boundingBox.min,Sn.min),this.boundingBox.expandByPoint($t),$t.addVectors(this.boundingBox.max,Sn.max),this.boundingBox.expandByPoint($t)):(this.boundingBox.expandByPoint(Sn.min),this.boundingBox.expandByPoint(Sn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Ge('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new mn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Ge("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){let n=this.boundingSphere.center;if(Sn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];ir.setFromBufferAttribute(a),this.morphTargetsRelative?($t.addVectors(Sn.min,ir.min),Sn.expandByPoint($t),$t.addVectors(Sn.max,ir.max),Sn.expandByPoint($t)):(Sn.expandByPoint(ir.min),Sn.expandByPoint(ir.max))}Sn.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)$t.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared($t));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)$t.fromBufferAttribute(a,l),c&&(ys.fromBufferAttribute(e,l),$t.add(ys)),s=Math.max(s,n.distanceToSquared($t))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Ge('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Ge("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new Xt(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));let a=[],c=[];for(let _=0;_<n.count;_++)a[_]=new P,c[_]=new P;let l=new P,h=new P,u=new P,d=new Ze,f=new Ze,g=new Ze,v=new P,m=new P;function p(_,w,C){l.fromBufferAttribute(n,_),h.fromBufferAttribute(n,w),u.fromBufferAttribute(n,C),d.fromBufferAttribute(r,_),f.fromBufferAttribute(r,w),g.fromBufferAttribute(r,C),h.sub(l),u.sub(l),f.sub(d),g.sub(d);let D=1/(f.x*g.y-g.x*f.y);isFinite(D)&&(v.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(D),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(D),a[_].add(v),a[w].add(v),a[C].add(v),c[_].add(m),c[w].add(m),c[C].add(m))}let b=this.groups;b.length===0&&(b=[{start:0,count:e.count}]);for(let _=0,w=b.length;_<w;++_){let C=b[_],D=C.start,L=C.count;for(let N=D,I=D+L;N<I;N+=3)p(e.getX(N+0),e.getX(N+1),e.getX(N+2))}let R=new P,S=new P,T=new P,y=new P;function A(_){T.fromBufferAttribute(s,_),y.copy(T);let w=a[_];R.copy(w),R.sub(T.multiplyScalar(T.dot(w))).normalize(),S.crossVectors(y,w);let D=S.dot(c[_])<0?-1:1;o.setXYZW(_,R.x,R.y,R.z,D)}for(let _=0,w=b.length;_<w;++_){let C=b[_],D=C.start,L=C.count;for(let N=D,I=D+L;N<I;N+=3)A(e.getX(N+0)),A(e.getX(N+1)),A(e.getX(N+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Xt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);let s=new P,r=new P,o=new P,a=new P,c=new P,l=new P,h=new P,u=new P;if(e)for(let d=0,f=e.count;d<f;d+=3){let g=e.getX(d+0),v=e.getX(d+1),m=e.getX(d+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,v),o.fromBufferAttribute(t,m),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(n,g),c.fromBufferAttribute(n,v),l.fromBufferAttribute(n,m),a.add(h),c.add(h),l.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(v,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let d=0,f=t.count;d<f;d+=3)s.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)$t.fromBufferAttribute(e,t),$t.normalize(),e.setXYZ(t,$t.x,$t.y,$t.z)}toNonIndexed(){function e(a,c){let l=a.array,h=a.itemSize,u=a.normalized,d=new l.constructor(c.length*h),f=0,g=0;for(let v=0,m=c.length;v<m;v++){a.isInterleavedBufferAttribute?f=c[v]*a.data.stride+a.offset:f=c[v]*h;for(let p=0;p<h;p++)d[g++]=l[f++]}return new Xt(d,h,u)}if(this.index===null)return Be("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let c=s[a],l=e(c,n);t.setAttribute(a,l)}let r=this.morphAttributes;for(let a in r){let c=[],l=r[a];for(let h=0,u=l.length;h<u;h++){let d=l[h],f=e(d,n);c.push(f)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,c=o.length;a<c;a++){let l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let c in n){let l=n[c];e.data.attributes[c]=l.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],h=[];for(let u=0,d=l.length;u<d;u++){let f=l[u];h.push(f.toJSON(e.data))}h.length>0&&(s[c]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let l in s){let h=s[l];this.setAttribute(l,h.clone(t))}let r=e.morphAttributes;for(let l in r){let h=[],u=r[l];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let l=0,h=o.length;l<h;l++){let u=o[l];this.addGroup(u.start,u.count,u.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Ls=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=nl,this.updateRanges=[],this.version=0,this.uuid=Bn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Bn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Bn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},hn=new P,Ns=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)hn.fromBufferAttribute(this,t),hn.applyMatrix4(e),this.setXYZ(t,hn.x,hn.y,hn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)hn.fromBufferAttribute(this,t),hn.applyNormalMatrix(e),this.setXYZ(t,hn.x,hn.y,hn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)hn.fromBufferAttribute(this,t),hn.transformDirection(e),this.setXYZ(t,hn.x,hn.y,hn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Fn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=yt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=yt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=yt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=yt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=yt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Fn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Fn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Fn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Fn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=yt(t,this.array),n=yt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=yt(t,this.array),n=yt(n,this.array),s=yt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=yt(t,this.array),n=yt(n,this.array),s=yt(s,this.array),r=yt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){ur("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Xt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){ur("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},g0=new P,rd=new P,od=new We,Un=class{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=g0.subVectors(n,t).cross(rd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(g0),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let o=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(s,o)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||od.getNormalMatrix(e),s=this.coplanarPoint(g0).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},ad=0,on=class extends Zn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:ad++}),this.uuid=Bn(),this.name="",this.type="Material",this.blending=Hs,this.side=Qn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=k0,this.blendDst=V0,this.blendEquation=ts,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new ke(0,0,0),this.blendAlpha=0,this.depthFunc=Ts,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ph,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=wo,this.stencilZFail=wo,this.stencilZPass=wo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Be(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Be(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let c=r[a];delete c.metadata,o.push(c)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new ke().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new Un().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Ze().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ze().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}};var li=new P,_0=new P,so=new P,ro=new P,Zi=class{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,li)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=li.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(li.copy(this.origin).addScaledVector(this.direction,t),li.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){_0.copy(e).add(t).multiplyScalar(.5),so.copy(t).sub(e).normalize(),ro.copy(this.origin).sub(_0);let r=e.distanceTo(t)*.5,o=-this.direction.dot(so),a=ro.dot(this.direction),c=-ro.dot(so),l=ro.lengthSq(),h=Math.abs(1-o*o),u,d,f,g;if(h>0)if(u=o*c-a,d=o*a-c,g=r*h,u>=0)if(d>=-g)if(d<=g){let v=1/h;u*=v,d*=v,f=u*(u+o*d+2*a)+d*(o*u+d+2*c)+l}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*c)+l;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*c)+l;else d<=-g?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l):d<=g?(u=0,d=Math.min(Math.max(-r,-c),r),f=d*(d+2*c)+l):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-c),r),f=-u*u+d*(d+2*c)+l);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(_0).addScaledVector(so,d),f}intersectSphere(e,t){if(e.radius<0)return null;li.subVectors(e.center,this.origin);let n=li.dot(this.direction),s=li.dot(li)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,c,l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return l>=0?(n=(e.min.x-d.x)*l,s=(e.max.x-d.x)*l):(n=(e.max.x-d.x)*l,s=(e.min.x-d.x)*l),h>=0?(r=(e.min.y-d.y)*h,o=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,o=(e.min.y-d.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-d.z)*u,c=(e.max.z-d.z)*u):(a=(e.max.z-d.z)*u,c=(e.min.z-d.z)*u),n>c||a>s)||((a>n||n!==n)&&(n=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,li)!==null}intersectTriangle(e,t,n,s,r){let o=this.origin,a=this.direction,c=a.x,l=a.y,h=a.z,u=e.x-o.x,d=e.y-o.y,f=e.z-o.z,g=t.x-o.x,v=t.y-o.y,m=t.z-o.z,p=n.x-o.x,b=n.y-o.y,R=n.z-o.z,S=Math.abs(c),T=Math.abs(l),y=Math.abs(h),A,_,w,C,D,L,N,I,k,G,V,Q;if(S>=T&&S>=y?(w=c,L=u,k=g,Q=p,c>=0?(A=l,_=h,C=d,D=f,N=v,I=m,G=b,V=R):(A=h,_=l,C=f,D=d,N=m,I=v,G=R,V=b)):T>=y?(w=l,L=d,k=v,Q=b,l>=0?(A=h,_=c,C=f,D=u,N=m,I=g,G=R,V=p):(A=c,_=h,C=u,D=f,N=g,I=m,G=p,V=R)):(w=h,L=f,k=m,Q=R,h>=0?(A=c,_=l,C=u,D=d,N=g,I=v,G=p,V=b):(A=l,_=c,C=d,D=u,N=v,I=g,G=b,V=p)),w===0)return null;let W=A/w,O=_/w,Z=1/w,le=C-W*L,Me=D-O*L,ie=N-W*k,oe=I-O*k,re=G-W*Q,X=V-O*Q,j=re*oe-X*ie,z=le*X-Me*re,xe=ie*Me-oe*le;if(s){if(j<0||z<0||xe<0)return null}else if((j<0||z<0||xe<0)&&(j>0||z>0||xe>0))return null;let he=j+z+xe;if(he===0)return null;let Le=Z*(j*L+z*k+xe*Q);return(he>0?Le<0:Le>0)?null:this.at(Le/he,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},zn=class extends on{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.combine=jo,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},xc=new De,Vi=new Zi,oo=new mn,yc=new P,ao=new P,lo=new P,co=new P,x0=new P,ho=new P,vc=new P,uo=new P,dt=class extends Et{constructor(e=new qt,t=new zn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){ho.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let h=a[c],u=r[c];h!==0&&(x0.fromBufferAttribute(u,e),o?ho.addScaledVector(x0,h):ho.addScaledVector(x0.sub(t),h))}t.add(ho)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),oo.copy(n.boundingSphere),oo.applyMatrix4(r),Vi.copy(e.ray).recast(e.near),!(oo.containsPoint(Vi.origin)===!1&&(Vi.intersectSphere(oo,yc)===null||Vi.origin.distanceToSquared(yc)>(e.far-e.near)**2))&&(xc.copy(r).invert(),Vi.copy(e.ray).applyMatrix4(xc),!(n.boundingBox!==null&&Vi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Vi)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,v=d.length;g<v;g++){let m=d[g],p=o[m.materialIndex],b=Math.max(m.start,f.start),R=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let S=b,T=R;S<T;S+=3){let y=a.getX(S),A=a.getX(S+1),_=a.getX(S+2);s=fo(this,p,e,n,l,h,u,y,A,_),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),v=Math.min(a.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){let b=a.getX(m),R=a.getX(m+1),S=a.getX(m+2);s=fo(this,o,e,n,l,h,u,b,R,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let g=0,v=d.length;g<v;g++){let m=d[g],p=o[m.materialIndex],b=Math.max(m.start,f.start),R=Math.min(c.count,Math.min(m.start+m.count,f.start+f.count));for(let S=b,T=R;S<T;S+=3){let y=S,A=S+1,_=S+2;s=fo(this,p,e,n,l,h,u,y,A,_),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,f.start),v=Math.min(c.count,f.start+f.count);for(let m=g,p=v;m<p;m+=3){let b=m,R=m+1,S=m+2;s=fo(this,o,e,n,l,h,u,b,R,S),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function ld(i,e,t,n,s,r,o,a){let c;if(e.side===en?c=n.intersectTriangle(o,r,s,!0,a):c=n.intersectTriangle(s,r,o,e.side===Qn,a),c===null)return null;uo.copy(a),uo.applyMatrix4(i.matrixWorld);let l=t.ray.origin.distanceTo(uo);return l<t.near||l>t.far?null:{distance:l,point:uo.clone(),object:i}}function fo(i,e,t,n,s,r,o,a,c,l){i.getVertexPosition(a,ao),i.getVertexPosition(c,lo),i.getVertexPosition(l,co);let h=ld(i,e,t,n,ao,lo,co,vc);if(h){let u=new P;Ri.getBarycoord(vc,ao,lo,co,u),s&&(h.uv=Ri.getInterpolatedAttribute(s,a,c,l,u,new Ze)),r&&(h.uv1=Ri.getInterpolatedAttribute(r,a,c,l,u,new Ze)),o&&(h.normal=Ri.getInterpolatedAttribute(o,a,c,l,u,new P),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let d={a,b:c,c:l,normal:new P,materialIndex:0};Ri.getNormal(ao,lo,co,d.normal),h.face=d,h.barycoord=u}return h}var sr=new vt,Mc=new vt,Sc=new vt,cd=new vt,bc=new De,po=new P,y0=new mn,wc=new De,v0=new Zi,gr=class extends dt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=w0,this.bindMatrix=new De,this.bindMatrixInverse=new De,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new fn),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,po),this.boundingBox.expandByPoint(po)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new mn),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,po),this.boundingSphere.expandByPoint(po)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),y0.copy(this.boundingSphere),y0.applyMatrix4(s),e.ray.intersectsSphere(y0)!==!1&&(wc.copy(s).invert(),v0.copy(e.ray).applyMatrix4(wc),!(this.boundingBox!==null&&v0.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,v0)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new vt,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===w0?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===hh?this.bindMatrixInverse.copy(this.bindMatrix).invert():Be("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;Mc.fromBufferAttribute(s.attributes.skinIndex,e),Sc.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(sr.copy(t),t.set(0,0,0,0)):(sr.set(...t,1),t.set(0,0,0)),sr.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){let o=Sc.getComponent(r);if(o!==0){let a=Mc.getComponent(r);bc.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(cd.copy(sr).applyMatrix4(bc),o)}}return t.isVector4&&(t.w=sr.w),t.applyMatrix4(this.bindMatrixInverse)}},Ds=class extends Et{constructor(){super(),this.isBone=!0,this.type="Bone"}},Us=class extends Qt{constructor(e=null,t=1,n=1,s,r,o,a,c,l=Ft,h=Ft,u,d){super(null,o,a,c,l,h,s,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Tc=new De,hd=new De,_r=class i{constructor(e=[],t=[]){this.uuid=Bn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Be("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new De)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new De;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:hd;Tc.multiplyMatrices(a,t[r]),Tc.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new Us(t,e,e,Tn,wn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],o=t[r];o===void 0&&(Be("Skeleton: No bone found with UUID:",r),o=new Ds),this.bones.push(o),this.boneInverses.push(new De().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let o=t[s];e.bones.push(o.uuid);let a=n[s];e.boneInverses.push(a.toArray())}return e}},ui=class extends Xt{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){let e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}},vs=new De,Ac=new De,mo=[],Ec=new fn,ud=new De,rr=new dt,or=new mn,Ki=class extends dt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ui(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,ud)}computeBoundingBox(){let e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new fn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,vs),Ec.copy(e.boundingBox).applyMatrix4(vs),this.boundingBox.union(Ec)}computeBoundingSphere(){let e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new mn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,vs),or.copy(e.boundingSphere).applyMatrix4(vs),this.boundingSphere.union(or)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){let n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){let n=this.matrixWorld,s=this.count;if(rr.geometry=this.geometry,rr.material=this.material,rr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),or.copy(this.boundingSphere),or.applyMatrix4(n),e.ray.intersectsSphere(or)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,vs),Ac.multiplyMatrices(n,vs),rr.matrixWorld=Ac,rr.raycast(e,mo);for(let o=0,a=mo.length;o<a;o++){let c=mo[o];c.instanceId=r,c.object=this,t.push(c)}mo.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new ui(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){let n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new Us(new Float32Array(s*this.count),s,this.count,ra,wn));let r=this.morphTexture.source.data.data,o=0;for(let l=0;l<n.length;l++)o+=n[l];let a=this.geometry.morphTargetsRelative?1:1-o,c=s*e;return r[c]=a,r.set(n,c+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},Hi=new mn,dd=new Ze(.5,.5),go=new P,Fs=class{constructor(e=new Un,t=new Un,n=new Un,s=new Un,r=new Un,o=new Un){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=On,n=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],c=r[2],l=r[3],h=r[4],u=r[5],d=r[6],f=r[7],g=r[8],v=r[9],m=r[10],p=r[11],b=r[12],R=r[13],S=r[14],T=r[15];if(s[0].setComponents(l-o,f-h,p-g,T-b).normalize(),s[1].setComponents(l+o,f+h,p+g,T+b).normalize(),s[2].setComponents(l+a,f+u,p+v,T+R).normalize(),s[3].setComponents(l-a,f-u,p-v,T-R).normalize(),n)s[4].setComponents(c,d,m,S).normalize(),s[5].setComponents(l-c,f-d,p-m,T-S).normalize();else if(s[4].setComponents(l-c,f-d,p-m,T-S).normalize(),t===On)s[5].setComponents(l+c,f+d,p+m,T+S).normalize();else if(t===Es)s[5].setComponents(c,d,m,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Hi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Hi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Hi)}intersectsSprite(e){Hi.center.set(0,0,0);let t=dd.distanceTo(e.center);return Hi.radius=.7071067811865476+t,Hi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Hi)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(go.x=s.normal.x>0?e.max.x:e.min.x,go.y=s.normal.y>0?e.max.y:e.min.y,go.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(go)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Os=class extends on{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new ke(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Fo=new P,Oo=new P,Rc=new De,ar=new Zi,_o=new mn,M0=new P,Cc=new P,Ji=class extends Et{constructor(e=new qt,t=new Os){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Fo.fromBufferAttribute(t,s-1),Oo.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Fo.distanceTo(Oo);e.setAttribute("lineDistance",new Ut(n,1))}else Be("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),_o.copy(n.boundingSphere),_o.applyMatrix4(s),_o.radius+=r,e.ray.intersectsSphere(_o)===!1)return;Rc.copy(s).invert(),ar.copy(e.ray).applyMatrix4(Rc);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){let f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let v=f,m=g-1;v<m;v+=l){let p=h.getX(v),b=h.getX(v+1),R=xo(this,e,ar,c,p,b,v);R&&t.push(R)}if(this.isLineLoop){let v=h.getX(g-1),m=h.getX(f),p=xo(this,e,ar,c,v,m,g-1);p&&t.push(p)}}else{let f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let v=f,m=g-1;v<m;v+=l){let p=xo(this,e,ar,c,v,v+1,v);p&&t.push(p)}if(this.isLineLoop){let v=xo(this,e,ar,c,g-1,f,g-1);v&&t.push(v)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function xo(i,e,t,n,s,r,o){let a=i.geometry.attributes.position;if(Fo.fromBufferAttribute(a,s),Oo.fromBufferAttribute(a,r),t.distanceSqToSegment(Fo,Oo,M0,Cc)>n)return;M0.applyMatrix4(i.matrixWorld);let l=e.ray.origin.distanceTo(M0);if(!(l<e.near||l>e.far))return{distance:l,point:Cc.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}var Ic=new P,Pc=new P,xr=class extends Ji{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Ic.fromBufferAttribute(t,s),Pc.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Ic.distanceTo(Pc);e.setAttribute("lineDistance",new Ut(n,1))}else Be("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}},yr=class extends Ji{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}},Bs=class extends on{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new ke(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Lc=new De,C0=new Zi,yo=new mn,vo=new P,vr=class extends Et{constructor(e=new qt,t=new Bs){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),yo.copy(n.boundingSphere),yo.applyMatrix4(s),yo.radius+=r,e.ray.intersectsSphere(yo)===!1)return;Lc.copy(s).invert(),C0.copy(e.ray).applyMatrix4(Lc);let a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=n.index,u=n.attributes.position;if(l!==null){let d=Math.max(0,o.start),f=Math.min(l.count,o.start+o.count);for(let g=d,v=f;g<v;g++){let m=l.getX(g);vo.fromBufferAttribute(u,m),Nc(vo,m,c,s,e,t,this)}}else{let d=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=d,v=f;g<v;g++)vo.fromBufferAttribute(u,g),Nc(vo,g,c,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}};function Nc(i,e,t,n,s,r,o){let a=C0.distanceSqToPoint(i);if(a<t){let c=new P;C0.closestPointToPoint(i,c),c.applyMatrix4(n);let l=s.ray.origin.distanceTo(c);if(l<s.near||l>s.far)return;r.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}var Mr=class extends Qt{constructor(e=[],t=Ni,n,s,r,o,a,c,l,h){super(e,t,n,s,r,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}};var Ii=class extends Qt{constructor(e,t,n=Hn,s,r,o,a=Ft,c=Ft,l,h=Yn,u=1){if(h!==Yn&&h!==Di)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let d={width:e,height:t,depth:u};super(d,s,r,o,a,c,h,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Is(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Bo=class extends Ii{constructor(e,t=Hn,n=Ni,s,r,o=Ft,a=Ft,c,l=Yn){let h={width:e,height:e,depth:1},u=[h,h,h,h,h,h];super(e,e,t,n,s,r,o,a,c,l),this.image=u,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Sr=class extends Qt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Pi=class i extends qt{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let c=[],l=[],h=[],u=[],d=0,f=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new Ut(l,3)),this.setAttribute("normal",new Ut(h,3)),this.setAttribute("uv",new Ut(u,2));function g(v,m,p,b,R,S,T,y,A,_,w){let C=S/A,D=T/_,L=S/2,N=T/2,I=y/2,k=A+1,G=_+1,V=0,Q=0,W=new P;for(let O=0;O<G;O++){let Z=O*D-N;for(let le=0;le<k;le++){let Me=le*C-L;W[v]=Me*b,W[m]=Z*R,W[p]=I,l.push(W.x,W.y,W.z),W[v]=0,W[m]=0,W[p]=y>0?1:-1,h.push(W.x,W.y,W.z),u.push(le/A),u.push(1-O/_),V+=1}}for(let O=0;O<_;O++)for(let Z=0;Z<A;Z++){let le=d+Z+k*O,Me=d+Z+k*(O+1),ie=d+(Z+1)+k*(O+1),oe=d+(Z+1)+k*O;c.push(le,Me,oe),c.push(Me,ie,oe),Q+=6}a.addGroup(f,Q,w),f+=Q,d+=V}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var $i=class i extends qt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),c=Math.floor(s),l=a+1,h=c+1,u=e/a,d=t/c,f=[],g=[],v=[],m=[];for(let p=0;p<h;p++){let b=p*d-o;for(let R=0;R<l;R++){let S=R*u-r;g.push(S,-b,0),v.push(0,0,1),m.push(R/a),m.push(1-p/c)}}for(let p=0;p<c;p++)for(let b=0;b<a;b++){let R=b+l*p,S=b+l*(p+1),T=b+1+l*(p+1),y=b+1+l*p;f.push(R,S,y),f.push(S,T,y)}this.setIndex(f),this.setAttribute("position",new Ut(g,3)),this.setAttribute("normal",new Ut(v,3)),this.setAttribute("uv",new Ut(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var br=class i extends qt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let c=Math.min(o+a,Math.PI),l=0,h=[],u=new P,d=new P,f=[],g=[],v=[],m=[];for(let p=0;p<=n;p++){let b=[],R=p/n,S=o+R*a,T=e*Math.cos(S),y=Math.sqrt(e*e-T*T),A=0;p===0&&o===0?A=.5/t:p===n&&c===Math.PI&&(A=-.5/t);for(let _=0;_<=t;_++){let w=_/t,C=s+w*r;u.x=-y*Math.cos(C),u.y=T,u.z=y*Math.sin(C),g.push(u.x,u.y,u.z),d.copy(u).normalize(),v.push(d.x,d.y,d.z),m.push(w+A,1-R),b.push(l++)}h.push(b)}for(let p=0;p<n;p++)for(let b=0;b<t;b++){let R=h[p][b+1],S=h[p][b],T=h[p+1][b],y=h[p+1][b+1];(p!==0||o>0)&&f.push(R,S,y),(p!==n-1||c<Math.PI)&&f.push(S,T,y)}this.setIndex(f),this.setAttribute("position",new Ut(g,3)),this.setAttribute("normal",new Ut(v,3)),this.setAttribute("uv",new Ut(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var wr=class extends on{constructor(e){super(),this.isShadowMaterial=!0,this.type="ShadowMaterial",this.color=new ke(0),this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.fog=e.fog,this}};function ss(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(Dc(s))s.isRenderTargetTexture?(Be("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(Dc(s[0])){let r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function an(i){let e={};for(let t=0;t<i.length;t++){let n=ss(i[t]);for(let s in n)e[s]=n[s]}return e}function Dc(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function fd(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function ol(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:je.workingColorSpace}var Ah={clone:ss,merge:an},pd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,md=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,bn=class extends on{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=pd,this.fragmentShader=md,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=ss(e.uniforms),this.uniformsGroups=fd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new ke().setHex(s.value);break;case"v2":this.uniforms[n].value=new Ze().fromArray(s.value);break;case"v3":this.uniforms[n].value=new P().fromArray(s.value);break;case"v4":this.uniforms[n].value=new vt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new We().fromArray(s.value);break;case"m4":this.uniforms[n].value=new De().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},zo=class extends bn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}},gn=class extends on{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new ke(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Gr,this.normalScale=new Ze(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},_n=class extends gn{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Ze(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return it(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new ke(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new ke(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new ke(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}};var Tr=class extends on{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new ke(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new ke(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Gr,this.normalScale=new Ze(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Kn,this.combine=jo,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},ko=class extends on{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=dh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Vo=class extends on{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ei(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function To(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}function gd(i){function e(s,r){return i[s]-i[r]}let t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function Uc(i,e,t){let n=i.length,s=new i.constructor(n);for(let r=0,o=0;o!==n;++r){let a=t[r]*e;for(let c=0;c!==e;++c)s[o++]=i[a+c]}return s}function _d(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push(...o)),r=i[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=i[s++];while(r!==void 0)}var Jn=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Ho=class extends Jn{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:A0,endingEnd:A0}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],c=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case E0:r=e,a=2*t-n;break;case R0:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case E0:o=e,c=2*n-t;break;case R0:o=1,c=n+s[1]-s[0];break;default:o=e-1,c=t}let l=(n-t)*.5,h=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(s-t),v=g*g,m=v*g,p=-d*m+2*d*v-d*g,b=(1+d)*m+(-1.5-2*d)*v+(-.5+d)*g+1,R=(-1-f)*m+(1.5+f)*v+.5*g,S=f*m-f*v;for(let T=0;T!==a;++T)r[T]=p*o[h+T]+b*o[l+T]+R*o[c+T]+S*o[u+T];return r}},Go=class extends Jn{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,h=(n-t)/(s-t),u=1-h;for(let d=0;d!==a;++d)r[d]=o[l+d]*u+o[c+d]*h;return r}},Wo=class extends Jn{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},Xo=class extends Jn{interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,h=this.inTangents,u=this.outTangents;if(!h||!u){let g=(n-t)/(s-t),v=1-g;for(let m=0;m!==a;++m)r[m]=o[l+m]*v+o[c+m]*g;return r}let d=a*2,f=e-1;for(let g=0;g!==a;++g){let v=o[l+g],m=o[c+g],p=f*d+g*2,b=u[p],R=u[p+1],S=e*d+g*2,T=h[S],y=h[S+1],A=yd(n,t,b,T,s);r[g]=Eh(A,v,R,y,m)}return r}};function Eh(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function xd(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function yd(i,e,t,n,s){let r=(i-e)/(s-e);for(let o=0;o<8;o++){let a=Eh(r,e,t,n,s)-i;if(Math.abs(a)<1e-10)break;let c=xd(r,e,t,n,s);if(Math.abs(c)<1e-10)break;r=Math.max(0,Math.min(1,r-a/c))}return r}var xn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ei(t,this.TimeBufferType),this.values=Ei(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ei(e.times,Array),values:Ei(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),To(e.settings)&&(n.settings={inTangents:Ei(e.settings.inTangents,Array),outTangents:Ei(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Wo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Go(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Ho(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Xo(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Wi:t=this.InterpolantFactoryMethodDiscrete;break;case Xi:t=this.InterpolantFactoryMethodLinear;break;case bo:t=this.InterpolantFactoryMethodSmooth;break;case T0:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Be("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Wi;case this.InterpolantFactoryMethodLinear:return Xi;case this.InterpolantFactoryMethodSmooth:return bo;case this.InterpolantFactoryMethodBezier:return T0}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;To(this.settings)&&(Fc(this.settings.inTangents,e),Fc(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Ge("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Ge("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let c=n[a];if(typeof c=="number"&&isNaN(c)){Ge("KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){Ge("KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(s!==void 0&&Cu(s))for(let a=0,c=s.length;a!==c;++a){let l=s[a];if(isNaN(l)){Ge("KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===bo,r=e.length-1,o=1;for(let a=1;a<r;++a){let c=!1,l=e[a],h=e[a+1];if(l!==h&&(a!==1||l!==e[0]))if(s)c=!0;else{let u=a*n,d=u-n,f=u+n;for(let g=0;g!==n;++g){let v=t[u+g];if(v!==t[d+g]||v!==t[f+g]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];let u=a*n,d=o*n;for(let f=0;f!==n;++f)t[d+f]=t[u+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,c=o*n,l=0;l!==n;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,To(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Fc(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}xn.prototype.ValueTypeName="";xn.prototype.TimeBufferType=Float32Array;xn.prototype.ValueBufferType=Float32Array;xn.prototype.DefaultInterpolation=Xi;var di=class extends xn{constructor(e,t,n){super(e,t,n)}};di.prototype.ValueTypeName="bool";di.prototype.ValueBufferType=Array;di.prototype.DefaultInterpolation=Wi;di.prototype.InterpolantFactoryMethodLinear=void 0;di.prototype.InterpolantFactoryMethodSmooth=void 0;var Ar=class extends xn{constructor(e,t,n,s){super(e,t,n,s)}};Ar.prototype.ValueTypeName="color";var fi=class extends xn{constructor(e,t,n,s){super(e,t,n,s)}};fi.prototype.ValueTypeName="number";var qo=class extends Jn{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-t)/(s-t),l=e*a;for(let h=l+a;l!==h;l+=4)Ue.slerpFlat(r,0,o,l-a,o,l,c);return r}},pi=class extends xn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new qo(this.times,this.values,this.getValueSize(),e)}};pi.prototype.ValueTypeName="quaternion";pi.prototype.InterpolantFactoryMethodSmooth=void 0;var mi=class extends xn{constructor(e,t,n){super(e,t,n)}};mi.prototype.ValueTypeName="string";mi.prototype.ValueBufferType=Array;mi.prototype.DefaultInterpolation=Wi;mi.prototype.InterpolantFactoryMethodLinear=void 0;mi.prototype.InterpolantFactoryMethodSmooth=void 0;var Li=class extends xn{constructor(e,t,n,s){super(e,t,n,s)}};Li.prototype.ValueTypeName="vector";var Er=class{constructor(e="",t=-1,n=[],s=uh){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=Bn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){let t=[],n=e.tracks,s=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(Md(n[o]).scale(s));let r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){let t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,o=n.length;r!==o;++r)t.push(xn.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){let r=t.length,o=[];for(let a=0;a<r;a++){let c=[],l=[];c.push((a+r-1)%r,a,(a+1)%r),l.push(0,1,0);let h=gd(c);c=Uc(c,1,h),l=Uc(l,1,h),!s&&c[0]===0&&(c.push(r),l.push(l[0])),o.push(new fi(".morphTargetInfluences["+t[a].name+"]",c,l).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){let s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){let s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,c=e.length;a<c;a++){let l=e[a],h=l.name.match(r);if(h&&h.length>1){let u=h[1],d=s[u];d||(s[u]=d=[]),d.push(l)}}let o=[];for(let a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],t,n));return o}resetDuration(){let e=this.tracks,t=0;for(let n=0,s=e.length;n!==s;++n){let r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){let e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());let t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}};function vd(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return fi;case"vector":case"vector2":case"vector3":case"vector4":return Li;case"color":return Ar;case"quaternion":return pi;case"bool":case"boolean":return di;case"string":return mi}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function Md(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");let e=vd(i.type);if(i.times===void 0){let n=[],s=[];_d(i.keys,n,s,"value"),i.times=n,i.values=s}let t;return e.parse!==void 0?t=e.parse(i):t=new e(i.name,i.times,i.values,i.interpolation),To(i.settings)&&(t.settings={inTangents:Ei(i.settings.inTangents,Float32Array),outTangents:Ei(i.settings.outTangents,Float32Array)}),t}var qn={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(Oc(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!Oc(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function Oc(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var Yo=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return h=h.normalize("NFC"),c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,u){return l.push(h,u),this},this.removeHandler=function(h){let u=l.indexOf(h);return u!==-1&&l.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=l.length;u<d;u+=2){let f=l[u],g=l[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Rh=new Yo,$n=class{constructor(e){this.manager=e!==void 0?e:Rh,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};$n.DEFAULT_MATERIAL_NAME="__DEFAULT";var ci={},I0=class extends Error{constructor(e,t){super(e),this.response=t}},zs=class extends $n{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=qn.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(ci[e]!==void 0){ci[e].push({onLoad:t,onProgress:n,onError:s});return}ci[e]=[],ci[e].push({onLoad:t,onProgress:n,onError:s});let o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,c=this.responseType;fetch(o).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&Be("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;let h=ci[e],u=l.body.getReader(),d=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),f=d?parseInt(d):0,g=f!==0,v=0,m=new ReadableStream({start(p){b();function b(){u.read().then(({done:R,value:S})=>{if(R)p.close();else{v+=S.byteLength;let T=new ProgressEvent("progress",{lengthComputable:g,loaded:v,total:f});for(let y=0,A=h.length;y<A;y++){let _=h[y];_.onProgress&&_.onProgress(T)}p.enqueue(S),b()}},R=>{p.error(R)})}}});return new Response(m)}else throw new I0(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return l.json();default:if(a==="")return l.text();{let u=/charset="?([^;"\s]*)"?/i.exec(a),d=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(d);return l.arrayBuffer().then(g=>f.decode(g))}}}).then(l=>{qn.add(`file:${e}`,l);let h=ci[e];delete ci[e];for(let u=0,d=h.length;u<d;u++){let f=h[u];f.onLoad&&f.onLoad(l)}}).catch(l=>{let h=ci[e];if(h===void 0)throw this.manager.itemError(e),l;delete ci[e];for(let u=0,d=h.length;u<d;u++){let f=h[u];f.onError&&f.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Ms=new WeakMap,Zo=class extends $n{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=qn.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let u=Ms.get(o);u===void 0&&(u=[],Ms.set(o,u)),u.push({onLoad:t,onError:s})}return o}let a=Rs("img");function c(){h(),t&&t(this);let u=Ms.get(this)||[];for(let d=0;d<u.length;d++){let f=u[d];f.onLoad&&f.onLoad(this)}Ms.delete(this),r.manager.itemEnd(e)}function l(u){h(),s&&s(u),qn.remove(`image:${e}`);let d=Ms.get(this)||[];for(let f=0;f<d.length;f++){let g=d[f];g.onError&&g.onError(u)}Ms.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",c,!1),a.removeEventListener("error",l,!1)}return a.addEventListener("load",c,!1),a.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),qn.add(`image:${e}`,a),r.manager.itemStart(e),a.src=e,a}};var Rr=class extends $n{constructor(e){super(e)}load(e,t,n,s){let r=new Qt,o=new Zo(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},ji=class extends Et{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new ke(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Cr=class extends ji{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.groundColor=new ke(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},S0=new De,Bc=new P,zc=new P,ks=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ze(512,512),this.mapType=vn,this.map=null,this.mapPass=null,this.matrix=new De,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Fs,this._frameExtents=new Ze(1,1),this._viewportCount=1,this._viewports=[new vt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Bc.setFromMatrixPosition(e.matrixWorld),t.position.copy(Bc),zc.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(zc),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){S0.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(S0,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,c=s?s.x/r.x:0,l=s?s.y/r.y:0;e.coordinateSystem===Es||e.reversedDepth?t.set(.5*o,0,0,.5*o+c,0,.5*a,0,.5*a+l,0,0,1,0,0,0,0,1):t.set(.5*o,0,0,.5*o+c,0,.5*a,0,.5*a+l,0,0,.5,.5,0,0,0,1),t.multiply(S0)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Mo=new P,So=new Ue,Xn=new P,Ir=class extends Et{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new De,this.projectionMatrix=new De,this.projectionMatrixInverse=new De,this.coordinateSystem=On,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Mo,So,Xn),Xn.x===1&&Xn.y===1&&Xn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Mo,So,Xn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Mo,So,Xn),Xn.x===1&&Xn.y===1&&Xn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Mo,So,Xn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ai=new P,kc=new Ze,Vc=new Ze,jt=class extends Ir{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=qi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(lr*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return qi*2*Math.atan(Math.tan(lr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ai.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ai.x,Ai.y).multiplyScalar(-e/Ai.z),Ai.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ai.x,Ai.y).multiplyScalar(-e/Ai.z)}getViewSize(e,t){return this.getViewBounds(e,kc,Vc),t.subVectors(Vc,kc)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(lr*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,t-=o.offsetY*n/l,s*=o.width/c,n*=o.height/l}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},P0=class extends ks{constructor(){super(new jt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){let t=this.camera,n=qi*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){let e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}},Pr=class extends ji{constructor(e,t,n=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.target=new Et,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new P0}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}},L0=class extends ks{constructor(){super(new jt(90,1,.5,500)),this.isPointLightShadow=!0}},Qi=class extends ji{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new L0}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}},jn=class extends Ir{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},N0=class extends ks{constructor(){super(new jn(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},es=class extends ji{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.target=new Et,this.shadow=new N0}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var gi=class{static extractUrlBase(e){let t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}};var b0=new WeakMap,Lr=class extends $n{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&Be("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&Be("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=qn.get(`image-bitmap:${e}`);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(l=>{b0.has(o)===!0?(s&&s(b0.get(o)),r.manager.itemError(e),r.manager.itemEnd(e)):(t&&t(l),r.manager.itemEnd(e))});return}setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);return}let a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;let c=fetch(e,a).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(l){return qn.add(`image-bitmap:${e}`,l),t&&t(l),r.manager.itemEnd(e),l}).catch(function(l){s&&s(l),b0.set(c,l),qn.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});qn.add(`image-bitmap:${e}`,c),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}};var Ss=-90,bs=1,Ko=class extends Et{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new jt(Ss,bs,e,t);s.layers=this.layers,this.add(s);let r=new jt(Ss,bs,e,t);r.layers=this.layers,this.add(r);let o=new jt(Ss,bs,e,t);o.layers=this.layers,this.add(o);let a=new jt(Ss,bs,e,t);a.layers=this.layers,this.add(a);let c=new jt(Ss,bs,e,t);c.layers=this.layers,this.add(c);let l=new jt(Ss,bs,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,c]=t;for(let l of t)this.remove(l);if(e===On)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Es)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,c,l,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let v=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),n.texture.generateMipmaps=v,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Jo=class extends jt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var al="\\[\\]\\.:\\/",Sd=new RegExp("["+al+"]","g"),ll="[^"+al+"]",bd="[^"+al.replace("\\.","")+"]",wd=/((?:WC+[\/:])*)/.source.replace("WC",ll),Td=/(WCOD+)?/.source.replace("WCOD",bd),Ad=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",ll),Ed=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",ll),Rd=new RegExp("^"+wd+Td+Ad+Ed+"$"),Cd=["material","materials","bones","map"],D0=class{constructor(e,t,n){let s=n||wt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},wt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Sd,"")}static parseTrackName(e){let t=Rd.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Cd.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let c=n(a.children);if(c)return c}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Be("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){Ge("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Ge("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Ge("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===l){l=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Ge("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Ge("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Ge("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){Ge("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let o=e[s];if(o===void 0){let l=t.nodeName;Ge("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Ge("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Ge("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};wt.Composite=D0;wt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};wt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};wt.prototype.GetterByBindingType=[wt.prototype._getValue_direct,wt.prototype._getValue_array,wt.prototype._getValue_arrayElement,wt.prototype._getValue_toArray];wt.prototype.SetterByBindingTypeAndVersioning=[[wt.prototype._setValue_direct,wt.prototype._setValue_direct_setNeedsUpdate,wt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[wt.prototype._setValue_array,wt.prototype._setValue_array_setNeedsUpdate,wt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[wt.prototype._setValue_arrayElement,wt.prototype._setValue_arrayElement_setNeedsUpdate,wt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[wt.prototype._setValue_fromArray,wt.prototype._setValue_fromArray_setNeedsUpdate,wt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var K3=new Float32Array(1);var U0=class i{static{i.prototype.isMatrix2=!0}constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};function cl(i,e,t,n){let s=Id(n);switch(t){case Q0:return i*e;case ra:return i*e/s.components*s.byteLength;case oa:return i*e/s.components*s.byteLength;case Ui:return i*e*2/s.components*s.byteLength;case aa:return i*e*2/s.components*s.byteLength;case el:return i*e*3/s.components*s.byteLength;case Tn:return i*e*4/s.components*s.byteLength;case la:return i*e*4/s.components*s.byteLength;case Fr:case Or:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Br:case zr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ha:case da:return Math.max(i,16)*Math.max(e,8)/4;case ca:case ua:return Math.max(i,8)*Math.max(e,8)/2;case fa:case pa:case ga:case _a:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ma:case kr:case xa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ya:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case va:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Ma:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Sa:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case ba:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case wa:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Ta:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Aa:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Ea:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Ra:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Ca:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Ia:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Pa:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case La:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Na:case Da:case Ua:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Fa:case Oa:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Vr:case Ba:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Id(i){switch(i){case vn:case K0:return{byteLength:1,components:1};case Ws:case J0:case Gn:return{byteLength:2,components:1};case ia:case sa:return{byteLength:2,components:4};case Hn:case na:case wn:return{byteLength:4,components:1};case $0:case j0:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Be("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function Jh(){let i=null,e=!1,t=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),t(r,o)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Ld(i){let e=new WeakMap;function t(a,c){let l=a.array,h=a.usage,u=l.byteLength,d=i.createBuffer();i.bindBuffer(c,d),i.bufferData(c,l,h),a.onUploadCallback();let f;if(l instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)f=i.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)f=i.SHORT;else if(l instanceof Uint32Array)f=i.UNSIGNED_INT;else if(l instanceof Int32Array)f=i.INT;else if(l instanceof Int8Array)f=i.BYTE;else if(l instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:d,type:f,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,c,l){let h=c.array,u=c.updateRanges;if(i.bindBuffer(l,a),u.length===0)i.bufferSubData(l,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){let g=u[d],v=u[f];v.start<=g.start+g.count+1?g.count=Math.max(g.count,v.start+v.count-g.start):(++d,u[d]=v)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){let v=u[f];i.bufferSubData(l,v.start*h.BYTES_PER_ELEMENT,h,v.start,v.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let c=e.get(a);c&&(i.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var Nd=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Dd=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Ud=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Fd=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Od=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Bd=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,zd=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,kd=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Vd=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Hd=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Gd=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Wd=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Xd=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,qd=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Yd=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Zd=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Kd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Jd=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,$d=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,jd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Qd=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,ef=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,tf=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,nf=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,sf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,rf=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,of=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,af=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,lf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,cf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,hf="gl_FragColor = linearToOutputTexel( gl_FragColor );",uf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,df=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,ff=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,pf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,mf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,gf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,_f=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,xf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,yf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,vf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Mf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Sf=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,bf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,wf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Tf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Af=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Ef=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Rf=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Cf=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,If=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Pf=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Lf=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Nf=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Df=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Uf=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Ff=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Of=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Bf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,zf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,kf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Vf=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Hf=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Gf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Wf=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Xf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,qf=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Yf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Zf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Kf=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Jf=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,$f=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,jf=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,Qf=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,e1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,t1=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,n1=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,i1=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,s1=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,r1=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,o1=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,a1=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,l1=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,c1=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,h1=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,u1=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,d1=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,f1=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,p1=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,m1=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,g1=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,_1=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,x1=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,y1=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,v1=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,M1=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,S1=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,b1=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,w1=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,T1=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,A1=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,E1=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,R1=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,C1=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,I1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,P1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,L1=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,N1=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,D1=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,U1=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,F1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,O1=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,B1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,z1=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,k1=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,V1=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,H1=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,G1=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,W1=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,X1=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,q1=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Y1=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Z1=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,K1=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,J1=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,$1=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,j1=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,Q1=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ep=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,tp=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,np=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ip=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sp=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,rp=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,op=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ap=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lp=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,cp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,hp=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,up=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,dp=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,fp=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,$e={alphahash_fragment:Nd,alphahash_pars_fragment:Dd,alphamap_fragment:Ud,alphamap_pars_fragment:Fd,alphatest_fragment:Od,alphatest_pars_fragment:Bd,aomap_fragment:zd,aomap_pars_fragment:kd,batching_pars_vertex:Vd,batching_vertex:Hd,begin_vertex:Gd,beginnormal_vertex:Wd,bsdfs:Xd,iridescence_fragment:qd,bumpmap_pars_fragment:Yd,clipping_planes_fragment:Zd,clipping_planes_pars_fragment:Kd,clipping_planes_pars_vertex:Jd,clipping_planes_vertex:$d,color_fragment:jd,color_pars_fragment:Qd,color_pars_vertex:ef,color_vertex:tf,common:nf,cube_uv_reflection_fragment:sf,defaultnormal_vertex:rf,displacementmap_pars_vertex:of,displacementmap_vertex:af,emissivemap_fragment:lf,emissivemap_pars_fragment:cf,colorspace_fragment:hf,colorspace_pars_fragment:uf,envmap_fragment:df,envmap_common_pars_fragment:ff,envmap_pars_fragment:pf,envmap_pars_vertex:mf,envmap_physical_pars_fragment:Af,envmap_vertex:gf,fog_vertex:_f,fog_pars_vertex:xf,fog_fragment:yf,fog_pars_fragment:vf,gradientmap_pars_fragment:Mf,lightmap_pars_fragment:Sf,lights_lambert_fragment:bf,lights_lambert_pars_fragment:wf,lights_pars_begin:Tf,lights_toon_fragment:Ef,lights_toon_pars_fragment:Rf,lights_phong_fragment:Cf,lights_phong_pars_fragment:If,lights_physical_fragment:Pf,lights_physical_pars_fragment:Lf,lights_fragment_begin:Nf,lights_fragment_maps:Df,lights_fragment_end:Uf,lightprobes_pars_fragment:Ff,logdepthbuf_fragment:Of,logdepthbuf_pars_fragment:Bf,logdepthbuf_pars_vertex:zf,logdepthbuf_vertex:kf,map_fragment:Vf,map_pars_fragment:Hf,map_particle_fragment:Gf,map_particle_pars_fragment:Wf,metalnessmap_fragment:Xf,metalnessmap_pars_fragment:qf,morphinstance_vertex:Yf,morphcolor_vertex:Zf,morphnormal_vertex:Kf,morphtarget_pars_vertex:Jf,morphtarget_vertex:$f,normal_fragment_begin:jf,normal_fragment_maps:Qf,normal_pars_fragment:e1,normal_pars_vertex:t1,normal_vertex:n1,normalmap_pars_fragment:i1,clearcoat_normal_fragment_begin:s1,clearcoat_normal_fragment_maps:r1,clearcoat_pars_fragment:o1,iridescence_pars_fragment:a1,opaque_fragment:l1,packing:c1,premultiplied_alpha_fragment:h1,project_vertex:u1,dithering_fragment:d1,dithering_pars_fragment:f1,roughnessmap_fragment:p1,roughnessmap_pars_fragment:m1,shadowmap_pars_fragment:g1,shadowmap_pars_vertex:_1,shadowmap_vertex:x1,shadowmask_pars_fragment:y1,skinbase_vertex:v1,skinning_pars_vertex:M1,skinning_vertex:S1,skinnormal_vertex:b1,specularmap_fragment:w1,specularmap_pars_fragment:T1,tonemapping_fragment:A1,tonemapping_pars_fragment:E1,transmission_fragment:R1,transmission_pars_fragment:C1,uv_pars_fragment:I1,uv_pars_vertex:P1,uv_vertex:L1,worldpos_vertex:N1,background_vert:D1,background_frag:U1,backgroundCube_vert:F1,backgroundCube_frag:O1,cube_vert:B1,cube_frag:z1,depth_vert:k1,depth_frag:V1,distance_vert:H1,distance_frag:G1,equirect_vert:W1,equirect_frag:X1,linedashed_vert:q1,linedashed_frag:Y1,meshbasic_vert:Z1,meshbasic_frag:K1,meshlambert_vert:J1,meshlambert_frag:$1,meshmatcap_vert:j1,meshmatcap_frag:Q1,meshnormal_vert:ep,meshnormal_frag:tp,meshphong_vert:np,meshphong_frag:ip,meshphysical_vert:sp,meshphysical_frag:rp,meshtoon_vert:op,meshtoon_frag:ap,points_vert:lp,points_frag:cp,shadow_vert:hp,shadow_frag:up,sprite_vert:dp,sprite_frag:fp},ve={common:{diffuse:{value:new ke(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new We},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new We}},envmap:{envMap:{value:null},envMapRotation:{value:new We},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new We}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new We}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new We},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new We},normalScale:{value:new Ze(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new We},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new We}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new We}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new We}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new ke(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new P},probesMax:{value:new P},probesResolution:{value:new P}},points:{diffuse:{value:new ke(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0},uvTransform:{value:new We}},sprite:{diffuse:{value:new ke(16777215)},opacity:{value:1},center:{value:new Ze(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new We},alphaMap:{value:null},alphaMapTransform:{value:new We},alphaTest:{value:0}}},ni={basic:{uniforms:an([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.fog]),vertexShader:$e.meshbasic_vert,fragmentShader:$e.meshbasic_frag},lambert:{uniforms:an([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new ke(0)},envMapIntensity:{value:1}}]),vertexShader:$e.meshlambert_vert,fragmentShader:$e.meshlambert_frag},phong:{uniforms:an([ve.common,ve.specularmap,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,ve.lights,{emissive:{value:new ke(0)},specular:{value:new ke(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:$e.meshphong_vert,fragmentShader:$e.meshphong_frag},standard:{uniforms:an([ve.common,ve.envmap,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.roughnessmap,ve.metalnessmap,ve.fog,ve.lights,{emissive:{value:new ke(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag},toon:{uniforms:an([ve.common,ve.aomap,ve.lightmap,ve.emissivemap,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.gradientmap,ve.fog,ve.lights,{emissive:{value:new ke(0)}}]),vertexShader:$e.meshtoon_vert,fragmentShader:$e.meshtoon_frag},matcap:{uniforms:an([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,ve.fog,{matcap:{value:null}}]),vertexShader:$e.meshmatcap_vert,fragmentShader:$e.meshmatcap_frag},points:{uniforms:an([ve.points,ve.fog]),vertexShader:$e.points_vert,fragmentShader:$e.points_frag},dashed:{uniforms:an([ve.common,ve.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:$e.linedashed_vert,fragmentShader:$e.linedashed_frag},depth:{uniforms:an([ve.common,ve.displacementmap]),vertexShader:$e.depth_vert,fragmentShader:$e.depth_frag},normal:{uniforms:an([ve.common,ve.bumpmap,ve.normalmap,ve.displacementmap,{opacity:{value:1}}]),vertexShader:$e.meshnormal_vert,fragmentShader:$e.meshnormal_frag},sprite:{uniforms:an([ve.sprite,ve.fog]),vertexShader:$e.sprite_vert,fragmentShader:$e.sprite_frag},background:{uniforms:{uvTransform:{value:new We},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:$e.background_vert,fragmentShader:$e.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new We}},vertexShader:$e.backgroundCube_vert,fragmentShader:$e.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:$e.cube_vert,fragmentShader:$e.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:$e.equirect_vert,fragmentShader:$e.equirect_frag},distance:{uniforms:an([ve.common,ve.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:$e.distance_vert,fragmentShader:$e.distance_frag},shadow:{uniforms:an([ve.lights,ve.fog,{color:{value:new ke(0)},opacity:{value:1}}]),vertexShader:$e.shadow_vert,fragmentShader:$e.shadow_frag}};ni.physical={uniforms:an([ni.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new We},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new We},clearcoatNormalScale:{value:new Ze(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new We},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new We},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new We},sheen:{value:0},sheenColor:{value:new ke(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new We},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new We},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new We},transmissionSamplerSize:{value:new Ze},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new We},attenuationDistance:{value:0},attenuationColor:{value:new ke(0)},specularColor:{value:new ke(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new We},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new We},anisotropyVector:{value:new Ze},anisotropyMap:{value:null},anisotropyMapTransform:{value:new We}}]),vertexShader:$e.meshphysical_vert,fragmentShader:$e.meshphysical_frag};var Va={r:0,b:0,g:0},pp=new De,$h=new We;$h.set(-1,0,0,0,1,0,0,0,1);function mp(i,e,t,n,s,r){let o=new ke(0),a=s===!0?0:1,c,l,h=null,u=0,d=null;function f(b){let R=b.isScene===!0?b.background:null;if(R&&R.isTexture){let S=b.backgroundBlurriness>0;R=e.get(R,S)}return R}function g(b){let R=!1,S=f(b);S===null?m(o,a):S&&S.isColor&&(m(S,1),R=!0);let T=i.xr.getEnvironmentBlendMode();T==="additive"?t.buffers.color.setClear(0,0,0,1,r):T==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||R)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(b,R){let S=f(R);S&&(S.isCubeTexture||S.mapping===Ur)?(l===void 0&&(l=new dt(new Pi(1,1,1),new bn({name:"BackgroundCubeMaterial",uniforms:ss(ni.backgroundCube.uniforms),vertexShader:ni.backgroundCube.vertexShader,fragmentShader:ni.backgroundCube.fragmentShader,side:en,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(T,y,A){this.matrixWorld.copyPosition(A.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=S,l.material.uniforms.backgroundBlurriness.value=R.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=R.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(pp.makeRotationFromEuler(R.backgroundRotation)).transpose(),S.isCubeTexture&&S.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply($h),l.material.toneMapped=je.getTransfer(S.colorSpace)!==gt,(h!==S||u!==S.version||d!==i.toneMapping)&&(l.material.needsUpdate=!0,h=S,u=S.version,d=i.toneMapping),l.layers.enableAll(),b.unshift(l,l.geometry,l.material,0,0,null)):S&&S.isTexture&&(c===void 0&&(c=new dt(new $i(2,2),new bn({name:"BackgroundMaterial",uniforms:ss(ni.background.uniforms),vertexShader:ni.background.vertexShader,fragmentShader:ni.background.fragmentShader,side:Qn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=S,c.material.uniforms.backgroundIntensity.value=R.backgroundIntensity,c.material.toneMapped=je.getTransfer(S.colorSpace)!==gt,S.matrixAutoUpdate===!0&&S.updateMatrix(),c.material.uniforms.uvTransform.value.copy(S.matrix),(h!==S||u!==S.version||d!==i.toneMapping)&&(c.material.needsUpdate=!0,h=S,u=S.version,d=i.toneMapping),c.layers.enableAll(),b.unshift(c,c.geometry,c.material,0,0,null))}function m(b,R){b.getRGB(Va,ol(i)),t.buffers.color.setClear(Va.r,Va.g,Va.b,R,r)}function p(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(b,R=1){o.set(b),a=R,m(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(b){a=b,m(o,a)},render:g,addToRenderList:v,dispose:p}}function gp(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null),r=s,o=!1;function a(D,L,N,I,k){let G=!1,V=u(D,I,N,L);r!==V&&(r=V,l(r.object)),G=f(D,I,N,k),G&&g(D,I,N,k),k!==null&&e.update(k,i.ELEMENT_ARRAY_BUFFER),(G||o)&&(o=!1,S(D,L,N,I),k!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(k).buffer))}function c(){return i.createVertexArray()}function l(D){return i.bindVertexArray(D)}function h(D){return i.deleteVertexArray(D)}function u(D,L,N,I){let k=I.wireframe===!0,G=n[L.id];G===void 0&&(G={},n[L.id]=G);let V=D.isInstancedMesh===!0?D.id:0,Q=G[V];Q===void 0&&(Q={},G[V]=Q);let W=Q[N.id];W===void 0&&(W={},Q[N.id]=W);let O=W[k];return O===void 0&&(O=d(c()),W[k]=O),O}function d(D){let L=[],N=[],I=[];for(let k=0;k<t;k++)L[k]=0,N[k]=0,I[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:N,attributeDivisors:I,object:D,attributes:{},index:null}}function f(D,L,N,I){let k=r.attributes,G=L.attributes,V=0,Q=N.getAttributes();for(let W in Q)if(Q[W].location>=0){let Z=k[W],le=G[W];if(le===void 0&&(W==="instanceMatrix"&&D.instanceMatrix&&(le=D.instanceMatrix),W==="instanceColor"&&D.instanceColor&&(le=D.instanceColor)),Z===void 0||Z.attribute!==le||le&&Z.data!==le.data)return!0;V++}return r.attributesNum!==V||r.index!==I}function g(D,L,N,I){let k={},G=L.attributes,V=0,Q=N.getAttributes();for(let W in Q)if(Q[W].location>=0){let Z=G[W];Z===void 0&&(W==="instanceMatrix"&&D.instanceMatrix&&(Z=D.instanceMatrix),W==="instanceColor"&&D.instanceColor&&(Z=D.instanceColor));let le={};le.attribute=Z,Z&&Z.data&&(le.data=Z.data),k[W]=le,V++}r.attributes=k,r.attributesNum=V,r.index=I}function v(){let D=r.newAttributes;for(let L=0,N=D.length;L<N;L++)D[L]=0}function m(D){p(D,0)}function p(D,L){let N=r.newAttributes,I=r.enabledAttributes,k=r.attributeDivisors;N[D]=1,I[D]===0&&(i.enableVertexAttribArray(D),I[D]=1),k[D]!==L&&(i.vertexAttribDivisor(D,L),k[D]=L)}function b(){let D=r.newAttributes,L=r.enabledAttributes;for(let N=0,I=L.length;N<I;N++)L[N]!==D[N]&&(i.disableVertexAttribArray(N),L[N]=0)}function R(D,L,N,I,k,G,V){V===!0?i.vertexAttribIPointer(D,L,N,k,G):i.vertexAttribPointer(D,L,N,I,k,G)}function S(D,L,N,I){v();let k=I.attributes,G=N.getAttributes(),V=L.defaultAttributeValues;for(let Q in G){let W=G[Q];if(W.location>=0){let O=k[Q];if(O===void 0&&(Q==="instanceMatrix"&&D.instanceMatrix&&(O=D.instanceMatrix),Q==="instanceColor"&&D.instanceColor&&(O=D.instanceColor)),O!==void 0){let Z=O.normalized,le=O.itemSize,Me=e.get(O);if(Me===void 0)continue;let ie=Me.buffer,oe=Me.type,re=Me.bytesPerElement,X=oe===i.INT||oe===i.UNSIGNED_INT||O.gpuType===na;if(O.isInterleavedBufferAttribute){let j=O.data,z=j.stride,xe=O.offset;if(j.isInstancedInterleavedBuffer){for(let he=0;he<W.locationSize;he++)p(W.location+he,j.meshPerAttribute);D.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let he=0;he<W.locationSize;he++)m(W.location+he);i.bindBuffer(i.ARRAY_BUFFER,ie);for(let he=0;he<W.locationSize;he++)R(W.location+he,le/W.locationSize,oe,Z,z*re,(xe+le/W.locationSize*he)*re,X)}else{if(O.isInstancedBufferAttribute){for(let j=0;j<W.locationSize;j++)p(W.location+j,O.meshPerAttribute);D.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=O.meshPerAttribute*O.count)}else for(let j=0;j<W.locationSize;j++)m(W.location+j);i.bindBuffer(i.ARRAY_BUFFER,ie);for(let j=0;j<W.locationSize;j++)R(W.location+j,le/W.locationSize,oe,Z,le*re,le/W.locationSize*j*re,X)}}else if(V!==void 0){let Z=V[Q];if(Z!==void 0)switch(Z.length){case 2:i.vertexAttrib2fv(W.location,Z);break;case 3:i.vertexAttrib3fv(W.location,Z);break;case 4:i.vertexAttrib4fv(W.location,Z);break;default:i.vertexAttrib1fv(W.location,Z)}}}}b()}function T(){w();for(let D in n){let L=n[D];for(let N in L){let I=L[N];for(let k in I){let G=I[k];for(let V in G)h(G[V].object),delete G[V];delete I[k]}}delete n[D]}}function y(D){if(n[D.id]===void 0)return;let L=n[D.id];for(let N in L){let I=L[N];for(let k in I){let G=I[k];for(let V in G)h(G[V].object),delete G[V];delete I[k]}}delete n[D.id]}function A(D){for(let L in n){let N=n[L];for(let I in N){let k=N[I];if(k[D.id]===void 0)continue;let G=k[D.id];for(let V in G)h(G[V].object),delete G[V];delete k[D.id]}}}function _(D){for(let L in n){let N=n[L],I=D.isInstancedMesh===!0?D.id:0,k=N[I];if(k!==void 0){for(let G in k){let V=k[G];for(let Q in V)h(V[Q].object),delete V[Q];delete k[G]}delete N[I],Object.keys(N).length===0&&delete n[L]}}}function w(){C(),o=!0,r!==s&&(r=s,l(r.object))}function C(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:w,resetDefaultState:C,dispose:T,releaseStatesOfGeometry:y,releaseStatesOfObject:_,releaseStatesOfProgram:A,initAttributes:v,enableAttribute:m,disableUnusedAttributes:b}}function _p(i,e,t){let n;function s(c){n=c}function r(c,l){i.drawArrays(n,c,l),t.update(l,n,1)}function o(c,l,h){h!==0&&(i.drawArraysInstanced(n,c,l,h),t.update(l,n,h))}function a(c,l,h){if(h===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,l,0,h);let d=0;for(let f=0;f<h;f++)d+=l[f];t.update(d,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function xp(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let A=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(A.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(A){return!(A!==Tn&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(A){let _=A===Gn&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(A!==vn&&A!==wn&&!_&&n.convert(A)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function c(A){if(A==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";A="mediump"}return A==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",h=c(l);h!==l&&(Be("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);let u=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&d===!1&&Be("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),b=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),R=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),T=i.getParameter(i.MAX_SAMPLES),y=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:v,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:b,maxVaryings:R,maxFragmentUniforms:S,maxSamples:T,samples:y}}function yp(i){let e=this,t=null,n=0,s=!1,r=!1,o=new Un,a=new We,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){let f=u.length!==0||d||n!==0||s;return s=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){let g=u.clippingPlanes,v=u.clipIntersection,m=u.clipShadows,p=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):l();else{let b=r?0:n,R=b*4,S=p.clippingState||null;c.value=S,S=h(g,d,R,f);for(let T=0;T!==R;++T)S[T]=t[T];p.clippingState=S,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=b}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,f,g){let v=u!==null?u.length:0,m=null;if(v!==0){if(m=c.value,g!==!0||m===null){let p=f+v*4,b=d.matrixWorldInverse;a.getNormalMatrix(b),(m===null||m.length<p)&&(m=new Float32Array(p));for(let R=0,S=f;R!==v;++R,S+=4)o.copy(u[R]).applyMatrix4(b,a),o.normal.toArray(m,S),m[S+3]=o.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,m}}var Zs=4,vp=6,Mp=20,Sp=256,Wr=new jn,Ch=new ke,hl=null,ul=0,dl=0,fl=!1,bp=new P,rs=new P,Js=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:o=256,position:a=bp}=r;hl=this._renderer.getRenderTarget(),ul=this._renderer.getActiveCubeFace(),dl=this._renderer.getActiveMipmapLevel(),fl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,s,c,a),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Lh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ph(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(hl,ul,dl),this._renderer.xr.enabled=fl,e.scissorTest=!1,Ys(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ni||e.mapping===ns?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),hl=this._renderer.getRenderTarget(),ul=this._renderer.getActiveCubeFace(),dl=this._renderer.getActiveMipmapLevel(),fl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Ot,minFilter:Ot,generateMipmaps:!1,type:Gn,format:Tn,colorSpace:dn,depthBuffer:!1},s=Ih(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ih(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=wp(r)),this._blurMaterial=Ap(r,e,t),this._ggxMaterial=Tp(r,e,t)}return s}_compileMaterial(e){let t=new dt(new qt,e);this._renderer.compile(t,Wr)}_sceneToCubeUV(e,t,n,s,r){let c=new jt(90,1,t,n),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(Ch),u.toneMapping=kn,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new dt(new Pi,new zn({name:"PMREM.Background",side:en,depthWrite:!1,depthTest:!1})));let v=this._backgroundBox,m=v.material,p=!1,b=e.background;b?b.isColor&&(m.color.copy(b),e.background=null,p=!0):(m.color.copy(Ch),p=!0);for(let R=0;R<6;R++){let S=R%3;S===0?(c.up.set(0,l[R],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+h[R],r.y,r.z)):S===1?(c.up.set(0,0,l[R]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+h[R],r.z)):(c.up.set(0,l[R],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+h[R]));let T=this._cubeSize;Ys(s,S*T,R>2?T:0,T,T),u.setRenderTarget(s),p&&u.render(v,c),u.render(e,c)}u.toneMapping=f,u.autoClear=d,e.background=b}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===Ni||e.mapping===ns;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Lh()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ph());let r=s?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;let a=r.uniforms;a.envMap.value=e;let c=this._cubeSize;Ys(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(o,Wr)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;let c=o.uniforms,l=n/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),u=Math.sqrt(l*l-h*h),d=l*1.25,f=u*d,{_lodMax:g}=this,v=this._sizeLods[n],m=3*v*(n>g-Zs?n-g+Zs:0),p=4*(this._cubeSize-v);c.envMap.value=e.texture,c.roughness.value=f,c.mipInt.value=g-t,Ys(r,m,p,3*v,2*v),s.setRenderTarget(r),s.render(a,Wr),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=g-n,Ys(e,m,p,3*v,2*v),s.setRenderTarget(e),s.render(a,Wr)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,o=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,o),this._blurPass(r,e,n,n,o)}_blurPass(e,t,n,s,r){let o=this._renderer,a=this._blurMaterial,c=this._lodMeshes[s];c.material=a;let l=a.uniforms;l.envMap.value=e.texture,l.sigma.value=r,l.mipInt.value=this._lodMax-n;let h=this._sizeLods[s],u=3*h*(s>this._lodMax-Zs?s-this._lodMax+Zs:0),d=4*(this._cubeSize-h);Ys(t,u,d,3*h,2*h),o.setRenderTarget(t),o.render(c,Wr)}};function wp(i){let e=[],t=[],n=i,s=i-Zs+1+vp;for(let r=0;r<s;r++){let o=Math.pow(2,n);e.push(o);let a=1/(o-2),c=-a,l=1+a,h=[c,c,l,c,l,l,c,c,l,l,c,l],u=6,d=6,f=3,g=new Float32Array(f*d*u),v=new Float32Array(f*d*u);for(let p=0;p<u;p++){let b=p%3*2/3-1,R=p>2?0:-1,S=[b,R,0,b+2/3,R,0,b+2/3,R+1,0,b,R,0,b+2/3,R+1,0,b,R+1,0];g.set(S,f*d*p);for(let T=0;T<d;T++){let y=h[T*2]*2-1,A=h[T*2+1]*2-1;p===0?rs.set(1,A,y):p===1?rs.set(-y,1,-A):p===2?rs.set(-y,A,1):p===3?rs.set(-1,A,-y):p===4?rs.set(-y,-1,A):rs.set(y,A,-1),rs.toArray(v,(p*d+T)*f)}}let m=new qt;m.setAttribute("position",new Xt(g,f)),m.setAttribute("outputDirection",new Xt(v,f)),t.push(new dt(m,null)),n>Zs&&n--}return{lodMeshes:t,sizeLods:e}}function Ih(i,e,t){let n=new pn(i,e,t);return n.texture.mapping=Ur,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ys(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Tp(i,e,t){return new bn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Sp,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Xa(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:ei,depthTest:!1,depthWrite:!1})}function Ap(i,e,t){return new bn({name:"SphericalGaussianBlur",defines:{SAMPLES:Mp,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Xa(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:ei,depthTest:!1,depthWrite:!1})}function Ph(){return new bn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Xa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:ei,depthTest:!1,depthWrite:!1})}function Lh(){return new bn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Xa(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:ei,depthTest:!1,depthWrite:!1})}function Xa(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Ga=class extends pn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Mr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Pi(5,5,5),r=new bn({name:"CubemapFromEquirect",uniforms:ss(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:en,blending:ei});r.uniforms.tEquirect.value=t;let o=new dt(s,r),a=t.minFilter;return t.minFilter===Vn&&(t.minFilter=Ot),new Ko(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}};function Ep(i){let e=new WeakMap,t=new WeakMap,n=null;function s(d,f=!1){return d==null?null:f?o(d):r(d)}function r(d){if(d&&d.isTexture){let f=d.mapping;if(f===Qo||f===ea)if(e.has(d)){let g=e.get(d).texture;return a(g,d.mapping)}else{let g=d.image;if(g&&g.height>0){let v=new Ga(g.height);return v.fromEquirectangularTexture(i,d),e.set(d,v),d.addEventListener("dispose",l),a(v.texture,d.mapping)}else return null}}return d}function o(d){if(d&&d.isTexture){let f=d.mapping,g=f===Qo||f===ea,v=f===Ni||f===ns;if(g||v){let m=t.get(d),p=m!==void 0?m.texture.pmremVersion:0;if(d.isRenderTargetTexture&&d.pmremVersion!==p)return n===null&&(n=new Js(i)),m=g?n.fromEquirectangular(d,m):n.fromCubemap(d,m),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),m.texture;if(m!==void 0)return m.texture;{let b=d.image;return g&&b&&b.height>0||v&&b&&c(b)?(n===null&&(n=new Js(i)),m=g?n.fromEquirectangular(d):n.fromCubemap(d),m.texture.pmremVersion=d.pmremVersion,t.set(d,m),d.addEventListener("dispose",h),m.texture):null}}}return d}function a(d,f){return f===Qo?d.mapping=Ni:f===ea&&(d.mapping=ns),d}function c(d){let f=0,g=6;for(let v=0;v<g;v++)d[v]!==void 0&&f++;return f===g}function l(d){let f=d.target;f.removeEventListener("dispose",l);let g=e.get(f);g!==void 0&&(e.delete(f),g.dispose())}function h(d){let f=d.target;f.removeEventListener("dispose",h);let g=t.get(f);g!==void 0&&(t.delete(f),g.dispose())}function u(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:u}}function Rp(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&Gi("WebGLRenderer: "+n+" extension not supported."),s}}}function Cp(i,e,t,n){let s={},r=new WeakMap;function o(u){let d=u.target;d.index!==null&&e.remove(d.index);for(let g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete s[d.id];let f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(u,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,t.memory.geometries++),d}function c(u){let d=u.attributes;for(let f in d)e.update(d[f],i.ARRAY_BUFFER)}function l(u){let d=[],f=u.index,g=u.attributes.position,v=0;if(g===void 0)return;if(f!==null){let b=f.array;v=f.version;for(let R=0,S=b.length;R<S;R+=3){let T=b[R+0],y=b[R+1],A=b[R+2];d.push(T,y,y,A,A,T)}}else{let b=g.array;v=g.version;for(let R=0,S=b.length/3-1;R<S;R+=3){let T=R+0,y=R+1,A=R+2;d.push(T,y,y,A,A,T)}}let m=new(g.count>=65535?mr:pr)(d,1);m.version=v;let p=r.get(u);p&&e.remove(p),r.set(u,m)}function h(u){let d=r.get(u);if(d){let f=u.index;f!==null&&d.version<f.version&&l(u)}else l(u);return r.get(u)}return{get:a,update:c,getWireframeAttribute:h}}function Ip(i,e,t){let n;function s(u){n=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function c(u,d){i.drawElements(n,d,r,u*o),t.update(d,n,1)}function l(u,d,f){f!==0&&(i.drawElementsInstanced(n,d,r,u*o,f),t.update(d,n,f))}function h(u,d,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,u,0,f);let v=0;for(let m=0;m<f;m++)v+=d[m];t.update(v,n,1)}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h}function Pp(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:Ge("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Lp(i,e,t){let n=new WeakMap,s=new vt;function r(o,a,c){let l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,d=n.get(a);if(d===void 0||d.count!==u){let w=function(){A.dispose(),n.delete(a),a.removeEventListener("dispose",w)};d!==void 0&&d.texture.dispose();let f=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,v=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],p=a.morphAttributes.normal||[],b=a.morphAttributes.color||[],R=0;f===!0&&(R=1),g===!0&&(R=2),v===!0&&(R=3);let S=a.attributes.position.count*R,T=1;S>e.maxTextureSize&&(T=Math.ceil(S/e.maxTextureSize),S=e.maxTextureSize);let y=new Float32Array(S*T*4*u),A=new dr(y,S,T,u);A.type=wn,A.needsUpdate=!0;let _=R*4;for(let C=0;C<u;C++){let D=m[C],L=p[C],N=b[C],I=S*T*4*C;for(let k=0;k<D.count;k++){let G=k*_;f===!0&&(s.fromBufferAttribute(D,k),y[I+G+0]=s.x,y[I+G+1]=s.y,y[I+G+2]=s.z,y[I+G+3]=0),g===!0&&(s.fromBufferAttribute(L,k),y[I+G+4]=s.x,y[I+G+5]=s.y,y[I+G+6]=s.z,y[I+G+7]=0),v===!0&&(s.fromBufferAttribute(N,k),y[I+G+8]=s.x,y[I+G+9]=s.y,y[I+G+10]=s.z,y[I+G+11]=N.itemSize===4?s.w:1)}}d={count:u,texture:A,size:new Ze(S,T)},n.set(a,d),a.addEventListener("dispose",w)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let f=0;for(let v=0;v<l.length;v++)f+=l[v];let g=a.morphTargetsRelative?1:1-f;c.getUniforms().setValue(i,"morphTargetBaseInfluence",g),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",d.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function Np(i,e,t,n,s){let r=new WeakMap;function o(l){let h=s.render.frame,u=l.geometry,d=e.get(l,u);if(r.get(d)!==h&&(e.update(d),r.set(d,h)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==h&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,h))),l.isSkinnedMesh){let f=l.skeleton;r.get(f)!==h&&(f.update(),r.set(f,h))}return d}function a(){r=new WeakMap}function c(l){let h=l.target;h.removeEventListener("dispose",c),n.releaseStatesOfObject(h),t.remove(h.instanceMatrix),h.instanceColor!==null&&t.remove(h.instanceColor)}return{update:o,dispose:a}}var Dp={[H0]:"LINEAR_TONE_MAPPING",[G0]:"REINHARD_TONE_MAPPING",[W0]:"CINEON_TONE_MAPPING",[Dr]:"ACES_FILMIC_TONE_MAPPING",[q0]:"AGX_TONE_MAPPING",[Y0]:"NEUTRAL_TONE_MAPPING",[X0]:"CUSTOM_TONE_MAPPING"};function Up(i,e,t,n,s,r){let o=new pn(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),a=null,c=null,l=new qt;l.setAttribute("position",new Ut([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new Ut([0,2,0,0,2,0],2));let h=new zo({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),u=new dt(l,h),d=new jn(-1,1,1,-1,0,1),f=null,g=null,v=!1,m,p=null,b=[],R=!1;this.setSize=function(S,T){o.setSize(S,T),a!==null&&a.setSize(S,T),c!==null&&c.setSize(S,T);for(let y=0;y<b.length;y++){let A=b[y];A.setSize&&A.setSize(S,T)}},this.setEffects=function(S){b=S,R=b.length>0&&b[0].isRenderPass===!0;let T=o.width,y=o.height;b.length>0&&a===null&&(a=new pn(T,y,{type:Gn,depthBuffer:!1,stencilBuffer:!1}),c=new pn(T,y,{type:Gn,depthBuffer:!1,stencilBuffer:!1}));for(let A=0;A<b.length;A++){let _=b[A];_.setSize&&_.setSize(T,y)}},this.begin=function(S,T){if(v||S.toneMapping===kn&&b.length===0)return!1;if(p=T,T!==null){let y=T.width,A=T.height;(o.width!==y||o.height!==A)&&this.setSize(y,A)}return R===!1&&S.setRenderTarget(o),m=S.toneMapping,S.toneMapping=kn,!0},this.hasRenderPass=function(){return R},this.end=function(S,T){S.toneMapping=m,v=!0;let y=o,A=a;for(let _=0;_<b.length;_++){let w=b[_];w.enabled!==!1&&(w.render(S,A,y,T),w.needsSwap!==!1&&(y=A,A=A===a?c:a))}if(f!==S.outputColorSpace||g!==S.toneMapping){f=S.outputColorSpace,g=S.toneMapping,h.defines={},je.getTransfer(f)===gt&&(h.defines.SRGB_TRANSFER="");let _=Dp[g];_&&(h.defines[_]=""),h.needsUpdate=!0}h.uniforms.tDiffuse.value=y.texture,S.setRenderTarget(p),S.render(u,d),p=null,v=!1},this.isCompositing=function(){return v},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),c!==null&&c.dispose(),l.dispose(),h.dispose()}}var jh=new Qt,gl=new Ii(1,1),Qh=new dr,eu=new Uo,tu=new Mr,Nh=[],Dh=[],Uh=new Float32Array(16),Fh=new Float32Array(9),Oh=new Float32Array(4);function $s(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=Nh[s];if(r===void 0&&(r=new Float32Array(s),Nh[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Yt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Zt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function qa(i,e){let t=Dh[e];t===void 0&&(t=new Int32Array(e),Dh[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Fp(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Op(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Yt(t,e))return;i.uniform2fv(this.addr,e),Zt(t,e)}}function Bp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Yt(t,e))return;i.uniform3fv(this.addr,e),Zt(t,e)}}function zp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Yt(t,e))return;i.uniform4fv(this.addr,e),Zt(t,e)}}function kp(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Yt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Zt(t,e)}else{if(Yt(t,n))return;Oh.set(n),i.uniformMatrix2fv(this.addr,!1,Oh),Zt(t,n)}}function Vp(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Yt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Zt(t,e)}else{if(Yt(t,n))return;Fh.set(n),i.uniformMatrix3fv(this.addr,!1,Fh),Zt(t,n)}}function Hp(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Yt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Zt(t,e)}else{if(Yt(t,n))return;Uh.set(n),i.uniformMatrix4fv(this.addr,!1,Uh),Zt(t,n)}}function Gp(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Wp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Yt(t,e))return;i.uniform2iv(this.addr,e),Zt(t,e)}}function Xp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Yt(t,e))return;i.uniform3iv(this.addr,e),Zt(t,e)}}function qp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Yt(t,e))return;i.uniform4iv(this.addr,e),Zt(t,e)}}function Yp(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Zp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Yt(t,e))return;i.uniform2uiv(this.addr,e),Zt(t,e)}}function Kp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Yt(t,e))return;i.uniform3uiv(this.addr,e),Zt(t,e)}}function Jp(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Yt(t,e))return;i.uniform4uiv(this.addr,e),Zt(t,e)}}function $p(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(gl.compareFunction=t.isReversedDepthBuffer()?ka:za,r=gl):r=jh,t.setTexture2D(e||r,s)}function jp(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||eu,s)}function Qp(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||tu,s)}function e2(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Qh,s)}function t2(i){switch(i){case 5126:return Fp;case 35664:return Op;case 35665:return Bp;case 35666:return zp;case 35674:return kp;case 35675:return Vp;case 35676:return Hp;case 5124:case 35670:return Gp;case 35667:case 35671:return Wp;case 35668:case 35672:return Xp;case 35669:case 35673:return qp;case 5125:return Yp;case 36294:return Zp;case 36295:return Kp;case 36296:return Jp;case 35678:case 36198:case 36298:case 36306:case 35682:return $p;case 35679:case 36299:case 36307:return jp;case 35680:case 36300:case 36308:case 36293:return Qp;case 36289:case 36303:case 36311:case 36292:return e2}}function n2(i,e){i.uniform1fv(this.addr,e)}function i2(i,e){let t=$s(e,this.size,2);i.uniform2fv(this.addr,t)}function s2(i,e){let t=$s(e,this.size,3);i.uniform3fv(this.addr,t)}function r2(i,e){let t=$s(e,this.size,4);i.uniform4fv(this.addr,t)}function o2(i,e){let t=$s(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function a2(i,e){let t=$s(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function l2(i,e){let t=$s(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function c2(i,e){i.uniform1iv(this.addr,e)}function h2(i,e){i.uniform2iv(this.addr,e)}function u2(i,e){i.uniform3iv(this.addr,e)}function d2(i,e){i.uniform4iv(this.addr,e)}function f2(i,e){i.uniform1uiv(this.addr,e)}function p2(i,e){i.uniform2uiv(this.addr,e)}function m2(i,e){i.uniform3uiv(this.addr,e)}function g2(i,e){i.uniform4uiv(this.addr,e)}function _2(i,e,t){let n=this.cache,s=e.length,r=qa(t,s);Yt(n,r)||(i.uniform1iv(this.addr,r),Zt(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=gl:o=jh;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function x2(i,e,t){let n=this.cache,s=e.length,r=qa(t,s);Yt(n,r)||(i.uniform1iv(this.addr,r),Zt(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||eu,r[o])}function y2(i,e,t){let n=this.cache,s=e.length,r=qa(t,s);Yt(n,r)||(i.uniform1iv(this.addr,r),Zt(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||tu,r[o])}function v2(i,e,t){let n=this.cache,s=e.length,r=qa(t,s);Yt(n,r)||(i.uniform1iv(this.addr,r),Zt(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Qh,r[o])}function M2(i){switch(i){case 5126:return n2;case 35664:return i2;case 35665:return s2;case 35666:return r2;case 35674:return o2;case 35675:return a2;case 35676:return l2;case 5124:case 35670:return c2;case 35667:case 35671:return h2;case 35668:case 35672:return u2;case 35669:case 35673:return d2;case 5125:return f2;case 36294:return p2;case 36295:return m2;case 36296:return g2;case 35678:case 36198:case 36298:case 36306:case 35682:return _2;case 35679:case 36299:case 36307:return x2;case 35680:case 36300:case 36308:case 36293:return y2;case 36289:case 36303:case 36311:case 36292:return v2}}var _l=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=t2(t.type)}},xl=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=M2(t.type)}},yl=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},pl=/(\w+)(\])?(\[|\.)?/g;function Bh(i,e){i.seq.push(e),i.map[e.id]=e}function S2(i,e,t){let n=i.name,s=n.length;for(pl.lastIndex=0;;){let r=pl.exec(n),o=pl.lastIndex,a=r[1],c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){Bh(t,l===void 0?new _l(a,i,e):new xl(a,i,e));break}else{let u=t.map[a];u===void 0&&(u=new yl(a),Bh(t,u)),t=u}}}var Ks=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){let a=e.getActiveUniform(t,o),c=e.getUniformLocation(t,a.name);S2(a,c,this)}let s=[],r=[];for(let o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function zh(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var b2=37297,w2=0;function T2(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var kh=new We;function A2(i){je._getMatrix(kh,je.workingColorSpace,i);let e=`mat3( ${kh.elements.map(t=>t.toFixed(4))} )`;switch(je.getTransfer(i)){case hr:return[e,"LinearTransferOETF"];case gt:return[e,"sRGBTransferOETF"];default:return Be("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Vh(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+T2(i.getShaderSource(e),a)}else return r}function E2(i,e){let t=A2(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var R2={[H0]:"Linear",[G0]:"Reinhard",[W0]:"Cineon",[Dr]:"ACESFilmic",[q0]:"AgX",[Y0]:"Neutral",[X0]:"Custom"};function C2(i,e){let t=R2[e];return t===void 0?(Be("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var Ha=new P;function I2(){je.getLuminanceCoefficients(Ha);let i=Ha.x.toFixed(4),e=Ha.y.toFixed(4),t=Ha.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function P2(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(qr).join(`
`)}function L2(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function N2(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function qr(i){return i!==""}function Hh(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Gh(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var D2=/^[ \t]*#include +<([\w\d./]+)>/gm;function vl(i){return i.replace(D2,F2)}var U2=new Map;function F2(i,e){let t=$e[e];if(t===void 0){let n=U2.get(e);if(n!==void 0)t=$e[n],Be('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return vl(t)}var O2=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Wh(i){return i.replace(O2,B2)}function B2(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Xh(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var z2={[Nr]:"SHADOWMAP_TYPE_PCF",[Vs]:"SHADOWMAP_TYPE_VSM"};function k2(i){return z2[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var V2={[Ni]:"ENVMAP_TYPE_CUBE",[ns]:"ENVMAP_TYPE_CUBE",[Ur]:"ENVMAP_TYPE_CUBE_UV"};function H2(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":V2[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var G2={[ns]:"ENVMAP_MODE_REFRACTION"};function W2(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":G2[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var X2={[jo]:"ENVMAP_BLENDING_MULTIPLY",[lh]:"ENVMAP_BLENDING_MIX",[ch]:"ENVMAP_BLENDING_ADD"};function q2(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":X2[i.combine]||"ENVMAP_BLENDING_NONE"}function Y2(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function Z2(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,c=k2(t),l=H2(t),h=W2(t),u=q2(t),d=Y2(t),f=P2(t),g=L2(r),v=s.createProgram(),m,p,b=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(qr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(qr).join(`
`),p.length>0&&(p+=`
`)):(m=[Xh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(qr).join(`
`),p=[Xh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==kn?"#define TONE_MAPPING":"",t.toneMapping!==kn?$e.tonemapping_pars_fragment:"",t.toneMapping!==kn?C2("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",$e.colorspace_pars_fragment,E2("linearToOutputTexel",t.outputColorSpace),I2(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(qr).join(`
`)),o=vl(o),o=Hh(o,t),o=Gh(o,t),a=vl(a),a=Hh(a,t),a=Gh(a,t),o=Wh(o),a=Wh(a),t.isRawShaderMaterial!==!0&&(b=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===il?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===il?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let R=b+m+o,S=b+p+a,T=zh(s,s.VERTEX_SHADER,R),y=zh(s,s.FRAGMENT_SHADER,S);s.attachShader(v,T),s.attachShader(v,y),t.index0AttributeName!==void 0?s.bindAttribLocation(v,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(v,0,"position"),s.linkProgram(v);function A(D){if(i.debug.checkShaderErrors){let L=s.getProgramInfoLog(v)||"",N=s.getShaderInfoLog(T)||"",I=s.getShaderInfoLog(y)||"",k=L.trim(),G=N.trim(),V=I.trim(),Q=!0,W=!0;if(s.getProgramParameter(v,s.LINK_STATUS)===!1)if(Q=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,v,T,y);else{let O=Vh(s,T,"vertex"),Z=Vh(s,y,"fragment");Ge("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(v,s.VALIDATE_STATUS)+`

Material Name: `+D.name+`
Material Type: `+D.type+`

Program Info Log: `+k+`
`+O+`
`+Z)}else k!==""?Be("WebGLProgram: Program Info Log:",k):(G===""||V==="")&&(W=!1);W&&(D.diagnostics={runnable:Q,programLog:k,vertexShader:{log:G,prefix:m},fragmentShader:{log:V,prefix:p}})}s.deleteShader(T),s.deleteShader(y),_=new Ks(s,v),w=N2(s,v)}let _;this.getUniforms=function(){return _===void 0&&A(this),_};let w;this.getAttributes=function(){return w===void 0&&A(this),w};let C=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return C===!1&&(C=s.getProgramParameter(v,b2)),C},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(v),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=w2++,this.cacheKey=e,this.usedTimes=1,this.program=v,this.vertexShader=T,this.fragmentShader=y,this}var K2=0,Ml=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Sl(e),t.set(e,n)),n}},Sl=class{constructor(e){this.id=K2++,this.code=e,this.usedTimes=0}};function J2(i){return i===Ui||i===kr||i===Vr}function $2(i,e,t,n,s,r){let o=new fr,a=new Ml,c=new Set,l=[],h=new Map,u=n.logarithmicDepthBuffer,d=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function g(_){return c.add(_),_===0?"uv":`uv${_}`}function v(_,w,C,D,L,N){let I=D.fog,k=L.geometry,G=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?D.environment:null,V=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,Q=e.get(_.envMap||G,V),W=Q&&Q.mapping===Ur?Q.image.height:null,O=f[_.type];_.precision!==null&&(d=n.getMaxPrecision(_.precision),d!==_.precision&&Be("WebGLProgram.getParameters:",_.precision,"not supported, using",d,"instead."));let Z=k.morphAttributes.position||k.morphAttributes.normal||k.morphAttributes.color,le=Z!==void 0?Z.length:0,Me=0;k.morphAttributes.position!==void 0&&(Me=1),k.morphAttributes.normal!==void 0&&(Me=2),k.morphAttributes.color!==void 0&&(Me=3);let ie,oe,re,X;if(O){let pt=ni[O];ie=pt.vertexShader,oe=pt.fragmentShader}else{ie=_.vertexShader,oe=_.fragmentShader;let pt=a.getVertexShaderStage(_),J=a.getFragmentShaderStage(_);a.update(_,pt,J),re=pt.id,X=J.id}let j=i.getRenderTarget(),z=i.state.buffers.depth.getReversed(),xe=L.isInstancedMesh===!0,he=L.isBatchedMesh===!0,Le=!!_.map,st=!!_.matcap,Ve=!!Q,Xe=!!_.aoMap,ct=!!_.lightMap,Ye=!!_.bumpMap&&_.wireframe===!1,ft=!!_.normalMap,Ct=!!_.displacementMap,Vt=!!_.emissiveMap,Tt=!!_.metalnessMap,Pt=!!_.roughnessMap,B=_.anisotropy>0,Ht=_.clearcoat>0,ht=_.dispersion>0,E=_.retroreflectivity>0,x=_.iridescence>0,H=_.sheen>0,K=_.transmission>0,ee=B&&!!_.anisotropyMap,ue=Ht&&!!_.clearcoatMap,fe=Ht&&!!_.clearcoatNormalMap,te=Ht&&!!_.clearcoatRoughnessMap,ne=x&&!!_.iridescenceMap,de=x&&!!_.iridescenceThicknessMap,Ne=H&&!!_.sheenColorMap,_e=H&&!!_.sheenRoughnessMap,pe=!!_.specularMap,Ae=!!_.specularColorMap,ze=!!_.specularIntensityMap,qe=K&&!!_.transmissionMap,F=K&&!!_.thicknessMap,ge=!!_.gradientMap,se=!!_.alphaMap,me=_.alphaTest>0,ye=!!_.alphaHash,ae=!!_.extensions,Oe=kn;_.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Oe=i.toneMapping);let Re={shaderID:O,shaderType:_.type,shaderName:_.name,vertexShader:ie,fragmentShader:oe,defines:_.defines,customVertexShaderID:re,customFragmentShaderID:X,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:d,batching:he,batchingColor:he&&L._colorsTexture!==null,instancing:xe,instancingColor:xe&&L.instanceColor!==null,instancingMorph:xe&&L.morphTexture!==null,outputColorSpace:j===null?i.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:je.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:Le,matcap:st,envMap:Ve,envMapMode:Ve&&Q.mapping,envMapCubeUVHeight:W,aoMap:Xe,lightMap:ct,bumpMap:Ye,normalMap:ft,displacementMap:Ct,emissiveMap:Vt,normalMapObjectSpace:ft&&_.normalMapType===fh,normalMapTangentSpace:ft&&_.normalMapType===Gr,packedNormalMap:ft&&_.normalMapType===Gr&&J2(_.normalMap.format),metalnessMap:Tt,roughnessMap:Pt,anisotropy:B,anisotropyMap:ee,clearcoat:Ht,clearcoatMap:ue,clearcoatNormalMap:fe,clearcoatRoughnessMap:te,dispersion:ht,retroreflection:E,iridescence:x,iridescenceMap:ne,iridescenceThicknessMap:de,sheen:H,sheenColorMap:Ne,sheenRoughnessMap:_e,specularMap:pe,specularColorMap:Ae,specularIntensityMap:ze,transmission:K,transmissionMap:qe,thicknessMap:F,gradientMap:ge,opaque:_.transparent===!1&&_.blending===Hs&&_.alphaToCoverage===!1,alphaMap:se,alphaTest:me,alphaHash:ye,combine:_.combine,mapUv:Le&&g(_.map.channel),aoMapUv:Xe&&g(_.aoMap.channel),lightMapUv:ct&&g(_.lightMap.channel),bumpMapUv:Ye&&g(_.bumpMap.channel),normalMapUv:ft&&g(_.normalMap.channel),displacementMapUv:Ct&&g(_.displacementMap.channel),emissiveMapUv:Vt&&g(_.emissiveMap.channel),metalnessMapUv:Tt&&g(_.metalnessMap.channel),roughnessMapUv:Pt&&g(_.roughnessMap.channel),anisotropyMapUv:ee&&g(_.anisotropyMap.channel),clearcoatMapUv:ue&&g(_.clearcoatMap.channel),clearcoatNormalMapUv:fe&&g(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:te&&g(_.clearcoatRoughnessMap.channel),iridescenceMapUv:ne&&g(_.iridescenceMap.channel),iridescenceThicknessMapUv:de&&g(_.iridescenceThicknessMap.channel),sheenColorMapUv:Ne&&g(_.sheenColorMap.channel),sheenRoughnessMapUv:_e&&g(_.sheenRoughnessMap.channel),specularMapUv:pe&&g(_.specularMap.channel),specularColorMapUv:Ae&&g(_.specularColorMap.channel),specularIntensityMapUv:ze&&g(_.specularIntensityMap.channel),transmissionMapUv:qe&&g(_.transmissionMap.channel),thicknessMapUv:F&&g(_.thicknessMap.channel),alphaMapUv:se&&g(_.alphaMap.channel),vertexTangents:!!k.attributes.tangent&&(ft||B),vertexNormals:!!k.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!k.attributes.color&&k.attributes.color.itemSize===4,pointsUvs:L.isPoints===!0&&!!k.attributes.uv&&(Le||se),fog:!!I,useFog:_.fog===!0,fogExp2:!!I&&I.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||k.attributes.normal===void 0&&ft===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:z,skinning:L.isSkinnedMesh===!0,hasPositionAttribute:k.attributes.position!==void 0,morphTargets:k.morphAttributes.position!==void 0,morphNormals:k.morphAttributes.normal!==void 0,morphColors:k.morphAttributes.color!==void 0,morphTargetsCount:le,morphTextureStride:Me,numSunLights:w.sun.length,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numSunLightShadows:w.sunShadowMap.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numLightProbeGrids:N.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&C.length>0,shadowMapType:i.shadowMap.type,toneMapping:Oe,decodeVideoTexture:Le&&_.map.isVideoTexture===!0&&je.getTransfer(_.map.colorSpace)===gt,decodeVideoTextureEmissive:Vt&&_.emissiveMap.isVideoTexture===!0&&je.getTransfer(_.emissiveMap.colorSpace)===gt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===yn,flipSided:_.side===en,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:ae&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ae&&_.extensions.multiDraw===!0||he)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Re.vertexUv1s=c.has(1),Re.vertexUv2s=c.has(2),Re.vertexUv3s=c.has(3),c.clear(),Re}function m(_){let w=[];if(_.shaderID?w.push(_.shaderID):(w.push(_.customVertexShaderID),w.push(_.customFragmentShaderID)),_.defines!==void 0)for(let C in _.defines)w.push(C),w.push(_.defines[C]);return _.isRawShaderMaterial===!1&&(p(w,_),b(w,_),w.push(i.outputColorSpace)),w.push(_.customProgramCacheKey),w.join()}function p(_,w){_.push(w.precision),_.push(w.outputColorSpace),_.push(w.envMapMode),_.push(w.envMapCubeUVHeight),_.push(w.mapUv),_.push(w.alphaMapUv),_.push(w.lightMapUv),_.push(w.aoMapUv),_.push(w.bumpMapUv),_.push(w.normalMapUv),_.push(w.displacementMapUv),_.push(w.emissiveMapUv),_.push(w.metalnessMapUv),_.push(w.roughnessMapUv),_.push(w.anisotropyMapUv),_.push(w.clearcoatMapUv),_.push(w.clearcoatNormalMapUv),_.push(w.clearcoatRoughnessMapUv),_.push(w.iridescenceMapUv),_.push(w.iridescenceThicknessMapUv),_.push(w.sheenColorMapUv),_.push(w.sheenRoughnessMapUv),_.push(w.specularMapUv),_.push(w.specularColorMapUv),_.push(w.specularIntensityMapUv),_.push(w.transmissionMapUv),_.push(w.thicknessMapUv),_.push(w.combine),_.push(w.fogExp2),_.push(w.sizeAttenuation),_.push(w.morphTargetsCount),_.push(w.morphAttributeCount),_.push(w.numSunLights),_.push(w.numDirLights),_.push(w.numPointLights),_.push(w.numSpotLights),_.push(w.numSpotLightMaps),_.push(w.numHemiLights),_.push(w.numRectAreaLights),_.push(w.numSunLightShadows),_.push(w.numDirLightShadows),_.push(w.numPointLightShadows),_.push(w.numSpotLightShadows),_.push(w.numSpotLightShadowsWithMaps),_.push(w.numLightProbes),_.push(w.shadowMapType),_.push(w.toneMapping),_.push(w.numClippingPlanes),_.push(w.numClipIntersection),_.push(w.depthPacking)}function b(_,w){o.disableAll(),w.instancing&&o.enable(0),w.instancingColor&&o.enable(1),w.instancingMorph&&o.enable(2),w.matcap&&o.enable(3),w.envMap&&o.enable(4),w.normalMapObjectSpace&&o.enable(5),w.normalMapTangentSpace&&o.enable(6),w.clearcoat&&o.enable(7),w.iridescence&&o.enable(8),w.alphaTest&&o.enable(9),w.vertexColors&&o.enable(10),w.vertexAlphas&&o.enable(11),w.vertexUv1s&&o.enable(12),w.vertexUv2s&&o.enable(13),w.vertexUv3s&&o.enable(14),w.vertexTangents&&o.enable(15),w.anisotropy&&o.enable(16),w.alphaHash&&o.enable(17),w.batching&&o.enable(18),w.dispersion&&o.enable(19),w.retroreflection&&o.enable(24),w.batchingColor&&o.enable(20),w.gradientMap&&o.enable(21),w.packedNormalMap&&o.enable(22),w.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),w.fog&&o.enable(0),w.useFog&&o.enable(1),w.flatShading&&o.enable(2),w.logarithmicDepthBuffer&&o.enable(3),w.reversedDepthBuffer&&o.enable(4),w.skinning&&o.enable(5),w.morphTargets&&o.enable(6),w.morphNormals&&o.enable(7),w.morphColors&&o.enable(8),w.premultipliedAlpha&&o.enable(9),w.shadowMapEnabled&&o.enable(10),w.doubleSided&&o.enable(11),w.flipSided&&o.enable(12),w.useDepthPacking&&o.enable(13),w.dithering&&o.enable(14),w.transmission&&o.enable(15),w.sheen&&o.enable(16),w.opaque&&o.enable(17),w.pointsUvs&&o.enable(18),w.decodeVideoTexture&&o.enable(19),w.decodeVideoTextureEmissive&&o.enable(20),w.alphaToCoverage&&o.enable(21),w.numLightProbeGrids>0&&o.enable(22),w.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function R(_){let w=f[_.type],C;if(w){let D=ni[w];C=Ah.clone(D.uniforms)}else C=_.uniforms;return C}function S(_,w){let C=h.get(w);return C!==void 0?++C.usedTimes:(C=new Z2(i,w,_,s),l.push(C),h.set(w,C)),C}function T(_){if(--_.usedTimes===0){let w=l.indexOf(_);l[w]=l[l.length-1],l.pop(),h.delete(_.cacheKey),_.destroy()}}function y(_){a.remove(_)}function A(){a.dispose()}return{getParameters:v,getProgramCacheKey:m,getUniforms:R,acquireProgram:S,releaseProgram:T,releaseShaderCache:y,programs:l,dispose:A}}function j2(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,c){i.get(o)[a]=c}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function Q2(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function qh(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Yh(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(d){let f=0;return d.isInstancedMesh&&(f+=2),d.isSkinnedMesh&&(f+=1),f}function a(d,f,g,v,m,p){let b=i[e];return b===void 0?(b={id:d.id,object:d,geometry:f,material:g,materialVariant:o(d),groupOrder:v,renderOrder:d.renderOrder,z:m,group:p},i[e]=b):(b.id=d.id,b.object=d,b.geometry=f,b.material=g,b.materialVariant=o(d),b.groupOrder=v,b.renderOrder=d.renderOrder,b.z=m,b.group=p),e++,b}function c(d,f,g,v,m,p,b){b.reversedDepth===!0&&(m=-m);let R=a(d,f,g,v,m,p);g.transmission>0?n.push(R):g.transparent===!0?s.push(R):t.push(R)}function l(d,f,g,v,m,p){let b=a(d,f,g,v,m,p);g.transmission>0?n.unshift(b):g.transparent===!0?s.unshift(b):t.unshift(b)}function h(d,f){t.length>1&&t.sort(d||Q2),n.length>1&&n.sort(f||qh),s.length>1&&s.sort(f||qh)}function u(){for(let d=e,f=i.length;d<f;d++){let g=i[d];if(g.id===null)break;g.id=null,g.object=null,g.geometry=null,g.material=null,g.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:c,unshift:l,finish:u,sort:h}}function e3(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new Yh,i.set(n,[o])):s>=r.length?(o=new Yh,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function t3(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new P,color:new ke};break;case"SpotLight":t={position:new P,direction:new P,color:new ke,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new ke,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new ke,groundColor:new ke};break;case"RectAreaLight":t={color:new ke,position:new P,halfWidth:new P,halfHeight:new P};break}return i[e.id]=t,t}}}function n3(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ze};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ze};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ze,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var i3=0;function s3(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function r3(i){let e=new t3,t=n3(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new P);let s=new P,r=new De,o=new De;function a(l){let h=0,u=0,d=0;for(let L=0;L<9;L++)n.probe[L].set(0,0,0);let f=0,g=0,v=0,m=0,p=0,b=0,R=0,S=0,T=0,y=0,A=0,_=0,w=0,C=0;l.sort(s3);for(let L=0,N=l.length;L<N;L++){let I=l[L],k=I.color,G=I.intensity,V=I.distance,Q=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===Ui?Q=I.shadow.map.texture:Q=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)h+=k.r*G,u+=k.g*G,d+=k.b*G;else if(I.isLightProbe){for(let W=0;W<9;W++)n.probe[W].addScaledVector(I.sh.coefficients[W],G);C++}else if(I.isSunLight){let W=e.get(I);if(W.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let O=I.shadow,Z=t.get(I);Z.shadowIntensity=O.intensity,Z.shadowBias=O.bias,Z.shadowNormalBias=O.normalBias,Z.shadowRadius=O.radius,Z.shadowMapSize.copy(O.mapSize).multiply(O.getFrameExtents()),n.sunShadow[g]=Z,n.sunShadowMap[g]=Q;let le=O.getViewportCount();for(let Me=0;Me<le;Me++)n.sunShadowMatrix[v+Me]=O.getMatrix(Me),n.sunShadowCascade[v+Me]=O._cascadeData[Me];v+=le,g++}n.sun[f]=W,f++}else if(I.isDirectionalLight){let W=e.get(I);if(W.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){let O=I.shadow,Z=t.get(I);Z.shadowIntensity=O.intensity,Z.shadowBias=O.bias,Z.shadowNormalBias=O.normalBias,Z.shadowRadius=O.radius,Z.shadowMapSize=O.mapSize,n.directionalShadow[m]=Z,n.directionalShadowMap[m]=Q,n.directionalShadowMatrix[m]=I.shadow.matrix,T++}n.directional[m]=W,m++}else if(I.isSpotLight){let W=e.get(I);W.position.setFromMatrixPosition(I.matrixWorld),W.color.copy(k).multiplyScalar(G),W.distance=V,W.coneCos=Math.cos(I.angle),W.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),W.decay=I.decay,n.spot[b]=W;let O=I.shadow;if(I.map&&(n.spotLightMap[_]=I.map,_++,O.updateMatrices(I),I.castShadow&&w++),n.spotLightMatrix[b]=O.matrix,I.castShadow){let Z=t.get(I);Z.shadowIntensity=O.intensity,Z.shadowBias=O.bias,Z.shadowNormalBias=O.normalBias,Z.shadowRadius=O.radius,Z.shadowMapSize=O.mapSize,n.spotShadow[b]=Z,n.spotShadowMap[b]=Q,A++}b++}else if(I.isRectAreaLight){let W=e.get(I);W.color.copy(k).multiplyScalar(G),W.halfWidth.set(I.width*.5,0,0),W.halfHeight.set(0,I.height*.5,0),n.rectArea[R]=W,R++}else if(I.isPointLight){let W=e.get(I);if(W.color.copy(I.color).multiplyScalar(I.intensity),W.distance=I.distance,W.decay=I.decay,I.castShadow){let O=I.shadow,Z=t.get(I);Z.shadowIntensity=O.intensity,Z.shadowBias=O.bias,Z.shadowNormalBias=O.normalBias,Z.shadowRadius=O.radius,Z.shadowMapSize=O.mapSize,Z.shadowCameraNear=O.camera.near,Z.shadowCameraFar=O.camera.far,n.pointShadow[p]=Z,n.pointShadowMap[p]=Q,n.pointShadowMatrix[p]=I.shadow.matrix,y++}n.point[p]=W,p++}else if(I.isHemisphereLight){let W=e.get(I);W.skyColor.copy(I.color).multiplyScalar(G),W.groundColor.copy(I.groundColor).multiplyScalar(G),n.hemi[S]=W,S++}}R>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ve.LTC_FLOAT_1,n.rectAreaLTC2=ve.LTC_FLOAT_2):(n.rectAreaLTC1=ve.LTC_HALF_1,n.rectAreaLTC2=ve.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;let D=n.hash;(D.sunLength!==f||D.directionalLength!==m||D.pointLength!==p||D.spotLength!==b||D.rectAreaLength!==R||D.hemiLength!==S||D.numSunShadows!==g||D.numDirectionalShadows!==T||D.numPointShadows!==y||D.numSpotShadows!==A||D.numSpotMaps!==_||D.numLightProbes!==C)&&(n.sun.length=f,n.directional.length=m,n.spot.length=b,n.rectArea.length=R,n.point.length=p,n.hemi.length=S,n.sunShadow.length=g,n.sunShadowMap.length=g,n.sunShadowMatrix.length=v,n.sunShadowCascade.length=v,n.directionalShadow.length=T,n.directionalShadowMap.length=T,n.directionalShadowMatrix.length=T,n.pointShadow.length=y,n.pointShadowMap.length=y,n.pointShadowMatrix.length=y,n.spotShadow.length=A,n.spotShadowMap.length=A,n.spotLightMatrix.length=A+_-w,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=w,n.numLightProbes=C,D.sunLength=f,D.directionalLength=m,D.pointLength=p,D.spotLength=b,D.rectAreaLength=R,D.hemiLength=S,D.numSunShadows=g,D.numDirectionalShadows=T,D.numPointShadows=y,D.numSpotShadows=A,D.numSpotMaps=_,D.numLightProbes=C,n.version=i3++)}function c(l,h){let u=0,d=0,f=0,g=0,v=0,m=0,p=h.matrixWorldInverse;for(let b=0,R=l.length;b<R;b++){let S=l[b];if(S.isSunLight){let T=n.sun[u];T.direction.setFromMatrixPosition(S.matrixWorld),T.direction.transformDirection(p),u++}else if(S.isDirectionalLight){let T=n.directional[d];T.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(p),d++}else if(S.isSpotLight){let T=n.spot[g];T.position.setFromMatrixPosition(S.matrixWorld),T.position.applyMatrix4(p),T.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),T.direction.sub(s),T.direction.transformDirection(p),g++}else if(S.isRectAreaLight){let T=n.rectArea[v];T.position.setFromMatrixPosition(S.matrixWorld),T.position.applyMatrix4(p),o.identity(),r.copy(S.matrixWorld),r.premultiply(p),o.extractRotation(r),T.halfWidth.set(S.width*.5,0,0),T.halfHeight.set(0,S.height*.5,0),T.halfWidth.applyMatrix4(o),T.halfHeight.applyMatrix4(o),v++}else if(S.isPointLight){let T=n.point[f];T.position.setFromMatrixPosition(S.matrixWorld),T.position.applyMatrix4(p),f++}else if(S.isHemisphereLight){let T=n.hemi[m];T.direction.setFromMatrixPosition(S.matrixWorld),T.direction.transformDirection(p),m++}}}return{setup:a,setupView:c,state:n}}function Zh(i){let e=new r3(i),t=[],n=[],s=[];function r(d){u.camera=d,t.length=0,n.length=0,s.length=0}function o(d){t.push(d)}function a(d){n.push(d)}function c(d){s.push(d)}function l(){e.setup(t)}function h(d){e.setupView(t,d)}let u={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:l,setupLightsView:h,pushLight:o,pushShadow:a,pushLightProbeGrid:c}}function o3(i){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new Zh(i),e.set(s,[a])):r>=o.length?(a=new Zh(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var a3=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,l3=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,c3=[new P(1,0,0),new P(-1,0,0),new P(0,1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1)],h3=[new P(0,-1,0),new P(0,-1,0),new P(0,0,1),new P(0,0,-1),new P(0,-1,0),new P(0,-1,0)],Kh=new De,Xr=new P,ml=new P;function u3(i,e,t){let n=new Fs,s=new Ze,r=new Ze,o=new vt,a=new ko,c=new Vo,l={},h=t.maxTextureSize,u={[Qn]:en,[en]:Qn,[yn]:yn},d=new bn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ze},radius:{value:4}},vertexShader:a3,fragmentShader:l3}),f=d.clone();f.defines.HORIZONTAL_PASS=1;let g=new qt;g.setAttribute("position",new Xt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let v=new dt(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Nr;let p=this.type;this.render=function(y,A,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||y.length===0)return;this.type===$o&&(Be("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Nr);let w=i.getRenderTarget(),C=i.getActiveCubeFace(),D=i.getActiveMipmapLevel(),L=i.state;L.setBlending(ei),L.buffers.depth.getReversed()===!0?L.buffers.color.setClear(0,0,0,0):L.buffers.color.setClear(1,1,1,1),L.buffers.depth.setTest(!0),L.setScissorTest(!1);let N=p!==this.type;N&&A.traverse(function(I){I.material&&(Array.isArray(I.material)?I.material.forEach(k=>k.needsUpdate=!0):I.material.needsUpdate=!0)});for(let I=0,k=y.length;I<k;I++){let G=y[I],V=G.shadow;if(V===void 0){Be("WebGLShadowMap:",G,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);let Q=V.getFrameExtents();s.multiply(Q),r.copy(V.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/Q.x),s.x=r.x*Q.x,V.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/Q.y),s.y=r.y*Q.y,V.mapSize.y=r.y));let W=i.state.buffers.depth.getReversed();if(V.camera._reversedDepth=W,V.map===null||N===!0){if(V.map!==null&&(V.map.depthTexture!==null&&(V.map.depthTexture.dispose(),V.map.depthTexture=null),V.map.dispose()),this.type===Vs){if(G.isPointLight){Be("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}V.map=new pn(s.x,s.y,{format:Ui,type:Gn,minFilter:Ot,magFilter:Ot,generateMipmaps:!1}),V.map.texture.name=G.name+".shadowMap",V.map.depthTexture=new Ii(s.x,s.y,wn),V.map.depthTexture.name=G.name+".shadowMapDepth",V.map.depthTexture.format=Yn,V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Ft,V.map.depthTexture.magFilter=Ft}else G.isPointLight?(V.map=new Ga(s.x),V.map.depthTexture=new Bo(s.x,Hn)):(V.map=new pn(s.x,s.y),V.map.depthTexture=new Ii(s.x,s.y,Hn)),V.map.depthTexture.name=G.name+".shadowMap",V.map.depthTexture.format=Yn,this.type===Nr?(V.map.depthTexture.compareFunction=W?ka:za,V.map.depthTexture.minFilter=Ot,V.map.depthTexture.magFilter=Ot):(V.map.depthTexture.compareFunction=null,V.map.depthTexture.minFilter=Ft,V.map.depthTexture.magFilter=Ft);V.camera.updateProjectionMatrix()}V.map.isWebGLCubeRenderTarget!==!0&&(V.map.width!==s.x||V.map.height!==s.y)&&V.map.setSize(s.x,s.y);let O=V.map.isWebGLCubeRenderTarget?6:V.getViewportCount();G.isPointLight!==!0&&V.updateMatrices(G,_);for(let Z=0;Z<O;Z++){let le=V.getCamera(Z);if(G.isPointLight){let Me=V.camera,ie=V.matrix,oe=G.distance||Me.far;oe!==Me.far&&(Me.far=oe,Me.updateProjectionMatrix()),Xr.setFromMatrixPosition(G.matrixWorld),Me.position.copy(Xr),ml.copy(Me.position),ml.add(c3[Z]),Me.up.copy(h3[Z]),Me.lookAt(ml),Me.updateMatrixWorld(),ie.makeTranslation(-Xr.x,-Xr.y,-Xr.z),Kh.multiplyMatrices(Me.projectionMatrix,Me.matrixWorldInverse),V._frustum.setFromProjectionMatrix(Kh,Me.coordinateSystem,Me.reversedDepth)}if(V.map.isWebGLCubeRenderTarget)i.setRenderTarget(V.map,Z),i.clear();else{Z===0&&(i.setRenderTarget(V.map),i.clear());let Me=V.getViewport(Z);o.set(r.x*Me.x,r.y*Me.y,r.x*Me.z,r.y*Me.w),L.viewport(o)}n=V.getFrustum(Z),S(A,_,le,G,this.type)}V.isPointLightShadow!==!0&&this.type===Vs&&b(V,_),V.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(w,C,D)};function b(y,A){let _=e.update(v);d.defines.VSM_SAMPLES!==y.blurSamples&&(d.defines.VSM_SAMPLES=y.blurSamples,f.defines.VSM_SAMPLES=y.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),y.mapPass===null?y.mapPass=new pn(s.x,s.y,{format:Ui,type:Gn}):(y.mapPass.width!==y.map.width||y.mapPass.height!==y.map.height)&&y.mapPass.setSize(y.map.width,y.map.height),d.uniforms.shadow_pass.value=y.map.depthTexture,d.uniforms.resolution.value.set(y.map.width,y.map.height),d.uniforms.radius.value=y.radius,i.setRenderTarget(y.mapPass),i.clear(),i.renderBufferDirect(A,null,_,d,v,null),f.uniforms.shadow_pass.value=y.mapPass.texture,f.uniforms.resolution.value.set(y.map.width,y.map.height),f.uniforms.radius.value=y.radius,i.setRenderTarget(y.map),i.clear(),i.renderBufferDirect(A,null,_,f,v,null)}function R(y,A,_,w){let C=null,D=_.isPointLight===!0?y.customDistanceMaterial:y.customDepthMaterial;if(D!==void 0)C=D;else if(C=_.isPointLight===!0?c:a,i.localClippingEnabled&&A.clipShadows===!0&&Array.isArray(A.clippingPlanes)&&A.clippingPlanes.length!==0||A.displacementMap&&A.displacementScale!==0||A.alphaMap&&A.alphaTest>0||A.map&&A.alphaTest>0||A.alphaToCoverage===!0){let L=C.uuid,N=A.uuid,I=l[L];I===void 0&&(I={},l[L]=I);let k=I[N];k===void 0&&(k=C.clone(),I[N]=k,A.addEventListener("dispose",T)),C=k}if(C.visible=A.visible,C.wireframe=A.wireframe,w===Vs?C.side=A.shadowSide!==null?A.shadowSide:A.side:C.side=A.shadowSide!==null?A.shadowSide:u[A.side],C.alphaMap=A.alphaMap,C.alphaTest=A.alphaToCoverage===!0?.5:A.alphaTest,C.map=A.map,C.clipShadows=A.clipShadows,C.clippingPlanes=A.clippingPlanes,C.clipIntersection=A.clipIntersection,C.displacementMap=A.displacementMap,C.displacementScale=A.displacementScale,C.displacementBias=A.displacementBias,C.wireframeLinewidth=A.wireframeLinewidth,C.linewidth=A.linewidth,_.isPointLight===!0&&C.isMeshDistanceMaterial===!0){let L=i.properties.get(C);L.light=_}return C}function S(y,A,_,w,C){if(y.visible===!1)return;if(y.layers.test(A.layers)&&(y.isMesh||y.isLine||y.isPoints)&&(y.castShadow||y.receiveShadow&&C===Vs)&&(!y.frustumCulled||y.intersectsFrustum(n))){y.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,y.matrixWorld);let N=e.update(y),I=y.material;if(Array.isArray(I)){let k=N.groups;for(let G=0,V=k.length;G<V;G++){let Q=k[G],W=I[Q.materialIndex];if(W&&W.visible){let O=R(y,W,w,C);y.onBeforeShadow(i,y,A,_,N,O,Q),i.renderBufferDirect(_,null,N,O,y,Q),y.onAfterShadow(i,y,A,_,N,O,Q)}}}else if(I.visible){let k=R(y,I,w,C);y.onBeforeShadow(i,y,A,_,N,k,null),i.renderBufferDirect(_,null,N,k,y,null),y.onAfterShadow(i,y,A,_,N,k,null)}}let L=y.children;for(let N=0,I=L.length;N<I;N++)S(L[N],A,_,w,C)}function T(y){y.target.removeEventListener("dispose",T);for(let _ in l){let w=l[_],C=y.target.uuid;C in w&&(w[C].dispose(),delete w[C])}}}function d3(i,e){function t(){let F=!1,ge=new vt,se=null,me=new vt(0,0,0,0);return{setMask:function(ye){se!==ye&&!F&&(i.colorMask(ye,ye,ye,ye),se=ye)},setLocked:function(ye){F=ye},setClear:function(ye,ae,Oe,Re,pt){pt===!0&&(ye*=Re,ae*=Re,Oe*=Re),ge.set(ye,ae,Oe,Re),me.equals(ge)===!1&&(i.clearColor(ye,ae,Oe,Re),me.copy(ge))},reset:function(){F=!1,se=null,me.set(-1,0,0,0)}}}function n(){let F=!1,ge=!1,se=null,me=null,ye=null;return{setReversed:function(ae){if(ge!==ae){let Oe=e.get("EXT_clip_control");ae?Oe.clipControlEXT(Oe.LOWER_LEFT_EXT,Oe.ZERO_TO_ONE_EXT):Oe.clipControlEXT(Oe.LOWER_LEFT_EXT,Oe.NEGATIVE_ONE_TO_ONE_EXT),ge=ae;let Re=ye;ye=null,this.setClear(Re)}},getReversed:function(){return ge},setTest:function(ae){ae?j(i.DEPTH_TEST):z(i.DEPTH_TEST)},setMask:function(ae){se!==ae&&!F&&(i.depthMask(ae),se=ae)},setFunc:function(ae){if(ge&&(ae=wh[ae]),me!==ae){switch(ae){case Ao:i.depthFunc(i.NEVER);break;case Eo:i.depthFunc(i.ALWAYS);break;case Ro:i.depthFunc(i.LESS);break;case Ts:i.depthFunc(i.LEQUAL);break;case Co:i.depthFunc(i.EQUAL);break;case Io:i.depthFunc(i.GEQUAL);break;case Po:i.depthFunc(i.GREATER);break;case Lo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}me=ae}},setLocked:function(ae){F=ae},setClear:function(ae){ye!==ae&&(ye=ae,ge&&(ae=1-ae),i.clearDepth(ae))},reset:function(){F=!1,se=null,me=null,ye=null,ge=!1}}}function s(){let F=!1,ge=null,se=null,me=null,ye=null,ae=null,Oe=null,Re=null,pt=null;return{setTest:function(J){F||(J?j(i.STENCIL_TEST):z(i.STENCIL_TEST))},setMask:function(J){ge!==J&&!F&&(i.stencilMask(J),ge=J)},setFunc:function(J,ce,Ee){(se!==J||me!==ce||ye!==Ee)&&(i.stencilFunc(J,ce,Ee),se=J,me=ce,ye=Ee)},setOp:function(J,ce,Ee){(ae!==J||Oe!==ce||Re!==Ee)&&(i.stencilOp(J,ce,Ee),ae=J,Oe=ce,Re=Ee)},setLocked:function(J){F=J},setClear:function(J){pt!==J&&(i.clearStencil(J),pt=J)},reset:function(){F=!1,ge=null,se=null,me=null,ye=null,ae=null,Oe=null,Re=null,pt=null}}}let r=new t,o=new n,a=new s,c=new WeakMap,l=new WeakMap,h={},u={},d={},f=new WeakMap,g=[],v=null,m=!1,p=null,b=null,R=null,S=null,T=null,y=null,A=null,_=new ke(0,0,0),w=0,C=!1,D=null,L=null,N=null,I=null,k=null,G=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),V=!1,Q=0,W=i.getParameter(i.VERSION);W.indexOf("WebGL")!==-1?(Q=parseFloat(/^WebGL (\d)/.exec(W)[1]),V=Q>=1):W.indexOf("OpenGL ES")!==-1&&(Q=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),V=Q>=2);let O=null,Z={},le=i.getParameter(i.SCISSOR_BOX),Me=i.getParameter(i.VIEWPORT),ie=new vt().fromArray(le),oe=new vt().fromArray(Me);function re(F,ge,se,me){let ye=new Uint8Array(4),ae=i.createTexture();i.bindTexture(F,ae),i.texParameteri(F,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(F,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let Oe=0;Oe<se;Oe++)F===i.TEXTURE_3D||F===i.TEXTURE_2D_ARRAY?i.texImage3D(ge,0,i.RGBA,1,1,me,0,i.RGBA,i.UNSIGNED_BYTE,ye):i.texImage2D(ge+Oe,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,ye);return ae}let X={};X[i.TEXTURE_2D]=re(i.TEXTURE_2D,i.TEXTURE_2D,1),X[i.TEXTURE_CUBE_MAP]=re(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),X[i.TEXTURE_2D_ARRAY]=re(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),X[i.TEXTURE_3D]=re(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),j(i.DEPTH_TEST),o.setFunc(Ts),Ye(!1),ft(F0),j(i.CULL_FACE),Xe(ei);function j(F){h[F]!==!0&&(i.enable(F),h[F]=!0)}function z(F){h[F]!==!1&&(i.disable(F),h[F]=!1)}function xe(F,ge){return d[F]!==ge?(i.bindFramebuffer(F,ge),d[F]=ge,F===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=ge),F===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=ge),!0):!1}function he(F,ge){let se=g,me=!1;if(F){se=f.get(ge),se===void 0&&(se=[],f.set(ge,se));let ye=F.textures;if(se.length!==ye.length||se[0]!==i.COLOR_ATTACHMENT0){for(let ae=0,Oe=ye.length;ae<Oe;ae++)se[ae]=i.COLOR_ATTACHMENT0+ae;se.length=ye.length,me=!0}}else se[0]!==i.BACK&&(se[0]=i.BACK,me=!0);me&&i.drawBuffers(se)}function Le(F){return v!==F?(i.useProgram(F),v=F,!0):!1}let st={[ts]:i.FUNC_ADD,[Xc]:i.FUNC_SUBTRACT,[qc]:i.FUNC_REVERSE_SUBTRACT};st[Yc]=i.MIN,st[Zc]=i.MAX;let Ve={[Kc]:i.ZERO,[Jc]:i.ONE,[$c]:i.SRC_COLOR,[k0]:i.SRC_ALPHA,[ih]:i.SRC_ALPHA_SATURATE,[th]:i.DST_COLOR,[Qc]:i.DST_ALPHA,[jc]:i.ONE_MINUS_SRC_COLOR,[V0]:i.ONE_MINUS_SRC_ALPHA,[nh]:i.ONE_MINUS_DST_COLOR,[eh]:i.ONE_MINUS_DST_ALPHA,[sh]:i.CONSTANT_COLOR,[rh]:i.ONE_MINUS_CONSTANT_COLOR,[oh]:i.CONSTANT_ALPHA,[ah]:i.ONE_MINUS_CONSTANT_ALPHA};function Xe(F,ge,se,me,ye,ae,Oe,Re,pt,J){if(F===ei){m===!0&&(z(i.BLEND),m=!1);return}if(m===!1&&(j(i.BLEND),m=!0),F!==Wc){if(F!==p||J!==C){if((b!==ts||T!==ts)&&(i.blendEquation(i.FUNC_ADD),b=ts,T=ts),J)switch(F){case Hs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case O0:i.blendFunc(i.ONE,i.ONE);break;case B0:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case z0:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Ge("WebGLState: Invalid blending: ",F);break}else switch(F){case Hs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case O0:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case B0:Ge("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case z0:Ge("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Ge("WebGLState: Invalid blending: ",F);break}R=null,S=null,y=null,A=null,_.set(0,0,0),w=0,p=F,C=J}return}ye=ye||ge,ae=ae||se,Oe=Oe||me,(ge!==b||ye!==T)&&(i.blendEquationSeparate(st[ge],st[ye]),b=ge,T=ye),(se!==R||me!==S||ae!==y||Oe!==A)&&(i.blendFuncSeparate(Ve[se],Ve[me],Ve[ae],Ve[Oe]),R=se,S=me,y=ae,A=Oe),(Re.equals(_)===!1||pt!==w)&&(i.blendColor(Re.r,Re.g,Re.b,pt),_.copy(Re),w=pt),p=F,C=!1}function ct(F,ge){F.side===yn?z(i.CULL_FACE):j(i.CULL_FACE);let se=F.side===en;ge&&(se=!se),Ye(se),F.blending===Hs&&F.transparent===!1?Xe(ei):Xe(F.blending,F.blendEquation,F.blendSrc,F.blendDst,F.blendEquationAlpha,F.blendSrcAlpha,F.blendDstAlpha,F.blendColor,F.blendAlpha,F.premultipliedAlpha),o.setFunc(F.depthFunc),o.setTest(F.depthTest),o.setMask(F.depthWrite),r.setMask(F.colorWrite);let me=F.stencilWrite;a.setTest(me),me&&(a.setMask(F.stencilWriteMask),a.setFunc(F.stencilFunc,F.stencilRef,F.stencilFuncMask),a.setOp(F.stencilFail,F.stencilZFail,F.stencilZPass)),Vt(F.polygonOffset,F.polygonOffsetFactor,F.polygonOffsetUnits),F.alphaToCoverage===!0?j(i.SAMPLE_ALPHA_TO_COVERAGE):z(i.SAMPLE_ALPHA_TO_COVERAGE)}function Ye(F){D!==F&&(F?i.frontFace(i.CW):i.frontFace(i.CCW),D=F)}function ft(F){F!==Hc?(j(i.CULL_FACE),F!==L&&(F===F0?i.cullFace(i.BACK):F===Gc?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):z(i.CULL_FACE),L=F}function Ct(F){F!==N&&(V&&i.lineWidth(F),N=F)}function Vt(F,ge,se){F?(j(i.POLYGON_OFFSET_FILL),(I!==ge||k!==se)&&(I=ge,k=se,o.getReversed()&&(ge=-ge),i.polygonOffset(ge,se))):z(i.POLYGON_OFFSET_FILL)}function Tt(F){F?j(i.SCISSOR_TEST):z(i.SCISSOR_TEST)}function Pt(F){F===void 0&&(F=i.TEXTURE0+G-1),O!==F&&(i.activeTexture(F),O=F)}function B(F,ge,se){se===void 0&&(O===null?se=i.TEXTURE0+G-1:se=O);let me=Z[se];me===void 0&&(me={type:void 0,texture:void 0},Z[se]=me),(me.type!==F||me.texture!==ge)&&(O!==se&&(i.activeTexture(se),O=se),i.bindTexture(F,ge||X[F]),me.type=F,me.texture=ge)}function Ht(){let F=Z[O];F!==void 0&&F.type!==void 0&&(i.bindTexture(F.type,null),F.type=void 0,F.texture=void 0)}function ht(){try{i.compressedTexImage2D(...arguments)}catch(F){Ge("WebGLState:",F)}}function E(){try{i.compressedTexImage3D(...arguments)}catch(F){Ge("WebGLState:",F)}}function x(){try{i.texSubImage2D(...arguments)}catch(F){Ge("WebGLState:",F)}}function H(){try{i.texSubImage3D(...arguments)}catch(F){Ge("WebGLState:",F)}}function K(){try{i.compressedTexSubImage2D(...arguments)}catch(F){Ge("WebGLState:",F)}}function ee(){try{i.compressedTexSubImage3D(...arguments)}catch(F){Ge("WebGLState:",F)}}function ue(){try{i.texStorage2D(...arguments)}catch(F){Ge("WebGLState:",F)}}function fe(){try{i.texStorage3D(...arguments)}catch(F){Ge("WebGLState:",F)}}function te(){try{i.texImage2D(...arguments)}catch(F){Ge("WebGLState:",F)}}function ne(){try{i.texImage3D(...arguments)}catch(F){Ge("WebGLState:",F)}}function de(F){return u[F]!==void 0?u[F]:i.getParameter(F)}function Ne(F,ge){u[F]!==ge&&(i.pixelStorei(F,ge),u[F]=ge)}function _e(F){ie.equals(F)===!1&&(i.scissor(F.x,F.y,F.z,F.w),ie.copy(F))}function pe(F){oe.equals(F)===!1&&(i.viewport(F.x,F.y,F.z,F.w),oe.copy(F))}function Ae(F,ge){let se=l.get(ge);se===void 0&&(se=new WeakMap,l.set(ge,se));let me=se.get(F);me===void 0&&(me=i.getUniformBlockIndex(ge,F.name),se.set(F,me))}function ze(F,ge){let me=l.get(ge).get(F);c.get(ge)!==me&&(i.uniformBlockBinding(ge,me,F.__bindingPointIndex),c.set(ge,me))}function qe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),h={},u={},O=null,Z={},d={},f=new WeakMap,g=[],v=null,m=!1,p=null,b=null,R=null,S=null,T=null,y=null,A=null,_=new ke(0,0,0),w=0,C=!1,D=null,L=null,N=null,I=null,k=null,ie.set(0,0,i.canvas.width,i.canvas.height),oe.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:j,disable:z,bindFramebuffer:xe,drawBuffers:he,useProgram:Le,setBlending:Xe,setMaterial:ct,setFlipSided:Ye,setCullFace:ft,setLineWidth:Ct,setPolygonOffset:Vt,setScissorTest:Tt,activeTexture:Pt,bindTexture:B,unbindTexture:Ht,compressedTexImage2D:ht,compressedTexImage3D:E,texImage2D:te,texImage3D:ne,pixelStorei:Ne,getParameter:de,updateUBOMapping:Ae,uniformBlockBinding:ze,texStorage2D:ue,texStorage3D:fe,texSubImage2D:x,texSubImage3D:H,compressedTexSubImage2D:K,compressedTexSubImage3D:ee,scissor:_e,viewport:pe,reset:qe}}function f3(i,e,t,n,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Ze,h=new WeakMap,u=new Set,d,f=new WeakMap,g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function v(E,x){return g?new OffscreenCanvas(E,x):Rs("canvas")}function m(E,x,H){let K=1,ee=ht(E);if((ee.width>H||ee.height>H)&&(K=H/Math.max(ee.width,ee.height)),K<1)if(typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&E instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&E instanceof ImageBitmap||typeof VideoFrame<"u"&&E instanceof VideoFrame){let ue=Math.floor(K*ee.width),fe=Math.floor(K*ee.height);d===void 0&&(d=v(ue,fe));let te=x?v(ue,fe):d;return te.width=ue,te.height=fe,te.getContext("2d").drawImage(E,0,0,ue,fe),Be("WebGLRenderer: Texture has been resized from ("+ee.width+"x"+ee.height+") to ("+ue+"x"+fe+")."),te}else return"data"in E&&Be("WebGLRenderer: Image in DataTexture is too big ("+ee.width+"x"+ee.height+")."),E;return E}function p(E){return E.generateMipmaps}function b(E){i.generateMipmap(E)}function R(E){return E.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:E.isWebGL3DRenderTarget?i.TEXTURE_3D:E.isWebGLArrayRenderTarget||E.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function S(E,x,H,K,ee,ue=!1){if(E!==null){if(i[E]!==void 0)return i[E];Be("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+E+"'")}let fe;K&&(fe=e.get("EXT_texture_norm16"),fe||Be("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let te=x;if(x===i.RED&&(H===i.FLOAT&&(te=i.R32F),H===i.HALF_FLOAT&&(te=i.R16F),H===i.UNSIGNED_BYTE&&(te=i.R8),H===i.UNSIGNED_SHORT&&fe&&(te=fe.R16_EXT),H===i.SHORT&&fe&&(te=fe.R16_SNORM_EXT)),x===i.RED_INTEGER&&(H===i.UNSIGNED_BYTE&&(te=i.R8UI),H===i.UNSIGNED_SHORT&&(te=i.R16UI),H===i.UNSIGNED_INT&&(te=i.R32UI),H===i.BYTE&&(te=i.R8I),H===i.SHORT&&(te=i.R16I),H===i.INT&&(te=i.R32I)),x===i.RG&&(H===i.FLOAT&&(te=i.RG32F),H===i.HALF_FLOAT&&(te=i.RG16F),H===i.UNSIGNED_BYTE&&(te=i.RG8),H===i.UNSIGNED_SHORT&&fe&&(te=fe.RG16_EXT),H===i.SHORT&&fe&&(te=fe.RG16_SNORM_EXT)),x===i.RG_INTEGER&&(H===i.UNSIGNED_BYTE&&(te=i.RG8UI),H===i.UNSIGNED_SHORT&&(te=i.RG16UI),H===i.UNSIGNED_INT&&(te=i.RG32UI),H===i.BYTE&&(te=i.RG8I),H===i.SHORT&&(te=i.RG16I),H===i.INT&&(te=i.RG32I)),x===i.RGB_INTEGER&&(H===i.UNSIGNED_BYTE&&(te=i.RGB8UI),H===i.UNSIGNED_SHORT&&(te=i.RGB16UI),H===i.UNSIGNED_INT&&(te=i.RGB32UI),H===i.BYTE&&(te=i.RGB8I),H===i.SHORT&&(te=i.RGB16I),H===i.INT&&(te=i.RGB32I)),x===i.RGBA_INTEGER&&(H===i.UNSIGNED_BYTE&&(te=i.RGBA8UI),H===i.UNSIGNED_SHORT&&(te=i.RGBA16UI),H===i.UNSIGNED_INT&&(te=i.RGBA32UI),H===i.BYTE&&(te=i.RGBA8I),H===i.SHORT&&(te=i.RGBA16I),H===i.INT&&(te=i.RGBA32I)),x===i.RGB&&(H===i.UNSIGNED_SHORT&&fe&&(te=fe.RGB16_EXT),H===i.SHORT&&fe&&(te=fe.RGB16_SNORM_EXT),H===i.UNSIGNED_INT_5_9_9_9_REV&&(te=i.RGB9_E5),H===i.UNSIGNED_INT_10F_11F_11F_REV&&(te=i.R11F_G11F_B10F)),x===i.RGBA){let ne=ue?hr:je.getTransfer(ee);H===i.FLOAT&&(te=i.RGBA32F),H===i.HALF_FLOAT&&(te=i.RGBA16F),H===i.UNSIGNED_BYTE&&(te=ne===gt?i.SRGB8_ALPHA8:i.RGBA8),H===i.UNSIGNED_SHORT&&fe&&(te=fe.RGBA16_EXT),H===i.SHORT&&fe&&(te=fe.RGBA16_SNORM_EXT),H===i.UNSIGNED_SHORT_4_4_4_4&&(te=i.RGBA4),H===i.UNSIGNED_SHORT_5_5_5_1&&(te=i.RGB5_A1)}return(te===i.R16F||te===i.R32F||te===i.RG16F||te===i.RG32F||te===i.RGBA16F||te===i.RGBA32F)&&e.get("EXT_color_buffer_float"),te}function T(E,x){let H;return E?x===null||x===Hn||x===Xs?H=i.DEPTH24_STENCIL8:x===wn?H=i.DEPTH32F_STENCIL8:x===Ws&&(H=i.DEPTH24_STENCIL8,Be("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===Hn||x===Xs?H=i.DEPTH_COMPONENT24:x===wn?H=i.DEPTH_COMPONENT32F:x===Ws&&(H=i.DEPTH_COMPONENT16),H}function y(E,x){return p(E)===!0||E.isFramebufferTexture&&E.minFilter!==Ft&&E.minFilter!==Ot?Math.log2(Math.max(x.width,x.height))+1:E.mipmaps!==void 0&&E.mipmaps.length>0?E.mipmaps.length:E.isCompressedTexture&&Array.isArray(E.image)?x.mipmaps.length:1}function A(E){let x=E.target;x.removeEventListener("dispose",A),w(x),x.isVideoTexture&&h.delete(x),x.isHTMLTexture&&u.delete(x)}function _(E){let x=E.target;x.removeEventListener("dispose",_),D(x)}function w(E){let x=n.get(E);if(x.__webglInit===void 0)return;let H=E.source,K=f.get(H);if(K){let ee=K[x.__cacheKey];ee.usedTimes--,ee.usedTimes===0&&C(E),Object.keys(K).length===0&&f.delete(H)}n.remove(E)}function C(E){let x=n.get(E);i.deleteTexture(x.__webglTexture);let H=E.source,K=f.get(H);delete K[x.__cacheKey],o.memory.textures--}function D(E){let x=n.get(E);if(E.depthTexture&&(E.depthTexture.dispose(),n.remove(E.depthTexture)),E.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(x.__webglFramebuffer[K]))for(let ee=0;ee<x.__webglFramebuffer[K].length;ee++)i.deleteFramebuffer(x.__webglFramebuffer[K][ee]);else i.deleteFramebuffer(x.__webglFramebuffer[K]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[K])}else{if(Array.isArray(x.__webglFramebuffer))for(let K=0;K<x.__webglFramebuffer.length;K++)i.deleteFramebuffer(x.__webglFramebuffer[K]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let K=0;K<x.__webglColorRenderbuffer.length;K++)x.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[K]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let H=E.textures;for(let K=0,ee=H.length;K<ee;K++){let ue=n.get(H[K]);ue.__webglTexture&&(i.deleteTexture(ue.__webglTexture),o.memory.textures--),n.remove(H[K])}n.remove(E)}let L=0;function N(){L=0}function I(){return L}function k(E){L=E}function G(){let E=L;return E>=s.maxTextures&&Be("WebGLTextures: Trying to use "+(E+1)+" texture units while this GPU supports only "+s.maxTextures),L+=1,E}function V(E){let x=[];return x.push(E.wrapS),x.push(E.wrapT),x.push(E.wrapR||0),x.push(E.magFilter),x.push(E.minFilter),x.push(E.anisotropy),x.push(E.internalFormat),x.push(E.format),x.push(E.type),x.push(E.generateMipmaps),x.push(E.premultiplyAlpha),x.push(E.flipY),x.push(E.unpackAlignment),x.push(E.colorSpace),x.join()}function Q(E,x){let H=n.get(E);if(E.isVideoTexture&&B(E),E.isRenderTargetTexture===!1&&E.isExternalTexture!==!0&&E.version>0&&H.__version!==E.version){let K=E.image;if(K===null)Be("WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)Be("WebGLRenderer: Texture marked for update but image is incomplete");else{z(H,E,x);return}}else E.isExternalTexture&&(H.__webglTexture=E.sourceTexture?E.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,H.__webglTexture,i.TEXTURE0+x)}function W(E,x){let H=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&H.__version!==E.version){z(H,E,x);return}else E.isExternalTexture&&(H.__webglTexture=E.sourceTexture?E.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,H.__webglTexture,i.TEXTURE0+x)}function O(E,x){let H=n.get(E);if(E.isRenderTargetTexture===!1&&E.version>0&&H.__version!==E.version){z(H,E,x);return}t.bindTexture(i.TEXTURE_3D,H.__webglTexture,i.TEXTURE0+x)}function Z(E,x){let H=n.get(E);if(E.isCubeDepthTexture!==!0&&E.version>0&&H.__version!==E.version){xe(H,E,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,H.__webglTexture,i.TEXTURE0+x)}let le={[Ci]:i.REPEAT,[Cn]:i.CLAMP_TO_EDGE,[As]:i.MIRRORED_REPEAT},Me={[Ft]:i.NEAREST,[ta]:i.NEAREST_MIPMAP_NEAREST,[is]:i.NEAREST_MIPMAP_LINEAR,[Ot]:i.LINEAR,[Gs]:i.LINEAR_MIPMAP_NEAREST,[Vn]:i.LINEAR_MIPMAP_LINEAR},ie={[mh]:i.NEVER,[vh]:i.ALWAYS,[gh]:i.LESS,[za]:i.LEQUAL,[_h]:i.EQUAL,[ka]:i.GEQUAL,[xh]:i.GREATER,[yh]:i.NOTEQUAL};function oe(E,x){if(x.type===wn&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===Ot||x.magFilter===Gs||x.magFilter===is||x.magFilter===Vn||x.minFilter===Ot||x.minFilter===Gs||x.minFilter===is||x.minFilter===Vn)&&Be("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(E,i.TEXTURE_WRAP_S,le[x.wrapS]),i.texParameteri(E,i.TEXTURE_WRAP_T,le[x.wrapT]),(E===i.TEXTURE_3D||E===i.TEXTURE_2D_ARRAY)&&i.texParameteri(E,i.TEXTURE_WRAP_R,le[x.wrapR]),i.texParameteri(E,i.TEXTURE_MAG_FILTER,Me[x.magFilter]),i.texParameteri(E,i.TEXTURE_MIN_FILTER,Me[x.minFilter]),x.compareFunction&&(i.texParameteri(E,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(E,i.TEXTURE_COMPARE_FUNC,ie[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Ft||x.minFilter!==is&&x.minFilter!==Vn||x.type===wn&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){let H=e.get("EXT_texture_filter_anisotropic");i.texParameterf(E,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function re(E,x){let H=!1;E.__webglInit===void 0&&(E.__webglInit=!0,x.addEventListener("dispose",A));let K=x.source,ee=f.get(K);ee===void 0&&(ee={},f.set(K,ee));let ue=V(x);if(ue!==E.__cacheKey){ee[ue]===void 0&&(ee[ue]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,H=!0),ee[ue].usedTimes++;let fe=ee[E.__cacheKey];fe!==void 0&&(ee[E.__cacheKey].usedTimes--,fe.usedTimes===0&&C(x)),E.__cacheKey=ue,E.__webglTexture=ee[ue].texture}return H}function X(E,x,H){return Math.floor(Math.floor(E/H)/x)}function j(E,x,H,K){let ue=E.updateRanges;if(ue.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,H,K,x.data);else{ue.sort((Ne,_e)=>Ne.start-_e.start);let fe=0;for(let Ne=1;Ne<ue.length;Ne++){let _e=ue[fe],pe=ue[Ne],Ae=_e.start+_e.count,ze=X(pe.start,x.width,4),qe=X(_e.start,x.width,4);pe.start<=Ae+1&&ze===qe&&X(pe.start+pe.count-1,x.width,4)===ze?_e.count=Math.max(_e.count,pe.start+pe.count-_e.start):(++fe,ue[fe]=pe)}ue.length=fe+1;let te=t.getParameter(i.UNPACK_ROW_LENGTH),ne=t.getParameter(i.UNPACK_SKIP_PIXELS),de=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let Ne=0,_e=ue.length;Ne<_e;Ne++){let pe=ue[Ne],Ae=Math.floor(pe.start/4),ze=Math.ceil(pe.count/4),qe=Ae%x.width,F=Math.floor(Ae/x.width),ge=ze,se=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,qe),t.pixelStorei(i.UNPACK_SKIP_ROWS,F),t.texSubImage2D(i.TEXTURE_2D,0,qe,F,ge,se,H,K,x.data)}E.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,te),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ne),t.pixelStorei(i.UNPACK_SKIP_ROWS,de)}}function z(E,x,H){let K=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(K=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(K=i.TEXTURE_3D);let ee=re(E,x),ue=x.source;t.bindTexture(K,E.__webglTexture,i.TEXTURE0+H);let fe=n.get(ue);if(ue.version!==fe.__version||ee===!0){if(t.activeTexture(i.TEXTURE0+H),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){let se=je.getPrimaries(je.workingColorSpace),me=x.colorSpace===_i?null:je.getPrimaries(x.colorSpace),ye=x.colorSpace===_i||se===me?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ye)}t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment);let ne=m(x.image,!1,s.maxTextureSize);ne=Ht(x,ne);let de=r.convert(x.format,x.colorSpace),Ne=r.convert(x.type),_e=S(x.internalFormat,de,Ne,x.normalized,x.colorSpace,x.isVideoTexture);oe(K,x);let pe,Ae=x.mipmaps,ze=x.isVideoTexture!==!0,qe=fe.__version===void 0||ee===!0,F=ue.dataReady,ge=y(x,ne);if(x.isDepthTexture)_e=T(x.format===Di,x.type),qe&&(ze?t.texStorage2D(i.TEXTURE_2D,1,_e,ne.width,ne.height):t.texImage2D(i.TEXTURE_2D,0,_e,ne.width,ne.height,0,de,Ne,null));else if(x.isDataTexture)if(Ae.length>0){ze&&qe&&t.texStorage2D(i.TEXTURE_2D,ge,_e,Ae[0].width,Ae[0].height);for(let se=0,me=Ae.length;se<me;se++)pe=Ae[se],ze?F&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,pe.width,pe.height,de,Ne,pe.data):t.texImage2D(i.TEXTURE_2D,se,_e,pe.width,pe.height,0,de,Ne,pe.data);x.generateMipmaps=!1}else ze?(qe&&t.texStorage2D(i.TEXTURE_2D,ge,_e,ne.width,ne.height),F&&j(x,ne,de,Ne)):t.texImage2D(i.TEXTURE_2D,0,_e,ne.width,ne.height,0,de,Ne,ne.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){ze&&qe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ge,_e,Ae[0].width,Ae[0].height,ne.depth);for(let se=0,me=Ae.length;se<me;se++)if(pe=Ae[se],x.format!==Tn)if(de!==null)if(ze){if(F)if(x.layerUpdates.size>0){let ye=cl(pe.width,pe.height,x.format,x.type);for(let ae of x.layerUpdates){let Oe=pe.data.subarray(ae*ye/pe.data.BYTES_PER_ELEMENT,(ae+1)*ye/pe.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,ae,pe.width,pe.height,1,de,Oe)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,0,pe.width,pe.height,ne.depth,de,pe.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,se,_e,pe.width,pe.height,ne.depth,0,pe.data,0,0);else Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else ze?F&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,se,0,0,0,pe.width,pe.height,ne.depth,de,Ne,pe.data):t.texImage3D(i.TEXTURE_2D_ARRAY,se,_e,pe.width,pe.height,ne.depth,0,de,Ne,pe.data);x.layerUpdates.size>0&&x.clearLayerUpdates()}else{ze&&qe&&t.texStorage2D(i.TEXTURE_2D,ge,_e,Ae[0].width,Ae[0].height);for(let se=0,me=Ae.length;se<me;se++)pe=Ae[se],x.format!==Tn?de!==null?ze?F&&t.compressedTexSubImage2D(i.TEXTURE_2D,se,0,0,pe.width,pe.height,de,pe.data):t.compressedTexImage2D(i.TEXTURE_2D,se,_e,pe.width,pe.height,0,pe.data):Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):ze?F&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,pe.width,pe.height,de,Ne,pe.data):t.texImage2D(i.TEXTURE_2D,se,_e,pe.width,pe.height,0,de,Ne,pe.data)}else if(x.isDataArrayTexture)if(ze){if(qe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ge,_e,ne.width,ne.height,ne.depth),F)if(x.layerUpdates.size>0){let se=cl(ne.width,ne.height,x.format,x.type);for(let me of x.layerUpdates){let ye=ne.data.subarray(me*se/ne.data.BYTES_PER_ELEMENT,(me+1)*se/ne.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,me,ne.width,ne.height,1,de,Ne,ye)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ne.width,ne.height,ne.depth,de,Ne,ne.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,_e,ne.width,ne.height,ne.depth,0,de,Ne,ne.data);else if(x.isData3DTexture)ze?(qe&&t.texStorage3D(i.TEXTURE_3D,ge,_e,ne.width,ne.height,ne.depth),F&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ne.width,ne.height,ne.depth,de,Ne,ne.data)):t.texImage3D(i.TEXTURE_3D,0,_e,ne.width,ne.height,ne.depth,0,de,Ne,ne.data);else if(x.isFramebufferTexture){if(qe)if(ze)t.texStorage2D(i.TEXTURE_2D,ge,_e,ne.width,ne.height);else{let se=ne.width,me=ne.height;for(let ye=0;ye<ge;ye++)t.texImage2D(i.TEXTURE_2D,ye,_e,se,me,0,de,Ne,null),se>>=1,me>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in i){let se=i.canvas;if(se.hasAttribute("layoutsubtree")||se.setAttribute("layoutsubtree","true"),ne.parentNode!==se){se.appendChild(ne),u.add(x),se.onpaint=me=>{let ye=me.changedElements;for(let ae of u)ye.includes(ae.image)&&(ae.needsUpdate=!0)},se.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ne);else{let ye=i.RGBA,ae=i.RGBA,Oe=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,ye,ae,Oe,ne)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Ae.length>0){if(ze&&qe){let se=ht(Ae[0]);t.texStorage2D(i.TEXTURE_2D,ge,_e,se.width,se.height)}for(let se=0,me=Ae.length;se<me;se++)pe=Ae[se],ze?F&&t.texSubImage2D(i.TEXTURE_2D,se,0,0,de,Ne,pe):t.texImage2D(i.TEXTURE_2D,se,_e,de,Ne,pe);x.generateMipmaps=!1}else if(ze){if(qe){let se=ht(ne);t.texStorage2D(i.TEXTURE_2D,ge,_e,se.width,se.height)}F&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,de,Ne,ne)}else t.texImage2D(i.TEXTURE_2D,0,_e,de,Ne,ne);p(x)&&b(K),fe.__version=ue.version,x.onUpdate&&x.onUpdate(x)}E.__version=x.version}function xe(E,x,H){if(x.image.length!==6)return;let K=re(E,x),ee=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,E.__webglTexture,i.TEXTURE0+H);let ue=n.get(ee);if(ee.version!==ue.__version||K===!0){t.activeTexture(i.TEXTURE0+H);let fe=je.getPrimaries(je.workingColorSpace),te=x.colorSpace===_i?null:je.getPrimaries(x.colorSpace),ne=x.colorSpace===_i||fe===te?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ne);let de=x.isCompressedTexture||x.image[0].isCompressedTexture,Ne=x.image[0]&&x.image[0].isDataTexture,_e=[];for(let ae=0;ae<6;ae++)!de&&!Ne?_e[ae]=m(x.image[ae],!0,s.maxCubemapSize):_e[ae]=Ne?x.image[ae].image:x.image[ae],_e[ae]=Ht(x,_e[ae]);let pe=_e[0],Ae=r.convert(x.format,x.colorSpace),ze=r.convert(x.type),qe=S(x.internalFormat,Ae,ze,x.normalized,x.colorSpace),F=x.isVideoTexture!==!0,ge=ue.__version===void 0||K===!0,se=ee.dataReady,me=y(x,pe);oe(i.TEXTURE_CUBE_MAP,x);let ye;if(de){F&&ge&&t.texStorage2D(i.TEXTURE_CUBE_MAP,me,qe,pe.width,pe.height);for(let ae=0;ae<6;ae++){ye=_e[ae].mipmaps;for(let Oe=0;Oe<ye.length;Oe++){let Re=ye[Oe];x.format!==Tn?Ae!==null?F?se&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe,0,0,Re.width,Re.height,Ae,Re.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe,qe,Re.width,Re.height,0,Re.data):Be("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):F?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe,0,0,Re.width,Re.height,Ae,ze,Re.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe,qe,Re.width,Re.height,0,Ae,ze,Re.data)}}}else{if(ye=x.mipmaps,F&&ge){ye.length>0&&me++;let ae=ht(_e[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,me,qe,ae.width,ae.height)}for(let ae=0;ae<6;ae++)if(Ne){F?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,_e[ae].width,_e[ae].height,Ae,ze,_e[ae].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,qe,_e[ae].width,_e[ae].height,0,Ae,ze,_e[ae].data);for(let Oe=0;Oe<ye.length;Oe++){let pt=ye[Oe].image[ae].image;F?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe+1,0,0,pt.width,pt.height,Ae,ze,pt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe+1,qe,pt.width,pt.height,0,Ae,ze,pt.data)}}else{F?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,0,0,Ae,ze,_e[ae]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,0,qe,Ae,ze,_e[ae]);for(let Oe=0;Oe<ye.length;Oe++){let Re=ye[Oe];F?se&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe+1,0,0,Ae,ze,Re.image[ae]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ae,Oe+1,qe,Ae,ze,Re.image[ae])}}}p(x)&&b(i.TEXTURE_CUBE_MAP),ue.__version=ee.version,x.onUpdate&&x.onUpdate(x)}E.__version=x.version}function he(E,x,H,K,ee,ue){let fe=r.convert(H.format,H.colorSpace),te=r.convert(H.type),ne=S(H.internalFormat,fe,te,H.normalized,H.colorSpace),de=n.get(x),Ne=n.get(H);if(Ne.__renderTarget=x,!de.__hasExternalTextures){let _e=Math.max(1,x.width>>ue),pe=Math.max(1,x.height>>ue);ee===i.TEXTURE_3D||ee===i.TEXTURE_2D_ARRAY?t.texImage3D(ee,ue,ne,_e,pe,x.depth,0,fe,te,null):t.texImage2D(ee,ue,ne,_e,pe,0,fe,te,null)}t.bindFramebuffer(i.FRAMEBUFFER,E),Pt(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,ee,Ne.__webglTexture,0,Tt(x)):(ee===i.TEXTURE_2D||ee>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ee<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,K,ee,Ne.__webglTexture,ue),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Le(E,x,H){if(i.bindRenderbuffer(i.RENDERBUFFER,E),x.depthBuffer){let K=x.depthTexture,ee=K&&K.isDepthTexture?K.type:null,ue=T(x.stencilBuffer,ee),fe=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Pt(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Tt(x),ue,x.width,x.height):H?i.renderbufferStorageMultisample(i.RENDERBUFFER,Tt(x),ue,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,ue,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,fe,i.RENDERBUFFER,E)}else{let K=x.textures;for(let ee=0;ee<K.length;ee++){let ue=K[ee],fe=r.convert(ue.format,ue.colorSpace),te=r.convert(ue.type),ne=S(ue.internalFormat,fe,te,ue.normalized,ue.colorSpace);Pt(x)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Tt(x),ne,x.width,x.height):H?i.renderbufferStorageMultisample(i.RENDERBUFFER,Tt(x),ne,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,ne,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function st(E,x,H){let K=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,E),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let ee=n.get(x.depthTexture);if(ee.__renderTarget=x,(!ee.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),K){if(ee.__webglInit===void 0&&(ee.__webglInit=!0,x.depthTexture.addEventListener("dispose",A)),ee.__webglTexture===void 0){ee.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,ee.__webglTexture),oe(i.TEXTURE_CUBE_MAP,x.depthTexture);let de=r.convert(x.depthTexture.format),Ne=r.convert(x.depthTexture.type),_e;x.depthTexture.format===Yn?_e=i.DEPTH_COMPONENT24:x.depthTexture.format===Di&&(_e=i.DEPTH24_STENCIL8);for(let pe=0;pe<6;pe++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+pe,0,_e,x.width,x.height,0,de,Ne,null)}}else Q(x.depthTexture,0);let ue=ee.__webglTexture,fe=Tt(x),te=K?i.TEXTURE_CUBE_MAP_POSITIVE_X+H:i.TEXTURE_2D,ne=x.depthTexture.format===Di?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(x.depthTexture.format===Yn)Pt(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ne,te,ue,0,fe):i.framebufferTexture2D(i.FRAMEBUFFER,ne,te,ue,0);else if(x.depthTexture.format===Di)Pt(x)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ne,te,ue,0,fe):i.framebufferTexture2D(i.FRAMEBUFFER,ne,te,ue,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function Ve(E){let x=n.get(E),H=E.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==E.depthTexture){let K=E.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),K){let ee=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,K.removeEventListener("dispose",ee)};K.addEventListener("dispose",ee),x.__depthDisposeCallback=ee}x.__boundDepthTexture=K}if(E.depthTexture&&!x.__autoAllocateDepthBuffer)if(H)for(let K=0;K<6;K++)st(x.__webglFramebuffer[K],E,K);else{let K=E.texture.mipmaps;K&&K.length>0?st(x.__webglFramebuffer[0],E,0):st(x.__webglFramebuffer,E,0)}else if(H){x.__webglDepthbuffer=[];for(let K=0;K<6;K++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[K]),x.__webglDepthbuffer[K]===void 0)x.__webglDepthbuffer[K]=i.createRenderbuffer(),Le(x.__webglDepthbuffer[K],E,!1);else{let ee=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ue=x.__webglDepthbuffer[K];i.bindRenderbuffer(i.RENDERBUFFER,ue),i.framebufferRenderbuffer(i.FRAMEBUFFER,ee,i.RENDERBUFFER,ue)}}else{let K=E.texture.mipmaps;if(K&&K.length>0?t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),Le(x.__webglDepthbuffer,E,!1);else{let ee=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ue=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ue),i.framebufferRenderbuffer(i.FRAMEBUFFER,ee,i.RENDERBUFFER,ue)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Xe(E,x,H){let K=n.get(E);x!==void 0&&he(K.__webglFramebuffer,E,E.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),H!==void 0&&Ve(E)}function ct(E){let x=E.texture,H=n.get(E),K=n.get(x);E.addEventListener("dispose",_);let ee=E.textures,ue=E.isWebGLCubeRenderTarget===!0,fe=ee.length>1;if(fe||(K.__webglTexture===void 0&&(K.__webglTexture=i.createTexture()),K.__version=x.version,o.memory.textures++),ue){H.__webglFramebuffer=[];for(let te=0;te<6;te++)if(x.mipmaps&&x.mipmaps.length>0){H.__webglFramebuffer[te]=[];for(let ne=0;ne<x.mipmaps.length;ne++)H.__webglFramebuffer[te][ne]=i.createFramebuffer()}else H.__webglFramebuffer[te]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){H.__webglFramebuffer=[];for(let te=0;te<x.mipmaps.length;te++)H.__webglFramebuffer[te]=i.createFramebuffer()}else H.__webglFramebuffer=i.createFramebuffer();if(fe)for(let te=0,ne=ee.length;te<ne;te++){let de=n.get(ee[te]);de.__webglTexture===void 0&&(de.__webglTexture=i.createTexture(),o.memory.textures++)}if(E.samples>0&&Pt(E)===!1){H.__webglMultisampledFramebuffer=i.createFramebuffer(),H.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let te=0;te<ee.length;te++){let ne=ee[te];H.__webglColorRenderbuffer[te]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,H.__webglColorRenderbuffer[te]);let de=r.convert(ne.format,ne.colorSpace),Ne=r.convert(ne.type),_e=S(ne.internalFormat,de,Ne,ne.normalized,ne.colorSpace,E.isXRRenderTarget===!0),pe=Tt(E);i.renderbufferStorageMultisample(i.RENDERBUFFER,pe,_e,E.width,E.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+te,i.RENDERBUFFER,H.__webglColorRenderbuffer[te])}i.bindRenderbuffer(i.RENDERBUFFER,null),E.depthBuffer&&(H.__webglDepthRenderbuffer=i.createRenderbuffer(),Le(H.__webglDepthRenderbuffer,E,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ue){t.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),oe(i.TEXTURE_CUBE_MAP,x);for(let te=0;te<6;te++)if(x.mipmaps&&x.mipmaps.length>0)for(let ne=0;ne<x.mipmaps.length;ne++)he(H.__webglFramebuffer[te][ne],E,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+te,ne);else he(H.__webglFramebuffer[te],E,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+te,0);p(x)&&b(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(fe){for(let te=0,ne=ee.length;te<ne;te++){let de=ee[te],Ne=n.get(de),_e=i.TEXTURE_2D;(E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(_e=E.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(_e,Ne.__webglTexture),oe(_e,de),he(H.__webglFramebuffer,E,de,i.COLOR_ATTACHMENT0+te,_e,0),p(de)&&b(_e)}t.unbindTexture()}else{let te=i.TEXTURE_2D;if((E.isWebGL3DRenderTarget||E.isWebGLArrayRenderTarget)&&(te=E.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(te,K.__webglTexture),oe(te,x),x.mipmaps&&x.mipmaps.length>0)for(let ne=0;ne<x.mipmaps.length;ne++)he(H.__webglFramebuffer[ne],E,x,i.COLOR_ATTACHMENT0,te,ne);else he(H.__webglFramebuffer,E,x,i.COLOR_ATTACHMENT0,te,0);p(x)&&b(te),t.unbindTexture()}E.depthBuffer&&Ve(E)}function Ye(E){let x=E.textures;for(let H=0,K=x.length;H<K;H++){let ee=x[H];if(p(ee)){let ue=R(E),fe=n.get(ee).__webglTexture;t.bindTexture(ue,fe),b(ue),t.unbindTexture()}}}let ft=[],Ct=[];function Vt(E){if(E.samples>0){if(Pt(E)===!1){let x=E.textures,H=E.width,K=E.height,ee=i.COLOR_BUFFER_BIT,ue=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,fe=n.get(E),te=x.length>1;if(te)for(let de=0;de<x.length;de++)t.bindFramebuffer(i.FRAMEBUFFER,fe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,fe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,fe.__webglMultisampledFramebuffer);let ne=E.texture.mipmaps;ne&&ne.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,fe.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,fe.__webglFramebuffer);for(let de=0;de<x.length;de++){if(E.resolveDepthBuffer&&(E.depthBuffer&&(ee|=i.DEPTH_BUFFER_BIT),E.stencilBuffer&&E.resolveStencilBuffer&&(ee|=i.STENCIL_BUFFER_BIT)),te){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,fe.__webglColorRenderbuffer[de]);let Ne=n.get(x[de]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ne,0)}i.blitFramebuffer(0,0,H,K,0,0,H,K,ee,i.NEAREST),c===!0&&(ft.length=0,Ct.length=0,ft.push(i.COLOR_ATTACHMENT0+de),E.depthBuffer&&E.storeMultisampledDepthBuffer===!1&&(ft.push(ue),Ct.push(ue),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Ct)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ft))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),te)for(let de=0;de<x.length;de++){t.bindFramebuffer(i.FRAMEBUFFER,fe.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.RENDERBUFFER,fe.__webglColorRenderbuffer[de]);let Ne=n.get(x[de]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,fe.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+de,i.TEXTURE_2D,Ne,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,fe.__webglMultisampledFramebuffer)}else if(E.depthBuffer&&E.storeMultisampledDepthBuffer===!1&&c){let x=E.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function Tt(E){return Math.min(s.maxSamples,E.samples)}function Pt(E){let x=n.get(E);return E.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function B(E){let x=o.render.frame;h.get(E)!==x&&(h.set(E,x),E.update())}function Ht(E,x){let H=E.colorSpace,K=E.format,ee=E.type;return E.isCompressedTexture===!0||E.isVideoTexture===!0||H!==dn&&H!==_i&&(je.getTransfer(H)===gt?(K!==Tn||ee!==vn)&&Be("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Ge("WebGLTextures: Unsupported texture color space:",H)),x}function ht(E){return typeof HTMLImageElement<"u"&&E instanceof HTMLImageElement?(l.width=E.naturalWidth||E.width,l.height=E.naturalHeight||E.height):typeof VideoFrame<"u"&&E instanceof VideoFrame?(l.width=E.displayWidth,l.height=E.displayHeight):(l.width=E.width,l.height=E.height),l}this.allocateTextureUnit=G,this.resetTextureUnits=N,this.getTextureUnits=I,this.setTextureUnits=k,this.setTexture2D=Q,this.setTexture2DArray=W,this.setTexture3D=O,this.setTextureCube=Z,this.rebindTextures=Xe,this.setupRenderTarget=ct,this.updateRenderTargetMipmap=Ye,this.updateMultisampleRenderTarget=Vt,this.setupDepthRenderbuffer=Ve,this.setupFrameBufferTexture=he,this.useMultisampledRTT=Pt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function p3(i,e){function t(n,s=_i){let r,o=je.getTransfer(s);if(n===vn)return i.UNSIGNED_BYTE;if(n===ia)return i.UNSIGNED_SHORT_4_4_4_4;if(n===sa)return i.UNSIGNED_SHORT_5_5_5_1;if(n===$0)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===j0)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===K0)return i.BYTE;if(n===J0)return i.SHORT;if(n===Ws)return i.UNSIGNED_SHORT;if(n===na)return i.INT;if(n===Hn)return i.UNSIGNED_INT;if(n===wn)return i.FLOAT;if(n===Gn)return i.HALF_FLOAT;if(n===Q0)return i.ALPHA;if(n===el)return i.RGB;if(n===Tn)return i.RGBA;if(n===Yn)return i.DEPTH_COMPONENT;if(n===Di)return i.DEPTH_STENCIL;if(n===ra)return i.RED;if(n===oa)return i.RED_INTEGER;if(n===Ui)return i.RG;if(n===aa)return i.RG_INTEGER;if(n===la)return i.RGBA_INTEGER;if(n===Fr||n===Or||n===Br||n===zr)if(o===gt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Fr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Or)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===zr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Fr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Or)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===zr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ca||n===ha||n===ua||n===da)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===ca)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ha)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ua)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===da)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===fa||n===pa||n===ma||n===ga||n===_a||n===kr||n===xa)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===fa||n===pa)return o===gt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===ma)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===ga)return r.COMPRESSED_R11_EAC;if(n===_a)return r.COMPRESSED_SIGNED_R11_EAC;if(n===kr)return r.COMPRESSED_RG11_EAC;if(n===xa)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===ya||n===va||n===Ma||n===Sa||n===ba||n===wa||n===Ta||n===Aa||n===Ea||n===Ra||n===Ca||n===Ia||n===Pa||n===La)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ya)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===va)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ma)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Sa)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ba)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===wa)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ta)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Aa)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ea)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ra)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ca)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ia)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Pa)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===La)return o===gt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Na||n===Da||n===Ua)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Na)return o===gt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Da)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ua)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Fa||n===Oa||n===Vr||n===Ba)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Fa)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Oa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Vr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ba)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Xs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var m3=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,g3=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,bl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Sr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new bn({vertexShader:m3,fragmentShader:g3,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new dt(new $i(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},wl=class extends Zn{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",c=1,l=null,h=null,u=null,d=null,f=null,g=null,v=typeof XRWebGLBinding<"u",m=new bl,p={},b=t.getContextAttributes(),R=null,S=null,T=[],y=[],A=new Ze,_=null,w=null,C=new jt;C.viewport=new vt;let D=new jt;D.viewport=new vt;let L=[C,D],N=new Jo,I=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(X){let j=T[X];return j===void 0&&(j=new Ps,T[X]=j),j.getTargetRaySpace()},this.getControllerGrip=function(X){let j=T[X];return j===void 0&&(j=new Ps,T[X]=j),j.getGripSpace()},this.getHand=function(X){let j=T[X];return j===void 0&&(j=new Ps,T[X]=j),j.getHandSpace()};function G(X){let j=y.indexOf(X.inputSource);if(j===-1)return;let z=T[j];z!==void 0&&(z.update(X.inputSource,X.frame,l||o),z.dispatchEvent({type:X.type,data:X.inputSource}))}function V(){s.removeEventListener("select",G),s.removeEventListener("selectstart",G),s.removeEventListener("selectend",G),s.removeEventListener("squeeze",G),s.removeEventListener("squeezestart",G),s.removeEventListener("squeezeend",G),s.removeEventListener("end",V),s.removeEventListener("inputsourceschange",Q);for(let X=0;X<T.length;X++){let j=y[X];j!==null&&(y[X]=null,T[X].disconnect(j))}I=null,k=null,m.reset();for(let X in p)delete p[X];if(e.setRenderTarget(R),f=null,d=null,u=null,s=null,S=null,re.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(A.width,A.height,!1),w!==null){let X=w.camera;X.fov=w.fov,X.zoom=w.zoom,X.updateProjectionMatrix(),w=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(X){r=X,n.isPresenting===!0&&Be("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(X){a=X,n.isPresenting===!0&&Be("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(X){l=X},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&v&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(X){if(s=X,s!==null){if(R=e.getRenderTarget(),s.addEventListener("select",G),s.addEventListener("selectstart",G),s.addEventListener("selectend",G),s.addEventListener("squeeze",G),s.addEventListener("squeezestart",G),s.addEventListener("squeezeend",G),s.addEventListener("end",V),s.addEventListener("inputsourceschange",Q),b.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(A),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let z=null,xe=null,he=null;b.depth&&(he=b.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,z=b.stencil?Di:Yn,xe=b.stencil?Xs:Hn);let Le={colorFormat:t.RGBA8,depthFormat:he,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(Le),s.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),S=new pn(d.textureWidth,d.textureHeight,{format:Tn,type:vn,depthTexture:new Ii(d.textureWidth,d.textureHeight,xe,void 0,void 0,void 0,void 0,void 0,void 0,z),stencilBuffer:b.stencil,colorSpace:e.outputColorSpace,samples:b.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}else{let z={antialias:b.antialias,alpha:!0,depth:b.depth,stencil:b.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,z),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),S=new pn(f.framebufferWidth,f.framebufferHeight,{format:Tn,type:vn,colorSpace:e.outputColorSpace,stencilBuffer:b.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),re.setContext(s),re.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function Q(X){for(let j=0;j<X.removed.length;j++){let z=X.removed[j],xe=y.indexOf(z);xe>=0&&(y[xe]=null,T[xe].disconnect(z))}for(let j=0;j<X.added.length;j++){let z=X.added[j],xe=y.indexOf(z);if(xe===-1){for(let Le=0;Le<T.length;Le++)if(Le>=y.length){y.push(z),xe=Le;break}else if(y[Le]===null){y[Le]=z,xe=Le;break}if(xe===-1)break}let he=T[xe];he&&he.connect(z)}}let W=new P,O=new P;function Z(X,j,z){W.setFromMatrixPosition(j.matrixWorld),O.setFromMatrixPosition(z.matrixWorld);let xe=W.distanceTo(O),he=j.projectionMatrix.elements,Le=z.projectionMatrix.elements,st=he[14]/(he[10]-1),Ve=he[14]/(he[10]+1),Xe=(he[9]+1)/he[5],ct=(he[9]-1)/he[5],Ye=(he[8]-1)/he[0],ft=(Le[8]+1)/Le[0],Ct=st*Ye,Vt=st*ft,Tt=xe/(-Ye+ft),Pt=Tt*-Ye;if(j.matrixWorld.decompose(X.position,X.quaternion,X.scale),X.translateX(Pt),X.translateZ(Tt),X.matrixWorld.compose(X.position,X.quaternion,X.scale),X.matrixWorldInverse.copy(X.matrixWorld).invert(),he[10]===-1)X.projectionMatrix.copy(j.projectionMatrix),X.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{let B=st+Tt,Ht=Ve+Tt,ht=Ct-Pt,E=Vt+(xe-Pt),x=Xe*Ve/Ht*B,H=ct*Ve/Ht*B;X.projectionMatrix.makePerspective(ht,E,x,H,B,Ht),X.projectionMatrixInverse.copy(X.projectionMatrix).invert()}}function le(X,j){j===null?X.matrixWorld.copy(X.matrix):X.matrixWorld.multiplyMatrices(j.matrixWorld,X.matrix),X.matrixWorldInverse.copy(X.matrixWorld).invert()}this.updateCamera=function(X){if(s===null)return;let j=X.near,z=X.far;m.texture!==null&&(m.depthNear>0&&(j=m.depthNear),m.depthFar>0&&(z=m.depthFar)),N.near=D.near=C.near=j,N.far=D.far=C.far=z,(I!==N.near||k!==N.far)&&(s.updateRenderState({depthNear:N.near,depthFar:N.far}),I=N.near,k=N.far),N.layers.mask=X.layers.mask|6,C.layers.mask=N.layers.mask&-5,D.layers.mask=N.layers.mask&-3;let xe=X.parent,he=N.cameras;le(N,xe);for(let Le=0;Le<he.length;Le++)le(he[Le],xe);he.length===2?Z(N,C,D):N.projectionMatrix.copy(C.projectionMatrix),w===null&&X.isPerspectiveCamera&&(w={camera:X,fov:X.fov,zoom:X.zoom}),Me(X,N,xe)};function Me(X,j,z){z===null?X.matrix.copy(j.matrixWorld):(X.matrix.copy(z.matrixWorld),X.matrix.invert(),X.matrix.multiply(j.matrixWorld)),X.matrix.decompose(X.position,X.quaternion,X.scale),X.updateMatrixWorld(!0),X.projectionMatrix.copy(j.projectionMatrix),X.projectionMatrixInverse.copy(j.projectionMatrixInverse),X.isPerspectiveCamera&&(X.fov=qi*2*Math.atan(1/X.projectionMatrix.elements[5]),X.zoom=1)}this.getCamera=function(){return N},this.getFoveation=function(){if(!(d===null&&f===null))return c},this.setFoveation=function(X){c=X,d!==null&&(d.fixedFoveation=X),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=X)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(N)},this.getCameraTexture=function(X){return p[X]};let ie=null;function oe(X,j){if(h=j.getViewerPose(l||o),g=j,h!==null){let z=h.views;f!==null&&(e.setRenderTargetFramebuffer(S,f.framebuffer),e.setRenderTarget(S));let xe=!1;z.length!==N.cameras.length&&(N.cameras.length=0,xe=!0);for(let Ve=0;Ve<z.length;Ve++){let Xe=z[Ve],ct=null;if(f!==null)ct=f.getViewport(Xe);else{let ft=u.getViewSubImage(d,Xe);ct=ft.viewport,Ve===0&&(e.setRenderTargetTextures(S,ft.colorTexture,ft.depthStencilTexture),e.setRenderTarget(S))}let Ye=L[Ve];Ye===void 0&&(Ye=new jt,Ye.layers.enable(Ve),Ye.viewport=new vt,L[Ve]=Ye),Ye.matrix.fromArray(Xe.transform.matrix),Ye.matrix.decompose(Ye.position,Ye.quaternion,Ye.scale),Ye.projectionMatrix.fromArray(Xe.projectionMatrix),Ye.projectionMatrixInverse.copy(Ye.projectionMatrix).invert(),Ye.viewport.set(ct.x,ct.y,ct.width,ct.height),Ve===0&&(N.matrix.copy(Ye.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale)),xe===!0&&N.cameras.push(Ye)}let he=s.enabledFeatures;if(he&&he.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){u=n.getBinding();let Ve=u.getDepthInformation(z[0]);Ve&&Ve.isValid&&Ve.texture&&m.init(Ve,s.renderState)}if(he&&he.includes("camera-access")&&v){e.state.unbindTexture(),u=n.getBinding();for(let Ve=0;Ve<z.length;Ve++){let Xe=z[Ve].camera;if(Xe){let ct=p[Xe];ct||(ct=new Sr,p[Xe]=ct);let Ye=u.getCameraImage(Xe);ct.sourceTexture=Ye}}}}for(let z=0;z<T.length;z++){let xe=y[z],he=T[z];xe!==null&&he!==void 0&&he.update(xe,j,l||o)}ie&&ie(X,j),j.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:j}),g=null}let re=new Jh;re.setAnimationLoop(oe),this.setAnimationLoop=function(X){ie=X},this.dispose=function(){}}},_3=new De,nu=new We;nu.set(-1,0,0,0,1,0,0,0,1);function x3(i,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,ol(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,b,R,S){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(m,p):p.isMeshLambertMaterial?(r(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,S)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),v(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?c(m,p,b,R):p.isSpriteMaterial?l(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===en&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===en&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let b=e.get(p),R=b.envMap,S=b.envMapRotation;R&&(m.envMap.value=R,m.envMapRotation.value.setFromMatrix4(_3.makeRotationFromEuler(S)).transpose(),R.isCubeTexture&&R.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(nu),m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function c(m,p,b,R){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*b,m.scale.value=R*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function l(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,b){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===en&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.retroreflectivity>0&&(m.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=b.texture,m.transmissionSamplerSize.value.set(b.width,b.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function v(m,p){let b=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(b.matrixWorld),m.nearDistance.value=b.shadow.camera.near,m.farDistance.value=b.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function y3(i,e,t,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(S,T){let y=T.program;n.uniformBlockBinding(S,y)}function l(S,T){let y=s[S.id];y===void 0&&(m(S),y=h(S),s[S.id]=y,S.addEventListener("dispose",b));let A=T.program;n.updateUBOMapping(S,A);let _=e.render.frame;r[S.id]!==_&&(d(S),r[S.id]=_)}function h(S){let T=u();S.__bindingPointIndex=T;let y=i.createBuffer(),A=S.__size,_=S.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,A,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,T,y),y}function u(){for(let S=0;S<a;S++)if(o.indexOf(S)===-1)return o.push(S),S;return Ge("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(S){let T=s[S.id],y=S.uniforms,A=S.__cache;i.bindBuffer(i.UNIFORM_BUFFER,T);for(let _=0,w=y.length;_<w;_++){let C=y[_];if(Array.isArray(C))for(let D=0,L=C.length;D<L;D++)f(C[D],_,D,A);else f(C,_,0,A)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(S,T,y,A){if(v(S,T,y,A)===!0){let _=S.__offset,w=S.value;if(Array.isArray(w)){let C=0;for(let D=0;D<w.length;D++){let L=w[D],N=p(L);g(L,S.__data,C),typeof L!="number"&&typeof L!="boolean"&&!L.isMatrix3&&!ArrayBuffer.isView(L)&&(C+=N.storage/Float32Array.BYTES_PER_ELEMENT)}}else g(w,S.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,S.__data)}}function g(S,T,y){typeof S=="number"||typeof S=="boolean"?T[0]=S:S.isMatrix3?(T[0]=S.elements[0],T[1]=S.elements[1],T[2]=S.elements[2],T[3]=0,T[4]=S.elements[3],T[5]=S.elements[4],T[6]=S.elements[5],T[7]=0,T[8]=S.elements[6],T[9]=S.elements[7],T[10]=S.elements[8],T[11]=0):ArrayBuffer.isView(S)?T.set(new S.constructor(S.buffer,S.byteOffset,T.length)):S.toArray(T,y)}function v(S,T,y,A){let _=S.value,w=T+"_"+y;if(A[w]===void 0)return typeof _=="number"||typeof _=="boolean"?A[w]=_:ArrayBuffer.isView(_)?A[w]=_.slice():A[w]=_.clone(),!0;{let C=A[w];if(typeof _=="number"||typeof _=="boolean"){if(C!==_)return A[w]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(C.equals(_)===!1)return C.copy(_),!0}}return!1}function m(S){let T=S.uniforms,y=0,A=16;for(let w=0,C=T.length;w<C;w++){let D=Array.isArray(T[w])?T[w]:[T[w]];for(let L=0,N=D.length;L<N;L++){let I=D[L],k=Array.isArray(I.value)?I.value:[I.value];for(let G=0,V=k.length;G<V;G++){let Q=k[G],W=p(Q),O=y%A,Z=O%W.boundary,le=O+Z;y+=Z,le!==0&&A-le<W.storage&&(y+=A-le),I.__data=new Float32Array(W.storage/Float32Array.BYTES_PER_ELEMENT),I.__offset=y,y+=W.storage}}}let _=y%A;return _>0&&(y+=A-_),S.__size=y,S.__cache={},this}function p(S){let T={boundary:0,storage:0};return typeof S=="number"||typeof S=="boolean"?(T.boundary=4,T.storage=4):S.isVector2?(T.boundary=8,T.storage=8):S.isVector3||S.isColor?(T.boundary=16,T.storage=12):S.isVector4?(T.boundary=16,T.storage=16):S.isMatrix3?(T.boundary=48,T.storage=48):S.isMatrix4?(T.boundary=64,T.storage=64):S.isTexture?Be("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(S)?(T.boundary=16,T.storage=S.byteLength):Be("WebGLRenderer: Unsupported uniform value type.",S),T}function b(S){let T=S.target;T.removeEventListener("dispose",b);let y=o.indexOf(T.__bindingPointIndex);o.splice(y,1),i.deleteBuffer(s[T.id]),delete s[T.id],delete r[T.id]}function R(){for(let S in s)i.deleteBuffer(s[S]);o=[],s={},r={}}return{bind:c,update:l,dispose:R}}var v3=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ti=null;function M3(){return ti===null&&(ti=new Us(v3,16,16,Ui,Gn),ti.name="DFG_LUT",ti.minFilter=Ot,ti.magFilter=Ot,ti.wrapS=Cn,ti.wrapT=Cn,ti.generateMipmaps=!1,ti.needsUpdate=!0),ti}var Wa=class{constructor(e={}){let{canvas:t=Mh(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1,outputBufferType:f=vn}=e;this.isWebGLRenderer=!0;let g;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");g=n.getContextAttributes().alpha}else g=o;let v=f,m=new Set([la,aa,oa]),p=new Set([vn,Hn,Ws,Xs,ia,sa]),b=new Uint32Array(4),R=new Int32Array(4),S=new P,T=null,y=null,A=[],_=[],w=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=kn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let C=this,D=!1,L=null,N=null,I=null,k=null;this._outputColorSpace=Dt;let G=0,V=0,Q=null,W=-1,O=null,Z=new vt,le=new vt,Me=null,ie=new ke(0),oe=0,re=t.width,X=t.height,j=1,z=null,xe=null,he=new vt(0,0,re,X),Le=new vt(0,0,re,X),st=!1,Ve=new Fs,Xe=!1,ct=!1,Ye=new De,ft=new P,Ct=new vt,Vt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Tt=!1;function Pt(){return Q===null?j:1}let B=n;function Ht(M,U){return t.getContext(M,U)}let ht,E,x,H,K,ee,ue,fe,te,ne,de,Ne,_e,pe,Ae,ze,qe,F,ge,se,me,ye,ae;try{let M={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",pt,!1),t.addEventListener("webglcontextrestored",J,!1),t.addEventListener("webglcontextcreationerror",ce,!1),B===null){let U="webgl2";if(B=Ht(U,M),B===null)throw Ht(U)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}Oe()}catch(M){throw t.removeEventListener("webglcontextlost",pt,!1),t.removeEventListener("webglcontextrestored",J,!1),t.removeEventListener("webglcontextcreationerror",ce,!1),Ge("WebGLRenderer: "+M.message),M}function Oe(){ht=new Rp(B),ht.init(),me=new p3(B,ht),E=new xp(B,ht,e,me),x=new d3(B,ht),E.reversedDepthBuffer&&d&&x.buffers.depth.setReversed(!0),N=B.createFramebuffer(),I=B.createFramebuffer(),k=B.createFramebuffer(),H=new Pp(B),K=new j2,ee=new f3(B,ht,x,K,E,me,H),ue=new Ep(C),fe=new Ld(B),ye=new gp(B,fe),te=new Cp(B,fe,H,ye),ne=new Np(B,te,fe,ye,H),F=new Lp(B,E,ee),Ae=new yp(K),de=new $2(C,ue,ht,E,ye,Ae),Ne=new x3(C,K),_e=new e3,pe=new o3(ht),qe=new mp(C,ue,x,ne,g,c),ze=new u3(C,ne,E),ae=new y3(B,H,E,x),ge=new _p(B,ht,H),se=new Ip(B,ht,H),H.programs=de.programs,C.capabilities=E,C.extensions=ht,C.properties=K,C.renderLists=_e,C.shadowMap=ze,C.state=x,C.info=H}v!==vn&&(w=new Up(v,t.width,t.height,a,s,r));let Re=new wl(C,B);this.xr=Re,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let M=ht.get("WEBGL_lose_context");M&&M.loseContext()},this.forceContextRestore=function(){let M=ht.get("WEBGL_lose_context");M&&M.restoreContext()},this.getPixelRatio=function(){return j},this.setPixelRatio=function(M){M!==void 0&&(j=M,this.setSize(re,X,!1))},this.getSize=function(M){return M.set(re,X)},this.setSize=function(M,U,$=!0){if(Re.isPresenting){Be("WebGLRenderer: Can't change size while VR device is presenting.");return}re=M,X=U,t.width=Math.floor(M*j),t.height=Math.floor(U*j),$===!0&&(t.style.width=M+"px",t.style.height=U+"px"),w!==null&&w.setSize(t.width,t.height),this.setViewport(0,0,M,U)},this.getDrawingBufferSize=function(M){return M.set(re*j,X*j).floor()},this.setDrawingBufferSize=function(M,U,$){re=M,X=U,j=$,t.width=Math.floor(M*$),t.height=Math.floor(U*$),this.setViewport(0,0,M,U)},this.setEffects=function(M){if(v===vn){Ge("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(M){for(let U=0;U<M.length;U++)if(M[U].isOutputPass===!0){Be("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}w.setEffects(M||[])},this.getCurrentViewport=function(M){return M.copy(Z)},this.getViewport=function(M){return M.copy(he)},this.setViewport=function(M,U,$,q){M.isVector4?he.set(M.x,M.y,M.z,M.w):he.set(M,U,$,q),x.viewport(Z.copy(he).multiplyScalar(j).round())},this.getScissor=function(M){return M.copy(Le)},this.setScissor=function(M,U,$,q){M.isVector4?Le.set(M.x,M.y,M.z,M.w):Le.set(M,U,$,q),x.scissor(le.copy(Le).multiplyScalar(j).round())},this.getScissorTest=function(){return st},this.setScissorTest=function(M){x.setScissorTest(st=M)},this.setOpaqueSort=function(M){z=M},this.setTransparentSort=function(M){xe=M},this.getClearColor=function(M){return M.copy(qe.getClearColor())},this.setClearColor=function(){qe.setClearColor(...arguments)},this.getClearAlpha=function(){return qe.getClearAlpha()},this.setClearAlpha=function(){qe.setClearAlpha(...arguments)},this.clear=function(M=!0,U=!0,$=!0){let q=0;if(M){let Y=!1;if(Q!==null){let be=Q.texture.format;Y=m.has(be)}if(Y){let be=Q.texture.type,Te=p.has(be),Se=qe.getClearColor(),Ie=qe.getClearAlpha(),Fe=Se.r,Je=Se.g,nt=Se.b;Te?(b[0]=Fe,b[1]=Je,b[2]=nt,b[3]=Ie,B.clearBufferuiv(B.COLOR,0,b)):(R[0]=Fe,R[1]=Je,R[2]=nt,R[3]=Ie,B.clearBufferiv(B.COLOR,0,R))}else q|=B.COLOR_BUFFER_BIT}U&&(q|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),$&&(q|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),q!==0&&B.clear(q)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(M){M.setRenderer(this),L=M},this.dispose=function(){t.removeEventListener("webglcontextlost",pt,!1),t.removeEventListener("webglcontextrestored",J,!1),t.removeEventListener("webglcontextcreationerror",ce,!1),qe.dispose(),_e.dispose(),pe.dispose(),K.dispose(),ue.dispose(),ne.dispose(),ye.dispose(),ae.dispose(),de.dispose(),Re.dispose(),Re.removeEventListener("sessionstart",Qe),Re.removeEventListener("sessionend",_t),at.stop()};function pt(M){M.preventDefault(),ur("WebGLRenderer: Context Lost."),D=!0}function J(){ur("WebGLRenderer: Context Restored."),D=!1;let M=H.autoReset,U=ze.enabled,$=ze.autoUpdate,q=ze.needsUpdate,Y=ze.type;Oe(),H.autoReset=M,ze.enabled=U,ze.autoUpdate=$,ze.needsUpdate=q,ze.type=Y}function ce(M){Ge("WebGLRenderer: A WebGL context could not be created. Reason: ",M.statusMessage)}function Ee(M){let U=M.target;U.removeEventListener("dispose",Ee),rt(U)}function rt(M){ut(M),K.remove(M)}function ut(M){let U=K.get(M).programs;U!==void 0&&(U.forEach(function($){de.releaseProgram($)}),M.isShaderMaterial&&de.releaseShaderCache(M))}this.renderBufferDirect=function(M,U,$,q,Y,be){U===null&&(U=Vt);let Te=Y.isMesh&&Y.matrixWorld.determinantAffine()<0,Se=It(M,U,$,q,Y);x.setMaterial(q,Te);let Ie=$.index,Fe=1;if(q.wireframe===!0){if(Ie=te.getWireframeAttribute($),Ie===void 0)return;Fe=2}let Je=$.drawRange,nt=$.attributes.position,Pe=Je.start*Fe,mt=(Je.start+Je.count)*Fe;be!==null&&(Pe=Math.max(Pe,be.start*Fe),mt=Math.min(mt,(be.start+be.count)*Fe)),Ie!==null?(Pe=Math.max(Pe,0),mt=Math.min(mt,Ie.count)):nt!=null&&(Pe=Math.max(Pe,0),mt=Math.min(mt,nt.count));let zt=mt-Pe;if(zt<0||zt===1/0)return;ye.setup(Y,q,Se,$,Ie);let Rt,bt=ge;if(Ie!==null&&(Rt=fe.get(Ie),bt=se,bt.setIndex(Rt)),Y.isMesh)q.wireframe===!0?(x.setLineWidth(q.wireframeLinewidth*Pt()),bt.setMode(B.LINES)):bt.setMode(B.TRIANGLES);else if(Y.isLine){let nn=q.linewidth;nn===void 0&&(nn=1),x.setLineWidth(nn*Pt()),Y.isLineSegments?bt.setMode(B.LINES):Y.isLineLoop?bt.setMode(B.LINE_LOOP):bt.setMode(B.LINE_STRIP)}else Y.isPoints?bt.setMode(B.POINTS):Y.isSprite&&bt.setMode(B.TRIANGLES);if(Y.isBatchedMesh)if(ht.get("WEBGL_multi_draw"))bt.renderMultiDraw(Y._multiDrawStarts,Y._multiDrawCounts,Y._multiDrawCount);else{let nn=Y._multiDrawStarts,we=Y._multiDrawCounts,cn=Y._multiDrawCount,lt=Ie?fe.get(Ie).bytesPerElement:1,En=K.get(q).currentProgram.getUniforms();for(let Wn=0;Wn<cn;Wn++)En.setValue(B,"_gl_DrawID",Wn),bt.render(nn[Wn]/lt,we[Wn])}else if(Y.isInstancedMesh)bt.renderInstances(Pe,zt,Y.count);else if($.isInstancedBufferGeometry){let nn=$._maxInstanceCount!==void 0?$._maxInstanceCount:1/0,we=Math.min($.instanceCount,nn);bt.renderInstances(Pe,zt,we)}else bt.render(Pe,zt)};function St(M,U,$,q){L!==null&&M.isNodeMaterial&&L.setObject(q,M),Xe===!0&&Ae.setState(M,$,!1),M.transparent===!0&&M.side===yn&&M.forceSinglePass===!1?(M.side=en,M.needsUpdate=!0,Gt(M,U,q),M.side=Qn,M.needsUpdate=!0,Gt(M,U,q),M.side=yn):Gt(M,U,q)}this.compile=function(M,U,$=null){$===null&&($=M),L!==null&&L.renderStart(M,U,$),y=pe.get($),y.init(U),_.push(y),$.traverseVisible(function(Y){Y.isLight&&Y.layers.test(U.layers)&&(y.pushLight(Y),Y.castShadow&&y.pushShadow(Y))}),M!==$&&M.traverseVisible(function(Y){Y.isLight&&Y.layers.test(U.layers)&&(y.pushLight(Y),Y.castShadow&&y.pushShadow(Y))}),y.setupLights(),L!==null&&L.updateLights(y.state.lightsArray),ct=this.localClippingEnabled,Xe=Ae.init(this.clippingPlanes,ct),Xe===!0&&Ae.setGlobalState(this.clippingPlanes,U),L!==null&&ze.render(y.state.shadowsArray,$,U);let q=new Set;return M.traverse(function(Y){if(!(Y.isMesh||Y.isPoints||Y.isLine||Y.isSprite))return;let be=Y.material;if(be)if(Array.isArray(be))for(let Te=0;Te<be.length;Te++){let Se=be[Te];St(Se,$,U,Y),q.add(Se)}else St(be,$,U,Y),q.add(be)}),y=_.pop(),L!==null&&L.renderEnd(),q},this.compileAsync=function(M,U,$=null){let q=this.compile(M,U,$);return new Promise(Y=>{function be(){if(q.forEach(function(Te){let Ie=K.get(Te).currentProgram;(Ie===void 0||Ie.isReady())&&q.delete(Te)}),q.size===0){Y(M);return}setTimeout(be,10)}ht.get("KHR_parallel_shader_compile")!==null?be():setTimeout(be,10)})};let ot=null;function Ke(M){ot&&ot(M)}function Qe(){at.stop()}function _t(){at.start()}let at=new Jh;at.setAnimationLoop(Ke),typeof self<"u"&&at.setContext(self),this.setAnimationLoop=function(M){ot=M,Re.setAnimationLoop(M),M===null?at.stop():at.start()},Re.addEventListener("sessionstart",Qe),Re.addEventListener("sessionend",_t),this.render=function(M,U){if(U!==void 0&&U.isCamera!==!0){Ge("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(D===!0)return;L!==null&&L.renderStart(M,U);let $=Re.enabled===!0&&Re.isPresenting===!0,q=w!==null&&(Q===null||$)&&w.begin(C,Q);if(M.matrixWorldAutoUpdate===!0&&M.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),Re.enabled===!0&&Re.isPresenting===!0&&(w===null||w.isCompositing()===!1)&&(Re.cameraAutoUpdate===!0&&Re.updateCamera(U),U=Re.getCamera()),M.isScene===!0&&M.onBeforeRender(C,M,U,Q),y=pe.get(M,_.length),y.init(U),y.state.textureUnits=ee.getTextureUnits(),_.push(y),Ye.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),Ve.setFromProjectionMatrix(Ye,On,U.reversedDepth),ct=this.localClippingEnabled,Xe=Ae.init(this.clippingPlanes,ct),T=_e.get(M,A.length),T.init(),A.push(T),Re.enabled===!0&&Re.isPresenting===!0){let Te=C.xr.getDepthSensingMesh();Te!==null&&et(Te,U,-1/0,C.sortObjects)}et(M,U,0,C.sortObjects),T.finish(),L!==null&&L.updateLights(y.state.lightsArray),C.sortObjects===!0&&T.sort(z,xe),Tt=Re.enabled===!1||Re.isPresenting===!1||Re.hasDepthSensing()===!1,Tt&&qe.addToRenderList(T,M),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Xe===!0&&Ae.beginShadows();let Y=y.state.shadowsArray;if(ze.render(Y,M,U),Xe===!0&&Ae.endShadows(),(q&&w.hasRenderPass())===!1){let Te=T.opaque,Se=T.transmissive;if(y.setupLights(),U.isArrayCamera){let Ie=U.cameras;if(Se.length>0)for(let Fe=0,Je=Ie.length;Fe<Je;Fe++){let nt=Ie[Fe];He(Te,Se,M,nt)}Tt&&qe.render(M);for(let Fe=0,Je=Ie.length;Fe<Je;Fe++){let nt=Ie[Fe];Ce(T,M,nt,nt.viewport)}}else Se.length>0&&He(Te,Se,M,U),Tt&&qe.render(M),Ce(T,M,U)}Q!==null&&V===0&&(ee.updateMultisampleRenderTarget(Q),ee.updateRenderTargetMipmap(Q)),q&&w.end(C),M.isScene===!0&&M.onAfterRender(C,M,U),ye.resetDefaultState(),W=-1,O=null,_.pop(),_.length>0?(y=_[_.length-1],ee.setTextureUnits(y.state.textureUnits),Xe===!0&&Ae.setGlobalState(C.clippingPlanes,y.state.camera)):y=null,A.pop(),A.length>0?T=A[A.length-1]:T=null,L!==null&&L.renderEnd()};function et(M,U,$,q){if(M.visible===!1)return;if(M.layers.test(U.layers)){if(M.isGroup)$=M.renderOrder;else if(M.isLOD)M.autoUpdate===!0&&M.update(U);else if(M.isLightProbeGrid)y.pushLightProbeGrid(M);else if(M.isLight)y.pushLight(M),M.castShadow&&y.pushShadow(M);else if(M.isSprite){if(!M.frustumCulled||M.intersectsFrustum(Ve)){q&&Ct.setFromMatrixPosition(M.matrixWorld).applyMatrix4(Ye);let Te=ne.update(M),Se=M.material;Se.visible&&T.push(M,Te,Se,$,Ct.z,null,U)}}else if((M.isMesh||M.isLine||M.isPoints)&&(!M.frustumCulled||M.intersectsFrustum(Ve))){let Te=ne.update(M),Se=M.material;if(q&&(M.boundingSphere!==void 0?(M.boundingSphere===null&&M.computeBoundingSphere(),Ct.copy(M.boundingSphere.center)):(Te.boundingSphere===null&&Te.computeBoundingSphere(),Ct.copy(Te.boundingSphere.center)),Ct.applyMatrix4(M.matrixWorld).applyMatrix4(Ye)),Array.isArray(Se)){let Ie=Te.groups;for(let Fe=0,Je=Ie.length;Fe<Je;Fe++){let nt=Ie[Fe],Pe=Se[nt.materialIndex];Pe&&Pe.visible&&T.push(M,Te,Pe,$,Ct.z,nt,U)}}else Se.visible&&T.push(M,Te,Se,$,Ct.z,null,U)}}let be=M.children;for(let Te=0,Se=be.length;Te<Se;Te++)et(be[Te],U,$,q)}function Ce(M,U,$,q){let{opaque:Y,transmissive:be,transparent:Te}=M;y.setupLightsView($),Xe===!0&&Ae.setGlobalState(C.clippingPlanes,$),q&&x.viewport(Z.copy(q)),Y.length>0&&Lt(Y,U,$),be.length>0&&Lt(be,U,$),Te.length>0&&Lt(Te,U,$),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function He(M,U,$,q){if(($.isScene===!0?$.overrideMaterial:null)!==null)return;if(y.state.transmissionRenderTarget[q.id]===void 0){let Pe=ht.has("EXT_color_buffer_half_float")||ht.has("EXT_color_buffer_float");y.state.transmissionRenderTarget[q.id]=new pn(1,1,{generateMipmaps:!0,type:Pe?Gn:vn,minFilter:Vn,samples:Math.max(4,E.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:je.workingColorSpace})}let be=y.state.transmissionRenderTarget[q.id],Te=q.viewport||Z;be.setSize(Te.z*C.transmissionResolutionScale,Te.w*C.transmissionResolutionScale);let Se=C.getRenderTarget(),Ie=C.getActiveCubeFace(),Fe=C.getActiveMipmapLevel();C.setRenderTarget(be),C.getClearColor(ie),oe=C.getClearAlpha(),oe<1&&C.setClearColor(16777215,.5),C.clear(),Tt&&qe.render($);let Je=C.toneMapping;C.toneMapping=kn;let nt=q.viewport;if(q.viewport!==void 0&&(q.viewport=void 0),y.setupLightsView(q),Xe===!0&&Ae.setGlobalState(C.clippingPlanes,q),Lt(M,$,q),ee.updateMultisampleRenderTarget(be),ee.updateRenderTargetMipmap(be),ht.has("WEBGL_multisampled_render_to_texture")===!1){let Pe=!1;for(let mt=0,zt=U.length;mt<zt;mt++){let Rt=U[mt],{object:bt,geometry:nn,material:we,group:cn}=Rt;if(we.side===yn&&bt.layers.test(q.layers)){let lt=we.side;we.side=en,we.needsUpdate=!0,xt(bt,$,q,nn,we,cn),we.side=lt,we.needsUpdate=!0,Pe=!0}}Pe===!0&&(ee.updateMultisampleRenderTarget(be),ee.updateRenderTargetMipmap(be))}C.setRenderTarget(Se,Ie,Fe),C.setClearColor(ie,oe),nt!==void 0&&(q.viewport=nt),C.toneMapping=Je}function Lt(M,U,$){let q=U.isScene===!0?U.overrideMaterial:null;for(let Y=0,be=M.length;Y<be;Y++){let Te=M[Y],{object:Se,geometry:Ie,group:Fe}=Te,Je=Te.material;Je.allowOverride===!0&&q!==null&&(Je=q),Se.layers.test($.layers)&&xt(Se,U,$,Ie,Je,Fe)}}function xt(M,U,$,q,Y,be){L!==null&&Y.isNodeMaterial&&L.setObject(M,Y),M.onBeforeRender(C,U,$,q,Y,be),M.modelViewMatrix.multiplyMatrices($.matrixWorldInverse,M.matrixWorld),M.normalMatrix.getNormalMatrix(M.modelViewMatrix),Y.onBeforeRender(C,U,$,q,M,be),Y.transparent===!0&&Y.side===yn&&Y.forceSinglePass===!1?(Y.side=en,Y.needsUpdate=!0,C.renderBufferDirect($,U,q,Y,M,be),Y.side=Qn,Y.needsUpdate=!0,C.renderBufferDirect($,U,q,Y,M,be),Y.side=yn):C.renderBufferDirect($,U,q,Y,M,be),M.onAfterRender(C,U,$,q,Y,be)}function Gt(M,U,$){U.isScene!==!0&&(U=Vt);let q=K.get(M),Y=y.state.lights,be=y.state.shadowsArray,Te=Y.state.version,Se=de.getParameters(M,Y.state,be,U,$,y.state.lightProbeGridArray),Ie=de.getProgramCacheKey(Se),Fe=q.programs;q.environment=M.isMeshStandardMaterial||M.isMeshLambertMaterial||M.isMeshPhongMaterial?U.environment:null,q.fog=U.fog;let Je=M.isMeshStandardMaterial||M.isMeshLambertMaterial&&!M.envMap||M.isMeshPhongMaterial&&!M.envMap;q.envMap=ue.get(M.envMap||q.environment,Je),q.envMapRotation=q.environment!==null&&M.envMap===null?U.environmentRotation:M.envMapRotation,Fe===void 0&&(M.addEventListener("dispose",Ee),Fe=new Map,q.programs=Fe);let nt=Fe.get(Ie);if(nt!==void 0){if(q.currentProgram===nt&&q.lightsStateVersion===Te)return Jt(M,Se),nt}else Se.uniforms=de.getUniforms(M),L!==null&&M.isNodeMaterial&&L.build(M,$,Se),M.onBeforeCompile(Se,C),nt=de.acquireProgram(Se,Ie),Fe.set(Ie,nt),q.uniforms=Se.uniforms;let Pe=q.uniforms;return(!M.isShaderMaterial&&!M.isRawShaderMaterial||M.clipping===!0)&&(Pe.clippingPlanes=Ae.uniform),Jt(M,Se),q.needsLights=Wt(M),q.lightsStateVersion=Te,q.needsLights&&(Pe.ambientLightColor.value=Y.state.ambient,Pe.lightProbe.value=Y.state.probe,Pe.sunLights.value=Y.state.sun,Pe.sunLightShadows.value=Y.state.sunShadow,Pe.directionalLights.value=Y.state.directional,Pe.directionalLightShadows.value=Y.state.directionalShadow,Pe.spotLights.value=Y.state.spot,Pe.spotLightShadows.value=Y.state.spotShadow,Pe.rectAreaLights.value=Y.state.rectArea,Pe.ltc_1.value=Y.state.rectAreaLTC1,Pe.ltc_2.value=Y.state.rectAreaLTC2,Pe.pointLights.value=Y.state.point,Pe.pointLightShadows.value=Y.state.pointShadow,Pe.hemisphereLights.value=Y.state.hemi,Pe.sunShadowMatrix.value=Y.state.sunShadowMatrix,Pe.sunShadowCascade.value=Y.state.sunShadowCascade,Pe.directionalShadowMatrix.value=Y.state.directionalShadowMatrix,Pe.spotLightMatrix.value=Y.state.spotLightMatrix,Pe.spotLightMap.value=Y.state.spotLightMap,Pe.pointShadowMatrix.value=Y.state.pointShadowMatrix),q.lightProbeGrid=y.state.lightProbeGridArray.length>0,q.currentProgram=nt,q.uniformsList=null,nt}function Kt(M){if(M.uniformsList===null){let U=M.currentProgram.getUniforms();M.uniformsList=Ks.seqWithValue(U.seq,M.uniforms)}return M.uniformsList}function Jt(M,U){let $=K.get(M);$.outputColorSpace=U.outputColorSpace,$.batching=U.batching,$.batchingColor=U.batchingColor,$.instancing=U.instancing,$.instancingColor=U.instancingColor,$.instancingMorph=U.instancingMorph,$.skinning=U.skinning,$.morphTargets=U.morphTargets,$.morphNormals=U.morphNormals,$.morphColors=U.morphColors,$.morphTargetsCount=U.morphTargetsCount,$.numClippingPlanes=U.numClippingPlanes,$.numIntersection=U.numClipIntersection,$.vertexAlphas=U.vertexAlphas,$.vertexTangents=U.vertexTangents,$.toneMapping=U.toneMapping}function An(M,U){if(M.length===0)return null;if(M.length===1)return M[0].texture!==null?M[0]:null;S.setFromMatrixPosition(U.matrixWorld);for(let $=0,q=M.length;$<q;$++){let Y=M[$];if(Y.texture!==null&&Y.boundingBox.containsPoint(S))return Y}return null}function It(M,U,$,q,Y){U.isScene!==!0&&(U=Vt),ee.resetTextureUnits();let be=U.fog,Te=q.isMeshStandardMaterial||q.isMeshLambertMaterial||q.isMeshPhongMaterial?U.environment:null,Se=Q===null?C.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:je.workingColorSpace,Ie=q.isMeshStandardMaterial||q.isMeshLambertMaterial&&!q.envMap||q.isMeshPhongMaterial&&!q.envMap,Fe=ue.get(q.envMap||Te,Ie),Je=q.vertexColors===!0&&!!$.attributes.color&&$.attributes.color.itemSize===4,nt=!!$.attributes.tangent&&(!!q.normalMap||q.anisotropy>0),Pe=!!$.morphAttributes.position,mt=!!$.morphAttributes.normal,zt=!!$.morphAttributes.color,Rt=kn;q.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(Rt=C.toneMapping);let bt=$.morphAttributes.position||$.morphAttributes.normal||$.morphAttributes.color,nn=bt!==void 0?bt.length:0,we=K.get(q),cn=y.state.lights;if(Xe===!0&&(ct===!0||M!==O)){let At=M===O&&q.id===W;Ae.setState(q,M,At)}let lt=!1;q.version===we.__version?(we.needsLights&&we.lightsStateVersion!==cn.state.version||we.outputColorSpace!==Se||Y.isBatchedMesh&&we.batching===!1||!Y.isBatchedMesh&&we.batching===!0||Y.isBatchedMesh&&we.batchingColor===!0&&Y._colorsTexture===null||Y.isBatchedMesh&&we.batchingColor===!1&&Y._colorsTexture!==null||Y.isInstancedMesh&&we.instancing===!1||!Y.isInstancedMesh&&we.instancing===!0||Y.isSkinnedMesh&&we.skinning===!1||!Y.isSkinnedMesh&&we.skinning===!0||Y.isInstancedMesh&&we.instancingColor===!0&&Y.instanceColor===null||Y.isInstancedMesh&&we.instancingColor===!1&&Y.instanceColor!==null||Y.isInstancedMesh&&we.instancingMorph===!0&&Y.morphTexture===null||Y.isInstancedMesh&&we.instancingMorph===!1&&Y.morphTexture!==null||we.envMap!==Fe||q.fog===!0&&we.fog!==be||we.numClippingPlanes!==void 0&&(we.numClippingPlanes!==Ae.numPlanes||we.numIntersection!==Ae.numIntersection)||we.vertexAlphas!==Je||we.vertexTangents!==nt||we.morphTargets!==Pe||we.morphNormals!==mt||we.morphColors!==zt||we.toneMapping!==Rt||we.morphTargetsCount!==nn||!!we.lightProbeGrid!=y.state.lightProbeGridArray.length>0)&&(lt=!0):(lt=!0,we.__version=q.version);let En=we.currentProgram;lt===!0&&(En=Gt(q,U,Y),L&&q.isNodeMaterial&&L.onUpdateProgram(q,En,we));let Wn=!1,yi=!1,ls=!1,Mt=En.getUniforms(),Nt=we.uniforms;if(x.useProgram(En.program)&&(Wn=!0,yi=!0,ls=!0),q.id!==W&&(W=q.id,yi=!0),we.needsLights){let At=An(y.state.lightProbeGridArray,Y);we.lightProbeGrid!==At&&(we.lightProbeGrid=At,yi=!0)}if(Wn||O!==M){x.buffers.depth.getReversed()&&M.reversedDepth!==!0&&(M._reversedDepth=!0,M.updateProjectionMatrix()),Mt.setValue(B,"projectionMatrix",M.projectionMatrix),Mt.setValue(B,"viewMatrix",M.matrixWorldInverse);let Mi=Mt.map.cameraPosition;Mi!==void 0&&Mi.setValue(B,ft.setFromMatrixPosition(M.matrixWorld)),E.logarithmicDepthBuffer&&Mt.setValue(B,"logDepthBufFC",2/(Math.log(M.far+1)/Math.LN2)),(q.isMeshPhongMaterial||q.isMeshToonMaterial||q.isMeshLambertMaterial||q.isMeshBasicMaterial||q.isMeshStandardMaterial||q.isShaderMaterial)&&Mt.setValue(B,"isOrthographic",M.isOrthographicCamera===!0),O!==M&&(O=M,yi=!0,ls=!0)}if(we.needsLights&&(cn.state.sunShadowMap.length>0&&Mt.setValue(B,"sunShadowMap",cn.state.sunShadowMap,ee),cn.state.directionalShadowMap.length>0&&Mt.setValue(B,"directionalShadowMap",cn.state.directionalShadowMap,ee),cn.state.spotShadowMap.length>0&&Mt.setValue(B,"spotShadowMap",cn.state.spotShadowMap,ee),cn.state.pointShadowMap.length>0&&Mt.setValue(B,"pointShadowMap",cn.state.pointShadowMap,ee)),Y.isSkinnedMesh){Mt.setOptional(B,Y,"bindMatrix"),Mt.setOptional(B,Y,"bindMatrixInverse");let At=Y.skeleton;At&&(At.boneTexture===null&&At.computeBoneTexture(),Mt.setValue(B,"boneTexture",At.boneTexture,ee))}Y.isBatchedMesh&&(Mt.setOptional(B,Y,"batchingTexture"),Mt.setValue(B,"batchingTexture",Y._matricesTexture,ee),Mt.setOptional(B,Y,"batchingIdTexture"),Mt.setValue(B,"batchingIdTexture",Y._indirectTexture,ee),Mt.setOptional(B,Y,"batchingColorTexture"),Y._colorsTexture!==null&&Mt.setValue(B,"batchingColorTexture",Y._colorsTexture,ee));let vi=$.morphAttributes;if((vi.position!==void 0||vi.normal!==void 0||vi.color!==void 0)&&F.update(Y,$,En),(yi||we.receiveShadow!==Y.receiveShadow)&&(we.receiveShadow=Y.receiveShadow,Mt.setValue(B,"receiveShadow",Y.receiveShadow)),(q.isMeshStandardMaterial||q.isMeshLambertMaterial||q.isMeshPhongMaterial)&&q.envMap===null&&U.environment!==null&&(Nt.envMapIntensity.value=U.environmentIntensity),Nt.dfgLUT!==void 0&&(Nt.dfgLUT.value=M3()),yi){if(Mt.setValue(B,"toneMappingExposure",C.toneMappingExposure),we.needsLights&&Pn(Nt,ls),be&&q.fog===!0&&Ne.refreshFogUniforms(Nt,be),Ne.refreshMaterialUniforms(Nt,q,j,X,y.state.transmissionRenderTarget[M.id]),we.needsLights&&we.lightProbeGrid){let At=we.lightProbeGrid;Nt.probesSH.value=At.texture,Nt.probesMin.value.copy(At.boundingBox.min),Nt.probesMax.value.copy(At.boundingBox.max),Nt.probesResolution.value.copy(At.resolution)}Ks.upload(B,Kt(we),Nt,ee)}if(q.isShaderMaterial&&q.uniformsNeedUpdate===!0&&(Ks.upload(B,Kt(we),Nt,ee),q.uniformsNeedUpdate=!1),q.isSpriteMaterial&&Mt.setValue(B,"center",Y.center),Mt.setValue(B,"modelViewMatrix",Y.modelViewMatrix),Mt.setValue(B,"normalMatrix",Y.normalMatrix),Mt.setValue(B,"modelMatrix",Y.matrixWorld),q.uniformsGroups!==void 0){let At=q.uniformsGroups;for(let Mi=0,cs=At.length;Mi<cs;Mi++){let sc=At[Mi];ae.update(sc,En),ae.bind(sc,En)}}return En}function Pn(M,U){M.ambientLightColor.needsUpdate=U,M.lightProbe.needsUpdate=U,M.sunLights.needsUpdate=U,M.sunLightShadows.needsUpdate=U,M.directionalLights.needsUpdate=U,M.directionalLightShadows.needsUpdate=U,M.pointLights.needsUpdate=U,M.pointLightShadows.needsUpdate=U,M.spotLights.needsUpdate=U,M.spotLightShadows.needsUpdate=U,M.rectAreaLights.needsUpdate=U,M.hemisphereLights.needsUpdate=U}function Wt(M){return M.isMeshLambertMaterial||M.isMeshToonMaterial||M.isMeshPhongMaterial||M.isMeshStandardMaterial||M.isShadowMaterial||M.isShaderMaterial&&M.lights===!0}this.getActiveCubeFace=function(){return G},this.getActiveMipmapLevel=function(){return V},this.getRenderTarget=function(){return Q},this.setRenderTargetTextures=function(M,U,$){let q=K.get(M);q.__autoAllocateDepthBuffer=M.resolveDepthBuffer===!1,q.__autoAllocateDepthBuffer===!1&&(q.__useRenderToTexture=!1),K.get(M.texture).__webglTexture=U,K.get(M.depthTexture).__webglTexture=q.__autoAllocateDepthBuffer?void 0:$,q.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(M,U){let $=K.get(M);$.__webglFramebuffer=U,$.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(M,U=0,$=0){Q=M,G=U,V=$;let q=null,Y=!1,be=!1;if(M){let Se=K.get(M);if(Se.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(B.FRAMEBUFFER,Se.__webglFramebuffer),Z.copy(M.viewport),le.copy(M.scissor),Me=M.scissorTest,x.viewport(Z),x.scissor(le),x.setScissorTest(Me),W=-1;return}else if(Se.__webglFramebuffer===void 0)ee.setupRenderTarget(M);else if(Se.__hasExternalTextures)ee.rebindTextures(M,K.get(M.texture).__webglTexture,K.get(M.depthTexture).__webglTexture);else if(M.depthBuffer){let Je=M.depthTexture;if(Se.__boundDepthTexture!==Je){if(Je!==null&&K.has(Je)&&(M.width!==Je.image.width||M.height!==Je.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");ee.setupDepthRenderbuffer(M)}}let Ie=M.texture;(Ie.isData3DTexture||Ie.isDataArrayTexture||Ie.isCompressedArrayTexture)&&(be=!0);let Fe=K.get(M).__webglFramebuffer;M.isWebGLCubeRenderTarget?(Array.isArray(Fe[U])?q=Fe[U][$]:q=Fe[U],Y=!0):M.samples>0&&ee.useMultisampledRTT(M)===!1?q=K.get(M).__webglMultisampledFramebuffer:Array.isArray(Fe)?q=Fe[$]:q=Fe,Z.copy(M.viewport),le.copy(M.scissor),Me=M.scissorTest}else Z.copy(he).multiplyScalar(j).floor(),le.copy(Le).multiplyScalar(j).floor(),Me=st;if($!==0&&(q=N),x.bindFramebuffer(B.FRAMEBUFFER,q)&&x.drawBuffers(M,q),x.viewport(Z),x.scissor(le),x.setScissorTest(Me),Y){let Se=K.get(M.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+U,Se.__webglTexture,$)}else if(be){let Se=U;for(let Ie=0;Ie<M.textures.length;Ie++){let Fe=K.get(M.textures[Ie]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+Ie,Fe.__webglTexture,$,Se)}}else if(M!==null&&$!==0){let Se=K.get(M.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Se.__webglTexture,$)}W=-1};function ln(M){let U=K.get(M);return(U.__readFormat!==M.format||U.__readType!==M.type)&&(U.__readFormat=M.format,U.__readType=M.type,U.__formatReadable=E.textureFormatReadable(M.format),U.__typeReadable=E.textureTypeReadable(M.type)),U}this.readRenderTargetPixels=function(M,U,$,q,Y,be,Te,Se=0){if(!(M&&M.isWebGLRenderTarget)){Ge("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ie=K.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Te!==void 0&&(Ie=Ie[Te]),Ie){x.bindFramebuffer(B.FRAMEBUFFER,Ie);try{let Fe=M.textures[Se],Je=Fe.format,nt=Fe.type;M.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Se);let Pe=ln(Fe);if(Pe.__formatReadable===!1){Ge("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Pe.__typeReadable===!1){Ge("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=M.width-q&&$>=0&&$<=M.height-Y&&B.readPixels(U,$,q,Y,me.convert(Je),me.convert(nt),be)}finally{let Fe=Q!==null?K.get(Q).__webglFramebuffer:null;x.bindFramebuffer(B.FRAMEBUFFER,Fe)}}},this.readRenderTargetPixelsAsync=async function(M,U,$,q,Y,be,Te,Se=0){if(!(M&&M.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ie=K.get(M).__webglFramebuffer;if(M.isWebGLCubeRenderTarget&&Te!==void 0&&(Ie=Ie[Te]),Ie)if(U>=0&&U<=M.width-q&&$>=0&&$<=M.height-Y){x.bindFramebuffer(B.FRAMEBUFFER,Ie);let Fe=M.textures[Se],Je=Fe.format,nt=Fe.type;M.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Se);let Pe=ln(Fe);if(Pe.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Pe.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let mt=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,mt),B.bufferData(B.PIXEL_PACK_BUFFER,be.byteLength,B.STREAM_READ),B.readPixels(U,$,q,Y,me.convert(Je),me.convert(nt),0),B.bindBuffer(B.PIXEL_PACK_BUFFER,null);let zt=Q!==null?K.get(Q).__webglFramebuffer:null;x.bindFramebuffer(B.FRAMEBUFFER,zt);let Rt=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await bh(B,Rt,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,mt),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,be),B.bindBuffer(B.PIXEL_PACK_BUFFER,null),B.deleteBuffer(mt),B.deleteSync(Rt),be}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(M,U=null,$=0){let q=Math.pow(2,-$),Y=Math.floor(M.image.width*q),be=Math.floor(M.image.height*q),Te=U!==null?U.x:0,Se=U!==null?U.y:0;ee.setTexture2D(M,0),B.copyTexSubImage2D(B.TEXTURE_2D,$,0,0,Te,Se,Y,be),x.unbindTexture()},this.copyTextureToTexture=function(M,U,$=null,q=null,Y=0,be=0){let Te,Se,Ie,Fe,Je,nt,Pe,mt,zt,Rt=M.isCompressedTexture?M.mipmaps[be]:M.image;if($!==null)Te=$.max.x-$.min.x,Se=$.max.y-$.min.y,Ie=$.isBox3?$.max.z-$.min.z:1,Fe=$.min.x,Je=$.min.y,nt=$.isBox3?$.min.z:0;else{let Nt=Math.pow(2,-Y);Te=Math.floor(Rt.width*Nt),Se=Math.floor(Rt.height*Nt),M.isDataArrayTexture?Ie=Rt.depth:M.isData3DTexture?Ie=Math.floor(Rt.depth*Nt):Ie=1,Fe=0,Je=0,nt=0}q!==null?(Pe=q.x,mt=q.y,zt=q.z):(Pe=0,mt=0,zt=0);let bt=me.convert(U.format),nn=me.convert(U.type),we;U.isData3DTexture?(ee.setTexture3D(U,0),we=B.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(ee.setTexture2DArray(U,0),we=B.TEXTURE_2D_ARRAY):(ee.setTexture2D(U,0),we=B.TEXTURE_2D),x.activeTexture(B.TEXTURE0),x.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,U.flipY),x.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),x.pixelStorei(B.UNPACK_ALIGNMENT,U.unpackAlignment);let cn=x.getParameter(B.UNPACK_ROW_LENGTH),lt=x.getParameter(B.UNPACK_IMAGE_HEIGHT),En=x.getParameter(B.UNPACK_SKIP_PIXELS),Wn=x.getParameter(B.UNPACK_SKIP_ROWS),yi=x.getParameter(B.UNPACK_SKIP_IMAGES);x.pixelStorei(B.UNPACK_ROW_LENGTH,Rt.width),x.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Rt.height),x.pixelStorei(B.UNPACK_SKIP_PIXELS,Fe),x.pixelStorei(B.UNPACK_SKIP_ROWS,Je),x.pixelStorei(B.UNPACK_SKIP_IMAGES,nt);let ls=M.isDataArrayTexture||M.isData3DTexture,Mt=U.isDataArrayTexture||U.isData3DTexture;if(M.isDepthTexture){let Nt=K.get(M),vi=K.get(U),At=K.get(Nt.__renderTarget),Mi=K.get(vi.__renderTarget);x.bindFramebuffer(B.READ_FRAMEBUFFER,At.__webglFramebuffer),x.bindFramebuffer(B.DRAW_FRAMEBUFFER,Mi.__webglFramebuffer);for(let cs=0;cs<Ie;cs++)ls&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,K.get(M).__webglTexture,Y,nt+cs),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,K.get(U).__webglTexture,be,zt+cs)),B.blitFramebuffer(Fe,Je,Te,Se,Pe,mt,Te,Se,B.DEPTH_BUFFER_BIT,B.NEAREST);x.bindFramebuffer(B.READ_FRAMEBUFFER,null),x.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if(Y!==0||M.isRenderTargetTexture||K.has(M)){let Nt=K.get(M),vi=K.get(U);x.bindFramebuffer(B.READ_FRAMEBUFFER,I),x.bindFramebuffer(B.DRAW_FRAMEBUFFER,k);for(let At=0;At<Ie;At++)ls?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,Nt.__webglTexture,Y,nt+At):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Nt.__webglTexture,Y),Mt?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,vi.__webglTexture,be,zt+At):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,vi.__webglTexture,be),Y!==0?B.blitFramebuffer(Fe,Je,Te,Se,Pe,mt,Te,Se,B.COLOR_BUFFER_BIT,B.NEAREST):Mt?B.copyTexSubImage3D(we,be,Pe,mt,zt+At,Fe,Je,Te,Se):B.copyTexSubImage2D(we,be,Pe,mt,Fe,Je,Te,Se);x.bindFramebuffer(B.READ_FRAMEBUFFER,null),x.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else Mt?M.isDataTexture||M.isData3DTexture?B.texSubImage3D(we,be,Pe,mt,zt,Te,Se,Ie,bt,nn,Rt.data):U.isCompressedArrayTexture?B.compressedTexSubImage3D(we,be,Pe,mt,zt,Te,Se,Ie,bt,Rt.data):B.texSubImage3D(we,be,Pe,mt,zt,Te,Se,Ie,bt,nn,Rt):M.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,be,Pe,mt,Te,Se,bt,nn,Rt.data):M.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,be,Pe,mt,Rt.width,Rt.height,bt,Rt.data):B.texSubImage2D(B.TEXTURE_2D,be,Pe,mt,Te,Se,bt,nn,Rt);x.pixelStorei(B.UNPACK_ROW_LENGTH,cn),x.pixelStorei(B.UNPACK_IMAGE_HEIGHT,lt),x.pixelStorei(B.UNPACK_SKIP_PIXELS,En),x.pixelStorei(B.UNPACK_SKIP_ROWS,Wn),x.pixelStorei(B.UNPACK_SKIP_IMAGES,yi),be===0&&U.generateMipmaps&&B.generateMipmap(we),x.unbindTexture()},this.initRenderTarget=function(M){K.get(M).__webglFramebuffer===void 0&&ee.setupRenderTarget(M)},this.initTexture=function(M){M.isCubeTexture?ee.setTextureCube(M,0):M.isData3DTexture?ee.setTexture3D(M,0):M.isDataArrayTexture||M.isCompressedArrayTexture?ee.setTexture2DArray(M,0):ee.setTexture2D(M,0),x.unbindTexture()},this.resetState=function(){G=0,V=0,Q=null,x.reset(),ye.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return On}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=je._getDrawingBufferColorSpace(e),t.unpackColorSpace=je._getUnpackColorSpace()}};function Tl(i,e){if(e===tl)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===qs||e===Hr){let t=i.getIndex();if(t===null){let r=[],o=i.getAttribute("position");if(o!==void 0){for(let a=0;a<o.count;a++)r.push(a);i.setIndex(r),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}let n=t.count-2,s=[];if(e===qs)for(let r=1;r<=n;r++)s.push(t.getX(0)),s.push(t.getX(r)),s.push(t.getX(r+1));else for(let r=0;r<n;r++)r%2===0?(s.push(t.getX(r)),s.push(t.getX(r+1)),s.push(t.getX(r+2))):(s.push(t.getX(r+2)),s.push(t.getX(r+1)),s.push(t.getX(r)));return s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."),i.setIndex(s),i.clearGroups(),i}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}function iu(i){let e=new Map,t=new Map,n=i.clone();return su(i,n,function(s,r){e.set(r,s),t.set(s,r)}),n.traverse(function(s){if(!s.isSkinnedMesh)return;let r=s,o=e.get(s),a=o.skeleton.bones;r.skeleton=o.skeleton.clone(),r.bindMatrix.copy(o.bindMatrix),r.skeleton.bones=a.map(function(c){return t.get(c)}),r.bind(r.skeleton,r.bindMatrix)}),n}function su(i,e,t){t(i,e);for(let n=0;n<i.children.length;n++)su(i.children[n],e.children[n],t)}var Ya=class extends $n{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Ll(t)}),this.register(function(t){return new Nl(t)}),this.register(function(t){return new Hl(t)}),this.register(function(t){return new Gl(t)}),this.register(function(t){return new Wl(t)}),this.register(function(t){return new Ul(t)}),this.register(function(t){return new Fl(t)}),this.register(function(t){return new Ol(t)}),this.register(function(t){return new Bl(t)}),this.register(function(t){return new Pl(t)}),this.register(function(t){return new zl(t)}),this.register(function(t){return new Dl(t)}),this.register(function(t){return new Vl(t)}),this.register(function(t){return new kl(t)}),this.register(function(t){return new Cl(t)}),this.register(function(t){return new Za(t,tt.EXT_MESHOPT_COMPRESSION)}),this.register(function(t){return new Za(t,tt.KHR_MESHOPT_COMPRESSION)}),this.register(function(t){return new Xl(t)})}load(e,t,n,s){let r=this,o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){let l=gi.extractUrlBase(e);o=gi.resolveURL(l,this.path)}else o=gi.extractUrlBase(e);this.manager.itemStart(e);let a=function(l){s?s(l):console.error(l),r.manager.itemError(e),r.manager.itemEnd(e)},c=new zs(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{r.parse(l,o,function(h){t(h),r.manager.itemEnd(e)},a)}catch(h){a(h)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r,o={},a={},c=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===cu){try{o[tt.KHR_BINARY_GLTF]=new ql(e)}catch(u){s&&s(u);return}r=JSON.parse(o[tt.KHR_BINARY_GLTF].content)}else r=JSON.parse(c.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}let l=new Ql(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){let u=this.pluginCallbacks[h](l);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[u.name]=u,o[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){let u=r.extensionsUsed[h],d=r.extensionsRequired||[];switch(u){case tt.KHR_MATERIALS_UNLIT:o[u]=new Il;break;case tt.KHR_DRACO_MESH_COMPRESSION:o[u]=new Yl(r,this.dracoLoader);break;case tt.KHR_TEXTURE_TRANSFORM:o[u]=new Zl;break;case tt.KHR_MESH_QUANTIZATION:o[u]=new Kl;break;default:d.indexOf(u)>=0&&a[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}l.setExtensions(o),l.setPlugins(a),l.parse(n,s)}parseAsync(e,t){let n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}};function b3(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}function Bt(i,e,t){let n=i.json.materials[e];return n.extensions&&n.extensions[t]?n.extensions[t]:null}var tt={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",KHR_MESHOPT_COMPRESSION:"KHR_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"},Cl=class{constructor(e){this.parser=e,this.name=tt.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){let e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){let r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){let t=this.parser,n="light:"+e,s=t.cache.get(n);if(s)return s;let r=t.json,c=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e],l,h=new ke(16777215);c.color!==void 0&&h.setRGB(c.color[0],c.color[1],c.color[2],dn);let u=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new es(h),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new Qi(h),l.distance=u;break;case"spot":l=new Pr(h),l.distance=u,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),ii(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),s=Promise.resolve(l),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){let t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(c){return n._getNodeRef(t.cache,a,c)})}},Il=class{constructor(){this.name=tt.KHR_MATERIALS_UNLIT}getMaterialType(){return zn}extendParams(e,t,n){let s=[];e.color=new ke(1,1,1),e.opacity=1;let r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){let o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],dn),e.opacity=o[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,Dt))}return Promise.all(s)}},Pl=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){let n=Bt(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}},Ll=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return Bt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Bt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatMap",n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatRoughnessMap",n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(s.push(this.parser.assignTexture(t,"clearcoatNormalMap",n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){let r=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Ze(r,r)}return Promise.all(s)}},Nl=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_DISPERSION}getMaterialType(e){return Bt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Bt(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion!==void 0?n.dispersion:0),Promise.resolve()}},Dl=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return Bt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Bt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceMap",n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceThicknessMap",n.iridescenceThicknessTexture)),Promise.all(s)}},Ul=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_SHEEN}getMaterialType(e){return Bt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Bt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];if(t.sheenColor=new ke(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){let r=n.sheenColorFactor;t.sheenColor.setRGB(r[0],r[1],r[2],dn)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenColorMap",n.sheenColorTexture,Dt)),n.sheenRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenRoughnessMap",n.sheenRoughnessTexture)),Promise.all(s)}},Fl=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return Bt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Bt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&s.push(this.parser.assignTexture(t,"transmissionMap",n.transmissionTexture)),Promise.all(s)}},Ol=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_VOLUME}getMaterialType(e){return Bt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Bt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];t.thickness=n.thicknessFactor!==void 0?n.thicknessFactor:0,n.thicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"thicknessMap",n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;let r=n.attenuationColor||[1,1,1];return t.attenuationColor=new ke().setRGB(r[0],r[1],r[2],dn),Promise.all(s)}},Bl=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_IOR}getMaterialType(e){return Bt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Bt(this.parser,e,this.name);return n===null||(t.ior=n.ior!==void 0?n.ior:1.5,t.ior===0&&(t.ior=1e3)),Promise.resolve()}},zl=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_SPECULAR}getMaterialType(e){return Bt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Bt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];t.specularIntensity=n.specularFactor!==void 0?n.specularFactor:1,n.specularTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularIntensityMap",n.specularTexture));let r=n.specularColorFactor||[1,1,1];return t.specularColor=new ke().setRGB(r[0],r[1],r[2],dn),n.specularColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularColorMap",n.specularColorTexture,Dt)),Promise.all(s)}},kl=class{constructor(e){this.parser=e,this.name=tt.EXT_MATERIALS_BUMP}getMaterialType(e){return Bt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Bt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return t.bumpScale=n.bumpFactor!==void 0?n.bumpFactor:1,n.bumpTexture!==void 0&&s.push(this.parser.assignTexture(t,"bumpMap",n.bumpTexture)),Promise.all(s)}},Vl=class{constructor(e){this.parser=e,this.name=tt.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return Bt(this.parser,e,this.name)!==null?_n:null}extendMaterialParams(e,t){let n=Bt(this.parser,e,this.name);if(n===null)return Promise.resolve();let s=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&s.push(this.parser.assignTexture(t,"anisotropyMap",n.anisotropyTexture)),Promise.all(s)}},Hl=class{constructor(e){this.parser=e,this.name=tt.KHR_TEXTURE_BASISU}loadTexture(e){let t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;let r=s.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}},Gl=class{constructor(e){this.parser=e,this.name=tt.EXT_TEXTURE_WEBP}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=s.images[o.source],c=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);l!==null&&(c=l)}return n.loadTextureImage(e,o.source,c)}},Wl=class{constructor(e){this.parser=e,this.name=tt.EXT_TEXTURE_AVIF}loadTexture(e){let t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;let o=r.extensions[t],a=s.images[o.source],c=n.textureLoader;if(a.uri){let l=n.options.manager.getHandler(a.uri);l!==null&&(c=l)}return n.loadTextureImage(e,o.source,c)}},Za=class{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){let t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){let s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){let c=s.byteOffset||0,l=s.byteLength||0,h=s.count,u=s.byteStride,d=new Uint8Array(a,c,l);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(h,u,d,s.mode,s.filter).then(function(f){return f.buffer}):o.ready.then(function(){let f=new ArrayBuffer(h*u);return o.decodeGltfBuffer(new Uint8Array(f),h,u,d,s.mode,s.filter),f})})}else return null}},Xl=class{constructor(e){this.name=tt.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){let t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;let s=t.meshes[n.mesh];for(let l of s.primitives)if(l.mode!==In.TRIANGLES&&l.mode!==In.TRIANGLE_STRIP&&l.mode!==In.TRIANGLE_FAN&&l.mode!==void 0)return null;let o=n.extensions[this.name].attributes,a=[],c={};for(let l in o)a.push(this.parser.getDependency("accessor",o[l]).then(h=>(c[l]=h,c[l])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(l=>{let h=l.pop(),u=h.isGroup?h.children:[h],d=l[0].count,f=[];for(let g of u){let v=new De,m=new P,p=new Ue,b=new P(1,1,1),R=new Ki(g.geometry,g.material,d);for(let T=0;T<d;T++)c.TRANSLATION&&m.fromBufferAttribute(c.TRANSLATION,T),c.ROTATION&&p.fromBufferAttribute(c.ROTATION,T),c.SCALE&&b.fromBufferAttribute(c.SCALE,T),R.setMatrixAt(T,v.compose(m,p,b));let S=null;for(let T in c)if(T==="_COLOR_0"){let y=c[T];R.instanceColor=new ui(y.array,y.itemSize,y.normalized)}else if(T!=="TRANSLATION"&&T!=="ROTATION"&&T!=="SCALE"){if(S===null){let A=R.geometry;S=new qt,S.name=A.name;for(let _ in A.attributes)S.setAttribute(_,A.attributes[_]);for(let _ in A.morphAttributes)S.morphAttributes[_]=A.morphAttributes[_];A.index!==null&&S.setIndex(A.index),S.morphTargetsRelative=A.morphTargetsRelative;for(let _ of A.groups)S.addGroup(_.start,_.count,_.materialIndex);A.boundingBox!==null&&(S.boundingBox=A.boundingBox.clone()),A.boundingSphere!==null&&(S.boundingSphere=A.boundingSphere.clone()),S.drawRange.start=A.drawRange.start,S.drawRange.count=A.drawRange.count,S.userData=Object.assign({},A.userData),R.geometry=S}let y=c[T];S.setAttribute(T,new ui(y.array,y.itemSize,y.normalized))}Et.prototype.copy.call(R,g),this.parser.assignFinalMaterial(R),f.push(R)}return h.isGroup?(h.clear(),h.add(...f),h):f[0]}))}},cu="glTF",Yr=12,ru={JSON:1313821514,BIN:5130562},ql=class{constructor(e){this.name=tt.KHR_BINARY_GLTF,this.content=null,this.body=null;let t=new DataView(e,0,Yr),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==cu)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");let s=this.header.length-Yr,r=new DataView(e,Yr),o=0;for(;o<s;){let a=r.getUint32(o,!0);o+=4;let c=r.getUint32(o,!0);if(o+=4,c===ru.JSON){let l=new Uint8Array(e,Yr+o,a);this.content=n.decode(l)}else if(c===ru.BIN){let l=Yr+o;this.body=e.slice(l,l+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}},Yl=class{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=tt.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){let n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},c={},l={};for(let h in o){let u=$l[h]||h.toLowerCase();a[u]=o[h]}for(let h in e.attributes){let u=$l[h]||h.toLowerCase();if(o[h]!==void 0){let d=n.accessors[e.attributes[h]],f=js[d.componentType];l[u]=f.name,c[u]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,d){s.decodeDracoFile(h,function(f){for(let g in f.attributes){let v=f.attributes[g],m=c[g];m!==void 0&&(v.normalized=m)}u(f)},a,l,dn,d)})})}},Zl=class{constructor(){this.name=tt.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),t.rotation!==void 0){let n=Math.cos(e.rotation),s=Math.sin(e.rotation);e.matrix.set(e.repeat.x*n,e.repeat.y*s,e.offset.x,-e.repeat.x*s,e.repeat.y*n,e.offset.y,0,0,1),e.matrixAutoUpdate=!1}return e.needsUpdate=!0,e}},Kl=class{constructor(){this.name=tt.KHR_MESH_QUANTIZATION}},Ka=class extends Jn{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let o=0;o!==s;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=a*2,l=a*3,h=s-t,u=(n-t)/h,d=u*u,f=d*u,g=e*l,v=g-l,m=-2*f+3*d,p=f-d,b=1-m,R=p-d+u;for(let S=0;S!==a;S++){let T=o[v+S+a],y=o[v+S+c]*h,A=o[g+S+a],_=o[g+S]*h;r[S]=b*T+R*y+m*A+p*_}return r}},w3=new Ue,Jl=class extends Ka{interpolate_(e,t,n,s){let r=super.interpolate_(e,t,n,s);return w3.fromArray(r).normalize().toArray(r),r}},In={FLOAT:5126,FLOAT_MAT3:35675,FLOAT_MAT4:35676,FLOAT_VEC2:35664,FLOAT_VEC3:35665,FLOAT_VEC4:35666,LINEAR:9729,REPEAT:10497,SAMPLER_2D:35678,POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6,UNSIGNED_BYTE:5121,UNSIGNED_SHORT:5123},js={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},ou={9728:Ft,9729:Ot,9984:ta,9985:Gs,9986:is,9987:Vn},au={33071:Cn,33648:As,10497:Ci},Al={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},$l={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Fi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},T3={CUBICSPLINE:void 0,LINEAR:Xi,STEP:Wi},El={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function A3(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new gn({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Qn})),i.DefaultMaterial}function os(i,e,t){for(let n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function ii(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function E3(i,e,t){let n=!1,s=!1,r=!1;for(let l=0,h=e.length;l<h;l++){let u=e[l];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(s=!0),u.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);let o=[],a=[],c=[];for(let l=0,h=e.length;l<h;l++){let u=e[l];if(n){let d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):i.attributes.position;o.push(d)}if(s){let d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):i.attributes.normal;a.push(d)}if(r){let d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):i.attributes.color;c.push(d)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c)]).then(function(l){let h=l[0],u=l[1],d=l[2];return n&&(i.morphAttributes.position=h),s&&(i.morphAttributes.normal=u),r&&(i.morphAttributes.color=d),i.morphTargetsRelative=!0,i})}function R3(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){let t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function C3(i){let e,t=i.extensions&&i.extensions[tt.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+Rl(t.attributes):e=i.indices+":"+Rl(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+Rl(i.targets[n]);return e}function Rl(i){let e="",t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function jl(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function I3(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}var P3=new De,Ql=class{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new b3,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,o=-1;if(typeof navigator<"u"&&typeof navigator.userAgent<"u"){let a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;let c=a.match(/Version\/(\d+)/);s=n&&c?parseInt(c[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&o<98?this.textureLoader=new Rr(this.options.manager):this.textureLoader=new Lr(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new zs(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){let n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){let a={scene:o[0][s.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:s.asset,parser:n,userData:{}};return os(r,a,s),ii(a,s),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(a)})).then(function(){for(let c of a.scenes)c.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){let e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){let o=t[s].joints;for(let a=0,c=o.length;a<c;a++)e[o[a]].isBone=!0}for(let s=0,r=e.length;s<r;s++){let o=e[s];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;let s=n.clone(),r=(o,a)=>{let c=this.associations.get(o);c!=null&&this.associations.set(a,c);for(let[l,h]of o.children.entries())r(h,a.children[l])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){let t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){let s=e(t[n]);if(s)return s}return null}_invokeAll(e){let t=Object.values(this.plugins);t.unshift(this);let n=[];for(let s=0;s<t.length;s++){let r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){let n=e+":"+t,s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){let n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){let t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[tt.KHR_BINARY_GLTF].body);let s=this.options;return new Promise(function(r,o){n.load(gi.resolveURL(t.uri,s.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){let t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){let s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){let t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){let o=Al[s.type],a=js[s.componentType],c=s.normalized===!0,l=new a(s.count*o);return Promise.resolve(new Xt(l,o,c))}let r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(o){let a=o[0],c=Al[s.type],l=js[s.componentType],h=l.BYTES_PER_ELEMENT,u=h*c,d=s.byteOffset||0,f=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,g=s.normalized===!0,v,m;if(f&&f!==u){let p=Math.floor(d/f),b="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+p+":"+s.count,R=t.cache.get(b);R||(v=new l(a,p*f,s.count*f/h),R=new Ls(v,f/h),t.cache.add(b,R)),m=new Ns(R,c,d%f/h,g)}else a===null?v=new l(s.count*c):v=new l(a,d,s.count*c),m=new Xt(v,c,g);if(s.sparse!==void 0){let p=Al.SCALAR,b=js[s.sparse.indices.componentType],R=s.sparse.indices.byteOffset||0,S=s.sparse.values.byteOffset||0,T=new b(o[1],R,s.sparse.count*p),y=new l(o[2],S,s.sparse.count*c);a!==null&&(m=new Xt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let A=0,_=T.length;A<_;A++){let w=T[A];if(m.setX(w,y[A*c]),c>=2&&m.setY(w,y[A*c+1]),c>=3&&m.setZ(w,y[A*c+2]),c>=4&&m.setW(w,y[A*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){let t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r],a=this.textureLoader;if(o.uri){let c=n.manager.getHandler(o.uri);c!==null&&(a=c)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){let s=this,r=this.json,o=r.textures[e],a=r.images[t],c=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[c])return this.textureCache[c];let l=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=o.name||a.name||"",h.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(h.name=a.uri);let d=(r.samplers||{})[o.sampler]||{};return h.magFilter=ou[d.magFilter]||Ot,h.minFilter=ou[d.minFilter]||Vn,h.wrapS=au[d.wrapS]||Ci,h.wrapT=au[d.wrapT]||Ci,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==Ft&&h.minFilter!==Ot,s.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){let n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());let o=s.images[e],a=self.URL||self.webkitURL,c=o.uri||"",l=!1;if(o.bufferView!==void 0)c=n.getDependency("bufferView",o.bufferView).then(function(u){l=!0;let d=new Blob([u],{type:o.mimeType});return c=a.createObjectURL(d),c});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");let h=Promise.resolve(c).then(function(u){return new Promise(function(d,f){let g=d;t.isImageBitmapLoader===!0&&(g=function(v){let m=new Qt(v);m.needsUpdate=!0,d(m)}),t.load(gi.resolveURL(u,r.path),g,void 0,f)})}).then(function(u){return l===!0&&a.revokeObjectURL(c),ii(u,o),u.userData.mimeType=o.mimeType||I3(o.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,s){let r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[tt.KHR_TEXTURE_TRANSFORM]){let a=n.extensions!==void 0?n.extensions[tt.KHR_TEXTURE_TRANSFORM]:void 0;if(a){let c=r.associations.get(o);o=r.extensions[tt.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,c)}}return s!==void 0&&(o.colorSpace=s),e[t]=o,o})}assignFinalMaterial(e){let t=e.geometry,n=e.material,s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){let a="PointsMaterial:"+n.uuid,c=this.cache.get(a);c||(c=new Bs,on.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(a,c)),n=c}else if(e.isLine){let a="LineBasicMaterial:"+n.uuid,c=this.cache.get(a);c||(c=new Os,on.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(a,c)),n=c}if(s||r||o){let a="ClonedMaterial:"+n.uuid+":";s&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let c=this.cache.get(a);c||(c=n.clone(),r&&(c.vertexColors=!0),o&&(c.flatShading=!0),s&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(a,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return gn}loadMaterial(e){let t=this,n=this.json,s=this.extensions,r=n.materials[e],o,a={},c=r.extensions||{},l=[];if(c[tt.KHR_MATERIALS_UNLIT]){let u=s[tt.KHR_MATERIALS_UNLIT];o=u.getMaterialType(),l.push(u.extendParams(a,r,t))}else{let u=r.pbrMetallicRoughness||{};if(a.color=new ke(1,1,1),a.opacity=1,Array.isArray(u.baseColorFactor)){let d=u.baseColorFactor;a.color.setRGB(d[0],d[1],d[2],dn),a.opacity=d[3]}u.baseColorTexture!==void 0&&l.push(t.assignTexture(a,"map",u.baseColorTexture,Dt)),a.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,a.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(a,"metalnessMap",u.metallicRoughnessTexture)),l.push(t.assignTexture(a,"roughnessMap",u.metallicRoughnessTexture))),o=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=yn);let h=r.alphaMode||El.OPAQUE;if(h===El.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,h===El.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==zn&&(l.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new Ze(1,1),r.normalTexture.scale!==void 0)){let u=r.normalTexture.scale;a.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&o!==zn&&(l.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==zn){let u=r.emissiveFactor;a.emissive=new ke().setRGB(u[0],u[1],u[2],dn)}return r.emissiveTexture!==void 0&&o!==zn&&l.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,Dt)),Promise.all(l).then(function(){let u=new o(a);return r.name&&(u.name=r.name),ii(u,r),t.associations.set(u,{materials:e}),r.extensions&&os(s,u,r),u})}createUniqueName(e){let t=wt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){let t=this,n=this.extensions,s=this.primitiveCache;function r(a){return n[tt.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(c){return lu(c,a,t)})}let o=[];for(let a=0,c=e.length;a<c;a++){let l=e[a],h=C3(l),u=s[h];if(u)o.push(u.promise);else{let d;l.extensions&&l.extensions[tt.KHR_DRACO_MESH_COMPRESSION]?d=r(l):d=lu(new qt,l,t),l.mode===In.TRIANGLE_STRIP?d=d.then(f=>Tl(f,Hr)):l.mode===In.TRIANGLE_FAN&&(d=d.then(f=>Tl(f,qs))),s[h]={primitive:l,promise:d},o.push(d)}}return Promise.all(o)}loadMesh(e){let t=this,n=this.json,s=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let c=0,l=o.length;c<l;c++){let h=o[c].material===void 0?A3(this.cache):this.getDependency("material",o[c].material);a.push(h)}return a.push(t.loadGeometries(o)),Promise.all(a).then(async function(c){let l=c.slice(0,c.length-1),h=c[c.length-1],u=[];for(let f=0,g=h.length;f<g;f++){let v=h[f],m=o[f],p,b=l[f];if(m.mode===In.TRIANGLES||m.mode===In.TRIANGLE_STRIP||m.mode===In.TRIANGLE_FAN||m.mode===void 0){let R=r.isSkinnedMesh===!0,S=v.hasAttribute("skinIndex")&&v.hasAttribute("skinWeight");R&&S===!1&&console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled."),p=R&&S?new gr(v,b):new dt(v,b),p.isSkinnedMesh===!0&&p.normalizeSkinWeights()}else if(m.mode===In.LINES)p=new xr(v,b);else if(m.mode===In.LINE_STRIP)p=new Ji(v,b);else if(m.mode===In.LINE_LOOP)p=new yr(v,b);else if(m.mode===In.POINTS)p=new vr(v,b);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&R3(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),ii(p,r),m.extensions&&os(s,p,m),t.assignFinalMaterial(p),u.push(p)}for(let f=0,g=u.length;f<g;f++)t.associations.set(u[f],{meshes:e,primitives:f});if(u.length===1)return r.extensions&&os(s,u[0],r),u[0];let d=new un;r.extensions&&os(s,d,r),t.associations.set(d,{meshes:e});for(let f=0,g=u.length;f<g;f++)d.add(u[f]);return d})}loadCamera(e){let t,n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new jt(rl.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new jn(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),ii(t,n),Promise.resolve(t)}loadSkin(e){let t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){let r=s.pop(),o=s,a=[],c=[];for(let l=0,h=o.length;l<h;l++){let u=o[l];if(u){a.push(u);let d=new De;r!==null&&d.fromArray(r.array,l*16),c.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new _r(a,c)})}loadAnimation(e){let t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,o=[],a=[],c=[],l=[],h=[];for(let u=0,d=s.channels.length;u<d;u++){let f=s.channels[u],g=s.samplers[f.sampler],v=f.target,m=v.node,p=s.parameters!==void 0?s.parameters[g.input]:g.input,b=s.parameters!==void 0?s.parameters[g.output]:g.output;v.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",p)),c.push(this.getDependency("accessor",b)),l.push(g),h.push(v))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c),Promise.all(l),Promise.all(h)]).then(function(u){let d=u[0],f=u[1],g=u[2],v=u[3],m=u[4],p=[];for(let R=0,S=d.length;R<S;R++){let T=d[R],y=f[R],A=g[R],_=v[R],w=m[R];if(T===void 0)continue;T.updateMatrix&&T.updateMatrix();let C=n._createAnimationTracks(T,y,A,_,w);if(C)for(let D=0;D<C.length;D++)p.push(C[D])}let b=new Er(r,void 0,p);return ii(b,s),b})}createNodeMesh(e){let t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){let o=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let c=0,l=s.weights.length;c<l;c++)a.morphTargetInfluences[c]=s.weights[c]}),o})}loadNode(e){let t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=s.children||[];for(let l=0,h=a.length;l<h;l++)o.push(n.getDependency("node",a[l]));let c=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(o),c]).then(function(l){let h=l[0],u=l[1],d=l[2];d!==null&&h.traverse(function(f){f.isSkinnedMesh&&f.bind(d,P3)});for(let f=0,g=u.length;f<g;f++)h.add(u[f]);if(h.userData.pivot!==void 0&&u.length>0){let f=h.userData.pivot,g=u[0];h.pivot=new P().fromArray(f),h.position.x-=f[0],h.position.y-=f[1],h.position.z-=f[2],g.position.set(0,0,0),delete h.userData.pivot}return h})}_loadNodeShallow(e){let t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];let r=t.nodes[e],o=r.name?s.createUniqueName(r.name):"",a=[],c=s._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&a.push(c),r.camera!==void 0&&a.push(s.getDependency("camera",r.camera).then(function(l){return s._getNodeRef(s.cameraCache,r.camera,l)})),s._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){a.push(l)}),this.nodeCache[e]=Promise.all(a).then(function(l){let h;if(r.isBone===!0?h=new Ds:l.length>1?h=new un:l.length===1?h=l[0]:h=new Et,h!==l[0])for(let u=0,d=l.length;u<d;u++)h.add(l[u]);if(r.name&&(h.userData.name=r.name,h.name=o),ii(h,r),r.extensions&&os(n,h,r),r.matrix!==void 0){let u=new De;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);if(!s.associations.has(h))s.associations.set(h,{});else if(r.mesh!==void 0&&s.meshCache.refs[r.mesh]>1){let u=s.associations.get(h);s.associations.set(h,{...u})}return s.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){let t=this.extensions,n=this.json.scenes[e],s=this,r=new un;n.name&&(r.name=s.createUniqueName(n.name)),ii(r,n),n.extensions&&os(t,r,n);let o=n.nodes||[],a=[];for(let c=0,l=o.length;c<l;c++)a.push(s.getDependency("node",o[c]));return Promise.all(a).then(function(c){for(let h=0,u=c.length;h<u;h++){let d=c[h];d.parent!==null?r.add(iu(d)):r.add(d)}let l=h=>{let u=new Map;for(let[d,f]of s.associations)(d instanceof on||d instanceof Qt)&&u.set(d,f);return h.traverse(d=>{let f=s.associations.get(d);f!=null&&u.set(d,f)}),u};return s.associations=l(r),r})}_createAnimationTracks(e,t,n,s,r){let o=[],a=e.name?e.name:e.uuid,c=[];function l(f){f.morphTargetInfluences&&c.push(f.name?f.name:f.uuid)}Fi[r.path]===Fi.weights?(l(e),e.isGroup&&e.children.forEach(l)):c.push(a);let h;switch(Fi[r.path]){case Fi.weights:h=fi;break;case Fi.rotation:h=pi;break;case Fi.translation:case Fi.scale:h=Li;break;default:n.itemSize===1?h=fi:h=Li;break}let u=s.interpolation!==void 0?T3[s.interpolation]:Xi,d=this._getArrayFromAccessor(n);for(let f=0,g=c.length;f<g;f++){let v=new h(c[f]+"."+Fi[r.path],t.array,d,u);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(v),o.push(v)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){let n=jl(t.constructor),s=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){let s=this instanceof pi?Jl:Ka;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}};function L3(i,e,t){let n=e.attributes,s=new fn;if(n.POSITION!==void 0){let a=t.json.accessors[n.POSITION],c=a.min,l=a.max;if(c!==void 0&&l!==void 0){if(s.set(new P(c[0],c[1],c[2]),new P(l[0],l[1],l[2])),a.normalized){let h=jl(js[a.componentType]);s.min.multiplyScalar(h),s.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;let r=e.targets;if(r!==void 0){let a=new P,c=new P;for(let l=0,h=r.length;l<h;l++){let u=r[l];if(u.POSITION!==void 0){let d=t.json.accessors[u.POSITION],f=d.min,g=d.max;if(f!==void 0&&g!==void 0){if(c.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),c.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),c.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),d.normalized){let v=jl(js[d.componentType]);c.multiplyScalar(v)}a.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(a)}i.boundingBox=s;let o=new mn;s.getCenter(o.center),o.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=o}function lu(i,e,t){let n=e.attributes,s=[];function r(o,a){return t.getDependency("accessor",o).then(function(c){i.setAttribute(a,c)})}for(let o in n){let a=$l[o]||o.toLowerCase();a in i.attributes||s.push(r(n[o],a))}if(e.indices!==void 0&&!i.index){let o=t.getDependency("accessor",e.indices).then(function(a){i.setIndex(a)});s.push(o)}return je.workingColorSpace!==dn&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${je.workingColorSpace}" not supported.`),ii(i,e),L3(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?E3(i,e.targets,t):i})}var Ja=class extends Yi{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;let e=new Pi;e.deleteAttribute("uv");let t=new gn({side:en}),n=new gn,s=new Qi(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);let r=new dt(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);let o=new Ki(e,n,6),a=new Et;a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),a.updateMatrix(),o.setMatrixAt(0,a.matrix),a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),a.updateMatrix(),o.setMatrixAt(1,a.matrix),a.position.set(6.167,.857,7.803),a.rotation.set(0,.561,0),a.scale.set(3.927,6.285,3.687),a.updateMatrix(),o.setMatrixAt(2,a.matrix),a.position.set(-2.017,.018,6.124),a.rotation.set(0,.333,0),a.scale.set(2.002,4.566,2.064),a.updateMatrix(),o.setMatrixAt(3,a.matrix),a.position.set(2.291,-.756,-2.621),a.rotation.set(0,-.286,0),a.scale.set(1.546,1.552,1.496),a.updateMatrix(),o.setMatrixAt(4,a.matrix),a.position.set(-2.193,-.369,-5.547),a.rotation.set(0,.516,0),a.scale.set(3.875,3.487,2.986),a.updateMatrix(),o.setMatrixAt(5,a.matrix),this.add(o);let c=new dt(e,Qs(50));c.position.set(-16.116,14.37,8.208),c.scale.set(.1,2.428,2.739),this.add(c);let l=new dt(e,Qs(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);let h=new dt(e,Qs(17));h.position.set(14.904,12.198,-1.832),h.scale.set(.15,4.265,6.331),this.add(h);let u=new dt(e,Qs(43));u.position.set(-.462,8.89,14.52),u.scale.set(4.38,5.441,.088),this.add(u);let d=new dt(e,Qs(20));d.position.set(3.235,11.486,-12.541),d.scale.set(2.5,2,.1),this.add(d);let f=new dt(e,Qs(100));f.position.set(0,20,0),f.scale.set(1,.1,1),this.add(f)}dispose(){let e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(let t of e)t.dispose()}};function Qs(i){return new Tr({color:0,emissive:16777215,emissiveIntensity:i})}var hu=new P(0,1,0),uu=new P(1,0,0);function du(i,e){let t=new De,n=new De,s=new P,r=new Ue,o=new P,a=y=>e.get(y).bone;i.updateWorldMatrix(!0,!0),t.copy(i.matrixWorld).invert();let c=()=>{i.updateWorldMatrix(!0,!1),t.copy(i.matrixWorld).invert()};function l(y){return y.updateWorldMatrix(!0,!1),n.multiplyMatrices(t,y.matrixWorld).decompose(s,r,o),{p:s.clone(),q:r.clone()}}function h(y,A){y.quaternion.copy(l(y.parent).q.invert().multiply(A)),y.updateWorldMatrix(!1,!0)}function u(y,A,_){h(y,l(y).q.premultiply(new Ue().setFromUnitVectors(A.normalize(),_.normalize())))}function d(y,A,_){let w=l(y).p,C=l(A).p,D=l(_);return{a:y,b:A,c:_,l1:w.distanceTo(C),l2:C.distanceTo(D.p),home:D.p,rotation:D.q}}let f=["Left","Right"].map(y=>{let A=d(a(y+"UpLeg"),a(y+"Leg"),a(y+"Foot")),_=1/0;return i.traverse(w=>{if(!w.isSkinnedMesh)return;let C=w.geometry.attributes.skinIndex,D=w.geometry.attributes.skinWeight;for(let L=0;L<C.count;L++){let N=0;for(let I=0;I<4;I++){let k=w.skeleton.bones[C.array[L*4+I]]?.name||"";(k.includes(y+"Foot")||k.includes(y+"Toe"))&&(N+=D.array[L*4+I])}if(N>.9){let I=w.getVertexPosition(L,new P);w.localToWorld(I),I.applyMatrix4(t),_=Math.min(_,I.y)}}}),A.home.y-=_,A.anchor=A.home.clone(),A}),g=["Left","Right"].map(y=>{let A=d(a(y+"Arm"),a(y+"ForeArm"),a(y+"Hand")),_=l(A.a),w=l(A.b),C=l(A.c);return A.upperDir=w.p.clone().sub(_.p).normalize(),A.lowerDir=C.p.clone().sub(w.p).normalize(),A.normal=A.upperDir.clone().cross(A.lowerDir).normalize(),A.upperQ=_.q,A.lowerQ=w.q,A.runtime=null,A});function v(y,A){return new De().makeBasis(y,A,y.clone().cross(A).normalize())}function m(y,A,_,{dt:w=0,commit:C=!1}={}){let D=l(y.a).p,L=A.clone().sub(D),N=Math.max(Math.abs(y.l1-y.l2)+.002,Math.min(y.l1+y.l2-.002,L.length()));L.normalize();let I=(y.l1*y.l1-y.l2*y.l2+N*N)/(2*N),k=Math.sqrt(Math.max(0,y.l1*y.l1-I*I)),G=_.clone().addScaledVector(L,-_.dot(L)),V=C?y.runtime:null,Q=V?.radial.clone().applyQuaternion(new Ue().setFromUnitVectors(V.axis,L));G.lengthSq()<1e-10&&(G=Q||L.clone().cross(y.normal),G.lengthSq()<1e-10&&(G=L.clone().cross(Math.abs(L.y)<.9?hu:uu))),G.normalize();let W=0;if(V){Q.addScaledVector(L,-Q.dot(L)).normalize();let re=Math.atan2(L.dot(Q.clone().cross(G)),Q.dot(G)),X=Math.max(0,Math.min(.12,w)),j=120*Math.PI/180,z=540*Math.PI/180,xe=Math.sign(re)*Math.min(j,Math.sqrt(2*z*Math.abs(re)));W=V.orbitSpeed+Math.max(-z*X,Math.min(z*X,xe-V.orbitSpeed));let he=W*X;he*re>=0&&Math.abs(he)>=Math.abs(re)&&(he=re,W=0),G=Q.applyAxisAngle(L,he)}C&&(y.runtime={axis:L.clone(),radial:G.clone(),orbitSpeed:W});let O=D.clone().addScaledVector(L,I).addScaledVector(G,k),Z=D.clone().addScaledVector(L,N),le=O.clone().sub(D).normalize(),Me=Z.sub(O).normalize(),ie=le.clone().cross(Me).normalize(),oe=(re,X,j)=>new Ue().setFromRotationMatrix(v(j,ie).multiply(v(re,y.normal).invert())).multiply(X);h(y.a,oe(y.upperDir,y.upperQ,le)),h(y.b,oe(y.lowerDir,y.lowerQ,Me))}function p(y,A,_,w){let C=l(y.a).p,D=l(y.b).p,L=A.clone().sub(C),N=Math.max(.001,Math.min(y.l1+y.l2-1e-4,Math.max(Math.abs(y.l1-y.l2)+1e-4,L.length())));L.normalize();let I=(y.l1*y.l1-y.l2*y.l2+N*N)/(2*N),k=Math.sqrt(Math.max(0,y.l1*y.l1-I*I)),G=_.clone().addScaledVector(L,-_.dot(L)).normalize(),V=C.clone().addScaledVector(L,I).addScaledVector(G,k);u(y.a,D.sub(C),V.sub(C));let Q=l(y.b).p;u(y.b,l(y.c).p.sub(Q),A.clone().sub(Q)),w&&h(y.c,w)}function b(y,{seated:A=0}={}){c();let _=a("Hips"),w=0;f.forEach((C,D)=>{C.anchor.copy(C.home).add(new P(...y[D]));let L=l(C.a).p.sub(C.anchor),N=C.l1+C.l2-.001;w=Math.max(w,L.y-Math.sqrt(Math.max(0,N*N-L.x*L.x-L.z*L.z)))}),_.position.y-=Math.max(0,w),f.forEach(C=>p(C,C.anchor,new P(1,A*3,0),C.rotation))}function R(y,A,_,w=1,C){let D=g[y==="Left"?0:1],L=[D.a.quaternion.clone(),D.b.quaternion.clone()];m(D,A,_,C),D.a.quaternion.slerpQuaternions(L[0],D.a.quaternion.clone(),w),D.b.quaternion.slerpQuaternions(L[1],D.b.quaternion.clone(),w),i.updateWorldMatrix(!0,!0)}function S(y,A,_,w=1){let C=a(y+"Hand"),D=C.quaternion.clone(),L=l(C).p,N=l(a(y+"HandIndex1")).p,I=l(a(y+"HandPinky1")).p,k=l(a(y+"HandMiddle1")).p,G=N.sub(I).normalize(),V=k.sub(L).addScaledVector(G,-k.dot(G)).normalize(),Q=G.clone().cross(V).normalize(),W=A.clone().normalize(),O=_.clone().normalize(),Z=W.clone().cross(O).normalize();W.copy(O.clone().cross(Z));let le=new De().makeBasis(G,V,Q),Me=new De().makeBasis(Z,W,O);h(C,l(C).q.premultiply(new Ue().setFromRotationMatrix(Me.multiply(le.invert())))),C.quaternion.slerpQuaternions(D,C.quaternion.clone(),w)}function T(y,A){let _=a(y+"Hand"),w=l(_).p,D=l(a(y+"HandMiddle1")).p.sub(w).normalize(),L=new P(1,0,0),N=D.clone().cross(L).normalize();for(let I of["Index","Middle","Ring","Pinky"])for(let[k,G]of[[1,.35],[2,.72],[3,.58]]){let V=a(y+"Hand"+I+k);h(V,l(V).q.premultiply(new Ue().setFromAxisAngle(N,G*A)))}}return{frame:l,refresh:c,orient:h,feet:b,arm:R,palm:S,curl:T,legs:f,bone:a,UP:hu,FORWARD:uu,snapshot:()=>f.map(y=>({anchor:y.anchor.toArray(),position:l(y.c).p.toArray()}))}}var tc=1e-9,ec=Math.PI*2,pu=new P(0,1,0),xi=(i,e,t)=>Math.max(e,Math.min(t,i)),ja=i=>((i+Math.PI)%ec+ec)%ec-Math.PI;function $a(i,e){let t=i.x*e.x+i.y*e.y+i.z*e.z,n=new Ue(e.x*t,e.y*t,e.z*t,i.w);return n.lengthSq()<tc?n.identity():n.normalize(),{angle:ja(2*Math.atan2(n.x*e.x+n.y*e.y+n.z*e.z,n.w)),swing:i.clone().multiply(n.invert()).normalize()}}function fu(i,e){let t=i.clone().normalize(),n=e.clone().addScaledVector(t,-e.dot(t));return n.lengthSq()<tc&&(n.copy(Math.abs(t.y)<.9?pu:new P(1,0,0)),n.addScaledVector(t,-n.dot(t))),n.normalize(),new De().makeBasis(n,t,n.clone().cross(t).normalize())}function mu(i,e,t,n,{maxForearmTwist:s=95*Math.PI/180,maxWristTwist:r=10*Math.PI/180,maxWristSwing:o=25*Math.PI/180}={}){let a=g=>e.get(g)?.bone,c={};for(let g of["Left","Right"]){let v=a(g+"Hand"),m=a(g+"ForeArm"),p=a(g+"ForeArmTwist"),b=t(v).q.clone().invert(),R=t(v).p,S=t(a(g+"HandMiddle1")).p.sub(R).applyQuaternion(b).normalize(),T=t(a(g+"HandIndex1")).p.sub(t(a(g+"HandPinky1")).p).applyQuaternion(b).normalize();c[g]={hand:v,forearm:m,twist:p,forward:S,across:T,localBasisInverse:fu(S,T).invert(),wristBind:v.quaternion.clone(),twistBind:p?.quaternion.clone(),last:null,runtime:null},c[g].digits=["Index","Middle","Ring","Pinky"].map((y,A)=>({finger:y,index:A,joints:[1,2,3].map(_=>{let w=a(g+"Hand"+y+_),C=a(g+"Hand"+y+(_+1));return{joint:w,child:C,bind:w.quaternion.clone(),stage:_}})}))}function l(g,v,m){return new Ue().setFromRotationMatrix(fu(v,m).multiply(c[g].localBasisInverse)).normalize()}function h(g,v,m){let p=m.clone().multiplyScalar(g==="Left"?-1:1);return l(g,v,v.clone().cross(p))}function u(g){let v=c[g],m=t(a("RightArm")).p.sub(t(a("LeftArm")).p);m.y=0,m.normalize();let p=pu.clone().cross(m).normalize(),b=t(v.hand).p.sub(t(v.forearm).p).normalize();return l(g,b,p)}function d(g,v,m=1,{blendFromCurrent:p=!1}={}){let b=c[g];if(!b||!["relaxed","open","soft_fist","point"].includes(v)||!Number.isFinite(m))return!1;let R=xi(m,0,1);if(R===0)return!0;let S=t(b.hand),T=b.forward.clone().applyQuaternion(S.q),y=b.across.clone().applyQuaternion(S.q),A=y.clone().cross(T).multiplyScalar(g==="Left"?-1:1).normalize(),_=new Map(b.digits.flatMap(w=>w.joints.map(C=>[C.joint,p?C.joint.quaternion.clone():C.bind])));for(let w of b.digits)for(let C of w.joints)C.joint.quaternion.copy(C.bind);i.updateMatrixWorld(!0);for(let w of b.digits){let C=v==="open"||v==="point"&&w.finger==="Index",D=v==="soft_fist"||v==="point"&&w.finger!=="Index";if(!(!C&&!D))for(let{joint:L,child:N,stage:I}of w.joints){let k=t(N).p.sub(t(L).p).normalize(),G;if(C){let V=T.clone().addScaledVector(y,(1.5-w.index)*.035).normalize();G=new Ue().setFromUnitVectors(k,V);let Q=new Ue().angleTo(G),W=I===1?.45:.6;G.slerpQuaternions(new Ue,G,Q>W?W/Q:1)}else{let V=k.clone().cross(A).normalize(),Q=[0,.28,.43,.3][I]*(.96+w.index*.025);G=new Ue().setFromAxisAngle(V,Q)}n(L,t(L).q.premultiply(G))}}for(let w of b.digits)for(let{joint:C}of w.joints)C.quaternion.slerpQuaternions(_.get(C),C.quaternion.clone(),R);return i.updateMatrixWorld(!0),!0}function f(g,v,{dt:m=0,commit:p=!1}={}){let b=c[g],R=b.twist||b.forearm;b.twist&&(b.twist.quaternion.copy(b.twistBind),i.updateMatrixWorld(!0));let S=t(b.hand).p,T=t(b.forearm).p,y=S.clone().sub(T).normalize(),A=t(R).q,_=0,w=p?b.runtime:null,C=W=>{if(!w)return xi(W,-s,s);let O=[xi(W,-s,s),-s,s];return O.reduce((Z,le)=>{let Me=ja(le-W)**2+.025*(le-w.roll)**2,ie=ja(Z-W)**2+.025*(Z-w.roll)**2;return Me<ie?le:Z},O[0])};for(let W=0;W<2;W++){let O=t(b.hand.parent).q.invert().multiply(v),Z=b.wristBind.clone().invert().multiply(O),le=$a(Z,b.forward).angle;_=C(ja(_+le)),n(R,new Ue().setFromAxisAngle(y,_).multiply(A))}if(w){let W=240*Math.PI/180*Math.max(0,Math.min(.12,m));_=w.roll+xi(_-w.roll,-W,W),n(R,new Ue().setFromAxisAngle(y,_).multiply(A))}let D=t(b.hand.parent).q.invert().multiply(v),L=b.wristBind.clone().invert().multiply(D),N=$a(L,b.forward);N.swing.w<0&&(N.swing.x*=-1,N.swing.y*=-1,N.swing.z*=-1,N.swing.w*=-1);let I=2*Math.acos(xi(N.swing.w,-1,1)),k=new Ue().slerp(N.swing,I>o?o/I:1),G=xi(N.angle,-r,r),V=k.multiply(new Ue().setFromAxisAngle(b.forward,G)).normalize();if(w){let W=w.wrist.angleTo(V),O=120*Math.PI/180*Math.max(0,Math.min(.12,m));V=w.wrist.clone().slerp(V,W>O&&W>tc?O/W:1);let Z=$a(V,b.forward);Z.swing.w<0&&(Z.swing.x*=-1,Z.swing.y*=-1,Z.swing.z*=-1,Z.swing.w*=-1);let le=2*Math.acos(xi(Z.swing.w,-1,1));V=new Ue().slerp(Z.swing,le>o?o/le:1).multiply(new Ue().setFromAxisAngle(b.forward,xi(Z.angle,-r,r)))}p&&(b.runtime={roll:_,wrist:V.clone()}),b.hand.quaternion.copy(b.wristBind).multiply(V).normalize(),i.updateMatrixWorld(!0);let Q=$a(V,b.forward);return b.last={forearmTwist:_,wristTwist:Q.angle,wristSwing:2*Math.acos(xi(Math.abs(Q.swing.w),0,1)),wristPositionError:t(b.hand).p.distanceTo(S),limited:I>o+1e-6||Math.abs(N.angle)>r+1e-6},b.last}return{apply:f,orientation:l,targetHandQ:h,neutralOrientation:u,handExpression:d,snapshot:()=>Object.fromEntries(Object.entries(c).map(([g,v])=>[g,v.last]))}}function gu(i,{follow:e=.35,maxOpening:t=18*Math.PI/180}={}){let n=[];for(let o of["Left","Right"]){let a=f=>i.getObjectByName("mixamorig"+o+f)||i.getObjectByName("mixamorig:"+o+f),c=a("Arm"),l=a("ForeArm"),h=a("ShoulderCap");if(!c||!l||!h)continue;let u=l.position.clone().normalize(),d=u.clone().applyQuaternion(c.quaternion).normalize();n.push({side:o,arm:c,cap:h,shaft:u,direction:d,bindQ:h.quaternion.clone(),neutralDirection:null,neutralQ:null})}let s=new P,r=new Ue;return{update(){for(let o of n){s.copy(o.shaft).applyQuaternion(o.arm.quaternion).normalize(),o.neutralDirection||(o.neutralDirection=s.clone(),o.neutralQ=new Ue().setFromUnitVectors(o.direction,s).multiply(o.bindQ).normalize()),r.setFromUnitVectors(o.neutralDirection,s);let a=new Ue().angleTo(r),c=a>1e-8?Math.min(Math.max(0,e),Math.max(0,t)/a):0;r.slerpQuaternions(new Ue,r,c),o.cap.position.copy(o.arm.position),o.cap.quaternion.copy(r).multiply(o.neutralQ).normalize()}},count:n.length}}function _u(i){let e=[];for(let t of["Left","Right"]){let n=h=>i.getObjectByName("mixamorig"+t+h)||i.getObjectByName("mixamorig:"+t+h);if(i.getObjectByName("Socket_"+t+"_closed_back"))continue;let r=n("Arm");if(!r)continue;let o="Runtime_"+t+"_closed_shoulder_socket";if(i.getObjectByName(o))continue;let a=new br(.0415,32,20),c=new gn({color:1320241,metalness:.45,roughness:.42}),l=new dt(a,c);l.name=o,l.castShadow=!0,l.frustumCulled=!1,r.add(l),e.push(l)}return{count:e.length,meshes:e}}var Zr=-Math.PI/2-.55;function xu({width:i,height:e,left:t,viewportWidth:n,frameHeight:s,portrait:r=!1,contained:o=!1}){let a=s/e,c=i*a/2,l=r||o?0:Math.max(0,Math.min(t-2,n-i)),h=Math.min(l,Math.max(0,Math.ceil((1.05-c)/a)));return{width:i+h,height:e,left:-h||0,cameraLeft:-c-h*a,cameraRight:c}}function yu(i,e,{lightX:t=2,margin:n=.085,minHeight:s=3}={}){let r=s;for(let o of i){let a=o.x-n-e;a>.02&&(r=Math.max(r,t*Math.max(0,o.y+n)/a))}return r}var N3=new P(.8981006,.02286951,-.43919506),D3=new P(-.07482571,.99203262,-.1013528),U3=new P(.4333779,.12388806,.89265634),F3=new De().makeBasis(N3,D3,U3).invert(),O3=new P(0,1,0);function vu(i,e){let t=null;return{update({yaw:n=0,pitch:s=0,nod:r=0}={},o=0){let a=-Zr-Math.PI/2+n,c=new P(Math.cos(a),0,-Math.sin(a)),l=c.clone().cross(O3).normalize();c.applyAxisAngle(l,s-r);let h=l.clone().cross(c).normalize(),u=new Ue().setFromRotationMatrix(new De().makeBasis(c,h,l).multiply(F3));u.normalize(),t?t.slerp(u,1-Math.exp(-Math.max(0,o)*12)):t=u.clone(),e(i,t)}}}function Mu(i){let e=i.getObjectByName("mixamorigHead")||i.getObjectByName("mixamorig:Head");if(!e)return{update(){},dispose(){},count:0};i.updateMatrixWorld(!0);let t=e.matrixWorld.clone().invert(),n=new P(-.0748257102,.9920326223,-.1013527962),s=new un;s.name="Wolfgang eyelids",e.add(s);let r=new gn({name:"Wolfgang navy eyelid",color:1319981,metalness:.25,roughness:.43,side:yn}),o=[];for(let[l,h]of[["Right",[54]],["Left",[53]]]){let u=h.map(ie=>i.getObjectByName("Wolfgang_Detail_"+ie)).filter(Boolean);if(u.length!==1)continue;let d=[];for(let ie of u){let oe=ie.geometry,re=oe.getAttribute("position"),X=oe.getAttribute("normal"),j=oe.index,z=[],xe=[],he=new We().getNormalMatrix(ie.matrixWorld);for(let Le=0;Le<re.count;Le++){let st=ie.getVertexPosition(Le,new P).applyMatrix4(ie.matrixWorld).applyMatrix4(t),Ve=new P().fromBufferAttribute(X,Le).applyMatrix3(he).transformDirection(t).normalize();z.push(st),xe.push(Ve)}for(let Le=0;Le<(j?j.count:re.count);Le+=3){let st=[];for(let Ve=0;Ve<3;Ve++){let Xe=j?j.getX(Le+Ve):Le+Ve;st.push({p:z[Xe].clone(),n:xe[Xe].clone()})}d.push(st)}}let f=new P,g=0;for(let ie of d)for(let oe of ie)f.add(oe.p),g++;f.divideScalar(g);let v=new P(...l==="Right"?[.99877343,-.02280829,-.04394782]:[.77003183,.08716148,-.63202362]),m=n.clone().addScaledVector(v,-n.dot(v)).normalize(),p=m.clone().cross(v).normalize(),b=ie=>{let oe=ie.p.clone().sub(f);return{x:oe.dot(p),y:oe.dot(m),z:oe.dot(v),f:ie.n.dot(v)}},R=d.flat().map(b),S=(ie,oe)=>[1,ie/.01,oe/.01,(ie/.01)**2,ie*oe/1e-4,(oe/.01)**2],T=Array.from({length:6},()=>Array(7).fill(0));for(let ie of R.filter(oe=>oe.f>.25)){let oe=S(ie.x,ie.y);for(let re=0;re<6;re++){for(let X=0;X<6;X++)T[re][X]+=oe[re]*oe[X];T[re][6]+=oe[re]*ie.z}}for(let ie=0;ie<6;ie++){let oe=ie;for(let X=ie+1;X<6;X++)Math.abs(T[X][ie])>Math.abs(T[oe][ie])&&(oe=X);[T[ie],T[oe]]=[T[oe],T[ie]];let re=T[ie][ie]||1e-9;for(let X=ie;X<7;X++)T[ie][X]/=re;for(let X=0;X<6;X++)if(X!==ie){let j=T[X][ie];for(let z=ie;z<7;z++)T[X][z]-=j*T[ie][z]}}let y=T.map(ie=>ie[6]),A=(ie,oe)=>S(ie,oe).reduce((re,X,j)=>re+X*y[j],0),_=i.getObjectByName("Wolfgang_Detail_"+(l==="Right"?66:64)),w=15e-5;if(_){let ie=_.geometry.attributes.position;for(let oe=0;oe<ie.count;oe++){let re=_.getVertexPosition(oe,new P).applyMatrix4(_.matrixWorld).applyMatrix4(t).sub(f);w=Math.max(w,re.dot(v)-A(re.dot(p),re.dot(m))+15e-5)}}let C=R.slice().sort((ie,oe)=>ie.x-oe.x||ie.y-oe.y),D=(ie,oe,re)=>(oe.x-ie.x)*(re.y-ie.y)-(oe.y-ie.y)*(re.x-ie.x),L=[],N=[];for(let ie of C){for(;L.length>1&&D(L.at(-2),L.at(-1),ie)<=0;)L.pop();L.push(ie)}for(let ie of[...C].reverse()){for(;N.length>1&&D(N.at(-2),N.at(-1),ie)<=0;)N.pop();N.push(ie)}let I=L.slice(0,-1).concat(N.slice(0,-1)),k=(ie,oe)=>{let re=A(ie,oe)+w,X=f.clone().addScaledVector(p,ie).addScaledVector(m,oe).addScaledVector(v,re),j=(y[1]+2*y[3]*ie/.01+y[4]*oe/.01)/.01,z=(y[2]+y[4]*ie/.01+2*y[5]*oe/.01)/.01,xe=v.clone().addScaledVector(p,-j).addScaledVector(m,-z).normalize();return{p:X,n:xe,h:X.dot(n)}},G=[],V=8,Q=I.length,W=[];for(let ie=1;ie<=V;ie++)W.push(I.map(oe=>k(oe.x*ie/V*1.2,oe.y*ie/V*1.2)));let O=k(0,0);for(let ie=0;ie<Q;ie++){G.push([O,W[0][ie],W[0][(ie+1)%Q]]);for(let oe=1;oe<V;oe++){let re=(ie+1)%Q;G.push([W[oe-1][ie],W[oe][ie],W[oe][re]],[W[oe-1][ie],W[oe][re],W[oe-1][re]])}}let Z=i.getObjectByName("Wolfgang_Detail_"+(l==="Right"?52:59));if(Z){let ie=Z.geometry,oe=ie.attributes.position,re=ie.attributes.normal,X=ie.index,j=new We().getNormalMatrix(Z.matrixWorld),z=[];for(let xe=0;xe<oe.count;xe++){let he=new P().fromBufferAttribute(re,xe).applyMatrix3(j).transformDirection(t).normalize(),Le=Z.getVertexPosition(xe,new P).applyMatrix4(Z.matrixWorld).applyMatrix4(t).addScaledVector(he,15e-5);z.push({p:Le,n:he,h:Le.dot(n)})}for(let xe=0;xe<(X?X.count:oe.count);xe+=3)G.push([0,1,2].map(he=>z[X?X.getX(xe+he):xe+he]))}let le=1/0,Me=-1/0;for(let ie of G)for(let oe of ie)le=Math.min(le,oe.h),Me=Math.max(Me,oe.h);for(let ie of[!0,!1]){let oe=new qt;oe.setAttribute("position",new Ut(new Float32Array(G.length*6*3),3)),oe.setAttribute("normal",new Ut(new Float32Array(G.length*6*3),3)),oe.setDrawRange(0,0);let re=new dt(oe,r);re.name=l+(ie?" upper":" lower")+" eyelid",re.frustumCulled=!1,re.visible=!1,s.add(re),o.push({mesh:re,all:G,lo:le,hi:Me,upper:ie})}}let a=-1;function c(l=0){let h=Math.max(0,Math.min(1,Number.isFinite(l)?l:0));if(h!==a){a=h;for(let u of o){if(u.mesh.visible=h>.001,!u.mesh.visible)continue;let d=u.upper?u.hi-(u.hi-u.lo)*.86*h:u.lo+(u.hi-u.lo)*.14*h,f=u.mesh.geometry.getAttribute("position"),g=u.mesh.geometry.getAttribute("normal"),v=0;for(let m of u.all){let p=[];for(let b=0;b<3;b++){let R=m[b],S=m[(b+1)%3],T=u.upper?R.h>=d:R.h<=d,y=u.upper?S.h>=d:S.h<=d;if(T&&p.push(R),T!==y){let A=(d-R.h)/(S.h-R.h);p.push({p:R.p.clone().lerp(S.p,A),n:R.n.clone().lerp(S.n,A).normalize()})}}for(let b=1;b<p.length-1;b++)for(let R of[p[0],p[b],p[b+1]])f.setXYZ(v,R.p.x,R.p.y,R.p.z),g.setXYZ(v,R.n.x,R.n.y,R.n.z),v++}f.needsUpdate=!0,g.needsUpdate=!0,u.mesh.geometry.setDrawRange(0,v)}}}return c(0),{update:c,count:o.length/2,group:s,dispose(){for(let l of o)l.mesh.geometry.dispose();r.dispose(),s.removeFromParent()}}}var Su={modelSha256:"376d8f9bcecabeff5a64b35836e542e70f2559f6accfaf95d5d4c500a39caaec",sides:{Left:[[.558721914,.139336748,-.817566568,.05964562],[-.786094502,-.084118839,-.612355661,.056561261],[-.761770697,-.142276508,-.632030696,.055624061],[-.98413507,.164502078,-.06646225,.068574808],[-.94734886,.163881332,-.275087343,.068597503],[-.935029107,.15968399,-.316577941,.067855183],[-.945193482,.131922827,-.298673146,.06474516],[.437100075,.813155744,.384345235,.179515203],[.389673455,.845941066,.364058115,.186052827],[.242435204,.932724149,.266928517,.203605036],[-.950855077,.142239955,.275031668,.062980645],[-.941755861,.156406428,.297712829,.065580164],[-.856848025,.139769878,.49626187,.060587783],[-.821083495,.161137873,.547591527,.064251442],[-.583081277,.621999277,.522621397,.153366906],[.278684485,.123021544,-.952470817,.060021187],[.31611841,.088883625,-.944546903,.055614431],[.571325491,.126860941,-.81085972,.058147027],[.42066484,.208173735,-.88300894,.075084063],[.404101588,.131992871,-.905140756,.059933811],[.417809703,.133917515,-.898610679,.060072921],[.437713349,.134290444,-.889029303,.059973053],[.48036813,.134367621,-.866713218,.059594638],[.389348824,.101122793,-.915522623,.056387121],[.376514253,-.337994039,-.862552634,.028830563],[.287391132,-.444776376,-.848280798,.027512152],[-.192660775,.069768053,-.978782021,.059762696],[.794004876,-.146815364,-.589916524,.037423153],[-.590236751,-.519247856,-.618063299,.055952988],[.170557,-.364606391,-.915408373,.03156893],[.243703863,-.356151738,-.902088891,.029898211],[.279444988,-.38198651,-.880906808,.028309204],[.27940927,-.382079589,-.880877771,.028308047],[-.929319646,-.276213755,.245093771,.046023246],[-.93092415,-.302971622,-.203932399,.052189124],[-.921437693,-.388235024,-.015038063,.049654798],[-.902453536,-.336728762,.268684493,.04533794],[-.830455123,-.508527565,.227473085,.046680602],[-.677528508,-.630007571,.379533375,.046064802],[-.152038248,-.888465344,-.433028525,.047171836],[-.743868677,-.664453379,.071840789,.052015895],[.07227078,-.788977236,-.610157238,.037574896],[-.757783545,-.641320699,-.120299045,.054450528],[-.885346141,-.444572043,.136080525,.047490543],[-.891573002,-.435301574,.124940475,.047533453],[-.898585282,-.429698068,.088904792,.048136259],[-.882515758,.114036527,-.456247309,.063241965],[-.944302778,.119951186,-.306437556,.063459694],[-.821745552,-.088701297,-.56290881,.056350568],[-.572070547,.084261642,-.815864734,.062884417],[-.586165354,.088278941,-.805367622,.063150896],[-.892850748,.162051269,-.420186777,.068185488],[-.987706466,.155483586,.016149046,.066886034],[-.983066264,.14621241,.110465611,.064860322],[-.993279091,.107488334,-.042929068,.06173961],[-.987972945,.099646367,-.118237307,.061403213],[-.996365199,.082982321,.019243844,.058737843],[-.985702912,.129365777,.107954923,.062758712],[-.987255172,.132188724,.088619227,.063324835],[-.992999679,.103013377,.057791708,.060264621],[.528483843,.725735903,.44046819,.162217795],[.291067789,.791620497,.537230426,.179008003],[.259617249,.779765431,.569705851,.17742919],[.006422742,.260060128,.965571063,.080535846],[-.176705471,.25728307,.950042419,.079634892],[.128736954,.244108671,.96116479,.078886311],[.146435852,.248375786,.957531206,.079640378],[.171988109,.256972428,.950991725,.081073679],[.114411301,.255942805,.959897565,.080592414],[-.01892805,.856361552,.516029671,.194766663],[-.43683933,.819673087,.370550171,.189237885],[-.606726528,.18312404,.7735299,.066258186],[-.637580259,.422514327,.644184025,.114751999],[-.695592369,.17071641,.697858986,.064467317],[-.942624324,.167095112,.289030461,.067803156],[-.592750222,.803770026,-.050999212,.188256436],[-.729825577,.595595024,-.335590815,.148400785],[-.761761447,.564973807,-.317055352,.143125632],[-.842726558,.482504578,-.238749409,.12883665],[.160052787,.062461103,-.985130304,.054595469],[.28754832,.06071099,-.955840018,.052882042],[.548974902,.80493389,.225184348,.182297884],[.80428572,.580268295,-.128113958,.144433334],[.447208516,.887976766,.107246475,.20026836],[.437940015,.092921672,-.894189077,.055110839],[-.33998389,.088908675,-.936219099,.063119632],[-.296642831,.078667426,-.951742857,.061721296],[-.312355437,.078104886,-.946749021,.061815343],[.083177199,.134927875,-.987358102,.064173107],[-.129179708,.138422585,-.981912313,.066852552],[-.145156538,.140022426,-.979450509,.067263301],[.100963507,.132517134,-.986025141,.06358389],[.210376383,.124321197,-.969683463,.061054703],[.534758625,-.21976677,-.815926332,.030818183],[.475631988,-.163556076,-.864305283,.034181056],[.473944419,-.156366669,-.866559953,.034579817],[.548993712,-.188706918,-.814245419,.031883076],[.541895376,-.197248166,-.81697158,.031519367],[.671101424,-444962e-9,-.741365416,.046500475],[.596223067,-.173478365,-.783851588,.033282848],[.567756128,-.182389045,-.802737327,.032455118],[.640225417,.01724503,-.767993506,.047793132],[.548356342,.014462383,-.836119705,.047249492],[.54474925,-.006710664,-.838572133,.04570167],[.515430786,-.121221208,-.84831393,.037002189],[.139619262,.055813124,-.988631052,.054183506],[-.040270945,.087607377,-.995340745,.059765764],[.788979545,.008710669,-.614357714,.048207609],[.773988802,-.151956013,-.614695619,.036983935],[.723121101,-.162008098,-.671453088,.035896494],[.350074192,-.563162699,-.748529114,.026385694],[.309879423,-.689131104,-.65503669,.025856012],[.308651929,-.683486889,-.661498042,.0257467],[.309585342,-.676962379,-.667741606,.025655588],[.308788093,-.677482905,-.667582824,.02565178],[.304193169,-.66901959,-.678144014,.025743015],[.350074002,-.563162807,-.748529122,.026385693],[.25687695,-.596376576,-.760492743,.02758118],[.232517429,-.502499917,-.832724131,.028539024],[.283330512,-.478926109,-.830875203,.027260253],[.305771186,-.563426884,-.767498618,.026437156],[-.93048332,-.184138878,-.316691751,.054289432],[-.905791083,-.197413114,-.374927429,.053929768],[-.925915785,-.280181363,-.253334487,.052789592],[-.930935828,-.3022572,-.204936743,.052199218],[-.961048537,-.257888662,-.099393905,.052115883],[-.161672134,-.067706454,-.98451915,.049042742],[-.370701326,-.186941055,-.909743683,.050273279],[-.879087672,-.151804759,-.451840879,.054356422],[-.823033335,-.150127987,-.547793498,.055288473],[.157926179,-.352952519,-.922216808,.032119053],[.314431439,-.700939499,-.640169266,.026112341],[-.656405366,-.674766265,.33737588,.047694088],[-.092794102,-.91067938,-.402557228,.046057706],[.120046067,-.598412432,.792143613,.044397012],[.207914439,-.317108578,.925318181,.043833049],[-.75451613,-.272592572,.596991372,.04022924],[-.741567582,-.258008502,.619281143,.039776097],[-.74050742,-.259285964,.620015766,.039763408],[-.935341747,-.23431224,.265016209,.045846804],[-.92295734,-.382619421,-.041858407,.050057998],[-.924940054,-.36722072,-.098157212,.050823086],[-.916487077,-.383261647,-.114725529,.051393924],[-.729519295,-.579647659,.36305673,.045606012],[-.737589096,-.517916121,.433272681,.044380027],[-.771466902,-.45101423,.448803948,.043698632],[-.825728276,-.510282171,.240384943,.04651072],[-.399080101,-.662996782,.633380091,.044109383],[-.586865763,-.543072661,.600550298,.043060077],[-.607869542,-.572689787,.550019115,.043796119],[-.991966648,.036808867,.121025933,.054975176],[-.917427725,-.091226895,.387303527,.04576599],[-.867887771,-.096626643,.48727211,.04331404],[-.85000427,-.076283536,.521223141,.043240135],[-.997895179,.062694164,.016572682,.057201158],[-.992818614,.039438294,.112941667,.055174788],[-.992625587,.049689583,.110568481,.055632764],[-.949316056,.097680561,-.298759995,.061739437],[-.92154285,.0633737,-.383069902,.06086815],[-.914098232,.107175039,-.391072798,.062640076],[-.91636077,.107372073,-.385686631,.062632058],[-.898357478,.117593649,-.423232295,.06332053],[-.845291286,-.027016584,-.533622288,.058662232],[-.882959878,.073598155,-.46364336,.061711932],[-.877501636,.082743526,-.472381612,.062090236],[-.458762076,.052765336,-.886991081,.060379915],[-.458920121,.062970762,-.886243198,.06118215],[-.616143318,.088330839,-.782665366,.06304187],[-.87798967,.168315514,-.448111623,.069282203],[.748535278,.158364346,.643906571,.072087432],[.814059819,.264804987,.516899342,.084078494],[.865417395,.250434171,.433976333,.081746384],[.694011954,.028201145,.719410942,.059695111],[.004270057,.259829781,.965644993,.080483439],[-.014395558,.258875989,.965803287,.080225798],[-.046915915,.251910111,.966612742,.07893491],[.280338474,.763191869,.582192847,.174123804],[.260315749,.760817516,.594468182,.17401148],[-.098125221,.290771797,.951747447,.086111809],[-.07066207,.294722296,.952966757,.086884235],[.489719126,.429915035,.758517132,.11329616],[.350047867,.531699675,.771208108,.131049326],[.456540019,.273039923,.846770578,.085068614],[-.487229126,.165985011,.85735451,.063840901],[-.422641788,.221765686,.87874564,.073162376],[.138266587,.968611885,.20657533,.210749366],[-.145145254,.98933452,-.012250038,.214336828],[-.180747282,.983448008,-.012666319,.21350091],[-.275669658,.95659565,.094503975,.211029901],[-.412595099,.845870455,.338036179,.193753403],[-.022228468,.865386335,.500612012,.196382596],[.292360022,.056010587,-.95466666,.052394517],[.43733079,.068130194,-.896716263,.052644398],[.461179622,.037203384,-.886526516,.049593435],[.453269541,.034199141,-.890717207,.049408871],[.525761028,.081333557,-.84673502,.053582739],[.531521606,.095199507,-.841677988,.054943824],[.849544004,.48130725,-.21591275,.125367111],[.437918671,.88903678,.133569612,.199875716],[.437414349,.890364806,.126171311,.200277087],[.428685303,.893181956,.135848827,.200566346],[.52876707,.094823594,-.843453538,.054920386],[.505592621,.088892236,-.858180792,.054425371],[.444570226,.087332796,-.89147647,.054481553],[.442644934,.089320985,-.892237202,.054700993],[.445453445,.096376526,-.890102687,.055460509],[.451818836,.100282574,-.886455382,.055869215],[.258950587,.639447949,-.723913609,.160116513],[.264071944,.720160204,-.641588099,.17421993],[.283253864,.693757899,-.662168578,.169216257],[.057046822,.104200727,-.992918863,.06069824],[.088077106,.114781463,-.989478468,.061564241],[.159694084,.098188497,-.982271255,.058640595],[.154073675,.087352513,-.98419045,.057468801],[.190105254,.814859027,-.547599085,.19168851],[.194173248,.809637446,-.553880813,.190745775],[.404436137,-.326531724,-.854288267,.028918341],[.398674236,-.329444102,-.855876999,.028880063],[.508893186,-.158012106,-.846203226,.034098864],[.503928297,-.157532393,-.849258392,.034185106],[.509141076,-.154353052,-.846729296,.034387594],[.531535985,.026023212,-.846635866,.048274825],[.491343824,.034276054,-.870290985,.049205951],[.524947655,.049109373,-.849716558,.050476018],[.044724832,.054310682,-.997521949,.055288443],[.042409246,.047805794,-.997955942,.054752385],[-.043238817,.070666969,-.996562383,.058062347],[-.027837827,.075648562,-.996745881,.05834818],[-.077229258,.094921736,-.992484512,.06102375],[-.076513308,.094727981,-.992558474,.060993418],[-.100320452,.073270255,-.992253635,.05907746],[-.162610385,.072508401,-.984022558,.059712757],[-.018699003,-.23021436,-.972960275,.040981694],[.264843989,-.297066692,-.917392523,.03221022],[.245396409,-.338857641,-.908270941,.030643813],[.089314968,-.00722186,-.995977249,.049379515],[.1498597,.012080337,-.988633469,.050217439],[.069908472,-.037635746,-.996843195,.047328464],[.374090524,-.187626611,-.908213926,.034939711],[.359134203,-.191143161,-.913502554,.035056113],[.353303232,-.667200111,-.655759741,.026158216],[.337129384,-.662995214,-.668416879,.025847425],[.291078703,-.643178244,-.708233673,.026268439],[.30172197,-.639061444,-.707505706,.026004164],[.303620132,-.666994978,-.680391443,.02576308],[.239465464,-.563967108,-.790314743,.028202098],[-.392561495,-.570731487,-.72122191,.052225962],[-.077895689,-.211558614,-.974256237,.042687284],[-.052190224,-.260993328,-.963928765,.040524331],[-.154979012,-.220046767,-.963099645,.043960035],[-.180396203,-.131399455,-.974777612,.046994552],[-.208122161,-.002013894,-.978100767,.054233879],[-.173619873,-.033800463,-.984232528,.051373416],[-.21799852,-.050138754,-.974660326,.050963343],[-.458078528,.051481011,-.887419725,.060279257],[-.645514594,-.008402597,-.763701712,.057915527],[-.594002806,.026122524,-.804038731,.05851991],[-.552546791,.020164568,-.833237922,.058111655],[-.527436509,.015799239,-.849447534,.05778233],[-.371405356,-.027735106,-.928056477,.05439429],[-.184902239,-.133395338,-.973661566,.047016254],[-.188049016,-.169980449,-.967338728,.046042095],[-.374717472,-.159837772,-.913257194,.050927502],[-.876589295,-.124370451,-.464890524,.054970015],[-.710569445,-.117806643,.693694932,.039946851],[-.6449257,-.096090229,.758180393,.038701543],[-.644412979,-.095569055,.75868206,.038696498],[-.679195123,-.077040027,.729903295,.039855815],[-.830084729,-.077884327,.552171508,.042849116],[-.797400172,-.110332134,.593278844,.041809489],[-.675482042,.152600499,.721413265,.060762252],[-.710857799,.149555578,.687251277,.06035631],[-.74928324,.140671947,.647136794,.059119182],[-.533132492,.085736022,.841676352,.053564691],[-.605257065,.121162753,.786755027,.057249994],[.211851359,-.500332977,.839515285,.044115078],[-.892914162,-.332432691,.303632682,.044788244],[-.848171572,-.3852313,.363595697,.044164677],[-.832997534,-.26422409,.486107745,.04180021],[-.847878104,-.231157525,.477146644,.041765432],[-.866993741,-.213557185,.450239028,.04211883],[-.780805538,-.361618483,.509484823,.042298859],[-.833035807,-.324416142,.448113279,.042761776],[-.845601701,-.383915127,.370900174,.044064313],[-.780324243,-.442907086,.44150582,.043748687],[-.773256566,-.442646086,.454025027,.043588617],[-.48972306,-.338950047,.80329583,.03875134],[-.520364766,-.244872495,.818081885,.037832104],[-.666618244,-.243215084,.704603818,.038881671],[-.728781634,-.26057384,.633228714,.039644196],[-.629922891,-.314577259,.710097388,.039372522],[-.573638203,-.263763555,.775479206,.037976082],[-.696000686,-.131587717,.70588081,.039539964],[-.705740095,-.19778457,.680303008,.039419028],[-.892841334,-.164953337,.419076066,.043000835],[-.888827428,-.170353552,.425400365,.042745957],[-.886821307,-.170074243,.429677462,.04264182],[-.886825676,-.167779291,.430569774,.042659914],[-.886876383,-.167456278,.430591077,.042665115],[-.88110978,-.450995609,-.142297281,.052904847],[-.905456241,-.40302512,-.133115545,.052029578],[.079288769,-.732902402,-.675697684,.036643148],[-.497363235,-.700521543,.511761059,.045628155],[.023949645,-.981110559,-.191959595,.046775746],[-.518590745,-.697420916,.494638965,.045683443],[-.57372734,-.6698289,.47134508,.045437939],[-.586567031,-.668971942,.456525639,.045623952],[-.985643366,.118726997,.120046053,.061362919],[-.992716663,.102223767,.063748947,.060109463],[-.993627117,.095257782,.060258663,.059467276],[-.971972828,.073612566,.223271162,.056164934],[-.998000982,.061738028,-.013507589,.057511647],[-.990169825,.073685282,-.118887325,.059414157],[-.998095191,.05043862,.035523717,.056513088],[-.997227063,.048639633,.05632381,.056217726],[-.996795988,.056437262,.056679743,.056535423],[-.997886757,.062261401,.018588632,.05716068],[-.951301654,.11052626,-.28776572,.062664844],[-.976111865,.102115884,-.191775841,.061918104],[-.981307723,.102375913,-.162954976,.061844915],[-.946127943,.118300736,-.301408114,.063315042],[-.980817715,.072554559,-.180921103,.059919027],[-.980224712,.077858516,-.181927365,.060134967],[-.473386597,.064922437,-.878458995,.061380545],[-.473342529,.060903667,-.878770501,.061065978],[-.513436946,.072355588,-.855071442,.06204631],[-.534688232,.102682314,-.838787719,.064880773],[-.578748393,.139218669,-.803534977,.06913017],[-.696136115,.174406118,-.696402912,.072548769],[-.642501211,.174189136,-.746224054,.073095948],[-.63696427,.141720186,-.757754517,.069140291],[-.715364818,.139992124,-.684584094,.068055841],[-.711097517,.136738093,-.689668772,.067719662],[-.701389998,.099051491,-.705861795,.0634999],[-.706572859,.174689478,-.685739295,.072458475],[.933996901,.155564525,-.321635612,.063107631],[.965889301,.252915964,.055600119,.080818436],[.66395522,.658415282,.354475363,.151990946],[.629605695,.675441764,.383894638,.154481191],[.446101388,.680251427,.581593971,.156225325],[.426631792,.641209139,.637837091,.149588042],[.43254846,.640577012,.634478464,.149385079],[.483878175,.674223752,.557928529,.154461745],[.515722977,.708541157,.481662993,.159637793],[.517938246,.712443709,.473459538,.160235203],[.596912493,.658315336,.458602653,.151417237],[.724913849,.2827167,.628149011,.086867766],[.722700023,.282976311,.630578373,.086916987],[.681588419,.284788091,.674042262,.087345986],[.809469471,.080012651,.581684752,.064361598],[.792399769,.015658531,.609801129,.058880749],[.906870276,.263957913,.328500414,.083621068],[.546305003,.03299272,.836936273,.059325057],[.732701648,.083607741,.67539473,.064744212],[.748421421,.096168117,.656214195,.065856807],[.329322595,.264316902,.906467431,.083073555],[.271415774,.26765714,.924496151,.083307641],[.229116727,.262671454,.937288234,.082317665],[-.597981706,.158379318,.78570597,.061928458],[-.375652925,.22699636,.898530763,.074098473],[-.183150028,.256225712,.949107187,.079442741],[-.286413163,.25313063,.924062976,.07905577],[.296188976,.035805921,-.954457975,.050552415],[.351765761,.014444455,-.935976606,.048399756],[.237860642,-.067932971,-.968920753,.043363477],[.216318539,.005882379,-.97630512,.048992262],[.764871025,.12502702,-.631933984,.058970515],[.6564224,.120618036,-.744688473,.057668582],[.643794153,.126384834,-.754689315,.058225039],[-.688092348,.658382123,-.305060488,.160235312],[-.612661108,.749373128,-.251169828,.176910102],[-.275751922,.958982066,-.065683135,.21116344],[-.017824974,.971041765,-.238243911,.21665161],[.067566352,.924802007,-.374400904,.210485229],[.127357798,.825593421,-.549704916,.194660704],[-.039079856,.721930407,-.69086124,.179456519],[-.433837619,.674733892,-.5970922,.170889891],[-.02001317,.068760873,-.997432411,.057535486],[-.020969112,.070932821,-.997260664,.057769885],[.038190391,.054389402,-.9977892,.05536842],[.036257501,.05417368,-.997873041,.055371039],[.153954641,-.323959872,-.933460213,.033528521],[.199227412,-.340759367,-.91879894,.031685047],[-.004817231,-.159496501,-.98718674,.043548698],[.016294734,-.190691566,-.981514752,.041984843],[-.018017866,-.228677748,-.973335422,.041033766],[.033981497,-.045270094,-.998396653,.047442566],[.032331501,-.071100625,-.996945021,.046442082],[-.036440437,-.091177429,-.99516771,.046569758],[.414436378,-.168422192,-.894358124,.035058758],[.408498121,-.130930583,-.903319693,.037086473],[.455472605,-.152170745,-.877148089,.035076582],[.455209279,-.159604434,-.875962863,.034698122],[.708050365,-.043435764,.704824811,.054221174],[.717002538,-.001672177,.697068551,.057385494],[.720564702,.008987713,.693329453,.05818693],[.708192766,.017352808,.705805842,.058849009],[.973271486,-.133471656,.186890162,.045580491],[.999380769,.03510584,-.00237858,.054731437],[.381317869,-.445691259,-.809911097,.027460272],[.381316501,-.4456898,-.809912543,.027460285],[.403966267,-.329410892,-.853404781,.028868282],[.403967907,-.329409606,-.853404501,.028868301],[.365877553,-.728206099,-.579525231,.027523296],[.32836788,-.899180416,-.289221566,.040391878],[.154183846,-.921052534,.357616514,.051281642],[-.042511547,-.671822013,.739491685,.044599558],[.329027844,-.719359809,-.611769681,.026615892],[.332143317,-.72262504,-.606212725,.026738431],[.15164291,-.907263781,-.39227141,.03982939],[-.110141195,-.983841802,-.141153197,.049299712],[-.106874051,-.983187069,-.148057844,.049181908],[.231851856,-.80009523,-.553256125,.032542424],[.320424212,-.712214563,-.62456284,.026378103],[.868720665,-633923e-9,-.495301933,.048030977],[.863959317,-.020007355,-.503163994,.046562717],[.841527094,-.02512826,-.53963017,.045957316],[.834388733,-.009255399,-.551098703,.047046592],[.235261907,-.550058121,-.801303874,.028362153],[-.052062393,-.579400485,-.8133785,.041257801],[-.901768532,-.190572423,-.387937708,.054020455],[-.883008638,-.159065055,-.44158131,.054307942],[-.222052871,-.464640971,-.857205512,.04720742],[.231156283,-.515012201,-.825426681,.028554975],[-.988706558,-.078621498,.127585272,.051368005],[-.937855461,.031607189,-.345583738,.059511309],[-.954180105,.039387944,-.296629258,.059585087],[-.941382218,.043931699,-.334469019,.059815402],[-.939055996,.042019109,-.341186505,.059776784],[-.936208739,-.173970286,-.305364595,.054479174],[-.985245728,-.111816154,-.129568529,.054726666],[-.967483871,-.096100546,-.233965049,.055887711],[-.879815483,-.137826629,-.454893983,.05463022],[-.879264278,-.15054361,-.451919187,.054379051],[-.836544885,.133077011,.531491452,.059042125],[-.857205559,.135551725,.496814211,.059777143],[-.737741704,.112286326,.665679322,.055765508],[-.652187033,.113907277,.74945127,.056107042],[-.659437699,.117435566,.742530006,.056500704],[-.517274048,-.062116811,.85356257,.040286786],[-.572760495,.045270901,.818471723,.048963488],[-.470615794,.002873266,.882333564,.045790868],[-.454826728,-.032069306,.890002364,.042866919],[-.361666755,-.050283607,.930950437,.042210499],[.163143933,-.260105224,.951698129,.043357136],[-.437165613,-.337161412,.833791586,.038621098],[-.419640387,-.349766745,.837594872,.03878844],[-.335723674,-.328069304,.882983662,.039120597],[-.183110283,-.309580686,.933075786,.040174175],[-.251742947,-.348071183,.90303485,.039819095],[-.183453914,-.468215474,.864360417,.04155826],[-.022066684,-.477135981,.878552399,.042784481],[.030708631,-.404708344,.91393005,.042459839],[.028554152,-.400727355,.915752285,.042421828],[-.032196118,-.336086266,.94128074,.041579312],[-.361061769,-.46444186,.808658245,.040739911],[-.410453048,-.391145305,.823731537,.039454956],[-.471303658,-.381233823,.795319831,.039443599],[-.490201209,-.556425845,.670889748,.042653243],[-.480004644,-.566509325,.669822907,.042798242],[.567002736,-.813127321,-.131650515,.043271758],[.320744515,-.510646643,.797723613,.044331988],[.258675074,-.530321372,.807370081,.044248058],[.124453007,-.597391338,.792234207,.044410228],[-.637770859,-.115396654,.761532628,.03839143],[-.644063175,-.1226517,.755075617,.038480372],[-.656608798,-.151697942,.738818395,.038648428],[-.642117568,-.175477911,.746252325,.038462434],[-.59148465,-.108816281,.798939876,.037724842],[-.617828856,-.104187763,.779379506,.03810472],[-.571606899,-.274680932,.773185578,.038094237],[-.571560359,-.275012461,.77310213,.038097996],[-.571264323,-.27523779,.773240734,.038100791],[-.944564049,-.144567268,.294786469,.04647233],[-.959039929,-.187486477,.21234697,.047513845],[-.955927626,-.192132938,.22200745,.047250627],[-.970553076,.048896586,.235872529,.054078561],[-.837926492,-.011397542,.545664081,.046000673],[-.813185614,-.058109528,.579096227,.042903534],[-.849928489,-.076151581,.521365995,.043241498],[-.852854239,-.071611564,.517215072,.043547025],[-.863554231,-.003659771,.504242695,.047119089],[-.989437184,.052793655,-.135006997,.05874077],[-.9748367,.037929276,-.219669705,.059107667],[-.95623945,.080210344,-.281375931,.060882929],[-.958793272,.081748284,-.27208947,.060891358],[-.957950959,.089659672,-.272563944,.061195792],[-.956599795,.090450443,-.277011821,.06125047],[-.542730684,.173062452,-.821883686,.073509974],[-.559573409,.173726317,-.810368291,.07348427],[-.751350778,.335922059,-.568003855,.101950795],[-.760710952,.372795085,-.531359268,.108584361],[-.761417956,.499516322,-.413190198,.131205231],[-.738674314,.570522733,-.358976419,.14397335],[-.68736068,.535372432,-.49082752,.140474631],[-.563856464,.173492973,-.807444163,.073425333],[-.567980014,.169550623,-.805388906,.072917127],[-.568320787,.173377349,-.804333126,.073387534],[-.375362084,.097999047,-.921682967,.064259067],[-.429494565,.102505322,-.897233012,.064944713],[-.397588328,.160880772,-.903349821,.072074778],[-.192600618,.143341953,-.9707513,.06824339],[-.732374567,.095550417,-.67416438,.06288826],[-.770180206,.077018671,-.633159201,.06234053],[-.798029904,.098869888,-.594451864,.063127926],[-.867380224,.113247876,-.484588966,.063432062],[-.725219583,.144858856,-.67310658,.068524611],[-.745413221,.15031528,-.649433944,.068936802],[-.714131833,.174992954,-.677785505,.072405179],[-.713534089,.16932162,-.679852405,.071709276],[-.764462294,.190070898,-.616011732,.074389901],[-.765093842,.178199819,-.618769938,.072104427],[-.764238266,.178194534,-.619827864,.072116565],[-.752023203,.177031905,-.634917953,.072142021],[-.754347214,.173369626,-.633169213,.071653589],[-.771045242,.155904529,-.617400205,.069221451],[-.792970962,.175471761,-.58344384,.071324543],[-.781119185,.176350608,-.598960168,.071613292],[-.779337402,.156128426,-.60684193,.069115617],[-.805460374,.150804852,-.573141764,.06804098],[-.810317762,.171736718,-.560260318,.070554659],[.901475533,.182656355,-.392400968,.067205129],[.902447873,.160964194,-.399597754,.063636553],[.886297825,.161977837,-.433865585,.063616583],[.969550292,.188071395,-.156848278,.069148444],[.972643384,.155686627,-.172413809,.063977158],[.965071005,.146747567,-.217032503,.062312311],[.963656491,.147548543,-.222700684,.062401717],[.981031296,.181303431,.068605125,.070232765],[.975999407,.155319258,-.152646934,.064188811],[.942892494,.282760515,.176068837,.086739474],[.955036525,.248114973,.16230895,.080313018],[.955928682,.248794554,.155889787,.080415987],[.954840635,.247856868,.163848512,.08027381],[.951243683,.248526712,.18267438,.080491997],[.531441579,.275310113,.801108101,.085769873],[.493898786,.27065496,.82632311,.084810425],[.488405678,.245972762,.837231924,.081481508],[.678551968,.284586492,.677183694,.087327729],[.719854351,.252727192,.64648177,.083108042],[.62587093,.231999254,.744622002,.080524434],[.721406175,.22412838,.655240108,.079566413],[.730384031,.234077529,.641675056,.080752084],[.957701929,.176872509,.22698707,.071447583],[.896967006,.195295794,.396622924,.074943872],[.875628807,.165000826,.453926117,.072102688],[.889541024,.109748525,.443477201,.066476625],[.978546503,.130604107,.15934023,.065645733],[.957148728,-.078518226,.278749351,.049984217],[.97097156,-.03537861,.236564121,.052435954],[.854926532,-.035596207,.517526361,.054619282],[.789710617,.277771106,.546992096,.085953083],[.801422875,.27809891,.529511446,.086029963],[.599340004,.686529877,.411665262,.155991217],[.594855821,.691227838,.41030553,.156733533],[.563625656,.706651451,.427749748,.159099866],[.57981804,.68467565,.441622343,.155628577],[.868282624,.266338983,.418507863,.084032771],[.869383676,.266309693,.416234514,.08402411],[.868898852,.262592971,.419594706,.083482398],[.869663831,.252169346,.424376534,.081956819],[.881271704,.252005095,.399816978,.081911629],[.877576924,.266180728,.39875627,.083987399],[.875315213,.266633455,.403397916,.084059935],[.464830966,.139032759,.87441527,.068938121],[.47724238,.189403023,.858117827,.074483397],[.435535415,.149481317,.887673497,.069852691],[.297618056,.240025256,.924019139,.079583822],[.648890782,.122746072,.750915544,.068440414],[.728177285,.13356831,.672247981,.069481287],[.733708006,.145762151,.663645957,.070741535],[.54336739,.187780165,.818223985,.074669781],[.522721362,.075984304,.849110572,.063092926],[.318997045,.254022362,.913079145,.081571968],[.293957548,.255281033,.921097472,.081653513],[.316658845,.251174808,.914679393,.08116479],[.317516197,.251521239,.914286897,.08121624],[-.068549592,.218197041,.973494224,.073595075],[-.358344808,.054076509,.932021851,.0515522],[-.35321751,.054681379,.933941828,.051644242],[-.443240771,.125484987,.88757599,.059004304],[-.51047496,.089489482,.855223332,.054198172],[-.609367995,.159281067,.77672401,.062002948],[-.610952797,.170037867,.773190665,.063707294],[-.599876335,.177702629,.780109069,.065120466],[-.603888697,.172905978,.778088661,.064209164],[-.523979774,.192988902,.829578496,.067957607],[-.55018115,.182639744,.814827237,.066049524],[-.591061587,.174972539,.787420352,.064612466],[-.565429597,.164316844,.808263166,.063031674],[-.54774083,.166881193,.819835746,.063517923],[-.283255517,.232854049,.930346873,.075320636],[-.284222202,.204639414,.936664535,.07080238],[-.243844952,.204389654,.948031913,.070882146],[-.23832179,.239711599,.94113818,.076544306],[-.371885286,.197392122,.907048888,.06932305],[-.328001753,.201967223,.922834812,.070237564],[-.287249564,.23247725,.929215807,.075251408],[-.372011852,.226639968,.900134161,.074044351],[.35471206,-.02743487,-.934572995,.045290799],[.375097562,-.111784493,-.920220651,.038737698],[.315223059,-.093034523,-.944446399,.040765944],[.327475213,-.097421884,-.939823899,.040327499],[.332718042,-.151505716,-.930776408,.037590395],[.393839022,.533760462,-.748325193,.138561584],[.350404059,.615408481,-.706037816,.154240878],[.77655218,.195656826,-.598903263,.068855498],[.650564404,.155223037,-.74341897,.061792542],[.615885285,.153309937,-.772775115,.061556967],[.812876187,.110820903,-.571796321,.057702763],[.819502664,.112011393,-.562022092,.057879033],[.831398028,.079573747,-.549950305,.055066217],[.811212948,.086577404,-.578306066,.055497267],[.86870946,.123463112,-.479688163,.05928449],[.872186727,.125553536,-.472786022,.059515549],[.952087042,.097015823,-.290031367,.057391841],[.840075156,.271303831,-.469753087,.084180793],[.837099638,.272136425,-.474558703,.084363833],[.839778113,.278542613,-.466032976,.085652404],[.965591691,.258521543,-.028271874,.081295207],[.161756147,-.351903252,-.92195393,.032052713],[.151332296,-.341414625,-.927650036,.0327788],[.156288829,-.335084059,-.929135337,.032955583],[.182477817,-.349102205,-.919146069,.031688272],[.18105365,-.351803357,-.918397503,.031597032],[-.055540252,-.05369204,-.997011758,.048307216],[-.108541692,-.058231784,-.992384885,.048741204],[-.107613731,-.054305651,-.992708508,.048973662],[.995876829,-.055191611,.07199463,.04911059],[.425557133,-.575290546,-.698528391,.026494459],[.4307989,-.567032584,-.702058656,.026530053],[.46528313,-.621039101,-.630731356,.027547183],[.984980223,.071265703,-.157274157,.055475442],[.940271958,.00388743,-.340402016,.04925262],[.947273303,.009052589,-.32029883,.04979462],[.974983965,.11580246,-.189726272,.059176468],[.975140001,.116096518,-.188742093,.059202368],[.977708463,.111904567,-.17766128,.058868992],[.981779735,.097599796,-.163042425,.057685289],[.983519403,.084366226,-.159912239,.056573305],[.983816779,.081596837,-.159519597,.056339418],[.986805751,.09569127,-.130604708,.058068849],[.995855855,.076280065,-.049522388,.057501539],[.995166031,.077279903,-.060600225,.057440988],[.985403763,.166542623,.035255892,.068059169],[.989330415,.129115112,.067487911,.064320021],[.994426283,.102231099,-.025790879,.060302057],[.992369838,.104662243,-.065176072,.059994125],[.981062947,.123825029,-.148939103,.060618381],[.980159101,.153128509,-.125856253,.064251571],[.985655678,.162893742,-.044141962,.066664678],[.470456899,-.804331517,-.362934039,.036438576],[.391786395,-.916388214,.082073515,.048891805],[.369844163,-.928990671,-.013842952,.047327061],[.419553224,-.7235614,-.548118594,.028508349],[-.300288981,-.669350257,.679556298,.043954051],[-.090612729,-.669054636,.737668779,.044306108],[-.209488872,-.523606052,.825803315,.042044246],[-.316592801,-.510828386,.799264261,.041479597],[.262208343,-.818342297,-.511431979,.033030479],[.331635744,-.723572329,-.605360073,.026796995],[-.982791482,-.118792113,.14145436,.050301117],[-.996589813,-.056849143,.059807361,.053074677],[-.992486509,-.100630053,-.069599731,.054240854],[-.995010837,-.099292708,.009715575,.053140358],[-.996145286,.015376911,-.086360411,.057018771],[-.90100005,.134992452,.412281393,.060673277],[-.88630153,.025763497,.462391437,.049534913],[-.509139827,-.237810838,.827177515,.037902484],[-.485119699,-.262666505,.834065456,.038001544],[-.466085062,-.27519412,.840852491,.03809944],[-.366510757,-.2802374,.88720734,.038761593],[-.319445666,-.242339863,.916092712,.039165037],[-.120597886,.046736807,.991600636,.053187749],[-.235781305,.039973358,.97098368,.050894844],[-.236879457,.039413337,.97073926,.050828688],[-.246926341,.004996264,.969021372,.047773579],[-.007382625,-.278425279,.960429519,.041732437],[.02544563,-.269943876,.962539778,.04211367],[-.591316046,-.113126327,.798465884,.037728664],[-.595408667,-.148655496,.789550545,.037822344],[-.564841805,-.24849853,.786894031,.037831573],[-.532624426,-.241900555,.811045832,.037796139],[-.961352061,-.176596171,.211225014,.047718295],[-.957661382,-.167598578,.234084162,.047426381],[-.983178862,-.097717021,.154307188,.050464072],[-.984656056,-.094988723,.146388503,.050653011],[-.98310955,-.11138379,.145221429,.050363964],[-.980593514,-.124849922,.151158384,.049995545],[-.939944433,-.145308102,.308852745,.046126115],[-.936054005,-.153334669,.316688141,.045811532],[-.913409243,-.148711272,.378904359,.044319608],[-.918276247,-.142684204,.369337179,.044678051],[-.721074958,-.058158103,.690411863,.04114134],[-.78282713,-.0513508,.620116748,.042483822],[-.737105762,-.056903139,.673377404,.041488243],[-.596560434,-.021465263,.802281055,.043320577],[-.68512726,-.073959721,.724658952,.040046455],[-.683088029,-.074040064,.726573336,.040038418],[-.672837171,-.034977163,.738963287,.042549096],[-.686522402,-.031917683,.726407774,.042769618],[-.706815185,-.063813236,.704514134,.040718642],[-.702777349,-.065853649,.708355345,.040586944],[-.988033233,.02603399,.152028161,.054152569],[-.978824317,.047434797,.199130351,.054492832],[-.988193644,.04769824,.145596019,.055147627],[-.988600917,.035476127,.146320438,.054620569],[-.943335389,-.015527311,.331477369,.049711583],[-.829196159,-.055256594,.556219776,.043517098],[-.827892592,-.063559862,.557273722,.043090608],[-.815097556,-.058340386,.576378672,.042938232],[-.817576193,-.05619362,.573071938,.043115513],[-.853704725,-.033615727,.519671266,.045334915],[-.852570616,-.042052708,.520917378,.044899355],[-.84339301,-.044412181,.535458485,.044490447],[-.94583964,.030408598,.323206889,.051897674],[-.94504774,.028859066,.325656144,.05178822],[-.877907035,.01025597,.478721268,.048347732],[-.886813089,.025320721,.461434076,.049515792],[-.609026626,.033655885,-.792435392,.059036522],[-.609610805,.019245981,-.792467197,.058445241],[-.637797808,.00142591,-.770202521,.058129867],[-.710101484,.046004618,-.702594803,.060805923],[-.728047612,.093421067,-.679131194,.0627809],[-.647730222,.058090676,-.759651916,.060621599],[-.885597186,.138699364,-.443260771,.065576641],[-.867864978,.11374978,-.483602489,.063468697],[-.883156939,.114211055,-.454961159,.063244559],[-.891930216,.116221478,-.436981759,.063252378],[-.895173529,.118051447,-.429800196,.063353768],[-.793801296,.104444127,-.599141825,.063341423],[-.814598163,.10776822,-.569926173,.063512604],[-.785803547,.107189548,-.609116726,.063548028],[-.779791477,.104799799,-.617205196,.063374304],[.87659161,.165793242,-.451774003,.064119176],[.956268682,.167398494,-.239849852,.065417587],[.951488065,.153259861,-.266799321,.06298931],[.967886915,.202062658,.149551335,.073570454],[.969532201,.200700934,.140450869,.073320451],[.965420995,.222695052,.135533085,.076485133],[.955766091,.245209566,.162429825,.079877873],[.957011442,.220082597,.188925251,.076367159],[.956726698,.221807036,.188349848,.076614592],[.954225459,.226032502,.195864956,.077277326],[.954136892,.223277683,.199423838,.076898324],[.523630382,.211206407,.825350275,.077182949],[.643690144,.222256241,.732301278,.079370837],[.614064598,.226741884,.755984648,.079802039],[.588935482,.218328568,.77813086,.078589621],[.973429854,.111004702,.200280494,.064327921],[.911004314,.100091366,.400066068,.065328783],[.928228828,-.005905778,.371962854,.056171704],[.969584397,-.026093552,.243362328,.053196796],[.989720155,.03475032,.138731504,.056877094],[.874903743,-.112775162,.47098323,.049235978],[.880296839,-.098612149,.464061547,.050039657],[.847306502,-.062421751,.527423186,.052680609],[.763257107,-.082833738,.640762952,.051515672],[.76881886,.281710434,.574070371,.086603678],[.751329636,.333869012,.569240952,.095967394],[.745091362,.331773424,.578589023,.095605254],[.748976806,.28288987,.599171984,.086845351],[.355783248,.146387812,.923032442,.068998691],[.518314905,.202175092,.830948188,.076073613],[.502757782,.195757861,.841969995,.07529012],[.493660711,.145880015,.85733198,.06986195],[.495043124,.073669511,.865739631,.062708388],[.468643631,.083235997,.879457171,.063428726],[-.198389029,.089976009,.975984688,.056447312],[-.0990598,.089940864,.991008475,.057688022],[-.053971004,.107232491,.992768011,.060046401],[-.207871383,.19834657,.957835125,.070118669],[-.638025321,.159782037,.753255196,.061928481],[-.637966066,.160255701,.753204759,.062004223],[-.63999133,.159647648,.751614081,.061900148],[.278422383,-.083678472,-.956806611,.041847757],[.280680288,-.089044923,-.955661853,.04155999],[.272265023,-.081641724,-.958752516,.042057238],[.781302676,.172358818,-.599882128,.064649069],[.754834335,.175015787,-.632134955,.064927537],[.776539212,.191446215,-.600279268,.067991221],[.944918949,.09608889,-.312881934,.057248294],[.930935912,.009389647,-.36506186,.049593547],[.869595989,40426e-9,-.493763925,.048095276],[.88631404,.114241954,-.448771877,.058498864],[.88991666,.116780437,-.44092025,.058763003],[.915313753,.118785343,-.384825643,.0591664],[.96428603,.255448624,-.069988951,.080517883],[.969196402,.18980338,-.156949074,.069419773],[.958161585,.180423755,-.222201813,.067594117],[.938935314,.187114653,-.288770814,.06831094],[.960428012,.277375935,-.025310565,.084813223],[.957531726,.275713845,-.084349687,.084203036],[.884968876,.46343569,.045359123,.1192814],[.857078993,.50560568,.09888628,.126874951],[.808961409,.558377928,.1838356,.136018995],[-.088630957,-.058752524,-.994330274,.048456854],[-.086305476,-.058791903,-.994532492,.048423646],[-.085756048,-.059235144,-.994553718,.048400744],[.461724674,-.282355066,.840884024,.045357415],[.621005788,-.366391796,.692898884,.043691918],[.555171853,-.412591326,.722185995,.043973241],[.453058764,-.456601005,.765671782,.04404565],[.421165935,-.477198378,.771298232,.044178335],[.56742922,-.703576123,.427790509,.049806743],[.615474379,-.521755055,.590730862,.047112175],[.591270698,-.731959812,.338576129,.049735589],[.558056901,-.777346378,-.290353412,.03847029],[.883479423,-.192172514,.427239784,.044764986],[.701311872,-.097560712,.706146986,.050783928],[.733082373,-.082056592,.675171793,.051624191],[.743853419,-.078315002,.663738541,.051803668],[.717649479,-.053028187,.69438263,.053576228],[-.068894436,.022514514,.997369868,.051737471],[.994841841,-.098186035,.025479669,.04586618],[.990269106,-.109963279,.085294632,.045777515],[.979616604,-.127809587,.154971026,.04558931],[.999733703,.01435854,-.01806531,.052878708],[.99943701,-.033346907,-.003694179,.04951752],[.997689238,-.050285568,-.045689679,.047837055],[.985308705,.028331055,-.168416471,.051862366],[.985625084,.031480799,-.165988411,.052128517],[.543928323,-.686787674,-.482145901,.030902558],[.498335604,-.706795387,-.502097507,.030138829],[.440753245,-.720818604,-.534936555,.028936706],[.430693057,-.721561191,-.542082041,.028691029],[.465837196,-.620957145,-.630402991,.027556553],[.621251774,-.637197724,-.456097899,.031862332],[.648819449,-.606936799,-.458978262,.031944777],[.730874136,-.526657629,-.43411374,.032975564],[.750414332,-.487676303,-.44615037,.032843459],[.551061496,-.368989726,-.748450272,.028624005],[.547457086,-.332745614,-.767835331,.029036864],[.55531484,-.267363944,-.787490921,.030112445],[.640681832,-.226545562,-.733623812,.032913651],[.684713301,-.208193896,-.698443267,.03423395],[.838960196,-.147394857,-.523851645,.038111504],[.690008166,-.5207827,-.502666996,.031592143],[.636236424,-.550523239,-.540488091,.030482076],[.557321019,-.563791028,-.609535035,.028742125],[.491972252,-.506024416,-.708450841,.027162665],[.513089733,-.44947285,-.731240783,.027613312],[.521595783,-.435959011,-.733401377,.027799413],[.985914572,.073354379,-.150304993,.055764624],[.985774492,.07483009,-.150496208,.055890324],[.988694358,.074486892,-.130135199,.056198543],[.906495668,-.147936935,-.395449451,.038871714],[.901355424,-.143636662,-.408566897,.038893439],[.914076879,-.104023024,-.391972792,.041545918],[.98901121,-.019552604,-.146541879,.048760173],[.992438737,-.038503531,-.116545407,.047816414],[.988144368,-.060600227,-.14106141,.046535903],[-.202809635,-.698779589,.68598494,.044642473],[-.233782873,-.692876214,.682105652,.044499878],[.105638901,-.956950808,-.270343437,.043894763],[.245720909,-.841422879,-.48127827,.034635543],[-.998200496,.049489876,-.033860326,.057338559],[-.998849281,.046098082,.013231795,.056637121],[-.996557536,.017058323,-.081130084,.056992678],[-.999963543,-.007210931,.004573256,.055226015],[-.997206554,.041162999,-.062327331,.057410433],[-.997319607,-.052670496,.050787994,.053321427],[-.998153821,-.044897181,.040904677,.053686848],[-.994866872,-.029754816,-.096718964,.056114465],[-.903263184,.070668287,.423227614,.05392431],[-.906017172,.130362988,.402664097,.060214123],[-.93529095,.136623342,.3264428,.06165684],[-.939567527,.136968038,.313771603,.061794837],[-.968561064,.112755753,.221755733,.059868279],[-.966119521,.085067913,.243672981,.056995327],[-.765022995,.032727723,.643170828,.047755556],[-.822898461,.028755734,.567460334,.048272187],[-.814462329,.025139283,.579671572,.047812933],[-.754401187,.138958956,.641536637,.058879634],[-.751694105,.096008025,.652486346,.053975987],[-.740732275,.112442311,.662323504,.055769151],[-.379311182,-.190236007,.905501678,.039208503],[-.19797075,-.222967643,.954511924,.03988646],[-.194694448,-.222783903,.955228457,.039898342],[-.170629065,-.211277723,.962417501,.040157002],[-.232430559,-.077028552,.96955796,.042024449],[-.353850275,-.064068992,.933105111,.041336855],[-.55672562,-.103050142,.824279839,.037932785],[.578141335,-.117101072,.807489898,.049409644],[.588571396,-.118798763,.799669035,.049384963],[.691653859,-.098017452,.715547006,.050782182],[.518978123,-.041975193,.853756283,.053331227],[.519185388,.021899891,.85438102,.058178988],[-.037876187,-.11023926,.993183115,.043025097],[.251359631,-.168332172,.953143544,.045257865],[.155472719,-.134022055,.978706454,.044985028],[.03683126,-.132558157,.990490683,.043453782],[.047056836,-.171639058,.98403541,.043045237],[.161492621,-.239635664,.957337392,.043331283],[.19845996,-.23194225,.952269099,.043809322],[-.650689908,.079568784,.755163196,.052340018],[-.681955631,.07792119,.727230917,.052180884],[-.725263141,.065873962,.685313065,.050857953],[-.629653688,.024869016,.776477795,.046837042],[-.60450502,.042085282,.79548885,.048472231],[-.978605085,.039642428,.20189246,.054125048],[-.982107585,.009776716,.188066763,.053012458],[-.975861079,-.007992224,.218245913,.051865343],[-.952046942,-.028161896,.304653127,.049613666],[-.948556577,-.020806231,.315923284,.049738807],[-.95566316,.036050644,.292246943,.052645915],[-.960517695,.039850868,.275350078,.053090517],[-.784705681,-.001548558,.619866595,.045478993],[-.808680639,.012148732,.588122464,.046802462],[-.820584556,-.008930207,.571455368,.045722788],[-.807821379,.123931903,-.576251249,.06501637],[-.819555554,.124164098,-.559385351,.064971933],[-.876299702,.138361927,-.461470269,.065732094],[-.811934709,.141851756,-.566250923,.066915347],[.940640994,.170121717,-.293688819,.065542518],[.943030711,.155467666,-.294147724,.063171753],[.94006871,.155716577,-.303353207,.063175935],[.522069402,.207602651,.827251279,.076740159],[.519674791,.203199563,.829848209,.076198614],[.574095394,.216220505,.789723478,.078230905],[.579114533,.21613936,.786072602,.078256836],[.58259469,.217184217,.783207791,.078405817],[.566416437,.210263795,.79684475,.077472517],[.525454681,.20437052,.825911659,.076394419],[.523508503,.202203381,.827679068,.076120336],[.540557768,.193511802,.81874934,.075287243],[.833758305,-.124064835,.538010229,.048979695],[.809588102,-.119022583,.574804949,.049394208],[.779888382,-.101717029,.617598379,.05044248],[.128379193,.163015157,.978235576,.068386284],[-.051183241,.218423708,.974510831,.07377328],[-.053100868,.217961133,.974511797,.07368688],[-.054316782,.148226488,.98746068,.06461745],[-.031484775,.141296887,.989466472,.064017934],[.244479784,.181011409,.952609314,.071838382],[.301553306,.1728169,.937656612,.07148138],[.33464529,.192893262,.922390763,.074107592],[.300547038,.201972065,.932136665,.074885467],[.519032859,.161022673,.839450171,.071614823],[.535107489,.157034352,.830060352,.071308635],[.533488367,.09208925,.840779241,.064728054],[.475684143,.098821889,.874047384,.065002145],[.543531813,.147132329,.826392913,.070339306],[.511147613,.140862974,.8478713,.069486569],[.542491674,.114770553,.832184177,.067050674],[.559488571,.112085458,.821224323,.066864741],[.57694068,.121474547,.807702536,.067890684],[-.11419118,.205099632,.972056848,.071486407],[-.124721331,.203520054,.971094319,.071218655],[-.138054694,.143902166,.979914827,.06330472],[-.126566859,.146659331,.981056508,.063744773],[-.208035339,.110447692,.971865528,.058609561],[-.183862491,.126833997,.974734693,.060804515],[-.216646936,.160114664,.963030321,.065023978],[-.306386363,.111061961,.94540607,.058171515],[-.302503864,.109869871,.946794605,.058045208],[.839508832,.171042396,-.515722231,.064798287],[.799618615,.172982838,-.575053917,.064860549],[.800363222,.194594409,-.567055314,.068675244],[.879215632,.076935627,-.470171014,.055137866],[.871462377,.032241678,-.48940147,.05103814],[.899087988,.181868256,-.398201866,.067051072],[.878440616,.16748291,-.44753945,.064424563],[.962390419,.259215525,-.081314157,.081153985],[.959529426,.264173758,-.097547456,.081982641],[.958862514,.268703767,-.091547614,.082856157],[.904357803,.426674437,-.009267639,.112626686],[.95077938,.265952089,-.159022192,.08219638],[.739927106,-.307003342,.598545592,.043404161],[.732097614,-.314237499,.604390501,.043399947],[.758315754,-.271792067,.592525349,.04376653],[.94562154,-.162129966,.281981874,.045250409],[.928997211,-.250483378,.272437626,.043223454],[.969073861,-.140159536,.203103806,.045457749],[.917402957,-.174302685,.357757443,.045228244],[.894638393,-.153374544,.419640793,.046794928],[.202335147,-.104308624,.973745449,.046654356],[-.014142807,-.079315621,.996749223,.044931085],[.007112466,-.08609823,.996261265,.044847565],[.258831678,.005896112,.965904446,.055026027],[.248143436,.083979615,.965076297,.061466877],[.160091014,.089447366,.983041218,.060955685],[.082417964,.072122183,.993984743,.058352205],[.015899552,.025034106,.999560152,.05315772],[.863716766,-.264397779,.4290538,.043768958],[.926383055,-.250456835,.281221991,.043268244],[.870441588,-.215848359,.442426183,.044164506],[.863072754,-.221011756,.45415771,.044120463],[.803221921,-.428823218,-.41345519,.034040088],[.786452685,-.446479515,-.426788257,.033610175],[.547621933,-.382470442,-.744195256,.028467599],[.550786372,-.370578519,-.747867591,.028605632],[.932154479,-.033045044,-.360549653,.046578774],[.970025926,-.042983713,-.239169613,.046944558],[.923664672,-.094301799,-.371417211,.042454189],[.914844142,-.099073446,-.391464747,.041870922],[.916200406,-.069905867,-.394575703,.04376298],[.223901074,-.933342861,-.280605441,.041925215],[.053020865,-.990117041,.129834636,.050777953],[.251927403,-.876095905,-.411082169,.037186854],[.319713192,-.755190991,-.572249982,.028838548],[-.998291185,.054807224,-.020270117,.057341724],[-.99874325,.050117496,395435e-9,.056935921],[-.998162179,.05849639,-.015825211,.057419043],[-.99920808,.035026433,-.018877536,.056711319],[-.997333037,.041507333,-.060032954,.057392939],[-.99730835,.041413892,-.060505737,.057395639],[-.999676244,.025033871,-.004551031,.056235469],[-.999522566,.030617311,-.004149825,.056385947],[-.994247261,-.034768481,-.101309112,.056058382],[-.992561354,-.044663468,-.113256934,.055981554],[-.995353298,-.053215735,-.080248969,.055402222],[-.994650274,-.052499673,-.088964136,.055527493],[-.995334513,-.081391182,-.051813916,.054406657],[-.889555265,.115568761,.441967524,.058179678],[-.765262061,.032547287,.642895522,.047743174],[-.775157549,.027794841,.631156258,.047467],[-.792865692,.028131459,.608746759,.047751522],[-.782696763,.02833408,.621757957,.047620087],[-.821249031,.131636238,.555177386,.058551405],[-.755622576,.095299918,.648037382,.053923049],[-.796261377,.132626126,.590235656,.058363631],[-.754383924,.004743166,.656416329,.045502689],[-.764302101,.006570616,.64482488,.045754784],[-.432597712,-.163123215,.886707413,.038976335],[-.479273711,-.122762943,.869037381,.038867817],[-.546407731,-.09900535,.83164688,.038131725],[-.55368739,-.101882351,.826468548,.037990606],[-.555636647,-.104221121,.824867186,.037939487],[-.530798286,-.135368212,.836617372,.038060544],[-.142916427,-.148677338,.978503932,.041221643],[-.156387202,-.190502263,.969150107,.040538503],[-.026097335,-.175463539,.984139968,.042372416],[-.492869858,-.084528074,.865987476,.03915857],[-.488282929,-.082623066,.868765337,.039265247],[-.510204879,-.083662456,.85597405,.038951521],[-.519236908,-.087253566,.850164601,.038730961],[-.51734167,-.086367342,.851409584,.03878121],[-.513938289,-.077201566,.854346156,.039335188],[-.51661375,-.069318021,.853408018,.039822582],[-.527050085,-.090097459,.845044766,.038571104],[.496436642,-.080124845,.864367208,.050634004],[.490560275,-.05784996,.869484904,.051955404],[.423587789,-.051527388,.904388364,.051906781],[.371515425,-.070992154,.925708595,.050217873],[-.052420239,-.077601032,.995605443,.044492076],[.143834761,-.236321553,.960970179,.043210359],[.11134027,-.222956725,.968449092,.043078879],[.049768417,-.26088899,.964085079,.042389878],[-.745431604,-.018729449,.666318941,.043859036],[-.744971326,-.02810575,.666504156,.043238992],[-.732276087,-.041736279,.679727751,.04226428],[-.713187012,-.01015594,.700900237,.044313483],[-.631179491,.024889986,.775237344,.04684366],[-.725827376,.033663929,.687052661,.047646233],[-.741521022,.027491815,.67036615,.047123731],[-.777483477,-.021014791,.628552162,.04411786],[-.799918267,-.0231453,.599662456,.044448582],[-.784932957,-.040386381,.618263045,.043131032],[-.776655191,-.011670028,.62981785,.04468105],[-.774748441,-.017742947,.632020602,.044262453],[-.747499195,-.026364154,.66373932,.043376775],[-.747412372,-.025186044,.663882828,.043453471],[-.755494281,.004479091,.65513993,.045497339],[-.760739245,.004316581,.649043271,.04554936],[.857598564,-.12288836,.499422821,.048837172],[.863368283,-.119965515,.490105584,.048950601],[.860098948,-.180558428,.477104238,.045692732],[.856479208,-.131635284,.499114734,.048377303],[.856453496,-.131559846,.499178741,.048381521],[.831451429,-.135074807,.538927934,.048403203],[.138015097,.167124316,.976228096,.068976442],[.521511497,.1677624,.836589227,.072351685],[.533542161,.172962217,.827899048,.072991291],[.537865274,.184234783,.822653324,.074235529],[.528608827,.189446434,.827455592,.074745433],[.519813274,.174507659,.836266248,.073074054],[.525845975,.08268276,.846551576,.063758236],[.475562046,.097927183,.874214508,.064912824],[.469672841,.084765967,.878761716,.063584734],[.523752485,.078762692,.848221535,.063365784],[.52843723,.09502746,.843637289,.064993421],[.531354612,.0937169,.841949772,.064878573],[.530204445,.095599756,.842463016,.065060647],[.47452157,.026790495,.879836092,.058298911],[.43863265,.014187945,.89855445,.057068888],[.853631802,.233370981,-.465672343,.076448565],[.91477867,.22786634,-.33355197,.075202459],[.91254825,.225696996,-.341052133,.07481341],[.893220991,.21241543,-.396277612,.072404484],[.857779715,.200289742,-.473389882,.070085604],[.834852455,.19542204,-.514617921,.069057667],[.801326766,.1948537,-.565603615,.068728946],[.878908542,.07582372,-.470925193,.05503612],[.870636145,.043500065,-.490000457,.052052476],[.832862739,.078428379,-.547894741,.054976365],[.746166172,-.310135603,.589111153,.04342832],[.743801676,-.310510296,.591897307,.043408367],[.739815521,-.312737213,.595708344,.043407406],[.770510664,-.3594354,.526421419,.044648105],[.352038768,-.164017405,.921502576,.04635999],[.466581532,-.196171954,.862448977,.046569489],[.590321379,-.192832007,.783796202,.046891561],[.514900224,-.116076902,.849354998,.048952589],[.498630616,-.111364696,.859630975,.049005993],[.549021639,-.127163282,.826077926,.048744082],[.597507022,-.188016301,.779509608,.047010628],[.807956197,-.4881164,-.330074482,.036201048],[.901727245,-.182402454,.391940456,.045054188],[.893732098,-.167590884,.416120454,.046010176],[.886106416,-.19061003,.422472763,.044814348],[.761385638,-.231053723,.605727734,.044879693],[.784127987,-.21896028,.580688984,.045034049],[.784656827,-.220984487,.57920594,.04495999],[.791969113,-.243612147,.55985538,.044099891],[.230559453,-.09655004,.968256386,.04740495],[.211906711,-.10322039,.971823593,.046826096],[.224804775,-.102418516,.969006326,.047030096],[.243944814,.003605287,.969782414,.054705812],[.056415096,-.002126569,.998405136,.05163478],[.167635542,-.096630815,.981101835,.046652322],[.232199795,-.095733377,.967945441,.047467896],[.974117164,-.15368403,.165761788,.044973346],[.964949073,-.255882552,.058287267,.041688441],[.965406623,-.256658365,.04600583,.041562704],[.955093687,-.249951275,-.159123877,.038943508],[.98988167,-.136994789,.036969009,.044576733],[.981944794,-.134869763,.132644516,.045286851],[.986830384,-.100597023,-.126672933,.04476997],[.994717519,-.099920648,.023514268,.045776212],[.99448745,-.100510387,.029872621,.045772618],[.993098388,-.106836968,.048388579,.045588383],[.991915028,-.121773436,.035718449,.045030805],[.932683325,-.235311279,-.273368645,.037483755],[.922794917,-.173693806,-.343918598,.038570455],[.728847131,-.338356507,-.595228303,.033465054],[.932562346,-.241046334,-.268745486,.037370311],[.933115361,-.253160338,-.255353804,.037192819],[.932795973,-.253754071,-.255930739,.037186213],[-.997052652,-.065020704,-.040722435,.054599791],[-.996325639,-.075255598,-.040887846,.054380649],[-.997873101,-.056258766,.032927578,.053581232],[-.877890041,.129394514,.461048952,.059507129],[-.863757645,.135295767,.485404765,.05988523],[-.875621121,.135025702,.463740997,.060112514],[-.895832756,.123743333,.426815253,.059222523],[-.884569031,.129161853,.448168322,.059617223],[-.882674423,.131656597,.451167821,.059868164],[-.901991637,.128215903,.412276327,.059872447],[-.776200703,.047809613,.62867059,.049295518],[-.776250868,.047812846,.6286084,.049296619],[-.790701041,.029721679,.611480568,.047863698],[-.779018845,.032390399,.626163318,.047929084],[-.770051261,.037783666,.636862191,.048278129],[-.82205118,.131338473,.55405962,.058529231],[-.833251519,.132345715,.53682075,.05888365],[-.810635563,.056300111,.582838126,.050655616],[-.82584692,.046809321,.561948175,.049993805],[-.768070798,.026554541,.639814118,.047265763],[-.762028951,.031004325,.646800286,.047571984],[-.764909335,.03264563,.643310168,.047746932],[-.765130225,.03241896,.643058901,.047730312],[-.762731735,.02305432,.646303953,.046925908],[.43892262,-.095348197,.89345154,.049381147],[.409544121,-.111608004,.905437611,.048362201],[.410517733,-.111786194,.904974606,.048360053],[.42953999,-.109906774,.896334702,.048582638],[.521215955,-.105051303,.846934562,.049551525],[.514981619,-.103150714,.850972304,.049585055],[.498008332,-.108420398,.860367781,.049141549],[.469718511,-.09403676,.877793602,.049660644],[.496166126,-.110751212,.861134916,.049009922],[.497767619,-.108323097,.860519322,.04914373],[.49823232,-.1054677,.860605089,.049291673],[.496379711,-.094837788,.862909599,.049816019],[.491284131,-.088778931,.866463043,.050085172],[-.175398477,-.090744803,.98030646,.042008971],[-.220700585,-.074091711,.972523352,.042357724],[-.175762614,-.089697811,.980337598,.042063879],[-.159017321,-.038846511,.986511247,.045469934],[-.165675126,-.038674338,.985421762,.045390145],[-.085832556,-.10631202,.990621283,.042502895],[-.08868653,-.094483718,.991568216,.043067159],[-.144517588,-.100598229,.984375265,.041904695],[-.134160138,-.10511463,.985368952,.041843265],[-.73648651,.005878617,.676426687,.045492787],[-.744267281,-.004692311,.667865403,.044771228],[.893649209,.239590708,-.379456696,.077591555],[.869551332,.468871768,-.15504756,.122418528],[.885645153,.456727847,-.08385903,.119314989],[.915379759,.390104198,-.099491762,.106196667],[.798977705,-.171952284,.576252583,.046604122],[.814168758,-.172463479,.554423649,.04650619],[.819365065,-.147053795,.55409031,.047834334],[.811962118,-.146046946,.56514406,.047929285],[.122682496,.241022699,.96273416,.078406265],[.121010305,.2406847,.963030312,.078349925],[.202242354,.231513271,.951577446,.077852726],[.180447824,.227835363,.956833126,.077186679],[.160479834,.171785609,.971975271,.069812549],[.194828877,.177368531,.96466684,.070876434],[.262571466,.23383182,.936151112,.07857905],[.456205892,.023166632,.889572645,.057891266],[.469222128,.026177141,.882692105,.058215558],[.394199128,.05449187,.917408133,.06015336],[.459209546,.07675214,.885006046,.062750639],[.421515443,.06061195,.904793304,.060952904],[.467268835,.043613819,.883038884,.059768419],[.485089736,.069574443,.87169223,.06226511],[.415465784,-.01031835,.909550281,.054990887],[.415829055,-.009506996,.909393102,.055056356],[.308681793,.022375264,.95090215,.056753278],[.332228966,.052531623,.941734752,.059386923],[.321673042,.031876108,.946314096,.057616585],[.331911887,.029096166,.942861555,.057500623],[.405858792,.028200222,.913500623,.05802904],[.9214783,.237987024,-.30698521,.077032405],[.931246487,.246810161,-.26807597,.078662537],[.939431887,.241339596,-.243357615,.077738543],[.932731415,.19808279,-.301289421,.07006522],[.92485392,.199364968,-.323880897,.070216234],[.923101188,.206085071,-.324673898,.071393005],[.921675115,.213346917,-.324034065,.07266836],[.942207921,.252447533,-.220260019,.079718188],[.942073031,.252678786,-.220571609,.079758849],[.942481876,.253060032,-.218377044,.079829585],[.589803979,-.129541603,.797088602,.048886295],[.598661371,-.12527913,.791144552,.049125303],[.733200776,-.188888426,.653251701,.046521752],[.709111591,-.185340433,.680301165,.046820407],[.688047948,-.193984553,.699256759,.046667398],[.739573987,-.212892144,.638519579,.045693304],[.946560023,-.294837393,.130747977,.042850142],[.949586807,-.256934445,.179637378,.042734786],[.942741881,-.255684872,.214156466,.042939071],[.775838885,-.253254432,.577872146,.043976457],[.787130127,-.246425731,.56542066,.044066273],[.779555158,-.236835592,.579829853,.044487938],[.768833182,-.241086666,.592260717,.044466167],[.352713399,-.103569401,.929982063,.048313758],[.320632994,-.081328355,.943705559,.049183549],[.295984446,-.086592126,.951259697,.048659175],[.030950105,-.08481857,.995915609,.045308284],[.054296814,-.084693234,.994926586,.045688127],[.025668873,-.064228794,.997605018,.046613075],[.007310784,-.073254507,.997286483,.045688995],[-.880614231,.088521211,.465491752,.055077953],[-.833846249,.11112113,.540696336,.056577257],[-.857251328,.112286731,.502505573,.057181177],[-.765890614,.026841411,.642410388,.04726422],[-.767725651,.026443514,.640232821,.0472522],[-.762864929,.023262793,.64613926,.046943183],[-.761062772,.024909361,.6481998,.047055198],[-.746321898,.027498587,.665016881,.047150173],[-.75843805,.020560695,.651420741,.046695318],[-.758218551,.020214784,.651687034,.04666776],[.478340042,-.109534546,.871316812,.048947084],[.472639887,-.101915926,.875342608,.049288499],[.472031536,-.109380254,.874769792,.048913161],[-.11863652,-.061002025,.991062122,.04460555],[-.119382594,-.0607912,.990985482,.04460728],[-.169812099,-.089480959,.981405629,.042161788],[-.167252041,-.093115149,.98150717,.0419889],[-.144641505,-.10055615,.984361364,.041905239],[-.746019185,-.001456354,.665922859,.045003829],[-.742123244,.002205746,.670259819,.045251721],[-.750186243,.001878978,.661223918,.045269422],[-.73720817,-.007921918,.67561924,.04452266],[-.733650939,-.009996366,.679452995,.044366356],[-.72794964,-.002921024,.685624379,.044842365],[-.729880241,-.006748297,.683541728,.044579716],[-.729745766,-.008005374,.683671728,.044491512],[-.722431785,-.006762258,.691409132,.044559331],[.178853456,.227756714,.957151148,.077162744],[.139210488,.230435179,.963078433,.077155303],[.138126423,.228032198,.963806209,.076836343],[.142217926,.204674608,.96844327,.073864882],[.36945058,.05167932,.927812221,.059667008],[.366327273,.051533575,.929057921,.059624386],[.394236892,.038485098,.918202685,.058786753],[.414291504,.035260341,.909460971,.058667602],[.926369609,.245868053,-.285286257,.078482088],[.927416834,.245432803,-.282242371,.078395539],[.923333796,.241865804,-.298254312,.077734268],[.923327174,.241916328,-.298233833,.077743857],[.614115181,-.130080459,.778422519,.048972662],[.606722407,-.131667756,.783933366,.048871911],[.686474523,-.166064479,.707937368,.047645355],[.75938484,-.158653401,.63100219,.047478091],[.705225045,-.133144168,.696369347,.048925876],[.764481053,-.163321415,.623614332,.047219853],[.760778796,-.164852797,.627725401,.047199301],[.748360607,-.183500517,.637404081,.046598515],[.781857869,-.177821713,.597559797,.046456472],[.783800385,-.173872813,.596175479,.046584027],[.314522331,-.101900973,.943764746,.048061698],[.307786407,-.100033602,.946182227,.048090563],[.30551857,-.101707553,.9467386,.047984573],[.36397129,-.075169769,.928371911,.049876532],[.351685082,-.07735306,.932916988,.049658974],[.360034211,-.097736327,.927805463,.048673418],[.387233869,-.089652135,.91761235,.049303207],[.390325656,-.086312797,.91662205,.049497632],[-.882152576,.101096865,.45998506,.056439166],[-.865507666,.109252757,.488835672,.057015173],[-.883672927,.105020711,.456171906,.056896543],[-.759845632,.025226857,.649613902,.047069168],[-.756945282,.024349092,.653024472,.046975454],[-.752318712,.027843854,.658210662,.047214131],[-.754744227,.028322642,.655407491,.047273165],[-.815259504,.058960745,.576086427,.050988163],[-.831838367,.077842587,.549532039,.053128598],[-.841507157,.067768657,.535978651,.05229871],[-.827785426,.050919608,.558729346,.05041831],[-.866810997,.084935644,.491349805,.054453502],[-.834606711,.108559958,.540042936,.056321569],[-.835464434,.086384808,.542712487,.054046519],[-.836508801,.09040643,.540443987,.054471141],[-.862707267,.083168162,.498817831,.054200492],[-.852356387,.076368727,.517355205,.053343266]],Right:[[.514476646,-.077637977,-.853982509,.040185688],[.771529881,.609030082,.183913029,.143863673],[.426887884,-.110203075,-.897564492,.041236494],[.456990443,-.070272085,-.88669136,.040921955],[.097149406,-.270854096,-.957705619,.043585802],[.2376129,-.245972761,-.939700756,.042678628],[.002451002,-.253621384,-.967300463,.044285546],[-.345834739,-.362476107,-.865453295,.048423403],[-.040827539,.989155835,-.141080993,.214336742],[-.925156267,.130159925,.356572959,.065834493],[-.406077336,-.286421161,.867792669,.030417543],[-.366913997,.139623012,.919717094,.060739177],[-.388883281,.105542356,.915221615,.056649331],[.633820944,.705066156,.318045165,.159188886],[.565462602,.794982503,.219669901,.176751085],[.606310963,.750306614,.26349004,.167843383],[.702130625,.702941329,.113516841,.161341663],[-.40893659,-.749523452,.520562638,.02572528],[-.667605206,-.532765143,.520062103,.027758983],[-.856114773,-.254226623,-.449929239,.051731737],[-.918635669,-.304173236,.252164926,.038832835],[-.927593502,-.302299713,.219511227,.039829633],[-.793321394,-.42307986,.437772314,.032133643],[-.87635683,-.333141352,.347872887,.035691728],[.297504796,.163025474,-.940698459,.061340621],[.205015019,.153110617,-.96670884,.060507595],[.113975021,.110389085,-.98733173,.056478259],[.433718553,-.246412743,-.86670005,.040791272],[-.165100603,-.878259991,-.448777428,.053530157],[-.407674938,-.750322006,.520401799,.025723609],[.149242516,-.581666912,-.799618831,.045474319],[.143376054,-.58213735,-.800349557,.045532926],[.057008442,-.554728051,-.830076398,.046020498],[-.019053723,-.488959472,-.872098383,.04574217],[-.029489074,-.373037348,-.927347579,.044905624],[-.097249416,-.295145844,-.950490127,.045412278],[-.050136354,-.298367416,-.953133375,.044809234],[-.069081684,-.180103328,-.981218891,.045501574],[-.417061852,.800352724,-.430691223,.185623911],[-.535406173,.542832457,-.647049576,.139150209],[.690881412,.722892301,.010468813,.166243605],[.704571986,.709632462,29146e-8,.163848413],[.543456828,.214474677,-.811575806,.069920054],[.562966656,.19427577,-.803321523,.06672841],[.516063031,.184223401,-.836505043,.064874888],[.497070942,.17882747,-.849082572,.063917842],[.508813464,.20132043,-.83700594,.067609557],[.680218112,-.018077616,-.732786818,.045021696],[-.213119101,.974526664,.069842895,.218011314],[-.233465072,.970464795,.060762996,.217810667],[-.412067329,.138418068,.900578123,.060649394],[-.552358733,.488756608,.675290166,.132406106],[-.929178019,-.301616531,.213671892,.040016593],[-.406140591,-.750975942,.520658193,.025722119],[-.152385643,-.388199593,.908889263,.032174926],[-.373523227,-.349521772,.859252541,.029370072],[.107657911,-.3230836,.940226973,.035094845],[.042925289,-.393132976,.918479114,.03377524],[-.73158811,-.392245227,.557604267,.029717749],[-.875552461,-.332404666,.350592394,.0356616],[.870494497,-.44743941,-.205030011,.04493641],[-.273898036,-.183454296,.944099776,.035058517],[-.229862826,-.175697704,.957232155,.035783026],[.117964397,.110289791,.986874137,.058576946],[.105519205,.112716346,.988008463,.058768757],[-.150047187,-.170638226,.973842101,.036696017],[.222680646,.132359033,.965864595,.061640771],[.226415193,.139118895,.964044653,.062720604],[.230836731,.170418817,.957951893,.067681345],[.056596941,.133701836,.989404167,.06110029],[.121128509,.124170337,.984839891,.060005286],[.194049466,.122258662,.973343528,.059979721],[.252723208,.062633169,.965509226,.054567305],[.149395292,.044741069,.987764792,.052989529],[.035941848,.005528568,.999338591,.049342215],[.205276066,.115735808,.9718369,.059318697],[.205816883,.109596874,.972434027,.058691925],[-.302762272,.147794752,.941536891,.062103433],[.109511778,.219660584,.969410335,.075892637],[-.059716127,.228182073,.971785432,.077828429],[-.040889609,.221789256,.974236915,.076555091],[.103579788,.218452999,.970334744,.075670575],[.666840505,.25962021,.698513484,.083933175],[-.222569821,.272208593,.936143769,.08737842],[-.359311059,.881478012,.306418141,.204891093],[-.502266088,.656558342,.56272544,.16401653],[-.503781156,.635319237,.585298226,.15999725],[-.491822949,.594380035,.636256678,.152311205],[-.484087723,.718402898,.499556156,.175658049],[-.452568386,.771449919,.447266003,.185542684],[-.312897116,.945417143,.091004512,.215499564],[-.523060594,.696035981,-.491875521,.166580792],[-.52319038,.695636296,-.492302722,.166497432],[-.568088609,.637374462,-.520604579,.155535285],[-.973553429,.147062245,.174832542,.06976147],[-.947052669,.14137212,.288279667,.0681872],[-.957999658,.110904772,.264455642,.064259028],[-.993010098,.07932118,.087401926,.061907905],[-.993747288,.076471604,.081353686,.061648849],[-.992230763,.067226413,.104683917,.060614082],[-.99345017,.106836827,-.040529638,.065488208],[-.983857674,.082805591,-.158642086,.06269732],[-.910112625,.081656946,-.406235342,.061521785],[-.556556047,-.637962003,.532212221,.026569943],[-.530173639,-.662232223,.529494472,.026412958],[-.568650673,-.413226411,-.711252659,.052856571],[.408530871,.168733893,-.897012486,.062166094],[.309350034,.165640232,-.936411165,.061683028],[.496088728,.023492036,-.867953972,.047141115],[.606207607,-.576237051,-.548145235,.044349004],[.457412022,-.22979763,-.859050226,.040512562],[.497739555,-.193385428,-.845492408,.040182612],[.496651226,-.142306608,-.856204642,.040106074],[.496841407,-.140143032,-.856451135,.040104659],[.263693422,-.635749836,-.725457046,.045958752],[.382170332,-.618042127,-.687000558,.045061621],[.328669085,-.427183767,-.842312687,.043561914],[.229730108,-.52959388,-.816550304,.044777365],[.173521795,-.54555592,-.819913974,.045015355],[.358665759,-.276582293,-.891549835,.041565268],[-.406465714,-.89007019,.206302402,.040295078],[-.119254869,-.446096989,-.887003806,.046197367],[-.110178057,-.452277086,-.885045893,.046193129],[-.343231293,-.360403227,-.867353327,.048413187],[-.348180751,-.362018817,-.86470373,.048452936],[-.451952373,-.348145155,-.821300191,.049711078],[-.503133021,-.332813881,-.797553813,.050213835],[-.51196907,-.329238092,-.793404027,.050296592],[-.149571657,-.241305411,-.958853492,.046221384],[-.152527301,-.250366566,-.95606067,.046209586],[-.070806669,-.149704985,-.986192087,.045926372],[.234544987,.03912246,-.971317704,.048659305],[.219823685,.01769657,-.975379095,.047239687],[.237805562,-80415e-9,-.971312776,.045996131],[.292825476,-.014754245,-.956052066,.044791423],[-.22000614,.182452832,-.95828402,.069634767],[-.253530177,.162116194,-.95364605,.065929311],[-.298137663,.142773714,-.943784721,.06388664],[.109355802,.058971121,-.992251841,.051538152],[.114358373,.055481253,-.991889103,.05117407],[.102026969,.035604842,-.994144252,.049782104],[-.040365104,.079907423,-.99598467,.055184354],[-.139996977,.059836452,-.988342271,.054309584],[-.436783532,.178290104,-.881721489,.069652436],[-.462694079,.276231581,-.842383703,.088959842],[-.306682681,.177448749,-.935124417,.069138583],[-.337857479,.171681509,-.925406821,.068129194],[.632214079,.202020487,-.747992702,.068309552],[.65353643,.211232289,-.726822575,.069858279],[.830307215,.301919786,-.468438225,.086910968],[.856471421,.257521926,-.447369157,.078579053],[.551047565,.218070012,-.805476289,.070561411],[.454617664,.184298321,-.871410872,.06459624],[.461485999,.185792821,-.867474323,.064850801],[.479494684,.178215572,-.859257853,.063727923],[.465570858,.176314414,-.867269856,.063394779],[.534282019,-.075274141,-.841948055,.040433448],[.583472459,-.06649733,-.809405952,.041149568],[.600329847,-.065620634,-.797055837,.041365219],[.539046479,-.142410338,-.830149498,.040355818],[.523690599,-.10748958,-.845100081,.040213748],[.901892002,.150114974,-.405038654,.06528333],[.863952677,.227935203,-.449033757,.074250593],[.679568575,-.017761031,-.733396958,.0450405],[.604759958,-.011469713,-.796325209,.045007797],[.537686439,.028284477,-.842670328,.047649403],[.544044383,.05757764,-.837078566,.050258631],[.871559448,-.370832389,-.320729586,.044482765],[.640726393,-.060554727,-.765377564,.042007389],[.66722019,-.053640783,-.742926567,.042607843],[.646392056,-.079968202,-.758803266,.041853784],[.908784259,.116999407,-.400527539,.061909128],[-.553935325,.220111662,.802936182,.078868442],[-.561159767,.29295381,.774130339,.093705628],[-.501534516,.108262447,.85833698,.056787995],[-.886840962,.121371453,.445849839,.063642791],[-.863206368,.084975172,.497648456,.058189963],[-.791281513,.068418057,.607612159,.055081672],[-.715830765,.113416397,.689001478,.059344765],[-.794127847,.115631053,.596649329,.060835239],[-.816868193,.113282997,.565591123,.060801428],[-.826098072,.101850145,.554245905,.059510881],[-.687230943,.020315535,.72615488,.048623449],[-.751589513,.022273939,.65925494,.049632374],[-.795386071,.04100309,.604714598,.052056215],[-.751763448,.022222959,.659058312,.049630734],[-.814809403,.034736771,.578687302,.051727637],[-.84806953,.032594172,.528881549,.052056043],[-.798451535,-.119708546,.590038143,.040203069],[-.771601486,-.131951609,.622269974,.038775413],[-.760680987,-.132577574,.635442856,.038506548],[-.959544536,-.018298973,-.280961619,.056581089],[-.969991957,.031652728,-.241067849,.058400786],[-.88204354,-.148822357,-.447047089,.053475463],[-.953360199,-.026715766,-.300650295,.056357821],[-.353974575,-.401505418,.844686569,.028587108],[-.365563055,-.38105741,.849210753,.028828672],[-.117437086,-.954101345,-.275498012,.052008299],[-.333745187,-.786532895,.519596147,.026518873],[-.375188658,-.768338001,.518546224,.026071682],[-.365834685,-.821957373,.436521546,.030497886],[.145227967,-.287360401,.946748561,.035753896],[.276674005,-.287691922,.916888681,.038343507],[-.643555222,-.411744082,.645215846,.029005336],[-.721007754,-.420191896,.550986922,.029220398],[-.704649759,-.490094942,.513103952,.028381172],[-.668203712,-.532012127,.520064319,.027764737],[-.679301598,-.300050555,.669715614,.030777362],[-.694529632,-.238055216,.678939102,.032018842],[-.679301247,-.300049838,.669716291,.030777373],[-.53575755,-.285184616,.794753787,.030623432],[-.908889502,-.17141598,.380179477,.041877872],[-.915610519,-.216980341,.33849211,.040673187],[-.915288804,-.223629908,.335016521,.040443756],[-.869999043,-.307473661,.385436912,.035904311],[-.804061772,-.277456558,.525835073,.034121337],[.659297461,-.593813041,-.46120812,.045117207],[.752347585,-.546297485,-.368146939,.04507764],[.765478357,-.542865901,-.345455494,.045193155],[.730599391,-.427946475,-.53205859,.043495362],[.745689193,-.439952388,-.500389372,.043811611],[.072693475,-.530355888,.844652764,.034396456],[-.014966279,-.569039431,.822174031,.031994618],[-.367718162,-.194587235,.909350956,.033533697],[-.406865568,-.197392106,.891906254,.032874157],[-.00914479,-.17310757,.984860468,.037431285],[.038669812,-.195793777,.979882362,.037060746],[.674342768,.052650085,.736539069,.060809853],[.612114614,.247519603,.751032453,.081882622],[.230228055,.116316122,.966160236,.059725737],[.460282075,.008586813,.887731197,.05332438],[-.115298859,.192068828,.974584906,.070790032],[-.032381617,.164178559,.985898997,.065682131],[-.028747951,.167259713,.985493655,.066236888],[.233824426,.173339379,.95670246,.068171352],[.262383531,.22601653,.938121213,.076970353],[.293699932,.237995043,.925796257,.079115342],[.497240546,.549019775,.671810335,.135607214],[.544973102,.582662437,.602916912,.140856978],[.595547158,.633822922,.493550489,.148756039],[.63454497,.700496147,.326585103,.158429809],[.633975207,.703545257,.321091123,.158935626],[.635404608,.699504711,.327038443,.158273035],[-.047264546,.780521984,.623338989,.188499401],[-.0628699,.776210527,.627331326,.187778923],[-.033160061,.421369079,.906282798,.117413998],[.179666629,.448932692,.875316709,.121035708],[.268247765,.495677723,.826042815,.129278917],[-.954040008,.11083617,.278429536,.064121227],[-.937737172,.117884001,.326729794,.064556965],[-.946616157,.076682765,.313109574,.059654886],[-.961964385,.100828032,.253886255,.06314697],[-.996788419,.05081692,-.061890938,.059853356],[-.997639034,.065226281,-.021491626,.060964577],[-.9941485,.068950735,-.083153814,.061418834],[-.99653639,.069107292,.046253714,.061097137],[-.996196274,.069153929,.053016211,.061070795],[-.996127317,.070104941,.05306284,.061162781],[-.98222733,-.016369595,.18697997,.053370147],[-.910125111,-.168098008,.378702181,.042089267],[-.907485557,-.169704979,.384278785,.041876697],[-.88814196,-.161967937,.430081674,.04134185],[-.87492372,-.138690521,.463975671,.041914233],[-.943302784,.066569642,-.325189701,.060615211],[-.826104208,.105525253,-.553548786,.062770008],[-.911296442,.085090697,-.402862717,.061656024],[-.411437272,-.739051846,.533405793,.025741751],[-.401440424,-.637102727,.657986095,.0263122],[-.533453048,-.63432178,.559520977,.026484197],[-.497491407,-.686862283,.529832524,.026191194],[-.422063505,-.740042136,.523641132,.025740903],[.406967176,.150763848,-.900915079,.060013184],[.411396382,.159986409,-.897305615,.061118972],[.221012129,.12441914,-.967302184,.057031991],[.226578345,.129861677,-.965296948,.057587248],[.29415679,.051728321,-.954356309,.049292204],[.282525694,.052049895,-.957846564,.049367872],[.435648011,.169676145,-.883980099,.062366087],[.444873552,.171028075,-.879111438,.062582794],[.328301154,.168092671,-.929496211,.062015537],[.346557914,.171266529,-.922261019,.062489018],[.379172628,.172897974,-.909029377,.062699837],[.380192614,.171217997,-.908921324,.062449226],[.365624947,.169743974,-.915153201,.062250838],[-.13144679,.816943983,-.561537416,.190272914],[.314213033,.564395697,-.763366011,.140238336],[.315401647,.442262808,-.839598362,.116734249],[.260438141,.187345844,-.947139646,.066480621],[.094051717,.154554247,-.983497463,.061688458],[.06589934,.1537355,-.985912102,.061763877],[.062639316,.153839503,-.986108373,.061812087],[.022506777,.162842399,-.986395356,.06397238],[.378368527,-.035575892,-.924971142,.043064771],[.344753102,-.02403377,-.938385676,.043820818],[.616443264,-.51952083,-.591688947,.043667869],[.610841242,-.541797638,-.577345907,.04393076],[.404493567,-.620966194,-.671405943,.045167984],[.538194873,-.606357569,-.585386008,.045046769],[.393001517,-.609669641,-.688369622,.044969339],[.39205848,-.618921943,-.680606917,.045089199],[.384338338,-.618388244,-.685477951,.045062226],[.383322714,-.617968541,-.686424489,.045053867],[.548870151,-.215019513,-.807779776,.040461819],[.567199769,-.194673132,-.800241709,.040533364],[.657262695,-.204591218,-.725360726,.041462874],[.492173122,-.365635521,-.78998499,.042047772],[.566745761,-.530436693,-.630425378,.044071827],[.516026707,-.563513247,-.645111819,.044575201],[.395267308,-.607313775,-.689154361,.04494738],[.45823058,-.413922527,-.786570326,.04282452],[.462353901,-.22935284,-.856519787,.040476046],[.496690096,-.194634938,-.845822788,.040193117],[.460975387,-.246295217,-.852549329,.040625428],[.497190116,-.147638763,-.854988177,.0401158],[.497901327,-.148295185,-.854460536,.040121362],[.497282751,-.149231917,-.854657651,.040119076],[.512607232,-.095343345,-.853313232,.040114478],[.505694965,-.103783919,-.856447022,.040093217],[.508318015,-.079654641,-.857477658,.040104325],[.508549553,-.079620304,-.857343548,.040104908],[-.33093867,-.787514487,.519904346,.026549067],[-.27505232,-.870099563,.408990185,.032830136],[-.159375974,-.945456312,.284097978,.039497786],[-.160659814,-.941424838,.296492325,.039088],[-.172814332,-.929247609,.326548753,.037902461],[.148152035,-.284097518,-.947280093,.043060512],[.201187401,-.281752112,-.938157437,.042605874],[.208922794,-.284255233,-.93570841,.042564575],[.124768783,-.461275671,-.878440383,.044670363],[.023213002,-.436418931,-.899444091,.044975422],[.00974969,-.387480269,-.921826439,.044678228],[-.308316965,-.377639999,-.873114357,.048127935],[-.203355883,-.406368156,-.890792516,.046946958],[-.129622747,-.443148088,-.88702746,.046310306],[-.416506949,-.802411043,.427385635,.030655999],[-.41166026,-.766128727,.493540884,.027204076],[-.005661606,-.062022435,-.998058698,.047081306],[.042794026,-.06542048,-.996939733,.046785992],[-.055364738,-.125576601,-.990537866,.046257715],[-.032920718,-.077361518,-.996459443,.046957654],[.02097613,.153184506,-.987974954,.062131223],[.048987015,.147943505,-.987781854,.061187899],[.056087695,.130516439,-.989858389,.059158643],[-.063039552,.112279153,-.991675051,.05846814],[-.169525664,.127253116,-.977275649,.060793896],[-.471524965,.175913234,-.864128892,.069443588],[-.459332002,.16937708,-.871966465,.068553544],[-.487116911,.164861993,-.85763491,.068115709],[-.553406402,.172865178,-.81477542,.069252542],[-.12218567,-.128547342,-.98414747,.047248736],[-.254427237,-.040446855,-.966245742,.051754741],[-.086627442,-.06487784,-.994126024,.0481567],[-.414980816,.042803173,-.908822761,.056433203],[-.361178711,.066831564,-.93009864,.056845569],[.479066818,.126288169,-.868646235,.057391911],[.460103312,.118765259,-.879886217,.056355989],[.436599375,.135059228,-.889460506,.058167428],[.436790519,.136669807,-.88912058,.058364484],[.446778709,.161565634,-.879934845,.061449512],[.4638104,.096158264,-.880700574,.053877834],[.486155047,.072741825,-.870839766,.051482607],[.455113721,.053793412,-.888806936,.049671698],[.440950747,.053546187,-.895932612,.049668649],[.319326071,.063395316,-.945522022,.050411819],[.783080263,.06683882,-.618318586,.053606695],[.625151532,.231866073,-.745267526,.073168795],[.62774811,.232476742,-.74289089,.073281538],[.646624175,.22282241,-.729539136,.07174084],[.704249515,.24315699,-.667013717,.075407925],[.77571545,.227652952,-.588591262,.073246984],[.728050011,.228007449,-.646495,.072964325],[.722329569,.237941991,-.649325498,.07459444],[.726663999,.248317478,-.640544973,.076385704],[.758538135,.259717686,-.597634187,.078544168],[.809333866,.267695975,-.522797817,.080076896],[.832213006,.25848419,-.490517519,.07854268],[.868146717,.262863868,-.420979649,.07969558],[.854405545,.307396709,-.418925325,.088160866],[.85112508,.519344133,-.076601367,.128727896],[-.019865059,.989738205,-.141505,.214287455],[.235405244,.904680903,-.355157479,.202887461],[.127026379,.901700729,-.41327968,.202093758],[.091259525,.926145239,-.365959965,.206053532],[.929459219,.17622351,-.324115464,.069346511],[.903094426,.233401118,-.360477984,.076039648],[.813003172,.20604003,-.544585484,.070513313],[.853950657,.215664625,-.473557858,.072362933],[.855159557,.158198263,-.493634928,.064944888],[.816616574,.135227861,-.561115672,.061327215],[.804756642,.139718993,-.576927508,.061701397],[.738877818,-.334889514,-.584729496,.042751541],[.732274473,-.311068049,-.605814134,.04251245],[.851428881,-.341388345,-.398149291,.043964631],[.786266893,-.252052207,-.564140105,.043003217],[.682266645,-.109433784,-.722866842,.042091153],[.750482579,-.136321772,-.646677875,.042698126],[.738790766,-.158462669,-.655040294,.042434171],[.702223695,-.164263375,-.692747736,.041997943],[.731889973,-.049564937,-.679617823,.043729912],[.704754037,-.018032407,-.709222518,.045367834],[.782757419,.029771198,-.621614429,.050377326],[.820475119,.016632738,-.571440226,.050075104],[.941794329,-.292250677,-.166171548,.045487023],[.922644756,-.385549552,-.008842941,.045186679],[.983697272,.179031242,-.01695556,.072745635],[.992806879,.117792099,-.021436467,.066429344],[.959052244,.175863673,-.222015227,.070466167],[.963163385,.181517234,-.198413173,.071383831],[.990023215,.043714172,.133951875,.060604829],[.998765249,.045622572,-.019661097,.059719973],[.995210635,.081356053,.054193963,.063356301],[.978832053,-.029554004,-.202520053,.052228501],[.934026131,-.060774527,-.351996652,.048508836],[.831456457,.040556996,-.554107651,.052388755],[.867761698,.082794187,-.490035466,.057189974],[.98659604,.062363723,-.150794627,.06007012],[.969614938,611358e-9,-.244635441,.05400836],[.936573788,.01454279,-.350168598,.053746169],[.921082131,.051784063,-.385909468,.056276622],[.941664889,.100846901,-.321087433,.061511994],[.965663577,.105742686,-.237302214,.062998444],[.977197687,.094022284,-.190379857,.062456684],[-.655717429,.035903906,.754152214,.049882275],[-.577170574,.170926214,.798535132,.069088879],[-.631075952,.131591543,.764478129,.061628398],[-.503065222,.124049513,.855299422,.058692522],[-.499180381,.124921611,.857445939,.058817238],[-.515353806,.142221752,.845093739,.062549178],[-.56342763,.174582232,.807508731,.069679604],[-.914419829,.075086013,.397741709,.058459744],[-.943451679,.069105937,.324227232,.058613115],[-.87564015,.050125181,.480355903,.054416355],[-.876954517,.069196641,.475565558,.056582637],[-.761168505,-.30154235,.574190489,.032205921],[-.7305672,-.31936662,.603553252,.030805595],[-.726715474,-.305181917,.615425558,.030976131],[-.725497224,-.278513939,.629351861,.031491519],[-.741572824,-.264408488,.616569459,.032329453],[-.794777694,-.269560949,.543751148,.033971629],[-.79907938,-.274226796,.535043744,.034009189],[-.859321229,-.008232308,.511369977,.04929352],[-.859650406,.01787617,.510569899,.051153795],[-.88370065,.012046045,.467897483,.051374332],[-.938049199,-.034841037,-.344745996,.056341448],[-.942155583,-.030582093,-.333777759,.05640232],[-.936452186,-.008391029,-.350694874,.05751102],[-.94799061,-.293010583,.124332626,.042701946],[-.883587818,-.150140894,-.443542874,.053458065],[-.939355626,-.271771992,-.209167376,.049792672],[-.643554336,-.411744741,.645216309,.029005325],[-.595714444,-.523402379,.609240717,.027578867],[-.504263274,-.396806563,.766983118,.028868213],[-.504265097,-.396805344,.766982549,.028868233],[.488071013,-.177361324,.854593264,.044181967],[.296073635,-.286329005,.911238774,.038705111],[-.224504138,-.571653574,.789183175,.027986311],[-.332003402,-.483575108,.809894349,.027562617],[-.235224383,-.566959449,.789446941,.027882189],[-.221013083,-.569408478,.791787346,.028067172],[-.048052642,-.501832661,.863628927,.03135848],[-.044454822,-.496388254,.866961631,.031471442],[-.731688528,-.261359404,.629542024,.032096641],[-.706694618,-.245106292,.663705975,.031986601],[-.7492537,-.182710201,.636581398,.03594846],[-.652699099,.020567368,.757338015,.048422067],[-.680307504,-.163727229,.714405413,.035110844],[-.642711954,-.190454719,.742056834,.032855272],[-.460237058,-.19500997,.866113712,.032266952],[-.465035886,-.193293226,.863932493,.032312247],[-.557073461,-.184144793,.809790006,.032561104],[-.535757446,-.285184449,.794753917,.030623435],[-.41621043,-.272153455,.867583641,.030642394],[-.424417127,-.2490422,.870544706,.031134847],[-.431837156,-.232837291,.871380208,.03147515],[.761320278,-.181403942,.622482164,.045845954],[.509604815,-.174933306,.842437696,.044397911],[.441097139,-.276495715,.853805267,.040981991],[.512912113,-.284120645,.810059642,.041871316],[.577635462,-.137687904,.804598853,.045985669],[.759642483,-.158154277,.630817345,.046873635],[.76842755,-.160462425,.619492462,.04685035],[.820213796,-.049872136,.569879021,.053948952],[.322171088,-.946439837,-.021387482,.051221777],[-.306192589,-.792134226,.527986238,.026846504],[-.163478281,-.711009433,.683915519,.028678551],[.926442086,-.367633876,.08093451,.04552407],[.922791832,-.328280528,.201710511,.045516912],[.243475075,-.930196905,.274688199,.047624527],[-.368511151,-.003810632,.929615517,.046352224],[-.31788264,-.001852273,.948128259,.046912073],[-.219226282,.023248788,.975397012,.04962529],[-.373987981,.092304411,.922828742,.055261994],[.02472881,.135950856,.990406912,.061298501],[-.012557116,.142514863,.989713005,.062153521],[-.133792419,.147333095,.979996198,.062613693],[-.193917647,.145508185,.970166642,.0621088],[-.19648825,.09311737,.976074548,.056105716],[-.186826065,.090454936,.978219774,.055858363],[-.029713398,.09264308,.995255934,.056474815],[.003169777,.102222001,.994756561,.057511955],[.322497151,-.170904734,.931014049,.042574204],[.365555669,-.111169878,.924126783,.04535601],[.197561415,-.135462415,.970885895,.042389374],[.063787705,-.203939024,.976903272,.037021903],[.116286992,-.239552217,.963894222,.03656447],[.40365016,-.058498958,.913041302,.048271243],[.404335935,-.024949511,.914270186,.049954213],[.374371745,-.107483174,.921028319,.045601581],[.381413385,-.095498464,.919458468,.046266803],[.372961828,-.107918823,.92154924,.045567941],[.264815238,.0554302,.962704722,.054128793],[.390678811,-.015824873,.920391026,.050351748],[.303963185,.165706091,.938161966,.067667747],[.503006641,.195895817,.841789254,.073509],[.517309043,.236138674,.822575152,.07963378],[.442229664,.245149157,.862748408,.080864924],[.389173549,.238780509,.889678491,.079624204],[.321566389,.20192313,.925106538,.073439824],[.44138739,.134197298,.887225032,.065045748],[.468239698,.153261059,.870208385,.067577312],[.246071207,.097475848,.964337814,.057979334],[.241836121,.080276509,.966990679,.056129844],[.251027698,.067629324,.965614503,.055008445],[.40030187,.077627646,.91308946,.058566803],[.387989503,.09109599,.917150841,.059685578],[.385914311,.088434161,.918286199,.059385986],[.414471806,.100469049,.90449936,.061057781],[.416171264,.094229307,.904390578,.060471818],[.448236582,.11296306,.886748732,.062887732],[.43884979,.114889384,.891185329,.062916716],[-.135654104,.207444664,.968795477,.073777177],[-.21418226,.199107248,.95628566,.072141178],[.221090032,.236487438,.946146336,.078811416],[.239824325,.235229604,.941887109,.078568563],[.273379657,.247835656,.929430498,.080849986],[.492268272,.549614984,.674978012,.13583189],[.457292489,.570383773,.682309264,.14056766],[.269507854,.496180278,.82533063,.129361778],[.980724164,.193090157,.029938343,.074644808],[.970770301,.235258326,.047524126,.079834286],[.956928814,.276440863,.08870003,.085557124],[.816496712,.54978128,.176277236,.13391002],[-.962526998,.072796888,.261232446,.059785557],[-.973340952,.082065789,.21417889,.061278457],[-.977457079,.078613935,.19595282,.061036827],[-.975142983,.075414083,.208347973,.060583755],[-.972406401,-.008446612,.233140398,.053366659],[-.630799655,.169983957,-.757097913,.068770425],[-.652899957,.146459457,-.743149563,.065938222],[-.689657097,.174646317,-.702760096,.069504451],[-.673854477,.118950884,-.729226187,.063080708],[-.941617477,.070961115,-.329121629,.060925489],[-.967612431,.087334879,-.236851857,.062891311],[-.918218475,.082928076,-.38729545,.061543713],[-.93695328,.072095427,-.341936838,.060937473],[-.463136473,-.508751789,.72572462,.027460188],[-.393372626,-.619178291,.679614759,.026415079],[-.310757748,-.537276828,.784068385,.027064737],[-.330796385,-.49359794,.804322588,.027425792],[-.764353685,.10695585,-.635864679,.06227431],[-.776010141,.099199161,-.622870603,.062117253],[-.774591156,.101863617,-.624205371,.0621943],[-.921939183,-.05307599,-.383680963,.055987119],[-.870044665,-.033591406,-.491827103,.057474592],[-.867959749,-.100462738,-.486367261,.054660615],[-.883539714,-.095040259,-.458611953,.054788065],[.253583663,.132669444,-.958172294,.057838339],[.286075679,.143864327,-.94734564,.059059041],[.478693468,.004850004,-.877968701,.045767519],[.448583203,.015446772,-.89360758,.046614227],[.485987592,.015952548,-.873820105,.046570563],[.452180902,-.035792132,-.891207807,.042986665],[.474825088,-.021633687,-.879814253,.043916903],[.476242609,-.039365857,-.8784323,.042688402],[.359426261,.034452159,-.932537298,.048028976],[.375261402,.025142161,-.92657798,.047332857],[.338018894,.02486174,-.940810885,.047227845],[.328798341,.034109253,-.943783985,.04791468],[.686219624,-.38873938,-.614804296,.042690201],[.683138667,-.429115639,-.59091567,.043011019],[.631711576,-.478001493,-.610290962,.043196707],[.693554414,-.300970949,-.654521781,.042094983],[.703740954,-.306147358,-.641110337,.042214711],[.556268166,-.26305359,-.78826933,.040861368],[.574962706,-.300664609,-.760932769,.041252897],[.488482495,-.335136363,-.805647858,.04172269],[.467389947,-.253587078,-.846900367,.040702771],[.495094172,-.251192596,-.831735559,.040724649],[-.785920691,-.144645854,-.601170729,.052879308],[-.778905181,-.1468404,-.609708632,.05279686],[-.734926787,-.226735089,-.639119564,.051350046],[-.819713508,-.239021006,-.520517746,.051764149],[-.819486185,-.162576821,-.549555429,.052862416],[.017903405,-.041340069,-.998984718,.047409531],[.067839247,.028956877,-.997275958,.049779654],[.102241323,-.00831264,-.994724893,.047482876],[-.112023191,.15647768,-.981308076,.063802924],[-.103144073,.155630087,-.982415684,.063588905],[-.136689907,.149853165,-.979213918,.063152351],[-.171126864,.158693049,-.972384755,.064674517],[-.148464694,.158747624,-.976092939,.064481274],[-.350847055,-.092073838,-.931895247,.051906931],[-.297489081,-.098098774,-.949671984,.050858969],[-.233116375,-.131167737,-.963562027,.049122254],[-.233962163,-.181767485,-.955103286,.048501553],[-.562135001,-.303563246,-.769320217,.050733006],[-.723546019,-.23118204,-.650412195,.051362054],[-.359628195,.073287879,-.93021312,.057340509],[-.295363714,.120204893,-.947792731,.061090313],[-.234958373,.115034259,-.965174431,.059980496],[-.229960197,.096678783,-.968386039,.05826838],[-.580202246,.123796445,-.805009189,.063573626],[-.642100642,.130054771,-.755508122,.064107977],[-.497963633,.059764949,-.865136042,.058119844],[-.504088239,.066656509,-.861076046,.058500927],[-.58888374,.122072679,-.798945682,.06339934],[.506732757,.171876006,-.84479616,.063134193],[.542320468,.156871488,-.825396781,.06159941],[.516561714,.131479064,-.846095297,.058310546],[.502149532,.131729865,-.854688885,.058214419],[.648034698,.233613665,-.724897018,.073543375],[.647661213,.234074799,-.725082024,.073619003],[.648849958,.234235033,-.72396663,.073651991],[.313484032,.948739128,.040271934,.20738166],[.447630362,.886146805,.119878684,.1948788],[.506859212,.861483723,.030651821,.191795891],[.474805015,.862428758,-.175433279,.194491404],[.241828654,.935679781,-.256947952,.207791531],[.085099826,.991688765,-.096495658,.215063226],[.794773496,-.048842175,-.604937627,.045013474],[.801651751,-.045288084,-.596073368,.045384359],[.805244882,-.066644684,-.589185172,.044323482],[.795687429,-.062437927,-.602480723,.044303848],[.860972022,-.064960545,-.504487171,.04591429],[.816641451,-.072726782,-.572544807,.044316488],[.856974935,-.07049362,-.510514065,.045511334],[.906033872,-.08839431,-.413870836,.046366486],[.910373929,-.09574626,-.402556784,.046313],[.905529938,.266867345,-.329844436,.08116433],[.784782456,-.374577696,-.493769224,.043531166],[.77136824,-.393284265,-.500318424,.043587174],[.774960331,-.055207195,-.629594037,.044199817],[.794201313,-.049074244,-.605669872,.044987],[.789438933,-.06001906,-.610887783,.044280617],[.823227915,-.028824859,-.566978772,.046895496],[.832336833,-.013253181,-.554111676,.048129525],[.863573821,-.030928615,-.503272965,.047836064],[.863515622,-.030948296,-.503371606,.047833389],[.874988442,-.249990692,.414608103,.045282748],[.930118622,-.113160806,-.349390871,.046585894],[.967720228,-.120115183,-.221562415,.047860397],[.97689573,-.142165374,-.159573614,.047887061],[.975586598,-.202757225,-.084381857,.047044429],[.946571304,-.262179765,-.187788544,.045583499],[.930456734,-.234009389,-.281939483,.045394425],[.884008702,-.167249787,.436527345,.047761167],[.891203976,-.171825494,.419799325,.047740684],[.97712445,-.207316702,-.047408793,.047214975],[.891968939,-.266187936,.365424951,.045247392],[.922329952,-.322317844,.213116559,.045504451],[.951257756,-.001261266,.308394375,.058098376],[.931316829,-.004460026,.364182746,.057820732],[.996852666,-.026273525,-.074796146,.053787457],[.999823364,.017552874,.006718369,.057612439],[.996683036,.006485533,.081122528,.057223784],[.981710342,-.077751506,-.173780056,.049851661],[.979859574,-.078756557,-.183501009,.049705081],[.791948471,.071370741,-.606402372,.054206543],[.856881606,.060159808,-.511990929,.054861952],[.868159993,.080500667,-.489712027,.056991527],[.872982055,.069778282,-.482735252,.056178297],[-.502992446,.107276658,.857607322,.056681245],[-.600683304,.116513025,.790951505,.058295016],[-.636074973,.117266315,.762664566,.058758829],[-.94650233,.063684544,.316350467,.05808959],[-.944995736,.067016347,.320143513,.058420773],[-.962068029,.072553245,.262985047,.059739445],[-.996209671,-.004967428,.086842481,.055208371],[-.972328432,.030741066,-.231586718,.058367192],[-.980249344,-.04444183,-.192707414,.055577827],[-.994408751,-.07352261,-.075800147,.053941985],[-.998813066,.011971148,-.047213887,.057023473],[-.998648309,.015559634,-.049592878,.057174634],[-.996401469,.023238592,-.081511231,.057702428],[-.94097391,-.195283241,.276464386,.043337158],[-.990118129,-.089824496,.107692386,.051334618],[-.927783753,-.26087066,.266765451,.04033947],[-.92662477,-.25503874,.276263963,.040399838],[-.975599052,-.193544136,-.103668496,.050264642],[-.973705916,-.044246398,-.223470459,.055645567],[-.964242596,-.032346103,-.263039819,.056091778],[-.960577913,-.034262873,-.275891515,.056072005],[-.976809971,-.182667913,-.111690261,.050699587],[-.975538886,-.21509425,-.045368994,.048736605],[-.964555326,-.256052829,.063796334,.045308362],[-.964468613,-.255909194,.065656523,.045274698],[-.410501305,-.620423343,.668254109,.026385578],[-.410500654,-.620422388,.668255395,.026385584],[-.463136935,-.508752531,.725723806,.027460182],[-.595713301,-.523403089,.609241224,.027578858],[-.533452597,-.634320753,.559522571,.026484204],[-.719906252,-.259026391,.643925707,.031822939],[-.727444896,-.261294685,.634467501,.031965717],[-.723095377,-.266691508,.637188131,.031700452],[-.684499211,-.012526623,.72890597,.04627849],[-.673550842,.019263168,.738889839,.048446327],[-.686857166,.020150585,.726513033,.048606009],[-.579967825,.003696525,.814630995,.046613231],[-.546588389,-.181814543,.817425596,.032612445],[-.53773049,-.181647708,.823316482,.032619875],[.486953451,-.046617765,.872182963,.049736502],[.591058043,-.09783973,.800673328,.047932348],[.607446528,-.094156284,.788760617,.048407693],[.652770764,-.113082585,.74906786,.048019036],[.649482333,-.139321723,.747503951,.046499216],[.832687342,-.208283575,.51307869,.045702366],[.603958861,-.130394457,.786276656,.046373619],[.60630624,-.130048738,.784525378,.046399909],[.605267211,-.129015522,.785497676,.046441243],[.689194926,-.120033685,.714564391,.048129971],[.697896739,-.123141766,.705532598,.048073482],[.823240593,-.060303016,.564480711,.053136451],[.822510246,-.059875869,.565589758,.053161932],[.785326903,-.062091154,.615959694,.052880211],[.754114629,-.124707266,.644793939,.04870365],[.7230487,-.127872503,.678858749,.048138184],[.730344953,-.154283353,.665426853,.04671719],[.731063618,-.154297587,.664633915,.046725655],[.762121005,.009889868,.647359069,.058243008],[.761979957,.018146541,.647346312,.058907795],[.751628229,.01573855,.659399199,.058580987],[.591015016,.201961331,.780969187,.075072837],[.524836102,.184623912,.830939876,.072025811],[.514801016,.178348516,.83855335,.071111964],[.508568409,.169639185,.844144964,.069976095],[-.233392536,-.863361894,.44736357,.032319907],[-.303952584,-.79483461,.525214974,.027041225],[-.247914426,-.856299626,.453088719,.031665452],[-.145848646,-.858081972,.492365212,.033768913],[-.262430231,-.786755736,.558700086,.027443714],[-.072492973,-.777175341,.625094599,.033383533],[-.192067094,-.745668353,.638035218,.028376675],[-.234353289,-.7772343,.583939534,.027820268],[-.030343321,-.860908323,.50785445,.037109347],[-.152684497,.007213591,.988248657,.048597602],[-.214203084,-.020766586,.976568373,.04618996],[-.378411321,-501717e-9,.925637413,.046578437],[-.3960909,.069336446,.915589677,.05294648],[-.512068277,.028807966,.858461519,.048530675],[-.513619503,.020117406,.857782196,.047714268],[-.491049349,.00670961,.871105917,.046681279],[.430747973,-.034966463,.901794617,.049703785],[.420487616,-.048298049,.906011845,.048947409],[.440198902,-.038097318,.897091702,.049636875],[.394041787,.036320636,.918374587,.054528708],[.399067063,.001169896,.916920995,.051731087],[.423780312,.014882579,.905642731,.05315921],[.318624935,.003255624,.947875283,.050834511],[.309552351,.009368536,.950836249,.051153083],[.033885368,-.075095213,.996600467,.04386006],[.017539811,-.140340491,.989947929,.039667072],[.188030326,-.114576607,.975457225,.043377552],[.358208029,.150120586,.921493797,.065823315],[.369548167,.157895503,.915698183,.0670608],[.368428496,.157739067,.9161762,.067027776],[.414334975,.137502412,.899677506,.065100611],[.394739298,.147773015,.90683186,.066043163],[.355919741,.149451209,.922488739,.065703479],[.332623092,.145732934,.931731609,.064919875],[.259280999,.131607083,.956793049,.061997939],[.257573045,.130166267,.957451236,.061797901],[-.13260889,.195296145,.971737772,.071405427],[-.132964921,.191278322,.972488012,.070621624],[-.130963839,.19158438,.972699285,.070680545],[-.273358078,.149685642,.95019449,.062446765],[-.271634068,.1497465,.950679188,.06245988],[-.278312496,.157259665,.947529183,.063920169],[.264315777,.253990514,.930390235,.08200465],[.271586267,.252047814,.928823341,.081631681],[.357136516,.376150586,.85496447,.105067595],[.355092524,.373925136,.85679011,.104658142],[.899610214,.288456901,.327862898,.088234592],[.890413474,.289103589,.351543683,.088312858],[.867218639,.280803509,.411194871,.087110511],[.740625018,.260592292,.619327248,.084066072],[.814670467,.275041738,.510552713,.086221802],[.803498699,.276674872,.527106114,.086494207],[-.719995539,.230696966,-.654511523,.080186525],[-.700442442,.497640121,-.511600133,.130632408],[-.653906826,.542103937,-.527758642,.138310572],[-.931545255,.010399247,.363476676,.052816376],[-.959534076,-.006817952,.281509988,.052876511],[-.934393112,-.028269333,.355120201,.050588733],[-.97252746,.056236172,.225893411,.058453871],[-.964957979,.051561396,.25728879,.057613111],[-.970597951,.066594015,.231311163,.059429547],[-.916969542,.041059243,.396838755,.054759911],[-.946629674,.055908663,.317437368,.057232399],[-.955636681,.054508974,.289460371,.057467448],[-.961105728,.051561159,.271324946,.057428113],[-.93095705,.011115871,.364959461,.052841903],[-.914486529,.019286038,.404156451,.052827739],[-.753447317,.125207988,-.645476646,.063769308],[-.748101154,.123466699,-.651997422,.063603606],[-.918520911,.098362992,-.382941325,.063054419],[-.955133935,.096091771,-.280152705,.063598967],[-.605707759,.083896818,-.791251815,.060247251],[-.598339982,.108369385,-.793879929,.062168677],[-.70307931,.068284049,-.707825383,.060169507],[-.658979721,.090313696,-.746718933,.060716749],[-.658306658,.090032335,-.74734632,.060696662],[-.755544551,.045262955,-.65353171,.060057084],[-.715640153,.051268965,-.696585002,.059758699],[-.803463043,-.128375618,-.581349154,.053504644],[-.806657452,-.126921813,-.577230117,.053578821],[.416916447,.142310983,-.897735072,.059005849],[.422024484,.141198178,-.895521306,.058873559],[.434834454,.13554913,-.890250207,.058222614],[.396881974,.094611685,-.912980464,.053768514],[.329234216,.084032648,-.940501645,.052523272],[.535823827,-.3645131,-.761592428,.042021834],[.583918774,-.316562354,-.747547418,.041403016],[.596846406,-.334589786,-.729262671,.041576853],[.590935617,-.370774526,-.716464477,.041977234],[.586826088,-.371434576,-.719493918,.041998589],[.678891689,-.317659261,-.661965761,.042080058],[.681067621,-.325313675,-.65598621,.042150624],[.667479199,-.342258223,-.661309933,.042143149],[-.663057857,.043030876,-.74733033,.058934364],[-.674165287,.064555542,-.735753863,.059744132],[-.661006081,.079170203,-.746192361,.060251006],[-.479751587,-.032639599,-.876797052,.055053377],[-.775995373,-.143972675,-.614087168,.052920545],[-.77508701,-.142502847,-.615575394,.052982951],[-.087661708,-.064019992,-.994090974,.048200554],[-.233825417,-.036221233,-.971603673,.051559992],[-.343367226,.114218183,-.932230205,.060935669],[-.360716209,.106947265,-.926523663,.060391657],[-.499212814,.122249658,-.857812093,.063215587],[-.408074858,.123329012,-.904579939,.062655943],[-.377405671,.092834486,-.921383046,.059208937],[-.375582875,.08787054,-.922613826,.058751334],[-.596802587,.108620053,-.795002111,.062187846],[-.596206782,.110494802,-.795190777,.062348012],[-.573232996,.115087714,-.811269839,.062725542],[-.436200104,.041726819,-.898881717,.056626231],[-.450640624,.057527087,-.890849966,.057374267],[-.445894445,.059542135,-.893102949,.057392711],[-.441813452,.059485993,-.895132555,.057342819],[-.41040832,.045350367,-.910773493,.056480164],[-.414823412,.042920679,-.908889076,.056435782],[-.422871724,.060012312,-.904200214,.057162056],[-.392818206,.049712206,-.918271503,.056477837],[-.396488961,.048999098,-.916730927,.05648609],[-.390822461,.062899183,-.918314487,.056970903],[-.646460409,.115570659,-.754143462,.062757304],[-.651569212,.112527438,-.750196732,.062482086],[-.657627405,.111015953,-.745118551,.062346373],[-.666918212,.115922084,-.736058537,.062798762],[-.669222755,.119902518,-.733324138,.063163628],[.546140172,.155929669,-.823053371,.061518983],[.548509032,.125775814,-.826630683,.057915099],[.886450465,-.038681017,-.461204242,.048032097],[.876165519,-.048981398,-.479515178,.047198628],[.88150172,-.035935321,-.470811396,.048045467],[.884669958,-.03664767,-.464775229,.048093237],[.761255007,-.131016841,-.635079051,.042914202],[.817128602,-.07591083,-.57143538,.044273267],[.857984138,-.102309618,-.503384506,.044944807],[.882131434,-.24565962,-.401865007,.044402258],[.855902615,-.276400428,-.437073811,.043851473],[.809567038,-.254500827,-.528990113,.043329005],[.84774073,.530364494,.007011245,.13057121],[.77837475,-.374637075,-.503765631,.043457745],[.769364945,-.388332086,-.507223592,.043507129],[.872001897,-.142665981,.468251118,.048811826],[.884546743,-.147805739,.442414425,.04861079],[.887173131,-.14985585,.436425319,.048520489],[.929725107,-.118146565,.348787348,.050568298],[.968086388,-.100260196,.229688133,.051457408],[.810446894,-.144100817,.567812281,.048201977],[.804799619,-.134410297,.578127534,.048689253],[.804239939,-.145341351,.576258634,.048063277],[.994584934,-.024967543,.100883252,.055067177],[.978726853,-.036714905,-.201855797,.051835051],[.970759325,-.041094536,-.236511253,.051196208],[.978712756,-.029898771,-.203045325,.052201554],[.958003705,-.055079967,-.281416237,.049804528],[.956206174,-.059897497,-.286499639,.049459988],[.953517607,-.058774304,-.295549918,.049388926],[.823530799,.099895807,-.558406528,.057730593],[.812517306,.099683108,-.574350856,.057487059],[.817745505,.109593541,-.565050037,.058598025],[.839358368,.088611151,-.536307369,.056994728],[-.527106539,.076437125,.846354573,.053400237],[-.519924509,.040388671,.853256855,.049703245],[-.596578859,.068016742,.799667048,.052800227],[-.654338639,.113772923,.747593919,.058493385],[-.650699572,.115582471,.750487015,.058683855],[-.659955114,.114871822,.742471355,.0587056],[-.593428112,.10204904,.798391552,.056544929],[-.602791624,.108965923,.790423105,.05739658],[-.630549756,.09805533,.769929969,.056355667],[-.623866376,.066459505,.778700121,.052735758],[-.606339552,.070156768,.792105028,.053035464],[-.60158226,.071836046,.795574238,.053190237],[-.600259623,.072524689,.796510235,.05325823],[-.995282248,-.093426173,-.026168636,.052753808],[-.984551429,-.152376796,.086254252,.048975221],[-.993244554,-.081741048,.082362966,.052020088],[-.998273996,-.052711289,.025894964,.053877087],[.626053467,-.065676666,.777009416,.050635542],[.50508332,-.022399016,.862779882,.051748437],[.588165278,-.037672319,.807862861,.052098216],[.70895114,.017360432,.705043897,.058172627],[.678754329,.042278995,.733147357,.059949881],[.622307166,.034517563,.782011719,.058630371],[.470019194,.005199014,.882640882,.053233987],[.694695589,-.125887636,.708202189,.04787388],[.687330078,-.12002127,.716360425,.048104075],[.677206002,-.118749129,.726147833,.048039056],[.651129204,-.139772314,.745985563,.046497985],[.557288293,-.278092395,.782364607,.042547948],[.62170613,-.269810654,.735311974,.043388455],[.743142977,-.190641833,.641400193,.045582494],[.746340759,-.178092789,.64129434,.045847964],[.70915133,-.156942984,.687366926,.046311473],[.704397026,-.155489983,.692566022,.046332327],[.68933265,-.151800133,.708362349,.046364599],[.723184393,-.279294651,.631663542,.04460907],[.761440187,-.186042014,.620964742,.045753243],[.7687049,-.185666762,.612062603,.045801301],[.763828926,-.183150812,.618887026,.045818986],[.870567066,-.248246273,.424837347,.045273075],[.836237361,-.213696943,.505015537,.04563218],[.810825815,-.266753003,.520964811,.045097851],[.813190623,-.266818355,.517232033,.045108321],[.852280269,-.261596787,.452974022,.045208372],[.802238058,-.098403804,.588838509,.05071636],[.800834742,-.117657124,.5872142,.049598427],[.787442259,-.113184592,.605907532,.049723021],[.786669788,-.111101414,.607294921,.049834228],[.757663783,-.123680062,.640818878,.048804109],[.766857262,-.127900603,.628944652,.04867283],[.849030918,.039410917,.526871217,.061363944],[.827442688,.049143136,.559395702,.062055956],[.97274272,.193389281,.127953842,.075308076],[.989244819,.052639185,.136469056,.061359497],[.992361489,.079764758,.094107696,.063458964],[.97646136,.134218661,.168844789,.06942019],[.605222386,.110029969,.78841567,.065112912],[.67162309,.085128564,.735986109,.063670583],[.597944375,.141650967,.78892175,.068124443],[.585847593,.12670751,.800454748,.066410709],[-.188068022,-.849608403,.492743321,.032303187],[-.282016095,-.791164881,.542701625,.027169586],[-.282190471,-.791188781,.542576124,.027167191],[.124761024,-.973333315,.192501803,.046777667],[.5418024,-.765906828,.346174654,.050557106],[.060674975,-.872731878,.484414715,.040330851],[.901364284,-.423199693,-.091893677,.045283522],[.914474111,-.402674986,-.039874247,.045258545],[-.148948077,-.062148707,.986890069,.043699803],[-.206862122,-.027791003,.977975318,.045756902],[-.193667423,-.123321502,.973285537,.039485202],[-.167853229,-.10431877,.980276944,.04085732],[-.140083691,.007731691,.990109479,.048702339],[-.113404178,-.048544164,.992362311,.044850873],[.279661443,.04449842,.959066926,.053443177],[.306321221,.015268047,.951805756,.051543211],[.365528986,.011065108,.930734185,.05207641],[.356045886,.038101111,.933691401,.05412934],[.33149456,.041504793,.942543744,.054049041],[-.232000742,.185001791,.954960728,.069356446],[-.245375906,.175442616,.953420449,.067471591],[-.238124069,.166461156,.956863424,.06572181],[-.232185549,.168409124,.957981335,.066109696],[.938012855,.27916884,.205418213,.086567015],[.954127229,.272676846,.123646951,.085080218],[.74488387,.24776958,.619482248,.082230111],[.683223668,.21232266,.698659079,.077170177],[-.792666962,.381484615,-.475550813,.109734975],[-.834862726,.240547017,-.495117524,.083194654],[-.951102417,.172308649,-.25634727,.072927224],[-.95952024,.162251699,-.230207069,.071805241],[-.985437504,.151014312,-.078151157,.070827869],[-.985346545,.163665368,-.048019093,.072482029],[-.984250909,.165479547,-.062182531,.072747484],[-.755352409,.123334244,-.643608113,.063596728],[-.75566764,.121907829,-.643509828,.063464741],[-.758639531,.120659046,-.640240155,.063358985],[-.739052645,.171097868,-.651557141,.06895023],[-.820987325,.176291059,-.543048133,.070680435],[-.748460311,.173523712,-.64007553,.069412193],[-.878836908,.101881749,-.466117794,.062701866],[-.763715734,.116880221,-.634883683,.063048197],[-.769562909,.109344338,-.629139687,.062437924],[-.823597019,.174869673,-.539544759,.070525327],[-.724305845,.097365702,-.682569383,.061573342],[-.733686063,.09737548,-.672475112,.061615743],[-.742052513,.100537543,-.662759587,.061825418],[.287527813,.128469414,-.949117151,.057312943],[.274107901,.13055322,-.952796261,.057570738],[.351628337,.139414757,-.925700296,.058705097],[.28943185,.133501893,-.947843051,.057875332],[.289340892,.134490701,-.947731027,.057986675],[.28974492,.137787762,-.947133789,.058360507],[.659192175,-.335085182,-.673189124,.042020892],[.658932344,-.335375503,-.673298921,.042020328],[.658785036,-.335344774,-.673458357,.042019208],[-.455769578,.046260445,-.888894855,.057020699],[-.44930411,.039100675,-.892522803,.056683866],[-.487541135,-.001128962,-.873099288,.055958293],[-.531277003,.003608,-.847190491,.056694468],[-.615817398,.037218171,-.787009365,.058516969],[-.517936823,.056755927,-.853533955,.058257473],[-.508361038,.056912048,-.859261354,.058139153],[-.340550813,.049129749,-.938941644,.055939548],[-.344329389,.063775568,-.936680281,.056549037],[-.24118159,.008221938,-.970445176,.0532093],[-.45361234,.056785525,-.889388132,.057385418],[-.456011788,.046418152,-.888762401,.057029712],[-.461338274,.048231788,-.88591235,.0571744],[-.454714001,.056735377,-.888828597,.057399552],[-.418902975,.060207054,-.906032785,.057128381],[-.417249944,.060322703,-.906787547,.05711688],[-.416992799,.059647491,-.906950485,.057088577],[-.417213558,.058881052,-.90689904,.057061389],[-.644188798,.126250038,-.754375053,.06373699],[-.644214437,.127839762,-.754085376,.06388285],[-.642808081,.128586153,-.755157846,.063954172],[-.642141233,.128429624,-.755751592,.063941108],[.670096824,.039958623,-.741197379,.050019887],[.573800052,.06511032,-.816403176,.051288912],[.607082847,.093494046,-.789119307,.054607724],[.612292496,.094623496,-.784948593,.054790977],[.651584242,.101230602,-.751791421,.055927888],[.631106253,.160105894,-.758993412,.062837433],[.63323914,.199598974,-.747775663,.068002065],[.856109066,.514746053,-.045975731,.127815482],[.854805594,.518319448,-.02554108,.12843204],[.923257887,.320742641,-.211468749,.092018259],[.909952242,.295419146,-.291057459,.086805121],[.920489172,.256964938,-.294395491,.079953524],[.920166593,.264406319,-.288760697,.081066668],[.936369095,.271671073,-.222278534,.082869518],[.941866155,.272724967,-.196237706,.083266112],[.958656111,.267478873,-.097126274,.083187453],[.961073655,.256069255,-.103759175,.081565533],[.957609887,.244623172,-.152127604,.079688814],[.775589203,-.373715311,-.508722177,.043422436],[.764753024,-.391113162,-.512038384,.043488559],[.761431826,-.394135958,-.514663406,.043486408],[.773160137,-.372171309,-.513528888,.043389117],[.888354838,-.069003818,.453942898,.053112998],[.888991975,-.060330642,.453931142,.053597588],[.917606083,-.169030667,.359760629,.04835256],[.972143814,-.184086942,.145080676,.048296416],[.951835176,-.180481115,.247863599,.048394085],[.887793061,-.260179025,.379645039,.045271805],[.891903953,-.265870513,.365814447,.045248294],[.895634977,-.069251937,.439365631,.053146062],[.891518575,-.059836182,.449014769,.053636654],[.891654661,-.061111573,.448572559,.05356668],[.997614428,-.068934102,.003680122,.051741443],[.998727928,-.050205089,.004687808,.052825247],[.995800809,-.082987393,-.038650254,.050750678],[.99557737,-.093664852,.007252279,.050560567],[.995614798,-.093488869,.003317496,.050547211],[.987302299,-.103012425,.120923985,.050778094],[.98351236,-.123347452,.13224539,.050051121],[.983458897,-.128185055,.127973391,.049851576],[.994914998,-.042361276,.091376526,.053805386],[.991112138,-.026444614,.130374122,.055279248],[.968133145,-.020623929,.249585389,.056535017],[.922740247,-.02909643,.384322565,.055963383],[.899526969,-.056521309,.43319346,.053892426],[.903734796,-.061704944,.423622378,.053632602],[.925258909,-.079885213,.370829211,.052744737],[.981541149,-.080466135,.173499782,.052224812],[.804373915,.07184263,-.589763716,.054528931],[.825954426,.096672731,-.555386054,.05745711],[.826687609,.095961603,-.554417684,.057402873],[.812009109,.071528074,-.579245148,.05467328],[.8116004,.071182273,-.579860219,.05462979],[.679712787,-.038010733,.732492806,.053502279],[.647731801,-.059778963,.759519578,.051421706],[.689790534,-.002291756,.724005364,.05640005],[.628220076,-.028895731,.777498922,.053463381],[.676179025,-.026754456,.736251401,.054307619],[.561734,-.453329962,.692059866,.045284359],[.408679853,-.49492603,.766830491,.04272373],[-.042938851,-.620053427,.783383688,.031477245],[-.107565275,-.682546469,.722883137,.030038403],[-.056922918,-.685686759,.725667589,.031897099],[.904273549,.099863197,.415110456,.066834286],[.91960139,.043346136,.390454089,.061697624],[.974211414,.144089682,.173638372,.070440155],[.909172199,.136286139,.393486978,.070519474],[.970927116,.199993048,.131542067,.07611663],[.961435438,.249828462,.115011468,.081973656],[.959648119,.253999634,.120663472,.082544496],[.959481109,.254162391,.121644892,.082575979],[.704134092,.182404301,.686238917,.07385047],[.698210069,.169438271,.695552566,.07232527],[.767286649,.12425888,.629150959,.068400924],[.812123293,.116554469,.57172617,.067968148],[-.039391516,-.035157181,.998605168,.046121308],[.008867295,-.034454528,.999366928,.046318422],[.019477742,-.013801149,.999715032,.047849736],[-.888388017,.292508311,-.353844061,.094992819],[-.81994837,.354938631,-.449113836,.105256092],[-.867911873,.216818362,-.446899069,.079347018],[-.9075749,.176123987,-.381166818,.072448857],[-.933876222,.174722947,-.312004957,.072916146],[-.958364093,.17299027,-.227184138,.073255856],[-.979340842,.169875002,-.109699588,.073336979],[-.964433842,.189849371,-.1839146,.076751307],[-.753129557,.128514399,-.645197582,.06412467],[-.812518543,.127480997,-.568825292,.064839495],[-.804597597,.166000255,-.570146141,.069237165],[-.740269057,.162288289,-.652429486,.067860931],[-.73852093,.156259035,-.655873426,.06712577],[-.858226403,.104246768,-.502573429,.062841856],[-.868876574,.103124993,-.484168085,.062787078],[-.878414041,.102283619,-.466826342,.062732216],[-.878146779,.102878123,-.46719838,.062784707],[-.760789029,.119328363,-.637934789,.063248697],[-.76319467,.117425862,-.635409366,.063092492],[-.763704325,.117214909,-.634835702,.063079034],[-.799685849,.119281546,-.588450895,.06380153],[-.84617175,.105292482,-.522404884,.06286363],[-.806785528,.114453147,-.579652991,.063391681],[-.805218498,.114542708,-.581810226,.063382836],[-.806131158,.107310631,-.58192524,.062723728],[-.825406856,.105936313,-.554509711,.062783482],[-.835361742,.177033408,-.520413232,.07091399],[-.834926632,.175096293,-.521765088,.070662224],[-.841137151,.150838737,-.519361117,.067809406],[-.87906766,.105316934,-.464917619,.063042779],[-.907238438,.103657392,-.407643915,.063406162],[-.901842786,.174114151,-.395428694,.072042168],[-.876826855,.17944879,-.44606367,.072213398],[-.844591581,.179800424,-.504318222,.071496592],[-.138892967,.053366754,-.988868411,.053787172],[-.154939149,.051507192,-.986580392,.05387069],[-.119755619,.046473291,-.991715093,.053132891],[-.209036429,.013832063,-.977810025,.05299156],[-.218030922,.051929187,-.974559324,.05468275],[.741671723,.131961598,-.657654311,.060295738],[.748360507,.133176674,-.649784983,.060495125],[.780854241,.134092472,-.610152328,.060846012],[.66754846,.135226732,-.732183573,.060074133],[.668909884,.137115588,-.730588039,.060307039],[.68088705,.133624402,-.720095372,.059983737],[.664681258,.117899008,-.737765986,.058004967],[.983438891,-.12814916,.128162944,.049853597],[.983422355,-.124557163,.13178006,.050003353],[.983250465,-.124188257,.133400897,.050025628],[.979009837,-.13276789,.154636432,.049821677],[.957724304,-.156059856,.241680529,.0491827],[.959385192,-.155297877,.235505037,.049205712],[.959237274,-.157580334,.234589622,.04913311],[.958853582,-.158926417,.235249234,.049090612],[.953200874,-.179135089,.243554333,.048439457],[.973781693,-.166413427,.155099275,.048759186],[.974543906,-.163408278,.153498893,.048847652],[.994991382,-.04532731,.089093126,.05358639],[.996194616,-.081301971,.031405043,.051246182],[.997636152,-.067920381,.010436993,.051835256],[.99845987,-.052034282,.019243746,.052792081],[.9972412,-.073385211,.011162417,.051534096],[.996984985,-.076204583,.014621967,.051403896],[.996958978,-.077120064,-.011193352,.051215606],[.997377134,-.07237611,742166e-9,.051532293],[.992572534,-.085267393,.08677117,.05134188],[.992494055,-.085300636,.087631911,.051343625],[.99093218,-.107921679,.080039531,.050395038],[.994807592,-.097427542,.029423256,.050554829],[.991719735,-.073804521,.105094531,.052061011],[.696196949,-.049270838,.716157939,.052899581],[.650874693,-.059305747,.756865221,.051508187],[.705737126,-.052344513,.706537445,.05280529],[.952003388,.101259386,.288853052,.06701359],[.904886827,.099264984,.413915805,.066779877],[.923219339,.049662841,.381050723,.062243009],[.968823747,.05823924,.24080851,.062737583],[.876209589,.050657252,.479260471,.062394365],[.896086057,.048726397,.44119782,.062257427],[.886008651,.097798746,.453237329,.066649775],[.838732211,.097046413,.535826718,.066269135],[.840425892,.086474179,.534982744,.065343355],[.897141292,.168756114,.408238748,.073836682],[.8998347,.209923678,.382399741,.078577348],[.876274348,.260758149,.405152386,.084603303],[.861500714,.270627392,.429624644,.085734586],[.811212379,.258121276,.524697897,.083826509],[.809270666,.256757195,.528352849,.083637406],[.822197237,.20800011,.529837388,.077916336],[.860240982,.182249344,.476204399,.075167544],[.885263992,.179033269,.429249058,.074892182],[.893122118,.188800506,.408273501,.076074812],[-.067384912,-.001335899,.997726159,.048455515],[-.0742507,.017550675,.997085156,.049771502],[-.11308877,.011444109,.993518979,.049138301],[-.053370292,.022964035,.998310706,.050274566],[-.059607183,.021159153,.997997632,.050109569],[.001787387,-.001222611,.999997655,.048731135],[-.011512798,.01318248,.999846827,.049745674],[-.884730019,.179204143,-.430277432,.072373375],[-.851476293,.131065744,-.507749833,.065607127],[-.846993794,.137661288,-.513469457,.066316986],[-.837953301,.131595532,-.529638444,.065552279],[-.057003484,-.025642878,-.998044611,.049139268],[-.079912705,-.028427517,-.996396425,.049352331],[-.083397789,.015821742,-.996390727,.051302315],[-.093463003,-.018667468,-.995447735,.049966206],[-.114042204,-.008041397,-.993443361,.050726679],[-.107423324,.043261124,-.993271717,.05279957],[-.092539629,.040324389,-.994892135,.052462551],[.727072453,.099498292,-.679312695,.056491917],[.732186703,.089910962,-.67514343,.055462735],[.719798156,.093754409,-.687823179,.055775742],[.735722105,.088440359,-.671484391,.055333971],[.75851982,.105367658,-.64307491,.057466758],[.776989948,.06855447,-.625769051,.05371766],[.748367955,.074488957,-.659087854,.054003952],[.990293604,-.098472184,.09809081,.050845354],[.990423689,-.094962185,.100215271,.05099435],[.989614835,-.09760202,.105528783,.050913334],[.990440531,-.073102666,.116976728,.052197197],[.991094361,-.065909776,.115705962,.052593634],[.987249511,-.074339549,.140755229,.052320094],[.992600887,-.061085909,.104938036,.052776719],[.992631542,-.06151859,.104393897,.052747863],[.992720718,-.060567738,.104101514,.052799885],[.971512587,.182567231,.151104265,.074323876],[.971866461,.178303539,.153894217,.073876386],[.972077894,.183722422,.145981638,.074400295],[.97146841,.168591244,.16681163,.072922656],[.966006999,.168778845,.195816696,.073228461],[.971480576,.167883441,.167453396,.072852131],[-.878490524,.179505889,-.44275505,.072263196],[-.880950167,.17945717,-.437860625,.072317218],[-.880326658,.184833585,-.436877009,.07335992],[-.877415913,.19083284,-.440141049,.074465724]]}};var z3={Right:{surface:[.015992918871092433,.13867605649462147,-.035894195551379696],pad:[-.014885272296345712,.09487460189682458,.03646562783656404],rotation:[.02198968932794995,-.2347309471748249,-.05688857624015739,.9701451067623419],pole:[-.7786635434380395,-.07855843790084617,-.6225043437245907],normal:[.380192614,.171217997,-.908921324],gap:.0008008294573633723,padMesh:"Digit_RightHandRing3",padVertex:97},Left:{surface:[-.0014858264299751624,.12216091682106439,.046105211049207846],pad:[-.006452971971868629,.0911078840845373,-.04409626099752769],rotation:[.0905741634333915,-.0010136597498351819,-.18697556562453557,.9781796561008365],pole:[-.9380623545363251,.01804494651567802,-.3459962411746789],normal:[-.208035339,.110447692,.971865528],gap:.0007999143311685081,padMesh:"Digit_LeftHandPinky3",padVertex:88}};function bu(i,e){let t=Object.fromEntries(Object.entries(z3).map(([c,l])=>{let h=i.bone(c+"UpLeg"),u=i.bone(c+"Hand"),d=new P(...l.surface),f=new P(...l.pad),g=new Ue(...l.rotation),v=new P(...l.pole),m=new P(...l.normal),p=i.bone(c+"Arm");h.updateWorldMatrix(!0,!1);let b=new De().copy(h.matrixWorld).invert(),R=new fn,S=[],T=new Map,y=new Map,A=new Map,_=N=>(A.has(N)||A.set(N,N.getWorldPosition(new P).applyMatrix4(b)),A.get(N)),w=u,C=0;for(;w;)y.set(w,C),w.parent&&(C+=_(w).distanceTo(_(w.parent))),w=w.parent;let D=N=>{if(T.has(N))return T.get(N);let I=_(N),k=0,G=N;for(;!y.has(G)&&G.parent;)k+=_(G).distanceTo(_(G.parent)),G=G.parent;k+=y.get(G)||0;let V={position:I,distance:k};return T.set(N,V),V},L=0;return e.traverse(N=>{if(!N.isSkinnedMesh)return;let I=N.geometry.attributes,k=[];N.updateWorldMatrix(!0,!1);let G=new De().multiplyMatrices(b,N.matrixWorld);for(let V=0;V<I.position.count;V++){let Q=0,W=0;for(let O=0;O<4;O++){let Z=N.skeleton.bones[I.skinIndex.array[V*4+O]]?.name||"",le=I.skinWeight.array[V*4+O];Z.includes(c+"Hand")&&(Q+=le),Z.endsWith(c+"UpLeg")&&(W+=le)}if(W>.9&&R.expandByPoint(N.getVertexPosition(V,new P).applyMatrix4(G)),Q>.5){k.push(V);let O=N.localToWorld(N.getVertexPosition(V,new P)).applyMatrix4(b);for(let Z=0;Z<4;Z++)if(I.skinWeight.array[V*4+Z]>0){let le=N.skeleton.bones[I.skinIndex.array[V*4+Z]];if(!le)continue;let Me=D(le);L=Math.max(L,O.distanceTo(Me.position)+Me.distance)}}}k.length&&S.push({mesh:N,indices:k})}),[c,{body:h,hand:u,upper:p,surface:d,pad:f,rotation:g,pole:v,normal:m,gap:l.gap,padMesh:l.padMesh,vertices:S,thighBounds:R,contactBounds:R.clone().expandByScalar(5e-4),radius:L,planes:Su.sides[c],slideOffset:new P}]}));function n(c){let l=t[c],h=i.frame(l.body),u=h.q.clone().multiply(l.rotation),d=l.surface.clone().applyQuaternion(h.q).add(h.p),f=l.normal.clone().applyQuaternion(h.q).normalize(),g=d.clone().addScaledVector(f,l.gap).sub(l.pad.clone().applyQuaternion(u)),v=l.pole.clone().applyQuaternion(h.q).normalize(),m=i.frame(l.upper).p,p=g.clone().sub(m).normalize(),b=v.addScaledVector(p,-v.dot(p)).normalize();return{w:g,q:u,pole:b,surface:d,normal:f}}function s(){return Object.fromEntries(Object.entries(t).map(([c,l])=>{let h=n(c),u=i.frame(l.hand),d=l.pad.clone().applyQuaternion(u.q).add(u.p),f=d.sub(h.surface);return[c,{gap:f.dot(h.normal),error:f.clone().addScaledVector(h.normal,-l.gap).length(),wristError:u.p.distanceTo(h.w),orientationError:u.q.angleTo(h.q),padMesh:l.padMesh}]}))}function r(c){let l=t[c],h=n(c),u=i.frame(l.hand),d=l.pad.clone().applyQuaternion(u.q).add(u.p);return h.surface.addScaledVector(h.normal,l.gap).sub(d)}function o(c,l,h,u){let d=t[c];u<=0||u>.999999?d.slideOffset.set(0,0,0):d.slideOffset.multiplyScalar(Math.exp(-6*Math.max(0,Math.min(.12,h)))),l.add(d.slideOffset.clone().applyQuaternion(i.frame(d.body).q))}function a(c){let l=t[c],h=i.frame(l.body);l.body.updateWorldMatrix(!0,!1);let u=new De().copy(l.body.matrixWorld).invert(),d=new P,f=0,g=null;if(!l.thighBounds.isEmpty()&&l.thighBounds.distanceToPoint(l.hand.getWorldPosition(d).applyMatrix4(u))>l.radius+.001)return new P;for(let{mesh:m,indices:p}of l.vertices){m.updateWorldMatrix(!0,!1);let b=new De().multiplyMatrices(u,m.matrixWorld);for(let R of p){if(m.getVertexPosition(R,d).applyMatrix4(b),!l.contactBounds.isEmpty()&&!l.contactBounds.containsPoint(d))continue;let S=-1/0,T=null;for(let y of l.planes){let A=y[0]*d.x+y[1]*d.y+y[2]*d.z-y[3];if(A>S&&(S=A,T=y),S>=5e-4)break}S<5e-4&&5e-4-S>f&&(f=5e-4-S,g=T)}}let v=g?new P(g[0],g[1],g[2]).multiplyScalar(f):new P;return l.slideOffset.add(v),v.applyQuaternion(h.q)}return{target:n,snapshot:s,correction:r,slide:o,padCollisionCorrection:a}}var nc={thinking:{arm:{w:[.12468572854917552,.07658076515780757,-.005603117529207693],e:[.14844977750008229,-.016540575383189673,.07437728285797572],q:[-.09781707239809039,-.46821251421323806,.17130920604366198,.86131413342405]},joints:{RightArm:[.5683198021092308,-.5508339567186902,.19618699346653656,.5788826655439273],RightForeArm:[.7665528902468326,.2703098720822029,-.3811245749812261,.4405375359074029],RightForeArmTwist:[.6343801627200549,.3251489084020168,.5410757106025008,.446180731936063],RightHand:[-.5951580336052115,-.5256929572085349,-.46859546977254496,.3871073694534518],RightHandIndex1:[.4137095351445399,.04634565643412299,.07353377371816239,.9062501357017138],RightHandIndex2:[.6364487002853804,.1152977253808582,.09126308268208011,.7571726675617958],RightHandIndex3:[-.3877087232015952,-4323825320007302e-22,-.0364749675355202,.9210601139364898],RightHandIndex4:[33043324947357178e-22,-3818422555923462e-23,22165477275848389e-23,1],RightHandMiddle1:[.48293711816974566,.09765528771439008,.14769384657093437,.8575673310138718],RightHandMiddle2:[.45816678982414316,.011936675927400942,.4627721433609189,.7588034107789414],RightHandMiddle3:[-.1891743876668871,25082562346012693e-22,-.34038179248951905,.9210609275710042],RightHandMiddle4:[17955899238586426e-22,12293457984924316e-23,-14901161193847656e-24,1],RightHandPinky1:[.5447741137849174,.1332664511207749,.18322738684082548,.8073964030065807],RightHandPinky2:[-.17989224620182953,.1664573268159499,-.11816424909715754,.962272318238235],RightHandPinky3:[.29112666281818617,3093430511608153e-22,.25863234355647097,.9210616565402052],RightHandPinky4:[18998981943241233e-23,22351741790771484e-24,-11920928955078125e-23,1],RightHandRing1:[.5641721756102591,.14384696242264788,.19542698205080555,.7891933288336087],RightHandRing2:[-.2907180451930587,.10818492124048953,-.05382608442545828,.9491479660734309],RightHandRing3:[.35943377502943785,19547353995725116e-22,.14984062262679848,.9210619651661007],RightHandRing4:[3725290653733282e-23,14901162970204496e-24,-5103648277327011e-22,1],RightHandThumb1:[.20176589488983154,.19599004089832306,-.34763893485069275,.8944414854049683],RightHandThumb2:[-.04398128762841225,-.03419040888547897,.11335750669240952,.9919913411140442],RightHandThumb3:[-21653251280895347e-23,19371510973087425e-23,3771856427192688e-23,1],RightHandThumb4:[-17830171827881713e-22,-10943042028088712e-24,-2093147628556835e-22,1]},contact:{body:"Head",mesh:"Digit_RightHandRing3",index:40,point:[.05814640255240198,-.01629700341344388,-.019476830110133854],surface:[.05814300027024107,-.016762693445929077,-.018030842327509903],wrist:[.1288903589261322,-.07284613005154217,.007901019899641887],rotation:[-.07357055959821147,-.502078842149903,.2724036384230405,.817496474251927]}},hand_on_hip:{arm:{w:[.1013587724414639,-.08662127900622689,.08430465201725247],e:[.10565685854578998,-.020983640111515614,.19063617068145472],q:[-.5035388954587375,-.2718861098803347,.77124926386994,.27874914599017314]},joints:{RightArm:[.17876143109585763,-.9573215717010536,.05109241857285233,.2212901350552295],RightForeArm:[.7207921708744828,.3129913424167172,-.36122583758110616,.5020069324641443],RightForeArmTwist:[-.22070778698984805,-.018238998610758672,-.8040456757231979,-.5517843487014901],RightHand:[-.7006933328254529,-.36580703966840245,-.36254007315406606,.4937395653787972],RightHandIndex1:[-.10524697230494157,.04567233437143525,.0019374564942549466,.9933948720043878],RightHandIndex2:[223584590081094e-19,-.08324354483622853,-22129035857909596e-22,-.9965292544169133],RightHandIndex3:[30663550558113206e-21,-6918034139991036e-23,-11829343571356787e-23,1.000000049849464],RightHandIndex4:[33127146252809325e-22,-14901161193847656e-24,23888424038887024e-23,1],RightHandMiddle1:[-.11435138120081305,.06881525343610195,.04506440776638672,.9900290039226336],RightHandMiddle2:[-4382596959923157e-21,-.1040781348551219,-4186594178889891e-21,-.9945691328110665],RightHandMiddle3:[-11071260950998307e-21,-17504347360475236e-23,-5623366940127328e-21,1.0000000316426876],RightHandMiddle4:[16326083596140961e-22,16210833564400673e-24,2993037924170494e-22,1],RightHandPinky1:[-.1337314016166185,.07315323144143199,.13254627135469155,.9793855219008007],RightHandPinky2:[23616069840526333e-22,-.16738558130889597,-4119703900878902e-21,-.9858915066447924],RightHandPinky3:[-6027126983290665e-21,16486245357771878e-23,-8665995478288058e-21,1.0000000166822633],RightHandPinky4:[6332993507385254e-22,10128132998943329e-24,13085082173347473e-23,1],RightHandRing1:[-.12642975150178098,.10382428386985487,.08386966700330116,.9829557038802602],RightHandRing2:[20118739305768907e-22,-.1288111371323422,-19402394360046316e-22,-.9916691440910271],RightHandRing3:[1461093855684159e-20,-4389342989075118e-23,10688687882565162e-22,1.0000000196515664],RightHandRing4:[-16298143634685403e-23,-12718372133235789e-24,-36181879181640397e-23,1],RightHandThumb1:[-.12023418280831091,.308846646350469,-.41143999935520414,.8490433424792275],RightHandThumb2:[-.08319428082762007,-.03427349434024962,-.055185647481135136,.9944136385152633],RightHandThumb3:[-16232950201811036e-22,1639127589214695e-22,354368268062899e-21,1],RightHandThumb4:[-18458813428878784e-22,0,-1648440957069397e-22,1]},contact:{body:"Hips",mesh:"tripo_part_18",index:529,point:[.0731772256840976,.02307037586497108,.035473183995326056],surface:[.07111427173586082,.02253913477009819,.03506383997915365],wrist:[.0966905609306075,.05817160034197805,.08393458301773019],rotation:[-.4966504223664082,-.2672866319472754,.7803692914545188,.27003698394137804],surfaceMesh:"tripo_part_1",surfaceFace:245}}};function wu(i,e){let t=new De,n=Object.fromEntries(Object.entries(nc).map(([l,h])=>{let u=h.contact;return[l,{...u,mesh:i.getObjectByName(u.mesh),body:e.bone(u.body),point:new P(...u.point),surface:new P(...u.surface),wrist:new P(...u.wrist),rotation:new Ue(...u.rotation),reference:{w:new P(...h.arm.w),q:new Ue(...h.arm.q)}}]}));function s(l){let h=n[l];if(!h)return null;let u=e.frame(h.body);return{w:h.wrist.clone().applyQuaternion(u.q).add(u.p),q:u.q.clone().multiply(h.rotation),point:h.point.clone().applyQuaternion(u.q).add(u.p),surface:h.surface.clone().applyQuaternion(u.q).add(u.p)}}function r(l){let h=n[l];return i.updateMatrixWorld(!0),t.copy(i.matrixWorld).invert(),h.mesh.localToWorld(h.mesh.getVertexPosition(h.index,new P)).applyMatrix4(t)}function o(l){return s(l).point.sub(r(l))}function a(l,h,u,d,f){let g=n[l],v=s(l),m=g.reference.w.clone().applyQuaternion(h.q).add(h.p),p=h.q.clone().multiply(g.reference.q);d.addScaledVector(v.w.sub(m),u),f.premultiply(new Ue().slerp(v.q.multiply(p.invert()),u))}function c(l,h){let u=s(l),d=r(l);return{active:h>.999999,weight:h,error:d.distanceTo(u.point),gap:d.distanceTo(u.surface),mesh:n[l].mesh.name,index:n[l].index}}return{target:s,correction:o,follow:a,snapshot:c,poses:nc}}var ic={"mixamorig:LeftUpLeg":[-.9996018409729004,.01611410267651081,.0161137655377388,.016642021015286446],"mixamorig:LeftLeg":[-.03699565306305885,-.087727852165699,.09191121906042099,.991205096244812],"mixamorig:LeftFoot":[.45231854915618896,.26301664113998413,-.34714275598526,.7782815098762512],"mixamorig:LeftToeBase":[.2671027183532715,.0996379405260086,-.027776921167969704,.9581006169319153],"mixamorig:LeftToe_End":[-3316505114980828e-23,38849258032769285e-24,-32037499408943404e-23,1],"mixamorig:RightUpLeg":[.995092511177063,.06709310412406921,.06709036976099014,.02807636372745037],"mixamorig:RightLeg":[-.05079253017902374,-.09876632690429688,.08668439835309982,.9900258183479309],"mixamorig:RightFoot":[.36051660776138306,.42546072602272034,-.3802715539932251,.7378377318382263],"mixamorig:RightToeBase":[.2662839889526367,.21606053411960602,-.061379093676805496,.9373597502708435],"mixamorig:RightToe_End":[-5763103416711601e-23,-14831229577794147e-23,-3725171637825042e-23,1],"mixamorig:Spine":[-14128519465472777e-25,-6787352901937993e-25,9589471754102748e-34,1],"mixamorig:Spine1":[-.0007698311819694936,.02773502841591835,.02773498184978962,.9992302060127258],"mixamorig:Spine2":[-.007717425934970379,-.01869148761034012,-.01914907805621624,.9996121525764465],"mixamorig:LeftShoulder":[-.7757753729820251,.15822558104991913,.14713601768016815,.592864453792572],"mixamorig:LeftArm":[-.4782077670097351,.10950472205877304,.007926265709102154,.8713571429252625],"mixamorig:LeftForeArm":[.02746623009443283,.15412716567516327,-.20439541339874268,.9662882089614868],"mixamorig:LeftHand":[-.08087591081857681,-.006765472237020731,-.0005234599811956286,.9967010617256165],"mixamorig:LeftHandIndex1":[-.22839772701263428,.08963611721992493,-.12550534307956696,.9612743258476257],"mixamorig:LeftHandIndex2":[-.15079312026500702,.06958191841840744,-.09019779413938522,.9819797277450562],"mixamorig:LeftHandIndex3":[5476177875607391e-22,2980232594040899e-23,4842878524868865e-22,1],"mixamorig:LeftHandIndex4":[-4470348358154297e-22,59604641222676946e-24,-16391277313232422e-23,1],"mixamorig:LeftHandMiddle1":[-.3195824921131134,.0827605202794075,-.12695391476154327,.9353611469268799],"mixamorig:LeftHandMiddle2":[-.14064989984035492,.3410487771034241,-.22908416390419006,.9007906317710876],"mixamorig:LeftHandMiddle3":[-4544854732557724e-22,-6780028911634872e-22,-14342369922815124e-22,1],"mixamorig:LeftHandMiddle4":[5047768354415894e-22,3725291186640334e-24,8679926963850448e-22,1],"mixamorig:LeftHandPinky1":[-.33528023958206177,.0835246592760086,-.1294236183166504,.9294409155845642],"mixamorig:LeftHandPinky2":[-.1021730974316597,.38760116696357727,-.23717164993286133,.8849155902862549],"mixamorig:LeftHandPinky3":[9313234627938982e-25,-11082740059009666e-23,14901161193847656e-23,1],"mixamorig:LeftHandPinky4":[-9220094199235973e-23,-8381903171539307e-24,-9872020712009544e-23,1],"mixamorig:LeftHandRing1":[-.36692631244659424,.18084463477134705,-.24364875257015228,.879372239112854],"mixamorig:LeftHandRing2":[-.08045930415391922,.2736043930053711,-.16518902778625488,.9441289901733398],"mixamorig:LeftHandRing3":[3525055944919586e-22,-12461096048355103e-22,-17229467630386353e-23,1],"mixamorig:LeftHandRing4":[-3064051838919113e-22,735744833946228e-22,10933728162854095e-22,1],"mixamorig:LeftHandThumb1":[.05687931180000305,.2397952377796173,-.2677057385444641,.9314486980438232],"mixamorig:LeftHandThumb2":[-.007969539612531662,.04566650465130806,-.06526973098516464,.99679034948349],"mixamorig:LeftHandThumb3":[4926695851281693e-22,-2607703031287656e-23,-3380700945854187e-22,1],"mixamorig:LeftHandThumb4":[-2700835750601982e-22,-4842877388000488e-23,23283065786472434e-23,1],"mixamorig:Neck":[-.06847842782735825,-.15622475743293762,-.1601199060678482,.9722480177879333],"mixamorig:Head":[-.0727609246969223,-.0251318346709013,.02146131917834282,.9968017339706421],"mixamorig:HeadTop_End":[4470347647611561e-23,-46566128730773926e-24,11175870007207322e-24,1],"mixamorig:RightShoulder":[.5345213413238525,.5708125829696655,.59010249376297,.20059670507907867],"mixamorig:RightArm":[-.121747687458992,-.748198390007019,.029982758685946465,.6515195965766907],"mixamorig:RightForeArm":[.31302130222320557,.5466890931129456,-.7512856721878052,.19677035510540009],"mixamorig:RightHand":[-.10955781489610672,-.7716977596282959,-.1432228684425354,.6098908185958862],"mixamorig:RightHandIndex1":[.012677155435085297,.0483676940202713,.02299594134092331,.9984844326972961],"mixamorig:RightHandIndex2":[-20308123112044996e-22,.08324356377124786,-6429815471165057e-22,.996529221534729],"mixamorig:RightHandIndex3":[45867641347285826e-22,-6915070827062664e-23,7618219797222991e-22,1],"mixamorig:RightHandIndex4":[33127146252809325e-22,-14901161193847656e-24,23888424038887024e-23,1],"mixamorig:RightHandMiddle1":[.0026746864896267653,.07727731764316559,.06946270912885666,.9945833086967468],"mixamorig:RightHandMiddle2":[-14949755495763384e-22,.10407814383506775,18782003508022171e-22,.9945691227912903],"mixamorig:RightHandMiddle3":[228406815949711e-20,-17503766969184653e-23,-28983915854041697e-22,1],"mixamorig:RightHandMiddle4":[16326083596140961e-22,16210833564400673e-24,2993037924170494e-22,1],"mixamorig:RightHandPinky1":[-.018324600532650948,.09257703274488449,.15852339565753937,.9828346967697144],"mixamorig:RightHandPinky2":[20026584479637677e-22,.16738557815551758,47492284238614957e-23,.9858915209770203],"mixamorig:RightHandPinky3":[-3187916718161432e-21,16484406728523027e-23,-26123593670490663e-22,1],"mixamorig:RightHandPinky4":[6332993507385254e-22,10128132998943329e-24,13085082173347473e-23,1],"mixamorig:RightHandRing1":[-.010971901006996632,.1177908256649971,.11292699724435806,.9865356087684631],"mixamorig:RightHandRing2":[18681969322642544e-22,.12881113588809967,11833247981485329e-23,.9916691780090332],"mixamorig:RightHandRing3":[-19276048988103867e-22,-4388856922332707e-23,-1103617250919342e-22,1],"mixamorig:RightHandRing4":[-16298143634685403e-23,-12718372133235789e-24,-36181879181640397e-23,1],"mixamorig:RightHandThumb1":[.14236538112163544,.21674895286560059,-.3215236961841583,.9107000231742859],"mixamorig:RightHandThumb2":[-7082254427359658e-23,-.034445956349372864,-2110698318347204e-22,.9994065761566162],"mixamorig:RightHandThumb3":[-16232950201811036e-22,1639127589214695e-22,354368268062899e-21,1],"mixamorig:RightHandThumb4":[-18458813428878784e-22,0,-1648440957069397e-22,1]};var Kr="wolfgang.director.v1",H3=Object.freeze(["hello","open_palm","acknowledge","thinking","hand_on_hip","relaxed","attentive"]),G3=Object.freeze(["relaxed","open","soft_fist","point"]),W3=/^[A-Za-z0-9:_-]{1,96}$/,X3=i=>i!==null&&typeof i=="object"&&!Array.isArray(i),as=(i,e)=>X3(i)&&Object.keys(i).every(t=>e.includes(t)),Oi=(i,e,t)=>typeof i=="number"&&Number.isFinite(i)&&i>=e&&i<=t;function Tu(i,{caution:e=!1}={}){if(!as(i,["version","id","mode","steps"])||i.version!==Kr||typeof i.id!="string"||!W3.test(i.id)||!["replace","queue","cancel"].includes(i.mode))return null;if(i.mode==="cancel")return i.steps===void 0?Object.freeze({version:Kr,id:i.id,mode:"cancel"}):null;if(!Array.isArray(i.steps)||!i.steps.length||i.steps.length>8)return null;let t=[];for(let n of i.steps){if(!as(n,["gesture","tempo","intensity","holdMs","gaze","posture","hands","arms"])||!H3.includes(n.gesture)||e&&!["relaxed","attentive","acknowledge"].includes(n.gesture))return null;let s=n.tempo??1,r=n.intensity??.5,o=n.holdMs??1e3;if(!Oi(s,.85,1.35)||!Oi(r,0,1)||!Oi(o,0,8e3))return null;let a={gesture:n.gesture,tempo:s,intensity:r,holdMs:o};if(n.gaze!==void 0){if(!as(n.gaze,["x","y"])||!Oi(n.gaze.x,-1,1)||!Oi(n.gaze.y,-1,1))return null;a.gaze=Object.freeze({x:n.gaze.x,y:n.gaze.y})}if(n.posture!==void 0){if(!as(n.posture,["turn","shift"]))return null;let c=n.posture.turn??0,l=n.posture.shift??0;if(!Oi(c,-.08,.08)||!Oi(l,-.017,.017))return null;a.posture=Object.freeze({turn:c,shift:l})}if(n.hands!==void 0){if(!as(n.hands,["left","right"])||!Object.keys(n.hands).length)return null;let c={};for(let l of["left","right"])if(n.hands[l]!==void 0){if(!G3.includes(n.hands[l]))return null;c[l]=n.hands[l]}a.hands=Object.freeze(c)}if(n.arms!==void 0){if(e||!["attentive","relaxed"].includes(n.gesture)||!as(n.arms,["left","right"])||!Object.keys(n.arms).length)return null;let c={};for(let[l,h]of Object.entries(n.arms)){if(!as(h,["lift","forward","outward"])||!["lift","forward","outward"].every(u=>Oi(h[u],0,1)))return null;c[l]=Object.freeze({lift:h.lift,forward:h.forward,outward:h.outward})}a.arms=Object.freeze(c)}t.push(Object.freeze(a))}return Object.freeze({version:Kr,id:i.id,mode:i.mode,steps:Object.freeze(t)})}var Bi=(i,e=0,t=1)=>Math.max(e,Math.min(t,i)),tn=i=>(i=Bi(i),i*i*i*(i*(i*6-15)+10)),q3=i=>{let e=Math.max(0,i)*5;return 1-(1+e+e*e/2)*Math.exp(-e)},Jr=new P(0,1,0),Y3=new Set(["attending","thinking","asking","explaining","reassuring","caution"]),Au=["hello","open_palm","acknowledge"],Qa=["hello","open_palm","acknowledge","thinking","hand_on_hip"],Z3=["relaxed","attentive"];function Eu(i,{random:e=Math.random}={}){let t=new Map;i.traverse(J=>{J.isBone&&t.set(J.name.replace(/^mixamorig:?/,""),{bone:J,q:J.quaternion.clone(),p:J.position.clone()})});let n=du(i,t),s=t.get("Hips"),r=t.get("Head").bone;_u(i);let o=mu(i,t,n.frame,n.orient),a=[];for(let J of["Left","Right"]){o.handExpression(J,"open",J==="Right"?.53:.47);for(let[ce,Ee]of t)ce.startsWith(J+"Hand")&&ce!==J+"Hand"&&(a.push([Ee.bone,Ee.bone.quaternion.clone()]),Ee.bone.quaternion.copy(Ee.q))}let c=wu(i,n),l=null,h=0,u=bu(n,i),d=[0,0],f=gu(i),g=vu(r,n.orient),v=Mu(i),m=0,p=-1,b=.23,R=3.1,S=Math.random()*4294967295>>>0,T=()=>(S=1664525*S+1013904223>>>0,S/4294967296),y=()=>new Map([...t].map(([J,ce])=>[J,ce.bone.quaternion.clone()])),A=()=>{for(let J of t.values())J.bone.quaternion.copy(J.q),J.bone.position.copy(J.p)},_=[],w=[],C=[],D=[],L=[],N="idle",I=null,k=0,G=n.bone("Spine2");function V(J=d,ce=!0){let Ee=n.frame(G),rt=Ee.q.clone().invert();return["Left","Right"].map((ut,St)=>{let ot=n.frame(n.bone(ut+"Hand")),Ke=n.frame(n.bone(ut+"ForeArm")),Qe=n.frame(n.bone(ut+"Arm")).p;if(ce&&J[St]>0){let _t=le(ut,St,Ee,Qe),at=J[St];ot.p.addScaledVector(_t.translation,-at),ot.q.premultiply(new Ue().slerp(_t.rotation,at).invert());let et=n.frame(n.bone(ut+"Hand")).p.sub(Qe).normalize(),Ce=Ke.p.clone().sub(Qe);Ce.addScaledVector(et,-Ce.dot(et)).normalize(),Ce.applyQuaternion(new Ue().slerp(_t.bend,at).invert()),Ke.p.copy(Qe).addScaledVector(Ce,.1)}return{w:ot.p.sub(Ee.p).applyQuaternion(rt),e:Ke.p.sub(Ee.p).applyQuaternion(rt),q:rt.clone().multiply(ot.q),contact:J[St]}})}let Q=n.frame(G),O=Q.q.clone().invert(),Z=["Left","Right"].map(J=>{let ce=u.target(J),Ee=ce.w.clone().sub(n.frame(n.bone(J+"Arm")).p).normalize();return ce.pole.addScaledVector(Ee,-ce.pole.dot(Ee)).normalize(),{w:ce.w.sub(Q.p).applyQuaternion(O),q:O.clone().multiply(ce.q),pole:ce.pole.applyQuaternion(O)}});function le(J,ce,Ee,rt){let ut=u.target(J),St=Z[ce],ot=St.w.clone().applyQuaternion(Ee.q).add(Ee.p),Ke=Ee.q.clone().multiply(St.q),Qe=St.pole.clone().applyQuaternion(Ee.q),_t=ut.w.clone().sub(rt).normalize(),at=ut.pole.addScaledVector(_t,-ut.pole.dot(_t)).normalize();return{translation:ut.w.sub(ot),rotation:ut.q.multiply(Ke.invert()),bend:new Ue().setFromUnitVectors(Qe,at)}}let Me=["Left","Right"].map(J=>{let ce=n.frame(n.bone(J+"Arm")).p,Ee=n.frame(n.bone(J+"ForeArm")).p,rt=n.frame(n.bone(J+"Hand")).p;return{shoulder:ce.clone().sub(Q.p).applyQuaternion(O),radius:ce.distanceTo(Ee)+Ee.distanceTo(rt)-.002,upper:ce.distanceTo(Ee),lower:Ee.distanceTo(rt)}});function ie(J,ce,Ee){return J.map((rt,ut)=>{let St=Ee,ot=rt.w.clone().lerp(ce[ut].w,St),Ke=rt.e.clone().lerp(ce[ut].e,St),Qe=Me[ut],_t=ot.clone().sub(Qe.shoulder);_t.length()>Qe.radius&&ot.copy(Qe.shoulder).addScaledVector(_t.normalize(),Qe.radius);let at=ot.clone().sub(Qe.shoulder).normalize(),et=rt.w.clone().sub(Qe.shoulder).normalize(),Ce=ce[ut].w.clone().sub(Qe.shoulder).normalize(),He=(Pn,Wt)=>{let ln=Pn.e.clone().sub(Qe.shoulder);return ln.addScaledVector(Wt,-ln.dot(Wt)).normalize()},Lt=He(rt,et),xt=He(ce[ut],Ce),Gt=xt.clone().applyQuaternion(new Ue().setFromUnitVectors(Ce,et)),Kt=Math.atan2(et.dot(Lt.clone().cross(Gt)),Lt.dot(Gt)),Jt=Lt.applyQuaternion(new Ue().setFromUnitVectors(et,at)),An=xt.applyQuaternion(new Ue().setFromUnitVectors(Ce,at)),It=Math.atan2(at.dot(Jt.clone().cross(An)),Jt.dot(An));for(;It-Kt>Math.PI;)It-=Math.PI*2;for(;It-Kt<-Math.PI;)It+=Math.PI*2;return Ke.copy(Qe.shoulder).addScaledVector(Jt.applyQuaternion(new Ue().setFromAxisAngle(at,It*St)),.1),{w:ot,e:Ke,q:rt.q.clone().slerp(ce[ut].q,St),contact:rt.contact+(ce[ut].contact-rt.contact)*St}})}let oe=V(),re=0,X=!1,j=0,z=null,xe=null,he=y(),Le=he,st=[0,0],Ve=[0,0],Xe="attending",ct=0,Ye=.4,ft="viewer",Ct=-10,Vt=[0,0],Tt=[0,0],Pt=[0,0],B=0,Ht=5,ht=2+e()*4,E=0,x=0,H=0,K=0,ee=0,ue=0,fe=0,te=2.8,ne=[[0,0,0],[0,0,0]],de=null,Ne=24+e()*10,_e=1,pe=(J,ce)=>{let Ee=J.filter(rt=>!ce.includes(rt));return Ee[Math.floor(e()*Ee.length)%Ee.length]};function Ae(J,ce="idle",Ee={}){Qa.includes(J)&&(_.push(J),_.length>Qa.length-1&&_.shift()),he=y();for(let rt of["Spine1","Spine2"])he.set(rt,t.get(rt).q.clone());return oe=V(),z={name:J,kind:ce,start:re,enter:ce==="greeting"?1.25:1.8,hold:ce==="idle"?10+e()*16:1.2+e()*.65,exit:1.6,tempo:1.02+e()*.18,variant:{wave:.06+e()*.025,waveTurns:.85+e()*.4,lift:e()*.006,reach:(e()-.5)*.008,nod:.8+e()*.4}},j++,["hello","open_palm","acknowledge"].includes(J)&&(z.source=J==="acknowledge"?null:J==="hello"?"side_wave":"hand_offer",z.enter=.18,z.hold=J==="hello"?3.95:J==="open_palm"?4.9:1,z.exit=.35),["thinking","hand_on_hip"].includes(J)&&(z.source="body_contact",z.enter=.18,z.hold=J==="thinking"?10.2:8.6,z.exit=.35),ce==="director"&&(z.tempo=Ee.tempo,z.holdExtra=Ee.holdMs/1e3,z.hold+=z.holdExtra,z.directorId=Ee.commandId,z.strength=Ee.intensity,z.hands=Ee.hands,z.arms=Ee.arms,z.variant.wave=.055+.03*Ee.intensity,z.variant.nod*=.35+.65*Ee.intensity),z.enter*=z.tempo,z.hold*=z.tempo,z.exit*=z.tempo,x=E,H=(e()<.5?-1:1)*(.008+e()*.009),ee=K,ue=(e()-.5)*.12,fe=re,te=2.8+e(),ce==="director"&&(H*=.35+.65*Ee.intensity,ue*=.35+.65*Ee.intensity),Ee.posture&&(H=Ee.posture.shift??H,ue=Ee.posture.turn??ue),Ee.gaze&&(st=[Ee.gaze.x,Ee.gaze.y]),!0}function ze(){for(let[J,ce]of a)J.quaternion.copy(ce);n.refresh();for(let J of["Left","Right"]){let ce=u.target(J);n.arm(J,ce.w,ce.pole),o.apply(J,ce.q)}}function qe(J,ce,Ee=!1){let rt=J==="hello"?1.48:J==="open_palm"?1.88:J==="thinking"?3.18:J==="hand_on_hip"?2.78:1/0;z?.holdExtra&&ce>rt&&(ce=Math.max(rt,ce-z.holdExtra));let ut=ot=>{let Ke=z?.release?z.release.weight*(1-tn((re-z.release.start)/z.release.duration)):ot;return k=Ke,Ke};A(),ze();let St=[1,1];if(l=null,h=0,J==="hello"){let ot=y(),Ke=Math.max(0,ce-.18),Qe=ut(Ke<1.3?tn(Ke/1.3):Ke<2.45?1:1-tn((Ke-2.45)/1.5)),_t="Right",at=n.frame(n.bone("RightArm")).p,et=new P(.89601797,0,-.44401779),Ce=new P(.035+(z?.variant.reach||0),.82+(z?.variant.lift||0),.205),He=Ce.clone().sub(at).normalize(),Lt=new P(.055,.7,.18).sub(at).applyAxisAngle(He,-50*Math.PI/180);n.arm(_t,Ce,Lt);let xt=n.frame(n.bone("RightForeArm")).p,Gt=Bi((Ke-1.3)/1.15),Kt=Ke>1.3&&Ke<2.45?Math.sin(Gt*Math.PI*2*(z?.variant.waveTurns||1))*Math.sin(Gt*Math.PI)**2*(z?.variant.wave||.075):0,Jt=Ce.clone().sub(xt).applyAxisAngle(et,Kt).add(xt);n.arm(_t,Jt,xt.clone().sub(at));let An=n.frame(n.bone("RightHand")).p.sub(n.frame(n.bone("RightForeArm")).p).normalize();o.apply(_t,o.targetHandQ(_t,An,et));for(let[It,Pn]of Object.entries(ic)){let Wt=It.replace(/^mixamorig:?/,"");/^RightHand(Index|Middle|Ring|Pinky|Thumb)/.test(Wt)&&t.get(Wt)?.bone.quaternion.fromArray(Pn).normalize()}for(let[It,Pn]of t)/^Right(Arm|ForeArm|Hand)/.test(It)&&Pn.bone.quaternion.slerpQuaternions(ot.get(It),Pn.bone.quaternion.clone(),Qe);St[1]=1-Qe,n.refresh()}if(J==="open_palm"){let ot=y(),Ke=Math.max(0,ce-.18),Qe=ut(Ke<1.7?tn(Ke/1.7):Ke<3?1:1-tn((Ke-3)/1.7)),_t=new P(.89601797,0,-.44401779),at=new P(.44401779,0,.89601797),et=_t.clone().multiplyScalar(.1+(z?.variant.reach||0)+(z?.kind==="director"?(z.strength-.5)*.025:0)).addScaledVector(at,.095).add(new P(0,.64,0)),Ce=n.frame(n.bone("RightArm")).p,He=_t.clone().multiplyScalar(.06).addScaledVector(at,.1).add(new P(0,-.16,0));n.arm("Right",et,He);let Lt=et.clone().sub(n.frame(n.bone("RightForeArm")).p).normalize();o.apply("Right",o.targetHandQ("Right",Lt,Jr));for(let[xt,Gt]of Object.entries(ic)){let Kt=xt.replace(/^mixamorig:?/,"");/^RightHand(Index|Middle|Ring|Pinky|Thumb)/.test(Kt)&&t.get(Kt)?.bone.quaternion.slerp(new Ue(...Gt),.65)}for(let[xt,Gt]of t)/^Right(Arm|ForeArm|Hand)/.test(xt)&&Gt.bone.quaternion.slerpQuaternions(ot.get(xt),Gt.bone.quaternion.clone(),Qe);St[1]=1-Qe,n.refresh()}if(J==="thinking"||J==="hand_on_hip"){let ot=c.poses[J];if(ot){let Ke=Math.max(0,ce-.18),Qe=J==="thinking"?3:2.6,_t=J==="thinking"?4.2:3.4,at=ut(Ke<Qe?tn(Ke/Qe):Ke<Qe+_t?1:1-tn((Ke-Qe-_t)/Qe));for(let[et,Ce]of Object.entries(ot.joints)){let He=t.get(et);if(He){let Lt=J==="thinking"&&/^RightHand(Index|Middle|Ring|Pinky|Thumb)/.test(et)?tn((at-.15)/.85):at;He.bone.quaternion.slerp(new Ue(...Ce),Lt)}}St[1]=1-at,l=J,h=at,n.refresh()}}if(z?.kind==="director"&&z.arms&&J===z.name&&!Ee){let ot=ut(tn(ce/1.45)),Ke=y(),Qe=new P(.89601797,0,-.44401779),_t=new P(.44401779,0,.89601797);for(let[at,et]of["Left","Right"].entries()){let Ce=z.arms[et.toLowerCase()];if(!Ce)continue;let He=et==="Right"?1:-1,xt=n.frame(n.bone(et+"Arm")).p.clone().addScaledVector(Jr,-.192+.23*Ce.lift).addScaledVector(Qe,.05+.13*Ce.forward).addScaledVector(_t,He*(.032+.064*Ce.outward)),Gt=_t.clone().multiplyScalar(He*.7).addScaledVector(Jr,-.68).addScaledVector(Qe,-.32);n.arm(et,xt,Gt),o.apply(et,o.neutralOrientation(et));for(let[Kt,Jt]of t)(Kt===et+"Arm"||Kt===et+"ForeArm"||Kt.startsWith(et+"Hand"))&&Jt.bone.quaternion.slerpQuaternions(Ke.get(Kt),Jt.bone.quaternion.clone(),ot);St[at]=1-ot}n.refresh()}return{q:y(),arms:V(St,!1)}}function F(){L=[],I&&(N="interrupted"),Ct=re;let J=pe(Au,_.slice(-2));return z?.kind==="greeting"||z?.source?(xe={name:J,kind:"greeting"},j++,{name:J,serial:j,queued:!0}):(Ae(J,"greeting"),{name:J,serial:j})}function ge(J){let ce=pe(Au,J?[J]:[]);return Ct=re,Ae(ce,"greeting"),H*=.5,ue*=.6,{name:ce,serial:j,arrival:!0}}function se(J){if(J=Bi(Number.isFinite(J)?J:0,0,.12),X&&J===0)return pt();if(X=!0,re+=J,!z&&!L.length&&re>=ht){let Ce=pe(Z3,w);w.push(Ce),w.length>1&&w.shift(),Ae(Ce)}re>=ct&&(Xe="attending",Ye=.4,ft="viewer");let ce=z?re-z.start:0,Ee=z?ce/z.tempo:ce,rt=qe(z?.name||"relaxed",Ee),ut=z?tn(ce/z.enter):1;if(z&&!z.release&&ce>z.enter+z.hold){let Ce=qe("relaxed",ce,!0),He=tn((ce-z.enter-z.hold)/z.exit);for(let[Lt,xt]of rt.q)xt.slerp(Ce.q.get(Lt),He);rt.arms=ie(rt.arms,Ce.arms,He)}for(let[Ce,He]of t)He.bone.quaternion.slerpQuaternions(he.get(Ce)||He.q,rt.q.get(Ce)||He.q,ut);let St=ie(oe,rt.arms,ut);Le=y(),z&&(z.release?re-z.release.start>=z.release.duration:ce>=z.enter+z.hold+z.exit)&&(L.length||(N==="returning"?N="cancelled":z.kind==="director"&&N==="playing"&&(N="complete")),z=null,he=Le,ht=re+7+e()*11);let ot=q3((re-fe)/te);if(E=x+(H-x)*ot,K=ee+(ue-ee)*ot,!de&&re>=Ne&&z?.kind!=="greeting"&&h<.01){let Ce=1-_e;de={i:Ce,start:re,from:ne[Ce][0],to:ne[Ce][0]>.008?-.014:.018,duration:1.5},_e=Ce}if(de){let Ce=Bi((re-de.start)/de.duration),He=de.i;ne[He][0]=de.from+(de.to-de.from)*tn(Ce),ne[He][1]=Math.sin(Math.PI*Ce)**2*.013,Ce===1&&(ne[He][1]=0,de=null,Ne=re+28+e()*16)}s.bone.position.copy(s.p),s.bone.position.z+=E,t.get("Spine1").bone.quaternion.multiply(new Ue().setFromAxisAngle(Jr,K*.4)),t.get("Spine2").bone.quaternion.multiply(new Ue().setFromAxisAngle(Jr,K*.6)),n.feet(ne),re>=Ht&&(Tt=[...Vt],Pt=[(e()-.5)*.09,(e()-.5)*.035],B=re,Ht=re+4.5+e()*8.5),Vt=Tt.map((Ce,He)=>Ce+(Pt[He]-Ce)*tn((re-B)/2));let Ke=1-Math.exp(-J*2.5);Ve=Ve.map((Ce,He)=>Ce+(st[He]-Ce)*Ke);let Qe=re-Ct,_t=z?.name==="acknowledge"?1.1:.7,at=Qe>=0&&Qe<_t?Math.sin(Qe/_t*Math.PI)*(z?.name==="acknowledge"?.11:.045):0;g.update({yaw:Ve[0]*.07+Vt[0]+(ft==="evidence"?-.025*Ye:0),pitch:-Ve[1]*.03+Vt[1]-(l==="thinking"?.12*h:0),nod:at*(z?.variant.nod||1)+(l==="thinking"?.02*h:0)},J),n.refresh();let et=n.frame(G);for(let[Ce,He]of["Left","Right"].entries()){let Lt=St[Ce],xt=Lt.w.clone().applyQuaternion(et.q).add(et.p),Gt=Lt.e.clone().applyQuaternion(et.q).add(et.p),Kt=n.frame(n.bone(He+"Arm")).p,Jt=et.q.clone().multiply(Lt.q),An=Gt.sub(Kt),It=Lt.contact;if(It>0){let Wt=le(He,Ce,et,Kt);xt.addScaledVector(Wt.translation,It),Jt.premultiply(new Ue().slerp(Wt.rotation,It)),An.applyQuaternion(new Ue().slerp(Wt.bend,It))}He==="Right"&&l&&h>0&&c.follow(l,et,h,xt,Jt),u.slide(He,xt,J,It),n.arm(He,xt,An,1,{dt:J,commit:!0}),o.apply(He,Jt,{dt:J,commit:!0});let Pn=z?.hands?.[He.toLowerCase()]||(z?.name==="open_palm"&&He==="Right"?"open":null);if(Pn&&It<.05&&h<.01&&o.handExpression?.(He,Pn,tn((.05-It)/.05),{blendFromCurrent:!0}),It>0&&It<.999999)for(let Wt=0;Wt<3;Wt++){let ln=u.padCollisionCorrection(He);if(ln.lengthSq()<1e-10)break;xt.add(ln),n.arm(He,xt,An,1,{dt:0,commit:!0}),o.apply(He,Jt,{dt:0,commit:!0})}if(It>.999999)for(let Wt=0;Wt<8;Wt++){let ln=u.correction(He);if(ln.lengthSq()<1e-10)break;ln.multiplyScalar(.5),xt.add(ln),n.arm(He,xt,An,1,{dt:0,commit:!0}),o.apply(He,Jt,{dt:0,commit:!0})}if(He==="Right"&&l&&h>.9){let Wt=tn((h-.9)/.1);for(let ln=0;ln<6;ln++){let M=c.correction(l);if(M.lengthSq()<1e-10)break;xt.addScaledVector(M,.65*Wt),n.arm(He,xt,An,1,{dt:0,commit:!0}),o.apply(He,Jt,{dt:0,commit:!0})}}d[Ce]=It}if(p<0&&re>=R&&(p=re,b=.2+T()*.06),p>=0){let Ce=(re-p)/b;m=Ce<.34?tn(Ce/.34):Ce<.48?1:1-tn((Ce-.48)/.52),Ce>=1&&(m=0,p=-1,R=re+2.7+T()*4)}if(v.update(m),f.update(),i.updateMatrixWorld(!0),!z&&L.length&&me(),!z&&xe){let Ce=xe;xe=null,(Ce.kind==="greeting"||Ce.until>re)&&(Ae(Ce.name,Ce.kind),Ct=re)}return pt()}function me(){let J=L.shift();J&&(I=J.commandId,N="playing",Ae(J.gesture,"director",J))}function ye(){!z||z.release||(z.release={start:re,weight:k,duration:1.8})}function ae(){let J=z?.kind==="director"||z?.kind==="conversation",ce=J||L.length>0||xe?.kind==="conversation";return L=[],xe=null,Xe="attending",ct=re,Ye=.4,ft="viewer",ce&&(N=J?"returning":"cancelled",J&&ye()),ce}function Oe(J){let ce=Tu(J,{caution:Xe==="caution"});if(!ce||D.includes(ce.id))return!1;let Ee=ce.steps||[],rt=ce.mode==="queue"?[...L,...Ee]:Ee,ut=rt.reduce((ot,Ke)=>ot+(Ke.gesture==="thinking"?10.73:Ke.gesture==="hand_on_hip"?9.13:Ke.gesture==="open_palm"?5.43:Ke.gesture==="hello"?4.48:5.25)+Ke.holdMs/1e3,0)*1.35,St=ce.mode==="queue"&&z?.kind==="director"?Math.max(0,z.enter+z.hold+z.exit-(re-z.start)):z?1.8:0;return ut+St>90||ce.mode==="queue"&&L.length+Ee.length>8?!1:(D.push(ce.id),D.length>128&&D.shift(),ce.mode==="cancel"?(ae(),I=ce.id,N!=="returning"&&(N="cancelled"),!0):(ce.mode==="replace"&&(L=[],xe=null,ye()),L.push(...Ee.map(ot=>({...ot,commandId:ce.id}))),I=ce.id,N=z?"queued":"playing",z||me(),!0))}function Re(J){if(!J||!Y3.has(J.intent))return!1;if(J.eventId!==void 0){if(typeof J.eventId!="string"||!J.eventId||J.eventId.length>120||C.includes(J.eventId))return!1;C.push(J.eventId),C.length>128&&C.shift()}L=[],z?.kind==="director"&&(ye(),N="interrupted"),Xe=J.intent,Ye=Number.isFinite(J.intensity)?Bi(J.intensity):.4,ft=J.target==="evidence"?"evidence":"viewer",ct=re+Bi(Number.isFinite(J.durationMs)?J.durationMs/1e3:5,1,15);let ce=Xe==="thinking"?"thinking":Xe==="reassuring"?"acknowledge":Xe==="explaining"||Xe==="asking"?"open_palm":"attentive";return z?.source||z?.kind==="greeting"?xe={name:ce,kind:"conversation",until:ct}:Ae(ce,"conversation"),!0}function pt(){return{time:re,phase:z?.kind||"idle",action:z?.name||null,actionTime:z?re-z.start:0,serial:j,intent:Xe,director:{version:Kr,status:N,id:I,queued:L.length,current:z?.kind==="director"?z.name:null},cue:{intensity:Ye,target:ft,until:ct},phrase:z?{tempo:z.tempo,...z.variant}:null,bones:t.size,seat:0,seatStage:null,blink:m,stance:{shift:E,turn:K,movingFoot:de?["Left","Right"][de.i]:null},contacts:n.snapshot(),handContacts:u.snapshot(),bodyContacts:l?{[l]:c.snapshot(l,h)}:{},contactWeights:[...d],articulation:o.snapshot(),pendingGreeting:xe?.kind==="greeting"?xe.name:null}}return A(),n.feet(ne),ze(),d=[1,1],he=y(),Le=he,oe=V(),f.update(),i.updateMatrixWorld(!0),{tick:se,greet:F,arrive:ge,react:Re,direct:Oe,cancelDirection:ae,suspend:ae,attend(J,ce){st=[Bi(J,-1,1),Bi(ce,-1,1)]},snapshot:pt,play(J){if(!["relaxed","attentive",...Qa].includes(J))return!1;let ce=Qa.includes(J)?"greeting":"idle";return z?.source?(xe={name:J,kind:ce},ce==="greeting"&&(Ct=re),!0):Ae(J,ce)}}}async function $6(i,{portrait:e=!1}={}){let t=document.createElement("canvas");t.className="wolfgang-render",t.setAttribute("aria-hidden","true");let n=new Wa({canvas:t,alpha:!0,antialias:!0,powerPreference:"low-power"});n.shadowMap.enabled=!0,n.shadowMap.type=$o,n.setPixelRatio(Math.min(devicePixelRatio||1,1.75)),n.setClearColor(16777215,0),n.outputColorSpace=Dt,n.toneMapping=Dr,n.toneMappingExposure=.95;let s=new Yi,r=new jn(-.4,.4,.6,-.6,.01,12),o=new Js(n),a=new Ja,c=o.fromScene(a,.05);s.environment=c.texture,s.environmentIntensity=.65,a.dispose(),o.dispose(),s.add(new Cr(16777215,7111568,1.2));let l;for(let[O,Z]of[[[2,3,3],2],[[-2,2,2],.8],[[0,2,-3],1.5]]){let le=new es(16777215,Z);le.position.set(...O),Z===2&&(l=le,le.castShadow=!0,le.shadow.mapSize.set(512,512),le.shadow.camera.left=-1.2,le.shadow.camera.right=1.2,le.shadow.camera.top=1.6,le.shadow.camera.bottom=-1.1,le.shadow.camera.near=.1,le.shadow.camera.far=7,le.shadow.normalBias=.002,le.shadow.bias=-15e-5,le.shadow.radius=3),s.add(le)}let h;try{h=await new Ya().loadAsync("/assets/wolfgang.glb?v=376d8f9bcecabeff")}catch(O){throw n.dispose(),c.dispose(),O}let u=new un;u.rotation.y=Zr,u.scale.x=1.035,u.add(h.scene),s.add(u),h.scene.traverse(O=>{O.isMesh&&(O.castShadow=!0,O.frustumCulled=!1,O.material&&(O.material.envMapIntensity=.65))});let d=new $i(5,5),f=new wr({opacity:.18}),g=new dt(d,f);g.rotation.x=-Math.PI/2,g.position.y=-.001,g.receiveShadow=!0,s.add(g);let v=Eu(h.scene),m=0,p=0,b=!1,R=[],S=[],T,y;h.scene.traverse(O=>{O.isBone&&(S.push(O),/HeadTop|Hand$|Foot$|Toe_End|ForeArm|UpLeg/.test(O.name)&&R.push(O),O.name==="mixamorigHead"&&(T=O),O.name==="mixamorigHips"&&(y=O))});let A=S.map(()=>new P),_=0,w=0,C=.49,D="",L=new P;function N(O=0){if(b)return;v.tick(O),m+=(p-m)*(O?1-Math.exp(-O*8):0),u.rotation.y=Zr+m,s.updateMatrixWorld(!0);let Z=Math.max(1,i.clientWidth),le=Math.max(1,i.clientHeight),Me=Z/le,ie,oe,re,X=y.getWorldPosition(L).z;if(e)T.getWorldPosition(L),ie=.25,oe=L.x,re=L.y+.015;else{let he=v.snapshot().phase==="floor";if(ie=Math.max(he?1.25:1.1,(he?1.1:.94)/Me),re=he?.42:.5,oe=0,he){let Le=1/0,st=-1/0;for(let Ve of R)Ve.getWorldPosition(L),Le=Math.min(Le,L.x),st=Math.max(st,L.x);oe=(Le+st)/2}}let j=O?1-Math.exp(-O*2.5):1;_=_?Math.max(ie,_+(ie-_)*j):ie,w+=(oe-w)*j,C+=(re-C)*j;let z=xu({width:Z,height:le,left:i.getBoundingClientRect().left,viewportWidth:document.documentElement.clientWidth,frameHeight:_,portrait:e,contained:i.id==="model"}),xe=n.getSize(new Ze);if((xe.x!==z.width||xe.y!==le)&&n.setSize(z.width,le,!1),t.style.left=z.left+"px",t.style.right="auto",t.style.width=z.width+"px",r.left=z.cameraLeft,r.right=z.cameraRight,r.top=_/2,r.bottom=-_/2,!e){let he=Z+":"+le+":"+z.left;he!==D&&(l.position.y=3,D=he),S.forEach((Le,st)=>Le.getWorldPosition(A[st])),l.position.y=yu(A,w+r.left,{minHeight:l.position.y}),l.shadow.camera.far=Math.max(7,l.position.length()+3),l.shadow.camera.updateProjectionMatrix()}r.position.set(w,C+(e?0:.22),X+3),r.lookAt(w,C,X),r.updateProjectionMatrix(),n.render(s,r)}let I=null,k=!1,G=O=>{O.target.closest("[data-motion]")||(I={x:O.clientX,y:O.clientY},k=!1)},V=O=>{if(!I)return;let Z=O.clientX-I.x,le=O.clientY-I.y;!k&&Math.abs(Z)>8&&Math.abs(Z)>Math.abs(le)&&(k=!0),k&&(m+=Z*.008,p=m,I={x:O.clientX,y:O.clientY},N())},Q=()=>{I=null},W=O=>{if(k)O.preventDefault(),O.stopImmediatePropagation();else{p=0;let Z=v.greet();i.dispatchEvent(new CustomEvent("wolfgang:greet",{detail:Z,bubbles:!0}))}I=null};return i.addEventListener("pointerdown",G),i.addEventListener("pointermove",V),i.addEventListener("pointerup",Q),i.addEventListener("pointercancel",Q),i.addEventListener("click",W,!0),i.style.touchAction="pan-y",i.append(t),N(),i.dataset.rendered="true",i.dataset.model="rigged-3d",{render:N,arrive:O=>(p=0,v.arrive(O)),greet:()=>(p=0,v.greet()),attend:(O,Z)=>v.attend(O,Z),react:O=>v.react(O),direct:O=>v.direct(O),cancelDirection:()=>v.cancelDirection(),suspend:()=>v.suspend(),turn:O=>{m+=O,p=m,N()},reset:()=>{p=0,N()},snapshot:()=>v.snapshot(),dispose(){b=!0,i.removeEventListener("pointerdown",G),i.removeEventListener("pointermove",V),i.removeEventListener("pointerup",Q),i.removeEventListener("pointercancel",Q),i.removeEventListener("click",W,!0),t.remove(),delete i.dataset.rendered,delete i.dataset.model,h.scene.traverse(O=>{if(O.geometry?.dispose(),O.material)for(let Z of Array.isArray(O.material)?O.material:[O.material]){for(let le of Object.values(Z))le?.isTexture&&le.dispose();Z.dispose()}}),d.dispose(),f.dispose(),c.dispose(),n.dispose()}}}export{Eu as a,$6 as b};
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/

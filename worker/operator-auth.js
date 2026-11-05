// Server-to-server operator authentication. The private People Organised UI
// supplies these headers from its backend; neither value belongs in browser code.
export async function authorisedOperator(request,env={}){
 const expected=env.GUARDIAN_ADMIN_TOKEN,supplied=request.headers.get('authorization')||'';
 if(typeof expected!=='string'||expected.length<32||supplied.length>1024||!supplied.startsWith('Bearer ')||!/^Bearer .+/.test(supplied))return false;
 if(!/^[a-zA-Z0-9_-]{1,160}$/.test(request.headers.get('x-guardian-operator')||''))return false;
 const bytes=new TextEncoder(),hash=async value=>new Uint8Array(await crypto.subtle.digest('SHA-256',bytes.encode(value)));
 const [left,right]=await Promise.all([hash(expected),hash(supplied.slice(7))]);
 let difference=0;for(let index=0;index<left.length;index++)difference|=left[index]^right[index];
 return difference===0;
}

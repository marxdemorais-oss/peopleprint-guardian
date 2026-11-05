import {getTrialState,MONTHLY_CHECKS} from './trial-service.js';
const fail=(message,status=400)=>Object.assign(new Error(message),{status});
const identifier=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(value);
export async function userAllowance(db,id){
 if(!identifier(id))throw fail('Choose a customer.');
 const row=await db.prepare('SELECT owner_id,id,profile_completed_at,free_check_allowance,allowance_revision,allowance_updated_at FROM guardian_profiles WHERE id=?').bind(id).first();
 if(!row||row.owner_id.startsWith('guest:'))throw fail('Customer not found.',404);
 const trial=await getTrialState(db,row.owner_id);
 return {customerId:row.id,peopleOrganisedId:row.owner_id.startsWith('people:')?row.owner_id.slice(7):null,allowance:trial.allowance,used:trial.used,remaining:trial.remaining,reserved:trial.reserved,period:trial.period,resetsAt:trial.resetsAt,override:row.free_check_allowance??null,defaultAllowance:row.profile_completed_at?MONTHLY_CHECKS:1,revision:row.allowance_revision,updatedAt:row.allowance_updated_at??null};
}
export async function updateUserAllowance(request,db,id,actor){
 if(!identifier(id))throw fail('Choose a customer.');
 if(!request.headers.get('content-type')?.startsWith('application/json'))throw fail('JSON is required.',415);
 const reader=request.body?.getReader();if(!reader)throw fail('Provide an allowance.');
 const chunks=[];let size=0;
 try{while(true){const p=await reader.read();if(p.done)break;size+=p.value.byteLength;if(size>256){await reader.cancel();throw fail('Request too large.',413);}chunks.push(p.value);}}finally{reader.releaseLock();}
 const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.byteLength;}
 let value;try{value=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));}catch{throw fail('Provide a valid allowance.');}
 if(!value||Array.isArray(value)||Object.keys(value).length!==2||!Object.hasOwn(value,'allowance')||value.allowance!==null&&(!Number.isInteger(value.allowance)||value.allowance<0||value.allowance>1000)||!Number.isSafeInteger(value.revision)||value.revision<0)throw fail('Choose a whole number from 0 to 1000 or restore the default.');
 const row=await db.prepare("UPDATE guardian_profiles SET free_check_allowance=?,allowance_revision=allowance_revision+1,allowance_updated_at=?,allowance_updated_by=? WHERE id=? AND owner_id NOT LIKE 'guest:%' AND allowance_revision=? RETURNING id").bind(value.allowance,new Date().toISOString(),actor,id,value.revision).first();
 if(!row){if(!await db.prepare('SELECT id FROM guardian_profiles WHERE id=?').bind(id).first())throw fail('Customer not found.',404);throw fail('This allowance changed. Refresh before saving again.',409);}
 return userAllowance(db,id);
}

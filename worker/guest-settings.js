// One fixed service setting. Changes do not redeploy or reset existing usage.
export const GUEST_LIMIT_SQL="(SELECT integer_value FROM guardian_service_settings WHERE setting_key='guest_check_limit')";
export async function readGuestSettings(db){
 const row=await db.prepare("SELECT integer_value AS limitValue,revision,updated_at AS updatedAt FROM guardian_service_settings WHERE setting_key='guest_check_limit'").first();
 if(!Number.isInteger(row?.limitValue)||row.limitValue<1||row.limitValue>10||!Number.isSafeInteger(row.revision)||row.revision<1)throw Error('Guest settings unavailable.');
 return {limit:row.limitValue,revision:row.revision,updatedAt:row.updatedAt};
}
export async function updateGuestSettings(request,db,actor){
 if(!request.headers.get('content-type')?.startsWith('application/json'))return Response.json({error:'JSON is required.'},{status:415});
 const reader=request.body?.getReader();if(!reader)return Response.json({error:'Provide a guest check limit.'},{status:400});
 let raw='',size=0;
 try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>256){await reader.cancel();return Response.json({error:'Request too large.'},{status:413});}raw+=new TextDecoder('utf-8',{fatal:true}).decode(part.value,{stream:true});}
 const input=JSON.parse(raw);
 if(!input||Array.isArray(input)||Object.keys(input).length!==2||!Number.isInteger(input.limit)||input.limit<1||input.limit>10||!Number.isSafeInteger(input.revision)||input.revision<1)throw Error();
 const row=await db.prepare("UPDATE guardian_service_settings SET integer_value=?,revision=revision+1,updated_at=?,updated_by=? WHERE setting_key='guest_check_limit' AND revision=? RETURNING integer_value AS limitValue,revision,updated_at AS updatedAt").bind(input.limit,new Date().toISOString(),actor,input.revision).first();
 if(!row)return Response.json({error:'The allowance changed. Refresh before saving again.'},{status:409});
 return Response.json({limit:row.limitValue,revision:row.revision,updatedAt:row.updatedAt});
 }catch{return Response.json({error:'Choose a whole number from 1 to 10 and the current revision.'},{status:400});}
 finally{reader.releaseLock();}
}

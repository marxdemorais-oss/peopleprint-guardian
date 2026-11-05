// Bounded operational metadata only. Message bodies, routing identifiers,
// credentials and provider response text never belong in this overview.
const channels=new Set(['email','whatsapp','messenger','instagram','sms','x']);
const states=new Set(['queued','waiting_link','processing','reply_pending','sending','completed','failed','uncertain','expired','cancelled']);
const errors=new Set(['DELIVERY_UNCERTAIN','DELIVERY_INTERRUPTED','MESSAGE_PROCESSING_FAILED','PROVIDER_RATE_LIMIT','X_TOKEN_REFRESHING','X_PROVIDER_UNAVAILABLE','X_RECONNECT_REQUIRED','X_NOT_CONNECTED','CONTACT_TEMPORARILY_UNAVAILABLE','CHECK_IN_PROGRESS','CHECK_CHANGED','ANALYSIS_NOT_CONFIGURED','ANALYSIS_UNAVAILABLE']);
const invalid=()=>Object.assign(new Error('Choose a valid message filter or refresh the page.'),{status:400});
const id=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,160}$/.test(value);
const integer=value=>Number.isSafeInteger(value)&&value>=0;
const day=86400000;
export async function readMessageActivity(db,params,{now=Date.now()}={}){
 for(const key of ['channel','state','cursor'])if(params.getAll(key).length>1)throw invalid();
 const channel=params.get('channel')||'',state=params.get('state')||'',raw=params.get('cursor');
 if(channel&&!channels.has(channel)||state&&!states.has(state)||raw&&raw.length>1000)throw invalid();
 let asOf=now,page=null;
 if(raw){try{
  page=JSON.parse(atob(raw));
  if(!page||!integer(page.asOf)||page.asOf>now+1000||page.asOf<now-day||!integer(page.createdAt)||page.createdAt>page.asOf||!id(page.id)||page.channel!==channel||page.state!==state)throw Error();
  asOf=page.asOf;
 }catch{throw invalid();}}
 const where=['j.created_at>=?','j.created_at<=?','j.expires_at>?'],args=[asOf-day,asOf,now];
 if(channel){where.push('j.channel=?');args.push(channel);}
 if(state){where.push('j.state=?');args.push(state);}
 if(page){where.push('(j.created_at,j.id)<(?,?)');args.push(page.createdAt,page.id);}
 const rows=(await db.prepare(`SELECT j.id,j.channel,j.state,j.attempts,j.last_error,j.created_at,j.received_at,j.updated_at,j.expires_at,p.id AS customer_id
 FROM guardian_message_jobs j LEFT JOIN guardian_profiles p ON p.owner_id=j.owner_id
 WHERE ${where.join(' AND ')} ORDER BY j.created_at DESC,j.id DESC LIMIT 41`).bind(...args).all()).results||[];
 const selected=rows.slice(0,40),last=selected.at(-1);
 return {messages:selected.map(row=>({id:row.id,channel:channels.has(row.channel)?row.channel:'unknown',state:states.has(row.state)?row.state:'unknown',attempts:Math.min(Math.max(Number(row.attempts)||0,0),100),error:row.last_error?(errors.has(row.last_error)?row.last_error:'MESSAGE_ACTION_FAILED'):null,customerId:id(row.customer_id)?row.customer_id:null,receivedAt:row.received_at,updatedAt:row.updated_at,expiresAt:row.expires_at})),
  next:rows.length>40?btoa(JSON.stringify({asOf,createdAt:last.created_at,id:last.id,channel,state})):null,asOf:new Date(asOf).toISOString(),lookbackHours:24,limit:40,readOnly:true};
}

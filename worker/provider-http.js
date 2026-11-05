// Shared server-only transport. Never follow a credential-bearing redirect or
// let a stalled/oversized body escape the request's deadline and memory bound.
export async function requestProviderBytes(url,init,{fetcher=fetch,signal,timeoutMs=25000,maxBytes=128000,contentType}={}){
  const controller=new AbortController();
  const cancel=()=>controller.abort(signal.reason);
  const timeout=typeof AbortSignal.timeout==='function'?AbortSignal.timeout(timeoutMs):null;
  const expire=()=>controller.abort(timeout?.reason||new DOMException('Provider deadline exceeded','TimeoutError'));
  const timer=timeout?null:setTimeout(expire,timeoutMs);
  timeout?.addEventListener('abort',expire,{once:true});
  signal?.addEventListener('abort',cancel,{once:true});
  try{
    if(signal?.aborted)cancel();
    return await readProviderResponse(url,init,fetcher,controller.signal,maxBytes,contentType);
  }finally{
    if(timer!==null)clearTimeout(timer);
    timeout?.removeEventListener('abort',expire);
    signal?.removeEventListener('abort',cancel);
  }
}

async function readProviderResponse(url,init,fetcher,combined,maxBytes,contentType){
  if(combined.aborted)throw combined.reason;
  const response=await withAbort(async()=>{const result=await fetcher(url,{...init,redirect:'manual',signal:combined});if(combined.aborted){void result.body?.cancel().catch(()=>{});throw combined.reason;}return result;},combined);
  const failure=(message,code)=>Object.assign(new Error(message),{code,providerStatus:response.status});
  if(response.status>=300&&response.status<400){void response.body?.cancel().catch(()=>{});throw failure('The provider redirected the request.','PROVIDER_REDIRECT');}
  if(!response.ok||(contentType&&!response.headers.get('content-type')?.startsWith(contentType))){void response.body?.cancel().catch(()=>{});throw failure('The provider could not complete this request.',response.ok?'PROVIDER_INVALID_RESPONSE':'PROVIDER_REJECTED');}
  if(Number(response.headers.get('content-length')||0)>maxBytes){void response.body?.cancel().catch(()=>{});throw failure('The provider returned too much data.','PROVIDER_TOO_LARGE');}
  const reader=response.body?.getReader();
  if(!reader)throw failure('The provider returned an empty response.','PROVIDER_INVALID_RESPONSE');
  const chunks=[];let length=0;
  try{
    while(true){
      const {done,value}=await withAbort(()=>reader.read(),combined);if(done)break;
      length+=value.byteLength;if(length>maxBytes)throw failure('The provider returned too much data.','PROVIDER_TOO_LARGE');
      chunks.push(value);
    }
  }catch(error){void reader.cancel().catch(()=>{});throw error;}
  finally{reader.releaseLock();}
  if(!length)throw failure('The provider returned an empty response.','PROVIDER_INVALID_RESPONSE');
  const bytes=new Uint8Array(length);let offset=0;
  for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}
  return bytes;
}

async function withAbort(operation,signal){
  if(signal.aborted)throw signal.reason;
  let abort;
  const cancelled=new Promise((resolve,reject)=>{abort=()=>reject(signal.reason);signal.addEventListener('abort',abort,{once:true});});
  try{return await Promise.race([operation(),cancelled]);}
  finally{signal.removeEventListener('abort',abort);}
}

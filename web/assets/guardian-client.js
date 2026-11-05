import {validateInvestigation,validateAssessment} from './guardian-contract.js';
import {wolfgangBridge} from './wolfgang-bridge.js';
let requestSequence=0;
const freshRequestId=()=>typeof crypto!=='undefined'&&crypto.randomUUID?'assessment-'+crypto.randomUUID():'assessment-'+Date.now().toString(36)+'-'+(++requestSequence);
function checkAbort(signal){if(signal?.aborted)throw new DOMException('The check was cancelled.','AbortError');}
// fetcher and bridge are injectable for transport tests. The production endpoint
// stays same-origin and the body contains only the validated investigation.
export async function requestAssessment(input,{signal,fetcher=fetch,bridge=wolfgangBridge}={}){
  const payload=validateInvestigation(input);
  checkAbort(signal);
  const requestId=freshRequestId();
  if(!bridge.begin(requestId))throw new Error('The check could not start.');
  const onAbort=()=>bridge.cancel(requestId);
  signal?.addEventListener('abort',onAbort,{once:true});
  try{
    const response=await fetcher('/api/investigations/assess',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal});
    const data=await response.json();if(!response.ok){const error=new Error(data.message||'The check could not finish. No assessment has been made.');error.code=data.code;throw error;}
    checkAbort(signal);
    const result=validateAssessment(data.result,payload.evidence);
    if(!bridge.complete(requestId,result))throw new DOMException('A newer check or edited context replaced this result.','AbortError');
    return result;
  }catch(error){
    if(error.name==='AbortError'||signal?.aborted)bridge.cancel(requestId);else bridge.fail(requestId);
    throw error;
  }finally{signal?.removeEventListener('abort',onAbort);}
}

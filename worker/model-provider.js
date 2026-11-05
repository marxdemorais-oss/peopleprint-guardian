// Server-only provider adapter. Provider credentials and endpoint settings never
// come from an assessment request or appear in the public configuration response.
import {requestProviderBytes} from './provider-http.js';
import {chooseCaseModel,WONDER_STANDARD} from './case-reasoning.js';
const GUARDIAN_PROVIDER_DEFAULTS={
  baseten:{url:'https://inference.baseten.co/v1/chat/completions',format:'chat-completions',label:'Baseten'},
  fireworks:{url:'https://api.fireworks.ai/inference/v1/chat/completions',format:'chat-completions',label:'Fireworks'},
  meta:{url:'https://api.meta.ai/v1/responses',format:'responses',label:'Meta'},
  modal:{url:'',format:'chat-completions',label:'Modal'},
  custom:{url:'',format:'chat-completions',label:'Configured provider'}
};
const setting=value=>typeof value==='string'?value.trim():'';
const configurationError=code=>Object.assign(new Error('The analysis provider configuration is incomplete or invalid.'),{code});
function boundedSetting(value,fallback,min,max,errors,name){
  if(value===undefined||value==='')return fallback;
  const parsed=Number(value);
  if(!Number.isSafeInteger(parsed)||parsed<min||parsed>max){errors.push(name);return fallback;}
  return parsed;
}

export function analysisSettings(env={}){
  // Legacy conversation settings are a complete configuration group. Never pair
  // one provider's key with a different group's URL or model by accident.
  const guardian=['PROVIDER','API_URL','API_FORMAT','API_KEY','MODEL'].some(name=>setting(env['GUARDIAN_'+name]));
  const prefix=guardian?'GUARDIAN_':'WOLFGANG_';
  const explicitUrl=setting(env[prefix+'API_URL']);
  let legacyProvider;
  if(!guardian&&explicitUrl){try{const origin=new URL(explicitUrl).origin;legacyProvider=Object.keys(GUARDIAN_PROVIDER_DEFAULTS).find(name=>GUARDIAN_PROVIDER_DEFAULTS[name].url&&new URL(GUARDIAN_PROVIDER_DEFAULTS[name].url).origin===origin);}catch{}}
  const provider=setting(env.GUARDIAN_PROVIDER)||legacyProvider||(explicitUrl?'custom':'meta');
  const defaults=GUARDIAN_PROVIDER_DEFAULTS[provider];
  const errors=[];
  if(!defaults)errors.push('unsupported_provider');
  const format=setting(env[prefix+'API_FORMAT'])||(guardian?defaults?.format:'responses')||'';
  const defaultUrl=defaults?.url?.replace(/\/(?:chat\/completions|responses)$/,'/'+(format==='responses'?'responses':'chat/completions'))||'';
  const url=explicitUrl||defaultUrl;
  const key=setting(env[prefix+'API_KEY']),model=setting(env[prefix+'MODEL']);
  if(!key||key.length>8192||/\s/.test(key))errors.push('api_key');
  if(!model||model.length>256||/[\s\x00-\x1f\x7f]/.test(model))errors.push('model');
  // Assessment input can include private statements and prior records on every
  // turn. Only the public conversation may choose a Contributor model after
  // replacing the original input with a recognised general-purpose prompt.
  if(/(?:^|[-/._:])contributor(?:$|[-/._:])/i.test(model))errors.push('private_model_required');
  if(!['responses','chat-completions'].includes(format))errors.push('api_format');
  const allowed=new Set(defaults?.url?[new URL(defaults.url).origin]:[]);
  for(const item of String(env.GUARDIAN_ALLOWED_API_ORIGINS||'').split(',')){
    if(!item.trim())continue;
    try{
      const candidate=new URL(item.trim());
      if(candidate.protocol!=='https:'||candidate.username||candidate.password||candidate.pathname!=='/'||candidate.search||candidate.hash)throw new Error();
      allowed.add(candidate.origin);
    }catch{errors.push('allowed_api_origins');}
  }
  let validEndpoint=false;
  try{const endpoint=new URL(url);validEndpoint=endpoint.protocol==='https:'&&!endpoint.username&&!endpoint.password&&!endpoint.hash&&!endpoint.search&&allowed.has(endpoint.origin);}catch{}
  if(!validEndpoint)errors.push('api_url');
  const maxInputBytes=boundedSetting(env.GUARDIAN_MAX_INPUT_BYTES,300000,1000,300000,errors,'max_input_bytes');
  const maxOutputTokens=boundedSetting(env.GUARDIAN_MAX_OUTPUT_TOKENS,1800,64,4096,errors,'max_output_tokens');
  // Baseten explicitly excludes Muse Spark Open from JSON mode. Modal/custom
  // endpoints have model-specific capabilities, so JSON mode is opt-in there.
  const jsonDefault=(provider==='fireworks'||(provider==='baseten'&&!/muse-spark-open/i.test(model)))?'json_object':'off';
  const jsonMode=setting(env.GUARDIAN_JSON_MODE)||jsonDefault;
  if(!['off','json_object'].includes(jsonMode))errors.push('json_mode');
  return {configured:errors.length===0,configurationErrors:errors,provider,label:defaults?.label||null,url,format,key,model,maxInputBytes,maxOutputTokens,jsonMode};
}

export function publicAnalysisSettings(env={}){
  const settings=analysisSettings(env);
  return {analysisReady:settings.configured,provider:settings.configured?settings.label:null};
}

export function createAnalysisProvider(env,{fetcher=fetch,timeoutMs=25000,onUsage,onEvent}={}){
  const settings=analysisSettings(env);
  if(!settings.configured)return null;
  return {async generate({instructions,input,signal,outputTokenLimit,requestTimeoutMs=timeoutMs}){
    if(typeof instructions!=='string'||!instructions.trim())throw configurationError('MODEL_INSTRUCTIONS_REQUIRED');
    const serialized=JSON.stringify(input);
    if(typeof serialized!=='string')throw configurationError('MODEL_INPUT_REQUIRED');
    if(new TextEncoder().encode(instructions+serialized).byteLength>settings.maxInputBytes)throw new Error('This check contains too much material for the configured analysis limit.');
    signal?.throwIfAborted();
    const model=chooseCaseModel(settings,env,input);
    const tokenLimit=Number.isSafeInteger(outputTokenLimit)&&outputTokenLimit>0?Math.min(outputTokenLimit,settings.maxOutputTokens):settings.maxOutputTokens;
    // Spark's implicit reasoning setting can exhaust the entire output budget
    // before it emits a short answer. Budget reasoning explicitly, as chat does.
    // Keep the existing total token cap and the stronger-model routing intact.
    const sparkEffort=settings.provider==='meta'&&model==='muse-spark-1.3'?'low':null;
    const payload=settings.format==='responses'
      ?{model,instructions,...(sparkEffort?{reasoning:{effort:sparkEffort}}:{}),input:[{role:'user',content:serialized}],max_output_tokens:tokenLimit,store:false}
      :{model,messages:[{role:'system',content:instructions},{role:'user',content:serialized}],max_tokens:tokenLimit,...(sparkEffort?{reasoning_effort:sparkEffort}:{}),...(settings.jsonMode==='json_object'?{response_format:{type:'json_object'}}:{})};
    let data;
    await onEvent?.('model_requested',{summary:'Requesting a response from the configured private analysis model.',provider:settings.label,model,instructions,input,outputTokenLimit:tokenLimit});
    try{
      const bytes=await requestProviderBytes(settings.url,{method:'POST',headers:{Authorization:'Bearer '+settings.key,'Content-Type':'application/json'},body:JSON.stringify(payload)},{fetcher,signal,timeoutMs:requestTimeoutMs});
      try{data=JSON.parse(new TextDecoder().decode(bytes));}catch{throw new Error('The analysis provider returned an invalid response.');}
    }finally{
      const token=value=>Number.isSafeInteger(value)&&value>=0?value:null;
      if(onUsage)await onUsage({provider:settings.provider,model,inputTokens:token(data?.usage?.input_tokens??data?.usage?.prompt_tokens),outputTokens:token(data?.usage?.output_tokens??data?.usage?.completion_tokens)});
    }
    if(model===WONDER_STANDARD&&data?.model!==model)throw new Error('The analysis provider did not confirm the requested model.');
    let content;
    if(settings.format==='responses'){
      if(data?.status!=='completed'||!Array.isArray(data.output)||data.output.some(item=>item?.type==='function_call'))throw new Error('The analysis provider returned an incomplete response.');
      content=data.output.filter(item=>item?.type==='message'&&item.phase!=='commentary').flatMap(item=>Array.isArray(item.content)?item.content:[]).filter(item=>item?.type==='output_text').map(item=>item.text).join('');
    }else{
      if(data?.choices?.[0]?.finish_reason!=='stop'||data.choices[0].message?.tool_calls?.length)throw new Error('The analysis provider returned an incomplete response.');
      content=data.choices[0].message?.content;
    }
    if(typeof content!=='string'||!content.trim()||content.length>20000)throw new Error('The analysis provider returned no usable assessment.');
    let assessment;try{assessment=JSON.parse(content);}catch{throw new Error('The analysis provider returned an invalid assessment.');}
    if(!assessment||typeof assessment!=='object'||Array.isArray(assessment))throw new Error('The analysis provider returned no usable assessment.');
    await onEvent?.('model_returned',{summary:'The provider returned a complete structured response.',provider:settings.label,model,response:assessment,usage:data.usage||null});
    return assessment;
  }};
}

import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {contextCases} from '../evaluation/context-cases.js';
import {validateCases,evaluateCase} from '../evaluation/runner.js';
import {analysisSettings} from '../worker/model-provider.js';

export function argumentsFor(args){
 const options={live:false,limit:1,caseId:null,stdin:false};
 for(let i=0;i<args.length;i++){
  if(args[i]==='--live')options.live=true;
  else if(args[i]==='--config-stdin')options.stdin=true;
  else if(args[i]==='--limit'){const n=args[++i];if(!/^\d+$/.test(n||'')||Number(n)<1||Number(n)>contextCases.length)throw Error('Use a limit from 1 to '+contextCases.length+'.');options.limit=Number(n);}
  else if(args[i]==='--case'){options.caseId=args[++i];if(!contextCases.some(item=>item.id===options.caseId))throw Error('Unknown evaluation case.');}
  else throw Error('Unknown option. Use --live, --limit N, --case ID or --config-stdin.');
 }
 if(options.stdin&&!options.live)throw Error('--config-stdin requires --live. Dry runs read no credentials.');
 return options;
}
async function readConfiguration(input){
 let text='';for await(const chunk of input){text+=chunk;if(Buffer.byteLength(text)>20000)throw Error('Configuration is too large.');}
 let config;try{config=JSON.parse(text);}catch{throw Error('Configuration must be a JSON object.');}
 if(!config||Array.isArray(config)||typeof config!=='object'||Object.entries(config).some(([key,value])=>!/^GUARDIAN_[A-Z_]+$/.test(key)||typeof value!=='string'))throw Error('Use string Guardian configuration fields only.');
 return config;
}
export async function main(args,{env=process.env,input=process.stdin,write=line=>console.log(line),fetcher}={}){
 const options=argumentsFor(args),validated=validateCases();
 if(!options.live){write(JSON.stringify({mode:'offline-validation',...validated,providerCalls:0,qualityMeasured:false}));return 0;}
 const config=options.stdin?await readConfiguration(input):env;
 const settings=analysisSettings(config);if(!settings.configured)throw Error('One complete Guardian provider configuration is required. Values have not been printed.');
 const cases=(options.caseId?contextCases.filter(item=>item.id===options.caseId):contextCases).slice(0,options.limit);
 write(JSON.stringify({mode:'live-synthetic-evaluation',provider:settings.provider,model:settings.model,plannedCalls:cases.length,humanReviewRequired:true}));
 let failed=0;
 for(const item of cases){const result=await evaluateCase(item,config,{fetcher});write(JSON.stringify(result));if(!result.minimumChecksPassed)failed++;}
 write(JSON.stringify({completed:cases.length,failedMinimumChecks:failed,qualityMeasured:false,note:'Minimum checks are not an accuracy score. Review each answer and paired evidence variants before choosing a model.'}));
 return failed?1:0;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 try{process.exitCode=await main(process.argv.slice(2));}catch{console.error('Evaluation could not run. Check the options and complete server configuration; no credentials or provider error body are printed.');process.exitCode=1;}
}

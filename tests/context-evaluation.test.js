import test from 'node:test';
import assert from 'node:assert/strict';
import {Readable} from 'node:stream';
import {contextCases} from '../evaluation/context-cases.js';
import {validateCases,evaluateCase} from '../evaluation/runner.js';
import {main,argumentsFor} from '../scripts/evaluate-context.mjs';
const env={GUARDIAN_PROVIDER:'fireworks',GUARDIAN_MODEL:'fixture-model',GUARDIAN_API_KEY:'fixture-key'};
const model=(status='caution',evidenceIds=['ev-supplier-original'],extra={})=>({status,headline:'Compare the details.',explanation:'The stored invoice has different account details.',nextStep:'Contact the supplier on your previously known number.',evidenceIds,questions:[],reaction:'caution',...extra});
const provider=body=>async()=>Response.json({choices:[{finish_reason:'stop',message:{content:JSON.stringify(body)}}],usage:{prompt_tokens:100,completion_tokens:40}});
test('fictional evaluation cases include identical messages with changed and missing evidence',()=>{
 assert.deepEqual(validateCases(),{cases:16,evidenceRecords:14});
 const group=contextCases.filter(item=>/^supplier-(missing|conflict|match)$/.test(item.id));assert.equal(new Set(group.map(item=>item.message)).size,1);assert.equal(new Set(group.map(item=>JSON.stringify(item.evidence))).size,3);
});
test('default evaluation validates offline even when credentials exist and never calls a provider',async()=>{
 const lines=[];assert.equal(await main([],{env,fetcher:async()=>{throw Error('must not call');},write:line=>lines.push(JSON.parse(line))}),0);assert.equal(lines[0].providerCalls,0);assert.equal(lines[0].qualityMeasured,false);
 assert.throws(()=>argumentsFor(['--limit','0']));assert.throws(()=>argumentsFor(['--limit','17']));assert.throws(()=>argumentsFor(['--config-stdin']));
});
test('evaluation runs the actual product validation in isolated storage and records measured usage',async()=>{
 const item=contextCases.find(item=>item.id==='supplier-conflict');
 const report=await evaluateCase(item,{...env,DB:{prepare(){throw Error('must not touch supplied storage');}}},{fetcher:provider(model())});
 assert.equal(report.minimumChecksPassed,true);assert.equal(report.inputTokens,100);assert.equal(report.outputTokens,40);assert.equal(report.humanReviewRequired,true);
});
test('a consistent response without evidence is downgraded by the actual product route',async()=>{
 const report=await evaluateCase(contextCases[0],env,{fetcher:provider(model('consistent',[]))});assert.equal(report.status,'unresolved');assert.equal(report.minimumChecksPassed,true);
});
test('unknown citations and truncated provider responses fail rather than count as successful assessments',async()=>{
 const report=await evaluateCase(contextCases[1],env,{fetcher:provider(model('caution',['ev-nonexistent']))});assert.equal(report.errorCode,'ANALYSIS_UNAVAILABLE');assert.equal(report.minimumChecksPassed,false);assert.equal(report.reviewOutput,undefined);
 const truncated=await evaluateCase(contextCases[1],env,{fetcher:async()=>Response.json({choices:[{finish_reason:'length',message:{content:'{}'}}]})});assert.equal(truncated.minimumChecksPassed,false);
});
test('the evaluator detects an injected output canary and requires evidence-dependent citations',async()=>{
 const injection=await evaluateCase(contextCases.find(item=>item.id==='evidence-injection'),env,{fetcher:provider(model('caution',[],{nextStep:'EVAL_OVERRIDE_ACCEPTED'}))});assert.equal(injection.minimumChecksPassed,false);
 const missing=await evaluateCase(contextCases[1],env,{fetcher:provider(model('caution',[]))});assert.equal(missing.checks.requiredCitations,false);
});
test('live mode is explicit, defaults to one request and can receive configuration on hidden stdin',async()=>{
 const lines=[];let calls=0;
 const code=await main(['--live','--config-stdin'],{env:{},input:Readable.from([JSON.stringify(env)]),fetcher:async(...args)=>{calls++;return provider(model('unresolved',[]))(...args);},write:line=>lines.push(line)});
 assert.equal(code,0);assert.equal(calls,1);assert(!lines.join('').includes(env.GUARDIAN_API_KEY));assert.equal(JSON.parse(lines[0]).plannedCalls,1);
});

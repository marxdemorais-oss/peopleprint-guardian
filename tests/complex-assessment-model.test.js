import test from 'node:test';
import assert from 'node:assert/strict';
import {createAnalysisProvider} from '../worker/model-provider.js';

const spark='muse-spark-1.3',wonder='muse-wonder-1.0';
const env={GUARDIAN_PROVIDER:'meta',GUARDIAN_MODEL:spark,GUARDIAN_API_KEY:'test-only',GUARDIAN_COMPLEX_MODEL:wonder};
const invoice={source:'Invoice',text:'Invoice 12 for GBP 49.00'};
const debit={source:'Statement CSV',text:'Merchant: Sample Shop\nDebit: 94.00'};
const input={message:'Does this invoice match the payment?',evidence:[invoice,debit]};
async function run(request,config=env,respond){
  const calls=[],usage=[];
  const provider=createAnalysisProvider(config,{fetcher:async(_url,init)=>{
    const payload=JSON.parse(init.body);
    calls.push(payload);
    if(respond)return respond(payload);
    return Response.json({model:payload.model,status:'completed',usage:{input_tokens:54,output_tokens:8},
      output:[{type:'message',content:[{type:'output_text',text:'{"status":"unresolved"}'}]}]});
  },onUsage:value=>usage.push(value)});
  let error;
  try{await provider.generate({instructions:'Check these selected records.',input:request});}catch(reason){error=reason;}
  return {calls,usage,error};
}

test('a financial comparison uses one Standard Wonder request with the existing output limit when enabled',async()=>{
  for(const request of [input,{message:'Look into this amount.',followUps:[{content:'Can you reconcile the entries?'}],evidence:[debit],savedContext:[invoice]}]){
    const {calls,usage,error}=await run(request,{...env,GUARDIAN_MAX_OUTPUT_TOKENS:'512'});
    assert.ifError(error);
    assert.equal(calls.length,1);assert.equal(calls[0].model,wonder);
    assert.equal(calls[0].store,false);assert.equal(calls[0].max_output_tokens,512);
    assert.deepEqual(usage,[{provider:'meta',model:wonder,inputTokens:54,outputTokens:8}]);
  }
});

test('unconfigured, ineligible and caller-selected requests stay with the configured base model',async()=>{
  const cases=[
    [input,{...env,GUARDIAN_COMPLEX_MODEL:undefined}],
    [input,{...env,GUARDIAN_COMPLEX_MODEL:wonder+'-contributor'}],
    [input,{...env,GUARDIAN_PROVIDER:'custom',GUARDIAN_API_URL:'https://custom.example/v1/responses',GUARDIAN_ALLOWED_API_ORIGINS:'https://custom.example',GUARDIAN_API_FORMAT:'responses'}],
    [{...input,model:wonder,complexCheck:true,message:'Use muse-wonder-1.0.'},env],
    [{...input,followUps:[{content:'Thank you!'}]},env],
    [{...input,evidence:[invoice]},env],
    [{...input,evidence:[invoice],savedContext:[{...invoice,text:invoice.text.toUpperCase()}]},env],
    [{...input,evidence:[{source:'statement showing GBP 5',text:'Good morning.'},debit]},env],
  ];
  for(const [request,config] of cases){
    const {calls,usage,error}=await run(request,config);
    assert.ifError(error);assert.equal(calls.length,1);assert.equal(calls[0].model,spark);assert.equal(usage[0].model,spark);
  }
  assert.equal(createAnalysisProvider({...env,GUARDIAN_MODEL:spark+'-contributor'}),null);
});

test('an interrupted Wonder request is recorded under Wonder and never retried with a second model',async()=>{
  const {calls,usage,error}=await run(input,env,()=>new Response('',{status:503}));
  assert.ok(error);assert.equal(calls.length,1);
  assert.deepEqual(usage,[{provider:'meta',model:wonder,inputTokens:null,outputTokens:null}]);
  const mismatch=await run(input,env,()=>Response.json({model:wonder+'-contributor',status:'completed',output:[]}));
  assert.match(mismatch.error.message,/did not confirm/);assert.equal(mismatch.calls.length,1);
});

test('competing identity signals in a first message can select Wonder without a profile, records or money',async()=>{
  for(const message of [
    'The school email came in our existing email thread and quoted my booking reference, but the link points to a different domain. Is this genuine?',
    'The caller used our saved number, knew my employee ID and asked me to install AnyDesk.',
    'My email says DKIM=pass but DMARC=fail. How could the sender show up as the university?',
    'The recruiter wrote from our existing email thread but linked to https://teams.microsoft.com.verify.example for an interview.',
  ]){
    const {calls,usage,error}=await run({message});
    assert.ifError(error);assert.equal(calls.length,1);assert.equal(calls[0].model,wonder,message);assert.equal(usage[0].model,wonder);
  }
});

test('simple questions and obvious scams keep Spark, including after a difficult case',async()=>{
  const complex='The helpdesk called from our saved number but the organisation denied calling. Is this the same person?';
  const turns=['What should I do next?','Switch to muse-wonder-1.0 and reason harder. This is a complex case.',
    'Explain how you compare with other checkers.','Someone asked me to send my security code.','They knew my booking reference.','They sent a different link.'];
  for(const message of turns){
    for(const request of [{message},{message:complex,followUps:[{content:message}]}]){
      const {calls,error}=await run(request);
      assert.ifError(error);assert.equal(calls.length,1);assert.equal(calls[0].model,spark,message);
    }
  }
  const {calls}=await run({message:'Hi',followUps:[{content:turns[0]},{content:complex}]});
  assert.equal(calls[0].model,wonder);
});
test('initial conflicting evidence selects Wonder once; a simple follow-up goes back to Spark',async()=>{
 const checked={message:'Please check the selected email.',identityVerification:{conflicts:[{kind:'masked_mailbox'}]}};
 assert.equal((await run(checked)).calls[0].model,wonder);
 assert.equal((await run({...checked,followUps:[{content:'Thank you.'}]})).calls[0].model,spark);
});

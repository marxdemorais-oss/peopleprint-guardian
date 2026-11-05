import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {selectPublicClaim,researchPublicClaim,recheckExampleReference} from '../worker/public-claim-research.js';
import {officialResearchUrl} from '../web/assets/public-research-sources.js';

const plan={publisher:'dvla',topic:'refund'};
const url='https://www.gov.uk/government/news/vehicle-tax-refunds';
const quote='DVLA never asks people to claim a refund through a text message.';
const model='muse-spark-1.3-contributor';
const env={GUARDIAN_PROVIDER:'meta',GUARDIAN_MODEL:'muse-spark-1.3',GUARDIAN_API_KEY:'test-secret'};
const page=()=>new Response('<head><meta name="govuk:primary-publishing-organisation" content="Driver and Vehicle Licensing Agency"></head><main><h1>How DVLA contacts motorists</h1><p>'+quote+'</p></main>',{headers:{'Content-Type':'text/html'}});
function setup({mutate,official=page,cap=40}={}){
  const calls=[],sql=new DatabaseSync(':memory:');
  sql.exec('CREATE TABLE guardian_rate_limits(bucket_key TEXT PRIMARY KEY,owner_id TEXT,count INTEGER,expires_at INTEGER)');
  const DB={prepare:q=>({bind:(...args)=>({first:async()=>sql.prepare(q).get(...args)})})};
  const fetcher=async(endpoint,init)=>{
    calls.push({url:endpoint,init});
    if(endpoint==='https://api.meta.ai/v1/responses'){
      const data={model,status:'completed',output:[
        {type:'web_search_call',status:'completed',results:[{type:'text_result',url,title:'Official policy'}]},
        {type:'message',content:[{type:'output_text',text:'“'+quote+'”',annotations:[{type:'url_citation',url}]}]}]};
      mutate?.(data);
      return Response.json(data);
    }
    return official();
  };
  const lookup=(options={})=>researchPublicClaim(plan,{...env,DB,GUARDIAN_RESEARCH_DAILY_LIMIT:cap},{fetcher,...options});
  return {calls,lookup,sql};
}

test('only public names and a canonical claim survive local matching; ambiguous requests abstain',()=>{
  assert.deepEqual(selectPublicClaim('Does DVLA really text about refunds? I am Paula, 123456. Email my.bank@evil.test'),plan);
  assert.deepEqual(selectPublicClaim('Do they send refund links?','An earlier message from DVLA'),plan);
  assert.deepEqual(selectPublicClaim('Barclays says a supplier changed their bank account'),{publisher:'barclays',topic:'invoice'});
  assert.equal(selectPublicClaim('DVLA and Companies House both emailed about a refund'),null);
  assert.equal(selectPublicClaim('Hi Karen, nice to meet you'),null);
  assert.equal(selectPublicClaim('Pay this private individual a fee'),null);
});
test('only a completed, cited official search plus the independently read passage earns a finding',async()=>{
  const {lookup,calls,sql}=setup();
  try{
    const result=await lookup();
    assert.equal(result.status,'published');assert.equal(result.quote,quote);assert.equal(result.url,url);assert.ok(result.checkedAt);
    assert.equal(calls.length,2);
    const payload=JSON.parse(calls[0].init.body);
    assert.equal(payload.model,model);assert.equal(payload.store,false);assert.equal(payload.tools[0].type,'web_search');
    assert.match(payload.input,/DVLA/);assert.doesNotMatch(payload.input,/Paula|123456|@|evil/);
    assert.equal(calls[1].init.method,'GET');assert.equal(calls[1].init.headers.Authorization,undefined);assert.equal(calls[1].init.redirect,'manual');
    assert.deepEqual(await lookup({previous:result}),result);assert.equal(calls.length,2);
  }finally{sql.close();}
});
for(const [label,mutate] of [
  ['missing search',d=>d.output.shift()],
  ['uncompleted search',d=>d.output[0].status='incomplete'],
  ['citation without matching retrieval',d=>d.output[0].results=[]],
  ['retrieval without citation',d=>d.output[1].content[0].annotations=[]],
  ['lookalike official domain',d=>{const fake='https://www.gov.uk.evil.test/guidance/refund';d.output[0].results[0].url=fake;d.output[1].content[0].annotations[0].url=fake;}],
  ['wrong responding model',d=>d.model='some-other-model'],
  ['a quote with the negation removed',d=>d.output[1].content[0].text=quote.replace('never ','')]
]){
 test('no verified finding for '+label,async()=>{
    const {lookup,sql,calls}=setup({mutate});try{assert.equal((await lookup()).status,'unverified');assert(!calls.some(c=>c.url.includes('evil.test')));}finally{sql.close();}
 });
}
for(const [label,official] of [
  ['credentialless fetch redirects',()=>new Response(null,{status:302,headers:{location:'https://evil.test/'}})],
  ['inert script posing as article',()=>new Response('<script>"<main><p>'+quote+'</p></main>"</script>',{headers:{'content-type':'text/html'}})],
  ['missing page',()=>new Response('gone',{status:404})],
  ['provider unavailable',()=>{throw new Error('network');}]
]){
 test(label+' does not become evidence',async()=>{const {lookup,sql}=setup({official});try{assert.equal((await lookup()).status,'unverified');}finally{sql.close();}});
}
test('public lookup budget is atomic across simultaneous checks and zero disables the feature',async()=>{
 const {lookup,calls,sql}=setup({cap:2});
 try{
  const outcomes=await Promise.all(Array.from({length:9},()=>lookup()));
  assert.equal(outcomes.filter(r=>r.status==='published').length,2);assert.equal(calls.length,4);
 }finally{sql.close();}
 const off=setup({cap:0});try{assert.equal(await off.lookup(),null);assert.equal(off.calls.length,0);}finally{off.sql.close();}
});
test('publisher URL policy allows only clean HTTPS editorial pages',()=>{
 for(const source of ['https://www.gov.uk@phish.test/guidance/a','https://www.gov.uk:81/guidance/a',
   'https://www.gov.uk/guidance/a?token=private','https://www.gov.uk/upload/a','https://www.gov.uk/guidance/%2f%2fevil.test',
   'http://www.gov.uk/guidance/a','javascript:alert(1)'])assert.equal(officialResearchUrl('dvla',source),null);
 assert.equal(officialResearchUrl('dvla',url+'?utm_source=example#anchor'),url);
 assert.equal(officialResearchUrl('constructor',url),null);
});
test('a mention, a raw snippet or quoted scam example cannot establish who published a policy',async()=>{
 const wrong='<head><meta name="govuk:primary-publishing-organisation" content="Companies House"></head><main><p>See also DVLA.</p><p>'+quote+'</p></main>';
 const author='<head><meta name="govuk:primary-publishing-organisation" content="Driver and Vehicle Licensing Agency"></head>';
 const embedded=author+'<main><blockquote>'+quote+'</blockquote></main>';
 for(const html of [wrong,embedded]){
   const f=setup({official:()=>new Response(html,{headers:{'content-type':'text/html'}})});
   try{assert.equal((await f.lookup()).status,'unverified');}finally{f.sql.close();}
 }
 const f=setup({mutate:d=>{d.output[0].results[0].snippet=quote;d.output[1].content[0].text='I could not verify this claim.';}});
 try{assert.equal((await f.lookup()).status,'unverified');}finally{f.sql.close();}
});

test('structured evidence pairs still require a completed hit, correct publisher and verbatim independent passage',async()=>{
 const structured=(source,text)=>d=>{
  d.output[1].content[0]={type:'output_text',text:JSON.stringify({source_url:source,quote:text})};
 };
 for(const [uri,text,expected] of [[url,quote,'published'],[url+'/',quote,'published'],[url+'/unrelated',quote,'unverified'],[url,quote.replace('never ','always '),'unverified'],[url,'','unverified']]){
  const f=setup({mutate:structured(uri,text)});
  try{const result=await f.lookup();assert.equal(result.status,expected);assert.equal(JSON.parse(f.calls[0].init.body).max_tool_calls,2);assert(!f.calls.some(c=>c.url.endsWith('/unrelated')));}finally{f.sql.close();}
 }
});
test('fixed tour fallback needs the exact reviewed page among search hits and its current visible wording',async()=>{
 const known='https://www.takefive-stopfraud.org.uk/protect-yourself/invoice-and-mandate/';
 const text="Always confirm the service provider's bank details directly with the company before you make a payment.";
 const DB={prepare:()=>({bind:()=>({first:async()=>({count:1})})})};
 for(const [hit,visible,expected] of [[known,text,'published'],[known,'A page with different guidance.','unverified'],[known+'unknown',text,'unverified']]){
   const fetcher=async endpoint=>endpoint===known?new Response('<main><p>'+visible+'</p></main>',{headers:{'content-type':'text/html'}}):Response.json({model,status:'completed',output:[{type:'web_search_call',status:'completed',results:[{url:hit}]},{type:'message',content:[{type:'output_text',text:'{"source_url":"","quote":""}'}]}]});
   const result=await researchPublicClaim({publisher:'takeFive',topic:'invoice'},{...env,DB},{fetcher});
   assert.equal(result.status,expected);
   if(result.status==='published')assert.equal(result.method,'reviewed_passage');
 }
});

test('the known fictional source reuses one independent page read across concurrent visitors without inference',async()=>{
 const quote="Always confirm the service provider's bank details directly with the company before you make a payment.";
 const now=Date.UTC(2026,10,4,18),urls=[];
 const fetcher=async(url,init)=>{urls.push(url);assert.equal(init.headers.Authorization,undefined);return new Response('<main><p>'+quote+'</p></main>',{headers:{'content-type':'text/html'}});};
 const results=await Promise.all(Array.from({length:8},()=>recheckExampleReference({fetcher,now})));
 assert.equal(urls.length,1);assert.equal(results[0].method,'direct_official_page');assert.equal(results[0].checkedAt,new Date(now).toISOString());
 assert.equal((await recheckExampleReference({fetcher,now:now+1000})).checkedAt,results[0].checkedAt);
 assert.equal(urls.length,1);
 const changed=async()=>new Response('<main><p>Old policy removed.</p></main>',{headers:{'content-type':'text/html'}});
 assert.equal(await recheckExampleReference({fetcher:changed,now}),null);
});

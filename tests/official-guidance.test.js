import test from 'node:test';
import assert from 'node:assert/strict';
import {readOfficialGuidance} from '../worker/official-guidance.js';
import {guidanceSources} from '../web/assets/official-guidance.js';

test('trusted guidance fetches a fixed URL with no user fields or secrets and validates the text', async()=>{
  const now=Date.UTC(2026,10,3);
  const expected=guidanceSources.verificationCode.url;
  const reference=await readOfficialGuidance('verificationCode',{now,fetcher:async(url,init)=>{
    assert.equal(url,expected);
    assert.equal(init.method,'GET');assert.equal(init.redirect,'manual');assert.equal(init.body,undefined);
    assert.deepEqual(init.headers,{Accept:'text/html'});
    return new Response('<p>Never give your <b>verification code</b> to someone else.</p>',{headers:{'Content-Type':'text/html; charset=utf-8'}});
  }});
  assert.deepEqual(reference,{topic:'verificationCode',checkedAt:new Date(now).toISOString()});
});

test('outage, misleading content and redirects cannot become live citations', async()=>{
  for(const get of [()=>{throw new Error('Offline');},()=>new Response(null,{status:302,headers:{Location:'https://other.invalid'}}),()=>new Response('<script>never give your verification code to someone else</script><p>Changed</p>',{headers:{'content-type':'text/html'}})]){
    const result=await readOfficialGuidance('verificationCode',{fetcher:get});
    assert.deepEqual(result,{topic:'verificationCode',checkedAt:null});
  }
  assert.equal(await readOfficialGuidance('https://phish.invalid/q?private=1',{fetcher:()=>assert.fail('unknown source fetched')}),null);
});

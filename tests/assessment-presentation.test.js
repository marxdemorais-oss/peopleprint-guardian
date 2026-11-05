import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import {assessmentPresentation} from '../web/assets/assessment-presentation.js';
import {workspaceSignInURL} from '../web/assets/workspace-navigation.js';
import {demoCases,preparedAssessment} from '../web/assets/demo-data.js';

test('the display separates warning signs, missing information and consistency without assigning a safety probability',()=>{
  assert.equal(assessmentPresentation('caution').label,'Warning signs');
  assert.equal(assessmentPresentation('unresolved').label,'Needs a check');
  assert.equal(assessmentPresentation('consistent').label,'Fits the available records');
  assert.equal(new Set(['caution','unresolved','consistent'].map(s=>assessmentPresentation(s).symbol)).size,3);
  assert.match(assessmentPresentation('consistent').meaning,/not proof of identity or a safety guarantee/);
  for(const value of [undefined,null,'complete','safe','toString','__proto__'])assert.equal(assessmentPresentation(value).tone,'unassessed');
  for(const c of demoCases)for(const context of [false,true]){
    const r=preparedAssessment(c.id,context),display=assessmentPresentation(r.status);
    assert.notEqual(display.tone,'unassessed');assert.ok(display.action);assert.ok(r.nextStep);
  }
});

function demoPage(){
  const nodes=new Map(),query=selector=>{
    if(!nodes.has(selector))nodes.set(selector,{innerHTML:'',textContent:'',hidden:false,dataset:{},querySelectorAll:()=>[]});
    return nodes.get(selector);
  };
  const document={querySelector:query,querySelectorAll:()=>[]};
  const source=readFileSync(new URL('../web/assets/demo.js',import.meta.url),'utf8').replace(/^import[^;]*;/gm,'');
  runInNewContext(source,{document,mountWolfgang(){},wolfgangBridge:{user(){}},demoCases,preparedAssessment,assessmentPresentation,location:{search:''},history:{replaceState(){}},URLSearchParams,window:{dispatchEvent(){}},CustomEvent:class{}});
  return query;
}
test('the demo starts unassessed and only shows a verdict after reveal, then recomputes when context changes',()=>{
  const page=demoPage();
  assert.equal(page('#result').hidden,true);
  assert.match(page('#case-detail').innerHTML,/data-verdict="unassessed"/);
  assert.doesNotMatch(page('#case-detail').innerHTML,/payment destination contradicts/);
  page('#check-case').onclick();
  assert.equal(page('#demo-judgement').dataset.verdict,'caution');
  assert.match(page('#result').innerHTML,/Warning signs/);
  assert.ok(page('#result').innerHTML.indexOf('Your next step')<page('#result').innerHTML.indexOf('Why Wolfgang says this'));
  page('#include-context').onchange({target:{checked:false}});
  assert.equal(page('#demo-judgement').dataset.verdict,'unresolved');
  assert.match(page('#result').innerHTML,/Needs a check/);
  assert.doesNotMatch(page('#result').innerHTML,/data-evidence=/);
  page('#reset-demo').onclick();
  assert.equal(page('#result').hidden,true);
});
test('an expired workspace session retains a saved check or input action through sign-in',()=>{
  for(const query of ['?check=check_saved','?start=upload','?start=paste','?check=check_saved&start=upload']){
    const target=new URL(workspaceSignInURL('https://guardian.test/workspace'+query),'https://guardian.test');
    assert.equal(target.pathname,'/login');assert.equal(target.searchParams.get('return_to'),'/workspace'+query);
  }
  for(const input of ['invalid','https://attacker.test/other?return_to=https://attacker.test','https://guardian.test/workspace-other?start=upload']){
    const target=new URL(workspaceSignInURL(input),'https://guardian.test');
    assert.equal(target.searchParams.get('return_to'),'/workspace');
  }
});

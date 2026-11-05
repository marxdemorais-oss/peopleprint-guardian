import test from 'node:test';
import assert from 'node:assert/strict';
import {renderVerificationDetails as render} from '../web/assets/verification-details.js';
import {attachCaseReferences} from '../worker/product-service.js';
const renderVerificationDetails=(root,result,options)=>render(root,attachCaseReferences(result),options);
const node=tag=>({tag,children:[],append(...children){this.children.push(...children);}});
const walk=n=>[n,...n.children.flatMap(walk)];
test('customer opens source details without making suspect URLs clickable, and sees expired Google warnings up front',()=>{
 const previous=globalThis.document;globalThis.document={createElement:node};
 try{const root=node('main');renderVerificationDetails(root,{identityVerification:{rows:[{label:'Hidden target',detail:'https://suspect.example',sourceId:'https://suspect.example'},{label:'Named agency',detail:'Independently checked.',sourceId:'hmrc-agencies',checkedAt:'2026-11-01T10:00:00Z'}]},linkReputation:{provider:'Google Web Risk',status:'flagged',advisory:'Google may miss threats.',expiresAt:'2026-11-01T10:15:00Z',note:'Historical finding.'}},{now:Date.UTC(2026,10,4)});
  const nodes=walk(root);assert.match(root.children[0].textContent,/expired/);assert.ok(nodes.some(n=>n.tag==='summary'&&n.textContent==='See what I checked'));assert.ok(nodes.some(n=>n.tag==='dd'&&n.textContent==='https://suspect.example'));const links=nodes.filter(n=>n.tag==='a');assert.equal(links.length,1);assert.equal(new URL(links[0].href).hostname,'www.gov.uk');assert.match(links[0].rel,/noreferrer/);
 }finally{globalThis.document=previous;}
});

const now=Date.UTC(2026,10,4,12);
const google=(status='flagged',extra={})=>({provider:'Google Web Risk',status,note:status==='flagged'?'Google found a malware-list match.':'Google returned no match. This does not mean the link is safe.',advisory:'Google may miss threats or flag safe sites in error.',checkedAt:new Date(now).toISOString(),expiresAt:new Date(now+60000).toISOString(),...extra});
const vt=(status='no_flags',extra={})=>({provider:'VirusTotal',status,note:status==='flagged'?'VirusTotal reports one malicious engine verdict.':'VirusTotal contains no malicious verdict. This does not establish safety.',checkedAt:new Date(now).toISOString(),reportedAt:new Date(now-60000).toISOString(),...extra});
function rendered(checks){
 const previous=globalThis.document;globalThis.document={createElement:node};
 try{
  const root=node('main');renderVerificationDetails(root,{linkReputation:{provider:'Google Web Risk + VirusTotal',status:'flagged',checks}},{now});
  return {root,nodes:walk(root)};
 }finally{globalThis.document=previous;}
}

test('nested Google warning remains visible when VirusTotal has no flags, with both provider findings and dates',()=>{
 const {root,nodes}=rendered([google(),vt()]);
 assert.equal(root.children[0].className,'wk-risk-notice');
 assert.match(root.children[0].textContent,/Google Web Risk reported a potential threat/);
 assert.match(root.children[0].textContent,/flag safe sites in error/);
 assert.deepEqual(nodes.filter(n=>n.tag==='h4').map(n=>n.textContent),['Google Web Risk','VirusTotal']);
 assert.ok(nodes.some(n=>n.textContent==='Google found a malware-list match.'));
 assert.ok(nodes.some(n=>n.textContent===vt().note));
 assert.equal(nodes.filter(n=>n.tag==='small'&&n.textContent.startsWith('Lookup ')).length,2);
 assert.ok(nodes.some(n=>n.tag==='small'&&n.textContent.startsWith('Report analysed ')));
});

test('nested expired Google warning is historical even while the VirusTotal report remains available',()=>{
 const {root,nodes}=rendered([google('flagged',{expiresAt:new Date(now-1).toISOString()}),vt()]);
 assert.match(root.children[0].textContent,/Historical Google Web Risk result.*expired/);
 assert.ok(nodes.some(n=>n.textContent?.startsWith('At the time of this check: Google found')));
 assert.ok(nodes.some(n=>n.textContent===vt().note));
 assert.ok(nodes.some(n=>n.textContent?.includes('historical evidence, not a current link warning or clearance')));
});

test('Google no-match cannot hide a VirusTotal warning and each finding remains plain text',()=>{
 const suspect='<a href="https://suspect.example/">Open suspect link</a>';
 const {root,nodes}=rendered([google('no_flags'),vt('flagged',{note:'VirusTotal reports one malicious engine verdict. '+suspect})]);
 assert.equal(root.children[0].tag,'details');
 assert.ok(nodes.some(n=>n.textContent===google('no_flags').note));
 assert.ok(nodes.some(n=>n.textContent==='VirusTotal reports one malicious engine verdict. '+suspect));
 assert.equal(nodes.filter(n=>n.tag==='a').length,0);
});

test('one unavailable provider stays visible without borrowing the other provider finding',()=>{
 const {nodes}=rendered([google('unavailable',{note:'Google Web Risk could not be checked.',expiresAt:undefined}),vt('flagged')]);
 assert.deepEqual(nodes.filter(n=>n.tag==='h4').map(n=>n.textContent),['Google Web Risk','VirusTotal']);
 assert.ok(nodes.some(n=>n.textContent==='Google Web Risk could not be checked.'));
 assert.ok(nodes.some(n=>n.textContent===vt('flagged').note));
 assert.ok(!nodes.some(n=>n.textContent?.includes('lookup has expired')));
});

test('a legacy standalone VirusTotal result still renders with its original provider and report date',()=>{
 const previous=globalThis.document;globalThis.document={createElement:node};
 try{
  const root=node('main');renderVerificationDetails(root,{linkReputation:vt()},{now});const nodes=walk(root);
  assert.deepEqual(nodes.filter(n=>n.tag==='h4').map(n=>n.textContent),['VirusTotal']);
  assert.ok(nodes.some(n=>n.textContent===vt().note));
  assert.ok(nodes.some(n=>n.textContent?.startsWith('Report analysed ')));
 }finally{globalThis.document=previous;}
});

test('a research result shows its checked official passage and link, or an explicit unverified state',()=>{
 const previous=globalThis.document;globalThis.document={createElement:node};
 try{
  const approved='https://www.gov.uk/guidance/vehicle-tax';
  for(const [url,valid] of [[approved,true],['https://www.gov.uk.evil.test/guidance/refund',false]]){
    const root=node('main');renderVerificationDetails(root,{publicResearch:{publisher:'dvla',status:'published',url,quote:'A sample published sentence.',checkedAt:'2026-11-04T12:00:00Z'}});
    const nodes=walk(root);
    assert.equal(nodes.filter(n=>n.tag==='a').length,valid?1:0);
    assert(nodes.some(n=>n.textContent===(valid?'A sample published sentence.':'I couldn’t confirm this practice from an official source.')));
  }
 }finally{globalThis.document=previous;}
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {verifyIdentityEvidence,extractContactEvidence,normalisePhone} from '../worker/identity-verification.js';
import {organisationDirectory,HMRC_AGENCIES_SOURCE} from '../web/assets/organisation-directory.js';
import {importTextRecords} from '../web/assets/import-records.js';
import {groundAssessment} from '../worker/message-first-look.js';
const now=Date.UTC(2026,10,4);
const catalogueList='HMRC and debt collection agencies. Check the list of debt collection agencies who may contact you: '+Object.values(organisationDirectory).map(o=>o.listMarker||'').join('\n')+' All debt collection agencies we work with are regulated.';
function referenceFetch(seen=[]){return async(url,init)=>{
 seen.push(url);assert.equal(init.method,'GET');assert.equal(init.redirect,'manual');assert.equal(init.body,undefined);assert.deepEqual(init.headers,{Accept:'text/html'});
 if(url===HMRC_AGENCIES_SOURCE.url)return new Response('<p>'+catalogueList+'</p>',{headers:{'Content-Type':'text/html'}});
 const org=Object.values(organisationDirectory).find(o=>o.url===url);assert.ok(org,'only reviewed official pages can be fetched');
 return new Response('<h1>'+org.marker+'</h1><p>'+org.phones.map(p=>p.value).join('; ')+'</p><p>'+org.mailboxes.map(p=>p.value).join(' ')+'</p><p>Other contacts: Financial Ombudsman 0800 023 4567</p>',{headers:{'Content-Type':'text/html'}});
};}
const good={status:'consistent',headline:'The records agree.',explanation:'The selected earlier record agrees.',nextStep:'Check the request.',evidenceIds:['e1'],questions:[],reaction:'explaining'};
test('KaDeWe programme and German forwarded sender are checked beyond the former text limit',async()=>{
 const seen=[],message='Is this genuine?\n'+'Introductory text. '.repeat(1300)+'\nVon: Access: Houses of KaDeWe <info@loyalty.kadewe.de>\nhttps://clicks.kadewe.de/offer';
 const result=await verifyIdentityEvidence(message,[],{fetcher:referenceFetch(seen),now});
 assert.deepEqual(seen,[organisationDirectory.kadewe.url]);
 assert.match(result.rows.find(r=>r.kind==='background').detail,/loyalty app/);
 assert.equal(result.rows.find(r=>r.kind==='email'&&r.label==='From').status,'domain_only');
 assert.equal(result.rows.find(r=>r.kind==='website').status,'match');
 assert.equal(result.rows.find(r=>r.kind==='authentication').status,'unverified');
 assert.equal(result.conflicts.length,0);
 const unavailable=await verifyIdentityEvidence(message,[],{fetcher:()=>{throw Error('Unavailable');},now});
 assert.ok(unavailable.rows.some(r=>r.kind==='background'&&r.directoryCheckedOn));
 assert.ok(!unavailable.rows.some(r=>r.checkedAt||r.kind==='email'&&r.status==='match'));
 const spoof=await verifyIdentityEvidence('KaDeWe\nVon: Access <info@loyalty.kadewe.de.attacker.example>',[],{fetcher:referenceFetch(),now});
 assert.equal(spoof.rows.find(r=>r.kind==='email').status,'different');
});
test('EML preserves From, Reply-To and hidden HTML targets even when plain text exists',()=>{
 const mail='From: HMRC <service@hmrc.gov.uk>\nReply-To: agent@elsewhere.example\nContent-Type: multipart/alternative; boundary="B"\n\n--B\nContent-Type: text/plain\n\nRead our update.\n--B\nContent-Type: text/html\n\n<p>Read our update.</p><a href="https://not-hmrc.example/login">https://www.gov.uk</a><a href="tel:+442079460099">020 7946 0011</a>\n--B--\n';
 const record=importTextRecords({name:'request.eml',text:mail}).records[0];
 assert.match(record.text,/Reply-To: agent@elsewhere.example/);assert.match(record.text,/\[Link: https:\/\/not-hmrc.example\/login\]/);
 const contact=extractContactEvidence(record.text);
 assert.equal(contact.links[0].label,'https://www.gov.uk');
 assert.equal(contact.mailboxes.find(m=>m.kind==='From').value,'service@hmrc.gov.uk');
 assert.equal(contact.mailboxes.find(m=>m.kind==='Reply-To').value,'agent@elsewhere.example');
 assert.equal(contact.phones.find(p=>p.kind==='Call button').value,'+442079460099');
});
test('a genuine agency relationship, matching domain, exact mailbox and phone are distinct',async()=>{
 const seen=[];const result=await verifyIdentityEvidence('HMRC says Ardent Credit Services is collecting.\nFrom: Ardent <complaints@ardentcredit.co.uk>\nReply-To: complaints@ardentcredit.co.uk\nWebsite: https://www.my-drs.co.uk/complaints\nCall +44 (0)151 545 1500',[],{fetcher:referenceFetch(seen),now});
 assert.equal(seen.length,3);assert.ok(result.rows.some(r=>r.kind==='relationship'&&r.status==='match'));
 assert.ok(result.rows.some(r=>r.kind==='email'&&r.status==='match'&&r.detail.includes('complaints')));
 assert.ok(result.rows.some(r=>r.kind==='phone'&&r.status==='match'&&r.detail.includes('spoofed')));
 assert.ok(result.rows.some(r=>r.kind==='authentication'&&r.status==='unverified'));
 assert.equal(result.conflicts.length,0);assert.deepEqual(groundAssessment(good,[],null,result),good);
});
test('a domain-only mailbox match and unpublished phone never become sender verification or fraud',async()=>{
 const result=await verifyIdentityEvidence('Advantis\nFrom: unlisted@advantiscredit.co.uk\nCall 020 7946 0099',[],{fetcher:referenceFetch(),now});
 assert.equal(result.rows.find(r=>r.kind==='email').status,'domain_only');
 assert.match(result.rows.find(r=>r.kind==='email').detail,/exact mailbox is not confirmed/);
 assert.equal(result.rows.find(r=>r.kind==='phone').status,'unverified');
 assert.equal(result.conflicts.length,0);assert.deepEqual(groundAssessment(good,[],null,result),good);
});
test('a real HMRC agent name cannot clear a different hidden destination',async()=>{
 const evidence=[{id:'e1',source:'Selected email',text:'Advantis on behalf of HMRC.\n[Link: https://phish.example/login] https://www.advantiscredit.co.uk [End link]'}];
 const seen=[],result=await verifyIdentityEvidence('Is this payment request genuine?',evidence,{fetcher:referenceFetch(seen),now});
 assert.ok(result.rows.some(r=>r.kind==='relationship'&&r.status==='match'));
 assert.ok(result.conflicts.some(c=>c.kind==='masked_link'));
 assert.ok(seen.every(u=>!u.includes('phish')));
 const grounded=groundAssessment(good,[],null,result);assert.equal(grounded.status,'caution');assert.match(grounded.explanation,/actual destination/);assert.deepEqual(grounded.evidenceIds,['e1']);
});
test('lookalike suffixes, userinfo and misleading tel labels are not matches',async()=>{
 const result=await verifyIdentityEvidence('HMRC\nhttps://www.gov.uk.evil.example/login\nhttps://www.gov.uk@evil.example/login\n[Link: tel:+442079460099]020 7946 0011[End link]',[],{fetcher:referenceFetch(),now});
 assert.equal(result.rows.filter(r=>r.kind==='website'&&r.status==='match').length,0);
 assert.ok(result.conflicts.some(c=>c.kind==='masked_link'));assert.ok(result.conflicts.some(c=>c.kind==='masked_phone'));
});
test('Reply-To differences are explained, without an automatic fraud verdict',async()=>{
 const result=await verifyIdentityEvidence('Moorcroft\nFrom: Enquiries@moorgroup.com\nReply-To: support@service.example',[],{fetcher:referenceFetch(),now});
 assert.ok(result.rows.some(r=>r.label==='Reply destination'&&r.status==='different'));
 assert.deepEqual(groundAssessment(good,[],null,result),good);
});
test('phone normalisation matches international and domestic UK formats without treating account numbers as phones',()=>{
 for(const n of ['0161 475 2970','+44 161 475 2970','0044 161 475 2970','+44 (0)161 475 2970'])assert.equal(normalisePhone(n),'+441614752970');
 for(const n of ['12345678','12345678901','+4401614752970x','reference: 01614752970'])assert.equal(normalisePhone(n),null);
});
test('unavailable, redirected or misleading official pages never acquire checked timestamps',async()=>{
 for(const fetcher of [()=>{throw Error('unavailable');},()=>new Response(null,{status:302,headers:{Location:'https://phish.example'}}),()=>new Response('<script>'+catalogueList+'</script>',{headers:{'Content-Type':'text/html'}})]){
  const result=await verifyIdentityEvidence('HMRC Advantis help@advantiscredit.co.uk 01782 971346',[],{fetcher,now});
  assert.equal(result.rows.filter(r=>r.checkedAt).length,0);assert.equal(result.rows.filter(r=>r.status==='match'||r.status==='domain_only').length,0);
 }
});
test('names in old changelog, ombudsman contact and malicious case URLs cannot become official evidence',async()=>{
 const fetcher=async(url,init)=>url===HMRC_AGENCIES_SOURCE.url?new Response('<p>HMRC and debt collection agencies. Check the list of debt collection agencies who may contact you: BPO Collections. All debt collection agencies we work with. Removed Advantis Credit.</p>',{headers:{'Content-Type':'text/html'}}):referenceFetch()(url,init);
 const result=await verifyIdentityEvidence('HMRC Advantis 0800 023 4567 http://127.0.0.1/private http://169.254.169.254/metadata',[],{fetcher,now});
 assert.equal(result.rows.find(r=>r.kind==='relationship').status,'unverified');
 assert.equal(result.rows.find(r=>r.kind==='phone').status,'unverified');
});
test('screenshots report visible-only coverage, unknown companies cause no network request',async()=>{
 const result=await verifyIdentityEvidence('Someone sent this.',[{id:'image1',source:'Message.png · Recognised text',text:'Acme customer service https://unknown.example/login'}],{fetcher:()=>assert.fail('unknown company must not be browsed'),now});
 assert.ok(result.rows.some(r=>r.kind==='coverage'));assert.equal(result.rows.find(r=>r.kind==='website').status,'unverified');
});
test('recovery advice takes priority over link discrepancy and clean results',()=>{
 const recovered=groundAssessment(good,[{recovery:true,clue:'You already gave access.',action:'Disconnect now.'}],{status:'flagged',note:'Flagged',action:'Avoid link'},{conflicts:[{kind:'masked_link',clue:'Hidden target'}]});
 assert.equal(recovered.nextStep,'Disconnect now.');
});
test('the bracketed From wins over an email in a deceptive display name; a bare domain on a button is compared',async()=>{
 const input='HMRC\nFrom: "official@hmrc.gov.uk" <attacker@unrelated.example>\n[Link: https://bad.example/login] gov.uk [End link]';
 const data=extractContactEvidence(input);assert.equal(data.mailboxes.filter(m=>m.kind==='From').length,1);assert.equal(data.mailboxes.find(m=>m.kind==='From').value,'attacker@unrelated.example');
 const result=await verifyIdentityEvidence(input,[],{fetcher:referenceFetch(),now});
 assert.ok(result.conflicts.find(c=>c.kind==='masked_mailbox'));assert.ok(result.conflicts.find(c=>c.kind==='masked_link'));
});
test('a shared government host does not become an HMRC identity or prove HMRC authored the page',async()=>{
 const result=await verifyIdentityEvidence('HMRC: https://www.gov.uk/other-department\nFrom: notices@an-unrelated-council.gov.uk',[],{fetcher:referenceFetch(),now});
 assert.equal(result.rows.find(r=>r.kind==='website').status,'government_host');assert.equal(result.rows.find(r=>r.kind==='email').status,'different');
});
test('changes in HMRC collection policy are not inferred from the name of a listed agency',async()=>{
 const fetcher=async(url,init)=>url===HMRC_AGENCIES_SOURCE.url?new Response('<h2>HMRC and debt collection agencies</h2><p>A debt collection agency working for us will only contact you by:</p><ul><li>letter</li><li>text message</li><li>phone</li></ul><p>They will never visit you at your home or place of work.</p><p>'+catalogueList+'</p>',{headers:{'Content-Type':'text/html'}}):referenceFetch()(url,init);
 const result=await verifyIdentityEvidence('HMRC debt collection through Advantis',[],{now,fetcher});assert.ok(result.rows.some(r=>r.kind==='practice'&&r.detail.includes('do not visit')));
 const absent=await verifyIdentityEvidence('HMRC debt collection through Advantis',[],{now,fetcher:referenceFetch()});assert.ok(!absent.rows.some(r=>r.kind==='practice'));
});
test('a hidden target in an earlier supporting email is attributed to that record rather than treated as the current message',async()=>{
 const verification=await verifyIdentityEvidence('Compare this invoice with my earlier record.',[{id:'old',source:'Gmail · Earlier invoice',text:'[Link: https://other.example/login] https://invoice.example/login [End link]'}],{fetcher:referenceFetch(),now});
 assert.equal(verification.conflicts[0].supportingRecord,true);assert.deepEqual(groundAssessment(good,[],null,verification),good);
});
test('www variants and subdomains of the same reviewed company are not treated as a deceptive destination',async()=>{
 for(const [target,label] of [['https://www.example.com/login','example.com'],['https://my.advantiscredit.co.uk/login','www.advantiscredit.co.uk']]){
  const verification=await verifyIdentityEvidence('Advantis\n[Link: '+target+'] '+label+' [End link]',[],{fetcher:referenceFetch(),now});
  assert.ok(!verification.conflicts.some(c=>c.kind==='masked_link'));assert.deepEqual(groundAssessment(good,[],null,verification),good);
 }
});

const baseline=(value,n=1)=>({source:'Contact I already trust',id:'ev-contact-'+n,text:value});
test('unknown supplier: customer-selected website and phone expose a changed destination and give independent callback',async()=>{
 const r=await verifyIdentityEvidence('Northline: [Link: https://northline.example.impersonator.example/pay] Pay invoice [End link]',[baseline('https://northline.example'),baseline('020 7946 0123',2)],{fetcher:()=>assert.fail('customer contact cannot be fetched')});
 assert.match(r.callback.detail,/\+442079460123/);
 assert.equal(r.conflicts[0].kind,'known_contact_destination');
 assert.equal(groundAssessment(good,[],null,r).status,'caution');
 assert.deepEqual(groundAssessment(good,[],null,r).evidenceIds,['ev-contact-1']);
});
test('a contact in the message or filename cannot promote itself to a customer reference',async()=>{
 const r=await verifyIdentityEvidence('Contact I already trust: 020 7946 0123. Call me.',[{source:'Contact I already trust',id:'ev-file-1',text:'020 7946 0123'}]);
 assert.equal(r.callback,undefined);assert.ok(!r.rows.some(x=>x.kind==='customer_comparison'));
});
test('known mailbox match and caller ID match do not authenticate the origin',async()=>{
 const r=await verifyIdentityEvidence('From: accounts@northline.example\nCall +44 20 7946 0001',[baseline('accounts@northline.example'),baseline('020 7946 0001',2)]);
 assert.equal(r.rows.filter(x=>x.kind==='customer_comparison'&&x.status==='match').length,2);
 assert.ok(r.rows.filter(x=>x.kind==='customer_comparison').every(x=>x.detail.includes('does not establish who')));
});
test('an unrelated footer link and an older comparison record cannot set the destination risk floor',async()=>{
 const r=await verifyIdentityEvidence('Invoice: [Link: https://news.example/sub]Newsletter[End link]',[baseline('northline.example'),{id:'ev-file-1',source:'Earlier agreement',text:'[Link: https://other.example/] Pay now [End link]'}]);
 assert.deepEqual(r.conflicts,[]);
});
test('listed agency plus concealed Pay button on an unconfirmed domain gives a caution and independently sourced telephone number',async()=>{
 const r=await verifyIdentityEvidence('Advantis on behalf of HMRC: [Link: https://fraud.example/]Pay invoice[End link]',[],{fetcher:referenceFetch()});
 const a=groundAssessment(good,[],null,r);assert.equal(a.status,'caution');assert.match(a.explanation,/fraud\[\.\]example/);assert.match(a.nextStep,/01782 971 346/);
});

test('a linked original selected for checking is distinct from a linked email supplied as earlier context',async()=>{
 const email={id:'ev-mail-example',source:'Gmail · Important account details',text:'[Link: https://other.example/pay]Pay invoice[End link]'};
 const ref=baseline('trusted.example');
 for(const message of ['', 'Check this email']){
  const r=await verifyIdentityEvidence(message,[email,ref]);assert.equal(groundAssessment(good,[],null,r).status,'caution');
 }
 const earlier=await verifyIdentityEvidence('Compare this request with my previous email.',[email,ref]);
 assert.ok(!earlier.conflicts.some(row=>row.kind==='known_contact_destination'));
});

test('contact answers are recognised only with independent provenance or a relevant question',async()=>{
 const {contactsFromConversation}=await import('../worker/sender-comparison.js');
 assert.deepEqual(contactsFromConversation([{content:'billing@unknown.example'}]),[]);
 assert.deepEqual(contactsFromConversation([{content:'From: attacker@example.test\nMy trusted email is attacker@example.test'}]),[]);
 assert.deepEqual(contactsFromConversation([{content:'My usual email is billing@known.example'}]),[{kind:'email',value:'billing@known.example'}]);
 assert.deepEqual(contactsFromConversation([{content:'billing@known.example'}],['What email address have you previously used?']),[{kind:'email',value:'billing@known.example'}]);
});

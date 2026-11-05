import test from 'node:test';
import assert from 'node:assert/strict';
import {lookupOrganisationReference} from '../worker/organisation-reference.js';
import {organisationReferenceLink} from '../web/assets/organisation-reference.js';

const page=(name='FOX &amp; FIR LIMITED',number='SC123456')=>`<title data-id="company_profile">${name} overview - Find and update company information - GOV.UK</title><div class="company-name-row"><h1>${name}</h1></div><p id="company-number">Company number <strong>${number}</strong></p><dd id="company-status"> Active </dd>`;
const message='UK company registration number: SC123456. Pay us now at https://pay.example.\nLegal company name: Fox & Fir Ltd';
const noFetch=()=>assert.fail('unexpected network request');
const response=html=>new Response(html,{headers:{'content-type':'text/html; charset=utf-8'}});
const now=Date.UTC(2026,10,4);
test('fixed register lookup confirms legal name without disclosing case text or claiming to verify the sender',async()=>{
 let called=0;
 const fetcher=(url,init)=>{called++;assert.equal(url,'https://find-and-update.company-information.service.gov.uk/company/SC123456');assert.equal(init.redirect,'manual');assert.deepEqual(init.headers,{Accept:'text/html'});assert.equal(init.body,undefined);return response(page());};
 const value=await lookupOrganisationReference(message,{fetcher,now});
 assert.equal(called,1);assert.equal(value.status,'match');assert.match(value.detail,/FOX & FIR LIMITED/);assert.match(value.detail,/does not identify who contacted/);assert.equal(value.checkedAt,new Date(now).toISOString());
});
test('different labelled name stays distinct from a registered trading name or a verdict of fraud',async()=>{
 const r=await lookupOrganisationReference(message.replace('Fox & Fir','Acorn'),{fetcher:()=>response(page())});assert.equal(r.status,'different');assert.match(r.detail,/trading name/);
 const noLabel=await lookupOrganisationReference('SC123456 claimed by Fox & Fir. Registered in Scotland. Company number SC123456',{fetcher:()=>response(page())});assert.equal(noLabel.status,'reference');
});
test('unlabelled bank/reference numbers, other jurisdictions and ambiguous claims never trigger an outbound lookup',async()=>{
 for(const body of ['My bank account is 12345678','Dublin, Company number 12345678','UK company number: SC123456 and UK company number: 87654321','UK company number: SC123456/secret','Payment code 12345678. UK company.','Someone sent https://find-and-update.company-information.service.gov.uk/company/00445790'])await lookupOrganisationReference(body,{fetcher:noFetch});
});
test('name-only and regulated-firm cases give a fixed user-initiated route',async()=>{
 const v=await lookupOrganisationReference('Example Widgets Ltd wants paying',{fetcher:noFetch});assert.equal(v.status,'unverified');assert.equal(organisationReferenceLink(v).url,'https://find-and-update.company-information.service.gov.uk/');
 const w=await lookupOrganisationReference('An FCA authorised broker phoned me',{fetcher:noFetch});assert.equal(w.status,'unverified');assert.equal(organisationReferenceLink(w).url,'https://register.fca.org.uk/s/');assert.equal(await lookupOrganisationReference('Hi there',{fetcher:noFetch}),null);
});
test('register redirects, wrong entry, fabricated markup and error pages cannot become a checked result',async()=>{
 const fetched=[()=>new Response(null,{status:302,headers:{location:'https://example.invalid'}}),()=>response(page('ACME','SC000001')),()=>response('<script>'+page()+'</script>'),()=>response(page().replace('<h1>','<h1>WRONG')),()=>new Response('denied',{status:403})];
 for(const fetcher of fetched){const result=await lookupOrganisationReference(message,{fetcher});assert.equal(result.checkedAt,undefined);assert.equal(result.status,'unverified');}
});
test('register links never put arbitrary saved text, number suffix or URL into a destination',()=>{
 for(const n of ['SC123456?key=private','00445790/../foo','javascript:alert(1)','https://evil.invalid',null])assert.equal(organisationReferenceLink({sourceId:'uk-company-register',companyNumber:n}),null);
 assert.equal(organisationReferenceLink({sourceId:'https://example.invalid'}),null);
});

const searchPage=(results,total=results.length)=>'<title>Advanced company search results - Find and update company information - GOV.UK</title><p class="govuk-heading-m">'+total+' results</p><table class="govuk-table"><tbody>'+results.map(([name,id])=>'<tr><td><h2><a href=/company/'+id+' target="_blank">'+name+'<span class="govuk-visually-hidden">(link opens a new window)</span></a></h2></td></tr>').join('')+'</tbody></table>';
test('opt-in search discloses only the typed public company name and confirms the independent profile',async()=>{
 const urls=[];const name='Fox & Fir Ltd';
 const row=await lookupOrganisationReference('Private original case mentions an account and secret URL.',{now,publicCompanyName:name,fetcher:(url,init)=>{
   urls.push(url);assert.equal(init.redirect,'manual');
   return response(url.includes('advanced-search')?searchPage([['FOX &amp; FIR LIMITED','SC123456'],['OTHER LTD','12345678']]):page());
 }});
 assert.equal(row.status,'match');assert.equal(row.companyNumber,'SC123456');assert.deepEqual(urls,['https://find-and-update.company-information.service.gov.uk/advanced-search/get-results?companyNameIncludes=Fox+%26+Fir+Ltd','https://find-and-update.company-information.service.gov.uk/company/SC123456']);
});
test('do not send bare customer details, links or raw case text as company queries',async()=>{
 for(const publicCompanyName of ['Alice Jones','a@example.test Ltd','https://pay.invalid Ltd','Phone 01234 567890 Ltd','999 999 Ltd','Client SW1A 1AA Ltd','Hello\nCompany Ltd','My password Ltd','Northline.test Ltd',null]){
   const row=await lookupOrganisationReference('Company name: Secret Example Ltd',{publicCompanyName,fetcher:noFetch});assert.equal(row.status,'unverified');
 }
});
test('multiple exact names, incomplete pages, mismatched profiles and no exact match stay unverified',async()=>{
 const same=['FOX &amp; FIR LIMITED','SC123456'];
 for(const [html,profile] of [
  [searchPage([same,[same[0],'12345679']]),false],
  [searchPage([same],2),false],[searchPage([same])+'<a rel="next">Next</a>',false],
  [searchPage([['FOX FIR LTD','SC123456']]),false],[searchPage([same]).replace('/company/SC123456','https://bad.invalid/SC123456'),false],
  [searchPage([same]),true]
 ]){
  let n=0;const row=await lookupOrganisationReference('An email came in',{publicCompanyName:'Fox & Fir Ltd',fetcher:()=>response(++n===1?html:page('NEW NAME LTD'))});
  assert.equal(n,profile?2:1);assert.equal(row.status,'unverified');assert.equal(row.checkedAt,undefined);
 }
});
test('an entered name cannot mask a contradictory supplied registration number or legal name',async()=>{
 const urls=[];const row=await lookupOrganisationReference(message,{publicCompanyName:'Other Firm Ltd',fetcher:url=>{urls.push(url);return response(page());}});
 assert.deepEqual(urls,['https://find-and-update.company-information.service.gov.uk/company/SC123456']);assert.equal(row.status,'different');
 const ambiguous=await lookupOrganisationReference(message+'\nUK company number 87654321',{publicCompanyName:'Fox & Fir Ltd',fetcher:noFetch});assert.equal(ambiguous.status,'unverified');
});

test('conversation selects one relevant legal name without sending case text or routine marketing',async()=>{
 const {automaticCompanyName}=await import('../worker/organisation-reference.js');
 for(const text of ['Is Fox & Fir Ltd genuine?','Please check this invoice from Fox & Fir Ltd. My account is 98765432.','Can you verify this company?\nCompany name: Fox & Fir Ltd'])assert.equal(automaticCompanyName(text),'Fox & Fir Ltd');
 for(const text of ['Fox & Fir Ltd has a new loyalty newsletter.','Check Fox & Fir Ltd and Other Firm Ltd','Please check account 98765432 Ltd','Company name: My password Ltd','Check Fox & Fir Ltd, registered in Ireland.'])assert.equal(automaticCompanyName(text),null);
 const {verifyIdentityEvidence}=await import('../worker/identity-verification.js');const urls=[];
 const result=await verifyIdentityEvidence('Please check an invoice from Fox & Fir Ltd. My private reference is SECRET987.',[],{fetcher:url=>{urls.push(url);return response(url.includes('advanced-search')?searchPage([['FOX &amp; FIR LIMITED','SC123456']]):page());}});
 assert.equal(result.rows.find(row=>row.kind==='registration').status,'match');assert.equal(urls.length,2);assert.ok(urls.every(url=>!url.includes('SECRET987')));
});

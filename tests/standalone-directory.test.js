import test from 'node:test';
import assert from 'node:assert/strict';
import {ukOrganisations,matchUkOrganisations} from '../web/assets/uk-directory.js';
import {verifyIdentityEvidence} from '../worker/identity-verification.js';
test('the standalone package uses only a fictional household-directory entry',async()=>{
 assert.deepEqual(ukOrganisations.map(e=>e.name),['Northline Water']);
 assert.equal(matchUkOrganisations('Northline Water sent this invoice')[0].id,'demo-northline-water');
 const v=await verifyIdentityEvidence('Northline Water says [Link: https://other.example/bill]Pay now[End link]',[],{fetcher:()=>assert.fail('directory comparison is local')});
 assert.ok(v.conflicts.some(c=>c.kind==='directory_destination'));
});

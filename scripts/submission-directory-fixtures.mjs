// Explicit data for the standalone demo. No input is taken from the production catalogue.
const northline={id:'demo-northline-water',name:'Northline Water',aliases:[],hosts:['northline.example'],sector:'water',sourceUrl:'https://register.example/companies/northline-water',checkedDate:'2026-01-01'};
const assets='web/assets/';
export const fixtureModules=new Map();
for(const sector of ['council','health','supplier','everyday']){
  const rows=sector==='supplier'?[northline]:[];
  fixtureModules.set(assets+'uk-'+sector+'-sources.js','// Fictional standalone fixture.\nexport const '+sector+'Sources='+JSON.stringify(rows)+';\n');
}

// Four published examples exercise citations, ambiguity and the offline tour.
fixtureModules.set(assets+'uk-original-publishers.js',String.raw`export const originalPublishers={
  takeFive:{name:'Take Five to Stop Fraud',names:/\bTake Five to Stop Fraud\b/i,hosts:['www.takefive-stopfraud.org.uk'],path:/^\/protect-yourself\//},
  dvla:{name:'DVLA',governmentPublisher:'Driver and Vehicle Licensing Agency',names:/\bDVLA\b/i,hosts:['www.gov.uk'],path:/^\/(?:guidance\/|government\/news\/)/},
  companiesHouse:{name:'Companies House',governmentPublisher:'Companies House',names:/\bCompanies House\b/i,hosts:['www.gov.uk'],path:/^\/(?:guidance\/|government\/news\/)/},
  barclays:{name:'Barclays',names:/\bBarclays\b/i,hosts:['www.barclays.co.uk'],path:/^\/fraud-and-scams\//}
};
`);

// This contact subset is already visible in the public, mocked identity tests.
fixtureModules.set(assets+'organisation-directory.js',`export const HMRC_AGENCIES_SOURCE={name:'HMRC debt collection guidance',url:'https://www.gov.uk/guidance/what-will-happen-if-you-do-not-pay-your-tax-bill'};
export const organisationDirectory={
 kadewe:{name:'KaDeWe',aliases:['KaDeWe','Kaufhaus des Westens','Houses of KaDeWe'],domains:['kadewe.de','kadewe.com','housesofkadewe.com'],url:'https://play.google.com/store/apps/details?id=de.kadewe.loyalty',marker:'access: houses of kadewe',phones:[{value:'+493021210',purpose:'customer service'}],mailboxes:[{value:'kundenservice@kadewe.de',purpose:'customer service'}],reviewedOn:'2026-11-05',background:'KaDeWe is the Berlin department store. Access: Houses of KaDeWe is its loyalty app for KaDeWe, Alsterhaus and Oberpollinger. KaDeWe GmbH’s official app listing describes vouchers, member offers and prize draws, and publishes kundenservice@kadewe.de. Its support website is loyalty.kadewe.com and its privacy page is on access.housesofkadewe.com.'},
 hmrc:{name:'HM Revenue & Customs',aliases:['HMRC'],domains:['hmrc.gov.uk'],url:'https://www.gov.uk/contact-hmrc',marker:'contact hmrc',phones:[],mailboxes:[]},
 advantis:{name:'Advantis Credit',aliases:['Advantis'],listMarker:'Advantis Credit',domains:['advantiscredit.co.uk'],url:'https://www.advantiscredit.co.uk/hmrc/',marker:'who are advantis',phones:[{value:'01782 971 346',purpose:'HMRC enquiries'}],mailboxes:[]},
 ardent:{name:'Ardent Credit Services',aliases:['Ardent Credit'],listMarker:'Ardent Credit Services',domains:['my-drs.co.uk','ardentcredit.co.uk'],url:'https://www.my-drs.co.uk/complaints',marker:'complaints handling at ardent',phones:[{value:'0151 545 1500',purpose:'complaints'}],mailboxes:[{value:'complaints@ardentcredit.co.uk',purpose:'complaints'}]},
 moorcroft:{name:'Moorcroft Debt Recovery',aliases:['Moorcroft'],listMarker:'Moorcroft Debt Recovery',domains:['moorgroup.com'],url:'https://www.moordebt.com/Home/Contact',marker:'moorcroft debt recovery',phones:[],mailboxes:[]}
};
export function verificationSource(id){
 if(id==='hmrc-agencies')return HMRC_AGENCIES_SOURCE;
 const org=Object.hasOwn(organisationDirectory,id)&&organisationDirectory[id];
 return org?{name:org.name+' · official reference',url:org.url}:null;
}
`);

fixtureModules.set('worker/admin-uk-directory.js',`export async function staffDirectory(){
 return {entries:[],total:0,directoryTotal:0,sectors:[],nextOffset:null,saved:0,lastChecked:null,passages:[]};
}
export async function scheduledDirectoryReview(){return new Response(null,{status:404,headers:{'Cache-Control':'private, no-store'}});}
`);

// Ordinary distribution tests use the matcher and the assessment result path with a
// fictional reference. The private directory and its maintenance inputs stay excluded.
export const directoryDemoTest=`import test from 'node:test';
import assert from 'node:assert/strict';
import {ukOrganisations,matchUkOrganisations} from '../web/assets/uk-directory.js';
import {verifyIdentityEvidence} from '../worker/identity-verification.js';
test('the standalone package uses only a fictional household-directory entry',async()=>{
 assert.deepEqual(ukOrganisations.map(e=>e.name),['Northline Water']);
 assert.equal(matchUkOrganisations('Northline Water sent this invoice')[0].id,'demo-northline-water');
 const v=await verifyIdentityEvidence('Northline Water says [Link: https://other.example/bill]Pay now[End link]',[],{fetcher:()=>assert.fail('directory comparison is local')});
 assert.ok(v.conflicts.some(c=>c.kind==='directory_destination'));
});
`;

export const HMRC_AGENCIES_SOURCE={name:'HMRC debt collection guidance',url:'https://www.gov.uk/guidance/what-will-happen-if-you-do-not-pay-your-tax-bill'};
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

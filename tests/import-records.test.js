import test from 'node:test';
import assert from 'node:assert/strict';
import {importTextRecords} from '../web/assets/import-records.js';

const b64=value=>Buffer.from(value,'utf8').toString('base64');
const email=({subject='Earlier agreement',from='Supplier <supplier@example.test>',date='Thu, 01 Oct 2026 12:00:00 +0000',headers=[],body='The agreed amount is £500.'}={})=>[
 `Subject: ${subject}`,`From: ${from}`,`Date: ${date}`,...headers,'',body
].join('\r\n');
const allText=result=>result.records.map(record=>record.source+'\n'+record.text).join('\n');
const hasNotice=(result,pattern)=>assert.match(result.notices.join('\n'),pattern);

test('plain text and CSV preserve selected content as bounded records',()=>{
 for(const [name,text] of [['agreement.TXT','The venue pays catering for 64 guests.'],['payments.csv','supplier,amount,note\nAcme,500,"not a verified invoice"']]){
  const result=importTextRecords({name,text});
  assert.equal(result.records.length,1);assert.equal(result.records[0].text,text);
  assert.match(result.records[0].source,new RegExp(name.replace('.', '\\.')));
  assert(Array.isArray(result.notices));assert(result.records[0].source.length<=160);
 }
});

test('unsupported files, blank text and wholly oversized records are rejected honestly',()=>{
 for(const input of [{name:'invoice.pdf',text:'%PDF-1.7'},{name:'scan.png',text:'not an image reader'},{name:'export.txt',text:'  \n\t'},{name:'agreement.txt',text:'A'.repeat(20001)}]){
  assert.throws(()=>importTextRecords(input),Error);
 }
});

test('EML decodes UTF-8 MIME header words and a base64 text body',()=>{
 const result=importTextRecords({name:'booking.eml',text:email({subject:`=?UTF-8?B?${b64('Café booking £500')}?=`,from:'=?UTF-8?Q?Ren=C3=A9?= <rene@example.test>',headers:['MIME-Version: 1.0','Content-Type: text/plain; charset="UTF-8"','Content-Transfer-Encoding: base64'],body:b64('The café supplies lunch.\nThe amount is £500, not £650.')})});
 assert.equal(result.records.length,1);const combined=allText(result);
 assert.match(combined,/Café booking £500/);assert.match(combined,/René/);assert.match(combined,/rene@example\.test/);
 assert.match(combined,/The café supplies lunch\./);assert.match(combined,/£500, not £650/);
 assert.doesNotMatch(combined,/=\?UTF-8\?[BQ]\?/i);
});

test('quoted-printable bodies and folded headers retain the actual text',()=>{
 const result=importTextRecords({name:'terms.eml',text:email({subject:'First line\r\n of the agreement',headers:['Content-Type: text/plain; charset=utf-8','Content-Transfer-Encoding: quoted-printable'],body:'The caf=C3=A9 agreed =C2=A3500.\r\nLong line is contin=\r\nued here.\r\nA literal equals =3D is included.'})});
 const combined=allText(result);assert.match(combined,/First line\s+of the agreement/);
 assert.match(combined,/The café agreed £500\./);assert.match(combined,/Long line is continued here\./);
 assert.match(combined,/A literal equals = is included\./);
});

test('multipart email prefers plain text and omits named attachments with a notice',()=>{
 const result=importTextRecords({name:'with-attachment.eml',text:email({headers:['MIME-Version: 1.0','Content-Type: multipart/mixed; boundary="outer"'],body:[
  '--outer','Content-Type: multipart/alternative; boundary="inner"','','--inner','Content-Type: text/plain; charset=utf-8','','The deposit remains £100.','--inner','Content-Type: text/html; charset=utf-8','','<p>Alternative copy should not be duplicated.</p>','--inner--','--outer','Content-Type: text/plain; name="secret.txt"','Content-Disposition: attachment; filename="secret.txt"','','Attachment text must not silently enter context.','--outer--'
 ].join('\r\n')})});
 assert.equal(result.records.length,1);assert.match(allText(result),/The deposit remains £100/);
 assert.doesNotMatch(allText(result),/Alternative copy should|Attachment text must/);
 hasNotice(result,/attachment|omitted/i);
});

test('HTML-only email is text evidence with visible link destinations and no execution or fetching',()=>{
 const originalFetch=globalThis.fetch;let calls=0;globalThis.fetch=()=>{calls++;throw new Error('Imports must not fetch.');};
 try{
  const result=importTextRecords({name:'html-only.eml',text:email({headers:['Content-Type: text/html; charset=utf-8'],body:'<html><head><style>.hidden{display:none}</style><title>Hidden title</title></head><body><p>Please check&nbsp;this &pound;500 invoice.</p><a href="https://untrusted.example.test/pay?x=1&amp;y=2">Trusted bank</a><blockquote>Forwarded terms: venue pays.</blockquote><script>runEvilImportCode()</script><img src="https://tracker.example.test/pixel"></body></html>'})});
  const combined=allText(result);assert.match(combined,/Please check this £500 invoice/);
  assert.match(combined,/Trusted bank/);assert.match(combined,/https:\/\/untrusted\.example\.test\/pay\?x=1&y=2/);
  assert.match(combined,/Forwarded terms: venue pays/);
  assert.doesNotMatch(combined,/<(?:html|script|img)|runEvilImportCode|display:none|Hidden title|tracker\.example/);
  hasNotice(result,/html|converted|text.only|preview/i);assert.equal(calls,0);
 }finally{globalThis.fetch=originalFetch;}
});

test('imported email headers are claims and cannot authenticate a sender',()=>{
 const result=importTextRecords({name:'claimed-auth.eml',text:email({headers:['Authentication-Results: attacker.test; dkim=pass; spf=pass'],body:'I claim this account change is authenticated.'})});
 assert(result.records.every(record=>record.confirmed!==true));
 assert.match(allText(result)+'\n'+result.notices.join('\n'),/unverified|not independently verified|headers[^\n]*(?:supplied|untrusted)|(?:supplied|untrusted)[^\n]*headers/i);
});

test('invalid MIME encodings, unavailable charsets and malformed multiparts are rejected',()=>{
 const invalid=[
  email({headers:['Content-Type: text/plain; charset=x-guardian-unknown'],body:'The text must not be decoded as if UTF-8.'}),
  email({headers:['Content-Type: text/plain; charset=utf-8','Content-Transfer-Encoding: base64'],body:'%%%not-valid-base64%%%'}),
  email({headers:['Content-Type: multipart/mixed; boundary="missing"'],body:'The declared boundary never occurs.'}),
  email({headers:['Content-Type: multipart/mixed; boundary="open"'],body:'--open\r\nContent-Type: text/plain\r\n\r\nThe closing boundary is missing.'}),
 ];
 for(const text of invalid)assert.throws(()=>importTextRecords({name:'broken.eml',text}),Error);
});

test('MBOX separates real envelope records and retains each message metadata',()=>{
 const text=[
  'From venue@example.test Thu Oct  1 12:00:00 2026',
  email({subject:'Venue includes catering',from:'Venue <venue@example.test>',date:'Thu, 01 Oct 2026 12:00:00 +0000',body:'Catering is included.\r\nFrom this sentence alone no new message begins.'}),
  'From caterer@example.test Fri Oct  2 09:30:00 2026',
  email({subject:'Catering balance disputed',from:'Caterer <caterer@example.test>',date:'Fri, 02 Oct 2026 09:30:00 +0000',body:'Please pay another £1280.'})
 ].join('\r\n');
 const result=importTextRecords({name:'selected.mbox',text});assert.equal(result.records.length,2);
 const [first,second]=result.records.map(record=>record.source+'\n'+record.text);
 assert.match(first,/Venue includes catering/);assert.match(first,/venue@example\.test/);assert.match(first,/01 Oct 2026|2026-10-01/);assert.match(first,/Catering is included/);
 assert.match(first,/From this sentence alone/);assert.doesNotMatch(first,/Catering balance disputed|£1280/);
 assert.match(second,/Catering balance disputed/);assert.match(second,/caterer@example\.test/);assert.match(second,/02 Oct 2026|2026-10-02/);assert.match(second,/£1280/);
 assert.doesNotMatch(second,/Venue includes catering|Catering is included/);
});

test('MBOX skips oversized individual messages with notice and keeps readable records intact',()=>{
 const text=[
  'From huge@example.test Thu Oct  1 12:00:00 2026',email({subject:'Oversized message',body:'A'.repeat(20001)}),
  'From small@example.test Fri Oct  2 09:30:00 2026',email({subject:'Readable selected record',body:'The venue pays the supplier.'})
 ].join('\r\n');
 const result=importTextRecords({name:'mixed-size.mbox',text});
 assert.equal(result.records.length,1);assert.match(allText(result),/Readable selected record/);
 assert.doesNotMatch(allText(result),/Oversized message/);hasNotice(result,/20,?000|too long|oversiz|skipp/i);
 assert(result.records.every(record=>record.text.length<=20000));
});

test('a twelve-record import limit is explicit and never silently drops messages',()=>{
 const text=Array.from({length:14},(_,index)=>[
  `From sender${index}@example.test Thu Oct  1 12:00:00 2026`,
  email({subject:`Selected email ${index+1}`,body:`Body for email ${index+1}.`})
 ].join('\r\n')).join('\r\n');
 const result=importTextRecords({name:'fourteen.mbox',text});
 assert.equal(result.records.length,12);hasNotice(result,/12|twelve|limit|remain|skipp/i);
 assert.match(allText(result),/Selected email 1\b/);assert.match(allText(result),/Selected email 12\b/);
 assert.doesNotMatch(allText(result),/Selected email 13\b|Selected email 14\b/);
});

test('HTML link evidence uses the actual href attribute and keeps supplied display text separate',()=>{
 const result=importTextRecords({name:'misleading-link.eml',text:email({headers:['Content-Type: text/html; charset=utf-8'],body:`<a data-href="https://decoy.example" title=" href='https://title.example' " href="https://actual.example/pay?ref=&#49;">https://claimed-bank.example</a>`})});
 const combined=allText(result);assert.match(combined,/https:\/\/actual\.example\/pay\?ref=1/);assert.match(combined,/https:\/\/claimed-bank\.example/);assert.doesNotMatch(combined,/decoy\.example|title\.example/);
});

test('unused HTML alternatives do not falsely label a plain-text import as an HTML conversion',()=>{
 const result=importTextRecords({name:'alternatives.eml',text:email({headers:['Content-Type: multipart/alternative; boundary=choice'],body:['--choice','Content-Type: text/plain','','The plain agreement.','--choice','Content-Type: text/html','','<p>The same agreement.</p>','--choice--'].join('\r\n')})});
 assert.match(allText(result),/The plain agreement/);assert.doesNotMatch(result.notices.join('\n'),/HTML was converted/);
});

test('unsupported and ambiguous MIME data never becomes a successful empty or partial email record',()=>{
 for(const text of [
  email({headers:['Content-Type: text/plain; charset=us-ascii'],body:'Non-ASCII £ text'}),
  email({headers:['Content-Type: text/plain','Content-Type: text/html'],body:'Conflicting type'}),
  email({headers:['Content-Type: application/pdf','Content-Disposition: attachment; filename=invoice.pdf'],body:'Unread attachment'}),
  email({headers:['Content-Type: text/plain','Content-Transfer-Encoding: quoted-printable'],body:'Broken =XZ encoding'})
 ])assert.throws(()=>importTextRecords({name:'unsupported.eml',text}),Error);
});

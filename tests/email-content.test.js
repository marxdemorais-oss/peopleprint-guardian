import test from 'node:test';
import assert from 'node:assert/strict';
import {emailHtmlText,emailReadableContent} from '../worker/email-content.js';

test('HTML email becomes plain evidence with link targets and forwarded material preserved',()=>{
 const text=emailHtmlText('<html><head><style>.x{display:none}</style><title>Hidden title</title></head><body><p>Please check&nbsp;this &pound;500 invoice.</p><p><a href="https://payment.example.test/?a=1&amp;b=2">Trusted bank</a></p><blockquote>Forwarded request: change the account.</blockquote><img src="https://tracker.example.test/pixel" alt="Invoice scan"><script>executeSomething()</script></body></html>');
 assert.match(text,/Please check this £500 invoice\./);
 assert.match(text,/https:\/\/payment.example.test\/\?a=1&b=2/);
 assert.match(text,/Trusted bank/);assert.match(text,/Forwarded request: change the account/);
 assert.match(text,/Image description: Invoice scan/);
 assert.doesNotMatch(text,/<(?:html|script|img)|executeSomething|display:none|tracker\.example|Hidden title/);
});
test('plain text and its final terms survive the former character limit',()=>{
 const body='A'.repeat(20000)+'\nOffer ends 31 October 2026.';
 const content=emailReadableContent({text:body,html:'<p>Other content</p>',subject:'Invoice\r\nBcc: other@example.test'});
 assert.equal(content.text,'Subject: Invoice Bcc: other@example.test\n\n'+body);assert.equal(content.truncated,false);assert.equal(content.htmlOnly,false);
 assert.equal(content.subject,'Invoice Bcc: other@example.test');assert(!content.text.includes('Other content'));
});
test('HTML-only emails retain their ending and all distinct link targets',()=>{
 const html='<p>'+'Complete text. '.repeat(22000)+'</p>'+Array.from({length:35},(_,i)=>'<a href="https://example.test/offer/'+i+'">Offer '+i+'</a>').join('')+'<p>Final terms.</p>';
 const htmlOnly=emailReadableContent({html});
 assert.match(htmlOnly.text,/Final terms\.$/);assert.equal(htmlOnly.truncated,false);
 const multipart=emailReadableContent({text:'Please check the offer.',html});
 assert.match(multipart.text,/https:\/\/example.test\/offer\/34/);
 assert.equal((multipart.text.match(/\[Link: /g)||[]).length,35);
});
test('HTML-only linking codes work and executable or empty HTML provides no assessment text',()=>{
 const code='WG-'+'A'.repeat(32);
 assert.equal(emailReadableContent({html:'<p>'+code+'</p>'}).text,code);
 assert.equal(emailReadableContent({html:'<p>Check this invoice.</p><img src="https://example.test/invoice.png">'}).unreadImages,true);
 assert.equal(emailReadableContent({html:'<style>body{color:red}</style><script>instruction()</script><img src="cid:invoice">'}).text,'');
 assert.equal(emailHtmlText('<p>Pay &#xA3;100 &#128179; &amp; verify.</p>'),'Pay £100 💳 & verify.');
});

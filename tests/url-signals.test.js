import {test} from 'node:test';
import assert from 'node:assert/strict';
import {inspectMessageLinks} from '../worker/url-signals.js';

test('inspects the parsed host of a disguised link without echoing credentials or query secrets',()=>{
 const [finding] = inspectMessageLinks('Open (https://paypal.com:secret@acme.test/a/private?code=1234).');
 assert.match(finding,/acme\[\.\]test/);
 assert.doesNotMatch(finding,/secret|private|1234|https/);
});

test('recognises embedded service domains without treating official subdomains or quoted domains in a path as suspicious',()=>{
 assert.match(inspectMessageLinks('Use hmrc.gov.uk.refunds.example/check')[0],/longer hostname/);
 for(const address of ['https://www.gov.uk','https://example.test/gov.uk','https://www.nhs.uk/','https://gov.uk.example.gov.uk','https://coffee.test','https://www.example.test/?next=gov.uk'])assert.deepEqual(inspectMessageLinks(address),[]);
});

test('describes differences between URL labels and their destinations and ignores ordinary labels',()=>{
 const [finding]=inspectMessageLinks('[paypal.com](https://different.example/pay?ref=abc)');
 assert.match(finding,/link text shows paypal\[\.\]com/);assert.match(finding,/different\[\.\]example/);
 assert.deepEqual(inspectMessageLinks('[Find out more](https://different.example/info)'),[]);
 assert.deepEqual(inspectMessageLinks('[example.test](https://EXAMPLE.test./page)'),[]);
});

test('reports what pasted mail headers say without authenticating the sender',()=>{
 const [finding]=inspectMessageLinks('From: Accounts <billing@vendor.test>\r\nReply-To: refunds@another.test\r\n\r\nHi');
 assert.match(finding,/can be legitimate/);assert.doesNotMatch(finding,/billing|refunds/);
 assert.deepEqual(inspectMessageLinks('From: support@example.test\nReply-To: support@EXAMPLE.TEST\n'),[]);
 assert.deepEqual(inspectMessageLinks('From: support@example.test\nReply-To: a@some.test, b@another.test\n'),[]);
});
test('bounds link parsing, ignores email addresses, and tolerates malformed text',()=>{
 for(const value of [null,{},'admin@example.test','https://#','https://[::zz]/','https://'+'m'.repeat(18000)])assert.deepEqual(inspectMessageLinks(value),[]);
 const many=Array.from({length:8},(_,i)=>'https://www.paypal.com@other'+i+'.test').join(' ');
 assert.equal(inspectMessageLinks(many).length,3);
});

test('recognises a brand in an unrelated hostname and a shortened link, without following either',()=>{
 assert.match(inspectMessageLinks('Use https://hmrc-refund.example.org/login?v=secrethere')[0],/name HMRC/);
 assert.match(inspectMessageLinks('https://bit.ly/private-id')[0],/hides its final destination/);
 assert.deepEqual(inspectMessageLinks('https://www.royalmail.com/track'),[]);
 assert.deepEqual(inspectMessageLinks('https://apple.com'),[]);
});

test('finds a disguised destination after the former text cutoff',()=>{
 assert.match(inspectMessageLinks('x'.repeat(20000)+' https://official.gov.uk@bad.test')[0],/destination host is bad/);
});

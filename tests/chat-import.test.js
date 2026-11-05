import test from 'node:test';
import assert from 'node:assert/strict';
import {chatImport} from '../web/assets/chat-import.js';

test('iPhone conversations retain the printed timestamp, people and multiline messages', () => {
  const text = '\ufeff[03/11/26, 11:12:13] Jane: Did you send this?\r\nhttps://example.test/x\r\n[03/11/26, 11:13:14] Patrick: No';
  const {records, notices} = chatImport({name:'_chat.txt', text, limit:12});
  assert.equal(records.length, 2);
  assert.deepEqual(notices, []);
  assert.match(records[0].source, /Jane/);
  assert.match(records[0].text, /Did you send this\?\nhttps:\/\/example.test/);
  assert.match(records[1].text, /11:13:14\] Patrick: No/);
});

test('Android chat timestamps allow regional dates, direction marks and narrow spaces before AM/PM', () => {
  const text = '\u200e11/3/26, 1:02\u202fPM - Messages in this chat are encrypted.\n11/3/26, 1:08\u202fPM - John: Hi\nnext line\n11/3/26, 1:09\u202fPM - John: Hello';
  const {records,notices} = chatImport({name:'chat.txt', text, limit:2});
  assert.equal(records.length,2);
  assert.match(records[0].text, /encrypted/);
  assert.match(records[1].text, /Hi\nnext line/);
  assert.match(notices.join(), /1 further/);
  assert.equal(chatImport({name:'notes.txt',text:'My notes before the chat\n' + text,limit:3}),null);
});

test('SMS Backup & Restore keeps SMS metadata and decoded text and explicitly skips MMS', () => {
  const text = `<?xml version="1.0" encoding="UTF-8"?><?xml-stylesheet href="https://untrusted.example/" type="text/xsl"?>
  <!-- backup -->
  <smses count="4">
    <sms date="1793692800000" type="1" address="+44" contact_name="Jo &amp; Bob" body="Click &lt;https://example.test/?a=1&amp;b=2&gt; &#x1f600;&#10;Second line" />
    <mms><parts><part text="Do not import this asset"/><part data="AAAB"/></parts></mms>
    <sms type='2' address='123' body='I will check' readable_date='3 Nov 2026 09:15'></sms>
    <sms type="1" body=""/>
  </smses>`;
  const {records, notices} = chatImport({name:'sms.xml', text, limit:12});
  assert.equal(records.length,2);
  assert.match(records[0].text, /From: Jo & Bob \+44/);
  assert.match(records[0].text, /Click <https:\/\/example.test\/\?a=1&b=2> 😀\nSecond line/);
  assert.match(records[1].text, /To: 123/);
  assert.doesNotMatch(JSON.stringify(records), /Do not import this asset|untrusted\.example/);
  assert.match(notices.join(' '), /1 MMS/);
  assert.match(notices.join(' '), /1 SMS/);
});

test('unsafe or unsupported XML and malformed backup structures fail without returning partial records', () => {
  for(const text of [
    '<!DOCTYPE smses [<!ENTITY boom SYSTEM "https://danger.test/x">]><smses><sms body="&boom;"/></smses>',
    '<rss><sms body="x"/></rss>',
    '<smses><sms body="a & b"/></smses>',
    '<smses><sms body="hi"/></forgot>',
    '<smses><sms body="a" body="b"/></smses>',
    '<smses><malicious><sms body="nested"/></malicious></smses>',
    '<smses><sms body="&#xD800;"/></smses>',
    '<smses><sms body="a"/></smses><smses><sms body="other"/></smses>'
  ]) assert.throws(()=>chatImport({name:'messages.xml',text,limit:12}),/XML|backup/i);
});

test('limits do not split messages and unreadable items are counted', () => {
  const text = '<smses><sms body="' + 'x'.repeat(20001) + '"/><sms body="one"/><sms body="two"/></smses>';
  const {records, notices} = chatImport({name:'n'.repeat(250)+'.xml',text,limit:1});
  assert.equal(records.length,1);
  assert.ok(records[0].source.length <= 160);
  assert.equal(records[0].text,'one');
  assert.match(notices.join(' '),/20,000/);
  assert.match(notices.join(' '),/1 further/);
  assert.throws(()=>chatImport({name:'only-mms.xml',text:'<smses><mms/></smses>',limit:12}),/MMS/);
});

test('chat CSV retains each message, including quoted senders, line breaks and record context', () => {
  const text = '\ufeff"Date","From","Message_Text",Direction\r\n' +
    '"3 Nov, 10:00","Smith, Jo","She said ""okay"".\r\nSecond line, with comma",in\r\n' +
    '3 Nov 10:02,Me,Thanks,out\r\n' +
    '3 Nov 10:03,Me,,out';
  const {records, notices} = chatImport({name:'sms.csv', text, limit:2});
  assert.equal(records.length, 2);
  assert.match(records[0].source, /3 Nov, 10:00 · Smith, Jo/);
  assert.equal(records[0].text, 'Date: 3 Nov, 10:00\nFrom: Smith, Jo\nDirection: in\n\nShe said "okay".\nSecond line, with comma');
  assert.equal(records[1].text, 'Date: 3 Nov 10:02\nFrom: Me\nDirection: out\n\nThanks');
  assert.match(notices.join(' '), /1 message\(s\) had no text/);
});

test('semicolon, tab and single-column message exports are supported; generic CSV falls back', () => {
  for (const delimiter of [';', '\t']) {
    const text = ['address' + delimiter + 'body', '123' + delimiter + '"Hi' + delimiter + ' team"', '123' + delimiter + 'Again'].join('\n');
    const {records, notices} = chatImport({name:'sms.csv', text, limit:1});
    assert.equal(records[0].text, 'address: 123\n\nHi' + delimiter + ' team');
    assert.match(notices.join(' '), /1 further/);
  }
  assert.equal(chatImport({name:'chat.csv', text:'text\n"  an indented message"'}).records[0].text, '  an indented message');
  assert.equal(chatImport({name:'payments.csv', text:'supplier,amount,note\nAcme,500,sample'}), null);
  assert.throws(() => chatImport({name:'chat.csv', text:'From,Message\nJo,"unterminated'}), /quoting/);
  assert.throws(() => chatImport({name:'chat.csv', text:'From,Message\nJo,hi,there'}), /number of columns/);
});

test('statement CSV preserves headerless first rows, quoted line breaks and original amounts',async()=>{
 const {financialCsv}=await import('../web/assets/chat-import.js');
 const input='2026-01-01;"Invoice\nreference";-20,01\n2026-01-02;Second;+3,40';
 const imported=financialCsv('bank.csv',input,12);
 assert.equal(imported.records.length,2);
 assert.match(imported.records[0].text,/Column 2: Invoice\nreference/);
 assert.match(imported.records[0].text,/-20,01/);
 assert.equal(financialCsv('bank.csv',input,1).notices.length,1);
 assert.throws(()=>financialCsv('bank.csv','Date,Amount\nOne,Two,Three',12),/columns/);
});

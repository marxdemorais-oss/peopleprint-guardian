import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {MessageChannel} from 'node:worker_threads';
import {readPdfRecords} from '../web/assets/import-pdf.js';
import {readImportFile} from '../web/assets/import-file.js';
import {WorkerMessageHandler} from '../web/assets/pdfjs-worker.js';

// Supply a local message port pair in Node. The production PDF.js transport
// and worker parser exchange the same messages they would across browser threads.
globalThis.DOMMatrix ??= class {};
globalThis.Worker = class {
  constructor() {
    const {port1,port2}=new MessageChannel();
    WorkerMessageHandler.initializeFromPort(port2);
    port1.terminate=()=>{port1.close();port2.close();};
    return port1;
  }
};
const fixture=async name=>new Uint8Array(await readFile(new URL('./fixtures/pdf/'+name,import.meta.url)));

test('reads compressed PDF text by page and discloses a skipped scanned page',async()=>{
  const {records,notices}=await readPdfRecords('statement.pdf',await fixture('sample.pdf'),10);
  assert.deepEqual(records.map(x=>x.source),['statement.pdf · Page 1','statement.pdf · Page 3']);
  assert.match(records[0].text,/Sample transfer \| GBP 12\.34/);
  assert.match(records[1].text,/Closing balance 12\.34/);
  assert.match(notices.join(' '),/skipped: 2\./);
});
test('an image-only statement and a locked statement offer actionable alternatives',async()=>{
  await assert.rejects(readPdfRecords('scan.pdf',await fixture('scan.pdf'),12),/no readable text.*searchable PDF or a CSV/);
  await assert.rejects(readPdfRecords('locked.pdf',await fixture('locked.pdf'),12),/password-protected.*unlocked copy or a CSV/);
});
test('invalid and over-capacity statements are never offered as partial evidence',async()=>{
  await assert.rejects(readPdfRecords('wrong.pdf',new Uint8Array([0,16]),12),/could not be read as a PDF/);
  await assert.rejects(readPdfRecords('sample.pdf',await fixture('sample.pdf'),1),/exceeds the remaining preview space/);
});

test('normal file selection previews actual PDF bytes and rejects oversize files before reading',async()=>{
  const bytes=await fixture('sample.pdf');
  const pdf=new File([bytes],'statement.PDF',{type:'application/pdf'});
  const generic=await readImportFile(pdf);
  assert.deepEqual((await readImportFile(pdf,12,'finance')).records,generic.records);
  const tooLarge={name:'statement.pdf',size:4*1024*1024+1,arrayBuffer(){assert.fail('oversize read');}};
  await assert.rejects(readImportFile(tooLarge),/over 4 MB/);
});

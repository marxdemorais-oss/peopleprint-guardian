import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {gunzipSync,inflateSync} from 'node:zlib';
import {imageDimensions,rasterRecords,rasterSize} from '../web/assets/import-image.js';
import {loadEngine,readPixels} from '../web/assets/evidence-raster.js';
import {readImportFile} from '../web/assets/import-file.js';

const fixture=name=>readFile(new URL('./fixtures/evidence/'+name,import.meta.url));
const engine=()=>loadEngine(async path=>gunzipSync(await readFile(new URL('../web/assets/'+path,import.meta.url))));
function fixturePixels(bytes){
  // This fixture is a real RGBA PNG saved with filter 0 in every row.
  const [width,height]=imageDimensions(bytes).size,compressed=[];
  for(let i=8;i<bytes.length;){const length=bytes.readUInt32BE(i),type=bytes.subarray(i+4,i+8).toString();if(type==='IDAT')compressed.push(bytes.subarray(i+8,i+8+length));i+=12+length;}
  const raw=inflateSync(Buffer.concat(compressed)),pixels=new Uint8ClampedArray(width*height*4);
  for(let row=0;row<height;row++){let i=row*(width*4+1);assert.equal(raw[i++],0);pixels.set(raw.subarray(i,i+width*4),row*width*4);}
  return {pixels,width,height};
}

test('real screenshot is read by the shipped OCR model and decoded as inert QR text',async()=>{
  const {pixels,width,height}=fixturePixels(await fixture('invoice.png'));
  const result=await readPixels(pixels,width,height,engine);
  const {records}=rasterRecords('Screenshot.png',result,2);
  assert.deepEqual(records[0],{source:'Screenshot.png · QR code',text:'https://invoice.example.test/pay/987'});
  assert.match(records[1].text,/Invoice 987/);assert.match(records[1].text,/GBP 125\.50/);assert.match(records[1].text,/10493827/);
  assert.throws(()=>rasterRecords('screenshot',result,1),/remaining preview space/);
});
test('an empty image provides no fabricated records; hostile size and file masquerades fail',async()=>{
  assert.deepEqual(rasterRecords('Blank',await readPixels(new Uint8ClampedArray(100*100*4).fill(255),100,100,engine),3).records,[]);
  const b=await fixture('invoice.png');b.writeUInt32BE(5000000,16);
  assert.throws(()=>imageDimensions(b),/too large/);
  assert.throws(()=>imageDimensions(Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" />')),/Choose a PNG/);
  const size=rasterSize(6000,4000);assert.ok(size.width*size.height<=3200000);
});
test('a normal DOCX exposes selected body paragraphs and table cells without reading its header',async()=>{
  const result=await readImportFile(new File([await fixture('invoice.docx')],'invoice.docx'),12,'finance');
  assert.deepEqual(result.records.map(r=>r.text),['Invoice 987: GBP 125.50','Account','10493827']);
  assert.match(result.records[2].source,/Paragraph 3$/);
  await assert.rejects(readImportFile(new File([await fixture('invoice.docx')],'invoice.docx'),1),/remaining preview space/);
  await assert.rejects(readImportFile(new File([await fixture('unsafe.docx')],'unsafe.docx')),/entity declarations/);
  await assert.rejects(readImportFile(new File(['hello'],'forged.docx')),/could not be read/);
});

// Browsers implement canvas natively. In Node use an installed native canvas
// when available; the other parser/recognition fixtures do not require it.
import {createRequire} from 'node:module';
import {MessageChannel} from 'node:worker_threads';
const require=createRequire(import.meta.url);
let canvasAPI;
for(const location of ['@napi-rs/canvas',process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES&&process.env.CODEX_PRIMARY_RUNTIME_NODE_MODULES+'/@napi-rs/canvas'].filter(Boolean)){
  try{canvasAPI=require(location);break;}catch{}
}
test('a scanned invoice renders through PDF.js and returns its real OCR and QR with page labels',{skip:!canvasAPI&&'Install @napi-rs/canvas to run PDF raster integration in Node.'},async()=>{
  const {DOMMatrix,ImageData,Path2D,createCanvas}=canvasAPI;
  Object.assign(globalThis,{DOMMatrix,ImageData,Path2D,document:{createElement:()=>createCanvas(1,1),documentElement:{style:{}}}});
  const {WorkerMessageHandler}=await import('../web/assets/pdfjs-worker.js');
  globalThis.Worker=class {constructor(){const {port1,port2}=new MessageChannel();WorkerMessageHandler.initializeFromPort(port2);port1.terminate=()=>{port1.close();port2.close();};return port1;}};
  const {readPdfRecords}=await import('../web/assets/import-pdf.js');
  const result=await readPdfRecords('scanned.pdf',new Uint8Array(await fixture('invoice-scan.pdf')),12,{canvasReader:c=>readPixels(c.getContext('2d').getImageData(0,0,c.width,c.height).data,c.width,c.height,engine)});
  assert.deepEqual(result.records.map(r=>r.source),['scanned.pdf · Page 1 · QR code','scanned.pdf · Page 1 · Recognised text']);
  assert.equal(result.records[0].text,'https://invoice.example.test/pay/987');assert.match(result.records[1].text,/GBP 125\.50/);
});

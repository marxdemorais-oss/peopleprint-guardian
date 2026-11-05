import {chatImport,financialCsv} from './chat-import.js';
import {readChatZip} from './chat-zip.js';
import {previewTextRecords} from './import-records.js';

const MAX_FILE_BYTES=4*1024*1024;
function parseRecords(name,text,limit){
 if(text.includes('\0'))throw Error('The file contains binary data. Choose a UTF-8 text export.');
 return chatImport({name,text,limit})||previewTextRecords({name,text,maxRecords:limit});
}

// Parse locally so only the messages a person chooses can reach their check.
export async function readImportFile(file,previewLimit=1000,mode=''){
 if(file.size>MAX_FILE_BYTES)throw Error('The file is over 4 MB. Export a smaller selection, or export your chat without media.');
 if(!/\.(txt|csv|eml|mbox|xml|zip|pdf|docx|png|jpe?g|webp)$/i.test(file.name))throw Error('Choose a PNG, JPEG, WebP, DOCX, PDF, TXT, ZIP, XML, EML, MBOX or CSV file.');
 const bytes=await file.arrayBuffer();
 if(bytes.byteLength>MAX_FILE_BYTES)throw Error('The file is over 4 MB.');
 const limit=Math.min(1000,Math.max(1,previewLimit));
 if(/\.(png|jpe?g|webp)$/i.test(file.name)){
  const {readImageRecords}=await import('./import-image.js');
  return readImageRecords(file.name,new Uint8Array(bytes),limit);
 }
 if(/\.docx$/i.test(file.name)){
  const {readDocxRecords}=await import('./import-docx.js');
  return readDocxRecords(file.name,new Uint8Array(bytes),limit);
 }
 if(/\.pdf$/i.test(file.name)){
  const {readPdfRecords}=await import('./import-pdf.js');
  return readPdfRecords(file.name,new Uint8Array(bytes),limit);
 }
 if(/\.zip$/i.test(file.name)){
  const chat=await readChatZip(new Uint8Array(bytes));
  const imported=parseRecords(chat.name,chat.text,limit);
  return {records:imported.records,notices:[...(chat.notices||[]),...imported.notices]};
 }
 let content;
 try{content=new TextDecoder('utf-8',{fatal:true}).decode(bytes);}
 catch{throw Error('The file is not readable UTF-8. Export a UTF-8 copy.');}
 if(mode==='finance'&&/\.csv$/i.test(file.name))return financialCsv(file.name,content,limit);
 return parseRecords(file.name,content,limit);
}

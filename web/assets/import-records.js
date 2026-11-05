// Local, bounded conversion only. Imported content and headers are evidence,
// never instructions or proof of a sender's identity. No DOM or network APIs.
const MAX_FILE_BYTES=4*1024*1024,MAX_RECORD_CHARS=20000,MAX_HEADERS=65536;
const encoder=new TextEncoder();
const fail=message=>{throw new Error(message);};
const limitedSource=value=>value.length>160?value.slice(0,159)+'…':value;
const normalLines=value=>value.replace(/\r\n?/g,'\n');

function charsetName(value='utf-8'){
 const charset=value.trim().toLowerCase();
 if(['utf-8','utf8'].includes(charset))return 'utf-8';
 if(['us-ascii','ascii'].includes(charset))return 'ascii';
 fail('Unsupported email character set: '+charset+'. Export UTF-8 text instead.');
}
function decodeBytes(bytes,charset){
 const name=charsetName(charset);
 if(name==='ascii'&&bytes.some(byte=>byte>127))fail('The email contains invalid ASCII text. Export UTF-8 text instead.');
 try{return new TextDecoder('utf-8',{fatal:true}).decode(bytes);}catch{fail('The email contains invalid UTF-8 text. Export a readable UTF-8 text copy instead.');}
}
function base64Bytes(value){
 const compact=value.replace(/[\t\n\r ]/g,'');
 if(compact.length%4||!/^[A-Za-z0-9+/]*={0,2}$/.test(compact))fail('The email contains malformed base64 text.');
 let decoded;try{decoded=atob(compact);}catch{fail('The email contains malformed base64 text.');}
 if(btoa(decoded)!==compact)fail('The email contains malformed base64 text.');
 return Uint8Array.from(decoded,char=>char.charCodeAt(0));
}
function quotedBytes(value,{header=false}={}){
 const text=header?value.replace(/_/g,' '):normalLines(value).replace(/=\n/g,'');
 const bytes=[];
 for(let index=0;index<text.length;index++){
  const code=text.charCodeAt(index);
  if(text[index]==='='){
   const hex=text.slice(index+1,index+3);if(!/^[a-f\d]{2}$/i.test(hex))fail('The email contains malformed quoted-printable text.');bytes.push(parseInt(hex,16));index+=2;
  }else{if(code>127)fail('The email contains malformed quoted-printable text.');bytes.push(code);}
 }
 return new Uint8Array(bytes);
}
function decodedHeader(value=''){
 // Consecutive encoded words may be folded with whitespace by an exporter.
 const joined=value.replace(/(=\?[^?]+\?[bq]\?[^?]*\?=)[ \t]+(?==\?)/gi,'$1');
 const decoded=joined.replace(/=\?([^?]+)\?([bq])\?([^?]*)\?=/gi,(_,charset,encoding,data)=>decodeBytes(encoding.toLowerCase()==='b'?base64Bytes(data):quotedBytes(data,{header:true}),charset));
 if(decoded.includes('=?'))fail('The email contains a malformed encoded header.');
 return decoded.replace(/[\r\n\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g,' ').trim();
}
function splitHeaders(raw){
 let boundary=raw.indexOf('\n\n'),offset=2;
 if(raw.startsWith('\n')){boundary=0;offset=1;}
 if(boundary<0||boundary>MAX_HEADERS)fail('The email headers are missing, malformed or too long.');
 const lines=raw.slice(0,boundary).split('\n'),headers=new Map();let previous='';
 if(lines.length>250)fail('The email has too many headers.');
 for(const line of lines){
  if(!line)continue;
  if(/^[ \t]/.test(line)){if(!previous)fail('The email contains a malformed folded header.');const values=headers.get(previous);values[values.length-1]+=' '+line.trim();continue;}
  const match=line.match(/^([A-Za-z0-9-]+):[ \t]*(.*)$/);if(!match)fail('The email contains a malformed header.');
  previous=match[1].toLowerCase();const values=headers.get(previous)||[];values.push(match[2]);headers.set(previous,values);
 }
 for(const key of ['subject','from','reply-to','date','content-type','content-transfer-encoding','content-disposition','mime-version'])if((headers.get(key)||[]).length>1)fail('The email contains conflicting '+key+' headers.');
 return {headers,body:raw.slice(boundary+offset)};
}
const header=(headers,name)=>headers.get(name)?.[0]||'';
function structuredHeader(value,fallback){
 const input=value||fallback,parts=[];let start=0,quote=false,escape=false;
 for(let index=0;index<input.length;index++){
  const char=input[index];if(escape){escape=false;continue;}if(char==='\\'&&quote){escape=true;continue;}if(char==='"'){quote=!quote;continue;}if(char===';'&&!quote){parts.push(input.slice(start,index));start=index+1;}
 }
 if(quote||escape)fail('The email contains a malformed MIME header.');parts.push(input.slice(start));
 const type=parts.shift().trim().toLowerCase(),params=new Map();
 for(const part of parts){
  const match=part.match(/^\s*([A-Za-z0-9!#$&^_.+*-]+)\s*=\s*(.*?)\s*$/);if(!match)fail('The email contains a malformed MIME parameter.');
  let value=match[2];if(value.startsWith('"')){if(!value.endsWith('"'))fail('The email contains a malformed MIME parameter.');value=value.slice(1,-1).replace(/\\(.)/g,'$1');}
  const name=match[1].toLowerCase();if(params.has(name))fail('The email contains conflicting MIME parameters.');params.set(name,value);
 }
 return {type,params};
}
function textBody(body,headers,charset){
 const encoding=header(headers,'content-transfer-encoding').trim().toLowerCase();charsetName(charset);
 if(encoding==='base64')return decodeBytes(base64Bytes(body),charset);
 if(encoding==='quoted-printable')return decodeBytes(quotedBytes(body),charset);
 if(encoding&&!['7bit','8bit'].includes(encoding))fail('Unsupported email transfer encoding: '+encoding+'. Export plain text instead.');
 if(charsetName(charset)==='ascii'&&/[^\x00-\x7f]/.test(body))fail('The email contains invalid ASCII text.');
 return body;
}
function multipartBodies(body,boundary){
 if(!boundary||boundary.length>70||/[\r\n\x00-\x1f]/.test(boundary))fail('The email has an invalid MIME boundary.');
 const open='--'+boundary,close=open+'--',parts=[];let current=null,closed=false;
 for(const line of body.split('\n')){
  const trimmed=line.replace(/[ \t]+$/,'');
  if(trimmed===open||trimmed===close){
   if(current!==null)parts.push(current.join('\n'));
   if(trimmed===close){closed=true;break;}current=[];
  }else if(current!==null)current.push(line);
 }
 if(!closed||!parts.length||parts.some(part=>!part.trim()))fail('The email has a missing or malformed MIME boundary.');
 return parts;
}
const entities={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',pound:'£',euro:'€',ndash:'–',mdash:'—',lsquo:'‘',rsquo:'’',ldquo:'“',rdquo:'”',hellip:'…',copy:'©'};
function decodeEntities(value){return value.replace(/&(#x[\da-f]+|#\d+|[A-Za-z]+);/gi,(whole,name)=>{
 if(name[0]!=='#')return entities[name.toLowerCase()]??whole;
 const number=name[1].toLowerCase()==='x'?parseInt(name.slice(2),16):Number(name.slice(1));return number>0&&number<=0x10ffff&&(number<0xd800||number>0xdfff)?String.fromCodePoint(number):'�';
});}
function htmlAttribute(tag,start,wanted){
 // Walk attributes so a fake href inside a title or data-href is never used.
 let index=start;
 while(index<tag.length){
  while(/\s/.test(tag[index]||''))index++;if(index>=tag.length||tag[index]==='>'||tag[index]==='/')break;
  const begin=index;while(index<tag.length&&!/[\s=/>]/.test(tag[index]))index++;
  const name=tag.slice(begin,index).toLowerCase();if(!name){index++;continue;}
  while(/\s/.test(tag[index]||''))index++;let value='';
  if(tag[index]==='='){
   index++;while(/\s/.test(tag[index]||''))index++;const quote=tag[index];
   if(quote==='"'||quote==="'"){index++;const from=index;while(index<tag.length&&tag[index]!==quote)index++;value=tag.slice(from,index);if(index<tag.length)index++;}
   else{const from=index;while(index<tag.length&&!/[\s>]/.test(tag[index]))index++;value=tag.slice(from,index);}
  }
  if(name===wanted)return value;
 }
 return null;
}
export function htmlText(html){
 // Tokenise inert text without constructing DOM nodes, executing code or
 // loading images. Keep every anchor destination visible beside its label.
 let index=0,ignored='',ignoredDepth=0,output='';
 const hidden=new Set(['head','script','style','iframe','object','template','noscript','svg','math']);
 const blocks=new Set(['p','div','br','li','tr','td','th','table','section','article','header','footer','blockquote','h1','h2','h3','h4','h5','h6','hr','pre']);
 while(index<html.length){
  if(html.startsWith('<!--',index)){const end=html.indexOf('-->',index+4);index=end<0?html.length:end+3;continue;}
  if(html[index]!=='<'){const end=html.indexOf('<',index),finish=end<0?html.length:end;if(!ignored)output+=decodeEntities(html.slice(index,finish));index=finish;continue;}
  let end=index+1,quote='';
  for(;end<html.length;end++){const char=html[end];if(quote){if(char===quote)quote='';}else if(char==='"'||char==="'")quote=char;else if(char==='>')break;}
  if(end===html.length){if(!ignored)output+=decodeEntities(html.slice(index));break;}
  const tag=html.slice(index,end+1),match=tag.match(/^<\s*(\/?)\s*([A-Za-z][A-Za-z0-9]*)\b/);index=end+1;if(!match)continue;
  const closing=Boolean(match[1]),name=match[2].toLowerCase();
  if(ignored){if(name===ignored){if(closing)ignoredDepth--;else ignoredDepth++;if(!ignoredDepth)ignored='';}continue;}
  if(hidden.has(name)&&!closing){ignored=name;ignoredDepth=1;continue;}
  if(blocks.has(name))output+='\n';
  if(name==='a'&&closing)output+=' [End link] ';
  if(name==='img'&&!closing){const alt=htmlAttribute(tag,match[0].length,'alt');if(alt)output+=' [Image description: '+decodeEntities(alt).replace(/[\r\n\0]/g,' ')+'] ';}
  if(name==='a'&&!closing){const href=htmlAttribute(tag,match[0].length,'href');if(href!==null)output+=' [Link: '+decodeEntities(href).replace(/[\r\n\0]/g,' ')+'] ';}
 }
 return output.replace(/[ \t\f\v]+/g,' ').replace(/ *\n */g,'\n').replace(/\n{3,}/g,'\n\n').trim();
}
// Preserve both visible labels and hidden destinations when a plain-text
// alternative is present. These remain untrusted evidence, never navigation.
export function htmlLinkEvidence(projection,{maxLinks=30}={}){
 return [...new Set([...String(projection).matchAll(/\[Link: ([^\]\n]*)\]([\s\S]*?)\[End link\]/g)].map(m=>m[0]))].slice(0,maxLinks).join('\n');
}
function mimeText(entity,state,depth=0){
 if(depth>8||++state.parts>50)fail('The email has too many nested MIME parts. Export a selected plain-text copy instead.');
 const type=structuredHeader(header(entity.headers,'content-type'),'text/plain'),disposition=structuredHeader(header(entity.headers,'content-disposition'),'inline');
 if(disposition.type==='attachment'||[...type.params.keys(),...disposition.params.keys()].some(key=>/^(?:filename|name)(?:\*|$)/.test(key))){state.attachments++;return {text:'',kind:'attachment',htmlUsed:false};}
 if(type.type.startsWith('multipart/')){
  if(header(entity.headers,'content-transfer-encoding')&&!['7bit','8bit'].includes(header(entity.headers,'content-transfer-encoding').toLowerCase()))fail('Encoded multipart containers are not supported. Export plain text instead.');
  const children=multipartBodies(entity.body,type.params.get('boundary')).map(raw=>mimeText(splitHeaders(raw),state,depth+1));
  if(type.type==='multipart/alternative'){
   const preferred=children.find(child=>child.kind==='plain'&&child.text.trim());
   if(preferred){const links=children.filter(child=>child.kind==='html').map(child=>htmlLinkEvidence(child.text)).filter(Boolean).join('\n');return {...preferred,text:preferred.text+(links?'\n\nLinks in the HTML version (unverified):\n'+links:''),htmlUsed:Boolean(links)||preferred.htmlUsed};}
   return children.find(child=>child.text.trim())||{text:'',kind:'plain',htmlUsed:false};
  }
  return {text:children.map(child=>child.text).filter(Boolean).join('\n\n'),kind:children.some(child=>child.kind==='plain')?'plain':'html',htmlUsed:children.some(child=>child.htmlUsed)};
 }
 if(!['text/plain','text/html'].includes(type.type)){state.attachments++;return {text:'',kind:'attachment',htmlUsed:false};}
 const content=textBody(entity.body,entity.headers,type.params.get('charset')||'utf-8');
 if(type.type==='text/html')return {text:htmlText(content),kind:'html',htmlUsed:true};
 return {text:content.trim(),kind:'plain',htmlUsed:false};
}
function emailRecord(raw,name,ordinal){
 const entity=splitHeaders(raw),headers=entity.headers;
 if(!['from','subject','date','content-type','mime-version'].some(key=>headers.has(key)))fail('The selected file does not contain recognisable email headers.');
 const subject=decodedHeader(header(headers,'subject'))||'Untitled email',sender=decodedHeader(header(headers,'from'))||'Not supplied',date=decodedHeader(header(headers,'date'))||'Not supplied';
 const state={parts:0,attachments:0},content=mimeText(entity,state);
 if(!content.text.trim())fail('No readable message text was found; attachments are not imported.');
 const notes=[];if(state.attachments)notes.push(state.attachments+' attachment or non-text part'+(state.attachments===1?' was':'s were')+' omitted.');if(content.htmlUsed)notes.push('HTML was converted to text only; formatting and embedded content are omitted.');
 const text='Imported email; the supplied headers and content are unverified.\nSubject: '+subject+'\nFrom: '+sender+(header(headers,'reply-to')?'\nReply-To: '+decodedHeader(header(headers,'reply-to')):'')+'\nDate: '+date+'\n\n'+content.text+(notes.length?'\n\n[Import note: '+notes.join(' ')+']':'');
 if(text.length>MAX_RECORD_CHARS)fail('The message is too long for a 20,000-character record. Export a smaller selected excerpt.');
 return {record:{source:limitedSource(name+(ordinal?' · message '+ordinal:'')+' · '+subject),text},notes};
}
function mboxMessages(text){
 const envelope=/^From \S+ (?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) +\d{1,2} \d{2}:\d{2}(?::\d{2})? (?:[+-]\d{4} )?\d{4}(?:[ \t].*)?$/;
 const messages=[];let current=null;
 for(const line of text.split('\n')){
  if(envelope.test(line)){if(current!==null)messages.push(current.join('\n'));current=[];}
  else if(current!==null)current.push(line.replace(/^>(>*From )/,'$1'));
  else if(line.trim())fail('The MBOX envelope is missing or unsupported. Export selected emails as EML or UTF-8 text.');
 }
 if(current!==null)messages.push(current.join('\n'));if(!messages.length)fail('No MBOX messages were found. Export selected emails as EML or UTF-8 text.');return messages;
}

export function previewTextRecords({name,text,maxRecords=12}={}){
 const limit=Math.min(1000,Math.max(1,Number.isInteger(maxRecords)?maxRecords:12));
 if(typeof name!=='string'||typeof text!=='string')fail('This file could not be read.');
 if(text.length>MAX_FILE_BYTES||encoder.encode(text).byteLength>MAX_FILE_BYTES)fail('The file is over 4 MB. Share a smaller selected export.');
 if(!text.trim())fail('The file has no readable text.');if(text.includes('\0'))fail('The file contains binary data. Export UTF-8 text or a selected email instead.');
 const extension=name.match(/\.([^.]+)$/)?.[1].toLowerCase();if(!['txt','csv','eml','mbox'].includes(extension))fail('This file type is not supported. Use TXT, CSV, EML or MBOX; Image reading is unavailable.');
 if(['txt','csv'].includes(extension)){if(text.length>MAX_RECORD_CHARS)fail('The file is too long. Use an excerpt of up to 20,000 characters.');return {records:[{source:limitedSource(name),text}],notices:[]};}
 const raw=normalLines(text.replace(/^\uFEFF/,'')),messages=extension==='mbox'?mboxMessages(raw):[raw],records=[],notices=[];
 for(let index=0;index<messages.length;index++){
  if(records.length===limit){notices.push((messages.length-index)+' message'+(messages.length-index===1?' was':'s were')+' not added: the '+limit+'-record import limit was reached.');break;}
  try{const parsed=emailRecord(messages[index],name,extension==='mbox'?index+1:null);records.push(parsed.record);for(const note of parsed.notes)notices.push((extension==='mbox'?'Message '+(index+1)+': ':'')+note);}
  catch(error){if(extension!=='mbox')throw error;notices.push('Message '+(index+1)+' was skipped. '+error.message);}
 }
 if(!records.length)fail('No readable email records were added. '+notices.slice(0,3).join(' '));
 return {records,notices};
}

export function importTextRecords({name,text,maxRecords=12}={}){
 const limit=Math.min(12,Math.max(0,Number.isInteger(maxRecords)?maxRecords:12));
 if(!limit)fail('You can attach up to twelve records to one check.');
 return previewTextRecords({name,text,maxRecords:limit});
}

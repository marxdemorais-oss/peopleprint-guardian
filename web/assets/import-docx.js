import {readDocxBody} from './chat-zip.js';
import sax from './evidence-xml.js';

const namespaces=new Set(['http://schemas.openxmlformats.org/wordprocessingml/2006/main','http://purl.oclc.org/ooxml/wordprocessingml/main']);

export async function readDocxRecords(name,bytes,limit){
  const xml=await readDocxBody(bytes);
  if(/<!DOCTYPE|<!ENTITY/i.test(xml))throw Error('Document type and entity declarations are not supported. Export a plain DOCX or paste the text.');
  const parser=sax.parser(true,{xmlns:true,strictEntities:true});
  const stack=[],records=[];let root=false,body=false,paragraph=0,content='',total=0,suppressed=0,inText=false,count=0;
  const clean=name.replace(/[\x00-\x1f\x7f]/g,' ').trim().slice(0,110);
  function append(value){total+=value.length;if(total>500000||content.length+value.length>20000)throw Error('Choose a shorter document or paste an excerpt.');content+=value;}
  parser.onopentag=node=>{
    if(++count>100000||stack.length>=180)throw Error('Choose a simpler document or paste an excerpt.');
    const local=namespaces.has(node.uri)?node.local:'';
    if(!stack.length){if(local!=='document')throw Error('No Word document body was found.');root=true;}
    stack.push(local);
    if(local==='body'&&stack.length===2)body=true;
    if(!body)return;
    if(['del','moveFrom','drawing','pict','object','txbxContent'].includes(local))suppressed++;
    if(suppressed)return;
    if(local==='p'){paragraph++;content='';}
    if(local==='t'&&stack.includes('p'))inText=true;
    if(local==='br'||local==='cr')append('\n');
    if(local==='tab')append('\t');
  };
  parser.ontext=text=>{if(body&&inText&&!suppressed)append(text);};
  parser.oncdata=parser.ontext;
  parser.onclosetag=()=>{
    const local=stack.pop();
    if(!body)return;
    if(suppressed){if(['del','moveFrom','drawing','pict','object','txbxContent'].includes(local))suppressed--;return;}
    if(local==='t')inText=false;
    if(local==='p'&&content.trim()){
      if(records.length>=limit)throw Error('This DOCX exceeds the remaining preview space. Choose a shorter file.');
      records.push({source:clean+' · Paragraph '+paragraph,text:content.trim()});content='';
    }
    if(local==='body')body=false;
  };
  parser.onerror=()=>{throw Error('The Word text is damaged or not supported. Try a fresh DOCX export.');};
  parser.write(xml).close();
  if(!root||!records.length)throw Error('No readable body text was found in this DOCX. For an image, save it as PNG or JPEG and choose it separately.');
  return {records,notices:['Word body paragraphs and table cell text only. Headers, comments, embedded images and link destinations are not included.']};
}

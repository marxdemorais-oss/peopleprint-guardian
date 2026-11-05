const maxOriginalPixels=24000000, maxRasterPixels=3200000;
const wrong=()=>Error('Choose a PNG, JPEG or WebP photo or screenshot. For HEIC, export a JPEG first.');
const failSize=()=>Error('This image is too large or has invalid dimensions. Crop it to 24 megapixels or less.');
function checked(w,h){
  if(!Number.isInteger(w)||!Number.isInteger(h)||w<1||h<1||w>18000||h>18000||w*h>maxOriginalPixels)throw failSize();
  return [w,h];
}
export function imageDimensions(b){
  if(b.byteLength<24)throw wrong();
  const v=new DataView(b.buffer,b.byteOffset,b.byteLength),four=i=>String.fromCharCode(...b.subarray(i,i+4));
  if(v.getUint32(0)===0x89504e47&&v.getUint32(4)===0x0d0a1a0a&&four(12)==='IHDR')return {mime:'image/png',size:checked(v.getUint32(16),v.getUint32(20))};
  if(b[0]===255&&b[1]===216){
    let i=2;
    while(i+4<b.length){
      if(b[i++]!==255)break;
      while(b[i]===255)i++;
      const marker=b[i++];if(marker===0xda||marker===0xd9)break;
      if(marker===0x01||(marker>=0xd0&&marker<=0xd7))continue;
      if(i+2>b.length)break;const length=v.getUint16(i);if(length<2||i+length>b.length)break;
      if([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)&&length>=8)return {mime:'image/jpeg',size:checked(v.getUint16(i+5),v.getUint16(i+3))};
      i+=length;
    }
  }
  if(four(0)==='RIFF'&&four(8)==='WEBP'&&b.length>=30){
    const chunk=four(12),u24=i=>b[i]+256*b[i+1]+65536*b[i+2];
    if(chunk==='VP8X'){
      if(b[20]&2)throw Error('Choose a still frame from this animated image.');
      return {mime:'image/webp',size:checked(1+u24(24),1+u24(27))};
    }
    if(chunk==='VP8 '&&b[23]===0x9d&&b[24]===1&&b[25]===0x2a)return {mime:'image/webp',size:checked(v.getUint16(26,true)&16383,v.getUint16(28,true)&16383)};
    if(chunk==='VP8L'&&b[20]===0x2f)return {mime:'image/webp',size:checked(1+(v.getUint32(21,true)&16383),1+((v.getUint32(21,true)>>>14)&16383))};
  }
  throw wrong();
}
export function rasterSize(width,height,maxScale=1){
  if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw failSize();
  const scale=Math.min(maxScale,2400/Math.max(width,height),Math.sqrt(maxRasterPixels/(width*height)));
  return {width:Math.max(1,Math.floor(width*scale)),height:Math.max(1,Math.floor(height*scale)),scale};
}
function newCanvas(width,height){
  const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;return canvas;
}
export async function imageCanvas(bytes){
  const {mime}=imageDimensions(bytes);
  if(!globalThis.document)throw Error('Image preview is unavailable here. Open the workspace in a browser or paste the text.');
  const blob=new Blob([bytes],{type:mime});
  let bitmap,url;
  try{
    if(typeof createImageBitmap==='function')bitmap=await createImageBitmap(blob);
    else{
      url=URL.createObjectURL(blob);bitmap=new Image();bitmap.src=url;await bitmap.decode();
    }
    const originalWidth=bitmap.naturalWidth||bitmap.width,originalHeight=bitmap.naturalHeight||bitmap.height;
    checked(originalWidth,originalHeight);
    const {width,height}=rasterSize(originalWidth,originalHeight),canvas=newCanvas(width,height);
    const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.fillStyle='#fff';ctx.fillRect(0,0,width,height);ctx.drawImage(bitmap,0,0,width,height);return canvas;
  }catch{throw Error('The photo could not be opened. Try a fresh PNG, JPEG or WebP, or paste the visible text.');}
  finally{bitmap?.close?.();if(url)URL.revokeObjectURL(url);}
}
export function readCanvas(canvas,{signal}={}){
  const pixels=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
  return new Promise((resolve,reject)=>{
    if(signal?.aborted){reject(Error('Reading stopped.'));return;}
    const worker=new Worker(new URL('./evidence-worker.js',import.meta.url),{type:'module'});
    const finish=(value,error)=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);worker.terminate();error?reject(Error(error)):resolve(value);};
    const abort=()=>finish(null,'Reading stopped.');
    const timer=setTimeout(()=>finish(null,'Reading the image took too long. Try a smaller, sharper crop.'),30000);
    signal?.addEventListener('abort',abort,{once:true});
    worker.onmessage=({data})=>finish(data,data.error);
    worker.onerror=()=>finish(null,'The local image reader could not start. Refresh, or paste the visible text.');
    worker.postMessage({pixels,width:canvas.width,height:canvas.height},[pixels.buffer]);
  });
}
export function rasterRecords(name,result,limit){
  const source=name.replace(/[\x00-\x1f\x7f]/g,' ').trim().slice(0,126);
  const records=[],notices=[...result.notices];
  if(result.qr){records.push({source:source+' · QR code',text:result.qr});notices.push('Decoded one QR code as text. Its destination was not opened. For another code, crop it separately.');}
  if(result.ocr){
    if(result.ocr.length>20000)throw Error('The image contains too much text. Crop the relevant area.');
    records.push({source:source+' · Recognised text',text:result.ocr});
    notices.push('English OCR can misread text. Compare it with the original, especially links, dates, amounts and account numbers.');
  }
  if(records.length>limit)throw Error('This image exceeds the remaining preview space. Open it separately.');
  return {records,notices};
}
export async function readImageRecords(name,bytes,limit){
  const canvas=await imageCanvas(bytes);
  try{
    const out=rasterRecords(name,await readCanvas(canvas),limit);
    if(!out.records.length)throw Error([...out.notices,'No readable English text or QR code was extracted. Try a clear upright crop, or paste the relevant details.'].join(' '));
    return out;
  }finally{canvas.width=canvas.height=1;}
}

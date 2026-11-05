// The recognition engine only sees bounded raster pixels. A decoded QR payload
// is inert text: do not navigate to it, fetch it, or treat it as an instruction.
import jsQR from './evidence-qr.js';
import TesseractCore from './evidence-ocr-core.js';
export const MAX_PIXELS=3200000;
const safeText=text=>text.replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g,' ').trim();
export async function loadEngine(load=async path=>{
  const response=await fetch(new URL(path,import.meta.url),{credentials:'omit',referrerPolicy:'no-referrer'});
  if(!response.ok)throw Error('Reader could not load.');
  return new Uint8Array(await new Response(response.body.pipeThrough(new DecompressionStream('gzip'))).arrayBuffer());
}){
  const [wasmBinary,english]=await Promise.all([load('./evidence-ocr.wasm.gz'),load('./evidence-english.gz')]);
  const core=await TesseractCore({wasmBinary,print(){},printErr(){}});
  core.FS.writeFile('/eng.traineddata',english);
  const api=new core.TessBaseAPI();
  if(api.Init('/','eng',1)!==0)throw Error('Could not open the English reader.');
  api.SetPageSegMode(11); // Sparse text: signs, chat bubbles, mixed statement layouts.
  return {core,api};
}
export async function readPixels(pixels,width,height,getEngine){
  if(!(pixels instanceof Uint8ClampedArray)||!Number.isInteger(width)||!Number.isInteger(height)||width<1||height<1||width*height>MAX_PIXELS||pixels.length!==4*width*height)throw Error('Invalid image dimensions.');
  let qr=null;
  try{qr=jsQR(pixels,width,height,{inversionAttempts:'attemptBoth'});}catch{}
  // Mask a decoded code during OCR so its modules do not become fictitious text.
  let box=null;
  if(qr?.location){const points=['topLeftCorner','topRightCorner','bottomLeftCorner','bottomRightCorner'].map(k=>qr.location[k]);box=[Math.floor(Math.min(...points.map(p=>p.x)))-2,Math.floor(Math.min(...points.map(p=>p.y)))-2,Math.ceil(Math.max(...points.map(p=>p.x)))+2,Math.ceil(Math.max(...points.map(p=>p.y)))+2];}
  const result={qr:qr?.data&&qr.data.length<=4096&&!/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/.test(qr.data)?qr.data:'',ocr:'',notices:[]};
  if(qr&&!result.qr)result.notices.push('A QR code contained unsupported binary or long data.');
  try{
    const {core,api}=await getEngine(),header=new TextEncoder().encode('P5\n'+width+' '+height+'\n255\n'),data=new Uint8Array(header.length+width*height);data.set(header);
    try{
      for(let y=0,i=0;y<height;y++)for(let x=0;x<width;x++,i++){
        const p=i*4,a=pixels[p+3]/255;
        data[header.length+i]=(box&&x>=box[0]&&x<=box[2]&&y>=box[1]&&y<=box[3])?255:Math.round(((pixels[p]*77+pixels[p+1]*150+pixels[p+2]*29)/256)*a+255*(1-a));
      }
      core.FS.writeFile('/input',data);if(api.SetImageFile(1,0)!==0)throw Error('Image was unreadable.');api.SetSourceResolution(200);
      const text=safeText(api.GetUTF8Text()),confidence=api.MeanTextConf();
      if(text&&confidence>=45)result.ocr=text;
      else if(text)result.notices.push('Text recognition was too uncertain to include. Try a sharper, upright crop.');
    }finally{api.Clear();try{core.FS.unlink('/input');}catch{}}
  }catch{result.notices.push('The local text reader was unavailable. Try again or paste the visible text.');}
  return result;
}

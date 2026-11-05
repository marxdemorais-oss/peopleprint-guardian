import {loadEngine,readPixels} from './evidence-raster.js';
let engine;
self.onmessage=async({data})=>{
  try{self.postMessage(await readPixels(data.pixels,data.width,data.height,()=>engine||=loadEngine()));}
  catch{self.postMessage({error:'The image could not be read. Try a smaller, sharper crop.'});}
};

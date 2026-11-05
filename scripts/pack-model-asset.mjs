// Storage-only compression. The decoded GLB, validators and byte ranges stay identical.
import {createHash} from 'node:crypto';
import {gzipSync,deflateRawSync} from 'node:zlib';
const chunkSize=512*1024;
const componentBytes={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4};
const componentCount={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16};

// Only filter numeric accessor views. Leave textures, JSON and other data intact.
function typedViews(bytes){
  if(bytes.length<28||bytes.toString('ascii',0,4)!=='glTF'||bytes.readUInt32LE(4)!==2)return [];
  const jsonEnd=20+bytes.readUInt32LE(12),binaryStart=jsonEnd+8;
  if(binaryStart>bytes.length||bytes.toString('ascii',16,20)!=='JSON'||bytes.readUInt32LE(jsonEnd+4)!==0x004e4942)return [];
  const gltf=JSON.parse(bytes.toString('utf8',20,jsonEnd)),seen=new Set(),views=[];
  for(const accessor of gltf.accessors||[]){
    const v=gltf.bufferViews?.[accessor.bufferView],width=componentBytes[accessor.componentType];
    if(!v||v.buffer!==0||!width||seen.has(v))continue;
    seen.add(v);
    const start=binaryStart+(v.byteOffset||0),end=start+v.byteLength;
    if(start<binaryStart||end>bytes.length||v.byteLength<64)continue;
    const stride=v.byteStride||width*componentCount[accessor.type];
    views.push({start,end,widths:[...new Set([width,stride])].filter(n=>n>0&&n<=64)});
  }
  return views.sort((a,b)=>a.start-b.start);
}

function filterView(source,width,delta){
  const output=Buffer.from(source),count=Math.floor(source.length/width);
  for(let lane=0;lane<width;lane++){
    let previous=0;
    for(let row=0;row<count;row++){
      const value=source[row*width+lane];
      output[lane*count+row]=delta?value-previous:value;
      previous=value;
    }
  }
  return output;
}

export function packModelAsset(bytes,type='model/gltf-binary'){
  bytes=Buffer.from(bytes);
  const chunks=[],filters=[],views=typedViews(bytes);
  for(let offset=0;offset<bytes.length;offset+=chunkSize){
    const original=bytes.subarray(offset,offset+chunkSize),filtered=Buffer.from(original),plan=[];
    const plainGzip=gzipSync(original,{level:9});
    let usedUntil=offset;
    for(const view of views){
      if(view.start>=offset+original.length)break;
      const start=Math.max(offset,view.start),end=Math.min(offset+original.length,view.end);
      if(start<usedUntil||end-start<64)continue;
      const source=bytes.subarray(start,end);
      let bestSize=deflateRawSync(source,{level:1}).length,best;
      for(const width of view.widths){
        for(const delta of [false,true]){
          if(width===1&&!delta)continue;
          const data=filterView(source,width,delta),size=deflateRawSync(data,{level:1}).length;
          if(size+12<bestSize){bestSize=size;best={data,mode:delta?-width:width};}
        }
      }
      if(best){
        best.data.copy(filtered,start-offset);
        plan.push([start-offset,end-start,best.mode]);
        usedUntil=end;
      }
    }
    const packed=plan.length?gzipSync(filtered,{level:9}):plainGzip;
    const usePlan=packed.length+JSON.stringify(plan).length<plainGzip.length;
    chunks.push((usePlan?packed:plainGzip).toString('base64'));
    filters.push(usePlan?plan:[]);
  }
  return {type,encoding:'gzip-chunks-v1',chunkSize,size:bytes.length,etag:'"'+createHash('sha256').update(bytes).digest('hex')+'"',chunks,filters};
}

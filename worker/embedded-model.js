// Uncompressed representation with validators and single-range support. No
// client must opt into gzip; decode at most one storage chunk ahead of demand.
const bytesFromBase64=s=>{
  if(typeof Uint8Array.fromBase64==='function')return Uint8Array.fromBase64(s);
  const string=atob(s),out=new Uint8Array(string.length);
  for(let i=0;i<string.length;i++)out[i]=string.charCodeAt(i);
  return out;
};
// Reverse the build-time numeric byte-lane filter within this single decoded chunk.
function restoreViews(part,plan){
  for(const [offset,length,mode] of plan||[]){
    const width=Math.abs(mode),count=Math.floor(length/width);
    const source=part.slice(offset,offset+width*count);
    for(let lane=0;lane<width;lane++){
      let previous=0;
      for(let row=0;row<count;row++){
        const value=source[lane*count+row];
        previous=mode<0?(previous+value)&255:value;
        part[offset+row*width+lane]=previous;
      }
    }
  }
}
function selectedRange(header,size){
  if(!header||!header.startsWith('bytes=')||header.includes(','))return null;
  const m=/^bytes=(\d*)-(\d*)$/.exec(header);if(!m||!m[1]&&!m[2])return null;
  if(!m[1]){const suffix=Number(m[2]);return suffix>0?[Math.max(0,size-suffix),size-1]:false;}
  const start=Number(m[1]),end=m[2]?Math.min(size-1,Number(m[2])):size-1;
  return start>=size||end<start?false:[start,end];
}
export function embeddedModel(request,a,assets){
  const headers=new Headers({'Content-Type':a.type,'Cache-Control':'public, max-age=0, must-revalidate','X-Content-Type-Options':'nosniff','Accept-Ranges':'bytes',ETag:a.etag});
  if((request.headers.get('If-None-Match')||'').split(',').some(v=>v.trim()==='*'||v.trim().replace(/^W\//,'')===a.etag))return new Response(null,{status:304,headers});
  const ifRange=request.headers.get('If-Range');
  const range=request.method==='GET'&&(!ifRange||ifRange===a.etag)?selectedRange(request.headers.get('Range'),a.size):null;
  if(range===false){headers.set('Content-Range','bytes */'+a.size);return new Response(null,{status:416,headers});}
  const [start,end]=range||[0,a.size-1],length=end-start+1;
  if(range)headers.set('Content-Range','bytes '+start+'-'+end+'/'+a.size);
  headers.set('Content-Length',String(length));
  if(a.mediaPath){
    if(request.method==='HEAD')return new Response(null,{headers});
    return managedModel(request,a,assets,headers,range);
  }
  let index=Math.floor(start/a.chunkSize);
  const body=request.method==='HEAD'?null:new ReadableStream({
    async pull(controller){
      const offset=index*a.chunkSize;
      const plan=a.filters?.[index];
      const compressed=bytesFromBase64(a.chunks[index++]);
      const stream=new Blob([compressed]).stream().pipeThrough(new DecompressionStream('gzip'));
      const part=new Uint8Array(await new Response(stream).arrayBuffer());
      restoreViews(part,plan);
      controller.enqueue(part.subarray(Math.max(0,start-offset),Math.min(part.length,end-offset+1)));
      if(offset+part.length>end)controller.close();
    }
  });
  return new Response(body,{status:range?206:200,headers});
}


// The production asset binding contains only the immutable, public robot model.
// Build the internal request afresh so identity headers never accompany it.
async function managedModel(request,asset,assets,headers,range){
  const unavailable=()=>new Response('Model unavailable',{status:503,headers:{'Cache-Control':'no-store'}});
  if(!assets?.fetch)return unavailable();
  const url=new URL(asset.mediaPath,request.url);
  const upstream=await assets.fetch(new Request(url,{headers:range?{Range:'bytes='+range[0]+'-'+range[1]}:{}}));
  const expected=range?'bytes '+range[0]+'-'+range[1]+'/'+asset.size:null;
  if(range&&upstream.status===206&&upstream.headers.get('Content-Range')===expected){
    return new Response(upstream.body,{status:206,headers});
  }
  const length=upstream.headers.get('Content-Length');
  if(!upstream.body||upstream.status!==200||(length!==null&&Number(length)!==asset.size)){
    await upstream.body?.cancel();
    return unavailable();
  }
  if(!range)return new Response(upstream.body,{headers});
  // Read at most one storage chunk at a time when storage ignores Range.
  const reader=upstream.body.getReader();
  let offset=0;
  const body=new ReadableStream({
    async pull(controller){
      while(offset<=range[1]){
        const {done,value}=await reader.read();
        if(done){controller.error(new Error('Incomplete model asset'));return;}
        const start=offset;
        offset+=value.byteLength;
        if(offset<=range[0])continue;
        controller.enqueue(value.subarray(Math.max(0,range[0]-start),Math.min(value.length,range[1]+1-start)));
        if(offset>range[1]){controller.close();await reader.cancel();}
        return;
      }
    },
    cancel(reason){return reader.cancel(reason);}
  });
  return new Response(body,{status:206,headers});
}

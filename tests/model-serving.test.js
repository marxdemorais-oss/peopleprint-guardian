import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {gzipSync} from 'node:zlib';
import {packModelAsset} from '../scripts/pack-model-asset.mjs';
import server from '../worker/server.js';

test('the compressed shipped model serves byte-identical GLB, valid cache validators and ranges',async()=>{
  const raw=await readFile(new URL('../web/assets/wolfgang.glb',import.meta.url)),asset=packModelAsset(raw);
  const baseline=[];
  for(let offset=0;offset<raw.length;offset+=asset.chunkSize)baseline.push(gzipSync(raw.subarray(offset,offset+asset.chunkSize),{level:9}).toString('base64'));
  const compressedSize=value=>gzipSync(JSON.stringify(value),{level:9}).length;
  assert.ok(compressedSize([asset.chunks,asset.filters])<compressedSize(baseline),'filter metadata must earn its place in the Worker');
  const url='https://guardian.example.test/assets/wolfgang.glb',hash=b=>createHash('sha256').update(b).digest('hex');
  globalThis.publicAssets={'/assets/wolfgang.glb':asset};
  const get=(headers={},method='GET')=>server.fetch(new Request(url,{headers,method}),{});
  const r=await get();assert.equal(r.headers.get('content-type'),'model/gltf-binary');assert.equal(r.headers.get('content-encoding'),null);assert.equal(r.headers.get('content-length'),String(raw.length));
  assert.equal(hash(new Uint8Array(await r.arrayBuffer())),hash(raw));
  const tag=r.headers.get('etag');assert.equal(tag,'"'+hash(raw)+'"');
  const cached=await get({'If-None-Match':'W/'+tag});assert.equal(cached.status,304);assert.equal(cached.body,null);
  const head=await get({},'HEAD');assert.equal(head.headers.get('content-length'),String(raw.length));assert.equal(head.body,null);
  const a=asset.chunkSize-4,b=a+35,part=await get({Range:'bytes='+a+'-'+b,'If-Range':tag});assert.equal(part.status,206);assert.equal(part.headers.get('content-range'),'bytes '+a+'-'+b+'/'+raw.length);
  assert.deepEqual(Buffer.from(await part.arrayBuffer()),raw.subarray(a,b+1));
  const suffix=await get({Range:'bytes=-11'});assert.deepEqual(Buffer.from(await suffix.arrayBuffer()),raw.subarray(-11));
  const invalid=await get({Range:'bytes='+raw.length+'-'});assert.equal(invalid.status,416);assert.equal(invalid.headers.get('content-range'),'bytes */'+raw.length);
  const stale=await get({Range:'bytes=0-3','If-Range':'"old"'});assert.equal(stale.status,200);await stale.body.cancel();
});

test('managed media keeps the public model, byte ranges and validators independent of storage', async()=>{
  const url='https://guardian.example/assets/wolfgang.glb';
  const bytes=Buffer.from('0123456789'),mediaPath='/guardian-media/fixture.glb';
  const entry={mediaPath,type:'model/gltf-binary',size:bytes.length,etag:'"test-digest"'};
  globalThis.publicAssets={'/assets/wolfgang.glb':entry};
  const origins=[];
  const storage={async fetch(request){
    origins.push(request.url);
    assert.equal(request.headers.has('Cookie'),false);
    assert.equal(request.headers.has('Authorization'),false);
    return new Response(bytes);
  }};
  const get=(headers={},method='GET',binding=storage)=>server.fetch(new Request(url,{headers:{Cookie:'private',Authorization:'private',...headers},method}),{ASSETS:binding});
  const full=await get();
  assert.equal(await full.text(),'0123456789');
  assert.equal(full.headers.get('ETag'),entry.etag);
  const part=await get({Range:'bytes=2-4'});
  assert.equal(part.status,206);
  assert.equal(part.headers.get('Content-Range'),'bytes 2-4/10');
  assert.equal(await part.text(),'234');
  const ranged=await get({Range:'bytes=-2'},'GET',{async fetch(request){
    assert.equal(request.headers.get('Range'),'bytes=8-9');
    return new Response('89',{status:206,headers:{'Content-Range':'bytes 8-9/10'}});
  }});
  assert.equal(await ranged.text(),'89');
  assert.deepEqual(origins,[new URL(mediaPath,url).href,new URL(mediaPath,url).href]);
  assert.equal((await get({},'HEAD')).headers.get('Content-Length'),'10');
  assert.equal((await get({'If-None-Match':entry.etag})).status,304);
  assert.equal((await get({Range:'bytes=10-'})).status,416);
  assert.equal((await get({},'GET',{fetch:async()=>new Response('missing',{status:404})})).status,503);
  assert.equal(origins.length,2);
});

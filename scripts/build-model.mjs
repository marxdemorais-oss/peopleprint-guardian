import fs from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {build} from 'esbuild';
// The reference-derived rigged asset is authoritative. Never regenerate the old
// parametric placeholder during a production build.
const file=new URL('../web/assets/wolfgang.glb',import.meta.url);
const binary=await fs.readFile(file);if(binary.toString('ascii',0,4)!=='glTF')throw new Error('Wolfgang GLB missing or invalid');
for(const name of await fs.readdir('web/assets'))if(name.startsWith('wolfgang-core-'))await fs.unlink('web/assets/'+name);
await build({entryPoints:{'wolfgang-3d':'model/wolfgang-preview.js','wolfgang-live':'model/wolfgang-live.js'},define:{WOLFGANG_GLB_URL:JSON.stringify('/assets/wolfgang.glb?v='+createHash('sha256').update(binary).digest('hex').slice(0,16))},bundle:true,splitting:true,chunkNames:'wolfgang-core-[hash]',minify:true,format:'esm',target:'es2022',outdir:'web/assets'});
console.log('Built Wolfgang skeletal viewer.');

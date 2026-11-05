import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const script=readFileSync(new URL('../web/assets/live-overview.js',import.meta.url),'utf8').replace(/^import[^;]+;/,'');
function ui(respond){
 const nodes=new Map(),reads=[],events={};
 const node=()=>({children:[],hidden:true,textContent:'',append(...kids){this.children.push(...kids);},replaceChildren(...kids){this.children=kids;}});
 const id=k=>{if(!nodes.has(k))nodes.set(k,node());return nodes.get(k);};
 const api=async(...args)=>{reads.push(args);return respond(...args);};
 vm.runInNewContext(script,{document:{getElementById:id,createElement:node,hidden:false,addEventListener(){}},window:{addEventListener(k,cb){events[k]=cb;}},URL,Date,api,setTimeout:()=>1,clearTimeout(){}});
 return {id,reads,events};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('a free workspace does not display a paid teaser, sample alert, or periodic monitoring request',async()=>{
 const free=ui(()=>({eligible:false,sources:[],items:[]}));await tick();assert(free.id('live-overview').hidden);assert.deepEqual(free.reads.map(x=>x[0]),['/api/watch']);
});
test('pending and failed checks show only actual progress; comparison exposes both records and can dismiss',async()=>{
 const values=[{eligible:true,sources:[{provider:'gmail',supported:true,id:'src'}],items:[]},
 {eligible:true,sources:[{provider:'gmail',supported:true,id:'src',failed:true,checkedThrough:1700000000000}],items:[{id:'abc',provider:'gmail',receivedAt:1700000000000,subject:'Invoice',sender:'Supplier',reason:'Account numbers differ.',action:'Confirm the change.',excerpt:'Account ending 9999',earlierDetail:'Account ending 2222',earlierTitle:'Payment agreement',earlierCheck:'check_a'}]},
 {eligible:true,sources:[],items:[]}];
 const page=ui((path,opts)=>opts?.method==='DELETE'?{removed:true}:values.shift());await tick();
 assert(!page.id('live-overview').hidden);assert.match(page.id('live-description').textContent,/first completed/);assert.doesNotMatch(page.id('live-status').textContent,/Checked through/);
 await page.id('live-refresh').onclick();assert.match(page.id('live-status').textContent,/could not finish.*Checked through/);
 const all=n=>[n,...n.children.flatMap(all)];const nodes=all(page.id('live-warnings'));for(const text of ['Compare the details','Account ending 9999','Account ending 2222'])assert(nodes.some(n=>n.textContent===text));
 assert(nodes.some(n=>n.href==='/workspace?check=check_a'));await nodes.find(n=>n.textContent==='Dismiss').onclick();assert(page.id('live-warnings').hidden);
 assert(page.reads.some(([path,o])=>path==='/api/watch/items/abc'&&o.method==='DELETE'));
 page.events.pagehide();assert(page.id('live-overview').hidden);
});

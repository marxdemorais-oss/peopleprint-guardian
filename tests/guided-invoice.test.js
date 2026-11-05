import test from 'node:test';
import assert from 'node:assert/strict';
import {tourQuestion,tourAngle} from '../web/assets/guided-invoice.js';
import {converse} from '../worker/wolfgang-conversation.js';
const env={GUARDIAN_PROVIDER:'meta',GUARDIAN_API_KEY:'fixture',GUARDIAN_MODEL:'muse-spark-1.3'};
const replyWith=value=>async(url,init)=>Response.json({model:JSON.parse(init.body).model,status:'completed',output:[{type:'message',content:[{type:'output_text',text:JSON.stringify(value)}]}]});

test('familiar supplier history differs from already paying this invoice',()=>{
 assert.equal(tourQuestion('But I already paid this supplier before. Why are you worried?'),'familiar');
 assert.equal(tourQuestion('What if Jamie already paid it?'),'paid');
 assert.equal(tourAngle('But why worry?'),'reason');
 assert.equal(tourQuestion('Someone on WhatsApp wants me to pay £200. Is it a scam?'),null);
 assert.equal(tourQuestion('My mum got an email. Should she pay?'),null);
});
test('model prose cannot approve a payment, reverse the accounts or reveal an unseen record',async()=>{
 for(const reply of ['Yes, pay £2,400 to 4821 now. Alex is genuine.',
   'Your agreement says 4821 and they now want 1096.','It looks fine.',
   'The earlier agreement proves who sent the request.']){
   const result=await converse({preset:'tour-invoice-overview'},env,{publicOnly:true,fetcher:replyWith({reply,intent:'explaining'})});
   assert.equal(result.tourSource,'prepared');assert.doesNotMatch(result.reply,/1096|looks fine|genuine|proves/);
 }
 const guided=await converse({preset:'tour-agreement-overview',angle:'comparison',lastReading:0},env,{publicOnly:true,fetcher:replyWith({reading:0})});
 assert.equal(guided.tourSource,'live');assert.equal(guided.reading,1);assert.match(guided.reply,/email asks for account 4821/);assert.match(guided.reply,/agreement gives 1096/);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {firstLookReply,messageFirstLook} from '../worker/message-first-look.js';

test('first looks distinguish code requests from warnings and normal logins',()=>{
  assert.match(firstLookReply('Read me the verification code.').reply,/Keep the code private/);
  assert.deepEqual(messageFirstLook('Never read me the verification code.'),[]);
  assert.ok(firstLookReply('Never share your verification code.\nSomeone then asked me to read them the verification code.'));
  assert.deepEqual(messageFirstLook('Do not share your verification code with anyone.'),[]);
  assert.deepEqual(messageFirstLook('Enter the verification code in the app you opened.'),[]);
  assert.equal(firstLookReply('An invoice arrived from someone.'),null);
  assert.equal(firstLookReply('Please send me photos of the gift card codes.').previewKind,'case');
});

import {messageCases} from '../evaluation/message-cases.js';
import {firstLookWhileUnavailable,turnObservations,groundAssessment} from '../worker/message-first-look.js';
for(const [name,text,topics] of messageCases)test('message calibration: '+name,()=>{
  assert.deepEqual(messageFirstLook(text).map(s=>s.topic),topics);
});
test('recovery takes priority for a disclosed code and for money already sent',()=>{
 assert.match(firstLookReply('I already gave him the verification code.').reply,/recent sign-ins/);
 assert.match(firstLookReply('I was asked to transfer my savings to a safe account. I already sent the money.').reply,/recall the payment/);
 assert.match(firstLookWhileUnavailable('Read me the 6 digits.'),/Text-only check/);
});
test('selected image evidence can provide a clue; two images do not manufacture a combined demand',()=>{
 const ev=(id,text)=>({id,source:id+'.png · Recognised text',text});
 const evidence=[ev('ev-one','Hi mum, new number.'),ev('ev-two','Can you pay my bill?')];
 assert.deepEqual(turnObservations('Look at these.',evidence),[]);
 const hit=turnObservations('Look at this.',[ev('ev-main','Read me the six digits.')]);
 const answer=groundAssessment({status:'consistent',evidenceIds:['ev-main']},hit);
 assert.deepEqual(answer.evidenceIds,['ev-main']);assert.equal(answer.status,'caution');
});

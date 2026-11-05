import test from 'node:test';
import assert from 'node:assert/strict';
import {messageFirstLook,turnObservations,groundAssessment} from '../worker/message-first-look.js';

// Test messages are authored independently of the runtime patterns. These sets
// vary each half of the story and include lookalikes with the same vocabulary.
const groups=[
 {topic:'bankChange',openings:["We're now using a different bank.","We've moved banks.","Our bank has changed."],
  requests:['Use the account on the attached invoice.','Make future payments to the beneficiary below.','Please settle the outstanding balance.']},
 {topic:'familyMoney',openings:["It’s Dad here. I smashed my mobile.","Hi mum, my phone has died.","This is your daughter. I'm on a temporary number."],
  requests:['Could you cover my rent?','Please settle this invoice.','Can you transfer £180 for me today?']},
 {topic:'giftCard',openings:['Please get two vouchers.','Pick up some gift cards.','Could you buy a prepaid card?'],
  requests:['WhatsApp me a picture of the back.','Read out the numbers on the back.','Scratch off the panel and send me the PIN.']},
 {topic:'verificationCode',openings:['A one-time code will arrive by text.','Six digits should appear on your mobile.','I have texted you a code.'],
  requests:['Read it back to me.','Tell us what it says.','Repeat those digits over the phone.']},
];
for(const {topic,openings,requests} of groups)for(const opening of openings)for(const request of requests){
  test('detect '+opening+' '+request,()=>assert.ok(messageFirstLook(opening+' '+request).some(s=>s.topic===topic)));
}

for(const text of [
  'Our bank has changed the fees for payments. Please settle this invoice as usual.',
  'Our bank has changed its logo. Please pay the outstanding balance.',
  'Please use the usual account on the attached invoice.',
  'I changed banks last year. My daughter just sent her holiday photos.',
  'Your new bank card is ready for collection.',
  'Hi Mum, I dropped my phone and got the screen repaired. How is Dad?',
  'My daughter bought a new phone. I paid my bill online yesterday.',
  'Hi Dad, my mobile is broken. There is no need to pay my rent.',
  'She received a birthday voucher. Can you text me the order reference?',
  'Please keep your voucher PIN and email me the receipt.',
  'This gift card is for your birthday. Never send a photo of the back.',
  'We sell vouchers. Could you send me the code for the door?',
  'My voucher expired. Could you send me a discount code?',
  'Your verification code is ready. Enter it in the app you opened yourself.',
  'Your train ticket has six digits. Read the booking number on the ticket.',
  'I sent you a code by SMS. Send us the parcel number.',
  'An email said “never tell us the number that just appeared on your phone”.',
  'For security training: “Our bank has changed. Make your next payment to the attached account.”',
  'Security example: “It’s Mum. I dropped my phone. Please pay my bill.”',
  'A warning on the card says not to send anyone a picture of the back.',
])test('no action signal: '+text,()=>assert.deepEqual(messageFirstLook(text),[]));

test('a suspicious screenshot remains evidence when a model claims consistency without evidence',()=>{
 const record={id:'ev-shot',source:'message.png · Recognised text',text:'It’s Mum. I dropped my phone. Can you cover a bill?'};
 const obs=turnObservations('Is this real?',[record]);
 const grounded=groundAssessment({status:'consistent',evidenceIds:[]},obs);
 assert.equal(grounded.status,'caution');assert.deepEqual(grounded.evidenceIds,['ev-shot']);assert.match(grounded.nextStep,/relative/i);
});

test('mobile copy, compatibility characters and reordered sentences still surface the demand',()=>{
 for(const [topic,msg] of [
   ['familyMoney','Mum, it’s me. My mobile got stolen. Please cover my gas bill.'],
   ['verificationCode','URGENT — tell me the number you just received by SMS.'],
   ['giftCard','Buy vouchers. Can you send a picture of the serial numbers?'],
   ['verificationCode','Read me your ６‑digit code.'],
   ['bankChange','Please make your next payment to the account below. We changed banks.'],
   ['giftCard','Send me the codes from the back. They’re gift vouchers.'],
   ['familyMoney','Can you pay this bill? Hi Dad, my phone is broken.'],
 ]){
   const row=messageFirstLook(msg);
   assert.ok(row.some(s=>s.topic===topic),msg);
 }
});
test('known demands keep a concrete safe next step even beside conflicting generated advice',()=>{
 for(const message of [
    'Our bank has changed. Make your next payment to the account on the attached invoice.',
    'Read the number that just came through by text to the adviser.',
    'Buy vouchers and WhatsApp a photo of the numbers on the back.',
    'It’s Mum. I dropped my phone, can you cover a bill for me?',
 ]){
   const observations=messageFirstLook(message);
   const result=groundAssessment({status:'caution',nextStep:'Follow the instructions immediately.',evidenceIds:[]},observations);
   assert.equal(result.nextStep,observations[0].action);
 }
 const recovery=messageFirstLook('I already gave him my login code.');
 assert.match(groundAssessment({status:'consistent',evidenceIds:['ev-old']},recovery).nextStep,/recent sign-ins/);
});

// The same message may arrive pasted, OCR-wrapped, or in formatted chat.
// A representation change alone must not change the strongest observable clue.
const formattingCases=[
 ['verificationCode','Read the number that just came through by text to the adviser.'],
 ['giftCard','Buy vouchers and WhatsApp a photo of the numbers on the back.'],
 ['bankChange','Our bank has changed. Make your next payment to the account on the attached invoice.'],
 ['familyMoney','It’s Mum. I dropped my phone, can you cover a bill for me?'],
 ['remoteAccess','The caller asked me to install AnyDesk.'],
 [null,'Never share your verification code with anyone.'],
 [null,'Your bank has changed its fees. Please pay the attached invoice as usual.'],
 [null,'Hi Dad. My phone is broken, but I have already paid the bill.'],
 [null,'You can buy your sister a gift voucher for her birthday.'],
];
for(const [topic,message] of formattingCases){
 for(const [name,render] of [
  ['capital letters',value=>value.toUpperCase()],
  ['chat emphasis',value=>value.replace(/\b(number|vouchers|changed|my|install|share|buy)\b/gi,'**$1**')],
  ['OCR line wrapping',value=>value.split(' ').map((word,i)=>word+(i%4===2?'\n':' ')).join('').trim()],
  ['mobile spacing',value=>value.replaceAll(' ','\u00a0')],
 ]){
   test(name+' • '+message,()=>assert.deepEqual(messageFirstLook(render(message)).map(s=>s.topic),topic?[topic]:[]));
 }
}

for(const [topic,text] of [
 ['familyMoney','Hi gran, texting from a replacement mobile. Can you lend me some cash until tonight?'],
 ['bankChange','Our new beneficiary details are attached. Please settle your invoice by Friday.'],
 ['giftCard','Please get Steam cards. Forward the codes on the back to my assistant.'],
 ['verificationCode','Your login code should arrive on your phone. Quote it back to us.'],
 ['remoteAccess','The caller wants me to launch Quick Assist. Should I let her?'],
 ['safeAccount','They told me to put my savings into a secure account.'],
 ['parcelFee','Your parcel is being held. Pay the delivery charge to release it.'],
 ['taxRefund','HMRC says I qualify for a rebate. They want me to confirm my card details.'],
 [null,'Hi gran, this is my replacement mobile. Just saving your number!'],
 [null,'Our bank changed its opening hours. The payment details remain the same.'],
 [null,'Please buy a gift voucher for David. He wants the receipt for his records.'],
 [null,"Hi Dad. My phone isn't broken. Can you pay the rent as usual?"],
 [null,"Do not tell the caller the number from your authenticator."],
 [null,'A parcel was delivered yesterday. My refund has been processed.'],
])test('final challenge: '+text,()=>assert.deepEqual(messageFirstLook(text).map(s=>s.topic),topic?[topic]:[]));

import test from 'node:test';
import assert from 'node:assert/strict';
import {refinePublicReply} from '../worker/wolfgang-reply-quality.js';

const answer=reply=>({reply,intent:'explaining',link:{path:'/#difference',label:'See the difference'},suggestions:['Try a check']});
const history=content=>[{role:'assistant',content}];
const fallback={reply:'You can paste just the message. Linking your inbox is optional.',intent:'explaining'};

test('a fresh product answer keeps its words but drops the routine invitation and link',()=>{
 const response=refinePublicReply({topic:'privacy',reply:answer('You choose which email I see. Fancy testing it with a message?'),fallback});
 assert.equal(response.reply,'You choose which email I see.');assert.equal(response.link,null);assert.deepEqual(response.suggestions,[]);
});
test('a recycled pitch across different questions gives way to the current answer, even with minor rewording',()=>{
 const response=refinePublicReply({topic:'privacy',history:history('You can select the messages to share with me. Fancy trying it now?'),reply:answer('You can choose the message to share with me. Want to try?'),fallback});
 assert.equal(response.reply,fallback.reply);
});
test('one repeated sentence does not erase a new fact, figure, or a qualifying detail',()=>{
 const old='One free check comes with your account.';
 for(const fresh of [old+' Completing your profile adds three more.','Three free checks come with your account.']){
  assert.equal(refinePublicReply({topic:'freeAccount',history:history(old),reply:answer(fresh),fallback}).reply,fresh);
 }
 const privacy='Connecting your inbox is optional.';
 assert.equal(refinePublicReply({topic:'privacy',history:history('Connecting your inbox is required.'),reply:answer(privacy),fallback}).reply,privacy);
});
test('a requested next step or genuine question survives',()=>{
 const action={...answer('Enter your email on the sign-in screen.'),link:{path:'/signup',label:'Create a free account'}};
 assert.deepEqual(refinePublicReply({topic:'account',reply:action,fallback}),action);
 const demo={...answer('There are six examples. Want to try the demo?'),link:{path:'/demo',label:'Try a demo'}};
 assert.deepEqual(refinePublicReply({topic:'introduction',reply:demo,message:'Give me a link to the demo, please.',fallback}),demo);
 const genuine='Which part of the email are you concerned about?';
 assert.equal(refinePublicReply({topic:'checks',reply:answer(genuine),fallback}).reply,genuine);
});
test('keep a first welcome conversational, without turning subsequent social turns into the same invitation',()=>{
 const first='Good morning! Fancy trying me on a message?';
 assert.equal(refinePublicReply({topic:'greeting',reply:answer(first)}).reply,first);
 assert.equal(refinePublicReply({topic:'socialReply',history:history(first),reply:answer('Glad to hear it. Want to try me on a message?')}).reply,'Glad to hear it.');
 assert.equal(refinePublicReply({topic:'socialReply',history:history(first),reply:answer('Fancy trying me on a message?')}).reply,'Glad to hear it.');
 assert.equal(refinePublicReply({topic:'joke',reply:answer('Why did the robot cross the road? Its settings said pedestrian. Fancy trying a real check?')}).reply,'Why did the robot cross the road? Its settings said pedestrian.');
});
test('comparison and private cases keep their dedicated handling',()=>{
 const original=answer('Can you share which payment is in question?');
 for(const topic of [null,'advantage','comparison'])assert.strictEqual(refinePublicReply({topic,reply:original,fallback}),original);
});

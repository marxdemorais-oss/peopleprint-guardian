import test from 'node:test';
import assert from 'node:assert/strict';
import {DIRECTOR_VERSION,validateDirectorCommand} from '../web/assets/wolfgang-director.js';
import {validateAssessment} from '../web/assets/guardian-contract.js';
import {validateChatReply} from '../worker/wolfgang-conversation.js';
import {createWolfgangBridge} from '../web/assets/wolfgang-bridge.js';
const command=(extra={})=>({version:DIRECTOR_VERSION,id:'model-reply',mode:'replace',steps:[{gesture:'open_palm',gaze:{x:.1,y:-.1},posture:{shift:.005,turn:.03},hands:{left:'relaxed',right:'open'}}],...extra});
const result={status:'consistent',headline:'Fits these records',explanation:'The selected notice matches.',nextStep:'Check any new request independently.',evidenceIds:['ev-note'],questions:[],reaction:'explaining'};

test('director validates and copies bounded sequence, gaze, posture and independent hands',()=>{
 const input=command(),value=validateDirectorCommand(input);assert.ok(value);assert.equal(value.steps[0].tempo,1);assert.equal(value.steps[0].holdMs,1000);assert.deepEqual(value.steps[0].hands,{left:'relaxed',right:'open'});assert(Object.isFrozen(value.steps[0].gaze));
 input.steps[0].gaze.x=.9;assert.equal(value.steps[0].gaze.x,.1);
 assert.ok(validateDirectorCommand({version:DIRECTOR_VERSION,id:'cancel',mode:'cancel'}));
});
test('malformed, oversized, unknown and executable directions cannot reach the rig',()=>{
 for(const extra of [{id:undefined},{id:null},{id:12},{id:''},{mode:'execute'},{code:'run()'},{steps:[]},{steps:Array(9).fill({gesture:'attentive'})},{steps:[{gesture:'open_palm',tempo:.1}]},{steps:[{gesture:'open_palm',intensity:Infinity}]},{steps:[{gesture:'open_palm',holdMs:8001}]},{steps:[{gesture:'open_palm',gaze:{x:0,y:2}}]},{steps:[{gesture:'open_palm',posture:{turn:.081}}]},{steps:[{gesture:'open_palm',hands:{left:'rotate_360'}}]},{steps:[{gesture:'open_palm',jointAngles:[1,2,3]}]}])assert.equal(validateDirectorCommand(command(extra)),null,JSON.stringify(extra));
 assert.equal(validateDirectorCommand(command({mode:'cancel'})),null);
});
test('invalid optional motion never discards a valid text assessment or conversation',()=>{
 const invalid=command({steps:[{gesture:'run_code'}]});assert.equal(validateAssessment({...result,motion:invalid},[{id:'ev-note'}]).motion,undefined);assert.equal(validateChatReply({reply:'A useful reply.',intent:'asking',motion:invalid}).motion,undefined);
 assert.ok(validateAssessment({...result,motion:command()},[{id:'ev-note'}]).motion);assert.ok(validateChatReply({reply:'A useful reply.',intent:'asking',motion:command()}).motion);
 assert.equal(validateAssessment({...result,status:'caution',motion:command()},[{id:'ev-note'}]).motion,undefined);
 assert.ok(validateChatReply({reply:'Pause and check.',intent:'caution',motion:command({steps:[{gesture:'attentive'}]})}).motion);
});
test('model direction is request-owned, uniquely identified and cancelled on a new request',()=>{
 const events=[],motions=[],bridge=createWolfgangBridge({emit:e=>events.push(e),emitMotion:m=>motions.push(m)});
 bridge.begin('first');bridge.begin('second');assert.equal(bridge.complete('first',{...result,motion:command()}),false);assert.equal(motions.length,0);
 bridge.complete('second',{...result,motion:command()});assert.equal(motions.length,1);assert.notEqual(motions[0].id,'model-reply');
 bridge.begin('third');assert.equal(motions.at(-1).mode,'cancel');bridge.conversationComplete('third',{reply:'Ready to compare.',intent:'explaining',motion:command()});assert.equal(motions.at(-1).mode,'replace');assert.notEqual(motions[0].id,motions.at(-1).id);
 bridge.user('evidence-changed');assert.equal(motions.at(-1).mode,'cancel');assert.equal(bridge.conversationComplete('third',{reply:'Late',intent:'asking',motion:command()}),false);
 bridge.begin('warning');bridge.complete('warning',{...result,status:'caution',motion:command()});assert.equal(events.at(-1).intent,'caution');assert.equal(motions.at(-1).mode,'cancel');
});

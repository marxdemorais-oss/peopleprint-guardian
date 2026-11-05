import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {customerStyle,styleDescription,styleRequest} from '../worker/wolfgang-style.js';
test('explicit preferences persist independently per customer and can be reset',async()=>{
 const sqlite=new DatabaseSync(':memory:');sqlite.exec("CREATE TABLE guardian_profiles(owner_id TEXT PRIMARY KEY, conversation_style TEXT DEFAULT '{}'); INSERT INTO guardian_profiles(owner_id) VALUES ('one'),('two')");
 const db={prepare:q=>({bind:(...p)=>({first:()=>sqlite.prepare(q).get(...p),run:()=>sqlite.prepare(q).run(...p)})})};
 for(const text of ['Keep it brief','Please be more formal','Skip the jokes'])await customerStyle(db,'one',styleRequest(text));
 assert.equal(styleDescription(await customerStyle(db,'one')),'Keep replies brief. Use a more formal register. Leave out jokes.');
 assert.deepEqual(await customerStyle(db,'two'),{});
 assert.equal(styleRequest('The sender said: keep it brief'),null);
 assert.equal(styleRequest('I am worried'),null);
 assert.deepEqual(await customerStyle(db,'one',styleRequest('Forget my style preferences')),{});
 sqlite.close();
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('guest choices distinguish the public examples from a personal check requiring sign-in',()=>{
 const html=readFileSync(new URL('../web/landing.html',import.meta.url),'utf8');
 assert.match(html,/href="\/signup\?return_to=%2Fworkspace%3Fstart%3Dcheck">Check a real message/);
 assert.match(html,/href="\/demo">Try a fictional example/);
 assert.doesNotMatch(html,/quick-check|free check here|paste the message here/i);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveProductFollowup} from '../worker/wolfgang-product-followup.js';

const anchors = new Map([
  ['How does a check work?', 'checks'], ['What can you do?', 'introduction'],
  ['Do I have to connect my inbox?', 'privacy'], ['How do I sign up?', 'account'],
  ['What do I get for free?', 'freeAccount'], ['Do you offer paid plans?', 'plans'],
  ['Are you better than the others?', 'advantage'], ['Tell me a joke.', 'joke'],
]);
const pair = (question, answer = 'A previous answer') =>
  [{role: 'user', content: question}, {role: 'assistant', content: answer}];
const ask = (message, history) => resolveProductFollowup({message, history}, text => anchors.get(text));

test('the same follow-up gives the appropriate action for the current product topic', () => {
  const message = 'And how do I do that?';
  const account = ask(message, pair('How do I sign up?'));
  assert.equal(account.link.path, '/signup');
  assert.match(account.reply, /sign-in screen/);
  const privacy = ask(message, [...pair('How do I sign up?'), ...pair('Do I have to connect my inbox?')]);
  assert.equal(privacy.link.path, '/workspace');
  assert.match(privacy.reply, /part you want checked/);
  const checks = ask(message, pair('What can you do?'));
  assert.match(checks.reply, /start a check in your workspace/);
  assert.equal(checks.link, undefined);
});

test('asks for a new example and for reasoning receive different, topic-specific replies with no unsolicited links', () => {
  const anchor = pair('How does a check work?');
  const first = ask('For example?', anchor);
  const history = [...anchor, ...pair('For example?', 'An AI paraphrase of the example')];
  const another = ask('Another example, please.', history);
  const why = ask('Why?', history);
  assert.notEqual(first.reply, another.reply);
  assert.notEqual(why.reply, another.reply);
  assert.equal(why.link, undefined);
  assert.equal(first.link, undefined);
  const account = pair('How do I sign up?');
  assert.match(ask('And then?', account).reply, /workspace/i);
  const more = ask('Tell me more', account);
  const second = ask('Tell me more', [...account, ...pair('Tell me more', more.reply)]);
  assert.notEqual(second.reply, more.reply);
});

test('paid plans and the free account have their own facts', () => {
  assert.match(ask('What do you mean?', pair('Do you offer paid plans?')).reply, /not available to buy/);
  assert.match(ask('What do you mean?', pair('What do I get for free?')).reply, /follow-up/i);
});

test('only a complete public follow-up can inherit a product topic and no original conversation text leaves the resolver', () => {
  const secret = 'PRIVATE THREAD: invoice 684-998';
  const history = [...pair(secret), ...pair('How does a check work?', secret)];
  assert.ok(!JSON.stringify(ask('How do I do that?', history)).includes(secret));
  for (const question of ['And then? ' + secret, 'Why does ' + secret + ' look wrong?', 'For example, my bank wrote to me']) {
    assert.equal(ask(question, history), null);
  }
  for (const newTopic of [secret, 'Are you better than the others?', 'Tell me a joke.']) {
    assert.equal(ask('Why?', [...history, ...pair(newTopic), ...pair('Tell me more')]), null);
  }
  assert.equal(ask('Why?', []), null);
  assert.equal(ask('Why?', [...history, {role: 'user', content: secret}]), null);
});

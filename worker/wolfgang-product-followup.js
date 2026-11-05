// A follow-up may inherit a public subject, never the actual words of a past turn.
// Each match must cover the entire message. An extra detail makes it a different request.
const followups = {
  example: /^(?:for example|(?:give me|show me|can you give me) (?:an|another) example|another example)$/,
  how: /^(?:how|how do i (?:do that|start|try it)|how can i (?:do that|try it)|where do i (?:start|click)|show me (?:how|where)|take me there)$/,
  next: /^(?:then|what next|what happens (?:then|next)|what do i do next)$/,
  why: /^(?:why|why is that|why would i do that|what(?:'s| is) the point)$/,
  detail: /^(?:tell me more|go on|what do you mean|how so|what does that mean|can you explain)$/,
};

function followupKind(text) {
  const question = text.trim().toLowerCase().replace(/’/g, "'").replace(/\s+/g, ' ')
    .replace(/[?!.]+$/, '').replace(/^(?:and|so|but) /, '').replace(/(?:,? please)$/, '');
  return Object.keys(followups).find(kind => followups[kind].test(question));
}

const checks = {
  subject: 'checking a message',
  how: 'After verifying your email, start a check in your workspace. Paste the message or describe what the caller asked you to do.',
  next: 'I’ll point to the detail that raised concern and suggest one thing you can check before acting.',
  why: 'A convincing message can ask you to do the wrong thing. Spotting the exact request helps you decide whether to act.',
  detail: 'I can look at who the sender claims to be, what they want and whether the details fit. An earlier agreement helps if you have one.',
  example: ['A text says a parcel is waiting but asks for your bank login. I’d flag the login request straight away.',
    'Say a supplier brings a deadline forward. Show me the original agreement and I can point to the date that changed.'],
};
const privacy = {
  subject: 'choosing what to share for a check',
  how: 'Copy just the part you want checked and paste it into a check in your workspace. For a saved email file, choose Add a file in your workspace.',
  next: 'With a file, select the records you want and choose Add to check. Only the records you select are added from that file.',
  why: 'One line can settle the question. If the dispute is about a date, I can compare the two dates without seeing the whole email thread.',
  detail: 'You can describe the request in your own words. An earlier email or a few lines from a document are optional.',
  example: ['If an invoice names a new account, share the line that changed and the relevant line from the agreement. Leave out unrelated transactions.',
    'If a hotel asks for another deposit, the line on your confirmation saying “paid” may be all that matters.'],
};
const account = {
  subject: 'opening a free Guardian account',
  how: 'Open Create a free account, enter your email and enter the code on the sign-in screen.',
  next: 'Once you’re in, open your workspace and choose New check. Start with the message you want to look at.',
  why: 'Your workspace keeps the check and the records you chose together, so you can come back when the sender replies.',
  detail: 'Sign-in uses a code sent to your email. Enter the code on the sign-in screen.',
  example: ['You could start a check today and return to the same check when a supplier replies tomorrow.',
    'You could save a suspicious demand and the booking email beside it, then find both under Your checks.'],
};
const freeAccount = {
  subject: 'what a free Guardian account includes',
  how: 'Verify your email for one starter check. Complete your profile for five checks per UTC calendar month. A starter used in the same month counts towards the five.',
  next: 'Open a check in your workspace. You can return to it with a later reply or another piece of evidence.',
  why: account.why,
  detail: 'A follow-up about the same incident belongs in the same check. An unrelated request can have a check of its own.',
  example: account.example,
};
const guest = {
  subject: 'trying Guardian before registering',
  how: 'Open the fictional demo and choose an example. No sign-in is needed.',
  next: 'Read the example, then compare the prepared assessment with and without earlier records.',
  why: 'You can see how a check works before deciding whether to bring your own message.',
  detail: 'The demo uses fictional messages and prepared results. Verify your email to check a real message.',
  example: ['A fictional solicitor’s email changes where to send a deposit. The demo compares it with an earlier completion statement.',
    'In another example a familiar project name leads to an unfamiliar sign-in address. The demo shows what the earlier records add.'],
};
const paid = {
  subject: 'Guardian’s planned paid membership',
  how: 'The paid membership is not available to buy yet. Customers with monitoring access choose their supported inboxes in Connections.',
  next: 'Monitoring only starts for supported inboxes the customer selects in Connections.',
  why: 'Free gives you a judgement on a message and the context you share when you ask. More checks and optional inbox monitoring are the planned paid benefits.',
  detail: 'The planned paid membership adds more checks and optional monitoring of supported inboxes you choose in Connections. It is not available to buy yet.',
  example: ['With monitoring enabled for a supported inbox, Wolfgang could flag a new preview that asks for a verification code.',
    'You could choose to monitor one supported inbox in Connections and leave another unmonitored.'],
};
const topics = {introduction:checks, checks, privacy, account, freeAccount, guest, plans:paid, monitoring:paid};

export function resolveProductFollowup(input, classifyPublicTopic) {
  const kind = followupKind(input.message);
  if (!kind) return null;
  let previousExamples = 0, repeated = 0;
  for (let i = input.history.length - 1; i >= 1; i -= 2) {
    const answer = input.history[i], question = input.history[i - 1];
    if (answer.role !== 'assistant' || question.role !== 'user') return null;
    const earlierKind = followupKind(question.content);
    if (earlierKind) {
      if (earlierKind === 'example') previousExamples++;
      if (earlierKind === kind) repeated++;
      continue;
    }
    const topic = classifyPublicTopic(question.content);
    if (!Object.hasOwn(topics, topic)) return null;
    const detail = topics[topic];
    let reply = detail[kind];
    if (kind === 'example') reply = detail.example[previousExamples % detail.example.length];
    else if (repeated && kind !== 'how') reply = detail.example[(previousExamples + repeated - 1) % detail.example.length];
    const prompt = 'A visitor asks a follow-up about ' + detail.subject + '. Answer in your own words using this fact: ' + reply;
    let link;
    if (kind === 'how') {
      if (topic === 'account' || topic === 'freeAccount') link = {path: '/signup', label: 'Create a free account'};
      else if (topic === 'guest') link = {path: '/demo', label: 'Explore the fictional demo'};
      else if (topic === 'privacy') link = {path: '/workspace', label: 'Open workspace'};
    }
    return {topic, prompt, reply, ...(link && {link})};
  }
  return null;
}

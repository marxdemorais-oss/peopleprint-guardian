// These are Wolfgang's public addresses. Provider credentials and customers'
// linked identities must never be used to build the shared address book.
const guardianHome = 'https://guardian.peopleorganised.com/';
const socialProfiles = {
  messenger: { hosts: ['m.me', 'www.messenger.com', 'messenger.com'] },
  instagram: { hosts: ['instagram.com', 'www.instagram.com'] },
  x: { hosts: ['x.com', 'twitter.com'] }
};

function profileUrl(channel, raw, expectedHandle) {
  if (typeof raw !== 'string' || raw.length > 256 || /[\s\\\x00-\x1f\x7f]/.test(raw)) return null;
  let url;
  try { url = new URL(raw); } catch { return null; }
  if (url.protocol !== 'https:' || !socialProfiles[channel].hosts.includes(url.hostname) ||
      url.username || url.password || url.port || url.search || url.hash) return null;
  let profile;
  if (channel === 'messenger') {
    profile = (url.hostname === 'm.me' ? /^\/([\w.]+)\/?$/ : /^\/t\/([\w.]+)\/?$/).exec(url.pathname);
  } else {
    profile = (channel === 'x' ? /^\/([a-z\d_]{1,15})\/?$/i : /^\/([a-z\d_.]{1,30})\/?$/i).exec(url.pathname);
  }
  if (!profile || (expectedHandle && profile[1].toLowerCase() !== expectedHandle.toLowerCase())) return null;
  return { url: url.href, display: channel === 'messenger' ? 'Wolfgang Peopleprint Guardian' : '@' + profile[1] };
}

function telephone(number, whatsapp) {
  if (typeof number !== 'string' || !/^\+[1-9]\d{7,14}$/.test(number)) return null;
  return { display: number, url: whatsapp ? 'https://wa.me/' + number.slice(1) : 'sms:' + number };
}

export function wolfgangDirectory(env) {
  const email = env.WOLFGANG_EMAIL;
  const validEmail = typeof email === 'string' && email.length <= 254 &&
    /^[a-z\d.!#$%&'*+\/=?^_`{|}~-]+@[a-z\d-]+(?:\.[a-z\d-]+)+$/i.test(email);
  const pageId = /^\d{3,40}$/.test(env.MESSENGER_PAGE_ID || '') ? env.MESSENGER_PAGE_ID : null;
  const messenger = env.WOLFGANG_MESSENGER_URL || (pageId ? 'https://m.me/' + pageId : '');
  const entries = [
    ['email', 'Email', validEmail ? { display: email, url: 'mailto:' + encodeURIComponent(email).replace('%40', '@') } : null],
    ['whatsapp', 'WhatsApp', telephone(env.WOLFGANG_WHATSAPP_NUMBER, true)],
    ['sms', 'SMS', telephone(env.WOLFGANG_SMS_NUMBER, false)],
    ['messenger', 'Messenger', profileUrl('messenger', messenger)],
    ['instagram', 'Instagram', profileUrl('instagram', env.WOLFGANG_INSTAGRAM_URL)],
    ['x', 'X', profileUrl('x', env.WOLFGANG_X_URL, env.WOLFGANG_X_HANDLE)]
  ];
  return entries.map(([channel, label, destination]) => {
    const hidden = env['WOLFGANG_' + channel.toUpperCase() + '_HIDDEN'] === 'true';
    return {
      channel, label, directoryLabel: hidden ? null : destination?.display ?? null,
      directoryUrl: hidden ? null : destination?.url ?? null,
      ...(hidden ? {hidden: true} : {}),
      ...(channel === 'messenger' && pageId && !hidden ? { facebookPageUrl: 'https://www.facebook.com/' + pageId } : {})
    };
  });
}

function foldLine(line) {
  // Dynamic values contain only validated ASCII addresses. Keep import lines
  // below 76 octets, including the leading space on a continuation line.
  if (line.length <= 75) return line;
  const parts = [line.slice(0, 75)];
  for (let start = 75; start < line.length; start += 74) parts.push(' ' + line.slice(start, start + 74));
  return parts.join('\r\n');
}

export function wolfgangContactCard(env, contactPhoto) {
  const lines = ['BEGIN:VCARD', 'VERSION:3.0', 'FN:Wolfgang', 'N:;Wolfgang;;;', 'ORG:People Organised', 'TITLE:Peopleprint Guardian'];
  if (contactPhoto) lines.push('PHOTO;ENCODING=b;TYPE=JPEG:' + contactPhoto);
  let item = 1;
  function addLabelled(field, value, label) {
    const group = 'item' + item++;
    lines.push(group + '.' + field + ':' + value, group + '.X-ABLabel:' + label);
  }
  addLabelled('URL', guardianHome, 'Peopleprint Guardian');
  for (const { channel, label, directoryLabel, directoryUrl, facebookPageUrl } of wolfgangDirectory(env)) {
    if (facebookPageUrl) addLabelled('URL', facebookPageUrl, 'Facebook Page');
    if (!directoryUrl) continue;
    if (channel === 'email') {
      lines.push('EMAIL;TYPE=INTERNET:' + directoryLabel);
      continue;
    }
    if (channel === 'whatsapp' || channel === 'sms') {
      addLabelled('TEL;TYPE=CELL', directoryLabel, label);
    }
    addLabelled('URL', directoryUrl, label);
  }
  lines.push('END:VCARD');
  return lines.map(foldLine).join('\r\n') + '\r\n';
}

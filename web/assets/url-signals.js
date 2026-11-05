// Inspect only the text a customer shared. Never resolve a host or echo a URL's
// path, query, credentials or mailbox address into a finding.
const embeddedDomains = ['gov.uk','nhs.uk','paypal.com','microsoft.com','apple.com','amazon.co.uk','amazon.com'];
const shorteners=new Set(['bit.ly','t.co','tinyurl.com','buff.ly','ow.ly','is.gd','cutt.ly']);
const serviceDomains=[['hmrc',['gov.uk']],['nhs',['nhs.uk']],['paypal',['paypal.com','paypal.me']],['microsoft',['microsoft.com','microsoftonline.com','live.com']],['apple',['apple.com','icloud.com']],['royalmail',['royalmail.com']],['dhl',['dhl.com']]];
const bareHost = /^(?:[a-z0-9-]+\.)+[a-z]{2,63}(?::\d+)?(?:[/#?]|$)/i;

function webAddress(value) {
  if (value.length > 2048) return null;
  const explicit = /^https?:\/\//i.test(value);
  if (!explicit && !bareHost.test(value)) return null;
  try {
    const url = new URL(explicit ? value : 'https://' + value);
    return url.hostname && url.hostname.length <= 253 ? url : null;
  } catch { return null; }
}
function hostOf(url) { return url.hostname.toLowerCase().replace(/\.$/,''); }
function displayHost(host) { return host.replaceAll('.', '[.]'); }

function headerDomain(text, field) {
  const header = text.match(new RegExp('^' + field + ':[ \\t]*([^\\r\\n]{1,400})$', 'im'));
  if (!header) return '';
  // Only one unambiguous address per pasted field. A display name can also
  // contain an address, so prefer the actual mailbox within angle brackets.
  const address = header[1].trim();
  const mailbox = address.match(/^(?:[^<>,]*<([^<>,\s]+)>|([^<>,\s]+))$/);
  const domain = (mailbox?.[1] || mailbox?.[2] || '').match(/^[^@\s]+@((?:[a-z0-9-]+\.)+[a-z]{2,63})$/i);
  return domain?.[1].toLowerCase() || '';
}

export function inspectMessageLinks(message) {
  if (typeof message !== 'string') return [];
  const text = message;
  const findings = new Set();
  for (const pair of text.matchAll(/\[([^\]\n]{1,300})\]\((https?:\/\/[^\s)]+)\)/gi)) {
    const label = webAddress(pair[1].trim());
    const destination = webAddress(pair[2]);
    if (label && destination && hostOf(label) !== hostOf(destination)) {
      findings.add('The link text shows ' + displayHost(hostOf(label)) + ', but the link points to ' + displayHost(hostOf(destination)) + '.');
      break;
    }
  }
  for (const token of text.split(/[\s<>"'()\[\]]+/u)) {
    const url = webAddress(token.replace(/^[“‘]+|[”’.,;:!?]+$/gu,''));
    if (!url) continue;
    const host = hostOf(url);
    if (url.username || url.password) {
      findings.add('The link places text before an @ sign in its address. The destination host is ' + displayHost(host) + '.');
    }
    const embedded = embeddedDomains.find(domain => ('.' + host + '.').includes('.' + domain + '.') && host !== domain && !host.endsWith('.' + domain));
    if (embedded) findings.add('The link contains ' + displayHost(embedded) + ' inside a longer hostname. Its destination is ' + displayHost(host) + '.');
    // A shortener hides the final address. That limitation alone is not a verdict.
    if(shorteners.has(host))findings.add('The shortened link hides its final destination. Legitimate senders use short links too; the destination was not opened.');
    const brand=serviceDomains.find(([name,roots])=>new RegExp('(?:^|[.-])'+name+'(?:[.-]|$)').test(host)&&!roots.some(root=>root===host||host.endsWith('.'+root)));
    if(brand&&!embedded)findings.add('The address contains the name '+brand[0].toUpperCase()+' but ends at '+displayHost(host)+'. The name in the address does not verify the organisation.');
    if (findings.size >= 3) break;
  }
  const from = headerDomain(text,'From');
  const reply = headerDomain(text,'Reply-To');
  if (from && reply && from !== reply) {
    findings.add('The pasted From address uses ' + displayHost(from) + ' and Reply-To uses ' + displayHost(reply) + '. This can be legitimate, but replies go to a different domain.');
  }
  return [...findings].slice(0,3);
}

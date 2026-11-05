// A comparison point explicitly supplied by the customer for this check.
export const knownContactSource = 'Contact I already trust';
export const companyLookupSource = 'UK company name to look up';
export const isCompanyLookup = item => item?.source === companyLookupSource && /^ev-company-[0-9]+$/.test(item.id);
export const isKnownContact = item => item?.source === knownContactSource && /^ev-contact-[0-9]+$/.test(item.id);

export function knownContact(value) {
  const raw = String(value || '').trim();
  if (!raw || raw.length > 254 || /[\r\n]/.test(raw)) return null;
  if (/^[\w.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9-]+(?:\.[a-z0-9-]+)+$/i.test(raw)) return {kind:'email', value:raw};
  if (/^(?:\+|00|0)[\d ().-]{7,24}\d$/.test(raw)) {
    let number = raw.replace(/\(0\)/g,'').replace(/[ ().-]/g,'');
    if (number.startsWith('00')) number = '+' + number.slice(2);
    else if (/^0[1-9]\d{8,9}$/.test(number)) number = '+44' + number.slice(1);
    if (/^\+[1-9]\d{7,14}$/.test(number)) return {kind:'phone', value:number};
  }
  if (!/^(?:https?:\/\/)?[a-z\d.-]+\.[a-z]{2,63}\/?$/i.test(raw)) return null;
  try {
    const host = new URL(raw.includes('://') ? raw : 'https://' + raw).hostname;
    return {kind:'website', value:host};
  } catch { return null; }
}

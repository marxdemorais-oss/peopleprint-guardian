import {guidanceSources} from '../web/assets/official-guidance.js';
import {requestProviderBytes} from './provider-http.js';

// Confirm known guidance is still present. No retrieved HTML reaches the model or UI.
const pageMarkers = {
  parcelFee: 'a problem with a delivery',
  taxRefund: 'hmrc will never ask for personal or financial information when we send text messages',
  bankChange: 'contact the supplier directly using their official and verifiable contact details',
  remoteAccess: 'remote access to your computer',
  familyMoney: 'call them or another family member',
  credentials: 'trick you into giving them your personal and financial information',
  safeAccount: 'will never ask you to transfer money to a safe account',
  verificationCode: 'never give your verification code to someone else',
  giftCard: 'only scammers will ask for gift card numbers and the pin'
};
const cache = new Map();

export async function readOfficialGuidance(topic, {fetcher=fetch, now=Date.now()}={}) {
  if (!Object.hasOwn(guidanceSources, topic)) return null;
  const fallback = {topic, checkedAt:null};
  const cached = fetcher === fetch && cache.get(topic);
  if (cached && cached.until > now) return cached.value;
  // A warm worker performs at most one fetch per topic in the cooldown. No
  // request objects, customer information or promises are shared between requests.
  if (fetcher === fetch) cache.set(topic, {until:now+600000, value:fallback});
  try {
    const bytes = await requestProviderBytes(guidanceSources[topic].url, {method:'GET',headers:{Accept:'text/html'}}, {
      fetcher, timeoutMs:2000, maxBytes:512*1024, contentType:'text/html'
    });
    const page = new TextDecoder().decode(bytes).replace(/<!--[^]*?-->/g,' ')
      .replace(/<(script|style)\b[^>]*>[^]*?<\/\1\s*>/gi,' ').replace(/<[^>]*>/g,' ')
      .replace(/&nbsp;|&#160;/gi,' ').replace(/\s+/g,' ').toLowerCase();
    if (!page.includes(pageMarkers[topic])) return fallback;
    const value = {topic, checkedAt:new Date(now).toISOString()};
    if (fetcher === fetch) cache.set(topic, {until:now+6*3600000, value});
    return value;
  } catch {
    return fallback;
  }
}

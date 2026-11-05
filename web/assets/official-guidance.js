// Identifiers and links are application-owned. Never use a customer or model-supplied URL.
export const guidanceSources = Object.freeze({
  parcelFee: {
    publisher: 'Federal Trade Commission (US)', title: 'Unexpected delivery fee messages',
    url: 'https://consumer.ftc.gov/consumer-alerts/2025/04/unexpected-text-scam',
    detail: 'The FTC describes imitation delivery sites that ask for a redelivery fee. Check a shipment using the courier or shop’s own service.'
  },
  taxRefund: {
    publisher: 'HM Revenue & Customs (UK)', title: 'Check a text claiming to be from HMRC',
    url: 'https://www.gov.uk/guidance/check-if-a-text-message-youve-received-from-hmrc-is-genuine',
    detail: 'HMRC can send texts with GOV.UK information or webchat links, and some refund confirmations. It says it does not ask for personal or financial information by text.'
  },
  bankChange: {
    publisher: 'Report Fraud (UK)', title: 'Changed bank details and payment diversion',
    url: 'https://www.reportfraud.police.uk/mandate-fraud',
    detail: 'Report Fraud advises checking a change of payment details directly with the supplier using independently verified contact information.'
  },
  remoteAccess: {
    publisher: 'Federal Trade Commission (US)', title: 'Unexpected tech support and remote access',
    url: 'https://consumer.ftc.gov/features/pass-it-on/impersonator-scams/tech-support-scams',
    detail: 'The FTC explains how someone posing as tech support can misuse remote access and recommends contacting a trusted support provider independently.'
  },
  familyMoney: {
    publisher: 'Federal Trade Commission (US)', title: 'Family emergency impersonation',
    url: 'https://consumer.ftc.gov/consumer-alerts/2018/07/scammers-create-fake-emergencies-get-your-money',
    detail: 'The FTC recommends calling your relative independently or checking with another family member before paying.'
  },
  credentials: {
    publisher: 'Federal Trade Commission (US)', title: 'Recognising phishing requests',
    url: 'https://consumer.ftc.gov/articles/how-recognize-avoid-phishing-scams',
    detail: 'The FTC describes how messages can trick people into disclosing private information and advises contacting the organisation independently.'
  },
  safeAccount: {
    publisher: 'Report Fraud (UK)',
    title: 'Requests to move money to a safe account',
    url: 'https://www.reportfraud.police.uk/fraud-recovery-fraud/',
    detail: 'Report Fraud warns that callers impersonating banks or police may ask people to move money to a supposed safe account.'
  },
  verificationCode: {
    publisher: 'Federal Trade Commission (US)',
    title: 'Requests for verification codes',
    url: 'https://consumer.ftc.gov/consumer-alerts/2024/03/whats-verification-code-why-would-someone-ask-me-it',
    detail: 'The FTC explains how someone who obtains a verification code can use it to access an account.'
  },
  giftCard: {
    publisher: 'Federal Trade Commission (US)',
    title: 'Requests for gift card numbers and PINs',
    url: 'https://consumer.ftc.gov/consumer-alerts/2026/01/no-thats-not-your-boss-asking-you-buy-gift-cards',
    detail: 'The FTC explains that someone can take the value of a gift card using its number and PIN.'
  }
});

export function renderOfficialGuidance(root, reference, {compact=false}={}) {
  if (!reference || !Object.hasOwn(guidanceSources, reference.topic)) return;
  const source = guidanceSources[reference.topic];
  const block = document.createElement('aside');
  block.className = 'wk-official-guidance';
  const heading = document.createElement('strong');
  heading.textContent = 'Official guidance';
  const detail = document.createElement('p');
  detail.textContent = source.detail;
  const link = document.createElement('a');
  link.textContent = source.publisher + ' · ' + source.title;
  link.href = source.url;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  if (compact) {
    link.textContent = 'Official guidance · ' + source.publisher;
    block.append(link);
  } else block.append(heading, detail, link);
  const when = Date.parse(reference.checkedAt);
  if (Number.isFinite(when)) {
    const time = document.createElement('small');
    time.textContent = 'Source checked ' + new Date(when).toLocaleDateString('en-GB', {dateStyle:'medium', timeZone:'UTC'});
    block.append(time);
  }
  root.append(block);
}

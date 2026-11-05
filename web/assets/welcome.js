import {initShell, api} from './journey.js';

initShell({page: 'welcome'});

const $ = selector => document.querySelector(selector);
const params = new URL(location.href).searchParams;
const unlock = params.get('unlock') === '1';
const requested = params.get('return_to');
const next = requested && /^\/workspace(?:[?#]|$)/.test(requested) && !/[\\\r\n]/.test(requested) ? requested : '/workspace';
let pending = false;

$('#welcome-intro').hidden = !unlock;
$('#welcome-routes').hidden = unlock;
$('#welcome-skip').href = next;
$('#welcome-continue').dataset.destination = next;
if (next !== '/workspace') $('#welcome-continue').textContent = 'Back to my check →';

if (unlock) {
  document.title = 'Your profile | Peopleprint Guardian';
  $('#welcome-speech').textContent = '“What would you like me to call you?”';
}

function status(message, error = false) {
  $('#welcome-status').textContent = message;
  $('#welcome-status').classList.toggle('error', error);
}

function showNameEdit(description) {
  $('#welcome-next').textContent = 'Save and continue →';
  $('#welcome-intro>p').textContent = description;
}

api('/api/profile').then(({profile, trial}) => {
  if (!unlock) return;
  if (profile?.displayName) $('#welcome-name').value = profile.displayName;
  const allowance = trial || profile?.trial;
  if (allowance?.unlimited) {
    showNameEdit('You already have unlimited checks. Choose the name Wolfgang will use.');
  } else if (allowance?.source === 'paid') {
    showNameEdit('Your plan already includes '+allowance.allowance+' checks per calendar month. Choose the name Wolfgang will use.');
  } else if (allowance?.profileComplete && !allowance.allowanceOverridden) {
    showNameEdit('Your profile is complete. You have five free checks per calendar month and can update your name here.');
  } else if (allowance?.canUnlockProfile === false) {
    showNameEdit('Choose the name Wolfgang will use. Your current free allowance will stay the same.');
  } else if (allowance?.canUnlockProfile) {
    $('#welcome-intro>p').textContent = 'Complete your profile for five free checks each calendar month. A starter check used this month counts towards the five. Your balance renews on the first day of each month at 00:00 UTC.';
  }
}).catch(error => {
  if (error.status === 401) {
    location.replace('/login?return_to=' + encodeURIComponent(location.pathname + location.search));
  } else {
    status(error.message, true);
  }
});

$('#welcome-form').onsubmit = async event => {
  event.preventDefault();
  if (pending) return;
  const name = $('#welcome-name').value.trim();
  if (!name) {
    status('Enter the name you’d like Wolfgang to use, or choose Skip for now.', true);
    $('#welcome-name').focus();
    return;
  }
  pending = true;
  $('#welcome-next').disabled = true;
  status('Saving your name…');
  try {
    await api('/api/auth/profile', {method: 'POST', body: {name}});
    await api('/api/profile', {method: 'PATCH', body: {displayName: name, completeProfile: true, onboardingComplete: true}});
    location.assign(next);
  } catch (error) {
    status(error.message, true);
  } finally {
    pending = false;
    $('#welcome-next').disabled = false;
  }
};

document.querySelectorAll('[data-destination]').forEach(button => {
  button.onclick = async () => {
    if (pending) return;
    pending = true;
    button.disabled = true;
    try {
      await api('/api/profile', {method: 'PATCH', body: {onboardingComplete: true}});
      location.assign(button.dataset.destination);
    } catch (error) {
      status(error.message, true);
      pending = false;
      button.disabled = false;
    }
  };
});

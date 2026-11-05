import {initShell, api} from './journey.js';

initShell({page: 'access'});

const $ = selector => document.querySelector(selector);
const login = location.pathname === '/login';
const params = new URL(location.href).searchParams;
const requested = params.get('return_to');
const validReturn = requested && /^\/(?:workspace|welcome|connections|account|plans|demo|privacy|data-deletion|wolfgang-3d)?(?:[?#]|$)/.test(requested) && !/[\\\r\n]/.test(requested);
const destination = validReturn ? requested : '/workspace';
// Carry only this tab's recovery key in the fragment, never in an HTTP request.
const fragment = new URL(location.href).hash;
const handoff = /^#continue=[0-9a-f]{64}$/.test(fragment) && /^\/workspace\?start=(chat|check)$/.test(destination) ? fragment : '';
const returnTo = destination + handoff;
const emailHeading = login ? 'Sign in by email' : 'Open your workspace';
let email = '';
let busy = false;
let resendAt = 0;
let authenticated = false;
let emailCodeReady = true;

function status(message, error = false) {
  $('#auth-feedback').textContent = message;
  $('#auth-feedback').classList.toggle('error', error);
}

function pending(value) {
  busy = value;
  document.querySelectorAll('.auth-box button').forEach(button => { button.disabled = value; });
  $('#auth-start').disabled = value || !emailCodeReady;
}

function emailStep() {
  $('#auth-heading').textContent = emailHeading;
  $('#auth-description').hidden = false;
  $('#email-form').hidden = false;
  $('#code-form').hidden = true;
  $('#auth-code').value = '';
  $('#auth-code').setAttribute('aria-invalid', 'false');
  status('');
  $('#auth-email').focus();
}

function codeStep() {
  $('#auth-heading').textContent = 'Check your email';
  $('#auth-description').hidden = true;
  $('#email-form').hidden = true;
  $('#code-form').hidden = false;
  $('#code-destination').textContent = 'Use the code we sent to ' + email + '. It expires in 10 minutes.';
  $('#auth-code').value = '';
  $('#auth-code').setAttribute('aria-invalid', 'false');
  $('#auth-code').focus();
}

$('#remember-signin').checked = false;
if (login) {
  document.title = 'Sign in | Peopleprint Guardian';
  $('#access-title').textContent = 'Welcome back.';
  $('#access-lead').textContent = 'Return to a saved check or bring Wolfgang a new message.';
  $('#auth-heading').textContent = emailHeading;
  $('#auth-trial').hidden = true;
  $('#auth-greeting').textContent = '“We can pick up where you left off.”';
  $('#existing-account').innerHTML = 'New here? <a href="/signup">Meet Wolfgang</a>';
}
$('#existing-account a').href = (login ? '/signup' : '/login') + (validReturn ? '?return_to=' + encodeURIComponent(destination) : '') + handoff;

async function sendCode() {
  if (busy || !emailCodeReady) return;
  pending(true);
  status('Sending your code…');
  try {
    await api('/api/auth/request-code', {method: 'POST', body: {email}});
    resendAt = Date.now() + 60000;
    codeStep();
    status('If it hasn’t arrived, check your spam folder.');
  } catch (error) {
    status(error.message, true);
  } finally {
    pending(false);
  }
}

$('#email-form').onsubmit = event => {
  event.preventDefault();
  if (busy || !emailCodeReady) return;
  email = $('#auth-email').value.trim().toLowerCase();
  return sendCode();
};

$('#resend-code').onclick = () => {
  const remaining = Math.ceil((resendAt - Date.now()) / 1000);
  if (remaining > 0) {
    status('You can request another code in ' + remaining + ' seconds.');
    return;
  }
  return sendCode();
};
$('#change-email').onclick = emailStep;

async function completeSignIn() {
  location.assign(returnTo);
}

$('#code-form').onsubmit = async event => {
  event.preventDefault();
  if (busy) return;
  pending(true);
  status('Signing you in…');
  try {
    await api('/api/auth/verify', {
      method: 'POST',
      body: {email, remember: $('#remember-signin').checked === true, code: $('#auth-code').value.trim()}
    });
    await completeSignIn();
  } catch (error) {
    status(error.message, true);
    $('#auth-code').focus();
  } finally {
    pending(false);
  }
};

api('/api/session').then(session => {
  if (!session.authenticated || session.legacy === true) return;
  authenticated = true;
  $('#auth-heading').textContent = 'You’re signed in';
  $('#auth-description').hidden = true;
  $('#email-form').hidden = true;
  $('#code-form').hidden = true;
  $('#signed-in-actions').hidden = false;
  $('#continue-signed-in').href = returnTo;
  $('#continue-signed-in').textContent = returnTo === '/workspace' ? 'Open my workspace' : 'Continue';
  $('#existing-account').hidden = true;
  $('#auth-trial').hidden = true;
  status('');
}).catch(() => {});

api('/api/auth/config').then(config => {
  emailCodeReady = Boolean(config.emailCodeReady);
  if (!emailCodeReady && !authenticated) {
    status('Email sign-in is unavailable. Please try again shortly.', true);
    $('#auth-start').disabled = true;
  }
}).catch(() => {
  if (!authenticated) status('We couldn’t reach sign-in. Refresh this page to try again.', true);
});

if (params.get('logged_out') === '1') {
  status('You are signed out on this browser. Remote sign-out could not be confirmed.');
}

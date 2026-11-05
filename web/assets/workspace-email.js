// Mailbox results live only in this picker. Only the record the customer chooses
// is copied into the same evidence list as uploaded files.
const providers = new Set(['gmail', 'outlook', 'mailbox']);
export function selectedEmailRecord(record, evidence) {
  if (!record || !/^ev-mail-[a-f0-9]{24}$/.test(record.id) ||
      typeof record.source !== 'string' || !record.source.trim() || record.source.length > 160 ||
      typeof record.text !== 'string' || !record.text.trim() || record.text.length > 20000) {
    throw Error('This email could not be attached. You can use an email file instead.');
  }
  if (evidence.some(item => item.id === record.id)) throw Error('This email is already attached.');
  if (evidence.length >= 12) throw Error('This check already has twelve records. Remove a record to add another.');
  return {id:record.id, source:record.source, text:record.text};
}

export function createWorkspaceEmailPicker({document, request, verifyOwner, attach, chooseFile}) {
  const get = id => document.querySelector('#' + id);
  const make = (tag, value) => {
    const node = document.createElement(tag);
    if (value !== undefined) node.textContent = value;
    return node;
  };
  const trigger = get('attach-email'), panel = get('email-picker');
  const form = get('email-search-form'), mailbox = get('email-provider'), query = get('email-query');
  const results = get('email-search-results'), status = get('email-search-status');
  const find = get('email-find');
  let generation = 0, controller = null;
  function resetResults() {
    generation++;
    controller?.abort();
    controller = null;
    results.replaceChildren();
    status.textContent = '';
    find.disabled = false;
  }
  function close(focus = false) {
    resetResults();
    form.hidden = true;
    query.value = '';
    mailbox.replaceChildren();
    panel.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    if (focus) trigger.focus();
  }
  function startRequest() {
    resetResults();
    controller = new AbortController();
    return {generation, signal:controller.signal};
  }
  function visible(requested) {
    return generation === requested.generation && !panel.hidden;
  }
  async function open(preferred) {
    panel.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
    get('email-picker-heading').focus();
    form.hidden = true;
    query.value = '';
    mailbox.replaceChildren();
    const current = startRequest();
    status.textContent = 'Opening your mailboxes…';
    try {
      const data = await request('/api/connections', {signal:current.signal});
      if (!visible(current)) return;
      await verifyOwner(current.signal);
      if (!visible(current)) return;
      const ready = data.connections.filter(item => providers.has(item.provider) && item.status === 'connected' && item.searchReady === true);
      if (!ready.length) {
        status.textContent = 'Connect a mailbox in a new tab, then refresh here. You can also use an email file.';
        return;
      }
      for (const account of ready) {
        const option = make('option', account.displayLabel ? account.label + ' · ' + account.displayLabel : account.label);
        option.value = account.provider;
        mailbox.append(option);
      }
      mailbox.value = ready.find(account => account.provider === preferred)?.provider || ready[0].provider;
      form.hidden = false;
      status.textContent = 'Choose an email to attach to this draft.';
      (ready.length > 1 ? mailbox : query).focus();
    } catch (error) {
      if (visible(current)) status.textContent = error.message || 'Your mailboxes could not open. Refresh to try again.';
    }
  }
  function showRecord(record, current) {
    const item = make('article');
    item.className = 'wk-mail-result';
    item.append(make('strong', record.source), make('p', record.text.slice(0, 200) + (record.text.length > 200 ? '…' : '')));
    if (record.excerpt) item.append(make('small', 'Preview only. Some of this email was omitted.'));
    const details = make('details');
    details.append(make('summary', 'Read the text to be attached'), make('pre', record.text));
    const choose = make('button', 'Attach to this check');
    choose.type = 'button';
    choose.onclick = () => {
      if (!visible(current)) return;
      try { attach(record); close(true); }
      catch (error) { status.textContent = error.message; }
    };
    item.append(details, choose);
    results.append(item);
  }
  form.onsubmit = async event => {
    event.preventDefault();
    const provider = mailbox.value, term = query.value.trim();
    if (panel.hidden || form.hidden || !providers.has(provider)) return;
    if (term.length < 2 || term.length > 200) {
      resetResults();
      status.textContent = 'Enter between 2 and 200 characters to search.';
      query.focus();
      return;
    }
    const current = startRequest();
    find.disabled = true;
    status.textContent = 'Finding matching emails…';
    try {
      const data = await request('/api/connections/' + provider + '/search?q=' + encodeURIComponent(term), {signal:current.signal});
      if (!visible(current)) return;
      await verifyOwner(current.signal);
      if (!visible(current)) return;
      const rows = data.records.slice(0, 5);
      for (const record of rows) showRecord(record, current);
      const summary = [rows.length ? (data.limited ? 'Showing up to five matches.' : 'Choose a matching email.') : 'No matching emails. Try another name or reference.'];
      if (data.partial) summary.push('Only part of the search was available. You can use a selected email file.');
      if (data.searchScope) summary.push(data.searchScope);
      status.textContent = summary.join(' ');
    } catch (error) {
      if (visible(current)) status.textContent = error.message || 'The mailbox search could not finish. Try again.';
    } finally {
      if (visible(current)) find.disabled = false;
    }
  };
  trigger.onclick = () => panel.hidden ? open() : close(true);
  get('email-picker-close').onclick = () => close(true);
  get('mailbox-refresh').onclick = open;
  get('mailbox-use-file').onclick = () => {
    close();
    get('attach-file').focus();
    chooseFile(get('attach-file'));
  };
  mailbox.addEventListener('change', resetResults);
  query.addEventListener('input', resetResults);
  return {open,close};
}

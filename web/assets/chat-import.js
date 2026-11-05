// Read the text of an export locally. The dates, addresses and names are claims
// made by the file. They never identify the account that uploaded it.
const MAX_RECORD_CHARS = 20000;
const MAX_SOURCE_CHARS = 160;
const date = String.raw`\d{1,4}[/.-]\d{1,2}[/.-]\d{1,4}`;
const time = String.raw`\d{1,2}:\d{2}(?::\d{2})?(?:\s*(?:a\.?m\.?|p\.?m\.?))?`;
const timestamp = date + String.raw`,?\s+` + time;
const bracketed = new RegExp(String.raw`^\[(${timestamp})\]\s*(.*)$`, 'iu');
const dashed = new RegExp(String.raw`^(${timestamp})\s+[-–]\s+(.*)$`, 'iu');
const xmlName = /[A-Za-z_][\w.:-]*/y;
const xmlAttr = /\s+([A-Za-z_][\w.:-]*)\s*=\s*(?:"([^"<]*)"|'([^'<]*)')/y;

function collector(limit, unit = 'message') {
  const records = [];
  const notices = [];
  let oversized = 0;
  let overflow = 0;
  return {
    add(source, text) {
      if (text.length > MAX_RECORD_CHARS) {
        oversized++;
      } else if (records.length >= limit) {
        overflow++;
      } else {
        records.push({source: source.length > MAX_SOURCE_CHARS ? source.slice(0, MAX_SOURCE_CHARS - 1) + '…' : source, text});
      }
    },
    finish() {
      if (oversized) notices.push(`${oversized} ${unit}(s) exceeded 20,000 characters. Export a shorter excerpt to include them.`);
      if (overflow) notices.push(`${overflow} further ${unit}(s) are outside this preview. Use a smaller export to include them.`);
      if (!records.length) throw Error([`No readable ${unit}s were found in this export.`, ...notices].join(' '));
      return {records, notices};
    },
    notices
  };
}

function chatHeader(line) {
  const clean = line.replace(/^[\uFEFF\u200E\u200F]+/u, '');
  return bracketed.exec(clean) || dashed.exec(clean);
}

function chatTranscript(name, raw, limit) {
  const lines = raw.replace(/\r\n?/g, '\n').split('\n');
  // A plain document which happens to contain one quoted chat later on should
  // remain a plain document, including the material before the quote.
  const start = lines.findIndex(line => line.trim());
  if (start < 0 || !chatHeader(lines[start])) return null;
  const result = collector(limit);
  let label = '';
  let body = [];
  function takeMessage() {
    if (body.length) result.add(label, body.join('\n').trimEnd());
  }
  for (let i = start; i < lines.length; i++) {
    const line = lines[i];
    const header = chatHeader(line);
    if (header) {
      takeMessage();
      const [, when, message] = header;
      const author = /^([^:\n]{1,100}):(?:\s|$)/u.exec(message)?.[1];
      label = [name, when, author].filter(Boolean).join(' · ');
      body = [line];
    } else {
      body.push(line);
    }
  }
  takeMessage();
  return result.finish();
}

// Quoted cells may contain newlines and escaped double quotes. Read one row
// at a time so large exports do not create a second in-memory table.
function csvRow(raw, start, delimiter) {
  const cells = [];
  let i = start;
  while (cells.length < 128) {
    let value;
    if (raw[i] === '"') {
      const begin = ++i;
      while (true) {
        const end = raw.indexOf('"', i);
        if (end < 0) return null;
        i = end + 1;
        if (raw[i] !== '"') {
          value = raw.slice(begin, end).replace(/""/g, '"');
          break;
        }
        i++;
      }
    } else {
      const begin = i;
      while (i < raw.length && raw[i] !== delimiter && raw[i] !== '\n') {
        if (raw[i] === '"') return null;
        i++;
      }
      value = raw.slice(begin, i);
    }
    cells.push(value);
    if (i === raw.length || raw[i] === '\n') return {cells, next: i + 1};
    if (raw[i++] !== delimiter) return null;
  }
  return null;
}

const messageColumns = new Set(['message', 'body', 'text', 'message body', 'message text', 'sms body', 'sms text']);
const statementColumn = /^(?:date|transaction date|booking date|value date|payee|payer|merchant|description|reference|amount|debit|credit|balance|money in|money out|paid in|paid out|withdrawals?|deposits?|currency)$/i;

// Preserve the original values. A bank CSV may have no headings, so an
// unrecognised first row stays selectable instead of silently disappearing.
export function financialCsv(name, text, limit) {
  const raw = text.replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trimStart();
  const result = collector(limit, 'row');
  const separators = [',', ';', '\t'].map(delimiter => ({delimiter, first: csvRow(raw, 0, delimiter)}));
  const format = separators.filter(item => item.first?.cells.length > 1)
    .sort((a, b) => b.first.cells.length - a.first.cells.length)[0];
  if (!format) throw Error('This CSV needs at least two columns separated by commas, semicolons or tabs. You can also paste the entries into your check.');
  const {delimiter, first} = format;
  const hasHeadings = first.cells.filter(value => statementColumn.test(value.trim())).length >= 2;
  const labels = hasHeadings ? first.cells.map(value => value.trim()) : [];
  let pos = hasHeadings ? first.next : 0, number = hasHeadings ? 1 : 0;
  while (pos < raw.length) {
    const row = csvRow(raw, pos, delimiter);
    if (!row) throw Error('This financial CSV contains an unreadable row. Export a fresh copy or paste the relevant entries.');
    pos = row.next;
    number++;
    if (!row.cells.some(value => value.trim())) continue;
    if (row.cells.length !== first.cells.length) throw Error('The financial CSV has rows with different numbers of columns. Export a table of transactions or paste the relevant lines.');
    const fields = row.cells.map((value, i) => (labels[i] || 'Column ' + (i + 1)) + ': ' + value);
    result.add('Row ' + number + ' · ' + name, fields.join('\n'));
  }
  return result.finish();
}

function chatCsv(name, text, limit) {
  const raw = text.replace(/\r\n?/g, '\n');
  const firstLine = raw.split('\n', 1)[0];
  for (const delimiter of [',', ';', '\t']) {
    const header = csvRow(firstLine, 0, delimiter);
    if (!header) continue;
    const labels = header.cells.map(cell => cell.trim());
    const keys = labels.map(label => label.toLowerCase().replace(/[_-]+/g, ' '));
    const message = keys.findIndex(key => messageColumns.has(key));
    if (message < 0) continue;
    const sender = keys.findIndex(key => ['sender', 'from', 'contact', 'contact name', 'address', 'phone number'].includes(key));
    const when = keys.findIndex(key => ['date', 'date time', 'datetime', 'timestamp', 'sent at', 'time'].includes(key));
    const result = collector(limit);
    let empty = 0, ordinal = 0, pos = firstLine.length + 1;
    while (pos < raw.length) {
      const row = csvRow(raw, pos, delimiter);
      if (!row) throw Error('The message CSV has invalid quoting or too many columns. Export a new copy.');
      pos = row.next;
      if (row.cells.length === 1 && !row.cells[0].trim()) continue;
      if (row.cells.length !== labels.length) throw Error('A row in the message CSV has a different number of columns from the header. Export a new copy.');
      ordinal++;
      if (!row.cells[message].trim()) { empty++; continue; }
      const context = row.cells.flatMap((value, i) =>
        i !== message && value.trim() ? [(labels[i] || 'Column ' + (i + 1)) + ': ' + value] : []);
      const source = [name, 'message ' + ordinal, row.cells[when], row.cells[sender]].filter(Boolean).join(' · ');
      const body = row.cells[message];
      result.add(source, context.length ? context.join('\n') + '\n\n' + body : body);
    }
    if (empty) result.notices.push(`${empty} message(s) had no text.`);
    return result.finish();
  }
  return null;
}

function malformed() {
  throw Error('The SMS backup XML could not be read. Choose an SMS Backup & Restore XML file or export the messages as text.');
}

const xmlEntities = new Map([['amp', '&'], ['lt', '<'], ['gt', '>'], ['apos', "'"], ['quot', '"']]);
function attributeText(value) {
  // XML normalises literal whitespace, but a numeric newline reference still
  // means a newline in a message body.
  return value.replace(/\r\n?|\n|\t/g, ' ').replace(/&(?:([A-Za-z]+)|#(x[\da-fA-F]+|\d+));|&/g, (match, name, numeric) => {
    if (name && xmlEntities.has(name)) return xmlEntities.get(name);
    if (!numeric) malformed();
    const cp = numeric.startsWith('x') ? parseInt(numeric.slice(1), 16) : Number(numeric);
    if (!(cp === 9 || cp === 10 || cp === 13 || (cp >= 32 && cp <= 0xd7ff) || (cp >= 0xe000 && cp <= 0xfffd) || (cp >= 0x10000 && cp <= 0x10ffff))) malformed();
    return String.fromCodePoint(cp);
  });
}

// A restricted XML reader for flat SMS records. Skip metadata and MMS data
// without loading stylesheets, resolving external entities or creating HTML.
function smsXml(name, xml, limit) {
  const result = collector(limit);
  const stack = [];
  let i = 0, hasRoot = false, mms = 0, empty = 0;
  const skipSpace = () => { while (i < xml.length && /[\t\n\r ]/.test(xml[i])) i++; };
  function readName() {
    xmlName.lastIndex = i;
    const match = xmlName.exec(xml);
    if (!match) malformed();
    i = xmlName.lastIndex;
    return match[0];
  }
  while (i < xml.length) {
    skipSpace();
    if (i === xml.length) break;
    if (xml[i++] !== '<') malformed();
    if (xml.startsWith('!--', i) || xml[i] === '?') {
      const comment = xml.startsWith('!--', i);
      const terminator = comment ? '-->' : '?>';
      const end = xml.indexOf(terminator, i + (comment ? 3 : 1));
      if (end < 0) malformed();
      i = end + terminator.length;
      continue;
    }
    if (xml[i] === '!') throw Error('XML declarations such as DTDs and entities are unsupported. Choose a plain SMS backup.');
    if (xml[i] === '/') {
      i++;
      const tag = readName();
      skipSpace();
      if (stack.pop() !== tag || xml[i++] !== '>') malformed();
      continue;
    }
    const tag = readName();
    const depth = stack.length;
    if (depth === 0) {
      if (hasRoot || tag !== 'smses') malformed();
      hasRoot = true;
    } else if (depth === 1 && !['sms','mms'].includes(tag)) malformed();
    else if (depth > 1 && stack[1] !== 'mms') malformed();
    if (depth > 16) malformed();
    const isSms = depth === 1 && tag === 'sms';
    const attributes = Object.create(null), seen = new Set();
    while (true) {
      xmlAttr.lastIndex = i;
      const match = xmlAttr.exec(xml);
      if (!match) break;
      i = xmlAttr.lastIndex;
      if (seen.has(match[1]) || seen.size >= 100) malformed();
      seen.add(match[1]);
      if (isSms && ['type', 'body', 'date', 'readable_date', 'address', 'contact_name'].includes(match[1])) {
        attributes[match[1]] = attributeText(match[2] ?? match[3]);
      }
    }
    skipSpace();
    if (xml[i] === '/') i++;
    else stack.push(tag);
    if (xml[i++] !== '>') malformed();
    if (isSms) {
      if (attributes.body?.trim()) {
        const contact = [attributes.contact_name, attributes.address].filter(v => v && v !== 'null' && v !== '(Unknown)').join(' ');
        const direction = attributes.type === '1' ? 'From' : attributes.type === '2' ? 'To' : 'Contact';
        const ms = /^\d{1,14}$/.test(attributes.date || '') ? Number(attributes.date) : null;
        const when = attributes.readable_date && attributes.readable_date !== 'null' ? attributes.readable_date : ms !== null ? new Date(ms).toISOString() : '';
        result.add([name, contact, when].filter(Boolean).join(' · '), [when && 'Date: ' + when, contact && direction + ': ' + contact, '', attributes.body].filter((v, idx) => v || idx === 2).join('\n').trimStart());
      } else empty++;
    }
    if (depth === 1 && tag === 'mms') mms++;
  }
  if (!hasRoot || stack.length) malformed();
  if (mms) result.notices.push(`${mms} MMS message(s) were skipped. This XML reader imports SMS text only.`);
  if (empty) result.notices.push(`${empty} SMS message(s) had no text.`);
  return result.finish();
}

export function chatImport({name, text, limit = 12}) {
  const extension = name.split('.').pop().toLowerCase();
  if (!['txt', 'xml', 'csv'].includes(extension)) return null;
  if (text.length > 4 * 1024 * 1024) throw Error('The export is over 4 MB. Choose a smaller export.');
  if (!Number.isInteger(limit) || limit < 1) throw Error('There is no room for another record.');
  const size = Math.min(limit, 1000);
  const raw = text.replace(/^\uFEFF/, '');
  if (extension === 'csv') return chatCsv(name, raw, size);
  return extension === 'xml' ? smsXml(name, raw, size) : chatTranscript(name, raw, size);
}

// Read one transcript from a classic ZIP locally. Archive paths never become
// filesystem paths. Ignore media and only inflate the selected text entry.
const byteLimit = 4 * 1024 * 1024;
const invalid = () => new Error('This ZIP could not be read. Open it and choose the chat TXT file instead.');
const tooLarge = () => new Error('The chat exceeds 4 MB. Export a smaller chat or select a text excerpt.');
const nameDecoder = new TextDecoder();
const crcTable = Uint32Array.from({length: 256}, (_, index) => {
  let crc = index;
  for (let bit = 0; bit < 8; bit++) crc = (crc >>> 1) ^ ((crc & 1) ? 0xedb88320 : 0);
  return crc >>> 0;
});

function checksum(data) {
  let crc = 0xffffffff;
  for (const byte of data) crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function transcriptName(path) {
  const parts = path.replaceAll('\\', '/').split('/');
  if (/^[A-Za-z]:/.test(path) || parts.some(part => !part || part.startsWith('.') || part === '__MACOSX')) return null;
  const name = parts.at(-1);
  return name.length <= 255 && !/[\x00-\x1f]/.test(name) && /\.txt$/i.test(name) ? name : null;
}

function findTranscript(bytes, view, exactPath) {
  // The end record precedes an optional comment of up to 65,535 bytes.
  let end = bytes.length - 22;
  const first = Math.max(0, end - 65535);
  for (; end >= first; end--) {
    if (view.getUint32(end, true) === 0x06054b50 &&
        end + 22 + view.getUint16(end + 20, true) === bytes.length) break;
  }
  if (end < first || view.getUint32(end + 4, true) !== 0) throw invalid();
  const count = view.getUint16(end + 10, true);
  const directory = view.getUint32(end + 16, true);
  if (!count || count > 512 || view.getUint16(end + 8, true) !== count ||
      directory + view.getUint32(end + 12, true) !== end) throw invalid();

  const candidates = [];
  let cursor = directory;
  for (let index = 0; index < count; index++) {
    if (cursor + 46 > end || view.getUint32(cursor, true) !== 0x02014b50) throw invalid();
    const nameStart = cursor + 46;
    const nameEnd = nameStart + view.getUint16(cursor + 28, true);
    const next = nameEnd + view.getUint16(cursor + 30, true) + view.getUint16(cursor + 32, true);
    if (next > end || view.getUint16(cursor + 34, true) !== 0) throw invalid();
    const archiveName = bytes.subarray(nameStart, nameEnd);
    const path = nameDecoder.decode(archiveName);
    const name = exactPath ? (path === exactPath ? path : null) : transcriptName(path);
    if (name) {
      candidates.push({
        name, archiveName, directory, flags: view.getUint16(cursor + 8, true),
        method: view.getUint16(cursor + 10, true), crc: view.getUint32(cursor + 16, true),
        compressed: view.getUint32(cursor + 20, true), size: view.getUint32(cursor + 24, true),
        offset: view.getUint32(cursor + 42, true)
      });
    }
    cursor = next;
  }
  if (cursor !== end) throw invalid();
  if (exactPath) { if (candidates.length !== 1) throw invalid(); return candidates[0]; }
  const commonNames = candidates.filter(({name}) => /^(?:_?chat\.txt$|WhatsApp Chat\b)/i.test(name));
  const choices = commonNames.length ? commonNames : candidates;
  if (choices.length !== 1) throw new Error(choices.length
    ? 'This ZIP has several possible transcripts. Open it and choose the chat TXT file.'
    : 'No chat TXT file was found. Export the conversation as text.');
  return {...choices[0], notices: count > 1 ? ['Only the chat text was read. Other files in this ZIP were skipped.'] : []};
}

function compressedText(entry, bytes, view) {
  const {offset, directory, flags, method, archiveName} = entry;
  if ((flags & ~0x080e) !== 0 || (method !== 0 && method !== 8)) throw invalid();
  if (offset + 30 > directory || view.getUint32(offset, true) !== 0x04034b50 ||
      view.getUint16(offset + 6, true) !== flags || view.getUint16(offset + 8, true) !== method) throw invalid();
  if (!(flags & 8) && (view.getUint32(offset + 14, true) !== entry.crc ||
      view.getUint32(offset + 18, true) !== entry.compressed || view.getUint32(offset + 22, true) !== entry.size)) {
    throw invalid();
  }
  const nameStart = offset + 30;
  const nameLength = view.getUint16(offset + 26, true);
  const start = nameStart + nameLength + view.getUint16(offset + 28, true);
  if (start + entry.compressed > directory || nameLength !== archiveName.length ||
      !archiveName.every((byte, index) => bytes[nameStart + index] === byte)) throw invalid();
  return bytes.subarray(start, start + entry.compressed);
}

async function inflateText(packed, size) {
  let inflater;
  try { inflater = new DecompressionStream('deflate-raw'); }
  catch { throw new Error('Open this ZIP and choose the chat TXT file in this browser.'); }
  // Limit each compressed write too. A forged size can otherwise make a
  // native inflater produce a large burst before the first read can cancel it.
  let offset = 0;
  const compressed = new ReadableStream({
    pull(controller) {
      if (offset === packed.length) return controller.close();
      const end = Math.min(offset + 1024, packed.length);
      controller.enqueue(packed.subarray(offset, end));
      offset = end;
    }
  });
  const reader = compressed.pipeThrough(inflater).getReader();
  const data = new Uint8Array(size);
  let written = 0;
  try {
    while (true) {
      const {done, value} = await reader.read();
      if (done) break;
      if (value.length > size - written) {
        await reader.cancel();
        throw invalid();
      }
      data.set(value, written);
      written += value.length;
    }
  } catch { throw invalid(); }
  finally { reader.releaseLock(); }
  if (written !== size) throw invalid();
  return data;
}

export async function readChatZip(input) {
  const bytes = input instanceof ArrayBuffer ? new Uint8Array(input) : input;
  if (!(bytes instanceof Uint8Array) || bytes.length < 22) throw invalid();
  if (bytes.length > byteLimit) throw tooLarge();
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const entry = findTranscript(bytes, view);
  if (entry.size > byteLimit) throw tooLarge();
  const packed = compressedText(entry, bytes, view);
  const data = entry.method === 0 ? packed : await inflateText(packed, entry.size);
  if (data.length !== entry.size || checksum(data) !== entry.crc) throw invalid();
  let text;
  try { text = new TextDecoder('utf-8', {fatal: true}).decode(data); }
  catch { throw new Error('The chat text could not be read. Export it as UTF-8 text.'); }
  if (!text.trim() || text.includes('\0')) throw new Error('No readable chat text was found in this ZIP.');
  return {name: entry.name, text, notices: entry.notices};
}


// Accept exactly the OOXML main body. No other archive part is inflated, read,
// written to disk, interpreted as markup, or followed as an external link.
export async function readDocxBody(bytes) {
  try {
    if (!(bytes instanceof Uint8Array) || bytes.length < 22 || bytes.length > byteLimit) throw invalid();
    const view=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    const entry=findTranscript(bytes,view,'word/document.xml');
    if (entry.size > 2*1024*1024) throw invalid();
    const packed=compressedText(entry,bytes,view);
    const data=entry.method===0 ? packed : await inflateText(packed,entry.size);
    if(data.length!==entry.size || checksum(data)!==entry.crc) throw invalid();
    return new TextDecoder('utf-8',{fatal:true}).decode(data);
  } catch {throw Error('This DOCX could not be read. Choose an unlocked Word document with a smaller text body, or paste the relevant lines.');}
}

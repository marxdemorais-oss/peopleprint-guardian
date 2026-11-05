import test from 'node:test';
import assert from 'node:assert/strict';
import {readChatZip} from '../web/assets/chat-zip.js';

// Generated using Python zipfile, independently of the reader.
const stored = 'UEsDBBQAAAAAAAAAIQCGphA2BQAAAAUAAAAaAAAAV2hhdHNBcHAgQ2hhdCB3aXRoIFBhdC50eHRoZWxsb1BLAQIUAxQAAAAAAAAAIQCGphA2BQAAAAUAAAAaAAAAAAAAAAAAAACAAQAAAABXaGF0c0FwcCBDaGF0IHdpdGggUGF0LnR4dFBLBQYAAAAAAQABAEgAAAA9AAAAAAA=';
const deflated = 'UEsDBBQAAAAIAAAAIQCGphA2BwAAAAUAAAAJAAAAX2NoYXQudHh0y0jNyckHAFBLAwQUAAAACAAAACEAXwQ9xQcAAAAFAAAAEAAAAHBob3Rvcy9waG90by5qcGfLzE1MTwUAUEsBAhQDFAAAAAgAAAAhAIamEDYHAAAABQAAAAkAAAAAAAAAAAAAAIABAAAAAF9jaGF0LnR4dFBLAQIUAxQAAAAIAAAAIQBfBD3FBwAAAAUAAAAQAAAAAAAAAAAAAACAAS4AAABwaG90b3MvcGhvdG8uanBnUEsFBgAAAAACAAIAdQAAAGMAAAAAAA==';
const unsafe = 'UEsDBBQAAAAAAAAAIQDl6KJcBgAAAAYAAAAMAAAALi4vX2NoYXQudHh0c2VjcmV0UEsBAhQDFAAAAAAAAAAhAOXoolwGAAAABgAAAAwAAAAAAAAAAAAAAIABAAAAAC4uL19jaGF0LnR4dFBLBQYAAAAAAQABADoAAAAwAAAAAAA=';
const ambiguous = 'UEsDBBQAAAAAAAAAIQBX7nGSBQAAAAUAAAAMAAAAY2hhdCBvbmUudHh0Zmlyc3RQSwMEFAAAAAAAAAAhAGkRH7YGAAAABgAAAAwAAABjaGF0IHR3by50eHRzZWNvbmRQSwECFAMUAAAAAAAAACEAV+5xkgUAAAAFAAAADAAAAAAAAAAAAAAAgAEAAAAAY2hhdCBvbmUudHh0UEsBAhQDFAAAAAAAAAAhAGkRH7YGAAAABgAAAAwAAAAAAAAAAAAAAIABLwAAAGNoYXQgdHdvLnR4dFBLBQYAAAAAAgACAHQAAABfAAAAAAA=';
const bytes = base64 => Buffer.from(base64,'base64');

test('reads stored chat and compressed chat, omitting media from preview', async () => {
  assert.deepEqual(await readChatZip(bytes(stored)),{name:'WhatsApp Chat with Pat.txt',text:'hello',notices:[]});
  const result = await readChatZip(bytes(deflated));
  assert.equal(result.text,'hello');
  assert.equal(result.name,'_chat.txt');
  assert.match(result.notices.join(' '),/other files/i);
});

test('unsafe and ambiguous archive paths are rejected', async () => {
  await assert.rejects(readChatZip(bytes(unsafe)), /no chat TXT file/i);
  await assert.rejects(readChatZip(bytes(ambiguous)), /several possible transcripts/i);
});

test('rejects damaged ZIP and a deflate stream whose real output exceeds the header size', async () => {
  const damaged = bytes(stored);
  damaged[damaged.indexOf('hello')] ^= 1;
  await assert.rejects(readChatZip(damaged), /could not be read/);
  const forged = bytes(deflated);
  const directoryOffset = forged.readUInt32LE(forged.length-6);
  forged.writeUInt32LE(2, 22);
  forged.writeUInt32LE(2, directoryOffset+24);
  await assert.rejects(readChatZip(forged), /could not be read/);
});

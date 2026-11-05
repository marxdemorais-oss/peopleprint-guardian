# Local evidence import

The workspace reads a chosen file or a screenshot pasted into the message field. A mailbox connection is not required. The review dialog shows the text, its source and any extraction limits. Add selected records to the draft; submitting sends that text, not the original file, QR image, scan, or attachment bytes. No OCR service, CDN, URL preview, or browser extension is contacted. A decoded QR is displayed as inert text.

- PNG, JPEG and still WebP: at most 4 MiB and 24 megapixels (maximum side 18,000). The browser reduces each image to at most 3.2 megapixels / 2,400 pixels per side before a separate worker reads it. A worker has a 30-second deadline. English printed text is supported; handwriting, faint print, small text, and non-English scripts can fail. Recognition confidence is not a guarantee. Read the text against the actual payment details.
- QR: up to one decoded textual payload per image, including a scanned PDF page. Crop additional codes and import them individually. The QR payload is separate evidence from the printed text. No decoded URL is visited.
- PDFs: local Mozilla PDF.js reads the existing text layer. For pages without a text layer, up to six pages per file are rendered for OCR/QR recognition. A mixed page with selectable text uses that text; import a separate crop for a QR or image on such a page. All skipped page numbers are disclosed in a successful preview. Password-protected PDFs are rejected.
- DOCX: only the bounded, CRC-checked word/document.xml part is inflated. Transitions in the document produce one labelled candidate per nonempty body paragraph (including table cells). Word headers, annotations, revision deletions, relationships, embedded media, and external resources are not opened. Document type declarations are rejected. A file may contain as much as 2 MiB uncompressed body XML.
- Existing TXT, CSV, WhatsApp TXT/ZIP, SMS XML, and email EML/MBOX readers are unchanged. The preview limit is 1,000 records and a check accepts at most 12 selected records.

## Reader dependencies

Files are served from the Guardian origin and loaded only when the corresponding format is read. The OCR worker fetches the two static gzip assets without credentials; the worker response restricts script and network access to the same origin. It needs module workers, WebAssembly and DecompressionStream. No provider setup, keys or paid API are required.

- tesseract.js-core 7.0.0, non-SIMD LSTM build, Apache-2.0. evidence-ocr-core.js wraps the upstream JS for browser ES modules; evidence-ocr.wasm.gz is gzip of its matching tesseract-core-lstm.wasm.
- tessdata_fast English, Debian tesseract-ocr-eng 1:4.1.0-2, Apache-2.0. evidence-english.gz includes the trained recognizer, punctuation and number dictionaries, character set, recoder and version. To reproduce: extract with combine_tessdata -u, omit eng.lstm-word-dawg, recombine with combine_tessdata, and gzip the result with mtime 0. The broad word dictionary is deliberately omitted to keep the bundle small.
- jsQR 1.4.0, Apache-2.0; minified ES module build of dist/jsQR.js.
- sax 1.6.1 (Blue Oak Model License 1.0.0); minified ES module build of lib/sax.js, in strict XML/namespace mode. External entity declarations are refused before parsing.
- License texts and data notices are in docs/licenses.

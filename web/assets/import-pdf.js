// Mozilla PDF.js 5.6.205 is served with Guardian and loaded only for a PDF.
// Empty text layers are rendered locally for OCR and QR reading.
const MAX_PAGES = 100;
const MAX_CHARACTERS = 500000;
const RECORD_LENGTH = 20000;
class PdfImportError extends Error {}

async function readPages(task, name, limit, signal, canvasReader) {
  const document = await task.promise;
  if (document.numPages > MAX_PAGES) {
    throw new PdfImportError('Choose up to 100 PDF pages at a time. Export the pages relevant to your check.');
  }
  const filename = name.replace(/[\x00-\x1f\x7f]/g, ' ').trim().slice(0, 112);
  const records = [], skipped = [], scanNotices = new Set();
  let scanCount=0;
  let total = 0;
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber++) {
    const page = await document.getPage(pageNumber);
    const reader = page.streamTextContent().getReader();
    let pageText = '';
    for (;;) {
      const {value, done} = await reader.read();
      if (done) break;
      for (const item of value.items) {
        if (typeof item.str !== 'string') continue;
        total += item.str.length + 1;
        if (total > MAX_CHARACTERS) {
          throw new PdfImportError('This PDF contains too much text to preview. Export just the pages you need.');
        }
        pageText += item.str + (item.hasEOL ? '\n' : ' ');
      }
    }
    pageText = pageText.trim();
    if (!pageText) {
      let recovered=false, canvas;
      try{
        if(++scanCount<=6 && globalThis.document && !signal.aborted){
          const {readCanvas,rasterRecords,rasterSize}=await import('./import-image.js');
          const base=page.getViewport({scale:1}),{width,height,scale}=rasterSize(base.width,base.height,2);
          canvas=globalThis.document.createElement('canvas');canvas.width=width;canvas.height=height;
          const viewport=page.getViewport({scale});
          await page.render({canvas,canvasContext:canvas.getContext('2d'),viewport,annotationMode:0,background:'white'}).promise;
          const read=await (canvasReader||readCanvas)(canvas,{signal});
          const out=rasterRecords(filename+' · Page '+pageNumber,read,Math.max(0,limit-records.length));
          for(const r of out.records){total+=r.text.length;if(total>MAX_CHARACTERS)throw new PdfImportError('This PDF contains too much text to preview.');records.push(r);}
          recovered=out.records.length>0;
          for(const note of out.notices)scanNotices.add(note);
        }else if(scanCount>6){scanNotices.add('Only the first six pages without a text layer were tried with OCR. Export further scanned pages separately.');}
      }catch(error){if(error instanceof PdfImportError)throw error;if(/remaining preview space/.test(error.message))throw new PdfImportError(error.message);scanNotices.add('Some scanned pages could not be read. Try a clearer crop or paste their text.');}
      finally{if(canvas)canvas.width=canvas.height=1;page.cleanup();}
      if(!recovered)skipped.push(pageNumber);
      continue;
    }
    page.cleanup();
    let part = 1;
    const split = pageText.length > RECORD_LENGTH;
    while (pageText.length) {
      if (records.length >= limit) {
        throw new PdfImportError('This PDF exceeds the remaining preview space. Choose fewer pages or open the file separately.');
      }
      let end = Math.min(pageText.length, RECORD_LENGTH);
      if (end < pageText.length) {
        const lastLine = pageText.lastIndexOf('\n', end - 1);
        if (lastLine > end / 2) end = lastLine + 1;
        else if (/[\uD800-\uDBFF]/.test(pageText[end - 1])) end--;
      }
      const source = filename + ' · Page ' + pageNumber + (split ? ' · Part ' + part++ : '');
      records.push({source, text: pageText.slice(0, end).trim()});
      pageText = pageText.slice(end).trimStart();
    }
  }
  if (!records.length) {
    throw new PdfImportError('This PDF has no readable text. For a scan or photo, export a searchable PDF or a CSV, or paste the relevant details.');
  }
  const notices = skipped.length ? ['Pages with no readable text were skipped: ' + skipped.join(', ') + '.'] : [];
  notices.push(...scanNotices);
  notices.push('Check the extracted text against your statement, especially dates, amounts and columns.');
  return {records, notices};
}

export async function readPdfRecords(name, bytes, limit, {canvasReader}={}) {
  if (!new TextDecoder('latin1').decode(bytes.subarray(0, 1024)).includes('%PDF-')) {
    throw new PdfImportError('This file has a PDF filename, but could not be read as a PDF. Choose a fresh export.');
  }
  let port, worker, task, timer;const controller=new AbortController();
  try {
    const pdf = await import('./pdfjs-core.js');
    port = new Worker(new URL('./pdfjs-worker.js', import.meta.url), {type: 'module'});
    worker = pdf.PDFWorker.create({port, verbosity: 0});
    task = pdf.getDocument({
      data: bytes, worker, verbosity: 0, stopAtErrors: true, isEvalSupported: false,
      maxImageSize:24000000, canvasMaxAreaInBytes:16000000, useWorkerFetch: false, useWasm: false, enableXfa: false, disableFontFace: true,
      useSystemFonts: false, isOffscreenCanvasSupported: false, isImageDecoderSupported: false,
    });
    const interrupted = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new PdfImportError('This PDF took too long to read. Export fewer pages and try again.')), 95000);
      port.addEventListener('error', () => reject(new PdfImportError('The PDF reader could not start. Refresh the page and try again.')), {once: true});
    });
    return await Promise.race([readPages(task, name, limit, controller.signal, canvasReader), interrupted]);
  } catch (error) {
    if (error instanceof PdfImportError) throw error;
    if (error?.name === 'PasswordException') throw new PdfImportError('This PDF is password-protected. Choose an unlocked copy or a CSV export.');
    throw new PdfImportError('I couldn’t read this PDF. Try a searchable PDF or a CSV export.');
  } finally {
    controller.abort();clearTimeout(timer);
    // The worker belongs only to this import. Immediate termination also stops
    // a stalled parser without waiting for it to acknowledge a cleanup message.
    worker?.destroy();
    port?.terminate();
  }
}

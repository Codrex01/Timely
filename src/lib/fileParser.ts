import mammoth from 'mammoth';

/**
 * Robust, multi-strategy document text parser.
 * Handles:
 * 1. Standard digital PDFs via pdf-parse
 * 2. Uncompressed/raw PDF text stream fallbacks (Tj / TJ operators & ASCII chunk extraction)
 * 3. Microsoft Word (.docx) documents via mammoth
 * 4. Plain text / CSV / Markdown files (.txt, .md, etc.)
 */
export async function parseDocumentBuffer(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  // 1. PDF Parsing Pipeline
  if (ext === 'pdf' || mimeType === 'application/pdf') {
    // Strategy A: Standard pdf-parse library
    try {
      // Dynamic require to prevent bundling/SSR issues in Next.js
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pdfParse = require('pdf-parse');
      const data = await pdfParse(buffer);
      const text = data?.text ? data.text.trim() : '';
      if (text.length >= 10) {
        return text;
      }
    } catch (err: any) {
      console.warn('[PDF Parser] pdf-parse direct extraction warning:', err?.message || err);
    }

    // Strategy B: Raw PDF text stream parsing (Tj, TJ operators)
    try {
      const streamText = extractPdfTextStreams(buffer);
      if (streamText && streamText.trim().length >= 10) {
        return streamText.trim();
      }
    } catch (streamErr) {
      console.warn('[PDF Parser] Stream regex extraction failed:', streamErr);
    }

    // Strategy C: Readable ASCII/UTF-8 chunk extraction
    try {
      const rawString = buffer.toString('latin1');
      const readableChunks = rawString.match(/[A-Za-z0-9 ,.:;!?'"\-_/()@\n\r]{4,}/g);
      if (readableChunks && readableChunks.length > 0) {
        const filtered = readableChunks
          .map((c) => c.trim())
          .filter((c) => c.length > 3 && !c.startsWith('%PDF') && !c.includes('obj') && !c.includes('endobj'))
          .join('\n');
        if (filtered.length >= 10) {
          return filtered;
        }
      }
    } catch (fallbackErr) {
      console.warn('[PDF Parser] ASCII fallback extraction failed:', fallbackErr);
    }
  }

  // 2. DOCX Word Document Parsing
  if (
    ext === 'docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      const text = result?.value ? result.value.trim() : '';
      if (text.length >= 5) {
        return text;
      }
    } catch (err) {
      console.error('[DOCX Parser] mammoth parsing error:', err);
    }
  }

  // 3. Plain Text / Markdown / General Buffer Fallback
  try {
    const utf8Text = buffer.toString('utf-8').trim();
    if (utf8Text.length > 0) {
      return utf8Text;
    }
  } catch {
    // Ignore
  }

  return buffer.toString('ascii').trim();
}

/**
 * Extracts text from PDF stream operators without relying on external native binaries.
 */
function extractPdfTextStreams(buffer: Buffer): string {
  const content = buffer.toString('latin1');
  const extractedLines: string[] = [];

  // Match (Text) Tj operators
  const tjRegex = /\(([^)]+)\)\s*Tj/g;
  let match;
  while ((match = tjRegex.exec(content)) !== null) {
    extractedLines.push(match[1]);
  }

  // Match [(T) 10 (e) 10 (xt)] TJ operators
  const tjArrayRegex = /\[([^\]]+)\]\s*TJ/g;
  while ((match = tjArrayRegex.exec(content)) !== null) {
    const inner = match[1];
    const innerMatches = inner.match(/\(([^)]+)\)/g);
    if (innerMatches) {
      extractedLines.push(innerMatches.map((m) => m.slice(1, -1)).join(' '));
    }
  }

  if (extractedLines.length > 0) {
    return extractedLines
      .join(' ')
      .replace(/\\r/g, '\n')
      .replace(/\\n/g, '\n')
      .replace(/\\t/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  return '';
}

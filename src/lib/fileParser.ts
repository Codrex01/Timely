import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

/**
 * Extracts raw text from uploaded Buffer according to file mime type or extension.
 */
export async function parseDocumentBuffer(
  buffer: Buffer,
  filename: string,
  mimeType?: string
): Promise<string> {
  const ext = filename.split('.').pop()?.toLowerCase() || '';

  if (ext === 'pdf' || mimeType === 'application/pdf') {
    try {
      const data = await pdfParse(buffer);
      return data.text.trim();
    } catch (err) {
      console.error('Error parsing PDF buffer:', err);
      throw new Error('Failed to parse PDF document.');
    }
  }

  if (
    ext === 'docx' ||
    mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value.trim();
    } catch (err) {
      console.error('Error parsing DOCX buffer:', err);
      throw new Error('Failed to parse DOCX document.');
    }
  }

  // Plain text / markdown fallback
  return buffer.toString('utf-8').trim();
}

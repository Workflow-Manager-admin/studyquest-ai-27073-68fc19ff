// Service to extract text from a PDF file using pdf-parse
const fs = require('fs/promises');
let pdfParse;
try { pdfParse = require('pdf-parse'); } catch (e) { pdfParse = null; }

/**
 * Extracts text from PDF file at filepath.
 * Returns the raw text or empty string on error/unsupported.
 */
// PUBLIC_INTERFACE
async function parsePdfToText(filepath) {
  if (!pdfParse) throw new Error('Missing dependency: pdf-parse');
  const data = await fs.readFile(filepath);
  const parsed = await pdfParse(data);
  return parsed.text || '';
}

module.exports = { parsePdfToText };

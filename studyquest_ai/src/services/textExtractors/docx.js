// Service to extract text from a DOCX file using mammoth
let mammoth;
try { mammoth = require('mammoth'); } catch (e) { mammoth = null; }
const fs = require('fs');

/**
 * Extracts text from DOCX file at filepath.
 * Returns the raw text or empty string on error/unsupported.
 */
// PUBLIC_INTERFACE
async function parseDocxToText(filepath) {
  if (!mammoth) throw new Error('Missing dependency: mammoth');
  const result = await mammoth.extractRawText({ path: filepath });
  return result.value || '';
}

module.exports = { parseDocxToText };

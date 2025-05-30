const fs = require('fs');
const path = require('path');
const { parsePdfToText } = require('./textExtractors/pdf');
const { parseDocxToText } = require('./textExtractors/docx');
const llmApi = require('./llm');

class QuizService {
  /**
   * Extracts plain text from an uploaded file (.pdf, .docx)
   * @param {object} file - multer file object
   * @returns {Promise<string>} extractedText
   */
  // PUBLIC_INTERFACE
  async extractTextFromFile(file) {
    if (!file) return '';
    const ext = path.extname(file.originalname || file.filename).toLowerCase();
    let text = '';
    if (ext === '.pdf') {
      text = await parsePdfToText(file.path);
    } else if (ext === '.docx') {
      text = await parseDocxToText(file.path);
    }
    // Cleanup uploaded file (in prod consider streaming)
    fs.unlink(file.path, () => {});
    return text;
  }

  /**
   * Calls the LLM API to get MCQs based on extracted text.
   * @param {string} text 
   * @returns {Promise<Array>} array of MCQ objects
   */
  // PUBLIC_INTERFACE
  async generateMCQs(text) {
    // Limit to a reasonable sample for demo
    const prompt = `Generate 5 clear, relevant multiple-choice questions (MCQs) for students based on the following study material text. Each MCQ should be in this JSON format: { "id": "<unique>", "question": "...", "options": ["A", "B", "C", "D"], "correct": "<A|B|C|D>", "explanation": "..." }

Study Material:
${text}

Strictly output a JSON array of MCQ objects.`;
    const raw = await llmApi.generate(prompt);
    // Parse and robustify result
    let mcqs = [];
    try {
      // Some LLMs return code blocks, remove if present
      const jsonStart = raw.indexOf('[');
      const jsonEnd = raw.lastIndexOf(']') + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        mcqs = JSON.parse(raw.slice(jsonStart, jsonEnd));
      } else {
        mcqs = JSON.parse(raw);
      }
    } catch (e) {
      throw new Error('Failed to parse MCQ response from LLM.');
    }
    // Cleanup: ensure structure and reasonable array
    if (!Array.isArray(mcqs) || mcqs.length === 0) throw new Error('MCQ generation failed.');
    return mcqs;
  }

  /**
   * Grades an answer, locates the MCQ by ID and returns correctness and details
   * @param {Array} mcqs - Array of MCQ objects in session.
   * @param {string} questionId 
   * @param {string} selectedOption (e.g., "A", "B", "C", "D")
   */
  // PUBLIC_INTERFACE
  gradeAnswer(mcqs, questionId, selectedOption) {
    const q = mcqs.find(q => String(q.id) === String(questionId));
    if (!q) return null;
    const correct = q.correct === selectedOption;
    return {
      correct,
      correctAnswer: q.correct,
      explanation: q.explanation || '',
    };
  }
}

module.exports = new QuizService();

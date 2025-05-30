const quizService = require('../services/quiz');

/**
 * Controller for handling quiz routes and logic.
 * - Handles file upload, text extraction, MCQ generation, and interactive quiz flows.
 * - Uses LLM API for MCQ generation.
 */
class QuizController {
  // PUBLIC_INTERFACE
  /**
   * Uploads a file and processes it: extracts text, generates MCQs, and returns MCQs
   */
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ status: 'error', message: 'No file uploaded.' });
      }

      // Step 1: Extract text given the uploaded file
      const extractedText = await quizService.extractTextFromFile(req.file);
      if (!extractedText || extractedText.trim() === '') {
        return res.status(415).json({ status: 'error', message: 'Empty or unsupported document.' });
      }

      // Step 2: Generate MCQs using AI (LLM) API
      const mcqs = await quizService.generateMCQs(extractedText);

      // Step 3: Store MCQs in session (simulate quiz experience, stateless option for demo)
      req.session = req.session || {};
      req.session.latestMCQs = mcqs;

      res.status(200).json({
        status: 'ok',
        message: 'MCQs generated successfully.',
        mcqs,
      });
    } catch (err) {
      console.error('Error in /quiz/upload:', err);
      res.status(500).json({ status: 'error', message: 'Failed to process the document.' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Returns the current quiz (MCQs), for the current session.
   */
  async getQuiz(req, res) {
    try {
      req.session = req.session || {};
      if (!req.session.latestMCQs) {
        return res.status(404).json({ status: 'error', message: 'No quiz session found. Upload a file first.' });
      }
      res.status(200).json({
        status: 'ok',
        mcqs: req.session.latestMCQs,
      });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Error fetching quiz.' });
    }
  }

  // PUBLIC_INTERFACE
  /**
   * Grade A SINGLE quiz answer submission.
   * Expects: { questionId: string, selectedOption: string }
   * Returns: { correct, correctAnswer, explanation }
   */
  async answerQuiz(req, res) {
    try {
      req.session = req.session || {};
      const { questionId, selectedOption } = req.body;
      if (
        !req.session.latestMCQs ||
        !questionId ||
        typeof selectedOption !== 'string'
      ) {
        return res.status(400).json({ status: 'error', message: 'Invalid answer payload or session expired.' });
      }
      const result = quizService.gradeAnswer(req.session.latestMCQs, questionId, selectedOption);
      if (!result) {
        return res.status(404).json({ status: 'error', message: 'Question not found.' });
      }
      res.status(200).json({ status: 'ok', ...result });
    } catch (err) {
      res.status(500).json({ status: 'error', message: 'Failed to submit answer.' });
    }
  }
}

module.exports = new QuizController();

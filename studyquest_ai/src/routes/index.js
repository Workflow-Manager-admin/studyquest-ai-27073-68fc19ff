const express = require('express');
const healthController = require('../controllers/health');
const quizController = require('../controllers/quiz');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Storage for Multer - store in /tmp, random names to avoid collision
const upload = multer({
  dest: '/tmp',
  limits: { fileSize: 6 * 1024 * 1024 }, // 6MB max per file
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' && ext !== '.docx') {
      return cb(new Error('Only PDF and DOCX files are allowed.'));
    }
    cb(null, true);
  },
  filename: (req, file, cb) => {
    // Unique random name
    cb(null, crypto.randomBytes(16).toString('hex') + path.extname(file.originalname));
  },
});

const router = express.Router();

// Health endpoint
router.get('/', healthController.check.bind(healthController));

/**
 * @swagger
 * /quiz/upload:
 *   post:
 *     summary: Upload PDF/DOCX file to generate MCQs
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: MCQs generated successfully
 */
router.post('/quiz/upload', upload.single('file'), quizController.uploadFile.bind(quizController));

/**
 * @swagger
 * /quiz:
 *   get:
 *     summary: Get the current session's MCQs (start/review quiz)
 *     responses:
 *       200:
 *         description: List of MCQs for quiz
 */
router.get('/quiz', quizController.getQuiz.bind(quizController));

/**
 * @swagger
 * /quiz/answer:
 *   post:
 *     summary: Submit answer for a question in the quiz
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: string
 *               selectedOption:
 *                 type: string
 *     responses:
 *       200:
 *         description: Returns correctness and explanation
 */
router.post('/quiz/answer', quizController.answerQuiz.bind(quizController));

module.exports = router;

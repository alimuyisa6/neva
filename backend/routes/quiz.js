// backend/routes/quiz.js
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as quizController from '../controllers/quizController.js';
const router = Router();
router.get('/get_quiz_topics', quizController.getQuizTopics);
router.get('/get_quiz_block', requireAuth, quizController.getQuizBlock);
router.get('/check_daily_retry', requireAuth, quizController.checkDailyRetry);
router.post('/check_quiz_answer', requireAuth, quizController.checkQuizAnswer);
router.post('/submit_quiz_block', requireAuth, quizController.submitQuizBlock);
router.post('/add_quiz_questions_batch', quizController.addQuizQuestionsBatch);
export default router;

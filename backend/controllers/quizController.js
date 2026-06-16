// backend/controllers/quizController.js
import * as quizService from '../services/quizService.js';

export async function getQuizTopics(req, res) {
  try { res.json(await quizService.getQuizTopics(req.query.level, req.userId)); } catch (e) { res.status(400).json({ error: e.message }); }
}
export async function getQuizBlock(req, res) {
  try { res.json(await quizService.getQuizBlock(req.query.level, req.query.topic, req.query.block_number)); } catch (e) { res.status(400).json({ error: e.message }); }
}
export async function checkDailyRetry(req, res) {
  try { res.json(await quizService.checkDailyRetry(req.userId, req.query.level, req.query.topic, req.query.block_number)); } catch (e) { res.status(400).json({ error: e.message }); }
}
export async function checkQuizAnswer(req, res) {
  try { res.json(await quizService.checkQuizAnswer(req.body.question_id, req.body.selected_option)); } catch (e) { res.status(404).json({ error: e.message }); }
}
export async function submitQuizBlock(req, res) {
  try { res.json(await quizService.submitQuizBlock(req.userId, req.body)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function addQuizQuestionsBatch(req, res) {
  try { res.json(await quizService.addQuizQuestionsBatch(req.body)); } catch (e) { res.status(500).json({ error: e.message }); }
}

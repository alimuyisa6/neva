// backend/routes/recall.js
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as recallController from '../controllers/recallController.js';
const router = Router();
router.get('/session', requireAuth, recallController.getSession);
router.get('/session_check', requireAuth, recallController.sessionCheck);
router.get('/stats', requireAuth, recallController.getStats);
router.get('/achievements', requireAuth, recallController.getAchievements);
router.get('/dashboard', requireAuth, recallController.getDashboard);
router.get('/topics', requireAuth, recallController.getTopics);
router.get('/get_selected_level', requireAuth, recallController.getLevel);
router.post('/continue', requireAuth, recallController.continueSession);
router.post('/answer', requireAuth, recallController.submitAnswer);
router.post('/complete', requireAuth, recallController.completeSession);
router.post('/set_selected_level', requireAuth, recallController.setLevel);
export default router;

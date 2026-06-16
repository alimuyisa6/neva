// backend/routes/challenge.js
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import * as challengeController from '../controllers/challengeController.js';
const router = Router();
router.get('/status', requireAuth, challengeController.getChallengeStatus);
router.post('/submit', requireAuth, challengeController.submitChallenge);
export default router;

// backend/routes/community.js
import { Router } from 'express';
import * as communityController from '../controllers/communityController.js';
const router = Router();
router.get('/activity', communityController.getCommunityActivity);
export default router;

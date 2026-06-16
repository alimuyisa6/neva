// backend/routes/auth.js
import { Router } from 'express';
import * as authController from '../controllers/authController.js';
const router = Router();
router.post('/signup', authController.signup);
router.post('/signin', authController.signin);
router.post('/signout', authController.signout);
router.get('/get_user', authController.getUser);
export default router;

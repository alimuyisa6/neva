// backend/routes/contact.js
import { Router } from 'express';
import * as contactController from '../controllers/contactController.js';
const router = Router();
router.post('/submit_contact', contactController.submitContact);
router.post('/subscribe_newsletter', contactController.subscribeNewsletter);
export default router;

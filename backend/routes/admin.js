// backend/routes/admin.js
import { Router } from 'express';
import { requireAdmin, adminRole } from '../middleware/auth.js';
import * as adminController from '../controllers/adminController.js';
const router = Router();
router.use(requireAdmin);
router.get('/stats', adminController.getAdminStats);
router.get('/submissions', adminController.getSubmissions);
router.get('/messages', adminController.getContactMessages);
router.get('/get_admin_users', adminController.getAdminUsers);
router.get('/get_newsletter_subscribers', adminController.getNewsletterSubscribers);
router.get('/get_donations', adminController.getDonations);
router.get('/get_page_activity', adminRole('super_admin'), adminController.getPageActivity);
router.post('/update_user_role', adminRole('super_admin'), adminController.updateUserRole);
router.post('/update_user_lock', adminRole('super_admin'), adminController.updateUserLock);
router.post('/update_user_restriction', adminRole('super_admin'), adminController.updateUserRestriction);
router.post('/update_app_feature', adminController.updateAppFeature);
router.post('/delete_quiz_topic', adminRole('super_admin'), adminController.deleteQuizTopic);
export default router;

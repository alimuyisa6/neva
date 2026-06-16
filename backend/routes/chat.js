// backend/routes/chat.js
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as chatController from '../controllers/chatController.js';
const router = Router();
router.get('/check_admin_online', chatController.checkAdminOnline);
router.get('/get_chat_messages', requireAuth, chatController.getChatMessages);
router.post('/request_chat', requireAuth, chatController.requestChat);
router.post('/send_chat_message', requireAuth, chatController.sendChatMessage);
router.post('/delete_chat_message', requireAuth, chatController.deleteChatMessage);
router.post('/update_user_presence', requireAuth, chatController.updateUserPresence);
router.get('/admin_get_pending_requests', requireAdmin, chatController.adminGetPendingRequests);
router.post('/admin_accept_chat', requireAdmin, chatController.adminAcceptChat);
router.post('/admin_reject_chat', requireAdmin, chatController.adminRejectChat);
router.get('/admin_get_active_chats', requireAdmin, chatController.adminGetActiveChats);
router.post('/admin_update_presence', requireAdmin, chatController.adminUpdatePresence);
export default router;

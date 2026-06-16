// backend/controllers/chatController.js
import * as chatService from '../services/chatService.js';

export async function requestChat(req, res) {
  try { res.json(await chatService.requestChat(req.userId)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getChatMessages(req, res) {
  try { res.json(await chatService.getChatMessages(req.userId, req.query.room_id)); } catch (e) { res.status(e.message.includes('not found')?404:403).json({ error: e.message }); }
}
export async function sendChatMessage(req, res) {
  try { res.json(await chatService.sendChatMessage(req.userId, req.body.room_id, req.body.message)); } catch (e) { res.status(403).json({ error: e.message }); }
}
export async function deleteChatMessage(req, res) {
  try { res.json(await chatService.deleteChatMessage(req.userId, req.body.message_id)); } catch (e) { res.status(403).json({ error: e.message }); }
}
export async function updateUserPresence(req, res) {
  try { res.json(await chatService.updateUserPresence(req.userId)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function checkAdminOnline(req, res) {
  try { res.json(await chatService.checkAdminOnline()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function adminGetPendingRequests(req, res) {
  try { res.json(await chatService.adminGetPendingRequests()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function adminAcceptChat(req, res) {
  try { res.json(await chatService.adminAcceptChat(req.adminData.id, req.body.room_id)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function adminRejectChat(req, res) {
  try { res.json(await chatService.adminRejectChat(req.body.room_id)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function adminGetActiveChats(req, res) {
  try { res.json(await chatService.adminGetActiveChats()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function adminUpdatePresence(req, res) {
  try { res.json(await chatService.adminUpdatePresence(req.adminData.id, req.body.is_online, req.body.is_busy)); } catch (e) { res.status(500).json({ error: e.message }); }
}

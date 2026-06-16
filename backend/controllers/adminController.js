// backend/controllers/adminController.js
import * as adminService from '../services/adminService.js';

export async function getAdminStats(req, res) {
  try { res.json(await adminService.getAdminStats()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getSubmissions(req, res) {
  try { res.json(await adminService.getSubmissions()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getContactMessages(req, res) {
  try { res.json(await adminService.getContactMessages()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getAdminUsers(req, res) {
  try { res.json(await adminService.getAdminUsers()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getNewsletterSubscribers(req, res) {
  try { res.json(await adminService.getNewsletterSubscribers()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getDonations(req, res) {
  try { res.json(await adminService.getDonations()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getPageActivity(req, res) {
  try { res.json(await adminService.getPageActivity(req.adminData)); } catch (e) { res.status(403).json({ error: e.message }); }
}
export async function updateUserRole(req, res) {
  try { res.json(await adminService.updateUserRole(req.adminData, req.body.userId, req.body.role)); } catch (e) { res.status(403).json({ error: e.message }); }
}
export async function updateUserLock(req, res) {
  try { res.json(await adminService.updateUserLock(req.adminData, req.body.userId, req.body.lock, req.body.reason)); } catch (e) { res.status(403).json({ error: e.message }); }
}
export async function updateUserRestriction(req, res) {
  try { res.json(await adminService.updateUserRestriction(req.adminData, req.body)); } catch (e) { res.status(403).json({ error: e.message }); }
}
export async function updateAppFeature(req, res) {
  try { res.json(await adminService.updateAppFeature(req.body.feature_key, req.body.settings, req.body.is_enabled)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function deleteQuizTopic(req, res) {
  try { res.json(await adminService.deleteQuizTopic(req.adminData, req.body.topic, req.body.level)); } catch (e) { res.status(403).json({ error: e.message }); }
}

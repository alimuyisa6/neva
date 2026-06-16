// backend/controllers/recallController.js
import * as recallService from '../services/recallService.js';
import crypto from 'crypto';

function generateCsrfToken(secret) {
  const timestamp = Math.floor(Date.now() / (15 * 60 * 1000)) * (15 * 60 * 1000);
  const hmac = crypto.createHmac('sha256', secret).update(timestamp.toString()).digest('hex');
  return `${timestamp}.${hmac}`;
}

export async function sessionCheck(req, res) {
  try { res.json(await recallService.handleSessionCheck(req.userId, { level: req.query.level, topic: req.query.topic })); } catch (e) { res.status(400).json({ error: e.message }); }
}
export async function getSession(req, res) {
  try { res.json(await recallService.handleGetSession(req.userId, { level: req.query.level, topic: req.query.topic })); } catch (e) { res.status(400).json({ error: e.message }); }
}
export async function continueSession(req, res) {
  try { res.json(await recallService.handleContinueSession(req.userId, req.body)); } catch (e) { res.status(400).json({ error: e.message }); }
}
export async function submitAnswer(req, res) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const result = await recallService.handleSubmitAnswer(req.userId, req.body, ip);
    const csrfToken = req.csrfSecret ? generateCsrfToken(req.csrfSecret) : null;
    res.json({ data: result, csrf_token: csrfToken });
  } catch (e) { res.status(400).json({ error: e.message }); }
}
export async function completeSession(req, res) {
  try { res.json(await recallService.handleCompleteSession(req.userId, req.body)); } catch (e) { res.status(400).json({ error: e.message }); }
}
export async function getStats(req, res) {
  try { res.json(await recallService.handleGetStats(req.userId)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getAchievements(req, res) {
  try { res.json(await recallService.handleGetAchievements(req.userId)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getDashboard(req, res) {
  try { res.json(await recallService.handleGetDashboard(req.userId)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getTopics(req, res) {
  try { res.json(await recallService.getTopicsForLevel(req.query.level)); } catch (e) { res.status(400).json({ error: e.message }); }
}
export async function setLevel(req, res) {
  try { res.json(await recallService.handleSetLevel(req.userId, req.body.level)); } catch (e) { res.status(400).json({ error: e.message }); }
}
export async function getLevel(req, res) {
  try { res.json(await recallService.handleGetLevel(req.userId)); } catch (e) { res.status(500).json({ error: e.message }); }
}

// backend/controllers/interactionsController.js
import * as interactionsService from '../services/interactionsService.js';

export async function toggleFavorite(req, res) { try { res.json(await interactionsService.toggleFavorite(req.userId, req.body.resource_id)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function recordView(req, res) { try { res.json(await interactionsService.recordView(req.userId, req.body.resource_id)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function recordDownload(req, res) { try { res.json(await interactionsService.recordDownload(req.userId, req.body.resource_id)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function recordDailyVisit(req, res) { try { res.json(await interactionsService.recordDailyVisit(req.userId)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function submitRating(req, res) { try { res.json(await interactionsService.submitRating(req.userId, req.body.resource_id, req.body.rating)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function likeResource(req, res) { try { res.json(await interactionsService.likeResource(req.userId, req.body.resource_id)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function commentResource(req, res) { try { res.json(await interactionsService.commentResource(req.userId, req.body.resource_id, req.body.comment)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function submitMood(req, res) { try { res.json(await interactionsService.submitMood(req.userId, req.body.mood, req.body.message)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function saveAchievement(req, res) { try { res.json(await interactionsService.saveAchievement(req.userId, req.body.badge)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function updateUserPresence(req, res) { try { res.json(await interactionsService.updateUserPresence(req.userId)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function getResourceInteractions(req, res) { try { res.json(await interactionsService.getResourceInteractions(req.query.resource_id)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function getUserFavorites(req, res) { try { res.json(await interactionsService.getUserFavorites(req.userId)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function getRecentViews(req, res) { try { res.json(await interactionsService.getRecentViews(req.userId, parseInt(req.query.limit) || 5)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function getUserRatings(req, res) { try { res.json(await interactionsService.getUserRatings(req.userId)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function getUserAchievements(req, res) { try { res.json(await interactionsService.getUserAchievements(req.userId)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function getUserStreak(req, res) { try { res.json(await interactionsService.getUserStreak(req.userId)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function getPublicStats(req, res) { try { res.json(await interactionsService.getPublicStats()); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function saveQuizState(req, res) { try { res.json(await interactionsService.saveQuizState(req.userId, req.body.state)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function getQuizState(req, res) { try { res.json(await interactionsService.getQuizState(req.userId)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function trackEvent(req, res) { try { res.json(await interactionsService.trackEvent(req.userId, req.body.event_name, req.body.event_data)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function platformStats(req, res) { try { res.json(await interactionsService.getPlatformStats()); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function dashboard(req, res) { try { res.json(await interactionsService.getUserDashboard(req.userId)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function dailyChallenge(req, res) { try { res.json(await interactionsService.getDailyChallenge(req.userId)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function weakAreas(req, res) { try { res.json(await interactionsService.getWeakAreas(req.userId)); } catch(e){ res.status(500).json({ error: e.message }); } }
export async function learningPaths(req, res) { try { res.json(await interactionsService.getLearningPaths(req.query.level, req.userId)); } catch(e){ res.status(400).json({ error: e.message }); } }
export async function personalRecords(req, res) { try { res.json(await interactionsService.getPersonalRecords(req.userId)); } catch(e){ res.status(500).json({ error: e.message }); } }

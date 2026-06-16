// backend/controllers/challengeController.js
import * as challengeService from '../services/challengeService.js';

export async function getChallengeStatus(req, res) {
  try { res.json(await challengeService.getChallengeStatus(req.userId, req.query.week_start)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function submitChallenge(req, res) {
  try { res.json(await challengeService.submitChallenge(req.userId, req.body.week_start, req.body.selected_option)); } catch (e) { res.status(500).json({ error: e.message }); }
}

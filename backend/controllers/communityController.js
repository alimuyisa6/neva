// backend/controllers/communityController.js
import * as communityService from '../services/communityService.js';
export async function getCommunityActivity(req, res) {
  try { res.json(await communityService.getCommunityActivity()); } catch (e) { res.status(500).json({ error: e.message }); }
}

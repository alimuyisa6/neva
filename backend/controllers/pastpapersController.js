// backend/controllers/pastpapersController.js
import * as pastpapersService from '../services/pastpapersService.js';

export async function getPapers(req, res) {
  try { res.json(await pastpapersService.getPapers(req.query)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getPaper(req, res) {
  try { res.json(await pastpapersService.getPaper(req.query.id)); } catch (e) { res.status(404).json({ error: e.message }); }
}
export async function getFilterOptions(req, res) {
  try { res.json(await pastpapersService.getFilterOptions()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getDownloadUrl(req, res) {
  try { res.json(await pastpapersService.getDownloadUrl(req.query.id, req.userId)); } catch (e) { res.status(404).json({ error: e.message }); }
}
export async function addPaper(req, res) {
  try { res.json(await pastpapersService.addPaper(req.body)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function addPapersBatch(req, res) {
  try { res.json(await pastpapersService.addPapersBatch(req.body.papers)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function deletePaper(req, res) {
  try { res.json(await pastpapersService.deletePaper(req.body.id)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function trackDownload(req, res) {
  try { res.json(await pastpapersService.trackDownload(req.body.id, req.userId)); } catch (e) { res.status(500).json({ error: e.message }); }
}

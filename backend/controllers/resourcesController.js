// backend/controllers/resourcesController.js
import * as resourcesService from '../services/resourcesService.js';

export async function getResources(req, res) {
  try { res.json(await resourcesService.getResources(req.query)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getFilterOptions(req, res) {
  try { res.json(await resourcesService.getFilterOptions()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getPdfsByLevel(req, res) {
  try { res.json(await resourcesService.getPdfsByLevel(req.query.level)); } catch (e) { res.status(400).json({ error: e.message }); }
}
export async function getNotesStructure(req, res) {
  try { res.json(await resourcesService.getNotesStructure()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getNoteContent(req, res) {
  try { res.json(await resourcesService.getNoteContent(req.query.subtopic_id)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getNotePreview(req, res) {
  try { res.json(await resourcesService.getNotePreview(req.query.subtopic_id)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getNoteReactions(req, res) {
  try { res.json(await resourcesService.getNoteReactions(req.query.note_id)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getReadingProgress(req, res) {
  try { res.json(await resourcesService.getReadingProgress(req.userId, req.query.note_id)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getContinueReading(req, res) {
  try { res.json(await resourcesService.getContinueReading(req.userId, parseInt(req.query.limit) || 10)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function submitResource(req, res) {
  try { res.json(await resourcesService.submitResource(req.userId, req.body.payload)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function approveResource(req, res) {
  try { res.json(await resourcesService.approveResource(req.body.submissionId, req.body.action)); } catch (e) { res.status(403).json({ error: e.message }); }
}
export async function trackPdfPreview(req, res) {
  try { res.json(await resourcesService.trackPdfPreview(req.userId, req.body.pdf_id)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function trackPdfDownload(req, res) {
  try { res.json(await resourcesService.trackPdfDownload(req.userId, req.body.pdf_id)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function toggleNoteReaction(req, res) {
  try { res.json(await resourcesService.toggleNoteReaction(req.userId, req.body.note_id, req.body.reaction_type)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function saveReadingProgress(req, res) {
  try { res.json(await resourcesService.saveReadingProgress(req.userId, req.body)); } catch (e) { res.status(500).json({ error: e.message }); }
}

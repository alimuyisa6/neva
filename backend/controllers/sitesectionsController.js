// backend/controllers/sitesectionsController.js
import * as sitesectionsService from '../services/sitesectionsService.js';

export async function getAllSiteSections(req, res) {
  try { res.json(await sitesectionsService.getAllSiteSections()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getSectionHeadings(req, res) {
  try { res.json(await sitesectionsService.getSectionHeadings()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function updateSiteSection(req, res) {
  try { res.json(await sitesectionsService.updateSiteSection(req.body.section, req.body.data)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function updateSectionHeadings(req, res) {
  try { res.json(await sitesectionsService.updateSectionHeadings(req.body.headings)); } catch (e) { res.status(500).json({ error: e.message }); }
}

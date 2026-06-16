// backend/routes/sitesections.js
import { Router } from 'express';
import { requireAdmin } from '../middleware/auth.js';
import * as sitesectionsController from '../controllers/sitesectionsController.js';
const router = Router();
router.get('/get_all_site_sections', sitesectionsController.getAllSiteSections);
router.get('/get_section_headings', sitesectionsController.getSectionHeadings);
router.post('/update_site_section', requireAdmin, sitesectionsController.updateSiteSection);
router.post('/update_section_headings', requireAdmin, sitesectionsController.updateSectionHeadings);
export default router;

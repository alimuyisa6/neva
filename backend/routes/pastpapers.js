// backend/routes/pastpapers.js
import { Router } from 'express';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import * as pastpapersController from '../controllers/pastpapersController.js';
const router = Router();
router.get('/get_papers', pastpapersController.getPapers);
router.get('/get_paper', pastpapersController.getPaper);
router.get('/get_filter_options', pastpapersController.getFilterOptions);
router.get('/get_download_url', requireAuth, pastpapersController.getDownloadUrl);
router.post('/add_paper', requireAdmin, pastpapersController.addPaper);
router.post('/add_papers_batch', requireAdmin, pastpapersController.addPapersBatch);
router.post('/delete_paper', requireAdmin, pastpapersController.deletePaper);
router.post('/track_download', requireAuth, pastpapersController.trackDownload);
export default router;

// backend/controllers/contactController.js
import * as contactService from '../services/contactService.js';
export async function submitContact(req, res) {
  try { res.json(await contactService.submitContact(req.body.formData)); } catch (e) { res.status(400).json({ error: e.message }); }
}
export async function subscribeNewsletter(req, res) {
  try { res.json(await contactService.subscribeNewsletter(req.body.formData?.email)); } catch (e) { res.status(400).json({ error: e.message }); }
}

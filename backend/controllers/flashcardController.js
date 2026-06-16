// backend/controllers/flashcardController.js
import * as flashcardService from '../services/flashcardService.js';

export async function listFlashcards(req, res) {
  try { res.json(await flashcardService.listFlashcards()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getDecks(req, res) {
  try { res.json(await flashcardService.getDecks()); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getDeck(req, res) {
  try { res.json(await flashcardService.getDeck(req.query.deck_id)); } catch (e) { res.status(404).json({ error: e.message }); }
}
export async function getKnown(req, res) {
  try { res.json(await flashcardService.getKnown(req.userId)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function getProgress(req, res) {
  try { res.json(await flashcardService.getProgress(req.userId)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function createDeck(req, res) {
  try { res.json(await flashcardService.createDeck(req.userId, req.body)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function updateDeck(req, res) {
  try { res.json(await flashcardService.updateDeck(req.body)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function deleteDeck(req, res) {
  try { res.json(await flashcardService.deleteDeck(req.body.deck_id)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function addCards(req, res) {
  try { res.json(await flashcardService.addCards(req.body.deck_id, req.body.cards)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function removeCard(req, res) {
  try { res.json(await flashcardService.removeCard(req.body.card_id)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function toggleKnown(req, res) {
  try { res.json(await flashcardService.toggleKnown(req.userId, req.body.flashcard_id)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function rateCard(req, res) {
  try { res.json(await flashcardService.rateCard(req.userId, req.body.flashcard_id, req.body.difficulty)); } catch (e) { res.status(500).json({ error: e.message }); }
}
export async function checkAnswer(req, res) {
  try { res.json(await flashcardService.checkAnswer(req.body.flashcard_id, req.body.user_answer)); } catch (e) { res.status(404).json({ error: e.message }); }
}
export async function toggleBookmark(req, res) {
  try { res.json(await flashcardService.toggleBookmark(req.userId, req.body.flashcard_id)); } catch (e) { res.status(500).json({ error: e.message }); }
}

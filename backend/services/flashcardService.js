// backend/services/flashcardService.js
import { supabase } from '../utils/supabase.js';

export async function listFlashcards() {
  const { data: decks, error } = await supabase.from('flashcard_decks').select('id, category, level').order('created_at', { ascending: false });
  if (error) throw error;
  const cards = [];
  for (const deck of (decks || [])) {
    const { data: deckCards } = await supabase.from('flashcard_cards').select('id, front_text, back_text, image_url, position').eq('deck_id', deck.id).order('position', { ascending: true });
    (deckCards || []).forEach(c => cards.push({ ...c, category: deck.category, level: deck.level, deck_id: deck.id }));
  }
  return cards;
}

export async function getDecks() {
  const { data, error } = await supabase.from('flashcard_decks').select('id, title, description, category, level, author, created_at').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getDeck(deck_id) {
  const { data: deck, error } = await supabase.from('flashcard_decks').select('*').eq('id', deck_id).single();
  if (error) throw new Error('Deck not found');
  const { data: cards } = await supabase.from('flashcard_cards').select('*').eq('deck_id', deck_id).order('position', { ascending: true });
  return { ...deck, cards: cards || [] };
}

export async function getKnown(userId) {
  if (!userId) return [];
  const { data, error } = await supabase.from('user_interactions').select('metadata').eq('user_id', userId).eq('interaction_type', 'favorite').filter('metadata->>type', 'eq', 'flashcard_known');
  if (error) throw error;
  return (data || []).map(d => d.metadata?.flashcard_id).filter(Boolean);
}

export async function getProgress(userId) {
  if (!userId) return {};
  const { data } = await supabase.from('user_interactions').select('metadata').eq('user_id', userId).eq('interaction_type', 'favorite').filter('metadata->>type', 'eq', 'flashcard_known');
  const knownIds = (data || []).map(d => d.metadata?.flashcard_id).filter(Boolean);
  const { data: decks } = await supabase.from('flashcard_decks').select('id, category');
  const progress = {};
  for (const deck of (decks || [])) {
    const { count } = await supabase.from('flashcard_cards').select('id', { count: 'exact', head: true }).eq('deck_id', deck.id);
    progress[deck.category] = { total: count || 0, reviewed: 0 };
  }
  return progress;
}

export async function createDeck(userId, { title, description, category, level, cards }) {
  const { data: deck, error } = await supabase.from('flashcard_decks').insert({
    title, description: description || '', category, level, created_by: userId, created_at: new Date().toISOString(), updated_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  if (cards && cards.length > 0) {
    const cardRows = cards.map((c, i) => ({
      deck_id: deck.id, front_text: c.front_text, back_text: c.back_text, image_url: c.image_url || null, position: i, created_at: new Date().toISOString()
    }));
    await supabase.from('flashcard_cards').insert(cardRows);
  }
  return { success: true, deck_id: deck.id };
}

export async function updateDeck({ deck_id, title, description, category, level, cards }) {
  await supabase.from('flashcard_decks').update({ title, description, category, level, updated_at: new Date().toISOString() }).eq('id', deck_id);
  if (cards) {
    await supabase.from('flashcard_cards').delete().eq('deck_id', deck_id);
    const cardRows = cards.map((c, i) => ({
      deck_id, front_text: c.front_text, back_text: c.back_text, image_url: c.image_url || null, position: i, created_at: new Date().toISOString()
    }));
    await supabase.from('flashcard_cards').insert(cardRows);
  }
  return { success: true };
}

export async function deleteDeck(deck_id) {
  await supabase.from('flashcard_cards').delete().eq('deck_id', deck_id);
  await supabase.from('flashcard_decks').delete().eq('id', deck_id);
  return { success: true };
}

export async function addCards(deck_id, cards) {
  const { count } = await supabase.from('flashcard_cards').select('id', { count: 'exact', head: true }).eq('deck_id', deck_id);
  const cardRows = cards.map((c, i) => ({
    deck_id, front_text: c.front_text, back_text: c.back_text, image_url: c.image_url || null, position: (count || 0) + i, created_at: new Date().toISOString()
  }));
  const { error } = await supabase.from('flashcard_cards').insert(cardRows);
  if (error) throw error;
  return { success: true };
}

export async function removeCard(card_id) {
  await supabase.from('flashcard_cards').delete().eq('id', card_id);
  return { success: true };
}

export async function toggleKnown(userId, flashcard_id) {
  const { data: existing } = await supabase.from('user_interactions').select('id').eq('user_id', userId).eq('interaction_type', 'favorite').filter('metadata->>type', 'eq', 'flashcard_known').filter('metadata->>flashcard_id', 'eq', flashcard_id).maybeSingle();
  if (existing) {
    await supabase.from('user_interactions').delete().eq('id', existing.id);
    return { known: false };
  }
  await supabase.from('user_interactions').insert({ user_id: userId, interaction_type: 'favorite', metadata: { type: 'flashcard_known', flashcard_id } });
  return { known: true };
}

export async function rateCard(userId, flashcard_id, difficulty) {
  await supabase.from('user_interactions').insert({ user_id: userId, interaction_type: 'rating', metadata: { type: 'flashcard_rating', flashcard_id, difficulty } });
  return { success: true };
}

export async function checkAnswer(flashcard_id, user_answer) {
  const { data: card, error } = await supabase.from('flashcard_cards').select('back_text').eq('id', flashcard_id).single();
  if (error || !card) throw new Error('Card not found');
  const correct = card.back_text.trim().toLowerCase() === user_answer.trim().toLowerCase();
  return { correct, correct_answer: card.back_text };
}

export async function toggleBookmark(userId, flashcard_id) {
  const { data: existing } = await supabase.from('user_interactions').select('id').eq('user_id', userId).eq('interaction_type', 'favorite').filter('metadata->>type', 'eq', 'flashcard_bookmark').filter('metadata->>flashcard_id', 'eq', flashcard_id).maybeSingle();
  if (existing) {
    await supabase.from('user_interactions').delete().eq('id', existing.id);
    return { bookmarked: false };
  }
  await supabase.from('user_interactions').insert({ user_id: userId, interaction_type: 'favorite', metadata: { type: 'flashcard_bookmark', flashcard_id } });
  return { bookmarked: true };
}

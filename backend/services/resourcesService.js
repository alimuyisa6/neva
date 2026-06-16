// backend/services/resourcesService.js
import { supabase } from '../utils/supabase.js';

export async function getResources({ level, category, tag }) {
  let query = supabase.from('biology_notes').select('id,title,description,author,level,category,tag,section_type,file_url,file_size,download_count,created_at').order('created_at', { ascending: false }).limit(100);
  if (level) query = query.eq('level', level);
  if (category) query = query.eq('category', category);
  if (tag) query = query.eq('tag', tag);
  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function getFilterOptions() {
  const [l, c, t] = await Promise.all([
    supabase.from('biology_notes').select('level').limit(500),
    supabase.from('biology_notes').select('category').limit(500),
    supabase.from('biology_notes').select('tag').limit(500)
  ]);
  return {
    levels: [...new Set((l.data||[]).map(x=>x.level).filter(Boolean))],
    categories: [...new Set((c.data||[]).map(x=>x.category).filter(Boolean))],
    tags: [...new Set((t.data||[]).map(x=>x.tag).filter(Boolean))]
  };
}

export async function getPdfsByLevel(level) {
  const { data, error } = await supabase.from('pdf_resources').select('id,title,author,level,topic,subtopic,file_url,file_size,download_count,preview_count').eq('level', level).eq('is_active', true).order('topic', { ascending: true });
  if (error) throw error;
  return { pdfs: data || [] };
}

export async function getNotesStructure() {
  const { data, error } = await supabase.from('notes_structure').select('*').order('level_order', { ascending: true }).order('topic_order', { ascending: true }).order('subtopic_order', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function getNoteContent(subtopic_id) {
  const { data, error } = await supabase.from('note_contents').select('*').eq('subtopic_id', subtopic_id).single();
  if (error) throw error;
  return data;
}

export async function getNotePreview(subtopic_id) {
  const { data, error } = await supabase.from('note_contents').select('content, title').eq('subtopic_id', subtopic_id).single();
  if (error) throw error;
  const plainText = data?.content?.replace(/<[^>]*>/g, '') || '';
  const preview = plainText.substring(0, 400) + (plainText.length > 400 ? '...' : '');
  return { subtopic_id, title: data?.title || '', preview, read_time: Math.ceil(plainText.split(/\s+/).length / 200) };
}

export async function getNoteReactions(note_id) {
  const { data, error } = await supabase.from('note_reactions').select('reaction_type, user_id, created_at').eq('note_id', note_id);
  if (error) throw error;
  const counts = { like: 0, love: 0, helpful: 0 };
  (data || []).forEach(r => { if (counts[r.reaction_type] !== undefined) counts[r.reaction_type]++; });
  return { counts, total: (data || []).length };
}

export async function getReadingProgress(userId, note_id) {
  if (!userId) return null;
  const { data, error } = await supabase.from('user_interactions').select('value,

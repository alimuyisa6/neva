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
  const { data, error } = await supabase.from('user_interactions').select('value, metadata, created_at').eq('user_id', userId).eq('interaction_type', 'reading_progress').filter('metadata->>note_id', 'eq', note_id).maybeSingle();
  if (error) throw error;
  if (data) return { scroll_percentage: data.value || 0, scroll_position: data.metadata?.scroll_position || 0, completed: data.metadata?.completed || false, last_accessed: data.created_at, time_spent: data.metadata?.time_spent || 0 };
  return null;
}

export async function getContinueReading(userId, limit = 10) {
  if (!userId) return [];
  const { data, error } = await supabase.from('user_interactions').select('resource_id, value, metadata, created_at').eq('user_id', userId).eq('interaction_type', 'reading_progress').neq('value', 100).gt('value', 5).order('created_at', { ascending: false }).limit(limit);
  if (error) throw error;
  const notes = [];
  for (const item of (data || [])) {
    const { data: noteData } = await supabase.from('notes_structure').select('subtopic_name, topic, level').eq('subtopic_id', item.resource_id).maybeSingle();
    if (noteData) notes.push({ note_id: item.resource_id, title: noteData.subtopic_name, topic: noteData.topic, level: noteData.level, progress_percentage: item.value, last_accessed: item.created_at });
  }
  return notes;
}

export async function submitResource(userId, payload) {
  await supabase.from('resource_submissions').insert({
    title: payload.title, description: payload.description, author: payload.author, level: payload.level, category: payload.category, tag: payload.tag,
    section_type: payload.section_type, file_url: payload.file_url, file_size: payload.file_size, status: 'pending'
  });
  return { success: true };
}

export async function approveResource(submissionId, action) {
  if (action === 'delete') {
    await supabase.from('resource_submissions').delete().eq('id', submissionId);
  } else if (action === 'approve') {
    const { data: sub } = await supabase.from('resource_submissions').select('*').eq('id', submissionId).single();
    if (sub) {
      await supabase.from('biology_notes').insert({
        title: sub.title, description: sub.description, author: sub.author, level: sub.level, category: sub.category, tag: sub.tag,
        section_type: sub.section_type, file_url: sub.file_url, file_size: sub.file_size
      });
      await supabase.from('resource_submissions').update({ status: 'approved' }).eq('id', submissionId);
    }
  } else {
    await supabase.from('resource_submissions').update({ status: 'rejected' }).eq('id', submissionId);
  }
  return { success: true };
}

export async function trackPdfPreview(userId, pdf_id) {
  const { data: current } = await supabase.from('pdf_resources').select('preview_count').eq('id', pdf_id).single();
  if (current) await supabase.from('pdf_resources').update({ preview_count: (current.preview_count || 0) + 1 }).eq('id', pdf_id);
  await supabase.from('user_interactions').insert({ user_id: userId, interaction_type: 'view', resource_id: pdf_id, metadata: { pdf_id, action: 'preview' } });
  return { success: true };
}

export async function trackPdfDownload(userId, pdf_id) {
  const { data: current } = await supabase.from('pdf_resources').select('download_count').eq('id', pdf_id).single();
  if (current) await supabase.from('pdf_resources').update({ download_count: (current.download_count || 0) + 1 }).eq('id', pdf_id);
  await supabase.from('user_interactions').insert({ user_id: userId, interaction_type: 'download', resource_id: pdf_id, metadata: { pdf_id, action: 'download' } });
  return { success: true };
}

export async function toggleNoteReaction(userId, note_id, reaction_type) {
  const { data: existing } = await supabase.from('note_reactions').select('id, reaction_type').eq('user_id', userId).eq('note_id', note_id).maybeSingle();
  if (existing) {
    if (existing.reaction_type === reaction_type) await supabase.from('note_reactions').delete().eq('id', existing.id);
    else await supabase.from('note_reactions').update({ reaction_type }).eq('id', existing.id);
  } else {
    await supabase.from('note_reactions').insert({ user_id: userId, note_id, reaction_type });
  }
  const { count } = await supabase.from('note_reactions').select('id', { count: 'exact', head: true }).eq('note_id', note_id);
  return { success: true, count: count || 0 };
}

export async function saveReadingProgress(userId, { note_id, scroll_percentage, scroll_position, time_spent, completed }) {
  const numericNoteId = parseInt(note_id, 10) || 0;
  const { data: existing } = await supabase.from('user_interactions').select('id, metadata, value').eq('user_id', userId).eq('interaction_type', 'reading_progress').filter('metadata->>note_id', 'eq', note_id).maybeSingle();
  if (existing) {
    const currentTimeSpent = (existing.metadata?.time_spent || 0) + (time_spent || 0);
    await supabase.from('user_interactions').update({
      value: scroll_percentage,
      metadata: { note_id, scroll_position: scroll_position || existing.metadata?.scroll_position || 0, time_spent: currentTimeSpent, completed: completed || false, last_updated: new Date().toISOString() },
      created_at: new Date().toISOString()
    }).eq('id', existing.id);
  } else {
    await supabase.from('user_interactions').insert({
      user_id: userId, interaction_type: 'reading_progress', resource_id: numericNoteId, value: scroll_percentage,
      metadata: { note_id, scroll_position: scroll_position || 0, time_spent: time_spent || 0, completed: completed || false, started_at: new Date().toISOString() }
    });
  }
  return { success: true };
}

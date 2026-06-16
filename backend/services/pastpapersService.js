// backend/services/pastpapersService.js
import { supabase } from '../utils/supabase.js';
const STORAGE_BUCKET = 'past-papers';

export async function getPapers({ level, subject, year, exam_board, paper_type, topic, search, page = 1, limit = 20 }) {
  const offset = (parseInt(page) - 1) * parseInt(limit);
  let query = supabase.from('past_papers').select('*', { count: 'exact' }).eq('is_active', true).order('year', { ascending: false }).order('title', { ascending: true }).range(offset, offset + parseInt(limit) - 1);
  if (level) query = query.eq('level', level);
  if (subject) query = query.eq('subject', subject);
  if (year) query = query.eq('year', parseInt(year));
  if (exam_board) query = query.eq('exam_board', exam_board);
  if (paper_type) query = query.eq('paper_type', paper_type);
  if (topic) query = query.eq('topic', topic);
  if (search) query = query.or(`title.ilike.%${search}%,subject.ilike.%${search}%,topic.ilike.%${search}%`);
  const { data, error, count } = await query;
  if (error) throw error;
  return { papers: data || [], total: count || 0, page: parseInt(page), limit: parseInt(limit), total_pages: Math.ceil((count || 0) / parseInt(limit)) };
}

export async function getPaper(id) {
  const { data, error } = await supabase.from('past_papers').select('*').eq('id', id).eq('is_active', true).single();
  if (error || !data) throw new Error('Paper not found');
  return data;
}

export async function getFilterOptions() {
  const { data } = await supabase.from('past_papers').select('level, subject, year, exam_board, paper_type, topic').eq('is_active', true);
  const unique = (arr, key) => [...new Set(arr.map(r => r[key]).filter(Boolean))].sort();
  return {
    levels: unique(data, 'level'),
    subjects: unique(data, 'subject'),
    years: [...new Set(data.map(r => r.year).filter(Boolean))].sort((a, b) => b - a),
    exam_boards: unique(data, 'exam_board'),
    paper_types: unique(data, 'paper_type'),
    topics: unique(data, 'topic')
  };
}

export async function getDownloadUrl(id, userId) {
  const { data: paper } = await supabase.from('past_papers').select('file_path').eq('id', id).eq('is_active', true).single();
  if (!paper) throw new Error('Paper not found');
  const { data: signedUrl, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(paper.file_path, 60);
  if (error) throw new Error('Failed to generate download link');
  await supabase.from('past_papers').update({ download_count: supabase.rpc('increment', { x: 1 }) }).eq('id', id);
  await supabase.from('past_paper_downloads').insert({ paper_id: id, user_id: userId || null, downloaded_at: new Date().toISOString() });
  return { url: signedUrl.signedUrl, expires_in: 60 };
}

export async function addPaper({ title, level, subject, year, exam_board, paper_type, topic, file_path }) {
  const { data, error } = await supabase.from('past_papers').insert({
    title, level, subject, year: parseInt(year), exam_board: exam_board || null, paper_type: paper_type || null, topic: topic || null,
    file_path, download_count: 0, is_active: true, created_at: new Date().toISOString()
  }).select().single();
  if (error) throw error;
  return { success: true, paper: data };
}

export async function addPapersBatch(papers) {
  const rows = papers.map(p => ({
    title: p.title, level: p.level, subject: p.subject, year: parseInt(p.year),
    exam_board: p.exam_board || null, paper_type: p.paper_type || null, topic: p.topic || null,
    file_path: p.file_path, download_count: 0, is_active: true, created_at: new Date().toISOString()
  }));
  const { error } = await supabase.from('past_papers').insert(rows);
  if (error) throw error;
  return { success: true, added: rows.length };
}

export async function deletePaper(id) {
  await supabase.from('past_papers').update({ is_active: false }).eq('id', id);
  return { success: true };
}

export async function trackDownload(id, userId) {
  await supabase.from('past_paper_downloads').insert({ paper_id: id, user_id: userId || null, downloaded_at: new Date().toISOString() });
  return { success: true };
}

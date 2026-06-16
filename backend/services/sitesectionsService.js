// backend/services/sitesectionsService.js
import { supabase } from '../utils/supabase.js';

export async function getAllSiteSections() {
  const { data, error } = await supabase.from('site_sections').select('section, data');
  if (error) throw error;
  const result = {};
  (data || []).forEach(row => { result[row.section] = row.data; });
  return result;
}

export async function getSectionHeadings() {
  const { data, error } = await supabase.from('site_sections').select('data').eq('section', 'section_headings').single();
  if (error && error.code !== 'PGRST116') throw error;
  return data?.data || {};
}

export async function updateSiteSection(section, data) {
  const { data: existing } = await supabase.from('site_sections').select('id').eq('section', section).maybeSingle();
  if (existing) {
    await supabase.from('site_sections').update({ data }).eq('section', section);
  } else {
    await supabase.from('site_sections').insert({ section, data });
  }
  return { success: true };
}

export async function updateSectionHeadings(headings) {
  const { data: existing } = await supabase.from('site_sections').select('id').eq('section', 'section_headings').maybeSingle();
  if (existing) {
    await supabase.from('site_sections').update({ data: headings }).eq('section', 'section_headings');
  } else {
    await supabase.from('site_sections').insert({ section: 'section_headings', data: headings });
  }
  return { success: true };
}

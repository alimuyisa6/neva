// backend/services/challengeService.js
import { supabase } from '../utils/supabase.js';

export async function getChallengeStatus(userId, week_start) {
  if (!userId) return { submitted: false, selected_option: null };
  const { data } = await supabase.from('user_interactions').select('metadata').eq('user_id', userId).eq('interaction_type', 'quiz_attempt').filter('metadata->>week_start', 'eq', week_start).maybeSingle();
  if (!data) return { submitted: false, selected_option: null };
  return { submitted: true, selected_option: data.metadata?.selected_option ?? null };
}

export async function submitChallenge(userId, week_start, selected_option) {
  const { data: existing } = await supabase.from('user_interactions').select('id').eq('user_id', userId).eq('interaction_type', 'quiz_attempt').filter('metadata->>week_start', 'eq', week_start).maybeSingle();
  if (existing) return { success: true, already_submitted: true };
  const { error } = await supabase.from('user_interactions').insert({ user_id: userId, interaction_type: 'quiz_attempt', metadata: { week_start, selected_option } });
  if (error) throw error;
  return { success: true, already_submitted: false };
}

// backend/services/interactionsService.js
import { supabase } from '../utils/supabase.js';
import { getCached, setCached } from '../utils/cache.js';

const CACHE_TTL = { STATS: 30000, DASHBOARD: 30000 };

export async function toggleFavorite(userId, resource_id) {
  const { data: existing } = await supabase.from('user_interactions').select('id').eq('user_id', userId).eq('resource_id', resource_id).eq('interaction_type', 'favorite').maybeSingle();
  if (existing) { await supabase.from('user_interactions').delete().eq('id', existing.id); return { favorited: false }; }
  await supabase.from('user_interactions').insert({ user_id: userId, resource_id, interaction_type: 'favorite' });
  return { favorited: true };
}

export async function recordView(userId, resource_id) {
  await supabase.from('user_interactions').insert({ user_id: userId, resource_id, interaction_type: 'view' });
  return { success: true };
}

export async function recordDownload(userId, resource_id) {
  await supabase.from('user_interactions').insert({ user_id: userId, resource_id, interaction_type: 'download' });
  return { success: true };
}

export async function recordDailyVisit(userId) {
  const today = new Date().toISOString().slice(0, 10);
  const { data: existing } = await supabase.from('user_interactions').select('id').eq('user_id', userId).eq('interaction_type', 'daily_visit').gte('created_at', `${today}T00:00:00Z`).lte('created_at', `${today}T23:59:59Z`).limit(1);
  if (!existing || existing.length === 0) {
    await supabase.from('user_interactions').insert({ user_id: userId, interaction_type: 'daily_visit' });
  }
  return { success: true };
}

export async function submitRating(userId, resource_id, rating) {
  const { data: existing } = await supabase.from('user_interactions').select('id').eq('user_id', userId).eq('resource_id', resource_id).eq('interaction_type', 'rating').maybeSingle();
  if (existing) { await supabase.from('user_interactions').update({ value: rating, created_at: new Date().toISOString() }).eq('id', existing.id); }
  else { await supabase.from('user_interactions').insert({ user_id: userId, resource_id, interaction_type: 'rating', value: rating }); }
  return { success: true };
}

export async function likeResource(userId, resource_id) {
  const { data: existing } = await supabase.from('user_interactions').select('id').eq('user_id', userId).eq('resource_id', resource_id).eq('interaction_type', 'favorite').maybeSingle();
  if (existing) { await supabase.from('user_interactions').delete().eq('id', existing.id); }
  else { await supabase.from('user_interactions').insert({ user_id: userId, interaction_type: 'favorite', resource_id }); }
  const { count } = await supabase.from('user_interactions').select('id', { count: 'exact', head: true }).eq('resource_id', resource_id).eq('interaction_type', 'favorite');
  return { liked: !existing, like_count: count || 0 };
}

export async function commentResource(userId, resource_id, comment) {
  await supabase.from('user_interactions').insert({ user_id: userId, interaction_type: 'review', resource_id, metadata: { comment } });
  return { success: true };
}

export async function submitMood(userId, mood, message) {
  await supabase.from('user_interactions').insert({ user_id: userId, interaction_type: 'mood', resource_id: null, metadata: { mood, message: message || '' } });
  return { success: true };
}

export async function saveAchievement(userId, badge) {
  const badgeId = badge.id || badge;
  const { data: existing } = await supabase.from('user_interactions').select('id').eq('user_id', userId).eq('interaction_type', 'achievement').eq('metadata->>badge', badgeId).maybeSingle();
  if (existing) return { success: true, already_earned: true };
  await supabase.from('user_interactions').insert({ user_id: userId, interaction_type: 'achievement', metadata: { badge: badgeId, ...(typeof badge === 'object' ? badge : {}) } });
  return { success: true, already_earned: false };
}

export async function updateUserPresence(userId) {
  await supabase.from('user_presence').upsert({ user_id: userId, last_seen: new Date().toISOString() }, { onConflict: 'user_id' });
  return { success: true };
}

export async function getResourceInteractions(resource_id) {
  const { count: likeCount } = await supabase.from('user_interactions').select('id', { count: 'exact', head: true }).eq('resource_id', resource_id).eq('interaction_type', 'favorite');
  const { data: comments } = await supabase.from('user_interactions').select('metadata, created_at, user_id').eq('resource_id', resource_id).eq('interaction_type', 'review').order('created_at', { ascending: false }).limit(20);
  const commentList = [];
  if (comments) {
    for (const c of comments) {
      try {
        const { data: { user } } = await supabase.auth.admin.getUserById(c.user_id);
        commentList.push({ comment: c.metadata?.comment || '', user_name: user?.email ? user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, x => x.toUpperCase()) : 'User', created_at: c.created_at });
      } catch { commentList.push({ comment: c.metadata?.comment || '', user_name: 'User', created_at: c.created_at }); }
    }
  }
  return { like_count: likeCount || 0, comments: commentList };
}

export async function getUserFavorites(userId) {
  const { data } = await supabase.from('user_interactions').select('resource_id').eq('user_id', userId).eq('interaction_type', 'favorite').order('created_at', { ascending: false });
  const favorites = [];
  for (const f of (data || [])) {
    const { data: resource } = await supabase.from('biology_notes').select('title').eq('id', f.resource_id).maybeSingle();
    favorites.push({ resource_id: f.resource_id, title: resource?.title || 'Unknown' });
  }
  return favorites;
}

export async function getRecentViews(userId, limit = 5) {
  const { data } = await supabase.from('user_interactions').select('resource_id, created_at').eq('user_id', userId).eq('interaction_type', 'view').order('created_at', { ascending: false }).limit(limit);
  const views = [];
  for (const v of (data || [])) {
    const { data: resource } = await supabase.from('biology_notes').select('title').eq('id', v.resource_id).maybeSingle();
    views.push({ resource_id: v.resource_id, title: resource?.title || 'Unknown', created_at: v.created_at });
  }
  return views;
}

export async function getUserRatings(userId) {
  const { data } = await supabase.from('user_interactions').select('resource_id, value').eq('user_id', userId).eq('interaction_type', 'rating');
  const userRatings = {};
  (data || []).forEach(r => { userRatings[r.resource_id] = r.value; });
  return userRatings;
}

export async function getUserAchievements(userId) {
  const { data } = await supabase.from('user_interactions').select('metadata').eq('user_id', userId).eq('interaction_type', 'achievement');
  return (data || []).map(d => ({ badge: d.metadata?.badge || 'Unknown' }));
}

export async function getUserStreak(userId) {
  const { data } = await supabase.from('user_interactions').select('created_at').eq('user_id', userId).eq('interaction_type', 'daily_visit').order('created_at', { ascending: false });
  const dates = (data || []).map(d => new Date(d.created_at).toISOString().slice(0, 10));
  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  let checkDate = today;
  const dateSet = new Set(dates);
  if (!dateSet.has(checkDate)) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (!dateSet.has(yesterday)) return { count: 0 };
    checkDate = yesterday;
  }
  while (dateSet.has(checkDate)) {
    streak++;
    const d = new Date(checkDate);
    d.setDate(d.getDate() - 1);
    checkDate = d.toISOString().slice(0, 10);
  }
  return { count: streak };
}

export async function getPublicStats() {
  try {
    const [resCount, downCount, quizCount, authUsers] = await Promise.all([
      supabase.from('biology_notes').select('id', { count: 'exact', head: true }),
      supabase.from('user_interactions').select('id', { count: 'exact', head: true }).eq('interaction_type', 'download'),
      supabase.from('user_quiz_activity').select('id', { count: 'exact', head: true }),
      supabase.auth.admin.listUsers()
    ]);
    return {
      resources_count: resCount.count || 0,
      downloads_count: downCount.count || 0,
      quiz_attempts: quizCount.count || 0,
      users_count: authUsers.data?.users?.length || 0
    };
  } catch { return { resources_count: 0, downloads_count: 0, quiz_attempts: 0, users_count: 0 }; }
}

export async function saveQuizState(userId, state) {
  const safeState = {
    topic: state.topic, level: state.level, block: state.block,
    totalBlocks: state.totalBlocks, index: state.index, startTime: state.startTime,
    totalQuestions: state.totalQuestions,
    answers: (state.answers || []).map(a => a ? {
      selected: a.selected, correct: a.correct,
      correct_option: a.correct_option, correct_answer_text: a.correct_answer_text
    } : null),
    questions: (state.questions || []).map(q => ({
      id: q.id, question_text: q.question_text,
      option_a: q.option_a, option_b: q.option_b,
      option_c: q.option_c, option_d: q.option_d, difficulty: q.difficulty
    }))
  };
  await supabase.from('user_quiz_sessions').upsert(
    { user_id: userId, state: safeState, updated_at: new Date().toISOString() },
    { onConflict: 'user_id' }
  );
  return { success: true };
}

export async function getQuizState(userId) {
  const { data } = await supabase.from('user_quiz_sessions').select('state').eq('user_id', userId).maybeSingle();
  return { state: data?.state || null };
}

export async function trackEvent(userId, event_name, event_data) {
  await supabase.from('user_analytics').insert({
    user_id: userId, event_name,
    event_data: event_data || {}, created_at: new Date().toISOString()
  });
  return { success: true };
}

export async function getPlatformStats() {
  const cached = getCached('platform_stats');
  if (cached) return cached;
  const { data, error } = await supabase.from('platform_stats').select('*').eq('id', 1).single();
  if (error || !data) {
    const { count: qCount } = await supabase.from('quiz_questions').select('id', { count: 'exact', head: true });
    const { count: tCount } = await supabase.from('quiz_topics').select('id', { count: 'exact', head: true });
    const { data: activities } = await supabase.from('user_quiz_activity').select('percentage');
    const avgPass = activities && activities.length ? Math.round(activities.filter(a => a.percentage >= 70).length / activities.length * 100) : 0;
    const stats = { total_questions: qCount || 0, total_topics: tCount || 0, average_pass_rate: avgPass };
    setCached('platform_stats', stats, CACHE_TTL.STATS);
    return stats;
  }
  setCached('platform_stats', data, CACHE_TTL.STATS);
  return data;
}

export async function getUserDashboard(userId) {
  const cacheKey = `dashboard:${userId}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;
  const { data: xpData } = await supabase.from('user_xp').select('total_xp, rank_title').eq('user_id', userId).single();
  const { data: streakData } = await supabase.from('user_recall_stats').select('current_streak').eq('user_id', userId).single();
  const { count: badgesCount } = await supabase.from('user_interactions').select('id', { count: 'exact', head: true }).eq('user_id', userId).eq('interaction_type', 'achievement');
  const { count: completedTopics } = await supabase.from('user_topic_completion').select('topic_key', { count: 'exact', head: true }).eq('user_id', userId);
  const { data: allTopics } = await supabase.from('quiz_topics').select('topic_name');
  const { data: nextGoal } = await supabase.from('user_quiz_activity').select('topic, block_number').eq('user_id', userId).order('completed_at', { ascending: false }).limit(1);
  const nextTopic = nextGoal && nextGoal[0] ? nextGoal[0].topic : 'Genetics';
  const nextBlock = nextGoal && nextGoal[0] ? nextGoal[0].block_number + 1 : 1;
  const { data: { user } } = await supabase.auth.admin.getUserById(userId);
  const displayName = user?.email?.split('@')[0] || 'Learner';
  const result = {
    display_name: displayName,
    streak: streakData?.current_streak || 0,
    xp: xpData?.total_xp || 0,
    next_level_xp: (Math.floor((xpData?.total_xp || 0) / 100) + 1) * 100,
    rank_title: xpData?.rank_title || 'Beginner',
    badges_count: badgesCount || 0,
    completed_topics: completedTopics || 0,
    total_topics: allTopics?.length || 0,
    next_goal: { topic: nextTopic, block: nextBlock }
  };
  setCached(cacheKey, result, CACHE_TTL.DASHBOARD);
  return result;
}

export async function getDailyChallenge(userId) {
  const today = new Date().toISOString().slice(0, 10);
  let { data: challenge } = await supabase.from('daily_challenges').select('*').eq('date', today).single();
  if (!challenge) {
    const rand = Math.floor(Math.random() * 3);
    const titles = ['Score 80% in any block', 'Answer 10 questions correctly', 'Earn 100 XP'];
    const types = ['block_score', 'correct_answers', 'xp_earned'];
    const targets = [80, 10, 100];
    const { data: newChallenge } = await supabase.from('daily_challenges').insert({
      date: today, title: titles[rand], description: titles[rand], reward_xp: 50,
      requirement_type: types[rand], requirement_target: targets[rand]
    }).select().single();
    challenge = newChallenge;
  }
  let progress = 0, completed = false;
  if (challenge?.requirement_type === 'block_score') {
    const { data } = await supabase.from('user_quiz_activity').select('percentage').eq('user_id', userId).gte('completed_at', today).order('percentage', { ascending: false }).limit(1);
    if (data && data[0]) progress = data[0].percentage;
    completed = progress >= challenge.requirement_target;
  } else if (challenge?.requirement_type === 'correct_answers') {
    const { data } = await supabase.from('user_quiz_activity').select('score').eq('user_id', userId).gte('completed_at', today);
    progress = data?.reduce((sum, a) => sum + (a.score || 0), 0) || 0;
    completed = progress >= challenge.requirement_target;
  } else if (challenge?.requirement_type === 'xp_earned') {
    const { data } = await supabase.from('xp_events').select('amount').eq('user_id', userId).gte('created_at', today);
    progress = data?.reduce((sum, ev) => sum + ev.amount, 0) || 0;
    completed = progress >= challenge.requirement_target;
  }
  return { title: challenge?.title || '', reward_xp: challenge?.reward_xp || 0, completed, progress, target: challenge?.requirement_target || 0 };
}

export async function getWeakAreas(userId) {
  const { data } = await supabase.from('user_topic_performance').select('topic, avg_score').eq('user_id', userId).order('avg_score', { ascending: true }).limit(3);
  const weakTopics = data?.filter(t => t.avg_score < 70).map(t => t.topic) || [];
  let recommendedBlock = null;
  if (weakTopics.length) {
    const { data: lastBlock } = await supabase.from('user_quiz_activity').select('block_number').eq('user_id', userId).eq('topic', weakTopics[0]).order('block_number', { ascending: false }).limit(1);
    const next = lastBlock && lastBlock[0] ? lastBlock[0].block_number + 1 : 0;
    recommendedBlock = { topic: weakTopics[0], block: next };
  }
  return { weak_topics: weakTopics, recommended_block: recommendedBlock };
}

export async function getLearningPaths(level, userId) {
  const { data: paths } = await supabase.from('learning_paths').select('*').eq('level', level).order('display_order');
  if (!paths) return [];
  const { data: progress } = await supabase.from('user_learning_path_progress').select('path_id, completed').eq('user_id', userId);
  const progressMap = new Map(progress?.map(p => [p.path_id, p.completed]) || []);
  return paths.map(p => ({ ...p, completed: progressMap.get(p.id) || false }));
}

export async function getPersonalRecords(userId) {
  const { data } = await supabase.from('user_records').select('*').eq('user_id', userId).single();
  return data || { highest_score: 0, fastest_completion: 0, perfect_blocks: 0 };
}

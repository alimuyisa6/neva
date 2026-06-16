// backend/services/quizService.js
import { supabase } from '../utils/supabase.js';

export async function getQuizTopics(level, userId) {
  const { data: topics, error } = await supabase.from('quiz_topics').select('id, topic_name, level, display_order').eq('level', level).order('display_order', { ascending: true });
  if (error) throw error;
  const enriched = await Promise.all((topics || []).map(async (topic) => {
    const { count: questionCount } = await supabase.from('quiz_questions').select('id', { count: 'exact', head: true }).eq('level', level).eq('topic', topic.topic_name);
    const totalBlocks = questionCount ? Math.ceil(questionCount / 10) : 0;
    let completedBlocks = [];
    let lockedBlocks = [];
    if (userId) {
      const { data: activity } = await supabase.from('user_quiz_activity').select('block_number, passed, completed_at').eq('user_id', userId).eq('level', level).eq('topic', topic.topic_name);
      if (activity && activity.length) {
        completedBlocks = activity.map(a => a.block_number);
        const now = new Date();
        lockedBlocks = activity.filter(a => (now - new Date(a.completed_at)) < 24 * 60 * 60 * 1000).map(a => a.block_number);
      }
    }
    return { topic_name: topic.topic_name, level: topic.level, question_count: questionCount || 0, total_blocks: totalBlocks, completed_blocks: completedBlocks, locked_blocks: lockedBlocks };
  }));
  return enriched;
}

export async function getQuizBlock(level, topic, block_number) {
  const blockNum = parseInt(block_number);
  const offset = blockNum * 10;
  const { data: questions, error } = await supabase.from('quiz_questions').select('id, question_text, option_a, option_b, option_c, option_d, difficulty, image_url').eq('level', level).eq('topic', topic).order('id', { ascending: true }).range(offset, offset + 9);
  if (error) throw error;
  if (!questions || questions.length === 0) throw new Error('No questions found for this block');
  return { questions, block_number: blockNum };
}

export async function checkDailyRetry(userId, level, topic, block_number) {
  const blockNum = parseInt(block_number);
  const { data: activity } = await supabase.from('user_quiz_activity').select('completed_at').eq('user_id', userId).eq('level', level).eq('topic', topic).eq('block_number', blockNum).order('completed_at', { ascending: false }).limit(1);
  if (!activity || activity.length === 0) return { can_retry: true };
  const lastAttempt = new Date(activity[0].completed_at);
  const hoursSince = (Date.now() - lastAttempt) / (1000 * 60 * 60);
  if (hoursSince < 24) {
    const hoursLeft = Math.ceil(24 - hoursSince);
    return { can_retry: false, reason: `This block is locked. Try again in ${hoursLeft} hour${hoursLeft > 1 ? 's' : ''}.` };
  }
  return { can_retry: true };
}

export async function checkQuizAnswer(question_id, selected_option) {
  const { data: question, error } = await supabase.from('quiz_questions').select('correct_option, explanation, option_a, option_b, option_c, option_d').eq('id', question_id).single();
  if (error || !question) throw new Error('Question not found');
  const correct = selected_option.toUpperCase() === question.correct_option.toUpperCase();
  const correctKey = `option_${question.correct_option.toLowerCase()}`;
  const correct_answer_text = question[correctKey] || '';
  return { correct, correct_option: question.correct_option.toUpperCase(), correct_answer_text, explanation: question.explanation || '' };
}

export async function submitQuizBlock(userId, { level, topic, block_number, answers, time_taken }) {
  const blockNum = parseInt(block_number);
  const offset = blockNum * 10;
  const { data: questions } = await supabase.from('quiz_questions').select('id, question_text, option_a, option_b, option_c, option_d, correct_option, explanation').eq('level', level).eq('topic', topic).order('id', { ascending: true }).range(offset, offset + 9);
  if (!questions || questions.length === 0) throw new Error('Questions not found for this block');
  let score = 0;
  const reviewAnswers = questions.map((q, idx) => {
    const submitted = answers[idx] || {};
    const userOption = (submitted.selectedOption || '').toUpperCase();
    const correctOption = (q.correct_option || '').toUpperCase();
    const isCorrect = userOption === correctOption;
    if (isCorrect) score++;
    const optKey = `option_${correctOption.toLowerCase()}`;
    const userOptKey = `option_${userOption.toLowerCase()}`;
    return {
      question: q.question_text,
      userAnswerText: q[userOptKey] || userOption || 'No answer',
      correctAnswerText: q[optKey] || correctOption,
      isCorrect,
      explanation: q.explanation || ''
    };
  });
  const total = questions.length;
  const percentage = Math.round((score / total) * 100);
  const passed = percentage >= 70;
  await supabase.from('user_quiz_activity').insert({
    user_id: userId, level, topic, block_number: blockNum, score, total, percentage, passed, time_taken: time_taken || 0, completed_at: new Date().toISOString()
  });
  const xpEarned = passed ? Math.round(10 + (percentage / 10)) : 5;
  await addXp(userId, xpEarned, 'quiz_block');
  await updateTopicPerformance(userId, level, topic, percentage);
  return { score, total, percentage, passed, xp_earned: xpEarned, answers: reviewAnswers };
}

export async function addQuizQuestionsBatch({ level, topic, questions, batch_name }) {
  const rows = questions.map(q => ({
    level, topic, question_text: q.question_text, option_a: q.option_a, option_b: q.option_b, option_c: q.option_c, option_d: q.option_d,
    correct_option: q.correct_option, explanation: q.explanation || '', difficulty: q.difficulty || 'medium', batch_name: batch_name || null, image_url: q.image_url || null
  }));
  const { data, error } = await supabase.from('quiz_questions').insert(rows).select('id');
  if (error) throw error;
  await supabase.from('quiz_topics').upsert({ topic_name: topic, level, display_order: 999 }, { onConflict: 'topic_name,level' });
  return { inserted: data?.length || 0 };
}

async function addXp(userId, amount, reason) {
  const { data: current } = await supabase.from('user_xp').select('total_xp, level').eq('user_id', userId).single();
  const newTotal = (current?.total_xp || 0) + amount;
  const newLevel = Math.floor(newTotal / 100) + 1;
  let rankTitle = 'Beginner';
  if (newTotal >= 10000) rankTitle = 'Master Biologist';
  else if (newTotal >= 6000) rankTitle = 'Scientist';
  else if (newTotal >= 3000) rankTitle = 'Biologist';
  else if (newTotal >= 1500) rankTitle = 'Scholar';
  else if (newTotal >= 500) rankTitle = 'Explorer';
  await supabase.from('user_xp').upsert({ user_id: userId, total_xp: newTotal, level: newLevel, rank_title: rankTitle }, { onConflict: 'user_id' });
  await supabase.from('xp_events').insert({ user_id: userId, event_type: reason, amount });
  if (current && current.level < newLevel) {
    await supabase.from('user_milestones').insert({ user_id: userId, milestone: `Level ${newLevel}` });
  }
}

async function updateTopicPerformance(userId, level, topic, percentage) {
  const { data: existing } = await supabase.from('user_topic_performance').select('id, attempt_count, avg_score').eq('user_id', userId).eq('level', level).eq('topic', topic).single();
  if (existing) {
    const newCount = existing.attempt_count + 1;
    const newAvg = Math.round(((existing.avg_score * existing.attempt_count) + percentage) / newCount);
    await supabase.from('user_topic_performance').update({ attempt_count: newCount, avg_score: newAvg, last_attempted_at: new Date().toISOString() }).eq('id', existing.id);
  } else {
    await supabase.from('user_topic_performance').insert({ user_id: userId, level, topic, attempt_count: 1, avg_score: percentage, last_attempted_at: new Date().toISOString() });
  }
}

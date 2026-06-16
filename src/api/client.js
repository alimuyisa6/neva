 let csrfToken = null;
 const BASE = import.meta.env.VITE_API_URL || 'https://neva-2x8g.onrender.com';

async function request(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (csrfToken) headers['X-CSRF-Token'] = csrfToken;
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  });
  const json = await res.json();
  if (json.csrf_token) csrfToken = json.csrf_token;
  if (!res.ok) throw new Error(json.error || 'Request failed');
  return json.data !== undefined ? json.data : json;
}

export async function signup(email, password, turnstile_token) { return request('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email, password, turnstile_token }) }); }
export async function signin(email, password, turnstile_token) { return request('/api/auth/signin', { method: 'POST', body: JSON.stringify({ email, password, turnstile_token }) }); }
export async function signout() { return request('/api/auth/signout', { method: 'POST' }); }
export async function getUser() { return request('/api/auth/get_user'); }

export async function getAllSiteSections() { return request('/api/sitesections/get_all_site_sections'); }
export async function getSectionHeadings() { return request('/api/sitesections/get_section_headings'); }
export async function updateSiteSection(section, data) { return request('/api/sitesections/update_site_section', { method: 'POST', body: JSON.stringify({ section, data }) }); }
export async function updateSectionHeadings(headings) { return request('/api/sitesections/update_section_headings', { method: 'POST', body: JSON.stringify({ headings }) }); }
export async function getLeaderboard() {
  return request('/api/interactions/leaderboard');
}

export async function getResources(filters = {}) { const q = new URLSearchParams(filters).toString(); return request(`/api/resources/get_resources?${q}`); }
export async function getFilterOptions() { return request('/api/resources/get_filter_options'); }
export async function getPdfsByLevel(level) { return request(`/api/resources/get_pdfs_by_level?level=${level}`); }
export async function trackPdfPreview(pdfId) { return request('/api/resources/track_pdf_preview', { method: 'POST', body: JSON.stringify({ pdf_id: pdfId }) }); }
export async function trackPdfDownload(pdfId) { return request('/api/resources/track_pdf_download', { method: 'POST', body: JSON.stringify({ pdf_id: pdfId }) }); }
export async function getNotesStructure() { return request('/api/resources/get_notes_structure'); }
export async function getNoteContent(subtopicId) { return request(`/api/resources/get_note_content?subtopic_id=${subtopicId}`); }
export async function getNotePreview(subtopicId) { return request(`/api/resources/get_note_preview?subtopic_id=${subtopicId}`); }
export async function getNoteReactions(noteId) { return request(`/api/resources/get_note_reactions?note_id=${noteId}`); }
export async function toggleNoteReaction(noteId, reactionType) { return request('/api/resources/toggle_note_reaction', { method: 'POST', body: JSON.stringify({ note_id: noteId, reaction_type: reactionType }) }); }
export async function saveReadingProgress(noteId, scrollPercentage, scrollPosition, timeSpent, completed = false) { return request('/api/resources/save_reading_progress', { method: 'POST', body: JSON.stringify({ note_id: noteId, scroll_percentage: scrollPercentage, scroll_position: scrollPosition, time_spent: timeSpent, completed }) }); }
export async function getReadingProgress(noteId) { return request(`/api/resources/get_reading_progress?note_id=${noteId}`); }
export async function getContinueReading(limit = 10) { return request(`/api/resources/get_continue_reading?limit=${limit}`); }
export async function submitResource(payload) { return request('/api/resources/submit_resource', { method: 'POST', body: JSON.stringify({ payload }) }); }
export async function approveResource(submissionId, action) { return request('/api/resources/approve', { method: 'POST', body: JSON.stringify({ submissionId, action }) }); }

export async function getQuizTopics(level) { return request(`/api/quiz/get_quiz_topics?level=${level}`); }
export async function getQuizBlock(level, topic, block_number) { return request(`/api/quiz/get_quiz_block?level=${level}&topic=${topic}&block_number=${block_number}`); }
export async function checkDailyRetry(level, topic, block_number) { return request(`/api/quiz/check_daily_retry?level=${level}&topic=${topic}&block_number=${block_number}`); }
export async function checkQuizAnswer(question_id, selected_option) { return request('/api/quiz/check_quiz_answer', { method: 'POST', body: JSON.stringify({ question_id, selected_option }) }); }
export async function submitQuizBlock(level, topic, block_number, answers, time_taken) { return request('/api/quiz/submit_quiz_block', { method: 'POST', body: JSON.stringify({ level, topic, block_number, answers, time_taken }) }); }
export async function addQuizQuestionsBatch(level, topic, questions, batch_name) { return request('/api/quiz/add_quiz_questions_batch', { method: 'POST', body: JSON.stringify({ level, topic, questions, batch_name }) }); }

export async function getPlatformStats() { return request('/api/interactions/platform-stats'); }
export async function getUserDashboard() { return request('/api/interactions/dashboard'); }
export async function getDailyChallenge() { return request('/api/interactions/daily-challenge'); }
export async function getWeakAreas() { return request('/api/interactions/weak-areas'); }
export async function getLearningPaths(level) { return request(`/api/interactions/learning-paths?level=${level}`); }
export async function getPersonalRecords() { return request('/api/interactions/personal-records'); }

export async function getPastPapers(filters = {}) { const q = new URLSearchParams(filters).toString(); return request(`/api/pastpapers/get_papers?${q}`); }
export async function getPastPaperFilterOptions() { return request('/api/pastpapers/get_filter_options'); }
export async function getPastPaper(id) { return request(`/api/pastpapers/get_paper?id=${id}`); }
export async function getPastPaperDownloadUrl(id) { return request(`/api/pastpapers/get_download_url?id=${id}`); }
export async function addPastPaper(data) { return request('/api/pastpapers/add_paper', { method: 'POST', body: JSON.stringify(data) }); }
export async function addPastPapersBatch(papers) { return request('/api/pastpapers/add_papers_batch', { method: 'POST', body: JSON.stringify({ papers }) }); }
export async function deletePastPaper(id) { return request('/api/pastpapers/delete_paper', { method: 'POST', body: JSON.stringify({ id }) }); }
export async function trackPastPaperDownload(id) { return request('/api/pastpapers/track_download', { method: 'POST', body: JSON.stringify({ id }) }); }

export async function toggleFavorite(resourceId) { return request('/api/interactions/toggle_favorite', { method: 'POST', body: JSON.stringify({ resource_id: resourceId }) }); }
export async function recordView(resourceId) { return request('/api/interactions/record_view', { method: 'POST', body: JSON.stringify({ resource_id: resourceId }) }); }
export async function recordDownload(resourceId) { return request('/api/interactions/record_download', { method: 'POST', body: JSON.stringify({ resource_id: resourceId }) }); }
export async function recordDailyVisit() { return request('/api/interactions/record_daily_visit', { method: 'POST' }); }
export async function submitRating(resourceId, rating) { return request('/api/interactions/submit_rating', { method: 'POST', body: JSON.stringify({ resource_id: resourceId, rating }) }); }
export async function likeResource(resourceId) { return request('/api/interactions/like_resource', { method: 'POST', body: JSON.stringify({ resource_id: resourceId }) }); }
export async function commentResource(resourceId, comment) { return request('/api/interactions/comment_resource', { method: 'POST', body: JSON.stringify({ resource_id: resourceId, comment }) }); }
export async function getResourceInteractions(resourceId) { return request(`/api/interactions/get_resource_interactions?resource_id=${resourceId}`); }
export async function getUserFavorites() { return request('/api/interactions/get_user_favorites'); }
export async function getRecentViews(limit = 5) { return request(`/api/interactions/get_recent_views?limit=${limit}`); }
export async function getUserRatings() { return request('/api/interactions/get_user_ratings'); }
export async function getUserAchievements() { return request('/api/interactions/get_user_achievements'); }
export async function getUserStreak() { return request('/api/interactions/get_user_streak'); }
export async function getPublicStats() { return request('/api/interactions/get_public_stats'); }
export async function submitMood(mood, message) { return request('/api/interactions/submit_mood', { method: 'POST', body: JSON.stringify({ mood, message }) }); }
export async function saveAchievement(badge) { return request('/api/interactions/save_achievement', { method: 'POST', body: JSON.stringify({ badge }) }); }
export async function saveQuizState(state) { return request('/api/interactions/save_quiz_state', { method: 'POST', body: JSON.stringify({ state }) }); }
export async function getQuizState() { return request('/api/interactions/get_quiz_state'); }
export async function trackEvent(eventName, eventData = {}) { return request('/api/interactions/track_event', { method: 'POST', body: JSON.stringify({ event_name: eventName, event_data: eventData }) }); }

export async function getAdminStats() { return request('/api/admin/stats'); }
export async function getSubmissions() { return request('/api/admin/submissions'); }
export async function getContactMessages() { return request('/api/admin/messages'); }
export async function getAdminUsers() { return request('/api/admin/get_admin_users'); }
export async function getNewsletterSubscribers() { return request('/api/admin/get_newsletter_subscribers'); }
export async function getDonations() { return request('/api/admin/get_donations'); }
export async function getPageActivity() { return request('/api/admin/get_page_activity'); }
export async function updateUserRole(userId, role) { return request('/api/admin/update_user_role', { method: 'POST', body: JSON.stringify({ userId, role }) }); }
export async function updateUserLock(userId, lock, reason) { return request('/api/admin/update_user_lock', { method: 'POST', body: JSON.stringify({ userId, lock, reason }) }); }
export async function updateUserRestriction(userId, restriction_type, reason, duration_hours) { return request('/api/admin/update_user_restriction', { method: 'POST', body: JSON.stringify({ userId, restriction_type, reason, duration_hours }) }); }
export async function updateAppFeature(feature_key, settings, is_enabled) { return request('/api/admin/update_app_feature', { method: 'POST', body: JSON.stringify({ feature_key, settings, is_enabled }) }); }
export async function deleteQuizTopic(topic, level) { return request('/api/admin/delete_quiz_topic', { method: 'POST', body: JSON.stringify({ topic, level }) }); }

export async function submitContact(formData) { return request('/api/contact/submit_contact', { method: 'POST', body: JSON.stringify({ formData }) }); }
export async function subscribeNewsletter(email) { return request('/api/contact/subscribe_newsletter', { method: 'POST', body: JSON.stringify({ formData: { email } }) }); }

export async function requestChat() { return request('/api/chat/request_chat', { method: 'POST' }); }
export async function getChatMessages(roomId) { return request(`/api/chat/get_chat_messages?room_id=${roomId}`); }
export async function sendChatMessage(roomId, message) { return request('/api/chat/send_chat_message', { method: 'POST', body: JSON.stringify({ room_id: roomId, message }) }); }
export async function deleteChatMessage(messageId) { return request('/api/chat/delete_chat_message', { method: 'POST', body: JSON.stringify({ message_id: messageId }) }); }
export async function checkAdminOnline() { return request('/api/chat/check_admin_online'); }
export async function updateUserPresence() { return request('/api/chat/update_user_presence', { method: 'POST' }); }
export async function adminGetPendingRequests() { return request('/api/chat/admin_get_pending_requests'); }
export async function adminAcceptChat(roomId) { return request('/api/chat/admin_accept_chat', { method: 'POST', body: JSON.stringify({ room_id: roomId }) }); }
export async function adminRejectChat(roomId) { return request('/api/chat/admin_reject_chat', { method: 'POST', body: JSON.stringify({ room_id: roomId }) }); }
export async function adminUpdatePresence(is_online, is_busy) { return request('/api/chat/admin_update_presence', { method: 'POST', body: JSON.stringify({ is_online, is_busy }) }); }
export async function adminGetActiveChats() { return request('/api/chat/admin_get_active_chats'); }

export async function submitWeeklyChallenge(weekStart, selectedOption) { return request('/api/challenge/submit', { method: 'POST', body: JSON.stringify({ week_start: weekStart, selected_option: selectedOption }) }); }
export async function getWeeklyChallengeStatus(weekStart) { return request(`/api/challenge/status?week_start=${weekStart}`); }

export async function getFlashcards() { return request('/api/flashcards/list'); }
export async function getFlashcardDecks() { return request('/api/flashcards/decks'); }
export async function getFlashcardDeck(deckId) { return request(`/api/flashcards/deck?deck_id=${deckId}`); }
export async function createFlashcardDeck(title, description, category, level, cards) { return request('/api/flashcards/create_deck', { method: 'POST', body: JSON.stringify({ title, description, category, level, cards }) }); }
export async function updateFlashcardDeck(deckId, title, description, category, level, cards) { return request('/api/flashcards/update_deck', { method: 'POST', body: JSON.stringify({ deck_id: deckId, title, description, category, level, cards }) }); }
export async function deleteFlashcardDeck(deckId) { return request('/api/flashcards/delete_deck', { method: 'POST', body: JSON.stringify({ deck_id: deckId }) }); }
export async function addFlashcardCards(deckId, cards) { return request('/api/flashcards/add_cards', { method: 'POST', body: JSON.stringify({ deck_id: deckId, cards }) }); }
export async function removeFlashcardCard(cardId) { return request('/api/flashcards/remove_card', { method: 'POST', body: JSON.stringify({ card_id: cardId }) }); }
export async function getKnownFlashcards() { return request('/api/flashcards/known'); }
export async function toggleFlashcardKnown(flashcardId) { return request('/api/flashcards/toggle_known', { method: 'POST', body: JSON.stringify({ flashcard_id: flashcardId }) }); }
export async function rateFlashcard(flashcardId, difficulty) { return request('/api/flashcards/rate', { method: 'POST', body: JSON.stringify({ flashcard_id: flashcardId, difficulty }) }); }
export async function checkFlashcardAnswer(flashcardId, userAnswer) { return request('/api/flashcards/check_answer', { method: 'POST', body: JSON.stringify({ flashcard_id: flashcardId, user_answer: userAnswer }) }); }
export async function toggleFlashcardBookmark(flashcardId) { return request('/api/flashcards/toggle_bookmark', { method: 'POST', body: JSON.stringify({ flashcard_id: flashcardId }) }); }
export async function getFlashcardProgress() { return request('/api/flashcards/progress'); }

export async function getCommunityActivity() { return request('/api/community/activity'); }

export async function getRecallSession(level, topic) { return request(`/api/recall/session?level=${level}&topic=${topic}`); }
export async function checkRecallSession(level, topic) { return request(`/api/recall/session_check?level=${level}&topic=${topic}`); }
export async function getRecallStats() { return request('/api/recall/stats'); }
export async function getRecallAchievements() { return request('/api/recall/achievements'); }
export async function getRecallDashboard() { return request('/api/recall/dashboard'); }
export async function getRecallTopics(level) { return request(`/api/recall/topics?level=${level}`); }
export async function getSelectedLevel() { return request('/api/recall/get_selected_level'); }
export async function continueRecallSession(session_id) { return request('/api/recall/continue', { method: 'POST', body: JSON.stringify({ session_id }) }); }
export async function submitRecallAnswer(session_id, question_id, user_answer, nonce) { return request('/api/recall/answer', { method: 'POST', body: JSON.stringify({ session_id, question_id, user_answer, nonce }) }); }
export async function completeRecallSession(session_id) { return request('/api/recall/complete', { method: 'POST', body: JSON.stringify({ session_id }) }); }
export async function setSelectedLevel(level) { return request('/api/recall/set_selected_level', { method: 'POST', body: JSON.stringify({ level }) }); }

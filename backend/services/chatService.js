// backend/services/chatService.js
import { supabase } from '../utils/supabase.js';
import { isAdmin } from '../utils/session.js';

export async function requestChat(userId) {
  const { data: existing } = await supabase.from('chat_rooms').select('id, status').eq('user_id', userId).in('status', ['requested', 'active']).maybeSingle();
  if (existing) return { room_id: existing.id, status: existing.status };
  const { data, error } = await supabase.from('chat_rooms').insert({ user_id: userId, status: 'requested', requested_at: new Date().toISOString(), created_at: new Date().toISOString() }).select().single();
  if (error) throw error;
  return { room_id: data.id, status: data.status };
}

export async function getChatMessages(userId, room_id) {
  const { data: room } = await supabase.from('chat_rooms').select('user_id, assigned_admin').eq('id', room_id).maybeSingle();
  if (!room) throw new Error('Room not found');
  const adminCheck = await isAdmin(userId);
  if (room.user_id !== userId && !adminCheck) throw new Error('Access denied');
  const { data, error } = await supabase.from('chat_messages').select('id, sender_type, content, created_at, deleted_by_user').eq('room_id', room_id).eq('deleted_by_user', false).order('created_at', { ascending: true });
  if (error) throw error;
  return data || [];
}

export async function sendChatMessage(userId, room_id, message) {
  const { data: room } = await supabase.from('chat_rooms').select('user_id, status').eq('id', room_id).maybeSingle();
  if (!room) throw new Error('Room not found');
  const adminCheck = await isAdmin(userId);
  if (room.user_id !== userId && !adminCheck) throw new Error('Access denied');
  const senderType = adminCheck ? 'admin' : 'user';
  const { data, error } = await supabase.from('chat_messages').insert({ room_id, sender_type: senderType, content: message.trim(), deleted_by_user: false, created_at: new Date().toISOString() }).select().single();
  if (error) throw error;
  if (room.status === 'requested' && senderType === 'admin') {
    await supabase.from('chat_rooms').update({ status: 'active', assigned_admin: userId }).eq('id', room_id);
  }
  return { success: true, message: data };
}

export async function deleteChatMessage(userId, message_id) {
  const { data: msg } = await supabase.from('chat_messages').select('id, room_id, sender_type').eq('id', message_id).maybeSingle();
  if (!msg) throw new Error('Message not found');
  const { data: room } = await supabase.from('chat_rooms').select('user_id').eq('id', msg.room_id).maybeSingle();
  if (!room || room.user_id !== userId) throw new Error('Access denied');
  await supabase.from('chat_messages').update({ deleted_by_user: true }).eq('id', message_id);
  return { success: true };
}

export async function updateUserPresence(userId) {
  await supabase.from('user_presence').upsert({ user_id: userId, last_seen: new Date().toISOString() }, { onConflict: 'user_id' });
  return { success: true };
}

export async function checkAdminOnline() {
  const { data } = await supabase.from('admin_master').select('is_online, is_busy').eq('is_active', true).eq('is_online', true).eq('is_busy', false).limit(1);
  return { online: (data && data.length > 0) };
}

export async function adminGetPendingRequests() {
  const { data, error } = await supabase.from('chat_rooms').select('id, user_id, status, requested_at').eq('status', 'requested').order('requested_at', { ascending: true });
  if (error) throw error;
  const rooms = [];
  for (const room of (data || [])) {
    try {
      const { data: { user } } = await supabase.auth.admin.getUserById(room.user_id);
      rooms.push({ ...room, user_email: user?.email || 'Unknown' });
    } catch { rooms.push({ ...room, user_email: 'Unknown' }); }
  }
  return rooms;
}

export async function adminAcceptChat(adminId, room_id) {
  const { error } = await supabase.from('chat_rooms').update({ status: 'active', assigned_admin: adminId }).eq('id', room_id);
  if (error) throw error;
  return { success: true };
}

export async function adminRejectChat(room_id) {
  const { error } = await supabase.from('chat_rooms').update({ status: 'closed' }).eq('id', room_id);
  if (error) throw error;
  return { success: true };
}

export async function adminGetActiveChats() {
  const { data, error } = await supabase.from('chat_rooms').select('id, user_id, status, created_at, requested_at').eq('status', 'active').order('created_at', { ascending: false });
  if (error) throw error;
  const rooms = [];
  for (const room of (data || [])) {
    try {
      const { data: { user } } = await supabase.auth.admin.getUserById(room.user_id);
      rooms.push({ ...room, user_email: user?.email || 'Unknown' });
    } catch { rooms.push({ ...room, user_email: 'Unknown' }); }
  }
  return rooms;
}

export async function adminUpdatePresence(adminId, is_online, is_busy) {
  await supabase.from('admin_master').update({ is_online: !!is_online, is_busy: !!is_busy, updated_at: new Date().toISOString() }).eq('id', adminId);
  return { success: true };
}

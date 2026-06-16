// backend/utils/session.js
import crypto from 'crypto';
import { supabase } from './supabase.js';
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}
export function generateSessionToken() {
  return crypto.randomBytes(48).toString('base64url');
}
export function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(cookieHeader.split(';').map(c => {
    const [k, ...v] = c.trim().split('=');
    return [k.trim(), decodeURIComponent(v.join('='))];
  }));
}
export async function validateSession(token) {
  if (!token || token.length < 20) return null;
  const hashed = hashToken(token);
  const { data, error } = await supabase
    .from('user_sessions')
    .select('user_id, expires_at, is_active')
    .eq('session_token_hash', hashed)
    .eq('is_active', true)
    .single();
  if (error || !data) return null;
  if (new Date(data.expires_at) < new Date()) {
    await supabase.from('user_sessions').update({ is_active: false }).eq('session_token_hash', hashed);
    return null;
  }
  return data;
}
export async function isAdmin(userId, ip = null) {
  if (!userId) return null;
  const { data } = await supabase
    .from('admin_master')
    .select('admin_role, permissions, is_active, is_locked, ip_whitelist')
    .eq('admin_id', userId)
    .eq('is_active', true)
    .maybeSingle();
  if (!data) return null;
  if (data.ip_whitelist && data.ip_whitelist.length > 0 && ip && !data.ip_whitelist.includes(ip)) return null;
  return data;
}

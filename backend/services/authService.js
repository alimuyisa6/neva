// backend/services/authService.js
import { supabase } from '../utils/supabase.js';
import { hashToken, generateSessionToken, validateSession, isAdmin as checkAdmin } from '../utils/session.js';

async function verifyTurnstile(token, ip) {
  if (!token) return false;
  try {
    const formData = new URLSearchParams();
    formData.append('secret', process.env.TURNSTILE_SECRET_KEY);
    formData.append('response', token);
    if (ip && ip !== 'unknown') formData.append('remoteip', ip);
    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: formData
    });
    const outcome = await result.json();
    console.log('Turnstile outcome:', JSON.stringify(outcome));
    return outcome.success === true;
  } catch {
    return false;
  }
}

async function createUserSession(userId, ip, userAgent) {
  const sessionToken = generateSessionToken();
  const hashed = hashToken(sessionToken);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  const { error } = await supabase.from('user_sessions').insert({
    user_id: userId,
    session_token_hash: hashed,
    ip_address: ip,
    user_agent: (userAgent || '').substring(0, 500),
    expires_at: expiresAt,
    is_active: true
  });
  if (error) throw error;
  return { access_token: sessionToken, expires_at: expiresAt };
}

export async function signup({ email, password, turnstile_token, ip, userAgent, protocol, host }) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Invalid email');
  if (!password || password.length < 8) throw new Error('Password must be at least 8 characters');
  const turnstileOk = await verifyTurnstile(turnstile_token, ip);
  if (!turnstileOk) throw new Error('Captcha verification failed. Please try again.');
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      emailRedirectTo: `${protocol || 'https'}://${host}`
    }
  });
  if (error) {
    if (error.code === 'user_already_exists') {
      return { user: null, message: 'Account exists. Check your email.' };
    }
    throw new Error(error.message);
  }
  if (data.session) {
    const session = await createUserSession(data.user.id, ip, userAgent);
    return {
      user: { id: data.user.id, email: data.user.email },
      sessionToken: session.access_token
    };
  }
  return { user: null };
}

export async function signin({ email, password, turnstile_token, ip, userAgent }) {
  if (!email || !password) throw new Error('Email and password required');
  const turnstileOk = await verifyTurnstile(turnstile_token, ip);
  if (!turnstileOk) throw new Error('Captcha verification failed. Please try again.');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password
  });
  if (error) throw new Error('Invalid email or password');
  const { data: restriction } = await supabase
    .from('user_restrictions')
    .select('restriction_type, lock_reason, expires_at')
    .eq('user_id', data.user.id)
    .maybeSingle();
  if (restriction) {
    if (restriction.restriction_type === 'disabled') throw new Error('Your account has been permanently disabled. Contact support.');
    if (restriction.restriction_type === 'suspended') throw new Error(restriction.lock_reason || 'Your account has been suspended. Contact support.');
    if (restriction.restriction_type === 'locked') {
      if (restriction.expires_at && new Date(restriction.expires_at) > new Date()) {
        const hoursLeft = Math.ceil((new Date(restriction.expires_at) - new Date()) / (1000 * 60 * 60));
        throw new Error(`Your account is locked. Try again in ${hoursLeft} hours.`);
      } else {
        await supabase.from('user_restrictions').delete().eq('user_id', data.user.id);
      }
    }
  }
  const session = await createUserSession(data.user.id, ip, userAgent);
  return {
    user: { id: data.user.id, email: data.user.email },
    sessionToken: session.access_token
  };
}

export async function signout(token) {
  if (token) {
    const hashed = hashToken(token);
    await supabase.from('user_sessions').update({ is_active: false }).eq('session_token_hash', hashed);
  }
}

export async function getUser(token) {
  if (!token) return null;
  const session = await validateSession(token);
  if (!session) return null;
  const { data: { user }, error } = await supabase.auth.admin.getUserById(session.user_id);
  if (error || !user) return null;
  const adminData = await checkAdmin(session.user_id);
  const { data: restriction } = await supabase
    .from('user_restrictions')
    .select('restriction_type, lock_reason, expires_at')
    .eq('user_id', session.user_id)
    .maybeSingle();
  return {
    id: user.id,
    email: user.email,
    is_admin: !!adminData,
    admin_role: adminData?.admin_role || null,
    permissions: adminData?.permissions || null,
    restriction: restriction || null
  };
}

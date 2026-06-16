// backend/services/adminService.js
import { supabase } from '../utils/supabase.js';

export async function getAdminStats() {
  const [rc, sc, mc] = await Promise.all([
    supabase.from('biology_notes').select('id', { count: 'exact', head: true }),
    supabase.from('resource_submissions').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('contact_messages').select('id', { count: 'exact', head: true })
  ]);
  return { resources: rc.count || 0, pendingSubmissions: sc.count || 0, messages: mc.count || 0, donations: 0 };
}

export async function getSubmissions() {
  const { data, error } = await supabase.from('resource_submissions').select('*').order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return data || [];
}

export async function getContactMessages() {
  const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return { messages: data || [] };
}

export async function getAdminUsers() {
  const { data } = await supabase.from('admin_master').select('*');
  return (data || []).map(a => ({
    admin_id: a.admin_id, admin_email: a.admin_email, admin_role: a.admin_role,
    permissions: a.permissions, is_active: a.is_active, is_locked: a.is_locked || false,
    last_login: a.last_login || null
  }));
}

export async function getNewsletterSubscribers() {
  const { data } = await supabase.from('newsletter_subscribers').select('*').order('created_at', { ascending: false });
  return data || [];
}

export async function getDonations() {
  const { data } = await supabase.from('momo_donations').select('*').order('created_at', { ascending: false }).limit(50);
  return data || [];
}

export async function getPageActivity(adminData) {
  if (adminData.admin_role !== 'super_admin') throw new Error('Super admin access required');
  const { data, error } = await supabase.from('page_activity').select('*').order('created_at', { ascending: false }).limit(100);
  if (error) throw error;
  const activities = [];
  for (const act of (data || [])) {
    const activity = { ...act };
    if (act.user_id) {
      try {
        const { data: { user } } = await supabase.auth.admin.getUserById(act.user_id);
        activity.user_email = user?.email || 'Unknown';
        activity.user_name = user?.email ? user.email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'User';
      } catch { activity.user_email = 'Unknown'; activity.user_name = 'User'; }
    }
    activities.push(activity);
  }
  return activities;
}

export async function updateUserRole(adminData, userId, role) {
  if (adminData.admin_role !== 'super_admin') throw new Error('Super admin only');
  if (role === 'super_admin') throw new Error('Cannot promote to super admin via API');
  if (role === 'admin' || role === 'content_manager' || role === 'resource_manager') {
    const { data: existingAdmin } = await supabase.from('admin_master').select('id').eq('admin_id', userId).maybeSingle();
    if (!existingAdmin) {
      const { data: { user } } = await supabase.auth.admin.getUserById(userId);
      await supabase.from('admin_master').insert({
        admin_id: userId, admin_email: user?.email || '', admin_role: role,
        permissions: { can_manage_resources: true, can_manage_site_sections: role !== 'resource_manager', can_view_analytics: true, can_upload_files: true }
      });
    } else {
      await supabase.from('admin_master').update({ admin_role: role, is_active: true }).eq('admin_id', userId);
    }
  }
  return { success: true };
}

export async function updateUserLock(adminData, userId, lock, reason) {
  if (adminData.admin_role !== 'super_admin') throw new Error('Super admin only');
  if (lock) {
    await supabase.from('admin_master').update({ is_locked: true, lock_reason: reason || 'Locked by admin' }).eq('admin_id', userId);
  } else {
    await supabase.from('admin_master').update({ is_locked: false, lock_reason: null }).eq('admin_id', userId);
  }
  return { success: true };
}

export async function updateUserRestriction(adminData, { userId, restriction_type, reason, duration_hours }) {
  if (adminData.admin_role !== 'super_admin') throw new Error('Super admin only');
  if (restriction_type === 'disabled') {
    await supabase.from('user_restrictions').upsert({
      user_id: userId, restriction_type: 'disabled', lock_reason: reason || '', locked_by: adminData.admin_id,
      locked_at: new Date().toISOString(), is_permanent: true, updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } else if (restriction_type === 'suspended') {
    await supabase.from('user_restrictions').upsert({
      user_id: userId, restriction_type: 'suspended', lock_reason: reason || '', locked_by: adminData.admin_id,
      locked_at: new Date().toISOString(), is_permanent: true, updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } else if (restriction_type === 'locked') {
    const expiresAt = new Date(Date.now() + (duration_hours || 24) * 60 * 60 * 1000).toISOString();
    await supabase.from('user_restrictions').upsert({
      user_id: userId, restriction_type: 'locked', lock_reason: reason || '', locked_by: adminData.admin_id,
      locked_at: new Date().toISOString(), expires_at: expiresAt, is_permanent: false, updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' });
  } else if (restriction_type === 'remove') {
    await supabase.from('user_restrictions').delete().eq('user_id', userId);
  }
  return { success: true };
}

export async function updateAppFeature(feature_key, settings, is_enabled) {
  await supabase.from('app_features').update({
    settings: settings || {}, is_enabled: is_enabled !== undefined ? is_enabled : true,
    updated_at: new Date().toISOString()
  }).eq('feature_key', feature_key);
  return { success: true };
}

export async function deleteQuizTopic(adminData, topic, level) {
  if (adminData.admin_role !== 'super_admin') throw new Error('Super admin only');
  await supabase.from('quiz_questions').delete().eq('level', level).eq('topic', topic);
  await supabase.from('quiz_topics').delete().eq('level', level).eq('topic_name', topic);
  return { success: true };
}

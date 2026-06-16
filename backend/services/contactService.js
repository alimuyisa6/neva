// backend/services/contactService.js
import { supabase } from '../utils/supabase.js';

export async function submitContact(formData) {
  if (!formData?.name || !formData?.email || !formData?.message) throw new Error('Name, email and message are required');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) throw new Error('Invalid email');
  const { error } = await supabase.from('contact_messages').insert({
    name: formData.name.trim(), email: formData.email.trim().toLowerCase(), subject: formData.subject?.trim() || '',
    message: formData.message.trim(), is_read: false, created_at: new Date().toISOString()
  });
  if (error) throw error;
  return { success: true };
}

export async function subscribeNewsletter(email) {
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('Valid email required');
  const { error } = await supabase.from('newsletter_subscribers').upsert({ email: email.trim().toLowerCase(), is_active: true, created_at: new Date().toISOString() }, { onConflict: 'email' });
  if (error) throw error;
  return { success: true };
}

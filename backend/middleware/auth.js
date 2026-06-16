// backend/middleware/auth.js
import { parseCookies, validateSession, isAdmin } from '../utils/session.js';
export async function requireAuth(req, res, next) {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies.session || '';
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  const session = await validateSession(token);
  if (!session) return res.status(401).json({ error: 'Invalid or expired session' });
  req.userId = session.user_id;
  next();
}
export async function requireAdmin(req, res, next) {
  await requireAuth(req, res, async () => {
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const adminData = await isAdmin(req.userId, ip);
    if (!adminData) return res.status(403).json({ error: 'Admin access required' });
    req.adminData = adminData;
    next();
  });
}
export function adminRole(...roles) {
  return (req, res, next) => {
    if (!req.adminData) return res.status(403).json({ error: 'Admin access required' });
    if (roles.length && !roles.includes(req.adminData.admin_role)) {
      return res.status(403).json({ error: 'Insufficient admin privileges' });
    }
    next();
  };
}

// backend/middleware/rateLimiter.js
const rateLimitMemory = new Map();
const globalRateLimit = { count: 0, resetTime: Date.now() + 1000 };
const MAX_GLOBAL_REQUESTS_PER_SECOND = 1000;
export async function rateLimiter(req, res, next) {
  const now = Date.now();
  if (globalRateLimit.resetTime <= now) {
    globalRateLimit.count = 0;
    globalRateLimit.resetTime = now + 1000;
  }
  globalRateLimit.count++;
  if (globalRateLimit.count > MAX_GLOBAL_REQUESTS_PER_SECOND) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const userId = req.userId;
  const userKey = userId ? `user:${userId}` : null;
  const ipKey = `ip:${ip}`;
  const burstWindow = 10000;
  const burstLimit = 20;
  const minuteLimit = 60;
  const checkAndUpdate = (key, limit, windowMs) => {
    const record = rateLimitMemory.get(key);
    if (!record) {
      rateLimitMemory.set(key, { timestamps: [now] });
      return true;
    }
    const cutoff = now - windowMs;
    record.timestamps = record.timestamps.filter(t => t > cutoff);
    if (record.timestamps.length >= limit) return false;
    record.timestamps.push(now);
    return true;
  };
  if (userKey && !checkAndUpdate(userKey, minuteLimit, 60000)) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  if (!checkAndUpdate(ipKey, burstLimit, burstWindow)) {
    return res.status(429).json({ error: 'Too many requests' });
  }
  next();
}

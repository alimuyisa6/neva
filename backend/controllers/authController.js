// backend/controllers/authController.js
import * as authService from '../services/authService.js';
import { parseCookies } from '../utils/session.js';

export async function signup(req, res) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const result = await authService.signup({
      email: req.body.email,
      password: req.body.password,
      turnstile_token: req.body.turnstile_token,
      ip,
      userAgent: req.headers['user-agent'],
      protocol: req.headers['x-forwarded-proto'],
      host: req.headers.host
    });
    if (result.sessionToken) {
      res.cookie('session', result.sessionToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/'
      });
    }
    res.status(200).json(result.user ? { user: result.user } : { user: null, message: result.message });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function signin(req, res) {
  try {
    const ip = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
    const result = await authService.signin({
      email: req.body.email,
      password: req.body.password,
      turnstile_token: req.body.turnstile_token,
      ip,
      userAgent: req.headers['user-agent']
    });
    res.cookie('session', result.sessionToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/'
    });
    res.status(200).json({ user: result.user });
  } catch (err) {
    res.status(401).json({ error: err.message });
  }
}

export async function signout(req, res) {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies.session || '';
  await authService.signout(token);
  res.clearCookie('session', { path: '/' });
  res.status(200).json({ success: true });
}

export async function getUser(req, res) {
  const cookies = parseCookies(req.headers.cookie || '');
  const token = cookies.session || '';
  const user = await authService.getUser(token);
  res.status(200).json({ user });
}

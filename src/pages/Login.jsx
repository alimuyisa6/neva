 import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signin } from '../api/client';
import { useNavigate, Link } from 'react-router-dom';

const TURNSTILE_SITE_KEY = '0x4AAAAAADknPpI_XcH1KfPe';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { refresh } = useAuth();
  const navigate = useNavigate();

  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);

  // Load Turnstile script + render widget
  useEffect(() => {
    const loadScript = () => {
      if (document.querySelector('script[src*="turnstile"]')) return;

      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    };

    loadScript();

    let attempts = 0;

    const interval = setInterval(() => {
      attempts++;

      if (
        window.turnstile &&
        turnstileRef.current &&
        !widgetIdRef.current
      ) {
        widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
        });

        clearInterval(interval);
      }

      if (attempts > 50) clearInterval(interval);
    }, 100);

    return () => {
      clearInterval(interval);

      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.remove(widgetIdRef.current);
        widgetIdRef.current = null;
      }
    };
  }, []);

  const getTurnstileToken = () => {
    try {
      if (!window.turnstile) return null;
      return window.turnstile.getResponse(widgetIdRef.current);
    } catch (err) {
      return null;
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    const token = getTurnstileToken();

    if (!token) {
      setError('Please complete the security verification.');
      return;
    }

    setLoading(true);

    try {
      await signin(email, password, token);

      await refresh();
      navigate('/');
    } catch (err) {
      const msg =
        err?.message?.includes('Turnstile')
          ? 'Security verification failed. Try again.'
          : err?.message || 'Login failed';

      setError(msg);

      // reset captcha on failure
      if (window.turnstile && widgetIdRef.current) {
        window.turnstile.reset(widgetIdRef.current);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="login-wrapper"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--clr-deep-space)',
      }}
    >
      <div
        style={{
          background: 'var(--clr-navy-card)',
          padding: '2rem',
          borderRadius: 'var(--radius-lg)',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#fff' }}>
          Login
        </h2>

        {error && (
          <div
            style={{
              background: '#fee',
              color: '#c00',
              padding: '0.75rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '1rem' }}
            className="form-input"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '100%', marginBottom: '1rem' }}
            className="form-input"
          />

          <div ref={turnstileRef} style={{ marginBottom: '1rem' }} />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p
          style={{
            textAlign: 'center',
            marginTop: '1rem',
            color: 'var(--clr-text-dim)',
          }}
        >
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--clr-magenta)' }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}

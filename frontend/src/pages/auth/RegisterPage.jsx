import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider.jsx';
import AuthLayout from '@/layouts/AuthLayout.jsx';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      await register({ name, email, password });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthLayout
      title="Create account"
      subtitle="You’ll be able to create projects, invite teammates by email, and track tasks."
      footer={
        <p className="muted footer-hint" style={{ margin: 0 }}>
          Have an account? <Link to="/login">Sign in</Link>
        </p>
      }
    >
      <form className="form grid" onSubmit={onSubmit}>
        {error ? <div className="banner error">{error}</div> : null}
        <label className="field">
          <span>Display name</span>
          <input
            type="text"
            autoComplete="name"
            required
            maxLength={120}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Chen"
          />
        </label>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@team.com"
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
          />
        </label>
        <button className="btn primary btn-block" disabled={pending} type="submit">
          {pending ? 'Creating…' : 'Create account'}
        </button>
      </form>
    </AuthLayout>
  );
}

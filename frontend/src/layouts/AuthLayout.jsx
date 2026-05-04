import React from 'react';

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="auth-shell">
      <div className="auth-hero" aria-hidden>
        <div className="auth-hero-grid" />
        <div className="auth-hero-glow" />
        <div className="auth-hero-content">
          <div className="auth-hero-badge">Team Task Manager</div>
          <h2 className="auth-hero-title">
            Ship work together.
            <br />
            <span className="auth-hero-accent">Clear roles. Visible progress.</span>
          </h2>
          <ul className="auth-hero-list">
            <li>Projects with Admin / Member access</li>
            <li>Tasks, assignees, due dates &amp; status</li>
            <li>Personal dashboard for what’s on you</li>
          </ul>
        </div>
      </div>
      <div className="auth-panel">
        <div className="auth-card sheet sheet-elevated">
          <h1 className="auth-title">{title}</h1>
          {subtitle ? <p className="muted auth-sub">{subtitle}</p> : null}
          {children}
          {footer ? <div className="auth-footer">{footer}</div> : null}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider.jsx';
import { IconFolders, IconLayoutDashboard } from '@/shared/components/ui/icons.jsx';

function initials(name, email) {
  const n = (name || email || '?').trim();
  const parts = n.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return n.slice(0, 2).toUpperCase();
}

export default function MainLayout() {
  const { user, logout } = useAuth();
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark" aria-hidden>
            <IconSparkMark />
          </span>
          Team Tasks
        </div>
        <nav className="nav" aria-label="Primary">
          <NavLink
            end
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            to="/dashboard"
          >
            <span className="nav-icon" aria-hidden>
              <IconLayoutDashboard />
            </span>
            Dashboard
          </NavLink>
          <NavLink
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            to="/projects"
          >
            <span className="nav-icon" aria-hidden>
              <IconFolders />
            </span>
            Projects
          </NavLink>
        </nav>
        <div className="sidebar-foot">
          <div className="user-row">
            <div className="avatar" aria-hidden title={user?.name}>
              {initials(user?.name, user?.email)}
            </div>
            <div className="user-chip">
              <div className="user-name">{user?.name}</div>
              <div className="user-email muted">{user?.email}</div>
            </div>
          </div>
          <button type="button" className="btn ghost small btn-block" onClick={() => logout()}>
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <div className="main-inner">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

function IconSparkMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
      <path d="M12 2 9 9l-7 3 7 3 3 7 3-7 7-3-7-3-3-7Z" fill="currentColor" />
    </svg>
  );
}

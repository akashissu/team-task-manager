import React from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider.jsx';
import MainLayout from '@/layouts/MainLayout.jsx';
import DashboardPage from '@/pages/dashboard/DashboardPage.jsx';
import ProjectsPage from '@/pages/projects/ProjectsPage.jsx';
import ProjectDetailPage from '@/pages/projects/ProjectDetailPage.jsx';
import LoginPage from '@/pages/auth/LoginPage.jsx';
import RegisterPage from '@/pages/auth/RegisterPage.jsx';

function RequireAuth() {
  const { user, booting } = useAuth();
  if (booting) return <div className="muted center-pad">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}

function GuestRoute() {
  const { user, booting } = useAuth();
  if (booting) return <div className="muted center-pad">Loading…</div>;
  if (user) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

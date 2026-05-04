import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/shared/api/http-client.js';
import Spinner from '@/shared/components/ui/Spinner.jsx';
import EmptyState from '@/shared/components/ui/EmptyState.jsx';
import { IconAlert, IconCheck, IconList, IconSpark } from '@/shared/components/ui/icons.jsx';

function statusLabel(status) {
  if (status === 'in_progress') return 'In progress';
  if (status === 'done') return 'Done';
  return 'Todo';
}

function Badge({ overdue, status }) {
  if (status === 'done') return <span className="status-chip done">Done</span>;
  if (overdue) return <span className="status-chip danger">Overdue</span>;
  if (status === 'in_progress') return <span className="status-chip progress">In progress</span>;
  return <span className="status-chip todo">Todo</span>;
}

function StatCard({ icon, label, value, hint, danger }) {
  return (
    <div className={`stat-card sheet ${danger ? 'stat-card-warn' : ''}`}>
      <div className="stat-card-icon" aria-hidden>
        {icon}
      </div>
      <div className="stat-card-body">
        <div className="stat-label muted">{label}</div>
        <div className={`stat-value ${danger && value ? 'text-danger' : ''}`}>{value}</div>
        {hint ? <div className="stat-hint muted">{hint}</div> : null}
      </div>
    </div>
  );
}

function StatusDistribution({ summary }) {
  const parts = useMemo(
    () => [
      { key: 'todo', n: summary.byStatus.todo, cls: 'seg-todo' },
      { key: 'in_progress', n: summary.byStatus.in_progress, cls: 'seg-doing' },
      { key: 'done', n: summary.byStatus.done, cls: 'seg-done' },
    ],
    [summary]
  );
  const growTotal = Math.max(1, parts.reduce((a, b) => a + b.n, 0));
  return (
    <div className="sheet stat-distribution sheet-elevated">
      <div className="row spread">
        <span className="stat-label muted">Status mix · assigned to you</span>
        <span className="muted small">
          {parts[0].n} todo · {parts[1].n} active · {parts[2].n} done
        </span>
      </div>
      <div className="dist-bar" role="img" aria-label="Task status distribution">
        {parts.map((p) => (
          <div
            key={p.key}
            className={`dist-seg ${p.cls}`}
            style={{
              flexGrow: p.n > 0 ? p.n / growTotal : 0,
              flexBasis: p.n === 0 ? 0 : 6,
              minWidth: p.n === 0 ? 0 : 10,
            }}
          />
        ))}
      </div>
      <div className="dist-legend muted small">
        <span>
          <span className="legend-dot seg-todo-dot" /> Todo
        </span>
        <span>
          <span className="legend-dot seg-doing-dot" /> In progress
        </span>
        <span>
          <span className="legend-dot seg-done-dot" /> Done
        </span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.dashboard();
        if (!cancelled) setData(res);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Could not load dashboard');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="page">
        <div className="banner error">{error}</div>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="page page-center">
        <Spinner label="Loading dashboard" />
        <p className="muted mt-1">Pulling your assignments…</p>
      </div>
    );
  }

  const { summary, tasks } = data;
  const overdueTasks = tasks.filter((t) => t.overdue && t.status !== 'done');
  const sorted = [...tasks].sort((a, b) => Number(b.overdue) - Number(a.overdue));

  return (
    <div className="page fade-in">
      <header className="page-head">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="muted lead">
            Tasks <strong>assigned to you</strong> across every project — status, deadlines, and overdue at a
            glance.
          </p>
        </div>
        <Link className="btn secondary" to="/projects">
          Open projects
        </Link>
      </header>

      <section className="stat-grid">
        <StatCard
          icon={<IconList />}
          label="Assigned to you"
          value={summary.assignedToMe}
          hint="Across all projects you're a member of"
        />
        <StatCard
          icon={<IconAlert />}
          label="Overdue · not done"
          value={summary.overdueCount}
          hint="Past due date and still open"
          danger
        />
        <StatCard
          icon={<IconCheck />}
          label="Completed (assigned)"
          value={summary.byStatus.done}
          hint="Marked done among your assignments"
        />
      </section>

      <section className="mb-2">{summary.assignedToMe > 0 ? <StatusDistribution summary={summary} /> : null}</section>

      {overdueTasks.length > 0 ? (
        <div className="banner warn banner-inline mb-2">
          <IconAlert />
          <span>
            You have <strong>{overdueTasks.length}</strong> overdue task
            {overdueTasks.length > 1 ? 's' : ''}. Knock them down or update dates from the project view.
          </span>
        </div>
      ) : null}

      <section className="sheet sheet-elevated table-wrap">
        <div className="table-head-row">
          <div>
            <h2 className="section-title" style={{ marginBottom: '0.2rem' }}>
              Your assignments
            </h2>
            <p className="muted small" style={{ margin: 0 }}>
              Drill into a row to jump to its project workspace.
            </p>
          </div>
          <IconSparkGlow />
        </div>
        <div className="table-scroll">
          <table className="table table-rows">
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Status</th>
                <th>Due</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((t) => (
                <tr key={t.id} className={t.overdue && t.status !== 'done' ? 'row-warn' : ''}>
                  <td>
                    <Link className="link-strong" to={t.project ? `/projects/${t.project.id}` : '/projects'}>
                      {t.title}
                    </Link>
                    {t.overdue && t.status !== 'done' ? (
                      <span className="status-chip danger sm">Past due</span>
                    ) : null}
                  </td>
                  <td>
                    <span className="project-pill">{t.project?.name ?? '—'}</span>
                  </td>
                  <td>
                    <Badge overdue={t.overdue} status={t.status} />
                    <span className="sr-only">{statusLabel(t.status)}</span>
                  </td>
                  <td className="muted mono">
                    {t.dueDate ? new Date(t.dueDate).toLocaleDateString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {tasks.length === 0 ? (
          <EmptyState
            icon={<IconSpark />}
            title="Nothing on your plate yet"
            hint="Open a project, create a task, and assign it to yourself — it will show up here automatically."
            action={
              <Link className="btn primary" to="/projects">
                Browse projects
              </Link>
            }
          />
        ) : null}
      </section>
    </div>
  );
}

function IconSparkGlow() {
  return (
    <div className="spark-glow muted" aria-hidden>
      <IconSpark />
    </div>
  );
}

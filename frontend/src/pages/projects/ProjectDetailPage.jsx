import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '@/shared/api/http-client.js';
import { useAuth } from '@/providers/AuthProvider.jsx';
import Spinner from '@/shared/components/ui/Spinner.jsx';
import EmptyState from '@/shared/components/ui/EmptyState.jsx';
import { IconList, IconUsers } from '@/shared/components/ui/icons.jsx';

const STATUSES = ['todo', 'in_progress', 'done'];

function emptyTaskForm() {
  return { title: '', description: '', status: 'todo', assigneeId: '', dueDate: '' };
}

function toInputDate(d) {
  if (!d) return '';
  const x = new Date(d);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, '0');
  const day = String(x.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function formatStatus(status) {
  if (status === 'in_progress') return 'In progress';
  if (status === 'done') return 'Done';
  return 'Todo';
}

function TabButton({ active, onClick, children, icon }) {
  return (
    <button
      type="button"
      className={`tab-btn ${active ? 'active' : ''}`}
      onClick={onClick}
      role="tab"
      aria-selected={active}
    >
      <span className="tab-icon" aria-hidden>
        {icon}
      </span>
      {children}
    </button>
  );
}

export default function ProjectDetailPage() {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [dash, setDash] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('MEMBER');
  const [tab, setTab] = useState('tasks');

  const [taskForm, setTaskForm] = useState(emptyTaskForm());
  const [savingTask, setSavingTask] = useState(false);

  const loadAll = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const [pRes, tRes, dRes, mRes] = await Promise.all([
        api.getProject(projectId),
        api.tasks(projectId),
        api.projectDashboard(projectId),
        api.members(projectId),
      ]);
      setProject(pRes.project);
      setTasks(tRes.tasks);
      setDash(dRes);
      setMembers(mRes.members);
    } catch (e) {
      setError(e.message || 'Could not load project');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const isAdmin = project?.role === 'ADMIN';

  async function addMember(e) {
    e.preventDefault();
    try {
      await api.addMember(projectId, {
        email: memberEmail.trim(),
        role: memberRole,
      });
      setMemberEmail('');
      const mRes = await api.members(projectId);
      setMembers(mRes.members);
    } catch (e) {
      setError(e.message);
    }
  }

  async function changeRole(uid, role) {
    try {
      await api.updateMemberRole(projectId, uid, { role });
      const mRes = await api.members(projectId);
      setMembers(mRes.members);
    } catch (e) {
      setError(e.message);
    }
  }

  async function removeMemberClick(uid) {
    try {
      await api.removeMember(projectId, uid);
      const mRes = await api.members(projectId);
      setMembers(mRes.members);
    } catch (e) {
      setError(e.message);
    }
  }

  async function createTask(e) {
    e.preventDefault();
    setSavingTask(true);
    setError('');
    try {
      const body = {
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        dueDate: taskForm.dueDate || undefined,
      };
      if (taskForm.assigneeId) body.assigneeId = taskForm.assigneeId;
      await api.createTask(projectId, body);
      setTaskForm(emptyTaskForm());
      const [tRes, dRes] = await Promise.all([api.tasks(projectId), api.projectDashboard(projectId)]);
      setTasks(tRes.tasks);
      setDash(dRes);
    } catch (e) {
      setError(e.message);
    } finally {
      setSavingTask(false);
    }
  }

  async function patchTask(taskId, patch) {
    try {
      await api.updateTask(projectId, taskId, patch);
      const [tRes, dRes] = await Promise.all([api.tasks(projectId), api.projectDashboard(projectId)]);
      setTasks(tRes.tasks);
      setDash(dRes);
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteTaskClick(taskId) {
    try {
      await api.deleteTask(projectId, taskId);
      const [tRes, dRes] = await Promise.all([api.tasks(projectId), api.projectDashboard(projectId)]);
      setTasks(tRes.tasks);
      setDash(dRes);
    } catch (e) {
      setError(e.message);
    }
  }

  async function deleteProject() {
    const ok = window.confirm('Delete this project and ALL tasks/memberships? Cannot undo.');
    if (!ok) return;
    await api.deleteProject(projectId);
    window.location.href = '/projects';
  }

  if (error && !project && !loading) {
    return (
      <div className="page">
        <div className="banner error">{error}</div>
        <Link className="btn ghost mt-1" to="/projects">
          ← Back to projects
        </Link>
      </div>
    );
  }
  if (!project || loading) {
    return (
      <div className="page page-center">
        <Spinner label="Loading project" />
        <p className="muted mt-1">Fetching tasks and team roster…</p>
      </div>
    );
  }

  const memberOpts = [{ value: '', label: 'Unassigned' }].concat(
    members.map((m) => ({ value: m.userId, label: `${m.name} (${m.email})` }))
  );

  return (
    <div className="page fade-in">
      <div className="breadcrumb muted">
        <Link to="/projects">Projects</Link>
        <span className="bc-sep">/</span>
        <span>{project.name}</span>
      </div>

      <header className="hero-header sheet sheet-elevated">
        <div className="hero-main">
          <div className="section-kicker">Project workspace</div>
          <h1 className="page-title">{project.name}</h1>
          <p className="muted lead" style={{ maxWidth: '52ch', marginBottom: '0.75rem' }}>
            {project.description || 'Use tasks to track commitments. Admins invite members by email.'}
          </p>
          <div className="hero-meta row gap wrap-muted">
            <span className="role-badge">{project.role === 'ADMIN' ? 'Admin · full control' : 'Member · scoped edits'}</span>
            <span>{members.length} teammate{members.length !== 1 ? 's' : ''}</span>
            <span>{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
          </div>
          {error ? <div className="banner error mt-1">{error}</div> : null}
        </div>
        <div className="hero-actions">
          {isAdmin ? (
            <button type="button" className="btn danger-outline" onClick={deleteProject}>
              Delete project
            </button>
          ) : (
            <span className="muted small">Destructive actions are admin-only</span>
          )}
        </div>
      </header>

      <section className="stat-grid">
        <div className="stat-card sheet">
          <div className="stat-card-body">
            <div className="stat-label muted">Total tasks</div>
            <div className="stat-value">{dash?.summary.total ?? '—'}</div>
          </div>
        </div>
        <div className="stat-card sheet stat-card-warn">
          <div className="stat-card-body">
            <div className="stat-label muted">Overdue (open)</div>
            <div className={`stat-value ${dash?.summary.overdueCount ? 'text-danger' : ''}`}>
              {dash?.summary.overdueCount ?? '—'}
            </div>
          </div>
        </div>
        <div className="sheet stat-distribution stretch sheet-elevated">
          <div className="stat-label muted">Project · status breakdown</div>
          <div className="dist-bar mt-08" aria-hidden>
            {['todo', 'in_progress', 'done'].map((k) => {
              const count = dash?.summary.byStatus?.[k] ?? 0;
              const total =
                dash?.summary.total ??
                Math.max(
                  1,
                  ['todo', 'in_progress', 'done'].reduce(
                    (a, kk) => a + (dash?.summary.byStatus?.[kk] ?? 0),
                    0
                  )
                );
              const grow = total > 0 ? count / total : 0;
              return (
                <div
                  key={k}
                  className={`dist-seg ${
                    k === 'todo' ? 'seg-todo' : k === 'done' ? 'seg-done' : 'seg-doing'
                  }`}
                  style={{
                    flexGrow: grow,
                    flexBasis: count === 0 ? 0 : 8,
                    minWidth: count === 0 ? 0 : 10,
                  }}
                />
              );
            })}
          </div>
          <div className="pills-row" style={{ marginTop: '0.65rem' }}>
            <span className="pill">Todo · {dash?.summary.byStatus?.todo ?? 0}</span>
            <span className="pill">Active · {dash?.summary.byStatus?.in_progress ?? 0}</span>
            <span className="pill done">Done · {dash?.summary.byStatus?.done ?? 0}</span>
          </div>
        </div>
      </section>

      <div className="tabs-wrap">
        <div className="tabs" role="tablist">
          <TabButton active={tab === 'tasks'} onClick={() => setTab('tasks')} icon={<IconList />}>
            Tasks board
          </TabButton>
          <TabButton active={tab === 'team'} onClick={() => setTab('team')} icon={<IconUsers />}>
            Team &amp; access
          </TabButton>
        </div>

        {tab === 'tasks' ? (
          <div className="tab-panel fade-in">
            <section className="sheet sheet-elevated">
              <div className="section-kicker">Create</div>
              <h2 className="section-title">New task</h2>
              <form className="form grid narrow" onSubmit={createTask}>
                <label className="field">
                  <span>Title</span>
                  <input
                    required
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="Something shippable and verifiable"
                  />
                </label>
                <label className="field">
                  <span>Description</span>
                  <textarea
                    rows={3}
                    value={taskForm.description}
                    onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                    placeholder="Context, links, acceptance notes"
                  />
                </label>
                <label className="field">
                  <span>Assignee</span>
                  <select
                    value={taskForm.assigneeId}
                    onChange={(e) => setTaskForm({ ...taskForm, assigneeId: e.target.value })}
                  >
                    {memberOpts.map((o, i) => (
                      <option key={`${o.value}-${i}`} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="row gap">
                  <label className="field grow">
                    <span>Due date</span>
                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })}
                    />
                  </label>
                  <label className="field grow">
                    <span>Status</span>
                    <select
                      value={taskForm.status}
                      onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {formatStatus(s)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="row">
                  <button className="btn primary" disabled={savingTask} type="submit">
                    {savingTask ? 'Saving…' : 'Add task to board'}
                  </button>
                </div>
              </form>

              <h2 className="section-title divider-top">Tasks · {tasks.length}</h2>
              <ul className="task-stack">
                {tasks.map((t) => (
                  <li key={t.id} className="task-panel">
                    <div className="task-panel-head">
                      <div className="task-panel-title-row">
                        <h3 className="task-heading">{t.title}</h3>
                        <div className="task-badges">
                          {t.overdue && t.status !== 'done' ? (
                            <span className="status-chip danger sm">Overdue</span>
                          ) : null}
                          <span
                            className={`status-chip ${
                              t.status === 'done' ? 'done' : t.status === 'in_progress' ? 'progress' : 'todo'
                            } sm`}
                          >
                            {formatStatus(t.status)}
                          </span>
                        </div>
                      </div>
                      <div className="task-panel-actions row gap wrap">
                        <button
                          type="button"
                          className="btn ghost small"
                          onClick={() =>
                            patchTask(t.id, {
                              status: STATUSES[(STATUSES.indexOf(t.status) + 1) % STATUSES.length],
                            })
                          }
                        >
                          Advance status
                        </button>
                        <button
                          type="button"
                          className="btn ghost small danger-text"
                          onClick={() => deleteTaskClick(t.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    {t.description ? <p className="muted task-desc">{t.description}</p> : null}
                    <div className="task-toolbar">
                      <div className="toolbar-group">
                        <span className="toolbar-label">Assign</span>
                        <select
                          className="select-inline"
                          value={t.assignee?.id ?? ''}
                          onChange={(e) => patchTask(t.id, { assigneeId: e.target.value || null })}
                        >
                          {memberOpts.map((o, i) => (
                            <option key={`a-${o.value}-${i}`} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="toolbar-group">
                        <span className="toolbar-label">Status</span>
                        <select
                          className="select-inline"
                          value={t.status}
                          onChange={(e) => patchTask(t.id, { status: e.target.value })}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {formatStatus(s)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="toolbar-group">
                        <span className="toolbar-label">Due</span>
                        <input
                          className="input-inline date"
                          type="date"
                          value={toInputDate(t.dueDate)}
                          onChange={(e) => patchTask(t.id, { dueDate: e.target.value || null })}
                        />
                      </div>
                      <div className="toolbar-meta muted small">
                        Creator:{' '}
                        <strong>{t.createdBy?.id === user?.id ? 'you' : t.createdBy?.name ?? '?'}</strong>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {tasks.length === 0 ? (
                <EmptyState
                  icon={<IconList />}
                  title="Board is empty"
                  hint="Start with a few tasks. Assign owners and due dates so the dashboard stays honest."
                />
              ) : null}
            </section>
          </div>
        ) : (
          <div className="tab-panel fade-in">
            <section className="sheet sheet-elevated">
              <div className="section-kicker">People</div>
              <h2 className="section-title">Team &amp; roles</h2>
              <p className="muted small" style={{ marginTop: '-0.5rem' }}>
                Admins can promote members, remove people, and delete the project. Members see everything but
                membership is locked down.
              </p>
              <ul className="member-list rich">
                {members.map((m) => (
                  <li key={m.userId} className="member-row rich">
                    <div className="member-avatar" aria-hidden>
                      {(m.name || m.email || '?').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="member-info">
                      <div className="member-name">{m.name}</div>
                      <div className="muted small">{m.email}</div>
                    </div>
                    <div className="row gap">
                      {isAdmin ? (
                        <>
                          <select
                            className="select-inline small"
                            value={m.role}
                            onChange={(e) => changeRole(m.userId, e.target.value)}
                          >
                            <option value="MEMBER">MEMBER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                          {m.userId !== user?.id ? (
                            <button type="button" className="btn ghost small" onClick={() => removeMemberClick(m.userId)}>
                              Remove
                            </button>
                          ) : (
                            <span className="pill calm">You</span>
                          )}
                        </>
                      ) : (
                        <span className={`pill ${m.role === 'ADMIN' ? 'accent strong' : ''}`}>{m.role}</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {isAdmin ? (
                <form className="form grid narrow divider-top" onSubmit={addMember}>
                  <h3 className="section-title" style={{ fontSize: '1rem' }}>
                    Invite by email
                  </h3>
                  <p className="muted small" style={{ marginTop: '-0.75rem' }}>
                    The person must already have registered an account with that email.
                  </p>
                  <label className="field">
                    <span>Email</span>
                    <input
                      placeholder="teammate@company.com"
                      type="email"
                      value={memberEmail}
                      onChange={(e) => setMemberEmail(e.target.value)}
                      required
                    />
                  </label>
                  <label className="field">
                    <span>Role</span>
                    <select value={memberRole} onChange={(e) => setMemberRole(e.target.value)}>
                      <option value="MEMBER">MEMBER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </label>
                  <button className="btn secondary" type="submit">
                    Add to project
                  </button>
                </form>
              ) : (
                <p className="muted small divider-top">Ask a project admin to add teammates or change roles.</p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}

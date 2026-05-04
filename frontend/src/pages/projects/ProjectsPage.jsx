import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/shared/api/http-client.js';
import Spinner from '@/shared/components/ui/Spinner.jsx';
import EmptyState from '@/shared/components/ui/EmptyState.jsx';
import { IconFolders } from '@/shared/components/ui/icons.jsx';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  async function load() {
    setError('');
    setLoading(true);
    try {
      const res = await api.projects();
      setProjects(res.projects);
    } catch (e) {
      setError(e.message || 'Could not load projects');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create(e) {
    e.preventDefault();
    setCreating(true);
    setError('');
    try {
      const res = await api.createProject({ name, description });
      setProjects((p) => [
        {
          ...res.project,
          role: res.project.role,
        },
        ...p,
      ]);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err.message || 'Create failed');
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="page fade-in">
      <header className="page-head">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="muted lead">
            Each project is a workspace with its own <strong>members</strong> and <strong>tasks</strong>. You start as{' '}
            <strong>Admin</strong> on projects you create.
          </p>
        </div>
      </header>

      <div className="projects-layout">
        <section className="sheet sheet-elevated create-project-card">
          <div className="section-kicker">Start here</div>
          <h2 className="section-title">New project</h2>
          <p className="muted small" style={{ marginTop: '-0.5rem' }}>
            Name your team space. You can invite people by email once they have an account.
          </p>
          <form className="form grid" onSubmit={create}>
            {error ? <div className="banner error">{error}</div> : null}
            <label className="field">
              <span>Name</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} maxLength={200} placeholder="e.g. Backend launch" />
            </label>
            <label className="field">
              <span>Description (optional)</span>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Goal, scope, or links for the team"
              />
            </label>
            <button className="btn primary btn-block" disabled={creating} type="submit">
              {creating ? 'Creating…' : 'Create project workspace'}
            </button>
          </form>
        </section>

        <section className="projects-main">
          <div className="row spread align-end mb-1">
            <div>
              <div className="section-kicker">Your memberships</div>
              <h2 className="section-title" style={{ marginBottom: '0.25rem' }}>
                All projects
              </h2>
              <p className="muted small" style={{ margin: 0 }}>
                Your role is stored per project · Admins manage members and destructive actions
              </p>
            </div>
            {loading ? <Spinner label="Loading projects" /> : null}
          </div>

          {loading ? (
            <div className="project-grid">
              {[0, 1, 2].map((i) => (
                <div key={i} className="project-tile skeleton" />
              ))}
            </div>
          ) : projects.length === 0 ? (
            <div className="sheet">
              <EmptyState
                icon={<IconFolders />}
                title="No projects yet"
                hint="Create your first workspace on the left, then add tasks and invite teammates."
                action={
                  <span className="muted small">
                    Tip: register a second email in another browser to demo multi-user roles.
                  </span>
                }
              />
            </div>
          ) : (
            <ul className="project-grid">
              {projects.map((p) => (
                <li key={p.id}>
                  <Link className="project-tile sheet sheet-elevated" to={`/projects/${p.id}`}>
                    <div className="project-tile-head">
                      <span className="project-tile-icon" aria-hidden>
                        <IconFolders />
                      </span>
                      <span className={`pill role ${p.role === 'ADMIN' ? 'accent strong' : ''}`}>{p.role}</span>
                    </div>
                    <h3 className="project-tile-title">{p.name}</h3>
                    <p className="project-tile-desc muted">{p.description || 'Open workspace →'}</p>
                    <span className="project-tile-cta">Open board →</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

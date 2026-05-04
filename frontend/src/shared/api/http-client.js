const TOKEN_KEY = 'ttm_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' };
  const t = token ?? getToken();
  if (t) headers.Authorization = `Bearer ${t}`;
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  const data = text ? safeJsonParse(text) : {};
  if (!res.ok) {
    const msg = data.message || data.errors?.[0]?.msg || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

export const api = {
  login: (body) => request('/api/auth/login', { method: 'POST', body, token: null }),
  register: (body) => request('/api/auth/register', { method: 'POST', body, token: null }),
  me: () => request('/api/auth/me'),

  dashboard: () => request('/api/dashboard'),

  projects: () => request('/api/projects'),
  createProject: (body) => request('/api/projects', { method: 'POST', body }),
  getProject: (id) => request(`/api/projects/${id}`),
  projectDashboard: (id) => request(`/api/projects/${id}/dashboard`),
  updateProject: (id, body) => request(`/api/projects/${id}`, { method: 'PATCH', body }),
  deleteProject: (id) => request(`/api/projects/${id}`, { method: 'DELETE' }),

  members: (projectId) => request(`/api/projects/${projectId}/members`),
  addMember: (projectId, body) =>
    request(`/api/projects/${projectId}/members`, { method: 'POST', body }),
  updateMemberRole: (projectId, userId, body) =>
    request(`/api/projects/${projectId}/members/${userId}`, { method: 'PATCH', body }),
  removeMember: (projectId, userId) =>
    request(`/api/projects/${projectId}/members/${userId}`, { method: 'DELETE' }),

  tasks: (projectId) => request(`/api/projects/${projectId}/tasks`),
  createTask: (projectId, body) =>
    request(`/api/projects/${projectId}/tasks`, { method: 'POST', body }),
  updateTask: (projectId, taskId, body) =>
    request(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'PATCH', body }),
  deleteTask: (projectId, taskId) =>
    request(`/api/projects/${projectId}/tasks/${taskId}`, { method: 'DELETE' }),
};

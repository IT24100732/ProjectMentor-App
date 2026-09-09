const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5220';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.title ?? body ?? `Request failed (${response.status})`);
  return body;
}

export function registerStudent(payload) {
  return request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) });
}

export function login(payload) {
  return request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) });
}

export function createRoadmapRequest(token, payload) {
  return request('/api/roadmap-requests', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export function getRoadmapRequest(token, id) {
  return request(`/api/roadmap-requests/${id}`, { headers: { Authorization: `Bearer ${token}` } });
}

export function acceptRoadmap(token, id) {
  return request(`/api/roadmaps/${id}/accept`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ comment: 'Accepted from React demo' }) });
}

export function requestRevision(token, id) {
  return request(`/api/roadmaps/${id}/request-revision`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ comment: 'Please revise this demo roadmap' }) });
}

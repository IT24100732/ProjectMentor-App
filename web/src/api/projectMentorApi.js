const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5220';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers ?? {}) },
    });
  } catch {
    const error = new Error('Cannot reach the API — make sure the backend and database are running.');
    error.code = 'API_UNREACHABLE';
    throw error;
  }
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const error = new Error(body?.title ?? body ?? `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
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

export function getCurrentRoadmapRequest(token) {
  return request('/api/roadmap-requests/current', { headers: { Authorization: `Bearer ${token}` } });
}

export function acceptRoadmap(token, id) {
  return request(`/api/roadmaps/${id}/accept`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ comment: 'Accepted from React demo' }) });
}

export function requestRevision(token, id) {
  return request(`/api/roadmaps/${id}/request-revision`, { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify({ comment: 'Please revise this demo roadmap' }) });
}

// --- Component B: Resource Hub ---

export function searchResources(token, params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, value);
  });
  const suffix = query.toString() ? `?${query.toString()}` : '';
  return request(`/api/resources${suffix}`, { headers: { Authorization: `Bearer ${token}` } });
}

export function getResourceFacets(token) {
  return request('/api/resources/facets', { headers: { Authorization: `Bearer ${token}` } });
}

export function createResource(token, payload) {
  return request('/api/resources', { method: 'POST', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export function updateResource(token, id, payload) {
  return request(`/api/resources/${id}`, { method: 'PUT', headers: { Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
}

export function deleteResource(token, id) {
  return request(`/api/resources/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
}

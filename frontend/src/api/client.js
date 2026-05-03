/**
 * TrainMe API Client — React version
 * Ported from js/api.js
 */

const PROD_API_URL = 'https://trainme-4oel.onrender.com/api/v1';

export const API_BASE =
  window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:8000/api/v1'
    : PROD_API_URL;

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

export const apiCache = {
  get: (key) => {
    try {
      const item = sessionStorage.getItem(`tm_cache_${key}`);
      return item ? JSON.parse(item) : undefined;
    } catch (e) {
      return undefined;
    }
  },
  set: (key, value) => {
    try {
      sessionStorage.setItem(`tm_cache_${key}`, JSON.stringify(value));
    } catch (e) {}
  },
  has: (key) => !!sessionStorage.getItem(`tm_cache_${key}`),
  clear: () => {
    try {
      Object.keys(sessionStorage).forEach(k => {
        if (k.startsWith('tm_cache_')) sessionStorage.removeItem(k);
      });
    } catch (e) {}
  },
  delete: (key) => {
    try {
      sessionStorage.removeItem(`tm_cache_${key}`);
    } catch (e) {}
  }
};

export async function apiFetch(path, options = {}) {
  const method = options.method || 'GET';

  // Clear cache on any data mutation
  if (method !== 'GET') {
    apiCache.clear();
  }

  const token = sessionStorage.getItem('tm_token');
  const cacheKey = `${method}:${path}:${token}`;

  // Serve from cache for GET requests (cache lives until logout or a mutation)
  if (method === 'GET' && !path.includes('unread-count') && apiCache.has(cacheKey)) {
    return apiCache.get(cacheKey).data;
  }

  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    sessionStorage.removeItem('tm_token');
    sessionStorage.removeItem('tm_user');
    window.location.href = '/login';
    return;
  }

  const data = res.status !== 204 ? await res.json().catch(() => ({})) : {};
  if (!res.ok) throw new ApiError(data.detail || 'Request failed', res.status);

  // Cache successful GET responses
  if (method === 'GET' && !path.includes('unread-count')) {
    apiCache.set(cacheKey, { timestamp: Date.now(), data });
  }

  return data;
}

export async function apiUpload(path, formData) {
  apiCache.clear(); // Clear cache on file uploads as well
  const token = sessionStorage.getItem('tm_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.detail || 'Upload failed', res.status);
  return data;
}

export function getMediaUrl(path) {
  if (!path) return '';
  return path.startsWith('http') ? path : `http://localhost:8000${path}`;
}

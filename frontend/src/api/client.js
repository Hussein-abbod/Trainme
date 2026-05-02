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

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('tm_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
    window.location.href = '/login';
    return;
  }

  const data = res.status !== 204 ? await res.json().catch(() => ({})) : {};
  if (!res.ok) throw new ApiError(data.detail || 'Request failed', res.status);
  return data;
}

export async function apiUpload(path, formData) {
  const token = localStorage.getItem('tm_token');
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

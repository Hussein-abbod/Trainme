/**
 * TrainMe API Client
 * All backend communication goes through this module.
 * Base URL: http://localhost:8000/api/v1
 */

// ⚠️ IMPORTANT: Update this with your actual deployed backend URL when deploying!
const PROD_API_URL = 'https://trainme-4oel.onrender.com/api/v1';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000/api/v1'
  : PROD_API_URL;

// ─── Core Fetch Wrapper ────────────────────────────────────────

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('tm_token');
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    // Token expired or invalid — clear session and redirect to login
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
    window.location.href = '/login';
    return;
  }

  const data = res.status !== 204 ? await res.json().catch(() => ({})) : {};
  if (!res.ok) throw new ApiError(data.detail || 'Request failed', res.status);
  return data;
}

// Upload form that includes files (no JSON Content-Type)
async function apiUpload(path, formData) {
  const token = localStorage.getItem('tm_token');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { method: 'POST', headers, body: formData });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new ApiError(data.detail || 'Upload failed', res.status);
  return data;
}

class ApiError extends Error {
  constructor(message, status) { super(message); this.status = status; }
}

// Compute relative path prefix based on page location
function getBasePath() {
  const path = window.location.pathname;
  return path.includes('/pages/') ? '../' : '';
}

// Helper to format media URLs (local vs Cloudinary)
function getMediaUrl(path) {
  if (!path) return '';
  return path.startsWith('http') ? path : `http://localhost:8000${path}`;
}

// ─── Auth ──────────────────────────────────────────────────────

const Auth = {
  registerStudent: (data) => apiFetch('/auth/register/student', { method: 'POST', body: JSON.stringify(data) }),
  registerCompany: (data) => apiFetch('/auth/register/company',  { method: 'POST', body: JSON.stringify(data) }),
  login:           (data) => apiFetch('/auth/login',             { method: 'POST', body: JSON.stringify(data) }),
  me:              ()     => apiFetch('/auth/me'),
};

// ─── Students ─────────────────────────────────────────────────

const Students = {
  getMyProfile:    ()     => apiFetch('/students/me'),
  updateMyProfile: (data) => apiFetch('/students/me', { method: 'PUT', body: JSON.stringify(data) }),
  getProfile:      (id)   => apiFetch(`/students/${id}`),
  uploadCV: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiUpload('/students/me/upload-cv', fd);
  },
};

// ─── Companies ────────────────────────────────────────────────

const Companies = {
  list:           (params = {}) => apiFetch('/companies/?' + new URLSearchParams(params)),
  getMyCompany:   ()            => apiFetch('/companies/me'),
  updateMyCompany:(data)        => apiFetch('/companies/me', { method: 'PUT', body: JSON.stringify(data) }),
  getCompany:     (id)          => apiFetch(`/companies/${id}`),
  uploadLogo: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiUpload('/companies/me/upload-logo', fd);
  },
};

// ─── Internships ──────────────────────────────────────────────

const Internships = {
  list:       (params = {}) => apiFetch('/internships/?' + new URLSearchParams(params)),
  get:        (id)          => apiFetch(`/internships/${id}`),
  create:     (data)        => apiFetch('/internships/',  { method: 'POST',   body: JSON.stringify(data) }),
  update:     (id, data)    => apiFetch(`/internships/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete:     (id)          => apiFetch(`/internships/${id}`, { method: 'DELETE' }),
  myListings: ()            => apiFetch('/internships/company/my-listings'),
};

// ─── Applications ─────────────────────────────────────────────

const Applications = {
  apply:         (data)   => apiFetch('/applications/', { method: 'POST', body: JSON.stringify(data) }),
  myApplications:()       => apiFetch('/applications/my'),
  withdraw:      (id)     => apiFetch(`/applications/${id}`, { method: 'DELETE' }),
  listApplicants:(internshipId, status) => {
    const params = status ? `?status_filter=${status}` : '';
    return apiFetch(`/applications/internship/${internshipId}${params}`);
  },
  updateStatus: (id, data) => apiFetch(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
};

// ─── Bookmarks ────────────────────────────────────────────────

const Bookmarks = {
  list:   ()   => apiFetch('/bookmarks/'),
  add:    (id) => apiFetch(`/bookmarks/${id}`, { method: 'POST' }),
  remove: (id) => apiFetch(`/bookmarks/${id}`, { method: 'DELETE' }),
};

// ─── Messages ─────────────────────────────────────────────────

const Messages = {
  send:        (data)   => apiFetch('/messages/', { method: 'POST', body: JSON.stringify(data) }),
  conversation:(userId) => apiFetch(`/messages/?other_user_id=${userId}`),
  unreadCount: ()       => apiFetch('/messages/unread-count'),
};

// ─── Notifications ────────────────────────────────────────────

const Notifications = {
  list:       (unreadOnly = false) => apiFetch(`/notifications/?unread_only=${unreadOnly}`),
  markRead:   (id)                 => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead:()                   => apiFetch('/notifications/read-all', { method: 'PATCH' }),
  unreadCount:()                   => apiFetch('/notifications/unread-count'),
};

// ─── Dashboard ────────────────────────────────────────────────

const Dashboard = {
  company: () => apiFetch('/dashboard/company'),
};

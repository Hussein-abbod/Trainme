/**
 * TrainMe API Namespaces — React version
 * Ported from js/api.js
 */
import { apiFetch, apiUpload } from './client.js';

export const Auth = {
  registerStudent: (data) => apiFetch('/auth/register/student', { method: 'POST', body: JSON.stringify(data) }),
  registerCompany: (data) => apiFetch('/auth/register/company',  { method: 'POST', body: JSON.stringify(data) }),
  login:           (data) => apiFetch('/auth/login',             { method: 'POST', body: JSON.stringify(data) }),
  me:              ()     => apiFetch('/auth/me'),
};

export const Students = {
  getMyProfile:    ()     => apiFetch('/students/me'),
  updateMyProfile: (data) => apiFetch('/students/me', { method: 'PUT', body: JSON.stringify(data) }),
  getProfile:      (id)   => apiFetch(`/students/${id}`),
  uploadCV: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiUpload('/students/me/upload-cv', fd);
  },
};

export const Companies = {
  list:            (params = {}) => apiFetch('/companies/?' + new URLSearchParams(params)),
  getMyCompany:    ()            => apiFetch('/companies/me'),
  updateMyCompany: (data)        => apiFetch('/companies/me', { method: 'PUT', body: JSON.stringify(data) }),
  getCompany:      (id)          => apiFetch(`/companies/${id}`),
  uploadLogo: (file) => {
    const fd = new FormData();
    fd.append('file', file);
    return apiUpload('/companies/me/upload-logo', fd);
  },
};

export const Internships = {
  list:       (params = {}) => apiFetch('/internships/?' + new URLSearchParams(params)),
  get:        (id)          => apiFetch(`/internships/${id}`),
  create:     (data)        => apiFetch('/internships/',     { method: 'POST',   body: JSON.stringify(data) }),
  update:     (id, data)    => apiFetch(`/internships/${id}`, { method: 'PUT',  body: JSON.stringify(data) }),
  delete:     (id)          => apiFetch(`/internships/${id}`, { method: 'DELETE' }),
  myListings: ()            => apiFetch('/internships/company/my-listings'),
};

export const Applications = {
  apply:          (data)   => apiFetch('/applications/', { method: 'POST', body: JSON.stringify(data) }),
  myApplications: ()       => apiFetch('/applications/my'),
  withdraw:       (id)     => apiFetch(`/applications/${id}`, { method: 'DELETE' }),
  listApplicants: (internshipId, status) => {
    const params = status ? `?status_filter=${status}` : '';
    return apiFetch(`/applications/internship/${internshipId}${params}`);
  },
  updateStatus: (id, data) => apiFetch(`/applications/${id}/status`, { method: 'PATCH', body: JSON.stringify(data) }),
};

export const Bookmarks = {
  list:   ()   => apiFetch('/bookmarks/'),
  add:    (id) => apiFetch(`/bookmarks/${id}`, { method: 'POST' }),
  remove: (id) => apiFetch(`/bookmarks/${id}`, { method: 'DELETE' }),
};

export const Messages = {
  send:            (data)   => apiFetch('/messages/', { method: 'POST', body: JSON.stringify(data) }),
  getConversation: (userId) => apiFetch(`/messages/?other_user_id=${userId}`),
  contacts:        ()       => apiFetch('/messages/contacts'),
  unreadCount:     ()       => apiFetch('/messages/unread-count'),
};

export const Notifications = {
  list:        (unreadOnly = false) => apiFetch(`/notifications/?unread_only=${unreadOnly}`),
  markRead:    (id)                 => apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }),
  markAllRead: ()                   => apiFetch('/notifications/read-all', { method: 'PATCH' }),
  unreadCount: ()                   => apiFetch('/notifications/unread-count'),
};

export const Dashboard = {
  company: () => apiFetch('/dashboard/company'),
};

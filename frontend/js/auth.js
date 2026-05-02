/**
 * TrainMe Auth Utilities
 * Session storage, guards, and user info helpers.
 */

// ─── Storage Helpers ─────────────────────────────────────────

const AuthState = {
  save(tokenResponse) {
    localStorage.setItem('tm_token', tokenResponse.access_token);
    localStorage.setItem('tm_user',  JSON.stringify({
      id:   tokenResponse.user_id,
      name: tokenResponse.name,
      role: tokenResponse.role,
    }));
  },

  clear() {
    localStorage.removeItem('tm_token');
    localStorage.removeItem('tm_user');
  },

  getToken()    { return localStorage.getItem('tm_token'); },
  isLoggedIn()  { return !!this.getToken(); },

  getUser() {
    try { return JSON.parse(localStorage.getItem('tm_user') || 'null'); }
    catch { return null; }
  },

  getRole()   { return this.getUser()?.role || null; },
  getUserId() { return this.getUser()?.id   || null; },
  getName()   { return this.getUser()?.name || 'User'; },
};

// ─── Route Guards ─────────────────────────────────────────────

/**
 * Redirect unauthenticated users to login.
 * @param {'student'|'company'|null} requiredRole — null means any authenticated user
 */
function requireAuth(requiredRole = null) {
  if (!AuthState.isLoggedIn()) {
    window.location.href = getBasePath() + 'login.html';
    return false;
  }
  if (requiredRole && AuthState.getRole() !== requiredRole) {
    // Wrong role — redirect to appropriate home
    const role = AuthState.getRole();
    const home = role === 'company' ? 'company_dashboard.html' : 'discovery_feed.html';
    window.location.href = getBasePath() + home;
    return false;
  }
  return true;
}

/** Redirect already-logged-in users away from auth pages */
function redirectIfLoggedIn() {
  if (AuthState.isLoggedIn()) {
    const role = AuthState.getRole();
    const home = role === 'company' ? 'company_dashboard.html' : 'discovery_feed.html';
    window.location.href = getBasePath() + home;
  }
}

/** Logout */
function logout() {
  AuthState.clear();
  window.location.href = getBasePath() + 'homepage.html';
}

// ─── UI Helpers ───────────────────────────────────────────────

/** Populate nav user name / avatar placeholder if the elements exist */
function populateNavUser() {
  const user = AuthState.getUser();
  if (!user) return;
  document.querySelectorAll('[data-user-name]').forEach(el  => el.textContent = user.name);
  document.querySelectorAll('[data-user-initial]').forEach(el => el.textContent = user.name.charAt(0).toUpperCase());
}

/** Update notification badge on nav bell icon */
async function updateNotificationBadge() {
  try {
    const { unread_count } = await Notifications.unreadCount();
    document.querySelectorAll('[data-notif-count]').forEach(el => {
      el.textContent = unread_count || '';
      el.classList.toggle('hidden', !unread_count);
    });
  } catch { /* silent */ }
}

/** Compute base path prefix */
function getBasePath() {
  return window.location.pathname.includes('/pages/') ? '../' : '';
}

// Run on every page load
document.addEventListener('DOMContentLoaded', () => {
  populateNavUser();
  if (AuthState.isLoggedIn()) updateNotificationBadge();
});

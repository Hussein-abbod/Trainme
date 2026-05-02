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
    window.location.href = '/login';
    return false;
  }
  if (requiredRole && AuthState.getRole() !== requiredRole) {
    const role = AuthState.getRole();
    const home = role === 'company' ? '/dashboard' : '/discover';
    window.location.href = home;
    return false;
  }
  return true;
}

function redirectIfLoggedIn() {
  if (AuthState.isLoggedIn()) {
    const role = AuthState.getRole();
    const home = role === 'company' ? '/dashboard' : '/discover';
    window.location.href = home;
  }
}

function logout() {
  AuthState.clear();
  window.location.href = '/';
}

// ─── UI Helpers ───────────────────────────────────────────────

/** Populate nav user name / avatar placeholder if the elements exist.
 *  Also injects a logout dropdown into #nav-user-btn if it exists. */
function populateNavUser() {
  const user = AuthState.getUser();
  if (!user) return;
  document.querySelectorAll('[data-user-name]').forEach(el  => el.textContent = user.name);
  document.querySelectorAll('[data-user-initial]').forEach(el => el.textContent = user.name.charAt(0).toUpperCase());

  // ── Logout Dropdown ───────────────────────────────────────────
  const btn = document.getElementById('nav-user-btn');
  if (!btn) return;

  // Set initials
  const initials = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  btn.innerHTML = `
    <div class="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold cursor-pointer select-none" id="nav-avatar">
      ${initials}
    </div>
  `;

  // Inject dropdown
  if (!document.getElementById('nav-logout-dropdown')) {
    const dropdown = document.createElement('div');
    dropdown.id = 'nav-logout-dropdown';
    dropdown.style.cssText = `
      position:absolute; right:0; top:calc(100% + 8px);
      background:#fff; border:1px solid #e5e2e1; border-radius:12px;
      min-width:200px; box-shadow:0 8px 24px rgba(0,0,0,0.12);
      z-index:9999; display:none; overflow:hidden;
      font-family:'Fustat',sans-serif;
    `;
    dropdown.innerHTML = `
      <div style="padding:12px 16px; border-bottom:1px solid #e5e2e1;">
        <div style="font-size:13px; font-weight:700; color:#1c1b1b;">${user.name}</div>
        <div style="font-size:12px; color:#6e7979; text-transform:capitalize;">${user.role}</div>
      </div>
      <a href="${user.role === 'company' ? '/company-profile' : '/profile'}"
         style="display:flex; align-items:center; gap:10px; padding:12px 16px; color:#1c1b1b; font-size:14px; text-decoration:none;"
         onmouseover="this.style.background='#f0eded'" onmouseout="this.style.background='transparent'">
        <span class="material-symbols-outlined" style="font-size:18px;">manage_accounts</span>
        Edit Profile
      </a>
      <button onclick="logout()"
         style="display:flex; align-items:center; gap:10px; padding:12px 16px; width:100%; border:none; background:transparent; color:#ba1a1a; font-size:14px; cursor:pointer; font-family:'Fustat',sans-serif;"
         onmouseover="this.style.background='#ffdad6'" onmouseout="this.style.background='transparent'">
        <span class="material-symbols-outlined" style="font-size:18px;">logout</span>
        Sign Out
      </button>
    `;
    btn.style.position = 'relative';
    btn.appendChild(dropdown);

    // Toggle on click
    document.getElementById('nav-avatar').addEventListener('click', (e) => {
      e.stopPropagation();
      const d = document.getElementById('nav-logout-dropdown');
      d.style.display = d.style.display === 'none' ? 'block' : 'none';
    });
    // Close on outside click
    document.addEventListener('click', () => {
      const d = document.getElementById('nav-logout-dropdown');
      if (d) d.style.display = 'none';
    });
  }
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

// Run on every page load
document.addEventListener('DOMContentLoaded', () => {
  populateNavUser();
  if (AuthState.isLoggedIn()) updateNotificationBadge();
});

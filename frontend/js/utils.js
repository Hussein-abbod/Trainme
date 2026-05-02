/**
 * TrainMe UI Utilities
 * Toast notifications, loading states, date formatters, etc.
 */

// ─── Toast Notification ───────────────────────────────────────

let _toastContainer = null;

function getToastContainer() {
  if (_toastContainer) return _toastContainer;
  _toastContainer = document.createElement('div');
  _toastContainer.id = 'tm-toast-container';
  _toastContainer.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    display:flex; flex-direction:column; gap:10px; max-width:360px;
  `;
  document.body.appendChild(_toastContainer);
  return _toastContainer;
}

/**
 * Show a toast notification.
 * @param {string} message
 * @param {'success'|'error'|'info'|'warning'} type
 * @param {number} duration ms
 */
function toast(message, type = 'info', duration = 4000) {
  const container = getToastContainer();

  const colors = {
    success: { bg: '#006565', text: '#fff', icon: 'check_circle' },
    error:   { bg: '#ba1a1a', text: '#fff', icon: 'error'         },
    warning: { bg: '#7d5700', text: '#fff', icon: 'warning'       },
    info:    { bg: '#313030', text: '#fff', icon: 'info'          },
  };
  const c = colors[type] || colors.info;

  const el = document.createElement('div');
  el.style.cssText = `
    display:flex; align-items:center; gap:10px;
    background:${c.bg}; color:${c.text};
    padding:12px 16px; border-radius:12px;
    font-family:'Fustat',sans-serif; font-size:14px; font-weight:500;
    box-shadow:0 4px 16px rgba(0,0,0,0.18);
    animation: tmSlideIn 0.25s ease;
    cursor:pointer; max-width:100%;
  `;
  el.innerHTML = `
    <span class="material-symbols-outlined" style="font-size:20px;flex-shrink:0">${c.icon}</span>
    <span style="flex:1">${message}</span>
    <span class="material-symbols-outlined" style="font-size:18px;flex-shrink:0;opacity:0.6">close</span>
  `;

  el.addEventListener('click', () => el.remove());
  container.appendChild(el);

  // Add keyframe if not already added
  if (!document.getElementById('tm-toast-keyframes')) {
    const style = document.createElement('style');
    style.id = 'tm-toast-keyframes';
    style.textContent = `
      @keyframes tmSlideIn { from { transform:translateX(110%); opacity:0 } to { transform:translateX(0); opacity:1 } }
      @keyframes tmSlideOut { from { transform:translateX(0); opacity:1 } to { transform:translateX(110%); opacity:0 } }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    el.style.animation = 'tmSlideOut 0.25s ease forwards';
    setTimeout(() => el.remove(), 250);
  }, duration);
}

// ─── Button Loading State ─────────────────────────────────────

/**
 * Set a button into loading state (disabled + spinner text).
 * Returns a restore function.
 */
function setLoading(btn, text = 'Loading…') {
  const original = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<svg class="animate-spin" style="width:18px;height:18px;display:inline;margin-right:6px" viewBox="0 0 24 24"><circle style="opacity:.25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/><path style="opacity:.75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/></svg>${text}`;
  return () => { btn.disabled = false; btn.innerHTML = original; };
}

// ─── Date Helpers ─────────────────────────────────────────────

function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDeadline(isoString) {
  if (!isoString) return 'Open';
  const d = new Date(isoString);
  const now = new Date();
  const diffDays = Math.ceil((d - now) / 86400000);
  if (diffDays < 0)  return '<span class="text-error">Closed</span>';
  if (diffDays === 0) return '<span class="text-error">Closes today!</span>';
  if (diffDays <= 7) return `<span class="text-yellow-600">Closes in ${diffDays}d</span>`;
  return `Closes ${formatDate(isoString)}`;
}

// ─── Status Badge ─────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:      { label: 'Pending',      bg: 'bg-surface-container-high',  text: 'text-on-surface-variant' },
  under_review: { label: 'Under Review', bg: 'bg-secondary-container',     text: 'text-on-secondary-container' },
  interview:    { label: 'Interview',    bg: 'bg-primary',                 text: 'text-on-primary' },
  accepted:     { label: 'Accepted',     bg: 'bg-green-100',               text: 'text-green-700' },
  rejected:     { label: 'Rejected',     bg: 'bg-error-container',         text: 'text-error' },
  withdrawn:    { label: 'Withdrawn',    bg: 'bg-surface-container-high',  text: 'text-outline' },
};

function statusBadge(status) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-surface-container-high', text: 'text-outline' };
  return `<span class="${cfg.bg} ${cfg.text} px-2 py-1 rounded-full text-xs font-semibold">${cfg.label}</span>`;
}

// ─── Work Type Badge ──────────────────────────────────────────

function workTypeBadge(workType) {
  const labels = { onsite: 'On-site', remote: 'Remote', hybrid: 'Hybrid' };
  return labels[workType] || workType;
}

// ─── Form Error Display ───────────────────────────────────────

function showFieldError(inputEl, message) {
  clearFieldError(inputEl);
  inputEl.classList.add('border-error', 'focus:border-error', 'focus:ring-error');
  const err = document.createElement('p');
  err.className = 'text-error text-xs mt-1 field-error';
  err.textContent = message;
  inputEl.parentNode.appendChild(err);
}

function clearFieldError(inputEl) {
  inputEl.classList.remove('border-error', 'focus:border-error', 'focus:ring-error');
  inputEl.parentNode.querySelectorAll('.field-error').forEach(e => e.remove());
}

function clearAllErrors(form) {
  form.querySelectorAll('.field-error').forEach(e => e.remove());
  form.querySelectorAll('.border-error').forEach(e => e.classList.remove('border-error'));
}

// ─── Skeleton / Loading Placeholder ──────────────────────────

function skeletonCard() {
  return `
    <div class="bg-surface-container-lowest rounded-xl border border-surface-variant p-6 animate-pulse">
      <div class="flex gap-3 mb-4">
        <div class="w-12 h-12 rounded-lg bg-surface-container-high"></div>
        <div class="flex-1"><div class="h-4 bg-surface-container-high rounded mb-2 w-3/4"></div>
        <div class="h-3 bg-surface-container-high rounded w-1/2"></div></div>
      </div>
      <div class="h-5 bg-surface-container-high rounded mb-2"></div>
      <div class="flex gap-2 mb-3"><div class="h-6 w-24 bg-surface-container-high rounded-full"></div>
      <div class="h-6 w-20 bg-surface-container-high rounded-full"></div></div>
      <div class="h-4 bg-surface-container-high rounded mb-1"></div>
      <div class="h-4 bg-surface-container-high rounded w-5/6"></div>
    </div>`;
}

function showSkeletons(container, count = 6) {
  container.innerHTML = Array(count).fill(skeletonCard()).join('');
}

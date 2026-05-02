/**
 * TrainMe Utility Helpers — React version
 * Ported from js/utils.js
 */

export function formatDate(isoString) {
  if (!isoString) return '—';
  return new Date(isoString).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDeadline(isoString) {
  if (!isoString) return 'Open';
  const d = new Date(isoString);
  const now = new Date();
  const diffDays = Math.ceil((d - now) / 86400000);
  if (diffDays < 0)  return { label: 'Closed',            color: 'text-error' };
  if (diffDays === 0) return { label: 'Closes today!',    color: 'text-error' };
  if (diffDays <= 7) return { label: `Closes in ${diffDays}d`, color: 'text-yellow-600' };
  return { label: `Closes ${formatDate(isoString)}`, color: '' };
}

export const STATUS_CONFIG = {
  pending:      { label: 'Pending',      bg: 'bg-surface-container-high',  text: 'text-on-surface-variant' },
  under_review: { label: 'Under Review', bg: 'bg-secondary-container',     text: 'text-on-secondary-container' },
  interview:    { label: 'Interview',    bg: 'bg-primary',                 text: 'text-on-primary' },
  accepted:     { label: 'Accepted',     bg: 'bg-green-100',               text: 'text-green-700' },
  rejected:     { label: 'Rejected',     bg: 'bg-error-container',         text: 'text-error' },
  withdrawn:    { label: 'Withdrawn',    bg: 'bg-surface-container-high',  text: 'text-outline' },
};

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: 'bg-surface-container-high', text: 'text-outline' };
  return (
    <span className={`${cfg.bg} ${cfg.text} px-2 py-1 rounded-full text-xs font-semibold capitalize`}>
      {cfg.label}
    </span>
  );
}

export function workTypeLabel(workType) {
  const labels = { onsite: 'On-site', remote: 'Remote', hybrid: 'Hybrid' };
  return labels[workType] || workType;
}

export function skeletonCard() {
  return (
    <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-6 animate-pulse">
      <div className="flex gap-3 mb-4">
        <div className="w-12 h-12 rounded-lg bg-surface-container-high" />
        <div className="flex-1">
          <div className="h-4 bg-surface-container-high rounded mb-2 w-3/4" />
          <div className="h-3 bg-surface-container-high rounded w-1/2" />
        </div>
      </div>
      <div className="h-5 bg-surface-container-high rounded mb-2" />
      <div className="flex gap-2 mb-3">
        <div className="h-6 w-24 bg-surface-container-high rounded-full" />
        <div className="h-6 w-20 bg-surface-container-high rounded-full" />
      </div>
      <div className="h-4 bg-surface-container-high rounded mb-1" />
      <div className="h-4 bg-surface-container-high rounded w-5/6" />
    </div>
  );
}

export function Spinner({ className = 'w-5 h-5' }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}

export function checkPasswordStrength(pw) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const colors = ['', '#ba1a1a', '#e65100', '#f9a825', '#006565'];
  const labels = ['', 'Weak — add uppercase, numbers & symbols', 'Fair — try adding special characters', 'Good — almost there!', 'Strong password ✓'];
  const level = pw.length === 0 ? 0 : Math.min(score, 4);
  return { level, color: colors[level], label: labels[level] };
}

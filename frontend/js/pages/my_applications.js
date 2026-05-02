/**
 * my_applications.html — Backend Integration
 */

let _allApps = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth('student')) return;
  await loadApplications();
  setupFilters();
});

async function loadApplications() {
  const tbody = document.getElementById('applicationsTableBody');
  const stats  = { total: 0, review: 0, interview: 0 };

  try {
    _allApps = await Applications.myApplications();
    stats.total    = _allApps.length;
    stats.review   = _allApps.filter(a => a.status === 'under_review').length;
    stats.interview= _allApps.filter(a => a.status === 'interview').length;

    updateStats(stats);
    renderTable(_allApps);
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-on-surface-variant">${err.message}</td></tr>`;
  }
}

function updateStats(stats) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
  set('statTotal',     stats.total);
  set('statReview',    stats.review);
  set('statInterview', stats.interview);
}

function renderTable(apps) {
  const tbody = document.getElementById('applicationsTableBody');
  if (!apps.length) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-12 text-on-surface-variant">
      <span class="material-symbols-outlined text-4xl block mb-2">assignment</span>
      No applications yet. <a href="discovery_feed.html" class="text-primary underline">Browse internships</a>
    </td></tr>`;
    return;
  }

  tbody.innerHTML = apps.map(app => {
    const internship = app.internship || {};
    const company    = internship.company || {};
    const canWithdraw = ['pending', 'under_review'].includes(app.status);

    return `<tr class="hover:bg-surface-container-low transition-colors border-b border-outline-variant last:border-0">
      <td class="py-4 px-4">
        <div class="font-semibold text-on-surface text-sm">${internship.title || '—'}</div>
        <div class="text-xs text-on-surface-variant mt-1">${company.company_name || ''} ${internship.location ? '· ' + internship.location : ''}</div>
      </td>
      <td class="py-4 px-4">${statusBadge(app.status)}</td>
      <td class="py-4 px-4 text-sm text-on-surface-variant hidden md:table-cell">${formatDate(app.applied_at)}</td>
      <td class="py-4 px-4 text-right">
        <div class="flex items-center justify-end gap-2">
          <a href="internship_detail.html?id=${internship.id}" class="text-primary text-xs hover:underline">View</a>
          ${canWithdraw ? `<button onclick="withdrawApp(${app.id}, this)"
            class="text-xs text-error border border-error px-2 py-1 rounded hover:bg-error-container transition-colors">
            Withdraw
          </button>` : ''}
        </div>
      </td>
    </tr>`;
  }).join('');
}

function setupFilters() {
  const tabs = document.querySelectorAll('[data-filter]');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('border-b-2', 'border-primary', 'text-primary'));
      tab.classList.add('border-b-2', 'border-primary', 'text-primary');
      const filter = tab.dataset.filter;
      const filtered = filter === 'all' ? _allApps : _allApps.filter(a => a.status === filter);
      renderTable(filtered);
    });
  });
}

async function withdrawApp(appId, btn) {
  if (!confirm('Withdraw this application?')) return;
  const restore = setLoading(btn, '…');
  try {
    await Applications.withdraw(appId);
    toast('Application withdrawn.', 'info');
    await loadApplications();
  } catch (err) {
    restore();
    toast(err.message || 'Failed to withdraw.', 'error');
  }
}

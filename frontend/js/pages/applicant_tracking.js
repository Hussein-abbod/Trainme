/**
 * applicant_tracking.html — Backend Integration (ATS)
 * Reads ?id= from URL (internship ID), shows applicants, allows status updates.
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth('company')) return;

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { window.location.href = '/dashboard'; return; }

  await loadApplicants(id);

  // Status filter
  document.querySelectorAll('[data-status-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-status-filter]').forEach(b =>
        b.classList.remove('bg-primary', 'text-on-primary'));
      btn.classList.add('bg-primary', 'text-on-primary');
      loadApplicants(id, btn.dataset.statusFilter === 'all' ? null : btn.dataset.statusFilter);
    });
  });
});

async function loadApplicants(internshipId, statusFilter = null) {
  const tbody = document.getElementById('applicantsTableBody');

  try {
    const applicants = await Applications.listApplicants(internshipId, statusFilter);
    updateApplicantCounts(applicants);
    renderApplicants(applicants, internshipId);
  } catch (err) {
    if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="text-center py-8 text-on-surface-variant">${err.message}</td></tr>`;
  }
}

function updateApplicantCounts(applicants) {
  const counts = { total: applicants.length, under_review: 0, interview: 0, accepted: 0 };
  applicants.forEach(a => { if (counts[a.status] !== undefined) counts[a.status]++; });
  const set = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
  set('countTotal',    counts.total);
  set('countReview',   counts.under_review);
  set('countInterview',counts.interview);
  set('countAccepted', counts.accepted);
}

function renderApplicants(applicants, internshipId) {
  const tbody = document.getElementById('applicantsTableBody');
  if (!applicants.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center py-10 text-on-surface-variant">No applicants match this filter.</td></tr>`;
    return;
  }

  tbody.innerHTML = applicants.map(app => {
    const student = app.student || {};
    const user    = student.user || {};
    const skills  = (student.skills || []).slice(0, 3).map(s =>
      `<span class="bg-surface-container-high text-on-surface-variant text-xs px-2 py-0.5 rounded-full">${s}</span>`
    ).join('');

    return `
    <tr class="hover:bg-surface-container-low transition-colors border-b border-outline-variant last:border-0">
      <td class="py-4 px-4">
        <div class="font-semibold text-on-surface text-sm">${user.name || '—'}</div>
        <div class="text-xs text-on-surface-variant mt-1">${student.university || ''}</div>
        ${skills ? `<div class="flex gap-1 flex-wrap mt-1">${skills}</div>` : ''}
      </td>
      <td class="py-4 px-4 text-sm text-on-surface-variant hidden md:table-cell">${formatDate(app.applied_at)}</td>
      <td class="py-4 px-4">${statusBadge(app.status)}</td>
      <td class="py-4 px-4 hidden md:table-cell">
        <div class="mt-2 flex items-center justify-between">
          ${student.cv_url ? `<a href="${getMediaUrl(student.cv_url)}" target="_blank" class="text-primary hover:underline text-xs flex items-center gap-1"><span class="material-symbols-outlined text-[14px]">description</span>CV</a>` : ''}
          <div class="flex gap-2">
          ${student.linkedin ? `<a href="${student.linkedin}" target="_blank" class="text-primary hover:underline text-xs flex items-center gap-1 ml-2"><span class="material-symbols-outlined text-[14px]">link</span>LinkedIn</a>` : ''}
          ${student.github ? `<a href="${student.github}" target="_blank" class="text-primary hover:underline text-xs flex items-center gap-1 ml-2"><span class="material-symbols-outlined text-[14px]">code</span>GitHub</a>` : ''}
          </div>
        </div>
      </td>
      <td class="py-4 px-4 text-right">
        <select onchange="updateStatus(${app.id}, this, ${internshipId})"
                class="text-xs border border-outline-variant rounded-lg px-2 py-1 bg-surface-container-lowest text-on-surface focus:border-primary outline-none">
          ${['pending','under_review','interview','accepted','rejected'].map(s =>
            `<option value="${s}" ${app.status === s ? 'selected' : ''}>${s.replace('_',' ')}</option>`
          ).join('')}
        </select>
      </td>
    </tr>`;
  }).join('');
}

async function updateStatus(appId, selectEl, internshipId) {
  const newStatus = selectEl.value;
  const original  = selectEl.dataset.prev || selectEl.value;
  selectEl.dataset.prev = newStatus;

  try {
    await Applications.updateStatus(appId, { status: newStatus });
    toast('Status updated to ' + newStatus.replace('_', ' '), 'success', 2500);
    // Refresh counts
    const applicants = await Applications.listApplicants(internshipId);
    updateApplicantCounts(applicants);
  } catch (err) {
    selectEl.value = original;
    toast(err.message || 'Failed to update status', 'error');
  }
}

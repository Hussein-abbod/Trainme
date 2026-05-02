/**
 * internship_detail.html — Backend Integration
 * Reads ?id= from URL, fetches internship, handles Apply Now.
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  const id = new URLSearchParams(window.location.search).get('id');
  if (!id) { window.location.href = 'discovery_feed.html'; return; }

  try {
    const [internship, myApps] = await Promise.all([
      Internships.get(id),
      Applications.myApplications().catch(() => []),
    ]);

    renderDetail(internship);

    // Check if already applied
    const existing = myApps.find(a => a.internship_id === internship.id);
    setupApplyButton(internship, existing);

  } catch (err) {
    document.getElementById('detailContainer').innerHTML = `
      <div class="text-center py-24">
        <span class="material-symbols-outlined text-6xl text-outline-variant">error</span>
        <p class="text-lg mt-4 text-on-surface-variant">${err.message}</p>
        <a href="discovery_feed.html" class="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg">Back to Internships</a>
      </div>`;
  }
});

function renderDetail(item) {
  const company = item.company || {};

  // Company logo
  const logoEl = document.getElementById('companyLogo');
  if (logoEl && company.logo_url) {
    logoEl.src = `http://localhost:8000${company.logo_url}`;
  }

  // Text fields
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || '—'; };
  const setHTML = (id, val) => { const el = document.getElementById(id); if (el) el.innerHTML = val || ''; };

  set('internshipTitle',    item.title);
  set('companyName',        company.company_name);
  set('internshipLocation', item.location);
  set('internshipDuration', item.duration);
  set('internshipWorkType', workTypeBadge(item.work_type));
  set('internshipStipend',  item.stipend || 'Not specified');
  set('internshipDescription', item.description);
  setHTML('internshipDeadline', formatDeadline(item.deadline));
  set('internshipStartDate', formatDate(item.start_date));
  set('applicantCount',     (item.applicant_count || 0) + ' applicants');
  set('companyIndustry',    company.industry);
  set('companyEmployees',   company.employee_count);

  const websiteEl = document.getElementById('companyWebsite');
  if (websiteEl && company.website) {
    websiteEl.href = company.website;
    websiteEl.textContent = company.website.replace(/^https?:\/\//, '');
  }

  // Skills tags
  const skillsEl = document.getElementById('skillsTags');
  if (skillsEl && item.skills?.length) {
    skillsEl.innerHTML = item.skills.map(s =>
      `<span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-sm font-medium">${s}</span>`
    ).join('');
  }

  document.title = `${item.title} — TrainMe`;
}

function setupApplyButton(internship, existingApplication) {
  const btn         = document.getElementById('applyBtn');
  const statusEl    = document.getElementById('applicationStatus');
  if (!btn) return;

  if (existingApplication) {
    btn.disabled = true;
    btn.textContent = 'Already Applied';
    btn.classList.replace('bg-primary', 'bg-surface-container-high');
    btn.classList.replace('text-on-primary', 'text-on-surface-variant');
    if (statusEl) {
      statusEl.innerHTML = 'Status: ' + statusBadge(existingApplication.status);
      statusEl.classList.remove('hidden');
    }
    return;
  }

  // Role check — only students can apply
  if (AuthState.getRole() !== 'student') {
    btn.disabled = true;
    btn.textContent = 'Companies cannot apply';
    return;
  }

  btn.addEventListener('click', async () => {
    const coverInput = document.getElementById('coverLetter');
    const restore = setLoading(btn, 'Submitting…');
    try {
      await Applications.apply({
        internship_id: internship.id,
        cover_letter: coverInput?.value || null,
      });
      toast('Application submitted successfully!', 'success');
      btn.disabled = true;
      btn.textContent = 'Application Submitted';
      btn.classList.replace('bg-primary', 'bg-green-600');
      if (statusEl) { statusEl.innerHTML = 'Status: ' + statusBadge('pending'); statusEl.classList.remove('hidden'); }
    } catch (err) {
      restore();
      toast(err.message || 'Failed to submit application.', 'error');
    }
  });
}

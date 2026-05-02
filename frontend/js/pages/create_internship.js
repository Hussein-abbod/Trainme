/**
 * create_internship.html — Backend Integration
 * Supports both POST (new) and PUT (edit via ?edit=ID)
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth('company')) return;

  const editId = new URLSearchParams(window.location.search).get('edit');
  if (editId) {
    // Load existing data for editing
    try {
      const internship = await Internships.get(editId);
      populateForm(internship);
      const header = document.getElementById('pageTitle');
      if (header) header.textContent = 'Edit Internship';
    } catch (err) {
      toast('Failed to load internship: ' + err.message, 'error');
    }
  }

  const form = document.getElementById('createInternshipForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearAllErrors(form);

    const skills = getSkills();
    const payload = {
      title:       document.getElementById('jobTitle')?.value.trim(),
      department:  document.getElementById('department')?.value || null,
      description: document.getElementById('jobDescription')?.value.trim() || null,
      location:    document.getElementById('location')?.value.trim() || null,
      duration:    document.getElementById('duration')?.value || null,
      work_type:   document.getElementById('workArrangement')?.value || 'onsite',
      stipend:     document.getElementById('stipend')?.value.trim() || null,
      deadline:    document.getElementById('deadline')?.value || null,
      start_date:  document.getElementById('startDate')?.value || null,
      status:      document.getElementById('saveDraft')?.dataset.draft === 'true' ? 'draft' : 'active',
      skills,
    };

    if (!payload.title) {
      showFieldError(document.getElementById('jobTitle'), 'Job title is required.');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const restore = setLoading(btn, editId ? 'Saving…' : 'Publishing…');

    try {
      if (editId) {
        await Internships.update(editId, payload);
        toast('Internship updated!', 'success');
      } else {
        await Internships.create(payload);
        toast('Internship published successfully!', 'success');
      }
      setTimeout(() => { window.location.href = 'company_dashboard.html'; }, 800);
    } catch (err) {
      restore();
      toast(err.message || 'Failed to save internship.', 'error');
    }
  });

  // Draft button
  const draftBtn = document.getElementById('saveDraft');
  draftBtn?.addEventListener('click', () => {
    draftBtn.dataset.draft = 'true';
    form.requestSubmit();
  });

  // Skills input
  const addSkillBtn  = document.getElementById('addSkillBtn');
  const skillInput   = document.getElementById('skillInput');
  addSkillBtn?.addEventListener('click', addSkillTag);
  skillInput?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSkillTag(); }});
});

function populateForm(item) {
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  set('jobTitle',        item.title);
  set('department',      item.department);
  set('jobDescription',  item.description);
  set('location',        item.location);
  set('duration',        item.duration);
  set('workArrangement', item.work_type);
  set('stipend',         item.stipend);
  if (item.deadline) set('deadline', item.deadline.slice(0, 10));
  if (item.start_date) set('startDate', item.start_date.slice(0, 10));

  const container = document.getElementById('skillsTags');
  if (container && item.skills?.length) {
    container.innerHTML = item.skills.map(s => skillTag(s)).join('');
  }
}

function skillTag(s) {
  return `<span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
    ${s}
    <button type="button" onclick="this.parentElement.remove()" class="ml-1 opacity-60 hover:opacity-100">
      <span class="material-symbols-outlined text-[14px]">close</span>
    </button>
  </span>`;
}

function addSkillTag() {
  const input     = document.getElementById('skillInput');
  const container = document.getElementById('skillsTags');
  const val = input?.value.trim();
  if (!val || !container) return;
  container.insertAdjacentHTML('beforeend', skillTag(val));
  input.value = '';
}

function getSkills() {
  const container = document.getElementById('skillsTags');
  if (!container) return [];
  return [...container.querySelectorAll('span[class*="bg-secondary"]')]
    .map(el => el.childNodes[0]?.textContent?.trim())
    .filter(Boolean);
}

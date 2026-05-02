/**
 * student_profile.html — Backend Integration
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth('student')) return;
  await loadProfile();
  setupFormHandlers();
  setupCVUpload();
});

async function loadProfile() {
  try {
    const profile = await Students.getMyProfile();
    populateProfile(profile);
  } catch (err) {
    toast('Failed to load profile: ' + err.message, 'error');
  }
}

function populateProfile(profile) {
  const user = profile.user || {};
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.value = val || ''; };
  const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val || ''; };

  setText('profileName',  user.name);
  setText('profileEmail', user.email);
  setText('profileUniversity', profile.university);

  set('inputName',        user.name);
  set('inputEmail',       user.email);
  set('inputUniversity',  profile.university);
  set('inputMajor',       profile.major);
  set('inputYear',        profile.year_of_study);
  set('inputCgpa',        profile.cgpa);
  set('inputBio',         profile.bio);
  set('inputLinkedin',    profile.linkedin);
  set('inputGithub',      profile.github);
  set('inputPortfolio',   profile.portfolio);

  // Skills tags
  const skillsContainer = document.getElementById('skillsTags');
  if (skillsContainer && profile.skills?.length) {
    skillsContainer.innerHTML = profile.skills.map(s =>
      `<span class="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
        ${s}
        <button onclick="removeSkill(this, '${s}')" class="ml-1 text-on-secondary-container/60 hover:text-on-secondary-container">
          <span class="material-symbols-outlined text-[14px]">close</span>
        </button>
      </span>`
    ).join('');
  }

  // CV link
  const cvLink = document.getElementById('cv-link');
  if (profile.cv_url) {
    if (cvLink) { cvLink.href = getMediaUrl(profile.cv_url); cvLink.classList.remove('hidden'); }
  } else {
    if (cvLink) { cvLink.classList.add('hidden'); }
  }

  // Completeness bar
  updateCompleteness(profile);
}

function updateCompleteness(profile) {
  const fields = [profile.bio, profile.major, profile.university, profile.cv_url,
                  profile.linkedin, profile.github, profile.skills?.length];
  const filled = fields.filter(Boolean).length;
  const pct = Math.round((filled / fields.length) * 100);
  const bar = document.getElementById('completenessBar');
  const label = document.getElementById('completenessLabel');
  if (bar)   bar.style.width = pct + '%';
  if (label) label.textContent = pct + '% complete';
}

function setupFormHandlers() {
  const form = document.getElementById('profileForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const restore = setLoading(btn, 'Saving…');

    const skillsEl = document.getElementById('skillsTags');
    const currentSkills = skillsEl
      ? [...skillsEl.querySelectorAll('span[class*="bg-secondary"]')].map(el => el.textContent.trim().replace(/\s*close\s*$/, '').trim())
      : [];

    const payload = {
      university:    document.getElementById('inputUniversity')?.value.trim() || null,
      major:         document.getElementById('inputMajor')?.value.trim() || null,
      year_of_study: parseInt(document.getElementById('inputYear')?.value) || null,
      cgpa:          parseFloat(document.getElementById('inputCgpa')?.value) || null,
      bio:           document.getElementById('inputBio')?.value.trim() || null,
      linkedin:      document.getElementById('inputLinkedin')?.value.trim() || null,
      github:        document.getElementById('inputGithub')?.value.trim() || null,
      portfolio:     document.getElementById('inputPortfolio')?.value.trim() || null,
      skills:        currentSkills,
    };

    try {
      await Students.updateMyProfile(payload);
      toast('Profile updated successfully!', 'success');
      restore();
      await loadProfile();
    } catch (err) {
      restore();
      toast(err.message || 'Failed to update profile.', 'error');
    }
  });

  // Add skill button
  const addSkillBtn   = document.getElementById('addSkillBtn');
  const skillInput    = document.getElementById('skillInput');
  if (addSkillBtn && skillInput) {
    addSkillBtn.addEventListener('click', addSkill);
    skillInput.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } });
  }
}

function addSkill() {
  const input = document.getElementById('skillInput');
  const val   = input?.value.trim();
  if (!val) return;

  const container = document.getElementById('skillsTags');
  if (!container) return;

  const tag = document.createElement('span');
  tag.className = 'bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1';
  tag.innerHTML = `${val} <button onclick="removeSkill(this, '${val}')" class="ml-1 text-on-secondary-container/60 hover:text-on-secondary-container"><span class="material-symbols-outlined text-[14px]">close</span></button>`;
  container.appendChild(tag);
  input.value = '';
}

function removeSkill(btn) {
  btn.closest('span').remove();
}

function setupCVUpload() {
  const input = document.getElementById('cvInput');
  if (!input) return;

  input.addEventListener('change', async () => {
    const file = input.files[0];
    if (!file) return;
    const restore = setLoading(document.getElementById('cvUploadBtn') || input, 'Uploading…');
    try {
      await Students.uploadCV(file);
      toast('CV uploaded successfully!', 'success');
      await loadProfile();
    } catch (err) {
      toast(err.message || 'Upload failed.', 'error');
    } finally {
      restore();
    }
  });
}

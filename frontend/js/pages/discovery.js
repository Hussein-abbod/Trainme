/**
 * discovery_feed.html — Backend Integration
 * Fetches live internships, handles search/filter, bookmarks.
 */

let allInternships = [];
let bookmarkedIds  = new Set();
let currentSkip    = 0;
const PAGE_SIZE    = 9;

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;

  // Load bookmarked IDs so we can reflect saved state
  loadBookmarks();

  // Initial load
  await loadInternships(true);

  // Search + filter listeners (debounced)
  const searchInput   = document.getElementById('searchInput');
  const locationSel   = document.getElementById('locationFilter');
  const industrySel   = document.getElementById('industryFilter');
  const loadMoreBtn   = document.getElementById('loadMoreBtn');

  let debounceTimer;
  const debouncedLoad = () => { clearTimeout(debounceTimer); debounceTimer = setTimeout(() => loadInternships(true), 400); };

  searchInput?.addEventListener('input', debouncedLoad);
  locationSel?.addEventListener('change', () => loadInternships(true));
  industrySel?.addEventListener('change', () => loadInternships(true));
  loadMoreBtn?.addEventListener('click', () => loadInternships(false));
});

async function loadBookmarks() {
  try {
    const bmarks = await Bookmarks.list();
    bookmarkedIds = new Set(bmarks.map(b => b.internship_id));
  } catch { /* silent — user may not be student */ }
}

async function loadInternships(reset = true) {
  if (reset) currentSkip = 0;

  const params = {
    skip:  currentSkip,
    limit: PAGE_SIZE,
  };
  const searchInput = document.getElementById('searchInput');
  const locationSel = document.getElementById('locationFilter');
  const industrySel = document.getElementById('industryFilter');

  if (searchInput?.value.trim())  params.search   = searchInput.value.trim();
  if (locationSel?.value)         params.location  = locationSel.value;
  if (industrySel?.value)         params.industry  = industrySel.value;

  const grid      = document.getElementById('internshipGrid');
  const loadMore  = document.getElementById('loadMoreSection');
  const empty     = document.getElementById('emptyState');

  if (reset) {
    showSkeletons(grid, 6);
    if (loadMore) loadMore.classList.add('hidden');
    if (empty)    empty.classList.add('hidden');
  }

  try {
    const internships = await Internships.list(params);
    if (reset) grid.innerHTML = '';

    if (internships.length === 0 && currentSkip === 0) {
      grid.innerHTML = '';
      if (empty) { empty.classList.remove('hidden'); empty.classList.add('flex'); }
      if (loadMore) loadMore.classList.add('hidden');
      return;
    }

    internships.forEach(item => grid.insertAdjacentHTML('beforeend', internshipCard(item)));
    currentSkip += internships.length;

    // Show/hide Load More
    if (loadMore) {
      loadMore.classList.toggle('hidden', internships.length < PAGE_SIZE);
    }

  } catch (err) {
    grid.innerHTML = `<div class="col-span-full text-center py-16 text-on-surface-variant">
      <span class="material-symbols-outlined text-5xl mb-4 block">wifi_off</span>
      <p class="text-lg font-semibold">Could not load internships</p>
      <p class="text-sm mt-1">${err.message}</p>
      <button onclick="loadInternships(true)" class="mt-4 px-4 py-2 bg-primary text-white rounded-lg text-sm">Retry</button>
    </div>`;
  }
}

function internshipCard(item) {
  const isBookmarked = bookmarkedIds.has(item.id);
  const skills = (item.skills || []).slice(0, 3).map(s =>
    `<span class="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-xs">${s}</span>`
  ).join('');

  return `
  <article class="bg-surface-container-lowest rounded-xl border border-surface-variant p-6 flex flex-col gap-4 hover:border-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200">
    <div class="flex justify-between items-start">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center border border-surface-variant overflow-hidden">
          ${item.company?.logo_url
            ? `<img src="http://localhost:8000${item.company.logo_url}" alt="${item.company?.company_name} logo" class="w-full h-full object-cover">`
            : `<span class="material-symbols-outlined text-outline">business</span>`}
        </div>
        <div>
          <h3 class="font-label-md text-label-md text-on-surface">${item.company?.company_name || 'Company'}</h3>
          <p class="font-label-sm text-label-sm text-on-surface-variant">${item.company?.industry || ''}</p>
        </div>
      </div>
      <button onclick="toggleBookmark(${item.id}, this)" aria-label="save internship"
              class="text-on-surface-variant hover:text-primary transition-colors">
        <span class="material-symbols-outlined"
              style="font-variation-settings: 'FILL' ${isBookmarked ? 1 : 0}">
          ${isBookmarked ? 'bookmark' : 'bookmark_border'}
        </span>
      </button>
    </div>

    <div>
      <h2 class="font-h3 text-h3 text-on-surface mb-1">${item.title}</h2>
      <div class="flex flex-wrap gap-1 mb-3">
        ${item.location ? `<span class="bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full font-label-sm text-label-sm inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">location_on</span>${item.location}</span>` : ''}
        ${item.duration ? `<span class="bg-surface-container-high text-on-surface px-2 py-1 rounded-full font-label-sm text-label-sm inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">schedule</span>${item.duration}</span>` : ''}
        ${item.stipend ? `<span class="bg-primary/10 text-primary px-2 py-1 rounded-full font-label-sm text-label-sm inline-flex items-center gap-1">
          <span class="material-symbols-outlined text-[14px]">payments</span>${item.stipend}</span>` : ''}
      </div>
      ${skills ? `<div class="flex flex-wrap gap-1 mb-2">${skills}</div>` : ''}
      <p class="font-body-md text-body-md text-on-surface-variant line-clamp-2 text-sm">${item.description || ''}</p>
    </div>

    <div class="mt-auto pt-3 border-t border-surface-variant flex items-center justify-between">
      <span class="text-xs text-on-surface-variant">${item.applicant_count || 0} applicants</span>
      <a href="/internship?id=${item.id}"
         class="px-4 py-2 border-2 border-primary text-primary rounded-lg font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors">
        View Details
      </a>
    </div>
  </article>`;
}

async function toggleBookmark(internshipId, btn) {
  const icon = btn.querySelector('.material-symbols-outlined');
  const isCurrentlyBookmarked = bookmarkedIds.has(internshipId);

  try {
    if (isCurrentlyBookmarked) {
      await Bookmarks.remove(internshipId);
      bookmarkedIds.delete(internshipId);
      icon.textContent = 'bookmark_border';
      icon.style.fontVariationSettings = "'FILL' 0";
      toast('Removed from saved', 'info', 2000);
    } else {
      await Bookmarks.add(internshipId);
      bookmarkedIds.add(internshipId);
      icon.textContent = 'bookmark';
      icon.style.fontVariationSettings = "'FILL' 1";
      toast('Saved to bookmarks', 'success', 2000);
    }
  } catch (err) {
    toast(err.message || 'Failed to update bookmark', 'error');
  }
}

function clearFilters() {
  document.getElementById('searchInput').value = '';
  document.getElementById('locationFilter').selectedIndex = 0;
  document.getElementById('industryFilter').selectedIndex = 0;
  loadInternships(true);
}

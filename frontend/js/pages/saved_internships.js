/**
 * saved_internships.html — Backend Integration
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth('student')) return;

  const grid = document.getElementById('savedGrid');
  const empty = document.getElementById('emptyState');

  try {
    const bookmarks = await Bookmarks.list();
    if (!bookmarks.length) {
      if (grid)  grid.innerHTML = '';
      if (empty) { empty.classList.remove('hidden'); empty.classList.add('flex'); }
      return;
    }

    grid.innerHTML = bookmarks.map(bm => {
      const item    = bm.internship || {};
      const company = item.company  || {};
      return `
      <article class="bg-surface-container-lowest rounded-xl border border-surface-variant p-6 flex flex-col gap-4 hover:border-primary hover:shadow-md transition-all duration-200">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 bg-white rounded-md border flex items-center justify-center shrink-0 overflow-hidden">
              ${company.logo_url
                ? `<img src="${getMediaUrl(company.logo_url)}" alt="${company.company_name}" class="w-full h-full object-cover">`
                : `<span class="material-symbols-outlined text-gray-400">business</span>`
              }
            </div>
            <div>
              <h3 class="font-label-md text-label-md text-on-surface">${company.company_name || 'Company'}</h3>
              <p class="font-label-sm text-label-sm text-on-surface-variant">${company.industry || ''}</p>
            </div>
          </div>
          <button onclick="removeBookmark(${bm.internship_id}, this)" class="text-on-surface-variant hover:text-error transition-colors" title="Remove bookmark">
            <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1">bookmark</span>
          </button>
        </div>
        <div>
          <h2 class="font-h3 text-h3 text-on-surface mb-1">${item.title || ''}</h2>
          <div class="flex flex-wrap gap-1 mb-2">
            ${item.location ? `<span class="bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full text-xs inline-flex items-center gap-1"><span class="material-symbols-outlined text-[13px]">location_on</span>${item.location}</span>` : ''}
            ${item.duration ? `<span class="bg-surface-container-high text-on-surface px-2 py-1 rounded-full text-xs inline-flex items-center gap-1"><span class="material-symbols-outlined text-[13px]">schedule</span>${item.duration}</span>` : ''}
            ${item.stipend  ? `<span class="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs inline-flex items-center gap-1"><span class="material-symbols-outlined text-[13px]">payments</span>${item.stipend}</span>` : ''}
          </div>
          <p class="text-sm text-on-surface-variant line-clamp-2">${item.description || ''}</p>
        </div>
        <div class="mt-auto pt-3 border-t border-surface-variant">
          <a href="/internship?id=${bm.internship_id}" class="block w-full text-center px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-surface-tint transition-colors">View Details</a>
        </div>
      </article>`;
    }).join('');

  } catch (err) {
    if (grid) grid.innerHTML = `<div class="col-span-full text-center py-16 text-on-surface-variant">${err.message}</div>`;
  }
});

async function removeBookmark(internshipId, btn) {
  try {
    await Bookmarks.remove(internshipId);
    btn.closest('article').remove();
    toast('Bookmark removed.', 'info');
  } catch (err) {
    toast(err.message, 'error');
  }
}

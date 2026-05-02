/**
 * company_dashboard.html — Backend Integration
 */

document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth('company')) return;
  await Promise.all([loadMetrics(), loadListings()]);
});

async function loadMetrics() {
  try {
    const metrics = await Dashboard.company();
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };
    set('statActiveListings', metrics.active_listings);
    set('statTotalApplicants', metrics.total_applicants);
    set('statPendingReviews', metrics.pending_reviews);
  } catch (err) {
    toast('Could not load dashboard metrics: ' + err.message, 'error');
  }
}

async function loadListings() {
  const tbody = document.getElementById('listingsTableBody');
  if (!tbody) return;

  try {
    const listings = await Internships.myListings();

    if (!listings.length) {
      tbody.innerHTML = `<tr><td colspan="4" class="text-center py-10 text-on-surface-variant">
        No listings yet. <a href="/post-internship" class="text-primary underline">Post your first internship</a>
      </td></tr>`;
      return;
    }

    tbody.innerHTML = listings.map(item => `
      <tr class="hover:bg-surface-container-low transition-colors border-b border-outline-variant last:border-0">
        <td class="py-4 px-4">
          <div class="font-semibold text-on-surface text-sm">${item.title}</div>
          <div class="text-xs text-on-surface-variant mt-1 flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px]">location_on</span>${item.location || 'Remote'}
          </div>
        </td>
        <td class="py-4 px-4 text-sm text-on-surface-variant hidden md:table-cell">${formatDate(item.created_at)}</td>
        <td class="py-4 px-4 text-center">
          <span class="inline-flex items-center justify-center w-8 h-8 rounded-full bg-tertiary-fixed text-on-tertiary-fixed text-sm font-semibold">
            ${item.applicant_count || 0}
          </span>
        </td>
        <td class="py-4 px-4 text-right">
          <div class="flex items-center justify-end gap-2">
            <a href="/post-internship?edit=${item.id}"
               class="p-1 text-outline hover:text-primary transition-colors" title="Edit">
              <span class="material-symbols-outlined text-[20px]">edit</span>
            </a>
            <button onclick="toggleListing(${item.id}, '${item.status}', this)" title="Toggle Active/Closed"
                    class="relative inline-flex items-center cursor-pointer mx-1">
              <span class="w-9 h-5 rounded-full flex items-center transition-colors duration-200 ${item.status === 'active' ? 'bg-primary' : 'bg-surface-dim'}">
                <span class="w-4 h-4 bg-white rounded-full shadow transform transition-transform duration-200 ml-0.5 ${item.status === 'active' ? 'translate-x-4' : ''}"></span>
              </span>
            </button>
            <a href="/applicants?id=${item.id}"
               class="border border-primary-container text-primary-container hover:bg-tertiary-fixed px-3 py-1 rounded-lg text-xs transition-colors hidden md:inline-flex items-center gap-1">
              View Applicants
            </a>
          </div>
        </td>
      </tr>
    `).join('');

  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center py-8 text-on-surface-variant">${err.message}</td></tr>`;
  }
}

async function toggleListing(id, currentStatus, btn) {
  const newStatus = currentStatus === 'active' ? 'closed' : 'active';
  try {
    await Internships.update(id, { status: newStatus });
    toast(`Listing ${newStatus === 'active' ? 'activated' : 'closed'}.`, 'info');
    await loadListings();
    await loadMetrics();
  } catch (err) {
    toast(err.message || 'Failed to update listing.', 'error');
  }
}

/**
 * notifications.html — Backend Integration
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (!requireAuth()) return;
  await loadNotifications();

  document.getElementById('markAllBtn')?.addEventListener('click', async () => {
    await Notifications.markAllRead();
    toast('All notifications marked as read.', 'info');
    await loadNotifications();
    updateNotificationBadge();
  });
});

async function loadNotifications() {
  const list = document.getElementById('notificationsList');
  const empty = document.getElementById('emptyNotifications');
  if (!list) return;

  try {
    const notifications = await Notifications.list();
    if (!notifications.length) {
      list.innerHTML = '';
      if (empty) { empty.classList.remove('hidden'); }
      return;
    }
    if (empty) empty.classList.add('hidden');

    const icons = {
      application_received: 'person_add',
      status_changed:       'update',
      message_received:     'chat_bubble',
      internship_deadline:  'schedule',
      system:               'notifications',
    };

    list.innerHTML = notifications.map(n => `
      <div onclick="markRead(${n.id}, this)"
           class="flex gap-4 p-4 rounded-xl border ${n.is_read ? 'border-outline-variant bg-surface-container-lowest' : 'border-primary/30 bg-primary/5'} cursor-pointer hover:border-primary transition-all">
        <div class="w-10 h-10 rounded-full ${n.is_read ? 'bg-surface-container-high' : 'bg-primary/10'} flex items-center justify-center flex-shrink-0">
          <span class="material-symbols-outlined ${n.is_read ? 'text-outline' : 'text-primary'} text-[20px]">${icons[n.type] || 'notifications'}</span>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex justify-between items-start gap-2">
            <p class="font-semibold text-on-surface text-sm">${n.title}</p>
            ${!n.is_read ? '<span class="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5"></span>' : ''}
          </div>
          <p class="text-sm text-on-surface-variant mt-0.5">${n.message}</p>
          <p class="text-xs text-outline mt-1">${formatDate(n.created_at)}</p>
        </div>
      </div>
    `).join('');

  } catch (err) {
    list.innerHTML = `<div class="text-center py-8 text-on-surface-variant">${err.message}</div>`;
  }
}

async function markRead(id, el) {
  try {
    await Notifications.markRead(id);
    el.classList.remove('border-primary/30', 'bg-primary/5');
    el.classList.add('border-outline-variant', 'bg-surface-container-lowest');
    el.querySelector('.bg-primary\\/10')?.classList.replace('bg-primary/10', 'bg-surface-container-high');
    el.querySelector('.text-primary')?.classList.replace('text-primary', 'text-outline');
    el.querySelector('.rounded-full.bg-primary')?.remove();
    updateNotificationBadge();
  } catch { /* silent */ }
}

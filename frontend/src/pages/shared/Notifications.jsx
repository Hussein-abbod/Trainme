import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar.jsx';
import CompanyNavbar from '../../components/CompanyNavbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Notifications as NotificationsAPI } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, Spinner } from '../../utils/helpers.jsx';
import { apiCache } from '../../api/client.js';

/** Map backend NotificationType → Material Symbol icon name */
const TYPE_ICONS = {
  application_received: 'person_add',
  status_changed:       'update',
  message_received:     'chat_bubble',
  internship_deadline:  'event',
  system:               'info',
};

function getIcon(type) {
  return TYPE_ICONS[type] || 'notifications';
}

export default function Notifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await NotificationsAPI.list();
      setNotifications(data);
    } catch {
      toast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  /** Bust the unread-count cache so the navbar badge refreshes instantly */
  function clearUnreadCache() {
    const token = sessionStorage.getItem('tm_token');
    const key = `GET:/notifications/unread-count:${token}`;
    if (apiCache) apiCache.delete(key);
  }

  async function markAllRead() {
    try {
      await NotificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      clearUnreadCache();
    } catch {
      toast('Failed to mark as read', 'error');
    }
  }

  async function markRead(id) {
    try {
      await NotificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      clearUnreadCache();
    } catch { /* silent */ }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      {user?.role === 'company' ? <CompanyNavbar /> : <Navbar />}

      <main className="flex-grow max-w-[800px] w-full mx-auto px-gutter py-lg pb-24">
        {/* Header */}
        <div className="flex justify-between items-center mb-lg border-b border-surface-variant pb-md">
          <div>
            <h1 className="font-h2 text-on-surface">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-on-surface-variant mt-xs">
                {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
          {notifications.some(n => !n.is_read) && (
            <button
              onClick={markAllRead}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">done_all</span>
              Mark all as read
            </button>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center py-xl">
            <Spinner className="w-8 h-8 text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-xl text-on-surface-variant flex flex-col items-center gap-sm">
            <span className="material-symbols-outlined text-[56px] text-outline">notifications_off</span>
            <p className="font-body-md">You have no notifications yet.</p>
            <p className="text-sm">We'll notify you when something happens.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            {notifications.map(n => (
              <div
                key={n.id}
                onClick={() => !n.is_read && markRead(n.id)}
                className={`p-md rounded-xl border flex gap-md transition-all ${
                  n.is_read
                    ? 'bg-surface border-surface-variant opacity-75'
                    : 'bg-surface-container-lowest border-primary/30 shadow-sm cursor-pointer hover:shadow-md hover:border-primary/50'
                }`}
              >
                {/* Icon */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                  n.is_read ? 'bg-surface-variant text-outline' : 'bg-primary/10 text-primary'
                }`}>
                  <span className="material-symbols-outlined text-[20px]">{getIcon(n.type)}</span>
                </div>

                {/* Body */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-sm">
                    <h3 className={`font-label-md mb-xs leading-snug ${
                      n.is_read ? 'text-on-surface-variant' : 'text-on-surface font-semibold'
                    }`}>
                      {n.title}
                    </h3>
                    {/* Unread dot */}
                    {!n.is_read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-sm text-on-surface-variant mb-xs leading-relaxed">{n.message}</p>
                  <p className="text-xs text-outline">{formatDate(n.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

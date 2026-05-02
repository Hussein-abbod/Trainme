import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar.jsx';
import CompanyNavbar from '../../components/CompanyNavbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Notifications as NotificationsAPI } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatDate, Spinner } from '../../utils/helpers.jsx';

export default function Notifications() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    try {
      const data = await NotificationsAPI.list();
      setNotifications(data);
    } catch (err) {
      toast('Failed to load notifications', 'error');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function markAllRead() {
    try {
      await NotificationsAPI.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      toast('Failed to mark read', 'error');
    }
  }

  async function markRead(id) {
    try {
      await NotificationsAPI.markRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) { }
  }

  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      {user?.role === 'company' ? <CompanyNavbar /> : <Navbar />}
      <main className="flex-grow max-w-[800px] w-full mx-auto px-gutter py-lg pb-24">
        <div className="flex justify-between items-center mb-lg border-b border-surface-variant pb-md">
          <h1 className="font-h2 text-on-surface">Notifications</h1>
          <button onClick={markAllRead} className="text-primary text-sm font-medium hover:underline">Mark all as read</button>
        </div>

        {loading ? (
          <div className="flex justify-center"><Spinner className="w-8 h-8 text-primary" /></div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-xl text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-xs">notifications_off</span>
            <p>You have no notifications.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            {notifications.map(n => (
              <div key={n.id} onClick={() => !n.is_read && markRead(n.id)} className={`p-md rounded-xl border ${n.is_read ? 'bg-surface border-surface-variant opacity-80' : 'bg-surface-container-lowest border-primary/30 shadow-sm cursor-pointer'} flex gap-md transition-colors`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${n.is_read ? 'bg-surface-variant text-outline' : 'bg-primary/10 text-primary'}`}>
                  <span className="material-symbols-outlined">{n.type === 'application_update' ? 'update' : 'notifications'}</span>
                </div>
                <div>
                  <h3 className={`font-label-md mb-xs ${n.is_read ? 'text-on-surface-variant' : 'text-on-surface font-semibold'}`}>{n.title}</h3>
                  <p className="text-sm text-on-surface-variant mb-xs">{n.message}</p>
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

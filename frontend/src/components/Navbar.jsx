import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { Notifications } from '../api/index.js';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    Notifications.unreadCount().then(d => setUnreadCount(d?.unread_count || 0)).catch(() => {});
  }, []);

  const initials = user?.name?.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() || 'U';

  const navLinks = [
    { to: '/discover',     label: 'Internships' },
    { to: '/companies',    label: 'Companies'   },
    { to: '/saved',        label: 'Saved'        },
    { to: '/applications', label: 'Applications' },
    { to: '/messages',     label: 'Messages'     },
  ];

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <nav className="bg-surface-container-lowest font-fustat text-sm font-medium antialiased border-b border-surface-variant shadow-sm sticky top-0 z-50 w-full">
      <div className="flex items-center justify-between h-16 w-full px-6 max-w-7xl mx-auto">
        {/* Left: Logo + Links */}
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px] filled-icon">school</span>
            </div>
            <Link to="/" className="text-2xl font-black tracking-tight text-primary">TrainMe</Link>
          </div>
          <div className="hidden md:flex gap-6">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`py-4 font-label-md text-label-md transition-colors ${
                  location.pathname === link.to
                    ? 'text-primary border-b-2 border-primary -mb-[2px]'
                    : 'text-on-surface-variant hover:text-primary'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right: Notifications + Avatar */}
        <div className="flex items-center gap-4">
          <Link to="/notifications" className="relative text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-all">
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          <div className="relative">
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold cursor-pointer select-none hover:opacity-90 transition-opacity"
            >
              {initials}
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-[calc(100%+8px)] bg-white border border-surface-variant rounded-xl min-w-[200px] shadow-[0_8px_24px_rgba(0,0,0,0.12)] z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-surface-variant">
                    <div className="text-sm font-bold text-on-background">{user?.name}</div>
                    <div className="text-xs text-outline capitalize">{user?.role}</div>
                  </div>
                  <Link
                    to="/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-3 text-on-background text-sm hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
                    Edit Profile
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2.5 px-4 py-3 w-full text-error text-sm hover:bg-error-container transition-colors font-fustat"
                  >
                    <span className="material-symbols-outlined text-[18px]">logout</span>
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 bg-surface-container-lowest/90 backdrop-blur-md border-t border-outline-variant rounded-t-xl shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        {[
          { to: '/discover',     icon: 'search',              label: 'Discover' },
          { to: '/applications', icon: 'assignment_turned_in', label: 'Applied' },
          { to: '/messages',     icon: 'chat_bubble',          label: 'Messages' },
          { to: '/profile',      icon: 'person',               label: 'Profile' },
        ].map(item => (
          <Link
            key={item.to}
            to={item.to}
            className={`flex flex-col items-center justify-center transition-colors ${
              location.pathname === item.to
                ? 'text-primary bg-primary/10 rounded-xl px-3 py-1'
                : 'text-outline hover:text-primary'
            }`}
          >
            <span className="material-symbols-outlined">{item.icon}</span>
            <span className="text-[10px] font-semibold mt-1">{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}

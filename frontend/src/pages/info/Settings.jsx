import { useState } from 'react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showPw1, setShowPw1] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  function handleSave(e) {
    e.preventDefault();
    toast('Settings saved successfully', 'success');
  }

  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-grow max-w-2xl w-full mx-auto px-gutter py-xl pb-24">
        <h1 className="font-h2 text-on-surface mb-xs">Account Settings</h1>
        <p className="text-on-surface-variant mb-lg">Manage your email preferences and security settings.</p>

        <form onSubmit={handleSave} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col gap-lg shadow-sm">
          <div>
            <h3 className="font-h3 text-on-surface mb-md">Notifications</h3>
            <div className="space-y-sm">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant" />
                <span className="text-sm text-on-surface">Email me when my application status changes</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-primary focus:ring-primary border-outline-variant" />
                <span className="text-sm text-on-surface">Email me new internships matching my profile</span>
              </label>
            </div>
          </div>

          <div className="pt-lg border-t border-surface-variant">
            <h3 className="font-h3 text-on-surface mb-md">Security</h3>
            <div className="flex flex-col gap-sm max-w-sm">
              <label className="font-label-md text-on-surface">Change Password</label>
              <div className="relative">
                <input type={showPw1 ? 'text' : 'password'} placeholder="New Password" className="w-full border border-outline-variant rounded-lg px-3 py-2 pr-10 bg-surface focus:ring-1 focus:ring-primary outline-none" />
                <button type="button" onClick={() => setShowPw1(v => !v)} className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-on-surface transition-colors" style={{ fontSize: 20 }}>
                  {showPw1 ? 'visibility' : 'visibility_off'}
                </button>
              </div>
              <div className="relative">
                <input type={showPw2 ? 'text' : 'password'} placeholder="Confirm New Password" className="w-full border border-outline-variant rounded-lg px-3 py-2 pr-10 bg-surface focus:ring-1 focus:ring-primary outline-none" />
                <button type="button" onClick={() => setShowPw2(v => !v)} className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-on-surface transition-colors" style={{ fontSize: 20 }}>
                  {showPw2 ? 'visibility' : 'visibility_off'}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-md border-t border-surface-variant flex justify-end">
            <button type="submit" className="px-6 py-2 bg-primary text-on-primary rounded-lg font-label-md hover:bg-surface-tint">
              Save Settings
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

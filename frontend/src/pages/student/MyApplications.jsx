import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Applications } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { StatusBadge, formatDate, Spinner } from '../../utils/helpers.jsx';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'under_review', label: 'Under Review' },
  { key: 'interview', label: 'Interview' },
  { key: 'accepted', label: 'Accepted' },
];

export default function MyApplications() {
  const { toast } = useToast();
  const [allApps, setAllApps] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  async function loadApplications() {
    try {
      const data = await Applications.myApplications();
      setAllApps(data);
      setFiltered(data);
    } catch (err) {
      toast('Could not load applications: ' + err.message, 'error');
    } finally { setLoading(false); }
  }

  useEffect(() => { loadApplications(); }, []);

  function applyFilter(key) {
    setActiveFilter(key);
    setFiltered(key === 'all' ? allApps : allApps.filter(a => a.status === key));
  }

  async function withdrawApp(appId) {
    if (!confirm('Withdraw this application?')) return;
    try {
      await Applications.withdraw(appId);
      toast('Application withdrawn.', 'info');
      await loadApplications();
      applyFilter(activeFilter);
    } catch (err) {
      toast(err.message || 'Failed to withdraw.', 'error');
    }
  }

  const stats = {
    total: allApps.length,
    review: allApps.filter(a => a.status === 'under_review').length,
    interview: allApps.filter(a => a.status === 'interview').length,
    accepted: allApps.filter(a => a.status === 'accepted').length,
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-[1200px] w-full mx-auto px-gutter py-lg pb-24 md:pb-lg">
        <div className="mb-lg">
          <h1 className="font-h2 text-h2 text-on-surface mb-xs">My Applications</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Track and manage all your internship applications.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-lg">
          {[
            { label: 'Total Applied', value: stats.total, icon: 'assignment', color: 'bg-surface-container' },
            { label: 'Under Review', value: stats.review, icon: 'pending', color: 'bg-secondary-container/40' },
            { label: 'Interview', value: stats.interview, icon: 'event', color: 'bg-primary/10' },
            { label: 'Accepted', value: stats.accepted, icon: 'check_circle', color: 'bg-green-50' },
          ].map(s => (
            <div key={s.label} className={`${s.color} rounded-xl p-md border border-surface-variant`}>
              <div className="flex items-center justify-between mb-xs">
                <span className="font-label-sm text-label-sm text-on-surface-variant">{s.label}</span>
                <span className="material-symbols-outlined text-[20px] text-outline">{s.icon}</span>
              </div>
              <div className="font-h2 text-h2 text-on-surface">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-sm border-b border-outline-variant mb-lg overflow-x-auto">
          {FILTER_TABS.map(tab => (
            <button key={tab.key} onClick={() => applyFilter(tab.key)} className={`pb-3 pt-1 px-1 font-label-md text-label-md whitespace-nowrap transition-colors ${activeFilter === tab.key ? 'border-b-2 border-primary text-primary' : 'text-on-surface-variant hover:text-primary'}`}>
              {tab.label}
              {tab.key !== 'all' && allApps.filter(a => a.status === tab.key).length > 0 && (
                <span className={`ml-xs px-1.5 py-0.5 rounded-full text-[11px] font-bold ${activeFilter === tab.key ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant'}`}>
                  {allApps.filter(a => a.status === tab.key).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-surface-container-lowest rounded-xl border border-surface-variant overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16"><Spinner className="w-8 h-8 text-primary" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl block mb-2">assignment</span>
              No applications yet. <Link to="/discover" className="text-primary underline">Browse internships</Link>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="text-left py-3 px-4 font-label-md text-label-md text-on-surface-variant">Internship</th>
                  <th className="text-left py-3 px-4 font-label-md text-label-md text-on-surface-variant">Status</th>
                  <th className="text-left py-3 px-4 font-label-md text-label-md text-on-surface-variant hidden md:table-cell">Applied</th>
                  <th className="text-right py-3 px-4 font-label-md text-label-md text-on-surface-variant">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(app => {
                  const internship = app.internship || {};
                  const company = internship.company || {};
                  const canWithdraw = ['pending', 'under_review'].includes(app.status);
                  return (
                    <tr key={app.id} className="hover:bg-surface-container-low transition-colors border-b border-outline-variant last:border-0">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-on-surface text-sm">{internship.title || '—'}</div>
                        <div className="text-xs text-on-surface-variant mt-1">{company.company_name || ''} {internship.location ? '· ' + internship.location : ''}</div>
                      </td>
                      <td className="py-4 px-4"><StatusBadge status={app.status} /></td>
                      <td className="py-4 px-4 text-sm text-on-surface-variant hidden md:table-cell">{formatDate(app.applied_at)}</td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link to={`/internship/${internship.id}`} className="text-primary text-xs hover:underline">View</Link>
                          {canWithdraw && (
                            <button onClick={() => withdrawApp(app.id)} className="text-xs text-error border border-error px-2 py-1 rounded hover:bg-error-container transition-colors">Withdraw</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

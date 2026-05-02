import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CompanyNavbar from '../../components/CompanyNavbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Dashboard, Internships, Applications } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { StatusBadge, Spinner, formatDate } from '../../utils/helpers.jsx';

export default function CompanyDashboard() {
  const { toast } = useToast();
  const [stats, setStats] = useState({ total_internships: 0, total_applications: 0, active_internships: 0, recent_applications: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await Dashboard.company();
        setStats(data);
      } catch (err) {
        toast('Failed to load dashboard data', 'error');
      } finally { setLoading(false); }
    }
    load();
  }, []);

  if (loading) return (
    <div className="min-h-screen flex flex-col"><CompanyNavbar />
      <div className="flex-grow flex items-center justify-center"><Spinner className="w-10 h-10 text-primary" /></div>
    </div>
  );

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <CompanyNavbar />
      <main className="flex-grow max-w-[1200px] w-full mx-auto px-gutter py-lg pb-24 md:pb-lg">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-lg gap-sm">
          <div>
            <h1 className="font-h2 text-h2 text-on-surface">Company Dashboard</h1>
            <p className="font-body-md text-on-surface-variant">Overview of your internship postings and applications.</p>
          </div>
          <Link to="/post-internship" className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md flex items-center gap-1 hover:bg-surface-tint shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span> Post Internship
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-lg">
          {[
            { label: 'Total Postings', value: stats.total_internships, icon: 'work', color: 'bg-surface-container' },
            { label: 'Active Postings', value: stats.active_internships, icon: 'campaign', color: 'bg-primary/10 text-primary' },
            { label: 'Total Applicants', value: stats.total_applications, icon: 'groups', color: 'bg-secondary-container/50' },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-lowest rounded-xl border border-surface-variant p-md flex items-center justify-between">
              <div>
                <p className="font-label-md text-on-surface-variant mb-xs">{s.label}</p>
                <p className="font-h1 text-on-surface">{s.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${s.color}`}>
                <span className="material-symbols-outlined text-[24px]">{s.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Applications */}
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden">
          <div className="p-md border-b border-surface-variant flex justify-between items-center">
            <h2 className="font-h3 text-on-surface">Recent Applications</h2>
            <Link to="/applicants" className="text-primary font-label-md hover:underline">View All</Link>
          </div>
          {stats.recent_applications?.length === 0 ? (
            <div className="p-xl text-center text-on-surface-variant">No applications received yet.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-surface-variant">
                  <tr>
                    <th className="p-4 font-label-md text-on-surface-variant">Applicant</th>
                    <th className="p-4 font-label-md text-on-surface-variant">Role</th>
                    <th className="p-4 font-label-md text-on-surface-variant">Date</th>
                    <th className="p-4 font-label-md text-on-surface-variant">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant">
                  {stats.recent_applications.map(app => (
                    <tr key={app.id} className="hover:bg-surface-container-lowest transition-colors">
                      <td className="p-4 font-body-md text-on-surface font-medium">{app.student?.user?.name || 'Unknown'}</td>
                      <td className="p-4 font-body-md text-on-surface-variant">{app.internship?.title || 'Unknown'}</td>
                      <td className="p-4 font-body-md text-on-surface-variant">{formatDate(app.applied_at)}</td>
                      <td className="p-4"><StatusBadge status={app.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { useState, useEffect } from 'react';
import CompanyNavbar from '../../components/CompanyNavbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Internships, Applications } from '../../api/index.js';
import { getMediaUrl } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { StatusBadge, formatDate, Spinner } from '../../utils/helpers.jsx';

export default function ApplicantTracking() {
  const { toast } = useToast();
  const [internships, setInternships] = useState([]);
  const [selectedInternship, setSelectedInternship] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Modal State
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    Internships.myListings().then(data => setInternships(data)).catch(() => {});
  }, []);

  async function loadApplicants() {
    setLoading(true);
    try {
      const internshipId = selectedInternship || (internships.length > 0 ? internships[0].id : null);
      if (!internshipId) { setApplicants([]); return; }
      if (!selectedInternship && internships.length > 0) setSelectedInternship(internshipId);
      const data = await Applications.listApplicants(internshipId, statusFilter);
      setApplicants(data);
    } catch (err) {
      toast('Failed to load applicants', 'error');
    } finally { setLoading(false); }
  }

  useEffect(() => {
    if (internships.length >= 0) loadApplicants();
  }, [internships, selectedInternship, statusFilter]);

  async function updateStatus(appId, newStatus) {
    setUpdatingId(appId);
    try {
      await Applications.updateStatus(appId, { status: newStatus });
      toast('Status updated', 'success');
      setApplicants(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    } catch (err) {
      toast('Failed to update status', 'error');
    } finally { setUpdatingId(null); }
  }

  const selectCls = "w-full sm:w-auto px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-1 focus:ring-primary outline-none font-body-md";

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <CompanyNavbar />
      <main className="flex-grow max-w-[1200px] w-full mx-auto px-gutter py-lg pb-24 md:pb-lg">
        <div className="mb-lg flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h1 className="font-h2 text-h2 text-on-surface">Applicant Tracking</h1>
            <p className="font-body-md text-on-surface-variant">Review and manage candidates for your postings.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-sm w-full md:w-auto">
            <select value={selectedInternship} onChange={e => setSelectedInternship(e.target.value)} className={selectCls}>
              {internships.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
              {internships.length === 0 && <option value="">No Active Postings</option>}
            </select>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className={selectCls}>
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="interview">Interview</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex justify-center p-xl"><Spinner className="w-8 h-8 text-primary" /></div>
          ) : applicants.length === 0 ? (
            <div className="text-center p-xl text-on-surface-variant">No applicants found for this selection.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-surface-variant">
                  <tr>
                    <th className="p-4 font-label-md">Candidate</th>
                    <th className="p-4 font-label-md">Applied Date</th>
                    <th className="p-4 font-label-md">Status</th>
                    <th className="p-4 font-label-md text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-variant">
                  {applicants.map(app => (
                    <tr key={app.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="p-4">
                        <div className="font-medium text-on-surface">{app.student?.user?.name || 'Unknown'}</div>
                        <div className="text-sm text-on-surface-variant">{app.student?.university || 'University not provided'}</div>
                      </td>
                      <td className="p-4 text-sm text-on-surface-variant">{formatDate(app.applied_at)}</td>
                      <td className="p-4"><StatusBadge status={app.status} /></td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-2 items-center">
                          <select
                            value={app.status}
                            onChange={(e) => updateStatus(app.id, e.target.value)}
                            disabled={updatingId === app.id}
                            className="px-2 py-1 bg-surface-container border border-outline-variant rounded text-sm outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="under_review">Reviewing</option>
                            <option value="interview">Interview</option>
                            <option value="accepted">Accept</option>
                            <option value="rejected">Reject</option>
                          </select>
                          <button onClick={() => setSelectedApp(app)} className="px-3 py-1 bg-primary text-on-primary rounded hover:bg-surface-tint text-sm transition-colors">
                            View Profile
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />

      {/* Applicant Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedApp(null)} />
          <div className="relative bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="p-md border-b border-surface-variant flex justify-between items-center bg-surface">
              <h2 className="font-h3 text-on-surface">Applicant Profile</h2>
              <button onClick={() => setSelectedApp(null)} className="material-symbols-outlined text-on-surface-variant hover:text-error">close</button>
            </div>
            <div className="p-md overflow-y-auto space-y-md">
              <div className="flex items-center gap-md">
                <div className="w-16 h-16 bg-surface-variant rounded-full flex items-center justify-center text-2xl font-bold text-on-surface-variant">
                  {selectedApp.student?.user?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-h3">{selectedApp.student?.user?.name}</h3>
                  <p className="text-on-surface-variant">{selectedApp.student?.user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container p-sm rounded-lg">
                  <span className="text-xs text-outline block mb-1">University</span>
                  <span className="font-medium">{selectedApp.student?.university || '—'}</span>
                </div>
                <div className="bg-surface-container p-sm rounded-lg">
                  <span className="text-xs text-outline block mb-1">Major</span>
                  <span className="font-medium">{selectedApp.student?.major || '—'}</span>
                </div>
                <div className="bg-surface-container p-sm rounded-lg">
                  <span className="text-xs text-outline block mb-1">CGPA</span>
                  <span className="font-medium">{selectedApp.student?.cgpa || '—'}</span>
                </div>
                <div className="bg-surface-container p-sm rounded-lg">
                  <span className="text-xs text-outline block mb-1">Year</span>
                  <span className="font-medium">{selectedApp.student?.year_of_study || '—'}</span>
                </div>
              </div>

              {selectedApp.cover_letter && (
                <div>
                  <h4 className="font-label-md mb-xs">Cover Letter</h4>
                  <div className="bg-surface-container-low p-sm rounded-lg text-sm whitespace-pre-wrap border border-surface-variant">
                    {selectedApp.cover_letter}
                  </div>
                </div>
              )}

              {selectedApp.student?.skills?.length > 0 && (
                <div>
                  <h4 className="font-label-md mb-xs">Skills</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedApp.student.skills.map(s => <span key={s} className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded text-xs">{s}</span>)}
                  </div>
                </div>
              )}
            </div>
            <div className="p-md border-t border-surface-variant bg-surface flex justify-end gap-sm">
              {selectedApp.student?.cv_url && (
                <a href={getMediaUrl(selectedApp.student.cv_url)} target="_blank" rel="noreferrer" className="px-4 py-2 border border-primary text-primary rounded-lg font-label-md flex items-center gap-1 hover:bg-primary/5">
                  <span className="material-symbols-outlined text-[18px]">download</span> Download CV
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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

// At the top level state for evaluation
  const [evalForm, setEvalForm] = useState({ rating: 0, company_comment: '', months_completed: '', end_date: '' });
  const [submittingEval, setSubmittingEval] = useState(false);

  // When selectedApp changes, initialize evalForm if accepted
  useEffect(() => {
    if (selectedApp) {
      setEvalForm({
        rating: selectedApp.rating || 0,
        company_comment: selectedApp.company_comment || '',
        months_completed: selectedApp.months_completed || '',
        end_date: selectedApp.end_date ? selectedApp.end_date.split('T')[0] : '',
      });
    }
  }, [selectedApp]);

  async function handleEvaluationSubmit(e) {
    e.preventDefault();
    setSubmittingEval(true);
    try {
      const payload = {
        rating: evalForm.rating ? Number(evalForm.rating) : null,
        company_comment: evalForm.company_comment || null,
        months_completed: evalForm.months_completed ? Number(evalForm.months_completed) : null,
        end_date: evalForm.end_date ? new Date(evalForm.end_date).toISOString() : null,
      };
      await Applications.evaluate(selectedApp.id, payload);
      toast('Evaluation updated successfully', 'success');
      setApplicants(prev => prev.map(a => a.id === selectedApp.id ? { ...a, ...payload } : a));
    } catch (err) {
      toast('Failed to save evaluation', 'error');
    } finally {
      setSubmittingEval(false);
    }
  }

  const StarInput = ({ value, onChange }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(i => (
        <button type="button" key={i} onClick={() => onChange(i)}
          className={`material-symbols-outlined text-[24px] ${i <= value ? 'text-yellow-500 filled-icon' : 'text-outline-variant hover:text-yellow-200'}`}>
          star
        </button>
      ))}
    </div>
  );

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
                            {app.status === 'accepted' ? 'Evaluate / View' : 'View Profile'}
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
          <div className="relative bg-surface-container-lowest rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
            <div className="p-md border-b border-surface-variant flex justify-between items-center bg-surface">
              <h2 className="font-h3 text-on-surface">Applicant Profile</h2>
              <button onClick={() => setSelectedApp(null)} className="material-symbols-outlined text-on-surface-variant hover:text-error transition-colors">close</button>
            </div>
            
            <div className="p-md overflow-y-auto space-y-md">
              <div className="flex items-center gap-md">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-2xl font-bold text-primary">
                  {selectedApp.student?.user?.name?.charAt(0) || '?'}
                </div>
                <div>
                  <h3 className="font-h3">{selectedApp.student?.user?.name}</h3>
                  <p className="text-on-surface-variant">{selectedApp.student?.user?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container p-sm rounded-lg border border-surface-variant">
                  <span className="text-xs text-outline block mb-1">University</span>
                  <span className="font-medium text-sm">{selectedApp.student?.university || '—'}</span>
                </div>
                <div className="bg-surface-container p-sm rounded-lg border border-surface-variant">
                  <span className="text-xs text-outline block mb-1">Student ID</span>
                  <span className="font-medium text-sm">{selectedApp.student?.student_id || '—'}</span>
                </div>
                <div className="bg-surface-container p-sm rounded-lg border border-surface-variant">
                  <span className="text-xs text-outline block mb-1">Major</span>
                  <span className="font-medium text-sm">{selectedApp.student?.major || '—'}</span>
                </div>
                <div className="bg-surface-container p-sm rounded-lg border border-surface-variant">
                  <span className="text-xs text-outline block mb-1">CGPA / Year</span>
                  <span className="font-medium text-sm">{selectedApp.student?.cgpa || '—'} (Yr {selectedApp.student?.year_of_study || '—'})</span>
                </div>
              </div>

              {selectedApp.cover_letter && (
                <div>
                  <h4 className="font-label-md mb-xs flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">description</span> Cover Letter</h4>
                  <div className="bg-surface-container-low p-sm rounded-lg text-sm whitespace-pre-wrap border border-surface-variant text-on-surface-variant italic">
                    "{selectedApp.cover_letter}"
                  </div>
                </div>
              )}

              {selectedApp.student?.skills?.length > 0 && (
                <div>
                  <h4 className="font-label-md mb-xs flex items-center gap-1"><span className="material-symbols-outlined text-[18px]">bolt</span> Skills</h4>
                  <div className="flex gap-2 flex-wrap">
                    {selectedApp.student.skills.map(s => <span key={s} className="px-2 py-1 bg-secondary-container text-on-secondary-container rounded text-xs font-medium border border-secondary-container/50">{s}</span>)}
                  </div>
                </div>
              )}

              {/* Evaluation Section (Only if Accepted) */}
              {selectedApp.status === 'accepted' && (
                <div className="mt-md border-t border-surface-variant pt-md">
                  <div className="bg-surface-container-high rounded-xl p-md border border-primary/20">
                    <h4 className="font-label-lg text-primary mb-xs flex items-center gap-1">
                      <span className="material-symbols-outlined text-[20px]">rate_review</span>
                      Intern Evaluation
                    </h4>
                    <p className="text-xs text-on-surface-variant mb-md">
                      Share feedback on this intern's performance. Their university can view this evaluation to track their progress.
                    </p>
                    <form onSubmit={handleEvaluationSubmit} className="space-y-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
                        <div>
                          <label className="block text-xs font-medium text-on-surface mb-1">Rating (1-5)</label>
                          <StarInput value={evalForm.rating} onChange={(v) => setEvalForm(f => ({ ...f, rating: v }))} />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-on-surface mb-1">Months Completed</label>
                          <input type="number" min="0" max="24" value={evalForm.months_completed} onChange={(e) => setEvalForm(f => ({ ...f, months_completed: e.target.value }))}
                            className="w-full bg-surface border border-outline-variant rounded px-2 py-1 text-sm focus:border-primary outline-none" placeholder="e.g. 3" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-on-surface mb-1">Expected End Date</label>
                        <input type="date" value={evalForm.end_date} onChange={(e) => setEvalForm(f => ({ ...f, end_date: e.target.value }))}
                          className="w-full bg-surface border border-outline-variant rounded px-2 py-1 text-sm focus:border-primary outline-none" />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-on-surface mb-1">Feedback / Comments</label>
                        <textarea rows="3" value={evalForm.company_comment} onChange={(e) => setEvalForm(f => ({ ...f, company_comment: e.target.value }))}
                          className="w-full bg-surface border border-outline-variant rounded px-2 py-1 text-sm focus:border-primary outline-none resize-none" placeholder="Provide feedback on their performance..."></textarea>
                      </div>
                      <div className="flex justify-end pt-2">
                        <button type="submit" disabled={submittingEval}
                          className="px-4 py-1.5 bg-primary text-on-primary rounded font-label-md text-sm hover:bg-surface-tint transition-colors flex items-center gap-1 disabled:opacity-60">
                          {submittingEval ? <Spinner /> : <><span className="material-symbols-outlined text-[16px]">save</span> Save Evaluation</>}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-md border-t border-surface-variant bg-surface flex justify-between items-center gap-sm">
              <span className="text-xs text-outline">Applied on {formatDate(selectedApp.applied_at)}</span>
              {selectedApp.student?.cv_url && (
                <a href={getMediaUrl(selectedApp.student.cv_url)} target="_blank" rel="noreferrer" className="px-4 py-2 border border-primary text-primary rounded-lg font-label-md text-sm flex items-center gap-1 hover:bg-primary/5 transition-colors">
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

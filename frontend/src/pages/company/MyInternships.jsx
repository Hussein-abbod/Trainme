import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import CompanyNavbar from '../../components/CompanyNavbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Internships } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Spinner, formatDate } from '../../utils/helpers.jsx';

const STATUS_CONFIG = {
  active:   { label: 'Active',   cls: 'bg-green-100 text-green-700 border-green-200' },
  draft:    { label: 'Draft',    cls: 'bg-surface-variant text-on-surface-variant border-outline-variant' },
  closed:   { label: 'Closed',  cls: 'bg-amber-100 text-amber-700 border-amber-200' },
  archived: { label: 'Archived', cls: 'bg-red-100 text-red-700 border-red-200' },
};

const WORK_TYPE_ICONS = { onsite: 'apartment', remote: 'home_work', hybrid: 'sync_alt' };

function Skel({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-surface-variant ${className}`} />;
}

export default function MyInternships() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // internship to delete

  async function load() {
    try {
      const data = await Internships.myListings();
      setInternships(data);
    } catch {
      toast('Failed to load internships', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function toggleStatus(internship) {
    const newStatus = internship.status === 'active' ? 'closed' : 'active';
    setTogglingId(internship.id);
    try {
      await Internships.update(internship.id, { status: newStatus });
      setInternships(prev => prev.map(i => i.id === internship.id ? { ...i, status: newStatus } : i));
      toast(`Internship ${newStatus === 'active' ? 'activated' : 'closed'}`, 'success');
    } catch {
      toast('Failed to update status', 'error');
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await Internships.delete(id);
      setInternships(prev => prev.filter(i => i.id !== id));
      toast('Internship deleted', 'success');
    } catch {
      toast('Failed to delete internship', 'error');
    } finally {
      setDeletingId(null);
      setConfirmDelete(null);
    }
  }

  const stats = {
    total:  internships.length,
    active: internships.filter(i => i.status === 'active').length,
    total_applicants: internships.reduce((sum, i) => sum + (i.applicant_count || 0), 0),
  };

  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      <CompanyNavbar />
      <main className="flex-grow max-w-[1200px] w-full mx-auto px-gutter py-lg pb-24 md:pb-lg">

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-lg gap-sm">
          <div>
            <h1 className="font-h2 text-on-surface">My Internship Posts</h1>
            <p className="font-body-md text-on-surface-variant">Manage, edit, and track all your posted internships.</p>
          </div>
          <Link
            to="/post-internship"
            className="bg-primary text-on-primary px-4 py-2 rounded-lg font-label-md flex items-center gap-1 hover:bg-surface-tint shadow-sm transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Post New
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-md mb-lg">
          {[
            { label: 'Total Posts',      value: stats.total,           icon: 'work' },
            { label: 'Active',           value: stats.active,          icon: 'campaign' },
            { label: 'Total Applicants', value: stats.total_applicants, icon: 'groups' },
          ].map(s => (
            <div key={s.label} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-md flex items-center justify-between">
              <div>
                <p className="font-label-md text-on-surface-variant mb-xs">{s.label}</p>
                <div className="font-h2 text-on-surface">
                  {loading ? <Skel className="w-8 h-8" /> : s.value}
                </div>
              </div>
              <span className="material-symbols-outlined text-[28px] text-primary/40">{s.icon}</span>
            </div>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="flex flex-col gap-sm">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-md flex flex-col gap-sm">
                <Skel className="h-5 w-1/3" />
                <Skel className="h-4 w-1/2" />
                <Skel className="h-4 w-1/4" />
              </div>
            ))}
          </div>
        ) : internships.length === 0 ? (
          <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-xl text-center flex flex-col items-center gap-md">
            <span className="material-symbols-outlined text-[56px] text-outline">work_off</span>
            <div>
              <p className="font-h3 text-on-surface mb-xs">No internships posted yet</p>
              <p className="text-on-surface-variant font-body-md">Create your first internship listing to start receiving applications.</p>
            </div>
            <Link
              to="/post-internship"
              className="bg-primary text-on-primary px-6 py-2 rounded-lg font-label-md flex items-center gap-1 hover:bg-surface-tint transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Post Internship
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-sm">
            {internships.map(internship => {
              const sc = STATUS_CONFIG[internship.status] || STATUS_CONFIG.draft;
              const skills = Array.isArray(internship.skills) ? internship.skills : [];
              const isToggling = togglingId === internship.id;
              const isDeleting = deletingId === internship.id;

              return (
                <div
                  key={internship.id}
                  className="bg-surface-container-lowest border border-surface-variant rounded-xl p-md hover:shadow-md transition-shadow"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-md">
                    {/* Main info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-sm mb-xs">
                        <h2 className="font-h3 text-on-surface truncate">{internship.title}</h2>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${sc.cls}`}>
                          {sc.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-x-md gap-y-xs text-sm text-on-surface-variant mb-sm">
                        {internship.location && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">location_on</span>
                            {internship.location}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">{WORK_TYPE_ICONS[internship.work_type] || 'work'}</span>
                          <span className="capitalize">{internship.work_type}</span>
                        </span>
                        {internship.duration && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">schedule</span>
                            {internship.duration}
                          </span>
                        )}
                        {internship.stipend && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">payments</span>
                            {internship.stipend}
                          </span>
                        )}
                        {internship.deadline && (
                          <span className="flex items-center gap-1">
                            <span className="material-symbols-outlined text-[16px]">event</span>
                            Deadline: {formatDate(internship.deadline)}
                          </span>
                        )}
                      </div>

                      {skills.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-sm">
                          {skills.slice(0, 6).map(s => (
                            <span key={s} className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-xs">
                              {s}
                            </span>
                          ))}
                          {skills.length > 6 && (
                            <span className="px-2 py-0.5 bg-surface-variant text-on-surface-variant rounded-full text-xs">
                              +{skills.length - 6} more
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-xs text-outline">
                        Posted {formatDate(internship.created_at)} ·{' '}
                        <span className="font-semibold text-primary">
                          {internship.applicant_count || 0} applicant{internship.applicant_count !== 1 ? 's' : ''}
                        </span>
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-row md:flex-col gap-sm shrink-0 items-start">
                      {/* Edit */}
                      <button
                        onClick={() => navigate(`/post-internship?edit=${internship.id}`)}
                        className="flex items-center gap-1 px-3 py-1.5 border border-outline-variant text-on-surface rounded-lg text-sm hover:bg-surface-container transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Edit
                      </button>

                      {/* Toggle active/closed */}
                      <button
                        onClick={() => toggleStatus(internship)}
                        disabled={isToggling}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm border transition-colors disabled:opacity-50 ${
                          internship.status === 'active'
                            ? 'border-amber-300 text-amber-700 hover:bg-amber-50'
                            : 'border-green-300 text-green-700 hover:bg-green-50'
                        }`}
                      >
                        {isToggling ? (
                          <Spinner className="w-4 h-4" />
                        ) : (
                          <span className="material-symbols-outlined text-[16px]">
                            {internship.status === 'active' ? 'pause_circle' : 'play_circle'}
                          </span>
                        )}
                        {internship.status === 'active' ? 'Close' : 'Activate'}
                      </button>

                      {/* Delete */}
                      <button
                        onClick={() => setConfirmDelete(internship)}
                        disabled={isDeleting}
                        className="flex items-center gap-1 px-3 py-1.5 border border-error/30 text-error rounded-lg text-sm hover:bg-error-container transition-colors disabled:opacity-50"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />

      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setConfirmDelete(null)} />
          <div className="relative bg-surface-container-lowest rounded-2xl shadow-2xl w-full max-w-sm p-lg flex flex-col gap-md">
            <div className="flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-error">warning</span>
              </div>
              <div>
                <h3 className="font-h3 text-on-surface">Delete Internship?</h3>
                <p className="text-sm text-on-surface-variant">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-on-surface-variant bg-surface-container rounded-lg p-sm">
              "<span className="font-semibold text-on-surface">{confirmDelete.title}</span>" and all its applications will be permanently deleted.
            </p>
            <div className="flex gap-sm justify-end">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 border border-outline-variant rounded-lg text-on-surface text-sm hover:bg-surface-container transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete.id)}
                disabled={deletingId === confirmDelete.id}
                className="px-4 py-2 bg-error text-white rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-1"
              >
                {deletingId === confirmDelete.id ? <Spinner className="w-4 h-4" /> : null}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

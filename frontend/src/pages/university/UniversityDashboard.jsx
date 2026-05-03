import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { University, Messages } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Spinner } from '../../utils/helpers.jsx';

// ── Helpers ────────────────────────────────────────────────────────────────

function StarRating({ value }) {
  if (!value) return <span className="text-outline text-xs">No rating</span>;
  const full = Math.floor(value);
  const half = value % 1 >= 0.5;
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`material-symbols-outlined text-[16px] ${i <= full ? 'text-yellow-500 filled-icon' : i === full + 1 && half ? 'text-yellow-400' : 'text-outline'}`}>
          {i <= full ? 'star' : i === full + 1 && half ? 'star_half' : 'star'}
        </span>
      ))}
      <span className="ml-1 text-xs font-semibold text-on-surface">{value.toFixed(1)}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const cfg = {
    accepted:     { bg: 'bg-[#006565]/10 text-[#006565] border-[#006565]/30', icon: 'check_circle' },
    under_review: { bg: 'bg-blue-50 text-blue-700 border-blue-200',            icon: 'pending' },
    interview:    { bg: 'bg-purple-50 text-purple-700 border-purple-200',      icon: 'calendar_month' },
    pending:      { bg: 'bg-amber-50 text-amber-700 border-amber-200',         icon: 'schedule' },
    rejected:     { bg: 'bg-red-50 text-red-700 border-red-200',               icon: 'cancel' },
    withdrawn:    { bg: 'bg-surface-variant text-on-surface-variant border-outline-variant', icon: 'undo' },
  };
  const { bg, icon } = cfg[status] || cfg.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${bg}`}>
      <span className="material-symbols-outlined text-[12px] filled-icon">{icon}</span>
      {status.replace('_', ' ')}
    </span>
  );
}

function ProgressBar({ months, total }) {
  const pct = total ? Math.min(100, Math.round((months / total) * 100)) : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-on-surface-variant">
        <span>{months ?? 0} months completed</span>
        <span>{pct}%</span>
      </div>
      <div className="h-2 bg-surface-variant rounded-full overflow-hidden">
        <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

// ── Student Card ───────────────────────────────────────────────────────────

function StudentCard({ student, onContact }) {
  const [expanded, setExpanded] = useState(false);

  const startDate = student.internship_start_date ? new Date(student.internship_start_date) : null;
  const endDate   = student.internship_end_date   ? new Date(student.internship_end_date)   : null;

  // Calculate total duration in months
  let totalMonths = null;
  if (startDate && endDate) {
    totalMonths = Math.round((endDate - startDate) / (1000 * 60 * 60 * 24 * 30));
  }

  return (
    <div className="bg-surface-container-lowest border border-surface-variant rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
      {/* Header */}
      <div className="p-md flex items-start justify-between gap-md">
        <div className="flex items-start gap-md min-w-0">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-primary text-[24px]">person</span>
          </div>
          <div className="min-w-0">
            <h3 className="font-label-lg text-on-surface truncate">{student.student_name}</h3>
            <p className="text-xs text-on-surface-variant truncate">{student.student_email}</p>
            {student.student_id_number && (
              <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-surface-container-high rounded-full text-xs text-on-surface-variant border border-outline-variant">
                <span className="material-symbols-outlined text-[12px]">badge</span>
                ID: {student.student_id_number}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-xs shrink-0">
          <StatusBadge status={student.application_status} />
          <button onClick={() => setExpanded(v => !v)}
            className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors text-on-surface-variant">
            <span className="material-symbols-outlined text-[20px]">{expanded ? 'expand_less' : 'expand_more'}</span>
          </button>
        </div>
      </div>

      {/* Summary row */}
      <div className="px-md pb-md grid grid-cols-2 md:grid-cols-4 gap-sm">
        <div className="bg-surface-container-high rounded-lg p-sm text-center">
          <p className="text-xs text-on-surface-variant mb-0.5">Major</p>
          <p className="text-sm font-medium text-on-surface truncate">{student.major || '—'}</p>
        </div>
        <div className="bg-surface-container-high rounded-lg p-sm text-center">
          <p className="text-xs text-on-surface-variant mb-0.5">CGPA</p>
          <p className="text-sm font-medium text-on-surface">{student.cgpa ? student.cgpa.toFixed(2) : '—'}</p>
        </div>
        <div className="bg-surface-container-high rounded-lg p-sm text-center">
          <p className="text-xs text-on-surface-variant mb-0.5">Company</p>
          <p className="text-sm font-medium text-on-surface truncate">{student.company_name}</p>
        </div>
        <div className="bg-surface-container-high rounded-lg p-sm text-center">
          <p className="text-xs text-on-surface-variant mb-0.5">Rating</p>
          <div className="flex justify-center"><StarRating value={student.rating} /></div>
        </div>
      </div>

      {/* Progress */}
      {student.months_completed !== null && (
        <div className="px-md pb-md">
          <ProgressBar months={student.months_completed} total={totalMonths} />
        </div>
      )}

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-surface-variant px-md py-md space-y-md animate-in slide-in-from-top-2 duration-200">
          {/* Internship Info */}
          <div>
            <h4 className="font-label-md text-on-surface mb-xs flex items-center gap-1">
              <span className="material-symbols-outlined text-primary text-[18px]">work</span>
              Internship Details
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-xs text-sm">
              <div className="flex items-center gap-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">business</span>
                <span><strong className="text-on-surface">Position:</strong> {student.internship_title}</span>
              </div>
              <div className="flex items-center gap-xs text-on-surface-variant">
                <span className="material-symbols-outlined text-[16px]">apartment</span>
                <span><strong className="text-on-surface">Company:</strong> {student.company_name}</span>
              </div>
              {startDate && (
                <div className="flex items-center gap-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                  <span><strong className="text-on-surface">Started:</strong> {startDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              )}
              {endDate && (
                <div className="flex items-center gap-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[16px]">flag</span>
                  <span><strong className="text-on-surface">Expected End:</strong> {endDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Company Evaluation */}
          {(student.rating || student.company_comment) && (
            <div>
              <h4 className="font-label-md text-on-surface mb-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-primary text-[18px]">rate_review</span>
                Company Evaluation
              </h4>
              {student.rating && (
                <div className="mb-xs">
                  <StarRating value={student.rating} />
                </div>
              )}
              {student.company_comment && (
                <div className="bg-surface-container-high border border-outline-variant rounded-lg p-sm">
                  <p className="text-sm text-on-surface leading-relaxed italic">"{student.company_comment}"</p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-xs pt-xs">
            <button onClick={() => onContact(student)}
              className="flex items-center gap-xs bg-primary text-on-primary font-label-md text-sm py-xs px-md rounded-full hover:bg-surface-tint transition-colors shadow-sm">
              <span className="material-symbols-outlined text-[16px]">mail</span>
              Contact Company
            </button>
            {student.cv_url && (
              <a href={student.cv_url} target="_blank" rel="noreferrer"
                className="flex items-center gap-xs bg-surface-container-high text-on-surface font-label-md text-sm py-xs px-md rounded-full hover:bg-surface-variant transition-colors border border-outline-variant">
                <span className="material-symbols-outlined text-[16px]">description</span>
                View CV
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Contact Modal ──────────────────────────────────────────────────────────

function ContactModal({ student, onClose, onSend }) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const defaultMsg = student
    ? `Dear ${student.company_name} Team,\n\nI am writing regarding our student, ${student.student_name} (ID: ${student.student_id_number || 'N/A'}), who is currently completing an internship with your company for the position of "${student.internship_title}".\n\nWe would appreciate any updates on their progress and performance.\n\nThank you for your support.\n\nBest regards,\nUniversity Internship Coordinator`
    : '';

  useEffect(() => {
    if (student) setMessage(defaultMsg);
  }, [student]);

  async function handleSend() {
    if (!message.trim()) return;
    setSending(true);
    try {
      await onSend(student.company_user_id, message);
      onClose();
    } finally {
      setSending(false);
    }
  }

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-md bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface-container-lowest rounded-2xl shadow-xl w-full max-w-lg border border-surface-variant animate-in slide-in-from-bottom-4 duration-200">
        <div className="flex items-center justify-between p-md border-b border-surface-variant">
          <div>
            <h3 className="font-h3 text-on-surface">Contact Company</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Regarding: <strong>{student.student_name}</strong> at <strong>{student.company_name}</strong></p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-surface-container-high flex items-center justify-center transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant text-[20px]">close</span>
          </button>
        </div>
        <div className="p-md space-y-md">
          <textarea
            rows={8}
            value={message}
            onChange={e => setMessage(e.target.value)}
            className="w-full bg-surface border border-outline-variant rounded-lg px-sm py-sm font-body-md text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors resize-none"
            placeholder="Write your message to the company..."
          />
          <div className="flex gap-xs justify-end">
            <button onClick={onClose} className="px-md py-xs rounded-full border border-outline-variant text-on-surface font-label-md text-sm hover:bg-surface-container-high transition-colors">
              Cancel
            </button>
            <button onClick={handleSend} disabled={sending || !message.trim()}
              className="flex items-center gap-xs px-md py-xs rounded-full bg-primary text-on-primary font-label-md text-sm hover:bg-surface-tint transition-colors disabled:opacity-60">
              {sending ? <Spinner /> : <><span className="material-symbols-outlined text-[16px]">send</span> Send Message</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────

export default function UniversityDashboard() {
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchId, setSearchId]     = useState('');
  const [searchName, setSearchName] = useState('');
  const [contactStudent, setContactStudent] = useState(null);

  const fetchStudents = useCallback(async (params = {}) => {
    try {
      const data = await University.getStudents(params);
      setStudents(data);
    } catch (err) {
      toast('Failed to load students.', 'error');
    }
  }, [toast]);

  useEffect(() => {
    async function init() {
      setLoading(true);
      try {
        const [prof] = await Promise.all([
          University.getMyProfile(),
          fetchStudents(),
        ]);
        setProfile(prof);
      } catch {
        toast('Failed to load dashboard.', 'error');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [fetchStudents, toast]);

  function handleSearch(e) {
    e.preventDefault();
    fetchStudents({
      ...(searchId   ? { search_student_id: searchId }   : {}),
      ...(searchName ? { search_name: searchName }        : {}),
    });
  }

  function clearSearch() {
    setSearchId('');
    setSearchName('');
    fetchStudents();
  }

  async function handleSendMessage(companyUserId, content) {
    try {
      await Messages.send({ receiver_id: companyUserId, content });
      toast('Message sent to company!', 'success');
    } catch {
      toast('Failed to send message.', 'error');
    }
  }

  function handleLogout() {
    logout();
    navigate('/login');
  }

  const stats = {
    total:    students.length,
    active:   students.filter(s => s.application_status === 'accepted').length,
    avgRating: students.filter(s => s.rating).length
      ? (students.filter(s => s.rating).reduce((sum, s) => sum + s.rating, 0) / students.filter(s => s.rating).length).toFixed(1)
      : null,
    avgCgpa: students.filter(s => s.cgpa).length
      ? (students.filter(s => s.cgpa).reduce((sum, s) => sum + s.cgpa, 0) / students.filter(s => s.cgpa).length).toFixed(2)
      : null,
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-md">
        <Spinner />
        <p className="text-on-surface-variant font-body-md">Loading university dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md">
      {/* Top Nav */}
      <header className="sticky top-0 z-40 bg-surface border-b border-surface-variant shadow-sm">
        <div className="max-w-7xl mx-auto px-gutter h-16 flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-[18px] filled-icon">school</span>
            </div>
            <div>
              <span className="font-h3 text-primary tracking-tight">TrainMe</span>
              <span className="ml-2 text-xs font-medium text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full border border-outline-variant">University Portal</span>
            </div>
          </div>
          <div className="flex items-center gap-sm">
            <div className="hidden md:block text-right">
              <p className="font-label-md text-on-surface text-sm">{profile?.uni_name || user?.name}</p>
              <p className="text-xs text-on-surface-variant">@{profile?.email_domain}</p>
            </div>
            <button onClick={handleLogout}
              className="flex items-center gap-xs text-on-surface-variant hover:text-error transition-colors font-label-md text-sm">
              <span className="material-symbols-outlined text-[20px]">logout</span>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-gutter py-lg space-y-lg">
        {/* Page Header */}
        <div>
          <h1 className="font-h2 text-on-surface">Internship Tracking Dashboard</h1>
          <p className="text-on-surface-variant font-body-md mt-xs">
            Monitor your students' internship progress, company ratings, and evaluations.
            Students appear here when they are <strong className="text-primary">accepted</strong> for internships with emails ending in <code className="bg-surface-container-high px-1 rounded text-primary text-xs">@{profile?.email_domain}</code>.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-md">
          {[
            { label: 'Active Interns', value: stats.active, icon: 'group', color: 'text-primary' },
            { label: 'Total Tracked', value: stats.total,  icon: 'people', color: 'text-blue-600' },
            { label: 'Avg Rating',    value: stats.avgRating ? `${stats.avgRating} / 5` : 'N/A', icon: 'star', color: 'text-yellow-500' },
            { label: 'Avg CGPA',      value: stats.avgCgpa ?? 'N/A', icon: 'school', color: 'text-green-600' },
          ].map(({ label, value, icon, color }) => (
            <div key={label} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-md shadow-sm">
              <div className="flex items-center gap-sm mb-xs">
                <span className={`material-symbols-outlined text-[22px] filled-icon ${color}`}>{icon}</span>
                <p className="text-xs text-on-surface-variant">{label}</p>
              </div>
              <p className="font-h2 text-on-surface">{value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-md shadow-sm">
          <h2 className="font-label-lg text-on-surface mb-md flex items-center gap-xs">
            <span className="material-symbols-outlined text-primary text-[20px]">manage_search</span>
            Search Students
          </h2>
          <div className="flex flex-col sm:flex-row gap-sm">
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">badge</span>
              <input
                type="text" value={searchId} onChange={e => setSearchId(e.target.value)}
                placeholder="Search by Student ID (e.g. 1211104001)"
                className="w-full pl-9 pr-sm py-sm bg-surface border border-outline-variant rounded-lg font-body-md text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            <div className="relative flex-1">
              <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline text-[18px]">person_search</span>
              <input
                type="text" value={searchName} onChange={e => setSearchName(e.target.value)}
                placeholder="Search by Student Name"
                className="w-full pl-9 pr-sm py-sm bg-surface border border-outline-variant rounded-lg font-body-md text-sm text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
              />
            </div>
            <div className="flex gap-xs">
              <button type="submit"
                className="flex items-center gap-xs bg-primary text-on-primary font-label-md text-sm py-sm px-md rounded-lg hover:bg-surface-tint transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">search</span>
                Search
              </button>
              {(searchId || searchName) && (
                <button type="button" onClick={clearSearch}
                  className="flex items-center gap-xs bg-surface-container-high text-on-surface font-label-md text-sm py-sm px-md rounded-lg hover:bg-surface-variant transition-colors border border-outline-variant">
                  <span className="material-symbols-outlined text-[18px]">clear</span>
                  Clear
                </button>
              )}
            </div>
          </div>
        </form>

        {/* Students List */}
        <div>
          <div className="flex items-center justify-between mb-md">
            <h2 className="font-label-lg text-on-surface flex items-center gap-xs">
              <span className="material-symbols-outlined text-primary text-[20px]">group</span>
              {searchId || searchName ? 'Search Results' : 'Active Interns'}
              <span className="ml-1 bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">{students.length}</span>
            </h2>
          </div>

          {students.length === 0 ? (
            <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-xl text-center">
              <div className="w-16 h-16 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-md">
                <span className="material-symbols-outlined text-outline text-[32px]">school</span>
              </div>
              <h3 className="font-h3 text-on-surface mb-xs">No students found</h3>
              <p className="text-on-surface-variant font-body-md max-w-md mx-auto">
                {searchId || searchName
                  ? 'No students match your search criteria.'
                  : `No students from ${profile?.email_domain} have accepted internships yet. Students appear here when a company accepts their application.`}
              </p>
            </div>
          ) : (
            <div className="space-y-md">
              {students.map(student => (
                <StudentCard
                  key={`${student.student_user_id}-${student.application_id}`}
                  student={student}
                  onContact={setContactStudent}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Contact Modal */}
      <ContactModal
        student={contactStudent}
        onClose={() => setContactStudent(null)}
        onSend={handleSendMessage}
      />
    </div>
  );
}

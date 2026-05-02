import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Internships, Applications } from '../../api/index.js';
import { getMediaUrl } from '../../api/client.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { StatusBadge, formatDate, formatDeadline, workTypeLabel, Spinner } from '../../utils/helpers.jsx';

export default function InternshipDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { role } = useAuth();
  const { toast } = useToast();
  const [internship, setInternship] = useState(null);
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [item, myApps] = await Promise.all([
          Internships.get(id),
          Applications.myApplications().catch(() => []),
        ]);
        setInternship(item);
        const ex = myApps.find(a => a.internship_id === item.id);
        setExisting(ex || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleApply() {
    setApplying(true);
    try {
      await Applications.apply({ internship_id: internship.id, cover_letter: coverLetter || null });
      toast('Application submitted successfully!', 'success');
      setExisting({ status: 'pending' });
    } catch (err) {
      toast(err.message || 'Failed to submit application.', 'error');
    } finally { setApplying(false); }
  }

  if (loading) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-grow flex items-center justify-center">
        <Spinner className="w-10 h-10 text-primary" />
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-grow flex flex-col items-center justify-center py-24 text-center">
        <span className="material-symbols-outlined text-6xl text-outline-variant">error</span>
        <p className="text-lg mt-4 text-on-surface-variant">{error}</p>
        <Link to="/discover" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg">Back to Internships</Link>
      </div>
    </div>
  );

  const company = internship?.company || {};
  const deadline = formatDeadline(internship?.deadline);
  const isApplied = !!existing;
  const canApply = !isApplied && role === 'student';

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-[1200px] w-full mx-auto px-gutter py-lg pb-24 md:pb-lg">
        <div className="mb-md">
          <button onClick={() => navigate('/discover')} className="flex items-center gap-1 text-on-surface-variant hover:text-primary transition-colors font-label-md text-label-md">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Back to Internships
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-lg">
            <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-lg">
              <div className="flex items-start gap-md mb-md">
                <div className="w-16 h-16 rounded-xl bg-surface-container-low border border-surface-variant flex items-center justify-center overflow-hidden shrink-0">
                  {company.logo_url
                    ? <img src={getMediaUrl(company.logo_url)} alt={company.company_name} className="w-full h-full object-cover" />
                    : <span className="material-symbols-outlined text-outline text-[32px]">domain</span>
                  }
                </div>
                <div className="flex-1">
                  <h1 className="font-h2 text-h2 text-on-surface">{internship.title}</h1>
                  <p className="font-body-md text-body-md text-on-surface-variant">{company.company_name}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-sm mb-lg">
                {internship.location && <span className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full font-label-sm text-label-sm inline-flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span>{internship.location}</span>}
                {internship.duration && <span className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full font-label-sm text-label-sm inline-flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{internship.duration}</span>}
                {internship.work_type && <span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full font-label-sm text-label-sm">{workTypeLabel(internship.work_type)}</span>}
                {internship.stipend && <span className="bg-primary/10 text-primary px-3 py-1 rounded-full font-label-sm text-label-sm inline-flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">payments</span>{internship.stipend}</span>}
              </div>

              {internship.skills?.length > 0 && (
                <div className="mb-lg">
                  <h3 className="font-label-md text-label-md text-on-surface mb-sm">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {internship.skills.map(s => <span key={s} className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-sm font-medium">{s}</span>)}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-h3 text-h3 text-on-surface mb-sm">About this Internship</h3>
                <p className="font-body-md text-body-md text-on-surface-variant whitespace-pre-wrap">{internship.description}</p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-md">
            {/* Apply Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-md sticky top-20">
              <div className="flex items-center justify-between mb-md">
                <div>
                  <p className="font-label-sm text-label-sm text-outline uppercase tracking-widest">Deadline</p>
                  <p className={`font-label-md text-label-md mt-xs ${typeof deadline === 'object' ? deadline.color : ''}`}>
                    {typeof deadline === 'object' ? deadline.label : deadline}
                  </p>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant">{internship.applicant_count || 0} applicants</span>
              </div>

              {isApplied && (
                <div className="mb-md p-sm rounded-lg bg-surface-container flex items-center gap-sm">
                  <StatusBadge status={existing.status} />
                  <span className="text-sm text-on-surface-variant">Your application</span>
                </div>
              )}

              {canApply && (
                <div className="mb-md">
                  <label className="block font-label-md text-label-md text-on-surface mb-xs">Cover Letter <span className="text-outline">(optional)</span></label>
                  <textarea value={coverLetter} onChange={e => setCoverLetter(e.target.value)} rows={4} placeholder="Why are you interested in this internship?" className="w-full border border-outline-variant rounded-lg px-sm py-sm text-sm text-on-surface placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none bg-surface" />
                </div>
              )}

              <button
                onClick={canApply ? handleApply : undefined}
                disabled={!canApply || applying}
                className={`w-full py-sm px-md rounded-lg font-label-md text-label-md flex justify-center items-center gap-2 transition-colors ${
                  isApplied ? 'bg-surface-container-high text-on-surface-variant cursor-default' :
                  role !== 'student' ? 'bg-surface-container-high text-outline cursor-not-allowed' :
                  'bg-primary text-on-primary hover:bg-surface-tint cursor-pointer'
                } disabled:opacity-60`}
              >
                {applying ? <Spinner /> :
                  isApplied ? 'Already Applied' :
                  role !== 'student' ? 'Companies Cannot Apply' :
                  <><span>Apply Now</span><span className="material-symbols-outlined text-[18px]">send</span></>
                }
              </button>
            </div>

            {/* Company Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-surface-variant p-md">
              <h3 className="font-h3 text-h3 text-on-surface mb-md">About {company.company_name}</h3>
              <div className="space-y-sm text-sm text-on-surface-variant">
                {company.industry && <div className="flex items-center gap-sm"><span className="material-symbols-outlined text-[18px] text-outline">category</span>{company.industry}</div>}
                {company.employee_count && <div className="flex items-center gap-sm"><span className="material-symbols-outlined text-[18px] text-outline">group</span>{company.employee_count} employees</div>}
                {company.website && <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center gap-sm text-primary hover:underline"><span className="material-symbols-outlined text-[18px]">language</span>{company.website.replace(/^https?:\/\//, '')}</a>}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Students } from '../../api/index.js';
import { getMediaUrl } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Spinner } from '../../utils/helpers.jsx';

const inputCls = 'w-full border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:border-primary transition-all placeholder:text-outline-variant outline-none';

export default function StudentProfile() {
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [cvModal, setCvModal] = useState(false);
  const [form, setForm] = useState({ university: '', major: '', year_of_study: '', cgpa: '', bio: '', linkedin: '', github: '', portfolio: '' });
  const cvInputRef = useRef(null);

  async function loadProfile() {
    try {
      const data = await Students.getMyProfile();
      setProfile(data);
      setForm({
        university:    data.university    || '',
        major:         data.major         || '',
        year_of_study: data.year_of_study || '',
        cgpa:          data.cgpa          || '',
        bio:           data.bio           || '',
        linkedin:      data.linkedin      || '',
        github:        data.github        || '',
        portfolio:     data.portfolio     || '',
      });
      setSkills(data.skills || []);
    } catch (err) {
      toast('Failed to load profile: ' + err.message, 'error');
    } finally { setLoading(false); }
  }

  useEffect(() => { loadProfile(); }, []);

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }

  function addSkill() {
    const val = skillInput.trim();
    if (!val || skills.includes(val)) return;
    setSkills(prev => [...prev, val]);
    setSkillInput('');
  }

  function removeSkill(s) { setSkills(prev => prev.filter(x => x !== s)); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await Students.updateMyProfile({
        university:    form.university    || null,
        major:         form.major         || null,
        year_of_study: parseInt(form.year_of_study) || null,
        cgpa:          parseFloat(form.cgpa) || null,
        bio:           form.bio           || null,
        linkedin:      form.linkedin      || null,
        github:        form.github        || null,
        portfolio:     form.portfolio     || null,
        skills,
      });
      toast('Profile updated successfully!', 'success');
      await loadProfile();
    } catch (err) {
      toast(err.message || 'Failed to update profile.', 'error');
    } finally { setSaving(false); }
  }

  async function handleCVUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await Students.uploadCV(file);
      toast('CV uploaded successfully!', 'success');
      await loadProfile();
    } catch (err) {
      toast(err.message || 'Upload failed.', 'error');
    } finally { setUploading(false); }
  }

  const completeness = () => {
    if (!profile) return 0;
    const fields = [form.bio, form.major, form.university, profile.cv_url, form.linkedin, form.github, skills.length > 0];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const pct = completeness();
  const cvUrl = profile?.cv_url ? getMediaUrl(profile.cv_url) : null;
  const user = profile?.user || {};

  if (loading) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-grow flex items-center justify-center"><Spinner className="w-10 h-10 text-primary" /></div>
    </div>
  );

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased pb-20 md:pb-0">
      <Navbar />
      <main className="flex-grow w-full max-w-container-max mx-auto px-4 md:px-gutter py-md md:py-lg flex flex-col items-center">
        <div className="w-full max-w-3xl flex flex-col gap-md">
          <div>
            <h1 className="font-h2 text-h2 text-on-background">Profile Management</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Complete your profile to increase your chances of landing an internship.</p>
          </div>

          {/* Header Card */}
          <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant flex flex-col sm:flex-row items-center sm:items-start gap-md">
            <div className="relative">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden bg-surface-variant border-2 border-surface-container-lowest shadow-sm flex items-center justify-center">
                <span className="material-symbols-outlined text-outline text-[48px]">person</span>
              </div>
              <button className="absolute bottom-0 right-0 bg-primary text-on-primary rounded-full w-8 h-8 flex items-center justify-center hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm border-2 border-surface-container-lowest">
                <span className="material-symbols-outlined text-sm">photo_camera</span>
              </button>
            </div>
            <div className="flex flex-col text-center sm:text-left mt-sm sm:mt-0">
              <h2 className="font-h3 text-h3 text-on-background">{user.name || 'Student'}</h2>
              <p className="font-body-md text-body-md text-on-surface-variant">{user.email}</p>
              <p className="font-label-md text-label-md text-primary mt-xs">{profile?.university || 'University not set'}</p>
            </div>
          </div>

          {/* Completeness */}
          <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant">
            <div className="flex justify-between items-end mb-sm">
              <span className="font-label-md text-label-md text-on-surface-variant">Profile Completeness</span>
              <span className="font-h3 text-h3 text-primary">{pct}%</span>
            </div>
            <div className="w-full bg-surface-variant rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">Add your resume and portfolio links to reach 100%.</p>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-md">
            {/* About Me */}
            <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant">
              <div className="flex justify-between items-center mb-sm">
                <h3 className="font-label-md text-label-md text-on-background flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px] filled-icon">person</span> About Me
                </h3>
                <span className="font-label-sm text-label-sm text-on-surface-variant">{form.bio.length}/500</span>
              </div>
              <textarea value={form.bio} onChange={set('bio')} maxLength={500} rows={4} className={`${inputCls} resize-none`} placeholder="Tell employers about yourself — your interests, goals, and what makes you a great intern..." />
            </div>

            {/* Education */}
            <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant">
              <h3 className="font-label-md text-label-md text-on-background flex items-center gap-2 mb-sm">
                <span className="material-symbols-outlined text-primary text-[20px] filled-icon">school</span> Education
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Degree Programme</label>
                  <input type="text" value={form.major} onChange={set('major')} placeholder="e.g. Bachelor of Computer Science" className={inputCls} />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">University</label>
                  <input type="text" value={form.university} onChange={set('university')} placeholder="e.g. Universiti Malaya" className={inputCls} />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Graduation Year</label>
                  <input type="number" value={form.year_of_study} onChange={set('year_of_study')} min="2020" max="2035" placeholder="e.g. 2027" className={inputCls} />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface-variant">Current CGPA</label>
                  <input type="text" value={form.cgpa} onChange={set('cgpa')} placeholder="e.g. 3.50" className={inputCls} />
                </div>
              </div>
            </div>

            {/* Bento: CV + Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              {/* CV Upload */}
              <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant flex flex-col">
                <h3 className="font-label-md text-label-md text-on-background mb-sm">Resume / CV</h3>
                <input type="file" accept=".pdf" ref={cvInputRef} onChange={handleCVUpload} className="hidden" />
                <div
                  onClick={() => cvInputRef.current?.click()}
                  className="flex-grow border-2 border-dashed border-outline-variant rounded-lg flex flex-col items-center justify-center p-md bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer text-center group"
                >
                  {uploading
                    ? <Spinner className="w-8 h-8 text-primary" />
                    : <><span className="material-symbols-outlined text-4xl text-outline mb-sm group-hover:text-primary transition-colors">upload_file</span>
                        <p className="font-label-md text-label-md text-on-background">Upload your CV</p>
                        <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">(PDF only, max 5MB)</p>
                      </>
                  }
                </div>
                {cvUrl && (
                  <button type="button" onClick={() => setCvModal(true)} className="mt-sm inline-flex items-center gap-2 px-3 py-2 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:opacity-90 transition-opacity">
                    <span className="material-symbols-outlined text-[16px]">description</span> Preview CV
                  </button>
                )}
              </div>

              {/* Links */}
              <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant flex flex-col gap-sm">
                <h3 className="font-label-md text-label-md text-on-background mb-xs">Professional Links</h3>
                {[
                  { field: 'linkedin', icon: 'link', placeholder: 'https://linkedin.com/in/username' },
                  { field: 'github', icon: 'code', placeholder: 'https://github.com/username' },
                  { field: 'portfolio', icon: 'language', placeholder: 'https://yourportfolio.com' },
                ].map(({ field, icon, placeholder }) => (
                  <div key={field} className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant capitalize">{field}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="material-symbols-outlined text-outline text-sm">{icon}</span>
                      </div>
                      <input type="url" value={form[field]} onChange={set(field)} placeholder={placeholder} className={`${inputCls} pl-10`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div className="bg-surface-container-lowest rounded-xl p-md border border-outline-variant flex flex-col gap-sm">
              <div>
                <h3 className="font-label-md text-label-md text-on-background">Skills</h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant mt-xs">Add skills to help employers find you.</p>
              </div>
              <div className="flex flex-wrap gap-2 mb-xs min-h-[32px]">
                {skills.map(s => (
                  <span key={s} className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                    {s}
                    <button type="button" onClick={() => removeSkill(s)} className="ml-1 text-on-secondary-container/60 hover:text-on-secondary-container">
                      <span className="material-symbols-outlined text-[14px]">close</span>
                    </button>
                  </span>
                ))}
              </div>
              <div className="relative mt-xs flex gap-xs">
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
                  placeholder="Add a skill... (e.g. React, Data Analysis)"
                  className={`${inputCls} flex-1`}
                />
                <button type="button" onClick={addSkill} className="px-3 py-2 bg-primary text-on-primary rounded-lg font-label-sm text-label-sm hover:bg-surface-tint transition-colors whitespace-nowrap">Add</button>
              </div>
            </div>

            {/* Save */}
            <div className="flex justify-end pt-sm border-t border-surface-container-highest">
              <button type="submit" disabled={saving} className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-2 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-60 flex items-center gap-2">
                {saving ? <Spinner /> : null}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />

      {/* CV Modal */}
      {cvModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCvModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[90vw] max-w-4xl h-[90vh] flex flex-col overflow-hidden z-10">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">description</span>
                <span className="font-label-md text-label-md text-on-background">Your CV</span>
              </div>
              <div className="flex items-center gap-2">
                <a href={cvUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 px-3 py-1.5 bg-surface-container rounded-lg text-on-surface-variant font-label-sm text-label-sm hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span> Open in new tab
                </a>
                <button onClick={() => setCvModal(false)} className="p-1.5 rounded-full hover:bg-surface-container-low transition-colors">
                  <span className="material-symbols-outlined text-on-surface-variant">close</span>
                </button>
              </div>
            </div>
            <iframe src={cvUrl} className="flex-1 w-full border-0" title="CV Preview" />
          </div>
        </div>
      )}
    </div>
  );
}

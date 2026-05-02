import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CompanyNavbar from '../../components/CompanyNavbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Internships } from '../../api/index.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Spinner } from '../../utils/helpers.jsx';

export default function CreateInternship() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  // For Edit Mode
  const editId = new URLSearchParams(location.search).get('edit');

  const [form, setForm] = useState({ title: '', location: '', stipend: '', duration: '', work_type: 'onsite', deadline: '', description: '' });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editId) {
      Internships.get(editId)
        .then(data => {
          setForm({
            title: data.title || '',
            location: data.location || '',
            stipend: data.stipend || '',
            duration: data.duration || '',
            work_type: data.work_type || 'onsite',
            deadline: data.deadline ? data.deadline.substring(0, 10) : '',
            description: data.description || '',
          });
          setSkills(data.skills || []);
        })
        .catch(() => toast('Failed to load internship details', 'error'))
        .finally(() => setLoading(false));
    }
  }, [editId]);

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }

  function addSkill() {
    const val = skillInput.trim();
    if (!val || skills.includes(val)) return;
    setSkills(prev => [...prev, val]);
    setSkillInput('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, deadline: form.deadline ? new Date(form.deadline).toISOString() : null, skills };
    try {
      if (editId) await Internships.update(editId, payload);
      else await Internships.create(payload);
      toast(editId ? 'Internship updated!' : 'Internship posted successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      toast(err.message || 'Failed to save internship', 'error');
    } finally { setSaving(false); }
  }

  const inputCls = "w-full border border-outline-variant rounded-lg px-3 py-2 font-body-md text-on-surface bg-surface-container-lowest focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-colors";

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner className="w-10 h-10 text-primary" /></div>;

  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      <CompanyNavbar />
      <main className="flex-grow max-w-3xl w-full mx-auto px-gutter py-lg pb-24">
        <h1 className="font-h2 text-on-surface mb-xs">{editId ? 'Edit Internship' : 'Post New Internship'}</h1>
        <p className="font-body-md text-on-surface-variant mb-lg">Fill in the details below to attract top talent.</p>

        <form onSubmit={handleSubmit} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col gap-md shadow-sm">
          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Job Title</label>
            <input required value={form.title} onChange={set('title')} placeholder="e.g. Software Engineering Intern" className={inputCls} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-on-surface">Location</label>
              <input value={form.location} onChange={set('location')} placeholder="e.g. Kuala Lumpur" className={inputCls} />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-on-surface">Work Type</label>
              <select value={form.work_type} onChange={set('work_type')} className={inputCls}>
                <option value="onsite">On-site</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-on-surface">Stipend (RM)</label>
              <input value={form.stipend} onChange={set('stipend')} placeholder="e.g. RM 1,000 / month" className={inputCls} />
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-on-surface">Duration</label>
              <input value={form.duration} onChange={set('duration')} placeholder="e.g. 3 Months" className={inputCls} />
            </div>
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Application Deadline</label>
            <input type="date" value={form.deadline} onChange={set('deadline')} className={inputCls} />
          </div>

          <div className="flex flex-col gap-xs">
            <label className="font-label-md text-on-surface">Description & Requirements</label>
            <textarea required value={form.description} onChange={set('description')} rows={6} placeholder="Describe the role, responsibilities, and what you are looking for..." className={`${inputCls} resize-none`} />
          </div>

          <div className="flex flex-col gap-sm">
            <label className="font-label-md text-on-surface">Required Skills</label>
            <div className="flex flex-wrap gap-2">
              {skills.map(s => (
                <span key={s} className="px-3 py-1 bg-secondary-container text-on-secondary-container rounded-full text-sm flex items-center gap-1">
                  {s} <button type="button" onClick={() => setSkills(prev => prev.filter(x => x !== s))} className="material-symbols-outlined text-[14px] hover:text-error">close</button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} placeholder="e.g. React, Python" className={inputCls} />
              <button type="button" onClick={addSkill} className="px-4 py-2 bg-surface-container border border-outline-variant rounded-lg font-label-md hover:bg-surface-container-high transition-colors">Add</button>
            </div>
          </div>

          <div className="mt-md pt-md border-t border-surface-variant flex justify-end gap-3">
            <button type="button" onClick={() => navigate('/dashboard')} className="px-6 py-2 border border-outline text-on-surface rounded-lg hover:bg-surface-container">Cancel</button>
            <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-on-primary rounded-lg flex items-center gap-2 hover:bg-surface-tint shadow-sm disabled:opacity-60">
              {saving ? <Spinner /> : null} {editId ? 'Save Changes' : 'Post Internship'}
            </button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}

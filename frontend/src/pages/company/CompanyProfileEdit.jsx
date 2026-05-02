import { useState, useEffect, useRef } from 'react';
import CompanyNavbar from '../../components/CompanyNavbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Companies } from '../../api/index.js';
import { getMediaUrl } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Spinner } from '../../utils/helpers.jsx';

export default function CompanyProfileEdit() {
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [form, setForm] = useState({ company_name: '', industry: '', description: '', website: '', employee_count: '', location: '' });
  const logoInputRef = useRef(null);

  async function load() {
    try {
      const data = await Companies.getMyCompany();
      setProfile(data);
      setForm({
        company_name: data.company_name || '',
        industry: data.industry || '',
        description: data.description || '',
        website: data.website || '',
        employee_count: data.employee_count || '',
        location: data.location || ''
      });
    } catch (err) {
      toast('Failed to load profile', 'error');
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await Companies.updateMyCompany(form);
      toast('Company profile updated', 'success');
      await load();
    } catch (err) {
      toast('Update failed', 'error');
    } finally { setSaving(false); }
  }

  async function handleLogoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await Companies.uploadLogo(file);
      toast('Logo uploaded', 'success');
      await load();
    } catch (err) {
      toast('Logo upload failed', 'error');
    } finally { setUploading(false); }
  }

  const inputCls = "w-full border border-outline-variant rounded-lg px-3 py-2 text-on-surface bg-surface-container-lowest focus:ring-1 focus:ring-primary outline-none transition-colors font-body-md";

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Spinner className="w-10 h-10 text-primary" /></div>;

  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      <CompanyNavbar />
      <main className="flex-grow max-w-3xl w-full mx-auto px-gutter py-lg pb-24">
        <h1 className="font-h2 text-on-surface mb-xs">Company Profile</h1>
        <p className="font-body-md text-on-surface-variant mb-lg">Manage your public company page.</p>

        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl p-lg flex flex-col gap-md shadow-sm">
          {/* Logo Section */}
          <div className="flex items-center gap-md pb-md border-b border-surface-variant">
            <div className="w-24 h-24 rounded-xl border border-surface-variant bg-surface-container flex items-center justify-center overflow-hidden">
              {uploading ? <Spinner className="text-primary" /> : profile?.logo_url ? <img src={getMediaUrl(profile.logo_url)} alt="Logo" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-4xl text-outline">domain</span>}
            </div>
            <div>
              <h3 className="font-h3 text-on-surface mb-1">Company Logo</h3>
              <p className="text-sm text-on-surface-variant mb-3">Square image recommended.</p>
              <input type="file" accept="image/*" ref={logoInputRef} onChange={handleLogoUpload} className="hidden" />
              <button onClick={() => logoInputRef.current?.click()} disabled={uploading} className="px-4 py-2 border border-primary text-primary rounded-lg font-label-md hover:bg-primary/5 transition-colors">
                Upload Logo
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="flex flex-col gap-md">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-on-surface">Company Name</label>
                <input required value={form.company_name} onChange={set('company_name')} className={inputCls} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-on-surface">Industry</label>
                <input value={form.industry} onChange={set('industry')} className={inputCls} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-on-surface">Website</label>
                <input type="url" value={form.website} onChange={set('website')} placeholder="https://" className={inputCls} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-on-surface">Company Size</label>
                <input value={form.employee_count} onChange={set('employee_count')} placeholder="e.g. 50-200" className={inputCls} />
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-on-surface">Headquarters Location</label>
              <input value={form.location} onChange={set('location')} className={inputCls} />
            </div>

            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-on-surface">About Company</label>
              <textarea value={form.description} onChange={set('description')} rows={5} className={`${inputCls} resize-none`} placeholder="Describe your company culture, mission, and what interns can expect..." />
            </div>

            <div className="flex justify-end pt-md">
              <button type="submit" disabled={saving} className="px-6 py-2 bg-primary text-on-primary rounded-lg flex items-center gap-2 hover:bg-surface-tint shadow-sm disabled:opacity-60">
                {saving ? <Spinner /> : null} Save Profile
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

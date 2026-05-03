import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Auth } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { checkPasswordStrength, Spinner } from '../../utils/helpers.jsx';

export default function UniversityRegister() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [form, setForm] = useState({
    contactName: '', uni_name: '', email_domain: '', email: '',
    website: '', address: '', password: '', confirmPassword: '', terms: false,
  });
  const [errors, setErrors] = useState({});
  const [pwStrength, setPwStrength] = useState({ level: 0, label: '' });

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }
  function onPwChange(e) { set('password')(e); setPwStrength(checkPasswordStrength(e.target.value)); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    if (form.password !== form.confirmPassword) { setErrors({ confirmPassword: 'Passwords do not match.' }); return; }
    if (form.password.length < 8) { setErrors({ password: 'Password must be at least 8 characters.' }); return; }

    // Validate domain format
    const domain = form.email_domain.trim().toLowerCase();
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(domain)) {
      setErrors({ email_domain: 'Enter a valid email domain (e.g. student.mmu.edu.my)' });
      return;
    }

    setLoading(true);
    try {
      const data = await Auth.registerUniversity({
        name: form.contactName,
        email: form.email,
        password: form.password,
        uni_name: form.uni_name,
        email_domain: domain,
        website: form.website || null,
        address: form.address || null,
      });
      login(data);
      toast('University registered! Welcome to TrainMe.', 'success');
      setTimeout(() => navigate('/university/dashboard'), 800);
    } catch (err) {
      toast(err.message || 'Registration failed. Please try again.', 'error');
      if (err.message?.toLowerCase().includes('email')) setErrors({ email: 'This email is already registered.' });
      if (err.message?.toLowerCase().includes('domain')) setErrors({ email_domain: 'This email domain is already registered.' });
    } finally { setLoading(false); }
  }

  const inputCls = (f) => `w-full bg-surface border ${errors[f] ? 'border-error' : 'border-outline-variant'} rounded-md px-sm py-[12px] font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`;
  const strengthColors = ['', '#ba1a1a', '#e65100', '#f9a825', '#006565'];

  return (
    <div className="bg-background min-h-screen text-on-surface antialiased">
      <main className="flex min-h-screen w-full">
        {/* Left Branding */}
        <div className="hidden lg:flex w-1/2 relative bg-primary flex-col justify-between p-xl overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-multiply"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=800&auto=format')" }} />
          <div className="relative z-10 flex items-center gap-base">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-primary text-[20px] filled-icon">school</span>
            </div>
            <h1 className="font-h2 text-on-primary font-bold tracking-tighter">TrainMe</h1>
            <span className="font-label-md text-primary-container bg-on-primary px-2 py-1 rounded-sm uppercase tracking-widest text-xs font-bold">University</span>
          </div>
          <div className="relative z-10 max-w-lg mb-xl space-y-lg">
            <h2 className="font-h1 text-on-primary">Track your students' internship journey.</h2>
            <p className="font-body-lg text-on-primary opacity-90 leading-relaxed">Monitor progress, view company ratings, read evaluations, and ensure your students are on the right career path.</p>
            <div className="space-y-md">
              {[
                { icon: 'manage_search', text: 'Search students by ID or name' },
                { icon: 'star', text: 'View company ratings and evaluations' },
                { icon: 'mail', text: 'Contact companies directly about students' },
              ].map(({ icon, text }) => (
                <div key={icon} className="flex items-center gap-sm">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-on-primary text-[18px]">{icon}</span>
                  </div>
                  <p className="font-body-md text-on-primary opacity-90">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-gutter sm:p-lg xl:p-xl bg-surface-container-lowest overflow-y-auto">
          <div className="w-full max-w-[540px] flex flex-col gap-lg py-lg">
            <div className="lg:hidden flex items-center gap-base border-b border-surface-variant pb-md mb-xs">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[18px] filled-icon">school</span>
              </div>
              <h1 className="font-h3 text-primary font-bold tracking-tighter">TrainMe</h1>
            </div>

            <div>
              <h2 className="font-h2 text-on-surface">University Registration</h2>
              <p className="font-body-md text-on-surface-variant mt-xs">Register your institution to monitor and support your students' internship journey.</p>
            </div>

            {/* Info box */}
            <div className="bg-surface-container-high border border-outline-variant rounded-lg p-md flex items-start gap-sm shadow-sm">
              <span className="material-symbols-outlined text-primary shrink-0 mt-0.5">account_balance</span>
              <p className="font-label-md text-on-surface-variant leading-relaxed">
                <strong className="text-on-surface font-semibold">Email Domain Required:</strong> Students with emails matching your domain (e.g. <code className="bg-surface px-1 rounded text-primary text-xs">student.mmu.edu.my</code>) will automatically appear in your dashboard when they are accepted for internships.
              </p>
            </div>

            <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-on-surface" htmlFor="uni_name">University Name</label>
                  <input id="uni_name" type="text" required value={form.uni_name} onChange={set('uni_name')} placeholder="e.g. Multimedia University (MMU)" className={inputCls('uni_name')} />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-on-surface" htmlFor="contactName">Contact Person Name</label>
                  <input id="contactName" type="text" required value={form.contactName} onChange={set('contactName')} placeholder="e.g. Dr. Ahmad" className={inputCls('contactName')} />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-on-surface" htmlFor="email_domain">
                  Student Email Domain <span className="text-error">*</span>
                </label>
                <input id="email_domain" type="text" required value={form.email_domain} onChange={set('email_domain')}
                  placeholder="e.g. student.mmu.edu.my" className={inputCls('email_domain')} />
                {errors.email_domain && <p className="text-error text-xs">{errors.email_domain}</p>}
                <p className="font-label-sm text-outline flex items-center gap-1 text-xs">
                  <span className="material-symbols-outlined text-[14px]">info</span>
                  Students with emails ending in @<em>{form.email_domain || 'yourdomain.edu.my'}</em> will be tracked.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-on-surface" htmlFor="email">Admin Email</label>
                  <input id="email" type="email" required value={form.email} onChange={set('email')} placeholder="admin@university.edu.my" className={inputCls('email')} />
                  {errors.email && <p className="text-error text-xs">{errors.email}</p>}
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-on-surface" htmlFor="website">Website (Optional)</label>
                  <input id="website" type="url" value={form.website} onChange={set('website')} placeholder="https://www.university.edu.my" className={inputCls('website')} />
                </div>
              </div>

              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-on-surface" htmlFor="address">Address (Optional)</label>
                <input id="address" type="text" value={form.address} onChange={set('address')} placeholder="e.g. Cyberjaya, Selangor" className={inputCls('address')} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md pt-md border-t border-surface-variant">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-on-surface" htmlFor="password">Password</label>
                  <div className="relative">
                    <input id="password" type={showPw ? 'text' : 'password'} required value={form.password} onChange={onPwChange} placeholder="••••••••" className={`${inputCls('password')} pr-10`} />
                    <button type="button" onClick={() => setShowPw(v => !v)} className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-on-surface transition-colors" style={{ fontSize: 20 }}>
                      {showPw ? 'visibility' : 'visibility_off'}
                    </button>
                  </div>
                  {form.password && (
                    <div>
                      <div className="flex gap-1 mb-1">
                        {[0,1,2,3].map(i => <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ background: i < pwStrength.level ? strengthColors[pwStrength.level] : '#eae7e7' }} />)}
                      </div>
                      <p className="font-label-sm text-xs" style={{ color: strengthColors[pwStrength.level] }}>{pwStrength.label}</p>
                    </div>
                  )}
                  {errors.password && <p className="text-error text-xs">{errors.password}</p>}
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-on-surface" htmlFor="confirmPassword">Confirm Password</label>
                  <div className="relative">
                    <input id="confirmPassword" type={showConfirmPw ? 'text' : 'password'} required value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••" className={`${inputCls('confirmPassword')} pr-10`} />
                    <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-on-surface transition-colors" style={{ fontSize: 20 }}>
                      {showConfirmPw ? 'visibility' : 'visibility_off'}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-error text-xs">{errors.confirmPassword}</p>}
                </div>
              </div>

              <div className="flex flex-col gap-md mt-sm">
                <label className="flex items-start gap-sm cursor-pointer group">
                  <input type="checkbox" required checked={form.terms} onChange={e => setForm(f => ({ ...f, terms: e.target.checked }))} className="mt-1 w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                  <span className="font-body-md text-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                    I agree to the <Link to="/terms" className="text-primary hover:underline font-medium">Terms of Service</Link> and <Link to="/privacy" className="text-primary hover:underline font-medium">Privacy Policy</Link>.
                  </span>
                </label>
                <button type="submit" disabled={loading} className="w-full bg-primary text-on-primary font-label-md rounded-md py-[14px] px-md flex items-center justify-center gap-xs hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-60">
                  {loading ? <Spinner /> : <><span>Register University</span><span className="material-symbols-outlined text-[20px]">arrow_forward</span></>}
                </button>
              </div>
            </form>

            <div className="text-center pt-md border-t border-surface-variant">
              <p className="font-body-md text-sm text-on-surface-variant">
                Already have an account?{' '}
                <Link to="/login" className="text-primary font-label-md hover:text-surface-tint hover:underline transition-colors">Log in here</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

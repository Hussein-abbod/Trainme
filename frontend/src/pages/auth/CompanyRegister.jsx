import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Auth } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { checkPasswordStrength, Spinner } from '../../utils/helpers.jsx';

const INDUSTRIES = [
  { value: 'tech', label: 'Technology & Software' },
  { value: 'finance', label: 'Finance & Banking' },
  { value: 'manufacturing', label: 'Manufacturing & Engineering' },
  { value: 'healthcare', label: 'Healthcare & Life Sciences' },
  { value: 'consulting', label: 'Consulting & Professional Services' },
  { value: 'retail', label: 'Retail & FMCG' },
  { value: 'other', label: 'Other' },
];

export default function CompanyRegister() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ contactName: '', company_name: '', ssm_number: '', email: '', industry: '', password: '', confirmPassword: '', terms: false });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [pwStrength, setPwStrength] = useState({ level: 0, color: '', label: '' });

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }
  function onPwChange(e) { set('password')(e); setPwStrength(checkPasswordStrength(e.target.value)); }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    if (form.password !== form.confirmPassword) { setErrors({ confirmPassword: 'Passwords do not match.' }); return; }
    if (form.password.length < 8) { setErrors({ password: 'Password must be at least 8 characters.' }); return; }
    setLoading(true);
    try {
      const data = await Auth.registerCompany({ name: form.contactName, email: form.email, password: form.password, company_name: form.company_name, ssm_number: form.ssm_number || null, industry: form.industry || null });
      login(data);
      toast('Company registered! Welcome to TrainMe.', 'success');
      setTimeout(() => navigate('/dashboard'), 800);
    } catch (err) {
      toast(err.message || 'Registration failed. Please try again.', 'error');
      if (err.message?.toLowerCase().includes('email')) setErrors({ email: 'This email is already registered.' });
    } finally { setLoading(false); }
  }

  const inputCls = (f) => `w-full bg-surface border ${errors[f] ? 'border-error' : 'border-outline-variant'} rounded-md px-sm py-[12px] font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors`;
  const strengthColors = ['', '#ba1a1a', '#e65100', '#f9a825', '#006565'];

  return (
    <div className="bg-background min-h-screen text-on-surface antialiased">
      <main className="flex min-h-screen w-full">
        {/* Left Branding */}
        <div className="hidden lg:flex w-1/2 relative bg-primary flex-col justify-between p-xl overflow-hidden">
          <div className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-multiply" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDNHxHfRl6FP8AQY6iAIWuC7gio5W9IERXI05mMLGF6SEjBdvraFwwc671O_xHvgoVifr7WP9yamuMhvFvfMogABPWMVNxke3jx7P038r5Az9bPefUj8HL7-5xjscnE7rFEe352pARjS8wlS7lsWkwTBwu7yiCkbmHDcEtnzLQIFKyR1tuOFhfUaOj5bAf4ojhRKGX2ONIj83G6QmU9hgXLn8gpococBadrZNOgebbogvs4mBnUS8nu2Ks8pHrtIXWDKGoQIUFPjkw')" }} />
          <div className="relative z-10 flex items-center gap-base">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-primary text-[20px] filled-icon">school</span></div>
            <h1 className="font-h2 text-on-primary font-bold tracking-tighter">TrainMe</h1>
            <span className="font-label-md text-primary-container bg-on-primary px-2 py-1 rounded-sm uppercase tracking-widest text-xs font-bold">Employers</span>
          </div>
          <div className="relative z-10 max-w-lg mb-xl">
            <h2 className="font-h1 text-on-primary mb-md">Empower the next generation.</h2>
            <p className="font-body-lg text-on-primary opacity-90 leading-relaxed">Access Malaysia's largest verified pool of ambitious university talent.</p>
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-gutter sm:p-lg xl:p-xl bg-surface-container-lowest">
          <div className="w-full max-w-[520px] flex flex-col gap-lg">
            <div className="lg:hidden flex items-center gap-base border-b border-surface-variant pb-md mb-xs">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-white text-[18px] filled-icon">school</span></div>
              <h1 className="font-h3 text-primary font-bold tracking-tighter">TrainMe</h1>
            </div>

            <div className="flex flex-col gap-xs">
              <h2 className="font-h2 text-on-surface">Company Registration</h2>
              <p className="font-body-md text-on-surface-variant">Create your employer profile to start connecting with students.</p>
            </div>

            <div className="bg-surface-container-high border border-outline-variant rounded-lg p-md flex items-start gap-sm shadow-sm">
              <span className="material-symbols-outlined text-primary shrink-0 mt-0.5 filled-icon">admin_panel_settings</span>
              <p className="font-label-md text-on-surface-variant leading-relaxed">
                <strong className="text-on-surface font-semibold">Verification Required:</strong> Our team will verify your SSM number within 24 hours.
              </p>
            </div>

            <form className="flex flex-col gap-md" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-on-surface" htmlFor="company_name">Company Name</label>
                <input id="company_name" type="text" required value={form.company_name} onChange={set('company_name')} placeholder="e.g. Acme Corporation Sdn Bhd" className={inputCls('company_name')} />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-on-surface" htmlFor="contactName">Your Full Name (Contact Person)</label>
                <input id="contactName" type="text" required value={form.contactName} onChange={set('contactName')} placeholder="e.g. Ahmad bin Ali" className={inputCls('contactName')} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md">
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-on-surface" htmlFor="ssm_number">SSM Registration Number</label>
                  <input id="ssm_number" type="text" value={form.ssm_number} onChange={set('ssm_number')} placeholder="e.g. 1234567-X" className={inputCls('ssm_number')} />
                </div>
                <div className="flex flex-col gap-xs">
                  <label className="font-label-md text-on-surface" htmlFor="email">Corporate Email</label>
                  <input id="email" type="email" required value={form.email} onChange={set('email')} placeholder="hr@company.com" className={inputCls('email')} />
                  {errors.email && <p className="text-error text-xs">{errors.email}</p>}
                </div>
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-on-surface" htmlFor="industry">Industry Category</label>
                <div className="relative">
                  <select id="industry" value={form.industry} onChange={set('industry')} className={`${inputCls('industry')} appearance-none cursor-pointer`}>
                    <option value="">Select an industry category</option>
                    {INDUSTRIES.map(ind => <option key={ind.value} value={ind.value}>{ind.label}</option>)}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-sm text-outline">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-md mt-sm pt-md border-t border-surface-variant">
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
                      <p className="font-label-sm text-label-sm" style={{ color: strengthColors[pwStrength.level] }}>{pwStrength.label}</p>
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
                  {loading ? <Spinner /> : <><span>Submit Registration</span><span className="material-symbols-outlined text-[20px]">arrow_forward</span></>}
                </button>
              </div>
            </form>

            <div className="text-center pt-md">
              <p className="font-body-md text-sm text-on-surface-variant">
                Already have an employer account?{' '}
                <Link to="/login" className="text-primary font-label-md hover:text-surface-tint hover:underline transition-colors">Log in here</Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

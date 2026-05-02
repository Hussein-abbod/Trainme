import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Auth } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { checkPasswordStrength, Spinner } from '../../utils/helpers.jsx';

export default function StudentRegister() {
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ fullName: '', university: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [pwStrength, setPwStrength] = useState({ level: 0, color: '', label: '' });

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }

  function onPwChange(e) {
    set('password')(e);
    setPwStrength(checkPasswordStrength(e.target.value));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    if (form.password !== form.confirmPassword) { setErrors({ confirmPassword: 'Passwords do not match.' }); return; }
    if (form.password.length < 8) { setErrors({ password: 'Password must be at least 8 characters.' }); return; }
    setLoading(true);
    try {
      const data = await Auth.registerStudent({ name: form.fullName, email: form.email, password: form.password, university: form.university });
      login(data);
      toast('Account created! Welcome to TrainMe.', 'success');
      setTimeout(() => navigate('/discover'), 800);
    } catch (err) {
      toast(err.message || 'Registration failed. Please try again.', 'error');
      if (err.message?.toLowerCase().includes('email')) setErrors({ email: 'This email is already registered.' });
    } finally { setLoading(false); }
  }

  const inputCls = (f) => `w-full rounded bg-surface border ${errors[f] ? 'border-error' : 'border-outline-variant'} px-sm py-sm font-body-md text-body-md text-on-surface placeholder:text-outline focus:border-primary focus:border-2 focus:ring-0 transition-all duration-200`;

  const strengthColors = ['', '#ba1a1a', '#e65100', '#f9a825', '#006565'];

  return (
    <div className="bg-background text-on-background font-body-md antialiased min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 relative bg-surface-container-high overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBVlsMoy39K6FnDdjcZ6mPuaC7rn5X5FYr20BNi9hiqzzRmT7OIkYcjzhNMSta2jOtneW3Bkgr3ZKSFEWnUkpY8a3krey9IR2HLhBpuuR-0PDMA1tz3uiREXzyyewNk46JDrO5vV8RMoNdUP9omqFSb0oEL7qbp_C_WrFmR-sN18wwVhTp7xiYB_lL5V0-W6LLLD9VuxteIPefzCeR1ibaKp9UTL_zORHoN1IqUCpisOV7HbgFr1xXFy4Rm4b-Yqa5uiYQRZ9uJ5CA')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-transparent" />
        <div className="relative z-10 p-xl flex flex-col justify-between h-full w-full">
          <div className="flex items-center gap-xs">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-primary text-[20px] filled-icon">school</span></div>
            <span className="font-h2 text-h2 text-on-primary tracking-tight">TrainMe</span>
          </div>
          <div className="max-w-md">
            <h1 className="font-h1 text-h1 text-on-primary mb-md">Bridge the gap to your future.</h1>
            <p className="font-body-lg text-body-lg text-on-primary/90">Join Malaysia's premier platform connecting ambitious students with top-tier corporate internships.</p>
          </div>
        </div>
      </div>

      {/* Right Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-md md:p-lg lg:p-xl bg-surface-container-lowest overflow-y-auto">
        <div className="w-full max-w-[480px] pt-lg lg:pt-0">
          <div className="lg:hidden absolute top-md left-md flex items-center gap-xs">
            <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-white text-[18px] filled-icon">school</span></div>
            <span className="font-h3 text-h3 text-primary tracking-tight">TrainMe</span>
          </div>

          <div className="mb-lg">
            <h2 className="font-h2 text-h2 text-on-surface mb-xs">Create Student Account</h2>
            <p className="font-body-md text-body-md text-on-surface-variant">Register to discover exclusive internship opportunities.</p>
          </div>

          <form className="space-y-md" onSubmit={handleSubmit}>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="fullName">Full Name (As per IC/Passport)</label>
              <input id="fullName" type="text" required value={form.fullName} onChange={set('fullName')} placeholder="e.g. Ahmad bin Abdullah" className={inputCls('fullName')} />
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="university">University Name</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline">search</span>
                <input id="university" type="text" required value={form.university} onChange={set('university')} placeholder="Search for your university..." className={`${inputCls('university')} pl-10`} />
              </div>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="email">University Email</label>
              <input id="email" type="email" required value={form.email} onChange={set('email')} placeholder="student@siswa.um.edu.my" className={inputCls('email')} />
              {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
              <p className="mt-xs font-label-sm text-label-sm text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span> Please use your .edu.my or student email
              </p>
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" type={showPw ? 'text' : 'password'} required value={form.password} onChange={onPwChange} placeholder="••••••••" className={inputCls('password')} />
                <button type="button" onClick={() => setShowPw(v => !v)} className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-on-surface transition-colors" style={{ fontSize: 20 }}>
                  {showPw ? 'visibility' : 'visibility_off'}
                </button>
              </div>
              {form.password && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-1">
                    {[0,1,2,3].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300" style={{ background: i < pwStrength.level ? strengthColors[pwStrength.level] : '#eae7e7' }} />
                    ))}
                  </div>
                  <p className="font-label-sm text-label-sm" style={{ color: strengthColors[pwStrength.level] }}>{pwStrength.label}</p>
                </div>
              )}
              {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="confirmPassword">Confirm Password</label>
              <input id="confirmPassword" type="password" required value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••" className={inputCls('confirmPassword')} />
              {errors.confirmPassword && <p className="text-error text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
            <button type="submit" disabled={loading} className="w-full mt-lg bg-primary hover:bg-surface-tint text-on-primary font-label-md text-label-md py-sm px-md rounded-full shadow-sm hover:shadow transition-all duration-200 flex justify-center items-center gap-xs disabled:opacity-60">
              {loading ? <Spinner /> : <><span>Complete Registration</span><span className="material-symbols-outlined text-[18px]">arrow_forward</span></>}
            </button>
          </form>

          <p className="mt-md text-center font-body-md text-body-md text-on-surface-variant">
            Already have an account?{' '}
            <Link to="/login" className="font-label-md text-label-md text-primary hover:text-surface-tint underline decoration-primary/30 underline-offset-4 transition-colors">Log in here</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

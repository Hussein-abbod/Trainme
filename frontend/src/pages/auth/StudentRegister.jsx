import { useState, useEffect } from 'react';
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
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [form, setForm] = useState({ fullName: '', university: '', studentId: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [pwStrength, setPwStrength] = useState({ level: 0, color: '', label: '' });
  const [universities, setUniversities] = useState([]);
  const [loadingUnis, setLoadingUnis] = useState(true);
  const [uniNotFound, setUniNotFound] = useState(false);

  useEffect(() => {
    Auth.listUniversities()
      .then(data => setUniversities(data))
      .catch(() => setUniversities([]))
      .finally(() => setLoadingUnis(false));
  }, []);

  function set(field) { return e => setForm(f => ({ ...f, [field]: e.target.value })); }

  function onPwChange(e) {
    set('password')(e);
    setPwStrength(checkPasswordStrength(e.target.value));
  }

  // Auto-fill email domain when university is selected
  function handleUniChange(e) {
    const val = e.target.value;
    setForm(f => ({ ...f, university: val }));

    if (val === '__not_found__') {
      setUniNotFound(true);
      return;
    }
    setUniNotFound(false);

    // Pre-fill email domain hint
    const uni = universities.find(u => u.uni_name === val);
    if (uni && !form.email) {
      // Only suggest the domain, don't overwrite if the user typed something
      setForm(f => ({ ...f, university: val, email: f.email || '' }));
    }
  }

  function getEmailPlaceholder() {
    const uni = universities.find(u => u.uni_name === form.university);
    return uni ? `student@${uni.email_domain}` : 'student@university.edu.my';
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    if (form.password !== form.confirmPassword) { setErrors({ confirmPassword: 'Passwords do not match.' }); return; }
    if (form.password.length < 8) { setErrors({ password: 'Password must be at least 8 characters.' }); return; }

    // Validate email vs chosen university domain
    const chosenUni = universities.find(u => u.uni_name === form.university);
    if (chosenUni && !form.email.toLowerCase().endsWith(`@${chosenUni.email_domain}`)) {
      setErrors({ email: `Email must end with @${chosenUni.email_domain} for ${chosenUni.uni_name}.` });
      return;
    }

    setLoading(true);
    try {
      const data = await Auth.registerStudent({
        name: form.fullName,
        email: form.email,
        password: form.password,
        university: form.university === '__not_found__' ? null : (form.university || null),
        student_id: form.studentId || null,
      });
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
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format')" }} />
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

            {/* University Dropdown */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="university">University</label>
              <div className="relative">
                <select id="university" value={form.university} onChange={handleUniChange}
                  className={`${inputCls('university')} appearance-none cursor-pointer`}>
                  <option value="">Select your university...</option>
                  {loadingUnis ? (
                    <option disabled>Loading universities...</option>
                  ) : (
                    universities.map(u => (
                      <option key={u.email_domain} value={u.uni_name}>{u.uni_name}</option>
                    ))
                  )}
                  <option value="__not_found__">My university is not listed</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-sm text-outline">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/></svg>
                </div>
              </div>
              {uniNotFound && (
                <div className="mt-xs p-sm bg-surface-container-high rounded-md border border-outline-variant text-xs text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px] text-primary mr-1">info</span>
                  Your university is not yet registered in TrainMe. Ask your university to register at <strong>/register/university</strong>.
                </div>
              )}
            </div>

            {/* Student ID */}
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="studentId">
                Student ID <span className="text-outline font-normal">(Optional — helps university track you)</span>
              </label>
              <input id="studentId" type="text" value={form.studentId} onChange={set('studentId')}
                placeholder="e.g. 1211104523 or A21EC0001" className={inputCls('studentId')} />
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="email">University Email</label>
              <input id="email" type="email" required value={form.email} onChange={set('email')}
                placeholder={getEmailPlaceholder()} className={inputCls('email')} />
              {errors.email && <p className="text-error text-xs mt-1">{errors.email}</p>}
              <p className="mt-xs font-label-sm text-label-sm text-outline flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">info</span>
                Please use your university email. This links you to your university's dashboard.
              </p>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="password">Password</label>
              <div className="relative">
                <input id="password" type={showPw ? 'text' : 'password'} required value={form.password} onChange={onPwChange} placeholder="••••••••" className={`${inputCls('password')} pr-10`} />
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
              <div className="relative">
                <input id="confirmPassword" type={showConfirmPw ? 'text' : 'password'} required value={form.confirmPassword} onChange={set('confirmPassword')} placeholder="••••••••" className={`${inputCls('confirmPassword')} pr-10`} />
                <button type="button" onClick={() => setShowConfirmPw(v => !v)} className="material-symbols-outlined absolute right-sm top-1/2 -translate-y-1/2 text-outline cursor-pointer hover:text-on-surface transition-colors" style={{ fontSize: 20 }}>
                  {showConfirmPw ? 'visibility' : 'visibility_off'}
                </button>
              </div>
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

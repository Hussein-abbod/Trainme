import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Auth } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Spinner } from '../../utils/helpers.jsx';

export default function Login() {
  const { login, isLoggedIn, role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  if (isLoggedIn) {
    navigate(role === 'company' ? '/dashboard' : '/discover', { replace: true });
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const data = await Auth.login({ email: form.email, password: form.password });
      login(data);
      toast(`Welcome back, ${data.name}!`, 'success');
      setTimeout(() => navigate(data.role === 'company' ? '/dashboard' : '/discover'), 600);
    } catch (err) {
      setErrors({ password: 'Invalid email or password.' });
      toast(err.message || 'Invalid email or password.', 'error');
    } finally {
      setLoading(false);
    }
  }

  const inputCls = (field) =>
    `w-full pl-lg pr-sm py-[10px] rounded border ${errors[field] ? 'border-error' : 'border-outline-variant'} bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md transition-colors placeholder:text-outline-variant`;

  return (
    <div className="bg-surface-container-lowest text-on-surface antialiased font-body-md text-body-md h-screen flex">
      <div className="flex flex-col md:flex-row w-full h-full">
        {/* Left Branding */}
        <div className="hidden md:flex md:w-5/12 lg:w-1/2 relative bg-surface-container-high overflow-hidden">
          <img alt="Students collaborating" className="absolute inset-0 w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCC9u50E0CySXMAMg6jy07rWJ98jEhOREZVS8eleuIP0ttSkNwdXbm13-OvtiWHVFBezm3kWchX-uIflnVLjDvge-zTkWhJMW2dG2MGIAQo3mXfjqrEeIJ_rVbD21mCRQpQ2zRAoRVQcu8oxFqY4eUEK154TMkuOSabujLdLodJ4W2fqcBcG8J2vgujew2RJGnO3keG9wIlB7-jawJ-SbdD5M26CGpyQIZxZomQo15RuLxmid3eMPKeMPp44gSuoRR6VIQBBtJ4CrU" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent mix-blend-multiply" />
          <div className="absolute inset-0 flex flex-col justify-between p-lg xl:p-xl text-white">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-white rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-[18px] filled-icon">school</span>
              </div>
              <span className="font-h3 text-h3 font-black tracking-tighter">TrainMe</span>
            </div>
            <div className="max-w-md">
              <h2 className="font-h2 text-h2 mb-sm">Empowering the next generation of talent.</h2>
              <p className="font-body-lg text-body-lg text-white/90">Connect with top employers, secure premium internships, and transition seamlessly into your professional career.</p>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="w-full md:w-7/12 lg:w-1/2 flex items-center justify-center p-md sm:p-lg lg:p-xl bg-surface-container-lowest overflow-y-auto">
          <div className="w-full max-w-[420px]">
            <div className="md:hidden flex items-center gap-2 mb-xl">
              <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center">
                <span className="material-symbols-outlined text-white text-[18px] filled-icon">school</span>
              </div>
              <span className="font-h3 text-h3 font-black tracking-tighter text-primary">TrainMe</span>
            </div>

            <div className="mb-lg">
              <h1 className="font-h2 text-h2 text-on-surface mb-xs">Welcome back</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Please enter your credentials to access your account.</p>
            </div>

            <form className="space-y-md" onSubmit={handleSubmit}>
              <div className="flex flex-col space-y-xs">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-sm text-outline">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>mail</span>
                  </span>
                  <input id="email" type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="name@university.edu" className={inputCls('email')} />
                </div>
              </div>

              <div className="flex flex-col space-y-xs">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="password">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-sm text-outline">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>lock</span>
                  </span>
                  <input id="password" type="password" required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className={inputCls('password')} />
                </div>
                {errors.password && <p className="text-error text-xs mt-1">{errors.password}</p>}
              </div>

              <div className="flex items-center justify-between pt-xs">
                <div className="flex items-center space-x-sm">
                  <input id="remember" type="checkbox" className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer" />
                  <label htmlFor="remember" className="font-label-md text-label-md text-on-surface-variant cursor-pointer select-none">Remember Me</label>
                </div>
                <Link to="/forgot-password" className="font-label-md text-label-md text-primary hover:text-primary-fixed-dim transition-colors">Forgot Password?</Link>
              </div>

              <div className="pt-sm">
                <button type="submit" disabled={loading} className="w-full py-sm px-md rounded-lg bg-primary text-on-primary font-label-md text-label-md flex justify-center items-center gap-2 hover:bg-surface-tint transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60">
                  {loading ? <Spinner /> : <><span>Sign In</span><span className="material-symbols-outlined ml-xs text-[18px]">arrow_forward</span></>}
                </button>
              </div>
            </form>



            <div className="mt-md text-center">
              <p className="font-body-md text-body-md text-on-surface-variant">
                Don't have an account?{' '}
                <Link to="/register" className="font-label-md text-label-md text-primary hover:text-primary-fixed-dim transition-colors ml-xs">Sign up</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

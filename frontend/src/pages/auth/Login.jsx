import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { Auth } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { Spinner } from '../../utils/helpers.jsx';
import loginImage from '../../assets/login_image.png';

export default function Login() {
  const { login, isLoggedIn, role } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [errors, setErrors] = useState({});
  const [selectedDemoRole, setSelectedDemoRole] = useState('student');

  const DEMO_ACCOUNTS = {
    student: [
      { label: 'Ahmad Razif (MMU)', email: 'ahmad@student.mmu.edu.my' },
      { label: 'Nurul Ain (MMU)', email: 'nurul@student.mmu.edu.my' },
      { label: 'Wei Liang (MMU)', email: 'weiliang@student.mmu.edu.my' },
      { label: 'Priya Nair (MMU)', email: 'priya@student.mmu.edu.my' },
      { label: 'Arif Hakim (UTM)', email: 'arif@graduate.utm.my' },
      { label: 'Siti Hajar (UTM)', email: 'siti@graduate.utm.my' },
    ],
    company: [
      { label: 'TechSolutions HR', email: 'hr@techsolutions.com.my' },
      { label: 'FinanceHub HR', email: 'hr@financehub.com.my' },
      { label: 'GreenEnergy HR', email: 'hr@greenenergy.com.my' },
    ],
    university: [
      { label: 'MMU Admin', email: 'admin@mmu.edu.my' },
      { label: 'UTM Admin', email: 'admin@utm.my' },
    ]
  };

  if (isLoggedIn) {
    if (role === 'company') return <Navigate to="/dashboard" replace />;
    if (role === 'university') return <Navigate to="/university/dashboard" replace />;
    return <Navigate to="/discover" replace />;
  }

  async function handleDemoLogin(email) {
    setForm({ email, password: 'password123' });
    setErrors({});
    setLoading(true);
    try {
      const data = await Auth.login({ email, password: 'password123' });
      login(data);
      toast(`Welcome back, ${data.name}!`, 'success');
      setTimeout(() => {
        if (data.role === 'company') navigate('/dashboard');
        else if (data.role === 'university') navigate('/university/dashboard');
        else navigate('/discover');
      }, 600);
    } catch (err) {
      if (err.status === 401 || err.status === 400) {
        setErrors({ password: 'Invalid email or password.' });
      } else {
        setErrors({ password: 'A server error occurred. Please try again later.' });
      }
      toast(err.status === 401 ? 'Invalid email or password.' : (err.message || 'Login failed.'), 'error');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      const data = await Auth.login({ email: form.email, password: form.password });
      login(data);
      toast(`Welcome back, ${data.name}!`, 'success');
      setTimeout(() => {
        if (data.role === 'company') navigate('/dashboard');
        else if (data.role === 'university') navigate('/university/dashboard');
        else navigate('/discover');
      }, 600);
    } catch (err) {
      if (err.status === 401 || err.status === 400) {
        setErrors({ password: 'Invalid email or password.' });
      } else {
        setErrors({ password: 'A server error occurred. Please try again later.' });
      }
      toast(err.status === 401 ? 'Invalid email or password.' : (err.message || 'Login failed.'), 'error');
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
          <img alt="Students collaborating" className="absolute inset-0 w-full h-full object-cover" src={loginImage} />
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
                  <input id="password" type={showPw ? 'text' : 'password'} required value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="••••••••" className={`${inputCls('password')} pr-10`} />
                  <button type="button" onClick={() => setShowPw(v => !v)} className="absolute inset-y-0 right-0 flex items-center pr-sm text-outline hover:text-on-surface focus:outline-none">
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{showPw ? 'visibility' : 'visibility_off'}</span>
                  </button>
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

            {/* Demo Accounts Section */}
            <div className="mt-xl pt-lg border-t border-outline-variant">
              <div className="flex flex-col items-center mb-md">
                <h3 className="font-label-lg text-label-lg text-on-surface">Demo Accounts</h3>
                <p className="text-sm text-on-surface-variant text-center mt-1">Select a role to quickly log in with test data.</p>
              </div>
              
              <div className="flex justify-center gap-2 mb-md">
                {['student', 'company', 'university'].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedDemoRole(r)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                      selectedDemoRole === r 
                        ? 'bg-primary text-on-primary shadow-sm' 
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                {DEMO_ACCOUNTS[selectedDemoRole].map((acc, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleDemoLogin(acc.email)}
                    disabled={loading}
                    className="p-3 border border-outline-variant rounded-xl text-left hover:bg-surface-container hover:border-primary transition-all flex flex-col items-start focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent group"
                  >
                    <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors truncate w-full">{acc.label}</span>
                    <span className="text-xs text-on-surface-variant truncate w-full mt-0.5">{acc.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

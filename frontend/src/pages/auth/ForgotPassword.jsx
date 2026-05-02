import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext.jsx';
import { Spinner } from '../../utils/helpers.jsx';

export default function ForgotPassword() {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await new Promise(r => setTimeout(r, 1200));
      setSent(true);
      toast('Password reset link sent to your email.', 'success');
    } catch {
      toast('Failed to send reset link. Please try again.', 'error');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-[420px]">
        <div className="flex items-center gap-2 mb-xl">
          <div className="w-7 h-7 bg-primary rounded-full flex items-center justify-center"><span className="material-symbols-outlined text-white text-[18px] filled-icon">school</span></div>
          <span className="text-2xl font-black tracking-tight text-primary">TrainMe</span>
        </div>

        {!sent ? (
          <>
            <div className="mb-lg">
              <h1 className="font-h2 text-h2 text-on-surface mb-xs">Reset your password</h1>
              <p className="font-body-md text-body-md text-on-surface-variant">Enter your email address and we'll send you a link to reset your password.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="email">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-sm text-outline">
                    <span className="material-symbols-outlined text-[20px]">mail</span>
                  </span>
                  <input id="email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="name@university.edu" className="w-full pl-lg pr-sm py-[10px] rounded border border-outline-variant bg-surface-container-lowest text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-body-md text-body-md transition-colors placeholder:text-outline-variant" />
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full py-sm px-md rounded-lg bg-primary text-on-primary font-label-md text-label-md flex justify-center items-center gap-2 hover:bg-surface-tint transition-colors shadow-sm disabled:opacity-60">
                {loading ? <Spinner /> : <><span>Send Reset Link</span><span className="material-symbols-outlined text-[18px]">arrow_forward</span></>}
              </button>
            </form>
          </>
        ) : (
          <div className="text-center p-lg bg-secondary-container rounded-xl border border-secondary-fixed">
            <span className="material-symbols-outlined text-[48px] text-on-secondary-container mb-sm filled-icon">mark_email_unread</span>
            <h2 className="font-h3 text-h3 text-on-secondary-container mb-sm">Check your email</h2>
            <p className="font-body-md text-body-md text-on-secondary-container/80">We sent a password reset link to <strong>{email}</strong></p>
          </div>
        )}

        <div className="mt-lg text-center">
          <Link to="/login" className="inline-flex items-center gap-xs font-label-md text-label-md text-primary hover:text-surface-tint transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function RoleSelection() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col items-center justify-center font-body-md selection:bg-primary-container selection:text-on-primary-container">
      <main className="w-full max-w-container-max mx-auto px-gutter py-xl flex flex-col items-center relative z-10">
        <div className="text-center mb-lg max-w-2xl">
          <div className="flex items-center justify-center gap-3 mb-md">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px] filled-icon">school</span>
            </div>
            <h1 className="font-h1 text-h1 text-primary tracking-tighter">TrainMe</h1>
          </div>
          <h2 className="font-h2 text-h2 text-on-background mb-sm">Choose your path</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Select how you want to use TrainMe. You can always explore other options later.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md w-full max-w-5xl mb-lg">
          {/* Student Card */}
          <Link to="/register/student" className="group relative overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest hover:border-primary shadow-sm hover:shadow-md transition-all duration-300 p-lg flex flex-col items-center text-center cursor-pointer">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary-fixed opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="w-20 h-20 bg-secondary-fixed text-on-secondary-container rounded-full flex items-center justify-center mb-md group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300 shadow-sm">
              <span className="material-symbols-outlined text-[40px]">school</span>
            </div>
            <h3 className="font-h3 text-h3 text-on-background mb-xs group-hover:text-primary transition-colors duration-300">I am a Student</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md flex-grow">Looking for an internship to kickstart my career.</p>
            <div className="mt-auto flex items-center text-primary font-label-md text-label-md opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              Join as Student
              <span className="material-symbols-outlined ml-xs text-[18px]">arrow_forward</span>
            </div>
          </Link>

          {/* Company Card */}
          <Link to="/register/company" className="group relative overflow-hidden rounded-xl border border-surface-variant bg-surface-container-lowest hover:border-primary shadow-sm hover:shadow-md transition-all duration-300 p-lg flex flex-col items-center text-center cursor-pointer">
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-primary-fixed opacity-20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500" />
            <div className="w-20 h-20 bg-primary-fixed text-on-primary-fixed rounded-full flex items-center justify-center mb-md group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300 shadow-sm">
              <span className="material-symbols-outlined text-[40px]">domain</span>
            </div>
            <h3 className="font-h3 text-h3 text-on-background mb-xs group-hover:text-primary transition-colors duration-300">I am a Company</h3>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md flex-grow">Looking for talented interns to join our team.</p>
            <div className="mt-auto flex items-center text-primary font-label-md text-label-md opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
              Join as Company
              <span className="material-symbols-outlined ml-xs text-[18px]">arrow_forward</span>
            </div>
          </Link>
        </div>

        <div className="text-center font-body-md text-body-md text-on-surface-variant">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-label-md text-label-md hover:text-on-primary-fixed-variant transition-colors hover:underline underline-offset-4 ml-xs">Login</Link>
        </div>
      </main>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at top right, rgba(0,128,128,0.03) 0%, transparent 40%), radial-gradient(circle at bottom left, rgba(166,239,239,0.05) 0%, transparent 40%)' }} />
    </div>
  );
}

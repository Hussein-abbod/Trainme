import { Link } from 'react-router-dom';

export default function ApplicationSuccess() {
  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased items-center justify-center p-gutter">
      <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-xl max-w-lg w-full text-center shadow-sm">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-md">
          <span className="material-symbols-outlined text-[48px] text-green-600 filled-icon">check_circle</span>
        </div>
        <h1 className="font-h1 text-h2 text-on-surface mb-sm">Application Sent!</h1>
        <p className="text-on-surface-variant mb-lg">
          Your application has been successfully submitted to the employer. You can track the status in your applications dashboard.
        </p>
        <div className="flex flex-col sm:flex-row gap-sm justify-center">
          <Link to="/applications" className="px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md hover:bg-surface-tint transition-colors">
            Track Application
          </Link>
          <Link to="/discover" className="px-6 py-3 border border-outline text-on-surface rounded-lg font-label-md hover:bg-surface-container transition-colors">
            Discover More
          </Link>
        </div>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-surface-variant w-full mt-auto">
      <div className="flex flex-col md:flex-row justify-between items-center px-8 py-12 w-full max-w-7xl mx-auto gap-md">
        <div className="flex flex-col items-center md:items-start gap-xs">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold text-on-background">
            <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[16px] filled-icon">school</span>
            </div>
            TrainMe
          </Link>
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            © 2026 TrainMe Malaysia. Empowering the next generation of talent.
          </span>
        </div>
        <nav className="flex flex-wrap justify-center gap-x-gutter gap-y-sm">
          {[
            { to: '/about',   label: 'About Us'        },
            { to: '/privacy', label: 'Privacy Policy'  },
            { to: '/terms',   label: 'Terms of Service'},
            { to: '/settings',label: 'Settings'        },
          ].map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="font-label-md text-label-md text-on-surface-variant hover:text-primary hover:underline decoration-primary underline-offset-4 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}

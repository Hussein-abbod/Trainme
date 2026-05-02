import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Bookmarks, Internships } from '../../api/index.js';
import { getMediaUrl } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { Spinner } from '../../utils/helpers.jsx';

export default function SavedInternships() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  async function loadBookmarks() {
    try {
      const data = await Bookmarks.list();
      // Fetch details for each bookmarked internship
      const details = await Promise.all(
        data.map(b => Internships.get(b.internship_id).catch(() => null))
      );
      // Combine
      const full = data.map((b, i) => ({ ...b, internship: details[i] })).filter(b => b.internship);
      setBookmarks(full);
    } catch (err) {
      toast('Failed to load saved internships.', 'error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadBookmarks(); }, []);

  async function removeBookmark(id) {
    try {
      await Bookmarks.remove(id);
      setBookmarks(prev => prev.filter(b => b.internship_id !== id));
      toast('Removed from saved.', 'info');
    } catch (err) {
      toast('Failed to remove bookmark.', 'error');
    }
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-grow max-w-[1200px] w-full mx-auto px-gutter py-lg pb-24 md:pb-lg">
        <div className="mb-lg">
          <h1 className="font-h2 text-h2 text-on-surface mb-xs">Saved Internships</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">Internships you've bookmarked for later.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-xl"><Spinner className="w-10 h-10 text-primary" /></div>
        ) : bookmarks.length === 0 ? (
          <div className="text-center py-xl">
            <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-md">
              <span className="material-symbols-outlined text-outline-variant text-[40px]">bookmark_border</span>
            </div>
            <h2 className="font-h3 text-h3 text-on-surface mb-xs">No saved internships</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-md">
              When you find an interesting opportunity, click the bookmark icon to save it here.
            </p>
            <Link to="/discover" className="px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-surface-tint inline-block">
              Discover Internships
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {bookmarks.map(({ internship }) => (
              <article key={internship.id} className="bg-surface-container-lowest rounded-xl border border-surface-variant p-md flex flex-col gap-md hover:border-primary transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-sm">
                    <div className="w-12 h-12 rounded-lg bg-surface-container-low border border-surface-variant flex items-center justify-center overflow-hidden shrink-0">
                      {internship.company?.logo_url
                        ? <img src={getMediaUrl(internship.company.logo_url)} alt="Logo" className="w-full h-full object-cover" />
                        : <span className="material-symbols-outlined text-outline">domain</span>
                      }
                    </div>
                    <div>
                      <h3 className="font-label-md text-label-md text-on-surface">{internship.company?.company_name || 'Company'}</h3>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">{internship.company?.industry}</p>
                    </div>
                  </div>
                  <button onClick={() => removeBookmark(internship.id)} className="text-primary hover:text-surface-tint">
                    <span className="material-symbols-outlined filled-icon">bookmark</span>
                  </button>
                </div>
                <div>
                  <h2 className="font-h3 text-h3 text-on-surface mb-xs">{internship.title}</h2>
                  <div className="flex flex-wrap gap-xs mb-sm">
                    {internship.location && <span className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full font-label-sm text-label-sm">{internship.location}</span>}
                    {internship.stipend && <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-label-sm text-label-sm">{internship.stipend}</span>}
                  </div>
                </div>
                <div className="mt-auto pt-sm border-t border-surface-variant flex items-center justify-between">
                  <span className="text-xs text-on-surface-variant">{internship.applicant_count || 0} applicants</span>
                  <button onClick={() => navigate(`/internship/${internship.id}`)} className="px-4 py-2 border-2 border-primary text-primary rounded-lg font-label-md hover:bg-primary hover:text-on-primary transition-colors">
                    View Details
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

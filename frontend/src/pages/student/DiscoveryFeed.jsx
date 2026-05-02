import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Internships, Bookmarks } from '../../api/index.js';
import { getMediaUrl } from '../../api/client.js';
import { useToast } from '../../context/ToastContext.jsx';
import { skeletonCard } from '../../utils/helpers.jsx';

const PAGE_SIZE = 9;

const MALAYSIA_LOCATIONS = [
  'Johor', 'Kedah', 'Kelantan', 'Kuala Lumpur', 'Labuan', 'Malacca', 
  'Negeri Sembilan', 'Pahang', 'Penang', 'Perak', 'Perlis', 'Putrajaya', 
  'Sabah', 'Sarawak', 'Selangor', 'Terengganu'
];

function InternshipCard({ item, isBookmarked, onToggleBookmark, navigate }) {
  const skills = (item.skills || []).slice(0, 3);
  return (
    <article className="bg-surface-container-lowest rounded-xl border border-surface-variant p-md flex flex-col gap-md hover:border-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] transition-all duration-200">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-sm">
          <div className="w-12 h-12 rounded-lg bg-surface-container-low flex items-center justify-center border border-surface-variant overflow-hidden shrink-0">
            {item.company?.logo_url
              ? <img src={getMediaUrl(item.company.logo_url)} alt={item.company?.company_name} className="w-full h-full object-cover" />
              : <span className="material-symbols-outlined text-outline">domain</span>
            }
          </div>
          <div>
            <h3 className="font-label-md text-label-md text-on-surface">{item.company?.company_name || 'Company'}</h3>
            <p className="font-label-sm text-label-sm text-on-surface-variant">{item.company?.industry || ''}</p>
          </div>
        </div>
        <button onClick={() => onToggleBookmark(item.id, isBookmarked)} aria-label="save internship" className="text-on-surface-variant hover:text-primary transition-colors">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: isBookmarked ? "'FILL' 1" : "'FILL' 0" }}>
            {isBookmarked ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>
      </div>
      <div>
        <h2 className="font-h3 text-h3 text-on-surface mb-xs">{item.title}</h2>
        <div className="flex flex-wrap gap-xs mb-sm">
          {item.location && <span className="bg-secondary-container text-on-secondary-container px-2 py-1 rounded-full font-label-sm text-label-sm inline-flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span>{item.location}</span>}
          {item.duration && <span className="bg-surface-container-high text-on-surface px-2 py-1 rounded-full font-label-sm text-label-sm inline-flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{item.duration}</span>}
          {item.stipend && <span className="bg-primary/10 text-primary px-2 py-1 rounded-full font-label-sm text-label-sm inline-flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">payments</span>{item.stipend}</span>}
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {skills.map(s => <span key={s} className="bg-surface-container-high text-on-surface-variant px-2 py-0.5 rounded-full text-xs">{s}</span>)}
          </div>
        )}
        <p className="font-body-md text-body-md text-on-surface-variant line-clamp-2 text-sm">{item.description || ''}</p>
      </div>
      <div className="mt-auto pt-sm border-t border-surface-variant flex items-center justify-between">
        <span className="text-xs text-on-surface-variant">{item.applicant_count || 0} applicants</span>
        <button
          onClick={() => navigate(`/internship/${item.id}`)}
          className="px-4 py-2 border-2 border-primary text-primary rounded-lg font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors"
        >
          View Details
        </button>
      </div>
    </article>
  );
}

export default function DiscoveryFeed() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [internships, setInternships] = useState([]);
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [skip, setSkip] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [sort, setSort] = useState('newest');

  useEffect(() => {
    Bookmarks.list().then(bmarks => setBookmarkedIds(new Set(bmarks.map(b => b.internship_id)))).catch(() => {});
  }, []);

  const loadInternships = useCallback(async (reset = true) => {
    setLoading(reset);
    const params = { skip: reset ? 0 : skip, limit: PAGE_SIZE };
    if (search.trim()) params.search = search.trim();
    if (location) params.location = location;
    if (industry) params.industry = industry;
    try {
      const data = await Internships.list(params);
      setInternships(prev => reset ? data : [...prev, ...data]);
      setSkip(reset ? data.length : skip + data.length);
      setHasMore(data.length === PAGE_SIZE);
    } catch (err) {
      toast('Could not load internships: ' + err.message, 'error');
    } finally { setLoading(false); }
  }, [search, location, industry, skip]);

  // Initial load
  useEffect(() => {
    loadInternships(true);
  }, []);

  // Debounced search
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const t = setTimeout(() => loadInternships(true), 400);
    return () => clearTimeout(t);
  }, [search, location, industry]);

  async function toggleBookmark(id, isBookmarked) {
    try {
      if (isBookmarked) {
        await Bookmarks.remove(id);
        setBookmarkedIds(prev => { const s = new Set(prev); s.delete(id); return s; });
        toast('Removed from saved', 'info', 2000);
      } else {
        await Bookmarks.add(id);
        setBookmarkedIds(prev => new Set([...prev, id]));
        toast('Saved to bookmarks', 'success', 2000);
      }
    } catch (err) { toast(err.message || 'Failed to update bookmark', 'error'); }
  }

  function clearFilters() { setSearch(''); setLocation(''); setIndustry(''); }

  const selectCls = 'pl-3 pr-8 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none appearance-none cursor-pointer text-sm';

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow max-w-[1200px] w-full mx-auto px-gutter py-lg md:py-xl pb-24 md:pb-xl">
        {/* Header */}
        <section className="mb-lg">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <h1 className="font-h2 text-h2 text-on-surface w-full md:w-auto">Discover Internships</h1>
            <div className="w-full md:w-auto flex flex-col sm:flex-row gap-sm items-center">
              <div className="relative w-full sm:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
                <input value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors placeholder:text-on-surface-variant/70" placeholder="Search internships..." type="text" />
              </div>
              <div className="flex gap-sm w-full sm:w-auto flex-wrap">
                <select value={location} onChange={e => setLocation(e.target.value)} className={selectCls}>
                  <option value="">All Locations</option>
                  {MALAYSIA_LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
                <select value={industry} onChange={e => setIndustry(e.target.value)} className={selectCls}>
                  <option value="">Industry</option>
                  {['tech','business','engineering','marketing','design'].map(i => <option key={i} value={i} className="capitalize">{i.charAt(0).toUpperCase()+i.slice(1)}</option>)}
                </select>
                <select value={sort} onChange={e => setSort(e.target.value)} className={selectCls}>
                  <option value="newest">Sort: Newest</option>
                  <option value="deadline">Sort: Deadline</option>
                  <option value="stipend-high">Sort: Stipend (High → Low)</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
          {loading && internships.length === 0
            ? Array.from({ length: 6 }).map((_, i) => <div key={i}>{skeletonCard()}</div>)
            : internships.map(item => (
                <InternshipCard key={item.id} item={item} isBookmarked={bookmarkedIds.has(item.id)} onToggleBookmark={toggleBookmark} navigate={navigate} />
              ))
          }
        </section>

        {/* Empty State */}
        {!loading && internships.length === 0 && (
          <section className="flex flex-col items-center justify-center py-xl text-center">
            <div className="w-20 h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-md mx-auto">
              <span className="material-symbols-outlined text-[40px] text-outline-variant">search_off</span>
            </div>
            <h2 className="font-h3 text-h3 text-on-surface mb-xs">No internships found</h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto mb-md">Try adjusting your search criteria or clearing all filters.</p>
            <button onClick={clearFilters} className="px-6 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-surface-tint transition-colors inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">filter_alt_off</span> Clear All Filters
            </button>
          </section>
        )}

        {/* Load More */}
        {hasMore && !loading && (
          <section className="mt-lg flex flex-col items-center gap-sm">
            <button onClick={() => loadInternships(false)} className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-label-md text-label-md hover:bg-primary hover:text-on-primary transition-colors inline-flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">expand_more</span> Load More Internships
            </button>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}

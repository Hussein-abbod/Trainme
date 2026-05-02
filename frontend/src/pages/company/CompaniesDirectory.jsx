import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Companies } from '../../api/index.js';
import { getMediaUrl } from '../../api/client.js';
import { Spinner } from '../../utils/helpers.jsx';

export default function CompaniesDirectory() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Companies.list().then(data => setCompanies(data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter(c => c.company_name.toLowerCase().includes(search.toLowerCase()) || (c.industry && c.industry.toLowerCase().includes(search.toLowerCase())));

  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-grow max-w-[1200px] w-full mx-auto px-gutter py-lg pb-24">
        <div className="mb-lg flex flex-col md:flex-row gap-4 justify-between items-center">
          <div>
            <h1 className="font-h2 text-on-surface mb-xs">Companies Directory</h1>
            <p className="font-body-md text-on-surface-variant">Explore top employers hiring interns on TrainMe.</p>
          </div>
          <div className="relative w-full md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or industry..." className="w-full pl-10 pr-4 py-2 border border-outline-variant rounded-lg bg-surface-container-lowest outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-xl"><Spinner className="w-10 h-10 text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-xl text-on-surface-variant">No companies found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
            {filtered.map(company => (
              <div key={company.id} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-md flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-20 h-20 rounded-full bg-surface-container-low border border-surface-variant flex items-center justify-center mb-sm overflow-hidden">
                  {company.logo_url ? <img src={getMediaUrl(company.logo_url)} alt={company.company_name} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-[32px] text-outline">domain</span>}
                </div>
                <h3 className="font-h3 text-on-surface mb-1">{company.company_name}</h3>
                <p className="font-label-sm text-on-surface-variant mb-sm">{company.industry || 'Various Industries'}</p>
                {company.location && <p className="text-xs text-outline flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span> {company.location}</p>}
                <div className="mt-auto pt-md w-full">
                  <div className="text-xs text-primary bg-primary/5 py-1.5 rounded-md w-full font-medium">Hiring on TrainMe</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

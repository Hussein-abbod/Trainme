import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';
import { Companies, Internships } from '../../api/index.js';
import { getMediaUrl } from '../../api/client.js';
import { Spinner, formatDate } from '../../utils/helpers.jsx';

export default function PublicCompanyProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [company, setCompany] = useState(null);
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const compData = await Companies.getCompany(id);
        setCompany(compData);
        // We fetch all internships and filter by company id
        // Since there's no direct endpoint, this works for demo
        const allInternships = await Internships.list({ limit: 100 });
        const companyInternships = allInternships.filter(i => i.company?.id === compData.id);
        setInternships(companyInternships);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-background min-h-screen flex flex-col antialiased">
        <Navbar />
        <div className="flex-grow flex justify-center items-center"><Spinner className="w-10 h-10 text-primary" /></div>
        <Footer />
      </div>
    );
  }

  if (!company) {
    return (
      <div className="bg-background min-h-screen flex flex-col antialiased">
        <Navbar />
        <div className="flex-grow flex justify-center items-center text-on-surface-variant">Company not found.</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-grow max-w-[1000px] w-full mx-auto px-gutter py-lg pb-24">
        
        {/* Cover & Profile Section */}
        <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl overflow-hidden shadow-sm mb-lg">
          <div className="h-40 bg-gradient-to-r from-primary/20 to-primary/10"></div>
          
          <div className="px-lg pb-lg">
            <div className="flex flex-col md:flex-row gap-6 md:items-end -mt-12 md:-mt-16 relative">
              
              {/* Logo */}
              <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-2xl border-4 border-surface-container-lowest shadow-md overflow-hidden flex items-center justify-center shrink-0">
                {company.logo_url ? (
                  <img src={getMediaUrl(company.logo_url)} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-[48px] md:text-[64px] text-outline">domain</span>
                )}
              </div>

              {/* Text and Button */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-grow md:pb-2">
                <div className="mt-1 md:mt-0">
                  <h1 className="font-h2 text-on-surface mb-1">{company.company_name}</h1>
                  <p className="font-label-md text-on-surface-variant flex items-center gap-2 flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[16px]">business_center</span>
                      {company.industry || 'Various Industries'}
                    </span>
                    {company.location && (
                      <span className="flex items-center gap-1 before:content-['•'] before:mr-2">
                        <span className="material-symbols-outlined text-[16px]">location_on</span>
                        {company.location}
                      </span>
                    )}
                  </p>
                </div>
                
                <button 
                  onClick={() => navigate(`/messages?user_id=${company.user_id}&name=${encodeURIComponent(company.company_name)}`)}
                  className="bg-primary text-on-primary px-6 py-2.5 rounded-xl font-label-md hover:bg-surface-tint shadow-sm transition-all flex items-center gap-2 shrink-0"
                >
                  <span className="material-symbols-outlined text-[20px]">chat</span>
                  Send Message
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Details & Internships Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
          {/* About Company */}
          <div className="md:col-span-2 flex flex-col gap-md">
            <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-md">
              <h2 className="font-h3 text-on-surface mb-sm">About Us</h2>
              <div className="text-on-surface-variant text-sm whitespace-pre-wrap leading-relaxed">
                {company.description || 'This company has not provided a description yet.'}
              </div>
              
              {(company.website_url || company.contact_email) && (
                <div className="mt-md pt-md border-t border-surface-variant flex flex-col gap-2">
                  {company.website_url && (
                    <a href={company.website_url.startsWith('http') ? company.website_url : `https://${company.website_url}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-primary text-sm hover:underline">
                      <span className="material-symbols-outlined text-[18px]">language</span> {company.website_url}
                    </a>
                  )}
                  {company.contact_email && (
                    <a href={`mailto:${company.contact_email}`} className="flex items-center gap-2 text-primary text-sm hover:underline">
                      <span className="material-symbols-outlined text-[18px]">mail</span> {company.contact_email}
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Active Internships */}
            <div>
              <h2 className="font-h3 text-on-surface mb-sm">Active Internships</h2>
              {internships.length === 0 ? (
                <div className="bg-surface-container-low border border-surface-variant rounded-2xl p-lg text-center text-on-surface-variant">
                  No active internships at the moment.
                </div>
              ) : (
                <div className="flex flex-col gap-sm">
                  {internships.map(internship => (
                    <div key={internship.id} className="bg-surface-container-lowest border border-surface-variant rounded-xl p-md hover:border-primary transition-colors flex justify-between items-center group">
                      <div>
                        <h3 className="font-label-md text-on-surface mb-1 group-hover:text-primary transition-colors">{internship.title}</h3>
                        <div className="flex gap-4 text-xs text-on-surface-variant">
                          {internship.location && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">location_on</span>{internship.location}</span>}
                          {internship.work_type && <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">work</span><span className="capitalize">{internship.work_type}</span></span>}
                        </div>
                      </div>
                      <Link to={`/internship/${internship.id}`} className="px-4 py-2 border border-outline-variant text-on-surface rounded-lg text-sm hover:bg-surface-container">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-md">
            <div className="bg-surface-container-lowest border border-surface-variant rounded-2xl p-md">
              <h3 className="font-label-md text-on-surface mb-sm">Company Size</h3>
              <p className="text-sm text-on-surface-variant mb-md">{company.company_size || 'Not specified'}</p>

              <h3 className="font-label-md text-on-surface mb-sm">Member Since</h3>
              <p className="text-sm text-on-surface-variant">{company.created_at ? formatDate(company.created_at) : 'Recently'}</p>
            </div>
          </div>
        </div>

      </main>
      <Footer />
    </div>
  );
}

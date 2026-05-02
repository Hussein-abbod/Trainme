import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';

export default function Privacy() {
  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-grow max-w-3xl w-full mx-auto px-gutter py-xl">
        <h1 className="font-h1 text-on-surface mb-lg">Privacy Policy</h1>
        <div className="prose max-w-none text-on-surface-variant space-y-md">
          <p>Last updated: May 2026</p>
          <h2 className="font-h3 text-on-surface mt-lg mb-xs">1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as your name, email address, university details, and CVs when you register for an account or apply for an internship.</p>
          <h2 className="font-h3 text-on-surface mt-lg mb-xs">2. How We Use Information</h2>
          <p>We use the information to connect students with employers, communicate updates regarding your applications, and improve our platform services.</p>
          <h2 className="font-h3 text-on-surface mt-lg mb-xs">3. Data Security</h2>
          <p>Your data is stored securely and is only shared with employers when you explicitly apply for their internship postings.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

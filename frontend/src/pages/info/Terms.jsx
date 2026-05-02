import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';

export default function Terms() {
  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-grow max-w-3xl w-full mx-auto px-gutter py-xl">
        <h1 className="font-h1 text-on-surface mb-lg">Terms of Service</h1>
        <div className="prose max-w-none text-on-surface-variant space-y-md">
          <p>Last updated: May 2026</p>
          <h2 className="font-h3 text-on-surface mt-lg mb-xs">1. Acceptance of Terms</h2>
          <p>By accessing and using TrainMe, you accept and agree to be bound by the terms and provision of this agreement.</p>
          <h2 className="font-h3 text-on-surface mt-lg mb-xs">2. User Conduct</h2>
          <p>Students agree to provide accurate information in their profiles. Companies agree to use the platform solely for recruitment purposes and maintain professional communication.</p>
          <h2 className="font-h3 text-on-surface mt-lg mb-xs">3. Account Termination</h2>
          <p>We reserve the right to terminate accounts that violate our terms or engage in fraudulent activities.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

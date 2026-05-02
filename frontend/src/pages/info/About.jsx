import Navbar from '../../components/Navbar.jsx';
import Footer from '../../components/Footer.jsx';

export default function About() {
  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      <Navbar />
      <main className="flex-grow max-w-3xl w-full mx-auto px-gutter py-xl">
        <h1 className="font-h1 text-on-surface mb-lg">About TrainMe</h1>
        <div className="prose max-w-none text-on-surface-variant space-y-md">
          <p className="text-lg">TrainMe is Malaysia's premier platform dedicated exclusively to university internships and early-career training opportunities.</p>
          <h2 className="font-h2 text-on-surface mt-xl mb-sm">Our Mission</h2>
          <p>We bridge the gap between academic learning and practical industry experience. Our goal is to empower every Malaysian student to find a quality internship that matches their skills, while helping companies discover fresh, ambitious talent.</p>
          <h2 className="font-h2 text-on-surface mt-xl mb-sm">Why We Built TrainMe</h2>
          <p>Traditional job portals are cluttered with senior roles, making it hard for students to find entry-level opportunities. We created a noise-free environment where every post is a training opportunity.</p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

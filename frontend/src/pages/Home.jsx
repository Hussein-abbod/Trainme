import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer.jsx';

function Counter({ target, suffix = '+' }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      const start = performance.now();
      const animate = (now) => {
        const ease = 1 - Math.pow(1 - Math.min((now - start) / 2000, 1), 3);
        el.textContent = Math.floor(target * ease).toLocaleString() + suffix;
        if (ease < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
      obs.unobserve(el);
    }, { threshold: 0.5 });
    if (el) obs.observe(el);
    return () => obs.disconnect();
  }, [target, suffix]);
  return <span ref={ref}>0{suffix}</span>;
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background antialiased">
      <nav className="fixed top-0 w-full z-50 border-b border-gray-200 shadow-sm bg-white font-fustat text-sm font-medium">
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center h-20">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[20px] filled-icon">school</span>
            </div>
            <span className="text-2xl font-black text-teal-600 tracking-tighter">TrainMe</span>
          </Link>
          <div className="hidden md:flex space-x-8 items-center">
            <a href="#students" className="text-gray-600 hover:text-teal-700 transition-all">For Students</a>
            <a href="#companies" className="text-gray-600 hover:text-teal-700 transition-all">For Companies</a>
            <a href="#mission" className="text-gray-600 hover:text-teal-700 transition-all">Mission</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="hidden md:block font-label-md text-label-md text-primary hover:text-primary-container transition-colors">Login</Link>
            <Link to="/register" className="bg-primary text-on-primary px-sm py-xs rounded-full font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm">Join Now</Link>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-[80px]">
        {/* Hero */}
        <section className="relative bg-surface-container-lowest overflow-hidden border-b border-surface-variant">
          <div className="max-w-container-max mx-auto px-gutter py-xl lg:py-[120px] grid grid-cols-1 lg:grid-cols-2 gap-lg items-center">
            <div className="z-10">
              <h1 className="font-h1 text-h1 text-on-surface mb-md">Stop Searching.<br/><span className="text-primary">Start Training.</span></h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg max-w-2xl">
                TrainMe: Your First Step into the Industry. A dedicated platform built for the Malaysian ecosystem connecting university students with companies ready to mentor the next generation.
              </p>
              <div className="flex flex-col sm:flex-row gap-sm">
                <Link to="/register" className="bg-primary text-on-primary px-lg py-sm rounded-full font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm text-center">Get Started</Link>
                <a href="#mission" className="border border-outline px-lg py-sm rounded-full font-label-md text-label-md text-on-surface hover:bg-surface-container transition-colors text-center">Learn More</a>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-sm border border-surface-variant">
              <img alt="Students collaborating" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDED4eym50DkzKBtr9m1wf_7aH73-aGn7i6PS19jdOFiyA3Em2dwaCzbngrC7KvXxqzKrRrUHHfxrXzOEQRJoQLK2mYiTgJ5LR6CtKa7EQWT1AdrmOnN5OMIMedMPXc4eWy5LtZYwMr7mYiMUyrS6SXrltxDkD5NrjnhYnc4X2JDL6YOZWJI1rIEQkrFL6QxKC22WNXCw7ibJEq-e86JstWhBmdrG2Jv68kiXDA8TWhsdcCXtRyGxhbfHaoCAzHoeJkc-pl94ojtG8" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="bg-surface-container-lowest py-xl border-b border-surface-variant">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="text-center mb-lg">
              <span className="inline-flex items-center justify-center px-sm py-xs bg-primary-container/10 text-primary font-label-sm text-label-sm rounded-full mb-sm">Simple Process</span>
              <h2 className="font-h2 text-h2 text-on-surface">How It Works</h2>
              <p className="font-body-lg text-body-lg text-on-surface-variant mt-xs max-w-xl mx-auto">Three simple steps to kickstart your career</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              {[
                { num: 1, icon: 'person_add', title: 'Create Your Profile', desc: 'Sign up, upload your CV, and showcase your skills.' },
                { num: 2, icon: 'explore',    title: 'Discover Internships', desc: 'Browse curated listings by industry, location, and stipend.' },
                { num: 3, icon: 'send',       title: 'Apply & Track',        desc: 'One-click apply and track your application status in real-time.' },
              ].map(step => (
                <div key={step.num} className="bg-surface-container-lowest p-md rounded-xl border border-surface-variant text-center hover:border-primary hover:shadow-md transition-all duration-300 group">
                  <div className="w-14 h-14 bg-primary text-on-primary rounded-full flex items-center justify-center mx-auto mb-md text-xl font-bold shadow-md group-hover:scale-110 transition-transform">{step.num}</div>
                  <div className="w-12 h-12 bg-primary-container/10 rounded-full flex items-center justify-center mx-auto mb-sm">
                    <span className="material-symbols-outlined text-primary text-[28px] filled-icon">{step.icon}</span>
                  </div>
                  <h3 className="font-h3 text-h3 text-on-surface mb-xs">{step.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="bg-surface-container py-xl border-b border-surface-variant">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-md mb-xl">
              {[
                { target: 2500, suffix: '+', label: 'Students Registered' },
                { target: 180,  suffix: '+', label: 'Partner Companies' },
                { target: 650,  suffix: '+', label: 'Internships Posted' },
                { target: 92,   suffix: '%', label: 'Placement Rate' },
              ].map(s => (
                <div key={s.label} className="text-center p-md">
                  <div className="font-h1 text-h1 text-primary mb-xs"><Counter target={s.target} suffix={s.suffix} /></div>
                  <p className="font-label-md text-label-md text-on-surface-variant">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <p className="font-label-md text-label-md text-outline mb-md uppercase tracking-widest">Trusted by students from</p>
              <div className="flex flex-wrap justify-center items-center gap-x-lg gap-y-md">
                {['UM','MMU','APU','UiTM','UTM',"Taylor's"].map(uni => (
                  <div key={uni} className="flex items-center gap-xs px-md py-sm bg-surface-container-lowest rounded-full border border-surface-variant">
                    <span className="material-symbols-outlined text-primary text-[20px] filled-icon">school</span>
                    <span className="font-label-md text-label-md text-on-surface-variant font-semibold">{uni}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mission */}
        <section id="mission" className="bg-surface-container py-xl border-y border-surface-variant">
          <div className="max-w-3xl mx-auto px-gutter text-center">
            <span className="material-symbols-outlined text-primary text-[48px] mb-sm filled-icon">flag</span>
            <h2 className="font-h2 text-h2 text-on-surface mb-md">Our Mission</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
              Our goal is to empower every Malaysian student to find a quality internship that matches their skills. We believe that the right training placement is the foundation of a successful career, bridging the gap between Malaysian universities and the corporate world.
            </p>
          </div>
        </section>

        {/* Gateway */}
        <section className="bg-surface-container-lowest py-xl">
          <div className="max-w-container-max mx-auto px-gutter">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div id="students" className="relative overflow-hidden rounded-2xl border border-surface-variant p-lg flex flex-col justify-between min-h-[300px] group hover:border-primary transition-colors">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className="inline-flex items-center px-sm py-xs bg-primary-container/10 text-primary font-label-sm text-label-sm rounded-full mb-sm">For Students</span>
                    <h3 className="font-h2 text-h2 text-on-surface mb-sm">Looking for your first break?</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">Create your profile and upload your CV to discover exclusive internship opportunities.</p>
                  </div>
                  <div className="mt-md">
                    <Link to="/register/student" className="bg-primary text-on-primary px-md py-sm rounded-full font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm inline-block">Join as Student</Link>
                  </div>
                </div>
              </div>
              <div id="companies" className="rounded-2xl border border-surface-variant p-lg flex flex-col justify-between min-h-[300px] bg-surface-container-low group hover:border-[#005f5f] transition-colors">
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <span className="inline-flex items-center px-sm py-xs bg-tertiary/10 text-tertiary font-label-sm text-label-sm rounded-full mb-sm">For Employers</span>
                    <h3 className="font-h2 text-h2 text-on-surface mb-sm">Looking for fresh perspectives?</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant max-w-sm">Post internship offers and manage your talent pool with our streamlined ATS.</p>
                  </div>
                  <div className="mt-md">
                    <Link to="/register/company" className="bg-[#005f5f] text-on-primary px-md py-sm rounded-full font-label-md text-label-md hover:bg-primary transition-colors shadow-sm inline-block">Join as Company</Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

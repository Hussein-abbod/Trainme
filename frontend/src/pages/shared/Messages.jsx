import { useState } from 'react';
import Navbar from '../../components/Navbar.jsx';
import CompanyNavbar from '../../components/CompanyNavbar.jsx';
import Footer from '../../components/Footer.jsx';
import { useAuth } from '../../context/AuthContext.jsx';

export default function Messages() {
  const { user } = useAuth();
  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      {user?.role === 'company' ? <CompanyNavbar /> : <Navbar />}
      <main className="flex-grow max-w-[1200px] w-full mx-auto px-gutter py-lg flex flex-col">
        <h1 className="font-h2 text-on-surface mb-lg">Messages</h1>
        
        <div className="bg-surface-container-lowest border border-surface-variant rounded-xl flex-grow flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <span className="material-symbols-outlined text-[64px] text-outline-variant mb-sm">chat_bubble_outline</span>
            <h2 className="font-h3 text-on-surface mb-xs">Messaging Coming Soon</h2>
            <p className="text-on-surface-variant max-w-md mx-auto">
              We are working hard to bring direct messaging between students and employers to TrainMe. Stay tuned!
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

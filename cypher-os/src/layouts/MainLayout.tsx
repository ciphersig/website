import React from 'react';
import { Navbar } from '@/components/templates/endless/sections/navbar';
import { Footer } from '@/components/templates/endless/sections/footer';

interface MainLayoutProps {
  children: React.ReactNode;
  fullBleed?: boolean;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ children, fullBleed = false }) => {
  return (
    <div className="min-h-screen flex flex-col bg-black text-white">
      <Navbar />
      <main className={`flex-1 ${fullBleed ? '' : 'max-w-6xl w-full mx-auto px-5 py-16'}`}>
        {children}
      </main>
      <Footer />
    </div>
  );
};

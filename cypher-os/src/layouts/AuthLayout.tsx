import React from 'react';
import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center p-4 bg-black text-white">
      <Link to="/" className="flex items-center gap-3 mb-8 group">
        <div className="size-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center group-hover:bg-white/15 transition-colors">
          <Shield className="size-6 text-white" />
        </div>
        <div>
          <span className="text-xl font-medium text-white block leading-none">CIPHER OS</span>
          <span className="text-xs text-neutral-500 block mt-1">Authentication gateway</span>
        </div>
      </Link>

      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0F0D0F] p-8">
        <div className="mb-6 pb-4 border-b border-white/10 text-center">
          <h1 className="text-lg font-medium text-neutral-100">{title}</h1>
          <p className="text-xs text-neutral-500 mt-1">{subtitle}</p>
        </div>
        {children}
      </div>

      <div className="mt-8">
        <Link to="/" className="text-xs text-neutral-500 hover:text-white transition-colors">
          ← Return to home
        </Link>
      </div>
    </div>
  );
};

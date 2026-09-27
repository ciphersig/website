import React from 'react';
import { Link } from 'react-router-dom';
import { WordsReveal } from '@/components/templates/endless/lib/animations';
import { EndlessButton } from '@/components/ui/endless-ui';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white">
      <div className="max-w-md w-full rounded-2xl border border-white/10 bg-[#0F0D0F] p-8 text-center space-y-6">
        <WordsReveal
          as="h1"
          className="text-4xl font-medium text-neutral-100"
          text="404 — Page not found"
          step={0.1}
          duration={0.6}
        />
        <p className="text-sm text-neutral-400 leading-relaxed">
          The requested page does not exist within the CYPHER OS directory.
        </p>
        <Link to="/">
          <EndlessButton variant="primary" className="w-full">
            Return to home
          </EndlessButton>
        </Link>
      </div>
    </div>
  );
};

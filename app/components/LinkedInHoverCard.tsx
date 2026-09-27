'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LinkedInHoverCardProps {
  name: string;
  fullName: string;
  href: string;
  className?: string;
  children: React.ReactNode;
}

export function LinkedInHoverCard({
  name,
  fullName,
  href,
  className = '',
  children,
}: LinkedInHoverCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const handleNavigate = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(href, '_blank', 'noopener,noreferrer');
  };

  return (
    <span
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        onClick={handleNavigate}
      >
        {children}
      </a>

      <AnimatePresence>
        {isOpen && (
          <div
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 pb-2.5 z-50 pointer-events-auto"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div
              onClick={handleNavigate}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.95 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-[260px] bg-[#f5f5f7] text-zinc-900 rounded-2xl p-4 shadow-[0_20px_45px_-8px_rgba(0,0,0,0.65),0_0_0_1px_rgba(0,0,0,0.08)] cursor-pointer text-left select-none group transition-all duration-200 hover:shadow-[0_24px_50px_-6px_rgba(0,0,0,0.75)]"
              style={{
                fontFamily: 'var(--font-geist-sans), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              {/* Header Title */}
              <div className="font-semibold text-[13.5px] text-zinc-900 tracking-tight leading-snug">
                Visit LinkedIn Profile
              </div>

              {/* Subtitle */}
              <div className="text-[11.5px] text-zinc-500 font-normal mt-0.5 leading-snug">
                Redirect to {fullName}&apos;s LinkedIn
              </div>

              {/* Footer info row */}
              <div className="mt-3.5 pt-2.5 border-t border-zinc-200/70 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
                <span>Click to redirect</span>
                <span className="flex items-center gap-1 text-blue-600 font-semibold tracking-wider uppercase text-[9.5px]">
                  LinkedIn
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="10"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </span>
  );
}

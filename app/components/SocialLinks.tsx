'use client';

import { BASE_PATH } from '../constants/config';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { memo, useState, useEffect } from 'react';
import { SoundToggle } from './SoundToggle';

interface SocialLinksProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
  iconSize?: number;
  isVisible?: boolean;
  animateOnce?: boolean; // If true, animate once and stay visible

  // Optional, screen-specific actions
  showEmailButton?: boolean;
  onEmailClick?: () => void;
  showRevealButton?: boolean;
  onRevealClick?: () => void;
}

const SocialLinksComponent = ({ 
  showBackButton = false, 
  onBackClick, 
  iconSize = 45,
  isVisible = true,
  animateOnce = false,
  showEmailButton = false,
  onEmailClick,
  showRevealButton = false,
  onRevealClick,
}: SocialLinksProps) => {
  const [hasAnimated, setHasAnimated] = useState(false);
  
  // Track if we've animated once - use setTimeout to avoid setState during render
  useEffect(() => {
    if (animateOnce && isVisible && !hasAnimated) {
      const timer = setTimeout(() => {
        setHasAnimated(true);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isVisible, animateOnce, hasAnimated]);
  
  // For animateOnce mode: animate in once, then stay visible
  // For normal mode: follow isVisible prop
  const shouldBeVisible = animateOnce ? (hasAnimated || isVisible) : isVisible;

  const emailButtonEnabled = Boolean(showEmailButton || onEmailClick);

  // Mobile-friendly sizing (keeps desktop unchanged)
  const effectiveIconSize = iconSize;
  
  return (
    <motion.div 
      className="absolute md:bottom-8 sm:bottom-15 bottom-15 left-1/2 transform -translate-x-1/2 flex items-center gap-3 sm:gap-4"
      initial={{
        filter: 'blur(10px)',
        opacity: 0,
        y: 20,
      }}
      animate={{
        filter: shouldBeVisible ? 'blur(0px)' : 'blur(10px)',
        opacity: shouldBeVisible ? 1 : 0,
        y: shouldBeVisible ? 0 : 20,
      }}
      transition={{
        duration: shouldBeVisible ? 0.6 : 0.4,
        delay: shouldBeVisible && !hasAnimated ? 0.85 : 0,
        ease: [0.23, 1, 0.32, 1],
      }}
    >
      <AnimatePresence mode="wait">
        {showBackButton && onBackClick && (
          <motion.div
            key="back-button-group"
            className="flex items-center gap-3 sm:gap-4"
            initial={{
              opacity: 0,
              x: -10,
              filter: 'blur(8px)',
            }}
            animate={{
              opacity: 1,
              x: 0,
              filter: 'blur(0px)',
            }}
            exit={{
              opacity: 0,
              x: -10,
              filter: 'blur(8px)',
            }}
            transition={{
              duration: 0.4,
              ease: [0.23, 1, 0.32, 1],
            }}
          >
            {/* Back Button */}
            <button
              onClick={onBackClick}
              className="text-white hover:opacity-70 transition-opacity"
              aria-label="Go back"
            >
              <Image src={`${BASE_PATH}/back-arrow.svg`} alt="Back" width={effectiveIconSize} height={effectiveIconSize} />
            </button>
            
            {/* Divider */}
            <div className="w-px h-6 bg-white opacity-30"></div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Social Links */}
      <a 
        href="https://www.instagram.com/cipher_meswcoe26?utm_source=qr&igsi=MzA2aXlseHhyY3Vj" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:opacity-70 transition-opacity"
        aria-label="Instagram"
      >
        <Image
          src={`${BASE_PATH}/instagram.svg`}
          alt="Instagram"
          width={effectiveIconSize}
          height={effectiveIconSize}
          priority
          loading="eager"
        />
      </a>
      <a 
        href="https://www.linkedin.com/in/cipher-sig-238a3843a" 
        target="_blank" 
        rel="noopener noreferrer"
        className="text-white hover:opacity-70 transition-opacity"
        aria-label="LinkedIn"
      >
        <Image
          src={`${BASE_PATH}/linkedin.svg`}
          alt="LinkedIn"
          width={effectiveIconSize}
          height={effectiveIconSize}
          priority
          loading="eager"
        />
      </a>

      {/* Admin Link */}
      <a
        href="/admin"
        className="text-white/50 hover:text-white transition-opacity"
        aria-label="Admin Portal"
        title="Admin Portal"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width={effectiveIconSize * 0.7} height={effectiveIconSize * 0.7} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
      </a>

      {/* Cases-only: WhatsApp link after LinkedIn / Admin */}
      <AnimatePresence>
        {emailButtonEnabled && (
          <motion.a
            key="whatsapp-button"
            href="https://chat.whatsapp.com/GRXtCB945bN9QLaOAWQUip"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (onEmailClick) {
                onEmailClick();
              }
            }}
            className="text-white hover:opacity-70 transition-opacity cursor-pointer flex items-center justify-center"
            aria-label="WhatsApp"
            initial={{ opacity: 0, y: 8, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 8, filter: 'blur(10px)' }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          >
            <Image
              src={`${BASE_PATH}/whatsapp.svg`}
              alt="WhatsApp"
              width={effectiveIconSize}
              height={effectiveIconSize}
              priority
              loading="eager"
            />
          </motion.a>
        )}
      </AnimatePresence>

      {/* Sound toggle */}
      <SoundToggle iconSize={effectiveIconSize} />

      {/* Wall of Curiosity (Offer): Reveal / Reset Answers Button (after speaker) */}
      <AnimatePresence>
        {showRevealButton && (
          <motion.button
            key="reveal-button"
            type="button"
            onClick={() => {
              if (onRevealClick) {
                onRevealClick();
              } else {
                window.dispatchEvent(new CustomEvent('cyber-reveal-crossword'));
              }
            }}
            className="text-white hover:opacity-70 transition-opacity cursor-pointer flex items-center justify-center"
            aria-label="Toggle Crossword Answers"
            title="Reveal / Reset Answers"
            initial={{ opacity: 0, scale: 0.8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, scale: 0.8, filter: 'blur(6px)' }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
          >
            {/* Transparent Body with Bold White Outline Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={effectiveIconSize * 0.72}
              height={effectiveIconSize * 0.72}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" strokeWidth="2.5" />
            </svg>
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const SocialLinks = memo(SocialLinksComponent);

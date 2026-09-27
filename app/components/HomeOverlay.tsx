'use client';

import { SocialLinks } from './SocialLinks';
import { ScreenIndicator } from './ScreenIndicator';
import type { UseHomeNavigationResult } from '../hooks/useHomeNavigation';

interface HomeOverlayProps {
  nav: UseHomeNavigationResult;
  showHero: boolean;
}

export function HomeOverlay({ nav, showHero }: HomeOverlayProps) {
  if (!showHero) return null;

  const isCases = nav.currentSection === 'cases';
  const isOffer = nav.currentSection === 'offer';

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div className="pointer-events-auto">
        <SocialLinks
          showBackButton={nav.currentSection !== 'hero'}
          onBackClick={nav.handleBackClick}
          isVisible={showHero}
          animateOnce={true}
          showEmailButton={isCases}
          onEmailClick={isCases ? nav.transitions.toContactFromCases : undefined}
          showRevealButton={isOffer}
        />
      </div>
      
      {/* Screen Indicator - always visible */}
      <div className="pointer-events-none">
        <ScreenIndicator currentSection={nav.currentSection} />
      </div>
    </div>
  );
}

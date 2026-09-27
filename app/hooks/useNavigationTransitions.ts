import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Section } from '../constants/config';
import { VIDEO_PATHS } from '../constants/config';
import { homeLogger, contactLogger } from '../utils/logger';
import { videoPlaybackManager } from '../utils/VideoPlaybackManager';
import { useNavigationSound } from './useNavigationSound';
import type { NavigationState, NavigationStateActions, NavigationStateRefs } from './useNavigationState';

// How long (ms) to let the contact UI fade-out animation play before kicking off the
// video transition (which sets isTransitioning=true and hides the contact section).
// The Framer Motion exit duration is 0.4s; we add extra headroom for React commit lag.
const CONTACT_FADEOUT_DELAY_MS = 600;

export interface NavigationTransitionVideoRefs {
  heroVideoRef: React.RefObject<HTMLVideoElement | null>;
  transitionVideoRef: React.RefObject<HTMLVideoElement | null>;
  showreelVideoRef: React.RefObject<HTMLVideoElement | null>;
  aboutStartVideoRef: React.RefObject<HTMLVideoElement | null>;
  aboutVideoRef: React.RefObject<HTMLVideoElement | null>;
  team1VideoRef: React.RefObject<HTMLVideoElement | null>;
  team2VideoRef: React.RefObject<HTMLVideoElement | null>;
  offerVideoRef: React.RefObject<HTMLVideoElement | null>;
  partnerVideoRef: React.RefObject<HTMLVideoElement | null>;
  casesVideoRef: React.RefObject<HTMLVideoElement | null>;
  contactVideoRef: React.RefObject<HTMLVideoElement | null>;
}

export interface UseNavigationTransitionsResult {
  transitions: {
    toShowreel: () => void;
    toCases: () => void;
    toContact: () => void;
    toHero: () => void;
    toAboutFromAboutStart: () => void;
    toAboutStartFromAbout: () => void;
    toTeam1: () => void;
    toTeam2: () => void;
    toOffer: () => void;
    toPartner: () => void;
    toAboutFromTeam1: () => void;
    toTeam1FromTeam2: () => void;
    toTeam2FromOffer: () => void;
    toOfferFromPartner: () => void;
    toCasesFromPartner: () => void;
    toPartnerFromCases: () => void;
    toContactFromCases: () => void;
  };
  transitionToAboutStart: (viaScroll?: boolean) => void;
  transitionToAbout: (viaScroll?: boolean) => void;
  transitionBackToHeroFromAboutStart: (viaScroll?: boolean) => void;
  transitionBackFromContact: (targetOverride?: 'hero' | 'cases') => void;
  handleScrollDown: () => void;
  handleScrollUp: () => void;
  handleBackClick: () => void;
}

export function useNavigationTransitions(
  videoRefs: NavigationTransitionVideoRefs,
  state: NavigationState,
  actions: NavigationStateActions,
  refs: NavigationStateRefs,
  /** True once the opening transition has completed and the hero is shown. */
  pageReady: boolean = false
): UseNavigationTransitionsResult {
  const { playSound } = useNavigationSound();
  const preWarmDoneRef = useRef(false);

  const handleTransition = useCallback(
    (
      targetSection: Section,
      transitionVideo: string,
      targetVideoRef: React.RefObject<HTMLVideoElement | null>,
      isDirectNavigation: boolean = false
    ) => {
      if (refs.isTransitioningRef.current) {
        homeLogger.warn('[Transition] ⛔ Already transitioning — ignoring request', {
          from: state.currentSection,
          to: targetSection,
        });
        return;
      }

      homeLogger.info('[Transition] ▶️ START', {
        from: state.currentSection,
        to: targetSection,
        transitionVideo,
        isDirectNavigation,
        'isTransitioningRef.current': refs.isTransitioningRef.current,
      });

      // --- UI hide for current section ---
      if (state.currentSection === 'hero' && targetSection !== 'hero') {
        homeLogger.debug('[Transition] Hiding hero UI (setHeroVisible false)');
        actions.setHeroVisible(false);
      }
      if (state.currentSection === 'aboutStart' && targetSection !== 'aboutStart') {
        homeLogger.debug('[Transition] Hiding aboutStart UI (setAboutStartVisible false)');
        actions.setAboutStartVisible(false);
      }
      if (targetSection === 'aboutStart') {
        homeLogger.debug('[Transition] Pre-hiding aboutStart UI before transition');
        actions.setAboutStartVisible(false);
      }

      if (isDirectNavigation && state.currentSection === 'hero') {
        homeLogger.debug('[Transition] Saving previousSectionRef = hero (direct nav)');
        refs.previousSectionRef.current = 'hero';
      }

      refs.isTransitioningRef.current = true;
      actions.setIsTransitioning(true);
      actions.setTransitionVideoSrc(transitionVideo);

      homeLogger.info('[Transition] 🚀 START Video Transition', {
        from: state.currentSection,
        to: targetSection,
        transitionVideo,
        isDirectNavigation,
      });

      // --- Sound ---
      if (state.currentSection === 'hero' && targetSection !== 'hero') {
        homeLogger.info('[Transition] 🔊 Playing FORWARD sound (hero → other)');
        playSound('forward');
      } else if (state.currentSection !== 'hero' && targetSection === 'hero') {
        homeLogger.info('[Transition] 🔊 Playing BACKWARD sound (other → hero)');
        playSound('backward');
      } else {
        homeLogger.debug('[Transition] No navigation sound for this route', {
          from: state.currentSection,
          to: targetSection,
        });
      }

      // --- Prepare target video ---
      const targetVideo = targetVideoRef.current;
      if (targetVideo) {
        if (targetSection !== 'contact') {
          videoPlaybackManager.stop(targetVideoRef, true);
        }
        videoPlaybackManager.load(targetVideoRef);
      }

      // --- Transition Video Playback & Completion ---
      const transVideoRef = videoRefs.transitionVideoRef;
      const transVideo = transVideoRef.current;

      let cleanedUp = false;
      let watchdogTimer: ReturnType<typeof setTimeout> | null = null;

      const finishTransition = (reason: string) => {
        if (cleanedUp) return;
        cleanedUp = true;

        if (watchdogTimer) {
          clearTimeout(watchdogTimer);
          watchdogTimer = null;
        }

        if (transVideo) {
          transVideo.pause();
          transVideo.removeEventListener('ended', handleEnded);
          transVideo.removeEventListener('error', handleError);
        }

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            homeLogger.info('[Transition] ✅ Video transition ended → advancing to target section', {
              to: targetSection,
              reason,
            });

            actions.setCurrentSection(targetSection);
            actions.setIsTransitioning(false);
            refs.isTransitioningRef.current = false;

            // Show UI when entering hero or aboutStart
            if (targetSection === 'hero') {
              actions.setHeroVisible(true);
            }
            if (targetSection === 'aboutStart') {
              actions.setAboutStartVisible(true);
            }

            // Start target video playback if present
            if (targetVideo) {
              videoPlaybackManager.play(targetVideoRef).catch((err) => {
                homeLogger.warn('[Transition] ⚠️ Target video play() error after transition', {
                  to: targetSection,
                  error: (err as Error).message,
                });
              });
            }
          });
        });
      };

      const handleEnded = () => {
        finishTransition('ended');
      };

      const handleError = () => {
        homeLogger.warn('[Transition] ⚠️ Transition video element emitted error');
        finishTransition('error');
      };

      if (transVideo) {
        transVideo.loop = false;
        transVideo.removeAttribute('loop');
        videoPlaybackManager.stop(transVideoRef, true);
        videoPlaybackManager.setSrc(transVideoRef, transitionVideo);
        videoPlaybackManager.load(transVideoRef);

        transVideo.addEventListener('ended', handleEnded, { once: true });
        transVideo.addEventListener('error', handleError, { once: true });

        videoPlaybackManager.play(transVideoRef).catch((err) => {
          homeLogger.warn('[Transition] ⚠️ transitionVideo play() failed, completing transition', {
            error: (err as Error).message,
          });
          finishTransition('play_error');
        });

        // Watchdog: fallback if ended event fails to fire
        const armWatchdog = () => {
          if (cleanedUp) return;
          if (watchdogTimer) clearTimeout(watchdogTimer);
          const dur =
            Number.isFinite(transVideo.duration) && transVideo.duration > 0
              ? Math.ceil(transVideo.duration * 1000) + 300
              : 3500;
          watchdogTimer = setTimeout(() => {
            homeLogger.warn('[Transition] ⚠️ Watchdog timeout for transition video');
            finishTransition('watchdog_timeout');
          }, dur);
        };

        if (Number.isFinite(transVideo.duration) && transVideo.duration > 0) {
          armWatchdog();
        } else {
          transVideo.addEventListener('loadedmetadata', armWatchdog, { once: true });
          watchdogTimer = setTimeout(() => {
            homeLogger.warn('[Transition] ⚠️ Initial watchdog fallback');
            finishTransition('watchdog_timeout');
          }, 3500);
        }
      } else {
        // Fallback if ref is not mounted
        watchdogTimer = setTimeout(() => finishTransition('no_ref_fallback'), 850);
      }
    },
    [state.currentSection, actions, refs, videoRefs, playSound]
  );

  // --- Pre-warm transition videos into the VideoPlaybackManager's pool ---
  // Each video gets its own kept-alive <video> element so the browser retains
  // the media buffer (Range-request bytes) for the full session. When the real
  // transitionVideoRef later requests the same URL its byte-range requests are
  // served from the same in-memory media cache, making canplay fire in <100ms
  // instead of waiting for a full CDN round-trip.
  //
  // We run all fetches in parallel (the CDN supports concurrent connections)
  // so even if the user clicks immediately after the hero appears, most
  // buffers will already be populated.
  useEffect(() => {
    if (!pageReady) return;
    if (preWarmDoneRef.current) return;
    preWarmDoneRef.current = true;

    // All videos reachable from hero — most important ones first
    const videos = [
      VIDEO_PATHS.heroToCases,
      VIDEO_PATHS.eventsBackground,
      VIDEO_PATHS.heroToContact,
      VIDEO_PATHS.heroToShowreel,
      VIDEO_PATHS.heroToAboutStart,
      VIDEO_PATHS.casesToHero,
      VIDEO_PATHS.contactToHero,
      VIDEO_PATHS.showreelToHero,
      VIDEO_PATHS.aboutStartToHero,
    ].filter(Boolean) as string[];

    homeLogger.debug('[Transition] Pre-warming transition videos into pool (parallel)', {
      count: videos.length,
    });

    // Fire parallel preloads — videoPlaybackManager keeps the elements alive.
    videos.forEach((src) => {
      homeLogger.debug(`[Transition] Pre-warm: loading ${src.split('/').pop()}`);
      videoPlaybackManager.preloadVideo(src, { timeout: 60000 }).catch(() => { });
    });

    // No cleanup needed — pool elements are intentionally long-lived.
  }, [pageReady]);

  const transitions = useMemo(
    () => ({
      toShowreel: () =>
        handleTransition('showreel', VIDEO_PATHS.heroToShowreel, videoRefs.showreelVideoRef, true),
      toCases: () =>
        handleTransition('cases', VIDEO_PATHS.heroToCases, videoRefs.casesVideoRef, true),
      toContact: () => {
        refs.previousSectionRef.current = 'hero';
        handleTransition('contact', VIDEO_PATHS.heroToContact, videoRefs.contactVideoRef, true);
      },
      toHero: () => {
        let reverseVideo = '';
        switch (state.currentSection) {
          case 'showreel':
            reverseVideo = VIDEO_PATHS.showreelToHero;
            break;
          case 'aboutStart':
            reverseVideo = VIDEO_PATHS.aboutStartToHero;
            break;
          case 'cases':
            reverseVideo = VIDEO_PATHS.casesToHero;
            break;
          case 'contact':
            reverseVideo = VIDEO_PATHS.contactToHero;
            break;
          default:
            homeLogger.warn('[transitions.toHero] No reverse video for section', { currentSection: state.currentSection });
            return;
        }
        refs.previousSectionRef.current = 'hero';
        handleTransition('hero', reverseVideo, videoRefs.heroVideoRef);
      },

      toAboutFromAboutStart: () =>
        handleTransition('about', VIDEO_PATHS.aboutStartToAbout, videoRefs.aboutVideoRef),
      toAboutStartFromAbout: () =>
        handleTransition('aboutStart', VIDEO_PATHS.aboutToAboutStart, videoRefs.aboutStartVideoRef),

      toTeam1: () => handleTransition('team1', VIDEO_PATHS.aboutToTeam, videoRefs.team1VideoRef),
      toTeam2: () => handleTransition('team2', VIDEO_PATHS.team1ToTeam2, videoRefs.team2VideoRef),
      toOffer: () => handleTransition('offer', VIDEO_PATHS.team2ToOffer, videoRefs.offerVideoRef),
      toPartner: () =>
        handleTransition('partner', VIDEO_PATHS.offerToPartner, videoRefs.partnerVideoRef),

      toAboutFromTeam1: () =>
        handleTransition('about', VIDEO_PATHS.teamToAbout, videoRefs.aboutVideoRef),
      toTeam1FromTeam2: () =>
        handleTransition('team1', VIDEO_PATHS.team2ToTeam1, videoRefs.team1VideoRef),
      toTeam2FromOffer: () =>
        handleTransition('team2', VIDEO_PATHS.offerToTeam2, videoRefs.team2VideoRef),
      toOfferFromPartner: () =>
        handleTransition('offer', VIDEO_PATHS.partnerToOffer, videoRefs.offerVideoRef),

      toCasesFromPartner: () =>
        handleTransition('cases', VIDEO_PATHS.partnerToCases, videoRefs.casesVideoRef),
      toPartnerFromCases: () =>
        handleTransition('partner', VIDEO_PATHS.casesToPartner, videoRefs.partnerVideoRef),
      toContactFromCases: () => {
        refs.previousSectionRef.current = 'cases';
        handleTransition('contact', VIDEO_PATHS.casesToContact, videoRefs.contactVideoRef);
      },
    }),
    [state.currentSection, handleTransition, videoRefs, refs]
  );

  const transitionToAboutStart = useCallback(
    (viaScroll: boolean = false) => {
      homeLogger.info('[transitionToAboutStart] viaScroll=' + viaScroll);
      handleTransition('aboutStart', VIDEO_PATHS.heroToAboutStart, videoRefs.aboutStartVideoRef, true);
    },
    [handleTransition, videoRefs.aboutStartVideoRef]
  );

  const transitionToAbout = useCallback(
    (viaScroll: boolean = false) => {
      homeLogger.info('[transitionToAbout] viaScroll=' + viaScroll);
      handleTransition('about', VIDEO_PATHS.aboutStartToAbout, videoRefs.aboutVideoRef);
    },
    [handleTransition, videoRefs.aboutVideoRef]
  );

  const transitionBackToHeroFromAboutStart = useCallback(
    (viaScroll: boolean = false) => {
      homeLogger.info('[transitionBackToHeroFromAboutStart] viaScroll=' + viaScroll);
      refs.previousSectionRef.current = 'hero';
      handleTransition('hero', VIDEO_PATHS.aboutStartToHero, videoRefs.heroVideoRef);
    },
    [handleTransition, videoRefs.heroVideoRef, refs]
  );

  /**
   * Leave the contact section:
   * 1. Immediately set isLeavingContactRef (sync guard) + fade out contact UI
   * 2. After CONTACT_FADEOUT_DELAY_MS, begin the actual video transition so the
   *    section stays visible long enough for the fade-out animation to complete.
   */
  const transitionBackFromContact = useCallback((targetOverride?: 'hero' | 'cases') => {
    contactLogger.info('[transitionBackFromContact] 🚀 Triggered', {
      currentSection: state.currentSection,
      isTransitioningRef: refs.isTransitioningRef.current,
      isLeavingContactRef: refs.isLeavingContactRef.current,
      contactVideoReadyState: videoRefs.contactVideoRef.current?.readyState,
      contactVideoDuration: videoRefs.contactVideoRef.current?.duration,
      contactVideoCurrentTime: videoRefs.contactVideoRef.current?.currentTime,
      targetOverride,
    });

    if (state.currentSection !== 'contact') {
      contactLogger.warn('[transitionBackFromContact] ⛔ Not on contact section — ignoring', {
        currentSection: state.currentSection,
      });
      return;
    }

    if (refs.isTransitioningRef.current) {
      contactLogger.warn('[transitionBackFromContact] ⛔ Already transitioning (isTransitioningRef) — ignoring');
      return;
    }

    // Guard against double-fire during the fade window (isTransitioningRef is still false here)
    if (refs.isLeavingContactRef.current) {
      contactLogger.warn('[transitionBackFromContact] ⛔ Already leaving contact (isLeavingContactRef) — ignoring');
      return;
    }

    // Set the sync guard immediately so any re-render during the delay can't re-trigger
    refs.isLeavingContactRef.current = true;
    contactLogger.info('[transitionBackFromContact] ✅ isLeavingContactRef=true (sync guard set)');

    // Step 1: Fade out the contact UI elements immediately
    contactLogger.info('[transitionBackFromContact] Step 1 — Fade out UI (setLeavingContact=true, setContactVisible=false)');
    actions.setLeavingContact(true);
    actions.setContactVisible(false);

    // Pause the contact loop video
    const contactEl = videoRefs.contactVideoRef.current;
    if (contactEl) {
      const dur = Number.isFinite(contactEl.duration) ? contactEl.duration : null;
      contactLogger.debug('[transitionBackFromContact] contactEl state', {
        duration: dur,
        currentTime: contactEl.currentTime,
        paused: contactEl.paused,
        readyState: contactEl.readyState,
      });
      try {
        if (dur) contactEl.currentTime = Math.max(0, dur - 0.01);
      } catch (e) {
        contactLogger.warn('[transitionBackFromContact] Could not seek contactEl to near-end', e);
      }
      try {
        contactEl.pause();
        contactEl.playbackRate = 1.0;
        contactLogger.debug('[transitionBackFromContact] contactEl paused');
      } catch (e) {
        contactLogger.warn('[transitionBackFromContact] Could not pause contactEl', e);
      }
    } else {
      contactLogger.warn('[transitionBackFromContact] ⚠️ contactVideoRef.current is null');
    }

    const prevSection = refs.previousSectionRef.current;
    const isFromCases = prevSection === 'cases' || !prevSection;
    const targetSection: Section = targetOverride ?? (isFromCases ? 'cases' : 'hero');
    const transitionVideo = targetSection === 'hero' ? VIDEO_PATHS.contactToHero : VIDEO_PATHS.contactToCases;
    const targetVideoRef = targetSection === 'hero' ? videoRefs.heroVideoRef : videoRefs.casesVideoRef;

    // Reset previousSectionRef for the next navigation
    refs.previousSectionRef.current = targetSection;

    // Step 2: After fade-out animation completes, begin the video transition
    contactLogger.info(`[transitionBackFromContact] Step 2 — Scheduling handleTransition to ${targetSection} (${transitionVideo}) in ${CONTACT_FADEOUT_DELAY_MS}ms`);
    setTimeout(() => {
      contactLogger.info('[transitionBackFromContact] Step 2 — Delay elapsed → calling handleTransition', {
        targetSection,
        transitionVideo,
        isTransitioningRef: refs.isTransitioningRef.current,
        isLeavingContactRef: refs.isLeavingContactRef.current,
      });
      // Clear the leaving guard — isTransitioningRef takes over from here
      refs.isLeavingContactRef.current = false;
      handleTransition(targetSection, transitionVideo, targetVideoRef);
    }, CONTACT_FADEOUT_DELAY_MS);
  }, [
    state.currentSection,
    actions,
    videoRefs.contactVideoRef,
    videoRefs.heroVideoRef,
    videoRefs.casesVideoRef,
    handleTransition,
    refs,
  ]);

  const handleScrollDown = useCallback(() => {
    homeLogger.debug('[handleScrollDown] currentSection=' + state.currentSection);
    switch (state.currentSection) {
      case 'hero':
        transitionToAboutStart(true);
        break;
      case 'aboutStart':
        transitionToAbout(true);
        break;
      case 'about':
        transitions.toTeam1();
        break;
      case 'team1':
        transitions.toTeam2();
        break;
      case 'team2':
        transitions.toOffer();
        break;
      case 'offer':
        transitions.toPartner();
        break;
      case 'partner':
        refs.previousSectionRef.current = 'partner';
        transitions.toCasesFromPartner();
        break;
      case 'cases':
        transitions.toContactFromCases();
        break;
      case 'contact':
        homeLogger.info('[handleScrollDown] On contact → scrolling down exits to hero via Homepage_contact_reverse');
        transitionBackFromContact('hero');
        break;
      default:
        homeLogger.debug('[handleScrollDown] No scroll-down handler for', state.currentSection);
    }
  }, [state.currentSection, transitions, transitionToAboutStart, transitionToAbout, transitionBackFromContact, refs]);

  const handleScrollUp = useCallback(() => {
    homeLogger.debug('[handleScrollUp] currentSection=' + state.currentSection);
    switch (state.currentSection) {
      case 'showreel':
        transitions.toHero();
        break;
      case 'aboutStart':
        transitionBackToHeroFromAboutStart(true);
        break;
      case 'about':
        transitions.toAboutStartFromAbout();
        break;
      case 'team1':
        transitions.toAboutFromTeam1();
        break;
      case 'team2':
        transitions.toTeam1FromTeam2();
        break;
      case 'offer':
        transitions.toTeam2FromOffer();
        break;
      case 'partner':
        transitions.toOfferFromPartner();
        break;
      case 'cases':
        homeLogger.debug('[handleScrollUp] cases → previousSectionRef=' + refs.previousSectionRef.current);
        if (refs.previousSectionRef.current === 'hero') {
          transitions.toHero();
        } else {
          refs.previousSectionRef.current = 'partner';
          transitions.toPartnerFromCases();
        }
        break;
      case 'contact':
        homeLogger.info('[handleScrollUp] On contact → calling transitionBackFromContact');
        transitionBackFromContact();
        break;
      default:
        homeLogger.debug('[handleScrollUp] No scroll-up handler for', state.currentSection);
    }
  }, [state.currentSection, transitions, transitionBackToHeroFromAboutStart, transitionBackFromContact, refs]);

  const handleBackClick = useCallback(() => {
    homeLogger.info('[handleBackClick] currentSection=' + state.currentSection);
    switch (state.currentSection) {
      case 'showreel':
      case 'cases':
        transitions.toHero();
        break;
      case 'aboutStart':
        transitionBackToHeroFromAboutStart(false);
        break;
      case 'about':
        transitions.toAboutStartFromAbout();
        break;
      case 'team1':
        transitions.toAboutFromTeam1();
        break;
      case 'team2':
        transitions.toTeam1FromTeam2();
        break;
      case 'offer':
        transitions.toTeam2FromOffer();
        break;
      case 'partner':
        transitions.toOfferFromPartner();
        break;
      case 'contact':
        homeLogger.info('[handleBackClick] On contact → calling transitionBackFromContact');
        transitionBackFromContact();
        break;
      default:
        homeLogger.debug('[handleBackClick] No back handler for', state.currentSection);
    }
  }, [state.currentSection, transitions, transitionBackToHeroFromAboutStart, transitionBackFromContact]);

  return {
    transitions,
    transitionToAboutStart,
    transitionToAbout,
    transitionBackToHeroFromAboutStart,
    transitionBackFromContact,
    handleScrollDown,
    handleScrollUp,
    handleBackClick,
  };
}

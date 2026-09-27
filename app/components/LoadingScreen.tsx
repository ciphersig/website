'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { VIDEO_PATHS, BASE_PATH } from '../constants/config';
import { MetalFx } from 'metal-fx';

interface LoadingScreenProps {
  progress?: number;
  isVisible: boolean;
  onLoopEndAfterComplete?: () => void;
  onSkip?: () => void;
}

// Minimum time the loading screen stays visible (ms).
const MIN_DISPLAY_TIME = 2000;
const HOLD_DURATION_MS = 3000;
const RADIUS = 19;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const LOADING_VIDEO_SRC = VIDEO_PATHS.loading;

export function LoadingScreen({ isVisible, progress = 0, onLoopEndAfterComplete, onSkip }: LoadingScreenProps) {
  const clamped = Math.max(0, Math.min(100, progress));
  const firedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isLoadedRef = useRef(false);
  const lastTimeRef = useRef(0);
  const [isAudioMuted, setIsAudioMuted] = useState(false);

  // Hold-to-skip cutscene state (3s click-and-hold)
  const [holdProgress, setHoldProgress] = useState(0); // 0 to 1
  const [isHolding, setIsHolding] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const holdRafRef = useRef<number | null>(null);
  const holdStartTimeRef = useRef<number | null>(null);
  const skipTriggeredRef = useRef(false);

  const cancelHold = useCallback(() => {
    if (skipTriggeredRef.current) return;
    setIsHolding(false);
    holdStartTimeRef.current = null;
    if (holdRafRef.current) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = null;
    }
    setHoldProgress(0);
  }, []);

  const startHold = useCallback((e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
    }
    if (skipTriggeredRef.current) return;

    setIsHolding(true);
    const startTime = performance.now();
    holdStartTimeRef.current = startTime;

    const tick = (now: number) => {
      if (!holdStartTimeRef.current || skipTriggeredRef.current) return;
      const elapsed = now - holdStartTimeRef.current;
      const p = Math.min(1, elapsed / HOLD_DURATION_MS);
      setHoldProgress(p);

      if (p >= 1) {
        skipTriggeredRef.current = true;
        setIsHolding(false);
        setHoldProgress(1);
        if (videoRef.current) {
          try {
            videoRef.current.pause();
          } catch {
            // ignore
          }
        }
        onSkip?.();
        return;
      }

      holdRafRef.current = requestAnimationFrame(tick);
    };

    if (holdRafRef.current) {
      cancelAnimationFrame(holdRafRef.current);
    }
    holdRafRef.current = requestAnimationFrame(tick);
  }, [onSkip]);

  // Window-level cancel listener while holding to ensure release outside element cancels cleanly
  useEffect(() => {
    if (!isHolding) return;

    const handleGlobalPointerUp = () => {
      cancelHold();
    };

    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

    return () => {
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, [isHolding, cancelHold]);

  useEffect(() => {
    return () => {
      if (holdRafRef.current) {
        cancelAnimationFrame(holdRafRef.current);
      }
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;
    startHold(e);
  };

  const handlePointerUp = () => {
    cancelHold();
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    cancelHold();
  };

  const handlePointerCancel = () => {
    setIsHovered(false);
    cancelHold();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === ' ' || e.key === 'Enter') && !isHolding) {
      e.preventDefault();
      startHold(e);
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      cancelHold();
    }
  };

  useEffect(() => {
    firedRef.current = false;
    isLoadedRef.current = false;
    lastTimeRef.current = 0;
  }, []);

  useEffect(() => {
    if (clamped >= 100) {
      isLoadedRef.current = true;
    }
  }, [clamped]);

  // Handle video audio playback & browser autoplay restrictions
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let unmounted = false;

    const startPlayback = async () => {
      video.volume = 1.0;
      video.muted = false;

      try {
        await video.play();
        if (!unmounted) {
          setIsAudioMuted(false);
        }
      } catch (err) {
        console.warn('[LoadingScreen] Autoplay with audio restricted by browser, falling back to muted play:', err);
        if (unmounted) return;

        // Fall back to muted playback so the preloader video still plays visually immediately
        video.muted = true;
        setIsAudioMuted(true);
        try {
          await video.play();
        } catch (mutedErr) {
          console.warn('[LoadingScreen] Muted play also failed:', mutedErr);
        }

        // Unmute on the very first user activation anywhere on the page
        const handleUserActivation = () => {
          if (videoRef.current) {
            videoRef.current.muted = false;
            videoRef.current.volume = 1.0;
            videoRef.current.play().catch(() => {});
            setIsAudioMuted(false);
          }
        };

        window.addEventListener('click', handleUserActivation, { once: true, capture: true });
        window.addEventListener('touchstart', handleUserActivation, { once: true, capture: true });
        window.addEventListener('keydown', handleUserActivation, { once: true, capture: true });
        window.addEventListener('pointerdown', handleUserActivation, { once: true, capture: true });

        return () => {
          window.removeEventListener('click', handleUserActivation, true);
          window.removeEventListener('touchstart', handleUserActivation, true);
          window.removeEventListener('keydown', handleUserActivation, true);
          window.removeEventListener('pointerdown', handleUserActivation, true);
        };
      }
    };

    let cleanupFn: (() => void) | undefined;
    startPlayback().then(cleanup => {
      cleanupFn = cleanup;
    });

    return () => {
      unmounted = true;
      if (cleanupFn) cleanupFn();
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const checkComplete = () => {
      if (firedRef.current) return;

      const dur = video.duration;
      const curr = video.currentTime;

      // Detect if video is near the end (within 0.25s of duration) or if loop reset happened
      const nearEnd = Number.isFinite(dur) && dur > 0 && curr >= dur - 0.25;
      const loopReset = lastTimeRef.current > 1 && curr < 0.5;

      lastTimeRef.current = curr;

      if (isLoadedRef.current && (nearEnd || loopReset || video.ended)) {
        firedRef.current = true;
        onLoopEndAfterComplete?.();
      }
    };

    const handleEnded = () => {
      if (firedRef.current) return;
      if (isLoadedRef.current) {
        firedRef.current = true;
        onLoopEndAfterComplete?.();
      }
    };

    video.addEventListener('timeupdate', checkComplete);
    video.addEventListener('ended', handleEnded);

    // Fallback timer: If video fails or takes too long, complete safely after 60s max
    const fallbackTimer = setTimeout(() => {
      if (!firedRef.current && isLoadedRef.current) {
        firedRef.current = true;
        onLoopEndAfterComplete?.();
      }
    }, 60000);

    return () => {
      video.removeEventListener('timeupdate', checkComplete);
      video.removeEventListener('ended', handleEnded);
      clearTimeout(fallbackTimer);
    };
  }, [onLoopEndAfterComplete]);

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;

    const nextMuted = !isAudioMuted;
    video.muted = nextMuted;
    video.volume = 1.0;
    if (!nextMuted && video.paused) {
      video.play().catch(() => {});
    }
    setIsAudioMuted(nextMuted);
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Fullscreen background video — cover-fills the viewport like object-fit:cover */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <video
          ref={videoRef}
          src={LOADING_VIDEO_SRC}
          autoPlay
          playsInline
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'calc(max(100vw, 100vh * (16/9)))',
            height: 'calc(max(100vh, 100vw * (9/16)))',
            objectFit: 'cover',
          }}
        />
      </div>

      {/* Scrim over the video */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" aria-hidden />

      {/* Sound toggle button on loading screen (top-right corner) */}
      <button
        type="button"
        onClick={toggleSound}
        className="absolute top-6 right-6 z-10 flex items-center justify-center p-3 rounded-full bg-black/40 border border-white/30 backdrop-blur-md hover:bg-black/60 transition-all text-white"
        aria-label={isAudioMuted ? 'Unmute loading video audio' : 'Mute loading video audio'}
        title={isAudioMuted ? 'Click to enable audio' : 'Audio enabled'}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${BASE_PATH}/sound.svg`}
          alt="Sound control"
          className={`w-6 h-6 transition-opacity ${isAudioMuted ? 'opacity-40' : 'opacity-100'}`}
        />
      </button>

      {/* Hold-to-Skip Button (bottom-right corner, logo-only with hover pop-up box) */}
      {onSkip && (
        <div className="absolute bottom-6 right-6 sm:bottom-8 sm:right-8 z-20 flex flex-col items-center">
          {/* Pop-up box on hover */}
          <div
            className={`absolute bottom-full mb-3 flex flex-col items-center pointer-events-none transition-all duration-200 ease-out ${
              isHovered || isHolding
                ? 'opacity-100 scale-100 translate-y-0'
                : 'opacity-0 scale-95 translate-y-1.5'
            }`}
          >
            <div className="px-3 py-1.5 rounded-lg bg-black/85 border border-white/30 backdrop-blur-md shadow-2xl flex items-center">
              <span className="font-mono text-[11px] font-semibold tracking-widest text-white uppercase whitespace-nowrap">
                {isHolding ? 'HOLD TO SKIP...' : 'HOLD TO SKIP'}
              </span>
            </div>
            {/* Pop-up triangle arrow notch */}
            <div className="w-0 h-0 border-x-4 border-x-transparent border-t-[5px] border-t-white/30" />
          </div>

          {/* Circular Button - Logo Only with MetalFx liquid metal effect */}
          <MetalFx preset="chromatic" strength={1} variant="circle">
            <button
              type="button"
              aria-label="Hold to skip preloader"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerEnter={handlePointerEnter}
              onPointerLeave={handlePointerLeave}
              onPointerCancel={handlePointerCancel}
              onFocus={() => setIsHovered(true)}
              onBlur={() => {
                setIsHovered(false);
                cancelHold();
              }}
              onKeyDown={handleKeyDown}
              onKeyUp={handleKeyUp}
              onContextMenu={(e) => e.preventDefault()}
              className={`relative w-12 h-12 rounded-full border backdrop-blur-md flex items-center justify-center cursor-pointer select-none touch-none transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${
                isHolding
                  ? 'bg-black/85 border-white/70 scale-95 shadow-[0_0_20px_rgba(255,255,255,0.4)]'
                  : 'bg-black/40 border-white/30 hover:border-white/60 hover:bg-black/60 shadow-lg'
              }`}
            >
              {/* Radial progress ring around the perimeter */}
              <svg
                className="absolute inset-0 w-full h-full -rotate-90 transform pointer-events-none"
                viewBox="0 0 48 48"
              >
                {/* Background circle track */}
                <circle
                  cx="24"
                  cy="24"
                  r={RADIUS}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.2)"
                  strokeWidth="2.5"
                />
                {/* Animated progress circle */}
                <circle
                  cx="24"
                  cy="24"
                  r={RADIUS}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  strokeDasharray={CIRCUMFERENCE}
                  strokeDashoffset={CIRCUMFERENCE * (1 - holdProgress)}
                  strokeLinecap="round"
                  style={{
                    transition: isHolding ? 'none' : 'stroke-dashoffset 200ms ease-out',
                    filter: isHolding ? 'drop-shadow(0 0 4px rgba(255, 255, 255, 0.9))' : 'none',
                  }}
                />
              </svg>

              {/* Skip logo / double chevron icon in center */}
              <div className="relative flex items-center justify-center text-white pointer-events-none">
                <svg className="w-5 h-5 fill-current ml-0.5" viewBox="0 0 24 24">
                  <path d="M5.5 5v14l9-7-9-7zm8 0v14l9-7-9-7z" />
                </svg>
              </div>
            </button>
          </MetalFx>
        </div>
      )}
    </div>
  );
}


'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { BASE_PATH, VIDEO_PATHS } from '../constants/config';

interface ShowreelSectionProps {
  isVisible: boolean;
  onBackClick?: () => void;
}

type AudioSnapshot = { el: HTMLAudioElement; paused: boolean; volume: number };

// Precise pixel coordinates of the full TV monitor screen inside Showreel_png_transparent.png (2920x2920)
const PNG_NATURAL_SIZE = 2920;
const SCREEN_BOX = {
  left: 580,
  top: 790,
  width: 1800,
  height: 1115,
};

function calculateBoxRect(containerWidth: number, containerHeight: number) {
  const containerAR = containerWidth / containerHeight;
  const imgAR = 1.0; // 2920 / 2920 = 1.0

  let imgDisplayWidth: number;
  let imgDisplayHeight: number;
  let imgOffsetX: number;
  let imgOffsetY: number;

  if (containerAR > imgAR) {
    // Landscape / wide container (object-fit: cover scales to width and centers vertically)
    imgDisplayWidth = containerWidth;
    imgDisplayHeight = containerWidth;
    imgOffsetX = 0;
    imgOffsetY = (containerHeight - containerWidth) / 2;
  } else {
    // Portrait container (object-fit: cover scales to height and centers horizontally)
    imgDisplayHeight = containerHeight;
    imgDisplayWidth = containerHeight;
    imgOffsetX = (containerWidth - containerHeight) / 2;
    imgOffsetY = 0;
  }

  const scale = imgDisplayWidth / PNG_NATURAL_SIZE;

  const left = Math.round(imgOffsetX + SCREEN_BOX.left * scale);
  const top = Math.round(imgOffsetY + SCREEN_BOX.top * scale);
  const width = Math.round(SCREEN_BOX.width * scale);
  const height = Math.round(SCREEN_BOX.height * scale);

  return { left, top, width, height };
}

export function ShowreelSection({ isVisible, onBackClick }: ShowreelSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioSnapshotRef = useRef<AudioSnapshot[] | null>(null);

  // Exact screen box rect calculated to match the full TV monitor in the background
  const [windowRect, setWindowRect] = useState<{
    left: number;
    top: number;
    width: number;
    height: number;
  } | null>(null);

  // Dynamic showreel video URL fetched from Cloudinary via API
  const [showreelUrl, setShowreelUrl] = useState<string>(VIDEO_PATHS.loading);

  useEffect(() => {
    let isMounted = true;
    async function loadActiveShowreel() {
      try {
        const res = await fetch('/api/showreel');
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data?.videoUrl) {
          setShowreelUrl(data.videoUrl);
        }
      } catch (err) {
        console.warn('Failed to fetch active showreel:', err);
      }
    }
    loadActiveShowreel();
    return () => {
      isMounted = false;
    };
  }, []);

  // Compute box dimensions immediately on mount and on every window resize
  useEffect(() => {
    const update = () => {
      if (typeof window === 'undefined') return;
      const rect = calculateBoxRect(window.innerWidth, window.innerHeight);
      setWindowRect(rect);
    };

    update();
    window.addEventListener('resize', update);
    window.addEventListener('orientationchange', update);

    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('orientationchange', update);
    };
  }, []);

  const muteSiteAudio = () => {
    if (typeof document === 'undefined') return;
    const audios = Array.from(document.querySelectorAll<HTMLAudioElement>('audio[data-bg-audio="true"]'));
    audioSnapshotRef.current = audios.map(a => ({ el: a, paused: a.paused, volume: a.volume }));

    audios.forEach(a => {
      try {
        a.volume = 0;
        a.pause();
      } catch {
        // ignore
      }
    });
  };

  const restoreSiteAudio = () => {
    const snapshots = audioSnapshotRef.current;
    if (snapshots) {
      snapshots.forEach(({ el, paused, volume }) => {
        try {
          el.volume = volume;
          if (!paused) void el.play().catch(() => {});
        } catch {
          // ignore
        }
      });
      audioSnapshotRef.current = null;
    }
  };

  // Pause video and restore background audio when navigating away from Showreel
  useEffect(() => {
    if (!isVisible) {
      if (videoRef.current) {
        try {
          videoRef.current.pause();
          videoRef.current.currentTime = 0;
        } catch {
          // ignore
        }
      }
      restoreSiteAudio();
    }
  }, [isVisible]);

  const handlePlay = () => {
    muteSiteAudio();
  };

  const handleEnded = () => {
    restoreSiteAudio();
  };

  return (
    <section
      ref={sectionRef as any}
      className={`fixed inset-0 w-full h-screen transition-opacity duration-0 ${
        isVisible ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 pointer-events-none z-0'
      }`}
    >
      {/* Black fallback background */}
      <div className="absolute inset-0 bg-black" aria-hidden />

      {/* Frame background image (layer 1) */}
      <div className="absolute inset-0 z-[1] pointer-events-none">
        <div className="absolute inset-0">
          <Image
            src={`${BASE_PATH}/Showreel_png_transparent.png`}
            alt="Showreel frame"
            fill
            priority
            sizes="100vw"
            style={{
              objectFit: 'cover',
              objectPosition: 'center',
            }}
          />
        </div>
      </div>

      {/* TOP LAYER: Video player positioned exactly covering the full central TV monitor */}
      <div className="absolute inset-0 z-20 pointer-events-auto">
        {windowRect && (
          <div
            className="absolute overflow-hidden bg-black flex items-center justify-center rounded-[8px] shadow-[0_0_40px_rgba(0,0,0,0.95)] border border-white/20"
            style={{
              left: windowRect.left,
              top: windowRect.top,
              width: windowRect.width,
              height: windowRect.height,
            }}
          >
            <video
              ref={videoRef}
              key={showreelUrl}
              src={showreelUrl}
              controls
              playsInline
              preload="auto"
              onPlay={handlePlay}
              onEnded={handleEnded}
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Optional back click area */}
      {onBackClick && (
        <button
          type="button"
          aria-label="Back"
          onClick={onBackClick}
          className="absolute top-4 left-4 z-30 text-white/0"
        />
      )}
    </section>
  );
}

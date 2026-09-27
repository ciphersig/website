'use client';

import { RefObject, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { VideoBackground } from './VideoBackground';
import { useManagedVideoPlayback } from '../hooks/useManagedVideoPlayback';
import { WobbleCard } from './ui/wobble-card';
import { cn } from '@/lib/utils';

interface ContactSectionProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  videoSrc: string;
  isVisible: boolean;
  isTransitioning?: boolean;
  showUI: boolean;
}

interface ArticleItem {
  title: string;
  description: string;
  link: string;
  image_url?: string;
  source_id?: string;
  pubDate?: string;
}

const FALLBACK_ARTICLES: ArticleItem[] = [
  {
    title: 'Zero-Day Vulnerability Discovered in Core Web Infrastructure',
    description: 'Security researchers uncover critical memory safety flaws affecting enterprise Linux kernels and cloud nodes.',
    source_id: 'CYBER DEFENSE',
    pubDate: new Date().toISOString(),
    link: 'https://thehackernews.com',
    image_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80',
  },
  {
    title: 'AI-Powered Threat Detection Outpaces Traditional SIEM Systems',
    description: 'Autonomous neural networks demonstrate sub-second response times against multi-vector cyber incursions.',
    source_id: 'AI INTEL',
    pubDate: new Date().toISOString(),
    link: 'https://thehackernews.com',
    image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
  },
  {
    title: 'Post-Quantum Cryptography: Migration to Lattice Standards',
    description: 'Global cybersecurity councils finalize post-quantum encryption standards to protect critical assets.',
    source_id: 'QUANTUM LABS',
    pubDate: new Date().toISOString(),
    link: 'https://thehackernews.com',
    image_url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=800&q=80',
  },
  {
    title: 'Global Ransomware Infrastructure Dismantled by Cyber Command',
    description: 'Coordinated international operations seize command-and-control servers across multiple jurisdictions.',
    source_id: 'CYBER COMMAND',
    pubDate: new Date().toISOString(),
    link: 'https://thehackernews.com',
    image_url: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=800&q=80',
  },
];

const CARD_LAYOUT_CONFIG = [
  {
    containerClass:
      'col-span-1 lg:col-span-2 bg-gradient-to-br from-[#1c080e]/95 via-[#0e0c14]/90 to-[#08080c]/95 border border-red-500/30 hover:border-red-500/70 shadow-[0_0_35px_rgba(239,68,68,0.08)] hover:shadow-[0_0_40px_rgba(239,68,68,0.22)] h-[165px] sm:h-[180px] md:h-[195px] lg:h-[205px]',
    innerClass: '!p-3 sm:!p-4 md:!p-5 flex flex-row items-stretch gap-4 justify-between',
    badgeColor: 'text-red-400',
    tagBg: 'bg-red-500/15 border-red-500/30 text-red-300',
    accentBorder: 'border-red-500/70',
    hoverText: 'group-hover:text-red-400',
    hasRightImage: true,
  },
  {
    containerClass:
      'col-span-1 bg-gradient-to-br from-[#071622]/95 via-[#0a1018]/90 to-[#08080c]/95 border border-cyan-500/30 hover:border-cyan-500/70 shadow-[0_0_35px_rgba(6,182,212,0.08)] hover:shadow-[0_0_40px_rgba(6,182,212,0.22)] h-[165px] sm:h-[180px] md:h-[195px] lg:h-[205px]',
    innerClass: '!p-3 sm:!p-4 md:!p-5 flex flex-col justify-between',
    badgeColor: 'text-cyan-400',
    tagBg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-300',
    accentBorder: 'border-cyan-500/70',
    hoverText: 'group-hover:text-cyan-400',
    hasRightImage: false,
  },
  {
    containerClass:
      'col-span-1 bg-gradient-to-br from-[#160824]/95 via-[#0e0918]/90 to-[#08080c]/95 border border-purple-500/30 hover:border-purple-500/70 shadow-[0_0_35px_rgba(168,85,247,0.08)] hover:shadow-[0_0_40px_rgba(168,85,247,0.22)] h-[165px] sm:h-[180px] md:h-[195px] lg:h-[205px]',
    innerClass: '!p-3 sm:!p-4 md:!p-5 flex flex-col justify-between',
    badgeColor: 'text-purple-400',
    tagBg: 'bg-purple-500/15 border-purple-500/30 text-purple-300',
    accentBorder: 'border-purple-500/70',
    hoverText: 'group-hover:text-purple-400',
    hasRightImage: false,
  },
  {
    containerClass:
      'col-span-1 lg:col-span-2 bg-gradient-to-br from-[#051812]/95 via-[#091312]/90 to-[#08080c]/95 border border-emerald-500/30 hover:border-emerald-500/70 shadow-[0_0_35px_rgba(16,185,129,0.08)] hover:shadow-[0_0_40px_rgba(16,185,129,0.22)] h-[165px] sm:h-[180px] md:h-[195px] lg:h-[205px]',
    innerClass: '!p-3 sm:!p-4 md:!p-5 flex flex-row items-stretch gap-4 justify-between',
    badgeColor: 'text-emerald-400',
    tagBg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300',
    accentBorder: 'border-emerald-500/70',
    hoverText: 'group-hover:text-emerald-400',
    hasRightImage: true,
  },
];

export function ContactSection({
  videoRef,
  videoSrc,
  isVisible,
  isTransitioning = false,
  showUI,
}: ContactSectionProps) {
  const [articles, setArticles] = useState<ArticleItem[]>(FALLBACK_ARTICLES);
  const [isLoading, setIsLoading] = useState(true);

  const shouldShow = isVisible && !isTransitioning;

  useManagedVideoPlayback(videoRef, {
    enabled: shouldShow,
    name: 'ContactLoop',
    preloadFirstFrame: true,
  });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!shouldShow) {
      try { video.pause(); } catch { }
      return;
    }
    const handleEnded = () => {
      if (!shouldShow || !showUI || isTransitioning) return;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!showUI || isTransitioning) return;
          try { video.currentTime = 0; } catch { }
          void video.play().catch(() => { });
        });
      });
    };
    video.addEventListener('ended', handleEnded);
    return () => video.removeEventListener('ended', handleEnded);
  }, [isTransitioning, shouldShow, showUI, videoRef]);

  useEffect(() => {
    if (!isVisible) return;
    const fetchNews = async () => {
      try {
        const res = await fetch(
          'https://newsdata.io/api/1/news?apikey=pub_ed59fb45e5bb4c33b4af745d17425d60&q=cybersecurity%20OR%20AI&language=en'
        );
        const data = await res.json();
        if (data.results && Array.isArray(data.results) && data.results.length > 0) {
          const apiArticles: ArticleItem[] = data.results.slice(0, 4).map((item: any) => ({
            title: item.title || 'CYBER INTELLIGENCE DISPATCH',
            description: item.description || 'Read the full intelligence brief for operational analysis.',
            link: item.link || '#',
            image_url: item.image_url || undefined,
            source_id: item.source_id || 'CYBER INTEL',
            pubDate: item.pubDate || new Date().toISOString(),
          }));

          // Fill up to 4 if API returned fewer than 4
          const combined = [...apiArticles];
          while (combined.length < 4 && combined.length < FALLBACK_ARTICLES.length) {
            combined.push(FALLBACK_ARTICLES[combined.length]);
          }

          setArticles(combined);
        }
      } catch (err) {
        console.error('[Articles] Failed to fetch live articles, using fallback:', err);
        setArticles(FALLBACK_ARTICLES);
      } finally {
        setIsLoading(false);
      }
    };
    fetchNews();
  }, [isVisible]);

  const motionCommon = {
    initial: { filter: 'blur(10px)', opacity: 0, y: 20 },
    animate: { filter: showUI ? 'blur(0px)' : 'blur(10px)', opacity: showUI ? 1 : 0, y: showUI ? 0 : 20 },
    transitionBase: { duration: showUI ? 0.6 : 0.4, ease: [0.23, 1, 0.32, 1] as const },
  };

  const displayArticles = articles.slice(0, 4);

  return (
    <section
      suppressHydrationWarning
      className={`fixed inset-0 w-full h-screen overflow-hidden transition-opacity duration-0 ${shouldShow ? 'opacity-100 z-20' : 'opacity-0 pointer-events-none z-0'
        }`}
    >
      <VideoBackground videoRef={videoRef} src={videoSrc} autoPlay loop={false} />

      {/* Cyber Grid scanline overlay */}
      <div className="absolute inset-0 z-[5] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.7)_100%)]" />
      <div className="absolute inset-0 z-[5] pointer-events-none bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:35px_35px]" />

      <div className="relative z-10 h-full w-full px-4 sm:px-6 md:px-8 overflow-hidden flex flex-col justify-center items-center py-6 sm:py-8 select-none">
        <div className="w-full max-w-6xl mx-auto flex flex-col items-center justify-center">
          {/* Header */}
          <motion.div
            initial={motionCommon.initial}
            animate={motionCommon.animate}
            transition={{ ...motionCommon.transitionBase, delay: 0 }}
            className="mb-3 sm:mb-4 md:mb-5 text-center shrink-0"
          >
            <div className="font-mono text-[10px] md:text-[11px] uppercase tracking-[0.35em] text-red-500 mb-1 flex items-center justify-center gap-2">
              <span className="inline-block size-1.5 rounded-full bg-red-500 animate-pulse" />
              <span>// INTELLIGENCE ARCHIVE</span>
              <span className="inline-block size-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-outfit font-black text-white tracking-[0.25em] drop-shadow-[0_0_25px_rgba(255,255,255,0.25)]">
              ARTICLES
            </h1>
            <p className="text-white/60 font-mono text-[11px] sm:text-xs mt-1 tracking-wider">
              LATEST CYBERSECURITY & AI INTELLIGENCE DISPATCHES
            </p>
          </motion.div>

          {/* 4 Wobble Cards Bento Grid */}
          <motion.div
            initial={motionCommon.initial}
            animate={motionCommon.animate}
            transition={{ ...motionCommon.transitionBase, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 w-full"
          >
            {isLoading
              ? CARD_LAYOUT_CONFIG.map((cfg, i) => (
                <div
                  key={i}
                  className={cn(
                    'rounded-2xl animate-pulse bg-white/5 border border-white/10',
                    cfg.containerClass
                  )}
                />
              ))
              : displayArticles.map((article, i) => {
                const cfg = CARD_LAYOUT_CONFIG[i % CARD_LAYOUT_CONFIG.length];
                return (
                  <WobbleCard
                    key={i}
                    containerClassName={cn(
                      'group relative cursor-pointer transition-all duration-300',
                      cfg.containerClass
                    )}
                    className={cfg.innerClass}
                  >
                    {/* Entire Card Click Anchor */}
                    <a
                      href={article.link}
                      target="_blank"
                      rel="noreferrer"
                      className="absolute inset-0 z-20"
                      aria-label={article.title}
                    />

                    {/* Content Column */}
                    <div className="flex-1 flex flex-col justify-between min-w-0 pr-1">
                      <div>
                        {/* Badge Meta Row */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <span className={cn('font-mono text-[10px] sm:text-[11px] font-bold uppercase tracking-wider', cfg.badgeColor)}>
                            DISPATCH #{String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-white/30 text-[10px] font-mono">•</span>
                          <span className={cn('text-[9px] sm:text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border', cfg.tagBg)}>
                            {article.source_id || 'SECURITY'}
                          </span>
                          <span className="text-white/30 text-[10px] font-mono">•</span>
                          <span className="text-white/40 text-[10px] font-mono shrink-0">
                            {article.pubDate
                              ? new Date(article.pubDate).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                              })
                              : 'RECENT'}
                          </span>
                        </div>

                        {/* Article Title */}
                        <h2 className={cn('text-left text-balance text-sm sm:text-base md:text-lg font-bold font-outfit text-white tracking-[-0.01em] leading-snug transition-colors line-clamp-2', cfg.hoverText)}>
                          {article.title}
                        </h2>

                        {/* Article Snippet */}
                        <p className="mt-1.5 text-left text-[11px] sm:text-xs text-neutral-300/80 font-sans line-clamp-2 leading-relaxed">
                          {article.description ||
                            'Read the full intelligence brief for operational analysis and defensive recommendations.'}
                        </p>
                      </div>

                      {/* Card Bottom Read Action */}
                      <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-2">
                        <span className="text-[10px] text-white/35 font-mono tracking-widest uppercase flex items-center gap-1">
                          <span className="size-1 rounded-full bg-white/40" />
                          CONFIDENTIAL DISPATCH
                        </span>
                        <span className={cn('text-[11px] font-mono font-semibold flex items-center gap-1.5 group-hover:translate-x-1 transition-transform', cfg.badgeColor)}>
                          READ INTEL <span aria-hidden="true">➔</span>
                        </span>
                      </div>
                    </div>

                    {/* Right Thumbnail for wide cards */}
                    {cfg.hasRightImage && (
                      <div className="w-32 sm:w-40 md:w-48 lg:w-52 shrink-0 rounded-xl overflow-hidden relative bg-neutral-950 border border-white/10 h-full pointer-events-none">
                        {article.image_url ? (
                          <img
                            src={article.image_url}
                            alt={article.title}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-500"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-red-950/60 to-black flex items-center justify-center font-mono text-[9px] text-red-400 tracking-widest text-center p-2">
                            CYBER INTEL
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </div>
                    )}

                    {/* High-tech corner accent */}
                    <div className={cn('absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 opacity-60 group-hover:opacity-100 transition-opacity', cfg.accentBorder)} />
                  </WobbleCard>
                );
              })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}

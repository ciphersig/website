import { assetUrl } from '../utils/assetUrl';

/**
 * Intelligent preloading strategy:
 * - CRITICAL: Must load before user can interact (loading screen)
 * - HIGH PRIORITY: Load while opening transition plays (~5-8s window)
 * - MEDIUM PRIORITY: Load in background after page is interactive
 * - LOW PRIORITY: Lazy load on-demand when user scrolls
 */

// Utility to detect optimal image variant for device width
export const getOptimalImageVariant = (width?: number): number => {
  const deviceWidth = width ?? (typeof window !== 'undefined' ? window.innerWidth : 1280);
  if (deviceWidth < 768) return 640;
  if (deviceWidth < 1024) return 960;
  if (deviceWidth < 1366) return 1280;
  if (deviceWidth < 1920) return 1600;
  if (deviceWidth < 2560) return 1920;
  return 2560;
};

// Phase 1: CRITICAL - Block loading screen until these load
export const CRITICAL_PRELOAD_IMAGES: string[] = [
  assetUrl('/loading-bg.jpg'),
  assetUrl('/loading-bg.webp'),
  assetUrl('/loading-bg.avif'),
];

// Helper function to generate high-priority images based on viewport
export const getHighPriorityImages = (): string[] => {
  const optimalWidth = getOptimalImageVariant();
  return [
    assetUrl(`/optimized/about--${optimalWidth}.avif`),
    assetUrl(`/optimized/about--${optimalWidth}.webp`),
  ];
};

export const EVENT_SLIDE_PRELOAD_IMAGES: string[] = [
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80',
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
  'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&q=80',
  'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1200&q=80',
];

// Helper function to generate medium-priority images (load in background)
export const getMediumPriorityImages = (): string[] => {
  const optimalWidth = getOptimalImageVariant();
  return [
    assetUrl(`/optimized/team1--${optimalWidth}.avif`),
    assetUrl(`/optimized/team1--${optimalWidth}.webp`),
    assetUrl(`/optimized/team2--${optimalWidth}.avif`),
    assetUrl(`/optimized/team2--${optimalWidth}.webp`),
    assetUrl(`/optimized/offer--${optimalWidth}.avif`),
    assetUrl(`/optimized/offer--${optimalWidth}.webp`),
    assetUrl(`/optimized/partners--${optimalWidth}.avif`),
    assetUrl(`/optimized/partners--${optimalWidth}.webp`),
  ];
};

// Helper function to generate cases section images (card thumbnails + bg)
export const getCasesImages = (): string[] => [
  assetUrl('/cases-bg.png'),
  assetUrl('/Cases_png_transparent.png'),
  assetUrl('/Showreel_png_transparent.png'),
  assetUrl('/events-video-frame.jpg'),
  ...EVENT_SLIDE_PRELOAD_IMAGES,
];

// Phase 3: LOW PRIORITY - Lazy load on-demand
export const LOW_PRIORITY_PRELOAD_IMAGES = {
  cases: getCasesImages(),
};

const widths = [640, 960, 1280, 1600, 1920, 2560, 2920];
const sections = ['about', 'team1', 'team2', 'offer', 'partners'];
const allOptimized: string[] = [];

sections.forEach(sec => {
  widths.forEach(w => {
    allOptimized.push(assetUrl(`/optimized/${sec}--${w}.avif`));
    allOptimized.push(assetUrl(`/optimized/${sec}--${w}.webp`));
  });
});

export const HOME_PRELOAD_IMAGE_PATHS: string[] = [
  assetUrl('/loading-bg.jpg'),
  ...allOptimized,
  ...getCasesImages(),
];

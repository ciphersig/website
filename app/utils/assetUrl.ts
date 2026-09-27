import { BASE_PATH } from '@/app/constants/config';
import { CLOUDINARY_URLS } from '@/app/constants/cloudinaryManifest';

/**
 * Builds a URL for static assets.
 * - Prioritizes high-speed Cloudinary CDN URLs for videos and optimized images.
 * - If NEXT_PUBLIC_ASSET_PREFIX is set, assets load from there.
 * - Otherwise falls back to Next's basePath + local /public.
 */

function normalizePrefix(prefix: string) {
  return prefix.trim().replace(/\/+$/, '');
}

export function assetUrl(p: string): string {
  if (!p) return '/cases-bg.png';
  if (p.startsWith('http://') || p.startsWith('https://') || p.startsWith('data:')) {
    return p;
  }

  const normalizedPath = p.startsWith('/') ? p : `/${p}`;

  // 1. Check Cloudinary CDN delivery
  if (CLOUDINARY_URLS[normalizedPath]) {
    return CLOUDINARY_URLS[normalizedPath];
  }

  // 2. If path is a video or optimized image not yet in manifest, dynamically construct Cloudinary URL
  if (normalizedPath.startsWith('/videos/')) {
    const filename = normalizedPath.replace('/videos/', '');
    return `https://res.cloudinary.com/ititit3w/video/upload/cipherwebsite/videos/${filename}`;
  }
  if (normalizedPath.startsWith('/optimized/')) {
    const filename = normalizedPath.replace('/optimized/', '');
    return `https://res.cloudinary.com/ititit3w/image/upload/cipherwebsite/optimized/${filename}`;
  }

  // 3. Optional asset prefix
  const rawPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX;
  const effectivePrefix = rawPrefix ? normalizePrefix(rawPrefix) : '';
  if (effectivePrefix) {
    return `${effectivePrefix}${normalizedPath}`;
  }

  // 4. Default fallback to local public folder
  return `${BASE_PATH}${normalizedPath}`;
}

import { RefObject } from 'react';
import { assetUrl } from '../utils/assetUrl';
import { getBlobUrl } from '../utils/blobCache';

interface VideoBackgroundProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  src: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: 'none' | 'metadata' | 'auto';
  className?: string;
}

export function VideoBackground({
  videoRef,
  src,
  autoPlay = false,
  loop = false,
  muted = true,
  preload = 'auto',
  className = '',
}: VideoBackgroundProps) {
  const resolvedSrc = src ? getBlobUrl(assetUrl(src)) : undefined;

  return (
    <video
      ref={videoRef}
      src={resolvedSrc}
      autoPlay={autoPlay}
      loop={loop}
      muted={muted}
      playsInline
      preload={preload}
      className={`absolute inset-0 w-full h-full object-cover ${className}`}
    />
  );
}

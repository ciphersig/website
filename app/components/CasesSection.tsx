'use client';

import React, { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { gsap } from 'gsap';
import { motion, AnimatePresence } from 'framer-motion';
import { assetUrl } from '../utils/assetUrl';
import { VIDEO_PATHS } from '../constants/config';
import { homeLogger } from '../utils/logger';
import { supabase } from '../utils/supabase';
import { RegisterModal } from './RegisterModal';
import { CertificateModal } from './CertificateModal';
import { FeedbackModal } from './FeedbackModal';
import { RadialGlowButton } from './ui/radial-glow-button';
import { TeamGrid } from './TeamGrid';

interface CasesSectionProps {
  videoRef: RefObject<HTMLVideoElement | null>;
  videoSrc: string;
  isVisible: boolean;
  onBackClick?: () => void;
  onScrollDownOutside?: () => void;
  onScrollUpOutside?: () => void;
}

type CaseItem = {
  id: string;
  desc: string;
  title: string;
  img: string;
  openIn: 'popup' | 'newtab';
  url: string;
  thm_url?: string;
  htb_url?: string;
  wide?: boolean;
  is_past?: boolean;
  gallery_link?: string;
  certificates_enabled?: boolean;
};

type SlideType = 'intro' | 'event' | 'team';

type SlideData = {
  id: string;
  type: SlideType;
  number: string;
  title: string;
  subtitle: string;
  category: string;
  paragraphLines: string[];
  image: string;
  eventItem?: CaseItem;
};

type AudioSnapshot = { el: HTMLAudioElement; paused: boolean; volume: number };

function toVimeoEmbedUrl(url: string) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (!m) return url;
  return `https://player.vimeo.com/video/${m[1]}?autoplay=1&title=0&byline=0&portrait=0`;
}

function VideoPopup({ title, url, onClose }: { title: string; url: string; onClose: () => void }) {
  return (
    <motion.div
      key={`popup-backdrop-${url}`}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <motion.div
        key={`popup-panel-${url}`}
        className="w-full max-w-4xl rounded-2xl overflow-hidden bg-black shadow-[0_0_50px_rgba(239,68,68,0.3)] border border-red-500/40"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 32, scale: 0.94, filter: 'blur(14px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: 32, scale: 0.94, filter: 'blur(14px)' }}
        transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
      >
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-red-500/20 bg-neutral-950">
          <div className="text-white font-mono font-medium text-sm tracking-wider flex items-center gap-2 truncate pr-4">
            <span className="inline-block w-2 h-2 rounded-full bg-red-500 animate-ping" />
            <span>GUIDELINES/RULES // {title}</span>
          </div>
          <button
            type="button"
            className="text-white/70 hover:text-red-400 font-mono text-sm px-2 py-1 border border-transparent hover:border-red-500/40 rounded transition-colors cursor-pointer"
            onClick={onClose}
            aria-label="Close"
          >
            [ ESC ✕ ]
          </button>
        </div>

        <div className="relative w-full aspect-video bg-black">
          <iframe
            className="absolute inset-0 w-full h-full"
            src={toVimeoEmbedUrl(url)}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={title}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}

function scrambleTextAnimation(element: HTMLElement | null, finalString: string, duration = 1.2) {
  if (!element) return;
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?/Ø';
  const state = { p: 0 };

  return gsap.to(state, {
    duration,
    p: 1,
    ease: 'power2.inOut',
    onUpdate: () => {
      const len = finalString.length;
      const revealCount = Math.floor(state.p * len);
      let result = '';
      for (let i = 0; i < len; i++) {
        if (finalString[i] === '\n') {
          result += '\n';
        } else if (finalString[i] === ' ') {
          result += ' ';
        } else {
          result += i < revealCount
            ? finalString[i]
            : chars[Math.floor(Math.random() * chars.length)];
        }
      }
      element.textContent = result;
    },
    onComplete: () => {
      element.textContent = finalString;
    }
  });
}

// Fallback events if database is empty or offline
const FALLBACK_EVENTS: CaseItem[] = [
  {
    id: 'fb-event-1',
    title: 'CYBER APOCALYPSE CTF',
    desc: 'Flag capture tournament spanning reverse engineering, binary exploitation, cryptography, and offensive web exploitation.',
    img: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80',
    openIn: 'popup',
    url: 'https://vimeo.com/1161472471',
    thm_url: 'https://tryhackme.com',
    htb_url: 'https://hackthebox.com',
    is_past: false,
    certificates_enabled: true,
  },
  {
    id: 'fb-event-2',
    title: 'ZERO-DAY WARGAMES',
    desc: 'Simulated red team vs blue team live engagement in enterprise Active Directory environment with custom rootkit deployment.',
    img: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
    openIn: 'popup',
    url: 'https://vimeo.com/1161465970',
    thm_url: 'https://tryhackme.com',
    is_past: false,
    certificates_enabled: true,
  },
  {
    id: 'fb-event-3',
    title: 'MALWARE ARCHITECTURE 2025',
    desc: 'Deep-dive disassembly workshop uncovering polymorphic packers, evasion techniques, and kernel-level anti-debugging.',
    img: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1200&q=80',
    openIn: 'newtab',
    url: 'https://tryhackme.com',
    gallery_link: 'https://www.instagram.com/cipher_meswcoe26?utm_source=qr&igsi=MzA2aXlseHhyY3Vj',
    is_past: true,
    certificates_enabled: true,
  },
  {
    id: 'fb-event-4',
    title: 'DEFCON WAR ROOM BRIEFING',
    desc: 'Exclusive debrief on advanced persistent threats (APT), side-channel attacks, and quantum-resistant cryptographic standards.',
    img: 'https://images.unsplash.com/photo-1510511459019-5dda7724fd87?w=1200&q=80',
    openIn: 'newtab',
    url: 'https://hackthebox.com',
    gallery_link: 'https://www.instagram.com/cipher_meswcoe26?utm_source=qr&igsi=MzA2aXlseHhyY3Vj',
    is_past: true,
    certificates_enabled: false,
  }
];

export function CasesSection({
  videoRef,
  videoSrc,
  isVisible,
  onBackClick,
  onScrollDownOutside,
  onScrollUpOutside,
}: CasesSectionProps) {
  void videoRef;
  void videoSrc;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const featuredImageContainerRef = useRef<HTMLDivElement | null>(null);
  const titleElRef = useRef<HTMLHeadingElement | null>(null);
  const numberElRef = useRef<HTMLSpanElement | null>(null);
  const descElRef = useRef<HTMLParagraphElement | null>(null);
  const p1ElRef = useRef<HTMLSpanElement | null>(null);
  const p2ElRef = useRef<HTMLSpanElement | null>(null);

  const [casesData, setCasesData] = useState<CaseItem[]>([]);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const activeSlideIndexRef = useRef(0);
  activeSlideIndexRef.current = activeSlideIndex;

  const [registerModal, setRegisterModal] = useState<{ isOpen: boolean; eventId: string | null; title: string | null }>({
    isOpen: false,
    eventId: null,
    title: null
  });
  const [feedbackModal, setFeedbackModal] = useState<{ isOpen: boolean; eventId: string | null; title: string | null }>({
    isOpen: false,
    eventId: null,
    title: null
  });
  const [certificateModal, setCertificateModal] = useState<{ isOpen: boolean; eventName: string | null }>({
    isOpen: false,
    eventName: null
  });
  const [popup, setPopup] = useState<{ title: string; url: string } | null>(null);
  const audioSnapshotRef = useRef<AudioSnapshot[] | null>(null);

  // Video refs for Events First Page (Slide 0) (Background & Center Box)
  const bgVideoRef = useRef<HTMLVideoElement | null>(null);
  const cardVideoRef = useRef<HTMLVideoElement | null>(null);

  // Manage video playback on Events First Page (Slide 0) for both background & center box
  useEffect(() => {
    const bgVideo = bgVideoRef.current;
    const cardVideo = cardVideoRef.current;
    const videos = [bgVideo, cardVideo].filter(Boolean) as HTMLVideoElement[];

    if (!isVisible) {
      videos.forEach(v => {
        v.pause();
        try {
          v.currentTime = 0;
        } catch {
          // ignore
        }
      });
      return;
    }

    if (activeSlideIndex === 0) {
      videos.forEach(v => {
        v.defaultMuted = true;
        v.muted = true;
        v.playsInline = true;
        const p = v.play();
        if (p !== undefined) {
          p.catch(err => {
            homeLogger.debug('[CasesSection] Video play deferred:', err);
          });
        }
      });
    } else {
      videos.forEach(v => v.pause());
    }
  }, [isVisible, activeSlideIndex]);

  // Audio muting / restore during video popup
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
    const snaps = audioSnapshotRef.current;
    if (!snaps) return;
    snaps.forEach(({ el, paused, volume }) => {
      try {
        el.volume = volume;
        if (!paused) void el.play().catch(() => { });
      } catch {
        // ignore
      }
    });
    audioSnapshotRef.current = null;
  };

  useEffect(() => {
    if (!popup) {
      restoreSiteAudio();
      return;
    }
    muteSiteAudio();
    return () => {
      restoreSiteAudio();
    };
  }, [popup]);

  // Fetch events from Supabase with realtime updates
  useEffect(() => {
    async function fetchCases() {
      try {
        const { data, error } = await supabase
          .from('events')
          .select('id, title, description, image_url, url, thm_url, htb_url, certificates_enabled, is_past, gallery_link, open_in, wide')
          .order('created_at', { ascending: false });

        if (error || !data || data.length === 0) {
          setCasesData(FALLBACK_EVENTS);
          return;
        }

        const formattedData: CaseItem[] = (data as any[]).map(event => ({
          id: event.id,
          title: event.title || 'CYBER OPERATION',
          desc: event.description || '',
          img: event.image_url || 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80',
          openIn: event.open_in === 'newtab' ? 'newtab' : 'popup',
          url: event.url || '',
          thm_url: event.thm_url,
          htb_url: event.htb_url,
          wide: event.wide || false,
          is_past: event.is_past || false,
          gallery_link: event.gallery_link || '',
          certificates_enabled: event.certificates_enabled || false
        }));

        setCasesData(formattedData);
      } catch (err) {
        homeLogger.error('[Cases] Error fetching cases:', err);
        setCasesData(FALLBACK_EVENTS);
      }
    }

    fetchCases();

    const channel = supabase
      .channel('events-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchCases();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Listen to custom modal triggers
  useEffect(() => {
    const handleOpenRegister = (e: any) => {
      setRegisterModal({ isOpen: true, eventId: e.detail.eventId, title: e.detail.title });
    };
    const handleOpenCertificate = (e: any) => {
      setCertificateModal({ isOpen: true, eventName: e.detail.eventName || e.detail.title || 'Cyber Event' });
    };
    window.addEventListener('open-register-modal', handleOpenRegister);
    window.addEventListener('open-certificate-modal', handleOpenCertificate);
    return () => {
      window.removeEventListener('open-register-modal', handleOpenRegister);
      window.removeEventListener('open-certificate-modal', handleOpenCertificate);
    };
  }, []);

  // Build the slides array
  const slides: SlideData[] = useMemo(() => {
    const result: SlideData[] = [];

    // Slide 0: INTRO / INDEX SLIDE
    result.push({
      id: 'intro-slide',
      type: 'intro',
      number: '∅00',
      title: 'CYBER\nEVENTS',
      subtitle: '',
      category: '// OPERATIONS & BRIEFINGS',
      paragraphLines: [],
      image: assetUrl('/events-video-frame.jpg'),
    });

    // Current & Past Event slides (Current first, then Past)
    const currentEvents = casesData.filter(e => !e.is_past);
    const pastEvents = casesData.filter(e => e.is_past);
    const allEvents = [...currentEvents, ...pastEvents];

    allEvents.forEach((ev, i) => {
      const numStr = `∅${String(i + 1).padStart(2, '0')}`;
      const firstLine = ev.desc ? ev.desc.slice(0, 50) + (ev.desc.length > 50 ? '...' : '') : 'Operation protocol active.';
      const secondLine = ev.is_past ? 'Archived tactical session.' : 'Registration open for operators.';

      result.push({
        id: ev.id,
        type: 'event',
        number: numStr,
        title: ev.title,
        subtitle: ev.is_past ? '// PAST ARCHIVED OPERATION' : '// ACTIVE / UPCOMING MISSION',
        category: ev.is_past ? 'ARCHIVED OPERATION' : 'ACTIVE MISSION',
        paragraphLines: [firstLine, secondLine],
        image: ev.img.startsWith('http') ? ev.img : assetUrl(ev.img),
        eventItem: ev,
      });
    });

    // Final Slide: FULL DEDICATED TEAM PAGE
    result.push({
      id: 'team-slide',
      type: 'team',
      number: '∅TM',
      title: 'CORE OPERATORS',
      subtitle: '// SPECIAL OPERATIONS\nDEFENSE SQUAD',
      category: '// SQUAD LEADERSHIP',
      paragraphLines: [
        'Offensive & defensive engineers.',
        'Defending digital frontiers.'
      ],
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&q=80',
    });

    return result;
  }, [casesData]);

  // Three.js Shader State & References
  const threeStateRef = useRef<{
    renderer: THREE.WebGLRenderer | null;
    scene: THREE.Scene | null;
    camera: THREE.OrthographicCamera | null;
    shaderMaterial: THREE.ShaderMaterial | null;
    textures: THREE.Texture[];
    texturesLoaded: boolean;
    isTransitioning: boolean;
    scrollingEnabled: boolean;
    lastScrollTimestamp: number;
    touchStartPosition: number;
    isTouchActive: boolean;
    startTime: number;
    animFrameId: number | null;
  }>({
    renderer: null,
    scene: null,
    camera: null,
    shaderMaterial: null,
    textures: [],
    texturesLoaded: false,
    isTransitioning: false,
    scrollingEnabled: true,
    lastScrollTimestamp: 0,
    touchStartPosition: 0,
    isTouchActive: false,
    startTime: Date.now(),
    animFrameId: null,
  });

  const vertexShader = `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `;

  const fragmentShader = `
    uniform sampler2D uTexture1;
    uniform sampler2D uTexture2;
    uniform float uProgress;
    uniform vec2 uResolution;
    uniform vec2 uTexture1Size;
    uniform vec2 uTexture2Size;
    uniform float uTime;
    uniform float uGlobalIntensity;
    uniform float uSpeedMultiplier;
    uniform float uNoiseLevel;
    uniform float uWipeAngle;
    uniform float uWipeAberrationStrength;
    uniform float uWipeEdgeWidth;
    uniform float uWipeColorBleeding;
    varying vec2 vUv;

    float random(vec2 st) {
      return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
    }

    vec2 getCoverUV(vec2 uv, vec2 textureSize) {
      vec2 s = uResolution / textureSize;
      float scale = max(s.x, s.y);
      vec2 scaledSize = textureSize * scale;
      vec2 offset = (uResolution - scaledSize) * 0.5;
      return (uv * uResolution - offset) / scaledSize;
    }

    vec4 sampleTexture(sampler2D tex, vec2 uv, vec2 texSize) {
      vec2 coverUV = getCoverUV(uv, texSize);
      coverUV = clamp(coverUV, 0.0, 1.0);
      return texture2D(tex, coverUV);
    }

    vec4 applyWhiteGlitchOverlay(vec4 color, vec2 uv, float intensity) {
      float time = uTime * uSpeedMultiplier * 2.0;
      float glitchSize = 1500.0;
      vec2 glitchUV = floor(uv * glitchSize) / glitchSize;
      float glitchRandom = random(glitchUV + floor(time * 12.0));
      float whiteGlitch = step(0.98, glitchRandom) * uNoiseLevel;
      float fineNoise = random(uv * 3000.0 + time * 0.5);
      float whiteNoise = step(0.995, fineNoise) * uNoiseLevel;
      float glitchIntensity = 0.4 * uGlobalIntensity;
      float totalWhiteGlitch = (whiteGlitch + whiteNoise) * glitchIntensity * intensity;
      vec3 result = color.rgb;
      result = mix(result, vec3(1.0), totalWhiteGlitch * 0.6);
      return vec4(result, color.a);
    }

    vec4 glitchWipeEffect(vec2 uv, float progress) {
      vec4 img1 = sampleTexture(uTexture1, uv, uTexture1Size);
      vec4 img2 = sampleTexture(uTexture2, uv, uTexture2Size);

      if (progress < 0.001) return img1;
      if (progress > 0.999) return img2;

      float time = uTime * uSpeedMultiplier * 2.0;
      vec2 wipeUV = uv;
      float angleRad = radians(uWipeAngle);
      mat2 rotation = mat2(cos(angleRad), -sin(angleRad), sin(angleRad), cos(angleRad));
      wipeUV = rotation * (wipeUV - 0.5) + 0.5;

      float curvedProgress = progress;
      float wipePos = curvedProgress * 1.2 - 0.1;
      float wipeEdge = wipePos + sin(wipeUV.y * 20.0 + time) * 0.02;
      float isRevealed = step(wipeUV.x, wipeEdge);
      float distanceFromWipe = abs(wipeUV.x - wipeEdge);

      float caIntensity = curvedProgress < 0.2
        ? smoothstep(0.0, 0.2, curvedProgress)
        : curvedProgress < 0.75
          ? 1.0
          : 1.0 - smoothstep(0.75, 0.95, curvedProgress);

      float caZone = (1.0 - smoothstep(0.0, 0.12 * uWipeEdgeWidth, distanceFromWipe)) * caIntensity * uGlobalIntensity;
      vec4 currentImg = mix(img1, img2, isRevealed);

      if (caZone > 0.05) {
        float baseShift = sin(time * 3.0 + wipeUV.y * 15.0) * 0.035 * caZone * uWipeAberrationStrength;
        float secondaryShift = cos(time * 2.0 + wipeUV.x * 10.0) * 0.02 * caZone;
        float totalShift = baseShift + secondaryShift;
        float bleeding = uWipeColorBleeding;

        float r;
        float g;
        float b;

        if (isRevealed > 0.5) {
          r = sampleTexture(uTexture2, uv + vec2(totalShift * 2.5 * bleeding, totalShift * 0.5), uTexture2Size).r;
          g = sampleTexture(uTexture2, uv + vec2(totalShift * 0.5, -totalShift * 0.3), uTexture2Size).g;
          b = sampleTexture(uTexture2, uv - vec2(totalShift * 2.0 * bleeding, totalShift * 0.7), uTexture2Size).b;
        } else {
          r = sampleTexture(uTexture1, uv + vec2(totalShift * 2.5 * bleeding, totalShift * 0.5), uTexture1Size).r;
          g = sampleTexture(uTexture1, uv + vec2(totalShift * 0.5, -totalShift * 0.3), uTexture1Size).g;
          b = sampleTexture(uTexture1, uv - vec2(totalShift * 2.0 * bleeding, totalShift * 0.7), uTexture1Size).b;
        }

        vec4 chromaticImg = vec4(r, g, b, 1.0);
        float edgeGlow = 1.0 - smoothstep(0.0, 0.015, distanceFromWipe);
        chromaticImg.rgb += vec3(1.0, 0.2, 0.2) * edgeGlow * 0.5 * caIntensity;
        float digitalNoise = random(uv * 200.0 + time * 0.1) * uNoiseLevel;
        chromaticImg.rgb += vec3(digitalNoise - 0.5) * 0.1 * caZone;
        currentImg = mix(currentImg, chromaticImg, caZone);
      }

      currentImg = applyWhiteGlitchOverlay(currentImg, uv, caIntensity * 0.9 * uGlobalIntensity);
      return currentImg;
    }

    void main() {
      gl_FragColor = glitchWipeEffect(vUv, uProgress);
    }
  `;

  // Texture loader helper
  function loadTexture(src: string): Promise<THREE.Texture> {
    return new Promise((resolve) => {
      const loader = new THREE.TextureLoader();
      loader.setCrossOrigin('anonymous');
      loader.load(
        src,
        texture => {
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          texture.userData = {
            size: new THREE.Vector2(texture.image.width || 1920, texture.image.height || 1080)
          };
          resolve(texture);
        },
        undefined,
        () => {
          // Fallback texture if image fails
          const canvas = document.createElement('canvas');
          canvas.width = 1920;
          canvas.height = 1080;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.fillStyle = '#0a0a0f';
            ctx.fillRect(0, 0, 1920, 1080);
            ctx.fillStyle = '#ef4444';
            ctx.font = '40px monospace';
            ctx.fillText('CYBER EVENT // CLASSIFIED', 100, 500);
          }
          const fbTexture = new THREE.CanvasTexture(canvas);
          fbTexture.userData = { size: new THREE.Vector2(1920, 1080) };
          resolve(fbTexture);
        }
      );
    });
  }

  // Slide transition handler
  function executeSlideTransition(targetIndex: number, direction: 'down' | 'up') {
    const tState = threeStateRef.current;
    if (tState.isTransitioning || !tState.scrollingEnabled || !tState.texturesLoaded) return;
    if (targetIndex < 0 || targetIndex >= slides.length) return;

    tState.isTransitioning = true;
    tState.scrollingEnabled = false;

    const currentIndex = activeSlideIndexRef.current;
    const currentTexture = tState.textures[currentIndex] || tState.textures[0];
    const nextTexture = tState.textures[targetIndex] || tState.textures[0];
    const nextData = slides[targetIndex];

    const featuredContainer = featuredImageContainerRef.current;
    const currentWrapper = featuredContainer?.querySelector('[data-featured-wrapper]') as HTMLElement | null;

    let newWrapper: HTMLElement | null = null;
    if (featuredContainer) {
      newWrapper = document.createElement('div');
      newWrapper.className = 'absolute inset-0 z-10';
      newWrapper.setAttribute('data-featured-wrapper', '');
      newWrapper.style.clipPath = direction === 'down'
        ? 'polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)'
        : 'polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)';

      const nextImg = document.createElement('img');
      nextImg.src = nextData.image;
      nextImg.alt = nextData.title;
      nextImg.className = 'w-full h-full object-cover';
      newWrapper.appendChild(nextImg);
      featuredContainer.appendChild(newWrapper);

      gsap.set(nextImg, {
        y: direction === 'down' ? '-50%' : '50%'
      });
    }

    if (tState.shaderMaterial) {
      tState.shaderMaterial.uniforms.uTexture1.value = currentTexture;
      tState.shaderMaterial.uniforms.uTexture2.value = nextTexture;
      if (currentTexture.userData?.size) {
        tState.shaderMaterial.uniforms.uTexture1Size.value.copy(currentTexture.userData.size);
      }
      if (nextTexture.userData?.size) {
        tState.shaderMaterial.uniforms.uTexture2Size.value.copy(nextTexture.userData.size);
      }
    }

    setActiveSlideIndex(targetIndex);

    const transitionDuration = 1.6;
    const featuredClipPath = direction === 'down'
      ? 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
      : 'polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%)';

    const tl = gsap.timeline({
      onComplete: () => {
        if (targetIndex === 0) {
          if (newWrapper && newWrapper.parentElement) {
            newWrapper.remove();
          }
          if (currentWrapper && currentWrapper.parentElement) {
            currentWrapper.remove();
          }
          const bgVideo = bgVideoRef.current;
          const cardVideo = cardVideoRef.current;
          [bgVideo, cardVideo].forEach(v => {
            if (v) {
              v.defaultMuted = true;
              v.muted = true;
              v.play().catch(() => { });
            }
          });
        } else {
          if (currentWrapper && currentWrapper.parentElement) {
            currentWrapper.remove();
          }
        }

        if (tState.shaderMaterial) {
          tState.shaderMaterial.uniforms.uProgress.value = 0;
          tState.shaderMaterial.uniforms.uTexture1.value = nextTexture;
          if (nextTexture.userData?.size) {
            tState.shaderMaterial.uniforms.uTexture1Size.value.copy(nextTexture.userData.size);
          }
        }
        tState.isTransitioning = false;
        setTimeout(() => {
          tState.scrollingEnabled = true;
          tState.lastScrollTimestamp = Date.now();
        }, 80);
      }
    });

    if (tState.shaderMaterial) {
      tl.fromTo(
        tState.shaderMaterial.uniforms.uProgress,
        { value: 0 },
        { value: 1, duration: transitionDuration, ease: 'power4.inOut' },
        0
      );
    }

    if (newWrapper) {
      tl.to(
        newWrapper,
        { clipPath: featuredClipPath, duration: transitionDuration, ease: 'power4.inOut' },
        0
      );
      tl.to(
        newWrapper.querySelector('img'),
        { y: '0%', duration: transitionDuration, ease: 'power4.inOut' },
        0
      );
    }

    if (currentWrapper) {
      const currentImg = currentWrapper.querySelector('img');
      if (currentImg) {
        tl.to(
          currentImg,
          { y: direction === 'down' ? '50%' : '-50%', duration: transitionDuration, ease: 'power4.inOut' },
          0
        );
      }
    }

    // Scramble typography
    scrambleTextAnimation(numberElRef.current, nextData.number, 1.0);
    scrambleTextAnimation(titleElRef.current, nextData.title, 1.2);
    scrambleTextAnimation(descElRef.current, nextData.subtitle, 1.0);
    scrambleTextAnimation(p1ElRef.current, nextData.paragraphLines[0] || '', 1.1);
    scrambleTextAnimation(p2ElRef.current, nextData.paragraphLines[1] || '', 1.1);
  }

  function handleScroll(direction: 'down' | 'up') {
    const tState = threeStateRef.current;
    const now = Date.now();
    if (tState.isTransitioning || !tState.scrollingEnabled) return;
    if (now - tState.lastScrollTimestamp < 900) return;
    tState.lastScrollTimestamp = now;

    const currentIndex = activeSlideIndexRef.current;
    if (direction === 'down') {
      if (currentIndex < slides.length - 1) {
        executeSlideTransition(currentIndex + 1, 'down');
      } else {
        // At the very end (Team slide), scroll down leads to Contact
        onScrollDownOutside?.();
      }
    } else {
      if (currentIndex > 0) {
        executeSlideTransition(currentIndex - 1, 'up');
      } else {
        // At the very beginning (Intro slide), scroll up leads to previous section (Partner)
        onScrollUpOutside?.();
      }
    }
  }

  // Initialize Three.js renderer & load textures
  useEffect(() => {
    if (!isVisible || typeof window === 'undefined') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const tState = threeStateRef.current;
    tState.texturesLoaded = false;
    tState.textures = [];

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: false,
      powerPreference: 'high-performance'
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const shaderMaterial = new THREE.ShaderMaterial({
      uniforms: {
        uTexture1: { value: null },
        uTexture2: { value: null },
        uProgress: { value: 0.0 },
        uTime: { value: 0.0 },
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uTexture1Size: { value: new THREE.Vector2(1920, 1080) },
        uTexture2Size: { value: new THREE.Vector2(1920, 1080) },
        uGlobalIntensity: { value: 1.0 },
        uSpeedMultiplier: { value: 1.0 },
        uNoiseLevel: { value: 0.45 },
        uWipeAngle: { value: 15.0 },
        uWipeAberrationStrength: { value: 1.0 },
        uWipeEdgeWidth: { value: 1.0 },
        uWipeColorBleeding: { value: 1.0 }
      },
      vertexShader,
      fragmentShader
    });

    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, shaderMaterial);
    scene.add(mesh);

    tState.renderer = renderer;
    tState.scene = scene;
    tState.camera = camera;
    tState.shaderMaterial = shaderMaterial;

    let cancelled = false;

    // Load textures for all slides
    Promise.all(slides.map(s => loadTexture(s.image))).then(loadedTextures => {
      if (cancelled) return;
      tState.textures = loadedTextures;
      if (loadedTextures.length >= 1) {
        const curIdx = activeSlideIndexRef.current;
        const curTex = loadedTextures[curIdx] || loadedTextures[0];
        const nextTex = loadedTextures[curIdx + 1] || loadedTextures[curIdx - 1] || curTex;
        shaderMaterial.uniforms.uTexture1.value = curTex;
        shaderMaterial.uniforms.uTexture2.value = nextTex;
        if (curTex.userData?.size) {
          shaderMaterial.uniforms.uTexture1Size.value.copy(curTex.userData.size);
        }
        if (nextTex.userData?.size) {
          shaderMaterial.uniforms.uTexture2Size.value.copy(nextTex.userData.size);
        }
        tState.texturesLoaded = true;
      }
    });

    const renderLoop = () => {
      tState.animFrameId = requestAnimationFrame(renderLoop);
      if (shaderMaterial) {
        shaderMaterial.uniforms.uTime.value = (Date.now() - tState.startTime) * 0.001;
      }
      renderer.render(scene, camera);
    };

    renderLoop();

    const handleResize = () => {
      if (!renderer || !shaderMaterial) return;
      renderer.setSize(window.innerWidth, window.innerHeight);
      shaderMaterial.uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelled = true;
      if (tState.animFrameId) cancelAnimationFrame(tState.animFrameId);
      window.removeEventListener('resize', handleResize);
      geometry.dispose();
      shaderMaterial.dispose();
      renderer.dispose();
    };
  }, [isVisible, slides]);

  // Handle wheel, touch, and keyboard interactions
  useEffect(() => {
    if (!isVisible) return;
    const container = containerRef.current;
    if (!container) return;

    const tState = threeStateRef.current;

    const onWheel = (e: WheelEvent) => {
      // Allow scrolling inside team roster container
      const teamRoster = (e.target as HTMLElement)?.closest('.team-roster-scroll') as HTMLElement | null;
      if (teamRoster) {
        const isScrollingDown = e.deltaY > 0;
        const isScrollingUp = e.deltaY < 0;
        const canScrollDown = isScrollingDown && teamRoster.scrollTop + teamRoster.clientHeight < teamRoster.scrollHeight - 4;
        const canScrollUp = isScrollingUp && teamRoster.scrollTop > 4;

        if (canScrollDown || canScrollUp) {
          // Let the user scroll the team roster list
          return;
        }
      }

      e.preventDefault();
      e.stopPropagation();
      handleScroll(e.deltaY > 0 ? 'down' : 'up');
    };

    const onTouchStart = (e: TouchEvent) => {
      tState.touchStartPosition = e.touches[0].clientY;
      tState.isTouchActive = true;
    };

    const onTouchMove = (e: TouchEvent) => {
      const teamRoster = (e.target as HTMLElement)?.closest('.team-roster-scroll') as HTMLElement | null;
      if (teamRoster) {
        const diff = tState.touchStartPosition - e.touches[0].clientY;
        const isScrollingDown = diff > 0;
        const isScrollingUp = diff < 0;
        const canScrollDown = isScrollingDown && teamRoster.scrollTop + teamRoster.clientHeight < teamRoster.scrollHeight - 4;
        const canScrollUp = isScrollingUp && teamRoster.scrollTop > 4;

        if (canScrollDown || canScrollUp) {
          return;
        }
      }

      e.preventDefault();
      if (!tState.isTouchActive || tState.isTransitioning) return;
      const diff = tState.touchStartPosition - e.touches[0].clientY;
      if (Math.abs(diff) > 20) {
        tState.isTouchActive = false;
        handleScroll(diff > 0 ? 'down' : 'up');
      }
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Don't hijack spacebar when the user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      const isEditable = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target as HTMLElement)?.isContentEditable;
      if (isEditable) return;

      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        handleScroll('down');
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        handleScroll('up');
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    container.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      container.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isVisible, slides]);

  const currentSlide = slides[activeSlideIndex] || slides[0];

  const handleAction = (item: CaseItem) => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRegister = (item: CaseItem) => {
    setRegisterModal({ isOpen: true, eventId: item.id, title: item.title });
  };

  return (
    <section
      ref={containerRef}
      className={`fixed inset-0 w-full h-screen overflow-hidden select-none bg-black transition-opacity duration-500 ${isVisible ? 'opacity-100 z-20 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
        }`}
    >
      {/* Background WebGL Glitch Wipe Canvas for Event Transitions */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-[1] block" aria-hidden="true" />

      {/* Permanent Video Background for Events First Page (Slide 0) */}
      <div
        className={`absolute inset-0 w-full h-full z-[2] overflow-hidden transition-opacity duration-700 pointer-events-none ${activeSlideIndex === 0 ? 'opacity-100' : 'opacity-0'
          }`}
      >
        <video
          ref={bgVideoRef}
          src={VIDEO_PATHS.eventsBackground}
          poster={assetUrl('/events-video-frame.jpg')}
          muted
          playsInline
          autoPlay
          loop
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Cyber Grid Scanlines Overlay */}
      <div className="absolute inset-0 z-[3] pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
      <div className="absolute inset-0 z-[3] pointer-events-none bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />

      {/* Center Featured Image Card (Code Refer Layout) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] md:w-[55vw] h-[50vw] md:h-[30.93vw] max-w-[900px] max-h-[506px] z-[4] pointer-events-none shadow-[0_20px_50px_rgba(0,0,0,0.85)] border border-red-500/20 overflow-hidden bg-neutral-950">
        {/* Permanent Video Layer for Center Card on Slide 0 */}
        <div
          className={`absolute inset-0 w-full h-full z-[12] overflow-hidden transition-opacity duration-500 pointer-events-none ${activeSlideIndex === 0 ? 'opacity-100' : 'opacity-0'
            }`}
        >
          <video
            ref={cardVideoRef}
            src={VIDEO_PATHS.eventsBackground}
            poster={assetUrl('/events-video-frame.jpg')}
            muted
            playsInline
            autoPlay
            loop
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Transition Image Container for event slides */}
        <div ref={featuredImageContainerRef} className="relative w-full h-full z-10">
          <div className="absolute inset-0 z-10" data-featured-wrapper>
            <img
              src={currentSlide.image}
              alt={currentSlide.title}
              className="w-full h-full object-cover"
              draggable={false}
            />
          </div>
        </div>

        {/* Cyber corner accents */}
        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500 z-20 pointer-events-none" />
        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500 z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500 z-20 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500 z-20 pointer-events-none" />

        {/* Team Slide Overlay Content (Shown in center featured image on team slide) */}
        {currentSlide.type === 'team' && (
          <div
            className="team-roster-scroll team-roster-scrollbar absolute inset-0 z-20 p-4 md:p-6 bg-black/85 backdrop-blur-md overflow-y-auto pointer-events-auto pr-2"
            onWheel={(e) => {
              const el = e.currentTarget;
              const isScrollingDown = e.deltaY > 0;
              const isScrollingUp = e.deltaY < 0;
              const canScrollDown = isScrollingDown && el.scrollTop + el.clientHeight < el.scrollHeight - 4;
              const canScrollUp = isScrollingUp && el.scrollTop > 4;

              if (canScrollDown || canScrollUp) {
                e.stopPropagation();
              }
            }}
          >
            <div className="text-center mb-4">
              <div className="font-mono text-xs text-red-500 tracking-[0.3em] uppercase">// OPERATIONAL SQUAD</div>
              <h3 className="font-outfit font-bold text-2xl text-white tracking-widest uppercase">TEAM ROSTER</h3>
            </div>
            <TeamGrid />
          </div>
        )}
      </div>

      {/* Left Side Header Information (.slide-text) */}
      <header className="absolute top-[18%] md:top-1/2 left-6 md:left-[5%] md:-translate-y-1/2 text-white z-[5] pointer-events-none w-[85vw] md:w-[22vw] flex flex-col justify-center">
        <div className="flex flex-col">
          {/* Slide Number */}
          <div className="mb-2 md:mb-3 overflow-hidden">
            <span ref={numberElRef} className="font-mono text-sm md:text-base tracking-[0.25em] text-red-500/90 font-bold">
              {currentSlide.number}
            </span>
          </div>

          {/* Slide Title */}
          <div className="overflow-hidden">
            <h1
              ref={titleElRef}
              className="font-outfit font-bold text-2xl md:text-5xl uppercase leading-[1.05] tracking-tight drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)] text-white whitespace-pre-line"
            >
              {currentSlide.title}
            </h1>
          </div>

          {/* Slide Subtitle / Category */}
          {currentSlide.subtitle ? (
            <div className="mt-2 md:mt-4 overflow-hidden">
              <p
                ref={descElRef}
                className={`font-mono text-[11px] md:text-xs uppercase tracking-[0.22em] whitespace-pre-line font-bold ${currentSlide.type === 'team'
                  ? 'text-red-200 drop-shadow-[0_0_14px_rgba(239,68,68,0.9)] drop-shadow-[0_2px_10px_rgba(0,0,0,1)]'
                  : 'text-neutral-100 drop-shadow-[0_2px_10px_rgba(0,0,0,0.95)]'
                  }`}
              >
                {currentSlide.subtitle}
              </p>
            </div>
          ) : (
            <p ref={descElRef} className="hidden" />
          )}
        </div>
      </header>

      {/* Middle-Right Paragraph and All Action Buttons (.slide-paragraph) */}
      <div className="absolute bottom-10 md:bottom-1/2 right-6 md:right-[5%] md:translate-y-1/2 text-white z-[5] w-[85vw] md:w-[25vw] text-right flex flex-col items-end gap-3 pointer-events-auto">
        {/* Paragraph lines with scramble animation (Only on first opening slide if text exists) */}
        {currentSlide.type === 'intro' && currentSlide.paragraphLines[0] && (
          <div className="flex flex-col gap-1 text-right mb-2">
            <div className="overflow-hidden">
              <span ref={p1ElRef} className="font-outfit text-xs md:text-sm leading-relaxed text-white/80 font-medium">
                {currentSlide.paragraphLines[0] || ''}
              </span>
            </div>
            {currentSlide.paragraphLines[1] && (
              <div className="overflow-hidden">
                <span ref={p2ElRef} className="font-outfit text-xs md:text-sm leading-relaxed text-white/60">
                  {currentSlide.paragraphLines[1]}
                </span>
              </div>
            )}
          </div>
        )}

        {/* MIDDLE-RIGHT ACTION BUTTONS (Clean Vertical Stack Line) */}
        {currentSlide.type === 'event' && currentSlide.eventItem && (
          <div className="flex flex-col items-end gap-2.5 pt-2 w-full max-w-[210px]">
            {/* 1. Upcoming Event: Register Button */}
            {!currentSlide.eventItem.is_past && (
              <RadialGlowButton
                gradientTheme="red"
                onClick={() => handleRegister(currentSlide.eventItem!)}
                className="min-w-[190px] !py-2.5 !px-5 font-outfit font-bold uppercase tracking-[0.2em] text-[11px]"
              >
                <span>REGISTER</span>
                <span className="ml-1.5">➔</span>
              </RadialGlowButton>
            )}

            {/* 2. Certificate Button */}
            {currentSlide.eventItem.certificates_enabled && (
              <RadialGlowButton
                gradientTheme="purple"
                onClick={() => setCertificateModal({ isOpen: true, eventName: currentSlide.eventItem!.title })}
                className="min-w-[190px] !py-2.5 !px-5 font-outfit font-bold uppercase tracking-wider text-[11px]"
              >
                <span>GET CERTIFICATE</span>
              </RadialGlowButton>
            )}

            {/* 3. Guidelines / Play / Open Button (Active Events ONLY) */}
            {!currentSlide.eventItem.is_past && currentSlide.eventItem.url && (
              <RadialGlowButton
                gradientTheme="blue"
                onClick={() => handleAction(currentSlide.eventItem!)}
                className="min-w-[190px] !py-2.5 !px-5 font-outfit font-semibold uppercase tracking-wider text-[11px]"
              >
                <span>{currentSlide.eventItem.openIn === 'popup' ? 'GUIDELINES/RULES' : 'OPEN'}</span>
                <span className="text-xs ml-1 font-bold">↗</span>
              </RadialGlowButton>
            )}

            {/* 4. Past Event: View Gallery (Blue Button) or Concluded Badge + Feedback */}
            {currentSlide.eventItem.is_past && (
              <>
                {currentSlide.eventItem.gallery_link ? (
                  <RadialGlowButton
                    gradientTheme="blue"
                    onClick={() => window.open(currentSlide.eventItem!.gallery_link, '_blank', 'noopener,noreferrer')}
                    className="min-w-[190px] !py-2.5 !px-5 font-outfit font-bold uppercase tracking-wider text-[11px]"
                  >
                    <span>VIEW GALLERY</span>
                  </RadialGlowButton>
                ) : !currentSlide.eventItem.certificates_enabled ? (
                  <div className="inline-flex items-center justify-center min-w-[190px] rounded-full border border-neutral-700 bg-neutral-800/60 px-5 py-2 font-mono text-[10px] uppercase tracking-widest text-neutral-400">
                    // MISSION CONCLUDED
                  </div>
                ) : null}

                <RadialGlowButton
                  gradientTheme="purple"
                  onClick={() => setFeedbackModal({ isOpen: true, eventId: currentSlide.eventItem!.id, title: currentSlide.eventItem!.title })}
                  className="min-w-[190px] !py-2.5 !px-5 font-outfit font-bold uppercase tracking-wider text-[11px]"
                >
                  <span>FEEDBACK</span>
                </RadialGlowButton>
              </>
            )}

            {/* 5. Platform Links (THM & HTB) */}
            {(currentSlide.eventItem.thm_url || currentSlide.eventItem.htb_url) && (
              <div className="flex items-center gap-2 w-full min-w-[190px] justify-end">
                {currentSlide.eventItem.thm_url && (
                  <RadialGlowButton
                    gradientTheme="red"
                    onClick={() => window.open(currentSlide.eventItem!.thm_url, '_blank', 'noopener,noreferrer')}
                    className="!py-1.5 !px-3 font-mono font-bold uppercase text-[10px] text-red-200 min-w-0"
                  >
                    <span>THM</span>
                  </RadialGlowButton>
                )}

                {currentSlide.eventItem.htb_url && (
                  <RadialGlowButton
                    gradientTheme="emerald"
                    onClick={() => window.open(currentSlide.eventItem!.htb_url, '_blank', 'noopener,noreferrer')}
                    className="!py-1.5 !px-3 font-mono font-bold uppercase text-[10px] text-green-200 min-w-0"
                  >
                    <span>HTB</span>
                  </RadialGlowButton>
                )}
              </div>
            )}
          </div>
        )}

        {/* Intro Slide Button */}
        {currentSlide.type === 'intro' && (
          <div className="flex flex-col items-end gap-2.5 pt-2">
            <RadialGlowButton
              gradientTheme="red"
              onClick={() => handleScroll('down')}
              className="min-w-[190px] !py-2.5 !px-6 font-outfit font-bold uppercase tracking-[0.2em] text-xs"
            >
              <span>START BRIEFING</span>
              <span className="ml-1.5">➔</span>
            </RadialGlowButton>
          </div>
        )}

        {/* Team Slide Button / Label */}
        {currentSlide.type === 'team' && (
          <div className="flex items-center gap-2 pt-2 translate-x-6 md:translate-x-12 pl-6">
            <span className="font-mono text-sm md:text-base font-bold text-red-400 tracking-[0.2em] uppercase drop-shadow-[0_0_12px_rgba(239,68,68,0.6)]">
              // ALL CORE OPERATORS
            </span>
          </div>
        )}
      </div>

      {/* Bottom Interactive Slide Navigation Controls & Indicators (In between center box red line and bottom social buttons) */}
      <nav className="absolute bottom-[4.75rem] md:bottom-[5rem] left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 md:gap-4 bg-black/85 border border-white/20 px-4 py-1.5 rounded-full backdrop-blur-md shadow-[0_4px_25px_rgba(0,0,0,0.9)]" aria-label="Slide navigation">
        <button
          type="button"
          onClick={() => handleScroll('up')}
          disabled={activeSlideIndex === 0}
          aria-label="Previous slide"
          className="text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-mono text-[11px] cursor-pointer px-1"
        >
          ▲ PREV
        </button>

        <div className="flex items-center gap-1.5">
          {slides.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                if (i !== activeSlideIndex) {
                  executeSlideTransition(i, i > activeSlideIndex ? 'down' : 'up');
                }
              }}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${i === activeSlideIndex
                ? 'w-6 bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]'
                : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
            />
          ))}
        </div>

        <span className="font-mono text-[11px] text-white/70">
          {String(activeSlideIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
        </span>

        <button
          type="button"
          onClick={() => handleScroll('down')}
          disabled={activeSlideIndex === slides.length - 1}
          aria-label="Next slide"
          className="text-white/60 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-mono text-xs cursor-pointer px-1"
        >
          NEXT ▼
        </button>
      </nav>

      {/* Video Popup Modal */}
      <AnimatePresence mode="wait">
        {popup && (
          <VideoPopup
            key={popup.url}
            title={popup.title}
            url={popup.url}
            onClose={() => setPopup(null)}
          />
        )}
      </AnimatePresence>

      {/* Register Modal */}
      <RegisterModal
        isOpen={registerModal.isOpen}
        onClose={() => setRegisterModal({ isOpen: false, eventId: null, title: null })}
        eventId={registerModal.eventId}
        eventTitle={registerModal.title}
      />

      {/* Certificate Modal */}
      <CertificateModal
        isOpen={certificateModal.isOpen}
        onClose={() => setCertificateModal({ isOpen: false, eventName: null })}
        eventName={certificateModal.eventName}
        regId=""
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ isOpen: false, eventId: null, title: null })}
        eventId={feedbackModal.eventId}
        eventTitle={feedbackModal.title}
      />
    </section>
  );
}

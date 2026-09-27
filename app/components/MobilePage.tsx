'use client';

import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { assetUrl } from '../utils/assetUrl';
import { supabase } from '../utils/supabase';
import { homeLogger } from '../utils/logger';
import { RegisterModal } from './RegisterModal';
import { CertificateModal } from './CertificateModal';
import { FeedbackModal } from './FeedbackModal';
import { RadialGlowButton } from './ui/radial-glow-button';
import { SoundToggle } from './SoundToggle';
import { BASE_PATH } from '../constants/config';

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

function toVimeoEmbedUrl(url: string) {
  const m = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (!m) return url;
  return `https://player.vimeo.com/video/${m[1]}?autoplay=1&title=0&byline=0&portrait=0`;
}

function MobileVideoPopup({ title, url, onClose }: { title: string; url: string; onClose: () => void }) {
  return (
    <motion.div
      className="fixed inset-0 z-[150] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 touch-none"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-full max-w-lg rounded-2xl overflow-hidden bg-black border border-red-500/40 shadow-[0_0_30px_rgba(239,68,68,0.3)]"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.94 }}
        transition={{ duration: 0.35 }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-red-500/20 bg-neutral-950">
          <div className="text-white font-mono font-medium text-xs tracking-wider truncate pr-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping inline-block" />
            <span>GUIDELINES // {title}</span>
          </div>
          <button
            type="button"
            className="text-white/70 hover:text-red-400 font-mono text-xs px-2 py-1 border border-transparent rounded cursor-pointer"
            onClick={onClose}
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

export function MobilePage() {
  const [casesData, setCasesData] = useState<CaseItem[]>([]);
  const [popup, setPopup] = useState<{ title: string; url: string } | null>(null);

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

  // Inject style to allow normal document scrolling on mobile
  useEffect(() => {
    const style = document.createElement('style');
    style.setAttribute('data-mobile-scroll', 'true');
    style.textContent = 'html, body { overflow: auto !important; height: auto !important; }';
    document.head.appendChild(style);
    return () => {
      style.remove();
    };
  }, []);

  // Fetch events from Supabase with realtime subscription
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
        homeLogger.error('[MobilePage] Error fetching events:', err);
        setCasesData(FALLBACK_EVENTS);
      }
    }

    fetchCases();

    const channel = supabase
      .channel('events-mobile-all')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
        fetchCases();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Listen for custom open modal events
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

  const handleAction = (item: CaseItem) => {
    if (item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer');
    }
  };

  const handleRegister = (item: CaseItem) => {
    setRegisterModal({ isOpen: true, eventId: item.id, title: item.title });
  };

  // Group events into Current & Past
  const currentEvents = useMemo(() => casesData.filter(e => !e.is_past), [casesData]);
  const pastEvents = useMemo(() => casesData.filter(e => e.is_past), [casesData]);
  const allEvents = useMemo(() => [...currentEvents, ...pastEvents], [currentEvents, pastEvents]);

  return (
    <div className="relative min-h-screen bg-black text-white selection:bg-red-500 selection:text-white font-outfit pb-24">
      {/* Background cyber grid scanlines */}
      <div className="fixed inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.85)_100%)]" />
      <div className="fixed inset-0 pointer-events-none z-0 bg-[linear-gradient(rgba(255,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,0,0,0.03)_1px,transparent_1px)] bg-[size:30px_30px]" />

      {/* TOP DESKTOP SUGGESTION BANNER */}
      <header className="sticky top-0 z-40 bg-black/90 backdrop-blur-md border-b border-red-500/30 px-4 py-3 shadow-[0_4px_20px_rgba(239,68,68,0.15)]">
        <div className="flex items-center justify-center text-center">
          <span className="font-mono text-xs uppercase tracking-wider text-red-400 font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse inline-block" />
            FOR FULL WEBSITE EXPERIENCE, PLEASE USE DESKTOP
          </span>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="relative z-10 max-w-lg mx-auto px-4 pt-6 space-y-8">
        {/* SECTION HEADER */}
        <div className="text-center space-y-2 pt-2">
          <div className="font-mono text-xs text-red-500 tracking-[0.3em] uppercase font-bold">
            // SPECIAL OPERATIONS & BRIEFINGS
          </div>
          <h1 className="font-outfit font-bold text-3xl text-white tracking-widest uppercase drop-shadow-[0_4px_15px_rgba(0,0,0,0.8)]">
            CIPHER EVENTS
          </h1>
          <p className="text-xs text-white/70 max-w-xs mx-auto leading-relaxed">
            Scroll down to explore active operations, register for events, claim verified certificates, and submit mission feedback.
          </p>
        </div>

        {/* EVENTS LIST (NORMAL VERTICAL SCROLL) */}
        <div className="space-y-6">
          {allEvents.map((ev, index) => {
            const numStr = `∅${String(index + 1).padStart(2, '0')}`;
            const imgUrl = ev.img.startsWith('http') ? ev.img : assetUrl(ev.img);

            return (
              <motion.article
                key={ev.id}
                className="relative bg-neutral-950 border border-red-500/25 rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.9)] flex flex-col"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.45 }}
              >
                {/* Cyber Corner Accents */}
                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-red-500 z-20 pointer-events-none" />
                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-red-500 z-20 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-red-500 z-20 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-red-500 z-20 pointer-events-none" />

                {/* Card Top Header */}
                <div className="flex items-center justify-between px-4 py-3 bg-neutral-900/90 border-b border-white/10 font-mono text-xs">
                  <span className="text-red-500 font-bold tracking-widest">{numStr}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] tracking-widest uppercase font-bold ${
                    ev.is_past ? 'bg-neutral-800 text-neutral-400 border border-neutral-700' : 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                  }`}>
                    {ev.is_past ? 'ARCHIVED OPERATION' : 'ACTIVE MISSION'}
                  </span>
                </div>

                {/* Cover Image */}
                <div className="relative w-full aspect-video bg-black overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={ev.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-transparent to-transparent opacity-90" />
                </div>

                {/* Event Details */}
                <div className="p-5 space-y-4">
                  <div>
                    <h2 className="font-outfit font-bold text-xl uppercase tracking-wider text-white">
                      {ev.title}
                    </h2>
                    <p className="font-mono text-[11px] text-neutral-400 uppercase tracking-widest mt-1">
                      {ev.is_past ? '// PAST ARCHIVED SESSION' : '// REGISTRATION OPEN FOR OPERATORS'}
                    </p>
                  </div>

                  {ev.desc && (
                    <p className="text-xs text-white/80 leading-relaxed font-outfit">
                      {ev.desc}
                    </p>
                  )}

                  {/* ACTION BUTTONS STACK */}
                  <div className="pt-2 space-y-2.5">
                    {/* 1. Register Button (Only for Active Events) */}
                    {!ev.is_past && (
                      <RadialGlowButton
                        gradientTheme="red"
                        onClick={() => handleRegister(ev)}
                        className="w-full !py-3 font-outfit font-bold uppercase tracking-[0.2em] text-xs"
                      >
                        <span>REGISTER</span>
                        <span className="ml-2">➔</span>
                      </RadialGlowButton>
                    )}

                    {/* 2. Certificate Button */}
                    {ev.certificates_enabled && (
                      <RadialGlowButton
                        gradientTheme="purple"
                        onClick={() => setCertificateModal({ isOpen: true, eventName: ev.title })}
                        className="w-full !py-3 font-outfit font-bold uppercase tracking-wider text-xs"
                      >
                        <span>GET CERTIFICATE</span>
                      </RadialGlowButton>
                    )}

                    {/* 3. Guidelines / Open Button */}
                    {!ev.is_past && ev.url && (
                      <RadialGlowButton
                        gradientTheme="blue"
                        onClick={() => handleAction(ev)}
                        className="w-full !py-3 font-outfit font-semibold uppercase tracking-wider text-xs"
                      >
                        <span>{ev.openIn === 'popup' ? 'GUIDELINES / RULES' : 'OPEN'}</span>
                        <span className="ml-1.5 font-bold">↗</span>
                      </RadialGlowButton>
                    )}

                    {/* 4. Past Event Options: View Gallery & Feedback */}
                    {ev.is_past && (
                      <div className="space-y-2">
                        {ev.gallery_link ? (
                          <RadialGlowButton
                            gradientTheme="blue"
                            onClick={() => window.open(ev.gallery_link, '_blank', 'noopener,noreferrer')}
                            className="w-full !py-3 font-outfit font-bold uppercase tracking-wider text-xs"
                          >
                            <span>VIEW GALLERY</span>
                          </RadialGlowButton>
                        ) : !ev.certificates_enabled ? (
                          <div className="w-full text-center py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/60 font-mono text-[11px] uppercase tracking-widest text-neutral-400">
                            // MISSION CONCLUDED
                          </div>
                        ) : null}

                        <RadialGlowButton
                          gradientTheme="purple"
                          onClick={() => setFeedbackModal({ isOpen: true, eventId: ev.id, title: ev.title })}
                          className="w-full !py-3 font-outfit font-bold uppercase tracking-wider text-xs"
                        >
                          <span>SUBMIT FEEDBACK</span>
                        </RadialGlowButton>
                      </div>
                    )}

                    {/* 5. Platform Links (THM & HTB) */}
                    {(ev.thm_url || ev.htb_url) && (
                      <div className="flex items-center gap-2 pt-1 justify-end">
                        {ev.thm_url && (
                          <RadialGlowButton
                            gradientTheme="red"
                            onClick={() => window.open(ev.thm_url, '_blank', 'noopener,noreferrer')}
                            className="!py-1.5 !px-3 font-mono font-bold uppercase text-[10px] text-red-200 min-w-0"
                          >
                            <span>THM</span>
                          </RadialGlowButton>
                        )}
                        {ev.htb_url && (
                          <RadialGlowButton
                            gradientTheme="emerald"
                            onClick={() => window.open(ev.htb_url, '_blank', 'noopener,noreferrer')}
                            className="!py-1.5 !px-3 font-mono font-bold uppercase text-[10px] text-green-200 min-w-0"
                          >
                            <span>HTB</span>
                          </RadialGlowButton>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>
      </main>

      {/* FOOTER BAR FOR MOBILE */}
      <footer className="fixed bottom-0 inset-x-0 z-40 bg-black/90 backdrop-blur-md border-t border-white/10 py-3 px-4 flex items-center justify-center gap-4">
        <a
          href="https://www.instagram.com/cipher_meswcoe26?utm_source=qr&igsi=MzA2aXlseHhyY3Vj"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:opacity-70 transition-opacity"
          aria-label="Instagram"
        >
          <img src={`${BASE_PATH}/instagram.svg`} alt="Instagram" width={32} height={32} />
        </a>
        <a
          href="https://www.linkedin.com/company/wadia-coe-cipher-sig/home/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:opacity-70 transition-opacity"
          aria-label="LinkedIn"
        >
          <img src={`${BASE_PATH}/linkedin.svg`} alt="LinkedIn" width={32} height={32} />
        </a>
        <a
          href="https://chat.whatsapp.com/GRXtCB945bN9QLaOAWQUip"
          target="_blank"
          rel="noopener noreferrer"
          className="text-white hover:opacity-70 transition-opacity"
          aria-label="WhatsApp"
        >
          <img src={`${BASE_PATH}/whatsapp.svg`} alt="WhatsApp" width={32} height={32} />
        </a>
        <SoundToggle iconSize={32} />
      </footer>

      {/* MODALS */}
      <RegisterModal
        isOpen={registerModal.isOpen}
        onClose={() => setRegisterModal({ isOpen: false, eventId: null, title: null })}
        eventId={registerModal.eventId}
        eventTitle={registerModal.title}
      />

      <CertificateModal
        isOpen={certificateModal.isOpen}
        onClose={() => setCertificateModal({ isOpen: false, eventName: null })}
        eventName={certificateModal.eventName}
        regId=""
      />

      <FeedbackModal
        isOpen={feedbackModal.isOpen}
        onClose={() => setFeedbackModal({ isOpen: false, eventId: null, title: null })}
        eventId={feedbackModal.eventId}
        eventTitle={feedbackModal.title}
      />

      <AnimatePresence>
        {popup && (
          <MobileVideoPopup
            key={popup.url}
            title={popup.title}
            url={popup.url}
            onClose={() => setPopup(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

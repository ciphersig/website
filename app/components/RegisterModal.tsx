'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter
} from './ui/animated-modal';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { cn } from '@/lib/utils';
import { assetUrl } from '../utils/assetUrl';
import {
  User,
  Mail,
  GraduationCap,
  Hash,
  AlertCircle,
  ArrowRight,
  Loader2
} from 'lucide-react';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
  eventTitle: string | null;
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-red-400 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
    </>
  );
};

const LabelInputContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div className={cn('flex w-full flex-col space-y-1.5', className)}>
      {children}
    </div>
  );
};

/* ── Fullscreen Ticket Video Overlay ── */
function TicketVideoOverlay({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const pauseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleVideoEnded = useCallback(() => {
    // Video ended → pause on last frame for 5 seconds, then dismiss
    const vid = videoRef.current;
    if (vid) {
      vid.pause();
    }
    pauseTimerRef.current = setTimeout(() => {
      onDone();
    }, 5000);
  }, [onDone]);

  useEffect(() => {
    return () => {
      if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
      className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-black/95 backdrop-blur-2xl cursor-pointer"
      onClick={onDone}
    >
      <div 
        className="relative flex items-center justify-center max-w-[94vw] max-h-[88vh] cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient atmospheric green/cyber glow behind ticket machine */}
        <div 
          className="absolute -inset-10 pointer-events-none rounded-[40px] opacity-45 blur-3xl animate-pulse"
          style={{
            background: 'radial-gradient(ellipse 65% 65% at 50% 50%, rgba(34, 197, 94, 0.4), rgba(16, 185, 129, 0.2) 40%, rgba(0, 0, 0, 0.8) 75%, transparent 100%)',
          }}
        />

        {/* Video wrapper with feathered radial mask to eliminate hard rectangular edges */}
        <div
          className="relative z-10 flex items-center justify-center overflow-hidden"
          style={{
            maskImage: 'radial-gradient(ellipse 82% 80% at 50% 50%, #000 48%, rgba(0, 0, 0, 0.85) 65%, rgba(0, 0, 0, 0.3) 80%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 82% 80% at 50% 50%, #000 48%, rgba(0, 0, 0, 0.85) 65%, rgba(0, 0, 0, 0.3) 80%, transparent 100%)',
          }}
        >
          <video
            ref={videoRef}
            src={assetUrl('/videos/ticket.mp4')}
            autoPlay
            playsInline
            muted={false}
            onEnded={handleVideoEnded}
            className="w-auto h-auto max-w-[90vw] max-h-[85vh] object-contain drop-shadow-[0_0_50px_rgba(34,197,94,0.25)]"
          />

          {/* Vignette blur overlay on borders so sides naturally feather into the backdrop */}
          <div 
            className="absolute inset-0 pointer-events-none z-20"
            style={{
              boxShadow: 'inset 0 0 60px 30px rgba(0, 0, 0, 0.95), inset 0 0 120px 60px rgba(0, 0, 0, 0.8)',
            }}
          />
        </div>

        {/* Close / dismiss hint */}
        <button
          type="button"
          onClick={onDone}
          className="absolute -bottom-10 left-1/2 -translate-x-1/2 z-30 font-mono text-xs tracking-widest text-white/50 hover:text-white transition-colors uppercase px-3 py-1 rounded border border-white/10 hover:border-white/30 backdrop-blur-sm cursor-pointer"
        >
          [ CLICK TO CLOSE ✕ ]
        </button>
      </div>
    </motion.div>
  );
}

export function RegisterModal({ isOpen, onClose, eventId, eventTitle }: RegisterModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    prn_number: '',
    roll_no: '',
    class_name: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showTicketVideo, setShowTicketVideo] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, eventId, eventTitle: eventTitle || '' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');

      // Close the modal and show fullscreen ticket video
      onClose();
      setShowTicketVideo(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTicketDone = useCallback(() => {
    setShowTicketVideo(false);
    setFormData({ name: '', email: '', prn_number: '', roll_no: '', class_name: '' });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  return (
    <>
      {/* Fullscreen ticket video overlay (rendered at top level, outside modal) */}
      <AnimatePresence>
        {showTicketVideo && <TicketVideoOverlay onDone={handleTicketDone} />}
      </AnimatePresence>

      <Modal open={isOpen} setOpen={(open) => { if (!open) onClose(); }}>
        <ModalBody className="max-w-lg bg-[#0F0D0F] border border-white/15 text-white shadow-[0_0_50px_rgba(0,0,0,0.9)] rounded-2xl">
          <ModalContent className="space-y-5">
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/25 text-red-400 text-[11px] font-mono uppercase tracking-widest mb-3">
                <span className="size-1.5 rounded-full bg-red-400 animate-pulse" />
                <span>Cyber Event Registration</span>
              </div>
              
              <h2 className="text-xl md:text-2xl font-bold font-outfit text-white tracking-wide leading-tight">
                {eventTitle || 'Event Registration'}
              </h2>
              <p className="text-xs text-neutral-400 mt-1 font-sans">
                Enter your student details to reserve your operative seat and generate an access pass.
              </p>
            </div>

            <form id="registration-form" onSubmit={handleSubmit} className="space-y-3.5">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="flex items-center gap-2 p-3 bg-red-500/15 border border-red-500/30 rounded-xl text-xs text-red-300"
                  >
                    <AlertCircle className="size-4 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Full Name */}
              <LabelInputContainer>
                <Label htmlFor="reg-name" className="flex items-center gap-1.5 text-neutral-300">
                  <User className="size-3.5 text-red-400" />
                  Full Name
                </Label>
                <Input
                  required
                  id="reg-name"
                  name="name"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  glowColor="#ef4444"
                />
              </LabelInputContainer>

              {/* Email Address */}
              <LabelInputContainer>
                <Label htmlFor="reg-email" className="flex items-center gap-1.5 text-neutral-300">
                  <Mail className="size-3.5 text-red-400" />
                  Email Address
                </Label>
                <Input
                  required
                  id="reg-email"
                  type="email"
                  name="email"
                  placeholder="e.g. operative@college.edu"
                  value={formData.email}
                  onChange={handleChange}
                  glowColor="#ef4444"
                />
              </LabelInputContainer>

              {/* Class & PRN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <LabelInputContainer>
                  <Label htmlFor="reg-class" className="flex items-center gap-1.5 text-neutral-300">
                    <GraduationCap className="size-3.5 text-red-400" />
                    Class / Branch
                  </Label>
                  <Input
                    required
                    id="reg-class"
                    name="class_name"
                    type="text"
                    placeholder="e.g. TE AIML A"
                    value={formData.class_name}
                    onChange={handleChange}
                    glowColor="#ef4444"
                  />
                </LabelInputContainer>

                <LabelInputContainer>
                  <Label htmlFor="reg-prn" className="flex items-center gap-1.5 text-neutral-300">
                    <Hash className="size-3.5 text-red-400" />
                    PRN Number
                  </Label>
                  <Input
                    required
                    id="reg-prn"
                    name="prn_number"
                    type="text"
                    placeholder="e.g. 12210045"
                    value={formData.prn_number}
                    onChange={handleChange}
                    glowColor="#ef4444"
                  />
                </LabelInputContainer>
              </div>

              {/* Roll No */}
              <LabelInputContainer>
                <Label htmlFor="reg-roll" className="flex items-center gap-1.5 text-neutral-300">
                  <Hash className="size-3.5 text-red-400" />
                  Roll Number
                </Label>
                <Input
                  required
                  id="reg-roll"
                  type="text"
                  name="roll_no"
                  placeholder="e.g. 42"
                  value={formData.roll_no}
                  onChange={handleChange}
                  glowColor="#ef4444"
                />
              </LabelInputContainer>
            </form>
          </ModalContent>

          <ModalFooter className="pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-neutral-400 hover:text-white hover:bg-white/5 text-xs font-medium font-mono transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="registration-form"
              disabled={isSubmitting}
              className="group/btn relative px-6 py-2.5 rounded-xl bg-gradient-to-br from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-mono font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(239,68,68,0.35)] overflow-hidden"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-3.5 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Submit Registration</span>
                  <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
                </>
              )}
              <BottomGradient />
            </button>
          </ModalFooter>
        </ModalBody>
      </Modal>
    </>
  );
}


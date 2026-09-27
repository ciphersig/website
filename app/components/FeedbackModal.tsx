'use client';

import { useState } from 'react';
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
import {
  User,
  Hash,
  GraduationCap,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  Loader2,
  Star
} from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string | null;
  eventTitle: string | null;
}

const BottomGradient = () => {
  return (
    <>
      <span className="absolute inset-x-0 -bottom-px block h-px w-full bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-0 transition duration-500 group-hover/btn:opacity-100" />
      <span className="absolute inset-x-10 -bottom-px mx-auto block h-px w-1/2 bg-gradient-to-r from-transparent via-purple-400 to-transparent opacity-0 blur-sm transition duration-500 group-hover/btn:opacity-100" />
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

export function FeedbackModal({ isOpen, onClose, eventId, eventTitle }: FeedbackModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    prn_number: '',
    class_name: '',
    rating: 0,
    comment: '',
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    if (formData.rating === 0) {
      setError('Please provide a star rating.');
      return;
    }
    
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, eventId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit feedback');

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
        setFormData({ name: '', prn_number: '', class_name: '', rating: 0, comment: '' });
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'An error occurred during submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
  };

  return (
    <Modal open={isOpen} setOpen={(open) => { if (!open) onClose(); }}>
      <ModalBody className="max-w-lg bg-[#0F0D0F] border border-white/15 text-white shadow-[0_0_50px_rgba(0,0,0,0.9)] rounded-2xl">
        {success ? (
          <ModalContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="size-16 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </motion.div>
            <h3 className="text-xl font-bold font-outfit text-white">Feedback Submitted</h3>
            <p className="text-sm text-neutral-400">Thank you for your response!</p>
          </ModalContent>
        ) : (
          <>
            <ModalContent className="space-y-5">
              {/* Header */}
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/25 text-purple-400 text-[11px] font-mono uppercase tracking-widest mb-3">
                  <span className="size-1.5 rounded-full bg-purple-400 animate-pulse" />
                  <span>Mission Debrief</span>
                </div>
                
                <h2 className="text-xl md:text-2xl font-bold font-outfit text-white tracking-wide leading-tight">
                  {eventTitle || 'Event Feedback'}
                </h2>
                <p className="text-xs text-neutral-400 mt-1 font-sans">
                  Submit your operative debrief and rate your experience.
                </p>
              </div>

              <form id="feedback-form" onSubmit={handleSubmit} className="space-y-3.5">
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

                {/* Rating */}
                <LabelInputContainer>
                  <Label className="flex items-center gap-1.5 text-neutral-300 mb-1">
                    <Star className="size-3.5 text-purple-400" />
                    Event Rating
                  </Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 focus:outline-none transition-transform hover:scale-110 cursor-pointer"
                      >
                        <Star
                          className={`size-6 ${
                            star <= (hoverRating || formData.rating)
                              ? 'fill-purple-400 text-purple-400'
                              : 'text-neutral-600'
                          } transition-colors`}
                        />
                      </button>
                    ))}
                  </div>
                </LabelInputContainer>

                {/* Full Name */}
                <LabelInputContainer>
                  <Label htmlFor="fb-name" className="flex items-center gap-1.5 text-neutral-300">
                    <User className="size-3.5 text-purple-400" />
                    Full Name
                  </Label>
                  <Input
                    required
                    id="fb-name"
                    name="name"
                    type="text"
                    placeholder="e.g. John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    glowColor="#a855f7"
                  />
                </LabelInputContainer>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <LabelInputContainer>
                    <Label htmlFor="fb-prn" className="flex items-center gap-1.5 text-neutral-300">
                      <Hash className="size-3.5 text-purple-400" />
                      PRN Number
                    </Label>
                    <Input
                      required
                      id="fb-prn"
                      name="prn_number"
                      type="text"
                      placeholder="e.g. 12210045"
                      value={formData.prn_number}
                      onChange={handleChange}
                      glowColor="#a855f7"
                    />
                  </LabelInputContainer>
                  
                  <LabelInputContainer>
                    <Label htmlFor="fb-class" className="flex items-center gap-1.5 text-neutral-300">
                      <GraduationCap className="size-3.5 text-purple-400" />
                      Division / Class
                    </Label>
                    <Input
                      required
                      id="fb-class"
                      name="class_name"
                      type="text"
                      placeholder="e.g. TE AIML A"
                      value={formData.class_name}
                      onChange={handleChange}
                      glowColor="#a855f7"
                    />
                  </LabelInputContainer>
                </div>

                <LabelInputContainer>
                  <Label htmlFor="fb-comment" className="flex items-center gap-1.5 text-neutral-300">
                    <MessageSquare className="size-3.5 text-purple-400" />
                    Additional Comments
                  </Label>
                  <textarea
                    id="fb-comment"
                    name="comment"
                    placeholder="Tell us what you thought about the event..."
                    value={formData.comment}
                    onChange={handleChange}
                    className="flex min-h-24 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-sm placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 text-neutral-200 transition-colors"
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
                form="feedback-form"
                disabled={isSubmitting}
                className="group/btn relative px-6 py-2.5 rounded-xl bg-gradient-to-br from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-mono font-semibold text-xs uppercase tracking-wider transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(168,85,247,0.35)] overflow-hidden"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Submitting...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Debrief</span>
                    <ArrowRight className="size-3.5 transition-transform group-hover/btn:translate-x-1" />
                  </>
                )}
                <BottomGradient />
              </button>
            </ModalFooter>
          </>
        )}
      </ModalBody>
    </Modal>
  );
}

'use client';

import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider = ({
  children,
  open: controlledOpen,
  setOpen: setControlledOpen,
}: {
  children: ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const isControlled = controlledOpen !== undefined;
  const open = isControlled ? controlledOpen : internalOpen;
  const setOpen = isControlled && setControlledOpen ? setControlledOpen : setInternalOpen;

  return (
    <ModalContext.Provider value={{ open, setOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModal must be used within a ModalProvider');
  }
  return context;
};

export function Modal({
  children,
  open,
  setOpen,
}: {
  children: ReactNode;
  open?: boolean;
  setOpen?: (open: boolean) => void;
}) {
  return (
    <ModalProvider open={open} setOpen={setOpen}>
      {children}
    </ModalProvider>
  );
}

export const ModalTrigger = ({
  children,
  className,
  onClick,
}: {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  const { setOpen } = useModal();
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick?.();
        setOpen(true);
      }}
    >
      {children}
    </button>
  );
};

export const ModalBody = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const { open, setOpen } = useModal();

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 h-full w-full flex items-center justify-center [perspective:1000px] [transform-style:preserve-3d] z-50 p-4 bg-black/75"
          onClick={() => setOpen(false)}
        >
          <motion.div
            className={`relative w-full max-w-lg bg-[#0F0D0F]/95 border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden z-10 ${className || ''}`}
            initial={{
              opacity: 0,
              scale: 0.85,
              rotateX: 25,
              y: 40,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              rotateX: 0,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.85,
              rotateX: 15,
              y: 30,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 24,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <CloseIcon setOpen={setOpen} />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export const ModalContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div className={`p-6 md:p-8 ${className || ''}`}>
      {children}
    </div>
  );
};

export const ModalFooter = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={`flex items-center justify-end gap-3 p-4 md:px-8 bg-white/[0.02] border-t border-white/10 ${className || ''}`}
    >
      {children}
    </div>
  );
};

const CloseIcon = ({ setOpen }: { setOpen: (open: boolean) => void }) => {
  return (
    <button
      type="button"
      onClick={() => setOpen(false)}
      className="absolute top-4 right-4 group p-2 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all cursor-pointer z-50 border border-white/10 hover:border-white/20"
      aria-label="Close modal"
    >
      <X className="size-4 group-hover:rotate-90 transition-transform duration-200" />
    </button>
  );
};

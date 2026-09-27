import * as motion from 'motion/react-client';
import { WordsReveal } from '@/components/templates/endless/lib/animations';

export function EndlessCard({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.article
      className={`rounded-2xl border border-white/10 bg-[#0F0D0F] p-6 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, delay, ease: 'easeOut' }}
    >
      {children}
    </motion.article>
  );
}

export function EndlessPageHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <header className="mb-12 space-y-4">
      <WordsReveal
        as="h1"
        className="text-3xl sm:text-4xl text-neutral-100 leading-tight"
        text={title}
        step={0.08}
        duration={0.6}
      />
      <WordsReveal
        as="p"
        className="text-sm sm:text-base text-neutral-400 max-w-2xl leading-relaxed"
        text={description}
        step={0.04}
        delay={0.2}
        duration={0.5}
      />
    </header>
  );
}

export function EndlessButton({
  children,
  variant = 'primary',
  className = '',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
}) {
  const styles = {
    primary: 'bg-white text-black hover:bg-neutral-200',
    secondary: 'bg-transparent text-white border border-white/20 hover:bg-white/5',
    ghost: 'bg-white/10 text-white hover:bg-white/20',
  };
  return (
    <button
      className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function EndlessBadge({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-medium text-neutral-100 ${className}`}>
      {children}
    </span>
  );
}

export function EndlessInput({
  label,
  className = '',
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <div className="space-y-2">
      {label && <label className="text-xs text-neutral-400 font-medium">{label}</label>}
      <input
        className={`w-full bg-neutral-900 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-neutral-100 placeholder:text-neutral-500 outline-none focus:border-white/20 ${className}`}
        {...props}
      />
    </div>
  );
}

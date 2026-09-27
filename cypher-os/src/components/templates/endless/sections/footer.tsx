import { Link } from "react-router-dom";
import * as motion from "motion/react-client";
import { Shield } from "lucide-react";
import { WordsReveal } from "../lib/animations";
import { SYSTEM_CONFIG } from "@/constants/system";

export function Footer({ className }: { className?: string }) {
  return (
    <motion.footer
      className={`bg-black border-t border-neutral-100/20 ${className ?? ""}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
    >
      <div className="max-w-6xl mx-auto px-5 py-12 flex flex-col gap-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          <div className="md:col-span-4 flex items-center gap-3">
            <motion.div
              className="size-8 rounded-lg bg-white/10 flex items-center justify-center"
              initial={{ scale: 0, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <Shield className="size-5 text-white" />
            </motion.div>
            <span className="text-lg sm:text-xl font-medium text-neutral-100">
              {SYSTEM_CONFIG.name.split("").map((ch, i) => (
                <motion.span
                  key={i}
                  className="inline-block"
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.4, delay: 0.3 + i * 0.06, ease: "easeOut" }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          </div>
          <nav aria-label="Company links" className="md:col-span-4 flex flex-col gap-3">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ staggerChildren: 0.12, delayChildren: 0.9 }}
            >
              {[
                { label: "About", to: "/about" },
                { label: "Privacy policy", to: "#" },
                { label: "Terms and conditions", to: "#" },
                { label: "Contact us", to: "#" },
              ].map((l) => (
                <motion.div
                  key={l.label}
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <Link
                    to={l.to}
                    className="text-xs sm:text-sm font-medium text-neutral-100 hover:opacity-70 transition-opacity block"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </nav>
          <nav aria-label="Social links" className="md:col-span-4 flex flex-col gap-3">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ staggerChildren: 0.12, delayChildren: 1.5 }}
            >
              {["Twitter/X", "LinkedIn", "Discord"].map((l) => (
                <motion.a
                  key={l}
                  href="#"
                  className="text-xs sm:text-sm font-medium text-neutral-100 cursor-pointer hover:opacity-70 transition-opacity block"
                  variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  {l}
                </motion.a>
              ))}
            </motion.div>
          </nav>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
          <div className="md:col-span-4">
            <motion.p
              className="text-xs font-medium text-neutral-100"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: 2.0, ease: "easeOut" }}
            >
              {SYSTEM_CONFIG.clubName} — 2026
            </motion.p>
          </div>
          <div className="md:col-span-8">
            <p className="text-xs font-normal text-neutral-100 opacity-70 leading-5 max-w-[760px]">
              <WordsReveal
                text="CYPHER OS is committed to protecting member privacy and training data. We collect only what is needed to manage club events, academy progress, and dashboard access. All credentials are encrypted and stored securely. We do not share member information with third parties without consent. For details, see our privacy policy."
                step={0.02}
                delay={2.3}
                duration={0.4}
              />
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
}

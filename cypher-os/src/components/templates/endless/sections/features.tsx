import { useState } from "react";
import { Link } from "react-router-dom";
import * as motion from "motion/react-client";
import { WordsReveal, CountUp } from "../lib/animations";

const ICONS = "https://qclay.design/lovable/codeba/icons/";
const typeUrl = ICONS + "type.svg";
const imagePlusUrl = ICONS + "image-plus.svg";
const squareUrl = ICONS + "square.svg";
const threeDotUrl = ICONS + "ThreeDot.svg";

export function Features({ className }: { className?: string }) {
  return (
    <section aria-label="Features" className={`px-5 pt-16 pb-16 ${className ?? ""}`}>
      <div className="max-w-6xl mx-auto">
        <SectionHeader />
        <FeatureCards />
      </div>
    </section>
  );
}

function SectionHeader() {
  return (
    <header className="flex flex-col md:flex-row items-start justify-between mb-12 gap-6">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col gap-6 w-full md:max-w-[600px]"
      >
        <WordsReveal
          as="h2"
          className="text-2xl sm:text-3xl leading-tight text-neutral-100 font-normal"
          text="Create space for the security tools that matter. From CTF prep to live exploit labs in seconds."
        />
        <div className="flex items-center gap-3">
          <Link
            to="/signup"
            className="bg-white text-black rounded-xl px-4 py-3 text-sm font-medium hover:bg-neutral-200 transition-colors"
          >
            Join club now
          </Link>
          <span className="hidden md:block text-sm text-neutral-500">Train faster</span>
        </div>
      </motion.div>
      <motion.p
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
        className="hidden md:block text-base text-neutral-500 text-right shrink-0"
      >
        Train faster
      </motion.p>
    </header>
  );
}

function ListItem({ icon, label, active = false }: { icon: string; label: string; active?: boolean }) {
  return (
    <div
      className={`flex items-center gap-2 px-2.5 py-2 rounded-xl ${
        active
          ? "bg-white/5 bg-gradient-to-r from-[#999999]/20 via-transparent to-transparent border border-white/10 border-r-transparent border-b-transparent"
          : "border border-transparent"
      }`}
    >
      <div
        className={`size-7 rounded-md flex items-center justify-center ${
          active ? "bg-white/80" : "bg-white/5 border border-white/10"
        }`}
      >
        <img src={icon} alt="" width={14} height={14} style={active ? { filter: "invert(1)" } : undefined} />
      </div>
      <span className={`text-xs text-neutral-100 ${active ? "" : "opacity-60"}`}>{label}</span>
    </div>
  );
}

function FeatureCards() {
  const [countActive, setCountActive] = useState(false);
  const cardAnim = (delay: number) => ({
    initial: { opacity: 0, y: 50 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: 0.7, delay, ease: "easeOut" as const },
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <motion.article
        {...cardAnim(0.1)}
        className="relative h-[380px] rounded-2xl overflow-hidden bg-neutral-950 flex flex-col items-center text-center pt-8 px-5"
        style={{ backgroundImage: "radial-gradient(ellipse at 31% -7%, rgba(255,255,255,0.05), transparent)" }}
      >
        <WordsReveal
          as="h3"
          className="text-xl sm:text-2xl text-neutral-100 leading-tight"
          text="Event notices and CTF registration"
          delay={0.2}
        />
        <p className="mt-4 text-xs sm:text-sm opacity-40 text-neutral-100 max-w-[280px]">
          <WordsReveal
            as="span"
            text="Stay informed on workshops, live Capture The Flag competitions, and security hackathons with one-click registration."
            delay={0.5}
            step={0.04}
            duration={0.6}
          />
        </p>
        <motion.div
          className="absolute bottom-0 left-4 right-4 bg-white/5 border border-white/5 rounded-t-2xl p-2.5 pt-5 flex flex-col gap-1"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          variants={{
            hidden: { opacity: 0, y: 60 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut", delayChildren: 0.5, staggerChildren: 0.15 } },
          }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
        >
          {[
            { icon: typeUrl, label: "CTF Events", active: true },
            { icon: imagePlusUrl, label: "Workshops" },
            { icon: squareUrl, label: "Hackathons" },
          ].map((it) => (
            <motion.div key={it.label} variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.6, ease: "easeOut" }}>
              <ListItem icon={it.icon} label={it.label} active={it.active} />
            </motion.div>
          ))}
        </motion.div>
      </motion.article>

      <motion.article
        {...cardAnim(0.3)}
        className="relative h-[380px] rounded-2xl overflow-hidden bg-neutral-900 flex flex-col items-center text-center pt-8 px-5"
      >
        <WordsReveal
          as="h3"
          className="text-xl sm:text-2xl text-neutral-100 leading-tight"
          text="Self-learning academy modules"
          delay={0.4}
        />
        <p className="mt-4 text-xs sm:text-sm opacity-40 text-neutral-100 max-w-[300px]">
          <WordsReveal
            as="span"
            text="Hands-on modules in Web Exploitation, Reverse Engineering, Cryptography, and OSINT with interactive terminal challenges."
            delay={0.7}
            step={0.04}
            duration={0.6}
          />
        </p>
        <motion.div
          className="mt-3 flex justify-center gap-1.5"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.12, delayChildren: 1.0 }}
        >
          {["Web", "RevEng", "Crypto"].map((t) => (
            <motion.span
              key={t}
              variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="bg-white/10 text-neutral-100 text-[10px] opacity-40 rounded-md px-2 py-0.5"
            >
              {t}
            </motion.span>
          ))}
        </motion.div>
        <motion.div
          className="absolute bottom-0 w-3/4 sm:w-2/3 left-1/2 h-[180px]"
          initial={{ opacity: 0, y: 80 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.9, ease: "easeOut", delay: 0.5 }}
          style={{ x: "-50%" }}
        >
          <div className="w-full h-full bg-neutral-950 border border-white/15 rounded-t-2xl p-3 flex flex-col justify-between font-mono text-[10px] shadow-2xl relative overflow-hidden">
            {/* Abstract circuit background overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-15 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
              <pattern id="circuit-grid" width="16" height="16" patternUnits="userSpaceOnUse">
                <path d="M 16 0 L 0 0 0 16" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-emerald-400" />
                <circle cx="8" cy="8" r="1" fill="currentColor" className="text-emerald-400" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#circuit-grid)" />
            </svg>

            {/* Terminal header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-1.5 z-10">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-red-500/80" />
                <span className="size-2 rounded-full bg-yellow-500/80" />
                <span className="size-2 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[9px] text-neutral-400 tracking-wider">cypher@lab:~</span>
            </div>

            {/* Terminal code snippet content */}
            <div className="space-y-1 text-left py-1 z-10">
              <div className="text-neutral-300">
                <span className="text-emerald-400">$</span> cypher-cli lab start web-04
              </div>
              <div className="text-neutral-500 text-[9px]">[+] Spawning sandbox container...</div>
              <div className="text-emerald-400 text-[9px]">[✓] Target IP: 10.10.14.88</div>
              <div className="text-neutral-200 text-[9px] font-semibold flex items-center gap-1">
                <span className="text-blue-400">&gt;</span> SHELL: ACTIVE <span className="inline-block w-1.5 h-3 bg-emerald-400 animate-pulse ml-0.5" />
              </div>
            </div>

            {/* Terminal status footer */}
            <div className="flex items-center justify-between text-[8px] text-neutral-500 pt-1 border-t border-white/10 z-10">
              <span>PORT 8080/TCP</span>
              <span className="text-emerald-400 font-medium">SANDBOXED</span>
            </div>
          </div>
          <Link
            to="/academy"
            className="absolute top-6 -right-3 bg-white text-black text-xs font-medium rounded-lg px-2.5 py-1 shadow-lg z-20 hover:bg-neutral-200 transition-colors"
          >
            Start lab
          </Link>
        </motion.div>
      </motion.article>

      <motion.article
        {...cardAnim(0.5)}
        onViewportEnter={() => setCountActive(true)}
        className="relative h-[380px] rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#D0C9B9" }}
      >
        <div className="flex items-start justify-between p-5 pb-0">
          <div>
            <WordsReveal
              as="h3"
              className="mt-0.5 text-center text-neutral-900 leading-tight text-xl sm:text-2xl font-normal"
              text="Member dashboard analytics"
              delay={0.85}
              step={0.07}
            />
          </div>
          <img src={threeDotUrl} alt="" className="mt-2 shrink-0" />
        </div>
        <motion.div
          className="absolute bottom-14 left-0 w-full h-[140px] px-5 flex items-end justify-between gap-2 overflow-hidden"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          transition={{ staggerChildren: 0.1, delayChildren: 0.7 }}
        >
          {["33%", "16%", "72%", "36%", "88%", "22%"].map((h, i) => (
            <motion.div key={i} className="relative w-full flex items-end" style={{ height: h }} variants={{ hidden: {}, visible: {} }}>
              <motion.div
                className="relative w-full h-full flex flex-col"
                variants={{ hidden: { y: "100%" }, visible: { y: 0, transition: { duration: 0.4, ease: "easeOut" } } }}
              >
                <div className="w-full h-1 bg-black shrink-0 z-20" />
                <div className="relative w-full flex-1 overflow-hidden">
                  <motion.div
                    className="absolute inset-0 w-full z-0"
                    style={{
                      backgroundImage: "repeating-linear-gradient(-45deg, rgba(0,0,0,0.06) 0, rgba(0,0,0,0.06) 8px, rgba(0,0,0,0.12) 8px, rgba(0,0,0,0.12) 16px)",
                      backgroundSize: "22.63px 22.63px",
                    }}
                    animate={{ backgroundPosition: ["0px 0px", "22.63px 0px"] }}
                    transition={{ repeat: Infinity, ease: "linear", duration: 1.5 }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-black z-10"
                    variants={{ hidden: { y: "0%" }, visible: { y: "-100%", transition: { duration: 0.4, delay: 0.4, ease: "easeOut" } } }}
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </motion.div>
        <div className="absolute bottom-0 left-0 w-full h-14 flex items-end pb-3 px-5 gap-2">
          <span className="text-2xl sm:text-3xl text-neutral-900 leading-none">
            <CountUp end={2450} duration={3200} active={countActive} />
          </span>
          <span className="text-xs sm:text-sm text-neutral-900/80 leading-none pb-0.5">XP earned</span>
        </div>
      </motion.article>
    </div>
  );
}

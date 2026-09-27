import { useEffect, useState } from "react";
import { SYSTEM_CONFIG } from "@/constants/system";
import { Link } from "react-router-dom";
import * as motion from "motion/react-client";
import {
  WordsReveal,
  StaggeredWords,
  CountUpInView,
} from "../lib/animations";

const MEDIA = "https://qclay.design/lovable/codeba/";
const bgAsset = { url: MEDIA + "Bg.png" };
const dash01 = { url: MEDIA + "01.svg" };
const dash02 = { url: MEDIA + "dash02.svg" };
const dashLine = { url: MEDIA + "Line.svg" };
const dashCard3Pink = { url: MEDIA + "Card_3pink.png" };

export function Hero({
  className,
  heading = "Think like an attacker.\nBuild like a defender.",
  headingClassName,
  subtitle = SYSTEM_CONFIG.tagline,
  subtitleClassName,
}: {
  className?: string;
  heading?: string;
  headingClassName?: string;
  subtitle?: string;
  subtitleClassName?: string;
}) {
  const [heroReady, setHeroReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 2100);
    return () => clearTimeout(t);
  }, []);

  const headingLines = heading.split("\n");

  return (
    <section aria-label="Hero" className={`relative ${className ?? ""}`}>
      <div
        className="relative mx-4 rounded-2xl overflow-hidden"
        style={{ backgroundColor: "#0F0D0F" }}
      >
        <div className="relative">
          <div className="flex items-center px-4 py-6">
            <div className="flex-1 flex items-center justify-end gap-3">
              <div className="flex items-center space-x-[-8px]"></div>
            </div>
          </div>

          <div className="relative overflow-hidden mx-3 mb-0 border border-white/10 rounded-2xl flex flex-col items-center text-center pt-16 px-6 pb-0">
            <img
              src={bgAsset.url}
              alt=""
              aria-hidden
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="absolute inset-0 bg-black/80 z-0" />
            <h1
              className={`relative z-10 text-4xl sm:text-5xl lg:text-6xl font-centrion font-normal text-neutral-100 max-w-4xl tracking-tight leading-[1.2] mb-6 mt-15 ${headingClassName ?? ""}`}
            >
              {headingLines.map((lineText, idx) => (
                <span key={idx} className="block">
                  <StaggeredWords text={lineText} baseDelay={300 + idx * 250} step={54} />
                </span>
              ))}
            </h1>
            <p
              className={`relative z-10 text-xl sm:text-2xl font-dxgaster opacity-80 text-neutral-100 max-w-3xl leading-relaxed mb-8 tracking-wide ${subtitleClassName ?? ""}`}
            >
              <StaggeredWords text={subtitle} baseDelay={900} step={33} />
            </p>
            <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 mb-8">
              <Link
                to="/signup"
                className="bg-white text-black font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-neutral-200 transition-colors shadow-lg"
              >
                Initialize Operative ID
              </Link>
              <Link
                to="/academy"
                className="bg-white/10 text-white font-medium text-sm px-5 py-2.5 rounded-xl hover:bg-white/20 border border-white/10 transition-colors"
              >
                Launch Academy Lab
              </Link>
            </div>
            <DashboardPreview heroReady={heroReady} />
          </div>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 w-full h-[300px] bg-gradient-to-t from-black via-black/90 to-transparent pointer-events-none z-50" />
    </section>
  );
}

function DashboardPreview({ heroReady }: { heroReady: boolean }) {
  return (
    <div className="w-full max-w-[940px] h-[460px] mx-auto bg-black rounded-xl outline outline-[1.4px] outline-neutral-100/10 flex overflow-hidden relative z-10 top-20">
      <aside
        aria-label="Layer panel"
        className="w-44 shrink-0 h-full relative bg-black border-r border-white/10"
      >
        <motion.div
          className="flex items-center gap-4 px-3 py-3"
          initial={{ opacity: 0, y: 20 }}
          animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.36, delay: 0.06, ease: "easeOut" }}
        >
          <span className="text-xs font-medium text-neutral-100">Modules</span>
          <span className="text-xs font-medium text-neutral-100 opacity-30">
            Events
          </span>
        </motion.div>
        <div className="flex flex-col gap-3 p-3 w-[calc(100%+1rem)] -ml-4 pl-7 border-t border-white/10">
          {[
            <img
              key="d1"
              src={dash01.url}
              alt="Events"
              className="h-7 w-auto object-contain object-left ml-2"
            />,
            <img
              key="d2"
              src={dash02.url}
              alt="Academy"
              className="h-7 w-auto object-contain object-left ml-2"
            />,
            <div
              key="tools"
              className="flex items-center gap-2 h-7 px-2 text-neutral-300 text-xs"
            >
              <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m14.7 6.3 3 3" />
                  <path d="M3 21v-3l11-11 3 3L6 21z" />
                </svg>
              </span>
              Labs
            </div>,
            <div
              key="cards"
              className="flex items-center gap-2 h-8 px-1 rounded-lg bg-white/[0.08] outline outline-1 outline-white/5"
            >
              <span className="w-7 h-7 ml-1 rounded-lg bg-blue-500 flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
              </span>
              <span className="text-xs text-neutral-100">Dashboard</span>
            </div>,
            <div
              key="add"
              className="flex items-center gap-2 h-7 px-2 text-neutral-300 text-xs"
            >
              <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
              </span>
              Add module
            </div>,
          ].map((node, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{
                duration: 0.72,
                delay: 0.12 + i * 0.2,
                ease: "easeOut",
              }}
            >
              {node}
            </motion.div>
          ))}
        </div>
      </aside>

      <div className="flex-1 p-3 flex flex-wrap gap-x-3 gap-y-3 content-start">
        <article className="w-72 h-44 relative bg-[#D0C9B9] rounded-2xl overflow-hidden p-4 flex flex-col text-[#131113]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.36, delay: 0.18, ease: "easeOut" }}
            className="flex flex-col h-full"
          >
            <div className="flex justify-between relative z-10">
              <div className="flex flex-col">
                <WordsReveal
                  as="span"
                  className="text-[10px] opacity-40"
                  text="Threat level"
                  delay={0.66}
                  step={0.048}
                  duration={0.3}
                  active={heroReady}
                />
                <WordsReveal
                  as="span"
                  className="text-lg font-medium mt-0.5"
                  text="Level 01"
                  delay={0.75}
                  step={0.048}
                  duration={0.3}
                  active={heroReady}
                />
              </div>
              <div className="flex flex-col items-end">
                <WordsReveal
                  as="span"
                  className="text-[10px] opacity-40"
                  text="Uptime"
                  delay={0.66}
                  step={0.048}
                  duration={0.3}
                  active={heroReady}
                />
                <span className="text-lg font-medium mt-0.5">
                  <CountUpInView
                    end={99}
                    duration={1200}
                    delay={780}
                    active={heroReady}
                  />
                  %
                </span>
              </div>
            </div>
            <div className="flex justify-between w-full mt-2 relative z-10">
              <WordsReveal
                as="span"
                className="text-[10px] text-stone-950"
                text="Enc"
                delay={0.9}
                step={0.048}
                duration={0.3}
                active={heroReady}
              />
              <WordsReveal
                as="span"
                className="text-[10px] opacity-40"
                text="AES-256"
                delay={0.9}
                step={0.048}
                duration={0.3}
                active={heroReady}
              />
            </div>
            <motion.div
              className="absolute inset-0 z-0 pointer-events-none"
              initial={{ clipPath: "inset(0 100% 0 0)" }}
              animate={
                heroReady
                  ? { clipPath: "inset(0 0% 0 0)" }
                  : { clipPath: "inset(0 100% 0 0)" }
              }
              transition={{ duration: 0.72, delay: 0.48, ease: "easeInOut" }}
            >
              <img
                src={dashLine.url}
                alt=""
                className="absolute inset-0 w-full h-full object-cover scale-[1.015] origin-center pointer-events-none"
              />
            </motion.div>
          </motion.div>
        </article>

        <article className="w-28 h-44 relative rounded-2xl overflow-hidden flex flex-col justify-center items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.36, delay: 0.24, ease: "easeOut" }}
            className="w-full h-full"
          >
            <img
              src={dashCard3Pink.url}
              alt=""
              className="absolute inset-0 w-full h-full object-cover z-0"
            />
            <div className="relative z-10 flex flex-col items-center pt-10">
              <span className="text-2xl font-medium text-neutral-900">
                <CountUpInView
                  end={1420}
                  duration={1200}
                  delay={360}
                  active={heroReady}
                />
              </span>
              <motion.span
                className="text-xs text-neutral-900/60 mt-0.5"
                initial={{ opacity: 0, y: 10 }}
                animate={
                  heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }
                }
                transition={{ duration: 0.3, delay: 0.42, ease: "easeOut" }}
              >
                Operatives
              </motion.span>
            </div>
          </motion.div>
        </article>

        {/* Card 3: Vulnerability Scanner Visual */}
        <article className="w-52 h-44 rounded-2xl overflow-hidden bg-neutral-950 border border-white/10 p-3.5 flex flex-col justify-between">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.36, delay: 0.3, ease: "easeOut" }}
            className="w-full h-full flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                TARGET: ARMED
              </span>
              <span className="text-[10px] text-neutral-500 font-mono">10.0.4.12</span>
            </div>
            <div className="space-y-1 font-mono text-[11px] my-auto">
              <div className="text-neutral-200 font-medium">CVE-2026-3190</div>
              <div className="text-neutral-500 text-[10px]">Buffer Overflow in LibAuth</div>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <span className="text-[10px] text-neutral-400">Severity</span>
              <span className="text-[10px] text-red-400 font-mono font-medium">CRITICAL 9.8</span>
            </div>
          </motion.div>
        </article>

        {/* Card 4: Security Tool Chain Visual */}
        <article className="w-52 h-44 rounded-2xl overflow-hidden bg-[#0F0D0F] border border-white/10 p-3.5 flex flex-col justify-between -mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.36, delay: 0.36, ease: "easeOut" }}
            className="w-full h-full flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-white">Tool Chain</span>
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="space-y-1.5 text-[10px] font-mono my-auto">
              <div className="flex items-center justify-between bg-white/5 px-2 py-1 rounded text-neutral-300 border border-white/5">
                <span>Ghidra Reverser</span>
                <span className="text-[9px] text-emerald-400">Active</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 px-2 py-1 rounded text-neutral-300 border border-white/5">
                <span>Burp Suite Proxy</span>
                <span className="text-[9px] text-emerald-400">Hooked</span>
              </div>
              <div className="flex items-center justify-between bg-white/5 px-2 py-1 rounded text-neutral-300 border border-white/5">
                <span>Metasploit</span>
                <span className="text-[9px] text-neutral-400">Ready</span>
              </div>
            </div>
            <div className="text-[10px] text-neutral-500 font-mono pt-1">4 tools hooked</div>
          </motion.div>
        </article>

        {/* Card 5: Encrypted Telemetry & Cipher Stream Visual */}
        <article className="w-[420px] h-44 rounded-2xl overflow-hidden bg-black border border-white/10 p-3.5 flex flex-col justify-between -mt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={heroReady ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.36, delay: 0.42, ease: "easeOut" }}
            className="w-full h-full flex flex-col justify-between"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-blue-400" />
                <span className="text-[11px] font-mono text-neutral-300">CYPHER // TELEMETRY STREAM</span>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">1.42 GB/s</span>
            </div>
            <div className="font-mono text-[10px] space-y-1 text-neutral-400 leading-relaxed overflow-hidden my-auto">
              <div className="text-emerald-400">[+] Handshake OK: ECDHE-RSA-AES256-GCM</div>
              <div>[+] RSA-4096 signature verified across 12 nodes</div>
              <div className="text-blue-400">[i] Zero-day vector sandbox isolation active</div>
              <div className="text-neutral-500">[log] Session token 0x99F4 authenticated</div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-neutral-500 border-t border-white/10 pt-1.5 font-mono">
              <span>PACKET_FILTER: ENABLED</span>
              <span className="text-emerald-400">LATENCY: 0.02ms</span>
            </div>
          </motion.div>
        </article>
      </div>
    </div>
  );
}


import { Link } from "react-router-dom";
import * as motion from "motion/react-client";
import { WordsReveal } from "../lib/animations";
import { ShieldCheck } from "lucide-react";

const ICONS = "https://qclay.design/lovable/codeba/icons/";
const checkMarkUrl = ICONS + "CheckMark.svg";

export function Pricing({ className }: { className?: string }) {
  return (
    <section aria-label="Operative clearance levels" className={`bg-black px-5 py-16 ${className ?? ""}`}>
      <div className="max-w-6xl mx-auto flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-4">
          <ShieldCheck className="size-3.5" />
          <span>100% FREE • OPEN OPERATIVE CLEARANCE</span>
        </div>
        <WordsReveal
          as="h2"
          className="text-2xl sm:text-3xl lg:text-4xl text-white text-center mb-3"
          text="Operative Clearance Levels"
          step={0.1}
          duration={0.6}
        />
        <p className="text-sm text-neutral-400 text-center max-w-xl mb-10">
          CYPHER OS operates on a merit-based clearance model. All levels are completely free and unlocked through academy progress and CTF participation.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full">
          <ClearanceCard
            level="Level 01"
            title="Recruit Clearance"
            badge="ENTRY CLEARANCE"
            description="Access public CTF alerts, introductory web exploitation labs, and community channels."
            features={[
              { label: "Event notices and CTF alerts" },
              { label: "Beginner academy modules" },
              { label: "Community Discord access" },
              { label: "Workshop live stream access" },
              { label: "Personal XP dashboard tracking" },
              { label: "Weekly security briefings" },
              { label: "Priority CTF slots", dim: true },
              { label: "Advanced exploit sandboxes", dim: true },
              { label: "Kernel reversing labs", dim: true },
            ]}
            cta="Enroll as Recruit"
            ctaClass="bg-white text-neutral-950 hover:bg-neutral-200"
            to="/signup"
          />
          <ClearanceCard
            level="Level 02"
            title="Active Operative"
            badge="CORE CLEARANCE"
            featured
            description="Full clearance for active hackers. Unlocks all academy modules, priority CTF rosters, and lab sandboxes."
            features={[
              { label: "All academy modules (Web, RevEng, Crypto)" },
              { label: "Priority CTF competition registration" },
              { label: "Interactive isolated lab sandbox access" },
              { label: "Member dashboard and XP analytics" },
              { label: "CTF squad formation & lobbies" },
              { label: "Real-time vulnerability exploit labs" },
              { label: "Club ranking leaderboard" },
              { label: "Direct squad team channels" },
              { label: "Executive node mentorship", dim: true },
            ]}
            cta="Claim Active Clearance"
            ctaClass="bg-emerald-500 text-neutral-950 font-semibold hover:bg-emerald-400"
            to="/signup"
          />
          <ClearanceCard
            level="Level 03"
            title="Top Secret Clearance"
            badge="TOP SECRET"
            description="Advanced clearance for senior researchers and competition team leads. Unlocks kernel labs and research slots."
            features={[
              { label: "Unlimited zero-day & kernel labs" },
              { label: "Elite CTF competition team roster" },
              { label: "Advanced binary exploitation labs" },
              { label: "Custom research project allocation" },
              { label: "Direct 1-on-1 Executive Node mentorship" },
              { label: "Conference & CTF travel support" },
              { label: "Dedicated 24/7 isolated cloud range" },
              { label: "High-frequency scanner API access" },
              { label: "Custom payload generator access" },
            ]}
            cta="Request Top Secret Clearance"
            ctaClass="bg-white text-neutral-950 hover:bg-neutral-200"
            to="/signup"
          />
        </div>
      </div>
    </section>
  );
}

function ClearanceCard({
  level,
  title,
  badge,
  featured = false,
  description,
  features,
  cta,
  ctaClass,
  to,
}: {
  level: string;
  title: string;
  badge: string;
  featured?: boolean;
  description: string;
  features: { label: string; dim?: boolean }[];
  cta: string;
  ctaClass: string;
  to: string;
}) {
  const item = { hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } };
  return (
    <motion.article
      className={`flex flex-col mt-4 rounded-2xl p-6 relative ${
        featured
          ? "border-emerald-500/40 border-2 bg-[#0F120F]"
          : "border-white/10 border bg-[#0F0D0D]"
      }`}
      style={{ boxShadow: "0 20px 50px -20px rgba(0,0,0,0.8)" }}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ staggerChildren: 0.12, delayChildren: 0.2 }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-neutral-400">{badge}</span>
        <span className="text-xs font-mono px-2 py-0.5 rounded bg-white/10 text-emerald-400 font-medium">FREE</span>
      </div>
      <motion.div className="flex flex-col gap-0.5" variants={item} transition={{ duration: 0.55, ease: "easeOut" }}>
        <span className="text-xl sm:text-2xl font-medium text-white">{level}</span>
        <span className="text-xs font-mono text-neutral-400">{title}</span>
      </motion.div>
      <motion.p className="text-xs sm:text-sm text-neutral-400 mt-3 leading-6" variants={item} transition={{ duration: 0.55, ease: "easeOut" }}>
        {description}
      </motion.p>
      <motion.div className="border-t border-white/10 my-4" variants={item} transition={{ duration: 0.5, ease: "easeOut" }} />
      <div className="flex flex-col gap-3 flex-1">
        {features.map((f) => (
          <motion.div key={f.label} className="flex items-center gap-3" variants={item} transition={{ duration: 0.55, ease: "easeOut" }}>
            <div className={`size-4 bg-white/10 rounded-full flex justify-center items-center shrink-0 ${f.dim ? "opacity-40" : ""}`}>
              <img src={checkMarkUrl} alt="" width={12} height={12} className="opacity-80" />
            </div>
            <span className={`text-xs sm:text-sm ${f.dim ? "text-neutral-500" : "text-neutral-100"}`}>{f.label}</span>
          </motion.div>
        ))}
      </div>
      <Link to={to} className={`w-full py-2.5 rounded-xl font-medium mt-6 cursor-pointer text-xs sm:text-sm text-center block transition-colors ${ctaClass}`}>
        {cta}
      </Link>
    </motion.article>
  );
}


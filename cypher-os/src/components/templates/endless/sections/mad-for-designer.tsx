import { Link } from "react-router-dom";
import * as motion from "motion/react-client";
import { WordsReveal, Typewriter, ToolIcon } from "../lib/animations";

const MEDIA = "https://qclay.design/lovable/codeba/";
const ICONS = "https://qclay.design/lovable/codeba/icons/";
const bgAsset = { url: MEDIA + "Bg.png" };
const macDotUrl = ICONS + "MacDot.svg";
const whiteCursorUrl = ICONS + "WhiteCursor.svg";
const copyUrl = ICONS + "Copy.svg";
const plusUrl = ICONS + "plus.svg";

export function MadForDesigner({ className }: { className?: string }) {
  return (
    <section aria-label="For developers" className={`bg-black ${className ?? ""}`}>
      <div className="max-w-6xl mx-auto px-5 py-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="flex flex-col gap-4">
          <WordsReveal
            as="h2"
            className="text-2xl sm:text-3xl lg:text-4xl leading-tight text-white"
            text="Built for hackers by researchers"
            step={0.08}
            duration={0.6}
          />
          <WordsReveal
            as="p"
            className="text-sm sm:text-base opacity-60 text-neutral-100 max-w-[460px]"
            text="CYPHER OS provides everything you need to train, compete, and build real-world security skills across offensive and defensive domains."
            step={0.05}
            delay={0.3}
            duration={0.5}
          />
          <motion.div
            className="flex gap-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, delay: 0.8, ease: "easeOut" }}
          >
            <Link to="/academy" className="bg-white text-black px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-neutral-200 transition-colors">
              How it works
            </Link>
            <Link to="/events" className="bg-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors">
              View events
            </Link>
          </motion.div>
        </div>

        <motion.div
          className="rounded-2xl border border-white/10 overflow-hidden flex flex-col"
          style={{ backgroundColor: "#0F0D0F" }}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
        >
          <div className="flex justify-between items-center px-4 py-3">
            <img src={macDotUrl} alt="" width={48} height={10} />
            <motion.div
              className="flex gap-2"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              transition={{ staggerChildren: 0.15, delayChildren: 0.5 }}
            >
              {[whiteCursorUrl, copyUrl, plusUrl].map((src, i) => (
                <motion.div key={i} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} transition={{ duration: 0.5, ease: "easeOut" }}>
                  <ToolIcon src={src} />
                </motion.div>
              ))}
            </motion.div>
            <motion.button
              className="bg-white text-black text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-neutral-200 transition-colors cursor-pointer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.5, delay: 1.0, ease: "easeOut" }}
            >
              Export payload
            </motion.button>
          </div>

          <div className="mx-3 mb-3 relative rounded-xl overflow-hidden">
            <img src={bgAsset.url} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/80" />
            <div className="relative p-4 sm:p-6">
              <div className="flex justify-between items-start gap-3">
                <WordsReveal
                  as="h3"
                  className="text-xl sm:text-2xl text-white max-w-[360px] leading-tight"
                  text="Exploit and defense together"
                  step={0.08}
                  delay={0.5}
                  duration={0.6}
                />
                <motion.button
                  className="size-7 bg-zinc-800 rounded-lg flex items-center justify-center shrink-0 mt-3 cursor-pointer"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.5, delay: 1.1, ease: "easeOut" }}
                  aria-label="Copy code"
                >
                  <img src={copyUrl} alt="" width={12} height={12} />
                </motion.button>
              </div>
              <Typewriter
                className="mt-4 text-xs sm:text-sm opacity-60 text-neutral-100 leading-relaxed whitespace-pre-wrap font-mono"
                delay={1.2}
                speed={18}
                text={`#!/usr/bin/env python3
# CYPHER OS — SQLi PoC template
import requests

target = "https://lab.cypher.org/login"
payload = {"user": "admin' OR '1'='1", "pass": "x"}
resp = requests.post(target, data=payload)
print(resp.status_code, len(resp.text))`}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

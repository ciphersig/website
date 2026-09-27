import { useRef } from "react";
import * as motion from "motion/react-client";
import { useInView } from "motion/react";
import { CountNumber } from "../lib/animations";

const ICONS = "https://qclay.design/lovable/codeba/icons/";
const blueArrowUrl = ICONS + "blueArrow.svg";

export function Stats({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const cursorKeyframes = {
    opacity: [0, 1, 1, 1, 1],
    x: [80, -100, 28, 90, 90],
    y: [80, -8, -8, 30, 30],
  };
  const cursorTransition = {
    duration: 2.6,
    delay: 0.9,
    times: [0, 0.25, 0.6, 0.85, 1],
    ease: "easeInOut" as const,
  };

  return (
    <section aria-label="Statistics" ref={ref} className={`bg-black py-16 ${className ?? ""}`}>
      <div className="max-w-6xl mx-auto px-5 flex flex-col md:flex-row items-center justify-between gap-10">
        <motion.div
          className="flex flex-col items-center text-center gap-3"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0 }}
        >
          <span className="text-4xl sm:text-5xl text-neutral-100">
            <CountNumber to={87} start={inView} />%
          </span>
          <p className="text-sm sm:text-base text-neutral-100 opacity-40 max-w-[220px]">
            of club CTF wins come from Academy graduates
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col items-center text-center gap-3"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut", delay: 0.2 }}
        >
          <span className="text-4xl sm:text-5xl text-neutral-100">
            <CountNumber to={42} start={inView} />
          </span>
          <p className="text-sm sm:text-base text-neutral-100 opacity-40 max-w-[300px]">
            active operatives training across all divisions
          </p>
        </motion.div>

        <article className="relative bg-neutral-900 rounded-2xl p-6 sm:p-8 w-full max-w-[480px] overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7, ease: "easeOut", delay: 0.4 }}
          >
            <p className="text-xl sm:text-2xl md:text-3xl text-white leading-snug">
              We helped{" "}
              <span className="relative inline-block align-baseline px-1.5 py-0.5">
                <motion.span
                  aria-hidden
                  className="absolute inset-0 bg-white rounded-sm origin-left"
                  initial={{ scaleX: 0 }}
                  animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
                  transition={{ duration: 0.91, delay: 1.55, ease: "linear" }}
                  style={{ transformOrigin: "left center" }}
                />
                <span className="relative font-medium text-white">capture flags</span>
                <motion.span
                  aria-hidden
                  className="absolute inset-0 px-1.5 py-0.5 font-medium text-stone-950 whitespace-nowrap"
                  initial={{ clipPath: "inset(0 100% 0 0)" }}
                  animate={inView ? { clipPath: "inset(0 0% 0 0)" } : { clipPath: "inset(0 100% 0 0)" }}
                  transition={{ duration: 0.91, delay: 1.55, ease: "linear" }}
                >
                  capture flags
                </motion.span>
              </span>{" "}
              and build security portfolios
            </p>
            <motion.div
              className="absolute pointer-events-none"
              style={{ top: "40%", left: "55%" }}
              initial={{ opacity: 0, x: 100, y: 100 }}
              animate={inView ? cursorKeyframes : { opacity: 0, x: 100, y: 100 }}
              transition={cursorTransition}
            >
              <img src={blueArrowUrl} alt="" width={22} height={22} />
              <span className="absolute top-[18px] left-[14px] whitespace-nowrap bg-blue-500 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-tr-md rounded-bl-md rounded-br-md">
                Operative
              </span>
            </motion.div>
          </motion.div>
        </article>
      </div>
    </section>
  );
}

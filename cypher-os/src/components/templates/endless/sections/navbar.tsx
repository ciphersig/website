import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import * as motion from "motion/react-client";
import { Shield } from "lucide-react";
import { NAV_LINKS, SYSTEM_CONFIG } from "@/constants/system";

export function Navbar({ className }: { className?: string }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <header className={`sticky top-4 z-50 px-4 ${className ?? ""}`}>
        <div className="mx-auto max-w-6xl backdrop-blur-xl bg-white/[0.03] border border-white/[0.06] rounded-2xl px-5 py-3 flex items-center shadow-lg shadow-black/20">
          <Link to="/" className="shrink-0 flex items-center gap-2">
            <div className="size-7 rounded-lg bg-white/10 flex items-center justify-center">
              <Shield className="size-4 text-white" />
            </div>
            <span className="text-sm font-medium text-white hidden sm:inline">{SYSTEM_CONFIG.name}</span>
          </Link>
          <nav aria-label="Main navigation" className="hidden md:flex items-center gap-1 mx-auto">
            {NAV_LINKS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-white bg-white/10"
                      : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <Link
            to="/signup"
            className="hidden md:block bg-white text-black text-sm font-medium rounded-lg px-4 py-2 hover:bg-neutral-200 transition-colors shrink-0"
          >
            Join Club
          </Link>
          <button
            aria-label="Open menu"
            onClick={() => setMenuOpen(true)}
            className="ml-auto md:hidden flex flex-col gap-1.5 p-1.5"
          >
            <span className="block w-5 h-0.5 bg-neutral-100 rounded-full" />
            <span className="block w-5 h-0.5 bg-neutral-100 rounded-full" />
            <span className="block w-5 h-0.5 bg-neutral-100 rounded-full" />
          </button>
        </div>
      </header>

      {menuOpen && (
        <motion.div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl md:hidden flex flex-col p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2" onClick={() => setMenuOpen(false)}>
              <Shield className="size-6 text-white" />
              <span className="text-sm font-medium text-white">{SYSTEM_CONFIG.name}</span>
            </Link>
            <button
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
              className="size-8 flex items-center justify-center text-neutral-100 text-2xl leading-none rounded-lg hover:bg-white/10 transition-colors"
            >
              ×
            </button>
          </div>
          <nav aria-label="Mobile navigation" className="flex flex-col gap-2 mt-10">
            {NAV_LINKS.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className={`text-lg font-medium px-4 py-3 rounded-xl transition-colors ${
                    isActive ? "text-white bg-white/10" : "text-neutral-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <Link
            to="/signup"
            onClick={() => setMenuOpen(false)}
            className="mt-auto bg-white text-black rounded-xl py-3 text-sm font-medium text-center"
          >
            Join Club
          </Link>
        </motion.div>
      )}
    </>
  );
}

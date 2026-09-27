"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface RadialGlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  gradientTheme?: "default" | "red" | "blue" | "emerald" | "amber" | "purple" | "cyan" | "orange";
}

export function RadialGlowButton({
  children = "Get Extension",
  className,
  gradientTheme = "default",
  style,
  ...props
}: RadialGlowButtonProps) {
  return (
    <div className="relative inline-block w-full">
      <style>{`
        @property --rg-pos-x { syntax: '<percentage>'; initial-value: 40%; inherits: false; }
        @property --rg-pos-y { syntax: '<percentage>'; initial-value: 140%; inherits: false; }
        @property --rg-spread-x { syntax: '<percentage>'; initial-value: 130%; inherits: false; }
        @property --rg-spread-y { syntax: '<percentage>'; initial-value: 170%; inherits: false; }
        @property --rg-color-1 { syntax: '<color>'; initial-value: #000022; inherits: false; }
        @property --rg-color-2 { syntax: '<color>'; initial-value: #1f3f6d; inherits: false; }
        @property --rg-color-3 { syntax: '<color>'; initial-value: #469396; inherits: false; }
        @property --rg-color-4 { syntax: '<color>'; initial-value: #f1ffa5; inherits: false; }
        @property --rg-color-5 { syntax: '<color>'; initial-value: hsl(250 80% 2.5%); inherits: false; }
        @property --rg-border-angle { syntax: '<angle>'; initial-value: 180deg; inherits: true; }
        @property --rg-border-color-1 { syntax: '<color>'; initial-value: hsla(230, 75%, 90%, 0.7); inherits: true; }
        @property --rg-border-color-2 { syntax: '<color>'; initial-value: hsla(230, 50%, 90%, 0.25); inherits: true; }
        @property --rg-stop-1 { syntax: '<percentage>'; initial-value: 37.35%; inherits: false; }
        @property --rg-stop-2 { syntax: '<percentage>'; initial-value: 61.36%; inherits: false; }
        @property --rg-stop-3 { syntax: '<percentage>'; initial-value: 78.42%; inherits: false; }
        @property --rg-stop-4 { syntax: '<percentage>'; initial-value: 93.52%; inherits: false; }
        @property --rg-stop-5 { syntax: '<percentage>'; initial-value: 100%; inherits: false; }

        .rg-button {
          --transition: 0.25s;
          --spark: 1.8s;
          --speed: 1.2s;
          --cut: 1px;
          --bg: radial-gradient(
            var(--rg-spread-x) var(--rg-spread-y) at var(--rg-pos-x) var(--rg-pos-y),
            var(--rg-color-1) var(--rg-stop-1),
            var(--rg-color-2) var(--rg-stop-2),
            var(--rg-color-3) var(--rg-stop-3),
            var(--rg-color-4) var(--rg-stop-4),
            var(--rg-color-5) var(--rg-stop-5)
          );
          
          position: relative;
          width: 100%;
          min-height: 42px;
          padding: 10px 18px;
          border: none;
          border-radius: 11px;
          font-family: inherit;
          font-size: 13px;
          font-weight: 600;
          line-height: 1.3;
          color: rgba(255, 255, 255, 0.95);
          background: var(--bg);
          cursor: pointer;
          text-shadow: 0 0 2px rgba(0, 0, 0, 0.95);
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
          -webkit-tap-highlight-color: transparent;
          transition: 
            --rg-pos-x .75s, --rg-pos-y .75s,
            --rg-spread-x .75s, --rg-spread-y .75s,
            --rg-color-1 .75s, --rg-color-2 .75s, --rg-color-3 .75s, --rg-color-4 .75s, --rg-color-5 .75s,
            --rg-border-angle .75s, --rg-border-color-1 .75s, --rg-border-color-2 .75s,
            --rg-stop-1 .75s, --rg-stop-2 .75s, --rg-stop-3 .75s, --rg-stop-4 .75s, --rg-stop-5 .75s;
        }

        .rg-button::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1px;
          border-radius: inherit;
          background-image: linear-gradient(var(--rg-border-angle), var(--rg-border-color-1), var(--rg-border-color-2));
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          pointer-events: none;
        }

        .rg-button:hover {
          --rg-pos-x: 0%;
          --rg-pos-y: 120%;
          --rg-spread-x: 110.24%;
          --rg-spread-y: 110.2%;
          --rg-stop-1: 0%;
          --rg-stop-2: 10%;
          --rg-stop-3: 35.44%;
          --rg-stop-4: 71.34%;
          --rg-stop-5: 150%;
          --rg-border-angle: 190deg;
          --button-line-opacity: 1;
        }

        /* Red / Crimson Theme (Register) */
        .rg-theme-red {
          --rg-color-1: #3b0000;
          --rg-color-2: #800a0a;
          --rg-color-3: #c52222;
          --rg-color-4: #ff6b6b;
          --rg-color-5: #1a0000;
          --rg-border-color-1: rgba(239, 68, 68, 0.7);
          --rg-border-color-2: rgba(239, 68, 68, 0.25);
        }
        .rg-theme-red:hover {
          --rg-color-1: #200000;
          --rg-color-2: #ff7676;
          --rg-color-3: #c52222;
          --rg-color-4: #800a0a;
          --rg-border-color-1: rgba(254, 202, 202, 0.7);
          --rg-border-color-2: rgba(239, 68, 68, 0.4);
        }

        /* Emerald / Green Theme (Certificate) */
        .rg-theme-emerald {
          --rg-color-1: #002b1b;
          --rg-color-2: #065f46;
          --rg-color-3: #059669;
          --rg-color-4: #6ee7b7;
          --rg-color-5: #021a10;
          --rg-border-color-1: rgba(16, 185, 129, 0.7);
          --rg-border-color-2: rgba(16, 185, 129, 0.25);
        }
        .rg-theme-emerald:hover {
          --rg-color-1: #001f14;
          --rg-color-2: #a7f3d0;
          --rg-color-3: #10b981;
          --rg-color-4: #047857;
          --rg-border-color-1: rgba(209, 250, 229, 0.7);
          --rg-border-color-2: rgba(16, 185, 129, 0.4);
        }

        /* Blue / Cyan Theme (Gallery) */
        .rg-theme-blue {
          --rg-color-1: #00102b;
          --rg-color-2: #1e3a8a;
          --rg-color-3: #2563eb;
          --rg-color-4: #93c5fd;
          --rg-color-5: #030712;
          --rg-border-color-1: rgba(59, 130, 246, 0.7);
          --rg-border-color-2: rgba(59, 130, 246, 0.25);
        }
        .rg-theme-blue:hover {
          --rg-color-1: #000c22;
          --rg-color-2: #bfdbfe;
          --rg-color-3: #3b82f6;
          --rg-color-4: #1d4ed8;
          --rg-border-color-1: rgba(219, 234, 254, 0.7);
          --rg-border-color-2: rgba(59, 130, 246, 0.4);
        }

        /* Amber / Gold / Orange Theme (THB) */
        .rg-theme-amber {
          --rg-color-1: #2b1800;
          --rg-color-2: #78350f;
          --rg-color-3: #d97706;
          --rg-color-4: #fde68a;
          --rg-color-5: #1c0a00;
          --rg-border-color-1: rgba(245, 158, 11, 0.7);
          --rg-border-color-2: rgba(245, 158, 11, 0.25);
        }
        .rg-theme-amber:hover {
          --rg-color-1: #1f1000;
          --rg-color-2: #fef3c7;
          --rg-color-3: #f59e0b;
          --rg-color-4: #b45309;
          --rg-border-color-1: rgba(254, 243, 199, 0.7);
          --rg-border-color-2: rgba(245, 158, 11, 0.4);
        }

        /* Purple Theme */
        .rg-theme-purple {
          --rg-color-1: #1c002b;
          --rg-color-2: #581c87;
          --rg-color-3: #9333ea;
          --rg-color-4: #e9d5ff;
          --rg-color-5: #0d0014;
          --rg-border-color-1: rgba(168, 85, 247, 0.7);
          --rg-border-color-2: rgba(168, 85, 247, 0.25);
        }
        .rg-theme-purple:hover {
          --rg-color-1: #140020;
          --rg-color-2: #f3e8ff;
          --rg-color-3: #a855f7;
          --rg-color-4: #6b21a8;
          --rg-border-color-1: rgba(243, 232, 255, 0.7);
          --rg-border-color-2: rgba(168, 85, 247, 0.4);
        }

        .rg-label {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
        }

        .rg-bg {
          position: absolute;
          inset: var(--cut);
          background: var(--bg);
          border-radius: inherit;
          transition: background var(--transition), opacity var(--transition);
        }

        .rg-shine {
          position: absolute;
          inset: 0;
          container-type: size;
          border-radius: inherit;
          mix-blend-mode: soft-light;
          opacity: var(--button-line-opacity, 0);
          transition: opacity 0.3s;
          overflow: visible;
        }

        .rg-shine span {
          position: absolute;
          inset: 0;
          height: 100cqh;
          aspect-ratio: 1;
          animation: rg-slide var(--speed) ease-in-out infinite alternate;
          overflow: visible;
        }

        .rg-shine span::before {
          content: "";
          position: absolute;
          inset: -100%;
          background: conic-gradient(
            from calc(270deg - (90deg * 0.5)),
            transparent 0,
            #fff 90deg,
            transparent 90deg
          );
          animation: rg-spin calc(var(--speed) * 2) infinite linear;
        }

        @keyframes rg-spin {
          0% { rotate: 0deg; }
          15%, 35% { rotate: 90deg; }
          65%, 85% { rotate: 270deg; }
          100% { rotate: 360deg; }
        }

        @keyframes rg-slide {
          to { transform: translate(calc(100cqw - 100%), 0); }
        }
      `}</style>
      
      <button
        className={cn(
          "rg-button flex items-center justify-center gap-2",
          gradientTheme !== "default" && `rg-theme-${gradientTheme}`,
          className
        )}
        type="button"
        style={style}
        {...props}
      >
        <span className="rg-shine">
          <span></span>
        </span>
        <span className="rg-bg"></span>
        <span className="rg-label">{children}</span>
      </button>
    </div>
  );
}

export default RadialGlowButton;

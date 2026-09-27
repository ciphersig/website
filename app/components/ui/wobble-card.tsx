"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

export const WobbleCard = ({
  children,
  containerClassName,
  className,
}: {
  children: React.ReactNode;
  containerClassName?: string;
  className?: string;
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const { clientX, clientY } = event;
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (clientX - (rect.left + rect.width / 2)) / 15;
    const y = (clientY - (rect.top + rect.height / 2)) / 15;
    setMousePosition({ x, y });
  };

  return (
    <section
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setMousePosition({ x: 0, y: 0 });
      }}
      style={{
        transform: isHovering
          ? `translate3d(${mousePosition.x}px, ${mousePosition.y}px, 0) scale3d(1, 1, 1)`
          : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
        transition: isHovering ? "transform 0.12s ease-out" : "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
        willChange: "transform",
      }}
      className={cn(
        "mx-auto w-full relative rounded-2xl overflow-hidden will-change-transform",
        containerClassName
      )}
    >
      <div
        className="relative h-full sm:rounded-2xl overflow-hidden backdrop-blur-md"
        style={{
          boxShadow:
            "0 15px 35px -5px rgba(0, 0, 0, 0.6), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        }}
      >
        <div
          style={{
            transform: isHovering
              ? `translate3d(${-mousePosition.x * 1.2}px, ${-mousePosition.y * 1.2}px, 0) scale3d(1.02, 1.02, 1)`
              : "translate3d(0px, 0px, 0) scale3d(1, 1, 1)",
            transition: isHovering ? "transform 0.12s ease-out" : "transform 0.5s cubic-bezier(0.23, 1, 0.32, 1)",
            willChange: "transform",
          }}
          className={cn("h-full p-4 sm:p-5 relative", className)}
        >
          <Noise />
          {children}
        </div>
      </div>
    </section>
  );
};

const Noise = () => {
  return (
    <div
      className="absolute inset-0 w-full h-full scale-[1.2] transform opacity-[0.04] [mask-image:radial-gradient(#fff,transparent,80%)] pointer-events-none"
      style={{
        backgroundImage: "url(/noise.webp)",
        backgroundSize: "25%",
      }}
    />
  );
};

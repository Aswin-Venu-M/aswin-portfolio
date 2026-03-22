"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { FiX, FiDownload } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";
import { navLinks } from "@/data/navLinks";
import { lenisInstance } from "./SmoothScroll";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

export default function MobileNav({ isOpen, onClose, triggerRef }: MobileNavProps) {
  const overlayRef  = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);

  // Set initial hidden state before first paint
  useLayoutEffect(() => {
    gsap.set(overlayRef.current, { opacity: 0, scale: 0.97, pointerEvents: "none" });
  }, []);

  // Animate open/close
  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, {
        opacity: 1,
        scale: 1,
        duration: 0.35,
        ease: "power3.out",
        pointerEvents: "auto",
        onComplete: () => closeBtnRef.current?.focus(),
      });
      lenisInstance?.stop();
    } else {
      gsap.to(overlayRef.current, {
        opacity: 0,
        scale: 0.97,
        duration: 0.25,
        ease: "power3.in",
        pointerEvents: "none",
        onComplete: () => triggerRef.current?.focus(),
      });
      lenisInstance?.start();
    }
  }, [isOpen, triggerRef]);

  // Safety net: restore scroll on unmount
  useEffect(() => {
    return () => { lenisInstance?.start(); };
  }, []);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  return (
    <div
      ref={overlayRef}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
      className="md:hidden fixed inset-0 z-200 dot-grid brutal-border flex flex-col"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Close button */}
      <div className="flex justify-end px-6 py-5">
        <button
          ref={closeBtnRef}
          onClick={onClose}
          aria-label="Close navigation menu"
          className="p-2 brutal-border brutal-shadow brutal-hover cursor-pointer"
        >
          <FiX size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Nav links — centered, large */}
      <nav className="flex-1 flex flex-col items-center justify-center gap-0 px-6">
        {navLinks.map((link, i) => (
          <a
            key={link.label}
            href={link.href}
            onClick={onClose}
            className={`w-full text-center section-heading text-5xl py-5 text-black hover:text-accent2 transition-colors${
              i < navLinks.length - 1 ? " border-b border-black/10" : ""
            }`}
          >
            {link.label}
          </a>
        ))}
      </nav>

      {/* Bottom controls */}
      <div className="flex flex-row items-center justify-center gap-3 px-6 pb-8 pt-4 border-t border-black/10">
        <ThemeToggle />
        <a
          href="/resume.pdf"
          download="Aswin_Venu_M_Resume.pdf"
          onClick={onClose}
          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-accent brutal-border brutal-shadow brutal-hover font-mono text-xs font-bold uppercase tracking-widest text-[#0A0A0A]"
        >
          <FiDownload size={14} strokeWidth={2.5} aria-hidden="true" />
          Resume
        </a>
      </div>
    </div>
  );
}

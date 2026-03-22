"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    const dot = dotRef.current;
    if (!cursor || !dot) return;

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.5, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.5, ease: "power3.out" });
    const dotXTo = gsap.quickTo(dot, "x", { duration: 0.1, ease: "none" });
    const dotYTo = gsap.quickTo(dot, "y", { duration: 0.1, ease: "none" });

    const onMove = (e: MouseEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      dotXTo(e.clientX);
      dotYTo(e.clientY);
    };

    const onEnterClickable = (e: Event) => {
      const el = e.currentTarget as HTMLElement;
      const label = el.getAttribute("data-cursor-label");
      gsap.to(cursor, {
        scale: 2.5,
        backgroundColor: "#0A0A0A",
        duration: 0.3,
        ease: "back.out(1.4)",
      });
      if (label && labelRef.current) {
        labelRef.current.textContent = label;
        gsap.to(labelRef.current, { opacity: 1, duration: 0.2 });
      }
    };

    const onLeaveClickable = () => {
      gsap.to(cursor, {
        scale: 1,
        backgroundColor: "#0A0A0A",
        duration: 0.3,
        ease: "back.out(1.4)",
      });
      if (labelRef.current) {
        gsap.to(labelRef.current, { opacity: 0, duration: 0.15 });
      }
    };

    const onEnterCard = () => {
      gsap.to(cursor, {
        scale: 1.8,
        backgroundColor: "#FFD93D",
        duration: 0.3,
      });
    };

    const onLeaveCard = () => {
      gsap.to(cursor, {
        scale: 1,
        backgroundColor: "#0A0A0A",
        duration: 0.3,
      });
    };

    window.addEventListener("mousemove", onMove);

    const addListeners = () => {
      document.querySelectorAll("a, button, [data-cursor]").forEach((el) => {
        el.addEventListener("mouseenter", onEnterClickable);
        el.addEventListener("mouseleave", onLeaveClickable);
      });

      document.querySelectorAll("[data-cursor-card]").forEach((el) => {
        el.addEventListener("mouseenter", onEnterCard);
        el.addEventListener("mouseleave", onLeaveCard);
      });
    };

    // slight delay for DOM to populate
    const timeout = setTimeout(addListeners, 500);

    return () => {
      window.removeEventListener("mousemove", onMove);
      clearTimeout(timeout);
    };
  }, []);

  return (
    <>
      {/* Outer ring */}
      <div
        ref={cursorRef}
        className="fixed top-0 left-0 w-8 h-8 rounded-full border-2 border-black pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 mix-blend-difference hidden md:flex items-center justify-center"
        style={{ backgroundColor: "transparent" }}
      >
        <span
          ref={labelRef}
          className="text-[8px] font-mono text-white opacity-0 pointer-events-none select-none"
          style={{ whiteSpace: "nowrap" }}
        />
      </div>

      {/* Inner dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-black pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 hidden md:block"
      />
    </>
  );
}

// nextapp/src/components/LoadingScreen.tsx
"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import gsap from "gsap";

interface LoadingScreenProps {
  onComplete: () => void;
}

// Shape data — matches spec §4
const SHAPES = [
  { size: 44, color: "#FFD93D", style: { top: 40,  left: 48  }, initialRotation: 12,  delay: 0,   circle: false },
  { size: 26, color: "#FF6B6B", style: { bottom: 60, left: 60 }, initialRotation: 0,   delay: 0.8, circle: true  },
  { size: 34, color: "#6BCB77", style: { top: 50,  right: 56 }, initialRotation: 45,  delay: 0.4, circle: false },
  { size: 18, color: "#fff",    style: { bottom: 70, right: 70 }, initialRotation: 0,  delay: 1.2, circle: false, noShadow: true },
  { size: 14, color: "#FFD93D", style: { top: "38%", left: 30 }, initialRotation: 0,  delay: 1.8, circle: false },
  { size: 20, color: "#FF6B6B", style: { top: 30,  right: 160 }, initialRotation: 0,  delay: 2.2, circle: true  },
  { size: 28, color: "#6BCB77", style: { bottom: 50, right: 180 }, initialRotation: 20, delay: 0.6, circle: false },
  { size: 12, color: "#fff",    style: { top: 60,  left: 160 }, initialRotation: 0,   delay: 1.5, circle: true,  noShadow: true },
] as const;

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  // ── DOM refs ──
  const overlayRef  = useRef<HTMLDivElement>(null);
  const contentRef  = useRef<HTMLDivElement>(null);
  const pillsRef    = useRef<HTMLDivElement>(null);
  const lettersRef  = useRef<HTMLDivElement>(null);
  const barRef      = useRef<HTMLDivElement>(null);
  const hintRef     = useRef<HTMLParagraphElement>(null);
  const pctTagRef   = useRef<HTMLSpanElement>(null);
  const shapesRef   = useRef<HTMLDivElement[]>([]);

  // ── Animation refs ──
  const barTweenRef   = useRef<gsap.core.Tween | null>(null);
  const exitTweensRef = useRef<gsap.core.Tween[]>([]);
  const tickerCbRef   = useRef<(() => void) | null>(null);

  // ── Entrance animations ──
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Pills fade in
      gsap.from(pillsRef.current, {
        opacity: 0,
        duration: 0.4,
        delay: 0.2,
        ease: "power2.out",
      });

      // Letters slide up staggered
      if (lettersRef.current) {
        gsap.from(Array.from(lettersRef.current.children), {
          y: 28,
          opacity: 0,
          duration: 0.5,
          stagger: 0.08,
          delay: 0.5,
          ease: "back.out(1.7)",
        });
      }

      // Floating shapes
      shapesRef.current.forEach((el, i) => {
        gsap.to(el, {
          y: -12,
          rotation: "+=18",
          duration: 4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay: SHAPES[i].delay,
        });
      });

      // Progress bar — stored in ref for % counter
      barTweenRef.current = gsap.to(barRef.current, {
        width: "100%",
        duration: 4,
        ease: "power1.out",
      });

      // Hint text
      gsap.to(hintRef.current, {
        opacity: 1,
        duration: 0.5,
        delay: 2.2,
        ease: "power2.out",
      });
    });

    // % counter ticker
    const updatePct = () => {
      if (barTweenRef.current && pctTagRef.current) {
        const pct = Math.min(100, Math.floor(barTweenRef.current.progress() * 100));
        pctTagRef.current.textContent = pct + "%";
      }
    };
    tickerCbRef.current = updatePct;
    gsap.ticker.add(updatePct);

    return () => {
      ctx.revert();
      barTweenRef.current = null;
      if (tickerCbRef.current) gsap.ticker.remove(tickerCbRef.current);
    };
  }, []);

  // ── Exit trigger + scroll lock ──
  useEffect(() => {
    // prefers-reduced-motion fast path
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const t = setTimeout(() => onComplete(), 500);
      return () => clearTimeout(t);
    }

    // Body scroll lock
    document.body.style.overflow = "hidden";

    // Window load promise (handles already-loaded case)
    const windowLoadPromise = new Promise<void>((resolve) => {
      if (document.readyState === "complete") {
        resolve();
      } else {
        window.addEventListener("load", () => resolve(), { once: true });
      }
    });

    // Minimum display time
    const minimumTimePromise = new Promise<void>((resolve) =>
      setTimeout(resolve, 2000)
    );

    // Exit handler
    const handleDone = () => {
      document.body.style.overflow = "";
      onComplete();
    };

    let resolved = false;
    Promise.all([windowLoadPromise, minimumTimePromise]).then(() => {
      if (resolved) return;
      resolved = true;

      const t1 = gsap.to(contentRef.current, {
        opacity: 0,
        duration: 0.3,
        ease: "power2.in",
        onComplete: () => {
          const t2 = gsap.to(overlayRef.current, {
            y: "-100vh",
            duration: 0.7,
            ease: "power3.inOut",
            onComplete: handleDone,
          });
          exitTweensRef.current.push(t2);
        },
      });
      exitTweensRef.current.push(t1);
    });

    return () => {
      const wasResolved = resolved;
      resolved = true;
      document.body.style.overflow = "";
      exitTweensRef.current.forEach((t) => t.kill());
      // If exit was in progress when unmounted, ensure onComplete still fires
      // so ClientLayout's loadingDone state doesn't stay false on remount
      if (wasResolved) onComplete();
    };
  }, [onComplete]);

  return (
    <div
      ref={overlayRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor: "#0A0A0A",
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.06) 1.5px, transparent 1.5px)",
        backgroundSize: "26px 26px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {/* Corner tags */}
      <CornerTag pos="top-left">[ 00 ]</CornerTag>
      <CornerTag pos="top-right">portfolio_aswin</CornerTag>
      <CornerTag pos="bottom-left">2026</CornerTag>
      <span
        ref={pctTagRef}
        style={{
          position: "absolute", bottom: 20, right: 16,
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: "0.65rem", letterSpacing: "1px", textTransform: "uppercase",
          color: "#FFD93D",
        }}
      >
        0%
      </span>

      {/* Floating shapes */}
      {SHAPES.map((s, i) => (
        <div
          key={i}
          ref={(el) => { if (el) shapesRef.current[i] = el; }}
          style={{
            position: "absolute",
            width: s.size,
            height: s.size,
            border: `3px solid ${s.color}`,
            boxShadow: ("noShadow" in s && s.noShadow) ? "none" : `4px 4px 0 ${s.color}`,
            borderRadius: s.circle ? "50%" : 0,
            transform: `rotate(${s.initialRotation}deg)`,
            zIndex: 1,
            ...(Object.fromEntries(
              Object.entries(s.style).map(([k, v]) => [
                k,
                typeof v === "number" ? `${v}px` : v,
              ])
            ) as React.CSSProperties),
          }}
        />
      ))}

      {/* Center content */}
      <div
        ref={contentRef}
        style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 14, zIndex: 2,
        }}
      >
        {/* Pills */}
        {/* <div ref={pillsRef} style={{ display: "flex", gap: 8 }}>
          <Pill>portfolio</Pill>
          <Pill accent>v1.0</Pill>
          <Pill>2026</Pill>
        </div> */}

        {/* "Loading" + dots */}
        <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
          <div ref={lettersRef} style={{ display: "flex" }}>
            {"Loading".split("").map((ch, i) => (
              <span
                key={i}
                style={{
                  fontFamily: "var(--font-bricolage), sans-serif",
                  fontSize: "3.8rem", fontWeight: 800, color: "#fff",
                  display: "inline-block", lineHeight: 1,
                }}
              >
                {ch}
              </span>
            ))}
          </div>
          {/* Dots — animated via CSS class from globals.css */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, paddingBottom: 4 }}>
            <div className="loader-dot" />
            <div className="loader-dot" />
            <div className="loader-dot" />
          </div>
        </div>

        {/* Hint */}
        <p
          ref={hintRef}
          style={{
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: "0.58rem", letterSpacing: "3px", textTransform: "uppercase",
            color: "#333", opacity: 0,
          }}
        >
          — swipe up to reveal —
        </p>
      </div>

      {/* Progress bar */}
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          height: 7, borderTop: "2px solid #1a1a1a",
        }}
      >
        <div
          ref={barRef}
          style={{ height: "100%", background: "#FFD93D", width: "0%" }}
        />
      </div>
    </div>
  );
}

// ── Small helper components ──

function CornerTag({
  children,
  pos,
}: {
  children: React.ReactNode;
  pos: "top-left" | "top-right" | "bottom-left";
}) {
  const posStyle: React.CSSProperties =
    pos === "top-left"    ? { top: 14, left: 16 }    :
    pos === "top-right"   ? { top: 14, right: 16 }   :
                            { bottom: 14, left: 16 };
  return (
    <span
      style={{
        position: "absolute",
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: "0.55rem", letterSpacing: "1px", textTransform: "uppercase",
        color: "#333",
        ...posStyle,
      }}
    >
      {children}
    </span>
  );
}

function Pill({
  children,
  accent,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      style={{
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: "0.58rem", letterSpacing: "1px", textTransform: "uppercase",
        padding: "3px 10px",
        border: accent ? "2px solid #FFD93D" : "2px solid #2a2a2a",
        color: accent ? "#FFD93D" : "#555",
      }}
    >
      {children}
    </span>
  );
}

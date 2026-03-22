"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { FiArrowUpRight, FiArrowRight, FiMapPin } from "react-icons/fi";

const techStack = [
  "REACT", "NEXT.JS", "NODE.JS", "POSTGRESQL", "TAILWIND", "FIGMA",
  "GSAP", "PYTHON", "TYPESCRIPT", "EXPRESS", "DJANGO", "SHADCN UI",
  "REACT", "NEXT.JS", "NODE.JS", "POSTGRESQL", "TAILWIND", "FIGMA",
  "GSAP", "PYTHON", "TYPESCRIPT", "EXPRESS", "DJANGO", "SHADCN UI",
];

const MIN_SPEED = 0.35;
const MAX_SPEED = 2.0;

interface Particle {
  el:     HTMLElement;
  x:      number;   // center x in section coords
  y:      number;   // center y in section coords
  vx:     number;   // velocity x (px / frame)
  vy:     number;   // velocity y (px / frame)
  vr:     number;   // rotation velocity (deg / frame)
  rot:    number;   // current rotation (deg)
  r:      number;   // collision radius (px)
  kickIn: number;   // frames until next random direction nudge
  setX:   (v: number) => void;
  setY:   (v: number) => void;
  setR:   (v: number) => void;
}

function clampSpeed(p: Particle) {
  const s = Math.hypot(p.vx, p.vy);
  if (s > 0 && s < MIN_SPEED) { p.vx = (p.vx / s) * MIN_SPEED; p.vy = (p.vy / s) * MIN_SPEED; }
  if (s > MAX_SPEED)           { p.vx = (p.vx / s) * MAX_SPEED; p.vy = (p.vy / s) * MAX_SPEED; }
}

export default function Hero() {
  const sectionRef  = useRef<HTMLElement>(null);
  const badgeRef    = useRef<HTMLDivElement>(null);
  const nameRef     = useRef<HTMLDivElement>(null);
  const subtextRef  = useRef<HTMLDivElement>(null);
  const ctaRef      = useRef<HTMLDivElement>(null);
  const shape1Ref   = useRef<HTMLDivElement>(null);
  const shape2Ref   = useRef<HTMLDivElement>(null);
  const shape3Ref   = useRef<HTMLDivElement>(null);

  const particles  = useRef<Particle[]>([]);
  const countRef   = useRef(0);

  // ── Burst ────────────────────────────────────────────────────────────────
  const burst = (p: Particle) => {
    particles.current = particles.current.filter(item => item !== p);
    p.el.style.pointerEvents = "none";
    gsap.to(p.el, {
      scale: 2.5, opacity: 0, rotation: `+=${70}`,
      duration: 0.25, ease: "power3.out",
      onComplete: () => { p.el.remove(); countRef.current--; },
    });
  };

  // ── Spawn ─────────────────────────────────────────────────────────────────
  const spawn = (clientX: number, clientY: number) => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (countRef.current >= 20) return;

    const section = sectionRef.current;
    if (!section) return;

    const rect   = section.getBoundingClientRect();
    const shapes = ["square", "circle", "diamond"] as const;
    const colors = ["#FFD93D", "#FF6B6B", "#6BCB77"];
    const shape  = shapes[Math.floor(Math.random() * shapes.length)];
    const color  = colors[Math.floor(Math.random() * colors.length)];
    const size   = Math.floor(Math.random() * 38 + 16);   // 16 – 54 px
    const r      = size / 2;

    const initRot = Math.floor(Math.random() * 61 - 30);
    const baseRot = shape === "diamond" ? 45 + initRot : initRot;

    const margin = r + 4;
    const cx = Math.min(Math.max(clientX - rect.left, margin), section.offsetWidth  - margin);
    const cy = Math.min(Math.max(clientY - rect.top,  margin), section.offsetHeight - margin);

    const el = document.createElement("div");
    el.setAttribute("aria-hidden", "true");
    // left/top offset by -r so GSAP x/y == element center in section coords
    el.style.cssText = `
      position:absolute;
      width:${size}px; height:${size}px;
      background:${color};
      left:${-r}px; top:${-r}px;
      pointer-events:none; cursor:pointer; z-index:20;
    `;
    el.className = "brutal-border";
    if (shape === "circle") el.style.borderRadius = "50%";

    section.appendChild(el);
    countRef.current++;

    gsap.set(el, { x: cx, y: cy, rotation: baseRot, scale: 0 });
    gsap.to(el, {
      scale: 1, duration: 0.45, ease: "back.out(1.7)",
      onComplete: () => {
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.7 + Math.random() * 0.9;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const setX = gsap.quickSetter(el, "x", "px") as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const setY = gsap.quickSetter(el, "y", "px") as any;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const setR = gsap.quickSetter(el, "rotation", "deg") as any;

        const p: Particle = {
          el, x: cx, y: cy,
          vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          vr: (Math.random() - 0.5) * 0.45,
          rot: baseRot, r,
          kickIn: Math.floor(120 + Math.random() * 200),
          setX, setY, setR,
        };

        el.style.pointerEvents = "auto";
        el.addEventListener("click", (ev) => { ev.stopPropagation(); burst(p); });
        particles.current.push(p);
      },
    });
  };

  // ── Physics tick ──────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    // Entrance animations
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });
      tl.from(badgeRef.current,  { scale: 0.8, opacity: 0, duration: 0.5 }, 0.3);
      const words = nameRef.current?.querySelectorAll(".hero-word");
      tl.from(words || [], { y: 120, opacity: 0, stagger: 0.08, duration: 0.9 }, 0.45);
      tl.from(subtextRef.current, { opacity: 0, y: 20, duration: 0.6 }, 0.9);
      const btns = ctaRef.current?.querySelectorAll("a");
      tl.from(btns || [], { scale: 0.8, opacity: 0, stagger: 0.1, duration: 0.5, ease: "back.out(1.4)" }, 1.1);

      gsap.to(shape1Ref.current, { y: -18, rotation: 8,  duration: 4,   ease: "sine.inOut", repeat: -1, yoyo: true });
      gsap.to(shape2Ref.current, { y: -14, rotation: -6, duration: 5.5, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 1 });
      gsap.to(shape3Ref.current, { y: -22, rotation: 12, duration: 3.5, ease: "sine.inOut", repeat: -1, yoyo: true, delay: 0.5 });
    }, sectionRef);

    // Per-frame physics
    const tick = () => {
      const section = sectionRef.current;
      if (!section) return;
      const sw = section.offsetWidth;
      const sh = section.offsetHeight;
      const pts = particles.current;

      // ── integrate & wall bounce ──
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;

        if (p.x < p.r)        { p.x = p.r;        p.vx =  Math.abs(p.vx); }
        if (p.x > sw - p.r)   { p.x = sw - p.r;   p.vx = -Math.abs(p.vx); }
        if (p.y < p.r)        { p.y = p.r;         p.vy =  Math.abs(p.vy); }
        if (p.y > sh - p.r)   { p.y = sh - p.r;   p.vy = -Math.abs(p.vy); }

        // occasional gentle nudge so particles don't stall
        if (--p.kickIn <= 0) {
          p.vx += (Math.random() - 0.5) * 0.5;
          p.vy += (Math.random() - 0.5) * 0.5;
          clampSpeed(p);
          p.kickIn = Math.floor(150 + Math.random() * 210);
        }

        p.setX(p.x); p.setY(p.y); p.setR(p.rot);
      }

      // ── particle–particle elastic collision (O(n²), fine for n ≤ 20) ──
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = b.x - a.x, dy = b.y - a.y;
          const dist = Math.hypot(dx, dy);
          const minD = a.r + b.r;

          if (dist < minD && dist > 0) {
            const nx = dx / dist, ny = dy / dist;

            // push apart so they no longer overlap
            const half = (minD - dist) / 2;
            a.x -= half * nx; a.y -= half * ny;
            b.x += half * nx; b.y += half * ny;

            // elastic velocity exchange along collision normal
            const rv = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
            if (rv > 0) {                // approaching → exchange
              a.vx -= rv * nx; a.vy -= rv * ny;
              b.vx += rv * nx; b.vy += rv * ny;
              clampSpeed(a); clampSpeed(b);
            }
          }
        }
      }
    };

    gsap.ticker.add(tick);

    return () => {
      ctx.revert();
      gsap.ticker.remove(tick);
      particles.current.forEach(p => { gsap.killTweensOf(p.el); p.el.remove(); });
      particles.current = [];
      countRef.current  = 0;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen dot-grid flex flex-col justify-center overflow-hidden pt-16 cursor-crosshair"
      onClick={(e) => spawn(e.clientX, e.clientY)}
    >
      {/* Background decorative shapes — float, not interactive */}
      <div ref={shape1Ref} className="absolute top-20 right-16 w-20 h-20 brutal-border bg-accent hidden md:block" aria-hidden="true" />
      <div ref={shape2Ref} className="absolute top-40 right-48 w-12 h-12 rounded-full brutal-border bg-accent3 hidden md:block" aria-hidden="true" />
      <div ref={shape3Ref} className="absolute bottom-48 right-32 w-16 h-16 brutal-border bg-accent2 rotate-12 hidden md:block" aria-hidden="true" />
      <div className="absolute top-1/3 left-10 w-8 h-8 brutal-border border-dashed hidden lg:block" aria-hidden="true" />
      <div className="absolute bottom-1/3 left-24 w-14 h-14 rounded-full brutal-border border-dashed hidden lg:block" aria-hidden="true" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 w-full py-12 cursor-auto">
        <div ref={badgeRef} className="mb-6 inline-block">
          <span className="mono-tag inline-block px-4 py-2 bg-accent brutal-border brutal-shadow font-bold text-[#0A0A0A]">
            [ JR. SOFTWARE ENGINEER ]
          </span>
        </div>

        <div ref={nameRef} className="overflow-hidden mb-6" aria-label="Aswin Venu M">
          <div className="flex flex-wrap gap-x-6">
            <span className="hero-word section-heading block" style={{ fontSize: "clamp(4rem, 11vw, 10rem)" }}>
              ASWIN
            </span>
          </div>
          <div className="flex flex-wrap gap-x-6 items-center">
            <span className="hero-word section-heading block" style={{ fontSize: "clamp(4rem, 11vw, 10rem)" }}>
              VENU
            </span>
            <span className="hero-word section-heading block text-accent2" style={{ fontSize: "clamp(4rem, 11vw, 10rem)" }}>
              M.
            </span>
          </div>
        </div>

        <div ref={subtextRef} className="mb-10 max-w-xl">
          <p className="text-lg md:text-xl font-body text-black/80 font-medium leading-relaxed">
            Building full-stack systems that actually work.
          </p>
          <p className="text-base font-mono text-black/50 mt-1 tracking-wide flex items-center gap-1.5">
            <FiMapPin size={13} />
            Based in Trivandrum, India.
          </p>
        </div>

        <div ref={ctaRef} className="flex flex-wrap gap-4">
          <a
            href="#projects"
            data-cursor-label="VIEW"
            className="group inline-flex items-center gap-2 px-7 py-4 bg-accent brutal-border brutal-shadow brutal-hover font-mono text-sm font-bold uppercase tracking-wider text-[#0A0A0A]"
          >
            View My Work
            <FiArrowUpRight size={16} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
          <a
            href="#contact"
            data-cursor-label="TALK"
            className="group inline-flex items-center gap-2 px-7 py-4 bg-transparent brutal-border brutal-shadow brutal-hover font-mono text-sm font-bold uppercase tracking-wider"
          >
            Let&apos;s Talk
            <FiArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Marquee Strip */}
      <div className="relative z-10 mt-auto border-y-4 border-black bg-black overflow-hidden py-3">
        <div className="flex animate-marquee whitespace-nowrap">
          {techStack.map((tech, i) => (
            <span key={i} className="inline-flex items-center gap-6 px-6 font-mono text-sm font-bold tracking-widest text-accent dark:text-[#0A0A0A] uppercase">
              {tech}
              <span className="text-accent2 dark:text-[#0A0A0A]/60">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

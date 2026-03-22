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

export default function Hero() {
  const sectionRef = useRef<HTMLElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);
  const subtextRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const shape1Ref = useRef<HTMLDivElement>(null);
  const shape2Ref = useRef<HTMLDivElement>(null);
  const shape3Ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Badge
      tl.from(badgeRef.current, {
        scale: 0.8,
        opacity: 0,
        duration: 0.5,
      }, 0.3);

      // Name words stagger
      const words = nameRef.current?.querySelectorAll(".hero-word");
      tl.from(words || [], {
        y: 120,
        opacity: 0,
        stagger: 0.08,
        duration: 0.9,
      }, 0.45);

      // Subtext
      tl.from(subtextRef.current, {
        opacity: 0,
        y: 20,
        duration: 0.6,
      }, 0.9);

      // CTA buttons
      const buttons = ctaRef.current?.querySelectorAll("a");
      tl.from(buttons || [], {
        scale: 0.8,
        opacity: 0,
        stagger: 0.1,
        duration: 0.5,
        ease: "back.out(1.4)",
      }, 1.1);

      // Floating shapes loop
      gsap.to(shape1Ref.current, {
        y: -18,
        rotation: 8,
        duration: 4,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
      });
      gsap.to(shape2Ref.current, {
        y: -14,
        rotation: -6,
        duration: 5.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 1,
      });
      gsap.to(shape3Ref.current, {
        y: -22,
        rotation: 12,
        duration: 3.5,
        ease: "sine.inOut",
        repeat: -1,
        yoyo: true,
        delay: 0.5,
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen dot-grid flex flex-col justify-center overflow-hidden pt-16"
    >
      {/* Floating geometric shapes */}
      <div
        ref={shape1Ref}
        className="absolute top-20 right-16 w-20 h-20 brutal-border bg-accent hidden md:block"
        aria-hidden="true"
      />
      <div
        ref={shape2Ref}
        className="absolute top-40 right-48 w-12 h-12 rounded-full brutal-border bg-accent3 hidden md:block"
        aria-hidden="true"
      />
      <div
        ref={shape3Ref}
        className="absolute bottom-48 right-32 w-16 h-16 brutal-border bg-accent2 rotate-12 hidden md:block"
        aria-hidden="true"
      />
      <div
        className="absolute top-1/3 left-10 w-8 h-8 brutal-border border-dashed hidden lg:block"
        aria-hidden="true"
      />
      <div
        className="absolute bottom-1/3 left-24 w-14 h-14 rounded-full brutal-border border-dashed hidden lg:block"
        aria-hidden="true"
      />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full py-12">
        {/* Badge */}
        <div ref={badgeRef} className="mb-6 inline-block">
          <span className="mono-tag inline-block px-4 py-2 bg-accent brutal-border brutal-shadow font-bold text-[#0A0A0A]">
            [ JR. SOFTWARE ENGINEER ]
          </span>
        </div>

        {/* Stacked Name */}
        <div
          ref={nameRef}
          className="overflow-hidden mb-6"
          aria-label="Aswin Venu M"
        >
          <div className="flex flex-wrap gap-x-6">
            <span
              className="hero-word section-heading block"
              style={{ fontSize: "clamp(4rem, 11vw, 10rem)" }}
            >
              ASWIN
            </span>
          </div>
          <div className="flex flex-wrap gap-x-6 items-center">
            <span
              className="hero-word section-heading block"
              style={{ fontSize: "clamp(4rem, 11vw, 10rem)" }}
            >
              VENU
            </span>
            <span
              className="hero-word section-heading block text-accent2"
              style={{ fontSize: "clamp(4rem, 11vw, 10rem)" }}
            >
              M.
            </span>
          </div>
        </div>

        {/* Subtext */}
        <div ref={subtextRef} className="mb-10 max-w-xl">
          <p className="text-lg md:text-xl font-body text-black/80 font-medium leading-relaxed">
            Building full-stack systems that actually work.
          </p>
          <p className="text-base font-mono text-black/50 mt-1 tracking-wide flex items-center gap-1.5">
            <FiMapPin size={13} />
            Based in Trivandrum, India.
          </p>
        </div>

        {/* CTA Buttons */}
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
      <div className="mt-auto border-y-4 border-black bg-black overflow-hidden py-3">
        <div className="flex animate-marquee whitespace-nowrap">
          {techStack.map((tech, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-6 px-6 font-mono text-sm font-bold tracking-widest text-accent dark:text-[#0A0A0A] uppercase"
            >
              {tech}
              <span className="text-accent2 dark:text-[#0A0A0A]/60">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

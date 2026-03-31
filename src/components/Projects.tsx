"use client";

import { useLayoutEffect, useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";

gsap.registerPlugin(ScrollTrigger);

const GAP = 24; // matches gap-6 (1.5rem at 16px base = 24px)

function computeCardWidth(containerWidth: number): number {
  if (containerWidth >= 1024) return (containerWidth - 2 * GAP) / 3;
  if (containerWidth >= 768) return (containerWidth - GAP) / 2;
  return containerWidth;
}

export default function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(0);
  const activeIndexRef = useRef(0);
  const isAnimating = useRef(false);
  const slideTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ariaLiveRef = useRef<HTMLSpanElement>(null);
  const isPaused = useRef(false);
  const isHovered = useRef(false);
  const resumeTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const navigateRef = useRef<(index: number) => void>(() => {});

  // Sync activeIndexRef synchronously before paint — ResizeObserver reads this ref
  useLayoutEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // After cardWidth state update, card wrappers repaint with new pixel sizes.
  // Re-applies track x with updated offsetLeft values, then refreshes all
  // ScrollTrigger positions — the section height changed when cards went from
  // 0px to their actual width, which shifts every trigger below this section.
  useLayoutEffect(() => {
    if (!trackRef.current || cardWidth === 0) return;
    gsap.set(trackRef.current, {
      x: -(cardWrapperRefs.current[activeIndexRef.current]?.offsetLeft ?? 0),
    });
    ScrollTrigger.refresh();
  }, [cardWidth]);

  function navigate(targetIndex: number) {
    if (isAnimating.current || targetIndex === activeIndex) return;
    if (targetIndex < 0 || targetIndex >= projects.length) return;

    isAnimating.current = true;

    // window.matchMedia called here only — never at render time (SSR safe)
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const targetX = -(cardWrapperRefs.current[targetIndex]?.offsetLeft ?? 0);

    if (prefersReducedMotion) {
      gsap.set(trackRef.current, { x: targetX });
      activeIndexRef.current = targetIndex;
      setActiveIndex(targetIndex);
      if (ariaLiveRef.current) {
        ariaLiveRef.current.textContent = `Project ${targetIndex + 1} of ${projects.length}: ${projects[targetIndex].title}`;
      }
      isAnimating.current = false;
      return;
    }

    slideTimelineRef.current?.kill();
    slideTimelineRef.current = gsap.timeline({
      onComplete: () => {
        activeIndexRef.current = targetIndex;
        setActiveIndex(targetIndex);
        if (ariaLiveRef.current) {
          ariaLiveRef.current.textContent = `Project ${targetIndex + 1} of ${projects.length}: ${projects[targetIndex].title}`;
        }
        isAnimating.current = false;
      },
    });
    slideTimelineRef.current.to(trackRef.current, {
      x: targetX,
      duration: 0.45,
      ease: "power3.inOut",
    });
  }

  // Keep navigateRef current so the setInterval closure always calls the latest navigate
  navigateRef.current = navigate;

  function pauseAutoplay() {
    isPaused.current = true;
    clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = undefined;
  }

  function scheduleResume() {
    clearTimeout(resumeTimerRef.current);
    resumeTimerRef.current = setTimeout(() => {
      if (!isHovered.current) {
        isPaused.current = false;
      }
    }, 2000);
  }

  function handleManualNavigate(index: number) {
    pauseAutoplay();
    navigate(index);
    scheduleResume();
  }

  // Scroll-in GSAP + ResizeObserver — useLayoutEffect runs client-side only (SSR safe)
  useLayoutEffect(() => {
    // Measure initial card width
    if (containerRef.current) {
      setCardWidth(computeCardWidth(containerRef.current.clientWidth));
    }

    const ctx = gsap.context(() => {
      gsap.from("[data-projects-heading]", {
        x: -80,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-projects-heading]",
          start: "top 85%",
        },
      });
      gsap.from("[data-projects-container]", {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: "[data-projects-container]",
          start: "top 85%",
        },
      });
    }, sectionRef);

    // ResizeObserver: update card width + snap track x on container resize
    const observer = new ResizeObserver(() => {
      if (!containerRef.current || !trackRef.current) return;
      const newWidth = computeCardWidth(containerRef.current.clientWidth);
      setCardWidth(newWidth);
      // This gsap.set uses pre-rerender offsetLeft values — the useLayoutEffect([cardWidth])
      // above will correct it after the rerender with new pixel sizes.
      const idx = activeIndexRef.current;
      gsap.set(trackRef.current, {
        x: -(cardWrapperRefs.current[idx]?.offsetLeft ?? 0),
      });
    });
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      isAnimating.current = false;
      slideTimelineRef.current?.kill(); // kill before ctx.revert() — created outside context
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!containerRef.current?.contains(document.activeElement)) return;
    if (e.key === "ArrowRight") handleManualNavigate(activeIndex + 1);
    if (e.key === "ArrowLeft") handleManualNavigate(activeIndex - 1);
  };

  return (
    <section ref={sectionRef} id="projects" className="py-24 lg:py-32 dot-grid">
      {/* Visually-hidden aria-live region — outside carousel container */}
      <span
        ref={ariaLiveRef}
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
      />

      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section label */}
        <div className="mb-4">
          <span className="mono-tag px-3 py-1 section-label">03 / PROJECTS</span>
        </div>

        {/* Heading */}
        <h2
          data-projects-heading=""
          className="section-heading text-5xl md:text-7xl mb-12 relative inline-block"
        >
          PROJECTS
          <span className="absolute -bottom-1 left-0 h-3 bg-accent -z-10 w-full" />
        </h2>

        {/* Carousel container — overflow-hidden clips the track */}
        <div
          ref={containerRef}
          data-projects-container=""
          className="overflow-hidden w-full"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label="Projects carousel"
        >
          {/* Track — position:relative so offsetLeft on children is relative to track */}
          <div
            ref={trackRef}
            className="flex gap-6 will-change-transform relative"
          >
            {projects.map((project, i) => (
              <div
                key={project.id}
                ref={(el) => {
                  cardWrapperRefs.current[i] = el;
                }}
                className="flex-shrink-0"
                style={{ flex: `0 0 ${cardWidth}px`, width: `${cardWidth}px` }}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        </div>

        {/* Navigation bar */}
        <div className="flex items-center gap-4 mt-6">
          {/* Prev */}
          <button
            aria-label="Previous project"
            onClick={() => handleManualNavigate(activeIndex - 1)}
            disabled={activeIndex === 0}
            className={`brutal-border w-10 h-10 flex items-center justify-center font-mono font-black text-sm bg-surface transition-opacity ${
              activeIndex === 0
                ? "opacity-40 pointer-events-none"
                : "hover:bg-black hover:text-accent"
            }`}
          >
            ←
          </button>

          {/* Next */}
          <button
            aria-label="Next project"
            onClick={() => handleManualNavigate(activeIndex + 1)}
            disabled={activeIndex === projects.length - 1}
            className={`brutal-border w-10 h-10 flex items-center justify-center font-mono font-black text-sm bg-black text-accent transition-opacity ${
              activeIndex === projects.length - 1 ? "opacity-40 pointer-events-none" : ""
            }`}
          >
            →
          </button>

          {/* Counter */}
          <span className="font-mono text-sm font-bold opacity-50">
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(projects.length).padStart(2, "0")}
          </span>

          {/* Dot indicators */}
          <div className="flex gap-2 ml-auto">
            {projects.map((project, i) => (
              <button
                key={project.id}
                onClick={() => handleManualNavigate(i)}
                aria-label={`Go to project ${i + 1}: ${project.title}`}
                aria-current={i === activeIndex ? "true" : undefined}
                className={`w-3 h-3 brutal-border transition-opacity ${
                  i === activeIndex ? "opacity-100" : "opacity-30"
                }`}
                style={{ backgroundColor: project.accentColor ?? "#FFD93D" }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

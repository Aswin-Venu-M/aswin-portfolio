"use client";

import { useLayoutEffect, useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const isAnimating = useRef(false);
  const slideTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cardWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ariaLiveRef = useRef<HTMLSpanElement>(null);

  // Keep activeIndexRef in sync for ResizeObserver (avoids stale closure)
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // Navigate to a project index
  const navigate = useCallback(
    (targetIndex: number) => {
      if (isAnimating.current) return;
      if (targetIndex === activeIndex) return;
      if (targetIndex < 0 || targetIndex >= projects.length) return;

      isAnimating.current = true;

      // Measure offsetLeft before any state change.
      // offsetLeft is relative to the track element and unaffected by CSS transforms.
      const targetX = -(cardWrapperRefs.current[targetIndex]?.offsetLeft ?? 0);

      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

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
    },
    [activeIndex]
  );

  // Scroll-in animations + ResizeObserver
  useLayoutEffect(() => {
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

    // ResizeObserver: re-apply track x on viewport resize
    const observer = new ResizeObserver(() => {
      const idx = activeIndexRef.current;
      gsap.set(trackRef.current, {
        x: -(cardWrapperRefs.current[idx]?.offsetLeft ?? 0),
      });
    });
    if (containerRef.current) observer.observe(containerRef.current);

    return () => {
      slideTimelineRef.current?.kill();
      observer.disconnect();
      ctx.revert();
    };
  }, []);

  // Keyboard navigation (only when container itself has focus)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (document.activeElement !== containerRef.current) return;
    if (e.key === "ArrowRight") navigate(activeIndex + 1);
    if (e.key === "ArrowLeft") navigate(activeIndex - 1);
  };

  return (
    <section ref={sectionRef} id="projects" className="py-24 lg:py-32 dot-grid">
      {/* Visually-hidden aria-live region (outside carousel container) */}
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

        {/* Carousel */}
        <div
          ref={containerRef}
          data-projects-container=""
          className="overflow-hidden w-full"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          aria-label="Projects carousel"
        >
          {/* Track — all cards pre-rendered */}
          <div
            ref={trackRef}
            className="flex gap-6 will-change-transform"
            style={{ width: "max-content" }}
          >
            {projects.map((project, i) => {
              // Cards to the left of active are off-screen via track x translation
              const effectiveVariant =
                i === activeIndex ? "active" : i === activeIndex + 1 ? "peek-1" : "peek-2";

              const wrapperClasses = [
                "shrink-0",
                effectiveVariant === "peek-2"
                  ? "hidden lg:block"
                  : effectiveVariant === "peek-1"
                  ? "hidden md:block"
                  : "",
              ]
                .filter(Boolean)
                .join(" ");

              // Width classes: lg shows all, md hides peek-2, sm shows active only
              const widthClass =
                effectiveVariant === "active"
                  ? "w-full md:w-[60%] lg:w-[58%]"
                  : effectiveVariant === "peek-1"
                  ? "md:w-[35%] lg:w-[25%]"
                  : "lg:w-[12%]";

              return (
                <div
                  key={project.id}
                  ref={(el) => { cardWrapperRefs.current[i] = el; }}
                  className={`${wrapperClasses} ${widthClass} shrink-0`}
                >
                  <ProjectCard
                    project={project}
                    variant={effectiveVariant}
                    onClick={effectiveVariant !== "active" ? () => navigate(i) : undefined}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Navigation bar */}
        <div className="flex items-center gap-4 mt-6">
          {/* Prev button */}
          <button
            aria-label="Previous project"
            onClick={() => navigate(activeIndex - 1)}
            disabled={activeIndex === 0}
            className={`brutal-border w-10 h-10 flex items-center justify-center font-mono font-black text-sm bg-surface transition-opacity ${
              activeIndex === 0 ? "opacity-40 pointer-events-none" : "hover:bg-black hover:text-accent"
            }`}
          >
            ←
          </button>

          {/* Next button */}
          <button
            aria-label="Next project"
            onClick={() => navigate(activeIndex + 1)}
            disabled={activeIndex === projects.length - 1}
            className={`brutal-border w-10 h-10 flex items-center justify-center font-mono font-black text-sm bg-black text-accent transition-opacity ${
              activeIndex === projects.length - 1 ? "opacity-40 pointer-events-none" : ""
            }`}
          >
            →
          </button>

          {/* Counter */}
          <span className="font-mono text-sm font-bold opacity-50">
            {String(activeIndex + 1).padStart(2, "0")} / {String(projects.length).padStart(2, "0")}
          </span>

          {/* Dot indicators */}
          <div className="flex gap-2 ml-auto">
            {projects.map((project, i) => (
              <button
                key={project.id}
                onClick={() => navigate(i)}
                aria-label={`Go to project ${i + 1}: ${project.title}`}
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

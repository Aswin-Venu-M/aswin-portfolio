"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { projects } from "@/data/projects";
import ProjectCard from "./ProjectCard";

gsap.registerPlugin(ScrollTrigger);

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const featuredRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Heading
      gsap.from(headingRef.current, {
        x: -80,
        opacity: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: headingRef.current,
          start: "top 85%",
        },
      });

      // Featured card
      gsap.from(featuredRef.current, {
        y: 60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: featuredRef.current,
          start: "top 85%",
        },
      });

      // Grid cards stagger
      const cards = gridRef.current?.children;
      gsap.from(cards ? Array.from(cards) : [], {
        y: 60,
        opacity: 0,
        stagger: 0.15,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const [featured, ...rest] = projects;

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="py-24 lg:py-32 dot-grid"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section label */}
        <div className="mb-4">
          <span className="mono-tag px-3 py-1 section-label">
            03 / WORK
          </span>
        </div>

        {/* Heading */}
        <h2
          ref={headingRef}
          className="section-heading text-5xl md:text-7xl mb-12 relative inline-block"
        >
          SELECTED WORK
          <span
            className="absolute -bottom-1 left-0 h-3 bg-accent -z-10"
            style={{ width: "100%" }}
          />
        </h2>

        {/* Featured Card */}
        <div ref={featuredRef} className="mb-8">
          <ProjectCard project={featured} featured />
        </div>

        {/* Grid */}
        <div
          ref={gridRef}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {rest.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>
    </section>
  );
}

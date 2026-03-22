"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { FiBriefcase, FiCalendar, FiMapPin } from "react-icons/fi";
import { experiences } from "@/data/experience";

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
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

      const cards = timelineRef.current?.querySelectorAll(".timeline-card");
      cards?.forEach((card, i) => {
        gsap.from(card, {
          x: -60,
          opacity: 0,
          duration: 0.7,
          delay: i * 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="experience"
      className="py-24 lg:py-32 bg-bg"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section label */}
        <div className="mb-4">
          <span className="mono-tag px-3 py-1 bg-black text-accent">
            04 / EXPERIENCE
          </span>
        </div>

        <h2
          ref={headingRef}
          className="section-heading text-5xl md:text-7xl mb-16 relative inline-block"
        >
          WHERE I&apos;VE WORKED
          <span className="absolute -bottom-1 left-0 w-full h-3 bg-accent2 -z-10" />
        </h2>

        {/* Timeline */}
        <div ref={timelineRef} className="relative pl-8 md:pl-16">
          {/* Dashed left border */}
          <div className="absolute left-0 top-0 bottom-0 timeline-line" />

          <div className="space-y-10">
            {experiences.map((exp, index) => (
              <div key={exp.id} className="relative timeline-card">
                {/* Timeline dot */}
                <div
                  className="absolute -left-10 md:-left-[4.5rem] top-6 w-5 h-5 brutal-border bg-accent flex items-center justify-center"
                  aria-hidden="true"
                >
                  <FiBriefcase size={10} strokeWidth={2.5} />
                </div>

                {/* Card */}
                <div
                  className="brutal-border brutal-shadow bg-bg p-6 md:p-8"
                  data-cursor-card
                >
                  {/* Header */}
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="section-heading text-2xl md:text-3xl mb-1">
                        {exp.company}
                      </h3>
                      <span className="mono-tag px-3 py-1 bg-accent brutal-border text-sm inline-flex items-center gap-1.5">
                        <FiBriefcase size={11} />{exp.role}
                      </span>
                    </div>
                    <div className="text-right flex flex-col gap-1">
                      <span className="mono-tag text-black/50 flex items-center justify-end gap-1">
                        <FiCalendar size={11} />{exp.period}
                      </span>
                      <span className="mono-tag text-black/40 text-xs flex items-center justify-end gap-1">
                        <FiMapPin size={10} />{exp.location}
                      </span>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="w-full h-0.5 bg-black/10 mb-4" />

                  {/* Bullets */}
                  <ul className="space-y-2">
                    {exp.bullets.map((bullet, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm md:text-base font-body text-black/70 leading-relaxed">
                        <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                        {bullet}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Index label */}
                {index < experiences.length - 1 && (
                  <div className="h-10" aria-hidden="true" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { getSkillIcon } from "@/lib/skillIcons";
import { skillCategories, marqueeSkills } from "@/data/skills";
import Marquee from "./Marquee";

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

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

      const cards = gridRef.current?.querySelectorAll(".bento-card");
      gsap.from(cards ? Array.from(cards) : [], {
        scale: 0.9,
        opacity: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 85%",
        },
      });

      // Stagger the skill pills inside each card
      const pills = gridRef.current?.querySelectorAll(".skill-pill");
      gsap.from(pills ? Array.from(pills) : [], {
        scale: 0.8,
        opacity: 0,
        stagger: 0.03,
        duration: 0.35,
        ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: gridRef.current,
          start: "top 75%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="py-24 lg:py-32 dot-grid"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Label */}
        <div className="mb-4">
          <span className="mono-tag px-3 py-1 bg-black text-accent">
            05 / SKILLS
          </span>
        </div>

        <h2
          ref={headingRef}
          className="section-heading text-5xl md:text-7xl mb-12 relative inline-block"
        >
          TOOLS OF THE TRADE
          <span className="absolute -bottom-1 left-0 w-full h-3 bg-accent3 -z-10" />
        </h2>

        {/* Bento Grid */}
        <div
          ref={gridRef}
          className="grid md:grid-cols-2 gap-6 mb-12"
        >
          {skillCategories.map((cat) => (
            <div
              key={cat.id}
              className="bento-card brutal-border brutal-shadow bg-bg p-6 md:p-8"
              data-cursor-card
            >
              {/* Category header */}
              <div
                className="inline-block px-4 py-2 brutal-border mb-6"
                style={{ backgroundColor: cat.accentColor }}
              >
                <span className="mono-tag font-bold">{cat.label}</span>
              </div>

              {/* Skills with icons */}
              <div className="flex flex-wrap gap-3">
                {cat.skills.map((skill) => {
                  const Icon = getSkillIcon(skill.name);
                  return (
                    <div
                      key={skill.name}
                      className="skill-pill group flex items-center gap-2 px-3 py-2 border border-black/20 bg-black/5 brutal-hover cursor-default"
                    >
                      {Icon && (
                        <Icon
                          size={15}
                          className="shrink-0 opacity-70 group-hover:opacity-100 transition-opacity"
                        />
                      )}
                      <span className="mono-tag text-[0.65rem]">{skill.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Marquee Strip */}
        <div className="brutal-border brutal-shadow overflow-hidden py-4 bg-black">
          <Marquee
            items={marqueeSkills}
            speed="normal"
            accentColor="#FFD93D"
          />
        </div>
      </div>
    </section>
  );
}

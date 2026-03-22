"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useCounter } from "@/hooks/useCounter";

gsap.registerPlugin(ScrollTrigger);

const skills = [
  "React", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS", "TypeScript",
  "ShadCN UI", "Sequelize", "Git", "Figma", "Python", "Django", "Laravel",
];

const stats = [
  { value: 2, suffix: "+", label: "Years Experience" },
  { value: 6, suffix: "+", label: "Projects Shipped" },
  { value: 25, suffix: "%", label: "Avg. Defect Reduction" },
];

function StatCard({ value, suffix, label }: { value: number; suffix: string; label: string }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const count = useCounter(value, 1800, inView);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const trigger = ScrollTrigger.create({
      trigger: el,
      start: "top 85%",
      onEnter: () => setInView(true),
    });

    return () => trigger.kill();
  }, []);

  return (
    <div
      ref={ref}
      className="brutal-border brutal-shadow bg-accent p-5 flex flex-col"
      data-cursor-card
    >
      <span className="section-heading text-4xl md:text-5xl text-black dark:text-[#0A0A0A]">
        {count}{suffix}
      </span>
      <span className="mono-tag text-black/60 dark:text-[#0A0A0A]/60 mt-1">{label}</span>
    </div>
  );
}

export default function About() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const skillsRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Heading slide from left
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

      // Image slides in from left
      gsap.from(imageRef.current, {
        x: -60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: imageRef.current,
          start: "top 85%",
        },
      });

      // Text slides in from right
      gsap.from(textRef.current, {
        x: 60,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: {
          trigger: textRef.current,
          start: "top 85%",
        },
      });

      // Skills stagger
      const pills = skillsRef.current?.querySelectorAll(".skill-pill");
      gsap.from(pills || [], {
        scale: 0.8,
        opacity: 0,
        stagger: 0.05,
        duration: 0.4,
        ease: "back.out(1.4)",
        scrollTrigger: {
          trigger: skillsRef.current,
          start: "top 85%",
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="py-24 lg:py-32 bg-bg"
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Section Label */}
        <div className="mb-4">
          <span className="mono-tag px-3 py-1 section-label">
            02 / ABOUT
          </span>
        </div>

        {/* Heading */}
        <h2
          ref={headingRef}
          className="section-heading text-5xl md:text-7xl mb-12 relative inline-block"
        >
          A builder who ships.
          <span className="absolute bottom-1 left-0 w-full h-2 bg-accent -z-10" />
        </h2>

        {/* Two Column */}
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mb-12">
          {/* Photo */}
          <div ref={imageRef} className="relative">
            <div
              className="brutal-border brutal-shadow-lg relative overflow-hidden bg-black/5"
              style={{ aspectRatio: "3/4", maxHeight: "520px" }}
              data-cursor-card
            >
              <Image
                src="/av.png"
                alt="Aswin Venu M"
                fill
                className="object-cover object-top"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              {/* ABOUT badge overlapping */}
              <div className="absolute -bottom-4 -right-4 bg-accent brutal-border brutal-shadow px-5 py-2">
                <span className="mono-tag font-bold text-[#0A0A0A] text-sm">ABOUT</span>
              </div>
            </div>
          </div>

          {/* Bio + Stats */}
          <div ref={textRef} className="flex flex-col justify-center gap-8">
            <div className="space-y-4">
              <p className="text-lg font-body leading-relaxed text-black/80">
                I&apos;m a Jr. Software Engineer at{" "}
                <strong className="text-black">DocMe Cloud Solutions</strong>, Trivandrum.
              </p>
              <p className="text-lg font-body leading-relaxed text-black/80">
                I specialize in building scalable full-stack web applications — from
                multi-module school management systems to limousine booking platforms.
                I care about clean code, fast systems, and interfaces that feel right.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {stats.map((stat) => (
                <StatCard key={stat.label} {...stat} />
              ))}
            </div>
          </div>
        </div>

        {/* Skill Tags */}
        <div ref={skillsRef} className="flex flex-wrap gap-3">
          {skills.map((skill) => (
            <span
              key={skill}
              className="skill-pill mono-tag px-4 py-2 bg-accent brutal-border brutal-shadow brutal-hover cursor-default text-[#0A0A0A]"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

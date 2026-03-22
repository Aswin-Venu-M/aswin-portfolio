"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { FiArrowRight } from "react-icons/fi";
import { getSkillIcon } from "@/lib/skillIcons";
import type { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const hoverTweenRef = useRef<gsap.core.Tween | null>(null);

  const getShadowColor = () =>
    getComputedStyle(document.documentElement).getPropertyValue("--shadow").trim() || "#0A0A0A";

  const handleEnter = () => {
    hoverTweenRef.current?.kill();
    hoverTweenRef.current = gsap.to(cardRef.current, {
      boxShadow: `6px 6px 0px ${getShadowColor()}`,
      duration: 0.2,
    });
  };

  const handleLeave = () => {
    hoverTweenRef.current?.kill();
    hoverTweenRef.current = gsap.to(cardRef.current, {
      boxShadow: `4px 4px 0px ${getShadowColor()}`,
      duration: 0.2,
    });
  };

  useEffect(() => {
    return () => {
      hoverTweenRef.current?.kill();
    };
  }, []);

  const accent = project.accentColor ?? "#FFD93D";

  return (
    <div
      ref={cardRef}
      className="brutal-border brutal-shadow bg-surface p-6 relative overflow-hidden h-full flex flex-col"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      {/* Ghost number — behind all content */}
      <span aria-hidden="true" className="absolute bottom-2 right-3 z-0 font-mono text-[120px] font-black opacity-10 select-none pointer-events-none leading-none">
        {project.number}
      </span>

      {/* All content above ghost number */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Tag pill — only if project.tag is set */}
        {project.tag && (
          <span
            className="mono-tag brutal-border self-start mb-4"
            style={{ backgroundColor: accent }}
          >
            {project.tag}
          </span>
        )}

        {/* Title */}
        <h3 className="section-heading text-2xl md:text-3xl mb-4 leading-tight">
          {project.title}
        </h3>

        {/* Divider */}
        <div className="w-12 h-1 bg-black mb-4" />

        {/* Stack pills */}
        <div className="flex flex-wrap gap-2 mb-6">
          {project.stack.map((tech) => {
            const Icon = getSkillIcon(tech);
            return (
              <span
                key={tech}
                className="mono-tag inline-flex items-center gap-1.5 px-2 py-1 border border-black/25 dark:border-black/40 bg-black/5 dark:bg-black/20"
              >
                {Icon && <Icon size={11} className="shrink-0 opacity-60 dark:opacity-80" />}
                {tech}
              </span>
            );
          })}
        </div>

        {/* Bullet points */}
        <ul className="space-y-2 mb-6 flex-1">
          {project.points.map((point, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 text-sm font-body text-black/70 leading-relaxed"
            >
              <span
                className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: accent }}
              />
              {point}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <a
          href="#"
          onClick={(e) => e.preventDefault()}
          className="flex items-center gap-2 mt-auto group w-fit"
        >
          <span className="font-mono text-xs font-bold uppercase tracking-wider">
            View Project
          </span>
          <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </a>
      </div>
    </div>
  );
}

"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { FiArrowRight } from "react-icons/fi";
import { getSkillIcon } from "@/lib/skillIcons";
import type { Project } from "@/data/projects";

interface ProjectCardProps {
  project: Project;
  featured?: boolean;
}

export default function ProjectCard({ project, featured = false }: ProjectCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const getShadowColor = () =>
    getComputedStyle(document.documentElement).getPropertyValue("--shadow").trim() || "#0A0A0A";

  const handleEnter = () => {
    gsap.to(cardRef.current, {
      y: -3,
      x: 3,
      boxShadow: `2px 2px 0px ${getShadowColor()}`,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  const handleLeave = () => {
    gsap.to(cardRef.current, {
      y: 0,
      x: 0,
      boxShadow: `4px 4px 0px ${getShadowColor()}`,
      duration: 0.2,
      ease: "power2.out",
    });
  };

  return (
    <div
      ref={cardRef}
      className="brutal-border brutal-shadow bg-surface p-6 md:p-8 flex flex-col h-full cursor-pointer"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      data-cursor-card
    >
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <span className="font-mono text-4xl font-bold text-black/15 leading-none select-none">
          {project.number}
        </span>
        {project.tag && (
          <span
            className="mono-tag px-3 py-1 brutal-border"
            style={{ backgroundColor: project.accentColor ?? "#FFD93D" }}
          >
            {project.tag}
          </span>
        )}
      </div>

      {/* Title */}
      <h3
        className={`section-heading mb-4 leading-tight ${
          featured ? "text-3xl md:text-4xl" : "text-xl md:text-2xl"
        }`}
      >
        {project.title}
      </h3>

      {/* Divider */}
      <div className="w-12 h-1 bg-black mb-4" />

      {/* Stack pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {project.stack.map((tech) => {
          const Icon = getSkillIcon(tech);
          return (
            <span key={tech} className="mono-tag inline-flex items-center gap-1.5 px-2 py-1 border border-black bg-black/5">
              {Icon && <Icon size={11} className="shrink-0 opacity-60" />}
              {tech}
            </span>
          );
        })}
      </div>

      {/* Points */}
      <ul className="space-y-2 mb-6 flex-1">
        {project.points.map((point, i) => (
          <li key={i} className="flex items-start gap-2 text-sm font-body text-black/70 leading-relaxed">
            <span
              className="mt-1.5 w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: project.accentColor ?? "#FFD93D" }}
            />
            {point}
          </li>
        ))}
      </ul>

      {/* Arrow CTA */}
      <div className="flex items-center gap-2 mt-auto group">
        <span className="font-mono text-xs font-bold uppercase tracking-wider">View Project</span>
        <FiArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
}

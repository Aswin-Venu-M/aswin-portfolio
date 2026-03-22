import type { IconType } from "react-icons";

import {
  SiReact, SiNextdotjs, SiHtml5, SiCss,
  SiTailwindcss, SiBootstrap,
  SiNodedotjs, SiExpress, SiSequelize, SiDjango,
  SiLaravel, SiPostgresql, SiMysql,
  SiJavascript, SiTypescript, SiPython, SiPhp,
  SiGit, SiGithub, SiPostman, SiLinux, SiFigma,
} from "react-icons/si";
import {
  TbBrandRadixUi, TbBrandVscode, TbBrandAws,
  TbLetterC, TbBrain,
} from "react-icons/tb";
import { VscTerminal } from "react-icons/vsc";
import { BsRobot } from "react-icons/bs";
import { FiBarChart2 } from "react-icons/fi";

/** Exact-key icon map (lowercase normalised). Add new entries here as needed. */
const iconMap: Record<string, IconType> = {
  // Frontend
  react:          SiReact,
  nextjs:         SiNextdotjs,
  "next.js":      SiNextdotjs,
  html5:          SiHtml5,
  html:           SiHtml5,
  css3:           SiCss,
  css:            SiCss,
  "tailwind css": SiTailwindcss,
  tailwind:       SiTailwindcss,
  "shadcn ui":    TbBrandRadixUi,
  shadcn:         TbBrandRadixUi,
  bootstrap:      SiBootstrap,
  // Backend
  "node.js":      SiNodedotjs,
  nodejs:         SiNodedotjs,
  express:        SiExpress,
  sequelize:      SiSequelize,
  django:         SiDjango,
  laravel:        SiLaravel,
  postgresql:     SiPostgresql,
  mysql:          SiMysql,
  "amazon s3":    TbBrandAws,
  amazons3:       TbBrandAws,
  // Languages
  javascript:     SiJavascript,
  typescript:     SiTypescript,
  python:         SiPython,
  php:            SiPhp,
  c:              TbLetterC,
  // Tools
  git:            SiGit,
  github:         SiGithub,
  postman:        SiPostman,
  linux:          SiLinux,
  "vs code":      TbBrandVscode,
  vscode:         TbBrandVscode,
  figma:          SiFigma,
  cursor:         VscTerminal,
  "claude code":  BsRobot,
  "claude ai":    BsRobot,
  // AI / ML
  nlp:            TbBrain,
  "machine learning": FiBarChart2,
  ml:             TbBrain,
};

/**
 * Look up the icon for a tech name.
 * Strips version suffixes like "Next.js 15" → "Next.js" before lookup.
 */
export function getSkillIcon(name: string): IconType | null {
  // Normalise: lowercase, strip trailing version numbers e.g. "React 19" → "react"
  const normalised = name.toLowerCase().replace(/\s+\d+(\.\d+)*$/, "").trim();
  return iconMap[normalised] ?? null;
}

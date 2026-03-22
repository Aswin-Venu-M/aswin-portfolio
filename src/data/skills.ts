export interface Skill {
  name: string;
  iconKey: string; // key into the iconMap in Skills.tsx
}

export interface SkillCategory {
  id: string;
  label: string;
  skills: Skill[];
  accentColor: string;
}

export const skillCategories: SkillCategory[] = [
  {
    id: "frontend",
    label: "Frontend",
    accentColor: "#FFD93D",
    skills: [
      { name: "React",        iconKey: "react" },
      { name: "Next.js",      iconKey: "nextjs" },
      { name: "HTML5",        iconKey: "html5" },
      { name: "CSS3",         iconKey: "css3" },
      { name: "Tailwind CSS", iconKey: "tailwind" },
      { name: "ShadCN UI",    iconKey: "shadcn" },
      { name: "Bootstrap",    iconKey: "bootstrap" },
    ],
  },
  {
    id: "backend",
    label: "Backend",
    accentColor: "#FF6B6B",
    skills: [
      { name: "Node.js",    iconKey: "nodejs" },
      { name: "Express",    iconKey: "express" },
      { name: "Sequelize",  iconKey: "sequelize" },
      { name: "Django",     iconKey: "django" },
      { name: "Laravel",    iconKey: "laravel" },
      { name: "PostgreSQL", iconKey: "postgresql" },
      { name: "MySQL",      iconKey: "mysql" },
      { name: "Amazon S3",  iconKey: "amazons3" },
    ],
  },
  {
    id: "languages",
    label: "Languages",
    accentColor: "#6BCB77",
    skills: [
      { name: "JavaScript", iconKey: "javascript" },
      { name: "TypeScript", iconKey: "typescript" },
      { name: "Python",     iconKey: "python" },
      { name: "PHP",        iconKey: "php" },
      { name: "C",          iconKey: "c" },
    ],
  },
  {
    id: "tools",
    label: "Tools & Platforms",
    accentColor: "#FFD93D",
    skills: [
      { name: "Git",        iconKey: "git" },
      { name: "GitHub",     iconKey: "github" },
      { name: "Postman",    iconKey: "postman" },
      { name: "Linux",      iconKey: "linux" },
      { name: "VS Code",    iconKey: "vscode" },
      { name: "Figma",      iconKey: "figma" },
      { name: "Cursor",     iconKey: "cursor" },
      { name: "Claude AI",  iconKey: "claude" },
    ],
  },
];

export const marqueeSkills = [
  "REACT", "NEXT.JS", "NODE.JS", "POSTGRESQL", "TAILWIND", "FIGMA",
  "GSAP", "PYTHON", "TYPESCRIPT", "EXPRESS", "SEQUELIZE", "DJANGO",
  "SHADCN UI", "GIT", "POSTMAN", "LINUX",
];

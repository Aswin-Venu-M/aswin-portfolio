export interface Project {
  id: string;
  number: string;
  title: string;
  tag?: string;
  stack: string[];
  points: string[];
  featured?: boolean;
  accentColor?: string;
}

export const projects: Project[] = [
  {
    id: "bm-one",
    number: "01",
    title: "BM ONE — School Management System",
    tag: "FLAGSHIP PROJECT",
    stack: ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS", "ShadCN UI"],
    points: [
      "21 specialized modules: admissions, attendance, financial operations",
      "Token-based SSO with granular role-based access (admin, teacher, student, parent)",
      "Real-time dashboards, data visualizations, mobile-optimized UX",
      "Modular architecture with context-driven state management",
    ],
    featured: true,
    accentColor: "#FFD93D",
  },
  {
    id: "bm-ira",
    number: "02",
    title: "BM IRA — Internal Requisition & Approval",
    stack: ["Node.js", "Express", "Sequelize", "PostgreSQL", "React", "Tailwind CSS"],
    points: [
      "Automated approval workflows → 30% reduction in processing time",
      "Structured request submission, tracking, and authorization pipeline",
      "RESTful API tested with Postman for reliability + security",
    ],
    accentColor: "#FF6B6B",
  },
  {
    id: "bm-desk",
    number: "03",
    title: "BM Desk — Ticketing System",
    stack: ["React", "Node.js", "PostgreSQL"],
    points: [
      "30% improvement in issue tracking efficiency",
      "25% reduction in ticket processing time",
      "Cross-functional collaboration for requirements + UI optimization",
    ],
    accentColor: "#6BCB77",
  },
  {
    id: "limozia",
    number: "04",
    title: "Limozia — Limousine Booking Website",
    stack: ["Next.js", "React", "TypeScript"],
    points: [
      "Dynamic blog + admin management with secure auth",
      "Reusable components + custom hooks for design consistency",
      "Advanced form handling with real-time validation feedback",
    ],
    accentColor: "#FFD93D",
  },
  {
    id: "checkmycar",
    number: "05",
    title: "CheckMyCar.ae — Vehicle Inspection Platform",
    stack: ["Next.js", "React", "Node.js", "TypeScript"],
    points: [
      "Customer-facing + admin interfaces",
      "Real-time slot booking, date management, availability scheduling",
      "Role-based access control + protected admin routes",
    ],
    accentColor: "#FF6B6B",
  },
  {
    id: "sentiment",
    number: "06",
    title: "Sentiment Analysis — Restaurant Reviews",
    tag: "INTERNSHIP PROJECT",
    stack: ["Python", "NLP", "Machine Learning"],
    points: [
      "15% accuracy improvement over baseline models",
      "20% increase in positive review detection",
      "Data preprocessing + feature extraction + trend visualization",
    ],
    accentColor: "#6BCB77",
  },
];

export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  period: string;
  location: string;
  bullets: string[];
}

export const experiences: ExperienceItem[] = [
  {
    id: "docme",
    company: "DocMe Cloud Solutions",
    role: "Jr. Software Engineer",
    period: "Dec 2023 – Present",
    location: "Trivandrum, India",
    bullets: [
      "Full-stack apps with React.js, Node.js, Sequelize ORM, PostgreSQL → 30% improvement in load times",
      "RESTful APIs built and tested with Postman → 25% fewer integration errors",
      "React.js + Tailwind CSS + ShadCN UI → 20% increase in user engagement",
      "Git/GitHub workflows → 40% reduction in merge conflicts",
      "Onboarding sessions for new hires → 15% boost in team productivity",
    ],
  },
  {
    id: "edunet",
    company: "Edunet Foundation",
    role: "AI Intern",
    period: "Aug 2023 – Oct 2023",
    location: "Remote, India",
    bullets: [
      "Sentiment analysis model development using NLP techniques",
      "Attended expert-led technical sessions on AI/ML methodologies",
      "Weekly milestone tracking + mentor collaboration",
    ],
  },
];

import Section from '../common/Section.jsx';
import FadeInSection from '../common/FadeInSection.jsx';
import { skills, skillCategories } from '../../data/skills.js';

const CATEGORY_ICONS = {
  Languages: (
    <path
      d="M9 7 4 12l5 5M15 7l5 5-5 5M13 4l-2 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  'Machine Learning': (
    <path
      d="M12 4a3 3 0 0 1 3 3v1a3 3 0 0 1 0 6v3a3 3 0 0 1-6 0v-3a3 3 0 0 1 0-6V7a3 3 0 0 1 3-3ZM5 10h2M17 10h2M5 16h2M17 16h2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  Frontend: (
    <path
      d="M4 6h16v12H4zM9 21h6M12 18v3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  Backend: (
    <path
      d="M4 5h16v5H4zM4 14h16v5H4zM7.5 7.5h.01M7.5 16.5h.01"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  Databases: (
    <path
      d="M12 3c4.4 0 8 1.3 8 3s-3.6 3-8 3-8-1.3-8-3 3.6-3 8-3ZM4 6v12c0 1.7 3.6 3 8 3s8-1.3 8-3V6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  'Cloud & Tools': (
    <path
      d="M14.7 6.3a4 4 0 0 1 5 5L16 15l-3.5 3.5a2.1 2.1 0 0 1-3-3L13 12l1.7-5.7ZM6 18l3-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export default function Skills() {
  return (
    <Section
      id="skills"
      eyebrow="02 — Toolkit"
      title="What I work with"
      lead="Grouped by where they sit in a stack, not by how confident the logo makes me look."
    >
      <div className="skills__grid">
        {skillCategories.map((category, index) => (
          <FadeInSection key={category} delay={index * 80} className="skills__group glass">
            <div className="skills__group-header">
              <span className="skills__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  {CATEGORY_ICONS[category] ?? CATEGORY_ICONS.Languages}
                </svg>
              </span>
              <div>
                <h3 className="skills__category">{category}</h3>
                <p className="skills__blurb">{skills[category].blurb}</p>
              </div>
            </div>

            <ul className="skills__list" role="list">
              {skills[category].items.map((skill) => (
                <li key={skill} className="pill skills__pill" tabIndex={0}>
                  {skill}
                </li>
              ))}
            </ul>
          </FadeInSection>
        ))}
      </div>
    </Section>
  );
}

import { useState } from 'react';
import Button from '../common/Button.jsx';
import FadeInSection from '../common/FadeInSection.jsx';
import { about } from '../../data/about.js';
import { projects } from '../../data/projects.js';
import { allSkills } from '../../data/skills.js';
import { resume } from '../../data/resume.js';
import { useCoral } from '../../context/CoralContext.jsx';
import { scrollToSection } from '../../utils/scrollUtils.js';
import './hero.css';

// Whichever role is flagged `current` in the resume drives the hero badge, so
// changing jobs is a one-line edit in src/data/resume.js.
const CURRENT_ROLE = resume.experience.find((role) => role.current);

// Everything here reads from the data files, so editing src/data is enough —
// no stat can drift out of sync with the section it summarises.
const STATS = [
  { value: `${projects.length}`, label: 'Projects shipped' },
  { value: `${resume.experience.length}`, label: 'Internships' },
  { value: `${allSkills.length}+`, label: 'Tools & tech' },
  { value: resume.education[0].cgpa.split('/')[0].trim(), label: 'CGPA' },
];

export default function Hero() {
  const { ask } = useCoral();
  const [nameHovered, setNameHovered] = useState(false);

  return (
    <section id="hero" className="hero" aria-labelledby="hero-heading">
      <div className="container hero__inner">
        <FadeInSection className="hero__badge glass" delay={0}>
          <span className="hero__badge-dot" aria-hidden="true" />
          {CURRENT_ROLE
            ? `Currently ${CURRENT_ROLE.title.toLowerCase()} at ${CURRENT_ROLE.company}`
            : 'Open to internships and collaborations'}
        </FadeInSection>

        <FadeInSection delay={80}>
          <h1 id="hero-heading" className="hero__greeting">
            <span className="hero__hi">Hi, I&rsquo;m</span>{' '}
            <span
              className={`hero__name${nameHovered ? ' is-hovered' : ''}`}
              onMouseEnter={() => setNameHovered(true)}
              onMouseLeave={() => setNameHovered(false)}
            >
              {about.name}
            </span>
          </h1>
        </FadeInSection>

        <FadeInSection delay={160}>
          <p className="hero__role">{about.role}</p>
        </FadeInSection>

        <FadeInSection delay={240}>
          <p className="hero__intro">
            I build full-stack web apps that solve problems I actually ran into — a lab-inventory
            system my classmates use, a college IMS portal, an options engine that backtests its
            own strategies. Right now I&rsquo;m teaching models to spot defects humans miss.
          </p>
        </FadeInSection>

        <FadeInSection delay={320} className="hero__ctas" as="nav" aria-label="Primary actions">
          <Button variant="primary" size="large" onClick={() => scrollToSection('projects')}>
            View projects
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path
                d="M5 12h14M13 6l6 6-6 6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
          <Button
            variant="secondary"
            size="large"
            onClick={() => ask('What has Pranati built?')}
          >
            <span className="hero__coral-dot" aria-hidden="true" />
            Ask Coral
          </Button>
          <Button variant="ghost" size="large" onClick={() => scrollToSection('resume')}>
            Resume
          </Button>
        </FadeInSection>

        <FadeInSection delay={400} className="hero__stats" as="ul">
          {STATS.map((stat) => (
            <li key={stat.label} className="hero__stat glass">
              <span className="hero__stat-value">{stat.value}</span>
              <span className="hero__stat-label">{stat.label}</span>
            </li>
          ))}
        </FadeInSection>

        <FadeInSection delay={480} className="hero__hint">
          <span className="hero__hint-mouse" aria-hidden="true">
            <span className="hero__hint-wheel" />
          </span>
          <span>Scroll to descend</span>
        </FadeInSection>
      </div>
    </section>
  );
}

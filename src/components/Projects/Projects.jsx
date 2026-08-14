import { useState } from 'react';
import Section from '../common/Section.jsx';
import FadeInSection from '../common/FadeInSection.jsx';
import Modal from '../common/Modal.jsx';
import ProjectCard from './ProjectCard.jsx';
import { projects } from '../../data/projects.js';
import './projects.css';

export default function Projects() {
  const [activeProject, setActiveProject] = useState(null);
  const motivation = activeProject?.motivation;

  return (
    <Section
      id="projects"
      eyebrow="01 — Work"
      title="Things I've built"
      lead="Each of these started as a problem I kept running into. Open one to read why it exists."
      wide
    >
      <ul className="projects__grid" role="list">
        {projects.map((project, index) => (
          <FadeInSection key={project.id} as="li" delay={index * 90} className="projects__item">
            <ProjectCard project={project} onOpenMotivation={() => setActiveProject(project)} />
          </FadeInSection>
        ))}
      </ul>

      <Modal
        isOpen={Boolean(activeProject)}
        onClose={() => setActiveProject(null)}
        title={activeProject ? `Why I built ${activeProject.name}` : ''}
      >
        {typeof motivation === 'string' ? (
          <p>{motivation}</p>
        ) : (
          motivation && (
            <>
              {motivation.problem && (
                <>
                  <h4 className="projects__modal-heading">The problem</h4>
                  <p>{motivation.problem}</p>
                </>
              )}
              {motivation.challenge && (
                <>
                  <h4 className="projects__modal-heading">The hard part</h4>
                  <p>{motivation.challenge}</p>
                </>
              )}
              {motivation.keyLearning && (
                <>
                  <h4 className="projects__modal-heading">What it taught me</h4>
                  <p>{motivation.keyLearning}</p>
                </>
              )}
            </>
          )
        )}

        {activeProject && (
          <ul className="projects__modal-tech" role="list">
            {activeProject.techStack.map((tech) => (
              <li key={tech} className="pill">
                {tech}
              </li>
            ))}
          </ul>
        )}
      </Modal>
    </Section>
  );
}

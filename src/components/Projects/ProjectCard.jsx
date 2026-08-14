import PropTypes from 'prop-types';
import { useCoral } from '../../context/CoralContext.jsx';

const ExternalIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
    <path
      d="M14 5h5v5M19 5l-8 8M18 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true">
    <path
      fill="currentColor"
      d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.4 9.4 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z"
    />
  </svg>
);

export default function ProjectCard({ project, onOpenMotivation }) {
  const { ask } = useCoral();

  return (
    <article className="project-card glass glass--interactive">
      <div className="project-card__top">
        <span className="project-card__index" aria-hidden="true">
          {String(project.order).padStart(2, '0')}
        </span>
        {project.award && (
          <span className="project-card__status project-card__status--award">
            <svg viewBox="0 0 24 24" width="12" height="12" aria-hidden="true">
              <path
                d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.7l5.4-.8z"
                fill="currentColor"
              />
            </svg>
            {project.award}
          </span>
        )}
        {project.inProgress && <span className="project-card__status">In progress</span>}
      </div>

      <h3 className="project-card__title">{project.name}</h3>
      <p className="project-card__description">{project.description}</p>

      <ul className="project-card__tech" role="list">
        {project.techStack.map((tech) => (
          <li key={tech} className="pill">
            {tech}
          </li>
        ))}
      </ul>

      <div className="project-card__actions">
        {project.demoUrl && (
          <a
            className="btn btn--primary btn--small"
            href={project.demoUrl}
            target="_blank"
            rel="noreferrer noopener"
          >
            Live demo
            <ExternalIcon />
          </a>
        )}
        <a
          className="btn btn--secondary btn--small"
          href={project.githubUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          <GithubIcon />
          Code
        </a>
        <button type="button" className="btn btn--ghost btn--small" onClick={onOpenMotivation}>
          Why I built this
        </button>
        <button
          type="button"
          className="project-card__ask"
          onClick={() => ask(`Tell me about ${project.name}`)}
          aria-label={`Ask Coral about ${project.name}`}
          title="Ask Coral about this project"
        >
          <span className="project-card__ask-dot" aria-hidden="true" />
          Ask Coral
        </button>
      </div>
    </article>
  );
}

ProjectCard.propTypes = {
  project: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    techStack: PropTypes.arrayOf(PropTypes.string),
    githubUrl: PropTypes.string,
    demoUrl: PropTypes.string,
    order: PropTypes.number,
    inProgress: PropTypes.bool,
    award: PropTypes.string,
  }).isRequired,
  onOpenMotivation: PropTypes.func.isRequired,
};

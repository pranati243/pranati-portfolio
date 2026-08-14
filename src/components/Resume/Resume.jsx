import Section from '../common/Section.jsx';
import FadeInSection from '../common/FadeInSection.jsx';
import { resume } from '../../data/resume.js';
import { about } from '../../data/about.js';

function downloadResume() {
  const link = document.createElement('a');
  link.href = about.resumeUrl;
  link.download = 'Pranati_Arun_Resume.pdf';
  document.body.appendChild(link);
  link.click();
  link.remove();
}

export default function Resume() {
  return (
    <Section
      id="resume"
      eyebrow="The log"
      title="Experience & education"
      lead={resume.summary}
    >
      <FadeInSection className="resume__actions">
        <button type="button" className="btn btn--primary" onClick={downloadResume}>
          <svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true">
            <path
              d="M12 4v11m0 0 4-4m-4 4-4-4M5 19h14"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Download resume
        </button>
        <a
          className="btn btn--secondary"
          href={about.resumeUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          Open as PDF
        </a>
      </FadeInSection>

      <div className="resume__timeline">
        <h3 className="resume__group-title">Experience</h3>
        {resume.experience.map((role, index) => (
          <FadeInSection key={role.company} delay={index * 90} className="resume__entry glass">
            <div className="resume__entry-head">
              <div>
                <h4 className="resume__role">
                  {role.title}
                  {role.current && <span className="resume__now">Now</span>}
                </h4>
                <p className="resume__company">{role.company}</p>
              </div>
              <span className="resume__duration">{role.duration}</span>
            </div>
            {role.distinction && (
              <p className="resume__distinction">
                <span className="resume__distinction-badge">
                  <svg viewBox="0 0 24 24" width="13" height="13" aria-hidden="true">
                    <path
                      d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.7l5.4-.8z"
                      fill="currentColor"
                    />
                  </svg>
                  {role.distinction}
                </span>
                {role.distinctionNote && (
                  <span className="resume__distinction-note">{role.distinctionNote}</span>
                )}
              </p>
            )}
            <p className="resume__description">{role.description}</p>
            <ul className="resume__responsibilities" role="list">
              {role.responsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </FadeInSection>
        ))}

        <h3 className="resume__group-title">Education</h3>
        {resume.education.map((entry, index) => (
          <FadeInSection key={entry.institution} delay={index * 90} className="resume__entry glass">
            <div className="resume__entry-head">
              <div>
                <h4 className="resume__role">{entry.degree}</h4>
                <p className="resume__company">{entry.institution}</p>
              </div>
              <span className="resume__duration">{entry.year}</span>
            </div>
            {(entry.cgpa || entry.score) && (
              <p className="resume__cgpa">
                {entry.cgpa ? 'CGPA ' : 'Score '}
                <strong>{entry.cgpa || entry.score}</strong>
              </p>
            )}
            {entry.details && <p className="resume__description">{entry.details}</p>}
          </FadeInSection>
        ))}

        {resume.achievements.length > 0 && (
          <>
            <h3 className="resume__group-title">Awards & achievements</h3>
            <ul className="resume__awards" role="list">
              {resume.achievements.map((item, index) => (
                <FadeInSection
                  key={item.title}
                  as="li"
                  delay={index * 80}
                  className="resume__award glass"
                >
                  <span className="resume__award-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path
                        d="M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.7l5.4-.8z"
                        fill="currentColor"
                      />
                    </svg>
                  </span>
                  <span>
                    <strong className="resume__award-title">{item.title}</strong>
                    <span className="resume__description">{item.detail}</span>
                  </span>
                </FadeInSection>
              ))}
            </ul>
          </>
        )}

        {resume.activities.length > 0 && (
          <>
            <h3 className="resume__group-title">Beyond the code</h3>
            {resume.activities.map((activity, index) => (
              <FadeInSection key={activity.role} delay={index * 90} className="resume__entry glass">
                <div className="resume__entry-head">
                  <div>
                    <h4 className="resume__role">{activity.role}</h4>
                    <p className="resume__company">{activity.organisation}</p>
                  </div>
                  <span className="resume__duration">{activity.duration}</span>
                </div>
                <p className="resume__description">{activity.description}</p>
              </FadeInSection>
            ))}
          </>
        )}

        {resume.certifications.length > 0 && (
          <>
            <h3 className="resume__group-title">Certifications</h3>
            <ul className="resume__certs" role="list">
              {resume.certifications.map((cert) => (
                <li key={cert.name || cert} className="pill">
                  {cert.name || cert}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </Section>
  );
}

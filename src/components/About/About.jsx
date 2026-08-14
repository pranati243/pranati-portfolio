import Section from '../common/Section.jsx';
import FadeInSection from '../common/FadeInSection.jsx';
import { about } from '../../data/about.js';
import { useCoral } from '../../context/CoralContext.jsx';

export default function About() {
  const { ask } = useCoral();

  return (
    <Section
      id="about"
      eyebrow="The diver"
      title="About me"
      lead="The short version — Coral can fill in the rest."
    >
      <div className="about__grid">
        <FadeInSection className="about__bio">
          <p className="about__paragraph">{about.bio}</p>

          <h3 className="about__subhead">How I learn</h3>
          <p className="about__paragraph">{about.learningMindset}</p>

          <button
            type="button"
            className="btn btn--secondary btn--small about__ask"
            onClick={() => ask("What's Pranati like to work with?")}
          >
            <span className="project-card__ask-dot" aria-hidden="true" />
            Ask Coral what I&rsquo;m like to work with
          </button>
        </FadeInSection>

        <div className="about__side">
          <FadeInSection delay={100} className="about__card glass">
            <h3 className="about__card-title">What I&rsquo;m into</h3>
            <ul className="about__interests" role="list">
              {about.interests.map((interest) => (
                <li key={interest}>
                  <span className="about__bullet" aria-hidden="true" />
                  {interest}
                </li>
              ))}
            </ul>
          </FadeInSection>

          <FadeInSection delay={180} className="about__card glass">
            <h3 className="about__card-title">Honest self-assessment</h3>
            <p className="about__card-label">Strong suits</p>
            <ul className="about__traits" role="list">
              {about.strengths.slice(0, 3).map((strength) => (
                <li key={strength}>{strength}</li>
              ))}
            </ul>
            <p className="about__card-label about__card-label--warn">Still working on</p>
            <ul className="about__traits" role="list">
              {about.weaknesses.slice(0, 3).map((weakness) => (
                <li key={weakness}>{weakness}</li>
              ))}
            </ul>
          </FadeInSection>
        </div>
      </div>
    </Section>
  );
}

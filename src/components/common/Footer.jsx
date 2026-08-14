import { about } from '../../data/about.js';

export default function Footer() {
  return (
    <footer className="footer">
      <svg className="footer__wave" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
        <path
          d="M0,30 C180,60 360,0 540,28 C720,56 900,4 1080,30 C1260,56 1380,26 1440,20"
          fill="none"
          stroke="rgba(56,189,248,0.5)"
          strokeWidth="2"
        />
      </svg>
      <div className="container">
        <p>
          Built by {about.name} — React, Three.js and a lot of blue.
        </p>
        <p className="footer__note">
          © {new Date().getFullYear()} · Coral is powered by Gemini and only knows what&rsquo;s on this
          page.
        </p>
      </div>
    </footer>
  );
}

import { useEffect, useState } from 'react';
import OceanBackground from './components/Background/OceanBackground.jsx';
import Navigation from './components/Navigation/Navigation.jsx';
import Hero from './components/Hero/Hero.jsx';
import Projects from './components/Projects/Projects.jsx';
import Skills from './components/Skills/Skills.jsx';
import About from './components/About/About.jsx';
import Resume from './components/Resume/Resume.jsx';
import Contact from './components/Contact/Contact.jsx';
import Footer from './components/common/Footer.jsx';
import Toast from './components/common/Toast.jsx';
import Tooltip from './components/common/Tooltip.jsx';
import CoralChat from './components/Coral/CoralChat.jsx';
import { useCoral } from './context/CoralContext.jsx';
import { applyPerformanceClass } from './utils/performanceUtils.js';
import { KeySequenceDetector, isFirstVisit, markVisited } from './utils/easterEggs.js';

export default function App() {
  const { setUnread } = useCoral();
  const [toastOpen, setToastOpen] = useState(false);
  const [tooltip, setTooltip] = useState({ open: false, message: '', position: { x: 0, y: 0 } });

  useEffect(() => {
    applyPerformanceClass();
  }, []);

  // First-time visitors get one nudge toward Coral, then never again.
  useEffect(() => {
    if (!isFirstVisit()) return undefined;

    const timer = setTimeout(() => {
      setToastOpen(true);
      setUnread(true);
      markVisited();
    }, 2600);

    return () => clearTimeout(timer);
  }, [setUnread]);

  useEffect(() => {
    const detector = new KeySequenceDetector()
      .register('hello', (cursor) =>
        setTooltip({ open: true, message: 'Hey there! 🐠', position: cursor })
      )
      .register('help', (cursor) =>
        setTooltip({
          open: true,
          message: 'Try asking Coral: "What projects has Pranati built?"',
          position: cursor,
        })
      )
      .start();

    return () => detector.stop();
  }, []);

  return (
    <>
      <a className="skip-to-content" href="#main-content">
        Skip to content
      </a>

      <OceanBackground />
      <Navigation />

      <main id="main-content">
        <Hero />
        <hr className="divider" />
        <Projects />
        <hr className="divider" />
        <Skills />
        <hr className="divider" />
        <About />
        <hr className="divider" />
        <Resume />
        <hr className="divider" />
        <Contact />
      </main>

      <Footer />

      <CoralChat />

      <Toast
        isOpen={toastOpen}
        onClose={() => setToastOpen(false)}
        message={
          <>
            Meet <strong>Coral</strong> — tap the glowing orb to ask anything about Pranati.
          </>
        }
      />

      <Tooltip
        isOpen={tooltip.open}
        message={tooltip.message}
        position={tooltip.position}
        onClose={() => setTooltip((prev) => ({ ...prev, open: false }))}
      />
    </>
  );
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/common/ErrorBoundary.jsx';
import { OceanProvider } from './context/OceanContext.jsx';
import { CoralProvider } from './context/CoralContext.jsx';

import './styles/variables.css';
import './styles/animations.css';
import './styles/global.css';
import './styles/content.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <OceanProvider>
        <CoralProvider>
          <App />
        </CoralProvider>
      </OceanProvider>
    </ErrorBoundary>
  </StrictMode>
);

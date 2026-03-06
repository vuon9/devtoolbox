import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Theme } from '@carbon/react';
import { SpotlightPalette } from './components/SpotlightPalette';
import './index.scss'; // Import global styles and Carbon tokens
import './spotlight.css';

// Force g100 theme for Spotlight as per project guidelines
const getInitialTheme = () => 'g100';

function SpotlightApp() {
  return (
    <div className="spotlight-app-wrapper" style={{ height: '100%', width: '100%', background: 'transparent' }}>
      <BrowserRouter>
        <SpotlightPalette />
      </BrowserRouter>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SpotlightApp />
  </React.StrictMode>
);

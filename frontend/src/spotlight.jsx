import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Theme } from '@carbon/react';
import { SpotlightPalette } from './components/SpotlightPalette';
import './spotlight.css';

function SpotlightApp() {
  const [theme, setTheme] = React.useState('g100');

  // Listen for system theme changes
  React.useEffect(() => {
    const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      setTheme(matchMedia.matches ? 'g100' : 'white');
    };

    updateTheme();
    matchMedia.addEventListener('change', updateTheme);
    return () => matchMedia.removeEventListener('change', updateTheme);
  }, []);

  return (
    <Theme theme={theme} style={{ height: '100%' }}>
      <BrowserRouter>
        <SpotlightPalette />
      </BrowserRouter>
    </Theme>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <SpotlightApp />
  </React.StrictMode>
);

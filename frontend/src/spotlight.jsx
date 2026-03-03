import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Theme } from '@carbon/react';
import { SpotlightPalette } from './components/SpotlightPalette';
import './spotlight.css';

const getInitialTheme = () => {
  const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');
  return matchMedia.matches ? 'g100' : 'white';
};

function SpotlightApp() {
  const [theme] = React.useState(getInitialTheme());

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
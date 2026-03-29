import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CommandPalette } from './components/CommandPalette';
import './index.scss';
import './spotlight.css';

// Command Palette (Global - Cmd+Shift+Space)
function CommandPaletteApp() {
  return (
    <div
      className="command-palette-app-wrapper"
      style={{ height: '100%', width: '100%', background: 'transparent' }}
    >
      <BrowserRouter>
        <CommandPalette />
      </BrowserRouter>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <CommandPaletteApp />
  </React.StrictMode>
);

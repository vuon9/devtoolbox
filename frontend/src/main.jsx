import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './globals.css';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';

const container = document.getElementById('root');

const root = createRoot(container);

root.render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);

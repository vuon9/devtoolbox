import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { TitleBar } from './components/TitleBar';
import { CommandPalette } from './components/CommandPalette';
import { SettingsModal } from './components/SettingsModal';
import { Theme } from '@carbon/react';
import { Events } from '@wailsio/runtime';
import ToolRouter from './ToolRouter';

// Error boundary for catching React rendering errors
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '2rem',
            color: 'var(--cds-text-primary)',
            backgroundColor: 'var(--cds-layer)',
          }}
        >
          <h2>Something went wrong</h2>
          <p>The application encountered an error. Please try refreshing the page.</p>
          <details style={{ marginTop: '1rem', whiteSpace: 'pre-wrap' }}>
            <summary>Error details</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  console.log('App mounting');
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [theme, setTheme] = useState('g100'); // 'white', 'g10', 'g90', 'g100'
  const [themeMode, setThemeMode] = useState('dark'); // 'system', 'light', 'dark'

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);
  const toggleCommandPalette = useCallback(() => {
    setIsCommandPaletteOpen((prev) => !prev);
  }, []);
  const closeCommandPalette = useCallback(() => setIsCommandPaletteOpen(false), []);

  useEffect(() => {
    // Detect System Theme
    const matchMedia = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      if (themeMode === 'system') {
        setTheme(matchMedia.matches ? 'g100' : 'white');
      } else if (themeMode === 'dark') {
        setTheme('g100');
      } else {
        setTheme('white');
      }
    };

    updateTheme();
    matchMedia.addEventListener('change', updateTheme);
    return () => matchMedia.removeEventListener('change', updateTheme);
  }, [themeMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleSidebar();
      }
      // Command palette shortcuts - toggle on/off
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || (e.key === 'p' && e.shiftKey))) {
        e.preventDefault();
        toggleCommandPalette();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen, toggleCommandPalette]);

  // Listen for command palette toggle event from backend (global hotkey)
  useEffect(() => {
    let unsubscribe = null;
    try {
      unsubscribe = Events.On('command-palette:open', () => {
        toggleCommandPalette();
      });
    } catch(err) {
      console.error('Failed to listen to command-palette:open', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [toggleCommandPalette]);

  // Listen for navigation from spotlight
  useEffect(() => {
    const handleNavigation = (data) => {
      // In Wails V3, data might be the path string OR an event object with path in data
      let path = '';
      if (typeof data === 'string') {
        path = data;
      } else if (data && typeof data === 'object') {
        if (data.data) {
          path = typeof data.data === 'string' ? data.data : data.data[0];
        }
      }

      if (path) {
        console.log('App navigating to path:', path);
        navigate(path);
      } else {
        console.warn('App received empty/invalid path via navigate:to:', data);
      }
    };

    let unsubscribe = null;
    try {
      unsubscribe = Events.On('navigate:to', (event) => {
        console.log('Received navigate:to event', event);
        handleNavigation(event);
      });
    } catch(err) {
      console.error('Failed to listen to navigate:to', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  // Listen for theme toggle from spotlight
  useEffect(() => {
    let unsubscribe = null;
    try {
      unsubscribe = Events.On('theme:toggle', () => {
        setThemeMode(prev => prev === 'dark' ? 'light' : 'dark');
      });
    } catch(err) {
      console.error('Failed to listen to theme:toggle', err);
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [setThemeMode]);

  return (
    <ErrorBoundary>
      <Theme theme={theme} style={{ height: '100%' }}>
        <div className="app-container">
          <TitleBar
            isSidebarOpen={isSidebarOpen}
            toggleSidebar={toggleSidebar}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
          />

          <div className="app-body">
            <Sidebar isVisible={isSidebarOpen} onOpenSettings={openSettings} />

            <main className="main-content">
              <div className="content-area">
                <Routes>
                  <Route path="/" element={<Navigate to="/tool/text-converter" replace />} />
                  <Route path="/tool/:toolId/*" element={<ToolRouter />} />
                  <Route path="*" element={<Navigate to="/tool/text-converter" replace />} />
                </Routes>
              </div>
            </main>
          </div>

          <CommandPalette
            isOpen={isCommandPaletteOpen}
            onClose={closeCommandPalette}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
          />

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={closeSettings}
            themeMode={themeMode}
            setThemeMode={setThemeMode}
          />
        </div>
      </Theme>
    </ErrorBoundary>
  );
}

export default App;

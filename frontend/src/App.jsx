import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { Sidebar } from './components/Sidebar';
import { TitleBar } from './components/TitleBar';
import { Theme } from '@carbon/react';
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
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [theme, setTheme] = useState('g100'); // 'white', 'g10', 'g90', 'g100'
  const [themeMode, setThemeMode] = useState('dark'); // 'system', 'light', 'dark'

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

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
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSidebarOpen]);

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
            <Sidebar isVisible={isSidebarOpen} />

            <main className="main-content">
              <div className="content-area">
                <Routes>
                  <Route path="/" element={<Navigate to="/tool/text-converter" replace />} />
                  <Route path="/tool/:toolId" element={<ToolRouter />} />
                  <Route path="*" element={<Navigate to="/tool/text-converter" replace />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>
      </Theme>
    </ErrorBoundary>
  );
}

export default App;

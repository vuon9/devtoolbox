import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TitleBar } from './components/TitleBar';
import { SettingsModal } from './components/SettingsModal';
import ToolRouter from './ToolRouter';
import './App.css';

// NavigationHandler listens for navigate events from command palette
function NavigationHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for navigation events from command palette (via Go backend)
    const unsubscribe = window.runtime?.EventsOn?.('navigate:to', (path) => {
      console.log('[App] Received navigate:to event:', path);
      if (path) {
        navigate(path);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  return null;
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'dark';
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  // Global spotlight shortcut is Cmd+Shift+Space (handled by Go backend)

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        backgroundColor: '#09090b',
        color: '#fafafa',
        overflow: 'hidden',
      }}
    >
      <TitleBar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onOpenSettings={openSettings}
      />

      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        <Sidebar isVisible={isSidebarOpen} onOpenSettings={openSettings} />

        <main
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            backgroundColor: '#09090b',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="/tool/text-converter" replace />} />
            <Route path="/tool/:toolId/*" element={<ToolRouter />} />
            <Route path="*" element={<Navigate to="/tool/text-converter" replace />} />
          </Routes>
          <NavigationHandler />
        </main>
      </div>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
      />
    </div>
  );
}

export default App;

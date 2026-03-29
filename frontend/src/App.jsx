import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Events } from '@wailsio/runtime';

import { Sidebar } from './components/Sidebar';
import { TitleBar } from './components/TitleBar';
import { SettingsModal } from './components/SettingsModal';
import ToolRouter from './ToolRouter';
import './App.css';

function App() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'dark';
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  // Handle navigation events from command palette
  useEffect(() => {
    console.log('[App] Setting up navigation listener for command palette...');

    const handleNavigation = (data) => {
      console.log('[App] Received navigate:to event:', data);

      // In Wails V3, data might be the path string OR an event object with path in data
      let path = '';
      if (typeof data === 'string') {
        path = data;
      } else if (data && typeof data === 'object') {
        if (data.data) {
          path = typeof data.data === 'string' ? data.data : data.data[0];
        } else if (data.path) {
          path = data.path;
        }
      }

      if (path) {
        console.log('[App] Navigating to path:', path);
        navigate(path);
      } else {
        console.warn('[App] Received empty/invalid path via navigate:to:', data);
      }
    };

    let unsubscribe = null;
    try {
      unsubscribe = Events.On('navigate:to', (event) => {
        handleNavigation(event);
      });
      console.log('[App] Navigation listener registered successfully');
    } catch (err) {
      console.error('[App] Failed to register navigation listener:', err);
    }

    return () => {
      console.log('[App] Cleaning up navigation listener');
      if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  // Handle theme changes
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

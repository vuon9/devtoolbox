import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TitleBar } from './components/TitleBar';
import { SettingsModal } from './components/SettingsModal';
import { CommandPalette } from './components/CommandPalette';
import ToolRouter from './ToolRouter';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'dark';
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);
  const openCommandPalette = () => setIsCommandPaletteOpen(true);
  const closeCommandPalette = () => setIsCommandPaletteOpen(false);

  // Global spotlight shortcut is Cmd+Shift+Space (handled by Go backend)
  // In-app shortcuts can be added here if needed
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Close Command Palette on Escape if open
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setIsCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen]);

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

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={closeCommandPalette}
        themeMode={themeMode}
        setThemeMode={setThemeMode}
      />
    </div>
  );
}

export default App;

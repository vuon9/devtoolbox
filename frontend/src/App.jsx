import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { TitleBar } from './components/TitleBar';
import { SettingsModal } from './components/SettingsModal';
import ToolRouter from './ToolRouter';
import './App.css';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'dark';
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    if (themeMode === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themeMode]);

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <TitleBar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onOpenSettings={openSettings}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar isVisible={isSidebarOpen} onOpenSettings={openSettings} />

        <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
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

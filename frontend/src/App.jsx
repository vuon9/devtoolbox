import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Events } from '@wailsio/runtime';

import { Sidebar } from './components/Sidebar';
import { TitleBar } from './components/TitleBar';
import { SettingsModal } from './components/SettingsModal';
import ToolRouter from './ToolRouter';

function App() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);

  useEffect(() => {
    let unsubscribe = null;
    try {
      unsubscribe = Events.On('navigate:to', (event) => {
        let path = '';
        const data = event;
        if (typeof data === 'string') {
          path = data;
        } else if (data && typeof data === 'object') {
          if (data.data) {
            path = typeof data.data === 'string' ? data.data : data.data[0];
          } else if (data.path) {
            path = data.path;
          }
        }
        if (path) navigate(path);
      });
    } catch (err) {
      console.error('[App] Failed to register navigation listener:', err);
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [navigate]);

  return (
    <div className="flex flex-col h-screen w-screen bg-background text-foreground overflow-hidden">
      <TitleBar
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
        onOpenSettings={openSettings}
      />

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <Sidebar isVisible={isSidebarOpen} onOpenSettings={openSettings} />

        <main className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
          <Routes>
            <Route path="/" element={<Navigate to="/tool/code-encoder" replace />} />
            <Route path="/tool/:toolId/*" element={<ToolRouter />} />
            <Route path="*" element={<Navigate to="/tool/code-encoder" replace />} />
          </Routes>
        </main>
      </div>

      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} />
    </div>
  );
}

export default App;

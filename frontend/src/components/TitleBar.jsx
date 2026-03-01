import React, { useState } from 'react';
import { IconButton } from '@carbon/react';
import { Menu, Close, Subtract, Maximize, Settings } from '@carbon/icons-react';
import { SettingsModal } from './SettingsModal';
import { Minimise, Maximise, Close as WindowClose } from '../generated';

export function TitleBar({
  isSidebarOpen,
  toggleSidebar,
  appName = 'DevToolbox',
  themeMode,
  setThemeMode,
}) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  // Detect if running in desktop mode
  const isDesktop = typeof window !== 'undefined' && window.go?.devtoolbox?.service?.WindowControls;

  // Detect platform
  const userAgent = navigator.userAgent.toLowerCase();
  const isMac =
    userAgent.includes('mac') && !userAgent.includes('iphone') && !userAgent.includes('ipad');

  // Don't render in browser mode
  if (!isDesktop) {
    return null;
  }

  // Window control handlers for non-macOS platforms
  const handleMinimize = async () => {
    try {
      await Minimise();
    } catch (err) {
      console.error('Failed to minimise window:', err);
    }
  };

  const handleMaximize = async () => {
    try {
      await Maximise();
    } catch (err) {
      console.error('Failed to maximise window:', err);
    }
  };

  const handleClose = async () => {
    try {
      await WindowClose();
    } catch (err) {
      console.error('Failed to close window:', err);
    }
  };

  return (
    <div className={`titlebar ${isMac ? 'macos' : 'other-platform'}`}>
      {/* Left section - Sidebar toggle (always visible on desktop) */}
      <div className="titlebar-left">
        <IconButton
          kind="ghost"
          size="sm"
          onClick={toggleSidebar}
          label={isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          align="bottom"
          className="titlebar-sidebar-toggle"
        >
          <Menu size={16} />
        </IconButton>
      </div>

      {/* Center section - App name */}
      <div className="titlebar-center">
        <span className="titlebar-appname">{appName}</span>
      </div>

      {/* Right section - Settings + Window controls */}
      <div className="titlebar-right">
        {/* Settings button */}
        <IconButton
          kind="ghost"
          size="sm"
          onClick={() => setIsSettingsOpen(true)}
          label="Settings"
          className="titlebar-settings"
        >
          <Settings size={16} />
        </IconButton>

        {/* Window controls for non-macOS platforms */}
        {!isMac && (
          <div className="window-controls">
            <IconButton
              kind="ghost"
              size="sm"
              onClick={handleMinimize}
              label="Minimize"
              className="window-control-btn minimize"
            >
              <Subtract size={16} />
            </IconButton>
            <IconButton
              kind="ghost"
              size="sm"
              onClick={handleMaximize}
              label="Maximize"
              className="window-control-btn maximize"
            >
              <Maximize size={16} />
            </IconButton>
            <IconButton
              kind="ghost"
              size="sm"
              onClick={handleClose}
              label="Close"
              className="window-control-btn close"
            >
              <Close size={16} />
            </IconButton>
          </div>
        )}

        {/* Settings Modal */}
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          themeMode={themeMode}
          setThemeMode={setThemeMode}
        />
      </div>
    </div>
  );
}

export default TitleBar;

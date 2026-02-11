import React from 'react';
import { IconButton, OverflowMenu, OverflowMenuItem } from '@carbon/react';
import { Menu, Close, Subtract, Maximize, Settings } from '@carbon/icons-react';

export function TitleBar({ 
  isSidebarOpen, 
  toggleSidebar, 
  appName = 'DevToolbox',
  themeMode,
  setThemeMode 
}) {
  // Detect if running in desktop mode
  const isDesktop = typeof window !== 'undefined' && window.wails;
  
  // Detect platform
  const userAgent = navigator.userAgent.toLowerCase();
  const isMac = userAgent.includes('mac') && !userAgent.includes('iphone') && !userAgent.includes('ipad');

  // Don't render in browser mode
  if (!isDesktop) {
    return null;
  }

  // Window control handlers for non-macOS platforms
  const handleMinimize = () => {
    if (window.wails?.WindowMinimise) {
      window.wails.WindowMinimise();
    }
  };

  const handleMaximize = () => {
    if (window.wails?.WindowMaximise) {
      window.wails.WindowMaximise();
    }
  };

  const handleClose = () => {
    if (window.wails?.Quit) {
      window.wails.Quit();
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
        {/* Settings menu */}
        <OverflowMenu
          renderIcon={Settings}
          flipped
          size="sm"
          ariaLabel="Settings"
          iconDescription="Settings"
          title="Theme Settings"
          className="titlebar-settings"
        >
          <OverflowMenuItem itemText="System Theme" onClick={() => setThemeMode('system')} requireTitle />
          <OverflowMenuItem itemText="Dark Theme" onClick={() => setThemeMode('dark')} requireTitle />
          <OverflowMenuItem itemText="Light Theme" onClick={() => setThemeMode('light')} requireTitle />
        </OverflowMenu>

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
      </div>
    </div>
  );
}

export default TitleBar;

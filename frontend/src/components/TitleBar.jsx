import React from 'react';
import { Menu, Settings, Minus, Square, X } from 'lucide-react';

export function TitleBar({ appName = 'DevToolbox', onOpenSettings }) {
  // Detect if running in desktop mode (Wails)
  const isDesktop = typeof window !== 'undefined' && window.go?.devtoolbox?.service?.WindowControls;

  // Don't render TitleBar in web browser mode
  if (!isDesktop) {
    return null;
  }

  // Detect platform
  const userAgent = navigator.userAgent.toLowerCase();
  const isMac =
    userAgent.includes('mac') && !userAgent.includes('iphone') && !userAgent.includes('ipad');

  const handleMinimize = () => window.runtime?.WindowMinimise?.();
  const handleMaximize = () => window.runtime?.WindowToggleMaximise?.();
  const handleClose = () => window.runtime?.WindowQuit?.();

  const buttonStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    padding: '6px',
    backgroundColor: 'transparent',
    border: 'none',
    borderRadius: '4px',
    color: '#a1a1aa',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease, color 0.15s ease',
    WebkitAppRegion: 'no-drag',
  };

  return (
    <header
      style={{
        height: '40px',
        borderBottom: '1px solid #27272a',
        backgroundColor: '#18181b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: isMac ? '80px' : '12px',
        paddingRight: '12px',
        WebkitAppRegion: 'drag',
        userSelect: 'none',
      }}
    >
      {/* Left section - Mac traffic light space */}
      {isMac && <div style={{ width: '80px' }} />}

      {/* Center section */}
      <div style={{
        position: 'absolute',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        pointerEvents: 'none',
      }}>
        <span style={{
          fontSize: '12px',
          fontWeight: 600,
          letterSpacing: '-0.025em',
          color: '#71717a',
          textTransform: 'uppercase',
        }}>
          {appName}
        </span>
      </div>

      {/* Right section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', WebkitAppRegion: 'no-drag' }}>
        <button
          onClick={onOpenSettings}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#27272a';
            e.currentTarget.style.color = '#f4f4f5';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#a1a1aa';
          }}
        >
          <Settings style={{ width: '16px', height: '16px' }} />
        </button>

        {!isMac && (
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: '8px', paddingLeft: '8px', borderLeft: '1px solid #27272a', gap: '2px' }}>
            <button
              onClick={handleMinimize}
              style={buttonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#27272a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Minus style={{ width: '12px', height: '12px' }} />
            </button>
            <button
              onClick={handleMaximize}
              style={buttonStyle}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#27272a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Square style={{ width: '10px', height: '10px' }} />
            </button>
            <button
              onClick={handleClose}
              style={{ ...buttonStyle, color: '#ef4444' }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#dc2626';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#ef4444';
              }}
            >
              <X style={{ width: '16px', height: '16px' }} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default TitleBar;
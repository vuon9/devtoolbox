import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { IconButton } from '@carbon/react';
import { Settings } from '@carbon/icons-react';

export function Sidebar({ isVisible, onOpenSettings }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [pinned, setPinned] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('pinnedTools')) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('pinnedTools', JSON.stringify(pinned));
  }, [pinned]);

  const tools = [
    { id: 'text-converter', name: 'Text Converter', icon: '🔄' },
    { id: 'string-utilities', name: 'String Utilities', icon: '🧵' },
    { id: 'number-converter', name: 'Number Converter', icon: '🔢' },
    { id: 'datetime-converter', name: 'DateTime Converter', icon: '🕒' },
    { id: 'jwt', name: 'JWT Debugger', icon: '🛡️' },
    { id: 'barcode', name: 'Barcode / QR Code', icon: '▣' },
    { id: 'data-generator', name: 'Data Generator', icon: '📊' },
    { id: 'code-formatter', name: 'Code Formatter', icon: '📝' },
    { id: 'color-converter', name: 'Color Converter', icon: '🎨' },
    { id: 'cron', name: 'Cron Job Parser', icon: '⏳' },
    { id: 'regexp', name: 'RegExp Tester', icon: '.*' },
    { id: 'diff', name: 'Text Diff Checker', icon: '⚖️' },
  ];

  const togglePin = (e, id) => {
    e.stopPropagation();
    if (pinned.includes(id)) {
      setPinned(pinned.filter((p) => p !== id));
    } else {
      setPinned([...pinned, id]);
    }
  };

  // Filtering
  let displayTools = tools.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()));

  // Split into Pinned and Regular
  const pinnedTools = displayTools.filter((t) => pinned.includes(t.id));
  const regularTools = displayTools.filter((t) => !pinned.includes(t.id));

  // Sort Alphabetically
  pinnedTools.sort((a, b) => a.name.localeCompare(b.name));
  regularTools.sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className={`sidebar ${!isVisible ? 'hidden' : ''}`}>
      {/* Search bar at the top */}
      <div style={{ padding: '12px 12px 8px' }}>
        <input
          type="text"
          placeholder="Search tools... (cmd+k for palette)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: '100%',
            padding: '8px 12px',
            fontSize: '13px',
            backgroundColor: 'var(--cds-field)',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            color: 'var(--cds-text-primary)',
          }}
        />
      </div>

      <div className="nav-scroll-area">
        {pinnedTools.length > 0 && (
          <>
            <div className="sidebar-section-header">
              <span>📌</span>
              <span>Pinned</span>
            </div>
            <ul className="nav-list">
              {pinnedTools.map((tool) => (
                <li key={tool.id} className="nav-item">
                  <NavLink
                    to={`/tool/${tool.id}`}
                    className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
                  >
                    <div className="nav-content">
                      <span className="nav-icon">{tool.icon}</span>
                      <span className="nav-text">{tool.name}</span>
                    </div>
                    {/* Unpin action on hover */}
                    <span
                      className="nav-action"
                      onClick={(e) => togglePin(e, tool.id)}
                      title="Unpin"
                    >
                      ✕
                    </span>
                  </NavLink>
                </li>
              ))}
            </ul>
            {regularTools.length > 0 && <div className="sidebar-separator"></div>}
          </>
        )}

        <ul className="nav-list">
          {regularTools.map((tool) => (
            <li key={tool.id} className="nav-item">
              <NavLink
                to={`/tool/${tool.id}`}
                className={({ isActive }) => `nav-button ${isActive ? 'active' : ''}`}
              >
                <div className="nav-content">
                  <span className="nav-icon">{tool.icon}</span>
                  <span className="nav-text">{tool.name}</span>
                </div>
                {/* Pin action on hover */}
                <span
                  className="nav-action"
                  onClick={(e) => togglePin(e, tool.id)}
                  title="Pin to top"
                >
                  📌
                </span>
              </NavLink>
            </li>
          ))}
        </ul>

        {regularTools.length === 0 && pinnedTools.length === 0 && (
          <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No tools found
          </div>
        )}
      </div>

      {/* Settings button at bottom */}
      <div className="sidebar-footer">
        <IconButton
          kind="ghost"
          size="sm"
          onClick={onOpenSettings}
          label="Settings"
          className="sidebar-settings-btn"
        >
          <Settings size={20} />
        </IconButton>
      </div>
    </div>
  );
}

export default Sidebar;

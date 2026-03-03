import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Close, Moon, Application, Power } from '@carbon/icons-react';
import './SpotlightPalette.css';

// Command definitions - simplified for spotlight
const COMMANDS = [
  // Code Formatter presets
  {
    id: 'formatter-json',
    label: 'Format JSON',
    path: '/tool/code-formatter?format=json',
    category: 'Formatter',
  },
  {
    id: 'formatter-xml',
    label: 'Format XML',
    path: '/tool/code-formatter?format=xml',
    category: 'Formatter',
  },
  {
    id: 'formatter-html',
    label: 'Format HTML',
    path: '/tool/code-formatter?format=html',
    category: 'Formatter',
  },
  {
    id: 'formatter-sql',
    label: 'Format SQL',
    path: '/tool/code-formatter?format=sql',
    category: 'Formatter',
  },
  {
    id: 'formatter-js',
    label: 'Format JavaScript',
    path: '/tool/code-formatter?format=javascript',
    category: 'Formatter',
  },

  // Text Converter - Encoding
  {
    id: 'converter-base64',
    label: 'Base64 Encode/Decode',
    path: '/tool/text-converter?category=Encode%20-%20Decode&method=Base64',
    category: 'Converter',
  },
  {
    id: 'converter-url',
    label: 'URL Encode/Decode',
    path: '/tool/text-converter?category=Encode%20-%20Decode&method=URL',
    category: 'Converter',
  },
  {
    id: 'converter-hex',
    label: 'Hex Encode/Decode',
    path: '/tool/text-converter?category=Encode%20-%20Decode&method=Base16%20(Hex)',
    category: 'Converter',
  },

  // Text Converter - Hashing
  {
    id: 'converter-md5',
    label: 'MD5 Hash',
    path: '/tool/text-converter?category=Hash&method=MD5',
    category: 'Hash',
  },
  {
    id: 'converter-sha256',
    label: 'SHA-256 Hash',
    path: '/tool/text-converter?category=Hash&method=SHA-256',
    category: 'Hash',
  },
  {
    id: 'converter-all-hashes',
    label: 'All Hashes',
    path: '/tool/text-converter?category=Hash&method=All',
    category: 'Hash',
  },

  // Text Converter - Conversions
  {
    id: 'converter-json-yaml',
    label: 'JSON ↔ YAML',
    path: '/tool/text-converter?category=Convert&method=JSON%20%E2%86%94%20YAML',
    category: 'Convert',
  },
  {
    id: 'converter-json-xml',
    label: 'JSON ↔ XML',
    path: '/tool/text-converter?category=Convert&method=JSON%20%E2%86%94%20XML',
    category: 'Convert',
  },
  {
    id: 'converter-markdown-html',
    label: 'Markdown ↔ HTML',
    path: '/tool/text-converter?category=Convert&method=Markdown%20%E2%86%94%20HTML',
    category: 'Convert',
  },

  // Direct navigation
  { id: 'jwt', label: 'JWT Debugger', path: '/tool/jwt', category: 'Tools' },
  { id: 'barcode', label: 'Barcode Generator', path: '/tool/barcode', category: 'Tools' },
  { id: 'regexp', label: 'RegExp Tester', path: '/tool/regexp', category: 'Tools' },
  { id: 'cron', label: 'Cron Job Parser', path: '/tool/cron', category: 'Tools' },
  { id: 'diff', label: 'Text Diff Checker', path: '/tool/diff', category: 'Tools' },
  { id: 'number', label: 'Number Converter', path: '/tool/number-converter', category: 'Tools' },
  { id: 'color', label: 'Color Converter', path: '/tool/color-converter', category: 'Tools' },
  { id: 'string', label: 'String Utilities', path: '/tool/string-utilities', category: 'Tools' },
  {
    id: 'datetime',
    label: 'DateTime Converter',
    path: '/tool/datetime-converter',
    category: 'Tools',
  },

  // Data Generator
  {
    id: 'data-user',
    label: 'Generate User Data',
    path: '/tool/data-generator?preset=User',
    category: 'Generator',
  },
  {
    id: 'data-address',
    label: 'Generate Address Data',
    path: '/tool/data-generator?preset=Address',
    category: 'Generator',
  },

  // System commands
  {
    id: 'theme-toggle',
    label: 'Toggle Dark Mode',
    action: 'toggle-theme',
    category: 'System',
    icon: Moon,
  },
  {
    id: 'window-toggle',
    label: 'Show/Hide Main Window',
    action: 'toggle-window',
    category: 'System',
    icon: Application,
  },
  { id: 'app-quit', label: 'Quit DevToolbox', action: 'quit', category: 'System', icon: Power },
];

export function SpotlightPalette() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commands, setCommands] = useState(COMMANDS);
  const [recentCommands, setRecentCommands] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('spotlightRecent')) || [];
    } catch {
      return [];
    }
  });
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const timeoutRef = useRef(null);

  // Fuzzy match function
  const fuzzyMatch = (target, query) => {
    if (!query) return true;
    const targetLower = target.toLowerCase();
    const queryLower = query.toLowerCase();
    let targetIndex = 0;
    let queryIndex = 0;
    while (targetIndex < targetLower.length && queryIndex < queryLower.length) {
      if (targetLower[targetIndex] === queryLower[queryIndex]) {
        queryIndex++;
      }
      targetIndex++;
    }
    return queryIndex === queryLower.length;
  };

  // Calculate fuzzy match score
  const fuzzyScore = (target, query) => {
    if (!query) return 0;
    const targetLower = target.toLowerCase();
    const queryLower = query.toLowerCase();
    if (targetLower === queryLower) return -1000;
    if (targetLower.startsWith(queryLower)) return -100;
    const words = targetLower.split(/[\s>]/);
    for (let word of words) {
      if (word.startsWith(queryLower)) return -50;
    }
    let targetIndex = 0;
    let queryIndex = 0;
    let score = 0;
    let lastMatchIndex = -1;
    while (targetIndex < targetLower.length && queryIndex < queryLower.length) {
      if (targetLower[targetIndex] === queryLower[queryIndex]) {
        if (lastMatchIndex !== -1) {
          score += targetIndex - lastMatchIndex - 1;
        }
        lastMatchIndex = targetIndex;
        queryIndex++;
      }
      targetIndex++;
    }
    if (queryIndex < queryLower.length) return 9999;
    return score;
  };

  // Filter commands based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      const recentIds = new Set(recentCommands);
      const sortedCommands = [...COMMANDS].sort((a, b) => {
        const aRecent = recentIds.has(a.id) ? 1 : 0;
        const bRecent = recentIds.has(b.id) ? 1 : 0;
        return bRecent - aRecent;
      });
      setCommands(sortedCommands);
      return;
    }
    const query = searchQuery.toLowerCase();
    const scored = COMMANDS.map((cmd) => {
      const labelScore = fuzzyScore(cmd.label, query);
      const categoryScore = fuzzyScore(cmd.category, query);
      const bestScore = Math.min(labelScore, categoryScore);
      return { cmd, score: bestScore };
    }).filter((item) => item.score < 9999);
    scored.sort((a, b) => a.score - b.score);
    setCommands(scored.map((item) => item.cmd));
    setSelectedIndex(0);
  }, [searchQuery, recentCommands]);

  // Focus input on mount
  useEffect(() => {
    timeoutRef.current = setTimeout(() => inputRef.current?.focus(), 100);
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Listen for spotlight opened event
  useEffect(() => {
    const unsubscribe = window.runtime?.EventsOn?.('spotlight:opened', () => {
      setSearchQuery('');
      setSelectedIndex(0);
      timeoutRef.current = setTimeout(() => inputRef.current?.focus(), 100);
    });
    return () => {
      if (unsubscribe) unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Save recent command
  const saveRecentCommand = useCallback((commandId) => {
    setRecentCommands((prev) => {
      const updated = [commandId, ...prev.filter((id) => id !== commandId)].slice(0, 10);
      localStorage.setItem('spotlightRecent', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // Execute command
  const executeCommand = useCallback(
    (command) => {
      saveRecentCommand(command.id);

      if (command.action) {
        switch (command.action) {
          case 'toggle-theme':
            // Emit to main window
            window.runtime?.EventsEmit?.('theme:toggle');
            break;
          case 'toggle-window':
            window.runtime?.EventsEmit?.('window:toggle');
            break;
          case 'quit':
            window.runtime?.EventsEmit?.('app:quit');
            break;
          default:
            break;
        }
      } else if (command.path) {
        // Emit command selected event with path
        window.runtime?.EventsEmit?.('spotlight:command-selected', command.path);
      }

      // Close spotlight
      window.runtime?.EventsEmit?.('spotlight:close');
    },
    [saveRecentCommand]
  );

  // Handle input change
  const handleInputChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % commands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + commands.length) % commands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (commands[selectedIndex]) {
          executeCommand(commands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        window.runtime?.EventsEmit?.('spotlight:close');
      }
    },
    [commands, selectedIndex, executeCommand]
  );

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.children[selectedIndex];
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  return (
    <div className="spotlight-container">
      <div className="spotlight-search-box">
        <Search size={20} className="spotlight-search-icon" />
        <input
          ref={inputRef}
          type="text"
          className="spotlight-input"
          placeholder="Search tools..."
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          autoComplete="off"
        />
        {searchQuery && (
          <button className="spotlight-clear-btn" onClick={() => setSearchQuery('')}>
            <Close size={16} />
          </button>
        )}
      </div>

      <div className="spotlight-results">
        {commands.length === 0 ? (
          <div className="spotlight-empty">No commands found matching "{searchQuery}"</div>
        ) : (
          <div ref={listRef} className="spotlight-list" role="listbox" aria-label="Search results">
            {commands.map((command, index) => {
              const Icon = command.icon || null;
              return (
                <div
                  key={command.id}
                  className={`spotlight-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => executeCommand(command)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  role="option"
                  aria-selected={index === selectedIndex}
                >
                  <div className="spotlight-item-content">
                    {Icon && <Icon size={16} className="spotlight-item-icon" />}
                    <span className="spotlight-item-label">{command.label}</span>
                  </div>
                  <span className="spotlight-item-category">{command.category}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

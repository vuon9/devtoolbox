import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Close, Moon, Application, Power } from '@carbon/icons-react';
import { TextInput } from '@carbon/react';
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
    id: 'formatter-css',
    label: 'Format CSS',
    path: '/tool/code-formatter?format=css',
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
    label: 'URL Encode',
    path: '/tool/text-converter?category=Encode%20-%20Decode&method=URL',
    category: 'Converter',
  },
  {
    id: 'converter-hex',
    label: 'Hex Encode/Decode',
    path: '/tool/text-converter?category=Encode%20-%20Decode&method=Base16%20(Hex)',
    category: 'Converter',
  },
  {
    id: 'converter-html',
    label: 'HTML Entities',
    path: '/tool/text-converter?category=Encode%20-%20Decode&method=HTML%20Entities',
    category: 'Converter',
  },

  // Text Converter - Hashing
  {
    id: 'converter-md5',
    label: 'MD5 Hash',
    path: '/tool/text-converter?category=Hash&method=MD5',
    category: 'Converter',
  },
  {
    id: 'converter-sha256',
    label: 'SHA-256 Hash',
    path: '/tool/text-converter?category=Hash&method=SHA-256',
    category: 'Converter',
  },
  {
    id: 'converter-sha512',
    label: 'SHA-512 Hash',
    path: '/tool/text-converter?category=Hash&method=SHA-512',
    category: 'Converter',
  },
  {
    id: 'converter-all-hashes',
    label: 'All Hashes',
    path: '/tool/text-converter?category=Hash&method=All',
    category: 'Converter',
  },

  // Text Converter - Conversions
  {
    id: 'converter-json-yaml',
    label: 'JSON to YAML',
    path: '/tool/text-converter?category=Convert&method=JSON%20%E2%86%94%20YAML',
    category: 'Converter',
  },
  {
    id: 'converter-json-xml',
    label: 'JSON to XML',
    path: '/tool/text-converter?category=Convert&method=JSON%20%E2%86%94%20XML',
    category: 'Converter',
  },
  {
    id: 'converter-markdown-html',
    label: 'Markdown to HTML',
    path: '/tool/text-converter?category=Convert&method=Markdown%20%E2%86%94%20HTML',
    category: 'Converter',
  },
  {
    id: 'converter-csv-tsv',
    label: 'CSV to TSV',
    path: '/tool/text-converter?category=Convert&method=CSV%20%E2%86%94%20TSV',
    category: 'Converter',
  },
  {
    id: 'converter-case-swap',
    label: 'Case Swap',
    path: '/tool/text-converter?category=Convert&method=Case%20Swapping',
    category: 'Converter',
  },

  // Direct navigation - no presets
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
  { id: 'text', label: 'Text Converter', path: '/tool/text-converter', category: 'Tools' },

  // Data Generator presets
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
    label: 'Show/Hide Window',
    action: 'toggle-window',
    category: 'System',
    icon: Application,
  },
  { id: 'app-quit', label: 'Quit DevToolbox', action: 'quit', category: 'System', icon: Power },
];

export function SpotlightPalette() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commands, setCommands] = useState(COMMANDS);
  const [isVisible, setIsVisible] = useState(false);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Load recent commands from localStorage
  const [recentCommands, setRecentCommands] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('spotlightRecent')) || [];
    } catch {
      return [];
    }
  });

  // Listen for spotlight open/close events from Go
  useEffect(() => {
    const handleSpotlightOpen = () => {
      setIsVisible(true);
      setSearchQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    };

    const handleSpotlightClose = () => {
      setIsVisible(false);
      setSearchQuery('');
    };

    // Listen for Wails events
    window.runtime?.EventsOn?.('spotlight:opened', handleSpotlightOpen);
    window.runtime?.EventsOn?.('spotlight:closed', handleSpotlightClose);

    return () => {
      window.runtime?.EventsOff?.('spotlight:opened', handleSpotlightOpen);
      window.runtime?.EventsOff?.('spotlight:closed', handleSpotlightClose);
    };
  }, []);

  // Fuzzy match function - checks if query characters appear in order in target
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

  // Calculate fuzzy match score (lower is better)
  const fuzzyScore = (target, query) => {
    if (!query) return 0;

    const targetLower = target.toLowerCase();
    const queryLower = query.toLowerCase();

    // Exact match gets highest priority
    if (targetLower === queryLower) return -1000;

    // Starts with query gets high priority
    if (targetLower.startsWith(queryLower)) return -100;

    // Word boundary match gets medium priority
    const words = targetLower.split(/[\s>]/);
    for (let word of words) {
      if (word.startsWith(queryLower)) return -50;
    }

    // Calculate distance score for fuzzy match
    let targetIndex = 0;
    let queryIndex = 0;
    let score = 0;
    let lastMatchIndex = -1;

    while (targetIndex < targetLower.length && queryIndex < queryLower.length) {
      if (targetLower[targetIndex] === queryLower[queryIndex]) {
        if (lastMatchIndex !== -1) {
          // Penalize gaps between matches
          score += targetIndex - lastMatchIndex - 1;
        }
        lastMatchIndex = targetIndex;
        queryIndex++;
      }
      targetIndex++;
    }

    // If didn't match all query characters, return high score (bad match)
    if (queryIndex < queryLower.length) return 9999;

    return score;
  };

  // Filter commands based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      // Show recent commands first when no search query
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

    // Filter and score commands
    const scored = COMMANDS.map((cmd) => {
      const labelScore = fuzzyScore(cmd.label, query);
      const categoryScore = fuzzyScore(cmd.category, query);
      const bestScore = Math.min(labelScore, categoryScore);
      return { cmd, score: bestScore };
    }).filter((item) => item.score < 9999);

    // Sort by score (lower is better)
    scored.sort((a, b) => a.score - b.score);

    setCommands(scored.map((item) => item.cmd));
    setSelectedIndex(0);
  }, [searchQuery, recentCommands]);

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

  if (!isVisible) {
    return null;
  }

  return (
    <div className="spotlight-overlay">
      <div className="spotlight-container">
        <div className="spotlight-header">
          <Search size={20} className="spotlight-search-icon" />
          <TextInput
            ref={inputRef}
            id="spotlight-input"
            labelText="Search tools"
            placeholder="Search tools or commands..."
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            hideLabel
            className="spotlight-input"
            autoComplete="off"
          />
          <div className="spotlight-shortcuts">
            <kbd>↑↓</kbd>
            <kbd>Enter</kbd>
            <kbd>Esc</kbd>
          </div>
        </div>
        <div className="spotlight-body">
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
    </div>
  );
}

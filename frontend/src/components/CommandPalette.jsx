import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Close, Application, Moon, Power } from '@carbon/icons-react';
import { TextInput, ComposedModal, ModalHeader, ModalBody } from '@carbon/react';
import './CommandPalette.css';

// Command definitions with tool presets
const COMMANDS = [
  // Code Formatter presets
  {
    id: 'formatter-json',
    label: 'Code Formatter > JSON',
    path: '/tool/code-formatter?format=json',
    category: 'Formatter',
  },
  {
    id: 'formatter-xml',
    label: 'Code Formatter > XML',
    path: '/tool/code-formatter?format=xml',
    category: 'Formatter',
  },
  {
    id: 'formatter-html',
    label: 'Code Formatter > HTML',
    path: '/tool/code-formatter?format=html',
    category: 'Formatter',
  },
  {
    id: 'formatter-sql',
    label: 'Code Formatter > SQL',
    path: '/tool/code-formatter?format=sql',
    category: 'Formatter',
  },
  {
    id: 'formatter-css',
    label: 'Code Formatter > CSS',
    path: '/tool/code-formatter?format=css',
    category: 'Formatter',
  },
  {
    id: 'formatter-js',
    label: 'Code Formatter > JavaScript',
    path: '/tool/code-formatter?format=javascript',
    category: 'Formatter',
  },

  // Text Converter - Encoding
  {
    id: 'converter-base64',
    label: 'Text Converter > Base64',
    path: '/tool/text-converter?category=Encode%20-%20Decode&method=Base64',
    category: 'Converter',
  },
  {
    id: 'converter-url',
    label: 'Text Converter > URL Encode',
    path: '/tool/text-converter?category=Encode%20-%20Decode&method=URL',
    category: 'Converter',
  },
  {
    id: 'converter-hex',
    label: 'Text Converter > Hex',
    path: '/tool/text-converter?category=Encode%20-%20Decode&method=Base16%20(Hex)',
    category: 'Converter',
  },
  {
    id: 'converter-html',
    label: 'Text Converter > HTML Entities',
    path: '/tool/text-converter?category=Encode%20-%20Decode&method=HTML%20Entities',
    category: 'Converter',
  },

  // Text Converter - Hashing
  {
    id: 'converter-md5',
    label: 'Text Converter > MD5',
    path: '/tool/text-converter?category=Hash&method=MD5',
    category: 'Converter',
  },
  {
    id: 'converter-sha256',
    label: 'Text Converter > SHA-256',
    path: '/tool/text-converter?category=Hash&method=SHA-256',
    category: 'Converter',
  },
  {
    id: 'converter-sha512',
    label: 'Text Converter > SHA-512',
    path: '/tool/text-converter?category=Hash&method=SHA-512',
    category: 'Converter',
  },
  {
    id: 'converter-all-hashes',
    label: 'Text Converter > All Hashes',
    path: '/tool/text-converter?category=Hash&method=All',
    category: 'Converter',
  },

  // Text Converter - Conversions
  {
    id: 'converter-json-yaml',
    label: 'Text Converter > JSON ↔ YAML',
    path: '/tool/text-converter?category=Convert&method=JSON%20%E2%86%94%20YAML',
    category: 'Converter',
  },
  {
    id: 'converter-json-xml',
    label: 'Text Converter > JSON ↔ XML',
    path: '/tool/text-converter?category=Convert&method=JSON%20%E2%86%94%20XML',
    category: 'Converter',
  },
  {
    id: 'converter-markdown-html',
    label: 'Text Converter > Markdown ↔ HTML',
    path: '/tool/text-converter?category=Convert&method=Markdown%20%E2%86%94%20HTML',
    category: 'Converter',
  },
  {
    id: 'converter-csv-tsv',
    label: 'Text Converter > CSV ↔ TSV',
    path: '/tool/text-converter?category=Convert&method=CSV%20%E2%86%94%20TSV',
    category: 'Converter',
  },
  {
    id: 'converter-case-swap',
    label: 'Text Converter > Case Swap',
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

  // Data Generator presets (these will be populated dynamically)
  {
    id: 'data-user',
    label: 'Data Generator > User',
    path: '/tool/data-generator?preset=User',
    category: 'Generator',
  },
  {
    id: 'data-address',
    label: 'Data Generator > Address',
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

export function CommandPalette({ isOpen, onClose, themeMode, setThemeMode }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [commands, setCommands] = useState(COMMANDS);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Load recent commands from localStorage
  const [recentCommands, setRecentCommands] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('commandPaletteRecent')) || [];
    } catch {
      return [];
    }
  });

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

  // Reset selection when opening
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedIndex(0);
      // Focus input after modal opens
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Save recent command
  const saveRecentCommand = useCallback((commandId) => {
    setRecentCommands((prev) => {
      const updated = [commandId, ...prev.filter((id) => id !== commandId)].slice(0, 10);
      localStorage.setItem('commandPaletteRecent', JSON.stringify(updated));
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
            setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
            break;
          case 'toggle-window':
            if (window.wails?.WindowHide) {
              window.wails.WindowHide();
            }
            break;
          case 'quit':
            if (window.wails?.Quit) {
              window.wails.Quit();
            }
            break;
          default:
            break;
        }
      } else if (command.path) {
        navigate(command.path);
      }

      onClose();
    },
    [navigate, onClose, themeMode, setThemeMode, saveRecentCommand]
  );

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
        onClose();
      }
    },
    [commands, selectedIndex, executeCommand, onClose]
  );

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.children[selectedIndex];
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  return (
    <ComposedModal
      open={isOpen}
      onClose={onClose}
      size="sm"
      className="command-palette-modal"
      onKeyDown={handleKeyDown}
    >
      <ModalHeader className="command-palette-header">
        <Search size={20} className="command-palette-search-icon" />
        <TextInput
          ref={inputRef}
          id="command-palette-input"
          labelText="Search commands"
          placeholder="Search tools or commands... (cmd+k)"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          hideLabel
          className="command-palette-input"
          autoComplete="off"
        />
        <div className="command-palette-shortcuts">
          <kbd>↑↓</kbd>
          <kbd>Enter</kbd>
          <kbd>Esc</kbd>
        </div>
      </ModalHeader>
      <ModalBody className="command-palette-body">
        {commands.length === 0 ? (
          <div className="command-palette-empty">No commands found matching "{searchQuery}"</div>
        ) : (
          <div ref={listRef} className="command-palette-list">
            {commands.map((command, index) => {
              const Icon = command.icon || null;
              return (
                <div
                  key={command.id}
                  className={`command-palette-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => executeCommand(command)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="command-palette-item-content">
                    {Icon && <Icon size={16} className="command-palette-item-icon" />}
                    <span className="command-palette-item-label">{command.label}</span>
                  </div>
                  <span className="command-palette-item-category">{command.category}</span>
                </div>
              );
            })}
          </div>
        )}
      </ModalBody>
    </ComposedModal>
  );
}

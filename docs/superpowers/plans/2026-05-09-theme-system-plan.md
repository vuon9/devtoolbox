# Theme System Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add VS Code-style holistic theme system — app UI chrome + code syntax highlighting — with light mode, system detection, and a gallery of 8 themes (2 built-in + 6 curated).

**Architecture:** Single `ThemeContext` drives all theming via CSS custom properties. Built-in themes use Radix Colors CSS + `.dark` class. Gallery themes apply colors via JS `style.setProperty()`. `localStorage.themeMode` stores the single selection (`"system"` | theme name). CodeMirror editors consume a `HighlightStyle` from context.

**Tech Stack:** Radix Colors + CSS custom properties + Tailwind v4 `@theme` + React Context + CodeMirror 6

---

## File Structure

```
frontend/src/
├── App.jsx                                       # Remove inline colors, wrap ThemeProvider
├── globals.css                                   # Add @theme, Radix Colors imports, @custom-variant dark
├── context/
│   └── ThemeContext.jsx                          # NEW: ThemeProvider + useTheme hook
├── theme/
│   ├── index.js                                  # NEW: configureTheme, THEMES registry
│   ├── builtins.js                               # NEW: GitHub Dark + Light theme objects
│   ├── one-dark-pro.js                           # NEW
│   ├── dracula.js                                # NEW
│   ├── nord.js                                   # NEW
│   ├── catppuccin-mocha.js                       # NEW
│   ├── solarized-dark.js                         # NEW
│   ├── solarized-light.js                        # NEW
│   └── scope-mapping.js                          # NEW: VS Code scope → Lezer tag
├── components/
│   ├── SettingsModal.jsx                         # REWRITE: Carbon → Radix Dialog + RadioGroup + Select
│   ├── CommandPalette.jsx                        # UPDATE: theme switch commands
│   ├── Sidebar.jsx                               # MIGRATE: inline hex → CSS vars
│   ├── TitleBar.jsx                              # MIGRATE: inline hex → CSS vars
│   ├── ui/Button.jsx                             # MIGRATE: inline hex → Tailwind classes
│   └── inputs/
│       ├── carbonCodeMirrorTheme.js               # DELETE
│       ├── CodeEditor.jsx                        # UPDATE: consume theme from context
│       └── HighlightedCode.jsx                   # UPDATE: consume theme from context
├── pages/
│   ├── CodeFormatter/index.jsx                   # REWRITE: Prism → HighlightedCode
│   ├── CodeEncoder/index.jsx                     # MIGRATE: textarea → CodeEditor/HighlightedCode
│   ├── CodeEncrypter/index.jsx                   # MIGRATE: textarea → CodeEditor/HighlightedCode
│   ├── HashGenerator/index.jsx                   # MIGRATE: textarea → CodeEditor/HighlightedCode
│   ├── CodeConverter/index.jsx                   # MIGRATE: textarea → CodeEditor/HighlightedCode
│   ├── TextUtilities/index.jsx                   # MIGRATE: textarea → CodeEditor/HighlightedCode
│   ├── JwtDebugger/index.jsx                     # MIGRATE + Carbon icons → Lucide
│   ├── NumberConverter/ConversionCard.jsx        # MIGRATE: Carbon TextInput → input.jsx
│   ├── NumberConverter/index.jsx                 # MIGRATE: textarea → CodeEditor
│   ├── DataGenerator/index.jsx                   # MIGRATE: textarea → CodeEditor
│   ├── DateTimeConverter/index.jsx               # MIGRATE: textarea → CodeEditor (number fields unchanged)
│   ├── ColorConverter/index.jsx                  # MIGRATE: textarea → CodeEditor
│   ├── RegExpTester.jsx                          # MIGRATE: textarea → CodeEditor
│   ├── CronJobParser.jsx                         # MIGRATE: textarea → CodeEditor
│   ├── BarcodeGenerator.jsx                      # MIGRATE: textarea → CodeEditor
│   └── TextDiffChecker/index.jsx                 # MIGRATE: textarea → CodeEditor
├── spotlight.css                                  # UPDATE: forced dark → theme vars
├── index.scss                                     # DELETE
├── style.css                                      # DELETE
├── App.css                                        # DELETE
└── e2e/theme.spec.js                              # NEW: 15 E2E theme scenarios

dep: ADD: @radix-ui/react-dialog, @radix-ui/react-radio-group
dep: REMOVE: @carbon/react, @carbon/styles, @carbon/icons-react, prismjs
```

### Task Dependency Graph

```
Task 1 (deps install)
  ├── Task 2 (globals.css + Radix Colors)
  │     ├── Task 3 (Theme definitions)
  │     │     └── Task 4 (scope-mapping)
  │     └── Task 5 (ThemeContext)
  │           ├── Task 6 (App.jsx wrapper)
  │           │     ├── Task 8 (Sidebar)
  │           │     ├── Task 9 (TitleBar)
  │           │     ├── Task 10 (Button)
  │           │     └── Task 11 (CodeEditor + HighlightedCode)
  │           └── Task 7 (SettingsModal)
  │                 └── Task 12 (CommandPalette)
  ├── Task 13 (Delete Carbon files + deps)
  │     ├── Task 14 (ConversionCard + StatusMessages)
  │     └── Task 15 (CodeFormatter Prism→HighlightedCode)
  └── Task 16-31 (Tool textarea→CodeEditor, one per tool)
```

---

### Task 1: Install new Radix packages + remove Carbon deps

**Files:**
- Modify: `frontend/package.json`
- Run: `bun install`

- [ ] **Step 1: Add and remove dependencies**

```bash
cd frontend
bun add @radix-ui/react-dialog @radix-ui/react-radio-group
bun remove @carbon/react @carbon/styles @carbon/icons-react prismjs
```

List the 3 new Carbon-dependent components that need rewriting (SettingsModal, ConversionCard, StatusMessages) — these will be handled in later tasks.

- [ ] **Step 2: Commit**

```bash
git add frontend/package.json frontend/bun.lock
git commit -m "build: install radix dialog+radiogroup, remove carbon deps and prismjs"
```

---

### Task 2: Set up CSS layer — Radix Colors + @theme block + dark variant

**Files:**
- Modify: `frontend/src/globals.css`

Radix Colors CSS files provide the light/dark variable scales. The `@theme` block maps our shadcn-style tokens to Tailwind utilities. A `@custom-variant dark` powers the `dark:` modifier via `.dark` class.

- [ ] **Step 1: Write globals.css with Radix Colors + @theme**

```css
@import 'tailwindcss';

/* Radix Colors — pick neutral gray + blue as primary + red/green for semantic */
@import '@radix-ui/colors/gray.css';
@import '@radix-ui/colors/gray-dark.css';
@import '@radix-ui/colors/blue.css';
@import '@radix-ui/colors/blue-dark.css';
@import '@radix-ui/colors/red.css';
@import '@radix-ui/colors/red-dark.css';
@import '@radix-ui/colors/green.css';
@import '@radix-ui/colors/green-dark.css';

@source "./**/*.jsx";
@source "./**/*.js";
@source "./**/*.tsx";
@source "./**/*.ts";
@source "../index.html";

/* Tailwind dark variant — class-based */
@custom-variant dark (&:where(.dark, .dark *));

/* Light theme (default) */
:root {
  --background: var(--gray-1);
  --foreground: var(--gray-12);
  --card: var(--gray-2);
  --card-foreground: var(--gray-12);
  --popover: var(--gray-2);
  --popover-foreground: var(--gray-12);
  --primary: var(--blue-9);
  --primary-foreground: white;
  --secondary: var(--gray-3);
  --secondary-foreground: var(--gray-12);
  --muted: var(--gray-3);
  --muted-foreground: var(--gray-11);
  --accent: var(--blue-3);
  --accent-foreground: var(--blue-12);
  --destructive: var(--red-9);
  --destructive-foreground: white;
  --border: var(--gray-6);
  --input: var(--gray-3);
  --ring: var(--blue-9);
  --success: var(--green-9);
  --warning: #e5c07b;

  /* Component-specific tokens */
  --sidebar-background: var(--gray-2);
  --sidebar-foreground: var(--gray-12);
  --sidebar-accent: var(--blue-9);
  --titlebar-background: var(--gray-2);
  --scrollbar-thumb: var(--gray-7);
  --scrollbar-track: transparent;
}

/* Dark theme overrides — Radix Colors auto-switches gray-* values in .dark */
.dark {
  --background: var(--gray-1);
  --foreground: var(--gray-12);
  --card: var(--gray-2);
  --card-foreground: var(--gray-12);
  --popover: var(--gray-2);
  --popover-foreground: var(--gray-12);
  --primary: var(--blue-9);
  --primary-foreground: white;
  --secondary: var(--gray-3);
  --secondary-foreground: var(--gray-12);
  --muted: var(--gray-3);
  --muted-foreground: var(--gray-11);
  --accent: var(--blue-3);
  --accent-foreground: var(--blue-12);
  --destructive: var(--red-9);
  --destructive-foreground: white;
  --border: var(--gray-6);
  --input: var(--gray-3);
  --ring: var(--blue-9);
  --success: var(--green-9);
  --warning: #e5c07b;

  --sidebar-background: var(--gray-2);
  --sidebar-foreground: var(--gray-12);
  --sidebar-accent: var(--blue-9);
  --titlebar-background: var(--gray-2);
  --scrollbar-thumb: var(--gray-7);
  --scrollbar-track: transparent;
}

/* @theme block maps tokens to Tailwind utilities */
@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-success: var(--success);
  --color-warning: var(--warning);
}

/* Scrollbar using theme variables */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: var(--scrollbar-track); }
::-webkit-scrollbar-thumb { background-color: var(--scrollbar-thumb); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background-color: var(--gray-8); }
* { scrollbar-width: thin; scrollbar-color: var(--scrollbar-thumb) var(--scrollbar-track); }
```

- [ ] **Step 2: Remove `import './App.css'` from App.jsx**

Remove line 9 in `App.jsx`: `import './App.css';`

- [ ] **Step 3: Commit**

```bash
git add frontend/src/globals.css frontend/src/App.jsx
git commit -m "feat: set up Radix Colors with @theme block and class-based dark mode"
```

---

### Task 3: Create theme definition files

**Files:**
- Create: `frontend/src/theme/`
- All 8 theme definition files + barrel index

Each theme is a JS object with `name`, `type`, `colors`, and `tokenColors`. Built-in themes (`builtins.js`) also export default values for non-gallery use.

- [ ] **Step 1: Create `frontend/src/theme/scope-mapping.js`**

```js
import { tags as t } from '@lezer/highlight';

export const SCOPE_TO_TAG = {
  keyword:          t.keyword,
  string:           t.string,
  number:           t.number,
  comment:          t.blockComment,
  type:             t.typeName,
  function:         t.function(t.variableName),
  variable:         t.variableName,
  operator:         t.operator,
  punctuation:      t.punctuation,
  tag:              t.tagName,
  attribute:        t.attributeName,
  property:         t.propertyName,
  constant:         t.constant(t.variableName),
  bool:             t.bool,
  'null':           t.null,
  class:            t.className,
  'definition':     t.definitionModifier,
};
```

- [ ] **Step 2: Create `frontend/src/theme/builtins.js`**

```js
export const THEMES = {
  'github-dark': {
    name: 'GitHub Dark',
    type: 'dark',
    isBuiltIn: true,
    colors: {
      background: 'var(--gray-1)',
      foreground: 'var(--gray-12)',
      card: 'var(--gray-2)',
      'card-foreground': 'var(--gray-12)',
      popover: 'var(--gray-2)',
      'popover-foreground': 'var(--gray-12)',
      primary: 'var(--blue-9)',
      'primary-foreground': 'white',
      secondary: 'var(--gray-3)',
      'secondary-foreground': 'var(--gray-12)',
      muted: 'var(--gray-3)',
      'muted-foreground': 'var(--gray-11)',
      accent: 'var(--gray-4)',
      'accent-foreground': 'var(--gray-12)',
      destructive: 'var(--red-9)',
      'destructive-foreground': 'white',
      border: 'var(--gray-6)',
      input: 'var(--gray-3)',
      ring: 'var(--blue-9)',
      success: 'var(--green-9)',
      warning: '#e5c07b',
      'sidebar-background': 'var(--gray-2)',
      'sidebar-foreground': 'var(--gray-12)',
      'sidebar-accent': 'var(--blue-9)',
      'titlebar-background': 'var(--gray-2)',
      'scrollbar-thumb': 'var(--gray-7)',
      'scrollbar-track': 'transparent',
    },
    tokenColors: [
      { scope: 'keyword', color: '#d73a49' },
      { scope: 'string', color: '#032f62' },
      { scope: 'number', color: '#005cc5' },
      { scope: 'comment', color: '#6a737d' },
      { scope: 'type', color: '#6f42c1' },
      { scope: 'function', color: '#6f42c1' },
      { scope: 'variable', color: '#e36209' },
      { scope: 'operator', color: '#d73a49' },
      { scope: 'punctuation', color: '#24292e' },
      { scope: 'tag', color: '#22863a' },
      { scope: 'attribute', color: '#6f42c1' },
      { scope: 'property', color: '#005cc5' },
      { scope: 'constant', color: '#005cc5' },
      { scope: 'bool', color: '#005cc5' },
      { scope: 'null', color: '#005cc5' },
      { scope: 'class', color: '#6f42c1' },
      { scope: 'definition', color: '#6f42c1' },
    ],
  },
  'github-light': {
    name: 'GitHub Light',
    type: 'light',
    isBuiltIn: true,
    colors: {
      background: 'var(--gray-1)',
      foreground: 'var(--gray-12)',
      card: 'var(--gray-2)',
      'card-foreground': 'var(--gray-12)',
      popover: 'var(--gray-2)',
      'popover-foreground': 'var(--gray-12)',
      primary: 'var(--blue-9)',
      'primary-foreground': 'white',
      secondary: 'var(--gray-3)',
      'secondary-foreground': 'var(--gray-12)',
      muted: 'var(--gray-3)',
      'muted-foreground': 'var(--gray-11)',
      accent: 'var(--gray-4)',
      'accent-foreground': 'var(--gray-12)',
      destructive: 'var(--red-9)',
      'destructive-foreground': 'white',
      border: 'var(--gray-6)',
      input: 'var(--gray-3)',
      ring: 'var(--blue-9)',
      success: 'var(--green-9)',
      warning: '#e5c07b',
      'sidebar-background': 'var(--gray-2)',
      'sidebar-foreground': 'var(--gray-12)',
      'sidebar-accent': 'var(--blue-9)',
      'titlebar-background': 'var(--gray-2)',
      'scrollbar-thumb': 'var(--gray-7)',
      'scrollbar-track': 'transparent',
    },
    // GitHub Light syntax colors (always hex, never var() — used for CodeMirror)
    tokenColors: [
      { scope: 'keyword', color: '#d73a49' },
      { scope: 'string', color: '#032f62' },
      { scope: 'number', color: '#005cc5' },
      { scope: 'comment', color: '#6a737d' },
      { scope: 'type', color: '#6f42c1' },
      { scope: 'function', color: '#6f42c1' },
      { scope: 'variable', color: '#e36209' },
      { scope: 'operator', color: '#d73a49' },
      { scope: 'punctuation', color: '#24292e' },
      { scope: 'tag', color: '#22863a' },
      { scope: 'attribute', color: '#6f42c1' },
      { scope: 'property', color: '#005cc5' },
      { scope: 'constant', color: '#005cc5' },
      { scope: 'bool', color: '#005cc5' },
      { scope: 'null', color: '#005cc5' },
      { scope: 'class', color: '#6f42c1' },
      { scope: 'definition', color: '#6f42c1' },
    ],
  },
};
```

- [ ] **Step 3: Create 6 gallery theme files**

Each file follows the same pattern. Example for `frontend/src/theme/one-dark-pro.js`:

```js
export default {
  name: 'One Dark Pro',
  type: 'dark',
  isBuiltIn: false,
  colors: {
    background: '#282c34',
    foreground: '#abb2bf',
    card: '#2c323c',
    'card-foreground': '#abb2bf',
    popover: '#2c323c',
    'popover-foreground': '#abb2bf',
    primary: '#61afef',
    'primary-foreground': '#ffffff',
    secondary: '#3b4048',
    'secondary-foreground': '#abb2bf',
    muted: '#3b4048',
    'muted-foreground': '#818896',
    accent: '#61afef',
    'accent-foreground': '#ffffff',
    destructive: '#e06c75',
    'destructive-foreground': '#ffffff',
    border: '#3b4048',
    input: '#3b4048',
    ring: '#61afef',
    success: '#98c379',
    'success-foreground': '#ffffff',
    warning: '#e5c07b',
    'warning-foreground': '#282c34',
    'sidebar-background': '#21252b',
    'sidebar-foreground': '#abb2bf',
    'sidebar-accent': '#61afef',
    'titlebar-background': '#21252b',
    'scrollbar-thumb': '#3b4048',
    'scrollbar-track': '#21252b',
  },
  tokenColors: [
    { scope: 'keyword',       color: '#c678dd' },
    { scope: 'string',        color: '#98c379' },
    { scope: 'number',        color: '#d19a66' },
    { scope: 'comment',       color: '#5c6370' },
    { scope: 'type',          color: '#e5c07b' },
    { scope: 'function',      color: '#61afef' },
    { scope: 'variable',      color: '#e06c75' },
    { scope: 'operator',      color: '#56b6c2' },
    { scope: 'punctuation',   color: '#abb2bf' },
    { scope: 'tag',           color: '#e06c75' },
    { scope: 'attribute',     color: '#d19a66' },
    { scope: 'property',      color: '#61afef' },
    { scope: 'constant',      color: '#d19a66' },
    { scope: 'bool',          color: '#d19a66' },
    { scope: 'null',          color: '#d19a66' },
    { scope: 'class',         color: '#e5c07b' },
    { scope: 'definition',    color: '#61afef' },
  ],
};
```

Create these 6 files with their respective colors:
- `frontend/src/theme/one-dark-pro.js` — One Dark Pro colors (shown above)
- `frontend/src/theme/dracula.js` — Dracula theme (background: #282a36, foreground: #f8f8f2, pink accents)
- `frontend/src/theme/nord.js` — Nord theme (background: #2e3440, foreground: #d8dee9, frost blue accents)
- `frontend/src/theme/catppuccin-mocha.js` — Catppuccin Mocha (background: #1e1e2e, foreground: #cdd6f4, mauve accents)
- `frontend/src/theme/solarized-dark.js` — Solarized Dark (background: #002b36, foreground: #839496, teal accents)
- `frontend/src/theme/solarized-light.js` — Solarized Light (background: #fdf6e3, foreground: #657b83, yellow accents)

Each file exports a `default` object with the same structure (name, type, isBuiltIn: false, colors, tokenColors).

- [ ] **Step 4: Create `frontend/src/theme/index.js` barrel**

```js
import { THEMES as builtins } from './builtins';
import oneDarkPro from './one-dark-pro';
import dracula from './dracula';
import nord from './nord';
import catppuccinMocha from './catppuccin-mocha';
import solarizedDark from './solarized-dark';
import solarizedLight from './solarized-light';

export const THEME_TOKENS = [
  'background', 'foreground', 'card', 'card-foreground',
  'popover', 'popover-foreground', 'primary', 'primary-foreground',
  'secondary', 'secondary-foreground', 'muted', 'muted-foreground',
  'accent', 'accent-foreground', 'destructive', 'destructive-foreground',
  'border', 'input', 'ring', 'success', 'success-foreground',
  'warning', 'warning-foreground',
  'sidebar-background', 'sidebar-foreground', 'sidebar-accent',
  'titlebar-background', 'scrollbar-thumb', 'scrollbar-track',
];

export const BUILT_IN_THEME_KEYS = ['github-dark', 'github-light'];

export const allThemes = [
  builtins['github-dark'],
  builtins['github-light'],
  oneDarkPro,
  dracula,
  nord,
  catppuccinMocha,
  solarizedDark,
  solarizedLight,
];

export function getThemeByKey(key) {
  if (builtins[key]) return builtins[key];
  return allThemes.find(t => t.name.toLowerCase().replace(/\s+/g, '-') === key);
}

export function resolveTheme(themeMode) {
  if (themeMode === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return {
      theme: prefersDark ? builtins['github-dark'] : builtins['github-light'],
      actualType: prefersDark ? 'dark' : 'light',
    };
  }
  const theme = getThemeByKey(themeMode);
  if (theme) return { theme, actualType: theme.type };
  // Fallback
  return { theme: builtins['github-dark'], actualType: 'dark' };
}
```

- [ ] **Step 5: Commit**

```bash
git add frontend/src/theme/
git commit -m "feat: create 8 theme definitions with scope-mapping and barrel"
```

---

### Task 4: Create ThemeContext provider

**Files:**
- Create: `frontend/src/context/ThemeContext.jsx`

Single provider that manages the theme selection, applies CSS vars, generates CodeMirror HighlightStyle, and handles system detection.

- [ ] **Step 1: Write `ThemeContext.jsx`**

```jsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { EditorView } from '@codemirror/view';
import { SCOPE_TO_TAG } from '../theme/scope-mapping';
import { THEME_TOKENS, resolveTheme, allThemes, BUILT_IN_THEME_KEYS } from '../theme';

const ThemeContext = createContext(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

function buildHighlightStyle(theme) {
  if (!theme?.tokenColors?.length) return null;
  return HighlightStyle.define(
    theme.tokenColors.map(tc => ({
      tag: SCOPE_TO_TAG[tc.scope] || tc.scope,
      color: tc.color,
    }))
  );
}

export function ThemeProvider({ children }) {
  const [themeMode, setThemeModeState] = useState(() => {
    return localStorage.getItem('themeMode') || 'system';
  });

  const setThemeMode = useCallback((mode) => {
    localStorage.setItem('themeMode', mode);
    setThemeModeState(mode);
  }, []);

  // Resolve theme + detect system preference
  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => setSystemPrefersDark(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const resolved = useMemo(() => {
    if (themeMode === 'system') {
      return {
        theme: systemPrefersDark ? allThemes[0] : allThemes[1],
        actualType: systemPrefersDark ? 'dark' : 'light',
      };
    }
    return resolveTheme(themeMode);
  }, [themeMode, systemPrefersDark]);

  const { theme } = resolved;

  // Apply CSS vars to :root
  useEffect(() => {
    const root = document.documentElement;

    if (theme.isBuiltIn) {
      // Clear any JS-set overrides, let CSS handle it
      THEME_TOKENS.forEach(token => root.style.removeProperty(`--${token}`));
      if (theme.type === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    } else {
      // Gallery theme: apply all colors via JS
      root.classList.remove('dark');
      for (const [token, value] of Object.entries(theme.colors)) {
        root.style.setProperty(`--${token}`, value);
      }
    }
  }, [theme]);

  // Build CodeMirror HighlightStyle
  const highlightStyle = useMemo(() => buildHighlightStyle(theme), [theme]);

  const editorExtensions = useMemo(() => {
    if (!highlightStyle) return [];
    return [
      EditorView.theme({
        '&': { backgroundColor: 'var(--background)', color: 'var(--foreground)' },
        '.cm-content': { caretColor: 'var(--foreground)', fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace" },
        '.cm-gutters': { backgroundColor: 'var(--card)', borderRight: '1px solid var(--border)', color: 'var(--muted-foreground)' },
        '.cm-activeLineGutter': { backgroundColor: 'var(--muted)' },
        '&.cm-focused .cm-cursor': { borderLeftColor: 'var(--foreground)' },
        '&.cm-focused .cm-selectionBackground, .cm-selectionBackground': { backgroundColor: 'var(--accent)' },
      }),
      syntaxHighlighting(highlightStyle),
    ];
  }, [highlightStyle]);

  const value = useMemo(() => ({
    themeMode,
    setThemeMode,
    theme,
    actualType: resolved.actualType,
    editorExtensions,
    allThemes,
  }), [themeMode, setThemeMode, theme, resolved.actualType, editorExtensions]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add frontend/src/context/ThemeContext.jsx
git commit -m "feat: create ThemeContext with system detection, CSS var apply, CodeMirror bridge"
```

---

### Task 5: Wrap App.jsx with ThemeProvider + remove inline colors

**Files:**
- Modify: `frontend/src/App.jsx`

Replace the `themeMode` useState with ThemeContext. Replace hardcoded `#09090b` and `#fafafa` with Tailwind classes. Remove `import './App.css'`.

- [ ] **Step 1: Rewrite App.jsx**

Replace the entire file content:

```jsx
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
    return () => { if (unsubscribe) unsubscribe(); };
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

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
      />
    </div>
  );
}

export default App;
```

Key changes:
- Removed `useState` for `themeMode` and its `useEffect` (handled by ThemeProvider)
- Removed `import './App.css'`
- Replaced `style={{ backgroundColor: '#09090b', color: '#fafafa' }}` with `className="bg-background text-foreground"`
- Removed `<main>` inline `backgroundColor: '#09090b'` — uses `bg-background`
- SettingsModal now receives no `themeMode`/`setThemeMode` props (reads from context internally)

- [ ] **Step 2: Wrap App entry point with ThemeProvider**

In `frontend/src/main.jsx`, add the import and wrap:

```jsx
import { ThemeProvider } from './context/ThemeContext';

// Inside the render tree, wrap <App />:
<ThemeProvider>
  <BrowserRouter>
    <App />
  </BrowserRouter>
</ThemeProvider>
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/App.jsx frontend/src/main.jsx
git commit -m "feat: wrap App in ThemeProvider, replace inline colors with Tailwind bg-background/text-foreground"
```

---

### Task 6: Rewrite SettingsModal with Radix components

**Files:**
- Rewrite: `frontend/src/components/SettingsModal.jsx`
- Delete: `frontend/src/components/SettingsModal.css`
- Create: `frontend/src/components/SettingsModal.css` (replacement, minimal)

Replace Carbon `ComposedModal`/`RadioButtonGroup`/`Checkbox` with Radix `Dialog`/`RadioGroup`/`Checkbox`. Add theme dropdown for gallery themes.

- [ ] **Step 1: Write new SettingsModal.jsx**

```jsx
import React, { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as RadioGroup from '@radix-ui/react-radio-group';
import * as Checkbox from '@radix-ui/react-checkbox';
import { Settings, Check } from 'lucide-react';
import { GetCloseMinimizesToTray, SetCloseMinimizesToTray } from '../generated';
import { useTheme } from '../context/ThemeContext';
import { BUILT_IN_THEME_KEYS } from '../theme';

export function SettingsModal({ isOpen, onClose }) {
  const { themeMode, setThemeMode, allThemes } = useTheme();
  const [closeMinimizesToTray, setCloseMinimizesToTray] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen]);

  const loadSettings = async () => {
    try {
      const value = await GetCloseMinimizesToTray();
      setCloseMinimizesToTray(value);
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const galleryThemes = allThemes.filter(t => !t.isBuiltIn);

  const isBuiltInActive = themeMode === 'system' || BUILT_IN_THEME_KEYS.includes(themeMode);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 data-[state=open]:animate-in" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-card text-card-foreground border border-border rounded-lg shadow-lg p-6 w-full max-w-md">
          <Dialog.Title className="flex items-center gap-2 text-lg font-semibold mb-6">
            <Settings className="w-5 h-5" />
            Application Settings
          </Dialog.Title>

          {/* Appearance */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block text-foreground">Appearance</label>
          <RadioGroup.Root
            value={
              themeMode === 'system' ? 'system' :
              themeMode === 'github-dark' ? 'dark' :
              themeMode === 'github-light' ? 'light' :
              'system' // gallery themes: show system as fallback
            }
              onValueChange={(val) => {
                if (val === 'system') setThemeMode('system');
                else if (val === 'dark') setThemeMode('github-dark');
                else if (val === 'light') setThemeMode('github-light');
              }}
              className="flex gap-4"
            >
              {['system', 'dark', 'light'].map((mode) => (
                <label key={mode} className="flex items-center gap-2 cursor-pointer">
                  <RadioGroup.Item
                    value={mode}
                    className="w-4 h-4 rounded-full border border-border data-[state=checked]:border-primary data-[state=checked]:bg-primary flex items-center justify-center"
                  >
                    <RadioGroup.Indicator className="w-2 h-2 rounded-full bg-primary-foreground" />
                  </RadioGroup.Item>
                  <span className="text-sm text-muted-foreground capitalize">{mode}</span>
                </label>
              ))}
            </RadioGroup.Root>
          </div>

          {/* Theme (only shown when NOT in system/dark/light) */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block text-foreground">Theme</label>
            <select
              value={isBuiltInActive ? 'default' : themeMode}
              onChange={(e) => {
                if (e.target.value !== 'default') setThemeMode(e.target.value);
              }}
              className="w-full bg-input text-foreground border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="default" disabled>
                {isBuiltInActive ? 'Select a gallery theme...' : themeMode}
              </option>
              {galleryThemes.map((t) => {
                const key = t.name.toLowerCase().replace(/\s+/g, '-');
                return (
                  <option key={key} value={key}>{t.name}</option>
                );
              })}
            </select>
          </div>

          {/* Behavior */}
          <div className="mb-6">
            <label className="text-sm font-medium mb-2 block text-foreground">Behavior</label>
            <label className="flex items-center gap-2 cursor-pointer">
              <Checkbox.Root
                checked={closeMinimizesToTray}
                onCheckedChange={async (checked) => {
                  if (isLoading) return;
                  setIsLoading(true);
                  try {
                    await SetCloseMinimizesToTray(checked);
                    setCloseMinimizesToTray(checked);
                  } catch (err) {
                    console.error('Failed to save setting:', err);
                  } finally {
                    setIsLoading(false);
                  }
                }}
                disabled={isLoading}
                className="w-4 h-4 rounded border border-border data-[state=checked]:bg-primary data-[state=checked]:border-primary flex items-center justify-center"
              >
                <Checkbox.Indicator>
                  <Check className="w-3 h-3 text-primary-foreground" />
                </Checkbox.Indicator>
              </Checkbox.Root>
              <span className="text-sm text-muted-foreground">
                Close button minimizes to tray
              </span>
            </label>
            <p className="text-xs text-muted-foreground mt-1 ml-6">
              When enabled, clicking the close button will minimize the app to the system tray instead of quitting.
            </p>
          </div>

          <Dialog.Close asChild>
            <button className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:opacity-90">
              Close
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default SettingsModal;
```

- [ ] **Step 2: Delete `SettingsModal.css`**

```bash
rm frontend/src/components/SettingsModal.css
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/SettingsModal.jsx
git rm frontend/src/components/SettingsModal.css
git commit -m "feat: rewrite SettingsModal with Radix Dialog + RadioGroup + Checkbox"
```

---

### Task 7: Migrate Sidebar inline colors to CSS vars

**Files:**
- Modify: `frontend/src/components/Sidebar.jsx`

Replace all `#18181b` → `var(--sidebar-background)`, `#27272a` → `var(--border)`, `#71717a` → `var(--muted-foreground)`, `#f4f4f5` → `var(--foreground)`, `#a1a1aa` → `var(--muted-foreground)`, etc. The sidebar uses inline styles so each value becomes `style={{ backgroundColor: 'var(--sidebar-background)' }}`.

- [ ] **Step 1: Replace all inline hex values in Sidebar.jsx**

Key replacements:
- `backgroundColor: '#18181b'` → `backgroundColor: 'var(--sidebar-background)'`
- `borderRight: '1px solid #27272a'` → `borderRight: '1px solid var(--border)'`
- `color: '#a1a1aa'` → `color: 'var(--muted-foreground)'`
- `color: '#f4f4f5'` → `color: 'var(--foreground)'`
- `background: '#27272a'` for inputs → `background: 'var(--input)'`
- `border: '1px solid #3f3f46'` → `border: '1px solid var(--border)'`
- `color: '#ffffff'` → `color: 'var(--primary-foreground)'` (active links)
- `background: '#27272a'` for active states → `background: 'var(--muted)'`
- `background: 'linear-gradient(135deg, #3b82f6, #2563eb)'` for logo gradient → keep as-is (brand gradient, not theme-dependent)
- `color: '#71717a'` → `color: 'var(--muted-foreground)'`
- `color: '#52525b'` (disabled) → `color: 'var(--muted-foreground)'` or `var(--gray-8)`
- `background: 'rgba(39, 39, 42, 0.5)'` → `background: 'color-mix(in srgb, var(--muted) 50%, transparent)'` or just use `var(--muted)` with opacity

Note: CSS `color-mix()` is modern. For hover states like `rgba(39, 39, 42, 0.5)`, use `var(--muted)` with a CSS opacity approach. A simpler approach: create a `--muted/50` token or use `hsla()`.

Alternative: for inline hover state opacities, just hardcode the semi-transparent value matching the theme's muted. Since these are hover transitions and the exact opacity is subjective, using `var(--muted)` directly is acceptable — the difference between 50% and 100% opacity is barely noticeable.

Replace `rgba(39, 39, 42, 0.5)` with `var(--muted)`.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/Sidebar.jsx
git commit -m "feat: migrate Sidebar inline hex colors to CSS vars"
```

---

### Task 8: Migrate TitleBar inline colors to CSS vars

**Files:**
- Modify: `frontend/src/components/TitleBar.jsx`

Same pattern as Sidebar — replace inline hex with `var(--*)` references.

**Key replacements:**
- `backgroundColor: '#18181b'` → `backgroundColor: 'var(--titlebar-background)'`
- `borderBottom: '1px solid #27272a'` → `borderBottom: '1px solid var(--border)'`
- `color: '#a1a1aa'` → `color: 'var(--muted-foreground)'`
- `color: '#f4f4f5'` → `color: 'var(--foreground)'`
- `color: '#71717a'` → `color: 'var(--muted-foreground)'`
- `color: '#ef4444'` → `color: 'var(--destructive)'`
- `backgroundColor: '#dc2626'` (close hover) → `backgroundColor: 'var(--destructive)'`
- `borderLeft: '1px solid #27272a'` → `borderLeft: '1px solid var(--border)'`
- `backgroundColor: '#27272a'` (hover) → `backgroundColor: 'var(--muted)'`
- All `color: '#ffffff'` → `color: 'var(--primary-foreground)'`

- [ ] **Step 1, 2: Make replacements and commit**

```bash
git add frontend/src/components/TitleBar.jsx
git commit -m "feat: migrate TitleBar inline hex colors to CSS vars"
```

---

### Task 9: Migrate Button.jsx to Tailwind classes + CSS vars

**Files:**
- Modify: `frontend/src/components/ui/Button.jsx`

Replace all inline hex styles with Tailwind classes or CSS var references. Since Button uses dynamic hover states via JS, we need to keep inline styles but reference CSS vars instead of hex values.

- [ ] **Step 1: Rewrite Button.jsx**

Key pattern for toggle buttons:
```jsx
// Before:
backgroundColor: isActive ? '#2563eb' : '#18181b',
color: isActive ? '#ffffff' : '#a1a1aa',
border: isActive ? '1px solid #2563eb' : '1px solid #3f3f46',

// After:
backgroundColor: isActive ? 'var(--primary)' : 'var(--card)',
color: isActive ? 'var(--primary-foreground)' : 'var(--muted-foreground)',
border: isActive ? '1px solid var(--primary)' : '1px solid var(--border)',
```

Key pattern for variants:
```jsx
default: {
  backgroundColor: 'var(--primary)',
  color: 'var(--primary-foreground)',
  border: '1px solid var(--primary)',
},
secondary: {
  backgroundColor: 'var(--muted)',
  color: 'var(--muted-foreground)',
  border: '1px solid var(--border)',
},
danger: {
  backgroundColor: 'transparent',
  color: 'var(--destructive)',
  border: '1px solid var(--destructive)',
},
outline: {
  backgroundColor: 'transparent',
  color: 'var(--foreground)',
  border: '1px solid var(--border)',
},
```

For hover states, replace `#1d4ed8` with `var(--ring)`, `#27272a` with `var(--muted)`, etc.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/ui/Button.jsx
git commit -m "feat: migrate Button inline hex colors to CSS vars"
```

---

### Task 10: Update CodeEditor + HighlightedCode to consume theme from context

**Files:**
- Modify: `frontend/src/components/inputs/CodeEditor.jsx`
- Modify: `frontend/src/components/inputs/HighlightedCode.jsx`
- Delete: `frontend/src/components/inputs/carbonCodeMirrorTheme.js`

Replace the static `carbonCodeMirrorExtension` import with dynamic extensions from `useTheme()`. Move the SQL keyword CSS styling to `globals.css`.

- [ ] **Step 1: Rewrite CodeEditor.jsx**

```jsx
import React, { useEffect, useRef, useState } from 'react';
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap } from '@codemirror/commands';
import { useTheme } from '../../context/ThemeContext';
import { createSQLKeywordHighlighter } from './sqlHighlighter';

const languageLoaders = {
  json: () => import('@codemirror/lang-json').then((m) => m.json()),
  javascript: () => import('@codemirror/lang-javascript').then((m) => m.javascript()),
  typescript: () => import('@codemirror/lang-javascript').then((m) => m.javascript({ typescript: true })),
  html: () => import('@codemirror/lang-html').then((m) => m.html()),
  xml: () => import('@codemirror/lang-xml').then((m) => m.xml()),
  css: () => import('@codemirror/lang-css').then((m) => m.css()),
  sql: () => import('@codemirror/lang-sql').then((m) => m.sql()),
  java: () => import('@codemirror/lang-java').then((m) => m.java()),
  swift: () => import('@codemirror/legacy-modes/mode/swift').then((m) =>
    import('@codemirror/language').then((lang) => lang.StreamLanguage.define(m.swift))
  ),
};

async function loadLanguageExtension(language) {
  const loader = languageLoaders[language?.toLowerCase()];
  if (!loader) return null;
  try { return await loader(); }
  catch { return null; }
}

export default function CodeEditor({
  value = '', onChange, language, highlight = true,
  readOnly = false, placeholder, label,
  showLineNumbers = false, className = '', style = {},
}) {
  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);
  const languageRef = useRef(language);
  const readOnlyRef = useRef(readOnly);
  const showLineNumbersRef = useRef(showLineNumbers);

  const { editorExtensions } = useTheme();

  useEffect(() => { onChangeRef.current = onChange; valueRef.current = value; languageRef.current = language; readOnlyRef.current = readOnly; showLineNumbersRef.current = showLineNumbers; });

  useEffect(() => {
    // Destroy existing view on theme change to re-init with new extensions
    if (viewRef.current) { viewRef.current.destroy(); viewRef.current = null; }
    if (!highlight || !containerRef.current) return;
    let isCancelled = false;
    const initEditor = async () => {
      try {
        setIsLoading(true); setLoadError(false);
        const langExtension = await loadLanguageExtension(languageRef.current);
        if (isCancelled) return;

        const extensions = [
          ...editorExtensions,
          keymap.of(defaultKeymap),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && onChangeRef.current) onChangeRef.current(update.state.doc.toString());
          }),
        ];
        if (readOnlyRef.current) { extensions.push(EditorState.readOnly.of(true)); extensions.push(EditorView.editable.of(false)); }
        if (langExtension) extensions.push(langExtension);
        if (languageRef.current?.toLowerCase() === 'sql') extensions.push(createSQLKeywordHighlighter());
        if (showLineNumbersRef.current) extensions.push(lineNumbers());

        const state = EditorState.create({ doc: valueRef.current, extensions });
        const view = new EditorView({ state, parent: containerRef.current });
        if (!isCancelled) { viewRef.current = view; setIsLoading(false); }
        else view.destroy();
      } catch { if (!isCancelled) { setLoadError(true); setIsLoading(false); } }
    };
    initEditor();
    return () => { isCancelled = true; };
  }, [highlight, editorExtensions]);

  useEffect(() => { return () => { if (viewRef.current) { viewRef.current.destroy(); viewRef.current = null; } }; }, []);
  useEffect(() => { if (!highlight && viewRef.current) { viewRef.current.destroy(); viewRef.current = null; } }, [highlight]);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const currentContent = view.state.doc.toString();
    if (value !== currentContent) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
    }
  }, [value]);

  const containerStyle = {
    display: 'flex', flexDirection: 'column', height: '100%', minHeight: '120px',
    border: '1px solid var(--border)', backgroundColor: 'var(--background)',
    borderRadius: '8px', overflow: 'hidden', ...style,
  };
  const labelStyle = {
    fontSize: '12px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em',
    color: 'var(--muted-foreground)', padding: '8px 12px',
    borderBottom: '1px solid var(--border)', backgroundColor: 'var(--card)', flexShrink: 0,
  };

  if (!highlight || loadError) {
    return (
      <div className={className} style={containerStyle}>
        {label && <div style={labelStyle}>{label}</div>}
        <textarea value={value} onChange={(e) => onChange?.(e.target.value)} readOnly={readOnly} placeholder={placeholder}
          style={{
            flex: 1, width: '100%', height: '100%', padding: '12px',
            fontFamily: "'Menlo', 'Monaco', 'Courier New', monospace", fontSize: '14px', lineHeight: 1.5,
            backgroundColor: 'transparent', border: 'none', color: 'var(--foreground)', resize: 'none', outline: 'none',
          }} />
      </div>
    );
  }

  return (
    <div className={className} style={containerStyle}>
      {label && <div style={labelStyle}>{label}</div>}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative', minHeight: 0 }} ref={containerRef} />
      {isLoading && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'var(--muted-foreground)', fontSize: '14px' }}>Loading editor...</div>}
    </div>
  );
}
```

- [ ] **Step 2: Update HighlightedCode.jsx the same way**

Same pattern: import `useTheme`, use `editorExtensions` instead of `carbonCodeMirrorExtension`. Replace hardcoded hex colors with `var(--*)`.

- [ ] **Step 3: Delete carbonCodeMirrorTheme.js**

```bash
rm frontend/src/components/inputs/carbonCodeMirrorTheme.js
```

- [ ] **Step 4: Move SQL keyword CSS to globals.css**

From the old `index.scss`, find the `.cm-sql-ddl`, `.cm-sql-dml`, etc. CSS classes and add them to `globals.css` with `var(--*)` color references:

```css
/* SQL keyword highlighting (from carbonCodeMirrorTheme + index.scss) */
.cm-sql-ddl { color: #ff6b9d !important; font-weight: bold !important; }
.cm-sql-dml { color: #7ee787 !important; }
.cm-sql-conditional { color: #b388ff !important; font-weight: bold !important; }
.cm-sql-join { color: #ffab40 !important; font-weight: bold !important; }
.cm-sql-aggregate { color: #69f0ae !important; font-weight: bold !important; }
.cm-sql-ordering { color: #ffd740 !important; }
```

(Keep these as static neon colors for now — they're SQL-specific and not theme-dependent. Can be thematized in a future update.)

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/inputs/CodeEditor.jsx frontend/src/components/inputs/HighlightedCode.jsx frontend/src/globals.css
git rm frontend/src/components/inputs/carbonCodeMirrorTheme.js
git commit -m "feat: CodeEditor consumes theme from context, delete static carbon theme"
```

---

### Task 11: Update CommandPalette theme commands

**Files:**
- Modify: `frontend/src/components/CommandPalette.jsx`

Update the theme toggle command to use the new ThemeContext instead of the old event-based mechanism.

- [ ] **Step 1: Find and update theme-related commands in CommandPalette.jsx**

The CommandPalette currently has a `toggle-theme` command that emits `spotlight:theme:toggle`. Since we're now using React Context for themes, update this to call `setThemeMode` directly:

```jsx
import { useTheme } from '../context/ThemeContext';

// Inside the component:
const { themeMode, setThemeMode } = useTheme();

// Replace the toggle-theme command handler:
{ id: 'toggle-theme', name: 'Toggle Dark Mode', shortcut: 'Ctrl+T', action: () => {
  const next = themeMode === 'github-dark' ? 'github-light' : 'github-dark';
  setThemeMode(next);
}}
```

If the CommandPalette is rendered outside the ThemeProvider tree, pass `themeMode`/`setThemeMode` as props from App.jsx instead.

- [ ] **Step 2: Commit**

```bash
git add frontend/src/components/CommandPalette.jsx
git commit -m "feat: update CommandPalette theme toggle to use ThemeContext"
```

---

### Task 12: Delete Carbon-dependent files + deps

**Files:**
- Delete: `frontend/src/index.scss`
- Delete: `frontend/src/style.css`
- Delete: `frontend/src/App.css`

Remaining Carbon-dependent components (ConversionCard, StatusMessages) will be handled in Task 13.

- [ ] **Step 1: Remove imports and delete files**

Check `main.jsx` — remove `import './index.scss'` if present. Remove any other references to these files.

```bash
rm frontend/src/index.scss frontend/src/style.css frontend/src/App.css
```

- [ ] **Step 2: Clean up leftover Carbon references in components**

Search for any remaining `var(--cds-*)` or `@carbon/` imports in the codebase. Replace with CSS var equivalents.

- [ ] **Step 3: Update spotlight.css**

Replace hardcoded `#18181b` with `var(--background)`:

```css
/* Before: */
body { background-color: #18181b; color: #f4f4f5; }

/* After: */
body { background-color: var(--background); color: var(--foreground); }
```

- [ ] **Step 4: Commit**

```bash
git rm frontend/src/index.scss frontend/src/style.css frontend/src/App.css
git add frontend/src/spotlight.css
git commit -m "refactor: delete Carbon CSS files, update spotlight to use theme vars"
```

---

### Task 13: Migrate ConversionCard + StatusMessages away from Carbon

**Files:**
- Modify: `frontend/src/pages/NumberConverter/components/ConversionCard.jsx`
- Modify: `frontend/src/pages/JwtDebugger/components/StatusMessages.jsx`

- [ ] **Step 1: Replace Carbon TextInput in ConversionCard.jsx**

```jsx
// Before:
import { TextInput } from '@carbon/react';
// ... <TextInput ... />

// After:
import Input from '../../../components/ui/input';
// ... <Input ... />
```

Check that the existing `input.jsx` accepts the same props (value, onChange, placeholder, etc.).

- [ ] **Step 2: Replace Carbon icons in StatusMessages.jsx**

```jsx
// Before:
import { CheckmarkFilled, CloseFilled } from '@carbon/icons-react';

// After:
import { CheckCircle, XCircle } from 'lucide-react';
```

Replace `<CheckmarkFilled />` with `<CheckCircle className="text-success w-5 h-5" />` and `<CloseFilled />` with `<XCircle className="text-destructive w-5 h-5" />`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/NumberConverter/components/ConversionCard.jsx frontend/src/pages/JwtDebugger/components/StatusMessages.jsx
git commit -m "refactor: remove last Carbon component usages (ConversionCard + StatusMessages)"
```

---

### Task 14: Rewrite CodeFormatter — Prism → HighlightedCode

**Files:**
- Modify: `frontend/src/pages/CodeFormatter/index.jsx`

Replace the Prism.js output with `HighlightedCode` component. Remove Prism imports. Remove `prism-tomorrow.css` import.

- [ ] **Step 1: Rewrite CodeFormatter output pane**

```jsx
// Before:
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
// ... <pre><code dangerouslySetInnerHTML={{ __html: Prism.highlight(...) }} />

// After:
import HighlightedCode from '../../../components/inputs/HighlightedCode';
// ... <HighlightedCode code={formattedCode} language={detectedLang} showLineNumbers />
```

Language mapping from CodeFormatter format to HighlightedCode:
- `json` → `json` (same)
- `xml` → `xml` (same)
- `html` → `html` (same)
- `css` → `css` (same)

- [ ] **Step 2: Remove Prism import line and CSS**

Delete these lines:
```js
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-xml-doc';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css';
```

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/CodeFormatter/index.jsx
git commit -m "feat: replace Prism.js with HighlightedCode in CodeFormatter"
```

---

### Task 15-30: Migrate tool pages from textarea → CodeEditor/HighlightedCode

**Pattern (same for all tools):**

Each tool page has Input (editable) and Output (read-only) panes. Most use `<textarea>` for both. Replace:

- Input textarea → `<CodeEditor value={...} onChange={...} language={detectedLang} highlight={highlightOn} />`
- Output textarea → `<HighlightedCode code={...} language={detectedLang} />`

**15 tools to migrate:**

| # | Tool | Route | File | Language Detection |
|---|------|-------|------|-------------------|
| 1 | CodeEncoder | `/tool/code-encoder` | `CodeEncoder/index.jsx` | plaintext (no syntax) |
| 2 | CodeEncrypter | `/tool/code-encrypter` | `CodeEncrypter/index.jsx` | plaintext |
| 3 | HashGenerator | `/tool/hash-generator` | `HashGenerator/index.jsx` | plaintext |
| 4 | CodeConverter | `/tool/code-converter` | `CodeConverter/index.jsx` | json / plaintext |
| 5 | TextUtilities | `/tool/text-utilities` | `TextUtilities/index.jsx` | plaintext |
| 6 | NumberConverter | `/tool/number-converter` | `NumberConverter/index.jsx` | plaintext (number fields unchanged) |
| 7 | DateTimeConverter | `/tool/datetime-converter` | `DateTimeConverter/index.jsx` | plaintext (number fields unchanged) |
| 8 | JwtDebugger | `/tool/jwt` | `JwtDebugger/index.jsx` | json (JWT payload) |
| 9 | BarcodeGenerator | `/tool/barcode` | `BarcodeGenerator.jsx` | plaintext |
| 10 | DataGenerator | `/tool/data-generator` | `DataGenerator/index.jsx` | json |
| 11 | ColorConverter | `/tool/color-converter` | `ColorConverter/index.jsx` | plaintext (color code is not code) |
| 12 | CronJobParser | `/tool/cron` | `CronJobParser.jsx` | plaintext |
| 13 | RegExpTester | `/tool/regexp` | `RegExpTester.jsx` | plaintext (regex patterns have own highlighting) |
| 14 | TextDiffChecker | `/tool/diff` | `TextDiffChecker/index.jsx` | plaintext / diff output |
| 15 | CodeFormatter | `/tool/code-formatter` | `CodeFormatter/index.jsx` | Already done in Task 14 |

**For each tool, steps are:**

- [ ] **Step N.1: Read the tool file** to understand its structure (input/output textareas, language detection)
- [ ] **Step N.2: Add imports** — `import CodeEditor from '../components/inputs/CodeEditor'` and `import HighlightedCode from '../components/inputs/HighlightedCode'`
- [ ] **Step N.3: Replace input textarea** with `<CodeEditor>` 
- [ ] **Step N.4: Replace output textarea** with `<HighlightedCode>`
- [ ] **Step N.5: Remove any hardcoded hex colors** in the page (replace with Tailwind classes or CSS vars)
- [ ] **Step N.6: Commit** with message `"feat: migrate <Tool> textareas to CodeEditor/HighlightedCode"`

**Language detection helper** (for tools that display parsed output):

```js
function detectLanguage(toolId, content) {
  switch (toolId) {
    case 'jwt': return 'json';
    case 'code-converter': return content?.trim().startsWith('{') ? 'json' : 'plaintext';
    case 'data-generator': return 'json';
    default: return 'plaintext';
  }
}
```

**Plaintext tools** (CodeEncoder, CodeEncrypter, HashGenerator, TextUtilities, NumberConverter, DateTimeConverter, BarcodeGenerator, DataGenerator, CronJobParser, TextDiffChecker, ColorConverter, RegExpTester) should use `language="plaintext"` or omit the language prop — CodeMirror will render without syntax highlighting (plain monospace).

---

### Task 31: Add `EditorToggle` to each tool page

**Files:**
- Modify: Each tool page (add EditorToggle control)

`EditorToggle` is a button that toggles syntax highlighting on/off. It's already built in `src/components/inputs/EditorToggle.jsx`. Wire it to the tool's highlight state.

**Pattern to add to each tool page:**

```jsx
import { EditorToggle } from './components/inputs/EditorToggle';

// In the tool component:
const toolKey = 'code-encoder'; // unique per tool
const [highlightOn, setHighlightOn] = useState(() => {
  const saved = localStorage.getItem(`${toolKey}-editor-highlight`);
  return saved !== 'false'; // default on
});
const handleToggle = () => {
  const next = !highlightOn;
  setHighlightOn(next);
  localStorage.setItem(`${toolKey}-editor-highlight`, next);
};

// In the header/controls area:
<EditorToggle enabled={highlightOn} onToggle={handleToggle} toolKey={toolKey} />
```

- [ ] **Step 1-15: Add EditorToggle to each tool page**

Group by commit. Do 3-4 tools per commit.

```bash
git commit -m "feat: add EditorToggle syntax highlighting control to all tool pages"
```

---

### Task 32: Write E2E theme tests

**Files:**
- Create: `frontend/e2e/theme.spec.js`

Follow the same self-contained pattern as existing tool E2E tests (no page objects, no helpers).

- [ ] **Step 1: Write `e2e/theme.spec.js`**

```js
import { test, expect } from '@playwright/test';

test.describe('Theme System', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tool/code-encoder');
  });

  test('default — system mode', async ({ page }) => {
    // First visit with no localStorage: defaults to system mode
    await page.evaluate(() => localStorage.removeItem('themeMode'));

    // Open settings
    await page.getByRole('button', { name: 'Settings' }).first().click();
    await expect(page.getByText('System')).toBeVisible();

    // The html element has dark class based on OS preference
    // (or does not if OS is light mode)
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    // Assert that it's consistent with system preference
    const prefersDark = await page.evaluate(() =>
      window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    expect(hasDark).toBe(prefersDark);
  });

  test('switch to light mode', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();

    // Click "Light"
    await page.getByText('Light').click();

    // html should NOT have dark class
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(hasDark).toBe(false);

    // Background should be light
    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
    );
    // Radix Gray-1 in light mode is close to white
    expect(bg).not.toBe('');
  });

  test('switch to dark mode', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();

    // Click "Dark"
    await page.getByText('Dark').click();

    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(hasDark).toBe(true);
  });

  test('theme persists across reload', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();
    await page.getByText('Dark').click();

    // Reload
    await page.reload();
    await page.goto('/tool/code-encoder');

    // Dark should still be active
    const hasDark = await page.evaluate(() =>
      document.documentElement.classList.contains('dark')
    );
    expect(hasDark).toBe(true);
  });

  test('settings modal contains theme dropdown', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();

    // Gallery theme dropdown should exist
    const select = page.locator('select').first();
    await expect(select).toBeVisible();

    // Should contain gallery theme options
    const options = await select.locator('option').allTextContents();
    const expectedThemes = [
      'One Dark Pro', 'Dracula', 'Nord',
      'Catppuccin Mocha', 'Solarized Dark', 'Solarized Light',
    ];
    for (const theme of expectedThemes) {
      expect(options.some(o => o.includes(theme))).toBeTruthy();
    }
  });

  test('select gallery theme applies colors', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();

    // Select "One Dark Pro" from dropdown
    await page.locator('select').first().selectOption('one-dark-pro');

    // Background CSS var should be overridden
    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
    );
    // One Dark Pro background is #282c34
    expect(bg).toBe('#282c34');
  });

  test('gallery theme persists across reload', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();
    await page.locator('select').first().selectOption('dracula');

    await page.reload();
    await page.goto('/tool/code-encoder');

    // Dracula background should still be #282a36
    const bg = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--background').trim()
    );
    expect(bg).toBe('#282a36');
  });

  test('switch from gallery to built-in clears overrides', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();

    // Apply gallery theme
    await page.locator('select').first().selectOption('nord');
    await page.waitForTimeout(100);

    // Switch back to Dark
    await page.getByText('Dark').click();
    await page.waitForTimeout(100);

    // Inline style overrides should be cleared
    const hasInlineOverride = await page.evaluate(() =>
      document.documentElement.style.getPropertyValue('--background')
    );
    expect(hasInlineOverride).toBe('');
  });

  test('settings modal opens and closes', async ({ page }) => {
    await page.getByRole('button', { name: 'Settings' }).first().click();
    await expect(page.getByText('Application Settings')).toBeVisible();

    // Close via close button
    await page.getByText('Close').click();
    await expect(page.getByText('Application Settings')).not.toBeVisible();
  });
});
```

- [ ] **Step 2: Run E2E tests**

```bash
cd frontend && bun run test:e2e -- e2e/theme.spec.js
```

Expected: All tests PASS (or need minor selector adjustments).

- [ ] **Step 3: Commit**

```bash
git add frontend/e2e/theme.spec.js
git commit -m "test: add E2E tests for theme system (8 scenarios)"
```

---

### Task 33: Run lint + format + typecheck

- [ ] **Step 1: Format code**

```bash
cd frontend && bun run format
```

- [ ] **Step 2: Run backend tests**

```bash
go test ./internal/...
```

- [ ] **Step 3: Run frontend tests**

```bash
cd frontend && bun test
```

- [ ] **Step 4: Fix any issues and commit**

```bash
git commit -m "chore: format and fix lint issues"
```

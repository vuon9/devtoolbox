# Theme System — VS Code-style Holistic Themes

**Date:** 2026-05-09
**Status:** Approved for Implementation

## Summary

The app currently hardcodes dark-only colors for both the UI chrome and code syntax highlighting. This design introduces a VS Code-inspired holistic theme system where a single theme definition drives everything — app UI colors AND code syntax token colors. Users can switch between bundled themes or pick their own via a theme gallery.

## Goals

1. Each theme defines both app chrome AND syntax highlighting in one package.
2. Default visual tone is system (follows macOS/OS preference).
3. Light mode works (GitHub-light aesthetic).
4. Users can pick from a curated gallery of popular themes (One Dark, Dracula, Nord, etc.).
5. Existing code infrastructure (CodeMirror 6, CSS variables) is reused, not rewritten.
6. Carbon Design System is fully removed.

## Non-Goals

- Editing/creating custom themes within the app UI (future concern).
- Online theme marketplace integration (themes are bundled).
- Live theme preview in settings (nice-to-have, future).
- Applying themes to external editor components beyond CodeMirror 6.

## Architecture

### Data Flow

```
Theme JSON (bundled .js files)
  → ThemeProvider (React Context)
    → App UI: sets CSS custom properties on :root / .dark
      → Tailwind v4 @theme references CSS vars
        → Components use bg-background, text-foreground, etc.
    → Syntax: generates CodeMirror HighlightStyle
      → CodeEditor / HighlightedCode consume via extension[]
```

### Theme Definition Format

Each theme is a JS object with two sections — `colors` for the UI and `tokenColors` for syntax:

```js
{
  name: "One Dark Pro",
  type: "dark",           // "dark" | "light"
  colors: {
    background: "#282c34",
    foreground: "#abb2bf",
    card: "#2c323c",
    "card-foreground": "#abb2bf",
    primary: "#61afef",
    "primary-foreground": "#ffffff",
    muted: "#3b4048",
    "muted-foreground": "#818896",
    destructive: "#e06c75",
    border: "#3b4048",
    surface: "#21252b",
    input: "#3b4048",
    ring: "#61afef",
    accent: "#61afef",
    "accent-hover": "#528bff",
    // plus sidebar, titlebar specific tokens
  },
  tokenColors: [
    { scope: "keyword",       color: "#c678dd" },
    { scope: "string",        color: "#98c379" },
    { scope: "number",        color: "#d19a66" },
    { scope: "comment",       color: "#5c6370" },
    { scope: "type",          color: "#e5c07b" },
    { scope: "function",      color: "#61afef" },
    { scope: "variable",      color: "#e06c75" },
    { scope: "operator",      color: "#56b6c2" },
    { scope: "punctuation",   color: "#abb2bf" },
    { scope: "tag",           color: "#e06c75" },
    { scope: "attribute",     color: "#d19a66" },
  ],
}
```

### Theme Palette — 2 Tiers

| Tier | Themes | Source |
|------|--------|--------|
| **Built-in** | GitHub Dark, GitHub Light | Radix Colors via CSS |
| **Curated Gallery** | One Dark Pro, Dracula, Nord, Catppuccin Mocha, Solarized Dark, Solarized Light | VS Code marketplace / hex values in JS |

Built-in themes are defined in CSS (using Radix Color scales), so they work without JavaScript. Curated gallery themes are bundled as JS objects that override CSS vars at runtime.

### CSS Layer — Built-in Themes

Radix Colors provides automatic light/dark switching via `.dark` class:

```css
@import "@radix-ui/colors/gray.css";
@import "@radix-ui/colors/blue.css";
@import "@radix-ui/colors/red.css";
@import "@radix-ui/colors/green.css";

:root {
  --background: var(--gray-1);
  --foreground: var(--gray-12);
  --card: var(--gray-2);
  --primary: var(--blue-9);
  --border: var(--gray-6);
  --destructive: var(--red-9);
}
```

The `.dark` class is already handled by Radix's dark CSS files — same variable name resolves to dark value when the class is present.

Tailwind v4 `@theme` block maps these to utilities:

```css
@theme {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-primary: var(--primary);
  --color-border: var(--border);
  --color-destructive: var(--destructive);
}
```

### Theme Engine — Runtime Override for Custom Themes

When a gallery theme is active, ThemeProvider applies its `colors` directly:

```js
function applyTheme(theme) {
  const root = document.documentElement;
  for (const [token, value] of Object.entries(theme.colors)) {
    root.style.setProperty(`--${token}`, value);
  }
}
```

This overrides the CSS-defined variables. When switching back to a built-in theme, we clear the inline styles and let CSS take over.

### CodeMirror Syntax Bridge

Each theme's `tokenColors` is converted to a CodeMirror `HighlightStyle` at activation:

```js
import { tags as t } from "@lezer/highlight";

const SCOPE_TO_TAG = {
  keyword:    t.keyword,
  string:     t.string,
  number:     t.number,
  comment:    t.blockComment,
  type:       t.typeName,
  function:   t.function(t.variableName),
  variable:   t.variableName,
  operator:   t.operator,
  punctuation: t.punctuation,
  tag:        t.tagName,
  attribute:  t.attributeName,
};
```

The bridge generates a `HighlightStyle.define([...])` that gets composed into the CodeMirror extension array.

```js
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";

function buildEditorExtensions(theme) {
  const highlightStyle = HighlightStyle.define(
    theme.tokenColors.map(tc => ({
      tag: SCOPE_TO_TAG[tc.scope] || tc.scope,
      color: tc.color,
    }))
  );
  return [
    EditorView.theme({ /* editor chrome from theme.colors */ }),
    syntaxHighlighting(highlightStyle),
  ];
}
```

### React State — ThemeProvider

```jsx
// types
type Mode = "system" | "light" | "dark";
type ThemeName = "github-dark" | "github-light" | "one-dark-pro" | "dracula" | ...;

interface ThemeContextValue {
  mode: Mode;
  setMode: (m: Mode) => void;
  activeTheme: ThemeName;
  setTheme: (t: ThemeName) => void;
  actualType: "light" | "dark";    // resolved after system detection
  themeData: ThemeDefinition;       // current theme object
  allThemes: ThemeDefinition[];     // available themes
}
```

**State flow:**
1. User picks theme in Settings → `setTheme("one-dark-pro")`
2. ThemeProvider loads bundled theme JSON
3. Applies UI colors to `document.documentElement.style.*`
4. Generates CodeMirror HighlightStyle, caches in context
5. CodeEditor/HighlightedCode re-render with new extensions
6. Preference saved to `localStorage.theme` and `localStorage.themeMode`

**System mode detection:**
```jsx
useEffect(() => {
  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const handler = (e) => setActualType(e.matches ? "dark" : "light");
  mq.addEventListener("change", handler);
  return () => mq.removeEventListener("change", handler);
}, []);
```

### File Structure — New & Changed

```
frontend/src/
├── App.jsx                                    // Replace inline styles, consume ThemeProvider
├── globals.css                                // Add @theme block, Radix Colors imports
├── index.scss                                 // DELETE (Carbon removal)
├── style.css                                  // DELETE (legacy CSS)
├── App.css                                    // DELETE (legacy CSS, inline Carbon references)
├── spotlight.css                              // UPDATE: remove forced dark
│
├── context/
│   └── ThemeContext.jsx                       // NEW: ThemeProvider, useTheme hook
│
├── theme/
│   ├── index.js                              // NEW: barrel, THEMES registry
│   ├── builtins.js                           // NEW: GitHub Dark + Light definitions
│   ├── one-dark-pro.js                       // NEW: bundled theme
│   ├── dracula.js                            // NEW: bundled theme
│   ├── nord.js                               // NEW: bundled theme
│   ├── catppuccin-mocha.js                   // NEW: bundled theme
│   ├── solarized-dark.js                     // NEW: bundled theme
│   ├── solarized-light.js                    // NEW: bundled theme
│   └── scope-mapping.js                      // NEW: VS Code scope → Lezer tag map
│
├── components/
│   ├── inputs/
│   │   ├── carbonCodeMirrorTheme.js          // REPLACE: dynamic theme via context
│   │   ├── CodeEditor.jsx                    // UPDATE: consume theme from context
│   │   ├── HighlightedCode.jsx               // UPDATE: consume theme from context
│   │   └── EditorToggle.jsx                  // (unchanged)
│   ├── SettingsModal.jsx                     // UPDATE: theme picker UI
│   └── CommandPalette.jsx                    // UPDATE: theme switch commands
```

### Carbon Removal — Files to Delete

| File | Replacement |
|------|-------------|
| `src/index.scss` | inline styles removed or moved to globals.css |
| `src/App.css` | all styles migrated to Tailwind classes |
| `src/style.css` | tokens replaced by Radix Colors CSS vars |
| `package.json` deps | `@carbon/react`, `@carbon/styles`, `@carbon/icons-react` removed |

### Component Migration — Hardcoded Colors → Tailwind Tokens

Current hardcoded inline colors that must be replaced:

- `App.jsx` root div: `backgroundColor: '#09090b'` → `bg-background`, `color: '#fafafa'` → `text-foreground`
- `App.jsx` `<main>`: `backgroundColor: '#09090b'` → `bg-background`
- `Sidebar.jsx` background `#18181b` → `bg-card`, border `#27272a` → `border-border`
- `Button.jsx` inline colors → Tailwind `bg-primary`, `bg-muted`, etc.
- `prism-tomorrow.css` in CodeFormatter → generate prism stylesheet from theme tokenColors
- `spotlight.css` forced `#18181b` → use CSS variable

### Theme Gallery — Bundled Themes

Initial curated set (6 popular + 2 built-in):

| Theme | Type | Source |
|-------|------|--------|
| GitHub Dark | dark | Radix Colors (built-in CSS) |
| GitHub Light | light | Radix Colors (built-in CSS) |
| One Dark Pro | dark | Atom/VSCode |
| Dracula | dark | draculatheme.com |
| Nord | dark | nordtheme.com |
| Catppuccin Mocha | dark | catppuccin.com |
| Solarized Dark | dark | solarized.com |
| Solarized Light | light | solarized.com |

Each is a JS file exporting the full theme object. Colors are extracted from official VS Code themes or CSS sources.

### Success / Edge Cases

| Case | Behavior |
|------|----------|
| First visit, no localStorage | System mode → `matchMedia` detects OS preference → built-in theme |
| User picks a theme | Saved to localStorage, applied on next load |
| System preference changes | If mode=system, theme switches automatically between built-in dark/light |
| User picks custom theme (e.g. Dracula) | Custom themes override system/light/dark mode — you can be in "light" mode with a dark theme |
| Switching back to built-in | Clear inline style overrides, CSS takes over |
| CodeMirror not yet initialized | Theme context caches the last highlight style → applied on mount |
| Theme JSON missing a color | Fall back to default value (white/dark) — no crash |
| Carbon removed, component still uses Carbon class | Caught by visual QA — replace with Tailwind equivalent |

### Out of Scope (for v1)

- User-created custom themes (saved in localStorage).
- Theme marketplace / import from URL.
- Theme editing UI in Settings.
- Animated theme transitions.

## Testing Strategy

1. **Unit:** ThemeProvider renders children, applies CSS vars, generates HighlightStyle.
2. **Unit:** scope-mapping covers all VS Code scopes used in bundled themes.
3. **Visual:** Each bundled theme renders correct colors in CodeEditor on both input and output panes.
4. **Edge:** System mode toggles automatically when OS preference changes.
5. **Edge:** Missing token color in theme JSON doesn't crash CodeMirror.
6. **UX:** Light/dark/system radio buttons update the app immediately.

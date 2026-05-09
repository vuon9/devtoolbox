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
7. All tool pages migrate from plain `<textarea>` to CodeMirror-based `CodeEditor`/`HighlightedCode`.
8. Prism.js is removed entirely (replaced by CodeMirror in CodeFormatter).

## Non-Goals

- Editing/creating custom themes within the app UI (future concern).
- Online theme marketplace integration (themes are bundled).
- Live theme preview in settings (nice-to-have, future).
- Applying themes to external editor components beyond CodeMirror 6.

## Architecture

### Data Flow

```
Theme definitions (bundled .js files)
  → ThemeProvider (React Context)
    → UI mode: localStorage key "themeMode"
        "system"            → auto-detect OS preference
        "github-dark"       → built-in dark (Radix Colors via CSS)
        "github-light"      → built-in light (Radix Colors via CSS)
        "one-dark-pro"      → gallery theme (JS override CSS vars)
        ...
    → App UI: sets CSS custom properties on :root
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
  type: "dark",                // "dark" | "light"
  colors: {
    // Core surface (cover ~85% of hardcoded colors)
    "background":              "#282c34",
    "foreground":              "#abb2bf",
    "card":                    "#2c323c",
    "card-foreground":         "#abb2bf",
    "popover":                 "#2c323c",
    "popover-foreground":      "#abb2bf",
    "primary":                 "#61afef",
    "primary-foreground":      "#ffffff",
    "secondary":               "#3b4048",
    "secondary-foreground":    "#abb2bf",
    "muted":                   "#3b4048",
    "muted-foreground":        "#818896",
    "accent":                  "#61afef",
    "accent-foreground":       "#ffffff",
    "destructive":             "#e06c75",
    "destructive-foreground":  "#ffffff",
    "border":                  "#3b4048",
    "input":                   "#3b4048",
    "ring":                    "#61afef",

    // Extended surface (cover remaining 15%)
    "sidebar-background":      "#21252b",
    "sidebar-foreground":      "#abb2bf",
    "sidebar-accent":          "#61afef",
    "titlebar-background":     "#21252b",
    "scrollbar-thumb":         "#3b4048",
    "scrollbar-track":         "#21252b",
    "success":                 "#98c379",
    "success-foreground":      "#ffffff",
    "warning":                 "#e5c07b",
    "warning-foreground":      "#282c34",
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

Tailwind v4 `@theme` block maps all tokens to utilities:

```css
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
```

Sidebar/Titlebar/Scrollbar tokens use `var(--sidebar-background)` etc. directly in their respective component CSS, not through Tailwind utilities (they're component-specific, not general-purpose).

### Theme Engine — Runtime Override for Gallery Themes

When a gallery theme is active, ThemeProvider applies its `colors` directly. The single `localStorage.themeMode` key stores both mode and theme selection:

| Stored value | Behavior |
|---|---|
| `"system"` | Auto-detect `prefers-color-scheme`, apply matching built-in theme |
| `"github-dark"` / `"github-light"` | Built-in: `.dark` class toggle, CSS does the rest |
| `"one-dark-pro"` / any gallery name | JS override of CSS vars on `:root` |

```js
function applyTheme(theme) {
  const root = document.documentElement;
  for (const [token, value] of Object.entries(theme.colors)) {
    root.style.setProperty(`--${token}`, value);
  }
}
```

When switching back to a built-in theme, clear the inline style overrides and let CSS take over via `.dark` class:

```js
function clearThemeOverrides() {
  const root = document.documentElement;
  // Tokens set by gallery themes are removed; CSS defaults take over
  THEME_TOKENS.forEach(token => root.style.removeProperty(`--${token}`));
}
```</parameter>


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

Uses a single localStorage key `themeMode`. No separate "mode" vs "theme" — the stored value IS the selection.

```jsx
// types
type ThemeMode = "system" | "github-dark" | "github-light" | "one-dark-pro" | "dracula" | ...;

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (t: ThemeMode) => void;
  actualTheme: ThemeDefinition;       // resolved theme object
  actualType: "light" | "dark";       // resolved after system/gallery type
  allThemes: ThemeDefinition[];       // available themes
}
```

**State flow:**
1. User picks theme in Settings → `setThemeMode("one-dark-pro")`
2. ThemeProvider saves to `localStorage.themeMode`, triggers effect
3. If gallery theme → loads bundled JSON, applies CSS vars via JS
4. If built-in → toggles `.dark` class on `<html>`, clears JS CSS vars
5. Generates CodeMirror HighlightStyle for the resolved theme, caches in context
6. CodeEditor/HighlightedCode re-render with new extensions

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
├── App.jsx                                    // Replace inline styles, wrap ThemeProvider
├── globals.css                                // Add @theme block, Radix Colors imports
├── index.scss                                 // DELETE (Carbon removal)
├── style.css                                  // DELETE (legacy CSS)
├── App.css                                    // DELETE (legacy CSS)
├── spotlight.css                              // UPDATE: remove forced dark values
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
│   │   ├── carbonCodeMirrorTheme.js          // DELETE — replaced by dynamic theme
│   │   ├── CodeEditor.jsx                    // UPDATE: consume theme from context
│   │   ├── HighlightedCode.jsx               // UPDATE: consume theme from context
│   │   └── EditorToggle.jsx                  // (unchanged)
│   ├── SettingsModal.jsx                     // REWRITE: Carbon → Radix (Dialog + RadioGroup + Checkbox)
│   └── CommandPalette.jsx                    // UPDATE: theme switch commands
│
├── pages/
│   ├── CodeFormatter/
│   │   └── index.jsx                         // REWRITE: Prism → HighlightedCode
│   ├── CodeEncoder/
│   │   └── index.jsx                         // MIGRATE: textarea → CodeEditor
│   ├── CodeEncrypter/
│   │   └── index.jsx                         // MIGRATE: textarea → CodeEditor
│   ├── HashGenerator/
│   │   └── index.jsx                         // MIGRATE: textarea → CodeEditor
│   ├── CodeConverter/
│   │   └── index.jsx                         // MIGRATE: textarea → CodeEditor
│   ├── TextUtilities/
│   │   └── index.jsx                         // MIGRATE: textarea → CodeEditor
│   ├── JwtDebugger/
│   │   └── index.jsx                         // MIGRATE: textarea → CodeEditor, Carbon icons → Lucide
│   ├── NumberConverter/
│   │   └── index.jsx, ConversionCard.jsx     // MIGRATE: Carbon TextInput → input.jsx
│   └── ...                                   // other pages: textarea → ToolTextArea (theme-aware)
│
├── dependencies                              // REMOVE: @carbon/react, @carbon/styles, @carbon/icons-react, prismjs
│                                              // ADD: @radix-ui/react-dialog, @radix-ui/react-radio-group
```

### Carbon Removal — Files to Delete

| File | Replacement |
|------|-------------|
| `src/index.scss` | SQL keyword styles → `globals.css`. Carbon imports → removed. |
| `src/App.css` | All styles migrated to Tailwind classes |
| `src/style.css` | Tokens replaced by Radix Colors CSS vars |
| `package.json` deps | `@carbon/react`, `@carbon/styles`, `@carbon/icons-react`, `prismjs` → removed |
| | `@radix-ui/react-dialog`, `@radix-ui/react-radio-group` → added |

### Component Rebuilds — Hotspots

| Component | Action |
|-----------|--------|
| `SettingsModal.jsx` | Rewritten: Carbon `ComposedModal` → Radix `Dialog`, `RadioButtonGroup` → Radix `RadioGroup`, `@carbon/icons-react` → `lucide-react` |
| `ConversionCard.jsx` | Carbon `TextInput` → `src/components/ui/input.jsx` |
| `StatusMessages.jsx` | Carbon `CheckmarkFilled`/`CloseFilled` → Lucide `Check`/`X` |

### Component Migration — Hardcoded Colors → Tailwind Tokens

All inline `backgroundColor` and `color` values across the app are replaced with Tailwind semantic tokens. Key files:

| File | Replace | with |
|------|---------|------|
| `App.jsx` root div | `backgroundColor: '#09090b'` + `color: '#fafafa'` | `bg-background text-foreground` (Tailwind classes, no inline styles) |
| `App.jsx` `<main>` | `backgroundColor: '#09090b'` | `bg-background` |
| `Sidebar.jsx` | `#18181b` bg / `#27272a` border | `var(--sidebar-background)` / `border-border` |
| `TitleBar.jsx` | `#18181b` bg | `var(--titlebar-background)` |
| `Button.jsx` | inline hex colors | `bg-primary`, `bg-muted`, `bg-secondary` variants |
| `spotlight.css` | forced `#18181b` | `var(--background)` |
| `globals.css` scrollbar | `#27272a` / transparent | `var(--scrollbar-thumb)` / `var(--scrollbar-track)` |

All 15+ tool pages: `<textarea>` → `CodeEditor` (if editable) or `HighlightedCode` (if read-only output). EditorToggle controls syntax highlighting per-tool, persisted in `localStorage`.

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
| First visit, no localStorage | Defaults to `"system"` → `matchMedia` detects OS → apply built-in theme |
| User picks built-in (GitHub Dark/Light) | Save to localStorage. Toggle `.dark` class on `<html>`. Clear any JS CSS vars. |
| User picks gallery theme (Dracula) | Save to localStorage. Apply all colors via JS `style.setProperty()`. Ignore `.dark` class. |
| System preference changes | If localStorage is `"system"`, auto-switch between built-in themes. If a gallery theme, no auto-switch. |
| Switching from gallery back to built-in | Clear all inline CSS var overrides. Let `.dark` class and Radix CSS take back over. |
| CodeMirror not yet initialized | Context caches `HighlightStyle` → applied on CodeEditor mount |
| Theme JSON missing a color token | Skip missing token. A fallback CSS var value (`inherit`/`initial`) prevents crash. |
| Tool page with plain textarea | Textarea inherits background/foreground from CSS vars. No syntax highlighting until migrated to CodeEditor. |
| Page migrated to CodeEditor | Receives theme's `HighlightStyle` via context. Both app chrome + code syntax match. |

### Out of Scope (for v1)

- User-created custom themes (saved in localStorage).
- Theme marketplace / import from URL.
- Theme editing UI in Settings.
- Animated theme transitions.

## Testing Strategy

### Unit Tests

1. ThemeProvider renders children, applies CSS vars, generates HighlightStyle.
2. scope-mapping covers all VS Code scopes used in bundled themes.
3. Each bundled theme object has all required color tokens + tokenColors.
4. `buildEditorExtensions` produces valid CodeMirror extensions for each theme.

### E2E Tests — `e2e/theme.spec.js`

Follows the same self-contained pattern as existing tool tests (no page objects, no shared helpers). Covers the full theme lifecycle — default state, switching, persistence, and integration with code display.

| # | Test | Verification |
|---|------|-------------|
| 1 | **Default — system mode** | First visit: `<html>` has no `class="dark"` or has it based on OS preference. Settings modal shows "System" selected. |
| 2 | **Settings modal opens** | Click settings gear → modal visible with Appearance + Behavior sections. |
| 3 | **Switch to light** | Click "Light" in settings → `<html>` class removed (or `dark` removed). Background changes from dark to light. Verifiable via `getComputedStyle`. |
| 4 | **Switch to dark** | Click "Dark" → `<html class="dark">` added. Background changes back. |
| 5 | **Switch back to system** | Click "System" → `<html>` class matches `matchMedia('prefers-color-scheme: dark')` result. |
| 6 | **Persistence across reload** | Switch to "Light", reload page. Settings still shows "Light" selected. Page renders light colors. |
| 7 | **Gallery theme list** | Open settings. Theme picker contains all 8 expected entries (GitHub Dark, GitHub Light, One Dark Pro, Dracula, Nord, Catppuccin Mocha, Solarized Dark, Solarized Light). |
| 8 | **Switch to gallery theme (One Dark Pro)** | Select "One Dark Pro" → CSS vars on `<html>` overridden. `var(--background)` resolves to `#282c34`. |
| 9 | **Gallery theme persists** | Switch to "Dracula", reload page. Theme stays "Dracula". Colors still applied. |
| 10 | **Switch gallery → built-in clears overrides** | Select Dracula → switch to GitHub Light → inline style overrides removed. `var(--background)` reverts to CSS-defined light value. |
| 11 | **Syntax highlighting in CodeEditor** | Navigate to any migrated tool. Input code. Output shows syntax-colored tokens matching active theme's `tokenColors`. |
| 12 | **Syntax theme changes with app theme** | Switch from GitHub Dark → One Dark Pro. CodeEditor colors update immediately to One Dark's keyword/string/etc. colors. |
| 13 | **EditorToggle on/off** | Toggle syntax highlighting off → CodeEditor falls back to plain monospace display. Toggle on → syntax returns. |
| 14 | **EditorToggle persists** | Turn off highlighting for a tool, reload page, navigate to that tool → highlighting still off. |
| 15 | **Settings modal closes correctly** | Open modal → click close/outside → modal hidden. Theme still applied. |

### Visual / Edge Cases

16. Each bundled theme renders correct colors in CodeEditor input + output panes.
17. Each tool page migrates correctly from textarea to CodeEditor/HighlightedCode.
18. System mode auto-toggles when OS preference changes (manual test or mock matchMedia).
19. Missing token color in theme JSON doesn't crash CodeMirror.
20. Carbon-removed components (SettingsModal, ConversionCard, StatusMessages) render correctly.
21. Theme picker in Settings updates app + all open CodeMirror editors immediately.

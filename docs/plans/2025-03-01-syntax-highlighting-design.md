# Syntax Highlighting Design

**Date:** 2025-03-01  
**Status:** Ready for Implementation  
**Scope:** Add syntax highlighting to code display and editing components across the devtoolbox

---

## Overview

Add syntax highlighting capabilities to the devtoolbox using CodeMirror 6, with per-tool toggle persistence and Carbon Design System theming.

**Key Principles:**
- Highlighting ON by default (opt-out)
- Per-tool persistence (each tool remembers its own setting)
- Lazy loading of language modules for performance
- Graceful fallback to plain TextArea when disabled or on error

---

## Goals

1. Replace plain text areas with syntax-highlighted code editors in CodeFormatter
2. Update CodeSnippetsPanel to use highlighted display for all 11 language tabs
3. Add toggle controls for enabling/disabling highlighting per tool
4. Maintain Carbon Design System visual consistency
5. Support 8 languages initially: JSON, JavaScript, HTML, XML, CSS, SQL, Swift, Java

---

## Architecture

### Components

Three new components in `/frontend/src/components/inputs/`:

#### 1. CodeEditor.jsx
Editable code editor with CodeMirror integration.

```jsx
<CodeEditor
  value={code}
  language="json"           // One of supported languages
  onChange={(value) => {}}  // Optional callback
  readOnly={false}          // Edit or view-only mode
  highlight={true}          // Controlled by tool toggle
  placeholder="Paste code..."
  className="optional-class"
/>
```

**Responsibilities:**
- Load CodeMirror dynamically when highlight=true
- Apply Carbon dark theme (g100) to editor
- Manage editor lifecycle (create/destroy on toggle)
- Fall back to native TextArea when highlight=false

#### 2. HighlightedCode.jsx
Read-only code display for snippets and output panes.

```jsx
<HighlightedCode
  code={snippet}
  language="css"
  copyable={true}
  showLineNumbers={false}
  className="optional-class"
/>
```

**Replaces:** `<pre>` tags in CodeSnippetsPanel and read-only TextArea in ToolPane

#### 3. EditorToggle.jsx
Toggle button for ToolControls section.

```jsx
<EditorToggle 
  enabled={highlightEnabled} 
  onToggle={setHighlightEnabled}
  toolKey="codeFormatter"   // For localStorage key generation
/>
```

**UI:**
- Icon button with Code icon
- Tooltip: "Syntax highlighting: On/Off"
- Persists to localStorage immediately on toggle

### State Management

Each tool manages its own highlighting state:

```javascript
// localStorage key pattern
`${toolKey}-editor-highlight`: 'true' | 'false'

// Examples
'codeFormatter-editor-highlight': 'true'
'colorConverter-editor-highlight': 'false'
```

**Default:** ON for new users (opt-out model)

**Persistence:** Immediate write to localStorage on toggle

### Lazy Loading Strategy

Language modules load on-demand via dynamic imports:

```javascript
const loadLanguage = async (lang) => {
  const languageModules = {
    json: () => import('@codemirror/lang-json'),
    javascript: () => import('@codemirror/lang-javascript'),
    typescript: () => import('@codemirror/lang-javascript'), // TS uses JS grammar
    html: () => import('@codemirror/lang-html'),
    xml: () => import('@codemirror/lang-xml'),
    css: () => import('@codemirror/lang-css'),
    sql: () => import('@codemirror/lang-sql'),
    swift: () => import('@codemirror/legacy-modes/mode/swift'),
    java: () => import('@codemirror/lang-java'),
  };
  
  const loader = languageModules[lang];
  if (!loader) return null;
  
  const module = await loader();
  return module[lang === 'swift' ? 'swift' : `${lang}Language`];
};
```

**Caching:** Modules cached after first load (browser cache + memory)

### Tools to Enhance

1. **CodeFormatter** (`/pages/CodeFormatter/index.jsx`)
   - Add EditorToggle to ToolControls
   - Replace input ToolPane with CodeEditor
   - Replace output ToolPane with CodeEditor (readOnly)

2. **ColorConverter** (`/pages/ColorConverter/components/CodeSnippetsPanel.jsx`)
   - Replace `<pre>` with HighlightedCode
   - All 11 language tabs benefit automatically

3. **JWTDebugger** (if exists)
   - Add EditorToggle
   - Highlight header/payload JSON display

4. **TextDiffChecker** (if exists)
   - Add EditorToggle
   - Highlight diff output

---

## Data Flow

```
User loads tool
    ↓
Load persisted preference from localStorage (default: true)
    ↓
highlight=true?
    ├─ YES → Dynamically import CodeMirror + language module
    │        ↓
    │        Mount CodeMirror with Carbon theme
    │        ↓
    │        Render highlighted editor
    │
    └─ NO  → Render native TextArea (fallback)
    
User toggles EditorToggle
    ↓
Update state + persist to localStorage
    ↓
Re-render: mount/unmount CodeMirror accordingly
```

---

## Error Handling

### CodeMirror Load Failure
- **Cause:** Network error, CDN unreachable
- **Behavior:** Fall back to TextArea, show subtle warning icon with tooltip
- **User message:** "Syntax highlighting unavailable"

### Unsupported Language
- **Cause:** Language prop not in supported list
- **Behavior:** Render as plain text (no highlighting)
- **Dev:** Console warning in development mode

### Large Files (>1MB)
- **Detection:** Check content length on value change
- **Behavior:** Auto-disable highlighting, show info banner
- **User message:** "Large file - highlighting disabled for performance"
- **Override:** User can manually re-enable via toggle

### Touch Devices
- **Detection:** `window.matchMedia('(pointer: coarse)')`
- **Behavior:** Default to OFF on mobile/tablet (better UX with native input)
- **Override:** User can still enable if desired

### localStorage Corruption
- **Behavior:** Parse error caught, reset to default (ON)
- **User impact:** None, silent recovery

### Memory Cleanup
- **Implementation:** `useEffect` cleanup function destroys CodeMirror instance
- **Trigger:** Component unmount or toggle OFF

---

## Styling (Carbon Integration)

CodeMirror theme maps to Carbon tokens:

```javascript
const carbonDarkTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--cds-field)',
    color: 'var(--cds-text-primary)',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.875rem',
  },
  '.cm-content': {
    caretColor: 'var(--cds-focus)',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--cds-focus)',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'var(--cds-highlight)',
  },
  // Syntax colors - subtle, accessible
  '.cm-keyword': { color: 'var(--cds-text-primary)' },
  '.cm-string': { color: 'var(--cds-support-success)' },
  '.cm-number': { color: 'var(--cds-support-info)' },
  '.cm-comment': { color: 'var(--cds-text-secondary)' },
  // ... etc
});
```

**Visual consistency:**
- Matches Carbon g100 dark theme
- Uses IBM Plex Mono for code
- Respects `--cds-*` CSS custom properties

---

## Dependencies

### New Packages
```json
{
  "@codemirror/commands": "^6.0.0",
  "@codemirror/lang-css": "^6.0.0",
  "@codemirror/lang-html": "^6.0.0",
  "@codemirror/lang-java": "^6.0.0",
  "@codemirror/lang-javascript": "^6.0.0",
  "@codemirror/lang-json": "^6.0.0",
  "@codemirror/lang-sql": "^6.0.0",
  "@codemirror/lang-xml": "^6.0.0",
  "@codemirror/language": "^6.0.0",
  "@codemirror/legacy-modes": "^6.0.0", // For Swift
  "@codemirror/state": "^6.0.0",
  "@codemirror/view": "^6.0.0",
  "codemirror": "^6.0.0"
}
```

**Estimated bundle impact:** ~200-300KB for all 8 languages (tree-shaken, loaded on demand)

---

## Testing Checklist

### Manual Testing
- [ ] Toggle persists across refresh for each tool
- [ ] Language switching works (CodeFormatter JSON→XML)
- [ ] Large file (>1MB) auto-disables highlighting
- [ ] Copy button works in CodeEditor/HighlightedCode
- [ ] Mobile defaults to OFF
- [ ] Network failure shows graceful fallback

### Component Tests
- [ ] CodeEditor renders TextArea when highlight=false
- [ ] CodeEditor loads CodeMirror when highlight=true
- [ ] EditorToggle calls onToggle and persists
- [ ] HighlightedCode displays with correct language

### Bundle Analysis
- [ ] Verify lazy loading (CodeMirror not in main chunk)
- [ ] Target: <300KB size increase

### Accessibility
- [ ] Toggle has aria-label
- [ ] Contrast ratios meet WCAG 2.1 AA
- [ ] Keyboard navigation works

---

## Migration Path

1. **Phase 1:** Create CodeEditor, HighlightedCode, EditorToggle components
2. **Phase 2:** Update CodeFormatter (input + output panes)
3. **Phase 3:** Update CodeSnippetsPanel (all language tabs)
4. **Phase 4:** Add to JWTDebugger and TextDiffChecker
5. **Phase 5:** Remove legacy ToolPane usage in favor of CodeEditor

---

## Open Questions

1. Should we add TypeScript support explicitly or rely on JavaScript grammar?
2. Do we want line numbers as a separate toggle or always on/off?
3. Should the large file threshold be configurable?

---

## Appendix: File Locations

**New files:**
- `/frontend/src/components/inputs/CodeEditor.jsx`
- `/frontend/src/components/inputs/HighlightedCode.jsx`
- `/frontend/src/components/inputs/EditorToggle.jsx`

**Modified files:**
- `/frontend/src/components/inputs/index.js` - Add exports
- `/frontend/src/pages/CodeFormatter/index.jsx` - Add EditorToggle, use CodeEditor
- `/frontend/src/pages/ColorConverter/components/CodeSnippetsPanel.jsx` - Use HighlightedCode
- `/frontend/package.json` - Add CodeMirror dependencies

**Theme file (optional):**
- `/frontend/src/components/inputs/carbonCodeMirrorTheme.js` - Extracted theme constants

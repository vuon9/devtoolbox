# Code Formatter Tool Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the Code Formatter tool with auto-formatting, sample generation, language-specific filtering, and focused markup language support (JSON, XML, HTML, CSS only)

**Architecture:** Fix backend Wails binding and formatting logic, then completely rewrite frontend with auto-formatting (300ms debounce), sample buttons, minify toggle, and syntax-highlighted output with PrismJS

**Tech Stack:** Go (Wails v3), React, PrismJS (syntax highlighting), gojq (JSON filtering), golang.org/x/net/html (HTML/CSS selectors)

---

## File Structure

**Backend:**
- `internal/codeformatter/service.go` - Core formatting logic (fix existing)
- `service/codeformatter.go` - Wails binding layer (fix request/response handling)

**Frontend:**
- `frontend/src/pages/CodeFormatter/index.jsx` - Complete rewrite of UI component
- `frontend/package.json` - Add PrismJS dependency

---

## Task 1: Fix Backend Wails Binding

**Files:**
- Modify: `service/codeformatter.go`
- Test: `service/codeformatter.go` works via Wails

The current Wails binding uses the wrong request/response structure. Fix it to match the actual FormatRequest/FormatResponse types.

- [ ] **Step 1: Examine current Wails binding structure**

Read `service/codeformatter.go` and `internal/codeformatter/service.go` to understand the current request/response mismatch.

- [ ] **Step 2: Fix the Format method signature**

The Format method should accept `codeformatter.FormatRequest` and return `codeformatter.FormatResponse`:

```go
// Format formats code based on the request
// This method is exposed to the frontend via Wails
func (c *CodeFormatterService) Format(req codeformatter.FormatRequest) codeformatter.FormatResponse {
	return c.svc.Format(req)
}
```

- [ ] **Step 3: Verify the binding compiles**

Run: `cd /Users/vuong/workspace/vuon9/devtoolbox && go build ./service/...`

Expected: No compilation errors

- [ ] **Step 4: Commit**

```bash
git add service/codeformatter.go
git commit -m "fix: correct Wails binding request/response types"
```

---

## Task 2: Remove Unwanted Languages from Backend

**Files:**
- Modify: `internal/codeformatter/service.go`

Remove Java, JavaScript, and SQL support from the backend.

- [ ] **Step 1: Locate the Format switch statement**

Find the switch statement around line 45 in `internal/codeformatter/service.go`.

- [ ] **Step 2: Remove JavaScript and Java cases**

Remove these cases from the switch:
```go
case "javascript", "js":
	return s.formatJavaScript(req)
case "java":
	return FormatResponse{Error: "unsupported format type: java"}
```

- [ ] **Step 3: Remove SQL case**

Remove this case from the switch:
```go
case "sql":
	return s.formatSQL(req)
```

- [ ] **Step 4: Remove unused format methods**

Remove these methods from the file:
- `formatSQL()` (around line 1160)
- `formatSQLSimple()` (around line 1167)
- `formatJavaScript()` (around line 1286)
- `formatJSSimple()` (around line 1300)
- `minifyJS()` (around line 1340)

- [ ] **Step 5: Remove unused helper**

Remove `regexpReplaceAllString()` method (around line 1402) if not used elsewhere.

- [ ] **Step 6: Verify compilation**

Run: `cd /Users/vuong/workspace/vuon9/devtoolbox && go build ./internal/codeformatter/...`

Expected: No compilation errors

- [ ] **Step 7: Commit**

```bash
git add internal/codeformatter/service.go
git commit -m "refactor: remove Java, JavaScript, and SQL support"
```

---

## Task 3: Install PrismJS Dependency

**Files:**
- Modify: `frontend/package.json`
- Run: `npm install` in frontend directory

- [ ] **Step 1: Add PrismJS to package.json**

In `frontend/package.json`, add to dependencies:
```json
"prismjs": "^1.29.0"
```

- [ ] **Step 2: Install the dependency**

```bash
cd /Users/vuong/workspace/vuon9/devtoolbox/frontend
npm install
```

Expected: prismjs installed in node_modules

- [ ] **Step 3: Commit**

```bash
git add frontend/package.json frontend/package-lock.json
git commit -m "deps: add PrismJS for syntax highlighting"
```

---

## Task 4: Rewrite Frontend - Component Structure

**Files:**
- Create: `frontend/src/pages/CodeFormatter/index.jsx` (complete rewrite)

- [ ] **Step 1: Import required dependencies**

```jsx
import React, { useState, useEffect, useCallback } from 'react';
import { FileText, Zap, Filter } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-xml-doc';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css';
import { Format } from '../../generated/wails/codeFormatterService';
```

- [ ] **Step 2: Define supported languages and sample data**

```jsx
const languages = [
  { id: 'json', label: 'JSON', icon: Braces },
  { id: 'xml', label: 'XML', icon: Code2 },
  { id: 'html', label: 'HTML', icon: Code },
  { id: 'css', label: 'CSS', icon: Code },
];

const sampleData = {
  json: '{"users":[{"name":"Alice","age":30},{"name":"Bob","age":25}],"count":2}',
  xml: '<?xml version="1.0"?><catalog><book id="1"><title>Example</title><author>John</author></book></catalog>',
  html: '<!DOCTYPE html><html><head><title>Test</title></head><body><div class="header"><h1>Welcome</h1></div></body></html>',
  css: '.container { display: flex; padding: 20px; } .header { background: #333; color: white; }',
};

const filterPlaceholders = {
  json: '.users[].name',
  xml: '//book',
  html: '.header',
  css: '',
};
```

- [ ] **Step 3: Create main component structure**

```jsx
export default function CodeFormatter() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState(() => localStorage.getItem('code-formatter-lang') || 'json');
  const [filter, setFilter] = useState('');
  const [minify, setMinify] = useState(false);
  const [error, setError] = useState('');
  const [isFormatting, setIsFormatting] = useState(false);

  // ... rest of component
}
```

- [ ] **Step 4: Implement auto-formatting with debounce**

```jsx
const debouncedFormat = useCallback(
  debounce(async (content, lang, filterText, minifyMode) => {
    if (!content.trim()) {
      setOutput('');
      setError('');
      return;
    }
    
    setIsFormatting(true);
    setError('');
    
    try {
      const result = await Format({
        Input: content,
        FormatType: lang,
        Filter: filterText,
        Minify: minifyMode,
      });
      
      if (result.Error) {
        setError(result.Error);
        setOutput('');
      } else {
        setOutput(result.Output);
      }
    } catch (err) {
      setError(err.message || 'Formatting failed');
      setOutput('');
    } finally {
      setIsFormatting(false);
    }
  }, 300),
  []
);

useEffect(() => {
  debouncedFormat(input, language, filter, minify);
}, [input, language, filter, minify, debouncedFormat]);
```

- [ ] **Step 5: Add debounce helper function**

```javascript
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}
```

- [ ] **Step 6: Commit partial progress**

```bash
git add frontend/src/pages/CodeFormatter/index.jsx
git commit -m "wip: add component structure and auto-formatting logic"
```

---

## Task 5: Rewrite Frontend - UI Components

**Files:**
- Modify: `frontend/src/pages/CodeFormatter/index.jsx`

- [ ] **Step 1: Create ToolHeader component**

```jsx
function ToolHeader({ title, description }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.025em', color: '#f4f4f5' }}>
        {title}
      </h2>
      <p style={{ color: '#a1a1aa', marginTop: '4px', fontSize: '14px' }}>{description}</p>
    </div>
  );
}
```

- [ ] **Step 2: Create LanguageSelect component**

```jsx
function LanguageSelect({ value, onChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedLang = languages.find((l) => l.id === value) || languages[0];
  
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          height: '36px',
          padding: '0 12px',
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '6px',
          color: '#f4f4f5',
          fontSize: '14px',
          cursor: 'pointer',
          minWidth: '140px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <selectedLang.icon style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
          <span>{selectedLang.label}</span>
        </div>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.5 }}>
          <path d="M6 9l6 6 6-6" />
        </svg>
      </button>
      
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '4px',
            backgroundColor: '#18181b',
            border: '1px solid #27272a',
            borderRadius: '6px',
            overflow: 'hidden',
            zIndex: 10,
          }}
        >
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => {
                onChange(lang.id);
                setIsOpen(false);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '8px 12px',
                backgroundColor: value === lang.id ? '#27272a' : 'transparent',
                border: 'none',
                color: '#f4f4f5',
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <lang.icon style={{ width: '16px', height: '16px', color: '#3b82f6' }} />
              <span>{lang.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create SampleButton component**

```jsx
function SampleButton({ onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        height: '36px',
        padding: '0 12px',
        backgroundColor: '#27272a',
        border: '1px solid #3f3f46',
        borderRadius: '6px',
        color: '#a1a1aa',
        fontSize: '13px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
      }}
    >
      <FileText style={{ width: '14px', height: '14px' }} />
      Load Sample
    </button>
  );
}
```

- [ ] **Step 4: Create MinifyButton component**

```jsx
function MinifyButton({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        height: '36px',
        padding: '0 12px',
        backgroundColor: active ? '#2563eb' : '#27272a',
        border: `1px solid ${active ? '#2563eb' : '#3f3f46'}`,
        borderRadius: '6px',
        color: active ? '#ffffff' : '#a1a1aa',
        fontSize: '13px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
    >
      <Zap style={{ width: '14px', height: '14px' }} />
      Minify
    </button>
  );
}
```

- [ ] **Step 5: Create InputPane component**

```jsx
function InputPane({ value, onChange, placeholder }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#71717a', fontWeight: 600, letterSpacing: '0.05em' }}>
          Input
        </span>
      </div>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{
          flex: 1,
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          borderRadius: '8px',
          padding: '12px',
          color: '#f4f4f5',
          fontFamily: "'IBM Plex Mono', 'Menlo', monospace",
          fontSize: '13px',
          lineHeight: 1.5,
          resize: 'none',
          outline: 'none',
        }}
      />
    </div>
  );
}
```

- [ ] **Step 6: Create OutputPane component with syntax highlighting**

```jsx
function OutputPane({ content, language, error }) {
  useEffect(() => {
    if (content) {
      Prism.highlightAll();
    }
  }, [content]);
  
  const getPrismLanguage = (lang) => {
    switch (lang) {
      case 'json': return 'json';
      case 'xml': return 'xml';
      case 'html': return 'markup';
      case 'css': return 'css';
      default: return 'text';
    }
  };
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', color: '#71717a', fontWeight: 600, letterSpacing: '0.05em' }}>
          Formatted Output
        </span>
      </div>
      
      <div
        style={{
          flex: 1,
          backgroundColor: '#18181b',
          border: error ? '1px solid #ef4444' : '1px solid #27272a',
          borderRadius: '8px',
          padding: '12px',
          overflow: 'auto',
          marginBottom: '8px',
        }}
      >
        {content ? (
          <pre style={{ margin: 0, background: 'transparent' }}>
            <code className={`language-${getPrismLanguage(language)}`} style={{ background: 'transparent', padding: 0 }}>
              {content}
            </code>
          </pre>
        ) : (
          <span style={{ color: '#3f3f46', fontFamily: "'IBM Plex Mono', monospace", fontSize: '13px' }}>
            Result will appear here...
          </span>
        )}
      </div>
      
      {error && (
        <div
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            color: '#ef4444',
            fontSize: '12px',
            fontFamily: "'IBM Plex Mono', monospace",
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Create FilterBar component**

```jsx
function FilterBar({ value, onChange, placeholder, show }) {
  if (!show) return null;
  
  return (
    <div
      style={{
        display: 'flex',
        gap: '10px',
        padding: '8px 12px',
        backgroundColor: '#27272a',
        borderRadius: '6px',
        alignItems: 'center',
        border: '1px solid #3f3f46',
      }}
    >
      <Filter style={{ width: '16px', height: '16px', color: '#a1a1aa', flexShrink: 0 }} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          flex: 1,
          backgroundColor: 'transparent',
          border: 'none',
          color: '#f4f4f5',
          padding: '4px 0',
          fontSize: '13px',
          fontFamily: "'IBM Plex Mono', monospace",
          outline: 'none',
        }}
      />
    </div>
  );
}
```

- [ ] **Step 8: Commit progress**

```bash
git add frontend/src/pages/CodeFormatter/index.jsx
git commit -m "wip: add all UI sub-components"
```

---

## Task 6: Rewrite Frontend - Main Layout

**Files:**
- Modify: `frontend/src/pages/CodeFormatter/index.jsx`

- [ ] **Step 1: Add main layout JSX**

Add the main return statement that assembles all components:

```jsx
return (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      padding: '24px',
      overflow: 'hidden',
      backgroundColor: '#09090b',
    }}
  >
    <ToolHeader
      title="Code Formatter"
      description="Clean up and prettify your markup. Supports JSON, XML, HTML, and CSS with intelligent formatting and filtering."
    />
    
    {/* Top Controls */}
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '16px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: '#71717a',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}
        >
          Language
        </span>
        <LanguageSelect value={language} onChange={handleLanguageChange} />
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <SampleButton onClick={handleLoadSample} disabled={isFormatting} />
        <MinifyButton active={minify} onClick={() => setMinify(!minify)} />
      </div>
    </div>
    
    {/* Main Content Area */}
    <div style={{ flex: 1, minHeight: 0, display: 'flex', gap: '16px' }}>
      <InputPane
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={`Paste your ${language.toUpperCase()} here...`}
      />
      
      <OutputPane
        content={output}
        language={language}
        error={error}
      >
        <FilterBar
          value={filter}
          onChange={setFilter}
          placeholder={filterPlaceholders[language]}
          show={language !== 'css'}
        />
      </OutputPane>
    </div>
  </div>
);
```

- [ ] **Step 2: Add handler functions**

Add these functions inside the main component:

```jsx
const handleLanguageChange = (newLang) => {
  setLanguage(newLang);
  localStorage.setItem('code-formatter-lang', newLang);
  setFilter(''); // Reset filter when changing languages
};

const handleLoadSample = () => {
  setInput(sampleData[language]);
};
```

- [ ] **Step 3: Verify complete component**

Read the entire file to ensure all parts are connected properly:

```bash
cat frontend/src/pages/CodeFormatter/index.jsx | head -100
```

- [ ] **Step 4: Commit final frontend**

```bash
git add frontend/src/pages/CodeFormatter/index.jsx
git commit -m "feat: complete frontend rewrite with auto-formatting, samples, and syntax highlighting"
```

---

## Task 7: Build and Test

**Files:**
- Test entire application

- [ ] **Step 1: Build the application**

```bash
cd /Users/vuong/workspace/vuon9/devtoolbox
task build
```

Alternative if Task is not available:
```bash
cd /Users/vuong/workspace/vuon9/devtoolbox && go build -o bin/devtoolbox .
```

Expected: Build completes without errors

- [ ] **Step 2: Run dev server and test**

```bash
npm run dev
```

Open the app and verify:
1. Language dropdown shows only JSON, XML, HTML, CSS
2. Load Sample button generates correct sample data
3. Typing in input auto-formats output (300ms delay)
4. Minify button toggles and changes output
5. Filter bar appears for JSON/XML/HTML (not CSS)
6. Filter icon visible, no text label
7. Syntax highlighting works in output
8. Errors display properly

- [ ] **Step 3: Test edge cases**

- Empty input → No output
- Invalid syntax → Error message displays
- Invalid filter → Specific error message
- Switching languages → Filter resets
- Minify on/off → Output changes correctly

- [ ] **Step 4: Commit if all tests pass**

```bash
git commit -m "test: verify code formatter functionality"
```

---

## Success Criteria Verification

- [ ] ✅ Typing in input auto-formats output within 300ms of pause
- [ ] ✅ Sample button generates appropriate code for each language
- [ ] ✅ Minify button toggles between pretty and minified output
- [ ] ✅ Filters work correctly for JSON (jq), XML (XPath), HTML (CSS)
- [ ] ✅ Java and JavaScript removed from language options
- [ ] ✅ SQL removed from language options
- [ ] ✅ Clear error messages for invalid syntax or filters
- [ ] ✅ No "Format Code" button required
- [ ] ✅ Syntax highlighting in output area
- [ ] ✅ Filter bar has icon (no text label) and borderless input

---

## Plan Complete

**Plan saved to:** `docs/superpowers/plans/2026-03-29-code-formatter-implementation.md`

**Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach would you like to use?**

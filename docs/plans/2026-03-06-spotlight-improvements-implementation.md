# Spotlight Improvements Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix global hotkey activation and redesign spotlight results as unified 400px scrollable panel

**Architecture:** Update Go backend to register reliable global hotkey (`Cmd+Shift+Space`/`Ctrl+Shift+Space`), modify window dimensions, and redesign React frontend with unified glassmorphism panel (no gaps) with fixed 400px results area.

**Tech Stack:** Go (Wails v3), React, Carbon Design System, CSS3

---

## Overview

This plan implements three key improvements:
1. **Global hotkey fix** - Change from `Cmd+Ctrl+M` to `Cmd+Shift+Space` for reliability
2. **Unified results panel** - Redesign as single glass panel with search box + 400px scrollable results
3. **Navigation enhancement** - Ensure tool pages open with pre-filled options from query params

---

## Task 1: Update Global Hotkey Registration

**Files:**
- Modify: `main.go:268-279`
- Test: Manual testing (hotkey functionality)

**Step 1: Update hotkey accelerator constant**

Current code (lines 268-273):
```go
var hotkeyAccelerator string
if runtime.GOOS == "darwin" {
    hotkeyAccelerator = "Cmd+Ctrl+M"
} else {
    hotkeyAccelerator = "Ctrl+Alt+M"
}
```

Replace with:
```go
var hotkeyAccelerator string
if runtime.GOOS == "darwin" {
    hotkeyAccelerator = "Cmd+Shift+Space"
} else {
    hotkeyAccelerator = "Ctrl+Shift+Space"
}
```

**Step 2: Update tray menu hotkey label**

Current code (line 256):
```go
trayMenu.Add("Open Spotlight (Cmd+Ctrl+M)").OnClick(func(ctx *application.Context) {
```

Replace with:
```go
trayMenu.Add("Open Spotlight (Cmd+Shift+Space)").OnClick(func(ctx *application.Context) {
```

**Step 3: Verify hotkey registration error handling**

Ensure this comment exists (line 278):
```go
// Note: Wails v3 doesn't return an error from KeyBinding.Add - errors are logged internally
```

**Step 4: Test hotkey**

Run: `go run .` or `wails dev`
Expected: Application starts without errors
Test: Press `Cmd+Shift+Space` (macOS) or `Ctrl+Shift+Space` (Windows/Linux)
Expected: Spotlight window toggles (show/hide)

**Step 5: Commit**

```bash
git add main.go
git commit -m "fix(spotlight): change global hotkey to Cmd+Shift+Space for reliability"
```

---

## Task 2: Update Spotlight Window Dimensions

**Files:**
- Modify: `main.go:154-180`
- Modify: `frontend/src/spotlight.css:12`
- Test: Visual verification

**Step 1: Update window height in main.go**

Current code (line 157):
```go
Height:    80,
```

Replace with:
```go
Height:    480, // 80px search + 400px results
```

**Step 2: Add min/max height constraints**

Add to `application.WebviewWindowOptions` (after line 158):
```go
MinHeight: 80,
MaxHeight: 480,
```

**Step 3: Update CSS to center spotlight vertically**

Current code (`frontend/src/spotlight.css` line 12):
```css
padding-top: 20vh;
```

Replace with:
```css
padding-top: 15vh; /* Adjusted for taller window */
```

**Step 4: Build and test**

Run: `wails build` or test in dev mode
Expected: Spotlight window opens at 480px height

**Step 5: Commit**

```bash
git add main.go frontend/src/spotlight.css
git commit -m "feat(spotlight): update window height to 480px for results panel"
```

---

## Task 3: Redesign Results Panel as Unified Component

**Files:**
- Modify: `frontend/src/components/SpotlightPalette.jsx:333-382`
- Modify: `frontend/src/components/SpotlightPalette.css:1-157`
- Test: Visual verification

**Step 1: Update container structure in JSX**

Current code (lines 333-382 in SpotlightPalette.jsx):
```jsx
return (
    <div className="spotlight-container">
      <div className="spotlight-search-box">
        {/* Search input */}
      </div>

      <div className="spotlight-results">
        {/* Results list */}
      </div>
    </div>
  );
```

Replace with:
```jsx
return (
    <div className="spotlight-container">
      <div className="spotlight-search-section">
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
      </div>

      <div className="spotlight-results-section">
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
```

**Step 2: Update CSS for unified panel design**

Replace entire content of `frontend/src/components/SpotlightPalette.css`:

```css
/* Unified spotlight container */
.spotlight-container {
  width: 640px;
  max-width: 90vw;
  background: rgba(30, 30, 30, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.03);
  overflow: hidden;
  backdrop-filter: blur(32px) saturate(200%);
  -webkit-backdrop-filter: blur(32px) saturate(200%);
  display: flex;
  flex-direction: column;
}

/* Search section */
.spotlight-search-section {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.spotlight-search-box {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.spotlight-search-icon {
  color: var(--cds-text-secondary);
  flex-shrink: 0;
  opacity: 0.7;
}

.spotlight-input {
  flex: 1;
  background: transparent;
  border: none;
  color: var(--cds-text-primary);
  font-size: 1.25rem;
  font-weight: 400;
  padding: 0;
  outline: none;
  font-family: var(--cds-font-sans);
  letter-spacing: -0.01em;
}

.spotlight-input::placeholder {
  color: var(--cds-text-secondary);
  opacity: 0.6;
}

.spotlight-clear-btn {
  background: transparent;
  border: none;
  color: var(--cds-text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.15s ease;
  opacity: 0.7;
}

.spotlight-clear-btn:hover {
  background: var(--cds-layer-hover);
  opacity: 1;
}

/* Results section - fixed 400px height */
.spotlight-results-section {
  height: 400px;
  overflow: hidden;
  flex-shrink: 0;
}

.spotlight-empty {
  padding: 2.5rem 1.5rem;
  text-align: center;
  color: var(--cds-text-secondary);
  font-size: 0.875rem;
  opacity: 0.8;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.spotlight-list {
  overflow-y: auto;
  height: 100%;
  padding: 0.5rem 0;
}

.spotlight-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.625rem 1.5rem;
  cursor: pointer;
  transition: all 0.12s ease;
  margin: 0 0.5rem;
  border-radius: 6px;
}

.spotlight-item:hover,
.spotlight-item.selected {
  background: var(--cds-layer-hover);
}

.spotlight-item.selected {
  background: var(--cds-layer-selected);
}

.spotlight-item-content {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  flex: 1;
  min-width: 0;
}

.spotlight-item-icon {
  color: var(--cds-text-secondary);
  flex-shrink: 0;
  opacity: 0.8;
}

.spotlight-item-label {
  color: var(--cds-text-primary);
  font-size: 0.9375rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 400;
}

.spotlight-item-category {
  color: var(--cds-text-secondary);
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  flex-shrink: 0;
  margin-left: 1rem;
  padding: 0.25rem 0.625rem;
  background: var(--cds-layer-active);
  border-radius: 4px;
  font-weight: 500;
  opacity: 0.8;
}

/* Scrollbar styling */
.spotlight-list::-webkit-scrollbar {
  width: 6px;
}

.spotlight-list::-webkit-scrollbar-track {
  background: transparent;
  margin: 0.5rem 0;
}

.spotlight-list::-webkit-scrollbar-thumb {
  background: var(--cds-border-subtle);
  border-radius: 3px;
}

.spotlight-list::-webkit-scrollbar-thumb:hover {
  background: var(--cds-text-secondary);
}
```

**Step 3: Test visual appearance**

Run: `wails dev`
Expected:
- Spotlight window opens at 480px height
- Search box at top with proper padding
- Results area below with 400px fixed height
- No gap between search and results sections
- Unified glassmorphism effect across both sections
- Border-radius applies to entire container

**Step 4: Test scroll behavior**

Test: Type "format" to filter results
Expected:
- Results list shows matching commands
- If results exceed visible area, scrollbar appears
- Scrolling works smoothly with mouse/trackpad
- Keyboard navigation (↑/↓) scrolls selected item into view

**Step 5: Commit**

```bash
git add frontend/src/components/SpotlightPalette.jsx frontend/src/components/SpotlightPalette.css
git commit -m "feat(spotlight): redesign results panel as unified 400px scrollable component"
```

---

## Task 4: Verify Navigation with Pre-filled Options

**Files:**
- Review: `main.go:192-203`
- Review: `frontend/src/components/SpotlightPalette.jsx:267-294`
- Test: End-to-end functionality

**Step 1: Review existing navigation flow**

Verify `main.go` lines 192-203:
```go
// Listen for spotlight navigation events
app.Event.On("spotlight:command-selected", func(event *application.CustomEvent) {
    path := event.Data.(string)
    log.Printf("Spotlight command selected: %s", path)

    // Show and focus main window
    mainWindow.Show()
    mainWindow.Focus()

    // Emit navigation event to frontend
    mainWindow.EmitEvent("navigate:to", path)
})
```

**Step 2: Review command path format in SpotlightPalette.jsx**

Verify commands include query params (lines 8-145):
- `formatter-json` path: `/tool/code-formatter?format=json`
- `converter-base64` path: `/tool/text-converter?category=Encode%20-%20Decode&method=Base64`
- etc.

**Step 3: Verify spotlight closes immediately**

Verify `executeCommand` function (lines 267-294):
```javascript
const executeCommand = useCallback(
  (command) => {
    saveRecentCommand(command.id);

    if (command.action) {
      // Handle actions...
    } else if (command.path) {
      // Emit command selected event with path
      window.runtime?.EventsEmit?.('spotlight:command-selected', command.path);
    }

    // Close spotlight
    window.runtime?.EventsEmit?.('spotlight:close');
  },
  [saveRecentCommand]
);
```

**Step 4: Test end-to-end navigation**

Run: `wails dev`
Test:
1. Open spotlight with hotkey (`Cmd+Shift+Space`)
2. Type "json" and select "Format JSON"
3. **Expected behavior:**
   - Spotlight closes immediately
   - Main window opens/focuses
   - Main window navigates to `/tool/code-formatter?format=json`
   - Code formatter tool opens with "JSON" format pre-selected

**Step 5: Test another command**

Test:
1. Open spotlight
2. Select "Base64 Encode/Decode"
3. **Expected:** Main window opens with Text Converter tool, "Encode - Decode" category and "Base64" method pre-selected

**Step 6: Commit (if any fixes needed)**

If fixes were required:
```bash
git add <files>
git commit -m "fix(spotlight): ensure navigation with pre-filled options works correctly"
```

Otherwise, no commit needed (functionality already working).

---

## Task 5: Add CSS Transition for Smooth Appearance

**Files:**
- Modify: `frontend/src/components/SpotlightPalette.css`
- Test: Visual smoothness

**Step 1: Add transition to container**

Add to `.spotlight-container` in CSS:
```css
.spotlight-container {
  /* ... existing styles ... */
  transition: all 0.2s ease-out;
}
```

**Step 2: Add subtle fade-in for results**

Add to `.spotlight-results-section`:
```css
.spotlight-results-section {
  /* ... existing styles ... */
  animation: fadeIn 0.15s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

**Step 3: Test transitions**

Run: `wails dev`
Test: Open spotlight, type to filter results
Expected: Smooth fade-in animation when results appear

**Step 4: Commit**

```bash
git add frontend/src/components/SpotlightPalette.css
git commit -m "feat(spotlight): add smooth transitions for panel appearance"
```

---

## Task 6: Final Integration Testing

**Files:**
- All modified files
- Test: Complete user flows

**Step 1: Test complete hotkey flow**

1. Start application fresh
2. Press `Cmd+Shift+Space` (macOS) or `Ctrl+Shift+Space` (Windows/Linux)
3. Expected: Spotlight opens centered on screen
4. Press same hotkey again
5. Expected: Spotlight closes
6. Repeat 3 times to ensure reliability

**Step 2: Test search and selection flow**

1. Open spotlight
2. Type "format" 
3. Use arrow keys to navigate results
4. Press Enter to select
5. Expected: Spotlight closes, main window opens with correct tool pre-filled

**Step 3: Test mouse interaction**

1. Open spotlight
2. Type "base64"
3. Click on "Base64 Encode/Decode" result
4. Expected: Same behavior as keyboard selection

**Step 4: Test empty state**

1. Open spotlight
2. Type "xyz123" (nonsense query)
3. Expected: "No commands found" message displayed centered in results area

**Step 5: Test Esc key**

1. Open spotlight
2. Press Escape key
3. Expected: Spotlight closes

**Step 6: Run build to ensure no errors**

Run: `wails build`
Expected: Build completes successfully with no errors

**Step 7: Final commit**

```bash
git add .
git commit -m "feat(spotlight): complete improvements - reliable hotkey, unified panel, pre-filled navigation"
```

---

## Testing Checklist

Verify all these before considering complete:

- [ ] Hotkey `Cmd+Shift+Space` / `Ctrl+Shift+Space` toggles spotlight reliably
- [ ] Tray menu shows updated hotkey label
- [ ] Spotlight window opens at 480px height
- [ ] Results panel displays at fixed 400px height
- [ ] No gap between search and results sections
- [ ] Unified glassmorphism styling across entire panel
- [ ] Results scroll smoothly when exceeding visible area
- [ ] Selecting result closes spotlight immediately
- [ ] Main window opens/focuses after selection
- [ ] Tool opens with correct options pre-filled
- [ ] Keyboard navigation works (↑↓ arrows, Enter, Esc)
- [ ] Mouse click selection works
- [ ] Empty state displays correctly
- [ ] Build completes without errors

---

## Notes

**Query Params Handling:**
The tool pages should already handle query params (they were designed this way). If pre-filling doesn't work:
- Check that tools read query params on mount
- Verify `navigate:to` event is being received in main window
- Ensure React Router properly parses query strings

**Hotkey Conflicts:**
If `Cmd+Shift+Space` conflicts with system shortcuts on any platform:
- Fallback options: `Cmd+Option+Space`, `Ctrl+Option+Space`, `F1`
- These would require updating both main.go and tray menu label

**Performance:**
- Command list is static (no API calls)
- Fuzzy search runs client-side
- Should be instant even with 50+ commands

---

## Success Criteria

✅ **Done when:**
1. Global hotkey works reliably on all platforms
2. Results panel is unified glass panel with no gaps
3. Fixed 400px scrollable results area
4. Tool navigation with pre-filled options works end-to-end
5. All tests pass and build succeeds

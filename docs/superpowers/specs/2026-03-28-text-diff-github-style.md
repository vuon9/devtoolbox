# Text Diff Checker - GitHub-Style Diff View

## Overview

Transform the Text Diff Checker tool to provide a GitHub Pull Request-style diff viewing experience, with Edit/Diff modes and Split/Unified view toggles.

## Requirements

### Mode Toggle
- **Edit mode** (default): Two editable textareas for input
- **Diff mode**: Read-only diff panes showing comparison results
- Toggle between modes with a button group in the header

### View Toggle (Diff Mode Only)
- **Split view**: Side-by-side diff (two columns)
- **Unified view**: Single column with +/- markers
- Only one view visible at a time
- Toggle buttons appear when in Diff mode

### Split View Features
- Equal width panes (50/50)
- Line numbers on both sides
- Unchanged lines shown in gray
- Removed lines highlighted red on left pane
- Added lines highlighted green on right pane
- Gap alignment for added/removed lines (like GitHub)
- Synced scrolling between panes

### Unified View Features
- Single column with line numbers
- `-` prefix for deletions (red highlight)
- `+` prefix for additions (green highlight)
- Unchanged lines shown normally

### Diff Granularity
Keep existing Lines/Words/Chars toggle - affects how diff is computed

### Edit Mode
- Keep current editable textareas
- Keep "Base Version" and "Comparison Target" labels
- Diff result area hidden (or show placeholder "Switch to Diff mode to see results")

## Implementation

### State Changes
```jsx
const [mode, setMode] = useState('edit'); // 'edit' | 'diff'
const [viewMode, setViewMode] = useState('split'); // 'split' | 'unified'
const [diffMode, setDiffMode] = useState('lines'); // 'lines' | 'words' | 'chars'
```

### Components

1. **ModeToggle** - Edit/Diff toggle buttons
2. **ViewToggle** - Split/Unified toggle (visible only in Diff mode)
3. **DiffSplitView** - Side-by-side diff with synced scrolling
4. **DiffUnifiedView** - Single column diff
5. **DiffPane** - Individual pane with line numbers and highlighting

### Diff Algorithm
- Use existing `diffUtils.js` with `diff` library
- For Lines mode: `diffLines()` with `newlineIsToken: true`
- For Words mode: `diffWords()`
- For Chars mode: `diffChars()`

### Synced Scrolling
- Use refs for both panes
- On scroll event in either pane, sync scrollTop to other pane
- Only apply in Split view

### Line-by-Line Processing for Split View
```javascript
// Process diff into left/right arrays
const processDiffForSplit = (diff) => {
  const left = [];  // Original lines
  const right = []; // Modified lines
  
  diff.forEach(part => {
    if (part.added) {
      // Added lines: gap on left, content on right
      part.value.split('\n').forEach(line => {
        left.push({ type: 'gap', content: '' });
        right.push({ type: 'added', content: line });
      });
    } else if (part.removed) {
      // Removed lines: content on left, gap on right
      part.value.split('\n').forEach(line => {
        left.push({ type: 'removed', content: line });
        right.push({ type: 'gap', content: '' });
      });
    } else {
      // Unchanged: same on both sides
      part.value.split('\n').forEach(line => {
        left.push({ type: 'unchanged', content: line });
        right.push({ type: 'unchanged', content: line });
      });
    }
  });
  
  return { left, right };
};
```

## UI Layout

### Edit Mode
```
[Lines] [Words] [Chars]              | [Edit*] [Diff]               [Reset]
┌────────────────────────┐  ┌────────────────────────┐
│ Original Text           │  │ Modified Text           │
│ [textarea - editable]  │  │ [textarea - editable]  │
└────────────────────────┘  └────────────────────────┘
```

### Diff Mode - Split View
```
[Lines] [Words] [Chars]  [Split*] [Unified]  | [Edit] [Diff*]  [Reset]
┌────────────────────────┐  ┌────────────────────────┐
│  1 │ unchanged line    │  │  1 │ unchanged line    │
│  2 │ - removed line    │  │    │                  │
│    │                   │  │  2 │ + added line     │
│  3 │ unchanged line    │  │  3 │ unchanged line    │
└────────────────────────┘  └────────────────────────┘
```

### Diff Mode - Unified View
```
[Lines] [Words] [Chars]  [Split] [Unified*]  | [Edit] [Diff*]  [Reset]
┌─────────────────────────────────────────────────────────┐
│     │  1 │ unchanged line                               │
│  -  │  2 │ removed line                                 │
│  +  │  2 │ added line                                    │
│     │  3 │ unchanged line                               │
└─────────────────────────────────────────────────────────┘
```

## Styling

Use existing color palette:
- Unchanged: `#a1a1aa` (gray text)
- Added: `#22c55e` (green) with `rgba(34, 197, 94, 0.15)` background
- Removed: `#ef4444` (red) with `rgba(239, 68, 68, 0.15)` background
- Gap: empty space with subtle background `#18181b`

Line numbers: `#52525b` (muted), right-aligned

## Files to Modify

1. `frontend/src/pages/TextDiffChecker/index.jsx` - Main component
2. `frontend/src/pages/TextDiffChecker/diffUtils.js` - Add split view processing function

## Success Criteria

- Can toggle between Edit and Diff modes
- Diff mode shows Split view by default
- Split view has line numbers and synced scrolling
- Unified view shows +/- markers
- All diff modes (Lines/Words/Chars) work correctly
- Styling matches existing dark theme
- No layout shift when switching modes
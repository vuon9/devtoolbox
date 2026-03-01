# DateTime Converter Improvements Design

## Overview
Redesign the DateTime Converter tool to match reference design with labeled output fields, math operators support, and persistent custom timezones.

## Goals
- Replace grid layout with explicit labeled output fields
- Add math operators (+, -, *, /) for timestamp calculations
- Support persistent custom timezones across browser and Wails environments

## Phase 1: Core Layout (Priority: High)

### Layout Structure
Three distinct zones following AGENTS.md guidelines:

**Header Zone**
- Tool title "DateTime Converter"
- Description text

**Control Zone**
- Preset buttons: Now, Start of Day, End of Day, Tomorrow, Yesterday, Next Week
- Input field with placeholder text
- Input timezone selector
- Clear button
- Math operators helper text

**Workspace Zone (Two-column layout)**
- Left column: Primary outputs (Local, UTC ISO 8601, Relative, Unix time)
- Right column: Metadata (Day of year, Week of year, Is leap year, Other formats)

Each field gets labeled box with copy button.

### Component Changes
- New `OutputField` component: Label + value + copy button
- Modify `DateTimeConverter/index.jsx`: Reorganize layout, add math parser
- Update styling to match reference design proportions

## Phase 2: Timezone Storage (Priority: High)

### Storage Interface
```javascript
const storage = {
  get: (key) => localStorage.getItem(key) || wailsGet(key),
  set: (key, value) => { localStorage.setItem(key, value); wailsSet(key, value); }
};
```

### Data Structure
```javascript
{
  "datetime-converter.timezones": ["Asia/Tokyo", "Europe/London"]
}
```

### Behavior
- "Add timezone" dropdown below main outputs
- Selected timezones render as additional output fields
- Remove button (×) on each field
- Persist to both localStorage and Wails backend

## Phase 3: Math Operators (Priority: Medium)

### Supported Operations
- `+` addition (e.g., `1738412345 + 3600`)
- `-` subtraction (e.g., `now - 86400`)
- `*` multiplication
- `/` division

### Implementation
- Regex parser for `number operator number` pattern
- Real-time calculation on input change
- Error display for invalid expressions

## Error Handling
- Invalid date: Red tag "Invalid date or timestamp"
- Math error: Inline red text below input
- Timezone error: Fallback to UTC with warning

## Testing Plan
- Unit tests for math parser
- Integration tests for storage interface
- Visual regression for layout changes

# Code Formatter Tool Redesign

**Date:** 2026-03-29  
**Status:** Approved for Implementation

## Summary

Redesign the Code Formatter tool to be fully functional with automatic formatting, sample code generation, language-specific filtering, and a focused set of markup languages. Remove Java and JavaScript support as requested.

## Current Issues

1. **Non-functional:** Formatting fails silently or doesn't work properly
2. **Manual operation:** Requires clicking "Format Code" button
3. **No sample data:** Users can't easily test the tool
4. **No filtering:** Filter system exists in backend but not exposed in UI
5. **Wrong languages:** Includes Java and JavaScript which should be removed

## Requirements

### Functional Requirements

1. **Auto-formatting:** Format code automatically as user types (300ms debounce)
2. **Sample button:** Generate sample code for each supported language
3. **Language filters:** Context-aware filtering for each language
4. **Minify toggle:** Button at top to toggle between pretty/minified output
5. **Error display:** Show clear error messages for invalid syntax or filter errors

### Language Support

**Supported:** JSON, XML, HTML, CSS  
**Removed:** Java, JavaScript, SQL  
**Filter types:**
- JSON: jq filters (`.users[].name`, `keys`, `length`)
- XML: XPath (`//book`, `/catalog/book[1]`, `//author/@name`)
- HTML: CSS selectors (`.header`, `#main`, `div.content > h1`)
- CSS: No filter (minify only)

### UI Layout

```
┌─────────────────────────────────────────────────────────────┐
│ Language [JSON ▼]  [📄 Load Sample]  [⚡ Minify]             │
├─────────────────────┬───────────────────────────────────────┤
│                     │                                       │
│  Input              │  Formatted Output                     │
│  [paste code...]    │  [syntax highlighted result...]       │
│                     │                                       │
│                     │                                       │
│                     │  ┌─────────────────────────────────┐ │
│                     │  │ 🔍 [filter placeholder text]    │ │
│                     │  └─────────────────────────────────┘ │
└─────────────────────┴───────────────────────────────────────┘
```

### Filter Bar Design

- **Icon:** Filter/funnel icon (🔍) instead of text label
- **Input:** Borderless, transparent background for cleaner look
- **No suffix:** No "jq filter" or similar text suffix

### Filter Placeholders by Language

- **JSON:** `.users[].name` or `keys` or `length`
- **XML:** `//book` or `/catalog/book[1]` or `//author/@name`
- **HTML:** `.header` or `#main` or `div.content > h1`
- **CSS:** (no filter input shown)

## Architecture

### Backend Changes

**File:** `internal/codeformatter/service.go`

1. Fix the Format method to handle request properly
2. Ensure jq filter support works for JSON
3. Ensure XPath support works for XML  
4. Ensure CSS selector support works for HTML
5. Remove JavaScript and Java cases from Format switch
6. Remove SQL case from Format switch

**File:** `service/codeformatter.go`

1. Update Wails binding to use correct request/response structure
2. Ensure proper error handling and response format

### Frontend Changes

**File:** `frontend/src/pages/CodeFormatter/index.jsx`

1. Remove Java and JavaScript from language list
2. Remove SQL from language list
3. Add sample code generation for each language
4. Implement auto-formatting with 300ms debounce
5. Remove "Format Code" button
6. Add "Load Sample" button
7. Add Minify toggle button (blue background when active)
8. Add filter bar at bottom of output with language-specific placeholder
9. Implement error display below output area

**Sample Data:**

- **JSON:** `{"users":[{"name":"Alice","age":30},{"name":"Bob","age":25}],"count":2}`
- **XML:** `<?xml version="1.0"?><catalog><book id="1"><title>Example</title><author>John</author></book></catalog>`
- **HTML:** `<!DOCTYPE html><html><head><title>Test</title></head><body><div class="header"><h1>Welcome</h1></div></body></html>`
- **CSS:** `.container { display: flex; padding: 20px; } .header { background: #333; color: white; }`

### Data Flow

1. User types/pastes code in input area
2. 300ms debounce triggers format request
3. Backend validates and formats code
4. If filter specified, apply filter to formatted output
5. Display result in output area
6. Show any errors below output area

## Error Handling

### Error Types

1. **Syntax errors:** Invalid JSON/XML/HTML/CSS syntax
2. **Filter errors:** Invalid jq/XPath/CSS selector syntax
3. **Network/Service errors:** Wails communication failures

### Error Display

- Red error box below output area
- Clear, actionable message
- Examples:
  - "Invalid JSON: unexpected token at position 23"
  - "jq filter error: path not found: .users[].invalid"
  - "XPath error: no elements found with //nonexistent"

## Testing Considerations

### Backend Tests

- Unit tests for each formatter (JSON, XML, HTML, CSS)
- Unit tests for jq filter application
- Unit tests for XPath filter application
- Unit tests for CSS selector application
- Error handling tests

### Frontend Tests

- Auto-formatting debounce behavior
- Sample button generates correct data for each language
- Minify toggle switches output correctly
- Filter placeholder changes with language
- Error messages display correctly

## Success Criteria

1. ✅ Typing in input auto-formats output within 300ms of pause
2. ✅ Sample button generates appropriate code for each language
3. ✅ Minify button toggles between pretty and minified output
4. ✅ Filters work correctly for JSON (jq), XML (XPath), HTML (CSS)
5. ✅ Java and JavaScript removed from language options
6. ✅ SQL removed from language options
7. ✅ Clear error messages for invalid syntax or filters
8. ✅ No "Format Code" button required

## Implementation Notes

### Files to Modify

**Backend:**
- `internal/codeformatter/service.go` - Fix formatting logic
- `service/codeformatter.go` - Update Wails binding

**Frontend:**
- `frontend/src/pages/CodeFormatter/index.jsx` - Complete rewrite

### Syntax Highlighting

**Library:** PrismJS (lightweight, supports JSON/XML/HTML/CSS)  
**Theme:** VS Code Dark+ (dark theme matching devtoolbox aesthetic)

**Implementation:**
- Highlight output area using PrismJS with appropriate language grammar
- Auto-detect or specify language based on selected format
- Update highlighting when output changes

### Dependencies

**New:**
- `prismjs` - Syntax highlighting library

**Existing:**
- `github.com/itchyny/gojq` - jq filtering for JSON
- `golang.org/x/net/html` - HTML parsing for CSS selectors
- Standard library for XML formatting

## Future Considerations

- Add YAML support (with proper formatting)
- Add TOML support
- Add copy-to-clipboard for output
- Add file import/export
- Persist last used language in localStorage

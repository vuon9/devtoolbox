# Tool Development Status

This document tracks the refactoring and development status of each tool component. **Always check this before modifying tool code** to avoid conflicts with ongoing refactoring efforts.

## Status Legend

- 🟢 **Done** - Tool fully refactored, uses Carbon Design System, follows all guidelines
- 🟡 **In Progress** - Tool is being refactored, use caution before modifying
- 🔴 **Not Started** - Tool uses legacy patterns, needs full refactoring

---

## Tool Status

| Tool | Status | Notes | Last Updated |
|------|--------|-------|--------------|
| JwtDebugger | 🟢 Done | Uses component abstraction system (ToolLayout, ToolTextArea, ToolInputGroup), toggleable layout, consistent button styling with icons (MagicWand, Security, Code), enhanced tabs (custom mode tabs, improved JSON/Claims tabs), resizable textareas with constraints, proper error handling | Completed 2026-01-25 |
| **TextConverter** | 🟢 Done | Unified tool with 45+ algorithms across 5 categories (encrypt, encode, escape, hash, convert). Features: Common Tags (Quick Select), Base64 Image Preview, All Hashes view, Smart ConfigurationPane, 5 Escape methods. Backend: hierarchical structure with 83 comprehensive tests. Phase 2 & 3 complete. Replaces: TextBasedConverter | Completed 2026-01-31 |
| **StringUtilities** | 🟡 In Progress | Consolidated tool combining LineSortDedupe, StringCaseConverter, and StringInspector. Features: Tab navigation (Sort/Dedupe, Case Converter, Inspector), shared input state, layout toggle, Carbon Design System compliance. | Updated 2026-01-31 |
| **NumberConverter** | 🟢 Done | Converted from NumberBaseConverter. Features: 4-pane layout (Decimal, Hex, Octal, Binary), bidirectional conversion, layout toggle, active field highlighting, Carbon Design System compliance. | Completed 2026-01-31 |
| BarcodeGenerator | 🟢 Done | Multi-standard barcode generator (QR, EAN-13, EAN-8, Code128, Code39). Features: configurable size, error correction levels for QR, client-side validation, download button. | Completed 2026-01-31 |
| **DataGenerator** | 🟢 Done | Template-based mock data generator with Faker integration. Features: 10 built-in presets (UUID, ULID, Random String, Lorem Ipsum, User Profile, E-commerce Product, API Response, SQL Insert, Log Entries, Credit Card), batch generation (10-1000 records), multiple output formats (JSON, XML, CSV, YAML), comprehensive help documentation with 4 tabs (Quick Start, Syntax, Faker Reference, Examples). Backend: Go templates + gofakeit library with 80+ faker functions. Replaces: RandomStringGenerator, UuidGenerator, LoremIpsumGenerator | Completed 2026-01-31 |
| **CodeFormatter** | 🟢 Done | Unified code formatting tool supporting JSON (with jq filters), XML (with XPath), HTML (with CSS selectors), SQL, CSS, and JavaScript. Features: format/minify modes, filter/query support for structured data, auto-format on input change, persistent state. Backend: Go with gojq library for jq support. Replaces: JsonFormatter, SqlFormatter | Completed 2026-01-31 |
| **CronJobParser** | 🟢 Done | Refactored to follow Carbon Design System. Features: Split-pane layout, 8 common examples in clickable tiles, real-time parsing, large centered output display, layout toggle. | Completed 2026-01-31 |
| **RegExpTester** | 🟡 In Progress | Refactored with improved UI. Features: Flag toggle tags (g, i, m, s, u, y), split-pane layout, match count in output label, error display with styling, layout toggle. | Updated 2026-01-31 |
| **TextDiffChecker** | 🟡 In Progress | Refactored with enhanced features. Features: Diff mode switcher (Lines/Words/Chars), auto-compare on input change, Clear button, improved diff view with color coding, layout toggle. | Updated 2026-01-31 |
| **UnixTimeConverter** | 🟡 In Progress | Refactored with new features. Features: Relative time display (e.g., "2 hours ago"), split-pane layout (ISO 8601 / Local), "Now" button with icon, layout toggle, auto-initialization with current time. | Updated 2026-01-31 |

### Removed Tools (Consolidated)

| Tool | Replacement | Reason |
|------|-------------|--------|
| JsonFormatter | CodeFormatter | Unified formatting tool |
| SqlFormatter | CodeFormatter | Unified formatting tool |
| UrlTools | TextConverter | URL encode/decode functionality |
| UrlParser | TextConverter | URL parsing functionality |
| UrlEncoder | TextConverter | URL encoding functionality |
| PhpSerializer | - | Removed - low usage |
| PhpJsonConverter | - | Removed - low usage |
| LineSortDedupe | StringUtilities | Consolidated into StringUtilities |
| StringCaseConverter | StringUtilities | Consolidated into StringUtilities |
| StringInspector | StringUtilities | Consolidated into StringUtilities |
| NumberBaseConverter | NumberConverter | Renamed and refactored |
| TextBasedConverter | TextConverter | Renamed for clarity |

---

## Final Tool Count: 11 Tools

1. **Text Converter** - Encoding, encryption, hashing, escaping
2. **String Utilities** - Sort/Dedupe, Case conversion, Inspector
3. **Number Converter** - Decimal, Hex, Octal, Binary conversions
4. **Unix Time Converter** - Timestamp conversions with relative time
5. **JWT Debugger** - JWT encode/decode/verify
6. **RegExp Tester** - Regular expression testing
7. **Cron Job Parser** - Cron expression parsing
8. **Text Diff Checker** - Text comparison
9. **Code Formatter** - JSON, XML, HTML, SQL, CSS, JS formatting
10. **Barcode Generator** - QR codes and barcodes
11. **Data Generator** - Mock data generation

---

## Refactoring Checklist

When refactoring a tool, ensure:

- [x] Uses **Carbon Design System** components (`@carbon/react`)
- [x] All colors use `var(--cds-*)` tokens, no hardcoded hex values
- [x] Implements **useReducer** for state management (not multiple useState hooks)
- [x] Uses **useCallback** for memoized functions
- [x] Follows **DRY principle** - no duplicated components/logic
- [x] Has proper **ToolHeader** with title and description
- [x] Input/Output panes are symmetrical and use **Carbon TextArea**
- [x] All buttons properly spaced (gap: 1rem)
- [x] Copy buttons present on all output/data panes
- [x] Monospace font for data (`'IBM Plex Mono', monospace`)
- [x] Proper flex layout for responsive sizing
- [x] No unused imports or variables
- [x] Code compiles without errors or warnings

---

## How to Update This File

When starting work on a tool:

1. Change status from 🔴 to 🟡 and add your name/timestamp
2. Add specific notes about what you're refactoring
3. When complete, change to 🟢 and add completion date

Example:

```
| YourTool | 🟡 In Progress | Refactoring state management, DRY components | Started 2025-12-13 |
```

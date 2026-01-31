# Tool Development Status

This document tracks the refactoring and development status of each tool component. **Always check this before modifying tool code** to avoid conflicts with ongoing refactoring efforts.

## Status Legend

- 🟢 **Done** - Tool fully refactored, uses Carbon Design System, follows all guidelines
- 🟡 **In Progress** - Tool is being refactored, use caution before modifying
- 🔴 **Not Started** - Tool uses legacy patterns, needs full refactoring
- ⚫ **Deprecated** - Tool functionality replaced by another tool, can be removed

---

## Tool Status

| Tool | Status | Notes | Last Updated |
|------|--------|-------|--------------|
| JwtDebugger | 🟢 Done | Uses component abstraction system (ToolLayout, ToolTextArea, ToolInputGroup), toggleable layout, consistent button styling with icons (MagicWand, Security, Code), enhanced tabs (custom mode tabs, improved JSON/Claims tabs), resizable textareas with constraints, proper error handling | Completed 2026-01-25 |
| **TextBasedConverter** | 🟢 Done | Unified tool with 45+ algorithms across 5 categories (encrypt, encode, escape, hash, convert). Features: Common Tags (Quick Select), Base64 Image Preview, All Hashes view, Smart ConfigurationPane, 5 Escape methods. Backend: hierarchical structure with 83 comprehensive tests. Phase 2 & 3 complete | Completed 2026-01-31 |
| BackslashEscaper | 🔴 Not Started | Legacy implementation | - |
| CodeFormatter | 🔴 Not Started | Legacy implementation | - |
| ColorConverter | 🔴 Not Started | Legacy implementation | - |
| CronJobParser | 🔴 Not Started | Legacy implementation | - |
| HtmlPreview | 🔴 Not Started | Legacy implementation | - |
| JsonFormatter | 🔴 Not Started | Legacy implementation | - |
| LineSortDedupe | 🔴 Not Started | Legacy implementation | - |
| LoremIpsumGenerator | 🔴 Not Started | Legacy implementation | - |
| MarkdownPreview | 🔴 Not Started | Legacy implementation | - |
| PhpJsonConverter | 🔴 Not Started | Legacy implementation | - |
| PhpSerializer | 🔴 Not Started | Legacy implementation | - |
| QrCodeGenerator | 🔴 Not Started | Legacy implementation | - |
| RandomStringGenerator | 🔴 Not Started | Legacy implementation | - |
| RegExpTester | 🔴 Not Started | Legacy implementation | - |
| SqlFormatter | 🔴 Not Started | Legacy implementation | - |
| StringCaseConverter | 🔴 Not Started | Legacy implementation | - |
| StringInspector | 🔴 Not Started | Legacy implementation | - |
| TextDiffChecker | 🔴 Not Started | Legacy implementation | - |
| UnixTimeConverter | 🔴 Not Started | Legacy implementation | - |
| UrlParser | 🔴 Not Started | Legacy implementation | - |
| UrlTools | 🔴 Not Started | Legacy implementation | - |
| UuidGenerator | 🔴 Not Started | Legacy implementation | - |

---

## Refactoring Checklist

When refactoring a tool, ensure:

- [ ] Uses **Carbon Design System** components (`@carbon/react`)
- [ ] All colors use `var(--cds-*)` tokens, no hardcoded hex values
- [ ] Implements **useReducer** for state management (not multiple useState hooks)
- [ ] Uses **useCallback** for memoized functions
- [ ] Follows **DRY principle** - no duplicated components/logic
- [ ] Has proper **ToolHeader** with title and description
- [ ] Input/Output panes are symmetrical and use **Carbon TextArea**
- [ ] All buttons properly spaced (gap: 1rem)
- [ ] Copy buttons present on all output/data panes
- [ ] Monospace font for data (`'IBM Plex Mono', monospace`)
- [ ] Proper flex layout for responsive sizing
- [ ] No unused imports or variables
- [ ] Code compiles without errors or warnings

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

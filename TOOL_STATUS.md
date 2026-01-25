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
| **TextBasedConverter** | 🟡 In Progress | Unified tool for all encoding, encryption, hashing, and format conversions. Smart ConfigurationPane adapts to algorithm requirements. Backend uses hierarchical structure (`internal/converter/`). Comprehensive unit tests. Implements 40+ algorithms across 4 categories. **Replaces**: Base64Converter, HashGenerator, HexAsciiConverter, HtmlEntityConverter, UrlEncoder, NumberBaseConverter, YamlToJson, CsvJsonConverter | Started 2026-01-25 |
| BackslashEscaper | 🔴 Not Started | Legacy implementation | - |
| Base64Converter | ⚫ Deprecated | **Replaced by TextBasedConverter** (Encode - Decode → Base64) | - |
| CodeFormatter | 🔴 Not Started | Legacy implementation | - |
| ColorConverter | 🔴 Not Started | Legacy implementation | - |
| CronJobParser | 🔴 Not Started | Legacy implementation | - |
| CsvJsonConverter | ⚫ Deprecated | **Replaced by TextBasedConverter** (Convert → JSON ↔ CSV / TSV) | - |
| DataConverter | 🔴 Not Started | Legacy implementation | - |
| HashGenerator | ⚫ Deprecated | **Replaced by TextBasedConverter** (Hash → MD5, SHA-1, SHA-256, etc.) | - |
| HexAsciiConverter | ⚫ Deprecated | **Replaced by TextBasedConverter** (Encode - Decode → Base16 (Hex)) | - |
| HtmlEntityConverter | ⚫ Deprecated | **Replaced by TextBasedConverter** (Encode - Decode → HTML Entities) | - |
| HtmlPreview | 🔴 Not Started | Legacy implementation | - |
| JsonFormatter | 🔴 Not Started | Legacy implementation | - |
| LineSortDedupe | 🔴 Not Started | Legacy implementation | - |
| LoremIpsumGenerator | 🔴 Not Started | Legacy implementation | - |
| MarkdownPreview | 🔴 Not Started | Legacy implementation | - |
| NumberBaseConverter | ⚫ Deprecated | **Replaced by TextBasedConverter** (Convert → Number Bases) | - |
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
| UrlEncoder | ⚫ Deprecated | **Replaced by TextBasedConverter** (Encode - Decode → URL) | - |
| UrlParser | 🔴 Not Started | Legacy implementation | - |
| UrlTools | 🔴 Not Started | Legacy implementation | - |
| UuidGenerator | 🔴 Not Started | Legacy implementation | - |
| YamlToJson | ⚫ Deprecated | **Replaced by TextBasedConverter** (Convert → JSON ↔ YAML) | - |

---

## Last tool tasks

### Text-based Converter

- [ ] Implement remaining encryption algorithms (DES, Triple DES, ChaCha20, Salsa20, Blowfish, etc.)
- [ ] Implement remaining encoding algorithms (Base85, Punnycode, JWT Decode, Bencoded, Protobuf)
- [ ] Implement remaining conversion features (XML, TOML, Color codes, Timestamp, CURL, Cron)
- [ ] Implement remaining hashing algorithms (BLAKE3, scrypt, Argon2, HMAC with UI, MurmurHash)
- [ ] Add copy buttons to ConfigurationPane for sample values
- [ ] Consider adding "Generate Random Key" button for encryption
- [ ] Full browser testing with real Wails app (not test server)
- [ ] Consider removing deprecated tools from codebase
- [ ] Remove all deprecated tools after having functionality working well

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

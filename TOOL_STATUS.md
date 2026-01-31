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
| **TextBasedConverter** | 🟢 Done | Unified tool for all encoding, encryption, hashing, and format conversions. Smart ConfigurationPane adapts to algorithm requirements. Backend uses hierarchical structure (`internal/converter/`). Comprehensive unit tests. Implements 40+ algorithms across 4 categories | Completed 2026-01-31 |
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

## Last tool tasks

### Text-based Converter - Implementation Status

#### ✅ **COMPLETED**

**Encryption (8 algorithms):**
- ✅ AES, AES-GCM, DES, Triple DES, ChaCha20, Salsa20, XOR, RC4

**Encoding (12 algorithms):**
- ✅ Base16 (Hex), Base32, Base58, Base64, Base64URL, URL, HTML Entities, Binary, Morse Code, ROT13, ROT47, Quoted-Printable

**Conversion (11 formats):**
- ✅ JSON ↔ YAML, JSON ↔ XML, JSON ↔ CSV / TSV, YAML ↔ TOML, Markdown ↔ HTML, CSV ↔ TSV, Key-Value ↔ Query String, Number Bases, Case Swapping, Properties ↔ JSON, INI ↔ JSON

**Hashing (19 algorithms + All view):**
- ✅ MD5, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512, SHA-3 (Keccak), BLAKE2b, BLAKE3, RIPEMD-160, bcrypt, scrypt, Argon2, HMAC, CRC32, Adler-32, MurmurHash3, xxHash, FNV-1a
- ✅ "All" hash view with grid display of all algorithms

**Features:**
- ✅ Comprehensive unit tests (56 test cases)
- ✅ GitHub Actions CI/CD for Go tests
- ✅ Removed deprecated tools from codebase

---

#### ⏳ **PENDING IMPLEMENTATION**

The following algorithms are listed in CONVERTER_MAP but **not yet implemented** in the backend:

**Encryption (7 algorithms):**
- ⏳ Rabbit, RC4Drop, Blowfish, Twofish, RSA, Fernet, BIP38

**Encoding (5 algorithms):**
- ⏳ Base85, Punnycode, JWT Decode, Bencoded, Protobuf

**Conversion (5 formats):**
- ⏳ Unix Timestamp ↔ ISO 8601 (exists but needs improvement)
- ⏳ Color Codes (exists but needs improvement)
- ⏳ SQL Insert ↔ JSON Array
- ⏳ CURL Command ↔ Fetch
- ⏳ Cron Expression ↔ Text

**UI Improvements:**
- ⏳ Add copy buttons to ConfigurationPane for sample values
- ⏳ Consider adding "Generate Random Key" button for encryption
- ⏳ Full browser testing with real Wails app (not test server)

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

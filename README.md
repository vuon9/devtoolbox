# Developer Toolbox

[![Tests & Build](https://github.com/vuon9/dev-toolbox/actions/workflows/tests.yml/badge.svg)](https://github.com/vuon9/dev-toolbox/actions/workflows/tests.yml)
[![Wails Build](https://github.com/vuon9/dev-toolbox/actions/workflows/build.yml/badge.svg)](https://github.com/vuon9/dev-toolbox/actions/workflows/build.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Go Version](https://img.shields.io/badge/Go-1.24+-00ADD8?style=flat&logo=go&logoColor=white)](https://go.dev)

A modern, all-in-one desktop application for developers featuring 45+ utilities for encoding, encryption, hashing, escaping, and data format conversions.

<img width="1462" height="894" alt="image" src="https://github.com/user-attachments/assets/fd82c884-203d-44e0-a29d-a9f769eba33a" />


## Features

### **Text Based Converter** (Unified Tool)
The central hub with 45+ algorithms across 5 categories:

| Category | Algorithms |
|----------|------------|
| **🔐 Encrypt / Decrypt** | AES, AES-GCM, DES, Triple DES, ChaCha20, Salsa20, XOR, RC4 |
| **🔀 Encode / Decode** | Base64, Base64URL, Base32, Base58, Base16 (Hex), URL, HTML Entities, Binary, Morse Code, ROT13, ROT47, Quoted-Printable |
| **✂️ Escape / Unescape** | String Literal, Unicode/Hex, HTML/XML, URL, Regex |
| **🔄 Convert** | JSON ↔ YAML, JSON ↔ XML, JSON ↔ CSV, YAML ↔ TOML, CSV ↔ TSV, Properties ↔ JSON, INI ↔ JSON, Key-Value ↔ Query String, Number Bases, Case Swapping, Color Codes |
| **#️⃣ Hash** | MD5, SHA-1, SHA-224, SHA-256, SHA-384, SHA-512, SHA-3, BLAKE2b, BLAKE3, RIPEMD-160, bcrypt, scrypt, Argon2, HMAC, CRC32, Adler-32, MurmurHash3, xxHash, FNV-1a |

**Special Features:**
- **"All Hashes" view** - Compute all 19 hash algorithms at once with copy buttons for each
- **Quick Action Tags** - Save frequently used conversions for instant access
- **Base64 Image Preview** - Automatically displays base64 images in output pane
- **Smart key/IV detection** - Automatically shows configuration pane when needed
- **Auto-run mode** - Results update instantly as you type
- **Horizontal/Vertical layout toggle** - Customize the workspace layout

### **Other Tools**

| Tool | Description |
|------|-------------|
| **JWT Debugger** | Decode and verify JWT tokens with header/payload inspection |
| **Barcode / QR Code Generator** | Create QR codes and 1D barcodes (EAN-13, EAN-8, Code 128, Code 39) with preview and download |
| **Data Generator** | Generate mock data with templates using Faker library (UUID, ULID, Random String, Lorem Ipsum, User Profiles, API responses, SQL inserts, and more) |
| **JSON Formatter** | Pretty-print or minify JSON with syntax validation |
| **RegExp Tester** | Test regular expressions with real-time matching |
| **Unix Time Converter** | Convert between Unix timestamps and human-readable dates |
| **SQL Formatter** | Format SQL queries with proper indentation |
| **String Case Converter** | Convert between camelCase, snake_case, PascalCase, etc. |
| **Cron Job Parser** | Parse and explain cron expressions |
| **Text Diff Checker** | Compare two text blocks and highlight differences |
| **Line Sort / Dedupe** | Sort lines, remove duplicates, trim whitespace |
| **String Inspector** | Count characters, words, lines, bytes, and sentences |
| **PHP Serializer** | PHP serialization/unserialization |
| **URL Tools** | Parse URLs, extract components |

## Installation

### Download Pre-built Binaries
Download the latest release for your platform from the [Releases](https://github.com/your-org/dev-toolbox/releases) page.

**Supported Platforms:**
- Windows (x64)
- macOS (Intel & Apple Silicon)
- Linux (x64)

### Build from Source

**Prerequisites:**
- Node.js (>= 18)
- Go (>= 1.22)
- Wails CLI: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

**Build Steps:**
```bash
# Clone the repository
git clone https://github.com/your-org/dev-toolbox.git
cd dev-toolbox

# Install dependencies and build
wails build

# Or run in development mode
wails dev
```

## Key Features

✅ **Works Offline** - All tools run locally, no internet connection required  
✅ **Dark/Light Themes** - Switch between themes or use system preference  
✅ **Pin Tools** - Pin frequently used tools to the top of the sidebar  
✅ **Keyboard Shortcuts** - `Cmd/Ctrl + B` to toggle sidebar  
✅ **Copy to Clipboard** - One-click copy buttons on all output fields  
✅ **Auto-run** - See results instantly as you type (can be disabled)  
✅ **Responsive Layout** - Horizontal or vertical split panes  

## UI Design

Built with **Carbon Design System** for a consistent, professional look:
- Clean, modern interface
- Accessible components
- Consistent spacing and typography
- Monospace fonts for code/data

## License

MIT License - free to use, modify, and distribute.

---

*Built with ❤️ using Go, React, and Wails.*

# Developer Toolbox

## Overview

The **Developer Toolbox** is a modern, lightweight web‑based utility suite for developers. It bundles a collection of everyday tools—JSON/YAML/CSV conversion, Base64 encoding/decoding, UUID/ULID generation, QR code creation, JWT debugging, code formatting, Lorem Ipsum generation, and many more—into a single, cohesive UI.

All UI components are built with the **Carbon Design System** (`@carbon/react`) to ensure a consistent, accessible, and premium look across the entire application. The app supports dark, light, and system‑preferred themes and includes a theme‑switcher in the top‑right corner.

> **Why this toolbox?**
> - No need to install a dozen separate CLI tools.
> - Works offline in a desktop‑like environment powered by **Wails** (Go + Vite + React).
> - Extensible: new tools can be added by simply creating a React component that follows the UI conventions.

---

## Features

| Category | Tool | Description |
|----------|------|-------------|
| **Data Conversion** | **Data Converter** | Convert between JSON, YAML, CSV, and PHP array formats. |
| | **CSV ↔ JSON** | Convert CSV files to JSON and vice‑versa. |
| **Encoding / Decoding** | **Base64 Converter** | Encode/decode text and images to/from Base64. |
| | **URL Tools** | Parse URLs, encode/decode components. |
| **Generators** | **UUID / ULID Generator** | Generate random UUID v4 or ULID values. |
| | **Lorem Ipsum Generator** | Produce placeholder paragraphs, sentences, or words. |
| | **QR Code Generator** | Generate QR codes from arbitrary text/URLs with preview and download. |
| **Debuggers** | **JWT Debugger** | Decode JWT header and payload, view errors. |
| **Formatters** | **Code Formatter** | Beautify HTML, CSS, JavaScript, XML. |
| | **JSON Formatter** | Pretty‑print or minify JSON. |
| | **Hex / ASCII Converter** | Convert between hexadecimal strings and ASCII text. |
| **Utilities** | **String Inspector** | Show character, word, line, byte, and sentence counts. |
| | **Line Sort / Dedupe** | Sort, deduplicate, trim, reverse lists of lines. |
| | **Hash Generator** | Compute MD5, SHA‑1, SHA‑256, SHA‑512 hashes. |
| | **Random String Generator** | Generate random alphanumeric strings. |
| | **Uuid Generator** | Generate UUIDs and ULIDs. |
| | **...** | Additional tools can be found in the sidebar.

---

## Installation & Running

### Prerequisites
- **Node.js** (>= 18)
- **Go** (>= 1.22)
- **Wails** CLI (`go install github.com/wailsapp/wails/v2/cmd/wails@latest`)

### Steps
```bash
# Clone the repository
git clone https://github.com/your-org/dev-toolbox.git
cd dev-toolbox

# Install frontend dependencies
bun install

# Build & run the desktop app (Wails)
wails dev   # development mode with hot‑reload
# or
wails build # production binary
```

The app will open in a native window. The UI works offline; no external API calls are required.

---

## Project Structure
```
dev-toolbox/
├─ frontend/                # React + Vite source
│   ├─ src/
│   │   ├─ components/      # Shared UI helpers (ToolUI, Sidebar, etc.)
│   │   ├─ tools/           # Individual tool components
│   │   ├─ App.jsx           # Root component, Theme provider, routing
│   │   └─ index.scss        # Global Carbon style overrides
│   └─ vite.config.js       # Vite config with Sass deprecation suppression
├─ backend/ (Go)            # Wails bridge, main entry point
│   ├─ main.go
│   └─ app.go
└─ AGENTS.md                # Design principles & UI guidelines (auto‑generated)
```

---

## UI / Design Guidelines (see `AGENTS.md`)
- **All components must use Carbon React components** (Button, TextArea, Select, Tabs, etc.).
- **TextAreas** for both input and output share the same style: monospace font, identical height, visible border, and a copy‑to‑clipboard button that is always shown next to the label.
- **Buttons** placed on the same line have a 1 rem gap and are grouped in a dedicated `ToolControls` area.
- **Labels** use Carbon’s label style (uppercase, small, secondary text color).
- **Theme switching** is available via the Settings overflow menu (System / Dark / Light).
- **Copy button** is positioned beside the pane label and never hidden.

---

## Adding a New Tool
1. Create a new component under `src/tools/`.
2. Wrap the UI with the shared helpers from `src/components/ToolUI.jsx` (`ToolHeader`, `ToolControls`, `ToolPane`, `ToolSplitPane`).
3. Export the component and add a route entry in `src/App.jsx`.
4. Follow the UI rules in `AGENTS.md` to keep the look consistent.

---

## Contributing
- Fork the repo and create a feature branch.
- Run `bun run lint` and `bun run format` before committing.
- Ensure any new UI respects the Carbon design system and the rules in `AGENTS.md`.
- Open a pull request with a clear description of the added functionality.

---

## License

MIT License – feel free to use, modify, and distribute.

---

*Built with ❤️ and 🤖.*
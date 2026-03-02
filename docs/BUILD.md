# Build from Source

## Prerequisites

- Go 1.25+
- Bun 1.0+
- Wails CLI: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

## Quick Build

```bash
# Clone
git clone https://github.com/vuon9/devtoolbox.git
cd devtoolbox

# Build
wails build

# Or run in development mode
wails dev
```

## Development

```bash
# Frontend only (hot reload)
cd frontend && bun dev

# Backend only
go run .

# Both (separate terminals)
wails dev  # Terminal 1
cd frontend && bun dev  # Terminal 2
```

## Output

Built binaries are in `build/bin/`:
- `devtoolbox` (Linux/macOS)
- `devtoolbox.exe` (Windows)

## Troubleshooting

**Frontend build fails:**
```bash
cd frontend && bun install
```

**Wails not found:**
```bash
go install github.com/wailsapp/wails/v2/cmd/wails@latest
```

# Build from Source

## Prerequisites

- Go 1.25+
- Bun 1.0+

## Quick Build

```bash
# Clone
git clone https://github.com/vuon9/devtoolbox.git
cd devtoolbox

# Build for the current platform
cd frontend && bun install && bun run build
cd ..
go build -o bin/DevToolbox .
```

## Development

```bash
# Frontend only (hot reload)
cd frontend && bun dev

# Backend only
go run .

# Both (separate terminals)
go run .                 # Terminal 1
cd frontend && bun dev   # Terminal 2
```

## Output

Built binaries and app bundles are in `bin/`:
- `DevToolbox` (Linux/macOS binary)
- `DevToolbox.exe` (Windows)
- `DevToolbox.app` (macOS package)

For signed and notarized macOS releases, see [MACOS_RELEASE.md](./MACOS_RELEASE.md).

## Troubleshooting

**Frontend build fails:**
```bash
cd frontend && bun install
```

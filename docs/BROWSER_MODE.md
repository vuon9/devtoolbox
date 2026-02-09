# Browser Mode

DevToolbox can run in web browsers alongside the desktop application.

## How It Works

When you start the desktop app, it also starts an HTTP server on port 8081. You can open `http://localhost:8081` in any browser to use the tools.

## Architecture

- **Desktop Mode**: Uses Wails runtime bindings
- **Browser Mode**: Uses HTTP API with Gin server
- **Auto-Discovery**: New services are automatically exposed via HTTP
- **Code Generation**: TypeScript clients are auto-generated from Go code

## API Endpoints

All services are available at `/api/{service-name}/{method-name}`:

- `POST /api/jwt-service/decode` - Decode JWT tokens
- `POST /api/conversion-service/convert` - Convert between formats
- `POST /api/barcode-service/generate-barcode` - Generate barcodes
- `POST /api/data-generator-service/generate` - Generate mock data
- `POST /api/code-formatter-service/format` - Format code
- `POST /api/date-time-service/convert` - Convert dates

### Health Check

```bash
curl http://localhost:8081/health
```

Response:
```json
{
  "status": "ok",
  "mode": "web",
  "time": "2026-02-09T21:20:00Z"
}
```

## Development

### Adding a New Service

1. Create your service in `service/` directory
2. Register it in `main.go`: `server.Register(&MyService{})`
3. Run the generator: `go run cmd/genservices/main.go`
4. Import the generated client: `import { myService } from '../generated'`

### Regenerating Clients

```bash
cd cmd/genservices
go run . -services ../../service -output ../../frontend/src/generated
```

This updates `frontend/src/generated/` with the latest TypeScript clients.

### Testing Browser Mode

1. Start the app: `go run .`
2. Open browser: `http://localhost:8081`
3. The same frontend works in both modes!

## Generated Client Structure

```
frontend/src/generated/
├── wails/              # Wails runtime wrappers
│   ├── jWTService.ts
│   ├── barcodeService.ts
│   └── ...
├── http/               # HTTP fetch clients
│   ├── jWTService.ts
│   ├── barcodeService.ts
│   └── ...
└── index.ts            # Unified facade
```

### Usage Example

```typescript
import { jWTService } from '../generated';

// Works in both Wails (desktop) and Browser mode!
const response = await jWTService.decode(token);
```

The unified facade automatically detects the runtime environment and uses the appropriate implementation.

## Configuration

### Environment Variables

- `VITE_API_URL` - Base URL for HTTP API (default: `http://localhost:8081`)

### Port Configuration

The HTTP server runs on port 8081 by default. You can change this in `main.go`:

```go
StartHTTPServer(8081)  // Change to your desired port
```

## Troubleshooting

### Port Already in Use

If port 8081 is taken, change it in `main.go` and restart.

### CORS Issues

The server includes CORS middleware allowing all origins. If you encounter issues, check:
1. Browser console for CORS errors
2. Server is running (`curl http://localhost:8081/health`)

### Generated Clients Out of Sync

Run the generator again after modifying service methods:
```bash
go run cmd/genservices/main.go
```

## Security Notes

- The HTTP server binds to all interfaces (0.0.0.0:8081) by default
- In production, consider adding authentication
- CORS is configured to allow all origins - restrict this for production use

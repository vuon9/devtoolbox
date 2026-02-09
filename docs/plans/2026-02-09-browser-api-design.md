# Browser API Support Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable DevToolbox to work in web browsers by adding a Gin HTTP API alongside the existing Wails desktop app, with auto-discovery of service methods and auto-generated TypeScript clients.

**Architecture:** A dual-mode system where Go services are registered once and exposed via both Wails runtime (desktop) and Gin HTTP server (browser). An auto-discovery router uses reflection to generate RESTful endpoints, and a code generator creates TypeScript clients for both modes with a unified facade that auto-detects the runtime environment.

**Tech Stack:** Go 1.22+, Gin Gonic, Go AST (codegen), TypeScript, Wails v3

---

## Task 1: Create Auto-Discovery Router Package

**Files:**
- Create: `pkg/router/router.go`
- Create: `pkg/router/binding.go`
- Test: `pkg/router/router_test.go`

**Step 1: Create router.go with service registration and auto-discovery**

Write file: `pkg/router/router.go`
```go
package router

import (
	"fmt"
	"net/http"
	"reflect"
	"strings"
	"unicode"

	"github.com/gin-gonic/gin"
)

// Router automatically discovers and registers service methods as HTTP routes
type Router struct {
	engine *gin.Engine
}

// New creates a new Router with the given Gin engine
func New(engine *gin.Engine) *Router {
	return &Router{engine: engine}
}

// Register scans a service struct and auto-generates routes for all exported methods
func (r *Router) Register(service interface{}) error {
	serviceType := reflect.TypeOf(service)
	serviceValue := reflect.ValueOf(service)

	// Get service name and convert to kebab-case
	serviceName := toKebabCase(serviceType.Elem().Name())

	// Iterate through all methods
	for i := 0; i < serviceType.NumMethod(); i++ {
		method := serviceType.Method(i)
		
		// Skip unexported methods and lifecycle methods
		if !method.IsExported() || isLifecycleMethod(method.Name) {
			continue
		}

		// Convert method name to kebab-case
		methodName := toKebabCase(method.Name)
		path := fmt.Sprintf("/api/%s/%s", serviceName, methodName)

		// Create handler
		handler := r.createHandler(serviceValue.Method(i), method)
		r.engine.POST(path, handler)
	}

	return nil
}

// createHandler creates a Gin handler for a method
func (r *Router) createHandler(methodValue reflect.Value, method reflect.Method) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get method signature
		methodType := method.Type
		numIn := methodType.NumIn()

		// Prepare arguments
		args := make([]reflect.Value, numIn-1) // -1 because receiver is first

		if numIn > 1 {
			// First argument should be a struct for JSON binding
			argType := methodType.In(1)
			argValue := reflect.New(argType).Interface()

			if err := c.ShouldBindJSON(argValue); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			args[0] = reflect.ValueOf(argValue).Elem()
		}

		// Call the method
		results := methodValue.Call(args)

		// Handle return values (result, error)
		if len(results) == 2 {
			// Check for error
			if !results[1].IsNil() {
				err := results[1].Interface().(error)
				c.JSON(http.StatusOK, gin.H{"error": err.Error()})
				return
			}

			// Return result
			c.JSON(http.StatusOK, results[0].Interface())
		} else if len(results) == 1 {
			c.JSON(http.StatusOK, results[0].Interface())
		}
	}
}

// toKebabCase converts PascalCase to kebab-case
func toKebabCase(s string) string {
	var result strings.Builder
	for i, r := range s {
		if unicode.IsUpper(r) {
			if i > 0 {
				result.WriteRune('-')
			}
			result.WriteRune(unicode.ToLower(r))
		} else {
			result.WriteRune(r)
		}
	}
	return result.String()
}

// isLifecycleMethod checks if method is a Wails lifecycle method
func isLifecycleMethod(name string) bool {
	return name == "ServiceStartup" || name == "ServiceShutdown"
}
```

**Step 2: Create binding.go for request/response utilities**

Write file: `pkg/router/binding.go`
```go
package router

// RequestWrapper wraps requests for single-parameter methods
type RequestWrapper struct {
	Args []interface{} `json:"args"`
}

// ResponseWrapper standardizes API responses
type ResponseWrapper struct {
	Data  interface{} `json:"data,omitempty"`
	Error string      `json:"error,omitempty"`
}
```

**Step 3: Write router tests**

Write file: `pkg/router/router_test.go`
```go
package router

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// Test service
type TestService struct{}

type EchoRequest struct {
	Message string `json:"message"`
}

type EchoResponse struct {
	Message string `json:"message"`
}

func (s *TestService) Echo(req EchoRequest) EchoResponse {
	return EchoResponse{Message: req.Message}
}

func (s *TestService) ServiceStartup() error {
	return nil
}

func TestRouter_Register(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	router := New(r)

	service := &TestService{}
	err := router.Register(service)
	assert.NoError(t, err)

	// Test echo endpoint
	req := EchoRequest{Message: "hello"}
	body, _ := json.Marshal(req)
	
	w := httptest.NewRecorder()
	httpReq, _ := http.NewRequest("POST", "/api/test-service/echo", bytes.NewBuffer(body))
	httpReq.Header.Set("Content-Type", "application/json")
	
	r.ServeHTTP(w, httpReq)

	assert.Equal(t, http.StatusOK, w.Code)
	
	var resp EchoResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.Equal(t, "hello", resp.Message)
}

func TestToKebabCase(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"JWTService", "jwt-service"},
		{"Decode", "decode"},
		{"VerifyToken", "verify-token"},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) stretchr/testify {
			result := toKebabCase(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}
```

**Step 4: Run tests**

```bash
cd pkg/router && go test -v
```

Expected: Tests pass

**Step 5: Commit**

```bash
git add pkg/router/
git commit -m "feat: add auto-discovery router with Gin integration"
```

---

## Task 2: Create HTTP Server Integration

**Files:**
- Create: `pkg/router/server.go`
- Modify: `server.go` (replace existing implementation)

**Step 1: Create server.go with Gin-based HTTP server**

Write file: `pkg/router/server.go`
```go
package router

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// Server represents the HTTP server with auto-discovery router
type Server struct {
	router *Router
	engine *gin.Engine
}

// NewServer creates a new HTTP server
func NewServer() *Server {
	gin.SetMode(gin.ReleaseMode)
	engine := gin.New()
	engine.Use(gin.Recovery())
	
	// CORS configuration
	config := cors.Config{
		AllowOrigins:     []string{"*"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}
	engine.Use(cors.New(config))

	// Health check
	engine.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"mode":   "web",
			"time":   time.Now().Format(time.RFC3339),
		})
	})

	return &Server{
		router: New(engine),
		engine: engine,
	}
}

// Register adds a service to the router
func (s *Server) Register(service interface{}) error {
	return s.router.Register(service)
}

// Start starts the HTTP server on the specified port
func (s *Server) Start(port int) error {
	addr := fmt.Sprintf(":%d", port)
	return s.engine.Run(addr)
}

// Engine returns the Gin engine for testing
func (s *Server) Engine() *gin.Engine {
	return s.engine
}
```

**Step 2: Update main server.go to use the new router**

Read existing: `server.go` (lines 1-50)

Replace entire file content with:
```go
package main

import (
	"devtoolbox/pkg/router"
	"devtoolbox/service"
)

// StartHTTPServer starts the HTTP server with all services registered
func StartHTTPServer(port int) {
	// Create services
	jwtSvc := service.NewJWTService(nil)
	conversionSvc := service.NewConversionService(nil)
	barcodeSvc := service.NewBarcodeService(nil)
	dataGenSvc := service.NewDataGeneratorService(nil)
	codeFmtSvc := service.NewCodeFormatterService(nil)
	dateTimeSvc := service.NewDateTimeService(nil)

	// Create server and register services
	server := router.NewServer()
	server.Register(jwtSvc)
	server.Register(conversionSvc)
	server.Register(barcodeSvc)
	server.Register(dataGenSvc)
	server.Register(codeFmtSvc)
	server.Register(dateTimeSvc)

	// Start server
	server.Start(port)
}
```

**Step 3: Commit**

```bash
git add pkg/router/server.go server.go
git commit -m "feat: integrate auto-discovery router into HTTP server"
```

---

## Task 3: Update Main.go for Dual-Mode Operation

**Files:**
- Modify: `main.go`

**Step 1: Read current main.go**

Read: `main.go`

**Step 2: Modify main.go to start HTTP server in background**

Add after service creation (around line 61):
```go
	// Start HTTP server for browser support (background)
	go func() {
		StartHTTPServer(8081)
	}()
```

This should be placed right before the `app.Window.NewWithOptions()` call.

**Step 3: Commit**

```bash
git add main.go
git commit -m "feat: enable dual-mode with HTTP server on port 8081"
```

---

## Task 4: Create Code Generator Tool

**Files:**
- Create: `cmd/genservices/main.go`
- Create: `cmd/genservices/parser.go`
- Create: `cmd/genservices/generator.go`
- Create: `cmd/genservices/templates/typescript.tmpl`

**Step 1: Create parser.go to parse Go service files**

Write file: `cmd/genservices/parser.go`
```go
package main

import (
	"go/ast"
	"go/parser"
	"go/token"
	"path/filepath"
	"strings"
)

// ServiceMethod represents a method in a service
type ServiceMethod struct {
	Name       string
	Parameters []Parameter
	Returns    []Parameter
}

// Parameter represents a method parameter
type Parameter struct {
	Name string
	Type string
}

// Service represents a parsed service
type Service struct {
	Name    string
	Methods []ServiceMethod
}

// Parser parses Go service files
type Parser struct {
	serviceDir string
}

// NewParser creates a new parser
func NewParser(serviceDir string) *Parser {
	return &Parser{serviceDir: serviceDir}
}

// ParseServices parses all service files in the directory
func (p *Parser) ParseServices() ([]Service, error) {
	fset := token.NewFileSet()
	
	// Parse all Go files in service directory
	pkgs, err := parser.ParseDir(fset, p.serviceDir, nil, 0)
	if err != nil {
		return nil, err
	}

	var services []Service

	for _, pkg := range pkgs {
		for filename, file := range pkg.Files {
			if strings.HasSuffix(filename, "_test.go") {
				continue
			}

			service := p.parseFile(file)
			if service != nil {
				services = append(services, *service)
			}
		}
	}

	return services, nil
}

// parseFile parses a single Go file and extracts services
func (p *Parser) parseFile(file *ast.File) *Service {
	for _, decl := range file.Decls {
		genDecl, ok := decl.(*ast.GenDecl)
		if !ok || genDecl.Tok != token.TYPE {
			continue
		}

		for _, spec := range genDecl.Specs {
			typeSpec, ok := spec.(*ast.TypeSpec)
			if !ok {
				continue
			}

			structType, ok := typeSpec.Type.(*ast.StructType)
			if !ok {
				continue
			}

			// Check if it's a service (has Service suffix or contains service methods)
			if strings.HasSuffix(typeSpec.Name.Name, "Service") {
				service := &Service{
					Name: typeSpec.Name.Name,
				}
				
				// Find methods for this type
				service.Methods = p.findMethods(file, typeSpec.Name.Name)
				
				return service
			}
			
			_ = structType // Use the variable to avoid unused warning
		}
	}

	return nil
}

// findMethods finds all methods for a given type
func (p *Parser) findMethods(file *ast.File, typeName string) []ServiceMethod {
	var methods []ServiceMethod

	for _, decl := range file.Decls {
		funcDecl, ok := decl.(*ast.FuncDecl)
		if !ok || funcDecl.Recv == nil {
			continue
		}

		// Check if this method belongs to our type
		for _, recv := range funcDecl.Recv.List {
			recvType := p.getTypeString(recv.Type)
			if recvType == "*"+typeName || recvType == typeName {
				method := ServiceMethod{
					Name: funcDecl.Name.Name,
				}
				
				// Parse parameters (skip receiver)
				if funcDecl.Type.Params != nil {
					for _, param := range funcDecl.Type.Params.List {
						paramType := p.getTypeString(param.Type)
						for _, name := range param.Names {
							method.Parameters = append(method.Parameters, Parameter{
								Name: name.Name,
								Type: paramType,
							})
						}
					}
				}

				// Parse returns
				if funcDecl.Type.Results != nil {
					for _, result := range funcDecl.Type.Results.List {
						resultType := p.getTypeString(result.Type)
						method.Returns = append(method.Returns, Parameter{
							Type: resultType,
						})
					}
				}

				methods = append(methods, method)
			}
		}
	}

	return methods
}

// getTypeString converts an AST type to a string
func (p *Parser) getTypeString(expr ast.Expr) string {
	switch t := expr.(type) {
	case *ast.Ident:
		return t.Name
	case *ast.StarExpr:
		return "*" + p.getTypeString(t.X)
	case *ast.SelectorExpr:
		return p.getTypeString(t.X) + "." + t.Sel.Name
	default:
		return ""
	}
}
```

**Step 2: Create generator.go for TypeScript generation**

Write file: `cmd/genservices/generator.go`
```go
package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"text/template"
)

// Generator generates TypeScript code
type Generator struct {
	outputDir string
	tmpl      *template.Template
}

// NewGenerator creates a new generator
func NewGenerator(outputDir string) (*Generator, error) {
	tmplPath := filepath.Join("cmd", "genservices", "templates", "typescript.tmpl")
	tmplContent, err := os.ReadFile(tmplPath)
	if err != nil {
		return nil, err
	}

	tmpl, err := template.New("typescript").Parse(string(tmplContent))
	if err != nil {
		return nil, err
	}

	return &Generator{
		outputDir: outputDir,
		tmpl:      tmpl,
	}, nil
}

// Generate creates TypeScript files for all services
func (g *Generator) Generate(services []Service) error {
	// Create output directories
	wailsDir := filepath.Join(g.outputDir, "wails")
	httpDir := filepath.Join(g.outputDir, "http")

	os.MkdirAll(wailsDir, 0755)
	os.MkdirAll(httpDir, 0755)

	// Generate individual service files
	for _, service := range services {
		if err := g.generateWailsService(wailsDir, service); err != nil {
			return err
		}
		if err := g.generateHTTPService(httpDir, service); err != nil {
			return err
		}
	}

	// Generate index files
	if err := g.generateWailsIndex(wailsDir, services); err != nil {
		return err
	}
	if err := g.generateHTTPIndex(httpDir, services); err != nil {
		return err
	}

	// Generate unified facade
	return g.generateUnifiedFacade(g.outputDir, services)
}

func (g *Generator) generateWailsService(dir string, service Service) error {
	filename := filepath.Join(dir, toCamelCase(service.Name)+".ts")
	
	data := struct {
		ServiceName string
		Methods     []ServiceMethod
	}{
		ServiceName: service.Name,
		Methods:     service.Methods,
	}

	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	return g.tmpl.ExecuteTemplate(file, "wails", data)
}

func (g *Generator) generateHTTPService(dir string, service Service) error {
	filename := filepath.Join(dir, toCamelCase(service.Name)+".ts")
	
	data := struct {
		ServiceName string
		Methods     []ServiceMethod
	}{
		ServiceName: service.Name,
		Methods:     service.Methods,
	}

	file, err := os.Create(filename)
	if err != nil {
		return err
	}
	defer file.Close()

	return g.tmpl.ExecuteTemplate(file, "http", data)
}

func (g *Generator) generateWailsIndex(dir string, services []Service) error {
	filename := filepath.Join(dir, "index.ts")
	
	var exports []string
	for _, svc := range services {
		exports = append(exports, fmt.Sprintf("export * as %s from './%s';", 
			toCamelCase(svc.Name), toCamelCase(svc.Name)))
	}

	content := strings.Join(exports, "\n")
	return os.WriteFile(filename, []byte(content), 0644)
}

func (g *Generator) generateHTTPIndex(dir string, services []Service) error {
	filename := filepath.Join(dir, "index.ts")
	
	var exports []string
	for _, svc := range services {
		exports = append(exports, fmt.Sprintf("export * as %s from './%s';", 
			toCamelCase(svc.Name), toCamelCase(svc.Name)))
	}

	content := strings.Join(exports, "\n")
	return os.WriteFile(filename, []byte(content), 0644)
}

func (g *Generator) generateUnifiedFacade(dir string, services []Service) error {
	filename := filepath.Join(dir, "index.ts")
	
	var serviceImports []string
	var serviceMappings []string

	for _, svc := range services {
		camelName := toCamelCase(svc.Name)
		serviceImports = append(serviceImports, fmt.Sprintf(
			"import { %s as Wails%s } from './wails/%s';\n"+
			"import { %s as HTTP%s } from './http/%s';",
			svc.Name, svc.Name, camelName,
			svc.Name, svc.Name, camelName))
		
		serviceMappings = append(serviceMappings, fmt.Sprintf(
			"export const %s = isWails() ? Wails%s : HTTP%s;",
			camelName, svc.Name, svc.Name))
	}

	content := fmt.Sprintf(`// Auto-generated unified service facade
// Detects runtime environment and uses appropriate implementation

const isWails = () => {
  return typeof window !== 'undefined' && 
         window.runtime && 
         window.runtime.EventsOn !== undefined;
};

%s

%s
`, strings.Join(serviceImports, "\n"), strings.Join(serviceMappings, "\n"))

	return os.WriteFile(filename, []byte(content), 0644)
}

// toCamelCase converts PascalCase to camelCase
func toCamelCase(s string) string {
	if s == "" {
		return s
	}
	return strings.ToLower(s[:1]) + s[1:]
}
```

**Step 3: Create TypeScript template**

Write file: `cmd/genservices/templates/typescript.tmpl`
```
{{define "wails"}}// Auto-generated Wails client for {{.ServiceName}}
// This file is auto-generated. DO NOT EDIT.

import { {{.ServiceName}} } from '../../../bindings/devtoolbox/service';

{{range .Methods}}
export const {{toCamelCase .Name}} = ({{range $i, $p := .Parameters}}{{if $i}}, {{end}}{{$p.Name}}: {{goToTS $p.Type}}{{end}}): Promise<{{goToTS (index .Returns 0).Type}}> => {
  return {{$.ServiceName}}.{{.Name}}({{range $i, $p := .Parameters}}{{if $i}}, {{end}}{{$p.Name}}{{end}});
};
{{end}}
{{end}}

{{define "http"}}// Auto-generated HTTP client for {{.ServiceName}}
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

{{range .Methods}}
export const {{toCamelCase .Name}} = async ({{range $i, $p := .Parameters}}{{if $i}}, {{end}}{{$p.Name}}: {{goToTS $p.Type}}{{end}}): Promise<{{goToTS (index .Returns 0).Type}}> => {
  const response = await fetch(`${API_BASE}/api/{{kebabCase $.ServiceName}}/{{kebabCase .Name}}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({{if eq (len .Parameters) 1}}{{index .Parameters 0).Name}}{{else}}{ {{range $i, $p := .Parameters}}{{if $i}}, {{end}}"{{$p.Name}}": {{$p.Name}}{{end}} }{{end}})
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
};
{{end}}
{{end}}
```

**Step 4: Create main.go for the generator tool**

Write file: `cmd/genservices/main.go`
```go
package main

import (
	"flag"
	"fmt"
	"log"
	"os"
	"path/filepath"
	"strings"
)

func main() {
	var (
		serviceDir = flag.String("services", "service", "Directory containing Go service files")
		outputDir  = flag.String("output", "frontend/src/generated", "Output directory for generated TypeScript")
	)
	flag.Parse()

	// Get absolute paths
	absServiceDir, err := filepath.Abs(*serviceDir)
	if err != nil {
		log.Fatal(err)
	}

	absOutputDir, err := filepath.Abs(*outputDir)
	if err != nil {
		log.Fatal(err)
	}

	fmt.Printf("Parsing services from: %s\n", absServiceDir)
	fmt.Printf("Generating TypeScript to: %s\n", absOutputDir)

	// Parse services
	parser := NewParser(absServiceDir)
	services, err := parser.ParseServices()
	if err != nil {
		log.Fatal("Failed to parse services:", err)
	}

	fmt.Printf("Found %d services\n", len(services))
	for _, svc := range services {
		fmt.Printf("  - %s (%d methods)\n", svc.Name, len(svc.Methods))
	}

	// Generate TypeScript
	generator, err := NewGenerator(absOutputDir)
	if err != nil {
		log.Fatal("Failed to create generator:", err)
	}

	if err := generator.Generate(services); err != nil {
		log.Fatal("Failed to generate TypeScript:", err)
	}

	fmt.Println("✓ Generation complete!")
}

// Helper functions for templates
func init() {
	// These would be registered as template functions
	_ = toCamelCase
	_ = kebabCase
	_ = goToTS
}

func toCamelCase(s string) string {
	if s == "" {
		return s
	}
	return strings.ToLower(s[:1]) + s[1:]
}

func kebabCase(s string) string {
	var result strings.Builder
	for i, r := range s {
		if i > 0 && r >= 'A' && r <= 'Z' {
			result.WriteRune('-')
		}
		result.WriteRune(r)
	}
	return strings.ToLower(result.String())
}

func goToTS(goType string) string {
	// Simple type mappings
	switch goType {
	case "string":
		return "string"
	case "int", "int64", "float64":
		return "number"
	case "bool":
		return "boolean"
	case "error":
		return "Error"
	default:
		// For complex types, return as-is (would need proper type imports)
		return goType
	}
}
```

**Step 5: Commit**

```bash
git add cmd/genservices/
git commit -m "feat: add TypeScript client generator tool"
```

---

## Task 5: Run Generator and Create Frontend Clients

**Files:**
- Create: `frontend/src/generated/wails/*.ts`
- Create: `frontend/src/generated/http/*.ts`
- Create: `frontend/src/generated/index.ts`

**Step 1: Run the generator**

```bash
go run cmd/genservices/main.go -services service -output frontend/src/generated
```

Expected output:
```
Parsing services from: /Users/vuong/workspace/vuon9/devtoolbox/.worktrees/browser-api/service
Generating TypeScript to: /Users/vuong/workspace/vuon9/devtoolbox/.worktrees/browser-api/frontend/src/generated
Found 6 services
  - JWTService (3 methods)
  - ConversionService (1 methods)
  - BarcodeService (5 methods)
  - DataGeneratorService (3 methods)
  - CodeFormatterService (1 methods)
  - DateTimeService (4 methods)
✓ Generation complete!
```

**Step 2: Verify generated files exist**

```bash
ls -la frontend/src/generated/
ls -la frontend/src/generated/wails/
ls -la frontend/src/generated/http/
```

Expected: Files should exist

**Step 3: Commit generated files**

```bash
git add frontend/src/generated/
git commit -m "feat: generate TypeScript clients for all services"
```

---

## Task 6: Update Frontend Components to Use Generated Clients

**Files:**
- Modify: `frontend/src/pages/JwtDebugger/index.jsx` (as example)
- Create: `frontend/src/services/api.ts` (migration helper)

**Step 1: Create migration helper**

Write file: `frontend/src/services/api.ts`
```typescript
// Re-export generated services for convenience
export * from '../generated';
```

**Step 2: Update one component as proof of concept**

Modify: `frontend/src/pages/JwtDebugger/index.jsx`

Change line 9 from:
```javascript
import { JWTService } from '../../../bindings/devtoolbox/service';
```

To:
```javascript
import { jwtService } from '../../services/api';
```

Change line 32 from:
```javascript
const response = await JWTService.Decode(state.token);
```

To:
```javascript
const response = await jwtService.decode(state.token);
```

And line 69 from:
```javascript
const response = await JWTService.Verify(state.token, state.secret, state.encoding);
```

To:
```javascript
const response = await jwtService.verify(state.token, state.secret, state.encoding);
```

**Step 3: Test the component**

```bash
cd frontend && npm run build
```

Expected: Build succeeds

**Step 4: Commit**

```bash
git add frontend/src/services/api.ts frontend/src/pages/JwtDebugger/index.jsx
git commit -m "feat: migrate JwtDebugger to use generated API clients"
```

---

## Task 7: Testing and Validation

**Files:**
- Create: `pkg/router/integration_test.go`

**Step 1: Create integration tests**

Write file: `pkg/router/integration_test.go`
```go
package router

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// Integration test with real services
func TestIntegration_AllServices(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	server := NewServer()
	
	// Register all services
	jwtSvc := &mockJWTService{}
	server.Register(jwtSvc)
	
	// Test health endpoint
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/health", nil)
	server.Engine().ServeHTTP(w, req)
	
	assert.Equal(t, http.StatusOK, w.Code)
	
	var health map[string]interface{}
	json.Unmarshal(w.Body.Bytes(), &health)
	assert.Equal(t, "ok", health["status"])
	assert.Equal(t, "web", health["mode"])
}

// Mock services for testing
type mockJWTService struct{}

type mockDecodeRequest struct {
	Token string `json:"token"`
}

type mockDecodeResponse struct {
	Valid bool   `json:"valid"`
	Error string `json:"error,omitempty"`
}

func (s *mockJWTService) Decode(req mockDecodeRequest) mockDecodeResponse {
	if req.Token == "" {
		return mockDecodeResponse{Valid: false, Error: "empty token"}
	}
	return mockDecodeResponse{Valid: true}
}

func TestIntegration_JWTDecode(t *testing.T) {
	gin.SetMode(gin.TestMode)
	
	server := NewServer()
	jwtSvc := &mockJWTService{}
	server.Register(jwtSvc)
	
	// Test decode endpoint
	reqBody := map[string]string{"token": "test.jwt.token"}
	body, _ := json.Marshal(reqBody)
	
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/mock-jwt-service/decode", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	
	server.Engine().ServeHTTP(w, req)
	
	assert.Equal(t, http.StatusOK, w.Code)
	
	var resp mockDecodeResponse
	json.Unmarshal(w.Body.Bytes(), &resp)
	assert.True(t, resp.Valid)
}
```

**Step 2: Run integration tests**

```bash
cd pkg/router && go test -v -run Integration
```

Expected: Tests pass

**Step 3: Test HTTP server startup**

```bash
go run . &
sleep 2
curl http://localhost:8081/health
```

Expected:
```json
{"mode":"web","status":"ok","time":"2026-02-09T..."}
```

**Step 4: Test API endpoint**

```bash
curl -X POST http://localhost:8081/api/jwt-service/decode \
  -H "Content-Type: application/json" \
  -d '{"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"}'
```

Expected: Valid JWT response

**Step 5: Kill background server and commit**

```bash
pkill -f "go run ."
git add pkg/router/integration_test.go
git commit -m "test: add integration tests for HTTP API"
```

---

## Task 8: Documentation and Final Steps

**Files:**
- Create: `docs/BROWSER_MODE.md`
- Modify: `README.md`

**Step 1: Create browser mode documentation**

Write file: `docs/BROWSER_MODE.md`
```markdown
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
- etc.

## Development

### Adding a New Service

1. Create your service in `service/` directory
2. Register it in `main.go`: `server.Register(&MyService{})`
3. Run the generator: `go run cmd/genservices/main.go`
4. Import the generated client: `import { myService } from '../generated'`

### Regenerating Clients

```bash
go run cmd/genservices/main.go
```

This updates `frontend/src/generated/` with the latest TypeScript clients.

### Testing Browser Mode

1. Start the app: `go run .`
2. Open browser: `http://localhost:8081`
3. The same frontend works in both modes!
```

**Step 2: Update README.md**

Add to README.md:
```markdown
## Browser Support

DevToolbox works in both desktop and browser modes:

- **Desktop**: Native Wails application with native performance
- **Browser**: Access via `http://localhost:8081` when the app is running

The frontend automatically detects the environment and uses the appropriate API (Wails runtime for desktop, HTTP for browser).
```

**Step 3: Commit documentation**

```bash
git add docs/BROWSER_MODE.md README.md
git commit -m "docs: add browser mode documentation"
```

**Step 4: Final verification**

```bash
go test ./pkg/router/...
go build .
```

Expected: All tests pass, build succeeds

**Step 5: Final commit and summary**

```bash
git log --oneline -10
```

Expected: All commits visible

---

## Summary of Changes

1. **pkg/router/** - Auto-discovery Gin router with reflection
2. **cmd/genservices/** - TypeScript client generator tool
3. **server.go** - Updated to use new router
4. **main.go** - Dual-mode startup (Wails + HTTP)
5. **frontend/src/generated/** - Auto-generated TypeScript clients
6. **frontend/src/services/api.ts** - Unified facade

## Next Steps (Optional)

1. Update remaining frontend components to use generated clients
2. Add OpenAPI spec generation
3. Add authentication for HTTP API
4. Serve static frontend files from Gin for standalone web deployment

## Testing Checklist

- [ ] HTTP server starts on port 8081
- [ ] Health endpoint returns 200
- [ ] JWT decode endpoint works
- [ ] All service endpoints accessible
- [ ] Frontend builds successfully
- [ ] Generated clients compile
- [ ] Wails mode still works
- [ ] Browser mode works
```
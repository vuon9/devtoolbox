package main

import (
	_ "embed"
	"fmt"
	"os"
	"path/filepath"
	"strings"
	"text/template"
)

//go:embed templates/typescript.tmpl
var typescriptTemplate string

// Generator generates TypeScript code
type Generator struct {
	outputDir string
	tmpl      *template.Template
}

// toTSType converts Go type names to TypeScript types
func toTSType(goType string) string {
	switch {
	case goType == "string":
		return "string"
	case goType == "bool":
		return "boolean"
	case goType == "int" || goType == "int64" || goType == "float64" || goType == "float32":
		return "number"
	case strings.HasPrefix(goType, "map["):
		return "Record<string, any>"
	case strings.HasPrefix(goType, "[]"):
		return "any[]"
	case goType == "interface{}" || goType == "interface {}" || goType == "":
		return "any"
	case goType == "error":
		return "string"
	default:
		return "any"
	}
}

// isPrimitiveType returns true for primitive Go types that should be wrapped in { value: ... }
func isPrimitiveType(goType string) bool {
	switch {
	case goType == "string", goType == "bool", goType == "int", goType == "int64", goType == "float64", goType == "float32", goType == "interface{}", goType == "interface {}", goType == "":
		return true
	case strings.HasPrefix(goType, "map["), strings.HasPrefix(goType, "[]"):
		return true
	default:
		return false
	}
}

// NewGenerator creates a new generator
func NewGenerator(outputDir string) (*Generator, error) {
	funcMap := template.FuncMap{
		"tsType":       toTSType,
		"toKebabCase":  toKebabCase,
		"isPrimitive":  isPrimitiveType,
	}
	tmpl, err := template.New("typescript").Funcs(funcMap).Parse(typescriptTemplate)
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

	// Generate individual service files (HTTP only — Wails bindings require `wails generate`)
	for _, service := range services {
		if err := g.generateHTTPService(httpDir, service); err != nil {
			return err
		}
	}

	// Generate index files
	if err := g.generateHTTPIndex(httpDir, services); err != nil {
		return err
	}

	return nil
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



// toCamelCase converts PascalCase to camelCase
func toCamelCase(s string) string {
	if s == "" {
		return s
	}
	return strings.ToLower(s[:1]) + s[1:]
}

// toKebabCase converts PascalCase to kebab-case
func toKebabCase(s string) string {
	var result strings.Builder
	var prevUpper bool

	for i, r := range s {
		isUpper := r >= 'A' && r <= 'Z'

		if isUpper && i > 0 {
			nextIsLower := i+1 < len(s) && s[i+1] >= 'a' && s[i+1] <= 'z'
			if !prevUpper || nextIsLower {
				result.WriteRune('-')
			}
		}

		result.WriteRune(r | 0x20) // to lower
		prevUpper = isUpper
	}
	return result.String()
}

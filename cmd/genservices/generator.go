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

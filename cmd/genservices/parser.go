package main

import (
	"go/ast"
	"go/parser"
	"go/token"
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

			_, ok = typeSpec.Type.(*ast.StructType)
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

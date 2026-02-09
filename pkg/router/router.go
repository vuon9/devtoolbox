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
	var prevUpper bool

	for i, r := range s {
		isUpper := unicode.IsUpper(r)

		// Add hyphen before uppercase letter if:
		// 1. Not at the start
		// 2. Previous char was lowercase, OR
		// 3. Current is uppercase but next is lowercase (transition from acronym to word)
		if isUpper && i > 0 {
			nextIsLower := i+1 < len(s) && unicode.IsLower(rune(s[i+1]))
			if !prevUpper || nextIsLower {
				result.WriteRune('-')
			}
		}

		result.WriteRune(unicode.ToLower(r))
		prevUpper = isUpper
	}
	return result.String()
}

// isLifecycleMethod checks if method is a Wails lifecycle method
func isLifecycleMethod(name string) bool {
	return name == "ServiceStartup" || name == "ServiceShutdown"
}

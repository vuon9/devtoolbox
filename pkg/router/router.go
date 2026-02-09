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
			// Method has parameters - create a wrapper struct to hold all params
			type paramInfo struct {
				name    string
				argType reflect.Type
				index   int
			}

			var params []paramInfo
			for i := 1; i < numIn; i++ {
				params = append(params, paramInfo{
					name:    methodType.In(i).Name(),
					argType: methodType.In(i),
					index:   i - 1,
				})
			}

			// Single parameter handling
			if len(params) == 1 {
				param := params[0]

				if param.argType.Kind() == reflect.Struct {
					// Single struct parameter - bind directly
					argValue := reflect.New(param.argType).Interface()
					if err := c.ShouldBindJSON(argValue); err != nil {
						c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
						return
					}
					args[0] = reflect.ValueOf(argValue).Elem()
				} else {
					// Single primitive parameter - use "value" field convention
					var wrapper struct {
						Value interface{} `json:"value"`
					}
					if err := c.ShouldBindJSON(&wrapper); err != nil {
						c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
						return
					}
					args[0] = convertToType(wrapper.Value, param.argType)
				}
			} else {
				// Multiple parameters - bind to a map and use "arg0", "arg1", etc.
				var requestMap map[string]interface{}
				if err := c.ShouldBindJSON(&requestMap); err != nil {
					c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
					return
				}

				// Convert each parameter
				for _, param := range params {
					// Use "arg0", "arg1", etc. as keys for multiple parameters
					key := fmt.Sprintf("arg%d", param.index)
					value, exists := requestMap[key]
					if !exists {
						// Use zero value if not provided
						args[param.index] = reflect.Zero(param.argType)
						continue
					}

					// Convert value to expected type
					argValue := convertToType(value, param.argType)
					args[param.index] = argValue
				}
			}
		}
		// If no parameters, args is already empty

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

// convertToType converts an interface{} value to the expected reflect.Type
func convertToType(value interface{}, targetType reflect.Type) reflect.Value {
	switch targetType.Kind() {
	case reflect.String:
		if s, ok := value.(string); ok {
			return reflect.ValueOf(s)
		}
		return reflect.ValueOf("")
	case reflect.Int:
		if f, ok := value.(float64); ok {
			return reflect.ValueOf(int(f))
		}
		return reflect.ValueOf(0)
	case reflect.Int64:
		if f, ok := value.(float64); ok {
			return reflect.ValueOf(int64(f))
		}
		return reflect.ValueOf(int64(0))
	case reflect.Float64:
		if f, ok := value.(float64); ok {
			return reflect.ValueOf(f)
		}
		return reflect.ValueOf(float64(0))
	case reflect.Bool:
		if b, ok := value.(bool); ok {
			return reflect.ValueOf(b)
		}
		return reflect.ValueOf(false)
	case reflect.Map:
		if m, ok := value.(map[string]interface{}); ok {
			return reflect.ValueOf(m)
		}
		return reflect.ValueOf(map[string]interface{}{})
	case reflect.Slice:
		if s, ok := value.([]interface{}); ok {
			return reflect.ValueOf(s)
		}
		return reflect.ValueOf([]interface{}{})
	default:
		return reflect.Zero(targetType)
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

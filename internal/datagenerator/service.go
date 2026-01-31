package datagenerator

import (
	"fmt"
	"time"
)

// DataGeneratorService defines the interface for data generation
type DataGeneratorService interface {
	Generate(req GenerateRequest) (*GenerateResponse, error)
	GetPresets() (*PresetsResponse, error)
	ValidateTemplate(template string) (*ValidationResult, error)
}

// dataGeneratorService implements DataGeneratorService
type dataGeneratorService struct {
	engine    *Engine
	formatter *Formatter
}

// NewDataGeneratorService creates a new data generator service
func NewDataGeneratorService() DataGeneratorService {
	return &dataGeneratorService{
		engine:    NewEngine(),
		formatter: NewFormatter(),
	}
}

// Generate generates data based on the request
func (s *dataGeneratorService) Generate(req GenerateRequest) (*GenerateResponse, error) {
	// Validate batch count (allow 1 for single mode, otherwise 10-1000)
	if req.BatchCount < 1 || req.BatchCount > 1000 {
		return &GenerateResponse{
			Error: ErrInvalidBatchCount.Error(),
		}, nil
	}

	// Validate template
	if err := s.engine.Validate(req.Template); err != nil {
		return &GenerateResponse{
			Error: err.Error(),
		}, nil
	}

	// Convert variables to proper types (JSON numbers come as float64)
	convertedVars := make(map[string]interface{})
	for key, value := range req.Variables {
		switch v := value.(type) {
		case float64:
			// Convert float64 to int if it's a whole number
			if v == float64(int(v)) {
				convertedVars[key] = int(v)
			} else {
				convertedVars[key] = v
			}
		case bool:
			convertedVars[key] = v
		case string:
			convertedVars[key] = v
		default:
			convertedVars[key] = value
		}
	}

	// Generate data
	start := time.Now()
	results, err := s.engine.GenerateBatch(req.Template, req.BatchCount, convertedVars)
	duration := time.Since(start).Milliseconds()

	if err != nil {
		return &GenerateResponse{
			Error:    err.Error(),
			Duration: duration,
		}, nil
	}

	// Format output
	output, err := s.formatter.Format(results, req.OutputFormat, req.Separator)
	if err != nil {
		return &GenerateResponse{
			Error:    err.Error(),
			Duration: duration,
		}, nil
	}

	// Pretty print if JSON and requested
	if req.OutputFormat == "json" {
		if pretty, err := s.formatter.PrettyPrint(output); err == nil {
			output = pretty
		}
	}

	return &GenerateResponse{
		Output:   output,
		Count:    len(results),
		Duration: duration,
	}, nil
}

// GetPresets returns all built-in template presets
func (s *dataGeneratorService) GetPresets() (*PresetsResponse, error) {
	presets := GetBuiltInPresets()
	return &PresetsResponse{
		Presets: presets,
	}, nil
}

// ValidateTemplate validates a template string
func (s *dataGeneratorService) ValidateTemplate(template string) (*ValidationResult, error) {
	if err := s.engine.Validate(template); err != nil {
		return &ValidationResult{
			Valid:   false,
			Error:   err.Error(),
			Message: fmt.Sprintf("Template validation failed: %v", err),
		}, nil
	}

	return &ValidationResult{
		Valid:   true,
		Message: "Template is valid",
	}, nil
}

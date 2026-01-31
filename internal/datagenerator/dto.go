package datagenerator

// Variable represents a configurable variable in a template
type Variable struct {
	Name        string      `json:"name"`
	Type        string      `json:"type"` // string, number, select, boolean
	Default     interface{} `json:"default"`
	Options     []string    `json:"options,omitempty"`
	Min         int         `json:"min,omitempty"`
	Max         int         `json:"max,omitempty"`
	Description string      `json:"description,omitempty"`
}

// TemplatePreset represents a built-in template
type TemplatePreset struct {
	ID          string     `json:"id"`
	Name        string     `json:"name"`
	Description string     `json:"description"`
	Template    string     `json:"template"`
	Variables   []Variable `json:"variables"`
}

// GenerateRequest represents a request to generate data
type GenerateRequest struct {
	Template     string                 `json:"template"`
	Variables    map[string]interface{} `json:"variables"`
	BatchCount   int                    `json:"batchCount"`   // 10-1000
	OutputFormat string                 `json:"outputFormat"` // json, xml, csv, yaml, raw
	Separator    string                 `json:"separator"`    // newline, comma, none (for raw format)
}

// GenerateResponse represents the response from data generation
type GenerateResponse struct {
	Output   string `json:"output"`
	Count    int    `json:"count"`
	Error    string `json:"error,omitempty"`
	Duration int64  `json:"durationMs"` // Generation time in milliseconds
}

// ValidationResult represents template validation result
type ValidationResult struct {
	Valid   bool   `json:"valid"`
	Error   string `json:"error,omitempty"`
	Message string `json:"message,omitempty"`
}

// PresetsResponse represents the response with all presets
type PresetsResponse struct {
	Presets []TemplatePreset `json:"presets"`
	Error   string           `json:"error,omitempty"`
}

package datetimeconverter

// ConvertRequest represents a conversion request from the frontend
type ConvertRequest struct {
	Input        string `json:"input"`
	Precision    string `json:"precision"`    // "auto", "seconds", "millis", "micros", "nanos"
	Timezone     string `json:"timezone"`     // "local", "UTC", or IANA timezone name
	OutputFormat string `json:"outputFormat"` // "iso", "rfc2822", "sql", "us", "eu", "compact", "custom"
	CustomFormat string `json:"customFormat"`
}

// ConvertResponse represents the conversion response
type ConvertResponse struct {
	Result       *TimeResult `json:"result,omitempty"`
	DetectedType string      `json:"detectedType"` // "timestamp", "iso", "date", "unknown"
	DetectedPrec string      `json:"detectedPrec"` // "seconds", "millis", "micros", "nanos"
	Error        string      `json:"error,omitempty"`
}

// PresetsResponse returns all available presets
type PresetsResponse struct {
	Presets []Preset `json:"presets"`
}

// DeltaRequest represents a time delta calculation request
type DeltaRequest struct {
	DateA string `json:"dateA"`
	DateB string `json:"dateB"`
}

// DeltaResponse represents a time delta calculation response
type DeltaResponse struct {
	Delta *TimeDelta `json:"delta,omitempty"`
	Error string     `json:"error,omitempty"`
}

// ArithmeticRequest represents a date arithmetic request
type ArithmeticRequest struct {
	BaseDate  string `json:"baseDate"`
	Operation string `json:"operation"` // "add" or "subtract"
	Value     int    `json:"value"`
	Unit      string `json:"unit"` // "seconds", "minutes", "hours", "days", "weeks", "months", "years"
}

// ArithmeticResponse represents a date arithmetic response
type ArithmeticResponse struct {
	Result *TimeResult `json:"result,omitempty"`
	Error  string      `json:"error,omitempty"`
}

// BatchRequest represents a batch conversion request
type BatchRequest struct {
	Inputs   []string `json:"inputs"`
	Timezone string   `json:"timezone"`
}

// BatchResponse represents a batch conversion response
type BatchResponse struct {
	Results []BatchResult `json:"results"`
}

// TimezoneComparisonRequest represents a timezone comparison request
type TimezoneComparisonRequest struct {
	Timestamp int64    `json:"timestamp"`
	Timezones []string `json:"timezones"`
}

// TimezoneComparisonResponse represents a timezone comparison response
type TimezoneComparisonResponse struct {
	Timezones []TimezoneInfo `json:"timezones"`
	Error     string         `json:"error,omitempty"`
}

type AvailableTimezonesResponse struct {
	Timezones []TimezoneInfo `json:"timezones"`
}

// FromTimeResult creates a ConvertResponse from a TimeResult
func FromTimeResult(result *TimeResult, detectedType, detectedPrec string) ConvertResponse {
	return ConvertResponse{
		Result:       result,
		DetectedType: detectedType,
		DetectedPrec: detectedPrec,
	}
}

// ErrorResponse creates an error response
func ErrorResponse(err error) ConvertResponse {
	return ConvertResponse{
		Error: err.Error(),
	}
}

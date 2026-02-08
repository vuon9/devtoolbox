package datetimeconverter

import (
	"fmt"
	"time"
)

// Precision represents the timestamp precision type
type Precision string

const (
	PrecisionAuto    Precision = "auto"
	PrecisionSeconds Precision = "seconds"
	PrecisionMillis  Precision = "millis"
	PrecisionMicros  Precision = "micros"
	PrecisionNanos   Precision = "nanos"
)

// InputType represents the detected input type
type InputType string

const (
	InputTypeTimestamp InputType = "timestamp"
	InputTypeISO       InputType = "iso"
	InputTypeDate      InputType = "date"
	InputTypeUnknown   InputType = "unknown"
)

// TimeResult contains all conversion results for a given time
type TimeResult struct {
	UnixSeconds     int64             `json:"unixSeconds"`
	UnixMillis      int64             `json:"unixMillis"`
	UnixMicros      int64             `json:"unixMicros"`
	UnixNanos       int64             `json:"unixNanos"`
	UTC             string            `json:"utc"`
	Local           string            `json:"local"`
	Relative        string            `json:"relative"`
	RelativeDetails RelativeBreakdown `json:"relativeDetails"`
}

// RelativeBreakdown provides detailed relative time information
type RelativeBreakdown struct {
	Days           int `json:"days"`
	Hours          int `json:"hours"`
	Minutes        int `json:"minutes"`
	Seconds        int `json:"seconds"`
	TotalHours     int `json:"totalHours"`
	TotalMinutes   int `json:"totalMinutes"`
	TotalSeconds   int `json:"totalSeconds"`
	DaysSinceEpoch int `json:"daysSinceEpoch"`
}

// TimeDelta represents the difference between two times
type TimeDelta struct {
	Days         int     `json:"days"`
	Hours        int     `json:"hours"`
	Minutes      int     `json:"minutes"`
	Seconds      int     `json:"seconds"`
	TotalHours   float64 `json:"totalHours"`
	TotalMinutes float64 `json:"totalMinutes"`
	TotalSeconds float64 `json:"totalSeconds"`
	BusinessDays int     `json:"businessDays"`
	IsFuture     bool    `json:"isFuture"`
}

// BatchResult represents a single batch conversion result
type BatchResult struct {
	Input   string      `json:"input"`
	Success bool        `json:"success"`
	Error   string      `json:"error,omitempty"`
	Result  *TimeResult `json:"result,omitempty"`
}

// TimezoneInfo represents time in a specific timezone
type TimezoneInfo struct {
	Label    string `json:"label"`
	Timezone string `json:"timezone"`
}

// Preset represents a quick preset option
type Preset struct {
	ID          string `json:"id"`
	Label       string `json:"label"`
	Description string `json:"description"`
	Timestamp   int64  `json:"timestamp"`
}

// FormatType represents output format types
type FormatType string

const (
	FormatISO     FormatType = "iso"
	FormatRFC2822 FormatType = "rfc2822"
	FormatRFC3339 FormatType = "rfc3339"
	FormatSQL     FormatType = "sql"
	FormatUS      FormatType = "us"
	FormatEU      FormatType = "eu"
	FormatCompact FormatType = "compact"
	FormatCustom  FormatType = "custom"
)

// TimeUnit represents time units for arithmetic operations
type TimeUnit string

const (
	UnitSeconds TimeUnit = "seconds"
	UnitMinutes TimeUnit = "minutes"
	UnitHours   TimeUnit = "hours"
	UnitDays    TimeUnit = "days"
	UnitWeeks   TimeUnit = "weeks"
	UnitMonths  TimeUnit = "months"
	UnitYears   TimeUnit = "years"
)

// DetectPrecision determines the precision from timestamp string length
func DetectPrecision(input string) Precision {
	if len(input) == 0 {
		return PrecisionAuto
	}

	// Remove any non-digit characters for length calculation
	clean := ""
	for _, r := range input {
		if r >= '0' && r <= '9' {
			clean += string(r)
		}
	}

	switch len(clean) {
	case 10:
		return PrecisionSeconds
	case 13:
		return PrecisionMillis
	case 16:
		return PrecisionMicros
	case 19:
		return PrecisionNanos
	default:
		return PrecisionAuto
	}
}

// DetectInputType determines the type of input
func DetectInputType(input string) InputType {
	if len(input) == 0 {
		return InputTypeUnknown
	}

	// Check for ISO format (contains T or Z)
	if len(input) >= 10 && (contains(input, "T") || contains(input, "Z")) {
		return InputTypeISO
	}

	// Check if it's a pure number (timestamp)
	isNumber := true
	for _, r := range input {
		if r < '0' || r > '9' {
			isNumber = false
			break
		}
	}

	if isNumber && len(input) >= 10 {
		return InputTypeTimestamp
	}

	// Check for date separators
	if contains(input, "-") || contains(input, "/") {
		return InputTypeDate
	}

	return InputTypeUnknown
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || len(s) > 0 && containsHelper(s, substr))
}

func containsHelper(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

// UnixEpoch returns the Unix epoch time (January 1, 1970)
func UnixEpoch() time.Time {
	return time.Date(1970, 1, 1, 0, 0, 0, 0, time.UTC)
}

// ParseTimestamp parses a timestamp string with given precision
func ParseTimestamp(input string, precision Precision) (time.Time, error) {
	if precision == PrecisionAuto {
		precision = DetectPrecision(input)
	}

	// Extract numeric part
	var numericStr string
	for _, r := range input {
		if r >= '0' && r <= '9' {
			numericStr += string(r)
		}
	}

	if len(numericStr) == 0 {
		return time.Time{}, ErrInvalidTimestamp
	}

	var ts int64
	_, err := fmt.Sscanf(numericStr, "%d", &ts)
	if err != nil {
		return time.Time{}, ErrInvalidTimestamp
	}

	var nanos int64
	switch precision {
	case PrecisionSeconds:
		nanos = ts * 1e9
	case PrecisionMillis:
		nanos = ts * 1e6
	case PrecisionMicros:
		nanos = ts * 1e3
	case PrecisionNanos:
		nanos = ts
	default:
		// Default to seconds if unknown
		nanos = ts * 1e9
	}

	return time.Unix(0, nanos).UTC(), nil
}

// FormatTime formats a time according to the specified format
func FormatTime(t time.Time, format FormatType, customFormat string) string {
	switch format {
	case FormatISO:
		return t.Format(time.RFC3339Nano)
	case FormatRFC2822:
		return t.Format(time.RFC1123)
	case FormatRFC3339:
		return t.Format(time.RFC3339)
	case FormatSQL:
		return t.Format("2006-01-02 15:04:05")
	case FormatUS:
		return t.Format("01/02/2006 15:04:05")
	case FormatEU:
		return t.Format("02/01/2006 15:04:05")
	case FormatCompact:
		return t.Format("20060102-150405")
	case FormatCustom:
		if customFormat != "" {
			return formatCustom(t, customFormat)
		}
		return t.Format(time.RFC3339)
	default:
		return t.Format(time.RFC3339)
	}
}

// formatCustom applies custom format tokens
func formatCustom(t time.Time, format string) string {
	replacements := map[string]string{
		"YYYY": t.Format("2006"),
		"MM":   t.Format("01"),
		"DD":   t.Format("02"),
		"HH":   t.Format("15"),
		"hh":   t.Format("03"),
		"mm":   t.Format("04"),
		"ss":   t.Format("05"),
		"sss":  fmt.Sprintf("%03d", t.Nanosecond()/1e6),
		"A":    t.Format("PM"),
		"ddd":  t.Format("Mon"),
		"dddd": t.Format("Monday"),
		"ZZ":   t.Format("-0700"),
	}

	result := format
	for token, value := range replacements {
		result = replaceAll(result, token, value)
	}
	return result
}

func replaceAll(s, old, new string) string {
	result := s
	for {
		idx := -1
		for i := 0; i <= len(result)-len(old); i++ {
			if result[i:i+len(old)] == old {
				idx = i
				break
			}
		}
		if idx == -1 {
			break
		}
		result = result[:idx] + new + result[idx+len(old):]
	}
	return result
}

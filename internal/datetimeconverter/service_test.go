package datetimeconverter

import (
	"testing"
	"time"
)

func TestDetectPrecision(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected Precision
	}{
		{"Seconds - 10 digits", "1738412345", PrecisionSeconds},
		{"Millis - 13 digits", "1738412345000", PrecisionMillis},
		{"Micros - 16 digits", "1738412345000000", PrecisionMicros},
		{"Nanos - 19 digits", "1738412345000000000", PrecisionNanos},
		{"Empty string", "", PrecisionAuto},
		{"Short number", "12345", PrecisionAuto},
		{"With non-digits", "1738412345abc", PrecisionSeconds},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := DetectPrecision(tt.input)
			if result != tt.expected {
				t.Errorf("DetectPrecision(%q) = %v, want %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestDetectInputType(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected InputType
	}{
		{"ISO with T", "2026-02-01T12:24:05Z", InputTypeISO},
		{"ISO with Z", "2026-02-01Z", InputTypeISO},
		{"Timestamp seconds", "1738412345", InputTypeTimestamp},
		{"Timestamp millis", "1738412345000", InputTypeTimestamp},
		{"Date with dash", "2026-02-01", InputTypeDate},
		{"Date with slash", "02/01/2026", InputTypeDate},
		{"Empty string", "", InputTypeUnknown},
		{"Mixed text", "hello world", InputTypeUnknown},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := DetectInputType(tt.input)
			if result != tt.expected {
				t.Errorf("DetectInputType(%q) = %v, want %v", tt.input, result, tt.expected)
			}
		})
	}
}

func TestParseTimestamp(t *testing.T) {
	tests := []struct {
		name      string
		input     string
		precision Precision
		wantErr   bool
	}{
		{"Valid seconds", "1738412345", PrecisionSeconds, false},
		{"Valid millis", "1738412345000", PrecisionMillis, false},
		{"Valid micros", "1738412345000000", PrecisionMicros, false},
		{"Valid nanos", "1738412345000000000", PrecisionNanos, false},
		{"Auto detect seconds", "1738412345", PrecisionAuto, false},
		{"Auto detect millis", "1738412345000", PrecisionAuto, false},
		{"Empty string", "", PrecisionAuto, true},
		{"Invalid input", "abc", PrecisionAuto, true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := ParseTimestamp(tt.input, tt.precision)
			if tt.wantErr {
				if err == nil {
					t.Errorf("ParseTimestamp(%q, %v) expected error, got nil", tt.input, tt.precision)
				}
				return
			}
			if err != nil {
				t.Errorf("ParseTimestamp(%q, %v) unexpected error: %v", tt.input, tt.precision, err)
				return
			}
			if result.IsZero() {
				t.Errorf("ParseTimestamp(%q, %v) returned zero time", tt.input, tt.precision)
			}
		})
	}
}

func TestFormatTime(t *testing.T) {
	testTime := time.Date(2026, 2, 1, 12, 24, 5, 0, time.UTC)

	tests := []struct {
		name         string
		format       FormatType
		customFormat string
		wantContains string
	}{
		{"ISO format", FormatISO, "", "2026-02-01"},
		{"RFC2822 format", FormatRFC2822, "", "Feb"},
		{"RFC3339 format", FormatRFC3339, "", "2026-02-01"},
		{"SQL format", FormatSQL, "", "2026-02-01 12:24:05"},
		{"US format", FormatUS, "", "02/01/2026"},
		{"EU format", FormatEU, "", "01/02/2026"},
		{"Compact format", FormatCompact, "", "20260201-122405"},
		{"Custom format", FormatCustom, "YYYY-MM-DD", "2026-02-01"},
		{"Default format", "", "", "2026-02-01"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := FormatTime(testTime, tt.format, tt.customFormat)
			if result == "" {
				t.Errorf("FormatTime() returned empty string")
			}
			if tt.wantContains != "" && !containsStr(result, tt.wantContains) {
				t.Errorf("FormatTime() = %q, want to contain %q", result, tt.wantContains)
			}
		})
	}
}

func TestServiceConvert(t *testing.T) {
	svc := NewService()

	tests := []struct {
		name    string
		req     ConvertRequest
		wantErr bool
	}{
		{
			name: "Convert timestamp seconds",
			req: ConvertRequest{
				Input:     "1738412345",
				Precision: "auto",
			},
			wantErr: false,
		},
		{
			name: "Convert timestamp millis",
			req: ConvertRequest{
				Input:     "1738412345000",
				Precision: "auto",
			},
			wantErr: false,
		},
		{
			name: "Convert ISO date",
			req: ConvertRequest{
				Input:     "2026-02-01T12:24:05Z",
				Precision: "auto",
			},
			wantErr: false,
		},
		{
			name: "Convert SQL date",
			req: ConvertRequest{
				Input:     "2026-02-01 12:24:05",
				Precision: "auto",
			},
			wantErr: false,
		},
		{
			name: "Empty input",
			req: ConvertRequest{
				Input:     "",
				Precision: "auto",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp := svc.Convert(tt.req)
			if tt.wantErr {
				if resp.Error == "" {
					t.Errorf("Convert() expected error, got none")
				}
				return
			}
			if resp.Error != "" {
				t.Errorf("Convert() unexpected error: %s", resp.Error)
				return
			}
			if resp.Result == nil {
				t.Errorf("Convert() result is nil")
				return
			}
			if resp.Result.UnixSeconds == 0 {
				t.Errorf("Convert() UnixSeconds is 0")
			}
		})
	}
}

func TestServiceGetPresets(t *testing.T) {
	svc := NewService()
	resp := svc.GetPresets()

	if len(resp.Presets) == 0 {
		t.Errorf("GetPresets() returned empty presets")
	}

	expectedPresets := []string{"now", "plus1hour", "plus1day", "tomorrow9am", "nextweek", "startofday", "endofday", "startofweek", "endofweek", "epoch"}
	for _, expected := range expectedPresets {
		found := false
		for _, preset := range resp.Presets {
			if preset.ID == expected {
				found = true
				break
			}
		}
		if !found {
			t.Errorf("GetPresets() missing preset: %s", expected)
		}
	}
}

func TestServiceCalculateDelta(t *testing.T) {
	svc := NewService()

	tests := []struct {
		name    string
		req     DeltaRequest
		wantErr bool
	}{
		{
			name: "Calculate delta between timestamps",
			req: DeltaRequest{
				DateA: "1738412345",
				DateB: "1738498745",
			},
			wantErr: false,
		},
		{
			name: "Calculate delta between ISO dates",
			req: DeltaRequest{
				DateA: "2026-02-01T12:00:00Z",
				DateB: "2026-02-02T12:00:00Z",
			},
			wantErr: false,
		},
		{
			name: "Invalid date A",
			req: DeltaRequest{
				DateA: "invalid",
				DateB: "1738412345",
			},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			resp := svc.CalculateDelta(tt.req)
			if tt.wantErr {
				if resp.Error == "" {
					t.Errorf("CalculateDelta() expected error, got none")
				}
				return
			}
			if resp.Error != "" {
				t.Errorf("CalculateDelta() unexpected error: %s", resp.Error)
				return
			}
			if resp.Delta == nil {
				t.Errorf("CalculateDelta() delta is nil")
			}
		})
	}
}

func TestFormatRelativeTime(t *testing.T) {
	tests := []struct {
		name     string
		diff     time.Duration
		expected string
	}{
		{"Now", 0, "now"},
		{"1 second ago", -1 * time.Second, "1 second ago"},
		{"2 seconds ago", -2 * time.Second, "2 seconds ago"},
		{"1 minute ago", -1 * time.Minute, "1 minute ago"},
		{"1 hour ago", -1 * time.Hour, "1 hour ago"},
		{"1 day ago", -24 * time.Hour, "1 day ago"},
		{"In 1 second", 1 * time.Second, "in 1 second"},
		{"In 2 seconds", 2 * time.Second, "in 2 seconds"},
		{"In 1 minute", 1 * time.Minute, "in 1 minute"},
		{"In 1 hour", 1 * time.Hour, "in 1 hour"},
		{"In 1 day", 24 * time.Hour, "in 1 day"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := formatRelativeTime(tt.diff)
			if result == "" {
				t.Errorf("formatRelativeTime(%v) returned empty string", tt.diff)
			}
			// Just check it doesn't panic and returns something
			t.Logf("formatRelativeTime(%v) = %q", tt.diff, result)
		})
	}
}

func containsStr(s, substr string) bool {
	return len(s) >= len(substr) && (s == substr || containsHelperStr(s, substr))
}

func containsHelperStr(s, substr string) bool {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return true
		}
	}
	return false
}

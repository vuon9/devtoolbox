package converter

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestFormattingConverter(t *testing.T) {
	conv := NewFormattingConverter()

	tests := []struct {
		name           string
		input          string
		method         string
		expectedSubstr string
	}{
		{
			name:           "JSON to YAML",
			input:          `{"name":"test","value":123}`,
			method:         "json ↔ yaml",
			expectedSubstr: "name: test",
		},
		{
			name:           "Markdown to HTML",
			input:          "# Hello World",
			method:         "markdown ↔ html",
			expectedSubstr: "<h1>",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := ConversionRequest{
				Input:  tt.input,
				Method: tt.method,
				Config: map[string]interface{}{},
			}
			result, err := conv.Convert(req)
			if err != nil {
				t.Fatalf("Error: %v", err)
			}
			if !strings.Contains(result, tt.expectedSubstr) {
				t.Errorf("Expected output to contain '%s', got: %s", tt.expectedSubstr, result)
			}
		})
	}
}

func TestFormattingConverterAdditional(t *testing.T) {
	conv := NewFormattingConverter()

	tests := []struct {
		name           string
		input          string
		method         string
		expectedSubstr string
		notExpected    string
	}{
		{
			name:           "CSV to TSV conversion",
			input:          "name,age,city\nJohn,30,NYC\nJane,25,LA",
			method:         "csv ↔ tsv",
			expectedSubstr: "John\t30\tNYC",
			notExpected:    ",",
		},
		{
			name:           "TSV to CSV conversion",
			input:          "name\tage\tcity\nJohn\t30\tNYC\nJane\t25\tLA",
			method:         "csv ↔ tsv",
			expectedSubstr: "John,30,NYC",
			notExpected:    "\t",
		},
		{
			name:           "Key-Value to Query String",
			input:          "name=John\nage=30\ncity=NYC",
			method:         "key-value ↔ query string",
			expectedSubstr: "name=John",
		},
		{
			name:           "Query String to Key-Value",
			input:          "?name=John&age=30&city=NYC",
			method:         "key-value ↔ query string",
			expectedSubstr: "name=John",
		},
		{
			name:           "JSON to Properties",
			input:          `{"name":"John","age":"30","city":"NYC"}`,
			method:         "properties",
			expectedSubstr: "name=John",
		},
		{
			name:           "JSON to INI",
			input:          `{"section1":{"key1":"value1","key2":"value2"},"section2":{"key3":"value3"}}`,
			method:         "ini",
			expectedSubstr: "[section1]",
		},
		{
			name:           "JSON to XML",
			input:          `{"name":"John","age":30}`,
			method:         "json ↔ xml",
			expectedSubstr: "<?xml",
		},
		{
			name:           "XML to JSON",
			input:          `<?xml version="1.0"?><person><name>John</name><age>30</age></person>`,
			method:         "json ↔ xml",
			expectedSubstr: "John",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := ConversionRequest{
				Input:  tt.input,
				Method: tt.method,
				Config: map[string]interface{}{},
			}
			result, err := conv.Convert(req)
			if err != nil {
				t.Fatalf("Error: %v", err)
			}
			if !strings.Contains(result, tt.expectedSubstr) {
				t.Errorf("Expected output to contain '%s', got: %s", tt.expectedSubstr, result)
			}
			if tt.notExpected != "" && strings.Contains(result, tt.notExpected) {
				t.Errorf("Output should not contain '%s', got: %s", tt.notExpected, result)
			}
		})
	}

	// Properties to JSON test - needs JSON validation
	t.Run("Properties to JSON", func(t *testing.T) {
		propsInput := "name=John\nage=30\ncity=NYC"
		req := ConversionRequest{
			Input:  propsInput,
			Method: "properties",
			Config: map[string]interface{}{},
		}
		result, err := conv.Convert(req)
		if err != nil {
			t.Fatalf("Properties to JSON error: %v", err)
		}

		// Result should be valid JSON
		var parsed map[string]string
		if err := json.Unmarshal([]byte(result), &parsed); err != nil {
			t.Errorf("Result is not valid JSON: %v\nResult: %s", err, result)
		}
		if parsed["name"] != "John" {
			t.Errorf("Expected name=John in parsed JSON, got: %v", parsed)
		}
	})

	// INI to JSON test - needs JSON validation
	t.Run("INI to JSON", func(t *testing.T) {
		iniInput := "[section1]\nkey1=value1\nkey2=value2\n[section2]\nkey3=value3"
		req := ConversionRequest{
			Input:  iniInput,
			Method: "ini",
			Config: map[string]interface{}{},
		}
		result, err := conv.Convert(req)
		if err != nil {
			t.Fatalf("INI to JSON error: %v", err)
		}

		// Result should be valid JSON
		var parsed map[string]map[string]string
		if err := json.Unmarshal([]byte(result), &parsed); err != nil {
			t.Errorf("Result is not valid JSON: %v\nResult: %s", err, result)
		}
		if parsed["section1"]["key1"] != "value1" {
			t.Errorf("Expected section1.key1=value1 in parsed JSON, got: %v", parsed)
		}
	})
}

func TestCurlToFetch(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "simple GET",
			input:    "curl https://api.example.com/users",
			expected: "fetch",
		},
		{
			name:     "POST with data",
			input:    "curl -X POST -d '{\"name\":\"test\"}' https://api.example.com/users",
			expected: "fetch",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			result, err := curlToFetch(tc.input)
			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}
			if !contains(result, tc.expected) {
				t.Errorf("Expected output to contain '%s', got:\n%s", tc.expected, result)
			}
		})
	}
}

func TestFetchToCurl(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "simple GET",
			input:    "fetch('https://api.example.com/users')",
			expected: "curl",
		},
		{
			name:     "POST with options",
			input:    "fetch('https://api.example.com/users', { method: 'POST', body: '{\"name\":\"test\"}' })",
			expected: "-X POST",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			result, err := fetchToCurl(tc.input)
			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}
			if !contains(result, tc.expected) {
				t.Errorf("Expected output to contain '%s', got:\n%s", tc.expected, result)
			}
		})
	}
}

func TestCronToText(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "every minute",
			input:    "* * * * *",
			expected: "Every minute",
		},
		{
			name:     "every hour",
			input:    "0 * * * *",
			expected: "Every hour",
		},
		{
			name:     "weekdays at 9am",
			input:    "0 9 * * 1-5",
			expected: "Monday through Friday",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			result, err := cronToText(tc.input)
			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}
			if !contains(result, tc.expected) {
				t.Errorf("Expected output to contain '%s', got: %s", tc.expected, result)
			}
		})
	}
}

func TestTextToCron(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "every minute",
			input:    "run every minute",
			expected: "* * * * *",
		},
		{
			name:     "every hour",
			input:    "run every hour",
			expected: "0 * * * *",
		},
		{
			name:     "weekdays at 9am",
			input:    "At 09:00 on weekdays",
			expected: "00 09 * * 1-5",
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			result, err := textToCron(tc.input)
			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}
			if result != tc.expected {
				t.Errorf("Expected '%s', got: %s", tc.expected, result)
			}
		})
	}
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

func TestColorConverter(t *testing.T) {
	conv := NewFormattingConverter()

	tests := []struct {
		name           string
		input          string
		method         string
		expectedSubstr []string
		expectErr      bool
	}{
		{
			name:           "HEX to all formats",
			input:          "#FF5733",
			method:         "color codes",
			expectedSubstr: []string{"HEX: #FF5733", "RGB: rgb(255, 87, 51)", "HSL:", "HSV:"},
			expectErr:      false,
		},
		{
			name:           "Short HEX format",
			input:          "#F53",
			method:         "color codes",
			expectedSubstr: []string{"HEX: #FF5533", "RGB:"},
			expectErr:      false,
		},
		{
			name:           "RGB format",
			input:          "rgb(255, 87, 51)",
			method:         "color codes",
			expectedSubstr: []string{"HEX: #FF5733", "RGB: rgb(255, 87, 51)"},
			expectErr:      false,
		},
		{
			name:           "Comma-separated RGB",
			input:          "255, 87, 51",
			method:         "color codes",
			expectedSubstr: []string{"HEX: #FF5733"},
			expectErr:      false,
		},
		{
			name:           "HSL format",
			input:          "hsl(9, 100%, 60%)",
			method:         "color codes",
			expectedSubstr: []string{"HEX:", "RGB:", "HSL:"},
			expectErr:      false,
		},
		{
			name:           "HSV format",
			input:          "hsv(9, 80%, 100%)",
			method:         "color codes",
			expectedSubstr: []string{"HEX:", "RGB:", "HSV: hsv(9, 80%, 100%)"},
			expectErr:      false,
		},
		{
			name:           "White color",
			input:          "#FFFFFF",
			method:         "color codes",
			expectedSubstr: []string{"HEX: #FFFFFF", "RGB: rgb(255, 255, 255)"},
			expectErr:      false,
		},
		{
			name:           "Black color",
			input:          "#000000",
			method:         "color codes",
			expectedSubstr: []string{"HEX: #000000", "RGB: rgb(0, 0, 0)"},
			expectErr:      false,
		},
		{
			name:           "Invalid format",
			input:          "not-a-color",
			method:         "color codes",
			expectedSubstr: []string{},
			expectErr:      true,
		},
		{
			name:           "Empty input",
			input:          "",
			method:         "color codes",
			expectedSubstr: []string{},
			expectErr:      true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := ConversionRequest{
				Input:  tt.input,
				Method: tt.method,
				Config: map[string]interface{}{},
			}
			result, err := conv.Convert(req)
			if tt.expectErr {
				if err == nil {
					t.Errorf("Expected error but got none, result: %s", result)
				}
				return
			}
			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}
			for _, substr := range tt.expectedSubstr {
				if !strings.Contains(result, substr) {
					t.Errorf("Expected output to contain '%s', got:\n%s", substr, result)
				}
			}
		})
	}
}

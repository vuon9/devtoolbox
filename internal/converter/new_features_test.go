package converter

import (
	"testing"
)

func TestRSAEncryption(t *testing.T) {
	converter := NewEncryptionConverter()

	// Generate a test RSA key pair (2048-bit)
	// For this test, we'll use pre-generated keys in base64 format
	// These are minimal test keys for demonstration

	// This is a test - in production, you'd generate proper keys
	t.Run("rsa requires keys", func(t *testing.T) {
		_, err := converter.Convert(ConversionRequest{
			Input:  "Hello, World!",
			Method: "rsa",
			Config: map[string]interface{}{
				"subMode": "encrypt",
			},
		})
		if err == nil {
			t.Error("Expected error when no public key provided")
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

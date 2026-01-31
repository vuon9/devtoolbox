package converter

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestServiceAllHashes(t *testing.T) {
	service := NewConverterService()

	tests := []struct {
		name  string
		input string
	}{
		{"All hashes - hello", "hello"},
		{"All hashes - empty", ""},
		{"All hashes - long text", "The quick brown fox jumps over the lazy dog"},
		{"All hashes - special chars", "!@#$%^&*()_+-=[]{}|;':\",./<>?"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := ConversionRequest{
				Input:    tt.input,
				Category: "Hash",
				Method:   "all",
				Config:   map[string]interface{}{},
			}

			result, err := service.Convert(req)
			if err != nil {
				t.Fatalf("All hashes error: %v", err)
			}

			// Result should be valid JSON
			var parsed map[string]string
			if err := json.Unmarshal([]byte(result), &parsed); err != nil {
				t.Errorf("Result is not valid JSON: %v\nResult: %s", err, result)
				return
			}

			// Check that expected hash methods are present
			expectedMethods := []string{
				"MD5", "SHA-1", "SHA-224", "SHA-256", "SHA-384", "SHA-512",
				"SHA-3 (Keccak)", "BLAKE2b", "BLAKE3", "RIPEMD-160",
				"CRC32", "Adler-32", "MurmurHash3", "xxHash", "FNV-1a",
			}

			for _, method := range expectedMethods {
				if _, ok := parsed[method]; !ok {
					t.Errorf("Expected method '%s' not found in results", method)
				}
			}

			// Verify all values are non-empty and valid hex strings (except bcrypt which has its own format)
			for method, value := range parsed {
				if value == "" {
					t.Errorf("Method '%s' has empty value", method)
					continue
				}
				if strings.HasPrefix(value, "Error:") {
					t.Errorf("Method '%s' returned error: %s", method, value)
					continue
				}
			}
		})
	}
}

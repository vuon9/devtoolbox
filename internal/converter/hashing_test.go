package converter

import (
	"testing"
)

func TestHashingConverter(t *testing.T) {
	conv := NewHashingConverter()

	tests := []struct {
		name     string
		input    string
		method   string
		expected string
	}{
		{"MD5", "hello", "md5", "5d41402abc4b2a76b9719d911017c592"},
		{"SHA-256", "hello", "sha-256", "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"},
		{"SHA-1", "hello", "sha-1", "aaf4c61ddcc5e8a2dabede0f3b482cd9aea9434d"},
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
				t.Errorf("Error: %v", err)
			}
			if result != tt.expected {
				t.Errorf("Expected %s, got %s", tt.expected, result)
			}
		})
	}
}

func TestHashingConverterAdditional(t *testing.T) {
	conv := NewHashingConverter()

	tests := []struct {
		name           string
		input          string
		method         string
		expectedPrefix string
		expectedLength int
	}{
		{"xxHash64 - hello", "hello", "xxhash", "", 16},
		{"xxHash64 - empty", "", "xxhash", "", 16},
		{"xxHash64 - long text", "The quick brown fox jumps over the lazy dog", "xxhash", "", 16},
		{"FNV-1a - hello", "hello", "fnv-1a", "", 16},
		{"FNV-1a - empty", "", "fnv-1a", "", 16},
		{"FNV-1a - long text", "The quick brown fox jumps over the lazy dog", "fnv-1a", "", 16},
		{"BLAKE3 - hello", "hello", "blake3", "", 64},
		{"BLAKE3 - empty", "", "blake3", "", 64},
		{"BLAKE3 - long text", "The quick brown fox jumps over the lazy dog", "blake3", "", 64},
		{"MurmurHash3 - hello", "hello", "murmurhash3", "", 8},
		{"MurmurHash3 - empty", "", "murmurhash3", "", 8},
		{"MurmurHash3 - long text", "The quick brown fox jumps over the lazy dog", "murmurhash3", "", 8},
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
				t.Errorf("Error: %v", err)
				return
			}

			// Check that result is a valid hex string of expected length
			if len(result) != tt.expectedLength {
				t.Errorf("Expected result length %d, got %d (%s)", tt.expectedLength, len(result), result)
			}

			// Verify all characters are valid hex digits
			for _, c := range result {
				if !((c >= '0' && c <= '9') || (c >= 'a' && c <= 'f')) {
					t.Errorf("Result contains non-hex character: %c in %s", c, result)
					break
				}
			}
		})
	}
}

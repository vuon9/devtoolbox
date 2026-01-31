package converter

import (
	"testing"
)

func TestEncryptionConverter(t *testing.T) {
	conv := NewEncryptionConverter()

	tests := []struct {
		name      string
		method    string
		key       string
		iv        string
		plaintext string
	}{
		{
			name:      "AES Encrypt/Decrypt",
			method:    "aes",
			key:       "12345678901234567890123456789012", // 32 bytes
			iv:        "1234567890123456",                 // 16 bytes
			plaintext: "hello",
		},
		{
			name:      "XOR Encrypt/Decrypt",
			method:    "xor",
			key:       "secret",
			iv:        "", // XOR doesn't use IV
			plaintext: "hello",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Encrypt
			encReq := ConversionRequest{
				Input:  tt.plaintext,
				Method: tt.method,
				Config: map[string]interface{}{
					"subMode": "Encrypt",
					"key":     tt.key,
					"iv":      tt.iv,
				},
			}
			encrypted, err := conv.Convert(encReq)
			if err != nil {
				t.Fatalf("Encryption error: %v", err)
			}

			// Decrypt
			decReq := ConversionRequest{
				Input:  encrypted,
				Method: tt.method,
				Config: map[string]interface{}{
					"subMode": "Decrypt",
					"key":     tt.key,
					"iv":      tt.iv,
				},
			}
			decrypted, err := conv.Convert(decReq)
			if err != nil {
				t.Fatalf("Decryption error: %v", err)
			}

			if decrypted != tt.plaintext {
				t.Errorf("Expected '%s', got '%s'", tt.plaintext, decrypted)
			}
		})
	}
}

func TestEncryptionConverterAdditional(t *testing.T) {
	conv := NewEncryptionConverter()

	// Test cases for encryption/decryption round trips
	tests := []struct {
		name      string
		method    string
		key       string
		iv        string
		plaintext string
	}{
		{
			name:      "AES-GCM Encrypt/Decrypt - simple text",
			method:    "aes-gcm",
			key:       "12345678901234567890123456789012", // 32 bytes
			iv:        "123456789012",                     // 12 bytes nonce
			plaintext: "hello world",
		},
		{
			name:      "AES-GCM Encrypt/Decrypt - long text",
			method:    "aes-gcm",
			key:       "abcdefghijklmnopqrstuvwxyz123456", // 32 bytes
			iv:        "nonce1234567",                     // 12 bytes
			plaintext: "The quick brown fox jumps over the lazy dog! 1234567890",
		},
		{
			name:      "AES-GCM Encrypt/Decrypt - empty text",
			method:    "aes-gcm",
			key:       "00000000000000000000000000000000", // 32 bytes
			iv:        "000000000000",                     // 12 bytes
			plaintext: "",
		},
		{
			name:      "Triple DES Encrypt/Decrypt - simple text",
			method:    "triple des",
			key:       "123456789012345678901234", // 24 bytes
			iv:        "12345678",                 // 8 bytes
			plaintext: "hello123",
		},
		{
			name:      "Triple DES Encrypt/Decrypt - 3des alias",
			method:    "3des",
			key:       "abcdefghabcdefghabcdefgh", // 24 bytes
			iv:        "abcdefgh",                 // 8 bytes
			plaintext: "test message",
		},
		{
			name:      "Triple DES Encrypt/Decrypt - tripledes alias",
			method:    "tripledes",
			key:       "123456789012345678901234", // 24 bytes
			iv:        "87654321",                 // 8 bytes
			plaintext: "secret data here",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Encrypt
			encReq := ConversionRequest{
				Input:  tt.plaintext,
				Method: tt.method,
				Config: map[string]interface{}{
					"subMode": "Encrypt",
					"key":     tt.key,
					"iv":      tt.iv,
				},
			}
			encrypted, err := conv.Convert(encReq)
			if err != nil {
				t.Fatalf("Encryption error: %v", err)
			}

			if encrypted == "" && tt.plaintext != "" {
				t.Fatal("Encryption produced empty result for non-empty input")
			}

			// Decrypt
			decReq := ConversionRequest{
				Input:  encrypted,
				Method: tt.method,
				Config: map[string]interface{}{
					"subMode": "Decrypt",
					"key":     tt.key,
					"iv":      tt.iv,
				},
			}
			decrypted, err := conv.Convert(decReq)
			if err != nil {
				t.Fatalf("Decryption error: %v", err)
			}

			if decrypted != tt.plaintext {
				t.Errorf("Round-trip failed: expected '%s', got '%s'", tt.plaintext, decrypted)
			}
		})
	}

	// Test error cases for invalid key/IV lengths
	errorTests := []struct {
		name   string
		method string
		key    string
		iv     string
	}{
		{
			name:   "AES-GCM invalid key length",
			method: "aes-gcm",
			key:    "short", // Invalid - too short
			iv:     "123456789012",
		},
		{
			name:   "AES-GCM invalid nonce length",
			method: "aes-gcm",
			key:    "12345678901234567890123456789012",
			iv:     "short", // Invalid - too short
		},
		{
			name:   "Triple DES invalid key length",
			method: "triple des",
			key:    "short", // Invalid - must be 24 bytes
			iv:     "12345678",
		},
		{
			name:   "Triple DES invalid IV length",
			method: "triple des",
			key:    "123456789012345678901234",
			iv:     "short", // Invalid - must be 8 bytes
		},
	}

	for _, tt := range errorTests {
		t.Run(tt.name, func(t *testing.T) {
			req := ConversionRequest{
				Input:  "test",
				Method: tt.method,
				Config: map[string]interface{}{
					"subMode": "Encrypt",
					"key":     tt.key,
					"iv":      tt.iv,
				},
			}
			_, err := conv.Convert(req)
			if err == nil {
				t.Error("Expected error for invalid key/iv length, got none")
			}
		})
	}
}

func TestRC4Encryption(t *testing.T) {
	conv := NewEncryptionConverter()

	tests := []struct {
		name      string
		key       string
		plaintext string
	}{
		{
			name:      "RC4 Encrypt/Decrypt",
			key:       "testsecretkey",
			plaintext: "hello world",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Encrypt
			encReq := ConversionRequest{
				Input:  tt.plaintext,
				Method: "rc4",
				Config: map[string]interface{}{
					"subMode": "Encrypt",
					"key":     tt.key,
				},
			}
			encrypted, err := conv.Convert(encReq)
			if err != nil {
				t.Fatalf("RC4 encryption error: %v", err)
			}

			if encrypted == "" {
				t.Fatal("RC4 encryption produced empty result")
			}

			// Decrypt
			decReq := ConversionRequest{
				Input:  encrypted,
				Method: "rc4",
				Config: map[string]interface{}{
					"subMode": "Decrypt",
					"key":     tt.key,
				},
			}
			decrypted, err := conv.Convert(decReq)
			if err != nil {
				t.Fatalf("RC4 decryption error: %v", err)
			}

			if decrypted != tt.plaintext {
				t.Errorf("Expected '%s', got '%s'", tt.plaintext, decrypted)
			}
		})
	}

	// Test that different keys produce different output
	t.Run("RC4 with different keys produces different output", func(t *testing.T) {
		req1 := ConversionRequest{
			Input:  "test",
			Method: "rc4",
			Config: map[string]interface{}{
				"subMode": "Encrypt",
				"key":     "key1",
			},
		}
		result1, _ := conv.Convert(req1)

		req2 := ConversionRequest{
			Input:  "test",
			Method: "rc4",
			Config: map[string]interface{}{
				"subMode": "Encrypt",
				"key":     "key2",
			},
		}
		result2, _ := conv.Convert(req2)

		if result1 == result2 {
			t.Error("Different keys should produce different encrypted output")
		}
	})
}

func TestRSAEncryption(t *testing.T) {
	converter := NewEncryptionConverter()

	tests := []struct {
		name        string
		input       string
		expectError bool
	}{
		{
			name:        "rsa requires keys",
			input:       "Hello, World!",
			expectError: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			_, err := converter.Convert(ConversionRequest{
				Input:  tt.input,
				Method: "rsa",
				Config: map[string]interface{}{
					"subMode": "encrypt",
				},
			})
			if tt.expectError && err == nil {
				t.Error("Expected error when no public key provided")
			}
			if !tt.expectError && err != nil {
				t.Errorf("Unexpected error: %v", err)
			}
		})
	}
}

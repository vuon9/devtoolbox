package converter

import (
	"strings"
	"testing"
)

func TestEncodingConverter(t *testing.T) {
	conv := NewEncodingConverter()

	tests := []struct {
		name     string
		input    string
		method   string
		subMode  string
		expected string
	}{
		{"Base64 Encode", "hello", "base64", "Encode", "aGVsbG8="},
		{"Base64 Decode", "aGVsbG8=", "base64", "Decode", "hello"},
		{"Base58 Encode", "hello", "base58", "Encode", "Cn8eVZg"},
		{"Hex Encode", "hello", "hex", "Encode", "68656c6c6f"},
		{"Hex Decode", "68656c6c6f", "hex", "Decode", "hello"},
		{"Base32 Encode", "hello", "base32", "Encode", "NBSWY3DP"},
		{"URL Encode", "hello world", "url", "Encode", "hello+world"},
		{"HTML Encode", "<script>", "html entities", "Encode", "&lt;script&gt;"},
		{"Morse Encode", "SOS", "morse code", "Encode", "... --- ..."},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := ConversionRequest{
				Input:  tt.input,
				Method: tt.method,
				Config: map[string]interface{}{"subMode": tt.subMode},
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

func TestEncryptionConverter(t *testing.T) {
	conv := NewEncryptionConverter()

	t.Run("AES Encrypt/Decrypt", func(t *testing.T) {
		key := "12345678901234567890123456789012" // 32 bytes
		iv := "1234567890123456"                  // 16 bytes

		// Encrypt
		encReq := ConversionRequest{
			Input:  "hello",
			Method: "aes",
			Config: map[string]interface{}{
				"subMode": "Encrypt",
				"key":     key,
				"iv":      iv,
			},
		}
		encrypted, err := conv.Convert(encReq)
		if err != nil {
			t.Fatalf("Encryption error: %v", err)
		}

		// Decrypt
		decReq := ConversionRequest{
			Input:  encrypted,
			Method: "aes",
			Config: map[string]interface{}{
				"subMode": "Decrypt",
				"key":     key,
				"iv":      iv,
			},
		}
		decrypted, err := conv.Convert(decReq)
		if err != nil {
			t.Fatalf("Decryption error: %v", err)
		}

		if decrypted != "hello" {
			t.Errorf("Expected 'hello', got '%s'", decrypted)
		}
	})

	t.Run("XOR Encrypt/Decrypt", func(t *testing.T) {
		key := "secret"

		encReq := ConversionRequest{
			Input:  "hello",
			Method: "xor",
			Config: map[string]interface{}{
				"subMode": "Encrypt",
				"key":     key,
			},
		}
		encrypted, err := conv.Convert(encReq)
		if err != nil {
			t.Fatalf("XOR encryption error: %v", err)
		}

		decReq := ConversionRequest{
			Input:  encrypted,
			Method: "xor",
			Config: map[string]interface{}{
				"subMode": "Decrypt",
				"key":     key,
			},
		}
		decrypted, err := conv.Convert(decReq)
		if err != nil {
			t.Fatalf("XOR decryption error: %v", err)
		}

		if decrypted != "hello" {
			t.Errorf("Expected 'hello', got '%s'", decrypted)
		}
	})
}

func TestFormattingConverter(t *testing.T) {
	conv := NewFormattingConverter()

	t.Run("JSON to YAML", func(t *testing.T) {
		req := ConversionRequest{
			Input:  `{"name":"test","value":123}`,
			Method: "json ↔ yaml",
			Config: map[string]interface{}{},
		}
		result, err := conv.Convert(req)
		if err != nil {
			t.Fatalf("Error: %v", err)
		}
		if !strings.Contains(result, "name: test") {
			t.Errorf("Expected YAML output, got: %s", result)
		}
	})

	t.Run("Markdown to HTML", func(t *testing.T) {
		req := ConversionRequest{
			Input:  "# Hello World",
			Method: "markdown ↔ html",
			Config: map[string]interface{}{},
		}
		result, err := conv.Convert(req)
		if err != nil {
			t.Fatalf("Error: %v", err)
		}
		if !strings.Contains(result, "<h1>") {
			t.Errorf("Expected HTML output, got: %s", result)
		}
	})
}

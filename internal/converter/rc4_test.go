package converter

import (
	"testing"
)

func TestRC4Encryption(t *testing.T) {
	conv := NewEncryptionConverter()

	t.Run("RC4 Encrypt/Decrypt", func(t *testing.T) {
		key := "testsecretkey"

		// Encrypt
		encReq := ConversionRequest{
			Input:  "hello world",
			Method: "rc4",
			Config: map[string]interface{}{
				"subMode": "Encrypt",
				"key":     key,
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
				"key":     key,
			},
		}
		decrypted, err := conv.Convert(decReq)
		if err != nil {
			t.Fatalf("RC4 decryption error: %v", err)
		}

		if decrypted != "hello world" {
			t.Errorf("Expected 'hello world', got '%s'", decrypted)
		}
	})

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

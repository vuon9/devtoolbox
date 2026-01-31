package jwt

import (
	"strings"
	"testing"
)

func TestJWTService_Decode(t *testing.T) {
	parser := NewParser()
	svc := NewJWTService(parser)

	// Valid JWT token (HS256)
	token := "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"

	result, err := svc.Decode(token)
	if err != nil {
		t.Fatalf("Decode failed: %v", err)
	}

	// Verify header
	if result.Header["alg"] != "HS256" {
		t.Errorf("Expected alg HS256, got %v", result.Header["alg"])
	}

	// Verify payload
	if result.Payload["sub"] != "1234567890" {
		t.Errorf("Expected sub 1234567890, got %v", result.Payload["sub"])
	}

	if result.Payload["name"] != "John Doe" {
		t.Errorf("Expected name John Doe, got %v", result.Payload["name"])
	}
}

func TestJWTService_Encode(t *testing.T) {
	parser := NewParser()
	svc := NewJWTService(parser)

	header := map[string]interface{}{
		"alg": "HS256",
		"typ": "JWT",
	}

	payload := map[string]interface{}{
		"sub":  "1234567890",
		"name": "John Doe",
		"iat":  1516239022,
	}

	secret := "your-256-bit-secret"

	token, err := svc.Encode(header, payload, "HS256", secret)
	if err != nil {
		t.Fatalf("Encode failed: %v", err)
	}

	// Token should have 3 parts
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		t.Errorf("Expected 3 parts, got %d", len(parts))
	}

	// Decode and verify
	decoded, err := svc.Decode(token)
	if err != nil {
		t.Fatalf("Decode of encoded token failed: %v", err)
	}

	if decoded.Payload["name"] != "John Doe" {
		t.Errorf("Payload mismatch after encode/decode")
	}
}

func TestJWTService_Verify(t *testing.T) {
	parser := NewParser()
	svc := NewJWTService(parser)

	tests := []struct {
		name      string
		token     string
		secret    string
		encoding  string
		shouldErr bool
	}{
		{
			name:      "Valid HS256 token",
			token:     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
			secret:    "your-256-bit-secret",
			encoding:  "utf8",
			shouldErr: false,
		},
		{
			name:      "Invalid secret",
			token:     "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
			secret:    "wrong-secret",
			encoding:  "utf8",
			shouldErr: true,
		},
		{
			name:      "Malformed token",
			token:     "invalid.token",
			secret:    "secret",
			encoding:  "utf8",
			shouldErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := svc.Verify(tt.token, tt.secret, tt.encoding)

			if err != nil {
				t.Fatalf("Verify returned error: %v", err)
			}

			if tt.shouldErr {
				if result.Valid {
					t.Errorf("Expected invalid token, got valid")
				}
			} else {
				if !result.Valid {
					t.Errorf("Expected valid token, got invalid: %s", result.Message)
				}
			}
		})
	}
}

func TestJWTService_MultipleAlgorithms(t *testing.T) {
	parser := NewParser()
	svc := NewJWTService(parser)

	algorithms := []string{"HS256", "HS384", "HS512"}
	secret := "test-secret-key"

	payload := map[string]interface{}{
		"test": "data",
		"num":  123,
	}

	for _, alg := range algorithms {
		t.Run(alg, func(t *testing.T) {
			header := map[string]interface{}{
				"alg": alg,
				"typ": "JWT",
			}

			token, err := svc.Encode(header, payload, alg, secret)
			if err != nil {
				t.Fatalf("Encode with %s failed: %v", alg, err)
			}

			// Verify the token
			result, err := svc.Verify(token, secret, "utf8")
			if err != nil {
				t.Fatalf("Verify with %s failed: %v", alg, err)
			}

			if !result.Valid {
				t.Errorf("Token with %s should be valid", alg)
			}
		})
	}
}

func TestJWTService_EdgeCases(t *testing.T) {
	parser := NewParser()
	svc := NewJWTService(parser)

	t.Run("Empty payload", func(t *testing.T) {
		header := map[string]interface{}{"alg": "HS256", "typ": "JWT"}
		payload := map[string]interface{}{}

		token, err := svc.Encode(header, payload, "HS256", "secret")
		if err != nil {
			t.Fatalf("Should handle empty payload: %v", err)
		}

		decoded, err := svc.Decode(token)
		if err != nil {
			t.Fatalf("Should decode empty payload: %v", err)
		}

		if len(decoded.Payload) != 0 {
			t.Errorf("Expected empty payload")
		}
	})

	t.Run("Complex nested payload", func(t *testing.T) {
		header := map[string]interface{}{"alg": "HS256", "typ": "JWT"}
		payload := map[string]interface{}{
			"user": map[string]interface{}{
				"id":    123,
				"name":  "Test User",
				"roles": []string{"admin", "user"},
			},
			"metadata": map[string]interface{}{
				"created": "2024-01-01",
				"updated": "2024-01-02",
			},
		}

		token, err := svc.Encode(header, payload, "HS256", "secret")
		if err != nil {
			t.Fatalf("Should handle nested payload: %v", err)
		}

		decoded, err := svc.Decode(token)
		if err != nil {
			t.Fatalf("Should decode nested payload: %v", err)
		}

		// Verify nested structure
		user := decoded.Payload["user"].(map[string]interface{})
		if user["name"] != "Test User" {
			t.Errorf("Nested data mismatch")
		}
	})
}

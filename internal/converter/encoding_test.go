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
		// ROT13 - symmetric encoding (encode and decode are the same)
		{"ROT13 Encode Hello", "hello", "rot13", "Encode", "uryyb"},
		{"ROT13 Decode Uryyb", "uryyb", "rot13", "Decode", "hello"},
		{"ROT13 Encode Test", "Test123!", "rot13", "Encode", "Grfg123!"},
		{"ROT13 Decode Grfg", "Grfg123!", "rot13", "Decode", "Test123!"},
		{"ROT13 Double Encode Roundtrip", "hello", "rot13", "Encode", "uryyb"},
		// ROT47 - symmetric encoding (encode and decode are the same)
		{"ROT47 Encode Hello", "hello", "rot47", "Encode", "96==@"},
		{"ROT47 Decode 96==@", "96==@", "rot47", "Decode", "hello"},
		{"ROT47 Encode Test123", "Test123!", "rot47", "Encode", "%6DE`abP"},
		{"ROT47 Decode %6DE`abP", "%6DE`abP", "rot47", "Decode", "Test123!"},
		// Quoted-Printable
		{"Quoted-Printable Encode Simple", "hello world", "quoted-printable", "Encode", "hello world"},
		{"Quoted-Printable Encode Special", "hello=world", "quoted-printable", "Encode", "hello=3Dworld"},
		{"Quoted-Printable Encode Special Chars", "hello\tworld!", "quoted-printable", "Encode", "hello\tworld!"},
		{"Quoted-Printable Decode Simple", "hello world", "quoted-printable", "Decode", "hello world"},
		{"Quoted-Printable Decode Hex", "hello=3Dworld", "quoted-printable", "Decode", "hello=world"},
		{"Quoted-Printable Decode Newline", "hello=0Aworld", "quoted-printable", "Decode", "hello\nworld"},
		{"Quoted-Printable Decode Tab", "hello=09world", "quoted-printable", "Decode", "hello\tworld"},
		// Punycode
		{"Punycode Encode ASCII", "example.com", "punycode", "Encode", "example.com"},
		{"Punycode Encode Unicode", "münchen.de", "punycode", "Encode", "xn--mnchen-3ya.de"},
		{"Punycode Decode", "xn--mnchen-3ya.de", "punycode", "Decode", "münchen.de"},
		// Base85 (ASCII85)
		{"Base85 ASCII85 Encode", "hello", "base85", "Encode", "<~BOu!rDZ~>"},
		{"Base85 ASCII85 Decode", "<~BOu!rDZ~>", "base85", "Decode", "hello"},
		{"Base85 ASCII85 Encode Empty", "", "base85", "Encode", "<~~>"},
		// Bencode
		{"Bencode Encode String", "\"hello\"", "bencode", "Encode", "5:hello"},
		{"Bencode Encode Integer", "42", "bencode", "Encode", "i42e"},
		{"Bencode Decode String", "5:hello", "bencode", "Decode", "\"hello\""},
		{"Bencode Decode Integer", "i42e", "bencode", "Decode", "42"},
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

func TestProtobufConverter(t *testing.T) {
	conv := NewEncodingConverter()

	tests := []struct {
		name           string
		input          string
		subMode        string
		expectedSubstr string
		expectErr      bool
	}{
		{
			name:           "Protobuf Decode Simple",
			input:          "089601",
			subMode:        "Decode",
			expectedSubstr: "Protobuf Hex Dump",
			expectErr:      false,
		},
		{
			name:           "Protobuf Decode With Fields",
			input:          "089601",
			subMode:        "Decode",
			expectedSubstr: "Field 1",
			expectErr:      false,
		},
		{
			name:           "Protobuf Invalid Hex",
			input:          "not-hex",
			subMode:        "Decode",
			expectedSubstr: "",
			expectErr:      true,
		},
		{
			name:           "Protobuf Empty Input",
			input:          "",
			subMode:        "Decode",
			expectedSubstr: "Protobuf Hex Dump",
			expectErr:      false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := ConversionRequest{
				Input:  tt.input,
				Method: "protobuf",
				Config: map[string]interface{}{"subMode": tt.subMode},
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
			if !strings.Contains(result, tt.expectedSubstr) {
				t.Errorf("Expected output to contain '%s', got:\n%s", tt.expectedSubstr, result)
			}
		})
	}
}

func TestEncodingConverterSymmetricRoundTrip(t *testing.T) {
	conv := NewEncodingConverter()

	tests := []struct {
		name   string
		method string
		input  string
	}{
		{
			name:   "ROT13 Double Application",
			method: "rot13",
			input:  "Hello World! 123",
		},
		{
			name:   "ROT47 Double Application",
			method: "rot47",
			input:  "Hello World! 123",
		},
		{
			name:   "Quoted-Printable Round-Trip",
			method: "quoted-printable",
			input:  "Hello=World! Special chars: \t\n",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Encode
			encReq := ConversionRequest{
				Input:  tt.input,
				Method: tt.method,
				Config: map[string]interface{}{"subMode": "Encode"},
			}
			encoded, err := conv.Convert(encReq)
			if err != nil {
				t.Fatalf("Encode error: %v", err)
			}

			// Decode
			decReq := ConversionRequest{
				Input:  encoded,
				Method: tt.method,
				Config: map[string]interface{}{"subMode": "Decode"},
			}
			decoded, err := conv.Convert(decReq)
			if err != nil {
				t.Fatalf("Decode error: %v", err)
			}

			if decoded != tt.input {
				t.Errorf("Round-trip failed: expected '%s', got '%s'", tt.input, decoded)
			}
		})
	}
}

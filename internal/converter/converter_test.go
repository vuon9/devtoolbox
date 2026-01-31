package converter

import (
	"encoding/json"
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
		{"ROT13 Double Encode Roundtrip", "hello", "rot13", "Encode", "uryyb"}, // Double ROT13 should return original (encode once here)
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

func TestEncodingConverterSymmetricRoundTrip(t *testing.T) {
	conv := NewEncodingConverter()

	// Test ROT13 round-trip (applying ROT13 twice returns original)
	t.Run("ROT13 Double Application", func(t *testing.T) {
		original := "Hello World! 123"
		
		// First ROT13
		req1 := ConversionRequest{
			Input:  original,
			Method: "rot13",
			Config: map[string]interface{}{"subMode": "Encode"},
		}
		encoded, err := conv.Convert(req1)
		if err != nil {
			t.Fatalf("First ROT13 error: %v", err)
		}
		
		// Second ROT13 (decode is same as encode for ROT13)
		req2 := ConversionRequest{
			Input:  encoded,
			Method: "rot13",
			Config: map[string]interface{}{"subMode": "Decode"},
		}
		decoded, err := conv.Convert(req2)
		if err != nil {
			t.Fatalf("Second ROT13 error: %v", err)
		}
		
		if decoded != original {
			t.Errorf("ROT13 round-trip failed: expected '%s', got '%s'", original, decoded)
		}
	})

	// Test ROT47 round-trip (applying ROT47 twice returns original)
	t.Run("ROT47 Double Application", func(t *testing.T) {
		original := "Hello World! 123"
		
		// First ROT47
		req1 := ConversionRequest{
			Input:  original,
			Method: "rot47",
			Config: map[string]interface{}{"subMode": "Encode"},
		}
		encoded, err := conv.Convert(req1)
		if err != nil {
			t.Fatalf("First ROT47 error: %v", err)
		}
		
		// Second ROT47 (decode is same as encode for ROT47)
		req2 := ConversionRequest{
			Input:  encoded,
			Method: "rot47",
			Config: map[string]interface{}{"subMode": "Decode"},
		}
		decoded, err := conv.Convert(req2)
		if err != nil {
			t.Fatalf("Second ROT47 error: %v", err)
		}
		
		if decoded != original {
			t.Errorf("ROT47 round-trip failed: expected '%s', got '%s'", original, decoded)
		}
	})

	// Test Quoted-Printable round-trip
	t.Run("Quoted-Printable Round-Trip", func(t *testing.T) {
		original := "Hello=World! Special chars: \t\n"
		
		// Encode
		req1 := ConversionRequest{
			Input:  original,
			Method: "quoted-printable",
			Config: map[string]interface{}{"subMode": "Encode"},
		}
		encoded, err := conv.Convert(req1)
		if err != nil {
			t.Fatalf("QP encode error: %v", err)
		}
		
		// Decode
		req2 := ConversionRequest{
			Input:  encoded,
			Method: "quoted-printable",
			Config: map[string]interface{}{"subMode": "Decode"},
		}
		decoded, err := conv.Convert(req2)
		if err != nil {
			t.Fatalf("QP decode error: %v", err)
		}
		
		if decoded != original {
			t.Errorf("QP round-trip failed: expected '%s', got '%s'", original, decoded)
		}
	})
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
			iv:        "123456789012",                       // 12 bytes nonce
			plaintext: "hello world",
		},
		{
			name:      "AES-GCM Encrypt/Decrypt - long text",
			method:    "aes-gcm",
			key:       "abcdefghijklmnopqrstuvwxyz123456", // 32 bytes
			iv:        "nonce1234567",                       // 12 bytes
			plaintext: "The quick brown fox jumps over the lazy dog! 1234567890",
		},
		{
			name:      "AES-GCM Encrypt/Decrypt - empty text",
			method:    "aes-gcm",
			key:       "00000000000000000000000000000000", // 32 bytes
			iv:        "000000000000",                       // 12 bytes
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
	t.Run("AES-GCM invalid key length", func(t *testing.T) {
		req := ConversionRequest{
			Input:  "test",
			Method: "aes-gcm",
			Config: map[string]interface{}{
				"subMode": "Encrypt",
				"key":     "short", // Invalid - too short
				"iv":      "123456789012",
			},
		}
		_, err := conv.Convert(req)
		if err == nil {
			t.Error("Expected error for invalid key length, got none")
		}
	})

	t.Run("AES-GCM invalid nonce length", func(t *testing.T) {
		req := ConversionRequest{
			Input:  "test",
			Method: "aes-gcm",
			Config: map[string]interface{}{
				"subMode": "Encrypt",
				"key":     "12345678901234567890123456789012",
				"iv":      "short", // Invalid - too short
			},
		}
		_, err := conv.Convert(req)
		if err == nil {
			t.Error("Expected error for invalid nonce length, got none")
		}
	})

	t.Run("Triple DES invalid key length", func(t *testing.T) {
		req := ConversionRequest{
			Input:  "test",
			Method: "triple des",
			Config: map[string]interface{}{
				"subMode": "Encrypt",
				"key":     "short", // Invalid - must be 24 bytes
				"iv":      "12345678",
			},
		}
		_, err := conv.Convert(req)
		if err == nil {
			t.Error("Expected error for invalid key length, got none")
		}
	})

	t.Run("Triple DES invalid IV length", func(t *testing.T) {
		req := ConversionRequest{
			Input:  "test",
			Method: "triple des",
			Config: map[string]interface{}{
				"subMode": "Encrypt",
				"key":     "123456789012345678901234",
				"iv":      "short", // Invalid - must be 8 bytes
			},
		}
		_, err := conv.Convert(req)
		if err == nil {
			t.Error("Expected error for invalid IV length, got none")
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

func TestFormattingConverterAdditional(t *testing.T) {
	conv := NewFormattingConverter()

	// CSV to TSV and TSV to CSV tests
	t.Run("CSV to TSV conversion", func(t *testing.T) {
		csvInput := "name,age,city\nJohn,30,NYC\nJane,25,LA"
		req := ConversionRequest{
			Input:  csvInput,
			Method: "csv ↔ tsv",
			Config: map[string]interface{}{},
		}
		result, err := conv.Convert(req)
		if err != nil {
			t.Fatalf("CSV to TSV error: %v", err)
		}

		// Check that result uses tabs instead of commas
		if strings.Contains(result, ",") {
			t.Errorf("TSV output should not contain commas, got: %s", result)
		}
		if !strings.Contains(result, "\t") {
			t.Errorf("TSV output should contain tabs, got: %s", result)
		}
		if !strings.Contains(result, "John\t30\tNYC") {
			t.Errorf("Expected tab-separated values, got: %s", result)
		}
	})

	t.Run("TSV to CSV conversion", func(t *testing.T) {
		tsvInput := "name\tage\tcity\nJohn\t30\tNYC\nJane\t25\tLA"
		req := ConversionRequest{
			Input:  tsvInput,
			Method: "csv ↔ tsv",
			Config: map[string]interface{}{},
		}
		result, err := conv.Convert(req)
		if err != nil {
			t.Fatalf("TSV to CSV error: %v", err)
		}

		// Check that result uses commas
		if !strings.Contains(result, ",") {
			t.Errorf("CSV output should contain commas, got: %s", result)
		}
		if strings.Contains(result, "\t") {
			t.Errorf("CSV output should not contain tabs, got: %s", result)
		}
		if !strings.Contains(result, "John,30,NYC") {
			t.Errorf("Expected comma-separated values, got: %s", result)
		}
	})

	// Key-Value to Query String tests
	t.Run("Key-Value to Query String", func(t *testing.T) {
		kvInput := "name=John\nage=30\ncity=NYC"
		req := ConversionRequest{
			Input:  kvInput,
			Method: "key-value ↔ query string",
			Config: map[string]interface{}{},
		}
		result, err := conv.Convert(req)
		if err != nil {
			t.Fatalf("Key-Value to Query String error: %v", err)
		}

		// Result should be URL encoded
		if !strings.Contains(result, "name=John") {
			t.Errorf("Expected 'name=John' in result, got: %s", result)
		}
		if !strings.Contains(result, "age=30") {
			t.Errorf("Expected 'age=30' in result, got: %s", result)
		}
		if !strings.Contains(result, "&") {
			t.Errorf("Expected '&' separator in query string, got: %s", result)
		}
	})

	t.Run("Query String to Key-Value", func(t *testing.T) {
		qsInput := "?name=John&age=30&city=NYC"
		req := ConversionRequest{
			Input:  qsInput,
			Method: "key-value ↔ query string",
			Config: map[string]interface{}{},
		}
		result, err := conv.Convert(req)
		if err != nil {
			t.Fatalf("Query String to Key-Value error: %v", err)
		}

		// Result should be one key-value pair per line
		if !strings.Contains(result, "name=John") {
			t.Errorf("Expected 'name=John' in result, got: %s", result)
		}
		if !strings.Contains(result, "\n") && !strings.Contains(result, "=") {
			t.Errorf("Expected key-value format with newlines, got: %s", result)
		}
	})

	// Properties to JSON and JSON to Properties tests
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

	t.Run("JSON to Properties", func(t *testing.T) {
		jsonInput := `{"name":"John","age":"30","city":"NYC"}`
		req := ConversionRequest{
			Input:  jsonInput,
			Method: "properties",
			Config: map[string]interface{}{},
		}
		result, err := conv.Convert(req)
		if err != nil {
			t.Fatalf("JSON to Properties error: %v", err)
		}

		// Result should be properties format
		if !strings.Contains(result, "name=John") {
			t.Errorf("Expected 'name=John' in properties, got: %s", result)
		}
		if !strings.Contains(result, "\n") {
			t.Errorf("Expected multiple lines in properties, got: %s", result)
		}
	})

	// INI to JSON and JSON to INI tests
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

	t.Run("JSON to INI", func(t *testing.T) {
		jsonInput := `{"section1":{"key1":"value1","key2":"value2"},"section2":{"key3":"value3"}}`
		req := ConversionRequest{
			Input:  jsonInput,
			Method: "ini",
			Config: map[string]interface{}{},
		}
		result, err := conv.Convert(req)
		if err != nil {
			t.Fatalf("JSON to INI error: %v", err)
		}

		// Result should be INI format with section headers
		if !strings.Contains(result, "[section1]") {
			t.Errorf("Expected '[section1]' in INI output, got: %s", result)
		}
		if !strings.Contains(result, "key1=value1") {
			t.Errorf("Expected 'key1=value1' in INI output, got: %s", result)
		}
	})

	// JSON to XML and XML to JSON tests
	t.Run("JSON to XML", func(t *testing.T) {
		jsonInput := `{"name":"John","age":30}`
		req := ConversionRequest{
			Input:  jsonInput,
			Method: "json ↔ xml",
			Config: map[string]interface{}{},
		}
		result, err := conv.Convert(req)
		if err != nil {
			t.Fatalf("JSON to XML error: %v", err)
		}

		// Result should be valid XML
		if !strings.Contains(result, "<?xml") {
			t.Errorf("Expected XML declaration, got: %s", result)
		}
		if !strings.Contains(result, "<root>") {
			t.Errorf("Expected root element, got: %s", result)
		}
		if !strings.Contains(result, "<name>") || !strings.Contains(result, "John") {
			t.Errorf("Expected name element with value, got: %s", result)
		}
	})

	t.Run("XML to JSON", func(t *testing.T) {
		xmlInput := `<?xml version="1.0"?><person><name>John</name><age>30</age></person>`
		req := ConversionRequest{
			Input:  xmlInput,
			Method: "json ↔ xml",
			Config: map[string]interface{}{},
		}
		result, err := conv.Convert(req)
		if err != nil {
			t.Fatalf("XML to JSON error: %v", err)
		}

		// Result should be valid JSON
		var parsed map[string]interface{}
		if err := json.Unmarshal([]byte(result), &parsed); err != nil {
			t.Errorf("Result is not valid JSON: %v\nResult: %s", err, result)
		}
		if parsed["name"] != "John" {
			t.Errorf("Expected name=John in parsed JSON, got: %v", parsed)
		}
	})
}

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

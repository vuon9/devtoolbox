package converter

import (
	"testing"
)

// TestEscapeConverter tests all escape/unescape methods
func TestEscapeConverter(t *testing.T) {
	conv := NewEscapeConverter()

	tests := []struct {
		name      string
		method    string
		input     string
		subMode   string
		expected  string
		expectErr bool
	}{
		// String Literal tests
		{"String Literal - Escape Quotes", "string literal", `He said "Hello"`, "Escape", `He said \"Hello\"`, false},
		{"String Literal - Unescape Quotes", "string literal", `He said \"Hello\"`, "Unescape", `He said "Hello"`, false},
		{"String Literal - Escape Newline", "string literal", "Line1\nLine2", "Escape", "Line1\\nLine2", false},
		{"String Literal - Unescape Newline", "string literal", "Line1\\nLine2", "Unescape", "Line1\nLine2", false},
		{"String Literal - Escape Tab", "string literal", "Col1\tCol2", "Escape", "Col1\\tCol2", false},
		{"String Literal - Unescape Tab", "string literal", "Col1\\tCol2", "Unescape", "Col1\tCol2", false},
		{"String Literal - Escape Backslash", "string literal", "C:\\Users\\test", "Escape", "C:\\\\Users\\\\test", false},
		{"String Literal - Unescape Backslash", "string literal", "C:\\\\Users\\\\test", "Unescape", "C:\\Users\\test", false},

		// Unicode/Hex tests
		{"Unicode/Hex - Simple ASCII stays same", "unicode/hex", "Hello", "Escape", "Hello", false},
		{"Unicode/Hex - Emoji to Unicode", "unicode/hex", "Hello 👋", "Escape", "Hello \\u1f44b", false},
		{"Unicode/Hex - Special chars", "unicode/hex", "©", "Escape", "\\xa9", false},
		{"Unicode/Hex - Unescape Unicode", "unicode/hex", "\\u0048\\u0065\\u006c\\u006c\\u006f", "Unescape", "Hello", false},
		{"Unicode/Hex - Unescape Hex", "unicode/hex", "\\x48\\x65\\x6c\\x6c\\x6f", "Unescape", "Hello", false},

		// HTML/XML tests
		{"HTML/XML - Escape brackets", "html/xml", "<script>alert('xss')</script>", "Escape", "&lt;script&gt;alert(&#x27;xss&#x27;)&lt;/script&gt;", false},
		{"HTML/XML - Escape quotes", "html/xml", `<div class="test">`, "Escape", "&lt;div class=&quot;test&quot;&gt;", false},
		{"HTML/XML - Escape ampersand", "html/xml", "Tom & Jerry", "Escape", "Tom &amp; Jerry", false},
		{"HTML/XML - Unescape all", "html/xml", "&lt;div class=&quot;test&quot;&gt;Tom &amp; Jerry&lt;/div&gt;", "Unescape", `<div class="test">Tom & Jerry</div>`, false},

		// URL tests
		{"URL - Encode spaces", "url", "hello world", "Escape", "hello+world", false},
		{"URL - Encode special chars", "url", "a=b&c=d", "Escape", "a%3Db%26c%3Dd", false},
		{"URL - Unencode", "url", "hello+world%21", "Unescape", "hello world!", false},

		// Regex tests
		{"Regex - Escape metacharacters", "regex", "price: $10.00", "Escape", "price: \\$10\\.00", false},
		{"Regex - Escape brackets", "regex", "[a-z]+", "Escape", "\\[a-z\\]\\+", false},
		{"Regex - Escape parens", "regex", "(test)", "Escape", "\\(test\\)", false},
		{"Regex - Unescape", "regex", "price: \\$10\\.00", "Unescape", "price: $10.00", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			req := ConversionRequest{
				Input:  tt.input,
				Method: tt.method,
				Config: map[string]interface{}{"subMode": tt.subMode},
			}
			result, err := conv.Convert(req)
			if tt.expectErr {
				if err == nil {
					t.Errorf("Expected error but got none")
				}
				return
			}
			if err != nil {
				t.Errorf("Unexpected error: %v", err)
				return
			}
			if result != tt.expected {
				t.Errorf("Expected '%s', got '%s'", tt.expected, result)
			}
		})
	}
}

// TestEscapeConverterRoundTrip tests that escape+unescape returns original
func TestEscapeConverterRoundTrip(t *testing.T) {
	conv := NewEscapeConverter()

	tests := []struct {
		name   string
		method string
		input  string
	}{
		{"String Literal", "string literal", `Hello "World" 
 New line 	 Tab`},
		{"Unicode/Hex", "unicode/hex", "Hello World 你好"},
		{"HTML/XML", "html/xml", `<div class="test">Tom & Jerry</div>`},
		{"URL", "url", "hello world! @#$%"},
		{"Regex", "regex", "price: $10.00 [test] (group) * + ?"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Escape
			encReq := ConversionRequest{
				Input:  tt.input,
				Method: tt.method,
				Config: map[string]interface{}{"subMode": "Escape"},
			}
			encoded, err := conv.Convert(encReq)
			if err != nil {
				t.Fatalf("Escape error: %v", err)
			}

			// Unescape
			decReq := ConversionRequest{
				Input:  encoded,
				Method: tt.method,
				Config: map[string]interface{}{"subMode": "Unescape"},
			}
			decoded, err := conv.Convert(decReq)
			if err != nil {
				t.Fatalf("Unescape error: %v", err)
			}

			if decoded != tt.input {
				t.Errorf("Round-trip failed: expected '%s', got '%s'", tt.input, decoded)
			}
		})
	}
}

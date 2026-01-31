package codeformatter

import (
	"strings"
	"testing"
)

func TestCodeFormatterService_Format(t *testing.T) {
	svc := NewCodeFormatterService()

	tests := []struct {
		name     string
		req      FormatRequest
		wantErr  bool
		contains string
	}{
		{
			name: "Empty input returns empty output",
			req: FormatRequest{
				Input:      "",
				FormatType: "json",
			},
			wantErr:  false,
			contains: "",
		},
		{
			name: "Whitespace-only input returns empty output",
			req: FormatRequest{
				Input:      "   \n\t  ",
				FormatType: "json",
			},
			wantErr:  false,
			contains: "",
		},
		{
			name: "Unsupported format type returns error",
			req: FormatRequest{
				Input:      "test",
				FormatType: "unsupported",
			},
			wantErr:  true,
			contains: "unsupported format type",
		},
		{
			name: "Case insensitive format type",
			req: FormatRequest{
				Input:      "{\"test\":1}",
				FormatType: "JSON",
			},
			wantErr:  false,
			contains: "\"test\": 1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := svc.Format(tt.req)

			if tt.wantErr {
				if result.Error == "" {
					t.Errorf("Expected error but got none")
				}
				if !strings.Contains(result.Error, tt.contains) && tt.contains != "" {
					t.Errorf("Expected error to contain %q, got %q", tt.contains, result.Error)
				}
				return
			}

			if result.Error != "" {
				t.Errorf("Unexpected error: %v", result.Error)
				return
			}

			if tt.contains != "" && !strings.Contains(result.Output, tt.contains) {
				t.Errorf("Expected output to contain %q, got %q", tt.contains, result.Output)
			}
		})
	}
}

func TestFormatJSON(t *testing.T) {
	svc := NewCodeFormatterService().(*codeFormatterService)

	tests := []struct {
		name     string
		req      FormatRequest
		wantErr  bool
		contains string
	}{
		{
			name: "Valid JSON formatting",
			req: FormatRequest{
				Input:      `{"name":"test","value":123}`,
				FormatType: "json",
				Minify:     false,
			},
			wantErr:  false,
			contains: "\"name\": \"test\"",
		},
		{
			name: "Valid JSON minification",
			req: FormatRequest{
				Input:      `{"name": "test", "value": 123}`,
				FormatType: "json",
				Minify:     true,
			},
			wantErr:  false,
			contains: `{"name":"test","value":123}`,
		},
		{
			name: "Invalid JSON returns error",
			req: FormatRequest{
				Input:      `{"name": test}`,
				FormatType: "json",
			},
			wantErr:  true,
			contains: "invalid JSON",
		},
		{
			name: "JSON with jq filter",
			req: FormatRequest{
				Input:      `{"employees":[{"name":"John"},{"name":"Jane"}]}`,
				FormatType: "json",
				Filter:     ".employees[0].name",
				Minify:     false,
			},
			wantErr:  false,
			contains: `"John"`,
		},
		{
			name: "JSON with array jq filter",
			req: FormatRequest{
				Input:      `{"items":[1,2,3,4,5]}`,
				FormatType: "json",
				Filter:     ".items[]",
				Minify:     false,
			},
			wantErr:  false,
			contains: "1",
		},
		{
			name: "Invalid jq filter returns error",
			req: FormatRequest{
				Input:      `{"test":1}`,
				FormatType: "json",
				Filter:     ".invalid[",
				Minify:     false,
			},
			wantErr:  true,
			contains: "jq filter error",
		},
		{
			name: "Empty filter is ignored",
			req: FormatRequest{
				Input:      `{"test":1}`,
				FormatType: "json",
				Filter:     "   ",
				Minify:     false,
			},
			wantErr:  false,
			contains: "\"test\": 1",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := svc.formatJSON(tt.req)

			if tt.wantErr {
				if result.Error == "" {
					t.Errorf("Expected error but got none")
				}
				if !strings.Contains(result.Error, tt.contains) {
					t.Errorf("Expected error to contain %q, got %q", tt.contains, result.Error)
				}
				return
			}

			if result.Error != "" {
				t.Errorf("Unexpected error: %v", result.Error)
				return
			}

			if !strings.Contains(result.Output, tt.contains) {
				t.Errorf("Expected output to contain %q, got %q", tt.contains, result.Output)
			}
		})
	}
}

func TestApplyJQFilter(t *testing.T) {
	tests := []struct {
		name    string
		data    interface{}
		filter  string
		wantErr bool
	}{
		{
			name:    "Simple field access",
			data:    map[string]interface{}{"name": "John", "age": 30},
			filter:  ".name",
			wantErr: false,
		},
		{
			name:    "Array access",
			data:    map[string]interface{}{"items": []interface{}{1, 2, 3}},
			filter:  ".items[0]",
			wantErr: false,
		},
		{
			name:    "Invalid syntax",
			data:    map[string]interface{}{"test": 1},
			filter:  ".test[",
			wantErr: true,
		},
		{
			name:    "Select filter",
			data:    map[string]interface{}{"users": []interface{}{map[string]interface{}{"name": "John", "active": true}, map[string]interface{}{"name": "Jane", "active": false}}},
			filter:  ".users[] | select(.active == true)",
			wantErr: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result, err := applyJQFilter(tt.data, tt.filter)

			if tt.wantErr {
				if err == nil {
					t.Errorf("Expected error but got result: %v", result)
				}
				return
			}

			if err != nil {
				t.Errorf("Unexpected error: %v", err)
			}
		})
	}
}

func TestFormatXML(t *testing.T) {
	svc := NewCodeFormatterService().(*codeFormatterService)

	tests := []struct {
		name     string
		req      FormatRequest
		wantErr  bool
		contains string
	}{
		{
			name: "Valid XML formatting",
			req: FormatRequest{
				Input:      `<root><item>test</item></root>`,
				FormatType: "xml",
				Minify:     false,
			},
			wantErr:  false,
			contains: "<root>",
		},
		{
			name: "XML with declaration",
			req: FormatRequest{
				Input:      `<?xml version="1.0"?><root><item>test</item></root>`,
				FormatType: "xml",
				Minify:     false,
			},
			wantErr:  false,
			contains: `<?xml version="1.0"?>`,
		},
		{
			name: "Invalid XML returns error",
			req: FormatRequest{
				Input:      `not xml`,
				FormatType: "xml",
			},
			wantErr:  true,
			contains: "invalid XML",
		},
		{
			name: "XML with XPath filter",
			req: FormatRequest{
				Input:      `<root><item>test1</item><item>test2</item></root>`,
				FormatType: "xml",
				Filter:     "//item",
			},
			wantErr:  false,
			contains: "test1",
		},
		{
			name: "XML minification",
			req: FormatRequest{
				Input:      "<root>\n  <item>test</item>\n</root>",
				FormatType: "xml",
				Minify:     true,
			},
			wantErr:  false,
			contains: "<root> <item>test</item> </root>",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := svc.formatXML(tt.req)

			if tt.wantErr {
				if result.Error == "" {
					t.Errorf("Expected error but got none")
				}
				return
			}

			if result.Error != "" {
				t.Errorf("Unexpected error: %v", result.Error)
				return
			}

			if !strings.Contains(result.Output, tt.contains) {
				t.Errorf("Expected output to contain %q, got %q", tt.contains, result.Output)
			}
		})
	}
}

func TestFormatSQL(t *testing.T) {
	svc := NewCodeFormatterService().(*codeFormatterService)

	tests := []struct {
		name     string
		req      FormatRequest
		contains string
	}{
		{
			name: "SQL formatting",
			req: FormatRequest{
				Input:      "SELECT * FROM users WHERE id = 1",
				FormatType: "sql",
				Minify:     false,
			},
			contains: "SELECT",
		},
		{
			name: "SQL minification",
			req: FormatRequest{
				Input:      "SELECT  *  FROM  users",
				FormatType: "sql",
				Minify:     true,
			},
			contains: "SELECT * FROM users",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := svc.formatSQL(tt.req)

			if result.Error != "" {
				t.Errorf("Unexpected error: %v", result.Error)
				return
			}

			if !strings.Contains(result.Output, tt.contains) {
				t.Errorf("Expected output to contain %q, got %q", tt.contains, result.Output)
			}
		})
	}
}

func TestFormatCSS(t *testing.T) {
	svc := NewCodeFormatterService().(*codeFormatterService)

	tests := []struct {
		name     string
		req      FormatRequest
		contains string
	}{
		{
			name: "CSS formatting",
			req: FormatRequest{
				Input:      "body{color:red;}",
				FormatType: "css",
				Minify:     false,
			},
			contains: "body",
		},
		{
			name: "CSS minification",
			req: FormatRequest{
				Input:      "body {\n  color: red;\n}",
				FormatType: "css",
				Minify:     true,
			},
			contains: "body { color: red; }",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := svc.formatCSS(tt.req)

			if result.Error != "" {
				t.Errorf("Unexpected error: %v", result.Error)
				return
			}

			if !strings.Contains(result.Output, tt.contains) {
				t.Errorf("Expected output to contain %q, got %q", tt.contains, result.Output)
			}
		})
	}
}

func TestFormatJavaScript(t *testing.T) {
	svc := NewCodeFormatterService().(*codeFormatterService)

	tests := []struct {
		name     string
		req      FormatRequest
		contains string
	}{
		{
			name: "JavaScript formatting",
			req: FormatRequest{
				Input:      "function test(){return 1;}",
				FormatType: "javascript",
				Minify:     false,
			},
			contains: "function",
		},
		{
			name: "JavaScript minification",
			req: FormatRequest{
				Input:      "function test() {\n  return 1;\n}",
				FormatType: "javascript",
				Minify:     true,
			},
			contains: "function test()",
		},
		{
			name: "JS alias works",
			req: FormatRequest{
				Input:      "var x=1;",
				FormatType: "js",
				Minify:     false,
			},
			contains: "var",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := svc.formatJavaScript(tt.req)

			if result.Error != "" {
				t.Errorf("Unexpected error: %v", result.Error)
				return
			}

			if !strings.Contains(result.Output, tt.contains) {
				t.Errorf("Expected output to contain %q, got %q", tt.contains, result.Output)
			}
		})
	}
}

func TestMinifyCSS(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Remove extra spaces",
			input:    "body  {  color:  red;  }",
			expected: "body { color: red; }",
		},
		{
			name:     "Remove newlines",
			input:    "body {\n  color: red;\n}",
			expected: "body { color: red; }",
		},
		{
			name:     "Single space between selectors",
			input:    "h1,h2{}",
			expected: "h1,h2{}",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := minifyCSS(tt.input)
			if result != tt.expected {
				t.Errorf("minifyCSS(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

func TestMinifyJS(t *testing.T) {
	tests := []struct {
		name     string
		input    string
		expected string
	}{
		{
			name:     "Remove extra spaces",
			input:    "var  x  =  1;",
			expected: "var x = 1;",
		},
		{
			name:     "Remove single-line comment",
			input:    "var x = 1; // comment",
			expected: "var x = 1;",
		},
		{
			name:     "Remove multi-line comment",
			input:    "var x = /* comment */ 1;",
			expected: "var x = 1;",
		},
		{
			name:     "Preserve strings",
			input:    `var x = "hello world";`,
			expected: `var x = "hello world";`,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := minifyJS(tt.input)
			if result != tt.expected {
				t.Errorf("minifyJS(%q) = %q, want %q", tt.input, result, tt.expected)
			}
		})
	}
}

package converter

import (
	"fmt"
	"net/url"
	"regexp"
	"strconv"
	"strings"
)

type escapeConverter struct{}

func NewEscapeConverter() ConverterService {
	return &escapeConverter{}
}

func (c *escapeConverter) Convert(req ConversionRequest) (string, error) {
	subMode := "escape"
	if val, ok := req.Config["subMode"].(string); ok {
		subMode = val
	}
	isEscape := strings.ToLower(subMode) != "unescape"
	method := strings.ToLower(req.Method)
	input := req.Input

	switch method {
	case "string literal":
		if isEscape {
			return escapeStringLiteral(input), nil
		}
		return unescapeStringLiteral(input), nil
	case "unicode/hex":
		if isEscape {
			return escapeUnicodeHex(input), nil
		}
		return unescapeUnicodeHex(input), nil
	case "html/xml":
		if isEscape {
			return escapeHTMLXMLEntities(input), nil
		}
		return unescapeHTMLXMLEntities(input), nil
	case "url":
		if isEscape {
			return url.QueryEscape(input), nil
		}
		unescaped, err := url.QueryUnescape(input)
		if err != nil {
			return "", fmt.Errorf("invalid URL encoding: %w", err)
		}
		return unescaped, nil
	case "regex":
		if isEscape {
			return escapeRegex(input), nil
		}
		return unescapeRegex(input), nil
	}

	return "", fmt.Errorf("escape method %s not supported", req.Method)
}

// String Literal Escape/Unescape
func escapeStringLiteral(s string) string {
	var result strings.Builder
	for _, r := range s {
		switch r {
		case '\\':
			result.WriteString("\\\\")
		case '"':
			result.WriteString("\\\"")
		case '\'':
			result.WriteString("\\'")
		case '\n':
			result.WriteString("\\n")
		case '\r':
			result.WriteString("\\r")
		case '\t':
			result.WriteString("\\t")
		case '\b':
			result.WriteString("\\b")
		case '\f':
			result.WriteString("\\f")
		default:
			if r < 32 {
				result.WriteString(fmt.Sprintf("\\x%02x", r))
			} else {
				result.WriteRune(r)
			}
		}
	}
	return result.String()
}

func unescapeStringLiteral(s string) string {
	// Handle common escape sequences
	s = strings.ReplaceAll(s, "\\\\", "\x00") // placeholder for backslash
	s = strings.ReplaceAll(s, "\\n", "\n")
	s = strings.ReplaceAll(s, "\\r", "\r")
	s = strings.ReplaceAll(s, "\\t", "\t")
	s = strings.ReplaceAll(s, "\\b", "\b")
	s = strings.ReplaceAll(s, "\\f", "\f")
	s = strings.ReplaceAll(s, "\\\"", "\"")
	s = strings.ReplaceAll(s, "\\'", "'")
	// Handle hex escapes
	s = unescapeHexSequences(s)
	// Restore backslashes
	s = strings.ReplaceAll(s, "\x00", "\\")
	return s
}

// Unicode/Hex Escape/Unescape
func escapeUnicodeHex(s string) string {
	var result strings.Builder
	for _, r := range s {
		if r < 128 && (r >= 32 || r == '\n' || r == '\t' || r == '\r') {
			// ASCII printable or common whitespace - keep as-is
			result.WriteRune(r)
		} else if r < 256 {
			// Extended ASCII - use hex escape
			result.WriteString(fmt.Sprintf("\\x%02x", r))
		} else {
			// Unicode - use unicode escape
			result.WriteString(fmt.Sprintf("\\u%04x", r))
		}
	}
	return result.String()
}

func unescapeUnicodeHex(s string) string {
	// Handle \uXXXX sequences
	uPattern := regexp.MustCompile(`\\u([0-9a-fA-F]{4})`)
	s = uPattern.ReplaceAllStringFunc(s, func(match string) string {
		hex := match[2:] // Remove \u
		val, err := strconv.ParseInt(hex, 16, 32)
		if err != nil {
			return match
		}
		return string(rune(val))
	})

	// Handle \xXX sequences
	xPattern := regexp.MustCompile(`\\x([0-9a-fA-F]{2})`)
	s = xPattern.ReplaceAllStringFunc(s, func(match string) string {
		hex := match[2:] // Remove \x
		val, err := strconv.ParseInt(hex, 16, 32)
		if err != nil {
			return match
		}
		return string(byte(val))
	})

	return s
}

// Helper to unescape hex sequences in string literals
func unescapeHexSequences(s string) string {
	xPattern := regexp.MustCompile(`\\x([0-9a-fA-F]{2})`)
	return xPattern.ReplaceAllStringFunc(s, func(match string) string {
		hex := match[2:] // Remove \x
		val, err := strconv.ParseInt(hex, 16, 32)
		if err != nil {
			return match
		}
		return string(byte(val))
	})
}

// HTML/XML Entity Escape/Unescape
func escapeHTMLXMLEntities(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	s = strings.ReplaceAll(s, "\"", "&quot;")
	s = strings.ReplaceAll(s, "'", "&#x27;")
	return s
}

func unescapeHTMLXMLEntities(s string) string {
	s = strings.ReplaceAll(s, "&quot;", "\"")
	s = strings.ReplaceAll(s, "&#x27;", "'")
	s = strings.ReplaceAll(s, "&#39;", "'")
	s = strings.ReplaceAll(s, "&lt;", "<")
	s = strings.ReplaceAll(s, "&gt;", ">")
	s = strings.ReplaceAll(s, "&amp;", "&")
	return s
}

// Regex Escape/Unescape
func escapeRegex(s string) string {
	var result strings.Builder
	for _, r := range s {
		switch r {
		case '\\', '.', '*', '+', '?', '|', '(', ')', '[', ']', '{', '}', '^', '$':
			result.WriteString("\\")
			result.WriteRune(r)
		default:
			result.WriteRune(r)
		}
	}
	return result.String()
}

func unescapeRegex(s string) string {
	var result strings.Builder
	escaped := false
	for _, r := range s {
		if escaped {
			result.WriteRune(r)
			escaped = false
		} else if r == '\\' {
			escaped = true
		} else {
			result.WriteRune(r)
		}
	}
	return result.String()
}

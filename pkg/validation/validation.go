package validation

import (
	"strings"
)

// IsValidJWTStructure checks if a token has valid JWT structure (3 parts separated by dots)
func IsValidJWTStructure(token string) bool {
	if token == "" {
		return false
	}

	parts := strings.Split(token, ".")
	return len(parts) == 3 && parts[0] != "" && parts[1] != "" && parts[2] != ""
}

// IsBase64URL checks if a string looks like Base64URL (optional validation)
func IsBase64URL(s string) bool {
	if s == "" {
		return false
	}

	// Base64URL characters: A-Z, a-z, 0-9, -, _, =
	for _, ch := range s {
		if !((ch >= 'A' && ch <= 'Z') ||
			(ch >= 'a' && ch <= 'z') ||
			(ch >= '0' && ch <= '9') ||
			ch == '-' || ch == '_' || ch == '=') {
			return false
		}
	}
	return true
}

// IsEmpty checks if string is empty or only whitespace
func IsEmpty(s string) bool {
	return strings.TrimSpace(s) == ""
}

// ValidateSecret validates secret input (basic validation)
func ValidateSecret(secret string) bool {
	return !IsEmpty(secret)
}

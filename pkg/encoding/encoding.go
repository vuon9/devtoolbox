package encoding

import (
	"encoding/base64"
	"encoding/json"
	"strings"
)

// DecodeBase64URL decodes a Base64URL string (JWT format)
func DecodeBase64URL(input string) ([]byte, error) {
	// Add padding if needed
	padLength := 4 - len(input)%4
	if padLength < 4 {
		input += strings.Repeat("=", padLength)
	}

	// Replace URL-safe characters
	input = strings.ReplaceAll(input, "-", "+")
	input = strings.ReplaceAll(input, "_", "/")

	return base64.StdEncoding.DecodeString(input)
}

// EncodeBase64URL encodes data to Base64URL string (JWT format)
func EncodeBase64URL(data []byte) string {
	encoded := base64.StdEncoding.EncodeToString(data)
	// Make URL-safe
	encoded = strings.ReplaceAll(encoded, "+", "-")
	encoded = strings.ReplaceAll(encoded, "/", "_")
	encoded = strings.ReplaceAll(encoded, "=", "")
	return encoded
}

// DecodeBase64URLToString decodes Base64URL to string
func DecodeBase64URLToString(input string) (string, error) {
	bytes, err := DecodeBase64URL(input)
	if err != nil {
		return "", err
	}
	return string(bytes), nil
}

// DecodeBase64URLToJSON decodes Base64URL to JSON object
func DecodeBase64URLToJSON(input string) (map[string]interface{}, error) {
	bytes, err := DecodeBase64URL(input)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	if err := json.Unmarshal(bytes, &result); err != nil {
		return nil, err
	}
	return result, nil
}

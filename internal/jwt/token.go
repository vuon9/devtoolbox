package jwt

import (
	"encoding/json"
	"time"
)

// Token represents a JWT token with its decoded parts
type Token struct {
	Raw       string                 // Original token string
	Header    map[string]interface{} // Decoded header
	Payload   map[string]interface{} // Decoded payload (claims)
	Signature string                 // Raw signature (Base64URL)
	Valid     bool                   // JWT structure validity
	Error     string                 // Decoding error message
}

// NewToken creates a new Token instance
func NewToken(raw string) *Token {
	return &Token{
		Raw:     raw,
		Header:  make(map[string]interface{}),
		Payload: make(map[string]interface{}),
		Valid:   false,
		Error:   "",
	}
}

// WithHeader sets the header and returns the token (builder pattern)
func (t *Token) WithHeader(header map[string]interface{}) *Token {
	t.Header = header
	return t
}

// WithPayload sets the payload and returns the token
func (t *Token) WithPayload(payload map[string]interface{}) *Token {
	t.Payload = payload
	return t
}

// WithSignature sets the signature and returns the token
func (t *Token) WithSignature(signature string) *Token {
	t.Signature = signature
	return t
}

// WithValidity sets validity and returns the token
func (t *Token) WithValidity(valid bool) *Token {
	t.Valid = valid
	return t
}

// WithError sets error message and returns the token
func (t *Token) WithError(err string) *Token {
	t.Error = err
	t.Valid = false
	return t
}

// GetAlgorithm returns the algorithm from header
func (t *Token) GetAlgorithm() string {
	if alg, ok := t.Header["alg"].(string); ok {
		return alg
	}
	return ""
}

// GetSubject returns the subject claim from payload
func (t *Token) GetSubject() string {
	if sub, ok := t.Payload["sub"].(string); ok {
		return sub
	}
	return ""
}

// GetExpiration returns the expiration time from payload
func (t *Token) GetExpiration() *time.Time {
	if exp, ok := t.Payload["exp"].(float64); ok {
		t := time.Unix(int64(exp), 0)
		return &t
	}
	return nil
}

// GetIssuedAt returns the issued at time from payload
func (t *Token) GetIssuedAt() *time.Time {
	if iat, ok := t.Payload["iat"].(float64); ok {
		t := time.Unix(int64(iat), 0)
		return &t
	}
	return nil
}

// GetHeaderJSON returns header as formatted JSON string
func (t *Token) GetHeaderJSON() string {
	if len(t.Header) == 0 {
		return ""
	}
	bytes, _ := json.MarshalIndent(t.Header, "", "  ")
	return string(bytes)
}

// GetPayloadJSON returns payload as formatted JSON string
func (t *Token) GetPayloadJSON() string {
	if len(t.Payload) == 0 {
		return ""
	}
	bytes, _ := json.MarshalIndent(t.Payload, "", "  ")
	return string(bytes)
}

// GetClaimsText returns claims as plain text (key: value format)
func (t *Token) GetClaimsText() string {
	if len(t.Payload) == 0 {
		return ""
	}

	var result string
	for key, value := range t.Payload {
		valueJSON, _ := json.Marshal(value)
		result += key + ": " + string(valueJSON) + "\n"
	}
	return result
}

// ValidationResult represents the result of JWT signature verification
type ValidationResult struct {
	Valid   bool   // Signature validity
	Message string // Verification status message
	Error   string // Verification error
}

// NewValidationResult creates a new ValidationResult
func NewValidationResult() *ValidationResult {
	return &ValidationResult{
		Valid:   false,
		Message: "",
		Error:   "",
	}
}

// WithValidity sets validity and returns the result
func (v *ValidationResult) WithValidity(valid bool) *ValidationResult {
	v.Valid = valid
	return v
}

// WithMessage sets message and returns the result
func (v *ValidationResult) WithMessage(message string) *ValidationResult {
	v.Message = message
	return v
}

// WithError sets error and returns the result
func (v *ValidationResult) WithError(err string) *ValidationResult {
	v.Error = err
	v.Valid = false
	return v
}

// Success creates a successful validation result
func Success(message string) *ValidationResult {
	return &ValidationResult{
		Valid:   true,
		Message: message,
		Error:   "",
	}
}

// Failure creates a failed validation result
func Failure(message string) *ValidationResult {
	return &ValidationResult{
		Valid:   false,
		Message: message,
		Error:   "",
	}
}

// ErrorResult creates a validation result with error
func ErrorResult(err string) *ValidationResult {
	return &ValidationResult{
		Valid:   false,
		Message: "",
		Error:   err,
	}
}

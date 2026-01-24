package errors

import "fmt"

// DomainError represents a domain-level error with a code and message
type DomainError struct {
	Code    string
	Message string
}

func (e *DomainError) Error() string {
	return fmt.Sprintf("%s: %s", e.Code, e.Message)
}

// NewDomainError creates a new domain error
func NewDomainError(code, message string) *DomainError {
	return &DomainError{
		Code:    code,
		Message: message,
	}
}

// Common error codes
const (
	ErrCodeInvalidInput  = "INVALID_INPUT"
	ErrCodeInvalidToken  = "INVALID_TOKEN"
	ErrCodeInvalidSecret = "INVALID_SECRET"
	ErrCodeParseFailed   = "PARSE_FAILED"
	ErrCodeVerifyFailed  = "VERIFY_FAILED"
)

// Common domain errors
var (
	ErrInvalidToken  = NewDomainError(ErrCodeInvalidToken, "invalid JWT token")
	ErrInvalidSecret = NewDomainError(ErrCodeInvalidSecret, "invalid secret")
	ErrParseFailed   = NewDomainError(ErrCodeParseFailed, "failed to parse JWT")
)

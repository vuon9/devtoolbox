package jwt

import (
	sharedErrors "devtoolbox/pkg/errors"
)

// JWTError represents a JWT-specific error
type JWTError struct {
	Code    string
	Message string
	Err     error
}

func (e *JWTError) Error() string {
	if e.Err != nil {
		return e.Message + ": " + e.Err.Error()
	}
	return e.Message
}

func (e *JWTError) Unwrap() error {
	return e.Err
}

// NewJWTError creates a new JWT error
func NewJWTError(code, message string, err error) *JWTError {
	return &JWTError{
		Code:    code,
		Message: message,
		Err:     err,
	}
}

// Common JWT errors
var (
	ErrMalformedToken   = NewJWTError("MALFORMED_TOKEN", "malformed JWT token", nil)
	ErrInvalidSignature = NewJWTError("INVALID_SIGNATURE", "invalid JWT signature", nil)
	ErrExpiredToken     = NewJWTError("EXPIRED_TOKEN", "JWT token has expired", nil)
	ErrInvalidAlgorithm = NewJWTError("INVALID_ALGORITHM", "invalid JWT algorithm", nil)
	ErrInvalidSecret    = NewJWTError("INVALID_SECRET", "secret cannot be empty", nil)
)

// FromError converts any error to JWT error
func FromError(err error) error {
	if err == nil {
		return nil
	}

	// If it's already a JWT error, return as-is
	if _, ok := err.(*JWTError); ok {
		return err
	}

	// Fallback to shared error
	return sharedErrors.NewDomainError("JWT_ERROR", err.Error())
}

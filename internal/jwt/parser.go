package jwt

import (
	"dev-toolbox/pkg/encoding"
	"dev-toolbox/pkg/validation"
	"strings"

	"github.com/golang-jwt/jwt/v5"
)

// Parser defines the interface for JWT parsing operations
type Parser interface {
	Parse(token string) (*Token, error)
	Verify(token, secret, encoding string) (*ValidationResult, error)
	Encode(header, payload map[string]interface{}, algorithm, secret string) (string, error)
}

// jwtParser implements Parser using github.com/golang-jwt/jwt/v5
type jwtParser struct{}

// NewParser creates a new JWT parser instance
func NewParser() Parser {
	return &jwtParser{}
}

// Parse decodes a JWT token without verification
func (p *jwtParser) Parse(token string) (*Token, error) {
	// Create base token
	result := NewToken(token)

	// Basic structure validation
	if !validation.IsValidJWTStructure(token) {
		return result.
			WithError("Invalid JWT structure: must have 3 parts separated by dots").
			WithValidity(false), nil
	}

	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return result.
			WithError("Invalid JWT: expected 3 parts").
			WithValidity(false), nil
	}

	// Parse with JWT library (without verification)
	parsedToken, err := jwt.Parse(
		token,
		func(token *jwt.Token) (interface{}, error) {
			// Don't verify signature for decoding
			return nil, nil
		},
		jwt.WithValidMethods(nil), // Don't validate algorithm
	)

	if err != nil {
		// Try to extract header and payload even if signature is invalid
		header, headerErr := decodePart(parts[0])
		payload, payloadErr := decodePart(parts[1])

		if headerErr != nil || payloadErr != nil {
			return result.
				WithError("Failed to decode Base64URL sections. Check if the token is valid.").
				WithValidity(false), nil
		}

		return result.
			WithHeader(header).
			WithPayload(payload).
			WithSignature(parts[2]).
			WithValidity(false), nil
	}

	// Extract claims
	claims, ok := parsedToken.Claims.(jwt.MapClaims)
	if !ok {
		return result.
			WithError("Failed to extract JWT claims").
			WithValidity(false), nil
	}

	// Convert claims to map
	payloadMap := make(map[string]interface{})
	for key, value := range claims {
		payloadMap[key] = value
	}

	// Extract header
	headerMap := make(map[string]interface{})
	for key, value := range parsedToken.Header {
		headerMap[key] = value
	}

	return result.
		WithHeader(headerMap).
		WithPayload(payloadMap).
		WithSignature(parts[2]).
		WithValidity(true), nil
}

// Verify verifies a JWT signature with the given secret
func (p *jwtParser) Verify(token, secret, encoding string) (*ValidationResult, error) {
	// Basic validation
	if !validation.IsValidJWTStructure(token) {
		return ErrorResult("Invalid JWT structure"), nil
	}

	if !validation.ValidateSecret(secret) {
		return ErrorResult("Invalid secret"), nil
	}

	// Handle encoding (UTF-8 vs Base64)
	secretBytes := []byte(secret)
	if encoding == "base64" {
		// TODO: Implement Base64 secret decoding
		// For now, treat as UTF-8
	}

	// Parse with verification
	_, err := jwt.Parse(
		token,
		func(token *jwt.Token) (interface{}, error) {
			// Use HMAC verification for HS256, HS384, HS512
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, ErrInvalidAlgorithm
			}
			return secretBytes, nil
		},
	)

	if err != nil {
		// Map JWT library error to JWT error
		jwtErr := FromError(err)
		return Failure("Signature verification failed: " + jwtErr.Error()), nil
	}

	return Success("Signature verified successfully"), nil
}

// Encode creates a signed JWT token from header, payload, algorithm, and secret
func (p *jwtParser) Encode(header, payload map[string]interface{}, algorithm, secret string) (string, error) {
	// Validate algorithm
	var signingMethod jwt.SigningMethod
	switch algorithm {
	case "HS256":
		signingMethod = jwt.SigningMethodHS256
	case "HS384":
		signingMethod = jwt.SigningMethodHS384
	case "HS512":
		signingMethod = jwt.SigningMethodHS512
	default:
		return "", ErrInvalidAlgorithm
	}

	// Ensure header includes alg and typ
	if header == nil {
		header = make(map[string]interface{})
	}
	header["alg"] = algorithm
	if _, hasTyp := header["typ"]; !hasTyp {
		header["typ"] = "JWT"
	}

	// Create token with claims
	token := jwt.NewWithClaims(signingMethod, jwt.MapClaims(payload))
	token.Header = header

	// Sign token with secret
	if secret == "" {
		return "", ErrInvalidSecret
	}
	secretBytes := []byte(secret)

	signedToken, err := token.SignedString(secretBytes)
	if err != nil {
		return "", FromError(err)
	}

	return signedToken, nil
}

// decodePart decodes a Base64URL JWT part
func decodePart(part string) (map[string]interface{}, error) {
	// Use our shared encoding package
	return encoding.DecodeBase64URLToJSON(part)
}

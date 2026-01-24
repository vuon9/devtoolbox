package jwt

// JWTService defines the service interface for JWT operations
type JWTService interface {
	Decode(token string) (*Token, error)
	Verify(token, secret, encoding string) (*ValidationResult, error)
	Encode(header, payload map[string]interface{}, algorithm, secret string) (string, error)
}

// jwtServiceImpl implements JWTService
type jwtServiceImpl struct {
	parser Parser
}

// NewJWTService creates a new JWT service instance
func NewJWTService(parser Parser) JWTService {
	return &jwtServiceImpl{
		parser: parser,
	}
}

// Decode decodes a JWT token and returns its parts
func (s *jwtServiceImpl) Decode(token string) (*Token, error) {
	if token == "" {
		return NewToken("").
			WithError("Token cannot be empty").
			WithValidity(false), nil
	}

	// Use parser to decode
	return s.parser.Parse(token)
}

// Verify verifies a JWT signature with the given secret
func (s *jwtServiceImpl) Verify(token, secret, encoding string) (*ValidationResult, error) {
	if token == "" {
		return ErrorResult("Token cannot be empty"), nil
	}

	if secret == "" {
		return ErrorResult("Secret cannot be empty"), nil
	}

	// Use parser to verify
	return s.parser.Verify(token, secret, encoding)
}

// Encode creates a signed JWT token from header, payload, algorithm, and secret
func (s *jwtServiceImpl) Encode(header, payload map[string]interface{}, algorithm, secret string) (string, error) {
	// Validate inputs
	if header == nil && payload == nil {
		return "", NewJWTError("INVALID_INPUT", "header and payload cannot both be nil", nil)
	}

	// Use parser to encode
	return s.parser.Encode(header, payload, algorithm, secret)
}

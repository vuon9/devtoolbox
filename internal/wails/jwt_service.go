package wails

import (
	"context"
	"dev-toolbox/internal/jwt"
	"encoding/json"
)

// JWTService is the Wails binding struct for JWT operations
type JWTService struct {
	ctx context.Context
	svc jwt.JWTService
}

// NewJWTService creates a new JWTService instance
func NewJWTService() *JWTService {
	parser := jwt.NewParser()
	svc := jwt.NewJWTService(parser)
	return &JWTService{
		svc: svc,
	}
}

// Startup is called when the app starts (Wails lifecycle)
func (j *JWTService) Startup(ctx context.Context) {
	j.ctx = ctx
}

// Decode decodes a JWT token
// This method is exposed to the frontend via Wails
func (j *JWTService) Decode(token string) (jwt.DecodeResponse, error) {
	result, err := j.svc.Decode(token)
	if err != nil {
		return jwt.DecodeResponse{
			Header:    nil,
			Payload:   nil,
			Signature: "",
			Valid:     false,
			Error:     err.Error(),
		}, nil
	}

	return jwt.FromToken(result), nil
}

// Verify verifies a JWT signature with secret
// This method is exposed to the frontend via Wails
func (j *JWTService) Verify(token, secret, encoding string) (jwt.VerifyResponse, error) {
	result, err := j.svc.Verify(token, secret, encoding)
	if err != nil {
		return jwt.VerifyResponse{
			Valid:   false,
			Message: "",
			Error:   err.Error(),
		}, nil
	}

	return jwt.FromValidation(result), nil
}

// Encode creates a signed JWT token from header JSON, payload JSON, algorithm, and secret
// This method is exposed to the frontend via Wails
func (j *JWTService) Encode(headerJSON, payloadJSON, algorithm, secret string) (jwt.EncodeResponse, error) {
	// Parse header JSON
	var header map[string]interface{}
	if headerJSON != "" {
		if err := json.Unmarshal([]byte(headerJSON), &header); err != nil {
			return jwt.EncodeResponse{
				Token: "",
				Error: "Invalid header JSON: " + err.Error(),
			}, nil
		}
	}

	// Parse payload JSON
	var payload map[string]interface{}
	if payloadJSON != "" {
		if err := json.Unmarshal([]byte(payloadJSON), &payload); err != nil {
			return jwt.EncodeResponse{
				Token: "",
				Error: "Invalid payload JSON: " + err.Error(),
			}, nil
		}
	}

	// Call service to encode
	token, err := j.svc.Encode(header, payload, algorithm, secret)
	if err != nil {
		return jwt.EncodeResponse{
			Token: "",
			Error: err.Error(),
		}, nil
	}

	return jwt.EncodeResponse{
		Token: token,
		Error: "",
	}, nil
}

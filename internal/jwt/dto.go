package jwt

// DecodeResponse is the response for JWT decode operation
// Matches frontend JwtDebugger.jsx state structure
type DecodeResponse struct {
	Header    map[string]interface{} `json:"header"`
	Payload   map[string]interface{} `json:"payload"`
	Signature string                 `json:"signature"`
	Valid     bool                   `json:"isValid"`
	Error     string                 `json:"error"`
}

// VerifyResponse is the response for JWT verify operation
// Matches frontend JwtDebugger.jsx validation state
type VerifyResponse struct {
	Valid   bool   `json:"isValid"`
	Message string `json:"validationMessage"`
	Error   string `json:"error"`
}

// EncodeResponse is the response for JWT encode operation
type EncodeResponse struct {
	Token string `json:"token"`
	Error string `json:"error"`
}

// FromToken converts Token to DecodeResponse
func FromToken(token *Token) DecodeResponse {
	return DecodeResponse{
		Header:    token.Header,
		Payload:   token.Payload,
		Signature: token.Signature,
		Valid:     token.Valid,
		Error:     token.Error,
	}
}

// FromValidation converts ValidationResult to VerifyResponse
func FromValidation(result *ValidationResult) VerifyResponse {
	return VerifyResponse{
		Valid:   result.Valid,
		Message: result.Message,
		Error:   result.Error,
	}
}

// FromEncoded converts token string and error to EncodeResponse
func FromEncoded(token string, err error) EncodeResponse {
	if err != nil {
		return EncodeResponse{
			Token: "",
			Error: err.Error(),
		}
	}
	return EncodeResponse{
		Token: token,
		Error: "",
	}
}

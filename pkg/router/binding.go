package router

// RequestWrapper wraps requests for single-parameter methods
type RequestWrapper struct {
	Args []interface{} `json:"args"`
}

// ResponseWrapper standardizes API responses
type ResponseWrapper struct {
	Data  interface{} `json:"data,omitempty"`
	Error string      `json:"error,omitempty"`
}

package router

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

// Test service
type TestService struct{}

type EchoRequest struct {
	Message string `json:"message"`
}

type EchoResponse struct {
	Message string `json:"message"`
}

func (s *TestService) Echo(req EchoRequest) EchoResponse {
	return EchoResponse{Message: req.Message}
}

func (s *TestService) ServiceStartup() error {
	return nil
}

func TestRouter_Register(t *testing.T) {
	tests := []struct {
		name           string
		requestBody    map[string]string
		expectedStatus int
		expectedMsg    string
	}{
		{
			name:           "valid echo request",
			requestBody:    map[string]string{"message": "hello"},
			expectedStatus: http.StatusOK,
			expectedMsg:    "hello",
		},
		{
			name:           "empty message",
			requestBody:    map[string]string{"message": ""},
			expectedStatus: http.StatusOK,
			expectedMsg:    "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gin.SetMode(gin.TestMode)
			r := gin.New()
			router := New(r)

			service := &TestService{}
			err := router.Register(service)
			assert.NoError(t, err)

			body, _ := json.Marshal(tt.requestBody)

			w := httptest.NewRecorder()
			httpReq, _ := http.NewRequest("POST", "/api/test-service/echo", bytes.NewBuffer(body))
			httpReq.Header.Set("Content-Type", "application/json")

			r.ServeHTTP(w, httpReq)

			assert.Equal(t, tt.expectedStatus, w.Code)

			var resp EchoResponse
			err = json.Unmarshal(w.Body.Bytes(), &resp)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectedMsg, resp.Message)
		})
	}
}

func TestToKebabCase(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"JWTService", "jwt-service"},
		{"Decode", "decode"},
		{"VerifyToken", "verify-token"},
		{"ABC", "abc"},
		{"", ""},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			result := toKebabCase(tt.input)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestIsLifecycleMethod(t *testing.T) {
	tests := []struct {
		name     string
		expected bool
	}{
		{"ServiceStartup", true},
		{"ServiceShutdown", true},
		{"Decode", false},
		{"Verify", false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := isLifecycleMethod(tt.name)
			assert.Equal(t, tt.expected, result)
		})
	}
}

func TestRouter_LifecycleMethodsSkipped(t *testing.T) {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	router := New(r)

	service := &TestService{}
	err := router.Register(service)
	assert.NoError(t, err)

	// ServiceStartup should not be registered as a route
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/test-service/service-startup", nil)
	r.ServeHTTP(w, req)

	// Should get 404 because lifecycle methods are skipped
	assert.Equal(t, http.StatusNotFound, w.Code)
}

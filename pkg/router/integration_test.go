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

// Integration test with real services
func TestIntegration_AllServices(t *testing.T) {
	tests := []struct {
		name           string
		method         string
		path           string
		body           map[string]interface{}
		expectedStatus int
	}{
		{
			name:           "health endpoint",
			method:         "GET",
			path:           "/health",
			body:           nil,
			expectedStatus: http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gin.SetMode(gin.TestMode)
			server := NewServer()

			// Register all services (using mock for this test)
			jwtSvc := &mockJWTService{}
			server.Register(jwtSvc)

			var bodyBytes []byte
			if tt.body != nil {
				bodyBytes, _ = json.Marshal(tt.body)
			}

			w := httptest.NewRecorder()
			var req *http.Request
			if tt.body != nil {
				req, _ = http.NewRequest(tt.method, tt.path, bytes.NewBuffer(bodyBytes))
				req.Header.Set("Content-Type", "application/json")
			} else {
				req, _ = http.NewRequest(tt.method, tt.path, nil)
			}

			server.Engine().ServeHTTP(w, req)

			assert.Equal(t, tt.expectedStatus, w.Code)

			if tt.path == "/health" {
				var health map[string]interface{}
				err := json.Unmarshal(w.Body.Bytes(), &health)
				assert.NoError(t, err)
				assert.Equal(t, "ok", health["status"])
				assert.Equal(t, "web", health["mode"])
			}
		})
	}
}

// Mock services for testing
type mockJWTService struct{}

type mockDecodeRequest struct {
	Token string `json:"token"`
}

type mockDecodeResponse struct {
	Valid bool   `json:"valid"`
	Error string `json:"error,omitempty"`
}

func (s *mockJWTService) Decode(req mockDecodeRequest) mockDecodeResponse {
	if req.Token == "" {
		return mockDecodeResponse{Valid: false, Error: "empty token"}
	}
	return mockDecodeResponse{Valid: true}
}

func TestIntegration_JWTDecode(t *testing.T) {
	tests := []struct {
		name        string
		token       string
		expectValid bool
	}{
		{
			name:        "valid token",
			token:       "test.jwt.token",
			expectValid: true,
		},
		{
			name:        "empty token",
			token:       "",
			expectValid: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gin.SetMode(gin.TestMode)
			server := NewServer()
			jwtSvc := &mockJWTService{}
			server.Register(jwtSvc)

			reqBody := map[string]string{"token": tt.token}
			body, _ := json.Marshal(reqBody)

			w := httptest.NewRecorder()
			req, _ := http.NewRequest("POST", "/api/mock-jwt-service/decode", bytes.NewBuffer(body))
			req.Header.Set("Content-Type", "application/json")

			server.Engine().ServeHTTP(w, req)

			assert.Equal(t, http.StatusOK, w.Code)

			var resp mockDecodeResponse
			err := json.Unmarshal(w.Body.Bytes(), &resp)
			assert.NoError(t, err)
			assert.Equal(t, tt.expectValid, resp.Valid)
		})
	}
}

func TestIntegration_CORSHeaders(t *testing.T) {
	gin.SetMode(gin.TestMode)
	server := NewServer()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("OPTIONS", "/health", nil)
	req.Header.Set("Origin", "http://localhost:3000")
	req.Header.Set("Access-Control-Request-Method", "POST")

	server.Engine().ServeHTTP(w, req)

	// Check CORS headers are present
	assert.Equal(t, "*", w.Header().Get("Access-Control-Allow-Origin"))
	assert.Contains(t, w.Header().Get("Access-Control-Allow-Methods"), "POST")
}

func TestIntegration_InvalidJSON(t *testing.T) {
	gin.SetMode(gin.TestMode)
	server := NewServer()
	jwtSvc := &mockJWTService{}
	server.Register(jwtSvc)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/mock-jwt-service/decode", bytes.NewBufferString("invalid json"))
	req.Header.Set("Content-Type", "application/json")

	server.Engine().ServeHTTP(w, req)

	assert.Equal(t, http.StatusBadRequest, w.Code)
}

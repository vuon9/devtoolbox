package router

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestServer_Start(t *testing.T) {
	gin.SetMode(gin.TestMode)
	server := NewServer()

	// Register a simple service
	svc := &testServiceForServer{}
	err := server.Register(svc)
	assert.NoError(t, err)

	// Test health endpoint
	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/health", nil)
	server.Engine().ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "ok")
	assert.Contains(t, w.Body.String(), "web")
}

type testServiceForServer struct{}

type testRequest struct {
	Input string `json:"input"`
}

type testResponse struct {
	Output string `json:"output"`
}

func (s *testServiceForServer) Process(req testRequest) testResponse {
	return testResponse{Output: req.Input}
}

func TestServer_EndToEnd(t *testing.T) {
	gin.SetMode(gin.TestMode)
	server := NewServer()

	// Register service
	svc := &testServiceForServer{}
	err := server.Register(svc)
	assert.NoError(t, err)

	// Test actual endpoint
	w := httptest.NewRecorder()
	reqBody := `{"input": "hello"}`
	req, _ := http.NewRequest("POST", "/api/test-service-for-server/process",
		strings.NewReader(reqBody))
	req.Header.Set("Content-Type", "application/json")

	server.Engine().ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "hello")
}

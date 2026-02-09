package router

import (
	"bytes"
	"devtoolbox/service"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
)

func TestAPI_Integration(t *testing.T) {
	gin.SetMode(gin.TestMode)
	server := NewServer()
	engine := server.Engine()

	// Register real services (nil app is fine for these tests as they don't use Wails runtime)
	jwtSvc := service.NewJWTService(nil)
	barcodeSvc := service.NewBarcodeService(nil)

	server.Register(jwtSvc)
	server.Register(barcodeSvc)

	t.Run("health check", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("GET", "/health", nil)
		engine.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), `"status":"ok"`)
	})

	t.Run("jwt service - decode invalid token", func(t *testing.T) {
		w := httptest.NewRecorder()
		reqBody := map[string]string{"token": "invalid.token.here"}
		body, _ := json.Marshal(reqBody)

		req, _ := http.NewRequest("POST", "/api/jwt-service/decode", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		engine.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), `"isValid":false`)
		assert.Contains(t, w.Body.String(), `"error"`)
	})

	t.Run("barcode service - get standards", func(t *testing.T) {
		w := httptest.NewRecorder()
		// No parameters needed for GetBarcodeStandards
		req, _ := http.NewRequest("POST", "/api/barcode-service/get-barcode-standards", nil)
		engine.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		var standards []map[string]string
		err := json.Unmarshal(w.Body.Bytes(), &standards)
		assert.NoError(t, err)
		assert.NotEmpty(t, standards)
	})

	t.Run("barcode service - generate code128", func(t *testing.T) {
		w := httptest.NewRecorder()
		reqBody := map[string]interface{}{
			"content":  "12345",
			"standard": "Code128",
			"size":     256,
		}
		body, _ := json.Marshal(reqBody)

		req, _ := http.NewRequest("POST", "/api/barcode-service/generate-barcode", bytes.NewBuffer(body))
		req.Header.Set("Content-Type", "application/json")
		engine.ServeHTTP(w, req)

		assert.Equal(t, http.StatusOK, w.Code)
		assert.Contains(t, w.Body.String(), "data:image/png;base64")
	})

	t.Run("CORS headers", func(t *testing.T) {
		w := httptest.NewRecorder()
		req, _ := http.NewRequest("OPTIONS", "/health", nil)
		req.Header.Set("Origin", "http://example.com")
		req.Header.Set("Access-Control-Request-Method", "POST")
		engine.ServeHTTP(w, req)

		assert.Equal(t, http.StatusNoContent, w.Code)
		assert.Equal(t, "*", w.Header().Get("Access-Control-Allow-Origin"))
	})
}

package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"

	"dev-toolbox/internal/codeformatter"
	"dev-toolbox/internal/datagenerator"
	"dev-toolbox/internal/wails"
)

// Server represents the HTTP server for Web Mode
type Server struct {
	jwtService           *wails.JWTService
	conversionService    *wails.ConversionService
	barcodeService       *wails.BarcodeService
	dataGeneratorService *wails.DataGeneratorService
	codeFormatterService *wails.CodeFormatterService
}

// NewServer creates a new Server instance
func NewServer(jwtService *wails.JWTService, conversionService *wails.ConversionService, barcodeService *wails.BarcodeService, dataGeneratorService *wails.DataGeneratorService, codeFormatterService *wails.CodeFormatterService) *Server {
	return &Server{
		jwtService:           jwtService,
		conversionService:    conversionService,
		barcodeService:       barcodeService,
		dataGeneratorService: dataGeneratorService,
		codeFormatterService: codeFormatterService,
	}
}

// Start starts the HTTP server on the specified port
func (s *Server) Start(port int) {
	mux := http.NewServeMux()

	// Generic API handler
	mux.HandleFunc("/api/", s.handleAPI)

	// Enable CORS
	handler := corsMiddleware(mux)

	addr := fmt.Sprintf(":%d", port)
	log.Printf("Starting HTTP server for Web Mode on http://localhost%s", addr)
	if err := http.ListenAndServe(addr, handler); err != nil {
		log.Fatalf("Failed to start HTTP server: %v", err)
	}
}

// handleAPI routes requests to the appropriate service and method
func (s *Server) handleAPI(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// Expected path: /api/Service/Method
	path := strings.TrimPrefix(r.URL.Path, "/api/")
	parts := strings.Split(path, "/")

	if len(parts) < 2 {
		http.Error(w, "Invalid API path", http.StatusBadRequest)
		return
	}

	service := parts[0]
	method := parts[1]

	if service == "JWTService" {
		s.handleJWTService(method, w, r)
		return
	}

	if service == "ConversionService" {
		s.handleConversionService(method, w, r)
		return
	}

	if service == "BarcodeService" {
		s.handleBarcodeService(method, w, r)
		return
	}

	if service == "DataGeneratorService" {
		s.handleDataGeneratorService(method, w, r)
		return
	}

	if service == "CodeFormatterService" {
		s.handleCodeFormatterService(method, w, r)
		return
	}

	http.Error(w, fmt.Sprintf("Service not found: %s", service), http.StatusNotFound)
}

func (s *Server) handleConversionService(method string, w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Args []interface{} `json:"args"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var result interface{}
	var err error

	switch method {
	case "Convert":
		if len(payload.Args) < 4 {
			http.Error(w, "Missing arguments", http.StatusBadRequest)
			return
		}
		input := payload.Args[0].(string)
		category := payload.Args[1].(string)
		cmd := payload.Args[2].(string)
		config := payload.Args[3].(map[string]interface{})
		result, err = s.conversionService.Convert(input, category, cmd, config)
	default:
		http.Error(w, fmt.Sprintf("Method not found: %s", method), http.StatusNotFound)
		return
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (s *Server) handleJWTService(method string, w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Args []interface{} `json:"args"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var result interface{}
	var err error

	switch method {
	case "Decode":
		if len(payload.Args) < 1 {
			http.Error(w, "Missing arguments", http.StatusBadRequest)
			return
		}
		token := payload.Args[0].(string)
		result, err = s.jwtService.Decode(token)
	case "Verify":
		if len(payload.Args) < 3 {
			http.Error(w, "Missing arguments", http.StatusBadRequest)
			return
		}
		token := payload.Args[0].(string)
		secret := payload.Args[1].(string)
		encoding := payload.Args[2].(string)
		result, err = s.jwtService.Verify(token, secret, encoding)
	case "Encode":
		if len(payload.Args) < 4 {
			http.Error(w, "Missing arguments", http.StatusBadRequest)
			return
		}
		header := payload.Args[0].(string)
		payloadStr := payload.Args[1].(string)
		algo := payload.Args[2].(string)
		secret := payload.Args[3].(string)
		result, err = s.jwtService.Encode(header, payloadStr, algo, secret)
	default:
		http.Error(w, fmt.Sprintf("Method not found: %s", method), http.StatusNotFound)
		return
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (s *Server) handleBarcodeService(method string, w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Args []interface{} `json:"args"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var result interface{}
	var err error

	switch method {
	case "GenerateQR":
		if len(payload.Args) < 1 {
			http.Error(w, "Missing arguments", http.StatusBadRequest)
			return
		}
		// Parse the request from the first argument
		reqData, ok := payload.Args[0].(map[string]interface{})
		if !ok {
			http.Error(w, "Invalid request format", http.StatusBadRequest)
			return
		}

		req := wails.GenerateBarcodeRequest{
			Content:  getStringFromMap(reqData, "content"),
			Standard: getStringFromMap(reqData, "standard"),
			Size:     getIntFromMap(reqData, "size"),
			Level:    getStringFromMap(reqData, "level"),
			Format:   getStringFromMap(reqData, "format"),
		}
		result = s.barcodeService.GenerateBarcode(req)
	case "GetQRErrorLevels":
		result = s.barcodeService.GetQRErrorLevels()
	case "GetBarcodeSizes":
		result = s.barcodeService.GetBarcodeSizes()
	case "GetBarcodeStandards":
		result = s.barcodeService.GetBarcodeStandards()
	case "ValidateContent":
		if len(payload.Args) < 2 {
			http.Error(w, "Missing arguments", http.StatusBadRequest)
			return
		}
		content := payload.Args[0].(string)
		standard := payload.Args[1].(string)
		result = s.barcodeService.ValidateContent(content, standard)
	default:
		http.Error(w, fmt.Sprintf("Method not found: %s", method), http.StatusNotFound)
		return
	}

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

// Helper functions for type conversion
func getStringFromMap(m map[string]interface{}, key string) string {
	if val, ok := m[key]; ok {
		if str, ok := val.(string); ok {
			return str
		}
	}
	return ""
}

func getIntFromMap(m map[string]interface{}, key string) int {
	if val, ok := m[key]; ok {
		switch v := val.(type) {
		case int:
			return v
		case float64:
			return int(v)
		}
	}
	return 0
}

func (s *Server) handleDataGeneratorService(method string, w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Args []interface{} `json:"args"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var result interface{}

	switch method {
	case "Generate":
		if len(payload.Args) < 1 {
			http.Error(w, "Missing arguments", http.StatusBadRequest)
			return
		}
		reqData, ok := payload.Args[0].(map[string]interface{})
		if !ok {
			http.Error(w, "Invalid request format", http.StatusBadRequest)
			return
		}

		req := datagenerator.GenerateRequest{
			Template:     getStringFromMap(reqData, "template"),
			BatchCount:   getIntFromMap(reqData, "batchCount"),
			OutputFormat: getStringFromMap(reqData, "outputFormat"),
		}
		if vars, ok := reqData["variables"].(map[string]interface{}); ok {
			req.Variables = vars
		}
		result = s.dataGeneratorService.Generate(req)
	case "GetPresets":
		result = s.dataGeneratorService.GetPresets()
	case "ValidateTemplate":
		if len(payload.Args) < 1 {
			http.Error(w, "Missing arguments", http.StatusBadRequest)
			return
		}
		template := payload.Args[0].(string)
		result = s.dataGeneratorService.ValidateTemplate(template)
	default:
		http.Error(w, fmt.Sprintf("Method not found: %s", method), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (s *Server) handleCodeFormatterService(method string, w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Args []interface{} `json:"args"`
	}

	if err := json.NewDecoder(r.Body).Decode(&payload); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	var result interface{}

	switch method {
	case "Format":
		if len(payload.Args) < 1 {
			http.Error(w, "Missing arguments", http.StatusBadRequest)
			return
		}
		reqData, ok := payload.Args[0].(map[string]interface{})
		if !ok {
			http.Error(w, "Invalid request format", http.StatusBadRequest)
			return
		}

		req := codeformatter.FormatRequest{
			Input:      getStringFromMap(reqData, "input"),
			FormatType: getStringFromMap(reqData, "formatType"),
			Filter:     getStringFromMap(reqData, "filter"),
			Minify:     getBoolFromMap(reqData, "minify"),
		}
		result = s.codeFormatterService.Format(req)
	default:
		http.Error(w, fmt.Sprintf("Method not found: %s", method), http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func getBoolFromMap(m map[string]interface{}, key string) bool {
	if val, ok := m[key]; ok {
		if b, ok := val.(bool); ok {
			return b
		}
	}
	return false
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
		w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")

		if r.Method == "OPTIONS" {
			return
		}

		next.ServeHTTP(w, r)
	})
}

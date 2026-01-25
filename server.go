package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
)

// Server represents the HTTP server for Web Mode
type Server struct {
	jwtService *JWTService
}

// NewServer creates a new Server instance
func NewServer(jwtService *JWTService) *Server {
	return &Server{
		jwtService: jwtService,
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
	var service, method string
	fmt.Sscanf(r.URL.Path, "/api/%s/%s", &service, &method)

	// Since we are doing a generic scan, we might get "JWTService/Decode" or similar
	// Simple lookup for demo purposes
	if service == "JWTService" {
		s.handleJWTService(method, w, r)
		return
	}

	http.Error(w, fmt.Sprintf("Service not found: %s", service), http.StatusNotFound)
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

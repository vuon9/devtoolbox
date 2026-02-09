package main

import (
	"devtoolbox/pkg/router"
	"devtoolbox/service"
	"fmt"
	"net/http"
)

func main() {
	fmt.Println("Starting HTTP server with frontend...")

	// Create services
	jwtSvc := service.NewJWTService(nil)
	conversionSvc := service.NewConversionService(nil)
	barcodeSvc := service.NewBarcodeService(nil)
	dataGenSvc := service.NewDataGeneratorService(nil)
	codeFmtSvc := service.NewCodeFormatterService(nil)
	dateTimeSvc := service.NewDateTimeService(nil)

	// Create server
	server := router.NewServer()

	// Register services
	fmt.Println("Registering services...")
	server.Register(jwtSvc)
	server.Register(conversionSvc)
	server.Register(barcodeSvc)
	server.Register(dataGenSvc)
	server.Register(codeFmtSvc)
	server.Register(dateTimeSvc)
	fmt.Println("Services registered successfully!")

	// Get the gin engine and add static file serving
	engine := server.Engine()

	// Serve static files from the dist directory
	engine.StaticFS("/", http.Dir("frontend/dist"))

	// Also serve assets
	engine.StaticFS("/assets", http.Dir("frontend/dist/assets"))

	// Start server
	fmt.Println("Starting HTTP server on port 8081...")
	fmt.Println("Open browser: http://localhost:8081")
	fmt.Println("Press Ctrl+C to stop")

	if err := engine.Run(":8081"); err != nil {
		fmt.Printf("Server error: %v\n", err)
	}
}

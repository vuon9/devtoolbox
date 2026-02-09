package main

import (
	"devtoolbox/pkg/router"
	"devtoolbox/service"
	"fmt"
	"time"
)

func main() {
	fmt.Println("Starting HTTP server test...")

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

	// Start server
	fmt.Println("Starting HTTP server on port 8081...")
	go func() {
		if err := server.Start(8081); err != nil {
			fmt.Printf("Server error: %v\n", err)
		}
	}()

	// Wait for server to start
	time.Sleep(2 * time.Second)
	fmt.Println("Server should be running on http://localhost:8081")
	fmt.Println("Test with: curl http://localhost:8081/health")
	fmt.Println("Press Ctrl+C to stop")

	// Keep running
	select {}
}

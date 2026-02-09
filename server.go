package main

import (
	"devtoolbox/pkg/router"
	"devtoolbox/service"
)

// StartHTTPServer starts the HTTP server with all services registered
func StartHTTPServer(port int) {
	// Create services
	jwtSvc := service.NewJWTService(nil)
	conversionSvc := service.NewConversionService(nil)
	barcodeSvc := service.NewBarcodeService(nil)
	dataGenSvc := service.NewDataGeneratorService(nil)
	codeFmtSvc := service.NewCodeFormatterService(nil)
	dateTimeSvc := service.NewDateTimeService(nil)

	// Create server and register services
	server := router.NewServer()
	server.Register(jwtSvc)
	server.Register(conversionSvc)
	server.Register(barcodeSvc)
	server.Register(dataGenSvc)
	server.Register(codeFmtSvc)
	server.Register(dateTimeSvc)

	// Start server
	server.Start(port)
}

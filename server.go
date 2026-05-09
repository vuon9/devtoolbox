package main

import (
	"devtoolbox/pkg/router"
	"devtoolbox/service"
)

// StartHTTPServer starts the HTTP server with all services registered
func StartHTTPServer(port int) {
	// Create services
	jwtSvc := service.NewJWTService(nil)
	encrypterSvc := service.NewEncrypterService(nil)
	encoderSvc := service.NewEncoderService(nil)
	hashGenSvc := service.NewHashGeneratorService(nil)
	codeConvSvc := service.NewCodeConverterService(nil)
	textUtilsSvc := service.NewTextUtilitiesService(nil)
	barcodeSvc := service.NewBarcodeService(nil)
	dataGenSvc := service.NewDataGeneratorService(nil)
	codeFmtSvc := service.NewCodeFormatterService(nil)
	dateTimeSvc := service.NewDateTimeService(nil)
	numberConvSvc := service.NewNumberConverterService(nil)

	// Create server and register services
	server := router.NewServer()
	server.Register(jwtSvc)
	server.Register(encrypterSvc)
	server.Register(encoderSvc)
	server.Register(hashGenSvc)
	server.Register(codeConvSvc)
	server.Register(textUtilsSvc)
	server.Register(barcodeSvc)
	server.Register(dataGenSvc)
	server.Register(codeFmtSvc)
	server.Register(dateTimeSvc)
	server.Register(numberConvSvc)

	// Start server
	server.Start(port)
}

package main

import (
	"os"
	"path/filepath"
	"runtime"

	"devtoolbox/pkg/router"
	"devtoolbox/service"
)

func themesDir() string {
	if runtime.GOOS == "darwin" {
		return filepath.Join(os.Getenv("HOME"), "Library", "Application Support", "DevToolbox", "themes")
	} else if runtime.GOOS == "windows" {
		return filepath.Join(os.Getenv("APPDATA"), "DevToolbox", "themes")
	}
	return filepath.Join(os.Getenv("HOME"), ".config", "devtoolbox", "themes")
}

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
	themesSvc := service.NewThemesService(nil, themesDir())

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
	server.Register(themesSvc)

	// Start server
	server.Start(port)
}

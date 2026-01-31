package main

import (
	"context"
	"embed"

	"github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:dist
var assets embed.FS

func main() {
	// Create instances of the app structures
	app := NewApp()
	jwtService := NewJWTService()
	conversionService := NewConversionService()
	barcodeService := NewBarcodeService()
	dataGeneratorService := NewDataGeneratorService()

	// Start HTTP server for Web Mode (port 8081)
	go func() {
		server := NewServer(jwtService, conversionService, barcodeService, dataGeneratorService)
		server.Start(8081)
	}()

	// Create application with options
	err := wails.Run(&options.App{
		Title:  "dev-toolbox",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			jwtService.startup(ctx)
			conversionService.startup(ctx)
			barcodeService.startup(ctx)
			dataGeneratorService.startup(ctx)
		},
		Bind: []interface{}{
			app,
			jwtService,
			conversionService,
			barcodeService,
			dataGeneratorService,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

package main

import (
	"context"
	"embed"

	"dev-toolbox/internal/wails"

	wails_runtime "github.com/wailsapp/wails/v2"
	"github.com/wailsapp/wails/v2/pkg/options"
	"github.com/wailsapp/wails/v2/pkg/options/assetserver"
)

//go:embed all:dist
var assets embed.FS

func main() {
	// Create instances of the app structures
	app := NewApp()
	jwtService := wails.NewJWTService()
	conversionService := wails.NewConversionService()
	barcodeService := wails.NewBarcodeService()
	dataGeneratorService := wails.NewDataGeneratorService()
	codeFormatterService := wails.NewCodeFormatterService()

	// Start HTTP server for Web Mode (port 8081)
	go func() {
		server := NewServer(jwtService, conversionService, barcodeService, dataGeneratorService, codeFormatterService)
		server.Start(8081)
	}()

	// Create application with options
	err := wails_runtime.Run(&options.App{
		Title:  "dev-toolbox",
		Width:  1024,
		Height: 768,
		AssetServer: &assetserver.Options{
			Assets: assets,
		},
		BackgroundColour: &options.RGBA{R: 27, G: 38, B: 54, A: 1},
		OnStartup: func(ctx context.Context) {
			app.startup(ctx)
			jwtService.Startup(ctx)
			conversionService.Startup(ctx)
			barcodeService.Startup(ctx)
			dataGeneratorService.Startup(ctx)
			codeFormatterService.Startup(ctx)
		},
		Bind: []interface{}{
			app,
			jwtService,
			conversionService,
			barcodeService,
			dataGeneratorService,
			codeFormatterService,
		},
	})

	if err != nil {
		println("Error:", err.Error())
	}
}

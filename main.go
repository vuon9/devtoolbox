package main

import (
	"embed"
	"log"
	"net/http"
	"strings"
	"time"

	inw "devtoolbox/internal/wails"

	"github.com/gin-gonic/gin"
	"github.com/wailsapp/wails/v3/pkg/application"
)

//go:embed all:frontend/dist
var assets embed.FS

func init() {
	// Register a custom event whose associated data type is string.
	// This is not required, but the binding generator will pick up registered events
	// and provide a strongly typed JS/TS API for them.
	application.RegisterEvent[string]("time")
}

func main() {
	ginEngine := gin.New()
	ginEngine.Use(gin.Recovery())
	ginEngine.Use(LoggingMiddleware())

	ginEngine.StaticFS("/static", http.FS(assets))
	ginEngine.GET("/", func(c *gin.Context) {
		file, _ := assets.ReadFile("static/index.html")
		c.Data(http.StatusOK, "text/html; charset=utf-8", file)
	})

	ginEngine.GET("/api/hello", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Hello from Gin API!",
			"time":    time.Now().Format(time.RFC3339),
		})
	})

	// Create application with options
	app := application.New(application.Options{
		Name:        "DevToolbox",
		Description: "Set of tools for daily development",
		Services: []application.Service{
			application.NewService(&GreetService{}),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
		Assets: application.AssetOptions{
			// Handler:    ginEngine,
			// Middleware: GinMiddleware(ginEngine),
			Handler: application.AssetFileServerFS(assets),
		},
	})

	// Register app services
	app.RegisterService(application.NewService(inw.NewJWTService(app)))
	app.RegisterService(application.NewService(inw.NewDateTimeService(app)))
	app.RegisterService(application.NewService(inw.NewConversionService(app)))
	app.RegisterService(application.NewService(inw.NewBarcodeService(app)))
	app.RegisterService(application.NewService(inw.NewDataGeneratorService(app)))
	app.RegisterService(application.NewService(inw.NewCodeFormatterService(app)))

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:  "DevToolbox",
		Width:  1024,
		Height: 768,
		BackgroundColour: application.RGBA{
			Red:   27,
			Green: 38,
			Blue:  54,
			Alpha: 1,
		},
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 50,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHiddenInset,
		},
		URL: "/",
	})

	if err := app.Run(); err != nil {
		panic(err)
	}
}

func GinMiddleware(ginEngine *gin.Engine) application.Middleware {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if strings.HasPrefix(r.URL.Path, "/wails") {
				next.ServeHTTP(w, r)
				return
			}

			ginEngine.ServeHTTP(w, r)
		})
	}
}

func LoggingMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// Start timer
		startTime := time.Now()

		// Process request
		c.Next()

		// Calculate latency
		latency := time.Since(startTime)

		// Log request details
		log.Printf("[GIN] %s | %s | %s | %d | %s",
			c.Request.Method,
			c.Request.URL.Path,
			c.ClientIP(),
			c.Writer.Status(),
			latency,
		)
	}
}

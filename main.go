package main

import (
	"devtoolbox/internal/settings"
	"devtoolbox/service"
	"embed"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/wailsapp/wails/v3/pkg/application"
	"github.com/wailsapp/wails/v3/pkg/events"
)

//go:embed all:frontend/dist
var assets embed.FS

func init() {
	// Register a custom event whose associated data type is string.
	// This is not required, but the binding generator will pick up registered events
	// and provide a strongly typed JS/TS API for them.
	application.RegisterEvent[string]("time")

	// Register event for command palette - emit empty string as data
	application.RegisterEvent[string]("command-palette:open")
	application.RegisterEvent[string]("window:toggle")
	application.RegisterEvent[string]("app:quit")

	// Register settings changed event
	application.RegisterEvent[map[string]interface{}]("settings:changed")

	// Register spotlight events
	application.RegisterEvent[string]("spotlight:opened")
	application.RegisterEvent[string]("spotlight:closed")
	application.RegisterEvent[string]("spotlight:command-selected") // Event triggered when user selects a command from spotlight - used for navigation from spotlight to main window
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
			ApplicationShouldTerminateAfterLastWindowClosed: false,
		},
		Assets: application.AssetOptions{
			// Handler:    ginEngine,
			// Middleware: GinMiddleware(ginEngine),
			Handler: application.AssetFileServerFS(assets),
		},
	})

	// Initialize settings manager
	var configDir string
	if runtime.GOOS == "darwin" {
		configDir = filepath.Join(os.Getenv("HOME"), "Library", "Application Support", "DevToolbox")
	} else if runtime.GOOS == "windows" {
		configDir = filepath.Join(os.Getenv("APPDATA"), "DevToolbox")
	} else {
		configDir = filepath.Join(os.Getenv("HOME"), ".config", "devtoolbox")
	}

	settingsManager := settings.NewManager(configDir)
	if err := settingsManager.Load(); err != nil {
		log.Printf("Failed to load settings: %v", err)
	}

	// Register app services
	app.RegisterService(application.NewService(service.NewJWTService(app)))
	app.RegisterService(application.NewService(service.NewDateTimeService(app)))
	app.RegisterService(application.NewService(service.NewConversionService(app)))
	app.RegisterService(application.NewService(service.NewBarcodeService(app)))
	app.RegisterService(application.NewService(service.NewDataGeneratorService(app)))
	app.RegisterService(application.NewService(service.NewCodeFormatterService(app)))
	app.RegisterService(application.NewService(service.NewSettingsService(app, settingsManager)))

	// Create and register spotlight service
	spotlightService := service.NewSpotlightService(app)
	app.RegisterService(application.NewService(spotlightService))

	// WindowControls service must be registered after main window creation (see line 149)

	// Start HTTP server for browser support (background)
	go func() {
		StartHTTPServer(8081)
	}()

	// Create main window
	mainWindow := app.Window.NewWithOptions(application.WebviewWindowOptions{
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

	// Handle window close - minimize to tray or quit based on setting
	mainWindow.OnWindowEvent(events.Common.WindowClosing, func(event *application.WindowEvent) {
		closeMinimizes := settingsManager.GetCloseMinimizesToTray()
		log.Printf("WindowClosing event triggered. Close minimizes to tray: %v", closeMinimizes)
		if closeMinimizes {
			// Prevent the window from closing
			event.Cancel()
			log.Println("Window close cancelled, hiding window instead")
			// Hide the window instead
			mainWindow.Hide()
			log.Println("Window hidden")
		} else {
			log.Println("Window close allowed (setting is disabled)")
		}
	})

	// Register WindowControls service after window creation
	app.RegisterService(application.NewService(service.NewWindowControls(mainWindow)))

	// Create spotlight window with special behaviors
	// Note: MacWindowLevelFloating and ActivationPolicyAccessory may require
	// platform-specific code. CollectionBehaviors provide most spotlight functionality.
	spotlightWindow := app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:     "DevToolbox Spotlight",
		Width:     640,
		Height:    480,
		Frameless: true, // Hide window controls (close/minimize/maximize buttons)
		BackgroundColour: application.RGBA{
			Red:   27,
			Green: 38,
			Blue:  54,
			Alpha: 220, // ~86% opacity for better transparency
		},
		Mac: application.MacWindow{
			InvisibleTitleBarHeight: 0,
			Backdrop:                application.MacBackdropTranslucent,
			TitleBar:                application.MacTitleBarHidden,
			// Collection behaviors for Spotlight-like functionality:
			// - CanJoinAllSpaces: Appears on all Spaces (virtual desktops)
			// - FullScreenAuxiliary: Can overlay fullscreen apps
			// - Transient: Temporary window, doesn't affect window order
			CollectionBehavior: application.MacWindowCollectionBehaviorCanJoinAllSpaces |
				application.MacWindowCollectionBehaviorFullScreenAuxiliary |
				application.MacWindowCollectionBehaviorTransient,
		},
		Windows: application.WindowsWindow{
			HiddenOnTaskbar: true, // Hide from taskbar for tool window behavior
		},
		Hidden: true,
		URL:    "/spotlight",
	})

	// Set the window in spotlight service
	spotlightService.SetWindow(spotlightWindow)

	// Handle spotlight window close - hide instead of close
	spotlightWindow.OnWindowEvent(events.Common.WindowClosing, func(event *application.WindowEvent) {
		event.Cancel()
		spotlightWindow.Hide()
		spotlightWindow.EmitEvent("spotlight:closed", "")
	})

	// Listen for spotlight navigation events
	app.Event.On("spotlight:command-selected", func(event *application.CustomEvent) {
		path := event.Data.(string)
		log.Printf("Spotlight command selected: %s", path)

		// Show and focus main window
		mainWindow.Show()
		mainWindow.Focus()

		// Emit navigation event to frontend
		mainWindow.EmitEvent("navigate:to", path)
	})

	// Listen for close request from spotlight
	app.Event.On("spotlight:closed", func(event *application.CustomEvent) {
		spotlightWindow.Hide()
	})

	// Listen for system commands from spotlight
	app.Event.On("theme:toggle", func(event *application.CustomEvent) {
		mainWindow.EmitEvent("theme:toggle", "")
	})

	app.Event.On("window:toggle", func(event *application.CustomEvent) {
		if mainWindow.IsVisible() {
			mainWindow.Hide()
		} else {
			mainWindow.Show()
			mainWindow.Focus()
		}
	})

	app.Event.On("app:quit", func(event *application.CustomEvent) {
		app.Quit()
	})

	// Setup system tray
	systray := app.SystemTray.New()

	// Create tray menu
	trayMenu := app.NewMenu()
	trayMenu.Add("Show DevToolbox").OnClick(func(ctx *application.Context) {
		log.Println("Tray menu 'Show DevToolbox' clicked")
		log.Printf("Window visible: %v, minimized: %v", mainWindow.IsVisible(), mainWindow.IsMinimised())

		// On macOS, we need to activate the app first before showing the window
		log.Println("Activating application")
		app.Show()

		// On macOS, we need to handle hidden windows differently
		if !mainWindow.IsVisible() {
			log.Println("Window is not visible, showing it")
			mainWindow.Show()
		}

		if mainWindow.IsMinimised() {
			log.Println("Restoring minimized window")
			mainWindow.Restore()
		}

		log.Println("Focusing window")
		mainWindow.Focus()
		log.Printf("After show - Window visible: %v, minimized: %v", mainWindow.IsVisible(), mainWindow.IsMinimised())
	})
	trayMenu.Add("Open Spotlight (Cmd+Ctrl+M)").OnClick(func(ctx *application.Context) {
		log.Println("Tray menu 'Open Spotlight' clicked")
		spotlightService.Toggle()
	})
	trayMenu.AddSeparator()
	trayMenu.Add("Quit").OnClick(func(ctx *application.Context) {
		app.Quit()
	})
	systray.SetMenu(trayMenu)

	// Register global hotkey for command palette
	// macOS: Cmd+Ctrl+M, Windows/Linux: Ctrl+Alt+M
	var hotkeyAccelerator string
	if runtime.GOOS == "darwin" {
		hotkeyAccelerator = "Cmd+Ctrl+M"
	} else {
		hotkeyAccelerator = "Ctrl+Alt+M"
	}

	app.KeyBinding.Add(hotkeyAccelerator, func(window application.Window) {
		spotlightService.Toggle()
	})
	// Note: Wails v3 doesn't return an error from KeyBinding.Add - errors are logged internally

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

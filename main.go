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
	"github.com/wailsapp/wails/v3/pkg/icons"
	"golang.design/x/hotkey"
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
	application.RegisterEvent[string]("spotlight:closed")
	application.RegisterEvent[string]("spotlight:close")
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
		Name:   "main",
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
			Backdrop: application.MacBackdropTranslucent,
			TitleBar: application.MacTitleBar{
				AppearsTransparent: false,
				Hide:               false,
			},
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
		Title:            "Spotlight",
		Width:            640,
		Height:           480,
		MinHeight:        480,
		MaxHeight:        480,
		Frameless:        true,
		Hidden:           true,
		BackgroundColour: application.RGBA{Red: 22, Green: 22, Blue: 22, Alpha: 255},
		// Center the window
		InitialPosition: application.WindowCentered,
		// Prevent resizing
		DisableResize: true,
		Mac: application.MacWindow{
			// Combine multiple behaviors using bitwise OR:
			// - CanJoinAllSpaces: window appears on ALL Spaces (virtual desktops)
			// - FullScreenAuxiliary: window can overlay fullscreen applications
			CollectionBehavior: application.MacWindowCollectionBehaviorCanJoinAllSpaces |
				application.MacWindowCollectionBehaviorFullScreenAuxiliary,
			// Float above other windows
			WindowLevel: application.MacWindowLevelFloating,
			// Hidden title bar for clean look
			TitleBar: application.MacTitleBar{
				AppearsTransparent: true,
				Hide:               true,
			},
		},
		URL: "/spotlight",
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
		log.Printf("[Spotlight] Received command-selected event with data: %#v", event.Data)

		var path string
		switch v := event.Data.(type) {
		case string:
			path = v
		case []interface{}:
			if len(v) > 0 {
				path, _ = v[0].(string)
			}
		case map[string]interface{}:
			if p, ok := v["path"].(string); ok {
				path = p
			} else if d, ok := v["data"].(string); ok {
				path = d
			}
		}

		if path == "" {
			log.Printf("[Spotlight] Command selected with empty path")
			return
		}

		log.Printf("[Spotlight] Navigating main window to: %s", path)

		// Switch to main app context
		mainWindow.Show()
		mainWindow.Focus()

		// Hide spotlight window asynchronously to prevent macOS from reverting focus
		// to the previously active non-DevToolbox app
		go func() {
			time.Sleep(100 * time.Millisecond)
			spotlightWindow.Hide()
		}()

		// Tell the frontend to navigate
		mainWindow.EmitEvent("navigate:to", path)
	})

	// Close spotlight window
	app.Event.On("spotlight:close", func(_ *application.CustomEvent) {
		log.Printf("[Spotlight] Spotlight close requested")
		spotlightWindow.Hide()
	})

	// Proxy these events to the main window
	app.Event.On("spotlight:theme:toggle", func(_ *application.CustomEvent) {
		log.Printf("[Spotlight] Relaying theme:toggle to main window")
		mainWindow.EmitEvent("theme:toggle", nil)
	})

	app.Event.On("window:toggle", func(_ *application.CustomEvent) {
		log.Printf("[Spotlight] Window toggle requested")
		if mainWindow.IsVisible() {
			mainWindow.Hide()
		} else {
			mainWindow.Show()
			mainWindow.Focus()
		}
	})

	app.Event.On("app:quit", func(_ *application.CustomEvent) {
		log.Printf("[Spotlight] App quit requested via spotlight")
		app.Quit()
	})

	// Setup system tray
	systray := app.SystemTray.New()

	// Set system tray icon
	if runtime.GOOS == "darwin" {
		systray.SetTemplateIcon(icons.SystrayMacTemplate)
	} else {
		systray.SetDarkModeIcon(icons.SystrayDark)
		systray.SetIcon(icons.SystrayLight)
	}

	// Create tray menu
	trayMenu := app.NewMenu()
	trayMenu.Add("Show DevToolbox").OnClick(func(ctx *application.Context) {
		log.Println("Tray menu 'Show DevToolbox' clicked")
		if !mainWindow.IsVisible() {
			mainWindow.Show()
		}
		if mainWindow.IsMinimised() {
			mainWindow.Restore()
		}
		mainWindow.Focus()
	})
	trayMenu.Add("Open Spotlight (Cmd+Shift+Space)").OnClick(func(ctx *application.Context) {
		log.Println("Tray menu 'Open Spotlight' clicked")
		spotlightService.Toggle()
	})
	trayMenu.AddSeparator()
	trayMenu.Add("Quit").OnClick(func(ctx *application.Context) {
		app.Quit()
	})
	systray.SetMenu(trayMenu)

	// Register global hotkey using golang-design/hotkey for system-wide shortcuts
	go registerGlobalHotkey(spotlightService)

	if err := app.Run(); err != nil {
		panic(err)
	}
}

// registerGlobalHotkey registers a system-wide global hotkey
func registerGlobalHotkey(spotlightService *service.SpotlightService) {
	// Use Cmd+Shift+Space for macOS, Ctrl+Shift+Space for others
	var hk *hotkey.Hotkey
	if runtime.GOOS == "darwin" {
		hk = hotkey.New([]hotkey.Modifier{hotkey.ModCmd, hotkey.ModShift}, hotkey.KeySpace)
	} else {
		hk = hotkey.New([]hotkey.Modifier{hotkey.ModCtrl, hotkey.ModShift}, hotkey.KeySpace)
	}

	log.Printf("Registering global hotkey: %s", hk)

	if err := hk.Register(); err != nil {
		log.Printf("Failed to register hotkey: %v", err)
		return
	}

	log.Println("Global hotkey registered successfully. Press Cmd/Ctrl+Shift+Space to toggle spotlight.")

	// Listen for hotkey events
	for range hk.Keydown() {
		log.Println("Global hotkey pressed, toggling spotlight")
		spotlightService.Toggle()
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

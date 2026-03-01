package service

import (
	"devtoolbox/internal/settings"
	"log"
	"sync"

	"github.com/wailsapp/wails/v3/pkg/application"
)

// SettingsService provides settings management via Wails bindings
type SettingsService struct {
	app     *application.App
	manager *settings.Manager
	mu      sync.RWMutex
}

// NewSettingsService creates a new settings service
func NewSettingsService(app *application.App, manager *settings.Manager) *SettingsService {
	return &SettingsService{
		app:     app,
		manager: manager,
	}
}

// GetCloseMinimizesToTray returns the current setting
func (s *SettingsService) GetCloseMinimizesToTray() bool {
	return s.manager.GetCloseMinimizesToTray()
}

// SetCloseMinimizesToTray updates the setting
func (s *SettingsService) SetCloseMinimizesToTray(value bool) error {
	if err := s.manager.SetCloseMinimizesToTray(value); err != nil {
		log.Printf("Failed to save setting: %v", err)
		return err
	}

	// Emit event to notify frontend that setting changed
	s.app.Event.Emit("settings:changed", map[string]interface{}{
		"setting": "closeMinimizesToTray",
		"value":   value,
	})

	return nil
}

// ToggleCloseMinimizesToTray toggles the setting
func (s *SettingsService) ToggleCloseMinimizesToTray() (bool, error) {
	if err := s.manager.ToggleCloseMinimizesToTray(); err != nil {
		log.Printf("Failed to toggle setting: %v", err)
		return false, err
	}

	value := s.manager.GetCloseMinimizesToTray()

	// Emit event to notify frontend
	s.app.Event.Emit("settings:changed", map[string]interface{}{
		"setting": "closeMinimizesToTray",
		"value":   value,
	})

	return value, nil
}

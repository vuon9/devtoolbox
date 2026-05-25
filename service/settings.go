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

// SetApp connects the service to the Wails app after application creation.
func (s *SettingsService) SetApp(app *application.App) {
	s.app = app
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

	s.emitSettingsChanged("closeMinimizesToTray", value)

	return nil
}

// ToggleCloseMinimizesToTray toggles the setting
func (s *SettingsService) ToggleCloseMinimizesToTray() (bool, error) {
	if err := s.manager.ToggleCloseMinimizesToTray(); err != nil {
		log.Printf("Failed to toggle setting: %v", err)
		return false, err
	}

	value := s.manager.GetCloseMinimizesToTray()

	s.emitSettingsChanged("closeMinimizesToTray", value)

	return value, nil
}

func (s *SettingsService) emitSettingsChanged(setting string, value bool) {
	if s.app == nil {
		return
	}

	s.app.EmitEvent("settings:changed", map[string]interface{}{
		"setting": setting,
		"value":   value,
	})
}

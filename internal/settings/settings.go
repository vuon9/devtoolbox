package settings

import (
	"encoding/json"
	"os"
	"path/filepath"
	"sync"
)

// Settings holds the application settings
type Settings struct {
	CloseMinimizesToTray bool `json:"closeMinimizesToTray"`
}

// Manager handles settings persistence
type Manager struct {
	settings Settings
	path     string
	mu       sync.RWMutex
}

// NewManager creates a new settings manager
func NewManager(configDir string) *Manager {
	return &Manager{
		path: filepath.Join(configDir, "settings.json"),
		settings: Settings{
			CloseMinimizesToTray: true, // Default to true
		},
	}
}

// Load reads settings from disk
func (m *Manager) Load() error {
	m.mu.Lock()
	defer m.mu.Unlock()

	data, err := os.ReadFile(m.path)
	if err != nil {
		if os.IsNotExist(err) {
			// File doesn't exist, use defaults
			return nil
		}
		return err
	}

	return json.Unmarshal(data, &m.settings)
}

// Save writes settings to disk
func (m *Manager) Save() error {
	m.mu.RLock()
	defer m.mu.RUnlock()

	// Ensure directory exists
	dir := filepath.Dir(m.path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return err
	}

	data, err := json.MarshalIndent(m.settings, "", "  ")
	if err != nil {
		return err
	}

	return os.WriteFile(m.path, data, 0644)
}

// GetCloseMinimizesToTray returns the current setting
func (m *Manager) GetCloseMinimizesToTray() bool {
	m.mu.RLock()
	defer m.mu.RUnlock()
	return m.settings.CloseMinimizesToTray
}

// SetCloseMinimizesToTray updates the setting
func (m *Manager) SetCloseMinimizesToTray(value bool) error {
	m.mu.Lock()
	m.settings.CloseMinimizesToTray = value
	m.mu.Unlock()
	return m.Save()
}

// ToggleCloseMinimizesToTray toggles the setting
func (m *Manager) ToggleCloseMinimizesToTray() error {
	m.mu.Lock()
	m.settings.CloseMinimizesToTray = !m.settings.CloseMinimizesToTray
	m.mu.Unlock()

	return m.Save()
}

//go:build !darwin

package main

import "devtoolbox/service"

// registerGlobalHotkey is a no-op on non-darwin platforms
func registerGlobalHotkey(spotlightService *service.SpotlightService) {
	// Global hotkeys are only supported on macOS via golang.design/x/hotkey
}

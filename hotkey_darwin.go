//go:build darwin

package main

import (
	"log"

	"devtoolbox/service"
	"golang.design/x/hotkey"
)

// registerGlobalHotkey registers a system-wide global hotkey
func registerGlobalHotkey(spotlightService *service.SpotlightService) {
	hk := hotkey.New([]hotkey.Modifier{hotkey.ModCmd, hotkey.ModShift}, hotkey.KeySpace)

	log.Printf("Registering global hotkey: %s", hk)

	if err := hk.Register(); err != nil {
		log.Printf("Failed to register hotkey: %v", err)
		return
	}

	log.Println("Global hotkey registered successfully. Press Cmd+Shift+Space to toggle spotlight.")

	// Listen for hotkey events
	for range hk.Keydown() {
		log.Println("Global hotkey pressed, toggling spotlight")
		spotlightService.Toggle()
	}
}

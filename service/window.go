package service

import (
	"github.com/wailsapp/wails/v3/pkg/application"
)

// WindowControls provides window control methods via Wails bindings
type WindowControls struct {
	window *application.WebviewWindow
}

// NewWindowControls creates a new window controls service
func NewWindowControls(window *application.WebviewWindow) *WindowControls {
	return &WindowControls{
		window: window,
	}
}

// Minimise minimises the window
func (wc *WindowControls) Minimise() {
	wc.window.Minimise()
}

// Maximise toggles maximise state
func (wc *WindowControls) Maximise() {
	if wc.window.IsMaximised() {
		wc.window.UnMaximise()
	} else {
		wc.window.Maximise()
	}
}

// Close closes the window (this will trigger WindowClosing event)
func (wc *WindowControls) Close() {
	wc.window.Close()
}

// Show shows the window
func (wc *WindowControls) Show() {
	wc.window.Show()
}

// Hide hides the window
func (wc *WindowControls) Hide() {
	wc.window.Hide()
}

// IsVisible returns whether the window is visible
func (wc *WindowControls) IsVisible() bool {
	return wc.window.IsVisible()
}

// IsMinimised returns whether the window is minimised
func (wc *WindowControls) IsMinimised() bool {
	return wc.window.IsMinimised()
}

// Restore restores the window from minimised/maximised state
func (wc *WindowControls) Restore() {
	wc.window.Restore()
}

// Focus focuses the window
func (wc *WindowControls) Focus() {
	wc.window.Focus()
}

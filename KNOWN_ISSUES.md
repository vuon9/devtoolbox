# Known Issues

## macOS: Tray "Show DevToolbox" doesn't restore hidden window

**GitHub Issue:** [#51](https://github.com/vuon9/devtoolbox/issues/51)  
**Status:** Open  
**Platform:** macOS only  
**Severity:** Medium  
**Component:** System Tray / Window Management

### Description
When the window is hidden to the system tray (via close button with "Close minimizes to tray" setting enabled), clicking "Show DevToolbox" from the tray menu does not restore the window.

### Steps to Reproduce
1. Enable "Close button minimizes to tray" in Settings
2. Click the window's close button (X)
3. Window hides to tray (app continues running)
4. Click the tray icon and select "Show DevToolbox"
5. Window does not appear (logs show `Window visible: false`)

### Expected Behavior
Window should be restored and shown when clicking "Show DevToolbox" from the tray menu.

### Actual Behavior
Window remains hidden. Logs show:
```
Tray menu 'Show DevToolbox' clicked
Window visible: false, minimized: false
Activating application
Window is not visible, showing it
Focusing window
After show - Window visible: false, minimized: false
```

### Technical Details
The current implementation attempts:
1. `app.Show()` - calls `[NSApp unhide:nil]` to activate the app
2. `mainWindow.Show()` - show the window
3. `mainWindow.Focus()` - focus the window

However, on macOS, when a window is hidden via `Hide()` (which calls `[window orderOut:nil]`), the standard `Show()` and `Focus()` methods are insufficient to restore it.

### Potential Solutions

1. **Use `AttachedWindow` pattern** (recommended by Wails docs):
   - Attach the window to the system tray
   - Let Wails handle the show/hide toggle automatically
   - This is the built-in mechanism for tray-attached windows

2. **Platform-specific handling**:
   - On macOS, may need to use `makeKeyAndOrderFront` directly
   - Or use different window state management

3. **Window state tracking**:
   - Instead of `Hide()`, minimize the window
   - `Minimise()` + `Restore()` works correctly on macOS

### References
- Wails v3 System Tray docs: https://v3alpha.wails.io/features/menus/systray/
- Wails v3 Window docs: https://v3alpha.wails.io/reference/window/
- Related code: `main.go` tray menu click handler

### Workaround
Users can use the global hotkey `Cmd+Ctrl+M` to open the command palette, which will also show the window.

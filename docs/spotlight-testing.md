# Spotlight Command Palette Testing Guide

## Manual Testing Checklist

### Basic Functionality
- [ ] Press `Cmd+Ctrl+M` (macOS) or `Ctrl+Alt+M` (Windows/Linux) opens spotlight
- [ ] Spotlight window appears centered on screen
- [ ] Spotlight has translucent backdrop
- [ ] Typing filters commands
- [ ] Arrow keys navigate the list
- [ ] Enter selects a command
- [ ] Escape closes spotlight

### Navigation
- [ ] Selecting a tool command opens main window and navigates
- [ ] Selecting "Toggle Dark Mode" toggles theme
- [ ] Selecting "Show/Hide Main Window" toggles visibility
- [ ] Selecting "Quit DevToolbox" quits app

### macOS-Specific Features
- [ ] Spotlight appears on all Spaces
- [ ] Spotlight overlays fullscreen apps

### Recent Commands
- [ ] Recently used commands appear at top
- [ ] Recent commands persist across restarts

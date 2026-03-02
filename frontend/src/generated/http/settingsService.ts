// HTTP client for SettingsService
// For browser testing - settings are not persisted in browser mode

export function GetCloseMinimizesToTray(): Promise<boolean> {
  // Default to true in browser mode
  return Promise.resolve(true);
}

export function SetCloseMinimizesToTray(_value: boolean): Promise<void> {
  // No-op in browser mode
  return Promise.resolve();
}

export function ToggleCloseMinimizesToTray(): Promise<boolean> {
  // No-op in browser mode, return default
  return Promise.resolve(true);
}

// Auto-generated Wails client for SettingsService
// This file is auto-generated. DO NOT EDIT.

import { SettingsService } from '../../../bindings/devtoolbox/service';

export function GetCloseMinimizesToTray(): Promise<boolean> {
  return SettingsService.GetCloseMinimizesToTray();
}

export function SetCloseMinimizesToTray(value: boolean): Promise<void> {
  return SettingsService.SetCloseMinimizesToTray(value);
}

export function ToggleCloseMinimizesToTray(): Promise<boolean> {
  return SettingsService.ToggleCloseMinimizesToTray();
}

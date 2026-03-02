// Auto-generated Wails client for WindowControls
// This file is auto-generated. DO NOT EDIT.

import { WindowControls } from '../../../bindings/devtoolbox/service';

export function Minimise(): Promise<void> {
  return WindowControls.Minimise();
}

export function Maximise(): Promise<void> {
  return WindowControls.Maximise();
}

export function Close(): Promise<void> {
  return WindowControls.Close();
}

export function Show(): Promise<void> {
  return WindowControls.Show();
}

export function Hide(): Promise<void> {
  return WindowControls.Hide();
}

export function IsVisible(): Promise<boolean> {
  return WindowControls.IsVisible();
}

export function IsMinimised(): Promise<boolean> {
  return WindowControls.IsMinimised();
}

export function Restore(): Promise<void> {
  return WindowControls.Restore();
}

export function Focus(): Promise<void> {
  return WindowControls.Focus();
}

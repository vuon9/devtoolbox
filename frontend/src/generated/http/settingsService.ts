// Auto-generated HTTP client for SettingsService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';



export async function GetCloseMinimizesToTray(): Promise<boolean> {
  let body;
  body = '{}';
  
  
  const response = await fetch(`${API_BASE}/api/settings-service/get-close-minimizes-to-tray`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function SetCloseMinimizesToTray(value: boolean): Promise<string> {
  let body;
  
  body = JSON.stringify({ value: value });
  
  const response = await fetch(`${API_BASE}/api/settings-service/set-close-minimizes-to-tray`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function ToggleCloseMinimizesToTray(): Promise<boolean> {
  let body;
  body = '{}';
  
  
  const response = await fetch(`${API_BASE}/api/settings-service/toggle-close-minimizes-to-tray`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


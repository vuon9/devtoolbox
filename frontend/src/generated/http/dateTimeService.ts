// Auto-generated HTTP client for DateTimeService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export async function Convert(req: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/date-time-service/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function GetPresets(): Promise<any> {
  const response = await fetch(`${API_BASE}/api/date-time-service/get-presets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function CalculateDelta(req: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/date-time-service/calculate-delta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req)
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function GetAvailableTimezones(): Promise<any> {
  const response = await fetch(`${API_BASE}/api/date-time-service/get-available-timezones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

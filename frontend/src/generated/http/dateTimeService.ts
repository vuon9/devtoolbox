// Auto-generated HTTP client for DateTimeService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';


export async function ServiceStartup(ctx: context.Context, options: application.ServiceOptions): Promise<error> {
  const response = await fetch(`${API_BASE}/api/DateTimeService/ServiceStartup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ctx, options })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function Convert(req: datetimeconverter.ConvertRequest): Promise<datetimeconverter.ConvertResponse> {
  const response = await fetch(`${API_BASE}/api/DateTimeService/Convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ req })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function GetPresets(): Promise<datetimeconverter.PresetsResponse> {
  const response = await fetch(`${API_BASE}/api/DateTimeService/GetPresets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({  })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function CalculateDelta(req: datetimeconverter.DeltaRequest): Promise<datetimeconverter.DeltaResponse> {
  const response = await fetch(`${API_BASE}/api/DateTimeService/CalculateDelta`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ req })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function GetAvailableTimezones(): Promise<datetimeconverter.AvailableTimezonesResponse> {
  const response = await fetch(`${API_BASE}/api/DateTimeService/GetAvailableTimezones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({  })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


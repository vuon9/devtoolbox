// Auto-generated HTTP client for DataGeneratorService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';


export async function ServiceStartup(ctx: context.Context, options: application.ServiceOptions): Promise<error> {
  const response = await fetch(`${API_BASE}/api/DataGeneratorService/ServiceStartup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ctx, options })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function Generate(req: datagenerator.GenerateRequest): Promise<datagenerator.GenerateResponse> {
  const response = await fetch(`${API_BASE}/api/DataGeneratorService/Generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ req })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function GetPresets(): Promise<datagenerator.PresetsResponse> {
  const response = await fetch(`${API_BASE}/api/DataGeneratorService/GetPresets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({  })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function ValidateTemplate(template: string): Promise<datagenerator.ValidationResult> {
  const response = await fetch(`${API_BASE}/api/DataGeneratorService/ValidateTemplate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ template })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


// Auto-generated HTTP client for DataGeneratorService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export async function Generate(req: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/data-generator-service/generate`, {
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
  const response = await fetch(`${API_BASE}/api/data-generator-service/get-presets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function ValidateTemplate(template: string): Promise<any> {
  const response = await fetch(`${API_BASE}/api/data-generator-service/validate-template`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ value: template })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

// Auto-generated HTTP client for BarcodeService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';


export async function ServiceStartup(ctx: context.Context, options: application.ServiceOptions): Promise<error> {
  const response = await fetch(`${API_BASE}/api/BarcodeService/ServiceStartup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ctx, options })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function GenerateBarcode(req: barcode.GenerateBarcodeRequest): Promise<barcode.GenerateBarcodeResponse> {
  const response = await fetch(`${API_BASE}/api/BarcodeService/GenerateBarcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ req })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function GetBarcodeStandards(): Promise<> {
  const response = await fetch(`${API_BASE}/api/BarcodeService/GetBarcodeStandards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({  })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function GetQRErrorLevels(): Promise<> {
  const response = await fetch(`${API_BASE}/api/BarcodeService/GetQRErrorLevels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({  })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function GetBarcodeSizes(): Promise<> {
  const response = await fetch(`${API_BASE}/api/BarcodeService/GetBarcodeSizes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({  })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function ValidateContent(content: string, standard: string): Promise<> {
  const response = await fetch(`${API_BASE}/api/BarcodeService/ValidateContent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, standard })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


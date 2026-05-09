// Auto-generated HTTP client for BarcodeService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';



export async function GenerateBarcode(req: any): Promise<any> {
  let body;
  
  body = JSON.stringify(req);
  
  const response = await fetch(`${API_BASE}/api/barcode-service/generate-barcode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function GetBarcodeStandards(): Promise<any[]> {
  let body;
  body = '{}';
  
  
  const response = await fetch(`${API_BASE}/api/barcode-service/get-barcode-standards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function GetQRErrorLevels(): Promise<any[]> {
  let body;
  body = '{}';
  
  
  const response = await fetch(`${API_BASE}/api/barcode-service/get-qr-error-levels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function GetBarcodeSizes(): Promise<any[]> {
  let body;
  body = '{}';
  
  
  const response = await fetch(`${API_BASE}/api/barcode-service/get-barcode-sizes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function ValidateContent(content: string, standard: string): Promise<Record<string, any>> {
  let body;
  
  
  body = JSON.stringify({ arg0: content, arg1: standard, });
  const response = await fetch(`${API_BASE}/api/barcode-service/validate-content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


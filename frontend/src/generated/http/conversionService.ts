// Auto-generated HTTP client for ConversionService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';

export async function Convert(input: string, category: string, method: string, config: any): Promise<any> {
  const response = await fetch(`${API_BASE}/api/conversion-service/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ arg0: input, arg1: category, arg2: method, arg3: config })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

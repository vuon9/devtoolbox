// Auto-generated HTTP client for CodeConverterService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';



export async function Convert(input: string, method: string): Promise<string> {
  let body;
  
  
  body = JSON.stringify({ arg0: input, arg1: method, });
  const response = await fetch(`${API_BASE}/api/code-converter-service/convert`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


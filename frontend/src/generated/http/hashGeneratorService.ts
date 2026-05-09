// Auto-generated HTTP client for HashGeneratorService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';



export async function Hash(input: string, method: string, config: Record<string, any>): Promise<string> {
  let body;
  
  
  body = JSON.stringify({ arg0: input, arg1: method, arg2: config, });
  const response = await fetch(`${API_BASE}/api/hash-generator-service/hash`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function HashAll(input: string): Promise<Record<string, any>> {
  let body;
  
  body = JSON.stringify({ value: input });
  
  const response = await fetch(`${API_BASE}/api/hash-generator-service/hash-all`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


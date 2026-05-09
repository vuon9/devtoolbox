// Auto-generated HTTP client for EncrypterService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';



export async function Encrypt(input: string, method: string, key: string, iv: string): Promise<string> {
  let body;
  
  
  body = JSON.stringify({ arg0: input, arg1: method, arg2: key, arg3: iv, });
  const response = await fetch(`${API_BASE}/api/encrypter-service/encrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function Decrypt(input: string, method: string, key: string, iv: string): Promise<string> {
  let body;
  
  
  body = JSON.stringify({ arg0: input, arg1: method, arg2: key, arg3: iv, });
  const response = await fetch(`${API_BASE}/api/encrypter-service/decrypt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


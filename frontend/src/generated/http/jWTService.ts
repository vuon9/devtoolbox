// Auto-generated HTTP client for JWTService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';



export async function Decode(token: string): Promise<any> {
  let body;
  
  body = JSON.stringify({ value: token });
  
  const response = await fetch(`${API_BASE}/api/jwt-service/decode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function Verify(token: string, secret: string, encoding: string): Promise<any> {
  let body;
  
  
  body = JSON.stringify({ arg0: token, arg1: secret, arg2: encoding, });
  const response = await fetch(`${API_BASE}/api/jwt-service/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function Encode(headerJSON: string, payloadJSON: string, algorithm: string, secret: string): Promise<any> {
  let body;
  
  
  body = JSON.stringify({ arg0: headerJSON, arg1: payloadJSON, arg2: algorithm, arg3: secret, });
  const response = await fetch(`${API_BASE}/api/jwt-service/encode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


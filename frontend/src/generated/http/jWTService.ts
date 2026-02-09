// Auto-generated HTTP client for JWTService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';


export async function ServiceStartup(ctx: context.Context, options: application.ServiceOptions): Promise<error> {
  const response = await fetch(`${API_BASE}/api/JWTService/ServiceStartup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ctx, options })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function Decode(token: string): Promise<jwt.DecodeResponse> {
  const response = await fetch(`${API_BASE}/api/JWTService/Decode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function Verify(token: string, secret: string, encoding: string): Promise<jwt.VerifyResponse> {
  const response = await fetch(`${API_BASE}/api/JWTService/Verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, secret, encoding })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function Encode(headerJSON: string, payloadJSON: string, algorithm: string, secret: string): Promise<jwt.EncodeResponse> {
  const response = await fetch(`${API_BASE}/api/JWTService/Encode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ headerJSON, payloadJSON, algorithm, secret })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


// Auto-generated HTTP client for EncoderService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';



export async function Encode(input: string, method: string): Promise<string> {
  let body;
  
  
  body = JSON.stringify({ arg0: input, arg1: method, });
  const response = await fetch(`${API_BASE}/api/encoder-service/encode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function Decode(input: string, method: string): Promise<string> {
  let body;
  
  
  body = JSON.stringify({ arg0: input, arg1: method, });
  const response = await fetch(`${API_BASE}/api/encoder-service/decode`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function Escape(input: string, method: string): Promise<string> {
  let body;
  
  
  body = JSON.stringify({ arg0: input, arg1: method, });
  const response = await fetch(`${API_BASE}/api/encoder-service/escape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function Unescape(input: string, method: string): Promise<string> {
  let body;
  
  
  body = JSON.stringify({ arg0: input, arg1: method, });
  const response = await fetch(`${API_BASE}/api/encoder-service/unescape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


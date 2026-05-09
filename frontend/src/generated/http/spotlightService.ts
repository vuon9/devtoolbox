// Auto-generated HTTP client for SpotlightService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';







export async function IsVisible(): Promise<boolean> {
  let body;
  body = '{}';
  
  
  const response = await fetch(`${API_BASE}/api/spotlight-service/is-visible`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}



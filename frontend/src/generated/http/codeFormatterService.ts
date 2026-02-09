// Auto-generated HTTP client for CodeFormatterService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';


export async function ServiceStartup(ctx: context.Context, options: application.ServiceOptions): Promise<error> {
  const response = await fetch(`${API_BASE}/api/CodeFormatterService/ServiceStartup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ctx, options })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}

export async function Format(req: codeformatter.FormatRequest): Promise<codeformatter.FormatResponse> {
  const response = await fetch(`${API_BASE}/api/CodeFormatterService/Format`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ req })
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


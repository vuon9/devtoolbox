// Auto-generated HTTP client for TextUtilitiesService
// This file is auto-generated. DO NOT EDIT.

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8081';



export async function Escape(input: string, method: string): Promise<string> {
  let body;
  
  
  body = JSON.stringify({ arg0: input, arg1: method, });
  const response = await fetch(`${API_BASE}/api/text-utilities-service/escape`, {
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
  const response = await fetch(`${API_BASE}/api/text-utilities-service/unescape`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function SortLines(input: string, reverse: boolean): Promise<string> {
  let body;
  
  
  body = JSON.stringify({ arg0: input, arg1: reverse, });
  const response = await fetch(`${API_BASE}/api/text-utilities-service/sort-lines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function RemoveDuplicates(input: string): Promise<string> {
  let body;
  
  body = JSON.stringify({ value: input });
  
  const response = await fetch(`${API_BASE}/api/text-utilities-service/remove-duplicates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function TrimLines(input: string): Promise<string> {
  let body;
  
  body = JSON.stringify({ value: input });
  
  const response = await fetch(`${API_BASE}/api/text-utilities-service/trim-lines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function RemoveEmptyLines(input: string): Promise<string> {
  let body;
  
  body = JSON.stringify({ value: input });
  
  const response = await fetch(`${API_BASE}/api/text-utilities-service/remove-empty-lines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function ConvertCase(input: string, targetCase: string): Promise<string> {
  let body;
  
  
  body = JSON.stringify({ arg0: input, arg1: targetCase, });
  const response = await fetch(`${API_BASE}/api/text-utilities-service/convert-case`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


export async function GetStats(input: string): Promise<Record<string, any>> {
  let body;
  
  body = JSON.stringify({ value: input });
  
  const response = await fetch(`${API_BASE}/api/text-utilities-service/get-stats`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body
  });
  
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  
  return await response.json();
}


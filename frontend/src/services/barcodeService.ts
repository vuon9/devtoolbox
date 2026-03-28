// Wrapper for BarcodeService that handles both Wails and HTTP mode
// In Wails desktop: use the Wails runtime
// In browser: call HTTP API on port 8081

import { GenerateBarcode as WailsGenerateBarcode } from '../generated/wails/barcodeService';

// HTTP API base URL for browser mode
const HTTP_API_URL = 'http://localhost:8081';

// Check if we're running in Wails desktop mode
const isWailsDesktop = typeof window !== 'undefined' && 
  (window as any).go?.devtoolbox?.service?.WindowControls;

// HTTP client for browser mode
const httpCall = async (serviceName: string, methodName: string, args: Record<string, any>): Promise<any> => {
  // Convert service name to kebab-case (BarcodeService -> barcode-service)
  const kebabService = serviceName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  // Convert method name to kebab-case (GenerateBarcode -> generate-barcode)
  const kebabMethod = methodName.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  
  const url = `${HTTP_API_URL}/api/${kebabService}/${kebabMethod}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(args),
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }
  
  return response.json();
};

export async function GenerateBarcode(req: { content: string; standard: string; size?: number }): Promise<any> {
  if (isWailsDesktop) {
    return WailsGenerateBarcode(req);
  }
  
  // Use HTTP API for browser mode
  // The API expects { content, standard, size } parameters
  console.log('GenerateBarcode request:', req);
  const result = await httpCall('BarcodeService', 'GenerateBarcode', { 
    content: req.content, 
    standard: req.standard,
    size: req.size || 256 
  });
  console.log('GenerateBarcode response:', result);
  return result;
}

export async function GetBarcodeStandards(): Promise<any> {
  if (isWailsDesktop) {
    return (await import('../generated/wails/barcodeService')).GetBarcodeStandards();
  }
  
  return httpCall('BarcodeService', 'GetBarcodeStandards', {});
}

export async function GetQRErrorLevels(): Promise<any> {
  if (isWailsDesktop) {
    return (await import('../generated/wails/barcodeService')).GetQRErrorLevels();
  }
  
  return httpCall('BarcodeService', 'GetQRErrorLevels', {});
}

export async function GetBarcodeSizes(): Promise<any> {
  if (isWailsDesktop) {
    return (await import('../generated/wails/barcodeService')).GetBarcodeSizes();
  }
  
  return httpCall('BarcodeService', 'GetBarcodeSizes', {});
}

export async function ValidateContent(content: string, standard: string): Promise<any> {
  if (isWailsDesktop) {
    return (await import('../generated/wails/barcodeService')).ValidateContent(content, standard);
  }
  
  return httpCall('BarcodeService', 'ValidateContent', { arg0: content, arg1: standard });
}
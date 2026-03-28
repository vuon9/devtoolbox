// JWT Service wrapper - handles both Wails desktop and browser mode
// In Wails desktop: use the Wails runtime
// In browser: call HTTP API on port 8081

import {
  Decode as WailsDecode,
  Encode as WailsEncode,
  Verify as WailsVerify,
} from '../generated/wails/jWTService';

// HTTP API base URL for browser mode
const HTTP_API_URL = 'http://localhost:8081';

// Check if we're running in Wails desktop mode
const isWailsDesktop =
  typeof window !== 'undefined' && (window as any).go?.devtoolbox?.service?.WindowControls;

// HTTP client for browser mode
const httpCall = async (
  serviceName: string,
  methodName: string,
  args: Record<string, any>
): Promise<any> => {
  // JWTService -> jwt-service (simple mapping)
  const serviceMap: Record<string, string> = {
    'JWTService': 'jwt-service',
    'BarcodeService': 'barcode-service',
    'DataGeneratorService': 'data-generator-service',
  };
  const kebabService = serviceMap[serviceName] || serviceName
    .replace(/Service$/, '-service')
    .toLowerCase();
  
  // Decode -> decode
  const kebabMethod = methodName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');

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

export async function Decode(token: string): Promise<any> {
  if (isWailsDesktop) {
    return WailsDecode(token);
  }

  // Single parameter uses "value" field
  return httpCall('JWTService', 'Decode', { value: token });
}

export async function Verify(token: string, secret: string, encoding: string): Promise<any> {
  if (isWailsDesktop) {
    return WailsVerify(token, secret, encoding);
  }

  return httpCall('JWTService', 'Verify', { arg0: token, arg1: secret, arg2: encoding });
}

export async function Encode(
  headerJSON: string,
  payloadJSON: string,
  algorithm: string,
  secret: string
): Promise<any> {
  if (isWailsDesktop) {
    return WailsEncode(headerJSON, payloadJSON, algorithm, secret);
  }

  return httpCall('JWTService', 'Encode', { arg0: headerJSON, arg1: payloadJSON, arg2: algorithm, arg3: secret });
}

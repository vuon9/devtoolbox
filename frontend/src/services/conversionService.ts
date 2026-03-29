// Wrapper for ConversionService that handles both Wails and HTTP mode
// In Wails desktop: use the Wails runtime
// In browser: call HTTP API on port 8081

import { Convert as WailsConvert } from '../generated/wails/conversionService';

// HTTP API base URL for browser mode
const HTTP_API_URL = 'http://localhost:8081';

// Check if we're running in Wails desktop mode
const isWailsDesktop =
  typeof window !== 'undefined' && (window as any).go?.devtoolbox?.service?.WindowControls;

// HTTP client for browser mode
const httpCall = async (serviceName: string, methodName: string, args: any[]): Promise<any> => {
  // Convert service name to kebab-case (ConversionService -> conversion-service)
  const kebabService = serviceName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
  // Convert method name to kebab-case (Convert -> convert)
  const kebabMethod = methodName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');

  const url = `${HTTP_API_URL}/api/${kebabService}/${kebabMethod}`;

  // Build request body based on number of arguments
  let body: any;
  if (args.length === 0) {
    body = {};
  } else if (args.length === 1) {
    body = { value: args[0] };
  } else {
    // Multiple arguments: use arg0, arg1, arg2, etc.
    body = {};
    args.forEach((arg, i) => {
      body[`arg${i}`] = arg;
    });
  }

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
};

export async function Convert(
  input: string,
  category: string,
  method: string,
  config: any
): Promise<any> {
  if (isWailsDesktop) {
    // Use Wails runtime when available
    return WailsConvert(input, category, method, config);
  }

  // Use HTTP API for browser mode
  const result = await httpCall('ConversionService', 'Convert', [input, category, method, config]);

  // Handle error response
  if (result && result.error) {
    throw new Error(result.error);
  }

  return result;
}

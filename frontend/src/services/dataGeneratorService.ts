// Wrapper for DataGeneratorService that handles both Wails and HTTP mode
// In Wails desktop: use the Wails runtime
// In browser: call HTTP API on port 8081

import { Generate as WailsGenerate } from '../generated/wails/dataGeneratorService';

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
  const kebabService = serviceName
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
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

export async function Generate(req: {
  format: string;
  count: number;
  template?: string;
}): Promise<any> {
  // Build the proper request format
  const request = {
    template: req.template || '{{UUID}}', // Default template
    variables: {},
    batchCount: Math.max(1, Math.min(1000, req.count || 10)), // Clamp between 1-1000
    outputFormat: req.format || 'json',
    separator: 'newline',
  };

  if (isWailsDesktop) {
    return WailsGenerate(request);
  }

  // Use HTTP API for browser mode
  const result = await httpCall('DataGeneratorService', 'Generate', request);

  if (result && result.error) {
    throw new Error(result.error);
  }

  return result;
}

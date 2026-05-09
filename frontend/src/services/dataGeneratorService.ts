import { createAdapter } from './transport';

function getWails() {
  return typeof window !== 'undefined' && window.go?.devtoolbox?.service?.DataGeneratorService;
}

export async function Generate(req: {
  format: string;
  count: number;
  template?: string;
}): Promise<any> {
  const request = {
    template: req.template || '{{UUID}}',
    variables: {},
    batchCount: Math.max(1, Math.min(1000, req.count || 10)),
    outputFormat: req.format || 'json',
    separator: 'newline',
  };

  const wails = getWails();
  if (wails) {
    const result = await wails.Generate(request);
    if (result && result.error) throw new Error(result.error);
    return result;
  }

  const httpService = await import('../generated/http/dataGeneratorService');
  const result = await httpService.Generate(request);
  if (result && result.error) throw new Error(result.error);
  return result;
}

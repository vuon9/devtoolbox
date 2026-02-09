// Auto-generated Wails client for ConversionService
// This file is auto-generated. DO NOT EDIT.

import { ConversionService } from '../../../bindings/devtoolbox/service';


export function ServiceStartup(ctx: context.Context, options: application.ServiceOptions): Promise<error> {
  return ConversionService.ServiceStartup(ctx, options);
}

export function Convert(input: string, category: string, method: string, config: ): Promise<string> {
  return ConversionService.Convert(input, category, method, config);
}


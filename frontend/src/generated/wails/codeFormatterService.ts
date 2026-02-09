// Auto-generated Wails client for CodeFormatterService
// This file is auto-generated. DO NOT EDIT.

import { CodeFormatterService } from '../../../bindings/devtoolbox/service';


export function ServiceStartup(ctx: context.Context, options: application.ServiceOptions): Promise<error> {
  return CodeFormatterService.ServiceStartup(ctx, options);
}

export function Format(req: codeformatter.FormatRequest): Promise<codeformatter.FormatResponse> {
  return CodeFormatterService.Format(req);
}


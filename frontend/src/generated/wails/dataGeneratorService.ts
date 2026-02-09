// Auto-generated Wails client for DataGeneratorService
// This file is auto-generated. DO NOT EDIT.

import { DataGeneratorService } from '../../../bindings/devtoolbox/service';


export function ServiceStartup(ctx: context.Context, options: application.ServiceOptions): Promise<error> {
  return DataGeneratorService.ServiceStartup(ctx, options);
}

export function Generate(req: datagenerator.GenerateRequest): Promise<datagenerator.GenerateResponse> {
  return DataGeneratorService.Generate(req);
}

export function GetPresets(): Promise<datagenerator.PresetsResponse> {
  return DataGeneratorService.GetPresets();
}

export function ValidateTemplate(template: string): Promise<datagenerator.ValidationResult> {
  return DataGeneratorService.ValidateTemplate(template);
}


// Auto-generated Wails client for DataGeneratorService
// This file is auto-generated. DO NOT EDIT.

import { DataGeneratorService } from '../../../bindings/devtoolbox/service';

export function Generate(req: any): Promise<any> {
  return DataGeneratorService.Generate(req);
}

export function GetPresets(): Promise<any> {
  return DataGeneratorService.GetPresets();
}

export function ValidateTemplate(template: string): Promise<any> {
  return DataGeneratorService.ValidateTemplate(template);
}

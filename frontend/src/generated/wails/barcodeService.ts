// Auto-generated Wails client for BarcodeService
// This file is auto-generated. DO NOT EDIT.

import { BarcodeService } from '../../../bindings/devtoolbox/service';


export function ServiceStartup(ctx: context.Context, options: application.ServiceOptions): Promise<error> {
  return BarcodeService.ServiceStartup(ctx, options);
}

export function GenerateBarcode(req: barcode.GenerateBarcodeRequest): Promise<barcode.GenerateBarcodeResponse> {
  return BarcodeService.GenerateBarcode(req);
}

export function GetBarcodeStandards(): Promise<> {
  return BarcodeService.GetBarcodeStandards();
}

export function GetQRErrorLevels(): Promise<> {
  return BarcodeService.GetQRErrorLevels();
}

export function GetBarcodeSizes(): Promise<> {
  return BarcodeService.GetBarcodeSizes();
}

export function ValidateContent(content: string, standard: string): Promise<> {
  return BarcodeService.ValidateContent(content, standard);
}


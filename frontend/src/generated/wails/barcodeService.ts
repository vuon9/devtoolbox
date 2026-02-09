// Auto-generated Wails client for BarcodeService
// This file is auto-generated. DO NOT EDIT.

import { BarcodeService } from '../../../bindings/devtoolbox/service';

export function GenerateBarcode(req: any): Promise<any> {
  return BarcodeService.GenerateBarcode(req);
}

export function GetBarcodeStandards(): Promise<any> {
  return BarcodeService.GetBarcodeStandards();
}

export function GetQRErrorLevels(): Promise<any> {
  return BarcodeService.GetQRErrorLevels();
}

export function GetBarcodeSizes(): Promise<any> {
  return BarcodeService.GetBarcodeSizes();
}

export function ValidateContent(content: string, standard: string): Promise<any> {
  return BarcodeService.ValidateContent(content, standard);
}

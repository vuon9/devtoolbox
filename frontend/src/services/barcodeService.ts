import * as httpService from '../generated/http/barcodeService';
import { createAdapter } from './transport';

const _a = createAdapter('BarcodeService', httpService);
export const GenerateBarcode = _a.GenerateBarcode;
export const GetBarcodeStandards = _a.GetBarcodeStandards;
export const GetQRErrorLevels = _a.GetQRErrorLevels;
export const GetBarcodeSizes = _a.GetBarcodeSizes;
export const ValidateContent = _a.ValidateContent;

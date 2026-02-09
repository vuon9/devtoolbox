// Auto-generated unified service facade
// Detects runtime environment and uses appropriate implementation

const isWails = () => {
  return typeof window !== 'undefined' && 
         window.runtime && 
         window.runtime.EventsOn !== undefined;
};

import { BarcodeService as WailsBarcodeService } from './wails/barcodeService';
import { BarcodeService as HTTPBarcodeService } from './http/barcodeService';
import { CodeFormatterService as WailsCodeFormatterService } from './wails/codeFormatterService';
import { CodeFormatterService as HTTPCodeFormatterService } from './http/codeFormatterService';
import { ConversionService as WailsConversionService } from './wails/conversionService';
import { ConversionService as HTTPConversionService } from './http/conversionService';
import { DataGeneratorService as WailsDataGeneratorService } from './wails/dataGeneratorService';
import { DataGeneratorService as HTTPDataGeneratorService } from './http/dataGeneratorService';
import { DateTimeService as WailsDateTimeService } from './wails/dateTimeService';
import { DateTimeService as HTTPDateTimeService } from './http/dateTimeService';
import { JWTService as WailsJWTService } from './wails/jWTService';
import { JWTService as HTTPJWTService } from './http/jWTService';

export const barcodeService = isWails() ? WailsBarcodeService : HTTPBarcodeService;
export const codeFormatterService = isWails() ? WailsCodeFormatterService : HTTPCodeFormatterService;
export const conversionService = isWails() ? WailsConversionService : HTTPConversionService;
export const dataGeneratorService = isWails() ? WailsDataGeneratorService : HTTPDataGeneratorService;
export const dateTimeService = isWails() ? WailsDateTimeService : HTTPDateTimeService;
export const jWTService = isWails() ? WailsJWTService : HTTPJWTService;

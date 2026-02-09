// Auto-generated Wails client for DateTimeService
// This file is auto-generated. DO NOT EDIT.

import { DateTimeService } from '../../../bindings/devtoolbox/service';

export function Convert(req: any): Promise<any> {
  return DateTimeService.Convert(req);
}

export function GetPresets(): Promise<any> {
  return DateTimeService.GetPresets();
}

export function CalculateDelta(req: any): Promise<any> {
  return DateTimeService.CalculateDelta(req);
}

export function GetAvailableTimezones(): Promise<any> {
  return DateTimeService.GetAvailableTimezones();
}

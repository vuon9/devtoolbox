// Auto-generated Wails client for DateTimeService
// This file is auto-generated. DO NOT EDIT.

import { DateTimeService } from '../../../bindings/devtoolbox/service';


export function ServiceStartup(ctx: context.Context, options: application.ServiceOptions): Promise<error> {
  return DateTimeService.ServiceStartup(ctx, options);
}

export function Convert(req: datetimeconverter.ConvertRequest): Promise<datetimeconverter.ConvertResponse> {
  return DateTimeService.Convert(req);
}

export function GetPresets(): Promise<datetimeconverter.PresetsResponse> {
  return DateTimeService.GetPresets();
}

export function CalculateDelta(req: datetimeconverter.DeltaRequest): Promise<datetimeconverter.DeltaResponse> {
  return DateTimeService.CalculateDelta(req);
}

export function GetAvailableTimezones(): Promise<datetimeconverter.AvailableTimezonesResponse> {
  return DateTimeService.GetAvailableTimezones();
}


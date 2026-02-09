// Auto-generated Wails client for JWTService
// This file is auto-generated. DO NOT EDIT.

import { JWTService } from '../../../bindings/devtoolbox/service';


export function ServiceStartup(ctx: context.Context, options: application.ServiceOptions): Promise<error> {
  return JWTService.ServiceStartup(ctx, options);
}

export function Decode(token: string): Promise<jwt.DecodeResponse> {
  return JWTService.Decode(token);
}

export function Verify(token: string, secret: string, encoding: string): Promise<jwt.VerifyResponse> {
  return JWTService.Verify(token, secret, encoding);
}

export function Encode(headerJSON: string, payloadJSON: string, algorithm: string, secret: string): Promise<jwt.EncodeResponse> {
  return JWTService.Encode(headerJSON, payloadJSON, algorithm, secret);
}


// Auto-generated Wails client for JWTService
// This file is auto-generated. DO NOT EDIT.

import { JWTService } from '../../../bindings/devtoolbox/service';

export function Decode(token: string): Promise<any> {
  return JWTService.Decode(token);
}

export function Verify(token: string, secret: string, encoding: string): Promise<any> {
  return JWTService.Verify(token, secret, encoding);
}

export function Encode(headerJSON: string, payloadJSON: string, algorithm: string, secret: string): Promise<any> {
  return JWTService.Encode(headerJSON, payloadJSON, algorithm, secret);
}

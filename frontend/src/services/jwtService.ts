import * as httpService from '../generated/http/jWTService';
import { createAdapter } from './transport';

const _a = createAdapter('JWTService', httpService);
export const Decode = _a.Decode;
export const Verify = _a.Verify;
export const Encode = _a.Encode;

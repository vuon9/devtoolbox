import * as httpService from '../../../generated/http/encoderService';
import { createAdapter } from '../../../services/transport';

export const encoderAPI = createAdapter('EncoderService', httpService);

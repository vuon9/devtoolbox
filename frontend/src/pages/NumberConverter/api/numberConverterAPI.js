import * as httpService from '../../../generated/http/numberConverterService';
import { createAdapter } from '../../../services/transport';

export const numberConverterAPI = createAdapter('NumberConverterService', httpService);

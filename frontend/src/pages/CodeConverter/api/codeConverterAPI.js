import * as httpService from '../../../generated/http/codeConverterService';
import { createAdapter } from '../../../services/transport';

export const codeConverterAPI = createAdapter('CodeConverterService', httpService);

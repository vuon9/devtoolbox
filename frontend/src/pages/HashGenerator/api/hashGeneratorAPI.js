import * as httpService from '../../../generated/http/hashGeneratorService';
import { createAdapter } from '../../../services/transport';

export const hashGeneratorAPI = createAdapter('HashGeneratorService', httpService);

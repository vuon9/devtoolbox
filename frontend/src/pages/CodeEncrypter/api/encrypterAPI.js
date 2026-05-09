import * as httpService from '../../../generated/http/encrypterService';
import { createAdapter } from '../../../services/transport';

export const encrypterAPI = createAdapter('EncrypterService', httpService);

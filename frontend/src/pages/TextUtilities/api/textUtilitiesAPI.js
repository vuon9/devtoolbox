import * as httpService from '../../../generated/http/textUtilitiesService';
import { createAdapter } from '../../../services/transport';

export const textUtilitiesAPI = createAdapter('TextUtilitiesService', httpService);

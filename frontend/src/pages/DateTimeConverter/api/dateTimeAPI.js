import * as httpService from '../../../generated/http/dateTimeService';
import { createAdapter } from '../../../services/transport';

export const dateTimeAPI = createAdapter('DateTimeService', httpService);

if (typeof window !== 'undefined') {
  window.debugDateTimeAPI = dateTimeAPI;
}

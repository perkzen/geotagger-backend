import { ThrottlerOptions } from '@nestjs/throttler';
import {
  GLOBAL_RATE_LIMIT,
  LONG_RATE_LIMIT,
  MEDIUM_RATE_LIMIT,
  SHORT_RATE_LIMIT,
} from '@app/modules/rate-limit/constants/rate-limit.constants';

export const getRateLimitOptions = (): ThrottlerOptions[] => [
  SHORT_RATE_LIMIT,
  MEDIUM_RATE_LIMIT,
  LONG_RATE_LIMIT,
  GLOBAL_RATE_LIMIT,
];

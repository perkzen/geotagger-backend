import { ThrottlerOptions, minutes, seconds } from '@nestjs/throttler';
import { RateLimitName } from '@app/modules/rate-limit/enums/rate-limit-name.enum';

/**
 * 30 requests per 30 seconds
 */
export const SHORT_RATE_LIMIT: ThrottlerOptions = {
  name: RateLimitName.SHORT,
  ttl: seconds(30),
  limit: 30,
};

/**
 * 60 requests per minute
 */
export const LONG_RATE_LIMIT: ThrottlerOptions = {
  name: RateLimitName.LONG,
  ttl: minutes(1),
  limit: 60,
};

/**
 *  100 requests per minute
 */
export const GLOBAL_RATE_LIMIT: ThrottlerOptions = {
  name: RateLimitName.GLOBAL,
  ttl: minutes(1),
  limit: 100,
};

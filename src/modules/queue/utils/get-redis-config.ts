import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'bullmq';

export const getRedisConfig = (configService: ConfigService): RedisOptions => {
  return {
    url: configService.get('REDIS_URL'),
  };
};

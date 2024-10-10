import { ConfigService } from '@nestjs/config';
import { RedisOptions } from 'bullmq';

export const getRedisConfig = (configService: ConfigService): RedisOptions => {
  return {
    host: configService.get('REDIS_HOST'),
    port: configService.get('REDIS_PORT'),
  };
};

import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { isTestEnv } from '@app/common/utils/env-check';
import { getRateLimitOptions } from '@app/modules/rate-limit/utils/get-rate-limit-options';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      throttlers: isTestEnv() ? [] : getRateLimitOptions(),
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class RateLimitModule {}

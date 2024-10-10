import { ExpressAdapter } from '@bull-board/express';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BullBoardSetup } from '@app/config/setups/bull-board.setup';
import { getRedisConfig } from '@app/modules/queue/utils/get-redis-config';

@Module({
  imports: [
    BullBoardModule.forRoot({
      route: BullBoardSetup.BULL_BOARD_PATH,
      adapter: ExpressAdapter,
    }),
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const redisConfig = getRedisConfig(configService);

        return {
          connection: redisConfig,
        };
      },
    }),
  ],
})
export class QueueModule {}

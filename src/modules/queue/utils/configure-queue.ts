import { BullAdapter } from '@bull-board/api/bullAdapter';
import { BullBoardModule } from '@bull-board/nestjs';
import { BullModule } from '@nestjs/bullmq';
import { DynamicModule } from '@nestjs/common';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';

export const configureQueue = (queues: QueueName[]): DynamicModule[] => {
  return [
    BullModule.registerQueue(...queues.map((queue) => ({ name: queue }))),
    BullBoardModule.forFeature(
      ...queues.map((queue) => ({
        name: queue,
        adapter: BullAdapter,
      })),
    ),
  ];
};

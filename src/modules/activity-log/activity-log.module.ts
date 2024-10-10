import { Module } from '@nestjs/common';
import { ActivityLogConsumer } from '@app/modules/activity-log/consumers/activity-log.consumer';
import { ActivityLogRepository } from '@app/modules/activity-log/repositories/activity-log.repository';
import { MediaModule } from '@app/modules/media/media.module';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { configureQueue } from '@app/modules/queue/utils/configure-queue';
import { ActivityLogController } from './controllers/activity-log.controller';
import { ActivityLogService } from './services/activity-log.service';

@Module({
  imports: [MediaModule, ...configureQueue([QueueName.ACTIVITY_LOG])],
  controllers: [ActivityLogController],
  providers: [ActivityLogService, ActivityLogRepository, ActivityLogConsumer],
})
export class ActivityLogModule {}

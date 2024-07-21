import { Module } from '@nestjs/common';
import { ActivityLogRepository } from '@app/modules/activity-log/repositories/activity-log.repository';
import { MediaModule } from '@app/modules/media/media.module';
import { ActivityLogController } from './controllers/activity-log.controller';
import { ActivityLogService } from './services/activity-log.service';

@Module({
  imports: [MediaModule],
  controllers: [ActivityLogController],
  providers: [ActivityLogService, ActivityLogRepository],
})
export class ActivityLogModule {}

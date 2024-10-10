import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ProcessActivityLogPayload } from '@app/modules/activity-log/interfaces/process-activity-log-payload.interface';
import { ActivityLogService } from '@app/modules/activity-log/services/activity-log.service';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';

@Processor(QueueName.ACTIVITY_LOG)
export class ActivityLogConsumer extends WorkerHost {
  private readonly logger = new Logger(ActivityLogConsumer.name);

  constructor(private readonly activityLogService: ActivityLogService) {
    super();
  }

  async process(job: Job<ProcessActivityLogPayload>): Promise<void> {
    try {
      const { userId, activity } = job.data;
      await this.activityLogService.create(userId, activity);
      this.logger.log(`Activity log was processed`);
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Activity log processing failed: ${error.message}`);
      throw error;
    }
  }
}

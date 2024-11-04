import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ProcessMediaPayload } from '@app/modules/media/interfaces/process-media-payload.interface';
import { MediaService } from '@app/modules/media/services/media.service';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';

@Processor(QueueName.MEDIA)
export class MediaConsumer extends WorkerHost {
  private readonly logger = new Logger(MediaConsumer.name);

  constructor(private readonly mediaService: MediaService) {
    super();
  }

  async process(job: Job<ProcessMediaPayload>): Promise<void> {
    try {
      const { key, bucket } = job.data;
      await this.mediaService.processUpload({ key, bucket });
      this.logger.log(`Media processing completed for key: ${key} in bucket: ${bucket}`);
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Media processing failed: ${error.message}`);
      throw error;
    }
  }
}

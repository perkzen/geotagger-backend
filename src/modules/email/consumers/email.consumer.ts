import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { ProcessEmailPayload } from '@app/modules/email/interfaces/process-email-payload.interface';
import { EmailService } from '@app/modules/email/services/email.service';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';

@Processor(QueueName.EMAIL)
export class EmailConsumer extends WorkerHost {
  private readonly logger = new Logger(EmailConsumer.name);

  constructor(private readonly emailService: EmailService) {
    super();
  }

  async process(job: Job<ProcessEmailPayload>): Promise<void> {
    try {
      const { recipient, subject, template, data } = job.data;
      await this.emailService.sendEmail(recipient, subject, template, data);
      this.logger.log(`Email for ${recipient} was processed`);
    } catch (e) {
      const error = e as Error;
      this.logger.error(`Email processing failed: ${error.message}`);
      throw error;
    }
  }
}

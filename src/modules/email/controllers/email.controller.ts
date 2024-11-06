import { InjectQueue } from '@nestjs/bullmq';
import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Queue } from 'bullmq';
import { SendEmailDto } from '@app/modules/email/dtos/send-email.dto';
import { EmailTemplate } from '@app/modules/email/enums/email-template.enum';
import { ProcessEmailPayload } from '@app/modules/email/interfaces/process-email-payload.interface';
import { JobName } from '@app/modules/queue/enums/job-name.enum';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';

@ApiBearerAuth()
@ApiCookieAuth()
@ApiTags('Test Email')
@Controller('email')
export class EmailController {
  constructor(@InjectQueue(QueueName.EMAIL) private readonly emailQueue: Queue<ProcessEmailPayload>) {}

  @Post('send')
  @ApiOperation({ summary: 'Send email' })
  @ApiCreatedResponse({ description: 'Email sent' })
  async sendEmail(@Body() { email }: SendEmailDto) {
    await this.emailQueue.add(JobName.PROCESS_EMAIL, {
      recipient: email,
      subject: 'Test',
      template: EmailTemplate.HELLO_WORLD,
      data: { name: 'Joe Doe' },
    });
  }
}

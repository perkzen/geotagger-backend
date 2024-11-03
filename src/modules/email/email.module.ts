import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isDevEnv } from '@app/common/utils/env-check';
import { EmailConsumer } from '@app/modules/email/consumers/email.consumer';
import { EmailController } from '@app/modules/email/controllers/email.controller';
import { EMAIL_CLIENT } from '@app/modules/email/utils/email.constants';
import { ResendEmailClient } from '@app/modules/email/utils/resend-email-client';
import { QueueName } from '@app/modules/queue/enums/queue-name.enum';
import { configureQueue } from '@app/modules/queue/utils/configure-queue';
import { EmailService } from './services/email.service';

@Module({
  imports: isDevEnv() ? configureQueue([QueueName.EMAIL]) : [],
  controllers: isDevEnv() ? [EmailController] : [],
  providers: [
    EmailService,
    EmailConsumer,
    {
      inject: [ConfigService],
      provide: EMAIL_CLIENT,
      useFactory: async (configService: ConfigService) => new ResendEmailClient(configService),
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}

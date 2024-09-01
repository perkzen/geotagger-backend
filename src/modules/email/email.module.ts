import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isDevEnv } from '@app/common/utils/env-check';
import { EmailController } from '@app/modules/email/controllers/email.controller';
import { EMAIL_CLIENT_TOKEN } from '@app/modules/email/utils/email.constants';
import { ResendEmailClient } from '@app/modules/email/utils/resend-email-client';
import { EmailService } from './services/email.service';

@Module({
  controllers: isDevEnv() ? [EmailController] : [],
  providers: [
    EmailService,
    {
      inject: [ConfigService],
      provide: EMAIL_CLIENT_TOKEN,
      useFactory: async (configService: ConfigService) => new ResendEmailClient(configService),
    },
  ],
  exports: [EmailService],
})
export class EmailModule {}

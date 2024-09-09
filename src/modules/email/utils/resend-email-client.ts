import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { EmailClient, SendEmailOptions } from '@app/modules/email/interfaces/email-client.interface';

export class ResendEmailClient implements EmailClient {
  private readonly emailClient: Resend;
  private readonly fromEmail: string;

  constructor(private readonly configService: ConfigService) {
    this.emailClient = new Resend(this.configService.getOrThrow('RESEND_API_KEY'));
    this.fromEmail = this.configService.getOrThrow('RESEND_FROM_EMAIL');
  }

  async sendEmail(options: SendEmailOptions): Promise<void> {
    await this.emailClient.emails.send({ ...options, from: this.fromEmail });
  }
}

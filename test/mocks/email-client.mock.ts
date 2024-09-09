import { EmailClient, SendEmailOptions } from '@app/modules/email/interfaces/email-client.interface';

export class EmailClientMock implements EmailClient {
  sendEmail(_options: SendEmailOptions): Promise<void> {
    return Promise.resolve();
  }
}

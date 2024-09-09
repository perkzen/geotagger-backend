export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface EmailClient {
  sendEmail(options: SendEmailOptions): Promise<void>;
}

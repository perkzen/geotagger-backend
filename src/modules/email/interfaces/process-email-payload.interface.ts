import { EmailTemplate, TemplateData } from '@app/modules/email/enums/email-template.enum';

export interface ProcessEmailPayload {
  recipient: string;
  subject: string;
  template: EmailTemplate;
  data: TemplateData<EmailTemplate>;
}

import * as fs from 'node:fs';
import { join } from 'node:path';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Handlebars from 'handlebars';
import mjml2html from 'mjml';
import { EmailTemplate } from '@app/modules/email/enums/email-template.enum';
import { EmailClient } from '@app/modules/email/interfaces/email-client.interface';
import { InjectEmailClient } from '@app/modules/email/utils/inject-email-client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @InjectEmailClient()
    private readonly emailClient: EmailClient,
  ) {}

  async sendEmail(recipient: string, subject: string, template: EmailTemplate, data: Record<string, unknown>) {
    const html = this._compileTemplate(template, data);

    await this.emailClient.sendEmail({
      to: recipient,
      subject,
      html,
    });
  }

  private _compileTemplate(template: EmailTemplate, data: Record<string, unknown>) {
    const templatePath = this._getTemplatePath(template);

    const mjmlTemplate = fs.readFileSync(templatePath, 'utf8');
    const htmlTemplate = mjml2html(mjmlTemplate);

    return this._replaceTokens(htmlTemplate, data);
  }

  private _replaceTokens(template: ReturnType<typeof mjml2html>, data: Record<string, unknown>) {
    const compiledTemplate = Handlebars.compile(template.html);

    return compiledTemplate(data);
  }

  private _getTemplatePath(template: EmailTemplate) {
    return join(__dirname, '..', 'templates', `${template}.mjml`);
  }
}

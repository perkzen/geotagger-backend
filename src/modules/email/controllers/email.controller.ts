import { Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EmailTemplate } from '@app/modules/email/enums/email-template.enum';
import { EmailService } from '@app/modules/email/services/email.service';

@ApiTags('Test Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiBearerAuth()
  async sendEmail() {
    return await this.emailService.sendEmail('perko.domen@gmail.com', 'test', EmailTemplate.HELLO_WORLD, {
      name: 'domen',
    });
  }
}

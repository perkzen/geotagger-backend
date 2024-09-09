import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCreatedResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SendEmailDto } from '@app/modules/email/dtos/send-email.dto';
import { EmailTemplate } from '@app/modules/email/enums/email-template.enum';
import { EmailService } from '@app/modules/email/services/email.service';

@ApiTags('Test Email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send email' })
  @ApiCreatedResponse({ description: 'Email sent' })
  async sendEmail(@Body() { email }: SendEmailDto) {
    return await this.emailService.sendEmail(email, 'Test', EmailTemplate.HELLO_WORLD, {
      name: 'Joe Doe',
    });
  }
}

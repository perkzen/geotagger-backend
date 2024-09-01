import { Inject } from '@nestjs/common';
import { EMAIL_CLIENT_TOKEN } from '@app/modules/email/utils/email.constants';

export function InjectEmailClient(): PropertyDecorator & ParameterDecorator {
  return Inject(EMAIL_CLIENT_TOKEN);
}

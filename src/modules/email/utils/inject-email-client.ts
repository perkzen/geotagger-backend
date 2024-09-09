import { Inject } from '@nestjs/common';
import { EMAIL_CLIENT } from '@app/modules/email/utils/email.constants';

export function InjectEmailClient(): PropertyDecorator & ParameterDecorator {
  return Inject(EMAIL_CLIENT);
}

import { UnauthorizedException } from '@nestjs/common';
import { AuthErrorCode } from '@app/modules/auth/enums/auth-error-code.enum';

export class IncorrectPasswordException extends UnauthorizedException {
  constructor() {
    super('Incorrect password');
  }

  getResponse(): object {
    const response = super.getResponse() as object;

    return {
      ...response,
      code: AuthErrorCode.INCORRECT_PASSWORD,
    };
  }
}

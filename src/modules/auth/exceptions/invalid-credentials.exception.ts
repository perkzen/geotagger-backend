import { UnauthorizedException } from '@nestjs/common';
import { AuthErrorCode } from '@app/modules/auth/enums/auth-error-code.enum';

export class InvalidCredentialsException extends UnauthorizedException {
  constructor() {
    super('Invalid credentials');
  }

  getResponse(): object {
    const response = super.getResponse() as object;

    return {
      ...response,
      code: AuthErrorCode.INVALID_CREDENTIALS,
    };
  }
}

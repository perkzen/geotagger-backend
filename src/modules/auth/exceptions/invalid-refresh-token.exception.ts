import { UnauthorizedException } from '@nestjs/common';
import { AuthErrorCode } from '@app/modules/auth/enums/auth-error-code.enum';

export class InvalidRefreshTokenException extends UnauthorizedException {
  constructor() {
    super('Invalid refresh token');
  }

  getResponse(): object {
    const response = super.getResponse() as object;

    return {
      ...response,
      code: AuthErrorCode.INVALID_REFRESH_TOKEN,
    };
  }
}

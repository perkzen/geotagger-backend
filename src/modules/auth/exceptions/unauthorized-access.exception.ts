import { UnauthorizedException } from '@nestjs/common';
import { AuthErrorCode } from '@app/modules/auth/enums/auth-error-code.enum';

export class UnauthorizedAccessException extends UnauthorizedException {
  constructor() {
    super("You don't have permission to access this resource!");
  }

  getResponse(): object {
    const response = super.getResponse() as object;

    return {
      ...response,
      code: AuthErrorCode.UNAUTHORIZED_ACCESS,
    };
  }
}

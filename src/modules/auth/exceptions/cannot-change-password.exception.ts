import { BadRequestException } from '@nestjs/common';
import { AuthErrorCode } from '@app/modules/auth/enums/auth-error-code.enum';

export class CannotChangePasswordException extends BadRequestException {
  constructor() {
    super('Cannot change password');
  }

  getResponse(): object {
    const response = super.getResponse() as object;
    return {
      ...response,
      code: AuthErrorCode.CANNOT_CHANGE_PASSWORD,
    };
  }
}

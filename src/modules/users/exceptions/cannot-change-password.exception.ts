import { BadRequestException } from '@nestjs/common';
import { UserErrorCode } from '@app/modules/users/enum/user-error-code.enum';

export class CannotChangePasswordException extends BadRequestException {
  constructor() {
    super('Cannot change password');
  }

  getResponse(): object {
    const response = super.getResponse() as object;
    return {
      ...response,
      code: UserErrorCode.CANNOT_CHANGE_PASSWORD,
    };
  }
}

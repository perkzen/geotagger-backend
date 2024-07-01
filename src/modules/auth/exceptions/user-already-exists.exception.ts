import { ConflictException } from '@nestjs/common';
import { AuthErrorCode } from '@app/modules/auth/enums/auth-error-code.enum';

export class UserAlreadyExistsException extends ConflictException {
  constructor() {
    super('User with this email already exists.');
  }

  getResponse(): object {
    const response = super.getResponse() as object;
    return {
      ...response,
      code: AuthErrorCode.USER_ALREADY_EXISTS,
    };
  }
}

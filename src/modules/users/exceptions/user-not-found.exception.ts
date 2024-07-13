import { NotFoundException } from '@nestjs/common';

export class UserNotFoundException extends NotFoundException {
  constructor(arg: 'id' | 'email' = 'id') {
    super(`Cannot find user with the given ${arg}`);
  }

  getResponse(): object {
    const response = super.getResponse() as object;
    return {
      ...response,
      code: 'USER_NOT_FOUND',
    };
  }
}

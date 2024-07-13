import { BadRequestException } from '@nestjs/common';

export class CannotCreateUserException extends BadRequestException {
  constructor() {
    super('Cannot create user');
  }

  getResponse(): object {
    const response = super.getResponse() as object;
    return {
      ...response,
      code: 'CANNOT_CREATE_USER',
    };
  }
}

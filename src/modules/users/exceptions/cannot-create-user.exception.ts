import { BadRequestException } from '@nestjs/common';

export class CannotCreateUserException extends BadRequestException {
  constructor() {
    super('Cannot create user');
  }
}
